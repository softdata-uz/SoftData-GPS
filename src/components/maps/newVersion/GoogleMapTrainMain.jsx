import React, {useState} from "react";
import {Outlet} from 'react-router-dom';
import "./googleMapTrainMain.css";

// Holds the vehicle filter so it survives navigation between nested map routes.
const GoogleMapTrainMain = () => {
    const [filterTransPort, setFilterTransport] = useState({
        searched_data: "",
        status: 'all',
        type: ['bus', 'car', 'truck'],
        filter: [],
        department: '',
    });

    return (
        <div className="content_body">
            <Outlet context={{filterTransPort, setFilterTransport}}/>
        </div>
    );
};

export default GoogleMapTrainMain;
