import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import LoginKit from './login-kit';
import {ip} from '../../ip';
import {LoginSuccess} from '../../redux/action/action';
import {ReactComponent as Logo} from '../../assets/brand/softdata-gps-logo.svg';
import {GlobeIcon, MoonIcon, SunIcon} from '../../ui/icons';
import {applyTheme, readStoredTheme} from '../../theme/ThemeContext';
import './loginPageNew.css';

const LANGS = [
    {code: 'uz', short: 'UZ', label: "O‘zbekcha"},
    {code: 'ru', short: 'RU', label: 'Русский'},
    {code: 'en', short: 'EN', label: 'English'},
];

/* Bir bosishda tanlanadigan segmentli guruh — ichki sahifalar header'idagi bilan bir xil */
const Segmented = ({label, value, options, onChange, className = ''}) => (
    <div className={`lp-seg ${className}`.trim()} role="radiogroup" aria-label={label}>
        {options.map((option) => {
            const active = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={option.title}
                    title={option.title}
                    className={`lp-seg__item${active ? ' is-active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.content}
                </button>
            );
        })}
    </div>
);

const Icons = {
    pin: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    ),
    history: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l3.5 2"/>
        </svg>
    ),
    fleet: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17V9l3-4h7v12"/>
            <path d="M13 11h5l3 3v3h-2"/>
            <circle cx="7.5" cy="17.5" r="2"/>
            <circle cx="17.5" cy="17.5" r="2"/>
        </svg>
    ),
};

/** Kirish sahifasi — login-kit ("Green" dizayn tizimi) ustiga loyiha autentifikatsiyasi ulangan. */
const LoginPageNew = () => {
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();
    const [lang, setLang] = useState((i18n.language || localStorage.getItem('i18nextLng') || 'uz').slice(0, 2));
    // ichki sahifalar bilan bir xil mavzu (ThemeContext)
    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const onChangeLanguage = (code) => {
        setLang(code);
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
    };

    const onThemeChange = (next) => setTheme(next);

    const signIn = async ({login, password}) => {
        try {
            const {data} = await axios.post(`${ip}/api/sign-in`, {login, password});
            localStorage.setItem('gps-x-access-token', data.accessToken);
            dispatch(LoginSuccess(data));
        } catch (err) {
            throw new Error(err?.response?.data?.msg || t('Login yoki parol xato'));
        }
    };

    return (
        <LoginKit
            logo={<Logo className="lp-logo"/>}
            defaultTheme={theme}
            onThemeChange={onThemeChange}
            onSubmit={signIn}
            texts={{
                title: t('Tizimga kirish'),
                subtitle: t("Davom etish uchun ma'lumotlarni kiriting"),
                login: t('Login'),
                loginPlaceholder: t('Kiriting'),
                loginRequired: t('Loginni kiriting!'),
                password: t('Parol'),
                passwordRequired: t('Parolni kiriting!'),
                showPassword: t("Parolni ko'rsatish"),
                hidePassword: t('Parolni yashirish'),
                submit: t('Kirish'),
                genericError: t('Xatolik yuz berdi'),
                themeToggle: t('Mavzu'),
                themeLight: t("Yorug'"),
                themeDark: t('Tungi'),
                tls: t('Ulanish himoyalangan kanal orqali amalga oshiriladi'),
            }}
            aside={{
                hud: [
                    {top: '4%', left: '6%', label: t('Faol transport'), value: '128', live: true},
                    {top: '32%', right: '4%', label: '01 A 777 BC', value: `62 ${t('km/soat')}`},
                    {bottom: '8%', left: '10%', label: t('GPS aniqlik'), value: `3.4 ${t('m')}`},
                ],
                title: t('Transport parki nazorat ostida'),
                subtitle: t('Barcha transport vositalarini real vaqtda kuzating, marshrutlarni tahlil qiling — bitta platformada.'),
                features: [
                    {
                        icon: Icons.pin,
                        title: t('Real vaqtda kuzatuv'),
                        text: t('Har bir transport joylashuvi uzluksiz yangilanadi'),
                    },
                    {
                        icon: Icons.history,
                        title: t('Marshrut tarixi'),
                        text: t("Istalgan sana oralig'i bo'yicha yo'l tarixi"),
                    },
                    {
                        icon: Icons.fleet,
                        title: t('Butun park bir joyda'),
                        text: t('Avtobus, yengil va yuk avtomobillari'),
                    },
                ],
            }}
            themeToggle={false}
            topbarExtra={
                <div className="lp-prefs">
                    <Segmented
                        label={t('Mavzu')}
                        value={theme}
                        onChange={onThemeChange}
                        className="lp-seg--icon"
                        options={[
                            {value: 'light', title: t("Yorug'"), content: <SunIcon size={17}/>},
                            {value: 'dark', title: t("Qorong'i"), content: <MoonIcon size={17}/>},
                        ]}
                    />
                    <span className="lp-prefs__sep" aria-hidden="true"/>
                    <div className="lp-seg-wrap">
                        <GlobeIcon size={17} className="lp-seg-wrap__globe" aria-hidden="true"/>
                        <span className="lp-seg-wrap__divider" aria-hidden="true"/>
                        <Segmented
                            label={t('Til')}
                            value={lang}
                            onChange={onChangeLanguage}
                            className="lp-seg--text"
                            options={LANGS.map((l) => ({value: l.code, title: l.label, content: l.short}))}
                        />
                    </div>
                </div>
            }
        />
    );
};

export default LoginPageNew;
