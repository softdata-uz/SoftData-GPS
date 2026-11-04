import React, {useEffect, useRef, useState} from 'react';

/* Kichik ochiluvchi ro'yxat — har bir variant o'z ikonkasi bilan.
   Native <select> variantlarda ikonka ko'rsata olmaydi, shuning uchun
   tugma + ro'yxat ko'rinishida. */

/* Ikonkalar loyihaning yagona to'plami bilan bir xil geometriyada:
   24x24 viewBox, 1.8 stroke, yumaloq uchlar (src/ui/icons.jsx). */
const Chevron = (
    <svg className="lg-ctl__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const Check = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m20 6-11 11-5-5"/>
    </svg>
);

/**
 * @param value       tanlangan variant qiymati
 * @param options     [{value, label, icon}]
 * @param onChange    (value) => void
 * @param label       ekran o'quvchilar uchun nom
 * @param placeholder hech narsa tanlanmaganda ko'rinadigan matn
 * @param block       maydon kengligida (forma ichidagi ro'yxat uchun)
 * @param invalid     xato holati — chegara qizil
 * @param id          <label for> bilan bog'lash uchun
 */
const Select = ({
                    value,
                    options = [],
                    onChange,
                    label,
                    placeholder,
                    block = false,
                    invalid = false,
                    id,
                }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const current = options.find((o) => o.value === value)
        || (placeholder !== undefined ? {value: '', label: placeholder, placeholder: true} : options[0]);

    useEffect(() => {
        if (!open) return undefined;

        const onDocClick = (e) => {
            if (!rootRef.current?.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const pick = (next) => {
        setOpen(false);
        if (next !== value && typeof onChange === 'function') onChange(next);
    };

    return (
        <div className={`lg-ctl${block ? ' is-block' : ''}`} ref={rootRef}>
            <button
                type="button"
                id={id}
                className={`lg-ctl__trigger${invalid ? ' is-invalid' : ''}${current?.placeholder ? ' is-placeholder' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                title={label}
            >
                {current?.icon ? <span className="lg-ctl__icon">{current.icon}</span> : null}
                <span className="lg-ctl__label">{current?.label}</span>
                {Chevron}
            </button>

            {open ? (
                <ul className="lg-ctl__menu" role="listbox" aria-label={label}>
                    {options.map((o) => (
                        <li key={o.value}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={o.value === value}
                                className={`lg-ctl__option${o.value === value ? ' is-active' : ''}`}
                                onClick={() => pick(o.value)}
                            >
                                {o.icon ? <span className="lg-ctl__icon">{o.icon}</span> : null}
                                <span className="lg-ctl__label">{o.label}</span>
                                {o.value === value ? (
                                    <span className="lg-ctl__check">{Check}</span>
                                ) : null}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

export default Select;
