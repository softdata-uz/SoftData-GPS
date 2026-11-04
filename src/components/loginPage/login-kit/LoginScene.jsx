import React from 'react';
import GpsMap from './GpsMap';

/* ============================================================================
   Chap panel: kuzatuv sahnasi — to'r, yashil nurlanish, soxta xarita (ustida
   yo'nalish bo'ylab harakatlanuvchi nuqta) va uning ostidagi matn.

   Qiymatlar qo'lda tanlangan — har renderda bir xil turadi.
   ========================================================================== */

/* Xarita ustidagi HUD kartochkalari: {top, left, right, label, value, live}.
   Matnlar `hud` prop'i orqali almashtiriladi — kit tilga bog'liq emas. */
const DEFAULT_HUD = [
    {top: '4%', left: '6%', label: 'Faol texnika', value: '128', live: true},
    {top: '32%', right: '4%', label: 'TZ-114', value: '42 km/soat'},
    {bottom: '8%', left: '10%', label: 'GPS aniqlik', value: '3.4 m'},
];

/**
 * @param title     katta sarlavha
 * @param subtitle  sarlavha ostidagi matn
 * @param features  [{icon, title, text}] — ikonka ixtiyoriy (React tugun)
 * @param hud       xarita ustidagi kartochkalar; berilmasa standart qiymatlar
 */
const LoginScene = ({title, subtitle, features = [], hud}) => (
    <aside className="lg-aside" aria-hidden="true">
        <div className="lg-aside__grid"/>
        <div className="lg-aside__glow"/>

        <div className="lg-scene">
            <GpsMap/>

            {(hud?.length ? hud : DEFAULT_HUD).map((h) => (
                <div
                    key={h.label}
                    className="lg-hud"
                    style={{top: h.top, left: h.left, right: h.right, bottom: h.bottom}}
                >
                    <span className="lg-hud__label">
                        {h.live ? <span className="lg-hud__live"/> : null}
                        {h.label}
                    </span>
                    <span className="lg-hud__value">{h.value}</span>
                </div>
            ))}
        </div>

        <div className="lg-aside__content">
            {title ? <h2 className="lg-aside__title">{title}</h2> : null}
            {subtitle ? <p className="lg-aside__subtitle">{subtitle}</p> : null}

            {features.length ? (
                <ul className="lg-features">
                    {features.map((f, i) => (
                        <li className="lg-feature" key={f.title || i}>
                            {f.icon ? <span className="lg-feature__icon">{f.icon}</span> : null}
                            <span className="lg-feature__body">
                                <span className="lg-feature__title">{f.title}</span>
                                <span className="lg-feature__text">{f.text}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    </aside>
);

export default LoginScene;
