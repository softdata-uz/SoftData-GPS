import React, {useRef} from 'react';
import Modal from "react-modal";
import {Form, Input, message, Select} from "antd";
import axios from "axios";
import {ip} from "../../../ip";


import './deviseModal.css';
import {useTranslation} from "react-i18next";

const DeviseModal = (props) => {


    const {
        isOpenModal,
        setIsOpenModal,
        deviseInitialValue,
        setDeviseInitialValue,
        getDeviseData,
        devisePaginationCurrent,
        setLoading,
        loading
    } = props


    const modalRef = useRef();
    const {t, i18n} = useTranslation();
    const cancel = () => {
        setLoading(false)
        setDeviseInitialValue({
            id: "",
            model: "",
            display_name: "",
            type: "",
            description: "",
            phone_number: "",
            ip_address: "",
            limit_speed: '',
            vehicle_model: "",
            vehicle_manufactured_year: null,
            vehicle_driver: null,
            vehicle_department: null,
            a0: '',
            a1: '',
            a2: '',
            a3: '',
        })
        setIsOpenModal(false)

    }


    const onFinish = (values) => {
        // console.log(values)
        setLoading(true)
        if (deviseInitialValue.edit) {
            axios.put(`${ip}/api/device/${deviseInitialValue.id}`, {
                    ...values
                },
                {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}}
            )
                .then(response => {
                    getDeviseData(devisePaginationCurrent)
                    cancel()
                    setIsOpenModal(false);
                    message.success(t("Muvaffaqiyatli o'zgartirildi"))
                })
                .catch(err => {
                    message.error(err.response.data.msg);
                    setLoading(false)
                    // console.log(err?.response?.data)
                })
        } else {
            axios.post(`${ip}/api/device`,
                values,
                {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}}
            )
                .then(response => {
                    getDeviseData(devisePaginationCurrent)
                    cancel()
                    setIsOpenModal(false);
                    message.success(t("Muvaffaqiyatli qo'shildi"))
                })
                .catch(err => {
                    message.error(err.response.data.msg);
                    console.log(err?.response?.data)
                    setLoading(false)
                })
        }
    };


    // const onFinish = (values) => {
    //     setLoading(true);
    //
    //     // DatePicker dan olingan sanani faqat yil sifatida saqlash
    //     if (values.vehicle_manufactured_year) {
    //         values.vehicle_manufactured_year = moment(values.vehicle_manufactured_year).format("YYYY");
    //     }
    //
    //     if (deviseInitialValue.edit) {
    //         axios.put(`${ip}/api/device/${deviseInitialValue.id}`, values, {
    //             headers: { 'x-access-token': localStorage.getItem('gps-x-access-token') }
    //         })
    //             .then(response => {
    //                 getDeviseData(devisePaginationCurrent);
    //                 cancel();
    //                 setIsOpenModal(false);
    //                 message.success(t("Muvaffaqiyatli o'zgartirildi"));
    //             })
    //             .catch(err => {
    //                 message.error(err.response.data.msg);
    //                 setLoading(false);
    //             });
    //     } else {
    //         axios.post(`${ip}/api/device`, values, {
    //             headers: { 'x-access-token': localStorage.getItem('gps-x-access-token') }
    //         })
    //             .then(response => {
    //                 getDeviseData(devisePaginationCurrent);
    //                 cancel();
    //                 setIsOpenModal(false);
    //                 message.success(t("Muvaffaqiyatli qo'shildi"));
    //             })
    //             .catch(err => {
    //                 message.error(err.response.data.msg);
    //                 setLoading(false);
    //             });
    //     }
    // };


    const onFinishFailed = (error) => {
        console.log(error);
    };

    return (
        <Modal
            isOpen={isOpenModal}
            onRequestClose={cancel}
            contentLabel="My dialog"
            className="myModal"
            overlayClassName="myOverlay"
            closeTimeoutMS={0}
        >
            <div className="devise_add_modal">
                <div className="devise_add_modal_title">
                    <h2>{deviseInitialValue?.edit ? t("Tahrirlash") : t("Yangi qo'shish")}</h2>
                    <p>{t("Kerakli maydonlarni to'g'ri to'ldiring")}</p>
                </div>

                <div className="devise_add_modal_forms">
                    <Form
                        name="basic"
                        layout="vertical"
                        // requiredMark='optional'
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="on"
                        initialValues={deviseInitialValue}
                        requiredMark={false}
                    >
                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={t("IMEI")}
                                name="id"
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
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("Model")}
                                name="model"
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
                                />
                            </Form.Item>
                        </div>

                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={t("Maxsus raqami")}
                                name="display_name"
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
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("Transport turi")}
                                name="type"
                                rules={[
                                    {
                                        required: true,
                                        message: t("To'ldirilmagan..."),
                                    },
                                ]}
                            >
                                <Select
                                    size="large"
                                    placeholder={t("Tanlang")}
                                >
                                    <Select.Option disabled value="">
                                        <span style={{color: "#bfbfbf"}}>{t("Tanlang")}</span>
                                    </Select.Option>
                                    {/*<Select.Option value="train">*/}
                                    {/*    {t("Teplavoz")}*/}
                                    {/*</Select.Option>*/}
                                    <Select.Option value="bus">
                                        {t("bus")}
                                    </Select.Option>
                                    <Select.Option value="car">
                                        {t("car")}
                                    </Select.Option>
                                    <Select.Option value="truck">
                                        {t("truck")}
                                    </Select.Option>
                                    {/*<Select.Option value="ibp">*/}
                                    {/*    {t("ibp")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="ladder">*/}
                                    {/*    {t("ladder")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="tractor">*/}
                                    {/*    {t("tractor")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="reloaded">*/}
                                    {/*    {t("reloaded")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="firetruck">*/}
                                    {/*    {t("firetruck")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="tz">*/}
                                    {/*    {t("tz")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="specialcar">*/}
                                    {/*    {t("specialcar")}*/}
                                    {/*</Select.Option>*/}
                                    {/*<Select.Option value="lenta">*/}
                                    {/*    {t("lenta")}*/}
                                    {/*</Select.Option>*/}

                                </Select>
                            </Form.Item>
                        </div>

                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={t("Izoh")}
                                name="description"
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
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("Telefon raqami")}
                                name="phone_number"
                                rules={[
                                    {
                                        required: true,
                                        message: t("To'ldirilmagan..."),
                                    },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder={"+998"}
                                />
                            </Form.Item>
                        </div>

                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={t("IP manzili")}
                                name="ip_address"
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
                                />
                            </Form.Item>
                            <Form.Item
                                label={t("Maksimal tezlik")}
                                name="limit_speed"
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
                                    type="number"
                                />
                            </Form.Item>
                        </div>

                        <div className="devise_add_modal_title">
                            {t("Qo'chimcha transport ma'lumotlari")}
                        </div>

                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={t("Transport modeli")}
                                name="vehicle_model"
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
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("Ishlab chiqarilgan yili")}
                                name="vehicle_manufactured_year"
                            >
                                <Input
                                    size="large"
                                    placeholder={t("Kiriting")}
                                />
                            </Form.Item>

                        </div>

                        {/*<div className="devise_add_modal_forms_inner">*/}
                        {/*    <Form.Item*/}
                        {/*        label={t("Egasi (Mavjud bo’lsa)")}*/}
                        {/*        name="vehicle_driver"*/}
                        {/*    >*/}
                        {/*        <Input*/}
                        {/*            size="large"*/}
                        {/*            placeholder={t("Kiriting")}*/}
                        {/*        />*/}
                        {/*    </Form.Item>*/}

                        {/*    <Form.Item*/}
                        {/*        label={t("Qaysi bo'lim yoki xizmatga tegishli")}*/}
                        {/*        name="vehicle_department"*/}
                        {/*        // rules={[*/}
                        {/*        //     {*/}
                        {/*        //         required: true,*/}
                        {/*        //         message: t("To'ldirilmagan..."),*/}
                        {/*        //     },*/}
                        {/*        // ]}*/}
                        {/*    >*/}
                        {/*        <Select*/}
                        {/*            size="large"*/}
                        {/*            placeholder={t("Tanlang")}*/}
                        {/*        >*/}
                        {/*            <Select.Option disabled value="">*/}
                        {/*                <span style={{color: "#bfbfbf"}}>{t("Tanlang")}</span>*/}
                        {/*            </Select.Option>*/}
                        {/*            <Select.Option value="tashkent">*/}
                        {/*                {t("Toshkent viloyati boshqarmasi")}*/}
                        {/*            </Select.Option>*/}
                        {/*            <Select.Option value="hendling">*/}
                        {/*                {t("Hendling")}*/}
                        {/*            </Select.Option>*/}
                        {/*        </Select>*/}
                        {/*    </Form.Item>*/}
                        {/*</div>*/}

                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={"a0"}
                                name="a0"
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
                                    type="number"
                                />
                            </Form.Item>
                            <Form.Item
                                label={"a1"}
                                name="a1"
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
                                    type="number"
                                />
                            </Form.Item>
                        </div>
                        <div className="devise_add_modal_forms_inner">
                            <Form.Item
                                label={"a2"}
                                name="a2"
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
                                    type="number"
                                />
                            </Form.Item>
                            <Form.Item
                                label={"a3"}
                                name="a3"
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
                                    type="number"
                                />
                            </Form.Item>
                        </div>

                        <div className="save_cansle_btn">
                            <div className="save_cansle_buttons">
                                <button onClick={cancel} className="cansle_button1" type="button">
                                    {t("Bekor qilish")}
                                </button>
                                <button className="add_button" type="submit">
                                    {t("Saqlash")}
                                </button>
                            </div>
                        </div>

                    </Form>
                </div>
            </div>
        </Modal>
    )
};

export default DeviseModal;


