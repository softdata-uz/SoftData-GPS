/**
 * Transport rasmlari — yuqoridan ko'rinish (old tomoni tepaga), SVG.
 *
 * Holat transportning o'z rangi bilan ko'rsatiladi: faol — yashil, nofaol — qizil.
 * Rasm ustida qo'shimcha belgi yo'q.
 *
 * Har bir tur haqiqiy nisbatda chizilgan (avtobus va teplavoz uzun va tor, yengil avtomobil
 * qisqa) va o'ziga xos belgisi bor — shuning uchun mayda o'lchamda ham turi bir qarashda
 * bilinadi. Kuzov real metall kabi: yonlarda soya, markazda yorug'lik; shishada akslanish.
 * Yuqoridan g'ildiraklar ko'rinmaydi (faqat traktorning ochiq g'ildiraklari).
 *
 * Xaritada rasm harakat yo'nalishiga qarab buriladi, shuning uchun old tomon doim tepada.
 * Data-URL: <img src> va CSS'da bir xil ishlaydi.
 */

const PALETTE = {
    active: {edge: '#067647', mid: '#12B76A', hi: '#47CD89', roofHi: '#3CCB7F', roofLo: '#12B76A'},
    inactive: {edge: '#B42318', mid: '#F04438', hi: '#F97066', roofHi: '#F97066', roofLo: '#F04438'},
};

const TIRE = '#101828';
const EDGE = 'stroke="#101828" stroke-opacity=".38" stroke-width=".7"';
const PANEL = 'stroke="#101828" stroke-opacity=".28" stroke-width=".6" fill="none" stroke-linecap="round"';
const LAMP = '#FEF0C7';
const TAIL = '#F04438';
const AMBER = '#FDB022';
const STEEL = '#D0D5DD';

