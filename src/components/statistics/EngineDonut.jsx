import React from 'react';
import Chart from 'react-apexcharts';
import {useTranslation} from 'react-i18next';

import tokens from '../../styles/tokens';
import {chartBase, chartColors, fontSizes} from '../../theme/chartTheme';
import {useTheme} from '../../theme/ThemeContext';
import {EmptyState} from '../../ui/ui';

/**
 * Dvigatel holati — yoniq / o'chiq nisbati (donut).
 * Markazda jami; bo'lak ustiga kelinganda markazda o'sha bo'lak nomi va soni.
 * Legendada son va ulush.
 */
const EngineDonut = ({data, height = 300}) => {
    const {theme} = useTheme();
    const {t} = useTranslation();

    const motion = data?.motion_statistics?.[0];
    const on = motion?.ignition_on || 0;
    const off = motion?.ignition_off || 0;
    const total = on + off;

    if (!total) return <EmptyState title={t("Ma'lumot yo'q")}/>;

    const c = theme === 'dark' ? tokens.colors.dark : tokens.colors.light;
    const base = chartBase(theme);
    const colors = chartColors(theme);
    const series = [on, off]; // tartib labels bilan bir xil: [yoniq, o'chiq]
    const share = (value) => (total ? Math.round((value / total) * 100) : 0);

    const options = {
        ...base,
        chart: {...base.chart, type: 'donut'},
        labels: [t('Faol dvigatellar'), t('Nofaol dvigatellar')],
        colors: [colors.active, colors.inactive],
        legend: {
            ...base.legend,
            position: 'bottom',
            itemMargin: {horizontal: 10, vertical: 4},
            markers: {size: 6, shape: 'circle', strokeWidth: 0},
            // legendada aniq son va ulush
            formatter: (name, opts) => {
                const value = opts.w.globals.series[opts.seriesIndex];
                return `${name}: <b>${value}</b> <span style="opacity:.6">(${share(value)}%)</span>`;
            },
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '76%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: 22,
                            fontSize: fontSizes.sm,
                            fontWeight: 500,
                            color: c['text-tertiary'],
                        },
                        value: {
                            show: true,
                            offsetY: -14,
                            fontSize: '30px',
                            fontWeight: 600,
                            color: c['text-primary'],
                            formatter: (v) => String(v),
                        },
                        total: {
                            show: true,
                            showAlways: false,
                            label: t('Jami'),
                            fontSize: fontSizes.sm,
                            fontWeight: 500,
                            color: c['text-tertiary'],
                            formatter: () => String(total),
                        },
                    },
                },
            },
        },
        // halqa ustida son yozilmaydi — u markazda va legendada bor
        dataLabels: {enabled: false},
        // bo'laklar orasida ingichka oraliq (karta foni rangida)
        stroke: {width: on && off ? 3 : 0, colors: [c['bg-primary']]},
        states: {hover: {filter: {type: 'darken', value: 0.92}}, active: {filter: {type: 'none'}}},
        tooltip: {enabled: false},
    };

    return <Chart options={options} series={series} type="donut" height={height}/>;
};

export default EngineDonut;
