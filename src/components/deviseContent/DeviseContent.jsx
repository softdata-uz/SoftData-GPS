import React, {useEffect, useState} from 'react';
import {ip} from "../../ip";
import axios from "axios";
import moment from "moment";
import DeviseTable from "./DeviseTable";
import DevisePagination from "./DevisePagination";
import DeviseModal from "./deviseModal/DeviseModal";
import {FiSearch} from "react-icons/fi";
import {IoMdAdd} from "react-icons/io";
import Loader from "../loading/Loader";
import {useTranslation} from "react-i18next";
import './deviseContent.css';
import DeviceDeleteModal from "./diveceDeleteModal/DeviceDeleteModal";
import searchIcon from '../../image/search-2-line.png';
import debounce from "lodash.debounce";


const DeviseContent = () => {


    const {t, i18n} = useTranslation();

    const [loading, setLoading] = useState(false);

    const [devisePaginationLimit, setDevisePaginationLimit] = useState(15)
    const [devisePaginationCurrent, setDevisePaginationCurrent] = useState(1)
    const [deviseData, setDeviseData] = useState([])
    const [deviseTotal, setDeviseTotal] = useState(null)
    const [searchedData, setSearchedData] = useState('');

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [deviseInitialValue, setDeviseInitialValue] = useState({
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

    const handleSearch = debounce((value) => {
        setSearchedData(value);
    }, 500);

    const getDeviseData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${ip}/api/device/${devisePaginationLimit}/${id}`,
                {
                    params: {searched_data: searchedData},
                    headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
                }
            );

            // console.log("Server javobi:", response);

            const {data} = response;
            if (!data || !data.data) {
                throw new Error("Noto‘g‘ri server javobi");
            }

            const count = data.count;
            setDeviseTotal(count);

            const newData = data?.data?.map((item, index) => ({
                ...item,
                key: index + 1 + (data.current_page - 1) * devisePaginationLimit,
                id: item.id,
                model: item.model,
                display_name: item.display_name,
                type: item.type,
                description: item.description,
                ip_address: item.ip_address,
                limit_speed: item.limit_speed,
                phone_number: item.phone_number,
                vehicle_model: item.vehicle_model,
                vehicle_manufactured_year: item.vehicle_manufactured_year,
                vehicle_driver: item.vehicle_driver,
                vehicle_department: item.vehicle_department,
                created_time: moment(item.created_time).format('DD.MM.YYYY, HH:mm:ss'),
            }));

            setDeviseData(newData);
        } catch (error) {
            if (error.response) {
                console.error("Server javobi:", error.response.data);
            } else if (error.request) {
                console.error("So‘rov yuborildi, lekin javob kelmadi:", error.request);
            } else {
                console.error("Xato haqida ma'lumot:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };


    // console.log(deviseInitialValue)
    const devisePaginationOnChange = (e = 1, option) => {
        getDeviseData(e)
        setDevisePaginationCurrent(e)
        setDevisePaginationLimit(option)
    }

    useEffect(() => {
        getDeviseData(devisePaginationCurrent)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devisePaginationLimit, devisePaginationCurrent, searchedData])

// for delete func
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    return (
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
                                    setDevisePaginationCurrent(1);
                                    handleSearch(e.currentTarget.value);
                                }}
                            />
                        </div>
                        <div className="devise_inner_info_top_right">
                            <button onClick={() => setIsOpenModal(true)} className="add_button">
                                <IoMdAdd size="20"/>
                                {t("Yangi qo'shish")}
                            </button>
                        </div>
                    </div>
                    <div className="devise_inner_info_bottom">
                        <DeviseTable
                            deviseData={deviseData}
                            setDeviseInitialValue={setDeviseInitialValue}
                            setIsOpenModal={setIsOpenModal}
                            getDeviseData={getDeviseData}
                            setDeleteModal={setDeleteModal}
                            setDeleteId={setDeleteId}
                        />
                    </div>
                </div>
                <div className="devise_inner_pagination">
                    <DevisePagination
                        devisePaginationLimit={devisePaginationLimit}
                        devisePaginationCurrent={devisePaginationCurrent}
                        devisePaginationOnChange={devisePaginationOnChange}
                        deviseTotal={deviseTotal}
                    />
                    <div className="devise_total">
                        {t("Jami")} : {deviseTotal}
                    </div>
                </div>
            </div>
            <DeviseModal
                setLoading={setLoading}
                loading={loading}
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                deviseInitialValue={deviseInitialValue}
                setDeviseInitialValue={setDeviseInitialValue}
                getDeviseData={getDeviseData}
                devisePaginationCurrent={devisePaginationCurrent}
            />
            <DeviceDeleteModal
                getDeviseData={getDeviseData}
                deleteModal={deleteModal}
                setDeleteModal={setDeleteModal}
                setDeleteId={setDeleteId}
                deleteId={deleteId}
            />
        </div>
    );
};

export default DeviseContent;