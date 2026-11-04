import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AttributionControl, MapContainer, Marker, Polyline, Popup, ScaleControl, TileLayer, Tooltip as MapTooltip, useMap} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "./leaflet.css";
import {ConfigProvider, Drawer, Tooltip, message} from "antd";
import axios from "axios";
import {useTranslation} from "react-i18next";
import {useOutletContext} from "react-router-dom";
import {useDispatch} from "react-redux";

import {ip} from "../../../ip";
import api from "../../../service/api";
import {LoginFailure} from "../../../redux/action/action";
import {getAntdTheme} from "../../../theme/antdTheme";
import {useTheme} from '../../../theme/ThemeContext';
import {Button, Checkbox, EmptyState, SearchInput, cx} from "../../../ui/ui";
import PanelLoader from "../../loading/PanelLoader";
import {
    CloseIcon,
    ExpandIcon,
    LayersIcon,
    MapIcon,
    MenuIcon,
    MinusIcon,
    PlusIcon,
    TargetIcon,
} from "../../../ui/icons";
import TrainMarker from "./TrainMarker";
import VehicleDetail from "./VehicleDetail";
import HistoryPlayback from "./HistoryPlayback";
import RouteLine, {TrailLine} from "./RouteLine";
import {JITTER_M, TELEPORT_M, distance, isValidPoint} from "./geo";
import {escapeHtml} from "./html";
import {formatDateTime, relativeTime, vehicleIcon, vehicleLabelKey} from "./vehicleMeta";
import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
    FOLLOW_ZOOM,
    MAX_ZOOM,
    casingColor,
    routeColors,
    tileLayers,
    trailPalette,
} from "./mapStyles";

const POLL_MS = 3000;
const TRAIL_LAG_MS = 250; // iz nuqtasi belgi unga yetib borgandan keyin qo'shilishi uchun zaxira
const DETAIL_REFRESH_MS = 15000;
const SEARCH_DEBOUNCE_MS = 400;
const MOBILE_MAX = 900;
const PLATE_ZOOM = 17;
const TRAIL_LENGTH = 60;

/* Klaster: zich joylashuvda nishonlar bitta doiraga yig'iladi.
   Yaqinlashganda (17+) guruhlash o'chadi — har bir transport alohida ko'rinsin. */
const CLUSTER_MAX_RADIUS = 64;
const CLUSTER_OFF_ZOOM = 17;

const clusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 'sm' : count < 50 ? 'md' : 'lg';
    const px = {sm: 32, md: 40, lg: 48}[size];
    return L.divIcon({
        html: `<span class="gps-cluster gps-cluster--${escapeHtml(size)}">${Number(count) || 0}</span>`,
        className: 'gps-cluster-wrap',
        iconSize: L.point(px, px, true),
    });
};

