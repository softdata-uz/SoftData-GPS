import React, {useState} from 'react';
import {Form, Input, message, Select} from "antd";
import {ip} from "../../ip";
import Modal from "react-modal";
import './adminModal.css';
import axios from "axios";
import Loader from "../loading/Loader";
import {useTranslation} from "react-i18next";

const Admin = ({isOpenAdminModal, setIsOpenAdminModal, user}) => {

    const {t, i18n} = useTranslation();
    const [loading , setLoading] = useState(false);

    const [isCheckedInfo, setIsCheckedInfo] = useState(true);
    const [error, setError] = useState(false);

    const [initialValues, setInitialValues] = useState({
        firstname: user && user.firstname,
        lastname: user && user.lastname,
        fathersname: user && user.fathersname,
        tel: user && user.tel,
        login: user && user.login,
        old_password: '',
        new_password: '',
        confirm_password: '',
    })


    const onFinish = (values) => {
        setLoading(true);
        if (values.password === values.confirm_password) {
            delete values.confirm_password;
            axios.put (`${ip}/api/edit/admin/${user.id}`,{
                ...values
            }, {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}})
                .then(response =>{
                    // console.log(response)
                    cancel()
                    message.success(t("Muvaffaqiyatli"))
                })
                .catch(err =>{
                    // console.log(err?.response?.data)
                    setError(true)
                })
        }
        else {
            setError(true)
        }
    }

    const onFinishFailed = (error) => {
        // console.log(error);
    }

    const cancel = () => {
        setLoading(false)
        setIsOpenAdminModal(false)
        setIsCheckedInfo(true)
        // setInitialValues ({
        //     firstname: '',
        //     lastname: '',
        //     fathersname: '',
        //     tel: '',
        //     login: '',
        //     old_password: '',
        //     new_password: '',
        //     confirm_password: '',
        // })
    }


    return (
        <div>
            {
                loading && <Loader/>
            }
            <Modal
                isOpen={isOpenAdminModal}
                onRequestClose={() => setIsOpenAdminModal(false)}
                contentLabel="My dialog"
                className="myAdminmodal"
                overlayClassName="myAdminoverlay"
                closeTimeoutMS={300}
            >
                <Form
                    name="basic"
                    layout="vertical"
                    initialValues={initialValues}
                    requiredMark = 'optional'
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <div className='admin_modal'>
                        <div className="admin_title">
                            <h1 className = "adminModal_title">{t(`Admin haqida ma'lumot`)}</h1>
                        </div>
                        <hr/>

                        <div className="dataForms admin_dataForms">
                            <div className="form-control-admin-wrapper">
                                <div className="admin_inputs_row">
                                    <Form.Item
                                        label={t("Familya")}
                                        name="lastname"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder={t("Kiriting")}
                                            disabled = {isCheckedInfo}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={t("Ism")}
                                        name="firstname"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder={t("Kiriting")}
                                            disabled = {isCheckedInfo}
                                        />
                                    </Form.Item>
                                </div>

                                <div className="admin_inputs_row1">
                                    <Form.Item
                                        label={t("Sharif")}
                                        name="fathersname"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder={t("Kiriting")}
                                            disabled = {isCheckedInfo}
                                        />
                                    </Form.Item>
                                    {/*<Form.Item*/}
                                    {/*    label="Telefon"*/}
                                    {/*    name="tel"*/}
                                    {/*    rules={[*/}
                                    {/*        {*/}
                                    {/*            required: true,*/}
                                    {/*            message: t("To'ldirilmagan..."),*/}
                                    {/*        },*/}
                                    {/*    ]}*/}
                                    {/*>*/}
                                    {/*    <Input*/}
                                    {/*        size="large"*/}
                                    {/*        placeholder="Kiriting"*/}
                                    {/*        disabled = {isCheckedInfo}*/}
                                    {/*    />*/}
                                    {/*</Form.Item>*/}
                                </div>

                                <div className="admin_inputs_row">
                                    <Form.Item
                                        label={t("Login")}
                                        name="login"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder={t("Kiriting")}
                                            disabled = {isCheckedInfo}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={t("Joriy Parol")}
                                        name="old_password"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            size="large"
                                            placeholder="*******"
                                            disabled = {isCheckedInfo}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        {
                            !isCheckedInfo ?
                                <div className="admin_inputs_row">
                                    <Form.Item
                                        name="password"
                                        label={t("Yangi parol")}
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                        ]}
                                        hasFeedback
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirm_password"
                                        label={t("Parolni tasdiqlash")}
                                        dependencies={['password']}
                                        hasFeedback
                                        rules={[
                                            {
                                                required: true,
                                                message: t("To'ldirilmagan..."),
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }

                                                    return Promise.reject(new Error(t(`parolni to'g'ri kiriting!`)));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </div> :""
                        }

                        <div className = "admin_modal_buttons" >
                            {
                                isCheckedInfo ?
                                    <div className = "button_form-control">
                                        <button
                                            type = 'button'
                                            className="edit_admin_buttton"
                                            onClick={() => setIsCheckedInfo(false)}
                                            // disabled = {loading}
                                        >
                                            {t("Tahrirlash")}
                                        </button>
                                    </div>
                                    :
                                    <div className = "button_form-control">
                                        <button
                                            type = 'submit'
                                            className="add_button"
                                            // disabled = {loading}
                                        >
                                            {t("Saqlash")}
                                        </button>
                                    </div>
                            }

                            <div className = "button_form-control">
                                <button
                                    type = 'button'
                                    className = "cansle_button"
                                    onClick={cancel}
                                    // disabled = {loading}
                                >
                                    {t("Bekor qilish")}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>

    );
};

export default Admin;