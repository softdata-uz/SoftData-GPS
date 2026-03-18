import React, {useEffect, useState, useRef, useCallback, useMemo} from "react";
import {ip} from "../../../ip";

import {
    LoadScriptNext,
    GoogleMap,
    Polyline,
    Marker,
    useLoadScript,
    OverlayView,
    InfoWindow
} from "@react-google-maps/api";

import searchIconNew from '../../../image/search-lg (2).png';
import "leaflet/dist/leaflet.css";
import {Checkbox, Collapse, DatePicker, Drawer, message, Popover, Radio} from "antd";
import {GrLinkPrevious} from "react-icons/gr";
import moment from "moment";
import axios from "axios";

import teplavozIcon from '../../../icons/iconsNews/Group 55892.png';

import mobileMenuIcon from "../../../image/Icon.png";
import filterImg from "../../../image/filter-funnel-01.png";

import Loader from "../../loading/Loader";
import {useTranslation} from "react-i18next";
import api from "../../../service/api";
import {Link, Outlet, useNavigate, useOutletContext} from 'react-router-dom';
import TrainMarker from "./TrainMarker";
import {IoMdRefresh} from "react-icons/io";

import longIcon from '../../../icons/iconsNews/fi_3564924 (1).png';
import shortIcon from '../../../icons/iconsNews/fi_3564924.png';


const GoogleMapTrain = (props) => {

    const {filterTransPort, setFilterTransport} = useOutletContext();

    const [selectedCar, setSelectedCar] = useState(null);

    // radio filter Pop
    const [openFilterPop, setOpenFilterPop] = useState(false);
    const hidePopover = () => {
        setOpenFilterPop(false);
    };
    const handleOpenChangePopover = (newOpen) => {
        setOpenFilterPop(newOpen);
    };

    const [valueRadio, setValueRadio] = useState("all");
    const onChangeRadio = (e) => {
        setValueRadio(e.target.value);

        onClose();
        setFilterTransport({filter: [], type: filterTransPort?.type, status: e.target.value, department: ''});
        setCheckedList([]);
        setClickedMarker([]);
        setDeviseHistoryLine([]);
        hidePopover()
    };

    // radio


    const {t, i18n} = useTranslation();


    const [loading, setLoading] = useState(false)

    const [mapCenter, setMapCenter] = useState({lat: 41.2906041, lng: 69.2898571});
    const mapRef = useRef(null);

    const [mapZoom, setMapZoom] = useState(14);

    const [checkedList, setCheckedList] = useState([]);
    const [transportInfo, setTransportInfo] = useState(true);
    const [clickedMarker, setClickedMarker] = useState({});
    const [showHistoryBtn, setShowHistoryBtn] = useState(false);
    const [deviseHistoryLine, setDeviseHistoryLine] = useState([]);
    const [historyParams, setHistoryParams] = useState({
        fromDate: "",
        toDate: "",
        deviceId: "",
    });
    const [shortStops, setShortStops] = useState([]);
    const [longStops, setLongStops] = useState([]);
    const [hoveredStop, setHoveredStop] = useState(null);


    const onChangeDateFrom = (e, a) => {
        setHistoryParams({...historyParams, fromDate: a});
    };

    const onChangeDateTo = (e, a) => {
        setHistoryParams({...historyParams, toDate: a});
    };

    const clear = () => {
        setShowHistoryBtn(false);
        setDeviseHistoryLine([]);

        getSingleData(historyParams?.deviceId);

        setHistoryParams({
            ...historyParams,
            fromDate: "",
            toDate: "",
        })

    };


    const getHistoryData = () => {
        setLoading(true);
        axios.get(`${ip}/api/log-data-history`,
            {
                params: historyParams,
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            })
            .then(res => {
                const {data} = res.data;


                setShortStops(res?.data?.short_stops || []);
                setLongStops(res?.data?.long_stops || []);


                setDeviseHistoryLine(data);


                onClose();
                setLoading(false);

                const distance = res?.data?.distance;
                setClickedMarker(prev => {
                    if (!prev || typeof prev !== 'object') {
                        return {distance};
                    }
                    return {...prev, distance};
                });

            })
            .catch(err => {
                console.log(err?.response?.data);
                setLoading(false);
            })
    }
    const onChangeType = (type) => {
        setFilterTransport({
            ...filterTransPort,
            searched_data: "",
            filter: [],
            type: type,
            status: 'all'
        });
        setValueRadio('all')
        setCheckedList([]);
        setClickedMarker({});
        backInfo();
    };

    const onChange = (list) => {
        const isChecked = checkedList.some((item) => item === list.display_name);
        if (isChecked) {
            const filterChecked = checkedList.filter(
                (item) => item !== list.display_name
            );
            setCheckedList(filterChecked);
        } else {
            setCheckedList((prev) => [...prev, list.display_name]);
        }
    };
    const onSearched = () => {

        // filter ni set qilamiz
        setFilterTransport({
            filter: checkedList,
            type: filterTransPort?.type
        });

        onClose();
        setDeviseHistoryLine([]);
        setTransportInfo(true);

        // 🔥 MARKAZLASH FAQAT SHU YERDA
        if (checkedList.length > 0 && markers.length > 0) {

            const firstSelectedName = checkedList[0];

            const selectedMarker = markers.find(
                (m) => m.display_name === firstSelectedName
            );

            if (selectedMarker?.coordinate?.length === 2) {
                setMapCenter({
                    lat: selectedMarker.coordinate[0],
                    lng: selectedMarker.coordinate[1],
                });
            }
        }
    };


    const backInfo = () => {
        setSelectedCar(null)
        setTransportInfo(true);
        setClickedMarker({});
        setDeviseHistoryLine([]);
        setHistoryParams({
            fromDate: "",
            toDate: "",
            deviceId: "",
        })

        setLongStops([]);
        setShortStops([]);
    }

    const clearCheckbox = () => {
        onClose();
        setValueRadio('all');
        setFilterTransport({
            filter: [],
            type: filterTransPort?.type,
            status: 'all',
            searched_data: "" // 🔥 MUHIM
        });
        setCheckedList([]);
        setClickedMarker({});
        setDeviseHistoryLine([]);

        setSearchText(""); // 🔥 input bo‘shaydi
        shouldCenterAfterSearch.current = false; // 🔥 MUHIM
    }

    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState("bottom");
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
        // setCheckedList([]);
        // getGPSData(filterTransPort);
    };


    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const onTransportInfoChange = () => {
        setTransportInfo(false);
        if (width <= 576) {
            showDrawer();
        }
    };

    const getSingleData = (id) => {
        setLoading(true);
        axios.get(`${ip}/api/events/${id}`,
            {headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}}
        )
            .then((res) => {
                const {data} = res?.data;

                setShortStops(res?.data?.data[0]?.short_stops || []);
                setLongStops(res?.data?.data[0]?.long_stops || []);

                data?.map((item) => {
                    setClickedMarker(item);
                });

                setShowHistoryBtn(false);
                setDeviseHistoryLine([]);


                setLoading(false);
            })
            .catch((err) => {
                message.error(err?.response?.data?.msg);
                setLoading(false);
            });
    };

    // car anim

