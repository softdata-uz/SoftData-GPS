import React from 'react';

/**
 * Ikonkalar — bitta uslub: 24x24, faqat chiziq (stroke), currentColor.
 * Figma "Green" faylida ikonka kutubxonasi alohida chop etilmagan
 * (docs/design-system.md — "Not in the design system"), shuning uchun
 * ular shu yerda bir joyda saqlanadi.
 */
const Svg = ({size = 20, children, ...rest}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
    >
        {children}
    </svg>
);

export const MapIcon = (p) => (
    <Svg {...p}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </Svg>
);

export const ChartIcon = (p) => (
    <Svg {...p}>
        <path d="M3 21h18"/>
        <rect x="5" y="11" width="4" height="7" rx="1"/>
        <rect x="14" y="6" width="4" height="12" rx="1"/>
    </Svg>
);

export const DeviceIcon = (p) => (
    <Svg {...p}>
        <rect x="2.5" y="6" width="19" height="12" rx="2"/>
        <path d="M6.5 12h.01M10 12h5"/>
    </Svg>
);

export const UsersIcon = (p) => (
    <Svg {...p}>
        <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/>
        <circle cx="9" cy="7.5" r="3.5"/>
        <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75"/>
    </Svg>
);

export const LogoutIcon = (p) => (
    <Svg {...p}>
        <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/>
        <path d="M16 17l5-5-5-5M21 12H9"/>
    </Svg>
);

export const MenuIcon = (p) => (
    <Svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Svg>
);

export const CloseIcon = (p) => (
    <Svg {...p}><path d="M18 6 6 18M6 6l12 12"/></Svg>
);

export const SunIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </Svg>
);

export const MoonIcon = (p) => (
    <Svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Svg>
);

export const ChevronDownIcon = (p) => (
    <Svg {...p}><path d="m6 9 6 6 6-6"/></Svg>
);

export const ChevronLeftIcon = (p) => (
    <Svg {...p}><path d="m15 18-6-6 6-6"/></Svg>
);

export const ChevronRightIcon = (p) => (
    <Svg {...p}><path d="m9 18 6-6-6-6"/></Svg>
);

export const SearchIcon = (p) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7"/>
        <path d="m20 20-3.5-3.5"/>
    </Svg>
);

export const PlusIcon = (p) => (
    <Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>
);

export const MinusIcon = (p) => (
    <Svg {...p}><path d="M5 12h14"/></Svg>
);

export const PlayIcon = (p) => (
    <Svg {...p}><path d="M7 4.8v14.4l12-7.2z"/></Svg>
);

export const PauseIcon = (p) => (
    <Svg {...p}><path d="M9 5v14M15 5v14"/></Svg>
);

export const ExpandIcon = (p) => (
    <Svg {...p}>
        <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/>
        <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9"/>
        <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/>
        <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>
    </Svg>
);

/** Navigatsiya strelkasi — kuzatuv/navigator rejimi uchun */
export const NavigationIcon = (p) => (
    <Svg {...p}><path d="M3 11 22 2l-9 19-2-8-8-2z"/></Svg>
);

export const PlaneIcon = (p) => (
    <Svg {...p}>
        <path d="M10.5 3.5a1.5 1.5 0 0 1 3 0V9l7.5 4.2v2.1L13.5 13v4.3l2.5 1.7v1.6L12 19.6 8 20.6V19l2.5-1.7V13L3 15.3v-2.1L10.5 9z"/>
    </Svg>
);

export const CalendarIcon = (p) => (
    <Svg {...p}>
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
    </Svg>
);

export const GlobeIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18"/>
        <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/>
    </Svg>
);

export const EditIcon = (p) => (
    <Svg {...p}>
        <path d="M14.5 5.5l4 4"/>
        <path d="M16.88 3.12a2.83 2.83 0 0 1 4 4L8.5 19.5 3 21l1.5-5.5L16.88 3.12z"/>
    </Svg>
);

export const TrashIcon = (p) => (
    <Svg {...p}>
        <path d="M9 3h6M3 6h18m-2 0-.7 10.52c-.1 1.58-.16 2.37-.5 2.97a3 3 0 0 1-1.3 1.21c-.62.3-1.41.3-2.99.3h-3.02c-1.58 0-2.37 0-2.99-.3a3 3 0 0 1-1.3-1.21c-.34-.6-.4-1.39-.5-2.97L5 6m5 4.5v5m4-5v5"/>
    </Svg>
);

export const UserIcon = (p) => (
    <Svg {...p}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </Svg>
);

export const ClockIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
    </Svg>
);

export const AlertIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v5M12 16h.01"/>
    </Svg>
);

export const CheckIcon = (p) => (
    <Svg {...p}><path d="m5 13 4 4L19 7"/></Svg>
);

export const RefreshIcon = (p) => (
    <Svg {...p}>
        <path d="M20 11a8 8 0 0 0-13.7-5.7L3 8"/>
        <path d="M4 13a8 8 0 0 0 13.7 5.7L21 16"/>
        <path d="M3 4v4h4M21 20v-4h-4"/>
    </Svg>
);

export const InboxIcon = (p) => (
    <Svg {...p}>
        <path d="M3 13h5l1.5 3h5L16 13h5"/>
        <path d="M5.5 5h13l2.5 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4l2.5-8z"/>
    </Svg>
);

export const LayersIcon = (p) => (
    <Svg {...p}>
        <path d="m12 3 9 5-9 5-9-5 9-5z"/>
        <path d="m3 13 9 5 9-5"/>
    </Svg>
);

export const EyeIcon = (p) => (
    <Svg {...p}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
    </Svg>
);

export const EyeOffIcon = (p) => (
    <Svg {...p}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
        <path d="m1 1 22 22"/>
    </Svg>
);

export const InfoIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 16v-5M12 8h.01"/>
    </Svg>
);

export const DotsIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="19" r="1"/>
    </Svg>
);

export const TargetIcon = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
    </Svg>
);
