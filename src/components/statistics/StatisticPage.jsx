import React, {useEffect, useState} from 'react';
import axios from "axios";
import DonutChart from "./DonutChart";
import ColumnChart from "./ColumnChart";


import './statistic.css';
import {ip} from "../../ip";
import BarChart from "./BarChart";
import {useTranslation} from "react-i18next";

const StatisticPage = () => {
    const { t } = useTranslation();

    const [date, setDate] = useState(new Date())
    const [chartData, ChartData] = useState(null)

    useEffect(() => {
        axios.get(`${ip}/api/analytics/events`,
            {
                headers: {'x-access-token': localStorage.getItem('gps-x-access-token')}
            }
        )
            .then((res) => {
                ChartData(res.data.data)
            })
            .catch(err => {
            })
    }, [date])



    return (
        <div className="statistic_page">

            <div className="statistic_inner_top">
                <div className="statistic_inner_item">
                    <div className="statistic_title">
                        <div className="statistic_title_inner">
                            {t("DVIGATEL VA HARAKAT HOLATI")}
                        </div>
                    </div>
                    <DonutChart
                        chartData={chartData}
                    />
                </div>

                <div className="statistic_inner_item">
                    <div className="statistic_title">
                        <div className="statistic_title_inner">
                            {t("FAOL VA NOFAOL GPS QURILMALAR")}
                        </div>

                        <div className="legend">
                            <span><span className="legend-color active"></span>{t("Faol")}</span>
                            <span><span className="legend-color inactive"></span>{t("Nofaol")}</span>
                        </div>
                    </div>

                    <BarChart
                        chartData={chartData}
                    />
                </div>
            </div>

            <div className="statistic_inner_bottom_item">
                <ColumnChart
                    chartData={chartData}
                />
            </div>
        </div>
    );
};

export default StatisticPage;