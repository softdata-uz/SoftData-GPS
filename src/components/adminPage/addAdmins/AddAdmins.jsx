import React, {useState} from 'react';
import Modal from "react-modal";

import './addAdmins.css';
import {Form, Input, message, Select} from "antd";

import closeIcon from '../../../image/addModal/Button close X.png';
import userImg from '../../../image/addModal/Avatar [1.1].png';
import {ip} from "../../../ip";
import {storage, api} from "../../../services";
import axios from "axios";
import {useTranslation} from "react-i18next";

const AddAdmins = (props) => {
    const {t, i18n} = useTranslation();

    const {
        isOpenAddAdmin,
        setIsOpenAddAdmin,
        initialValues,
        setInitialValues,
        getAdminData,
        adminPaginationCurrent

    } = props;
    const token = storage.local.get("token");

    // img
    const [view, setView] = useState(null);
    const [imageState, setImageState] = useState({
        initial: true,
        uploaded: false,
        requested: false,
        check: false
    });
    const [img, setImg] = useState({});
    const upload = (e) => {
        const file = e.target.files && e.target.files[0];

        if (file && file.type.startsWith("image/")) {
            // ✅ faqat rasm bo‘lsa ishlaydi
            setView(URL.createObjectURL(file));
            setImg({ ...img, image: file });
            setImageState({
                initial: false,
                uploaded: true,
                requested: false,
                check: true
            });
        } else {
            // ❌ rasm bo‘lmasa, tozalaymiz
            setView(null);
            setImageState({
                initial: true,
                uploaded: false,
                requested: false,
                check: false
            });
        }
    };

    // img


    const cancel = () => {
        setImageState({
            initial: true,
            uploaded: false,
            requested: false,
            check: false
        });
        setImg({});
        setView(null);
        setIsOpenAddAdmin(!isOpenAddAdmin);
        setInitialValues({
            fathersname: '',
            lastname: '',
            firstname: '',
            ip: '',
            image: '',
            login: '',
            role: ''
        })
    }
    const onFinish = (values) => {
        const formData = {
            ...values,
            image: imageState.uploaded ? img.image : initialValues ? initialValues.image : "",
        }
        const fd = new FormData();
        Object.keys(formData).forEach(i => fd.append(i, formData[i]));

        if (initialValues.edit) {
            api.put(`${ip}/api/admin/${initialValues.id}`, fd ,
                {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}}
                )
                .then((res) => {
                    message.success(t("Ma'lumotlari o'zgartirildi"), 5);
                    getAdminData(adminPaginationCurrent);
                    cancel();
                })
                .catch(err =>
                    {
                        // message.error(err?.response?.data.msg)
                    }
                )
        } else {
            axios.post(`${ip}/api/admin/`, fd,
                {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}}
                )
                .then((res) => {
                    message.success(t("Yangi qo'shildi"), 5);
                    getAdminData(adminPaginationCurrent);
                    cancel();
                })
                .catch(err =>
                    {
                        console.log(err)
                        // message.error(err?.response?.data.msg)
                    }
                )
        }
    }

    const onFinishFailed = (error) => {
        // console.log(error)
    }
    return (
        <Modal
            isOpen={isOpenAddAdmin}
            onRequestClose={cancel}
            contentLabel="My dialog"
            className="mymodal"
            overlayClassName="myoverlay"
            closeTimeoutMS={0}
        >
            <Form
                name="basic"
                layout="vertical"
                requiredMark='optional'
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                initialValues={initialValues}
            >
                <div className="add_modal">
                    <div className="add_modal_header">
                        <div className="add_modal_header_left">
                            {initialValues.edit ? <h2>{t("Tahrirlash")}</h2> : <h2>{t("Administrator qo’shish")}</h2>}
                            <p>{t("Kerakli maydonlarni to’g’ri to’ldiring")}</p>
                        </div>
                        <div className="add_modal_header_right"><img src={closeIcon} alt="" onClick={cancel}/></div>
                    </div>
                    <div className="add_modal_body">
                        <div className="add_modal_body_img">
                            <div className="add_modal_body_img_left">
                                {
                                    initialValues?.edit && !imageState.check ?
                                        <img src={`${ip}/${initialValues?.image}`}/> :
                                        imageState.uploaded ? <img src={view}/>
                                            : <img src={userImg}/>}
                            </div>
                            <div className="add_modal_body_img_right">
                                <h2>{t("Fotosurat yuklash")}</h2>
                                <p>{t("Min 400x400px, PNG yoki JPEG")}</p>
                                <label htmlFor='add_staff_img' className="upload_button">
                                    <div className="add_modal_body_img_right_add">{t("Yuklash")}</div>
                                    <input onChange={upload}
                                           name='image'
                                           type="file"
                                           accept="image/*"
                                           id="add_staff_img"
                                           style={{display: 'none'}}
                                           className=""
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Familiya")}</span>
                            <Form.Item name="lastname" rules={
                                [{
                                    required: true,
                                    message: t('Familiya kiriting')
                                }]
                            }>
                                <Input placeholder={t("Kiriting")}/>
                            </Form.Item>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Ism")}</span>
                            <Form.Item name="firstname" rules={
                                [{
                                    required: true,
                                    message: t("Ism kiriting")
                                }]
                            }>
                                <Input placeholder={t("Kiriting")}/>
                            </Form.Item>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Sharif")}</span>
                            <Form.Item name="fathersname" rules={
                                [{
                                    required: true,
                                    message: t("Sharifini kiriting")
                                }]
                            }>
                                <Input placeholder={t("Kiriting")}/>
                            </Form.Item>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Rol turi")}</span>
                            <Form.Item name="role" rules={
                                [{
                                    required: true,
                                    message: t("Tanlang")
                                }]
                            }>
                                <Select
                                    placeholder={t("Tanlang")}
                                    // defaultValue="king"
                                >
                                    <Select.Option disabled value="">
                                        {/*<span style={{color: "#717680"}}>Tanlang</span>*/}
                                        {t("Tanlang")}
                                    </Select.Option>
                                    <Select.Option value="superadmin">{t("Super Foydalanuvchi")}</Select.Option>
                                    <Select.Option value="admin">{t("Foydalanuvchi")}</Select.Option>
                                    <Select.Option value="operator">{t("Kuzatuvchi")}</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Login")}</span>
                            <Form.Item name="login" rules={
                                [{
                                    required: true,
                                    message: t("Login kiriting")
                                }]
                            }>
                                <Input placeholder={t("Kiriting")}/>
                            </Form.Item>
                        </div>
                        <div className="add_modal_body_form">
                            <span>{t("Parol")}</span>
                            <Form.Item name="password" rules={
                                [{
                                    required: true,
                                    message: t("Parol kiriting")
                                }]
                            }>
                                <Input.Password placeholder={t("Kiriting")}/>
                            </Form.Item>
                        </div>
                    </div>
                    <div className="add_modal_footer">
                        <button className="cansle_button" type="button" onClick={cancel}>{t("Bekor qilish")}</button>
                        <button className="add_button" type="submit">{t("Saqlash")}</button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};
export default AddAdmins;