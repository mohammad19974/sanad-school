// حساب المسافة بين نقطتين على الأرض بصيغة Haversine
// النتيجة بالأمتار

const EARTH_RADIUS_METERS = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

export const haversineMeters = (
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

/** يصيغ مسافة بالأمتار إلى نص عربي: "٢٠٠م" أو "١.٢كم" */
export const formatDistance = (meters?: number): string => {
  if (meters == null) return '—';
  if (meters < 1000) return `${Math.round(meters)}م`;
  return `${(meters / 1000).toFixed(1)}كم`;
};
