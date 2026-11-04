import React, {useMemo, useState} from "react";
import {DatePicker, message} from "antd";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";

import {Button, cx} from "../../../ui/ui";
import {
    ChevronLeftIcon,
    ClockIcon,
    DeviceIcon,
    InfoIcon,
    MapIcon,
    RefreshIcon,
    TargetIcon,
} from "../../../ui/icons";
import {formatDateTime, GSM_LABELS, relativeTime, vehicleIcon, vehicleLabelKey} from "./vehicleMeta";

const {RangePicker} = DatePicker;
const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const GAUGE_MAX = 120; // km/soat — o'lchagich shkalasi

/* Yoqilg'i darajasi o'rnida qurilma holat kodini ham qaytarishi mumkin:
   4 — datchik nosoz, 5 — CAN ma'lumotida yoqilg'i qiymati yo'q. */
const FUEL_SENSOR_FAULT = 4;
const FUEL_NO_CAN_VALUE = 5;

const fuelLevel = (v, t) => {
    if (v?.fuel_account_type === FUEL_SENSOR_FAULT) return t("Yoqilg'i datchigi nosoz");
    if (v?.fuel_account_type === FUEL_NO_CAN_VALUE) return t("CAN ma'lumotlarida Yoqilg'i qiymatlari berilmagan!");
    return v?.fuel_level > 0 ? `${formatNumber(v.fuel_level)} l` : '—';
};

const isSet = (v) => v !== undefined && v !== null && v !== '';
const show = (v) => (isSet(v) ? v : '—');

/** 21613.422 → "21 613.4" — xonalarga ajratilgan, kasr qismi bitta raqam. */
const formatNumber = (value, digits = 0) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? '—');
    const [int, frac] = n.toFixed(digits).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    return frac && Number(frac) ? `${grouped}.${frac}` : grouped;
};

/* ------------------------------------------------------------ bo'laklar */

const FuelIcon = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>
    </svg>
);

const Tile = ({label, children, wide, title}) => (
    <div className={cx('vd-tile', wide && 'is-wide')} title={title}>
        <span className="vd-tile__label">{label}</span>
        <span className="vd-tile__value">{children}</span>
    </div>
);

const Section = ({icon, title, children}) => (
    <section className="vd-section">
        <h4 className="vd-section__title">{icon}{title}</h4>
        <div className="vd-tiles">{children}</div>
    </section>
);

const SignalBars = ({level}) => (
    <span className="vd-signal" aria-hidden="true">
        {[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= level ? 'is-on' : ''}/>)}
    </span>
);

const Meter = ({value, tone}) => (
    <span className={cx('vd-meter', tone && `is-${tone}`)} aria-hidden="true">
        <i style={{width: `${Math.max(0, Math.min(100, value))}%`}}/>
    </span>
);

/* ------------------------------------------------------------ panel */

