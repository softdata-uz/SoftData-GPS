import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import moment from 'moment';
import axios from 'axios';
import {ConfigProvider, Image, Table, Tooltip, message} from 'antd';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {LoginFailure} from '../../redux/action/action';
import {getAntdTheme} from '../../theme/antdTheme';
import {useTheme} from '../../theme/ThemeContext';
import {storage} from '../../services';
import AdminFormDrawer, {EMPTY_ADMIN} from './AdminFormDrawer';
import {ROLE_META, roleMeta} from './adminRoles';

import {Badge, Button, EmptyState, SearchInput} from '../../ui/ui';
import useMediaQuery from '../../ui/useMediaQuery';
import PanelLoader from '../loading/PanelLoader';
import {ConfirmDialog, FilterChip, Pagination} from '../../ui/controls';
import {EditIcon, PlusIcon, RefreshIcon, TrashIcon, UsersIcon} from '../../ui/icons';

import '../deviseContent/devices.css';
import './adminPage.css';

/* ============================================================================
   Adminlar — tizim foydalanuvchilari (Qurilmalar sahifasi bilan bir xil uslub).
   Ro'yxat kichik bo'lgani uchun bir marta to'liq olinadi; qidiruv, rol filtri
   va sahifalash mijozda bajariladi.
   ========================================================================== */

const FETCH_LIMIT = 1000;
const TABLE_MIN_WIDTH = 960;
const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

const fullName = (u) => [u?.lastname, u?.firstname, u?.fathersname].filter(Boolean).join(' ');
const initials = (u) => [u?.lastname, u?.firstname].filter(Boolean)
    .map((part) => String(part).trim().charAt(0)).join('').toUpperCase() || '?';

/* rasm bo'lmasa yoki yuklanmasa — bosh harflar */
const AdminAvatar = ({user, onOpen, label}) => {
    const [broken, setBroken] = useState(false);
    const src = user?.image && !broken ? `${ip}/${user.image}` : null;

    // rasm bor — bosilsa kattalashadi; yo'q bo'lsa oddiy bosh harflar
    if (!src) return <span className="ad-avatar">{initials(user)}</span>;

    return (
        <button type="button" className="ad-avatar is-zoomable" onClick={() => onOpen(src)}
                aria-label={label} title={undefined}>
            <img src={src} alt="" onError={() => setBroken(true)}/>
        </button>
    );
};

