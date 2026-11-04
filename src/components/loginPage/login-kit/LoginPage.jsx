import React, {useEffect, useState} from 'react';
import LoginScene from './LoginScene';
import Select from './Select';
import './loginKit.css';

/* ============================================================================
   LoginPage — "Green" dizaynidagi kirish sahifasi.

   Mustaqil: faqat React kerak. i18n, redux, axios yoki dizayn tizimiga
   bog'liq emas — matnlar `texts` prop'idan, so'rov esa `onSubmit` dan.

   Eng sodda ishlatilishi:
       <LoginPage onSubmit={({login, password}) => api.signIn(login, password)}/>
   ========================================================================== */

/* --------------------------------------------------------------- ikonkalar */
const I = {
    user: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    lock: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    eye: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    eyeOff: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <path d="m1 1 22 22"/>
        </svg>
    ),
    alert: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
        </svg>
    ),
    tls: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1"/>
        </svg>
    ),
    sun: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
    ),
    moon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    ),
};

/* Standart matnlar — `texts` prop'i bilan qisman ham almashtirsa bo'ladi */
const DEFAULT_TEXTS = {
    title: 'Tizimga kirish',
    subtitle: "Davom etish uchun ma'lumotlarni kiriting",
    domainToggle: 'Domain tanlash',
    domain: 'Domain',
    domainPlaceholder: 'Tanlang',
    domainRequired: 'Domain tanlang',
    login: 'Login',
    loginPlaceholder: 'Kiriting',
    loginRequired: 'Login kiriting',
    password: 'Parol',
    passwordPlaceholder: '••••••••',
    passwordRequired: 'Parol kiriting',
    showPassword: "Parolni ko'rsatish",
    hidePassword: 'Parolni yashirish',
    submit: 'Kirish',
    genericError: 'Login yoki parol xato',
    tls: 'Ulanish TLS 1.3 bilan himoyalangan',
    themeToggle: 'Mavzu',
    themeLight: "Yorug'",
    themeDark: 'Tungi',
};

const prefersDark = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * @param onSubmit    ({login, password}) => void | Promise. Xatoni ko'rsatish
 *                    uchun `throw new Error('matn')` qiling yoki rad etilgan
 *                    Promise qaytaring.
 * @param logo        React tugun (masalan `<img src={logo}/>`) yoki matn
 * @param texts       standart matnlarni qisman almashtiradi
 * @param aside       {title, subtitle, features:[{icon,title,text}]}
 * @param defaultTheme 'dark' | 'light' | 'system'
 * @param themeToggle  tema tugmasi ko'rinsinmi (default: true)
 * @param topbarExtra  logotip yonidagi qo'shimcha boshqaruv (masalan til tanlash)
 * @param domains      ixtiyoriy domain ro'yxati (masalan ['uzairports', 'uah']).
 *                     Berilsa — forma tepasida "Domain tanlash" katakchasi chiqadi
 *                     va tanlangan qiymat `onSubmit` ga `domain` bo'lib uzatiladi.
 */
