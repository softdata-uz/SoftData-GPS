import React, {useState} from 'react';
import {Button, Checkbox, Form, Input, message, Select} from 'antd';
import './loginPageNew.css';
import axios from "axios";
import {ip} from "../../ip";
import logo from './Group 55882.svg';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import {useTranslation} from "react-i18next";
import Loader from "../loading/Loader";
import {useDispatch} from "react-redux";
import {LoginSuccess} from "../../redux/action/action";

const LoginPageNew = () => {

    const dispatch = useDispatch();
    const {t} = useTranslation();

    const [loading, setLoading] = useState(false);
    const [useDomain, setUseDomain] = useState(false);

    const [form] = Form.useForm();

    const initialValues = {
        domain: null,
        login: '',
        password: ''
    };

    const onFinish = (values) => {
        setLoading(true);

        const payload = {
            login: values.login,
            password: values.password,
            ...(useDomain && { domain: values.domain })
        };

        axios.post(`${ip}/api/sign-in`, payload)
            .then(res => {
                localStorage.setItem('gps-x-access-token', res.data.accessToken);
                setLoading(false);
                dispatch(LoginSuccess(res?.data));
            })
            .catch(err => {
                message.error(err?.response?.data?.msg || "Xatolik yuz berdi");
                setLoading(false);
            });
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login_page_new">
            {loading && <Loader/>}

            <div className="login_page_new_top">
                <div className="login_page_new_login">
                    <div className="login_page_new_login_logo">
                        <img src={logo} alt="logo"/>
                    </div>

                    <div className="login_page_new_login_body">
                        <div className="login_page_new_login_body_inner">
                            <h2>Tizimga kirish</h2>
                            <p>Iltimos login va parolni kiriting!</p>

                            <div className="login_page_new_login_body_inner_form">

                                <Form
                                    form={form}
                                    name="basic"
                                    initialValues={initialValues}
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    autoComplete="off"
                                >

                                    <div className="checkbox_row">
                                        <Form.Item>
                                            <Checkbox
                                                checked={useDomain}
                                                onChange={(e) => {
                                                    setUseDomain(e.target.checked);
                                                    if (!e.target.checked) {
                                                        form.setFieldsValue({ domain: null });
                                                    }
                                                }}
                                            >
                                                Domain tanlash
                                            </Checkbox>
                                        </Form.Item>
                                    </div>


                                    <Form.Item
                                        name="domain"
                                        rules={[
                                            {
                                                required: useDomain,
                                                message: t("Tanlash majburiy"),
                                            },
                                        ]}
                                    >
                                        <Select
                                            size="large"
                                            disabled={!useDomain}
                                            placeholder={t("Tanlang")}
                                        >
                                            <Select.Option value="uzairports">
                                                uzairports
                                            </Select.Option>
                                            <Select.Option value="uah">
                                                uah
                                            </Select.Option>
                                            <Select.Option value="cargouz">
                                                cargouz
                                            </Select.Option>
                                        </Select>
                                    </Form.Item>


                                    <Form.Item
                                        name="login"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Loginni kiriting!',
                                            },
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined/>}/>
                                    </Form.Item>


                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Parolni kiriting!',
                                            },
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined/>}/>
                                    </Form.Item>

                                    <div>
                                        <button type="submit">
                                            {t('Tizimga kirish')}
                                        </button>
                                    </div>

                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login_page_new_bottom"></div>
        </div>
    );
};

export default LoginPageNew;
