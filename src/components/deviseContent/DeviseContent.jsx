import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import moment from 'moment';
import axios from 'axios';
import {ConfigProvider, Table, Tooltip, message} from 'antd';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {LoginFailure} from '../../redux/action/action';
import {getAntdTheme} from '../../theme/antdTheme';
import {useTheme} from '../../theme/ThemeContext';
import {VEHICLE_TYPES, vehicleLabelKey} from '../maps/newVersion/vehicleMeta';
import DeviceFormDrawer, {EMPTY_DEVICE} from './DeviceFormDrawer';
import DeviceDetails from './DeviceDetails';

import {Badge, Button, EmptyState, SearchInput} from '../../ui/ui';
import useMediaQuery from '../../ui/useMediaQuery';
import PanelLoader from '../loading/PanelLoader';
import {ConfirmDialog, FilterChip, Pagination, Select} from '../../ui/controls';
import {DeviceIcon, EditIcon, PlusIcon, RefreshIcon, TrashIcon} from '../../ui/icons';

import './devices.css';


/* ============================================================================
   Qurilmalar — GPS qurilmalari va ularga biriktirilgan transport
   (SoftData-AirPort-GPS features/devices/DevicesPage.jsx bilan bir xil).

   Backend faqat `searched_data` bo'yicha filtrlaydi (tur/boshqarma parametrlari
   e'tiborga olinmaydi), shuning uchun ro'yxat bir marta to'liq olinadi va
   qidiruv/filtr/sahifalash mijozda bajariladi — natija aniq bo'ladi.
   Park bir necha mingtaga yetsa, buni server tomoniga ko'chirish kerak.
   ========================================================================== */

const FETCH_LIMIT = 2000;
/* ustunlar kengligi yig'indisi — undan tor ekranda jadval gorizontal aylanadi */
const TABLE_MIN_WIDTH = 1434;
const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

