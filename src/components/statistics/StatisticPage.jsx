import React, {useCallback, useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {ConfigProvider} from 'antd';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {LoginFailure} from '../../redux/action/action';
import {getAntdTheme} from '../../theme/antdTheme';
import {useTheme} from '../../theme/ThemeContext';
import {Badge, Button, EmptyState, cx} from '../../ui/ui';
import {AlertIcon, ClockIcon, DeviceIcon, MapIcon, RefreshIcon, TargetIcon} from '../../ui/icons';
import EngineDonut from './EngineDonut';
import StatusSplit from './StatusSplit';
import FleetBars from './FleetBars';
import DistanceColumns from './DistanceColumns';

import './statistic.css';


/* ============================================================================
   Statistika — parkning bir qarashda ko'rinadigan holati
   (SoftData-AirPort-GPS features/statistics/StatisticsPage.jsx bilan bir xil).

   Backend bitta yig'ma so'rov beradi (`/api/analytics/events`): tur bo'yicha
   faol/nofaol soni va dvigatel/harakat holati. Masofa reytingi alohida
   so'rovda (`/api/log-data-top`) va o'z sanasi bilan ishlaydi.
   ========================================================================== */

/** KPI kartochkasi — qiymat, ulush va yuklanish holati bilan. */
const Kpi = ({icon, tone, label, value, share, of, loading}) => (
    <div className="st-card st-kpi">
        <span className={cx('st-featured', `is-${tone}`)}>{icon}</span>

        <div className="st-kpi__body">
            <p className="st-kpi__label">{label}</p>

            {loading ? (
                <span className="st-skeleton st-skeleton--value"/>
            ) : (
                <p className="st-kpi__value">{value}</p>
            )}

            {share != null && !loading && <p className="st-kpi__share">{share}% · {of}</p>}
        </div>
    </div>
);

const CardHeader = ({title, actions}) => (
    <div className="st-card__head">
        <h3 className="st-card__title">{title}</h3>
        {actions && <div className="st-card__actions">{actions}</div>}
    </div>
);

const StatisticPage = () => {
    const {t} = useTranslation();
    const {theme} = useTheme();
    const antdTheme = useMemo(() => getAntdTheme(theme), [theme]);
    const dispatch = useDispatch();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const onAuthError = useCallback((err) => {
        if (err?.response?.status === 401) dispatch(LoginFailure());
    }, [dispatch]);

    const load = useCallback(() => {
        setLoading(true);
        setFailed(false);
        axios.get(`${ip}/api/analytics/events`, {
            headers: {'x-access-token': localStorage.getItem('gps-x-access-token')},
        })
            .then((res) => setData(res?.data?.data || null))
            .catch((err) => {
                onAuthError(err);
                setData(null);
                setFailed(true);
            })
            .finally(() => setLoading(false));
    }, [onAuthError]);

    useEffect(load, [load]);

    const stats = useMemo(() => {
        const types = data?.type_statistics || [];
        const motion = data?.motion_statistics?.[0] || {};

        const active = types.reduce((sum, item) => sum + (item.active || 0), 0);
        const inactive = types.reduce((sum, item) => sum + (item.inactive || 0), 0);
        const total = active + inactive;
        const percent = (part) => (total ? Math.round((part / total) * 100) : 0);

        return {types, motion, active, inactive, total, percent};
    }, [data]);

    const of = t('jami {{n}} dan', {n: stats.total});

    const kpis = [
        {key: 'total', icon: <MapIcon size={24}/>, tone: 'brand', label: t('Jami transport'), value: stats.total},
        {
            key: 'online', icon: <TargetIcon size={24}/>, tone: 'success', label: t('Faol qurilmalar'),
            value: stats.active, share: stats.percent(stats.active), of,
        },
        {
            key: 'offline', icon: <DeviceIcon size={24}/>, tone: 'gray', label: t('Nofaol qurilmalar'),
            value: stats.inactive, share: stats.percent(stats.inactive), of,
        },
        {
            key: 'engine', icon: <ClockIcon size={24}/>, tone: 'warning', label: t('Dvigateli yoniq'),
            value: stats.motion.ignition_on ?? 0, share: stats.percent(stats.motion.ignition_on ?? 0), of,
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="statistic_page st">
                <div className="st-header">
                    <div className="st-header__text">
                        <h1 className="st-header__title">{t('Statistika')}</h1>
                        <p className="st-header__sub">{t('Park holati va harakat ko‘rsatkichlari')}</p>
                    </div>
                    <div className="st-header__actions">
                        <Button variant="secondary-gray" iconLeading={<RefreshIcon size={18}/>}
                                onClick={load} loading={loading}>
                            {t('Yangilash')}
                        </Button>
                    </div>
                </div>

                {failed ? (
                    <div className="st-card">
                        <EmptyState
                            icon={<AlertIcon size={26}/>}
                            title={t('Xatolik yuz berdi')}
                            description={t("Ma'lumot yo'q")}
                            action={<Button onClick={load}>{t('Yangilash')}</Button>}
                        />
                    </div>
                ) : (
                    <>
                        <div className="st-kpis">
                            {kpis.map(({key, ...kpi}) => <Kpi key={key} {...kpi} loading={loading}/>)}
                        </div>

                        <div className="st-row">
                            <div className="st-card">
                                <CardHeader title={t('Dvigatel va harakat holati')}/>
                                {loading ? (
                                    <span className="st-skeleton st-skeleton--chart"/>
                                ) : (
                                    <>
                                        <EngineDonut data={data} height={240}/>
                                        <StatusSplit
                                            rows={[
                                                {label: t('Harakatda'), value: stats.motion.motion_on ?? 0, tone: 'success'},
                                                {label: t('Harakatda emas'), value: stats.motion.motion_off ?? 0, tone: 'gray'},
                                            ]}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="st-card st-card--wide">
                                <CardHeader
                                    title={t('Faol va nofaol GPS qurilmalar')}
                                    actions={
                                        <>
                                            <Badge color="success" dot>{t('Faol')}</Badge>
                                            <Badge color="gray" dot>{t('Nofaol')}</Badge>
                                        </>
                                    }
                                />
                                <div className={cx('st-card__body', loading && 'st-card__body--loading')}>
                                    {loading
                                        ? Array.from({length: 6}).map((_, index) => (
                                            <span key={index} className="st-skeleton st-skeleton--row"/>
                                        ))
                                        : <FleetBars data={stats.types}/>}
                                </div>
                            </div>
                        </div>

                        <div className="st-card">
                            <DistanceColumns onAuthError={onAuthError}/>
                        </div>
                    </>
                )}
            </div>
        </ConfigProvider>
    );
};

export default StatisticPage;
