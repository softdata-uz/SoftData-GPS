import React, {useEffect, useRef, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import {useDispatch} from "react-redux";
import axios from "axios";
// import {getUser} from "../../redux/actions/parkingActions";
import * as Yup from "yup";
import {ip} from "../../../ip";

import round_logo from './images/round_logo.svg';
import user_icon from './images/user_logo.svg';
import lock from './images/lock.svg';
import eye from './images/eye.svg';
import eye_off from './images/eye-off.svg'

import './login.css'

const Login = ({user, setUser}) => {

    const dispatch = useDispatch();
    const [token, setToken] = useState(null);
    const [errorDiv, setErrorDiv] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const initialValues = {
        domain: "",
        login: "",
        password: "",
    };

    const validationSchema = Yup.object({
        domain: Yup.string().required("Domain tanlanmagan ..."),
        login: Yup.string().required("Login kiritilmagan ..."),
        password: Yup.string().required("Parol kiritilmagan..."),
    });

    const onSubmit = (values) => {
        axios
            .post(`${ip}/api/sign-in`, {
                domain: values.domain,
                login: values.login,
                password: values.password,
            })
            .then((res) => {
                // console.log(res);
                setToken(res.data.accessToken);
                localStorage.setItem("gps-x-access-token", res.data.accessToken);
            })
            .catch((error) => {
                console.log(error);
                if (error && error.request && error.request.status !== 200) {
                    setErrorDiv(true);
                }
            });
    };

    useEffect(() => {
        if (localStorage.getItem("gps-x-access-token")) {
            axios
                .get(`${ip}/api/me`, {
                    headers: {
                        "x-access-token": localStorage.getItem("gps-x-access-token"),
                    },
                })
                .then((res) => {
                    setUser(res.data.data);
                    // dispatch(getUser(res?.data.data));
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [token, dispatch]);

    return (
        <div className="login_page">
            <div className="login_page_inner">
                <div className="login_page_inner_background">
                    <div className="background_img">
                        <img className="round_img" src={round_logo} alt=""/>
                    </div>
                </div>

                <div className="login_page_inner_items">
                    <div className="login_page_inner_form">
                        <div className="login_page_title">
                            Tizimga kirish
                        </div>

                        <div className="login_form">
                            <Formik
                                initialValues={initialValues}
                                onSubmit={onSubmit}
                                validationSchema={validationSchema}
                            >

                                {(formik) => {
                                    return (
                                        <Form>
                                            <div className="login_page_inputs">
                                                <div className="login_inputs_wrapper">

                                                    <div className="login_control">
                                                        <label className="login_label">Admin</label>
                                                        <div className="login_input">
                                                            <img
                                                                className="login_icon"
                                                                src={user_icon}
                                                                alt=""
                                                            />
                                                            <Field className="domain_select" as="select" name="domain">
                                                                <option disabled value="">Tanlang</option>
                                                                <option value="uzairports">uzairports</option>
                                                                <option value="uah">uah</option>
                                                                <option value="cargouz">cargouz</option>
                                                            </Field>
                                                        </div>
                                                        <ErrorMessage
                                                            name="domain"
                                                            component="div"
                                                            style={{color: "red"}}
                                                            className="error"
                                                        />
                                                    </div>

                                                    <div className="login_control">
                                                        <label className="login_label">Login</label>
                                                        <div className="login_input">
                                                            <img
                                                                className="login_icon"
                                                                src={user_icon}
                                                                alt=""
                                                            />
                                                            <Field
                                                                type="login"
                                                                id="login"
                                                                name="login"
                                                                placeholder="Kiriting"
                                                                autoComplete="off"
                                                            />
                                                        </div>
                                                        <ErrorMessage
                                                            name="login"
                                                            component="div"
                                                            style={{color: "red"}}
                                                            className="error"
                                                        />
                                                    </div>
                                                    <div className="login_control">
                                                        <label className="login_label">Parol</label>
                                                        <div className="login_input">
                                                            <img className="login_icon" src={lock} alt=""/>
                                                            <Field
                                                                type={showPassword ? "text" : "password"}
                                                                id="password"
                                                                name="password"
                                                                placeholder="Kiriting"
                                                                autoComplete="off"
                                                            />
                                                            {showPassword ?
                                                                <img onClick={togglePasswordVisibility}
                                                                     className="eye_icon" src={eye} alt=""/>
                                                                :
                                                                <img onClick={togglePasswordVisibility}
                                                                     className="eye_icon" src={eye_off} alt=""/>

                                                            }
                                                        </div>
                                                        <ErrorMessage
                                                            name="password"
                                                            component="div"
                                                            style={{color: "red"}}
                                                            className="error"
                                                        />
                                                    </div>
                                                </div>

                                                <button type="submit" className="login_button">
                                                    Kirish
                                                </button>

                                                <div className="call_center">
                                                    <div className="call_center_info">
                                                        Qo‘llab-quvvatlash xizmati:
                                                    </div>
                                                    <div className="call_number">
                                                        +998 (91) 791 11 22
                                                    </div>
                                                </div>
                                            </div>


                                        </Form>
                                    );
                                }}

                            </Formik>
                        </div>
                    </div>

                    <div className="powered_by">
                        Powered by © <span>SoftData</span> 2024. Barcha huquqlar himoyalangan
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;