// new code

    const [markers, setMarkers] = useState([]);
    const [total, setTotal] = useState('');
    const [activeCount, setActiveCount] = useState('')

    // input orqali qidirganda markazga birinchi topilganni chiqarish
    const shouldCenterAfterSearch = useRef(false);
    const [searchText, setSearchText] = useState("");


    const getGPSData = async () => {
        try {
            const {data} = await api({
                url: "/api/events",
                method: "post",
                // data: {type: "car", searched_data: "", filter: []},
                data: filterTransPort,
            });
            setTotal(data?.count);
            setActiveCount(data?.active_count);
            // Hammasini ko'rsatish va optimizatsiya
            setMarkers((prevMarkers) => {
                const newMarkers = data.data.map((newCar) => {
                    const existingCar = prevMarkers.find(
                        (prevCar) => prevCar.device_id === newCar.device_id
                    );
                    if (
                        existingCar &&
                        existingCar.coordinate[0] === newCar.coordinate[0] &&
                        existingCar.coordinate[1] === newCar.coordinate[1] &&
                        existingCar.angle === newCar.angle
                    ) {
                        return existingCar; // O'zgarmagan holatda eskisini qaytaradi
                    }

                    return newCar; // Yangisini qaytaradi
                });


                // 🔥 AGAR SEARCH BO'LGAN BO'LSA
                if (shouldCenterAfterSearch.current && newMarkers.length > 0) {

                    const first = newMarkers[0];

                    if (first.coordinate?.length === 2) {
                        setMapCenter({
                            lat: first.coordinate[0],
                            lng: first.coordinate[1],
                        });
                    }

                    shouldCenterAfterSearch.current = false; // bir marta ishlaydi
                }


                return newMarkers; // Faqat active bo'lishidan qat'i nazar hammasini qaytaradi
            });
        } catch (error) {
            console.error("GPS data fetch error:", error);
        }
    };


    useEffect(() => {
        getGPSData();
        // Intervalga debounce qo'shamiz
        const intervalId = setInterval(getGPSData, 3000);
        return () => clearInterval(intervalId);
    }, [filterTransPort]);


    // dastlab kirilganda birinchi markerni markazda chiqarish
    const isFirstLoad = useRef(true);
    useEffect(() => {
        if (isFirstLoad.current && markers.length > 0) {
            const firstMarker = markers[0];

            if (firstMarker?.coordinate?.length === 2) {
                setMapCenter({
                    lat: firstMarker.coordinate[0],
                    lng: firstMarker.coordinate[1],
                });
                isFirstLoad.current = false; // keyingi update larda ishlamaydi
            }
        }
    }, [markers]);


    const collapseItems = useMemo(() => [
        {
            key: '2',
            label: t("Transport holati"),
            children: (
                <>
                    <div className="transprt_info_inner">
                        <div className="transprt_info_item">{t("Tezlik")}:</div>
                        <div className="transprt_info_item2">{clickedMarker?.speed} {t("km/soat")}</div>
                    </div>

                    <div className="transprt_info_inner">
                        <div className="transprt_info_item">{t("Bosib o'tgan masofasi")}</div>
                        <div className="transprt_info_item2">
                            {clickedMarker?.distance ? `${clickedMarker.distance} ${t("km")}` : ''}
                        </div>
                    </div>

                    <div className="transprt_info_inner">
                        <div className="transprt_info_item">{t("Qisqa to'xtash")}</div>
                        <div className="transprt_info_item2">
                            {shortStops?.length > 0 ? `${shortStops.length} ${t("ta")}` : 0}
                        </div>
                    </div>
                    <div className="transprt_info_inner">
                        <div className="transprt_info_item">{t("Uzoq to'xtash")}</div>
                        <div className="transprt_info_item2">
                            {longStops?.length > 0 ? `${longStops.length} ${t("ta")}` : 0}
                        </div>
                    </div>

                    {/*<div className="transprt_info_inner">*/}
                    {/*    <div className="transprt_info_item">{t("Dvigatel holati")}:</div>*/}
                    {/*    <div className="transprt_info_item2">*/}
                    {/*        {clickedMarker?.ignition === 1 ? t("yoniq") : t("o'chiq")}*/}
                    {/*    </div>*/}
                    {/*</div>*/}


                    <div className="transprt_info_inner">
                        <div className="transprt_info_item">
                            {t("Vaqt")}:
                        </div>
                        <div className="transprt_info_item2">
                            {moment(clickedMarker?.updated_time).format('DD.MM.YYYY HH:mm:ss')}
                        </div>
                    </div>
                </>
            ),
        }
    ], [clickedMarker , i18n.language]); // <-- clickedMarker o'zgarganda qayta yaratiladi


