import React from 'react';

/**
 * Ikki-uch qiymatli taqsimot: nom, son va ulushni ko'rsatuvchi chiziq.
 * Donut ostida "harakatda / harakatda emas" kabi juftliklar uchun.
 *
 * @param rows [{label, value, tone}]
 */
const StatusSplit = ({rows = []}) => {
    const total = rows.reduce((sum, row) => sum + (row.value || 0), 0);

    return (
        <div className="st-split">
            {rows.map((row) => {
                const share = total ? Math.round((row.value / total) * 100) : 0;

                return (
                    <div key={row.label} className="st-split__row">
                        <div className="st-split__top">
                            <span className="st-split__label">{row.label}</span>
                            <span className="st-split__value">
                                {row.value}
                                <span>{share}%</span>
                            </span>
                        </div>

                        <span className="st-split__track">
                            <span className={`is-${row.tone || 'brand'}`} style={{width: `${share}%`}}/>
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StatusSplit;
