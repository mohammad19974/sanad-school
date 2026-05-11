// مجموعة أيقونات SVG مخصّصة — منقولة من الـ mock
// كل أيقونة inline SVG بدون مكتبة خارجية لتقليل الحجم

import type { FC } from 'react';

export type IconName =
  | 'sos' | 'map' | 'calm' | 'phone' | 'user' | 'shield'
  | 'mic' | 'ambulance' | 'fire' | 'police' | 'family'
  | 'brain' | 'bell' | 'location' | 'check' | 'chevL'
  | 'home' | 'snake' | 'edit' | 'save' | 'sound' | 'memory';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: FC<Props> = ({ name, size = 24, color = 'currentColor' }) => {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24' };

  switch (name) {
    case 'sos':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="0.5" fill={color} />
        </svg>
      );
    case 'map':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case 'calm':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 10 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props} fill={color} stroke="none">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
        </svg>
      );
    case 'mic':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      );
    case 'ambulance':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <rect x="1" y="9" width="22" height="10" rx="1" />
          <path d="M16 9V5a1 1 0 0 0-1-1h-5L7 9" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case 'fire':
      return (
        <svg {...props} fill={color} stroke="none">
          <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66-1.49-1.46-1.82-3.87-.87-5.72-.95.23-1.78.75-2.49 1.32C8.87 6.4 7.85 10.07 9.07 13.22c.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12-.06-.05-.1-.1-.14-.17C6.87 12.33 6.69 10.28 7.45 8.64 5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26z" />
        </svg>
      );
    case 'police':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M12 2L8 4v4l4 2 4-2V4z" />
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <line x1="8" y1="14" x2="16" y2="14" />
          <line x1="12" y1="12" x2="12" y2="16" />
        </svg>
      );
    case 'family':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <circle cx="8" cy="6" r="2.5" />
          <circle cx="16" cy="6" r="2.5" />
          <path d="M5 20v-4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v4" />
          <path d="M14 17v-2a3 3 0 0 1 3-3h1" />
        </svg>
      );
    case 'brain':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'location':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="9" strokeDasharray="2 4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'chevL':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case 'home':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'snake':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M3 6c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
          <path d="M3 15c0-1.1.9-2 2-2h8" />
          <path d="M13 13h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1" />
          <circle cx="7" cy="6" r="1" fill={color} />
        </svg>
      );
    case 'memory':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case 'save':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case 'sound':
      return (
        <svg {...props} fill="none" stroke={color} strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
  }
};
