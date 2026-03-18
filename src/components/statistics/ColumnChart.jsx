import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import useWindowDimensions from "../hooks/hooks";
import {DatePicker} from "antd";
import axios from "axios";
import {ip} from "../../ip";
import moment from "moment";

const ColumnChart = () => {
    const { t } = useTranslation();
    const { width, height } = useWindowDimensions(); // Ekran o‘lchamini olish

    const [chartData, ChartData] = useState(null)
    const [chartHeight, setChartHeight] = useState(350);
    const [date, setDate] = useState(new Date())

    const DayMY = moment(new Date()).format('DD.MM.YYYY');

    // console.log(chartData)

    useEffect(() => {
        axios.get(`${ip}/api/log-data-top`, {
                params: { date: date},
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            }
        )
            .then((res) => {
                ChartData(res.data.data)
            })
            .catch(err => {
            })
    }, [date])


    useEffect(() => {

        // Kichik ekranda balandlikni kamaytirish
        if (height < 500) setChartHeight(150);
        else if (height < 700) setChartHeight(230);
        else setChartHeight(330);
    }, [width, height]);


    const series = [
        {
            name: t("Kunlik"),
            data: chartData?.map(e => `${e.daily} km`) || [],
        },
        {
            name: t("Oylik"),
            data: chartData?.map(e => e.monthly) || [],
        },
    ];

    const options = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "40%", // Ustunlarning kengligi
                dataLabels: { position: "top" },
            },
        },
        colors: ["#28C76F", "#2970FF"], // Yashil va Qizil
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: chartData?.map(e => e.display_name) || [],
        },
        legend: {
            position: "top",
            markers: {
                radius: "100%", // ✅ To‘liq yumaloq bo‘lishi uchun
                width: 12,
                height: 12,
            },
        },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: (val) => `${val} km`,
                },
            },
    };

    return (
        <div className="w-full flex justify-center">
            <div className="statistic_title">
                <div className="statistic_title_inner">
                    {t("ENG KO'P MASOFA BOSIB O'TGAN TRANSPORTLAR")}
                </div>
                <div className="statistic_datePicker">
                    <DatePicker
                        placeholder={DayMY} onChange={value => setDate(value)}
                        style={{borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px'}}/>
                </div>
            </div>
            <Chart options={options} series={series} type="bar" height={chartHeight}/>
        </div>
    );
};

export default ColumnChart;
