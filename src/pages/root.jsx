import {Routes, Route, useNavigate} from 'react-router-dom'

import StatisticPage from "../components/statistics/StatisticPage";
import AdminPage from "../components/adminPage/AdminPage";
import DeviseContent from "../components/deviseContent/DeviseContent";
import {useLocation} from "react-router-dom";
import {Navigate} from 'react-router-dom';
import GoogleMapTrain from "../components/maps/newVersion/GoogleMapTrain";
import GoogleMapTrainMain from "../components/maps/newVersion/GoogleMapTrainMain";
import {useEffect} from "react";

const RootPage = (props) => {

    const { pathName, setPathName } = props;
    const location = useLocation();

    useEffect(() => {
        setPathName(location?.pathname);
    }, [location?.pathname]);

    return (
        <Routes>
            <Route path='*' element={<Navigate to="/maps"/>}/>

            <Route path="/maps" element={<GoogleMapTrainMain />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GoogleMapTrain />} />
            </Route>


            <Route path='/statistic' element={<StatisticPage/>}/>
            <Route path='/device' element={<DeviseContent/>}/>
            <Route path='/admins' element={<AdminPage/>}/>
        </Routes>)
}

export default RootPage;
