import React, {useState} from 'react';
import "../../css/Home.css"
import "../../css/PickTeam.scss"
import {getTeam, listTeams} from "../../service/mySystem";
import {useAuthProvider} from "../../auth/auth";
import MenuSidebarWrapper, {MenuSideBar} from "./MenuSideBar";
import {useLocation, useNavigate} from "react-router";
import Sidebar from "./MenuSideBar";

function goToNewTeam(){
    window.location.href = "/newTeam"
}
function goToHome() {
    window.location.href = "/home"
}
export function TopBar(props) {
    const auth = useAuthProvider()
    const token = auth.getToken()
    const navigate = useNavigate()
    const location = useLocation();

    const [teams, setTeams] = useState([])
    const [actualTeam, setActualTeam] = useState('')
    const [visible, setVisible] = useState(false)
    const [once, setOnce] = useState(true);

    const getTeamMethod = () => {
        getTeam(token, props.getTeamId, (actualTeam) => setActualTeam(actualTeam));
        listTeams(token, (teams) => setTeams(teams));
        setOnce(false);
    }

    const toggleMenu = () => {
        setVisible(!visible);
    }

    const goToPickTeam = () => {
        if(location.pathname==="/pickTeam"){}
        else{navigate("/pickTeam")}
    }
    return (
        <div>
            {once && getTeamMethod()}
            <div className={"top-bar"}>
                <img onClick={goToHome} style={{width: 280, height: "auto"}} src={require("../../images/logo_solo_letras.png")} alt={"Logo"} className={"Logo"}/>

                <div className={"dropdown"}>
                    {!(props.getTeamId === 0) &&
                    <button className={"dropdown-btn"} onClick={toggleMenu}>
                        {actualTeam.sport} {actualTeam.quantity}: {actualTeam.name}
                        <img style={{width: 22, height: "auto"}} src={require("../../images/dropdown-1.png")}
                             alt={"Logo"}/>
                    </button>}
                    {visible && goToPickTeam()}
                </div>
                <MenuSideBar getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}/>
            </div>
        </div>
    )
}