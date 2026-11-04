import React, {useEffect, useState} from 'react';
import {Form, Input, message} from 'antd';
import axios from 'axios';
import {useTranslation} from 'react-i18next';

import {ip} from '../../ip';
import {Badge, Button} from '../../ui/ui';
import {FormDrawer, FormSection} from '../../ui/controls';
import {UserIcon} from '../../ui/icons';

const authHeaders = () => ({'x-access-token': localStorage.getItem('gps-x-access-token')});

/**
 * Profil — joriy foydalanuvchi ma'lumotlari va parolni o'zgartirish.
 * Backend so'rovi avvalgi profil oynasi (AdminModal/Admin.js) bilan bir xil:
 * PUT /api/edit/admin/:id  {lastname, firstname, fathersname, login, old_password, password}
 */
const ProfileDrawer = ({open, onClose, user, roleLabel, initials, onSaved}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                lastname: user?.lastname || '',
                firstname: user?.firstname || '',
                fathersname: user?.fathersname || '',
                login: user?.login || '',
                old_password: '',
                password: '',
                confirm_password: '',
            });
        }
    }, [open, user, form]);

    const close = () => {
        form.resetFields();
        onClose();
    };

    const onFinish = async ({confirm_password: _confirm, ...values}) => {
        setSaving(true);
        try {
            await axios.put(`${ip}/api/edit/admin/${user.id}`, values, {headers: authHeaders()});
            message.success(t("Muvaffaqiyatli o'zgartirildi"));
            const {old_password: _old, password: _new, ...profile} = values;
            onSaved?.(profile);
            close();
        } catch (error) {
            message.error(error?.response?.data?.msg || t('Xatolik yuz berdi'));
        } finally {
            setSaving(false);
        }
    };

    const required = [{required: true, message: t("To'ldirilmagan...")}];
    const fullName = [user?.lastname, user?.firstname, user?.fathersname].filter(Boolean).join(' ') || user?.login;

    return (
        <FormDrawer
            open={open}
            onClose={close}
            width={520}
            icon={<UserIcon size={22}/>}
            title={t('Profil')}
            description={t("Shaxsiy ma'lumotlar va parolni o'zgartirish")}
            footer={
                <>
                    <Button variant="secondary-gray" onClick={close}>{t('Bekor qilish')}</Button>
                    <Button onClick={() => form.submit()} loading={saving}>{t('Saqlash')}</Button>
                </>
            }
        >
            <Form form={form} name="profile" layout="vertical" onFinish={onFinish}
                  requiredMark={false} className="dv-form" autoComplete="off">
                <div className="pf-card">
                    <span className="pf-card__avatar">{initials}</span>
                    <div className="pf-card__text">
                        <strong title={fullName}>{fullName}</strong>
                        <span className="pf-card__meta">
                            {roleLabel && <Badge color="brand" dot>{roleLabel}</Badge>}
                            {user?.login && <span className="pf-card__login">@{user.login}</span>}
                        </span>
                    </div>
                </div>

                <FormSection title={t("Shaxsiy ma'lumotlar")}>
                    <Form.Item label={t('Familiya')} name="lastname" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>
                    <Form.Item label={t('Ism')} name="firstname" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>
                    <Form.Item label={t('Sharif')} name="fathersname" rules={required}>
                        <Input placeholder={t('Kiriting')}/>
                    </Form.Item>
                    <Form.Item label={t('Login')} name="login" rules={required}>
                        <Input placeholder={t('Kiriting')} autoComplete="off" name="profile-login"/>
                    </Form.Item>
                </FormSection>

                <FormSection title={t('Xavfsizlik')}
                             description={t('Saqlash uchun joriy parolni kiriting va yangi parolni belgilang')}>
                    <Form.Item label={t('Joriy parol')} name="old_password" rules={required} className="is-span-2">
                        {/* saqlangan parol avtomatik qo'yilmasin — foydalanuvchi o'zi kiritadi */}
                        <Input.Password placeholder={t('Kiriting')} autoComplete="new-password"/>
                    </Form.Item>
                    <Form.Item label={t('Yangi parol')} name="password" rules={required}>
                        <Input.Password placeholder={t('Kiriting')} autoComplete="new-password"/>
                    </Form.Item>
                    <Form.Item
                        label={t('Parolni tasdiqlash')}
                        name="confirm_password"
                        dependencies={['password']}
                       
                        rules={[
                            ...required,
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                    return Promise.reject(new Error(t("parolni to'g'ri kiriting!")));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder={t('Kiriting')} autoComplete="new-password"/>
                    </Form.Item>
                </FormSection>
            </Form>
        </FormDrawer>
    );
};

export default ProfileDrawer;
