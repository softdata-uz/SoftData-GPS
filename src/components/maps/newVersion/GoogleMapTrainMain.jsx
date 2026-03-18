import React, {useEffect, useState, useRef, useCallback, useMemo} from "react";
import "leaflet/dist/leaflet.css";
import "./googleMapTrainMain.css";
import {Checkbox, Collapse, DatePicker, Drawer, message, Popover, Radio} from "antd";
import Loader from "../../loading/Loader";
import {useTranslation} from "react-i18next";
import {Link, Outlet, useNavigate} from 'react-router-dom';

const GoogleMapTrainMain = () => {
    const {t, i18n} = useTranslation();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const [filterTransPort, setFilterTransport] = useState({
        searched_data: "", status: 'all', type: ['bus' , 'car' , 'truck'], filter: [], department: ''
    });


    return (
        <div className="">
            {
                loading && <Loader/>
            }

            <div className="content_body">
                <Outlet context={{filterTransPort , setFilterTransport}}/>
            </div>
        </div>
    );
}

export default GoogleMapTrainMain;