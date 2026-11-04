import {theme as antdTheme} from 'antd';
import tokens from '../styles/tokens';

/** "#rrggbb" -> "rgba(r, g, b, a)" */
const withAlpha = (hex, alpha) => {
    const n = parseInt(String(hex).replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/**
 * antd v5 ConfigProvider theme, driven entirely by the generated Figma tokens.
 * Only tokens that exist in design/figma/*.json are referenced here.
 */
export const getAntdTheme = (mode) => {
    const c = mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
    const {radius, spacing, typography} = tokens;

    return {
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: c['bg-brand-solid'],
            colorPrimaryHover: c['bg-brand-solid_hover'],
            colorPrimaryBg: c['utility-brand-50'],
            colorSuccess: c['fg-success-primary'],
            colorError: c['fg-error-primary'],
            colorWarning: c['fg-warning-primary'],
            colorInfo: c['bg-brand-solid'],
            colorLink: c['text-brand-secondary'],
            colorLinkHover: c['text-brand-primary'],

            colorBgBase: c['bg-primary'],
            colorBgContainer: c['bg-primary'],
            colorBgElevated: c['bg-primary'],
            colorBgLayout: c['bg-secondary'],
            // overlay tokeni to'liq rang — parda ortidagi sahifa (xarita) ko'rinib tursin
            colorBgMask: withAlpha(c['bg-overlay'], mode === 'dark' ? 0.7 : 0.55),

            colorText: c['text-primary'],
            colorTextSecondary: c['text-secondary'],
            colorTextTertiary: c['text-tertiary'],
            colorTextQuaternary: c['text-quaternary'],
            colorTextPlaceholder: c['text-placeholder'],
            colorTextDisabled: c['text-disabled'],
            colorIcon: c['fg-quaternary'],
            colorIconHover: c['fg-secondary'],

            colorBorder: c['border-primary'],
            colorBorderSecondary: c['border-secondary'],

            borderRadius: radius['radius-md'],
            borderRadiusSM: radius['radius-sm'],
            borderRadiusLG: radius['radius-xl'],
            borderRadiusXS: radius['radius-xs'],

            fontFamily: `'${typography.fontFamily['font-family-body']}', system-ui, -apple-system, 'Segoe UI', sans-serif`,
            fontSize: typography.fontSize['text-sm'],
            fontSizeLG: typography.fontSize['text-md'],
            fontSizeSM: typography.fontSize['text-xs'],
            fontSizeHeading1: typography.fontSize['display-sm'],
            fontSizeHeading2: typography.fontSize['display-xs'],
            fontSizeHeading3: typography.fontSize['text-xl'],
            lineHeight: typography.lineHeight['text-sm'] / typography.fontSize['text-sm'],

            controlHeight: spacing['spacing-5xl'],
            controlHeightSM: spacing['spacing-4xl'],
            controlHeightLG: spacing['spacing-6xl'],
            padding: spacing['spacing-xl'],
            paddingSM: spacing['spacing-lg'],
            paddingXS: spacing['spacing-md'],
            margin: spacing['spacing-xl'],
        },
        components: {
            Button: {
                fontWeight: typography.fontWeight.semibold,
                paddingInline: spacing['spacing-xl'],
            },
            Table: {
                headerBg: c['bg-secondary'],
                headerColor: c['text-quaternary'],
                headerSplitColor: 'transparent',
                borderColor: c['border-secondary'],
                rowHoverBg: c['bg-secondary'],
                cellPaddingBlock: spacing['spacing-lg'],
                cellPaddingInline: spacing['spacing-3xl'],
                footerBg: c['bg-primary'],
            },
            Modal: {
                borderRadiusLG: radius['radius-2xl'],
                contentBg: c['bg-primary'],
                headerBg: c['bg-primary'],
            },
            Drawer: {
                colorBgElevated: c['bg-primary'],
            },
            Select: {
                optionSelectedBg: c['bg-active'],
                optionSelectedColor: c['text-secondary'],
                optionActiveBg: c['bg-secondary_hover'],
            },
            Input: {
                activeBorderColor: c['border-brand'],
                hoverBorderColor: c['border-brand'],
                activeShadow: `0 0 0 4px ${c['utility-brand-100']}`,
                paddingInline: spacing['spacing-lg'],
            },
            Checkbox: {
                colorPrimary: c['utility-brand-50'],
                colorPrimaryHover: c['utility-brand-50'],
                borderRadiusSM: radius['radius-xs'],
                controlInteractiveSize: spacing['spacing-xl'],
            },
            Radio: {
                colorPrimary: c['utility-brand-50'],
                radioSize: spacing['spacing-xl'],
                buttonSolidCheckedBg: c['bg-brand-solid'],
            },
            DatePicker: {
                activeBorderColor: c['border-brand'],
                hoverBorderColor: c['border-brand'],
                cellActiveWithRangeBg: c['utility-brand-50'],
                borderRadius: radius['radius-md'],
            },
            Popover: {
                borderRadiusLG: radius['radius-lg'],
            },
            Tooltip: {
                // Tooltip foni har doim mavzuga teskari (`bg-primary-solid`),
                // shuning uchun matn rangi ham teskari bo'lishi kerak — aks holda
                // tungi rejimda oq matn oq fonda yo'qoladi.
                colorBgSpotlight: c['bg-primary-solid'],
                colorTextLightSolid: c['bg-primary'],
                borderRadius: radius['radius-md'],
            },
            Pagination: {
                itemActiveBg: c['bg-active'],
            },
            Segmented: {
                itemSelectedBg: c['bg-primary'],
                trackBg: c['bg-secondary'],
                itemColor: c['text-quaternary'],
                itemSelectedColor: c['text-secondary'],
            },
            Tabs: {
                itemSelectedColor: c['text-brand-secondary'],
                itemHoverColor: c['text-secondary'],
                inkBarColor: c['border-brand'],
            },
            Switch: {
                colorPrimary: c['bg-brand-solid'],
                colorPrimaryHover: c['bg-brand-solid_hover'],
            },
            Message: {
                contentBg: c['bg-primary'],
            },
        },
    };
};
