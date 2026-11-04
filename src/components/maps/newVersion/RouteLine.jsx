import React, {useMemo} from 'react';
import {Marker, Polyline} from 'react-leaflet';
import L from 'leaflet';

import {bearing, distance, isValidPoint} from './geo';
import {escapeHtml} from './html';

/* Yo'nalish chizig'i: ikki qatlam — ostida to'q "kontur", ustida rangli chiziq.
   Shu tufayli chiziq sun'iy yo'ldosh tasvirida ham, oq xaritada ham ko'rinadi.
   Chiziq bo'ylab harakat yo'nalishini ko'rsatuvchi kichik strelkalar qo'yiladi. */

const ARROW_MIN_GAP_M = 45; // strelkalar orasidagi eng kichik masofa
const ARROW_MAX = 24;       // bitta yo'nalishdagi eng ko'p strelka

const arrowIcon = (deg, color) =>
    L.divIcon({
        className: 'route-arrow',
        html: `<span class="route-arrow__glyph" style="transform:rotate(${Number(deg) || 0}deg);color:${escapeHtml(color)}">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>
                 </svg>
               </span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });

/** Chiziq bo'ylab teng oraliqda strelka nuqtalarini tanlaydi.
    Oraliq yo'l uzunligiga moslashadi: qisqa yo'lda ham kamida bitta strelka
    chiqadi, uzunida esa ular ARROW_MAX tadan oshmaydi. */
const arrowPoints = (points) => {
    const segments = [];
    let total = 0;

    for (let i = 1; i < points.length; i += 1) {
        const length = distance(points[i - 1], points[i]);
        if (!length) continue;
        segments.push({from: points[i - 1], to: points[i], length});
        total += length;
    }
    if (!segments.length) return [];

    const gap = Math.max(ARROW_MIN_GAP_M, total / ARROW_MAX);
    const out = [];
    let carried = 0;

    for (const segment of segments) {
        carried += segment.length;
        if (carried < gap) continue;
        carried = 0;

        out.push({
            position: [
                (segment.from[0] + segment.to[0]) / 2,
                (segment.from[1] + segment.to[1]) / 2,
            ],
            angle: bearing(segment.from, segment.to),
        });
        if (out.length >= ARROW_MAX) break;
    }

    /* Yo'l gap'dan qisqa bo'lsa — o'rtasiga bitta strelka */
    if (!out.length) {
        const mid = segments[Math.floor(segments.length / 2)];
        out.push({
            position: [(mid.from[0] + mid.to[0]) / 2, (mid.from[1] + mid.to[1]) / 2],
            angle: bearing(mid.from, mid.to),
        });
    }
    return out;
};

/**
 * @param positions [[lat, lng], …]
 * @param color     chiziq rangi (tokenlardan)
 * @param casing    kontur va strelka rangi — mavzuga/sun'iy yo'ldoshga qarab
 * @param weight    chiziq qalinligi
 * @param arrows    yo'nalish strelkalari ko'rsatilsinmi
 */
const RouteLine = ({positions, color, casing, weight = 4, arrows = true, eventHandlers}) => {
    const points = useMemo(() => (positions || []).filter(isValidPoint), [positions]);
    const marks = useMemo(() => (arrows ? arrowPoints(points) : []), [points, arrows]);

    if (points.length < 2) return null;

    return (
        <>
            {/* kontur — tasvir ustida ham ajralib tursin */}
            <Polyline
                positions={points}
                pathOptions={{
                    color: casing,
                    weight: weight + 4,
                    opacity: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round',
                }}
                interactive={false}
            />
            <Polyline
                positions={points}
                pathOptions={{color, weight, opacity: 0.95, lineCap: 'round', lineJoin: 'round'}}
                eventHandlers={eventHandlers}
            />

            {marks.map((mark) => (
                <Marker
                    key={`${mark.position[0]},${mark.position[1]}`}
                    position={mark.position}
                    icon={arrowIcon(mark.angle, casing)}
                    interactive={false}
                    keyboard={false}
                />
            ))}
        </>
    );
};

/* --------------------------------------------------------------------- iz */

const TRAIL_CHUNKS = 6;

/**
 * Transportning yurgan izi: bo'laklarga bo'linib chiziladi — eskisi so'niq,
 * yangisi to'yingan; rangi shu bo'lakdagi o'rtacha tezlikka qarab tanlanadi.
 *
 * @param points  [{p: [lat, lng], s: speed}] — eng eskisidan yangisiga
 * @param palette {slow, normal, fast} — tezlik ranglari
 */
export const TrailLine = ({points, palette, casing, weight = 3, arrows = false}) => {
    const chunks = useMemo(() => {
        const clean = (points || []).filter((item) => isValidPoint(item?.p));
        if (clean.length < 2) return [];

        const size = Math.max(2, Math.ceil(clean.length / TRAIL_CHUNKS));
        const out = [];

        for (let start = 0; start < clean.length - 1; start += size - 1) {
            const slice = clean.slice(start, start + size);
            if (slice.length < 2) break;

            const speeds = slice.map((item) => item.s || 0);
            const average = speeds.reduce((a, b) => a + b, 0) / speeds.length;
            const share = (start + slice.length) / clean.length; // boshidan oxirigacha

            out.push({
                positions: slice.map((item) => item.p),
                color: average < 5 ? palette.slow : average < 30 ? palette.normal : palette.fast,
                opacity: 0.2 + share * 0.7,
            });
        }
        return out;
    }, [points, palette]);

    if (!chunks.length) return null;

    const head = chunks[chunks.length - 1];

    return (
        <>
            {chunks.map((chunk, index) => (
                <Polyline
                    key={`${index}-${chunk.positions.length}`}
                    positions={chunk.positions}
                    pathOptions={{
                        color: chunk.color,
                        weight,
                        opacity: chunk.opacity,
                        lineCap: 'round',
                        lineJoin: 'round',
                    }}
                    interactive={false}
                />
            ))}

            {arrows && head && (
                <RouteLine
                    positions={head.positions}
                    color={head.color}
                    casing={casing}
                    weight={weight}
                    arrows
                />
            )}
        </>
    );
};

export default RouteLine;
