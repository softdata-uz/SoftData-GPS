import React from 'react';
import moment from 'moment';
import {useTranslation} from 'react-i18next';

import {vehicleLabelKey} from '../maps/newVersion/vehicleMeta';
import {Badge, Button} from '../../ui/ui';
import {FormDrawer} from '../../ui/controls';
import {DeviceIcon, EditIcon, TrashIcon} from '../../ui/icons';

const FUEL_ACCOUNT_LABELS = {
    1: 'Analog Input 1',
    2: 'Analog Input 2',
    3: 'CAN shina',
    4: "Yoqilg'i datchigi nosoz",
    5: "CAN ma'lumotlarida Yoqilg'i qiymatlari berilmagan!",
};

const Row = ({label, value}) => (
    <div className="dv-row">
        <span className="dv-row__label">{label}</span>
        <span className="dv-row__value">{value || '—'}</span>
    </div>
);

const Section = ({title, children}) => (
    <div className="dv-section">
        <h3>{title}</h3>
        {children}
    </div>
);

/** Qurilma tafsilotlari — jadvalga sig'magan barcha maydonlar. */
const DeviceDetails = ({device, open, onClose, onEdit, onDelete}) => {
    const {t} = useTranslation();
    const item = device || {};

    return (
        <FormDrawer
            open={open}
            onClose={onClose}
            width={460}
            icon={<DeviceIcon size={22}/>}
            title={item.display_name || '—'}
            description={item.id}
            footer={
                <>
                    <Button variant="secondary-gray" className="ui-grow" iconLeading={<EditIcon size={18}/>}
                            onClick={() => onEdit(item)}>
                        {t('Tahrirlash')}
                    </Button>
                    <Button variant="destructive" className="ui-grow" iconLeading={<TrashIcon size={18}/>}
                            onClick={() => onDelete(item.id)}>
                        {t("O'chirish")}
                    </Button>
                </>
            }
        >
            <Section title={t("Transport haqida ma'lumot")}>
                <Row label={t('Maxsus raqami')} value={item.display_name}/>
                <Row label={t('Davlat raqami')} value={item.description}/>
                <Row label={t('Turi')} value={item.type ? <Badge color="gray">{t(vehicleLabelKey(item.type)) || item.type}</Badge> : null}/>
                <Row label={t('Markasi va modeli')} value={item.vehicle_model}/>
                <Row label={t('Ishlab chiqarilgan yili')} value={item.vehicle_manufactured_year}/>
                <Row label={t('Egasi')} value={item.vehicle_driver}/>
                <Row label={t('Boshqarma')} value={item.vehicle_department}/>
            </Section>

            <Section title={t("GPS haqida ma'lumot")}>
                <Row label={t('IMEI')} value={item.id}/>
                <Row label={t('Model')} value={item.model}/>
                <Row label={t('Telefon raqami')} value={item.phone_number}/>
                <Row label={t('IP manzili')} value={item.ip_address}/>
                <Row label={t('Maksimal tezlik')} value={item.limit_speed ? `${item.limit_speed} ${t('km/soat')}` : null}/>
                <Row label={t("GPS o'rnatilgan sana")}
                     value={item.created_time ? moment(item.created_time).format('DD.MM.YYYY, HH:mm') : null}/>
            </Section>

            <Section title={t("Yoqilg'i haqida ma'lumot")}>
                <Row label={t('Bak hajmi (litr)')} value={item.tank_capacity ? `${item.tank_capacity} l` : null}/>
                <Row label={t("Yoqilg'i sarfi (100 km)")} value={item.fuel_consumption ? `${item.fuel_consumption} l` : null}/>
                <Row label={t("Yoqilg'i hisoblash usuli")}
                     value={FUEL_ACCOUNT_LABELS[item.fuel_account_type] ? t(FUEL_ACCOUNT_LABELS[item.fuel_account_type]) : item.fuel_account_type}/>
            </Section>
        </FormDrawer>
    );
};

export default DeviceDetails;
