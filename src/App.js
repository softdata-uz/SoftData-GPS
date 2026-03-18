import React , {useEffect} from "react";
import axios from "axios";
import {ip} from "./ip";

import Saidbar from "./components/saidbar/Saidbar";

import {getMeAction, LOGIN_REQUEST, LoginFailure, loginResponse} from "./redux/action/action";
import {api, storage} from "./services";
import {Navigate, Route, Routes, BrowserRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";

import {LoadScriptNext} from "@react-google-maps/api";
import {useTranslation} from "react-i18next";



import Loader from "./components/loading/Loader";
import LoginPageNew from "./components/loginPage/LoginPageNew";

import './App.css';

function App() {
    const {t, i18n} = useTranslation();

    const dispatch = useDispatch();
    const {isAuthenticated, isFetched} = useSelector(store => store.auth);
    const token = storage.local.get("token");


    useEffect(() => {
        const loadFetch = async () => {
            dispatch(LOGIN_REQUEST());
            try {
                const {data} = await api.get(`${ip}/api/me`,
                    {headers: {'x-access-token': token}}
                );
                const user = data?.user;

                if (user) {
                    dispatch(getMeAction(data?.user));
                } else {
                    dispatch(LoginFailure());
                }
            } catch (error) {
                dispatch(LoginFailure());
            } finally {
                dispatch(loginResponse());
            }
        };
        if (token) {
            loadFetch();
        }
    }, []);

    if (!isFetched) {
        return <Loader/>
    }
    return (
        <React.Fragment>
            {isAuthenticated ?
                // <LoadScriptNext
                // googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                // key={i18n.language} language={i18n.language} region="UZ">
                <Saidbar/>
                // </LoadScriptNext>
                :
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<LoginPageNew/>}/>
                        <Route path='*' element={<Navigate to="/"/>}/>
                    </Routes>
                </BrowserRouter>
            }
        </React.Fragment>
    );
}

export default App;