const VehicleDetail = ({
                           detail, live, stops, history, historyLoading,
                           onBack, onRefresh, onLocate, onLoadHistory, onCancelHistory,
                       }) => {
    const {t} = useTranslation();
    const [tab, setTab] = useState(history ? 'history' : 'live');
    const [range, setRange] = useState(() => [dayjs().startOf('day'), dayjs()]);

    // jonli ro'yxatdagi eng so'nggi holat tafsilotlar ustidan yoziladi
    const m = useMemo(() => ({...(detail || {}), ...(live || {})}), [detail, live]);
    const loading = !detail;
    const active = !!m.active;
    // nofaol qurilmaning oxirgi tezligi eskirgan — uni ko'rsatish chalg'itadi
    const speed = !active ? 0 : isSet(m.speed) ? Math.round(+m.speed) : null;
    const updated = m.date_time || m.updated_time;
    const distance = history ? history.distance : m.distance;
    const gsm = Number.isInteger(m.gsm_signal) ? m.gsm_signal : null;
    const battery = isSet(m.battery_level) ? Math.max(0, Math.min(100, +m.battery_level)) : null;
    const fuelPct = +m.fuel_level_percentage > 0 ? +m.fuel_level_percentage : null; // 0 — datchik ma'lumot bermagan
    const fuel = fuelLevel(m, t);

    // boshlang'ich oraliq — "Bugun"
    const [preset, setPreset] = useState(() => t('Bugun'));

    const presets = [
        {label: t('Bugun'), value: [dayjs().startOf('day'), dayjs()]},
        {label: t('Kecha'), value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')]},
        {label: t('Oxirgi 3 kun'), value: [dayjs().subtract(3, 'day').startOf('day'), dayjs()]},
        {label: t('Oxirgi 7 kun'), value: [dayjs().subtract(7, 'day').startOf('day'), dayjs()]},
    ];

    const submitHistory = async () => {
        const [from, to] = range || [];
        if (!from || !to) {
            message.warning(t("Vaqt oralig'ini tanlang"));
            return;
        }
        if (!from.isBefore(to)) {
            message.warning(t("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak"));
            return;
        }
        await onLoadHistory(from.format(API_DATE_FORMAT), to.format(API_DATE_FORMAT));
    };

    const copyImei = () => {
        if (!m.device_id) return;
        navigator.clipboard?.writeText(String(m.device_id))
            .then(() => message.success(t('Nusxalandi')))
            .catch(() => {});
    };

    return (
        <div className="mp-panel vd">
            <div className="vd-bar">
                <Button variant="tertiary-gray" size="sm" iconLeading={<ChevronLeftIcon size={18}/>} onClick={onBack}>
                    {t("Ro'yxat")}
                </Button>
                <div className="vd-bar__actions">
                    <Button variant="tertiary-gray" size="sm" iconOnly iconLeading={<TargetIcon size={18}/>}
                            onClick={onLocate} disabled={!live} aria-label={t("Xaritada ko'rsatish")}
                            title={t("Xaritada ko'rsatish")}/>
                    <Button variant="tertiary-gray" size="sm" iconOnly iconLeading={<RefreshIcon size={18}/>}
                            onClick={onRefresh} aria-label={t('Yangilash')} title={t('Yangilash')}/>
                </div>
            </div>

            <div className="mp-panel__scroll vd-body">
                {/* ---------- hero ---------- */}
                <div className={cx('vd-hero', active && 'is-active')}>
                    <div className="vd-hero__top">
                        <div className="vd-hero__icon">
                            <img src={vehicleIcon(m.type, active)} alt=""/>
                        </div>
                        <div className="vd-hero__text">
                            <p className="vd-hero__name" title={m.display_name}>{m.display_name || '—'}</p>
                            <p className="vd-hero__sub">
                                {m.type ? t(vehicleLabelKey(m.type)) : '—'}
                                {m.vehicle_model && m.vehicle_model !== t(vehicleLabelKey(m.type)) && <> · {m.vehicle_model}</>}
                            </p>
                            <span className={cx('vd-status', active && 'is-active')}>
                                <i/>{active ? t('Faol') : t('Nofaol')}
                            </span>
                        </div>
                    </div>
                    <div className="vd-hero__foot">
                        <ClockIcon size={14}/>
                        <span>{t("Oxirgi ma'lumot")}</span>
                        <b title={updated ? formatDateTime(updated) : ''}>{relativeTime(updated, t)}</b>
                    </div>
                </div>

                {/* ---------- asosiy ko'rsatkichlar: 2×2 ---------- */}
                <div className="vd-kpis">
                    <div className={cx('vd-kpi', speed > 0 && 'is-moving')}>
                        <span className="vd-kpi__label">{t('Tezlik')}</span>
                        <b className="vd-kpi__value">{speed ?? '—'}<small>{t('km/soat')}</small></b>
                        <span className="vd-kpi__bar" aria-hidden="true">
                            <i style={{width: `${Math.min(100, ((speed || 0) / GAUGE_MAX) * 100)}%`}}/>
                        </span>
                    </div>
                    <div className="vd-kpi">
                        <span className="vd-kpi__label">{t('Dvigatel holati')}</span>
                        <b className={cx('vd-kpi__value vd-ign', m.ignition && 'is-on')}>
                            <i/>{m.ignition ? t('yoniq') : t("o'chiq")}
                        </b>
                    </div>
                    <div className="vd-kpi">
                        <span className="vd-kpi__label">{t("Mavjud yoqilg'i")}</span>
                        <b className="vd-kpi__value is-text" title={fuel}>{fuel}</b>
                        {fuelPct !== null && <Meter value={fuelPct} tone={fuelPct < 15 ? 'error' : fuelPct < 35 ? 'warning' : null}/>}
                    </div>
                    <div className="vd-kpi">
                        <span className="vd-kpi__label">{history ? t('Tanlangan oraliqda') : t("Bosib o'tgan masofasi")}</span>
                        <b className="vd-kpi__value">
                            {isSet(distance) ? formatNumber(distance, 1) : '—'}
                            {isSet(distance) && <small>{t('km')}</small>}
                        </b>
                    </div>
                </div>

                <div className="vd-stops">
                    <span className="vd-stop is-short"><i>S</i><span className="vd-stop__text"><b>{formatNumber(stops.short.length)}</b><small>{t("Qisqa to'xtash")}</small></span></span>
                    <span className="vd-stop is-long"><i>P</i><span className="vd-stop__text"><b>{formatNumber(stops.long.length)}</b><small>{t("Uzoq to'xtash")}</small></span></span>
                </div>

                {/* ---------- tabs ---------- */}
                <div className="vd-tabs" role="tablist">
                    <span className={cx('vd-tabs__ink', tab === 'history' && 'is-right')}/>
                    <button type="button" role="tab" aria-selected={tab === 'live'}
                            className={cx('vd-tabs__btn', tab === 'live' && 'is-active')} onClick={() => setTab('live')}>
                        <span className="vd-live-dot"/>{t("Ma'lumotlar")}
                    </button>
                    <button type="button" role="tab" aria-selected={tab === 'history'}
                            className={cx('vd-tabs__btn', tab === 'history' && 'is-active')} onClick={() => setTab('history')}>
                        <ClockIcon size={16}/>{t('Tarix')}
                    </button>
                </div>

                {tab === 'history' ? (
                    <section className="vd-section">
                        <h4 className="vd-section__title"><MapIcon size={16}/>{t('Harakat tarixi')}</h4>
                        <div className="vd-history">
                            <div className="vd-history__form">
                                <span className="vd-history__label">{t("Vaqt oralig'i")}</span>
                                <RangePicker
                                    className="vd-range"
                                    value={range}
                                    onChange={(value) => {
                                        setRange(value);
                                        setPreset(null);
                                    }}
                                    presets={presets}
                                    showTime={{format: 'HH:mm'}}
                                    format="DD.MM.YYYY HH:mm"
                                    disabledDate={d => d && d.isAfter(dayjs().endOf('day'))}
                                    allowClear={false}
                                    placement="bottomLeft"
                                    popupClassName="vd-range-pop"
                                />
                                <div className="vd-chips" role="group" aria-label={t("Vaqt oralig'i")}>
                                    {presets.map(p => (
                                        <button key={p.label} type="button"
                                                className={cx('vd-chip', preset === p.label && 'is-active')}
                                                aria-pressed={preset === p.label}
                                                onClick={() => {
                                                    setRange(p.value);
                                                    setPreset(p.label);
                                                }}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                <Button className="vd-block" iconLeading={<MapIcon size={16}/>}
                                        onClick={submitHistory} loading={historyLoading}>
                                    {t("Yo'lni ko'rsatish")}
                                </Button>
                            </div>

                            {history && (
                                <div className="vd-history__result">
                                    {history.line.length === 0 ? (
                                        <div className="vd-history__empty">
                                            <ClockIcon size={20}/>
                                            <b>{t('Bu oraliqda harakat topilmadi')}</b>
                                            <span>{t("Boshqa vaqt oralig'ini tanlab ko'ring")}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="vd-history__stats">
                                                <div>
                                                    <span>{t("Bosib o'tgan masofasi")}</span>
                                                    <b>{isSet(history.distance) ? `${formatNumber(history.distance, 1)} ${t('km')}` : '—'}</b>
                                                </div>
                                            </div>
                                            <div className="vd-tiles">
                                                <Tile label={t('Oraliq')} wide>
                                                    {`${formatDateTime(history.range?.[0])} — ${formatDateTime(history.range?.[1])}`}
                                                </Tile>
                                                <div className="vd-tile vd-legend">
                                                    <span><i className="vd-legend__pin is-start"><b>A</b></i>{t('Boshlanish')}</span>
                                                    <span><i className="vd-legend__pin is-end"><b>B</b></i>{t('Tugash')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <Button variant="secondary-gray" className="vd-block" onClick={() => {
                                        onCancelHistory();
                                        setTab('live');
                                    }}>
                                        {t('Tarixni yopish')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                ) : loading ? (
                    <section className="vd-section">
                        <div className="vd-tiles">
                            {Array.from({length: 6}).map((_, i) => <div key={i} className="vd-tile vd-skeleton"/>)}
                        </div>
                    </section>
                ) : (
                    <>
                        <Section icon={<InfoIcon size={16}/>} title={t('Avtomobil haqida ma’lumot')}>
                            <Tile label={t('Maxsus raqami')} title={m.display_name}>{show(m.display_name)}</Tile>
                            <Tile label={t('Turi')}>{m.type ? t(vehicleLabelKey(m.type)) : '—'}</Tile>
                            <Tile label={t('Markasi va modeli')} title={m.vehicle_model}>{show(m.vehicle_model)}</Tile>
                            <Tile label={t('Ishlab chiqarilgan yili')}>{show(m.vehicle_manufactured_year)}</Tile>
                            <Tile label={t('Egasi')} title={m.vehicle_driver}>{show(m.vehicle_driver)}</Tile>
                            <Tile label={t('Boshqarma')} title={m.vehicle_department}>{show(m.vehicle_department)}</Tile>
                            {isSet(m.description) && <Tile label={t('Izoh')} wide>{m.description}</Tile>}
                        </Section>

                        <Section icon={<FuelIcon size={16}/>} title={t("Yoqilg'i haqida ma'lumot")}>
                            <Tile label={t("Mavjud yoqilg'i")} title={fuel}>{fuel}</Tile>
                            <Tile label={`${t("Mavjud yoqilg'i")} ${t('(%)')}`}>
                                {fuelPct !== null ? <span className="vd-inline">{fuelPct}%<Meter value={fuelPct}/></span> : '—'}
                            </Tile>
                            <Tile label={`${t("Yoqilg'i sarfi")} (100km)`}>{m.fuel_rate ? `${m.fuel_rate} l` : '—'}</Tile>
                            <Tile label={t('Bak hajmi (litr)')}>{m.tank_capacity ? `${m.tank_capacity} l` : '—'}</Tile>
                        </Section>

                        <Section icon={<DeviceIcon size={16}/>} title={t("GPS haqida ma'lumot")}>
                            <Tile label={t('IMEI')} wide>
                                {m.device_id ? (
                                    <button type="button" className="vd-copy" onClick={copyImei} title={t('Nusxalash')}>
                                        {m.device_id}
                                        <span className="vd-copy__hint">{t('Nusxalash')}</span>
                                    </button>
                                ) : '—'}
                            </Tile>
                            <Tile label={`GSM ${t('Signal')}`}>
                                {gsm === null ? '—' : (
                                    <span className="vd-inline"><SignalBars level={gsm}/>{t(GSM_LABELS[gsm] || "Noto'g'ri signal")}</span>
                                )}
                            </Tile>
                            <Tile label={t('Battery Level')}>
                                {battery === null ? '—' : (
                                    <span className="vd-inline">
                                        {battery}%<Meter value={battery} tone={battery < 20 ? 'error' : battery < 50 ? 'warning' : null}/>
                                    </span>
                                )}
                            </Tile>
                            <Tile label={t('Model')} title={m.model} wide>{show(m.model)}</Tile>
                            <Tile label={t("GPS o'rnatilgan sana")}>{m.created_time ? dayjs(m.created_time).format('DD.MM.YYYY HH:mm') : '—'}</Tile>
                            <Tile label={t('Analog Input 1')}>{show(m.analog_input1)}</Tile>
                            <Tile label={t('Analog Input 2')}>{show(m.analog_input2)}</Tile>
                        </Section>
                    </>
                )}
            </div>
        </div>
    );
};

export default VehicleDetail;
