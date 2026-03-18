import React from 'react';
import Modal from "react-modal";
import axios from "axios";
import {ip} from "../../../ip";
import {useTranslation} from "react-i18next";
import './deviceDeleteModal.css';
import {message} from "antd";

const DeviceDeleteModal = (props) => {

    const {t} = useTranslation();

    const {
        getDeviseData,
        deleteModal,
        setDeleteModal,
        setDeleteId,
        deleteId
    } = props;

    const cencel = () => {
        setDeleteModal(false);
        setDeleteId(null);
    }


    const deleteAdd = () => {
        axios.delete(`${ip}/api/device/${deleteId}`,
            {
                data: deleteId,
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            })
            .then(res => {
                message.success(t("Ma'lumotlar o'chirildi"), 5);
                getDeviseData();
                cencel();
            })
            .catch(err => {
                console.log(err)
            })
    }


    return (
        <div>
            <Modal
                isOpen={deleteModal}
                onRequestClose={cencel}
                contentLabel="My dialog"
                className="mymodal"
                overlayClassName="myoverlay"
                closeTimeoutMS={0}
            >
                <div className="delete_modal">
                    <div className="delete_modal_header">
                        <h2>{t("Rostdan ham o'chirmoqchimisiz ?")}</h2>
                    </div>
                    <div className="delete_modal_body">
                        <button className="cansle_button" onClick={cencel}>{t("Yo'q")}</button>
                        <button className="add_button" onClick={() => deleteAdd()}>{t("Ha")}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeviceDeleteModal;