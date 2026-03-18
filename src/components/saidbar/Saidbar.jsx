import React, {useEffect, useState} from 'react';

import {ip} from "../../ip";
import {message, Popover} from "antd";
import axios from "axios";
import {Button, Drawer, Radio, Space} from 'antd';
import {BrowserRouter, Link} from 'react-router-dom'
import {useDispatch, useSelector} from "react-redux";

import mapIcon from '../../image/map.svg';
import devise from '../../image/devise.svg';
import chart from '../../image/chart.svg';
import logoIcon from '../../image/Logo (5).png';
import gps_s from '../../image/saidnaricon/airaportGPS.svg';
import gps_s2 from '../../image/saidnaricon/Group 55884.png';
import badge from '../../image/badge.svg';
import user from '../../image/user.svg';
import user2 from '../../image/user.png';
import mobileLogo from '../../image/Group 55882 (3).png';
import burger from '../../image/Vector (60).png';
import exitIcon from '../../image/logout.png';
import editIcon from '../../image/edit-2.png';

import AdminPage from "../adminPage/AdminPage";
import Admin from "../AdminModal/Admin";

import './saidbar.css';
import {MdExitToApp} from "react-icons/md";
import {FaEdit} from "react-icons/fa";

import {DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined,} from '@ant-design/icons';
import RootPage from "../../pages/root";
import {useLocation} from "react-router";
import {useTranslation} from "react-i18next";
import {storage} from "../../services";
import {LoginFailure} from "../../redux/action/action";

import trainLogo from '../../image/lOGO (6).png';
import trainLogoMobile from '../../image/logoTrain.png';

