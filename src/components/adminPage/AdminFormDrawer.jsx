import React, {useEffect, useRef, useState} from 'react';
import {Form, Input, message} from 'antd';
import axios from 'axios';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {Button} from '../../ui/ui';
import {FormDrawer, FormSection, Select} from '../../ui/controls';
import {TrashIcon, UserIcon, UsersIcon} from '../../ui/icons';
import {ROLE_OPTIONS} from './adminRoles';

export const EMPTY_ADMIN = {
    id: '', lastname: '', firstname: '', fathersname: '', role: undefined, image: '', login: '', password: '',
};

const MAX_IMAGE_MB = 5;
const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

/** Administrator qo'shish / tahrirlash paneli (Qurilmalar sahifasidagi DeviceFormDrawer uslubida). */
const AdminFormDrawer = ({open, onClose, initialValues, onSaved, onAuthError}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    const isEdit = Boolean(initialValues?.edit);
    const currentImage = initialValues?.image ? `${ip}/${initialValues.image}` : null;
    const shownImage = preview || currentImage;

    useEffect(() => {
        if (open) {
            form.setFieldsValue({...EMPTY_ADMIN, ...initialValues});
            setFile(null);
            setPreview(null);
        }
    }, [open, initialValues, form]);

    // tanlangan rasm uchun vaqtinchalik URL — almashganda/yopilganda bo'shatiladi
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const close = () => {
        form.resetFields();
        setFile(null);
        setPreview(null);
        onClose();
    };

    const onPick = (e) => {
        const picked = e.target.files?.[0];
        e.target.value = '';
        if (!picked) return;
        if (!picked.type.startsWith('image/')) {
            message.error(t('Faqat rasm fayli tanlang'));
            return;
        }
        if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
            message.error(t('Rasm hajmi {{size}} MB dan oshmasin', {size: MAX_IMAGE_MB}));
            return;
        }
        setFile(picked);
        setPreview(URL.createObjectURL(picked));
    };

    const onFinish = async (values) => {
        setSaving(true);
        const fd = new FormData();
        Object.entries({...values, image: file || initialValues?.image || ''})
            .forEach(([key, value]) => fd.append(key, value ?? ''));

        try {
            if (isEdit) {
                await axios.put(`${ip}/api/admin/${initialValues.id}`, fd, {headers: authHeaders()});
            } else {
                await axios.post(`${ip}/api/admin/`, fd, {headers: authHeaders()});
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

    return (
        <FormDrawer
            open={open}
            onClose={close}
            width={560}
            icon={<UsersIcon size={22}/>}
            title={isEdit ? t('Tahrirlash') : t('Administrator qo’shish')}
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
                name="admin"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{...EMPTY_ADMIN, ...initialValues}}
                requiredMark={false}
                className="dv-form"
            >
                <div className="ad-photo">
                    <span className="ad-photo__preview">
                        {shownImage ? <img src={shownImage} alt=""/> : <UserIcon size={28}/>}
                    </span>
                    <div className="ad-photo__text">
                        <strong>{t('Fotosurat yuklash')}</strong>
                        <span>{t('Min 400x400px, PNG yoki JPEG')}</span>
                        <div className="ad-photo__actions">
                            <Button variant="secondary-gray" size="sm" onClick={() => fileRef.current?.click()}>
                                {shownImage ? t("Almashtirish") : t('Yuklash')}
                            </Button>
                            {file && (
                                <Button variant="tertiary-gray" size="sm" iconLeading={<TrashIcon size={16}/>}
                                        onClick={() => {
                                            setFile(null);
                                            setPreview(null);
                                        }}>
                                    {t('Bekor qilish')}
                                </Button>
                            )}
                        </div>
                    </div>
                    {/* hidden atributi yetmaydi: umumiy CSS input'larga display beradi */}
                    <input ref={fileRef} type="file" accept="image/*" style={{display: 'none'}} onChange={onPick}/>
                </div>

                <FormSection title={t("Shaxsiy ma'lumotlar")}>
                    <Form.Item label={t('Familiya')} name="lastname" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Ism')} name="firstname" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>

                    <Form.Item label={t('Sharif')} name="fathersname" rules={required} className="is-span-2">
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>
                </FormSection>

                <FormSection title={t('Kirish va huquqlar')}>
                    <Form.Item label={t('Rol turi')} name="role" rules={[{required: true, message: t('Tanlang')}]}
                               className="is-span-2">
                        <Select
                            placeholder={t('Tanlang')}
                            options={ROLE_OPTIONS.map(({value, label}) => ({value, label: t(label)}))}
                        />
                    </Form.Item>

                    <Form.Item label={t('Login')} name="login" rules={required}>
                        <Input placeholder={t('Kiriting')} autoComplete="off" name="admin-login-new"/>
                    </Form.Item>

                    <Form.Item label={t('Parol')} name="password" rules={required}>
                        <Input.Password placeholder={t('Kiriting')} autoComplete="new-password"/>
                    </Form.Item>
                </FormSection>
            </Form>
        </FormDrawer>
    );
};

export default AdminFormDrawer;
