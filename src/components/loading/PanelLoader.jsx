import React from 'react';
import {useTranslation} from 'react-i18next';

import './loader.css';

/**
 * Panel ichidagi yuklanish: ro'yxat/jadval/xarita ustida markazda Loader.jsx dagi lavha.
 * Ota element `position: relative` bo'lishi kerak. `table` — jadval sarlavhasi ostini markazlaydi.
 */
const PanelLoader = ({show, table}) => {
    const {t} = useTranslation();
    if (!show) return null;

    return (
        <div className={`rdb-loader ${table ? 'rdb-loader--table' : ''}`} role="status" aria-live="polite"
             aria-label={t('Yuklanmoqda...')}>
            {/* umumiy Loader bilan bir xil lavha (o'lchami, halqalari) — faqat sahifani to'liq yopmaydi */}
            <div className="loader_box">
                <span className="loader_ring"/>
                <span className="loader_ring loader_ring--inner"/>
                <span className="loader_dot"/>
            </div>
        </div>
    );
};

export default PanelLoader;
