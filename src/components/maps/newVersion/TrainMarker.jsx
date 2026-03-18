import React, {memo, useEffect, useRef, useState} from "react";
import {OverlayView, InfoWindow} from "@react-google-maps/api";

import teplavoz from '../../../icons/iconsNews/Train.png';
import teplavozRed from '../../../icons/iconsNews/Train (1).png';

// Iconlar

import car from '../../../icons/iconsNews/Car (3).png';
import carRed from '../../../icons/iconsNews/Car (4).png';
import truck from '../../../icons/iconsNews/Truck (2).png';
import truckRed from '../../../icons/iconsNews/Truck (3).png';
import bus from '../../../icons/iconsNews/Bus (2).png';
import busRed from '../../../icons/iconsNews/Bus (3).png';
import trap from '../../../icons/iconsNews/Trap (3).png';
import trapRed from '../../../icons/iconsNews/Trap (4).png';
import tractor from '../../../icons/iconsNews/Reloader.png';
import tractorRed from '../../../icons/iconsNews/Reloader (1).png';
import autolift from '../../../icons/iconsNews/Lift.png';
import autoliftRed from '../../../icons/iconsNews/Lift (1).png';
import ibp from '../../../icons/iconsNews/IBP (3).png';
import ibpRed from '../../../icons/iconsNews/IBP (4).png';
import lenta from '../../../icons/iconsNews/Lenta (3).png';
import lentaRed from '../../../icons/iconsNews/Lenta (1).png';
import tz from '../../../icons/iconsNews/TZ (1).png';
import tzRed from '../../../icons/iconsNews/TZ (2).png';
import fireCar from '../../../icons/iconsNews/Firetruck.png';
import fireCarRed from '../../../icons/iconsNews/Firetruck (1).png';
import specialcar from '../../../icons/iconsNews/05.png';
import specialcarRed from '../../../icons/iconsNews/05 (1).png';

// Iconlar obyekt sifatida
const vehicleIcons = {
    train: {active: teplavoz, inactive: teplavozRed},
    car: {active: car, inactive: carRed},
    bus: {active: bus, inactive: busRed},
    truck: {active: truck, inactive: truckRed},
    ibp: {active: ibp, inactive: ibpRed},
    ladder: {active: trap, inactive: trapRed},
    tractor: {active: tractor, inactive: tractorRed},
    reloaded: {active: autolift, inactive: autoliftRed},
    lenta: {active: lenta, inactive: lentaRed},
    tz: {active: tz, inactive: tzRed},
    firetruck: {active: fireCar, inactive: fireCarRed},
    specialcar: {active: specialcar, inactive: specialcarRed},
};

const TrainMarker = ({
                         car,
                         setHistoryParams,
                         historyParams,
                         onTransportInfoChange,
                         setMapCenter,
                         setMapZoom,
                         selectedCar,
                         setSelectedCar,
                         getGPSData,
                         getSingleData,
                     }) => {
    const {angle = 0, coordinate = [0, 0], active = false, display_name, type, device_id, date_time} = car || {};

    const [position, setPosition] = useState({lat: coordinate[0], lng: coordinate[1]});
    const [rotation, setRotation] = useState(angle);
    const [hovered, setHovered] = useState(false);

    const prevTimeRef = useRef(date_time);
    const rotationRef = useRef(angle);
    const animationRef = useRef(null);

    const lerp = (a, b, t) => a + (b - a) * t;

    useEffect(() => {
        if (!coordinate || !date_time) return;

        const start = {...position};
        const end = {lat: coordinate[0], lng: coordinate[1]};
        const startRotation = rotationRef.current;
        const endRotation = angle;

        const timeDiff = (new Date(date_time) - new Date(prevTimeRef.current)) || 3000;
        prevTimeRef.current = date_time;

        let startTime;

        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const animateMarker = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / timeDiff, 1);

            const newLat = lerp(start.lat, end.lat, progress);
            const newLng = lerp(start.lng, end.lng, progress);
            const newRotation = lerp(startRotation, endRotation, progress);

            setPosition({lat: newLat, lng: newLng});
            setRotation(newRotation);
            rotationRef.current = newRotation;

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateMarker);
            } else {
                setPosition(end);
                setRotation(endRotation);
            }
        };

        animationRef.current = requestAnimationFrame(animateMarker);

        return () => cancelAnimationFrame(animationRef.current);
    }, [coordinate, angle, date_time]);

    const iconUrl = vehicleIcons[type]
        ? (active ? vehicleIcons[type].active : vehicleIcons[type].inactive)
        : car;

    const handleClick = () => {
        getSingleData(device_id); // 🔥 HAR BOSILGANDA YANGILANADI

        setHistoryParams({...historyParams,   fromDate: "", toDate: "", deviceId: device_id});

        onTransportInfoChange();
        setMapCenter(position);
        setMapZoom(14);
        setSelectedCar(device_id);
    };


    return (
        <>
            <OverlayView
                position={position}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
                <div
                    onClick={handleClick}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        width: 50,
                        height: 50,
                        transform: `
        translate(-50%, -50%)
        rotate(${rotation}deg)
        scale(${hovered || selectedCar === device_id ? 1.15 : 1})
      `,
                        transformOrigin: "center center",
                        transition: "transform 0.25s ease",
                        cursor: "pointer",
                        willChange: "transform"
                    }}
                >
                    <img
                        src={iconUrl}
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


            {(hovered || selectedCar === device_id) && (
                <InfoWindow
                    position={position}
                    options={{disableAutoPan: true}}
                    onCloseClick={() => setSelectedCar(null)}
                >
                    <div
                        className="marker_tooltip"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <h3 style={{margin: 0, fontSize: "16px"}}>
                            {display_name}
                        </h3>
                    </div>
                </InfoWindow>
            )}
        </>
    );
};

export default memo(TrainMarker);
