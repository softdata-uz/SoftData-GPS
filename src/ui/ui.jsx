import React from 'react';
import {CheckIcon, InboxIcon, SearchIcon} from './icons';
import './ui.css';

/*
 * Minimal port of SoftData-AirPort-GPS `src/ui` components (Figma "Green").
 * Same props and sizes as the originals, styled with plain CSS over tokens.css
 * because this project has no Tailwind.
 */

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Button — Figma: Components / Button. */
export const Button = React.forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        iconLeading = null,
        iconTrailing = null,
        iconOnly = false,
        loading = false,
        disabled = false,
        type = 'button',
        className,
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={cx('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, iconOnly && 'ui-btn--icon', className)}
            {...rest}
        >
            {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} className="ui-spinner--current"/> : iconLeading}
            {!iconOnly && children}
            {!iconOnly && !loading && iconTrailing}
        </button>
    );
});

/** Badge — Figma: Components / Badges. */
export const Badge = ({color = 'gray', size = 'sm', dot = false, className, children, ...rest}) => (
    <span className={cx('ui-badge', `ui-badge--${color}`, `ui-badge--${size}`, className)} {...rest}>
        {dot && <span className="ui-badge__dot"/>}
        {children}
    </span>
);

/** Checkbox — Figma: Components / Checkbox (size sm). */
export const Checkbox = ({checked = false, onChange, disabled, className, ...rest}) => (
    <label className={cx('ui-check', disabled && 'is-disabled', className)} onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} {...rest}/>
        <span className={cx('ui-check__box', checked && 'is-checked')}>
            {checked && (
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11.5 3.5 5.25 9.75 2.5 7"/>
                </svg>
            )}
        </span>
    </label>
);

/** Qidiruv maydoni — Input (md) + qidiruv ikonkasi. */
export const SearchInput = ({className, clearable = false, clearLabel = 'Tozalash', ...rest}) => {
    const canClear = clearable && rest.value !== undefined && rest.value !== '' && !rest.disabled;
    const clear = () => {
        const event = {target: {value: ''}, currentTarget: {value: ''}};
        rest.onChange?.(event);
    };
    return (
        <div className={cx('ui-input', className)}>
            <span className="ui-input__icon"><SearchIcon size={18}/></span>
            <input type="search" {...rest}/>
            {canClear && (
                <button type="button" className="ui-input__clear" onClick={clear} aria-label={clearLabel} title={clearLabel}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                         strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

/** Loading indicator — line spinner. */
export const Spinner = ({size = 'md', className}) => (
    <span role="status" aria-label="loading" className={cx('ui-spinner', `ui-spinner--${size}`, className)}/>
);

/** Bo'sh holat — Figma: Application / Empty state. */
export const EmptyState = ({icon, title, description, action, className}) => (
    <div className={cx('ui-empty', className)}>
        <span className="ui-empty__icon">{icon || <InboxIcon size={28}/>}</span>
        <div className="ui-empty__text">
            <p className="ui-empty__title">{title}</p>
            {description && <p className="ui-empty__desc">{description}</p>}
        </div>
        {action}
    </div>
);

export {CheckIcon};
