import React from "react";

// import { ReactComponent as TruckIcon } from "./assets/icons/truck.svg";
// import { ReactComponent as BusIcon } from "./assets/icons/bus.svg";
// import { ReactComponent as CarIcon } from "./assets/icons/car.svg";
// import { ReactComponent as TrapIcon } from "./assets/icons/trap.svg";
// import { ReactComponent as TractorIcon } from "./assets/icons/tractor.svg";
// import { ReactComponent as AutoLiftIcon } from "./assets/icons/autoLift.svg";
// import { ReactComponent as IBPIcon } from "./assets/icons/ibp.svg";
// import { ReactComponent as TzIcon } from "./assets/icons/miniBus.svg";
// // import { ReactComponent as aeradromIcon } from "./assets/icons/ibp.svg";
// import { ReactComponent as FiretruckIcon } from "./assets/icons/fire.svg";
// import { ReactComponent as SpecialcarIcon } from "./assets/icons/ibp.svg";
// import { ReactComponent as LentaIcon } from "./assets/icons/lenta.svg";


// news
import { ReactComponent as TruckIcon } from "./assets/icons/newIcon/image 35.svg";
import { ReactComponent as BusIcon } from "./assets/icons/newIcon/5723550.svg";
import { ReactComponent as CarIcon } from "./assets/icons/newIcon/image 26.svg";
import { ReactComponent as TrapIcon } from "./assets/icons/newIcon/5723549.svg";
import { ReactComponent as TractorIcon } from "./assets/icons/newIcon/5723548.svg";
import { ReactComponent as AutoLiftIcon } from "./assets/icons/newIcon/5723552.svg";
import { ReactComponent as IBPIcon } from "./assets/icons/newIcon/15.svg";
import { ReactComponent as TzIcon } from "./assets/icons/newIcon/5723554.svg";
// import { ReactComponent as aeradromIcon } from "./assets/icons/ibp.svg";
import { ReactComponent as FiretruckIcon } from "./assets/icons/newIcon/5723550 (1).svg";
import { ReactComponent as SpecialcarIcon } from "./assets/icons/newIcon/5723551 (1).svg";
import { ReactComponent as LentaIcon } from "./assets/icons/newIcon/5723551.svg";
import { ReactComponent as TeplavozIcon } from "../../icons/iconsNews/Group 55892.svg";

import './BarChartWithIcons.css';

const iconMap = {
    truck: <TruckIcon className="icon" />,
    bus: <BusIcon className="icon" />,
    car: <CarIcon className="icon" />,
    ladder: <TrapIcon className="icon" />,
    tractor: <TractorIcon className="icon" />,
    reloaded: <AutoLiftIcon className="icon" />,
    ibp: <IBPIcon className="icon" />,
    tz: <TzIcon className="icon" />,
    firetruck: <FiretruckIcon className="icon" />,
    lenta: <LentaIcon className="icon" />,
    specialcar: <SpecialcarIcon className="icon" />,
    train : <TeplavozIcon className="icon" />,

};

const BarChart = ({ chartData }) => {
    const bars = chartData?.type_statistics || [];

    return (
        <div className="bar-chart-container2">

            <div className="bar-chart-list">
                {bars.map((item, index) => {
                    console.log(item)
                    const active = item.active || 0;
                    const inactive = item.inactive || 0;
                    const total = active + inactive || 1;

                    const activePercent = (active / total) * 100;
                    const inactivePercent = 100 - activePercent;

                    const icon = iconMap[item.type] || <CarIcon className="icon" />;

                    return (
                        <div className="bar-row" key={index}>
                            <div className="bar-icon">{icon}</div>
                            <div className="bar-info">
                                <div className="bar-track">
                                    <div
                                        className="bar-segment active"
                                        style={{ width: `${activePercent}%` }}
                                    >
                                        <span className="bar-label">{active}</span>
                                    </div>

                                    <div
                                        className="bar-segment inactive"
                                        style={{ width: `${inactivePercent}%` }}
                                    >
                                        <span className="bar-label">{inactive}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



export default BarChart;


//
// import React, {useEffect, useState} from "react";
// import Chart from "react-apexcharts";
// import {useTranslation} from "react-i18next";
// import useWindowDimensions from "../hooks/hooks";
//
// import './statistic.css';
// const BarChart = ({chartData}) => {
//
//     const { t } = useTranslation();
//     const { width, height } = useWindowDimensions(); // Ekran o‘lchamini olish
//
//     const [chartHeight, setChartHeight] = useState(350);
//
//     useEffect(() => {
//         // Kichik ekranda balandlikni kamaytirish
//         if (height < 500) setChartHeight(150);
//         else if (height < 900) setChartHeight(280);
//         else setChartHeight(320);
//     }, [width, height]);
//
//     const hasData = chartData?.type_statistics?.length > 0;
//
//     const series = [
//         {
//             name: t("Faol"),
//             data: chartData?.type_statistics.map(e => e.active) || [],
//         },
//         {
//             name: t("Nofaol"),
//             data: chartData?.type_statistics.map(e => e.inactive) || [],
//         },
//     ];
//
//     const options = {
//         chart: {
//             type: "bar",
//             stacked: true,
//             toolbar: { show: false },
//         },
//         plotOptions: {
//             bar: {
//                 horizontal: true,
//                 borderRadius: "6",
//                 barHeight: "50%",
//             },
//         },
//
//         grid: {
//             show: false, // 🔥 Orqa fon chiziqlarini o'chirish
//         },
//         colors: ["#17B26A", "#F97066"],
//         // dataLabels: { enabled: false },
//         dataLabels: {
//             enabled: true, // Show data labels
//             style: {
//                 fontSize: "14px",
//                 colors: ["#FFF"], // Change label color
//             },
//         },
//         stroke: { width: 1, colors: ["#fff"] },
//         xaxis: {
//             categories: chartData?.type_statistics.map(e => t(e.type)) || [],
//             labels: { show: false },
//             axisBorder: {
//                 show: false, // 🔥 Pastki chiziqni o‘chirish
//             },
//             axisTicks: {
//                 show: false, // 🔥 Kichik chiziqchalarni ham yo‘q qilish
//             },
//         },
//         legend: { position: "top", markers: { radius: 12 } },
//         tooltip: { shared: true, intersect: false },
//     };
//
//     return (
//         <div>
//             <Chart options={options} series={series} type="bar" height={chartHeight} />
//         </div>
//     );
// };
//
// export default BarChart;
