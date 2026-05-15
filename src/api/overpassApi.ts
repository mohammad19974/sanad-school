// طبقة الوصول لـ OpenStreetMap Overpass API — يجلب أماكن حقيقيّة قرب موقع المستخدم
// مدارس / مستشفيات / صيدليات / مساجد / كنائس / شرطة / دفاع مدني
// مجاني تماماً، لا API key، بيانات مفتوحة المصدر

import { haversineMeters } from '../helpers/distance';
import type { Shelter, ShelterType } from '../types';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter', // mirror احتياطي
];

// خريطة amenity → نوع الملجأ في تطبيقنا
// التركيز على 5 فئات: مدارس + مستشفيات + شرطة + دفاع مدني + ملاجى
const AMENITY_TO_TYPE: Record<string, ShelterType> = {
  // مستشفيات
  hospital:    'medical',
  clinic:      'medical',
  doctors:     'medical',
  // مدارس
  school:      'school',
  college:     'school',
  university:  'school',
  kindergarten:'school',
  // شرطة + دفاع مدني
  police:       'police',
  fire_station: 'firestation',
};

interface OverpassTags {
  name?:      string;
  'name:ar'?: string;
  'name:he'?: string;
  'name:en'?: string;
  amenity?:   string;
  emergency?: string;
  religion?:  string;
  [key: string]: string | undefined;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id:   number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OverpassTags;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const buildQuery = (lat: number, lng: number, radiusM: number): string => {
  // amenity: 5 فئات أساسيّة (مدارس + مستشفيات + شرطة + دفاع مدني)
  const amenityFilter = 'amenity~"hospital|clinic|doctors|school|college|university|kindergarten|police|fire_station"';
  // ملاجى الطوارئ — emergency tag منفصل
  const emergencyFilter = 'emergency~"shelter|assembly_point|disaster_response"';
  return `[out:json][timeout:20];
    (
      node[${amenityFilter}](around:${radiusM},${lat},${lng});
      way [${amenityFilter}](around:${radiusM},${lat},${lng});
      node[${emergencyFilter}](around:${radiusM},${lat},${lng});
      way [${emergencyFilter}](around:${radiusM},${lat},${lng});
    );
    out center 50;`;
};

const pickName = (tags: OverpassTags): string => {
  return (
    tags['name:ar'] ||
    tags['name'] ||
    tags['name:he'] ||
    tags['name:en'] ||
    'موقع'
  );
};

const tagsToShelterType = (tags: OverpassTags): ShelterType | null => {
  // ملجأ طوارئ صريح (emergency=shelter / assembly_point)
  if (tags.emergency === 'shelter'
   || tags.emergency === 'assembly_point'
   || tags.emergency === 'disaster_response') {
    return 'shelter';
  }
  const amenity = tags.amenity;
  if (!amenity) return null;
  return AMENITY_TO_TYPE[amenity] ?? null;
};

const queryEndpoint = async (endpoint: string, body: string): Promise<OverpassResponse> => {
  const res = await fetch(endpoint, {
    method:  'POST',
    body:    'data=' + encodeURIComponent(body),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return (await res.json()) as OverpassResponse;
};

/** يجلب أماكن حقيقيّة قرب موقع المستخدم — يحاول أكثر من mirror */
export const fetchOsmShelters = async (
  lat: number, lng: number, radiusM = 1500, maxResults = 25,
): Promise<Shelter[]> => {
  const query = buildQuery(lat, lng, radiusM);

  let data: OverpassResponse | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      data = await queryEndpoint(endpoint, query);
      break;
    } catch (err) {
      console.warn('[overpass] فشل endpoint:', endpoint, err);
    }
  }
  if (!data) throw new Error('كل endpoints فشلت');

  const shelters: Shelter[] = data.elements
    .map((el) => {
      const lat2 = el.lat ?? el.center?.lat;
      const lng2 = el.lon ?? el.center?.lon;
      if (lat2 == null || lng2 == null) return null;
      const tags = el.tags ?? {};
      const type = tagsToShelterType(tags);
      if (!type) return null;
      return {
        id:       `osm_${el.type}_${el.id}`,
        name:     pickName(tags),
        type,
        lat:      lat2,
        lng:      lng2,
        capacity: 0,
        active:   true,
      } as Shelter;
    })
    .filter((s): s is Shelter => s !== null)
    .map((s) => ({ ...s, distanceMeters: haversineMeters(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

  // إزالة المكرّرات (بعض الأماكن لها node + way)
  const seen = new Set<string>();
  const dedup: Shelter[] = [];
  for (const s of shelters) {
    // dedup بالاسم + الموقع المقرّب (50م)
    const key = `${s.name}_${s.lat.toFixed(3)}_${s.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(s);
    if (dedup.length >= maxResults) break;
  }
  return dedup;
};

// ─── Cache بسيط (5 دقائق) عبر localStorage ─────────────────

interface CacheEntry { ts: number; shelters: Shelter[]; }

const CACHE_KEY = 'sanad.osm.shelters.v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_GRID = 1000; // كل 1km

const cacheKey = (lat: number, lng: number): string => {
  // نقرّب الموقع لخليّة 1km × 1km لتجميع طلبات قريبة
  const q = (x: number) => Math.round(x * 100) / 100; // ~1.1km على خطّ الاستواء
  return `${q(lat)}_${q(lng)}`;
};

const readCache = (): Record<string, CacheEntry> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeCache = (data: Record<string, CacheEntry>): void => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* quota */ }
};

export const fetchOsmSheltersCached = async (
  lat: number, lng: number, radiusM = 1500,
): Promise<Shelter[]> => {
  const key = cacheKey(lat, lng);
  const cache = readCache();
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.shelters.map((s) => ({
      ...s,
      distanceMeters: haversineMeters(lat, lng, s.lat, s.lng),
    })).sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }
  const fresh = await fetchOsmShelters(lat, lng, radiusM);
  // اكتب في الـ cache (احتفظ فقط بآخر 5 خلايا)
  const keys = Object.keys(cache);
  const trimmed: Record<string, CacheEntry> = { [key]: { ts: Date.now(), shelters: fresh } };
  keys.slice(0, 4).forEach((k) => { if (cache[k]) trimmed[k] = cache[k]; });
  writeCache(trimmed);
  return fresh;
};