const AdminPage = () => {
    const {t} = useTranslation();
    const {theme} = useTheme();
    const antdTheme = useMemo(() => getAntdTheme(theme), [theme]);
    const dispatch = useDispatch();
    const isMobile = useMediaQuery();
    const me = storage.local.get('user') || {};

    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(EMPTY_ADMIN);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);

    /* jadval qolgan balandlikni egallaydi — Qurilmalar sahifasidagi kabi */
    const bodyRef = useRef(null);
    const [scrollY, setScrollY] = useState(undefined);

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
            const {data} = await axios.get(`${ip}/api/admin`, {
                params: {limit: FETCH_LIMIT, offset: 1, searched_data: ''},
                headers: authHeaders(),
            });
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

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return all.filter((item) => {
            if (role && item.role !== role) return false;
            if (!needle) return true;
            return [item.lastname, item.firstname, item.fathersname, item.login]
                .some((field) => String(field ?? '').toLowerCase().includes(needle));
        });
    }, [all, search, role]);

    useEffect(() => {
        setPage(1);
    }, [search, role]);

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
        const id = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(id);
    }, [rows, loading, measure]);

    /* ro'yxatda uchraydigan rollar — filtr chiplari uchun */
    const roleCounts = useMemo(() => all.reduce((acc, item) => {
        acc[item.role] = (acc[item.role] || 0) + 1;
        return acc;
    }, {}), [all]);

    const openCreate = () => {
        setEditing(EMPTY_ADMIN);
        setFormOpen(true);
    };

    const openEdit = (record) => {
        setEditing({...record, edit: true});
        setFormOpen(true);
    };

    const removeAdmin = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${ip}/api/admin/${deleteId}`, {headers: authHeaders()});
            message.success(t("Muvaffaqiyatli o'chirildi"));
            setDeleteId(null);
            load();
        } catch (error) {
            onAuthError(error);
            message.error(error?.response?.data?.msg || t('Xatolik yuz berdi'));
        } finally {
            setDeleting(false);
        }
    };

    const filtersActive = Boolean(search || role);

    const columns = [
        {
            title: t('T/r'),
            dataIndex: 'order',
            key: 'order',
            width: 64,
            render: (value) => <span className="dv-muted">{value}</span>,
        },
        {
            title: t('F.I.SH'),
            key: 'name',
            width: 320,
            render: (_, record) => (
                <div className="ad-user">
                    <AdminAvatar user={record} onOpen={setPreviewSrc} label={t('Rasmni kattalashtirish')}/>
                    <button type="button" className="ad-user__main" onClick={() => openEdit(record)}>
                    <span className="ad-user__text">
                        <span className="ad-user__name">
                            {fullName(record) || '—'}
                            {me?.id && me.id === record.id && <span className="ad-you">{t('Siz')}</span>}
                        </span>
                        <span className="ad-user__meta">
                            {/* telefonda rol ustuni yo'q — rol shu yerda */}
                            {isMobile && <Badge color={roleMeta(record.role).color} dot>{t(roleMeta(record.role).label)}</Badge>}
                            {record.login && <span className="ad-user__login">@{record.login}</span>}
                        </span>
                    </span>
                    </button>
                </div>
            ),
        },
        {
            title: t('Login'),
            dataIndex: 'login',
            key: 'login',
            width: 180,
            ellipsis: true,
            render: (value) => value || '—',
        },
        {
            title: t('Roli'),
            dataIndex: 'role',
            key: 'role',
            width: 170,
            render: (value) => {
                const meta = roleMeta(value);
                return <Badge color={meta.color} dot>{t(meta.label)}</Badge>;
            },
        },
        {
            title: t('Yaratilgan vaqti'),
            dataIndex: 'created_time',
            key: 'created_time',
            width: 170,
            render: (value) => (value ? (
                <span className="ad-date">
                    <span>{moment(value).format('DD.MM.YYYY')}</span>
                    <span className="dv-muted">{moment(value).format('HH:mm')}</span>
                </span>
            ) : '—'),
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
                                disabled={me?.id && me.id === record.id}
                                onClick={() => setDeleteId(record?.id)} aria-label={t("O'chirish")}>
                            <TrashIcon size={16}/>
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    /* telefon: faqat asosiy ustunlar, qolgani qator bosilganda ochiladigan tafsilotlarda */
    const MOBILE_WIDTHS = {name: undefined, actions: 84};
    const mobileColumns = columns
        .filter((col) => ['name','actions'].includes(col.key))
        .map((col) => ({...col, width: MOBILE_WIDTHS[col.key], fixed: undefined}));

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="dv">
                <div className="dv-header">
                    <div className="dv-header__text">
                        <h1>{t('Adminlar')}</h1>
                        <p>{t('Tizim foydalanuvchilari va ularning huquqlari')}</p>
                    </div>
                    <div className="dv-header__actions">
                        <Button variant="secondary-gray" iconLeading={<RefreshIcon size={18}/>}
                                onClick={load} loading={loading} aria-label={t('Yangilash')}>
                            {t('Yangilash')}
                        </Button>
                        <Button iconLeading={<PlusIcon size={20}/>} onClick={openCreate}>
                            {t("Yangi qo'shish")}
                        </Button>
                    </div>
                </div>

                {/* rol bo'yicha qisqa xulosa — bosilganda filtrga aylanadi */}
                <div className="dv-chips">
                    <FilterChip
                        active={!role}
                        icon={<UsersIcon size={18}/>}
                        label={t('Barchasi')}
                        count={all.length}
                        onClick={() => setRole('')}
                    />
                    {Object.entries(ROLE_META).map(([key, meta]) => (
                        roleCounts[key] ? (
                            <FilterChip
                                key={key}
                                active={role === key}
                                icon={<span className={`ad-dot ad-dot--${meta.color}`}/>}
                                label={t(meta.label)}
                                count={roleCounts[key]}
                                onClick={() => setRole(role === key ? '' : key)}
                            />
                        ) : null
                    ))}
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
                            {filtersActive && (
                                <Button variant="tertiary-gray" size="sm" onClick={() => {
                                    setSearch('');
                                    setRole('');
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
                            locale={{
                                // yuklanayotganda "topilmadi" yozuvi miltillab chiqmasin
                                emptyText: loading ? <span className="dv-wait"/> : (
                                    <EmptyState
                                        title={t('Administrator topilmadi')}
                                        description={t("Qidiruv shartini o'zgartiring yoki yangi administrator qo'shing")}
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

                <Image
                    wrapperStyle={{display: 'none'}}
                    src={previewSrc || undefined}
                    preview={{
                        rootClassName: 'ad-lightbox',
                        visible: Boolean(previewSrc),
                        src: previewSrc || undefined,
                        onVisibleChange: (visible) => {
                            if (!visible) setPreviewSrc(null);
                        },
                    }}
                />

                <AdminFormDrawer
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    initialValues={editing}
                    onSaved={load}
                    onAuthError={onAuthError}
                />

                <ConfirmDialog
                    open={Boolean(deleteId)}
                    onClose={() => setDeleteId(null)}
                    onConfirm={removeAdmin}
                    loading={deleting}
                    title={t("Administratorni o'chirish")}
                    description={t('Bu amalni ortga qaytarib bo‘lmaydi. Davom etasizmi?')}
                    confirmLabel={t("O'chirish")}
                    cancelLabel={t('Bekor qilish')}
                />
            </div>
        </ConfigProvider>
    );
};

export default AdminPage;
