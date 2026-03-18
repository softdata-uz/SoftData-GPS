import React from 'react';
import {message, Space, Table, Tag} from 'antd';
import {MdOutlineModeEditOutline} from "react-icons/md";
import {RiDeleteBin5Line} from "react-icons/ri";
import {ip} from "../../ip";


import axios from "axios";
import {useTranslation} from "react-i18next";

const DeviseTable = (props) => {

    const {
        deviseData,
        setDeviseInitialValue,
        setIsOpenModal,
        getDeviseData,
        setDeleteModal,
        setDeleteId
    } = props

    const {t, i18n} = useTranslation();
    const editDevise = (value, record) => {

        setDeviseInitialValue({
            ...value,
            edit: true
        })
        setIsOpenModal(true)
    }

    const handleDeleteDevise = (text, record) => {
        // console.log(record.id)
        axios.delete(`${ip}/api/device/${record.id}`,
            {
                data: record.id,
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            })
            .then(res => {
                message.success(t("Ma'lumotlar o'chirildi"), 5);
                getDeviseData();
            })
            .catch(err => {
                console.log(err)
            })
    }


    const openDeleteModal = (text, record) => {
        setDeleteModal(true);
        setDeleteId(record?.id)
    }

    const columns = [
        {
            title: t("IMEI"),
            dataIndex: 'id',
            key: 'id',
            align: 'center',
        },
        {
            title: t("Maxsus raqami"),
            dataIndex: 'display_name',
            key: 'display_name',
            align: 'center',
        },
        {
            title: t("Transport turi"),
            dataIndex: 'type',
            // key: 'type',
            align: 'center',
            render: (text, record) => (
                <div>
                    {
                        record?.type == 'train' ? t("Teplavoz") :
                            record?.type == 'truck' ? t("Og'ir avtomobil") :
                                record?.type == 'bus' ? t("Avtobus") :
                                    record?.type == 'car' ? t("Yengil avtomobil") :
                                        record?.type == 'ladder' ? t("Trap") :
                                            record?.type == 'tractor' ? t("Traktor") :
                                                record?.type == 'reloaded' ? t("Autolift") :
                                                    record?.type == 'tz' ? t("tz") :
                                                        record?.type == 'firetruck' ? t("firetruck") :
                                                            record?.type == 'specialcar' ? t("specialcar") :
                                                                record?.type == 'lenta' ? t("lenta") :
                                                                    t("IBP")
                    }
                </div>
            )
        },
        {
            title: t("Izoh"),
            key: 'description',
            dataIndex: 'description',
            align: 'center',
        },
        {
            title: t("Telefon raqami"),
            key: 'phone_number',
            dataIndex: 'phone_number',
            align: 'center',
        },
        {
            title: t('IP manzili'),
            key: 'ip_address',
            dataIndex: 'ip_address',
            align: 'center',
        },
        {
            title: t('Maksimal tezlik'),
            key: 'limit_speed',
            dataIndex: 'limit_speed',
            align: 'center',
        },
        {
            title: t("Amallar"),
            dataIndex: '',
            align: 'center',
            render: (text, record) => (
                <div className="table_edit_delite">
                    <div onClick={() => editDevise(text, record)} className='edit_button'>
                        <MdOutlineModeEditOutline size={16}/>
                    </div>

                    <div onClick={() => openDeleteModal(text, record)} className='delite_button'>
                        <RiDeleteBin5Line size={16}/>
                    </div>
                </div>
            ),
        },

    ];

    return (<Table
        columns={columns}
        dataSource={deviseData}
        pagination={false}
    />);
}

export default DeviseTable;