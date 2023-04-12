import React, {Component, useEffect, useState} from 'react';
import "../css/FindRival.css"
import {useLocation, useNavigate} from "react-router";
import {useMySystem} from "../service/mySystem";
import {useAuthProvider} from "../auth/auth";
import {useSearchParams} from "react-router-dom";

import DatePicker, {CalendarContainer} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {Dropdown} from "bootstrap";


function goToNewTeam() {
    window.location.href = "/newTeam"
}


function goToUserInfo() {
    window.location.href = "/user"
}

function goToHome() {
    window.location.href = "/home"
}

function goToPickTeam() {
    window.location.href = "/pickTeam"
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


export const FindRivalPage = () => {
    const [date, setDate] = useState(new Date());
    const mySystem = useMySystem()
    const auth = useAuthProvider()
    const token = auth.getToken();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(undefined)


    const [time, setTime] = useState('')
    const [menuOpen, setMenuOpen] = useState(false);
    const [pageChange, setPageChange] = useState("Find rival");
    const changePage = (event) => {
        setPageChange(event.target.value);
    }
    const playMatch = (event) => {
        setPageChange(event.target.value);
    }


    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState('');
    const location = useLocation();
    const params = new URLSearchParams(location.search)
    const id = params.get("id");


    // con esto lee los params
    // const searchParams = useSearchParams();
    // // con este lee el paramentro de "id"
    // const id = searchParams.get("id")

    // aca va al mySystem para agarrar los != teams
    useEffect(() => {
        mySystem.findRivals(token, id, (teams) => setTeams(teams));
        mySystem.getTeam(token, id, (team) => setTeam(team));
    }, [])
    // aca va al mySystem para agarrar el team


    const handleSubmit = async e => {
        e.preventDefault();
        findRival(id,{
            date:date,
            time:time
        })


    }
    const findRival = (id, search) => {
        mySystem.findRival(token, id, search, () => navigate("/pickTeam?ok=true"),
            () => {
                setErrorMsg('Team already exists!')
            })


    }
    const requestRivals = (user) => {

    }
    const timeChange = (event) => {
        setTime(event.target.value)
    }
    const MyContainer = ({className, children}) => {
        return (
            <div style={{padding: "16px", background: "green", color: "#fff"}}>
                <CalendarContainer className={className}>
                    <div style={{background: "transparent"}}>
                    </div>
                    <div style={{position: "relative"}}>{children}</div>
                </CalendarContainer>
            </div>
        );
    };
    return (

        <div>

            <button className={"Menu"} id="submit" type="submit" onClick={() => setMenuOpen(!menuOpen)}>
                <img style={{width: 22, height: "auto"}} src={require("../images/sideBarIcon.png")} alt={"Logo"}/>
            </button>
            {menuOpen &&
                <select className={"custom-select"} id="Menu" multiple={true} onChange={changePage}>
                    <option className={"custom-select-option"} value="Home">Home</option>
                    <option className={"custom-select-option"} value="User">User</option>
                    <option className={"custom-select-option"} value="Pick Team">Pick Team</option>
                    <option className={"custom-select-option"} value="New Team">New Team</option>
                    {pageChange === "User" && goToUserInfo()}
                    {pageChange === "Pick Team" && goToPickTeam()}
                    {pageChange === "New Team" && goToNewTeam()}
                    {pageChange === "Home" && goToHome()}
                </select>
            }

            <div className={"logo"}>
                <img style={{width: 218, height: "auto"}} src={require("../images/logo_solo_letras.png")} alt={"Logo"}/>
            </div>
            <div className={"sports_image"}>
                <img style={{width: 218, height: "auto"}} src={require("../images/varios_deportes.png")}
                     alt={"deportes"}/>
            </div>
            <div className={"mirror_sports_image"}>
                <img style={{width: 218, height: "auto"}} src={require("../images/varios_deportes.png")}
                     alt={"deportes"}/>
            </div>

            <div className="team_name">
                You've chosen {team.name}
                <br/>
                Sport: {team.sport}
            </div>
            <form onSubmit={handleSubmit}>


                <div className={"containerPrincipal"}>
                    Choose a day to play:
                    <DatePicker
                        showIcon
                        selected={date}
                        onChange={date => setDate(date)}
                        calendarContainer={MyContainer}

                    />


                </div>
                <div className={"time_select"}>
                    <p>Select your time of preference!</p>
                    <select id="time" required onChange={setTime}>
                        <option disabled={true} value="">
                            Time of day...
                        </option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                        <option value="No preference">No preference</option>
                    </select>
                </div>
            </form>
            <div className={"zone"}>
                <p>Select your preferred zone: </p>
                {/*ferpa aca iria el mapa*/}
            </div>
            <div>
                <div className={"title"}>
                    Teams searching for rivals:
                </div>

                <select className={"team-select"} multiple={true} onChange={playMatch}>
                    {teams.map(team =>
                            <option className={"team-select-option"} value={team.id}>nombre = {team.name} deporte
                                = {team.sport} categoria = {team.group} </option>
                        // <p>nombre = {team.name}    deporte = {team.sport} </p>
                        // <option>{team.name}</option>

                    )}
                </select>
            </div>


            <button className={"findRivalButton"} id="submit" type="submit" > Find Rival!</button>
            <button className={"goToPickTeamButton"} onClick={goToPickTeam}> Change Team</button>
        </div>


    )
}


// React.useEffect(()=>{
//     async function getTeams(){
//         const response = await fetch('http://localhost:4326/findRival',{
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer ' + token
//             }});
//         const body = await response.json();
//         setItems(body.results.map(({name})=>({label: name, value: name})));
//         setLoading(false);
//     }
//     getTeams();
// },[]);

// <select disabled={loading}
//         value={value}
//         onChange={e => setValue(e.currentTarget.value)}>
// <select>
//     {teams.map(({ label, value }) => (
//         <option key={value} value={value}>
//             {label}
//         </option>
//     ))}
//
// </select>