/* ---- umumiy bo'laklar ---- */
const body = (d) => `<path d="${d}" fill="url(#b)" ${EDGE}/>`;
const rbody = (x, y, w, h, rx) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#b)" ${EDGE}/>`;
const roof = (x, y, w, h, rx = 2) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#r)" stroke="#101828" stroke-opacity=".3" stroke-width=".5"/>`;
const glass = (d) => `<path d="${d}" fill="url(#g)" stroke="#101828" stroke-opacity=".6" stroke-width=".4"/>`;
const shine = (d) => `<path d="${d}" fill="#FFFFFF" fill-opacity=".14"/>`;
const panel = (d) => `<path d="${d}" ${PANEL}/>`;
const tire = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="${TIRE}"/>`;
const mirror = (x, y, rx = 1.7, ry = 1.2) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#b)" ${EDGE}/>`;
const lamp = (x, y, w = 2.8, h = 1.2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".6" fill="${LAMP}"/>`;
const tail = (x, y, w = 2.8, h = 1.2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".6" fill="${TAIL}"/>`;
const dark = (x, y, w, h, rx = 1, o = 0.85) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#101828" fill-opacity="${o}"/>`;
const rungs = (x, w, ys, h = 1.4) => ys.map((y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".7" fill="#F2F4F7" stroke="#101828" stroke-opacity=".3" stroke-width=".35"/>`).join('');

/* ---- turlar ---- */
const ICONS = {
    /* Yengil avtomobil: qisqa va keng, kapot/shisha/bagaj ketma-ketligi */
    car: () => [
        body('M19 7.6Q24 6 29 7.6Q31.6 8.8 31.6 13.5V35Q31.6 39.8 29 40.6Q24 42 19 40.6Q16.4 39.8 16.4 35V13.5Q16.4 8.8 19 7.6Z'),
        '<path d="M17.4 10L20.6 9V10.6L17.2 11.8Z" fill="#FEF0C7"/><path d="M30.6 10L27.4 9V10.6L30.8 11.8Z" fill="#FEF0C7"/>',
        panel('M19.2 15.6Q24 13.6 28.8 15.6'),
        glass('M18.6 19Q24 16.4 29.4 19L28.4 24.4H19.6Z'),
        shine('M20 20.2Q22.4 18.8 25 18.4L23.8 23.6H20.6Z'),
        roof(19.4, 24.8, 9.2, 6.4, 2),
        glass('M19.6 31.6H28.4L29.4 35Q24 36.8 18.6 35Z'),
        panel('M19 38Q24 39.4 29 38'),
        tail(17.4, 39.2, 3, 1.2), tail(27.6, 39.2, 3, 1.2),
        mirror(15.2, 20), mirror(32.8, 20),
    ].join(''),

    /* Avtobus: juda uzun va tor, tomida ikkita ventilyatsiya lyuki */
    bus: () => [
        rbody(16.8, 1, 14.4, 46, 3.4),
        glass('M18.4 3.8H29.6L29 8.6H19Z'),
        shine('M19.6 4.6H23L22 8H19.4Z'),
        panel('M17.6 9.8H30.4'),
        roof(18.2, 11, 11.6, 32, 1.6),
        '<rect x="20" y="14" width="8" height="5" rx="1.2" fill="#F2F4F7" stroke="#101828" stroke-opacity=".35" stroke-width=".5"/>',
        '<rect x="20" y="34" width="8" height="5" rx="1.2" fill="#F2F4F7" stroke="#101828" stroke-opacity=".35" stroke-width=".5"/>',
        panel('M18.6 24.6H29.4M18.6 29.4H29.4'),
        dark(19, 43.6, 10, 2.4, 1),
        lamp(18, 1.6, 2.6, 1), lamp(27.4, 1.6, 2.6, 1),
        tail(17.6, 46, 2.6, 0.9), tail(27.8, 46, 2.6, 0.9),
        '<rect x="14.2" y="4.2" width="2.2" height="4.2" rx="1" fill="url(#b)" stroke="#101828" stroke-opacity=".38" stroke-width=".6"/>',
        '<rect x="31.6" y="4.2" width="2.2" height="4.2" rx="1" fill="url(#b)" stroke="#101828" stroke-opacity=".38" stroke-width=".6"/>',
    ].join(''),

    /* Yuk mashinasi: alohida kabina va uzun yuk qutisi (qovurg'alar bilan) */
    truck: () => [
        rbody(17.5, 3, 13, 12.4, 3.6),
        glass('M19.4 6.6H28.6L27.8 10.6H20.2Z'),
        shine('M20.4 7.2H23.4L22.6 10.2H20.6Z'),
        lamp(18.4, 3.9, 2.6, 1), lamp(27, 3.9, 2.6, 1),
        mirror(15.8, 9), mirror(32.2, 9),
        dark(18.6, 15.2, 10.8, 1.6, 0.6, 0.55),
        `<rect x="16" y="16.8" width="16" height="28.2" rx="1.4" fill="url(#r)" ${EDGE}/>`,
        panel('M17.2 22H30.8M17.2 27H30.8M17.2 32H30.8M17.2 37H30.8'),
        '<rect x="16" y="16.8" width="16" height="1.6" rx=".8" fill="#FFFFFF" fill-opacity=".3"/>',
        tail(17.2, 43.6, 3, 1.1), tail(27.8, 43.6, 3, 1.1),
    ].join(''),

    /* Teplavoz: uzun, ikki kabina, tomida ikkita ventilyator va panjara */
    train: () => [
        body('M20.4 1Q24 0 27.6 1Q30 2 30 5V43Q30 46 27.6 47Q24 48 20.4 47Q18 46 18 43V5Q18 2 20.4 1Z'),
        glass('M19.8 5.2H28.2L27.4 9.4H20.6Z'),
        glass('M19.8 42.8H28.2L27.4 38.6H20.6Z'),
        '<rect x="18.6" y="11" width="1.4" height="26" rx=".7" fill="#FFFFFF" fill-opacity=".38"/><rect x="28" y="11" width="1.4" height="26" rx=".7" fill="#FFFFFF" fill-opacity=".38"/>',
        roof(20.4, 11, 7.2, 26, 1),
        '<circle cx="24" cy="16" r="2.7" fill="#EAECF0" stroke="#101828" stroke-opacity=".5" stroke-width=".6"/><circle cx="24" cy="16" r="1.2" fill="#667085"/>',
        '<circle cx="24" cy="32" r="2.7" fill="#EAECF0" stroke="#101828" stroke-opacity=".5" stroke-width=".6"/><circle cx="24" cy="32" r="1.2" fill="#667085"/>',
        panel('M21.6 21.4H26.4M21.6 24H26.4M21.6 26.6H26.4'),
        lamp(19.2, 1.4, 2.2, 0.9), lamp(26.6, 1.4, 2.2, 0.9),
        dark(22, 0, 4, 1.3, 0.6, 1), dark(22, 46.7, 4, 1.3, 0.6, 1),
    ].join(''),

    /* IBP: furgon, tomida quti va sariq mayoq */
    ibp: () => [
        body('M18.4 5.6Q24 4.2 29.6 5.6Q31.8 6.6 31.8 10.4V38Q31.8 42.6 29.4 43H18.6Q16.2 42.6 16.2 38V10.4Q16.2 6.6 18.4 5.6Z'),
        lamp(17.6, 6.4, 2.8, 1.1), lamp(27.6, 6.4, 2.8, 1.1),
        glass('M18.4 12.6Q24 10.4 29.6 12.6L28.6 17.4H19.4Z'),
        shine('M19.8 13.4Q22 12.4 24.4 12L23.4 16.6H20.2Z'),
        panel('M17.6 9.8Q24 8 30.4 9.8'),
        roof(18.2, 19, 11.6, 21, 1.6),
        panel('M19 25H29M19 31H29'),
        `<rect x="21.8" y="35" width="4.4" height="3" rx=".8" fill="${AMBER}" stroke="#B54708" stroke-width=".5"/>`,
        mirror(14.8, 15), mirror(33.2, 15),
        tail(17.4, 41.4, 2.6, 1), tail(28, 41.4, 2.6, 1),
    ].join(''),

    /* Narvonli mashina (trap): kabina + T shaklidagi maydoncha va narvon */
    ladder: () => [
        rbody(17.6, 2.4, 12.8, 11, 3.4),
        glass('M19.4 5.6H28.6L27.8 9.6H20.2Z'),
        shine('M20.4 6.2H23.4L22.6 9.2H20.6Z'),
        lamp(18.4, 3.2, 2.4, 1), lamp(27.2, 3.2, 2.4, 1),
        mirror(15.8, 8.4), mirror(32.2, 8.4),
        rbody(12.5, 15, 23, 5, 1.6),
        panel('M14 17.5H34'),
        `<rect x="17" y="20" width="2.6" height="26" rx="1" fill="url(#b)" ${EDGE}/>`,
        `<rect x="28.4" y="20" width="2.6" height="26" rx="1" fill="url(#b)" ${EDGE}/>`,
        rungs(19.6, 8.8, [23, 27, 31, 35, 39, 43], 1.5),
    ].join(''),

    /* Traktor: ochiq katta g'ildiraklar, kapot, shisha kabina */
    tractor: () => [
        tire(14, 6, 3, 5.6), tire(31, 6, 3, 5.6),
        tire(10.6, 26, 4.6, 12.4), tire(32.8, 26, 4.6, 12.4),
        body('M20 4Q24 2.6 28 4Q29.6 5 29.6 8.4V22H18.4V8.4Q18.4 5 20 4Z'),
        panel('M19.4 9.6H28.6M19.4 13.6H28.6'),
        '<circle cx="21.4" cy="8" r="1" fill="#101828" fill-opacity=".85"/>',
        lamp(19.4, 4.6, 2.2, 1), lamp(26.4, 4.6, 2.2, 1),
        rbody(17.4, 21.4, 13.2, 15.4, 3),
        roof(18.6, 22.6, 10.8, 13, 1.8),
        '<rect x="20" y="24" width="8" height="10.2" rx="1.2" fill="url(#g)" fill-opacity=".9"/>',
        '<rect x="20.8" y="25" width="2.2" height="7.6" rx="1" fill="#FFFFFF" fill-opacity=".16"/>',
        dark(21.4, 36.8, 5.2, 6, 1.2, 0.9),
    ].join(''),

    /* Yuk ko'taruvchi (autolift): old tomonda keng platforma, orqada kabina */
    reloaded: () => [
        '<rect x="15.6" y="15.4" width="2.4" height="10.4" rx="1" fill="#344054"/><rect x="30" y="15.4" width="2.4" height="10.4" rx="1" fill="#344054"/>',
        body('M18.2 23Q24 21.6 29.8 23Q32.4 24.2 32.4 28V41Q32.4 44.6 29.8 45H18.2Q15.6 44.6 15.6 41V28Q15.6 24.2 18.2 23Z'),
        glass('M17.4 25.4Q24 23.8 30.6 25.4L29.8 29H18.2Z'),
        shine('M18.8 26Q21.6 25 24.2 24.8L23.2 28.4H19.4Z'),
        roof(17.6, 29.6, 12.8, 9.6, 2),
        rbody(10.4, 2.4, 27.2, 13, 2.4),
        `<rect x="12.4" y="4.4" width="23.2" height="9" rx="1.2" fill="${STEEL}"/>`,
        panel('M13.4 7.4H34.6M13.4 10.4H34.6'),
        tail(17.2, 43.4, 2.6, 1), tail(28.2, 43.4, 2.6, 1),
    ].join(''),

    /* Tasmali yuklagich (lenta): uzun konveyer, yon ramkalar, orqada kabina */
    lenta: () => [
        `<rect x="16.2" y="1" width="2.6" height="32.4" rx="1.2" fill="url(#b)" ${EDGE}/>`,
        `<rect x="29.2" y="1" width="2.6" height="32.4" rx="1.2" fill="url(#b)" ${EDGE}/>`,
        '<rect x="18.8" y="1" width="10.4" height="32.4" rx="1.2" fill="#344054"/>',
        '<path d="M19 4.6h10M19 8.2h10M19 11.8h10M19 15.4h10M19 19h10M19 22.6h10M19 26.2h10M19 29.8h10" stroke="#98A2B3" stroke-opacity=".75" stroke-width=".7"/>',
        '<rect x="18.8" y="1" width="10.4" height="2.4" rx="1.2" fill="#101828" fill-opacity=".7"/>',
        body('M19 33.6Q24 32.8 29 33.6Q31.6 34.6 31.6 38V42.4Q31.6 45.8 29 46.4H19Q16.4 45.8 16.4 42.4V38Q16.4 34.6 19 33.6Z'),
        glass('M18.4 35.6H29.6L29 38.6H19Z'),
        roof(18.4, 39.4, 11.2, 4.6, 1.4),
        tail(17.8, 45, 2.4, 0.9), tail(27.8, 45, 2.4, 0.9),
    ].join(''),

    /* Shatakchi (tz): qisqa, old bamper, orqada ilgak */
    tz: () => [
        '<rect x="16" y="6" width="16" height="3.6" rx="1.8" fill="#344054" stroke="#101828" stroke-opacity=".5" stroke-width=".5"/>',
        body('M19 9.4Q24 8.2 29 9.4Q31.8 10.4 31.8 14.2V33Q31.8 37.8 29 38H19Q16.2 37.8 16.2 33V14.2Q16.2 10.4 19 9.4Z'),
        glass('M18.2 13.6Q24 11.2 29.8 13.6L29.2 18H18.8Z'),
        shine('M19.4 14.2Q21.8 13 24.4 12.6L23.4 17.4H19.8Z'),
        roof(18, 18.8, 12, 11.4, 2.2),
        mirror(14.8, 15.2), mirror(33.2, 15.2),
        `<rect x="21.2" y="38" width="5.6" height="6" rx="1.5" fill="${STEEL}" stroke="#101828" stroke-opacity=".5" stroke-width=".6"/>`,
        '<circle cx="24" cy="41" r="1.1" fill="#667085"/>',
        tail(17.6, 36.6, 2.4, 1), tail(28, 36.6, 2.4, 1),
    ].join(''),

    /* O't o'chirish mashinasi: kabina, mayoqcha, tomida narvon */
    firetruck: () => [
        body('M19.4 2.4Q24 1.4 28.6 2.4Q31.2 3.4 31.2 8V40Q31.2 45.6 28.4 46.2H19.6Q16.8 45.6 16.8 40V8Q16.8 3.4 19.4 2.4Z'),
        glass('M18.6 5.4H29.4L28.6 10.2H19.4Z'),
        shine('M19.8 6.2H23.2L22.2 9.8H19.6Z'),
        '<rect x="18.4" y="11.6" width="5.6" height="1.9" rx=".95" fill="#2E90FA"/><rect x="24" y="11.6" width="5.6" height="1.9" rx=".95" fill="#F04438" stroke="#FFFFFF" stroke-width=".4"/>',
        '<rect x="16.8" y="15.2" width="14.4" height="1.4" fill="#FFFFFF" fill-opacity=".85"/>',
        `<rect x="18.2" y="17.6" width="2.4" height="26.6" rx="1" fill="${STEEL}" stroke="#101828" stroke-opacity=".4" stroke-width=".5"/>`,
        `<rect x="27.4" y="17.6" width="2.4" height="26.6" rx="1" fill="${STEEL}" stroke="#101828" stroke-opacity=".4" stroke-width=".5"/>`,
        rungs(20.6, 6.8, [19.8, 23.4, 27, 30.6, 34.2, 37.8, 41.2], 1.4),
        lamp(18, 2.9, 2.4, 0.9), lamp(27.6, 2.9, 2.4, 0.9),
        mirror(14.8, 8.4), mirror(33.2, 8.4),
        tail(18, 45, 2.6, 0.9), tail(27.4, 45, 2.6, 0.9),
    ].join(''),

    /* Maxsus mashina: furgon, kabina tomida sariq mayoq paneli */
    specialcar: () => [
        body('M18.4 5.6Q24 4.2 29.6 5.6Q31.8 6.6 31.8 10.4V38Q31.8 42.6 29.4 43H18.6Q16.2 42.6 16.2 38V10.4Q16.2 6.6 18.4 5.6Z'),
        lamp(17.6, 6.4, 2.8, 1.1), lamp(27.6, 6.4, 2.8, 1.1),
        glass('M18.4 14.2Q24 12 29.6 14.2L28.6 19H19.4Z'),
        shine('M19.8 15Q22 14 24.4 13.6L23.4 18.2H20.2Z'),
        `<rect x="18.8" y="9.6" width="10.4" height="2.2" rx="1.1" fill="${AMBER}" stroke="#B54708" stroke-width=".5"/>`,
        roof(18.2, 20.6, 11.6, 19.8, 1.6),
        panel('M19 27H29M19 33H29'),
        mirror(14.8, 16.6), mirror(33.2, 16.6),
        tail(17.4, 41.4, 2.6, 1), tail(28, 41.4, 2.6, 1),
    ].join(''),
};

/** Gradientlar holat rangiga qarab: kuzov (yonlarda soya, markazda yorug'lik), tom, shisha. */
const defs = (p) => '<defs>'
    + `<linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.edge}"/><stop offset=".24" stop-color="${p.hi}"/><stop offset=".58" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.edge}"/></linearGradient>`
    + `<linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.roofHi}"/><stop offset="1" stop-color="${p.roofLo}"/></linearGradient>`
    + '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#344054"/><stop offset=".55" stop-color="#101828"/><stop offset="1" stop-color="#0B1220"/></linearGradient>'
    + '</defs>';

const cache = new Map();

/* Xarita belgisi uchun soya SVG ichida — CSS filter aylantirilgan elementni mobil qurilmada xiralashtiradi. */
const SHADOW = '<filter id="s" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">'
    + '<feDropShadow dx="0" dy="1" stdDeviation="1.1" flood-color="#0A0D12" flood-opacity=".35"/></filter>';

/**
 * Transport rasmi (data-URL). Noma'lum tur — yengil avtomobil.
 * `marker` — xarita uchun: SVG ichidagi soya va katta tabiiy o'lcham (retina ekranlarda ham tiniq).
 */
export const vehicleSvgUrl = (type, active, marker = false) => {
    const name = ICONS[type] ? type : 'car';
    const key = `${name}:${active ? 1 : 0}:${marker ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);

    const p = active ? PALETTE.active : PALETTE.inactive;
    const svg = marker
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 48 48">${defs(p)}<defs>${SHADOW}</defs><g filter="url(#s)">${ICONS[name]()}</g></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${defs(p)}${ICONS[name]()}</svg>`;

    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    cache.set(key, url);
    return url;
};

export const VEHICLE_ICON_TYPES = Object.keys(ICONS);
