import tokens from '../../../styles/tokens';

/**
 * Leaflet plitka qatlamlari — SoftData-AirPort-GPS `features/map/mapStyles.js` asosida.
 *
 * Namunada kalitsiz zaxira CARTO edi, lekin CARTO endi kalitsiz so'rovlarga
 * "API KEY REQUIRED" rasmini qaytaradi, OSM serverlari esa ilovalarni bloklaydi.
 * Shuning uchun:
 *   • REACT_APP_MAPTILER_KEY berilsa — MapTiler (namunadagi `topo-v2`, rastr ko'rinishi);
 *   • kalitsiz — Esri "Light Gray Canvas" (asos + yozuvlar qatlami). Esri bu qatlamni
 *     16-masshtabgacha beradi, undan yaqinda Leaflet oxirgi plitkani kattalashtiradi.
 * Sun'iy yo'ldosh — Esri World Imagery.
 *
 * `attribution` — litsenziya talabi, shuning uchun qoladi.
 */
const p = tokens.primitives;
const ESRI = 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors';
const ESRI_IMAGERY = 'Esri, Maxar, Earthstar Geographics';
const MAPTILER = '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> '
    + '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const esri = (service) => `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/{z}/{y}/{x}`;

const MAPTILER_KEY = process.env.REACT_APP_MAPTILER_KEY;
const MAPTILER_STYLES = {light: process.env.REACT_APP_MAPTILER_STYLE || 'topo-v2', dark: 'dataviz-dark'};

export const MAX_ZOOM = 21;

/* Har rejim — bir yoki bir nechta qatlam (asos + yozuvlar) */
const ESRI_LAYERS = {
    light: [
        {url: esri('Canvas/World_Light_Gray_Base'), attribution: ESRI, maxNativeZoom: 16},
        {url: esri('Canvas/World_Light_Gray_Reference'), attribution: '', maxNativeZoom: 16, overlay: true},
    ],
    dark: [
        {url: esri('Canvas/World_Dark_Gray_Base'), attribution: ESRI, maxNativeZoom: 16},
        {url: esri('Canvas/World_Dark_Gray_Reference'), attribution: '', maxNativeZoom: 16, overlay: true},
    ],
    satellite: [
        {url: esri('World_Imagery'), attribution: ESRI_IMAGERY, maxNativeZoom: 17},
    ],
};

const maptiler = (theme) => [{
    url: `https://api.maptiler.com/maps/${MAPTILER_STYLES[theme === 'dark' ? 'dark' : 'light']}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: MAPTILER,
    maxNativeZoom: 20,
}];

/** Joriy mavzu va rejimga mos plitka qatlamlari (massiv). */
export const tileLayers = (theme, {satellite = false} = {}) => {
    if (satellite) return ESRI_LAYERS.satellite;
    if (MAPTILER_KEY) return maptiler(theme);
    return theme === 'dark' ? ESRI_LAYERS.dark : ESRI_LAYERS.light;
};

/** Trek va marshrut chiziqlari uchun ranglar. */
export const routeColors = {
    live: p['green-500'],
    trail: p['green-400'],
    history: p['error-500'],
};

/** Iz rangi tezlikka qarab: turgan → sekin → tez. */
export const trailPalette = {
    slow: p['gray-light-400'],
    normal: p['green-400'],
    fast: p['green-600'],
};

/**
 * Chiziq konturi va strelka rangi — fon bilan qarama-qarshi bo'lishi kerak.
 * Sun'iy yo'ldosh tasviri to'q, shuning uchun u yerda doim och rang.
 */
export const casingColor = (theme, {satellite = false} = {}) => {
    if (satellite) return p['base-white'];
    return theme === 'dark'
        ? tokens.colors.dark['bg-primary']
        : tokens.colors.light['bg-primary-solid'];
};

export const DEFAULT_CENTER = [41.2906041, 69.2898571];
export const DEFAULT_ZOOM = 12;
/* Avtomatik yaqinlashish chegarasi: kalitsiz Esri plitkalari 16 dan keyin
   kattalashtiriladi va choklari ko'rinib qoladi — shuning uchun 16. */
export const FOLLOW_ZOOM = MAPTILER_KEY ? 17 : 16;