const pinIcon = (label, kind) => L.divIcon({
    className: 'gps-pin-wrap',
    html: `<span class="mp-pin ${escapeHtml(kind)}">${escapeHtml(label)}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const STOP_ICONS = {short: pinIcon('S', 'is-short'), long: pinIcon('P', 'is-long')};
const START_ICON = pinIcon('A', 'is-start');
const END_ICON = pinIcon('B', 'is-end');

const playheadIcon = L.divIcon({
    className: 'gps-playhead-wrap',
    html: '<span class="gps-playhead"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

const toPoint = (c) => [+c?.[0], +c?.[1]];

/** O'zgarmagan transport obyektini saqlab qoladi — marker qayta chizilmaydi. */
const mergeMarkers = (prev, next) => {
    const byId = new Map(prev.map(m => [m.device_id, m]));
    return next.map(n => {
        const old = byId.get(n.device_id);
        if (!old) return n;
        const samePos = old.coordinate?.[0] === n.coordinate?.[0] && old.coordinate?.[1] === n.coordinate?.[1];
        if (samePos && old.angle === n.angle && old.active === n.active && old.speed === n.speed && old.date_time === n.date_time) {
            return old;
        }
        return samePos ? {...n, coordinate: old.coordinate} : n;
    });
};

/** Xarita nusxasini tashqariga beradi va haqiqiy masshtabni kuzatadi. */
const MapBridge = ({mapRef, onReady, onZoomChange}) => {
    const map = useMap();
    useEffect(() => {
        mapRef.current = map;
        onReady(true);
        const report = () => onZoomChange(map.getZoom());
        report();
        map.on('zoomend', report);
        return () => {
            map.off('zoomend', report);
            mapRef.current = null;
            onReady(false);
        };
    }, [map, mapRef, onReady, onZoomChange]);
    return null;
};

const MapControl = ({active, title, onClick, children}) => (
    <Tooltip title={title} placement="left">
        <button type="button" onClick={onClick} className={cx('mp-ctrl', active && 'is-active')} aria-label={title}>
            {children}
        </button>
    </Tooltip>
);

const GoogleMapTrain = () => {
    const {t} = useTranslation();
    const {theme} = useTheme();
    const antdTheme = useMemo(() => getAntdTheme(theme), [theme]);
    const dispatch = useDispatch();
    const {filterTransPort, setFilterTransport} = useOutletContext();

    const mapRef = useRef(null);
    const mapWrapRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [satellite, setSatellite] = useState(false);
    const [showTrails, setShowTrails] = useState(true);
    const [followSelected, setFollowSelected] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_MAX);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const tiles = tileLayers(theme, {satellite});
    const lineCasing = casingColor(theme, {satellite});

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= MOBILE_MAX);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleAuthError = useCallback((err) => {
        if (err?.response?.status === 401) {
            dispatch(LoginFailure());
            return true;
        }
        return false;
    }, [dispatch]);

    /* ---------------- vehicles (live polling) ---------------- */
    const [markers, setMarkers] = useState([]);
    const [trails, setTrails] = useState({});
    const [firstLoad, setFirstLoad] = useState(true);
    const [total, setTotal] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const markersRef = useRef(markers);
    markersRef.current = markers;
    const trailsRef = useRef(trails);
    trailsRef.current = trails;
    const headRefs = useRef({});   // device_id -> iz oxiridan belgigacha chiziq (Leaflet Polyline)
    const headPos = useRef({});    // device_id -> belgining hozirgi (animatsiyadagi) o'rni
    const onVehicleMove = useCallback((id, pos) => {
        headPos.current[id] = pos;
        const line = headRefs.current[id];
        const track = trailsRef.current[id];
        if (line && track?.length) line.setLatLngs([track[track.length - 1].p, pos]);
    }, []);
    const fitPendingRef = useRef(true);

    useEffect(() => {
        let cancelled = false;
        let timer = null;
        let controller = null;
        const trailTimers = new Set();

        // keyingi so'rov oldingisi tugagandan keyin ketadi; filtr o'zgarsa eskisi bekor qilinadi
        const tick = async () => {
            if (document.hidden) {
                timer = setTimeout(tick, POLL_MS);
                return;
            }
            controller = new AbortController();
            try {
                const {data} = await api({url: "/api/events", method: "post", data: filterTransPort, signal: controller.signal});
                if (cancelled) return;
                const list = Array.isArray(data?.data) ? data.data.filter(m => isValidPoint(toPoint(m.coordinate))) : [];
                setMarkers(prev => mergeMarkers(prev, list));
                const unfiltered = (filterTransPort.status || 'all') === 'all'
                    && !filterTransPort.searched_data && !filterTransPort.filter?.length;
                if (unfiltered) {
                    setTotal(+data?.count || list.length);
                    setActiveCount(+data?.active_count || list.filter(v => v.active).length);
                }

                // Har transportning yurgan izi. GPS titrashi (JITTER_M dan kichik) va
                // aloqa uzilishidan keyingi sakrashlar izga qo'shilmaydi.
                // Belgi yangi nuqtaga silliq (POLL_MS ichida) yetib boradi — iz ham shu payt uzayadi,
                // aks holda chiziq belgidan oldinga o'tib ketadi.
                // Animatsiya render'dan keyin boshlanadi — kichik zaxira bilan nuqta belgi o'tib bo'lgach qo'shiladi.
                const trailTimer = setTimeout(() => {
                    trailTimers.delete(trailTimer);
                    if (!cancelled) setTrails(prev => {
                        const updated = {...prev};
                        list.forEach(v => {
                            const point = toPoint(v.coordinate);
                            const track = updated[v.device_id] || [];
                            const last = track[track.length - 1];
                            const next = {p: point, s: v.speed || 0};
                            if (last) {
                                const moved = distance(last.p, point);
                                if (moved < JITTER_M) return;
                                if (moved > TELEPORT_M) {
                                    updated[v.device_id] = [next];
                                    return;
                                }
                            }
                            updated[v.device_id] = [...track, next].slice(-TRAIL_LENGTH);
                        });
                        return updated;
                    });
                }, POLL_MS + TRAIL_LAG_MS);
                trailTimers.add(trailTimer);
            } catch (err) {
                if (cancelled || axios.isCancel(err)) return;
                handleAuthError(err);
            } finally {
                if (!cancelled) {
                    setFirstLoad(false);
                    timer = setTimeout(tick, POLL_MS);
                }
            }
        };

        tick();
        const onVisible = () => {
            if (!document.hidden) {
                clearTimeout(timer);
                tick();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            cancelled = true;
            clearTimeout(timer);
            trailTimers.forEach(clearTimeout);
            controller?.abort();
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [filterTransPort, handleAuthError]);

    /* ---------------- search / filters ---------------- */
    const [searchText, setSearchText] = useState(filterTransPort.searched_data || '');
    const [checkedList, setCheckedList] = useState([]);
    const statusFilter = filterTransPort.status || 'all';

    useEffect(() => {
        const id = setTimeout(() => {
            if ((filterTransPort.searched_data || '') === searchText) return;
            fitPendingRef.current = true;
            setFilterTransport(prev => ({...prev, searched_data: searchText}));
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [searchText, filterTransPort.searched_data, setFilterTransport]);

    const onChangeStatus = (status) => {
        if (status === statusFilter) return;
        fitPendingRef.current = true;
        setFilterTransport(prev => ({...prev, status}));
    };

    const toggleChecked = (name) =>
        setCheckedList(list => (list.includes(name) ? list.filter(n => n !== name) : [...list, name]));

    /* ---------------- map helpers ---------------- */
    /* overPlayer — pastda tarix pleyeri chiqadi: yo'l uning va o'ngdagi tugmalar ostida qolmasin */
    const fitTo = useCallback((points, maxZoom = FOLLOW_ZOOM, {overPlayer = false} = {}) => {
        const map = mapRef.current;
        const valid = points.filter(isValidPoint);
        if (!map || !valid.length) return;
        if (valid.length === 1) {
            map.setView(valid[0], Math.max(map.getZoom(), maxZoom), {animate: true});
            return;
        }
        if (!overPlayer) {
            map.fitBounds(L.latLngBounds(valid), {padding: [48, 48], maxZoom});
            return;
        }
        const mobile = window.innerWidth <= MOBILE_MAX;
        map.fitBounds(L.latLngBounds(valid), {
            paddingTopLeft: [mobile ? 24 : 48, mobile ? 32 : 48],
            paddingBottomRight: [mobile ? 72 : 80, mobile ? 200 : 140],
            maxZoom,
        });
    }, []);

    useEffect(() => {
        if (!fitPendingRef.current || !mapReady || !markers.length) return;
        fitPendingRef.current = false;
        fitTo(markers.map(m => toPoint(m.coordinate)));
    }, [markers, mapReady, fitTo]);

    const zoomBy = (step) => {
        const map = mapRef.current;
        if (map) map.setZoom(Math.min(Math.max(map.getZoom() + step, 3), MAX_ZOOM));
    };

    const toggleFullscreen = () => {
        const node = mapWrapRef.current;
        if (!node) return;
        if (document.fullscreenElement) document.exitFullscreen?.();
        else node.requestFullscreen?.();
        // Leaflet o'lchamni o'zi qayta hisoblamaydi
        setTimeout(() => mapRef.current?.invalidateSize(), 250);
    };

    /* ---------------- selected vehicle ---------------- */
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [stops, setStops] = useState({short: [], long: []});
    const [history, setHistory] = useState(null); // {line, distance, range}
    const [historyLoading, setHistoryLoading] = useState(false);
    const [playIndex, setPlayIndex] = useState(0);
    const [hoveredLine, setHoveredLine] = useState(null);
    const detailReqRef = useRef(0);
    const historyRef = useRef(history);
    historyRef.current = history;

    const liveVehicle = useMemo(
        () => markers.find(m => m.device_id === selectedId) || null,
        [markers, selectedId]
    );

    const loadDetail = useCallback((id, {silent = false} = {}) => {
        if (!id) return;
        const req = ++detailReqRef.current;
        if (!silent) setDetailLoading(true);
        axios.get(`${ip}/api/events/${id}`, {headers: authHeaders()})
            .then(res => {
                if (req !== detailReqRef.current) return; // yangiroq so'rov bor
                const item = res?.data?.data?.[0] || null;
                setDetail(item);
                if (!historyRef.current) setStops({short: item?.short_stops || [], long: item?.long_stops || []});
            })
            .catch(err => {
                if (req !== detailReqRef.current || handleAuthError(err)) return;
                if (!silent) message.error(err?.response?.data?.msg || t('Xatolik yuz berdi'));
            })
            .finally(() => {
                if (req === detailReqRef.current) setDetailLoading(false);
            });
    }, [handleAuthError, t]);

    const onSelectVehicle = useCallback((id) => {
        setSelectedId(id);
        setDetail(null);
        setHistory(null);
        setPlayIndex(0);
        setStops({short: [], long: []});
        loadDetail(id);
        const m = markersRef.current.find(x => x.device_id === id);
        if (m && mapRef.current) {
            mapRef.current.setView(toPoint(m.coordinate), Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM), {animate: true});
        }
        if (window.innerWidth <= MOBILE_MAX) setDrawerOpen(true);
    }, [loadDetail]);

    const backToList = () => {
        detailReqRef.current++;
        setSelectedId(null);
        setDetail(null);
        setHistory(null);
        setPlayIndex(0);
        setStops({short: [], long: []});
        setDetailLoading(false);
    };

    // Kuzatib borish: tanlangan transport yangi joyga o'tsa, xarita ergashadi
    useEffect(() => {
        if (!followSelected || !liveVehicle || history || !mapRef.current) return;
        mapRef.current.panTo(toPoint(liveVehicle.coordinate), {animate: true, duration: 0.4});
    }, [followSelected, liveVehicle, history]);

    // Jonli kuzatishda tafsilotlar fonda yangilanib turadi
    useEffect(() => {
        if (!selectedId || history) return undefined;
        const id = setInterval(() => !document.hidden && loadDetail(selectedId, {silent: true}), DETAIL_REFRESH_MS);
        return () => clearInterval(id);
    }, [selectedId, history, loadDetail]);

    const applySearch = () => {
        fitPendingRef.current = true;
        setFilterTransport(prev => ({...prev, filter: checkedList}));
        backToList();
        if (isMobile) setDrawerOpen(false);
    };

    const resetFilters = () => {
        fitPendingRef.current = true;
        setSearchText('');
        setCheckedList([]);
        setFilterTransport(prev => ({...prev, filter: [], status: 'all', searched_data: ''}));
        backToList();
    };

    const loadHistory = async (fromDate, toDate) => {
        setHistoryLoading(true);
        try {
            const res = await axios.get(`${ip}/api/log-data-history`, {
                params: {deviceId: selectedId, fromDate, toDate},
                headers: authHeaders(),
            });
            const line = (res?.data?.data || []).map(toPoint).filter(isValidPoint);
            setHistory({line, distance: res?.data?.distance, range: [fromDate, toDate]});
            setPlayIndex(0);
            setStops({short: res?.data?.short_stops || [], long: res?.data?.long_stops || []});
            // bo'sh natija xabari chap panelda ko'rsatiladi
            if (line.length) {
                // telefonda panel yopiladi — yo'l xaritada darhol ko'rinadi
                if (isMobile) setDrawerOpen(false);
                fitTo(line, FOLLOW_ZOOM, {overPlayer: true});
            }
            return true;
        } catch (err) {
            if (!handleAuthError(err)) message.error(err?.response?.data?.msg || t('Xatolik yuz berdi'));
            return false;
        } finally {
            setHistoryLoading(false);
        }
    };

    const cancelHistory = () => {
        setHistory(null);
        setPlayIndex(0);
        setHoveredLine(null);
        setStops({short: detail?.short_stops || [], long: detail?.long_stops || []});
        if (liveVehicle) mapRef.current?.panTo(toPoint(liveVehicle.coordinate));
    };

    /* ---------------- render ---------------- */
    const liveRoute = useMemo(
        () => (!history && Array.isArray(detail?.route) ? detail.route.map(toPoint).filter(isValidPoint) : []),
        [detail, history]
    );

    const allStops = [
        ...stops.short.map(s => ({...s, kind: 'short'})),
        ...stops.long.map(s => ({...s, kind: 'long'})),
    ].filter(s => isValidPoint(toPoint(s.coordinate)));

    /* Chiziq ustida sichqoncha yurganda bosib o'tilgan masofa ko'rsatiladi */
    const lineHandlers = useMemo(() => ({
        mousemove: (e) => setHoveredLine([e.latlng.lat, e.latlng.lng]),
        mouseout: () => setHoveredLine(null),
    }), []);

    const shownDistance = history ? history.distance : detail?.distance;

    const inactiveCount = Math.max(0, total - activeCount);
    const pinned = filterTransPort.filter || [];
    const hasFilters = !!searchText || statusFilter !== 'all' || pinned.length > 0;
    const now = Date.now();

    const listPanel = (
        <div className="mp-panel">
            <div className="ls-head">
                <div className="ls-title">
                    <div>
                        <h2>{t("Transportlar")}</h2>
                        <span className="ls-live"><i/>{t("Jonli kuzatuv")}</span>
                    </div>
                    <span className="ls-count">{markers.length}</span>
                </div>

                <div className="ls-stats" role="tablist" aria-label={t('Filtr')}>
                    {[
                        {key: 'all', label: t('Barchasi'), value: total},
                        {key: 'active', label: t('Faol'), value: activeCount},
                        {key: 'inactive', label: t('Nofaol'), value: inactiveCount},
                    ].map(s => (
                        <button
                            key={s.key}
                            type="button"
                            role="tab"
                            aria-selected={statusFilter === s.key}
                            className={cx('ls-stat', `is-${s.key}`, statusFilter === s.key && 'is-selected')}
                            onClick={() => onChangeStatus(s.key)}
                        >
                            <span className="ls-stat__label">{s.key !== 'all' && <i/>}{s.label}</span>
                            <strong>{s.value}</strong>
                        </button>
                    ))}
                </div>

                <div className="ls-search">
                    <SearchInput
                        value={searchText}
                        placeholder={t("Raqam yoki nom bo'yicha izlash")}
                        onChange={(e) => setSearchText(e.currentTarget.value)}
                    />
                    {searchText && (
                        <button type="button" className="ls-search__clear" onClick={() => setSearchText('')}
                                aria-label={t('Tozalash')}>
                            <CloseIcon size={14}/>
                        </button>
                    )}
                </div>

                {pinned.length > 0 && (
                    <div className="ls-pinned">
                        <span>{t("Faqat tanlangan {{n}} ta transport", {n: pinned.length})}</span>
                        <button type="button" onClick={() => {
                            fitPendingRef.current = true;
                            setFilterTransport(prev => ({...prev, filter: []}));
                        }}>
                            {t('Hammasi')}
                        </button>
                    </div>
                )}
            </div>

            <div className="mp-panel__list ls-list">
                {firstLoad ? (
                    Array.from({length: 6}).map((_, i) => <div key={i} className="ls-skeleton"/>)
                ) : markers.length === 0 ? (
                    <EmptyState
                        title={t("Transport topilmadi")}
                        icon={<MapIcon size={26}/>}
                        action={hasFilters && (
                            <Button variant="secondary-gray" size="sm" onClick={resetFilters}>
                                {t('Filtrlarni tozalash')}
                            </Button>
                        )}
                    />
                ) : (
                    markers.map(item => {
                        const checked = checkedList.includes(item.display_name);
                        const moving = item.active && item.speed > 0;
                        return (
                            <div
                                key={item.device_id}
                                className={cx(
                                    'ls-row',
                                    selectedId === item.device_id && 'is-selected',
                                    checked && 'is-checked',
                                    checkedList.length > 0 && 'is-selecting'
                                )}
                            >
                                <button type="button" className="ls-row__main" onClick={() => onSelectVehicle(item.device_id)}>
                                    <span className={cx('ls-row__icon', item.active && 'is-active')}>
                                        <img src={vehicleIcon(item.type, item.active)} alt=""/>
                                        <i className="ls-row__dot"/>
                                    </span>
                                    <span className="ls-row__text">
                                        <span className="ls-row__name">{item.display_name}</span>
                                        <span className="ls-row__sub">
                                            {t(vehicleLabelKey(item.type))}
                                            {item.date_time && <> · {relativeTime(item.date_time, t, now)}</>}
                                        </span>
                                    </span>
                                    {moving ? (
                                        <span className="ls-row__speed">
                                            {Math.round(item.speed)}<small>{t('km/soat')}</small>
                                        </span>
                                    ) : (
                                        <span className={cx('ls-row__state', item.active && 'is-active')}>
                                            {item.active ? t("To'xtagan") : t('Nofaol')}
                                        </span>
                                    )}
                                </button>
                                <span className="ls-row__check">
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleChecked(item.display_name)}
                                        aria-label={item.display_name}
                                    />
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {checkedList.length > 0 && (
                <div className="ls-selection" role="region" aria-live="polite">
                    <span className="ls-selection__count">{checkedList.length}</span>
                    <span className="ls-selection__text">
                        <b>{t("{{n}} ta tanlandi", {n: checkedList.length})}</b>
                        <small>{t('Xaritada faqat shular')}</small>
                    </span>
                    <Button variant="secondary-gray" size="sm" iconOnly iconLeading={<CloseIcon size={16}/>}
                            className="ls-selection__cancel"
                            onClick={() => setCheckedList([])} aria-label={t('Bekor qilish')} title={t('Bekor qilish')}/>
                    <Button size="sm" iconLeading={<MapIcon size={16}/>} onClick={applySearch}>
                        {t("Ko'rsatish")}
                    </Button>
                </div>
            )}
        </div>
    );

    const panelContent = selectedId ? (
        <VehicleDetail
            key={selectedId}
            detail={detail}
            live={liveVehicle}
            stops={stops}
            history={history}
            historyLoading={historyLoading}
            onBack={backToList}
            onRefresh={() => (history ? cancelHistory() : loadDetail(selectedId))}
            onLocate={() => liveVehicle && fitTo([toPoint(liveVehicle.coordinate)], FOLLOW_ZOOM)}
            onLoadHistory={loadHistory}
            onCancelHistory={cancelHistory}
        />
    ) : listPanel;

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="mp">
                {!isMobile && <aside className="mp-aside">{panelContent}</aside>}

                <div className="mp-map" ref={mapWrapRef}>
                    <PanelLoader show={detailLoading || historyLoading}/>

                    {isMobile && (
                        <button type="button" className="mp-fab" onClick={() => setDrawerOpen(true)} aria-label={t("Ro'yxat")}>
                            <MenuIcon size={22}/>
                        </button>
                    )}

                    <div className="mp-controls">
                        <MapControl title={t('Kattalashtirish')} onClick={() => zoomBy(1)}>
                            <PlusIcon size={20}/>
                        </MapControl>
                        <MapControl title={t('Kichraytirish')} onClick={() => zoomBy(-1)}>
                            <MinusIcon size={20}/>
                        </MapControl>
                        <MapControl active={satellite} title={t("Sun'iy yo'ldosh")} onClick={() => setSatellite(s => !s)}>
                            <LayersIcon size={20}/>
                        </MapControl>
                        <MapControl active={showTrails} title={t('Yurgan izi')} onClick={() => setShowTrails(s => !s)}>
                            <MapIcon size={20}/>
                        </MapControl>
                        <MapControl active={followSelected} title={t('Kuzatib borish')} onClick={() => setFollowSelected(f => !f)}>
                            <TargetIcon size={20}/>
                        </MapControl>
                        <MapControl title={t("To'liq ekran")} onClick={toggleFullscreen}>
                            <ExpandIcon size={20}/>
                        </MapControl>
                    </div>

                    {history?.line?.length > 1 && (
                        <HistoryPlayback
                            points={history.line}
                            index={playIndex}
                            onIndexChange={setPlayIndex}
                            onClose={cancelHistory}
                        />
                    )}

                    <MapContainer
                        center={DEFAULT_CENTER}
                        zoom={DEFAULT_ZOOM}
                        maxZoom={MAX_ZOOM}
                        zoomControl={false}
                        attributionControl={false}
                        className="mp-map__canvas"
                    >
                        {/* prefix={false} — "Leaflet" brendi olib tashlanadi; plitka atribusiyasi (litsenziya) qoladi */}
                        <AttributionControl position="bottomright" prefix={false}/>
                        <ScaleControl position="bottomleft" imperial={false}/>

                        {tiles.map(layer => (
                            <TileLayer
                                key={layer.url}
                                url={layer.url}
                                attribution={layer.attribution}
                                maxZoom={MAX_ZOOM}
                                maxNativeZoom={layer.maxNativeZoom}
                                zIndex={layer.overlay ? 2 : 1}
                            />
                        ))}

                        <MapBridge mapRef={mapRef} onReady={setMapReady} onZoomChange={setZoom}/>

                        {showTrails && markers.map(vehicle => {
                            const track = trails[vehicle.device_id];
                            if (!track || track.length < 2) return null;
                            const isSelected = selectedId === vehicle.device_id;
                            const tail = track[track.length - 1];
                            const speed = vehicle.speed || 0;
                            return (
                                <React.Fragment key={`trail-${vehicle.device_id}`}>
                                    <TrailLine
                                        points={track}
                                        palette={trailPalette}
                                        casing={lineCasing}
                                        weight={isSelected ? 5 : 3}
                                        arrows={isSelected}
                                    />
                                    {/* iz oxiridan belgi turgan joygacha */}
                                    <Polyline
                                        ref={(el) => {
                                            if (el) headRefs.current[vehicle.device_id] = el;
                                            else delete headRefs.current[vehicle.device_id];
                                        }}
                                        positions={[tail.p, headPos.current[vehicle.device_id] || tail.p]}
                                        pathOptions={{
                                            color: speed < 5 ? trailPalette.slow : speed < 30 ? trailPalette.normal : trailPalette.fast,
                                            weight: isSelected ? 5 : 3,
                                            opacity: 0.9,
                                            lineCap: 'round',
                                            lineJoin: 'round',
                                        }}
                                        interactive={false}
                                    />
                                </React.Fragment>
                            );
                        })}

                        {history?.line?.length > 0 && (
                            <>
                                {/* to'liq yo'l — susaytirilgan */}
                                <RouteLine
                                    positions={history.line}
                                    color={routeColors.history}
                                    casing={lineCasing}
                                    weight={3}
                                    arrows={false}
                                    eventHandlers={lineHandlers}
                                />
                                {/* o'ynatilgan qismi — to'yingan, strelkalari bilan */}
                                <RouteLine
                                    positions={history.line.slice(0, playIndex + 1)}
                                    color={routeColors.history}
                                    casing={lineCasing}
                                    weight={5}
                                    eventHandlers={lineHandlers}
                                />
                                <Marker position={history.line[0]} icon={START_ICON} interactive={false} keyboard={false}/>
                                <Marker position={history.line[history.line.length - 1]} icon={END_ICON} interactive={false} keyboard={false}/>
                                {history.line[playIndex] && (
                                    <Marker position={history.line[playIndex]} icon={playheadIcon} interactive={false} keyboard={false}/>
                                )}
                            </>
                        )}

                        {liveRoute.length > 1 && (
                            <RouteLine
                                positions={liveRoute}
                                color={routeColors.live}
                                casing={lineCasing}
                                eventHandlers={lineHandlers}
                            />
                        )}

                        {hoveredLine && (
                            <Popup position={hoveredLine} autoPan={false} closeButton={false}>
                                <span className="gps-popup-text">
                                    {t("Bosib o'tgan masofasi")}: {shownDistance || 0} {t('km')}
                                </span>
                            </Popup>
                        )}

                        {allStops.map((s, i) => (
                            <Marker key={`${s.kind}-${i}`} position={toPoint(s.coordinate)} icon={STOP_ICONS[s.kind]}>
                                <MapTooltip direction="top" offset={[0, -14]} className="gps-tooltip gps-tooltip--card" opacity={1}>
                                    <span className={`gps-stop-tip is-${s.kind}`}>
                                        <span className="gps-stop-tip__head">
                                            <i>{s.kind === 'short' ? 'S' : 'P'}</i>
                                            {s.kind === 'short' ? t("Qisqa to'xtash") : t("Uzoq to'xtash")}
                                        </span>
                                        <span className="gps-stop-tip__duration">
                                            <small>{t("Davomiyligi")}</small>
                                            <b>{s.stop_duration || '—'}</b>
                                        </span>
                                        <span className="gps-stop-tip__row">
                                            <small>{t("Boshlanish")}</small>{formatDateTime(s.stop_start_time)}
                                        </span>
                                        <span className="gps-stop-tip__row">
                                            <small>{t("Tugash")}</small>{formatDateTime(s.stop_end_time)}
                                        </span>
                                    </span>
                                </MapTooltip>
                            </Marker>
                        ))}

                        <MarkerClusterGroup
                            iconCreateFunction={clusterIcon}
                            maxClusterRadius={CLUSTER_MAX_RADIUS}
                            disableClusteringAtZoom={CLUSTER_OFF_ZOOM}
                            spiderfyOnMaxZoom={false}
                            showCoverageOnHover={false}
                            zoomToBoundsOnClick
                            chunkedLoading
                        >
                            {markers.map(car => (
                                <TrainMarker
                                    key={car.device_id}
                                    car={car}
                                    selected={selectedId === car.device_id}
                                    onSelect={onSelectVehicle}
                                    pollInterval={POLL_MS}
                                    onMove={onVehicleMove}
                                    showPlate={zoom >= PLATE_ZOOM}
                                />
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>
                </div>

                <Drawer
                    placement="bottom"
                    height="78vh"
                    zIndex={1100} /* xarita tugmalari (1010–1020) panel ustida qolmasin */
                    rootClassName="mp-sheet"
                    open={isMobile && drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    closeIcon={<CloseIcon size={20}/>}
                    styles={{body: {padding: 0}}}
                >
                    <div className="mp-drawer">{panelContent}</div>
                </Drawer>
            </div>
        </ConfigProvider>
    );
};

export default GoogleMapTrain;
