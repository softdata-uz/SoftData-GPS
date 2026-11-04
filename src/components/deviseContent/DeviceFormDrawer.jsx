import React, {useEffect, useState} from 'react';
import {Form, Input, message} from 'antd';
import axios from 'axios';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {VEHICLE_TYPES} from '../maps/newVersion/vehicleMeta';
import {Button} from '../../ui/ui';
import {FormDrawer, FormSection, Select} from '../../ui/controls';
import {DeviceIcon} from '../../ui/icons';

export const EMPTY_DEVICE = {
    id: '', model: '', display_name: '', type: '', description: '', phone_number: '',
    ip_address: '', limit_speed: '', vehicle_model: '', vehicle_manufactured_year: null,
    vehicle_driver: null, vehicle_department: null, a0: '', a1: '', a2: '', a3: '',
    fuel_account_type: '',
};

/* Kalibrlash koeffitsiyentlari faqat analog kirishlarda ma'noga ega:
   3 — CAN shina (qiymat blokdan tayyor keladi), 4/5 — nosozlik holatlari. */
const ANALOG_FUEL_SOURCES = [1, 2];

/**
 * Yoqilg'i datchigini kalibrlash koeffitsiyentlari: tanlangan analog kirishning
 * xom qiymati (x) uchinchi darajali ko'phad orqali litrga o'giriladi —
 *     L = a0 + a1·x + a2·x² + a3·x³
 */
const FUEL_COEFFICIENTS = [
    {name: 'a0', label: "a0 — boshlang'ich siljish", hint: "Datchik nol qiymat ko'rsatganda bakdagi yoqilg'i (litr)", mandatory: true},
    {name: 'a1', label: 'a1 — chiziqli koeffitsiyent', hint: "Analog qiymatning har bir birligiga to'g'ri keladigan litr", mandatory: true},
    {name: 'a2', label: 'a2 — kvadratik koeffitsiyent', hint: 'Datchik nochiziqligini tuzatadi. Chiziqli datchikda 0', mandatory: false},
    {name: 'a3', label: 'a3 — kub koeffitsiyent', hint: 'Yuqori tartibli tuzatish. Odatda 0', mandatory: false},
];

/** Bo'sh qoldirilgan koeffitsiyent backendga 0 bo'lib ketadi. */
const toCoefficient = (value) => (value === '' || value == null ? 0 : Number(value));

const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