const LoginPage = ({
                       onSubmit,
                       logo = null,
                       texts,
                       aside,
                       defaultTheme = 'dark',
                       themeToggle = true,
                       topbarExtra = null,
                       domains = null,
                       onThemeChange = null,
                   }) => {
    const t = {...DEFAULT_TEXTS, ...(texts || {})};

    const [dark, setDark] = useState(
        () => (defaultTheme === 'system' ? prefersDark() : defaultTheme !== 'light'),
    );

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [useDomain, setUseDomain] = useState(false);
    const [domain, setDomain] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);

    /* Tashqaridan boshqarilsa (masalan loyihaning tema kontekstidan) — ergashadi */
    useEffect(() => {
        if (defaultTheme === 'system') return;
        setDark(defaultTheme !== 'light');
    }, [defaultTheme]);

    /* Tizim temasi tanlangan bo'lsa — OS sozlamasi o'zgarsa ergashadi */
    useEffect(() => {
        if (defaultTheme !== 'system' || typeof window.matchMedia !== 'function') return undefined;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e) => setDark(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [defaultTheme]);

    const submit = async (e) => {
        e.preventDefault();
        setFormError('');

        const next = {};
        if (useDomain && !domain) next.domain = t.domainRequired;
        if (!login.trim()) next.login = t.loginRequired;
        if (!password) next.password = t.passwordRequired;
        setErrors(next);
        if (Object.keys(next).length) return;

        if (typeof onSubmit !== 'function') return;

        setLoading(true);
        try {
            await onSubmit({login: login.trim(), password, domain: useDomain ? domain : undefined});
        } catch (err) {
            setFormError(err?.message || t.genericError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`lg-page${dark ? ' is-dark' : ''}`}>
            <LoginScene
                title={aside?.title}
                subtitle={aside?.subtitle}
                features={aside?.features}
                hud={aside?.hud}
            />

            <section className="lg-main">
                <header className="lg-topbar">
                    <span className="lg-topbar__logo">{logo}</span>

                    <div className="lg-topbar__actions">
                        {topbarExtra}
                        {themeToggle ? (
                            <Select
                                value={dark ? 'dark' : 'light'}
                                onChange={(next) => {
                                    setDark(next === 'dark');
                                    if (typeof onThemeChange === 'function') onThemeChange(next);
                                }}
                                label={t.themeToggle}
                                options={[
                                    {value: 'light', label: t.themeLight, icon: I.sun},
                                    {value: 'dark', label: t.themeDark, icon: I.moon},
                                ]}
                            />
                        ) : null}
                    </div>
                </header>

                <div className="lg-main__body">
                    <form className="lg-form" onSubmit={submit} noValidate>
                        <div className="lg-form__heading">
                            <h1 className="lg-form__title">{t.title}</h1>
                            <p className="lg-form__subtitle">{t.subtitle}</p>
                        </div>

                        {domains?.length ? (
                            <div className="lg-field">
                                <label className="lg-switch">
                                    <input
                                        type="checkbox"
                                        role="switch"
                                        checked={useDomain}
                                        onChange={(e) => {
                                            setUseDomain(e.target.checked);
                                            if (!e.target.checked) setDomain('');
                                        }}
                                    />
                                    <span className="lg-switch__track">
                                        <span className="lg-switch__thumb"/>
                                    </span>
                                    <span className="lg-switch__label">{t.domainToggle}</span>
                                </label>

                                {useDomain ? (
                                    <>
                                        <label className="lg-label" htmlFor="lg-domain">
                                            {t.domain} <span className="lg-label__req">*</span>
                                        </label>
                                        <Select
                                            id="lg-domain"
                                            block
                                            invalid={Boolean(errors.domain)}
                                            label={t.domain}
                                            placeholder={t.domainPlaceholder}
                                            value={domain}
                                            onChange={setDomain}
                                            options={domains.map((d) => ({value: d, label: d}))}
                                        />
                                        {errors.domain ? (
                                            <span className="lg-field__error">{errors.domain}</span>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="lg-field">
                            <label className="lg-label" htmlFor="lg-login">
                                {t.login} <span className="lg-label__req">*</span>
                            </label>
                            <div className={`lg-input${errors.login ? ' is-invalid' : ''}`}>
                                <span className="lg-input__icon">{I.user}</span>
                                <input
                                    id="lg-login"
                                    name="login"
                                    type="text"
                                    autoComplete="username"
                                    placeholder={t.loginPlaceholder}
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                />
                            </div>
                            {errors.login ? <span className="lg-field__error">{errors.login}</span> : null}
                        </div>

                        <div className="lg-field">
                            <label className="lg-label" htmlFor="lg-password">
                                {t.password} <span className="lg-label__req">*</span>
                            </label>
                            <div className={`lg-input${errors.password ? ' is-invalid' : ''}`}>
                                <span className="lg-input__icon">{I.lock}</span>
                                <input
                                    id="lg-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder={t.passwordPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="lg-input__toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                                >
                                    {showPassword ? I.eyeOff : I.eye}
                                </button>
                            </div>
                            {errors.password ? (
                                <span className="lg-field__error">{errors.password}</span>
                            ) : null}
                        </div>

                        {formError ? (
                            <div className="lg-alert" role="alert">
                                {I.alert}
                                <span>{formError}</span>
                            </div>
                        ) : null}

                        <button type="submit" className="lg-btn" disabled={loading}>
                            {loading ? <span className="lg-spinner" aria-hidden="true"/> : null}
                            <span>{t.submit}</span>
                        </button>

                        {t.tls ? (
                            <p className="lg-tls">
                                {I.tls}
                                <span>{t.tls}</span>
                            </p>
                        ) : null}
                    </form>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;
