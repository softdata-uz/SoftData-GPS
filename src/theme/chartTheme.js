import tokens from '../styles/tokens';

const fontFamily = `'${tokens.typography.fontFamily['font-family-body']}', system-ui, -apple-system, 'Segoe UI', sans-serif`;

/** Diagramma matnlari uchun o'lchamlar (px satr ko'rinishida — ApexCharts shuni kutadi). */
export const fontSizes = {
    xs: `${tokens.typography.fontSize['text-xs']}px`,
    sm: `${tokens.typography.fontSize['text-sm']}px`,
    md: `${tokens.typography.fontSize['text-md']}px`,
};

/** ApexCharts uchun umumiy uslub — faol temaga ergashadi, ranglar tokenlardan. */
export const chartBase = (mode) => {
    const c = mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

    return {
        chart: {
            fontFamily,
            foreColor: c['text-tertiary'],
            toolbar: {show: false},
            background: 'transparent',
        },
        theme: {mode},
        grid: {borderColor: c['border-secondary'], strokeDashArray: 4},
        tooltip: {theme: mode},
        legend: {
            fontFamily,
            fontSize: fontSizes.sm,
            labels: {colors: c['text-secondary']},
            markers: {radius: tokens.radius['radius-full']},
        },
        dataLabels: {style: {fontFamily}},
        stroke: {colors: [c['bg-primary']]},
    };
};

export const chartColors = (mode) => {
    const c = mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

    return {
        active: c['utility-success-500'],
        inactive: c['utility-gray-300'],
        danger: c['utility-error-500'],
        daily: c['utility-brand-500'],
        monthly: c['utility-blue-500'],
        series: [
            c['utility-brand-500'],
            c['utility-blue-500'],
            c['utility-indigo-500'],
            c['utility-orange-500'],
            c['utility-success-500'],
            c['utility-error-500'],
        ],
    };
};
