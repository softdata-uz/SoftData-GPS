import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {ConfigProvider} from 'antd';

import {getAntdTheme} from './antdTheme';

/**
 * Yorug'/qorong'i rejim (VIP Parking loyihasidagi ThemeContext bilan bir xil).
 * - CSS tokenlari: <html data-theme="dark"> — src/styles/tokens.css dagi
 *   [data-theme="dark"] bloki ishga tushadi.
 * - antd komponentlari (popup'lar ham): ConfigProvider orqali.
 * Tanlov localStorage'da saqlanadi va login sahifasi bilan umumiy.
 */
const STORAGE_KEY = 'theme';
const LEGACY_LOGIN_KEY = 'gps-theme'; // login sahifasi avval mavzuni alohida saqlardi
const MODES = ['light', 'dark'];

/**
 * Login sahifasi va ichki sahifalar uchun yagona mavzu tanlovi —
 * birida tanlangan rejim ikkinchisida ham xuddi shunday bo'ladi.
 */
export const readStoredTheme = () => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (MODES.includes(stored)) return stored;
    const legacy = window.localStorage.getItem(LEGACY_LOGIN_KEY);
    return MODES.includes(legacy) ? legacy : 'light';
};

/** Tanlovni saqlaydi va <html> ga qo'llaydi (CSS tokenlari, autofill, scrollbar). */
export const applyTheme = (mode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.localStorage.removeItem(LEGACY_LOGIN_KEY);
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
};

const getInitialMode = readStoredTheme;

const ThemeContext = createContext({theme: 'light', mode: 'light', setMode: () => {}});

export const ThemeProvider = ({children}) => {
    const [mode, setMode] = useState(getInitialMode);

    useEffect(() => {
        applyTheme(mode);
    }, [mode]);

    const antdConfig = useMemo(() => getAntdTheme(mode), [mode]);
    const value = useMemo(() => ({theme: mode, mode, setMode}), [mode]);

    // message.success(...) kabi statik xabarlar React daraxtidan tashqarida chiziladi
    // va ConfigProvider'ni ko'rmaydi — shu orqali ular ham joriy mavzuni oladi.
    // Chiqishda (login sahifasi) yana yorug' mavzuga qaytariladi.
    useEffect(() => {
        ConfigProvider.config({
            holderRender: (node) => <ConfigProvider theme={antdConfig}>{node}</ConfigProvider>,
        });
    }, [antdConfig]);

    useEffect(() => () => {
        ConfigProvider.config({holderRender: undefined});
    }, []);

    return (
        <ThemeContext.Provider value={value}>
            <ConfigProvider theme={antdConfig}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

const LIGHT_ANTD_CONFIG = getAntdTheme('light');

/**
 * Doim yorug' mavzuda qoladigan hudud — qorong'i rejimga hali o'tkazilmagan
 * (qattiq yozilgan ranglardagi) sahifalar uchun. CSS tokenlari (.theme-light,
 * src/styles/tokens.css) va antd komponentlari yorug' bo'lib qoladi.
 * Sahifa tokenlarga o'tkazilgach, o'ramni olib tashlash kifoya.
 */
export const LightZone = ({children, className = '', ...rest}) => (
    <ConfigProvider theme={LIGHT_ANTD_CONFIG}>
        <div className={`theme-light ${className}`.trim()} {...rest}>
            {children}
        </div>
    </ConfigProvider>
);
