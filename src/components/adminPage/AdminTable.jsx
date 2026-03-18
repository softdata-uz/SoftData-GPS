import React from 'react';
import {Table, Image} from 'antd';
import {AiOutlineUser} from 'react-icons/ai'
import {ip} from '../../ip';
import {useTranslation} from "react-i18next";
import {RiDeleteBin5Line, RiEditLine} from "react-icons/ri";
import moment from 'moment';
import "./adminPage.css"
import {MdOutlineModeEditOutline} from "react-icons/md";


const AdminTable = (props) => {
    const {
        adminData,
        rowSelection,
        setIsOpenAddAdmin,
        setInitialValues,
        setDeleteModal,
        setDeleteId
    } = props;


    const {t} = useTranslation()


    const editAddStaff = (value, record) => {
        setInitialValues({
            ...value,
            edit: true,
        })
        setIsOpenAddAdmin(true)
    }

    const openDeleteModal = (text, record) => {
        setDeleteModal(true);
        setDeleteId(record?.id)
    }

    const columns = [
        {
            title: t('T/r'),
            dataIndex: 'key',
            align: 'center'
        },
        {
            title: t('F.I.SH'),
            dataIndex: 'name',
            align : 'center',
            // width : "280px",
            render: (text, record) => (
                <div className='table_user_cell'>
                    <Image
                        className="table_user_cell_img"
                        src={`${ip}/${record.image}`}
                        preview={{
                            mask: (
                                <AiOutlineUser size={20}/>
                            ),
                            maskClassName: 'customize-mask',
                        }}
                    />
                    <p>{record.lastname +" "+ record.firstname +" "+ record.fathersname}</p>
                </div>
            ),
        },
        {
            title: t('Login'),
            dataIndex: 'login',
            align: 'center',
            render: (text, record) => (
                <div>
                    {record?.login ? record.login : "..."}
                </div>
            )
        },
        {
            title: t('Roli'),
            dataIndex: 'role',
            align: 'center',
            render: (text, record) => (
                <div>
                    {record?.role ? (record.role == "king" ? "King" : record.role == "admin" ? "Admin" : record.role == "operator" ? "Operator" :
                        "Super Admin") : "..."}
                </div>
            )
        },
        {
            title: t('Yaratilgan vaqti'),
            dataIndex: 'created_time',
            align: 'center',
            render: (text, record) => (
                <div>
                    {record?.created_time ? moment(record?.created_time).format('DD.MM.YYYY , HH:mm') : ""}
                </div>
            )
        },
        {
            title: t('Amallar'),
            dataIndex: '',
            render: (text, record) => (

                <div className="table_edit_delite">
                    <div onClick={() => editAddStaff(text, record)} className='edit_button'>
                        <MdOutlineModeEditOutline size={16}/>
                    </div>

                    <div onClick={() => openDeleteModal(text, record)} className='delite_button'>
                        <RiDeleteBin5Line size={16}/>
                    </div>
                </div>
            ),
            align: 'center'
        },
    ];

    return (
        <Table
            // rowSelection={rowSelection}
            columns={columns}
            dataSource={adminData}
            pagination={false}
        />
    );
}
export default AdminTable
