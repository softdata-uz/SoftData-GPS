import React, {useEffect, useRef, useState} from 'react';

/* ============================================================================
   GpsMap — chap paneldagi soxta kuzatuv xaritasi (640x640).

   Qatlamlari loginKit.css da animatsiyalanadi:
     __block      kvartallar (statik)
     __road       ko'chalar; __road-line — ularning o'rta chizig'i
     __runway     uchish-qo'nish yo'lagi va uning markiruvkasi
     __route      kuzatilayotgan yo'nalish (yorug' iz)
     __trail      yo'nalish ustidan yuguruvchi shtrix
     __unit       harakatlanuvchi nuqta — <animateMotion> yo'l bo'ylab olib yuradi
     __accuracy   nuqta atrofidagi "aniqlik" doirasi — pulslanadi
     __pin        statik nishonlar
     __sweep      radar nuri
   ========================================================================== */

/* Kvartallar: {x, y, w, h, o} */
const BLOCKS = [
    {x: 24, y: 30, w: 138, h: 92, o: 0.05}, {x: 178, y: 30, w: 104, h: 92, o: 0.07},
    {x: 300, y: 44, w: 78, h: 78, o: 0.05}, {x: 398, y: 30, w: 120, h: 92, o: 0.06},
    {x: 24, y: 150, w: 138, h: 118, o: 0.07}, {x: 178, y: 150, w: 104, h: 118, o: 0.04},
    {x: 300, y: 150, w: 78, h: 118, o: 0.06}, {x: 398, y: 150, w: 120, h: 76, o: 0.05},
    {x: 24, y: 296, w: 92, h: 106, o: 0.05}, {x: 136, y: 296, w: 146, h: 106, o: 0.07},
    {x: 300, y: 296, w: 78, h: 106, o: 0.04}, {x: 398, y: 296, w: 120, h: 106, o: 0.06},
    {x: 24, y: 430, w: 138, h: 82, o: 0.06}, {x: 178, y: 430, w: 104, h: 82, o: 0.05},
    {x: 300, y: 430, w: 78, h: 82, o: 0.07}, {x: 398, y: 430, w: 120, h: 82, o: 0.04},
    {x: 178, y: 540, w: 104, h: 76, o: 0.05}, {x: 300, y: 540, w: 78, h: 76, o: 0.06},
];

/* Ko'chalar to'ri */
const ROADS = [
    'M0 136 H640', 'M0 282 H640', 'M0 416 H640', 'M0 526 H640',
    'M170 0 V640', 'M290 0 V640', 'M386 0 V640', 'M528 0 V640',
];

/* Kuzatilayotgan yo'nalish — nuqta shu yo'l bo'ylab yuradi */
const ROUTE =
    'M76 596 V456 Q76 416 116 416 H250 Q290 416 290 376 V322 Q290 282 330 282 '
    + 'H488 Q528 282 528 242 V176 Q528 136 568 136 H628';

/* Ikkinchi transport — teskari yo'nalishda, sekinroq */
const ROUTE_ALT = 'M628 526 H210 Q170 526 170 486 V180 Q170 136 128 136 H12';

/* Statik nishonlar {x, y} */
const PINS = [{x: 290, y: 282}, {x: 528, y: 136}, {x: 170, y: 416}];

const PIN_PATH = 'M0 -22 a11 11 0 0 1 11 11 c0 8-11 22-11 22 s-11-14-11-22 a11 11 0 0 1 11-11 z';

/* Iz (comet) nuqta bilan bir tezlikda yurishi uchun yo'l uzunligi o'lchanadi:
   shtrix naqshining davri = yo'l uzunligi, offset bir siklda aynan shuncha suriladi. */
const useTrailDash = () => {
    const ref = useRef(null);
    const [len, setLen] = useState(0);

    useEffect(() => {
        if (ref.current && typeof ref.current.getTotalLength === 'function') {
            setLen(ref.current.getTotalLength());
        }
    }, []);

    const style = len
        ? {
            strokeDasharray: `${len * 0.12} ${len * 0.88}`,
            '--lg-dash-from': `${len * 0.12}px`,
            '--lg-dash-to': `${len * 0.12 - len}px`,
        }
        : {opacity: 0};

    return [ref, style];
};

