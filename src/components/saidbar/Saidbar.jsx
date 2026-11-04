import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BrowserRouter, NavLink, useLocation} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Tooltip} from 'antd';

import {ReactComponent as Logo} from '../../assets/brand/softdata-gps-logo.svg';
import {
    ChartIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DeviceIcon,
    GlobeIcon,
    LogoutIcon,
    MapIcon,
    MoonIcon,
    SunIcon,
    UserIcon,
    UsersIcon,
} from '../../ui/icons';
import ProfileDrawer from './ProfileDrawer';
import RootPage from '../../pages/root';
import {storage} from '../../services';
import {LoginFailure} from '../../redux/action/action';
import {ThemeProvider, useTheme} from '../../theme/ThemeContext';
import useMediaQuery from '../../ui/useMediaQuery';

import './saidbar.css';

/* Header — VIP Parking loyihasidagi Layout.jsx (TopNav + TopBar + profil menyusi)
   bilan bir xil tuzilish; menyu bandlari — GPS bo'limlari. */

const LANGUAGES = [
    {value: 'uz', short: 'UZ', label: "O‘zbekcha"},
    {value: 'ru', short: 'RU', label: 'Русский'},
    {value: 'en', short: 'EN', label: 'English'},
];

const THEME_MODES = [
    {value: 'light', labelKey: "Yorug'", Icon: SunIcon},
    {value: 'dark', labelKey: "Qorong'i", Icon: MoonIcon},
];

/* Backend rol kodlari — tarjima kalitlariga moslash */
const ROLE_LABELS = {
    superadmin: 'Super Admin',
    king: 'Super Admin',
    admin: 'Admin',
    operator: 'Operator',
};

const NAV = [
    {to: '/maps', icon: MapIcon, label: 'Xarita', roles: null},
    {to: '/statistic', icon: ChartIcon, label: 'Statistika', roles: null},
    {to: '/device', icon: DeviceIcon, label: 'Qurilmalar', roles: ['superadmin', 'king', 'admin']},
    {to: '/admins', icon: UsersIcon, label: 'Adminlar', roles: ['superadmin', 'king']},
];

const shortName = (u) => [u?.lastname, u?.firstname].filter(Boolean).join(' ') || u?.login || '—';
const fullName = (u) => [u?.lastname, u?.firstname, u?.fathersname].filter(Boolean).join(' ') || u?.login || '—';
const initials = (u) => {
    const parts = [u?.lastname, u?.firstname].filter(Boolean);
    const source = parts.length ? parts : [u?.login || '?'];
    return source.map((p) => String(p).trim().charAt(0)).join('').toUpperCase();
};

const Avatar = ({user, large = false}) => (
    <span className={`shell-user__avatar${large ? ' shell-user__avatar--lg' : ''}`}>{initials(user)}</span>
);

/* Bir bosishda tanlanadigan segmentli guruh (radio-guruh semantikasi, ←/→ bilan ham) */
const Segmented = ({label, value, options, onChange, variant}) => {
    const onKeyDown = (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const i = options.findIndex((o) => o.value === value);
        const next = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length];
        onChange(next.value);
        e.currentTarget.parentElement.querySelector(`[data-value="${next.value}"]`)?.focus();
    };

    return (
        <div className={`shell-seg shell-seg--${variant}`} role="radiogroup" aria-label={label}>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <Tooltip key={option.value} title={option.title} placement="bottom" mouseEnterDelay={0.3}>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={option.title}
                            data-value={option.value}
                            tabIndex={active ? 0 : -1}
                            className={`shell-seg__item${active ? ' is-active' : ''}`}
                            onClick={() => onChange(option.value)}
                            onKeyDown={onKeyDown}
                        >
                            {option.content}
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};

