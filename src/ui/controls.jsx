import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {Drawer, Modal as AntModal} from 'antd';

import {Button, cx} from './ui';
import {AlertIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon} from './icons';
import './controls.css';

/*
 * Port of SoftData-AirPort-GPS `src/ui` — Select, FilterChip, Pagination,
 * Modal / ConfirmDialog and FormDrawer — with the same props and sizes,
 * styled with plain CSS over tokens.css (this project has no Tailwind).
 */

/* --------------------------------------------------------------- Select */

/**
 * Select — Figma: Components / Select. Nativ <select> emas: ro'yxat ham tokenlar bilan chiziladi.
 * options: [{value, label, icon, disabled}]
 * onChange: {target: {name, value}} — antd Form.Item ham, oddiy handler ham ishlaydi.
 */
export const Select = React.forwardRef(function Select(
    {
        options = [], placeholder, size = 'md', className, id, name, value, onChange,
        disabled, block = true, dropUp = false, prefix, 'aria-label': ariaLabel, ...rest
    },
    ref
) {
    const listboxId = `${useId()}listbox`;
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const items = useMemo(
        () => (placeholder !== undefined ? [{value: '', label: placeholder}, ...options] : options),
        [options, placeholder]
    );
    const selectedIndex = items.findIndex((o) => String(o.value) === String(value ?? ''));
    const selected = selectedIndex > -1 ? items[selectedIndex] : undefined;
    const isPlaceholder = value === '' || value == null;

    const close = useCallback(() => {
        setOpen(false);
        setActiveIndex(-1);
    }, []);

    const pick = (option) => {
        if (option.disabled) return;
        close();
        onChange?.({target: {name, value: option.value}, currentTarget: {name, value: option.value}});
    };

    useEffect(() => {
        if (!open) return undefined;
        const onDoc = (e) => !rootRef.current?.contains(e.target) && close();
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open, close]);

    const onKeyDown = (e) => {
        if (disabled) return;
        if (!open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
            setActiveIndex(selectedIndex > -1 ? selectedIndex : 0);
            return;
        }
        if (!open) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((prev) => (((prev > -1 ? prev : selectedIndex) + step) + items.length) % items.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (activeIndex > -1) pick(items[activeIndex]);
        }
    };

    return (
        <div ref={rootRef} className={cx('ui-select', block && 'is-block', dropUp && 'is-up', className)}>
            <button
                {...rest}
                ref={ref}
                type="button"
                id={id || name}
                disabled={disabled}
                onClick={() => (open ? close() : (setOpen(true), setActiveIndex(selectedIndex)))}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-label={ariaLabel}
                className={cx('ui-select__trigger', `ui-select__trigger--${size}`, isPlaceholder && 'is-placeholder')}
            >
                {prefix && <span className="ui-select__prefix">{prefix}</span>}
                {selected?.icon && <span className="ui-select__icon">{selected.icon}</span>}
                <span className="ui-select__value">{selected?.label ?? placeholder}</span>
                <span className={cx('ui-select__chevron', open && 'is-open')}><ChevronDownIcon size={20}/></span>
            </button>

            {open && !disabled && (
                <ul id={listboxId} role="listbox" aria-label={ariaLabel} className="ui-select__list">
                    {items.map((option, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <li key={`${option.value}`}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    disabled={option.disabled}
                                    onClick={() => pick(option)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={cx(
                                        'ui-select__option',
                                        index === activeIndex && 'is-active',
                                        isSelected && 'is-selected'
                                    )}
                                >
                                    {option.icon && <span className="ui-select__icon">{option.icon}</span>}
                                    <span className="ui-select__label">{option.label}</span>
                                    {isSelected && <span className="ui-select__check"><CheckIcon size={18}/></span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
});

/* --------------------------------------------------------------- FilterChip */

/** FilterChip — filtr tugmasi: ikonka, nom va soni. */
export const FilterChip = ({active, icon, label, count, onClick}) => (
    <button type="button" onClick={onClick} aria-pressed={active} className={cx('ui-chip', active && 'is-active')}>
        {icon}
        <span className="ui-chip__label">{label}</span>
        {count != null && <span className="ui-chip__count">{count}</span>}
    </button>
);

/* --------------------------------------------------------------- Pagination */

/** Ko'rinadigan sahifa raqamlari: 1 … 4 5 6 … 20 */
const pageWindow = (current, totalPages) => {
    if (totalPages <= 7) return Array.from({length: totalPages}, (_, i) => i + 1);
    const pages = [1];
    const from = Math.max(2, current - 1);
    const to = Math.min(totalPages - 1, current + 1);
    if (from > 2) pages.push('…');
    for (let page = from; page <= to; page += 1) pages.push(page);
    if (to < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
};

/**
 * Pagination — chapda "Jami: N (1–15)", o'ngda:  ‹ 1 2 3 ›  [15 sahifa ▾]
 * Faol sahifa to'liq brend rangida; sahifa hajmi ro'yxati yuqoriga ochiladi.
 */
export const Pagination = ({
                               page = 1, pageSize = 15, total = 0, pageSizeOptions = [15, 50, 100],
                               onChange, labels = {}, className,
                           }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
    const pages = pageWindow(page, totalPages);

    const go = (nextPage, nextSize = pageSize) => {
        const bounded = Math.min(Math.max(nextPage, 1), Math.max(1, Math.ceil((total || 0) / nextSize)));
        if (bounded === page && nextSize === pageSize) return;
        onChange?.(bounded, nextSize);
    };

    const from = total ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, total || 0);

    return (
        <div className={cx('ui-pagination', className)}>
            <div className="ui-pagination__info">
                <span>{labels.total || 'Jami'}: <b>{total || 0}</b></span>
                {total > 0 && <span className="ui-pagination__range">{from}–{to}</span>}
            </div>

            <div className="ui-pagination__controls">
                <nav className="ui-pagination__pages" aria-label={labels.page || 'sahifa'}>
                    <button type="button" className="ui-pagination__arrow" disabled={page <= 1}
                            onClick={() => go(page - 1)} aria-label={labels.prev || 'Oldingi'} title={labels.prev || 'Oldingi'}>
                        <ChevronLeftIcon size={16}/>
                    </button>
                    {pages.map((item, index) =>
                        item === '…' ? (
                            <span key={`gap-${index}`} className="ui-pagination__gap">…</span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => go(item)}
                                aria-current={item === page ? 'page' : undefined}
                                className={cx('ui-pagination__page', item === page && 'is-current')}
                            >
                                {item}
                            </button>
                        )
                    )}
                    <button type="button" className="ui-pagination__arrow" disabled={page >= totalPages}
                            onClick={() => go(page + 1)} aria-label={labels.next || 'Keyingi'} title={labels.next || 'Keyingi'}>
                        <ChevronRightIcon size={16}/>
                    </button>
                </nav>

                <Select
                    size="sm"
                    block={false}
                    dropUp
                    className="ui-pagination__size"
                    aria-label={labels.pageSize || 'Sahifa hajmi'}
                    value={String(pageSize)}
                    onChange={(e) => go(1, Number(e.target.value))}
                    options={pageSizeOptions.map((size) => ({value: String(size), label: `${size} ${labels.page || 'sahifa'}`}))}
                />
            </div>
        </div>
    );
};

/* --------------------------------------------------------------- Modal */

/** Modal — Figma: Application / Modals. */
export const Modal = ({open, onClose, title, description, icon, width = 560, footer, children}) => (
    <AntModal
        open={open}
        onCancel={onClose}
        width={width}
        footer={null}
        closable={false}
        destroyOnClose
        centered
        rootClassName="ui-modal"
    >
        <div className="ui-modal__head">
            {icon && <span className="ui-modal__icon">{icon}</span>}
            <div className="ui-modal__titles">
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            <Button variant="tertiary-gray" size="sm" iconOnly onClick={onClose}
                    iconLeading={<CloseIcon size={20}/>} aria-label="Close"/>
        </div>
        {children && <div className="ui-modal__body">{children}</div>}
        {footer && <div className="ui-modal__foot">{footer}</div>}
    </AntModal>
);

/** Tasdiqlash oynasi — Figma: Application / Modals (destructive). */
export const ConfirmDialog = ({
                                  open, onClose, onConfirm, loading = false, title, description,
                                  confirmLabel, cancelLabel = 'Bekor qilish', destructive = true,
                              }) => (
    <Modal
        open={open}
        onClose={onClose}
        width={440}
        title={title}
        description={description}
        icon={<span className={destructive ? 'is-error' : 'is-brand'}><AlertIcon size={22}/></span>}
        footer={
            <>
                <Button variant="secondary-gray" onClick={onClose} className="ui-grow">{cancelLabel}</Button>
                <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm}
                        loading={loading} className="ui-grow">
                    {confirmLabel}
                </Button>
            </>
        }
    />
);

/* --------------------------------------------------------------- FormDrawer */

/** FormDrawer — o'ng tomondan ochiladigan forma paneli. */
export const FormDrawer = ({open, onClose, title, description, icon, width = 560, footer, children}) => (
    <Drawer
        open={open}
        onClose={onClose}
        width={width}
        destroyOnClose
        closeIcon={null}
        rootClassName="ui-drawer"
        classNames={{mask: 'ui-drawer-mask'}}
        styles={{body: {padding: 0}, header: {padding: 0, border: 0}, footer: {padding: 0, border: 0}}}
        title={
            <div className="ui-drawer__head">
                {icon && <span className="ui-drawer__icon">{icon}</span>}
                <div className="ui-drawer__titles">
                    <h2>{title}</h2>
                    {description && <p>{description}</p>}
                </div>
                <button type="button" onClick={onClose} className="ui-drawer__close" aria-label="Close">
                    <CloseIcon size={20}/>
                </button>
            </div>
        }
        footer={footer && <div className="ui-drawer__foot">{footer}</div>}
    >
        <div className="ui-drawer__body">{children}</div>
    </Drawer>
);

/** Forma bo'limi — sarlavha, izoh va maydonlar to'ri. */
export const FormSection = ({title, description, columns = 2, children}) => (
    <section className="ui-form-section">
        {(title || description) && (
            <header>
                {title && <h3>{title}</h3>}
                {description && <p>{description}</p>}
            </header>
        )}
        <div className={cx('ui-form-section__grid', columns === 2 && 'is-two')}>{children}</div>
    </section>
);
