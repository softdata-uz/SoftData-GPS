import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {Marker, Tooltip} from 'react-leaflet';
import L from 'leaflet';

import {vehicleMarkerIcon} from './vehicleMeta';
import {HEADING_MIN_M, JITTER_M, TELEPORT_M, bearing, distance, isValidPoint} from './geo';
import {escapeHtml} from './html';

const SIZE = 46;
const lerp = (a, b, t) => a + (b - a) * t;

/** Eng qisqa burilish: 350° → 10° bo'lsa -340° emas, +20°. */
const shortestTurn = (from, to) => ((to - from + 540) % 360) - 180;

/**
 * Xaritadagi bitta transport (SoftData-AirPort-GPS `VehicleMarker` asosida).
 *
 * Backend har so'rovda bitta nuqta beradi, oradagi yo'l interpolyatsiya qilinadi:
 *   • ~2.5 m dan kichik siljish — GPS titrashi, e'tiborsiz qoldiriladi;
 *   • yo'nalish haqiqiy siljishdan hisoblanadi — burilishlar yo'lga mos tushadi;
 *   • 400 m dan katta sakrash (aloqa uzilishi) animatsiyasiz ko'chiriladi.
 *
 * Burilish har kadrda to'g'ridan-to'g'ri DOM'ga yoziladi: divIcon'ni qayta
 * yaratish qimmat, `transform` esa arzon.
 */
const TrainMarker = ({car, selected, onSelect, onMove, pollInterval = 3000, showPlate = false}) => {
    const {
        angle = 0,
        coordinate = [0, 0],
        active = false,
        display_name,
        description,
        type,
        device_id,
        date_time,
    } = car || {};

    const plate = description || display_name;

    const [position, setPosition] = useState([+coordinate[0], +coordinate[1]]);

    const markerRef = useRef(null);
    const prevTimeRef = useRef(date_time);
    const rotationRef = useRef(+angle || 0);
    const positionRef = useRef(position);
    const hasMovedRef = useRef(false);
    const frameRef = useRef(null);
    const hoveredRef = useRef(false);

    const iconUrl = vehicleMarkerIcon(type, active);

    const icon = useMemo(
        () => {
            const startRotation = Math.round(rotationRef.current) || 0;
            return L.divIcon({
                className: 'vehicle-marker',
                // faqat transport rasmi: harakat yo'nalishiga qarab buriladi, atrofida hech narsa yo'q
                html: `
                    <span class="vehicle-marker__body" style="transform:rotate(${startRotation}deg)">
                        <img class="vehicle-marker__img" src="${escapeHtml(iconUrl)}" alt="" draggable="false"/>
                    </span>
                    ${showPlate && plate ? `<span class="vehicle-marker__plate">${escapeHtml(plate)}</span>` : ''}
                `,
                iconSize: [SIZE, SIZE],
                iconAnchor: [SIZE / 2, SIZE / 2],
            });
        },
        [iconUrl, showPlate, plate]
    );

    const paint = () => {
        const body = markerRef.current?.getElement()?.querySelector('.vehicle-marker__body');
        if (!body) return;
        const scale = hoveredRef.current || selected ? 1.15 : 1;
        body.style.transform = `rotate(${rotationRef.current}deg) scale(${scale})`;
    };

    useEffect(() => {
        positionRef.current = position;
        // belgi xaritada siljigandan keyin xabar beriladi — iz chizig'i undan oldinga o'tmaydi
        onMove?.(device_id, position);
        paint();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, selected, icon]);

    useEffect(() => {
        const end = [+coordinate?.[0], +coordinate?.[1]];
        if (!isValidPoint(end)) return undefined;

        const start = positionRef.current;
        const moved = distance(start, end);

        /* GPS titrashi — nishon joyida qolsin */
        if (moved < JITTER_M) {
            prevTimeRef.current = date_time;
            return undefined;
        }

        /* Aloqa uzilgandan keyingi sakrash — animatsiyasiz ko'chiriladi */
        if (moved > TELEPORT_M) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            prevTimeRef.current = date_time;
            setPosition(end);
            positionRef.current = end;
            paint();
            return undefined;
        }

        const startRotation = rotationRef.current;
        const targetHeading = moved >= HEADING_MIN_M
            ? bearing(start, end)
            : (hasMovedRef.current ? startRotation : +angle || 0);
        if (moved >= HEADING_MIN_M) hasMovedRef.current = true;
        const endRotation = startRotation + shortestTurn(startRotation, targetHeading);

        /* Polling har `pollInterval` da — undan uzun animatsiya orqada qoladi */
        const elapsed = date_time ? new Date(date_time) - new Date(prevTimeRef.current) : pollInterval;
        const duration = Math.min(Math.max(elapsed || pollInterval, 300), pollInterval);
        prevTimeRef.current = date_time;

        let startTime;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            const current = [lerp(start[0], end[0], progress), lerp(start[1], end[1], progress)];
            setPosition(current);
            // burilish siljishdan biroz oldin tugaydi — muyulishlar tabiiy ko'rinadi
            rotationRef.current = lerp(startRotation, endRotation, Math.min(progress * 1.6, 1));
            paint();

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            } else {
                setPosition(end);
                rotationRef.current = endRotation;
                paint();
            }
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coordinate?.[0], coordinate?.[1], angle, date_time]);

    return (
        <Marker
            ref={markerRef}
            position={position}
            icon={icon}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{
                click: () => onSelect(device_id),
                mouseover: () => {
                    hoveredRef.current = true;
                    paint();
                },
                mouseout: () => {
                    hoveredRef.current = false;
                    paint();
                },
            }}
        >
            <Tooltip
                key={selected ? 'pinned' : 'hover'}
                permanent={selected}
                direction="top"
                offset={[0, -SIZE / 2]}
                className="gps-tooltip"
                opacity={1}
            >
                <span className="gps-tooltip__row">
                    <span className={`gps-tooltip__dot${active ? ' is-active' : ''}`}/>
                    {display_name}
                </span>
            </Tooltip>
        </Marker>
    );
};

export default memo(TrainMarker);