const GpsMap = () => {
    const [routeRef, trailStyle] = useTrailDash();

    return (
    <svg viewBox="0 0 640 640" className="lg-gps" role="presentation" aria-hidden="true">
        <defs>
            <radialGradient id="lgGpsGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.20"/>
                <stop offset="55%" stopColor="#16a34a" stopOpacity="0.10"/>
                <stop offset="100%" stopColor="#052e16" stopOpacity="0"/>
            </radialGradient>

            {/* Radar nuri: bir tomoni yorqin, ikkinchisi so'nadi */}
            <linearGradient id="lgGpsSweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.34"/>
                <stop offset="100%" stopColor="#86efac" stopOpacity="0"/>
            </linearGradient>

            <clipPath id="lgGpsFrame">
                <rect x="0" y="0" width="640" height="640" rx="18"/>
            </clipPath>
        </defs>

        <g clipPath="url(#lgGpsFrame)">
            {/* kvartallar */}
            {BLOCKS.map((b, i) => (
                <rect
                    key={`bl${i}`}
                    x={b.x} y={b.y} width={b.w} height={b.h} rx="6"
                    className="lg-gps__block"
                    fillOpacity={b.o}
                    strokeOpacity={b.o + 0.05}
                />
            ))}

            {/* uchish-qo'nish yo'lagi */}
            <g transform="rotate(-32 470 560)">
                <rect x="330" y="544" width="300" height="32" rx="4" className="lg-gps__runway"/>
                <path d="M348 560 H612" className="lg-gps__runway-mark"/>
            </g>

            {/* ko'chalar */}
            {ROADS.map((d, i) => <path key={`rd${i}`} d={d} className="lg-gps__road"/>)}
            {ROADS.map((d, i) => <path key={`rl${i}`} d={d} className="lg-gps__road-line"/>)}

            <circle cx="320" cy="320" r="250" fill="url(#lgGpsGlow)" className="lg-gps__glow"/>

            {/* radar nuri */}
            <g className="lg-gps__sweep">
                <path d="M320 320 L640 320 A320 320 0 0 0 552 99 Z" fill="url(#lgGpsSweep)"/>
            </g>

            {/* nishonlar */}
            {PINS.map((p, i) => (
                <g key={`pn${i}`} transform={`translate(${p.x} ${p.y})`}>
                    <g className="lg-gps__pin-float" style={{animationDelay: `${i * 1.3}s`}}>
                        <path d={PIN_PATH} className="lg-gps__pin"/>
                        <circle cx="0" cy="-11" r="4" className="lg-gps__pin-core"/>
                    </g>
                </g>
            ))}

            {/* kuzatilayotgan yo'nalish */}
            <path ref={routeRef} d={ROUTE} className="lg-gps__route"/>
            <path d={ROUTE} className="lg-gps__trail" style={trailStyle}/>
            <path d={ROUTE_ALT} className="lg-gps__route lg-gps__route--alt"/>

            {/* harakatlanuvchi transport */}
            <g className="lg-gps__unit">
                <circle r="26" className="lg-gps__accuracy"/>
                <circle r="9" className="lg-gps__dot"/>
                {/* rotate="auto" element'ning +X o'qini harakat yo'nalishiga
                    buradi — shuning uchun uchburchak o'ngga qaratib chiziladi */}
                <path d="M5 0 L-4 -4.5 L-1.6 0 L-4 4.5 Z" className="lg-gps__heading"/>
                <animateMotion dur="18s" repeatCount="indefinite" rotate="auto" path={ROUTE}/>
            </g>

            <g className="lg-gps__unit lg-gps__unit--alt">
                <circle r="18" className="lg-gps__accuracy"/>
                <circle r="6" className="lg-gps__dot"/>
                <animateMotion dur="26s" repeatCount="indefinite" rotate="auto" path={ROUTE_ALT}/>
            </g>
        </g>

        {/* vizir burchaklari */}
        <g className="lg-gps__corners">
            <path d="M14 62 V26 a12 12 0 0 1 12 -12 H62"/>
            <path d="M578 14 H614 a12 12 0 0 1 12 12 V62"/>
            <path d="M626 578 V614 a12 12 0 0 1 -12 12 H578"/>
            <path d="M62 626 H26 a12 12 0 0 1 -12 -12 V578"/>
        </g>
    </svg>
    );
};

export default GpsMap;