// new code

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: "AIzaSyCj4Nh4DGBTx6dFCMSPHSKtTLoIFcdyIww",
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    if (!isLoaded) return <div>Loading...</div>;


    const refreshFunction = () => {
        if (!historyParams?.deviceId) return;

        clear();
    };


    return (
        <div className="">
            {
                loading && <Loader/>
            }
            <div className="transports">

                {/*<div onClick={() => onChangeType("train")}*/}
                {/*     className={`${*/}
                {/*         filterTransPort.type === "train"*/}
                {/*             ? "transports_inner transports_inner_active"*/}
                {/*             : "transports_inner"*/}
                {/*     }`}*/}
                {/*>*/}
                {/*    <div className="transports_inner_items">*/}
                {/*        <img src={teplavozIcon} alt=""/>*/}
                {/*        {t("Teplavoz")}*/}
                {/*    </div>*/}
                {/*    <div*/}
                {/*        className={`${*/}
                {/*            filterTransPort.type === "train" ? "active_line" : ""*/}
                {/*        }`}*/}
                {/*    ></div>*/}
                {/*</div>*/}


                <h2 style={{marginLeft : "16px"}}>Transportlar</h2>

            </div>
            <div className="transprts_map">
                <div className="transprts_map_desctop">
                    {transportInfo ? (
                        <div className="transprts_map_left">
                            <div className="transprts_top">
                                <div className="transprts_title_search">
                                    <div className="transprts_title">
                                        <div className="transprts_title_line"></div>
                                        {/*{t("Teplavoz")}*/}
                                        {t("Transportlar")}
                                    </div>
                                </div>
                                {/*<hr/>*/}

                                <div className="transprts_search">
                                    <div className="filter_input">
                                        {/*<IoSearch size={24}/>*/}
                                        <img src={searchIconNew}/>
                                        {/*<input*/}
                                        {/*    onChange={(e) => {*/}
                                        {/*        setFilterTransport({*/}
                                        {/*            ...filterTransPort,*/}
                                        {/*            searched_data: e.currentTarget.value,*/}
                                        {/*        });*/}
                                        {/*    }}*/}
                                        {/*    placeholder={t("Izlash")}*/}
                                        {/*/>*/}

                                        {/*new logik*/}
                                        <input
                                            value={searchText}
                                            onChange={(e) => {
                                                const value = e.currentTarget.value;

                                                setSearchText(value); // inputni boshqaradi

                                                shouldCenterAfterSearch.current = true;

                                                setFilterTransport({
                                                    ...filterTransPort,
                                                    searched_data: value,
                                                });
                                            }}
                                            placeholder={t("Izlash")}
                                        />

                                    </div>
                                    <Popover
                                        open={openFilterPop}
                                        onOpenChange={handleOpenChangePopover}
                                        content={(
                                            <div className="transprts_search_filter_popover">
                                                <Radio.Group
                                                    style={{display: 'flex', flexDirection: 'column', gap: 8}}
                                                    onChange={onChangeRadio}
                                                    value={valueRadio}
                                                    options={[
                                                        {
                                                            value: "all",
                                                            label: t("Barchasi"),
                                                        },
                                                        {
                                                            value: "active",
                                                            label: t("Faol"),
                                                        },
                                                        {
                                                            value: "inactive",
                                                            label: t("Nofaol"),
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        )} placement="bottom">
                                        <div className="transprts_search_filter">
                                            <img src={filterImg}/>
                                        </div>
                                    </Popover>
                                </div>

                                <div className="transprts_list">
                                    {markers?.map((item, index) => {
                                        const isChecked = checkedList.some(
                                            (check) => check === item.display_name
                                        );
                                        return (
                                            <div className="transprts_items" key={index}>
                                                {item.display_name}
                                                <span>
                          <Checkbox
                              checked={isChecked}
                              onChange={() => onChange(item)}
                              type="checkbox"
                          />
                        </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="transprts_total_search">
                                {/*<hr/>*/}
                                <div className="transprts_total">
                                    <p>{t("Jami")} : {total}</p>
                                    {/*<p>{t("Faollar")} : {activeCount}</p>*/}
                                </div>

                                <div className="transprts_total_search_buttons">
                                    <div onClick={clearCheckbox} className="save_button">
                                        <button className="cansle_button">{t("Tozalash")}</button>
                                    </div>
                                    <div onClick={onSearched} className="save_button">
                                        <button className="add_button">{t("Qidirish")}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="transprts_info">
                            <div className="transprt_info_title">
                                <span onClick={backInfo}><GrLinkPrevious/>{t("Batafsil")}</span>
                                <button className="add_button" style={{width: '40px', padding: 0}}
                                        onClick={refreshFunction}
                                >
                                    <IoMdRefresh style={{fontSize: '20px'}}/>
                                </button>
                            </div>
                            <Collapse items={[{
                                key: '1', label: t("Transport haqida ma’lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Maxsus raqami")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.display_name}</div>
                                        </div>
                                        {/*<div className="underline"></div>*/}

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Izoh")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.description}</div>
                                        </div>
                                        {/*<div className="underline"></div>*/}

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Turi")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {
                                                    clickedMarker?.type == 'train' ? t("Teplavoz") : ''
                                                }
                                            </div>
                                        </div>

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Markasi va modeli")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.vehicle_model}</div>
                                        </div>

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Ishlab chiqarilgan yili")}:
                                            </div>
                                            <div
                                                className="transprt_info_item2">{clickedMarker?.vehicle_manufactured_year}</div>
                                        </div>

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Egasi")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.vehicle_driver}</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Boshqarma")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{clickedMarker?.vehicle_department}</div>*/}
                                        {/*</div>*/}

                                    </>
                            }]}/>

                            <Collapse defaultActiveKey={['2']} items={collapseItems}/>

                            <Collapse items={[{
                                key: '3', label: t("Yoqilg'i haqida ma'lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Mavjud yoqilg'i")} :
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.fuel_level > 0 ?
                                                `${clickedMarker?.fuel_level} l` : "-"}
                                            </div>
                                        </div>

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Mavjud yoqilg'i")}{t("(%)")} :*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{!clickedMarker.fuel_level_percentage ? "-" :*/}
                                        {/*        <div>{clickedMarker.fuel_level_percentage} %</div>}</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Yoqilg'i sarfi")} (100km):*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.fuel_rate} l</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Yoqilg'i quyilgan vaqt")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{clickedMarker?.last_refuel_time == null ? "" : moment(clickedMarker.last_refuel_time).format('DD.MM.YYYY, HH:mm')}</div>*/}
                                        {/*</div>*/}
                                    </>
                            }]}/>
                            <Collapse items={[{
                                key: '4', label: t("GPS haqida ma'lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("IMEI")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.device_id}</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                GSM {t("Signal")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {clickedMarker?.gsm_signal === 0 ? t("Tarmoq yo'q") :
                                                    clickedMarker?.gsm_signal === 1 ? t("Juda zaif") :
                                                        clickedMarker?.gsm_signal === 2 ? t("Zaif") :
                                                            clickedMarker?.gsm_signal === 3 ? t("O'rtacha") :
                                                                clickedMarker?.gsm_signal === 4 ? t("Yaxshi") :
                                                                    clickedMarker?.gsm_signal === 5 ? t("A'lo") :
                                                                        "Noto'g'ri signal"

                                                }
                                            </div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Battery Level")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.battery_level} %</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Model")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.model}</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("GPS o'rnatilgan sana")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {clickedMarker?.created_time ? moment(clickedMarker?.created_time).format('DD.MM.YYYY , HH:mm') : ""}
                                            </div>
                                        </div>
                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Analog Input 1")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.analog_input1}</div>*/}
                                        {/*</div>*/}
                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Analog Input 2")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.analog_input2}</div>*/}
                                        {/*</div>*/}
                                    </>
                            }]}/>
                            <div className="transprt_info_inner_view">
                                <div className="transprt_info_item">
                                    {t("Tarix")}:
                                </div>
                                <button onClick={() => setShowHistoryBtn(!showHistoryBtn)} className="view_button">
                                    {
                                        showHistoryBtn ? t("Bekor qilish") : t("Ko'rish")
                                    }
                                </button>
                            </div>
                            <div className="underline"></div>

                            {showHistoryBtn && <div className="transprt_info_inner_view">
                                <div className="history_line_datePicker">
                                    <p className='input_label'>
                                        {t("Dan")}:
                                    </p>
                                    <DatePicker
                                        placeholder={`${moment(new Date()).format(
                                            "YYYY.DD.MM, 00:00:00"
                                        )}`}
                                        onChange={onChangeDateFrom}
                                        size="large"
                                        style={{width: "100%", borderRadius: '5px'}}
                                        showTime
                                    />
                                    <p className='input_label'>
                                        {t("Gacha")}:
                                    </p>
                                    <DatePicker
                                        placeholder={`${moment(new Date()).format(
                                            "YYYY.DD.MM, 23:59:59"
                                        )}`}
                                        onChange={onChangeDateTo}
                                        size="large"
                                        style={{width: "100%", borderRadius: '5px'}}
                                        showTime
                                    />

                                    <div className="save_cansle_buttons">
                                        <div className="save_button">
                                            <button onClick={clear} className="cansle_button">
                                                {t("Bekor qilish")}
                                            </button>
                                        </div>
                                        <div className="save_button">
                                            <button onClick={getHistoryData} className="add_button">
                                                {t("Saqlash")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                    )}
                </div>

                <Drawer
                    title=""
                    placement={placement}
                    // closable={false}
                    onClose={onClose}
                    open={open}
                    key={placement}
                >
                    {transportInfo ? (
                        <div className="transprts_map_left">
                            <div className="transprts_top">
                                <div className="transprts_title_search">
                                    <div className="transprts_title">
                                        <div className="transprts_title_line"></div>
                                        {t("Teplavoz")}
                                    </div>
                                </div>
                                {/*<hr/>*/}

                                <div className="transprts_search">
                                    <div className="filter_input">
                                        {/*<IoSearch size={24}/>*/}
                                        <img src={searchIconNew}/>
                                        {/*<input*/}
                                        {/*    onChange={(e) => {*/}
                                        {/*        setFilterTransport({*/}
                                        {/*            ...filterTransPort,*/}
                                        {/*            searched_data: e.currentTarget.value,*/}
                                        {/*        });*/}
                                        {/*    }}*/}
                                        {/*    placeholder={t("Izlash")}*/}
                                        {/*/>*/}

                                        <input
                                            value={searchText}
                                            onChange={(e) => {
                                                const value = e.currentTarget.value;

                                                setSearchText(value); // inputni boshqaradi

                                                shouldCenterAfterSearch.current = true;

                                                setFilterTransport({
                                                    ...filterTransPort,
                                                    searched_data: value,
                                                });
                                            }}
                                            placeholder={t("Izlash")}
                                        />


                                    </div>
                                    <Popover
                                        open={openFilterPop}
                                        onOpenChange={handleOpenChangePopover}
                                        content={(
                                            <div className="transprts_search_filter_popover">
                                                <Radio.Group
                                                    style={{display: 'flex', flexDirection: 'column', gap: 8}}
                                                    onChange={onChangeRadio}
                                                    value={valueRadio}
                                                    options={[
                                                        {
                                                            value: "all",
                                                            label: t("Barchasi"),
                                                        },
                                                        {
                                                            value: "active",
                                                            label: t("Faol"),
                                                        },
                                                        {
                                                            value: "inactive",
                                                            label: t("Nofaol"),
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        )} placement="bottom">
                                        <div className="transprts_search_filter">
                                            <img src={filterImg}/>
                                        </div>
                                    </Popover>
                                </div>

                                <div className="transprts_list">
                                    {markers?.map((item, index) => {
                                        const isChecked = checkedList.some(
                                            (check) => check === item.display_name
                                        );
                                        return (
                                            <div className="transprts_items" key={index}>
                                                {item.display_name}
                                                <span>
                          <Checkbox
                              checked={isChecked}
                              onChange={() => onChange(item)}
                              type="checkbox"
                          />
                        </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="transprts_total_search">
                                {/*<hr/>*/}
                                <div className="transprts_total">
                                    <p>{t("Jami")} : {total}</p>
                                    {/*<p>{t("Faollar")} : {activeCount}</p>*/}
                                </div>

                                <div className="transprts_total_search_buttons">
                                    <div onClick={clearCheckbox} className="save_button">
                                        <button className="cansle_button">{t("Tozalash")}</button>
                                    </div>
                                    <div onClick={onSearched} className="save_button">
                                        <button className="add_button">{t("Qidirish")}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="transprts_info">
                            <div className="transprt_info_title">
                                <span onClick={backInfo}><GrLinkPrevious/>{t("Batafsil")}</span>
                                <button className="add_button" style={{width: '40px', padding: 0}}
                                        onClick={refreshFunction}
                                >
                                    <IoMdRefresh style={{fontSize: '20px'}}/>
                                </button>
                            </div>
                            <Collapse items={[{
                                key: '1', label: t("Transport haqida ma’lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Maxsus raqami")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.display_name}</div>
                                        </div>
                                        {/*<div className="underline"></div>*/}

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Izoh")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.description}</div>
                                        </div>
                                        {/*<div className="underline"></div>*/}

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Turi")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {
                                                    clickedMarker?.type == 'train' ? t("Teplavoz") : ''
                                                }
                                            </div>
                                        </div>

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Markasi va modeli")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.vehicle_model}</div>
                                        </div>

                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Ishlab chiqarilgan yili")}:
                                            </div>
                                            <div
                                                className="transprt_info_item2">{clickedMarker?.vehicle_manufactured_year}</div>
                                        </div>

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Egasi")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.vehicle_driver}</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Boshqarma")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{clickedMarker?.vehicle_department}</div>*/}
                                        {/*</div>*/}

                                    </>
                            }]}/>

                            <Collapse defaultActiveKey={['2']} items={collapseItems}/>

                            <Collapse items={[{
                                key: '3', label: t("Yoqilg'i haqida ma'lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Mavjud yoqilg'i")} :
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.fuel_level > 0 ?
                                                `${clickedMarker?.fuel_level} l` : "-"}
                                            </div>
                                        </div>

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Mavjud yoqilg'i")}{t("(%)")} :*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{!clickedMarker.fuel_level_percentage ? "-" :*/}
                                        {/*        <div>{clickedMarker.fuel_level_percentage} %</div>}</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Yoqilg'i sarfi")} (100km):*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.fuel_rate} l</div>*/}
                                        {/*</div>*/}

                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Yoqilg'i quyilgan vaqt")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="transprt_info_item2">{clickedMarker?.last_refuel_time == null ? "" : moment(clickedMarker.last_refuel_time).format('DD.MM.YYYY, HH:mm')}</div>*/}
                                        {/*</div>*/}
                                    </>
                            }]}/>
                            <Collapse items={[{
                                key: '4', label: t("GPS haqida ma'lumot"),
                                children:
                                    <>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("IMEI")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.device_id}</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                GSM {t("Signal")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {clickedMarker?.gsm_signal === 0 ? t("Tarmoq yo'q") :
                                                    clickedMarker?.gsm_signal === 1 ? t("Juda zaif") :
                                                        clickedMarker?.gsm_signal === 2 ? t("Zaif") :
                                                            clickedMarker?.gsm_signal === 3 ? t("O'rtacha") :
                                                                clickedMarker?.gsm_signal === 4 ? t("Yaxshi") :
                                                                    clickedMarker?.gsm_signal === 5 ? t("A'lo") :
                                                                        "Noto'g'ri signal"

                                                }
                                            </div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Battery Level")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.battery_level} %</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("Model")}:
                                            </div>
                                            <div className="transprt_info_item2">{clickedMarker?.model}</div>
                                        </div>
                                        <div className="transprt_info_inner">
                                            <div className="transprt_info_item">
                                                {t("GPS o'rnatilgan sana")}:
                                            </div>
                                            <div className="transprt_info_item2">
                                                {clickedMarker?.created_time ? moment(clickedMarker?.created_time).format('DD.MM.YYYY , HH:mm') : ""}
                                            </div>
                                        </div>
                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Analog Input 1")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.analog_input1}</div>*/}
                                        {/*</div>*/}
                                        {/*<div className="transprt_info_inner">*/}
                                        {/*    <div className="transprt_info_item">*/}
                                        {/*        {t("Analog Input 2")}:*/}
                                        {/*    </div>*/}
                                        {/*    <div className="transprt_info_item2">{clickedMarker?.analog_input2}</div>*/}
                                        {/*</div>*/}
                                    </>
                            }]}/>
                            <div className="transprt_info_inner_view">
                                <div className="transprt_info_item">
                                    {t("Tarix")}:
                                </div>
                                <button onClick={() => setShowHistoryBtn(!showHistoryBtn)} className="view_button">
                                    {
                                        showHistoryBtn ? t("Bekor qilish") : t("Ko'rish")
                                    }
                                </button>
                            </div>
                            <div className="underline"></div>

                            {showHistoryBtn && <div className="transprt_info_inner_view">
                                <div className="history_line_datePicker">
                                    <p className='input_label'>
                                        {t("Dan")}:
                                    </p>
                                    <DatePicker
                                        placeholder={`${moment(new Date()).format(
                                            "YYYY.DD.MM, 00:00:00"
                                        )}`}
                                        onChange={onChangeDateFrom}
                                        size="large"
                                        style={{width: "100%", borderRadius: '5px'}}
                                        showTime
                                    />
                                    <p className='input_label'>
                                        {t("Gacha")}:
                                    </p>
                                    <DatePicker
                                        placeholder={`${moment(new Date()).format(
                                            "YYYY.DD.MM, 23:59:59"
                                        )}`}
                                        onChange={onChangeDateTo}
                                        size="large"
                                        style={{width: "100%", borderRadius: '5px'}}
                                        showTime
                                    />

                                    <div className="save_cansle_buttons">
                                        <div className="save_button">
                                            <button onClick={clear} className="cansle_button">
                                                {t("Bekor qilish")}
                                            </button>
                                        </div>
                                        <div className="save_button">
                                            <button onClick={getHistoryData} className="add_button">
                                                {t("Saqlash")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                    )}
                </Drawer>

                <div className="transprts_map_right">
                    <div className="saidbar_inner_mobile" onClick={showDrawer}>
                        <img src={mobileMenuIcon}/>
                    </div>

                    <GoogleMap
                        zoom={mapZoom}
                        center={mapCenter}
                        mapContainerStyle={{height: "100%", width: "100%"}}
                        onLoad={onLoad}
                    >


                        {/* 🔵 Short stop nuqtalar */}
                        {shortStops?.map((coord, index) => (
                            <OverlayView
                                key={`short-${index}`}
                                position={{lat: coord?.coordinate[0], lng: coord?.coordinate[1]}}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div
                                    onMouseEnter={() =>
                                        setHoveredStop({
                                            ...coord,
                                            type: "short",
                                            index
                                        })
                                    }
                                    onMouseLeave={() => setHoveredStop(null)}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        transform: "translate(-50%, -100%)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <img
                                        className='info_icon_short'
                                        src={shortIcon}
                                        alt="vehicle"
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none"
                                        }}
                                    />
                                </div>
                            </OverlayView>
                        ))}

                        {/* 🔴 Long stop nuqtalar */}
                        {longStops?.map((coord, index) => (
                            <OverlayView
                                key={`long-${index}`}
                                position={{lat: coord?.coordinate[0], lng: coord?.coordinate[1]}}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div
                                    onMouseEnter={() =>
                                        setHoveredStop({
                                            ...coord,
                                            type: "long",
                                            index
                                        })
                                    }
                                    onMouseLeave={() => setHoveredStop(null)}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        transform: "translate(-50%, -100%)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <img
                                        className='info_icon_long'
                                        src={longIcon}
                                        alt="vehicle"
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none"
                                        }}
                                    />
                                </div>
                            </OverlayView>
                        ))}

                        {hoveredStop && (
                            <InfoWindow
                                position={{
                                    lat: hoveredStop?.coordinate[0],
                                    lng: hoveredStop?.coordinate[1]
                                }}
                                options={{
                                    pixelOffset: new window.google.maps.Size(0, -30)
                                }}
                            >
                                <div className="info_short_long">
                                    <h2>{hoveredStop?.type === "short" ? t("Qisqa to'xtash") : t("Uzoq to'xtash")}</h2>
                                    <p>{t("Davomiyligi")} : {hoveredStop?.stop_duration}</p>
                                    <p>{t("Boshlanish")} : {moment(hoveredStop?.stop_start_time).format('DD.MM.YYYY , HH:mm:ss')}</p>
                                    <p>{t("Tugash")} : {moment(hoveredStop?.stop_end_time).format('DD.MM.YYYY , HH:mm:ss')}</p>
                                    <p>{t("Joylashuv")} : {hoveredStop?.coordinate[0]} , {hoveredStop?.coordinate[1]}</p>
                                </div>
                            </InfoWindow>
                        )}


                        {/* 🔴 1. TARIX (QIZIL LINE) */}
                        {deviseHistoryLine?.length > 0 && (
                            <Polyline
                                path={deviseHistoryLine.map(([lat, lng]) => ({lat, lng}))}
                                options={{strokeColor: "red"}}
                            />
                        )}

                        {/* 🟢 2. LIVE ROUTE (YASHIL LINE) — faqat tarix yo‘q bo‘lsa */}
                        {!deviseHistoryLine?.length && clickedMarker?.route?.length > 0 && (
                            <Polyline
                                path={clickedMarker.route.map(([lat, lng]) => ({lat, lng}))}
                                options={{strokeColor: "green"}}
                            />
                        )}

                        {/* 🚆 3. MARKERLAR HAR DOIM KO‘RINADI */}
                        {markers.map((car) => (
                            <TrainMarker
                                key={car.device_id}
                                car={car}
                                setMapZoom={setMapZoom}
                                setHistoryParams={setHistoryParams}
                                historyParams={historyParams}
                                onTransportInfoChange={onTransportInfoChange}
                                setMapCenter={setMapCenter}
                                selectedCar={selectedCar}
                                setSelectedCar={setSelectedCar}
                                getGPSData={getGPSData}
                                getSingleData={getSingleData}
                            />
                            ))}

                    </GoogleMap>


                </div>
            </div>
        </div>
    )
        ;
}

export default GoogleMapTrain;