/** Mavzu (yorug'/qorong'i) va til — ikki alohida guruh. */
const PrefsSwitch = ({lang, onChangeLanguage}) => {
    const {t} = useTranslation();
    const {mode, setMode} = useTheme();

    const themeOptions = useMemo(() => THEME_MODES.map(({value, labelKey, Icon}) => ({
        value, title: t(labelKey), content: <Icon size={17}/>,
    })), [t]);
    const languageOptions = useMemo(() => LANGUAGES.map(({value, short, label}) => ({
        value, title: label, content: short,
    })), []);

    return (
        <>
            <div className="shell-prefs">
                <Segmented variant="icon" label={t('Mavzu')} value={mode} onChange={setMode}
                           options={themeOptions}/>
            </div>
            <span className="shell-top__sep" aria-hidden="true"/>
            <div className="shell-prefs shell-prefs--lang">
                <GlobeIcon size={18} className="shell-prefs__globe" aria-hidden="true"/>
                <span className="shell-prefs__divider" aria-hidden="true"/>
                <Segmented variant="text" label={t('Til')} value={lang} onChange={onChangeLanguage}
                           options={languageOptions}/>
            </div>
        </>
    );
};

/* Gorizontal menyu — logo yonida. Sig'masa skroll bo'ladi va chekkalarda strelkalar chiqadi. */
const TopNav = ({items}) => {
    const {t} = useTranslation();
    const {pathname} = useLocation();
    const iconOnly = useMediaQuery('(max-width: 860px)');
    const scrollRef = useRef(null);
    const [overflow, setOverflow] = useState({left: false, right: false});

    const update = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setOverflow({
            left: el.scrollLeft > 0,
            right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        });
    }, []);

    useEffect(() => {
        update();
        const el = scrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', update);
            return () => window.removeEventListener('resize', update);
        }
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [update]);

    // faol bo'lim ko'rinmay qolsa — unga skroll
    useEffect(() => {
        scrollRef.current?.querySelector('.is-active')?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
    }, [pathname]);

    const scrollBy = (dir) => scrollRef.current?.scrollBy({left: dir * 200, behavior: 'smooth'});

    return (
        <div className="shell-topnav">
            {overflow.left && (
                <button type="button" className="shell-topnav__arrow shell-topnav__arrow--left"
                        onClick={() => scrollBy(-1)} aria-hidden="true" tabIndex={-1}>
                    <ChevronLeftIcon size={18}/>
                </button>
            )}
            <nav className="shell-topnav__scroll" ref={scrollRef} onScroll={update}>
                {items.map(({to, label, icon: Icon}) => (
                    <Tooltip key={to} title={iconOnly ? t(label) : null} placement="bottom" mouseEnterDelay={0.25}>
                        <NavLink
                            to={to}
                            aria-label={t(label)}
                            className={({isActive}) => `shell-topnav__link${isActive ? ' is-active' : ''}`}
                        >
                            <Icon size={20}/>
                            <span className="shell-topnav__label">{t(label)}</span>
                        </NavLink>
                    </Tooltip>
                ))}
            </nav>
            {overflow.right && (
                <button type="button" className="shell-topnav__arrow shell-topnav__arrow--right"
                        onClick={() => scrollBy(1)} aria-hidden="true" tabIndex={-1}>
                    <ChevronRightIcon size={18}/>
                </button>
            )}
        </div>
    );
};

