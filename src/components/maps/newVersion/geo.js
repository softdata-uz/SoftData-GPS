/* Xarita geometriyasi uchun kichik yordamchilar.

   Backend har so'rovda transportning bitta nuqtasini qaytaradi
   (`coordinate`, `angle`, `speed`) — oradagi yo'l bo'lmaydi. Shuning uchun
   yo'nalish nuqtalar orasidagi haqiqiy siljishdan hisoblanadi, GPS "titrashi"
   esa filtrlanadi: aks holda nishon turgan joyida sakrab, bino ustiga chiqib
   qoladi. */

const R = 6371000; // Yer radiusi, metr
const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** Ikki nuqta orasidagi masofa, metrda (haversine). */
export const distance = ([lat1, lon1], [lat2, lon2]) => {
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

/** Birinchi nuqtadan ikkinchisiga yo'nalish, 0–360° (shimoldan soat yo'nalishi). */
export const bearing = ([lat1, lon1], [lat2, lon2]) => {
    const φ1 = rad(lat1);
    const φ2 = rad(lat2);
    const Δλ = rad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (deg(Math.atan2(y, x)) + 360) % 360;
};

/** GPS titrashi: shu masofadan kichik siljish harakat deb hisoblanmaydi. */
export const JITTER_M = 2.5;

/** Yo'nalishni qayta hisoblash uchun kerakli eng kichik siljish. */
export const HEADING_MIN_M = 4;

/** Bundan katta "sakrash" — aloqa uzilishi yoki xato nuqta: animatsiyasiz ko'chiriladi. */
export const TELEPORT_M = 400;

export const isValidPoint = (p) =>
    Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
    && (p[0] !== 0 || p[1] !== 0);