const DeviseContent = () => {
    const {t} = useTranslation();
    const {theme} = useTheme();
    const antdTheme = useMemo(() => getAntdTheme(theme), [theme]);
    const dispatch = useDispatch();
    const isMobile = useMediaQuery();

    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [department, setDepartment] = useState('');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(EMPTY_DEVICE);

    const [detail, setDetail] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* Jadval qolgan butun balandlikni egallaydi: tanasi o'lchanadi va antd'ga
       scroll.y sifatida beriladi — sarlavha qatori joyida qoladi, qatorlar aylanadi. */
    const bodyRef = useRef(null);
    const [scrollY, setScrollY] = useState(undefined);

    // Qatorlar sig'sa aylantirish umuman yoqilmaydi (aks holda kasr piksel tufayli
    // bo'sh aylantirish chizig'i chiqadi); sig'masa — tana shu balandlikda aylanadi.
    const measure = useCallback(() => {
        const node = bodyRef.current;
        if (!node) return;
        const head = node.querySelector('.ant-table-thead')?.offsetHeight || 46;
        const rowsHeight = node.querySelector('.ant-table-tbody')?.offsetHeight || 0;
        const available = Math.max(Math.floor(node.clientHeight - head), 120);
        setScrollY(rowsHeight > available ? available : undefined);
    }, []);

    useEffect(() => {
        const node = bodyRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        // o'lchash keyingi kadrda — aks holda "ResizeObserver loop" xatosi chiqadi
        let frame = 0;
        const observer = new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        });
        observer.observe(node);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [measure]);

    const onAuthError = useCallback((error) => {
        if (error?.response?.status === 401) dispatch(LoginFailure());
    }, [dispatch]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${ip}/api/device/${FETCH_LIMIT}/1`, {headers: authHeaders()});
            setAll(data?.data || []);
        } catch (error) {
            onAuthError(error);
            message.error(error?.response?.data?.msg || t('Xatolik yuz berdi'));
            setAll([]);
        } finally {
            setLoading(false);
        }
    }, [t, onAuthError]);

    useEffect(() => {
        load();
    }, [load]);

    /* Ro'yxatda uchraydigan boshqarmalar — filtr uchun */
    const departments = useMemo(() => {
        const set = new Set(all.map((item) => item.vehicle_department).filter(Boolean));
        return [...set].sort();
    }, [all]);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return all.filter((item) => {
            if (type && item.type !== type) return false;
            if (department && item.vehicle_department !== department) return false;
            if (!needle) return true;

            return [
                item.id, item.display_name, item.description,
                item.phone_number, item.vehicle_driver, item.vehicle_model,
            ].some((field) => String(field ?? '').toLowerCase().includes(needle));
        });
    }, [all, search, type, department]);

    /* Filtr o'zgarganda birinchi sahifaga qaytamiz */
    useEffect(() => {
        setPage(1);
    }, [search, type, department]);

    useEffect(() => {
        const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
        if (page > lastPage) setPage(lastPage);
    }, [filtered.length, pageSize, page]);

    const rows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize).map((item, index) => ({
            ...item,
            key: item.id ?? start + index,
            order: start + index + 1,
        }));
    }, [filtered, page, pageSize]);

    useEffect(() => {
        // y-scroll o'chiq holatda qatorlar tabiiy balandlikda chiziladi — keyin o'lchanadi
        const id = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(id);
    }, [rows, loading, measure]);

    const removeDevice = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${ip}/api/device/${deleteId}`, {headers: authHeaders()});
            message.success(t("Muvaffaqiyatli o'chirildi"));
            setDeleteId(null);
            setDetail(null);
            load();
        } catch (error) {
            onAuthError(error);
            message.error(error?.response?.data?.msg || t('Xatolik yuz berdi'));
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (record) => {
        setDetail(null);
        setEditing({...record, edit: true});
        setFormOpen(true);
    };

    const filtersActive = Boolean(search || type || department);

    const columns = [
        {
            title: t('T/r'),
            dataIndex: 'order',
            key: 'order',
            width: 64,
            render: (value) => <span className="dv-muted">{value}</span>,
        },
        {
            title: t('Maxsus raqami'),
            dataIndex: 'display_name',
            key: 'display_name',
            width: 260,
            render: (value, record) => (
                <button type="button" onClick={() => setDetail(record)} className="dv-name"
                        title={[value, record.description].filter(Boolean).join(' — ')}>
                    <span className="dv-name__title">{value || '—'}</span>
                    {record.description && <span className="dv-name__sub">{record.description}</span>}
                </button>
            ),
        },
        {
            title: t('Avtomobil turi'),
            dataIndex: 'type',
            key: 'type',
            width: 170,
            render: (value) => <Badge color="gray">{t(vehicleLabelKey(value)) || value || '—'}</Badge>,
        },
        {
            title: t('Boshqarma'),
            dataIndex: 'vehicle_department',
            key: 'vehicle_department',
            width: 170,
            ellipsis: true,
            render: (value) => value || '—',
        },
        {title: t('IMEI'), dataIndex: 'id', key: 'id', width: 190, ellipsis: true},
        {
            title: t('Telefon raqami'),
            dataIndex: 'phone_number',
            key: 'phone_number',
            width: 170,
            ellipsis: true,
            render: (value) => value || '—',
        },
        {
            title: t('Maksimal tezlik'),
            dataIndex: 'limit_speed',
            key: 'limit_speed',
            width: 150,
            align: 'center',
            render: (value) => (
                value ? <Badge color={value > 60 ? 'warning' : 'gray'}>{value} {t('km/soat')}</Badge> : '—'
            ),
        },
        {
            title: t('Yaratilgan vaqti'),
            dataIndex: 'created_time',
            key: 'created_time',
            width: 140,
            render: (value) => (value ? moment(value).format('DD.MM.YYYY') : '—'),
        },
        {
            title: t('Amallar'),
            key: 'actions',
            align: 'right',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <div className="dv-actions">
                    <Tooltip title={t('Tahrirlash')} mouseEnterDelay={0.4}>
                        <button type="button" className="dv-action dv-action--edit"
                                onClick={() => openEdit(record)} aria-label={t('Tahrirlash')}>
                            <EditIcon size={16}/>
                        </button>
                    </Tooltip>
                    <Tooltip title={t("O'chirish")} mouseEnterDelay={0.4}>
                        <button type="button" className="dv-action dv-action--delete"
                                onClick={() => setDeleteId(record?.id)} aria-label={t("O'chirish")}>
                            <TrashIcon size={16}/>
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    /* telefon: faqat asosiy ustunlar, qolgani qator bosilganda ochiladigan tafsilotlarda */
    const MOBILE_WIDTHS = {display_name: undefined, type: 104, actions: 84};
    const mobileColumns = columns
        .filter((col) => ['display_name','type','actions'].includes(col.key))
        .map((col) => ({...col, width: MOBILE_WIDTHS[col.key], fixed: undefined}));

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="dv">
                <div className="dv-header">
                    <div className="dv-header__text">
                        <h1>{t('Qurilmalar')}</h1>
                        <p>{t('GPS qurilmalari va ularga biriktirilgan transport')}</p>
                    </div>
                    <div className="dv-header__actions">
                        <Button variant="secondary-gray" iconLeading={<RefreshIcon size={18}/>}
                                onClick={load} loading={loading} aria-label={t('Yangilash')}>
                            {t('Yangilash')}
                        </Button>
                        <Button iconLeading={<PlusIcon size={20}/>} onClick={() => {
                            setEditing(EMPTY_DEVICE);
                            setFormOpen(true);
                        }}>
                            {t("Yangi qo'shish")}
                        </Button>
                    </div>
                </div>

                {/* tur bo'yicha qisqa xulosa — bosilganda filtrga aylanadi */}
                <div className="dv-chips">
                    <FilterChip
                        active={!type}
                        icon={<DeviceIcon size={18}/>}
                        label={t('Barchasi')}
                        count={all.length}
                        onClick={() => setType('')}
                    />

                    {Object.entries(VEHICLE_TYPES).map(([key, meta]) => {
                        const count = all.filter((device) => device.type === key).length;
                        if (!count) return null;

                        return (
                            <FilterChip
                                key={key}
                                active={type === key}
                                icon={<img src={meta.active} alt=""/>}
                                label={t(meta.label)}
                                count={count}
                                onClick={() => setType(type === key ? '' : key)}
                            />
                        );
                    })}
                </div>

                <div className="dv-table">
                    <div className="dv-table__toolbar">
                        <SearchInput
                            clearable
                            clearLabel={t('Tozalash')}
                            placeholder={t('Izlash')}
                            value={search}
                            className="dv-search"
                            onChange={(e) => setSearch(e.currentTarget.value)}
                        />

                        <div className="dv-table__filters">
                            {departments.length > 1 && (
                                <Select
                                    block={false}
                                    size="sm"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder={t('Boshqarma')}
                                    aria-label={t('Boshqarma')}
                                    options={departments.map((item) => ({value: item, label: t(item)}))}
                                />
                            )}

                            {filtersActive && (
                                <Button variant="tertiary-gray" size="sm" onClick={() => {
                                    setSearch('');
                                    setType('');
                                    setDepartment('');
                                }}>
                                    {t('Tozalash')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="dv-table__body" ref={bodyRef}>
                        <PanelLoader show={loading} table/>
                        <Table
                            columns={isMobile ? mobileColumns : columns}
                            dataSource={rows}
                            rowKey="key"
                            pagination={false}
                            tableLayout="fixed"
                            scroll={{x: isMobile ? undefined : TABLE_MIN_WIDTH, y: scrollY}}
                            rowClassName={() => 'dv-row-click'}
                            onRow={(record) => ({
                                onClick: (e) => {
                                    if (e.target.closest('button, a, input, label')) return;
                                    setDetail(record);
                                },
                            })}
                            locale={{
                                // yuklanayotganda "topilmadi" yozuvi miltillab chiqmasin
                                emptyText: loading ? <span className="dv-wait"/> : (
                                    <EmptyState
                                        title={t('Qurilma topilmadi')}
                                        description={t("Qidiruv shartini o'zgartiring yoki yangi qurilma qo'shing")}
                                    />
                                ),
                            }}
                        />
                    </div>

                    <div className="dv-table__foot">
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={filtered.length}
                            onChange={(nextPage, nextSize) => {
                                setPage(nextPage);
                                setPageSize(nextSize);
                            }}
                            labels={{
                                total: t('Jami'),
                                prev: t('Oldingi'),
                                next: t('Keyingi'),
                                page: t('sahifa'),
                                pageSize: t('Sahifa hajmi'),
                            }}
                        />
                    </div>
                </div>

                <DeviceDetails
                    device={detail}
                    open={Boolean(detail)}
                    onClose={() => setDetail(null)}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                />

                <DeviceFormDrawer
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    initialValues={editing}
                    onSaved={load}
                    onAuthError={onAuthError}
                />

                <ConfirmDialog
                    open={Boolean(deleteId)}
                    onClose={() => setDeleteId(null)}
                    onConfirm={removeDevice}
                    loading={deleting}
                    title={t("Qurilmani o'chirish")}
                    description={t('Bu amalni ortga qaytarib bo‘lmaydi. Davom etasizmi?')}
                    confirmLabel={t("O'chirish")}
                    cancelLabel={t('Bekor qilish')}
                />
            </div>
        </ConfigProvider>
    );
};

export default DeviseContent;
