import React, {useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import moment from 'moment';
import {DatePicker} from 'antd';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {chartBase, chartColors, fontSizes} from '../../theme/chartTheme';
import {useTheme} from '../../theme/ThemeContext';
import {EmptyState} from '../../ui/ui';
import {CalendarIcon, ChartIcon, ChevronLeftIcon, ChevronRightIcon} from '../../ui/icons';


/* antd DatePicker — ikonkalari loyihaning yagona to'plamidan (namunadagi ui/DatePicker) */
const PICKER_ICONS = {
    suffixIcon: <CalendarIcon size={18}/>,
    prevIcon: <ChevronLeftIcon size={16}/>,
    nextIcon: <ChevronRightIcon size={16}/>,
    superPrevIcon: <ChevronLeftIcon size={16}/>,
    superNextIcon: <ChevronRightIcon size={16}/>,
};

/** Eng ko'p masofa bosib o'tgan transportlar — kunlik va oylik. */
const DistanceColumns = ({onAuthError, height = 320}) => {
    const {theme} = useTheme();
    const {t} = useTranslation();

    const [rows, setRows] = useState(null);
    const [date, setDate] = useState(null);

    useEffect(() => {
        let cancelled = false;
        axios.get(`${ip}/api/log-data-top`, {
            params: {date},
            headers: {'x-access-token': localStorage.getItem('gps-x-access-token')},
        })
            .then((res) => !cancelled && setRows(res?.data?.data || []))
            .catch((err) => {
                if (cancelled) return;
                onAuthError?.(err);
                setRows([]);
            });
        return () => {
            cancelled = true;
        };
    }, [date, onAuthError]);

    const base = chartBase(theme);
    const colors = chartColors(theme);

    // son bo'lishi shart — "12 km" kabi matn bo'lsa ApexCharts ustunni chizmaydi
    const series = [
        {name: t('Kunlik'), data: rows?.map((e) => Number(e.daily) || 0) || []},
        {name: t('Oylik'), data: rows?.map((e) => Number(e.monthly) || 0) || []},
    ];

    const options = {
        ...base,
        chart: {...base.chart, type: 'bar'},
        plotOptions: {
            bar: {horizontal: false, columnWidth: '45%', borderRadius: 6, borderRadiusApplication: 'end'},
        },
        colors: [colors.daily, colors.monthly],
        dataLabels: {enabled: false},
        stroke: {show: false},
        xaxis: {
            categories: rows?.map((e) => e.display_name) || [],
            axisBorder: {show: false},
            axisTicks: {show: false},
            labels: {style: {fontSize: fontSizes.xs}},
        },
        yaxis: {labels: {formatter: (v) => `${Math.round(v)}`}},
        legend: {...base.legend, position: 'top', horizontalAlign: 'left'},
        tooltip: {...base.tooltip, shared: true, intersect: false, y: {formatter: (v) => `${v} km`}},
    };

    return (
        <>
            <div className="st-card__head">
                <h3 className="st-card__title">{t("Eng ko'p masofa bosib o'tgan transportlar")}</h3>
                <div className="st-card__actions">
                    <DatePicker
                        {...PICKER_ICONS}
                        placeholder={moment().format('DD.MM.YYYY')}
                        format="DD.MM.YYYY"
                        onChange={(value) => setDate(value ? value.toDate().toISOString() : null)}
                    />
                </div>
            </div>
            <div className="st-card__body">
                {rows === null && <span className="st-skeleton st-skeleton--chart"/>}

                {rows?.length === 0 && (
                    <EmptyState
                        icon={<ChartIcon size={26}/>}
                        title={t("Ma'lumot yo'q")}
                        description={t('Boshqa sanani tanlab ko‘ring')}
                    />
                )}

                {rows?.length > 0 && <Chart options={options} series={series} type="bar" height={height}/>}
            </div>
        </>
    );
};

export default DistanceColumns;