/** Qurilma qo'shish / tahrirlash paneli (SoftData-AirPort-GPS DeviceFormModal). */
const DeviceFormDrawer = ({open, onClose, initialValues, onSaved, onAuthError}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const isEdit = Boolean(initialValues?.edit);

    const fuelAccountType = Form.useWatch('fuel_account_type', form);
    const isAnalogFuelSource = ANALOG_FUEL_SOURCES.includes(Number(fuelAccountType));

    useEffect(() => {
        if (open) form.setFieldsValue(initialValues || EMPTY_DEVICE);
    }, [open, initialValues, form]);

    const close = () => {
        form.resetFields();
        onClose();
    };

    const onFinish = async (values) => {
        setSaving(true);
        // Koeffitsiyentlar formada majburiy emas, lekin so'rov shakli o'zgarmasin
        // uchun bo'sh qoldirilganlari 0 bo'lib yuboriladi.
        const payload = {...values};
        FUEL_COEFFICIENTS.forEach(({name}) => {
            payload[name] = toCoefficient(values[name]);
        });
        try {
            if (isEdit) {
                await axios.put(`${ip}/api/device/${initialValues.id}`, payload, {headers: authHeaders()});
            } else {
                await axios.post(`${ip}/api/device`, payload, {headers: authHeaders()});
            }
            message.success(isEdit ? t("Muvaffaqiyatli o'zgartirildi") : t("Muvaffaqiyatli qo'shildi"));
            onSaved?.();
            close();
        } catch (error) {
            onAuthError?.(error);
            message.error(error?.response?.data?.msg || t('Xatolik yuz berdi'));
        } finally {
            setSaving(false);
        }
    };

    const required = [{required: true, message: t("To'ldirilmagan...")}];

    const typeOptions = Object.entries(VEHICLE_TYPES).map(([value, meta]) => ({value, label: t(meta.label)}));

    return (
        <FormDrawer
            open={open}
            onClose={close}
            width={620}
            icon={<DeviceIcon size={22}/>}
            title={isEdit ? t('Tahrirlash') : t("Yangi qo'shish")}
            description={t("Kerakli maydonlarni to'g'ri to'ldiring")}
            footer={
                <>
                    <Button variant="secondary-gray" onClick={close}>{t('Bekor qilish')}</Button>
                    <Button onClick={() => form.submit()} loading={saving}>{t('Saqlash')}</Button>
                </>
            }
        >
            <Form
                form={form}
                name="device"
                layout="vertical"
                onFinish={onFinish}
                initialValues={initialValues || EMPTY_DEVICE}
                requiredMark={false}
                className="dv-form"
            >
                <FormSection title={t("GPS haqida ma'lumot")} description={t('Qurilma va unga biriktirilgan transport')}>
                    <Form.Item label={t('IMEI')} name="id" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Model')} name="model" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Maxsus raqami')} name="display_name" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Avtomobil turi')} name="type" rules={required}>
                        <Select placeholder={t('Tanlang')} options={typeOptions}/>
                    </Form.Item>

                    <Form.Item label={t('Izoh (Davlat raqami)')} name="description" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Telefon raqami')} name="phone_number" rules={required}>
                        <Input placeholder="+998"/>
                    </Form.Item>

                    <Form.Item label={t('IP manzili')} name="ip_address" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Maksimal tezlik')} name="limit_speed" rules={required}>
                        <Input type="number" placeholder={t('Kiriting')}/>
                    </Form.Item>
                </FormSection>

                <FormSection title={t("Qo'chimcha transport ma'lumotlari")}>
                    <Form.Item label={t('Avtomobil markasi va modeli')} name="vehicle_model" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Ishlab chiqarilgan yili')} name="vehicle_manufactured_year">
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Egasi (Mavjud bo’lsa)')} name="vehicle_driver">
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t("Qaysi bo'lim yoki xizmatga tegishli")} name="vehicle_department">
                        <Select
                            placeholder={t('Tanlang')}
                            options={[
                                {value: 'tashkent', label: t('Toshkent viloyati boshqarmasi')},
                                {value: 'hendling', label: t('Hendling')},
                            ]}
                        />
                    </Form.Item>
                </FormSection>

                <FormSection title={t("Yoqilg'i haqida ma'lumot")}>
                    <Form.Item label={t('Bak hajmi (litr)')} name="tank_capacity">
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t("Yoqilg'i sarfi (100 km)")} name="fuel_consumption">
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item
                        label={t("Yoqilg'i hisoblash usuli")}
                        name="fuel_account_type"
                        rules={[{required: true, message: t('Tanlang')}]}
                        className="is-span-2"
                    >
                        <Select
                            placeholder={t('Tanlang')}
                            options={[
                                {value: 1, label: t('Analog Input 1')},
                                {value: 2, label: t('Analog Input 2')},
                                {value: 3, label: t('CAN shina')},
                                // Nosozlik holatlari — bunda yoqilg'i o'rniga sabab ko'rsatiladi
                                {value: 4, label: t("Yoqilg'i datchigi nosoz")},
                                {value: 5, label: t("CAN ma'lumotlarida Yoqilg'i qiymatlari berilmagan!")},
                            ]}
                        />
                    </Form.Item>
                </FormSection>

                {/* Kalibrlash — o'z konteynerida, chunki faqat analog kirishga tegishli */}
                <FormSection
                    title={t('Kalibrlash koeffitsiyentlari')}
                    description={isAnalogFuelSource
                        ? t("Analog kirishning xom qiymati (x) shu ko'phad orqali litrga o'giriladi: L = a0 + a1·x + a2·x² + a3·x³")
                        : t("CAN shinada yoqilg'i darajasi avtomobil blokidan tayyor olinadi — kalibrlash koeffitsiyentlari shart emas")}
                >
                    {FUEL_COEFFICIENTS.map(({name, label, hint, mandatory}) => (
                        <Form.Item
                            key={name}
                            label={t(label)}
                            name={name}
                            extra={t(hint)}
                            rules={isAnalogFuelSource && mandatory ? required : undefined}
                        >
                            <Input type="number" placeholder={t('Kiriting')} disabled={!isAnalogFuelSource}/>
                        </Form.Item>
                    ))}
                </FormSection>
            </Form>
        </FormDrawer>
    );
};

export default DeviceFormDrawer;
