import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import useWindowDimensions from "../hooks/hooks";

const DonutChart = ({ chartData }) => {
    const { t } = useTranslation();
    const { width, height } = useWindowDimensions();

    const [chartHeight, setChartHeight] = useState(320);

    useEffect(() => {
        if (height < 500) setChartHeight(150);
        else if (height < 900) setChartHeight(280);
        else setChartHeight(320);
    }, [width, height]);

    const hasData = chartData?.motion_statistics?.length > 0;

    const options = {
        chart: {
            type: "donut",
        },
        labels: [
            t("Faol dvigatellar"),
            t("Nofaol dvigatellar"),
        ],
        colors: ["#079455", "#E9EAEB"],
        legend: {
            position: "bottom",
            markers: {
                width: 20,
                height: 20,
            },
        },
        dataLabels: {
            formatter: function (value, { seriesIndex, w }) {
                return w.config.series[seriesIndex];
            },
        },
        tooltip: {
            y: {
                formatter: function (value) {
                    return value;
                },
            },
        },
    };

    const series = hasData
        ? [
            chartData.motion_statistics[0]?.ignition_off || 0,
            chartData.motion_statistics[0]?.ignition_on || 0,
        ]
        : [0, 0];

    return (
        <div className="w-full flex justify-center items-center">
            <Chart
                key={chartHeight} // 🔁 majburan qayta chizish
                options={options}
                series={series}
                type="donut"
                height={chartHeight}
            />
        </div>
    );
};

export default DonutChart;






// import React, {useEffect, useState} from "react";
// import Chart from "react-apexcharts";
// import {useTranslation} from "react-i18next";
// import useWindowDimensions from "../hooks/hooks";
//
// const DonutChart = ({chartData}) => {
//
//     const { t } = useTranslation();
//     const { width, height } = useWindowDimensions(); // Ekran o‘lchamini olish
//
//     const [chartHeight, setChartHeight] = useState(350);
//
//     useEffect(() => {
//         if (height < 500) setChartHeight(150);
//         else if (height < 700) setChartHeight(200);
//         else setChartHeight(320);
//     }, [width, height]);
//
//     const hasData = chartData?.motion_statistics?.length > 0;
//
//     const options = {
//         chart: {
//             type: "donut",
//         },
//         labels: [
//             t("Faol dvigatellar"),
//             t("Nofaol dvigatellar"),
//         ],
//         colors: [ "#079455", "#E9EAEB", ],
//         legend: {
//             position: "bottom",
//             markers: {
//                 width: 20,
//                 height: 20,
//             },
//         },
//         dataLabels: {
//             formatter: function (value, { seriesIndex, w }) {
//                 return w.config.series[seriesIndex];
//             },
//         },
//         tooltip: {
//             y: {
//                 formatter: function (value) {
//                     return value;
//                 },
//             },
//         },
//     };
//
//     const series = hasData
//         ? [
//             chartData.motion_statistics[0]?.ignition_off || 0,
//             chartData.motion_statistics[0]?.ignition_on || 0,
//             // chartData.motion_statistics[0]?.motion_off || 0,
//             // chartData.motion_statistics[0]?.motion_on || 0,
//         ]
//         : [0, 0];
//
//     return (
//         <div className="w-full flex justify-center">
//             <Chart options={options} series={series} type="donut" height={chartHeight} />
//         </div>
//     );
// };
//
// export default DonutChart;