const UserMenu = ({user, lang, onChangeLanguage, onProfile, onLogout}) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const roleLabel = user?.role ? t(ROLE_LABELS[user.role] || user.role) : '';

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div className="shell-user" ref={rootRef}>
            <button
                type="button"
                className={`shell-user__trigger${open ? ' is-open' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Avatar user={user}/>
                <span className="shell-user__text">
                    <span className="shell-user__name">{shortName(user)}</span>
                    {roleLabel && <span className="shell-user__role">{roleLabel}</span>}
                </span>
                <ChevronDownIcon size={16} className="shell-user__chevron"/>
            </button>

            {open && (
                <div className="shell-menu" role="menu">
                    <div className="shell-menu__head">
                        <Avatar user={user} large/>
                        <span className="shell-menu__head-text">
                            <span className="shell-menu__head-name" title={fullName(user)}>{fullName(user)}</span>
                            <span className="shell-menu__head-meta">
                                {roleLabel && <span className="shell-role-badge">{roleLabel}</span>}
                                {user?.login && <span className="shell-menu__head-login">@{user.login}</span>}
                            </span>
                        </span>
                    </div>
                    {/* telefonda header'da joy yo'q — mavzu va til menyuda */}
                    <div className="shell-menu__prefs">
                        <PrefsSwitch lang={lang} onChangeLanguage={onChangeLanguage}/>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        className="shell-menu__item"
                        onClick={() => {
                            setOpen(false);
                            onProfile();
                        }}
                    >
                        <span className="shell-menu__item-icon"><UserIcon size={16}/></span>
                        {t('Profil')}
                    </button>
                    <span className="shell-menu__divider" aria-hidden="true"/>
                    <button
                        type="button"
                        role="menuitem"
                        className="shell-menu__item shell-menu__item--danger"
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                    >
                        <span className="shell-menu__item-icon"><LogoutIcon size={16}/></span>
                        {t('Chiqish')}
                    </button>
                </div>
            )}
        </div>
    );
};

/** Telefon uchun pastki navigatsiya paneli (ikonka + nom). */
const MobileNav = ({user}) => {
    const {t} = useTranslation();
    const items = NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

    return (
        <nav className="shell-tabbar" aria-label={t('Menyu')}>
            {items.map(({to, label, icon: Icon}) => (
                <NavLink key={to} to={to}
                         className={({isActive}) => `shell-tabbar__item${isActive ? ' is-active' : ''}`}>
                    <span className="shell-tabbar__icon"><Icon size={20}/></span>
                    <span className="shell-tabbar__label">{t(label)}</span>
                </NavLink>
            ))}
        </nav>
    );
};

const TopBar = ({user, lang, onChangeLanguage, onProfile, onLogout}) => {
    const items = NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

    return (
        <header className="shell-top">
            {/* logotipdagi yozuv `currentColor` — mavzuga qarab rang oladi */}
            <NavLink to="/maps" aria-label="SoftData GPS" className="shell-top__logo">
                <Logo/>
            </NavLink>

            <TopNav items={items}/>

            <div className="shell-top__right">
                <PrefsSwitch lang={lang} onChangeLanguage={onChangeLanguage}/>
                <span className="shell-top__sep" aria-hidden="true"/>
                <UserMenu user={user} lang={lang} onChangeLanguage={onChangeLanguage}
                          onProfile={onProfile} onLogout={onLogout}/>
            </div>
        </header>
    );
};

/** Ilova qobig'i — yuqori gorizontal panel + kontent maydoni. */
const Saidbar = () => {
    const [user, setUser] = useState(() => storage.local.get('user') || {});
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();

    const [lang, setLang] = useState((i18n.language || localStorage.getItem('i18nextLng') || 'uz').slice(0, 2));
    const [, setPathName] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);

    const onChangeLanguage = (code) => {
        setLang(code);
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
    };

    // profil saqlangach header darhol yangilansin
    const onProfileSaved = (profile) => {
        const next = {...user, ...profile};
        storage.local.set('user', next);
        setUser(next);
    };

    const logout = () => {
        dispatch(LoginFailure());
        localStorage.removeItem('gps-x-access-token');
        i18n.changeLanguage('uz');
    };

    return (
        <ThemeProvider>
            <BrowserRouter>
                <div className="full_content">
                    <div className="full_content_right">
                        <TopBar user={user} lang={lang} onChangeLanguage={onChangeLanguage}
                                onProfile={() => setProfileOpen(true)} onLogout={logout}/>

                        <div className="content">
                            <RootPage setPathName={setPathName}/>
                        </div>

                        <MobileNav user={user}/>
                    </div>

                    <ProfileDrawer
                        open={profileOpen}
                        onClose={() => setProfileOpen(false)}
                        user={user}
                        roleLabel={user?.role ? t(ROLE_LABELS[user.role] || user.role) : ''}
                        initials={initials(user)}
                        onSaved={onProfileSaved}
                    />
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default Saidbar;