const Saidbar = () => {

    const user = storage.local.get("user");
    const dispatch = useDispatch();
    const {t, i18n} = useTranslation();
    const [lang, setLang] = useState(localStorage.getItem('i18nextLng') || 'uz')


    const [pathName, setPathName] = useState('');


    const [isOpenAdminModal, setIsOpenAdminModal] = useState(false);


    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState('right');
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const logout = () => {
        dispatch(LoginFailure());
        localStorage.removeItem('gps-x-access-token');
        i18n.changeLanguage('uz');
    }

    const onChangeLanguage = (event) => {
        setLang(event);
        i18n.changeLanguage(event);
        localStorage.setItem('i18nextLng', event);
    }
    // ----admin--
    const [openPopover, setOpenPopover] = useState(false);
    const hide = () => {
        setOpenPopover(false);
    };
    const handleOpenChange = (newOpen) => {
        setOpenPopover(newOpen);
    };
    const openChangeAdmin = () => {
        setIsOpenAdminModal(true);
        hide();
        onClose();
    }
    // ----admin--


    return (
        <BrowserRouter>
            <div className="full_content">
                <Admin
                    isOpenAdminModal={isOpenAdminModal}
                    setIsOpenAdminModal={setIsOpenAdminModal}
                    user={user}
                />
                <div className="full_content_right">

                    <div className="header">
                        <div className="header_left">
                            <div className="header_left_inner">
                                <Link to="/maps">
                                    <div
                                        //     onClick={() => setActiveContent("leaflet", setFilterTransport({
                                        //     ...filterTransPort,
                                        //     type: ""
                                        // }))}
                                        className=""
                                        style={{marginRight: "20px", display: "flex", alignItems: "center"}}>
                                        <img src={logoIcon} alt=""/>
                                    </div>
                                </Link>

                                <Link to="/maps" style={{display: "flex", alignItems: "center"}}>
                                    <div
                                        className={pathName === "/maps/general" ? "header_left_inner_item_active" : "header_left_inner_item"}
                                    >
                                        <img
                                            className={pathName === "/maps/general" ? "header_left_icon_active" : "header_left_icon"}
                                            src={mapIcon} alt=""
                                        />
                                        <span
                                            className={pathName === "/maps/general" ? "header_left_icon_active" : "header_left_icon"}>
                                            {t("Xarita")}
                                        </span>
                                    </div>
                                </Link>

                                <Link to='/statistic' style={{display: "flex", alignItems: "center"}}>
                                    <div
                                        className={pathName === "/statistic" ? "header_left_inner_item_active" : "header_left_inner_item"}>
                                        <img
                                            className={pathName === "/statistic" ? "header_left_icon_active" : "header_left_icon"}
                                            src={chart} alt=""/>
                                        <span
                                            className={pathName === "/statistic" ? "header_left_icon_active" : "header_left_icon"}>
                                            {t("Statistika")}
                                </span>
                                    </div>
                                </Link>

                                {
                                    (user?.role === "superadmin" || user.role === "king" || user.role === "admin") &&
                                    <Link to='/device' style={{display: "flex", alignItems: "center"}}>
                                        <div
                                            className={pathName === "/device" ? "header_left_inner_item_active" : "header_left_inner_item"}>
                                            <img
                                                className={pathName === "/device" ? "header_left_icon_active" : "header_left_icon"}
                                                src={devise} alt=""/>
                                            <span
                                                className={pathName === "/device" ? "header_left_icon_active" : "header_left_icon"}>
                                            {t("Qurilmalar")}
                                </span>
                                        </div>
                                    </Link>
                                }

                                {
                                    (user.role === "superadmin" || user.role === "king") &&
                                    <Link to='/admins' style={{display: "flex", alignItems: "center"}}>
                                        <div
                                            className={pathName === "/admins" ? "header_left_inner_item_active" : "header_left_inner_item"}>
                                            <img
                                                className={pathName === "/admins" ? "header_left_icon_active" : "header_left_icon"}
                                                src={user2} alt=""/>
                                            <span
                                                className={pathName === "/admins" ? "header_left_icon_active" : "header_left_icon"}>
                                    {t("Adminlar")}
                                       </span>
                                        </div>
                                    </Link>
                                }
                            </div>

                            <Link to="/">
                                <div className="header_left_inner_mobile">
                                    <img src={logoIcon} className="header_left_inner_mobile_logo"/>
                                </div>
                            </Link>
                        </div>

                        <div className="header_right">
                            <div className="header_right_inner">


                                <div className="languages">
                                    <div
                                        className={lang == "uz" ? "languages_item languages_item_active" : "languages_item"}
                                        onClick={() => onChangeLanguage('uz')}>
                                        O‘z
                                    </div>
                                    <div
                                        className={lang == "ru" ? "languages_item languages_item_active" : "languages_item"}
                                        onClick={() => onChangeLanguage('ru')}>
                                        Ру
                                    </div>
                                    <div
                                        className={lang == "en" ? "languages_item languages_item_active" : "languages_item"}
                                        onClick={() => onChangeLanguage('en')}>
                                        En
                                    </div>
                                </div>

                                <div className="badge_admin">
                                    <div className="badge_admin_item">
                                        <img src={badge} alt=""/>
                                    </div>
                                    {/*<div onClick={() => setIsOpenAdminModal(true)} className="rount_img">*/}
                                    {/*{user && <img src={`${ip}/${user.image}`} alt=""/>}*/}
                                    {/*</div>*/}

                                    <Popover
                                        open={openPopover}
                                        onOpenChange={handleOpenChange}
                                        content={<div className="contentHeader">
                                            {/*<div className="contentHeader_inner" onClick={openChangeAdmin}>*/}
                                            {/*    <img src={editIcon}/>*/}
                                            {/*    <p>{t("Tahrirlash")}</p>*/}
                                            {/*</div>*/}
                                            <div className="contentHeader_inner" onClick={logout}>
                                                {/*<MdExitToApp/>*/}
                                                <img src={exitIcon}/>
                                                <p>{t("Chiqish")}</p>
                                            </div>
                                        </div>} trigger="click" placement="leftBottom">
                                        <div className="monitoring_header_user">
                                            {/*<img src={`${ip}/${user?.image}`}/>*/}
                                            <div>
                                                <p>{user?.lastname + " " + user?.firstname + " " + user?.fathersname}</p>
                                                <p style={{color: "#636C79", fontWeight: "400"}}>{user?.role}</p>
                                            </div>
                                            <DownOutlined/>
                                        </div>
                                    </Popover>

                                </div>


                                <div className="badge_admin_mobile">
                                    <div className="badge_admin_item">
                                        <img src={burger} onClick={showDrawer}/>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="content">
                        <RootPage setPathName={setPathName}/>
                    </div>

                    <>
                        <Drawer
                            title=""
                            placement={placement}
                            // closable={false}
                            onClose={onClose}
                            open={open}
                            key={placement}
                            style={{height: "100vh"}}
                        >
                            <div className="header_drawer_menu">
                                <div className="header_drawer_menu_inner_head">
                                    <div>
                                        <span>{user?.lastname + " " + user?.firstname + " " + user?.fathersname}</span>
                                        <br/>
                                        <span>{user?.role}</span>
                                    </div>
                                    {/*<img src={`${ip}/${user?.image}`}/>*/}
                                    {/*<span>{user?.lastname + " " + user?.firstname + " " + user?.fathersname}</span>*/}
                                    {/*<img src={user}/><span>Administrator</span>*/}
                                </div>
                                <Link to="/" className="header_drawer_menu_inner" onClick={() => setOpen(false)}>
                                    <div className="header_drawer_menu_inner_inner">
                                        <img src={mapIcon}/><span>{t("Xarita")}</span>
                                    </div>
                                </Link>
                                <Link to="/statistic" className="header_drawer_menu_inner"
                                      onClick={() => setOpen(false)}>
                                    <div className="header_drawer_menu_inner_inner">
                                        <img src={chart}/><span>{t("Statistika")}</span>
                                    </div>
                                </Link>
                                <Link to="/device" className="header_drawer_menu_inner" onClick={() => setOpen(false)}>
                                    <div className="header_drawer_menu_inner_inner">
                                        <img src={devise}/><span>{t("Qurilmalar")}</span>
                                    </div>
                                </Link>
                                {
                                    (user.role === "superadmin" || user.role === "king") &&
                                    <Link to="/admins" className="header_drawer_menu_inner"
                                          onClick={() => setOpen(false)}>
                                        <div className="header_drawer_menu_inner_inner">
                                            <img src={user2}/><span>{t("Adminlar")}</span>
                                        </div>
                                    </Link>
                                }
                                {/*<div className="header_drawer_menu_inner" onClick={openChangeAdmin}>*/}
                                {/*<div className="header_drawer_menu_inner_inner">*/}
                                {/*<img src={editIcon}/><span>{t("Tahrirlash")}</span>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                                <div className="header_drawer_menu_inner" onClick={logout}>
                                    <div className="header_drawer_menu_inner_inner">
                                        <img src={exitIcon}/><span>{t("Chiqish")}</span>
                                    </div>
                                </div>
                            </div>
                        </Drawer>
                    </>

                </div>
            </div>
        </BrowserRouter>
    )
};

export default Saidbar;