/**
 * Leaflet `divIcon` faqat HTML **matnini** qabul qiladi — React u yerda
 * qiymatlarni ekranlamaydi. Backenddan yoki OSM'dan kelgan matn to'g'ridan-
 * to'g'ri qo'yilsa (masalan davlat raqami `<img src=x onerror=…>` bo'lsa),
 * u kod sifatida ishga tushadi.
 *
 * Shuning uchun `divIcon` ichiga tushadigan har bir qiymat shu yerdan o'tadi.
 */
export const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default escapeHtml;
