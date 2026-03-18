import React, {useState} from 'react'

import App from './App'
import LoginPageNew from "./components/loginPage/LoginPageNew";

import {LoadScriptNext} from "@react-google-maps/api";
import {useTranslation} from "react-i18next";

import Login from "./components/loginPage/last/Login";

function Auth() {
    const {t, i18n} = useTranslation();

    // console.log("Google Maps API Key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);


    const [user, setUser] = useState(null)

    if (user) {
        return <LoadScriptNext
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            key={i18n.language} language={i18n.language} region="UZ">
            <App setUser={setUser} user={user}/>
               </LoadScriptNext>
    }

    return (
        <LoginPageNew user={user} setUser={setUser}/>
        // <Login user={user} setUser={setUser}/>
    )
}

export default Auth
