import {vehicleSvgUrl} from './vehicleIcons';

// icon (active / inactive) and translation key for every vehicle type.
// Rasmlar — vehicleIcons.js dagi SVG (old tomoni tepaga qaragan).
const entry = (type, label) => ({
    active: vehicleSvgUrl(type, true),
    inactive: vehicleSvgUrl(type, false),
    label,
});

export const VEHICLE_TYPES = {
    train: entry('train', 'Teplavoz'),
    car: entry('car', 'Yengil avtomobil'),
    bus: entry('bus', 'Avtobus'),
    truck: entry('truck', "Og'ir avtomobil"),
    ibp: entry('ibp', 'IBP'),
    ladder: entry('ladder', 'Trap'),
    tractor: entry('tractor', 'Tractor'),
    reloaded: entry('reloaded', 'Autolift'),
    lenta: entry('lenta', 'lenta'),
    tz: entry('tz', 'tz'),
    firetruck: entry('firetruck', 'firetruck'),
    specialcar: entry('specialcar', 'specialcar'),
};

export const vehicleIcon = (type, active) => {
    const meta = VEHICLE_TYPES[type] || VEHICLE_TYPES.car;
    return active ? meta.active : meta.inactive;
};

/** Xarita belgisi uchun (soya rasm ichida, retina uchun katta o'lcham). */
export const vehicleMarkerIcon = (type, active) =>
    vehicleSvgUrl(VEHICLE_TYPES[type] ? type : 'car', active, true);

export const vehicleLabelKey = (type) => VEHICLE_TYPES[type]?.label || '';

export const GSM_LABELS = ["Tarmoq yo'q", 'Juda zaif', 'Zaif', "O'rtacha", 'Yaxshi', "A'lo"];

/** "hozir", "5 daq oldin", "2 soat oldin", or a date */
export const relativeTime = (value, t, now = Date.now()) => {
    if (!value) return '—';
    const ts = new Date(value).getTime();
    if (Number.isNaN(ts)) return '—';
    const diff = Math.max(0, Math.round((now - ts) / 1000));
    if (diff < 60) return t('hozirgina');
    if (diff < 3600) return t('{{n}} daq oldin', {n: Math.floor(diff / 60)});
    if (diff < 86400) return t('{{n}} soat oldin', {n: Math.floor(diff / 3600)});
    const d = new Date(ts);
    const pad = (x) => String(x).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    const pad = (x) => String(x).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const isValidCoord = (c) =>
    Array.isArray(c) && c.length >= 2 && Number.isFinite(+c[0]) && Number.isFinite(+c[1]) && !(+c[0] === 0 && +c[1] === 0);

/** shortest signed rotation from a to b (degrees) */
export const angleDelta = (a, b) => ((((b - a) % 360) + 540) % 360) - 180;
