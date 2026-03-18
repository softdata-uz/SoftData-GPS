import React, {useEffect, useState} from 'react';
import AdminTable from "./AdminTable";
import axios from "axios";
import {ip} from "../../ip";


import {useTranslation} from "react-i18next";
import './adminPage.css';
import {message} from "antd";
import AdminPagination from "./AdminPagination";
import {MdOutlineAddCircleOutline} from "react-icons/md";
import {AiOutlineDelete} from "react-icons/ai";
import Loader from "../loading/Loader";
import searchIcon from "../../image/search-2-line.png";
import {IoMdAdd} from "react-icons/io";
import AddAdmins from "./addAdmins/AddAdmins";
import AdminDeleteModal from "./adminDeleteModal/AdminDeleteModal";
import debounce from "lodash.debounce";

const AdminPage = () => {
    const {t, i18n} = useTranslation()
    const [loading, setLoading] = useState(false)

    const [isOpenAddAdmin, setIsOpenAddAdmin] = useState(false)
    const [adminPaginationLimit, setAdminPaginationLimit] = useState(15)
    const [adminPaginationCurrent, setAdminPaginationCurrent] = useState(1);
    const [adminData, setAdminData] = useState([])
    const [adminTotal, setAdminTotal] = useState(null)
    const [deleteAdmin, setDeleteAdmin] = useState([]);
    const [adminSelectionState, setAdminSelectionState] = useState({selectedRowKeys: []})

    const [searchedData, setSearchedData] = useState('');

    const [isOpenModal, setIsOpenModal] = useState(false)

    const [initialValues, setInitialValues] = useState({
        lastname: '',
        firstname: '',
        fathersname: '',
        role: '',
        image: '',
        created_time: '',
        login: '',
        password: '',
        id: '',
    });

    const addNewAdmin = () => {
        setIsOpenAddAdmin(true)
    }


    const handleSearch = debounce((value) => {
        setSearchedData(value);
    }, 500);

    const getAdminData = async (id) => {
        try {
            setLoading(true);

            const response = await axios.get(`${ip}/api/admin`,
                {
                    params: {
                        // extra : {
                        limit: adminPaginationLimit,
                        offset: id,
                        searched_data: searchedData,
                        // }
                    },
                    headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
                }
            )
            const {data} = response;
            const count = data.count;
            setAdminTotal(count);
            const newData = data?.data?.map((item, index) => (
                {
                    ...item,
                    key: index + 1 + (data.current_page - 1) * adminPaginationLimit,
                    fathersname: item.fathersname,
                    lastname: item.lastname,
                    firstname: item.firstname,
                    role: item.role,
                    login: item.login,
                    image: item.image,
                    id: item.id,
                }
            ))
            setAdminData(newData);

        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleDeleteAdmin = () => {
        setLoading(true);
        axios.delete(`${ip}/api/delete/admin`,
            {
                data: deleteAdmin,
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            })
            .then(res => {
                message.success("Admin ma'lumotlari o'chirildi", 5);
                setDeleteAdmin([]);
                setAdminSelectionState({selectedRowKeys: []});
                getAdminData(adminPaginationCurrent);
                setLoading(false);
            })
            .catch(err => {
                // console.log(err?.response?.data)
            })
    }

    const adminPaginationOnChange = (e = 1, option) => {
        getAdminData(e)
        setAdminPaginationCurrent(e)
        setAdminPaginationLimit(option)
    }

    const onAdminSelectChange = (selectedRowKeys, a) => {
        setAdminSelectionState({selectedRowKeys})
        setDeleteAdmin(a.map(item => item.id));
    };

    const adminRowSelection = {
        selectedRowKeys: adminSelectionState?.selectedRowKeys,
        onChange: onAdminSelectChange,
    }


    useEffect(() => {
        getAdminData(adminPaginationCurrent)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminPaginationLimit, adminPaginationCurrent , searchedData]);


    const [deleteModal , setDeleteModal] = useState(false);
    const [deleteId , setDeleteId] = useState(null);

    return (
        <div>

            <div className="devise">
                {
                    loading && <Loader/>
                }
                <div className="devise_inner">
                    <div className="devise_inner_info">
                        <div className="devise_inner_info_top">
                            <div className="devise_header_search">
                                <img src={searchIcon} alt="Search Icon"/>
                                <input
                                    placeholder={t("Izlash")}
                                    onChange={(e) => {
                                        setAdminPaginationCurrent(1);
                                        handleSearch(e.currentTarget.value);
                                    }}
                                />
                            </div>
                            <div className="devise_inner_info_top_right">
                                <button onClick={() => setIsOpenAddAdmin(true)} className="add_button">
                                    <IoMdAdd size="20"/>
                                    {t("Yangi qo'shish")}
                                </button>
                            </div>
                        </div>
                        <div className="devise_inner_info_bottom">
                            <AdminTable
                                adminData={adminData}
                                rowSelection={adminRowSelection}
                                setIsOpenAddAdmin={setIsOpenAddAdmin}
                                setInitialValues={setInitialValues}
                                setDeleteModal={setDeleteModal}
                                setDeleteId={setDeleteId}
                            />
                        </div>
                    </div>
                    <div className="devise_inner_pagination">
                        <AdminPagination
                            adminPaginationLimit={adminPaginationLimit}
                            adminPaginationCurrent={adminPaginationCurrent}
                            adminPaginationOnChange={adminPaginationOnChange}
                            adminTotal={adminTotal}
                        />
                        <div className="devise_total">
                            {t("Jami")} : {adminTotal}
                        </div>
                    </div>
                </div>
                <AddAdmins
                    setLoading={setLoading}
                    isOpenAddAdmin={isOpenAddAdmin}
                    setIsOpenAddAdmin={setIsOpenAddAdmin}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    getAdminData={getAdminData}
                    adminPaginationCurrent={adminPaginationCurrent}
                />

                <AdminDeleteModal
                    getAdminData={getAdminData}
                    deleteModal={deleteModal}
                    setDeleteModal={setDeleteModal}
                    setDeleteId={setDeleteId}
                    deleteId={deleteId}
                />
            </div>
        </div>
    );
};

export default AdminPage;