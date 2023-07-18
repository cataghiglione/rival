import React, {useEffect, useState} from 'react';
import "../css/FindRival.scss"
import "../css/Home.scss"
import SideBar from "./SideBar";
import {useNavigate} from "react-router";
import {findRival, getTeam, newMatch, possibleSearchCandidates, getSearch} from "../service/mySystem";
import {useAuthProvider} from "../auth/auth";
import DatePicker, {CalendarContainer} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {TopBar} from "./TopBar/TopBar";
import {BingMap} from "./BingMap"
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Icon} from "@iconify/react";
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.css';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {useSearchParams} from "react-router-dom";


// import '@mobiscroll/react/dist/css/mobiscroll.min.css';
// import { Datepicker } from '@mobiscroll/react';

export function SelectPrefForRival(props) {
    const auth = useAuthProvider()
    const token = auth.getToken();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(undefined)
    const [searchParams] = useSearchParams();
    const searchId = searchParams.get('id');


    const [date, setDate] = useState(new Date());
    const [averageAge, setAverageAge] = useState(25);
    const [checked, setChecked] = React.useState(false);


    const [rivalMenuOpen, setRivalMenuOpen] = useState(false);

    const [zone, setZone] = useState([])
    const [newZone, setNewZone] = useState([])

    const [showPopup, setShowPopup] = useState(false);
    const [changeLocationButton, setChangeLocationButton] = useState('Select location');
    const [selectedLocation, setSelectedLocation] = useState("")

    const [selectedTimes, setSelectedTimes] = useState([]);
    const [finalSelectedTimes, setFinalSelectedTimes] = useState([]);
    const [defaultTimes, setDefaultTimes] = useState([]);

    const [team, setTeam] = useState('');
    const teamId = props.getTeamId;

    const options = [{label: "8:00-9:00", value: "8:00-9:00"},
        {label: "9:00-10:00", value: "9:00-10:00"}, {label: "10:00-11:00", value: "10:00-11:00"},
        {label: "11:00-12:00", value: "11:00-12:00"},
        {label: "12:00-13:00", value: "12:00-13:00"},
        {label: "13:00-14:00", value: "13:00-14:00"},
        {label: "14:00-15:00", value: "14:00-15:00"},
        {label: "15:00-16:00", value: "15:00-16:00"},
        {label: "16:00-17:00", value: "16:00-17:00"},
        {label: "17:00-18:00", value: "17:00-18:00"},
        {label: "18:00-19:00", value: "18:00-19:00"},
        {label: "19:00-20:00", value: "19:00-20:00"},
        {label: "20:00-21:00", value: "20:00-21:00"},
        {label: "21:00-22:00", value: "21:00-22:00"},
        {label: "22:00-23:00", value: "22:00-23:00"},
        {label: "23:00-00:00", value: "23:00-00:00"}
    ]

    // con esto lee los params
    // const searchParams = useSearchParams();
    // // con este lee el paramentro de "id"
    // const id = searchParams.get("id")

    // aca va al mySystem para agarrar los != teams
    useEffect((callbackfn, thisArg) => {
        getTeam(token, teamId, (team) => setTeam(team));
        if(searchId !== null || searchId !== ""){
            getSearch(token, searchId, (res)=>{
                console.log(res);
                setAverageAge(res.averageAge);
                // setDate(new Date(res.d ate.year, res.date.month, res.date.date))
                setSelectedLocation(`Longitude: ${res.longitude} Latitude: ${res.latitude}`)
                // setFinalSelectedTimes(res.time.intervals)
                // setSelectedTimes(res.time.intervals)
                for (let i = 0; selectedTimes.length !== res.time.intervals.length; i++) {
                    console.log(i);
                    for (let j = 0; j < options.length; j++) {
                        console.log(j);
                        if (options[j].value === res.time.intervals[i]) {
                            selectedTimes.push(options[j]);
                            break;
                        }
                    }
                }
                console.log(defaultTimes);
                setChecked(res.isRecurring)
                setZone([res.longitude, res.latitude])
                setNewZone([res.longitude, res.latitude])
                setChangeLocationButton('Change Location');
            })
        }
    }, [teamId, token])
    // aca va al mySystem para agarrar el team

    const openAndFindRivals = async e => {
        setRivalMenuOpen(true);
    }

    useEffect(() => {
        setFinalSelectedTimes(selectedTimes.map(option => option.value));
    }, [selectedTimes]);

    function handleSelectLocation(e) {
        e.preventDefault(); // Prevent form submission
        setShowPopup(!showPopup);
    }

    const handleInfoboxesWithPushPins = (infoboxesWithPushPinsData) => {
        setChangeLocationButton('Change Location');
        setNewZone(infoboxesWithPushPinsData[0].location);
    };

    const printSelectedLocation = (location) => {
        const [lat, long] = location;
        if (long && lat) {
            setSelectedLocation(`Latitude: ${lat}, Longitude: ${long}`);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalValues = selectedTimes.map(option => option.value)
        setFinalSelectedTimes(finalValues)
        if(!date || !finalSelectedTimes || !zone || !averageAge){
            toast.error('Please fill out all the required fields', {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
        else{
            await findRivalMethod({
                date: date,
                time: finalSelectedTimes,
                latitude: zone[0].toString(),
                longitude: zone[1].toString(),
                age:averageAge,
                isRecurring:checked
            })
        }
    }
    const handleCheckedBox = (event) => {
        setChecked(event.target.checked);
    };
    const findRivalMethod = async (search) => {
        if (rivalMenuOpen) {
            await findRival(token, teamId, search, (res) => {
                    toast.success('Search is now active!', {
                        containerId: 'toast-container',
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    console.log(res)
                    navigate(`/findRival?id=${res}`)
                },
                (res) => {
                    toast.info('Search is already active!', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    console.log(res)
                    navigate(`/findRival?id=${res}`)
                },
                () => {
                    toast.error('Something went wrong', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        }
                    )
                })
        }
    }

    const MyContainer = ({className, children}) => {
        return (
            <div className={"calendarContainer"}>
                <CalendarContainer className={className}>
                    <div style={{background: "transparent"}}>
                    </div>
                    <div style={{position: "relative"}}>{children}</div>
                </CalendarContainer>
            </div>
        );
    };
    function valuetext(value) {
        return `${value}`;
    }
    const handleAverageAgeChange = (event, value) => {
        setAverageAge(value);
    };
    const marks = [
        {
            value: 18,
            label: '18',
        },
        {
            value: 25,
            label: '25',
        },
        {
            value: 35,
            label: '35',
        },
        {value:45,label:'45'},
        {
            value: 55,
            label: '55',
        },
        {
            value: 65,
            label: '65',
        },
        {
            value: 75,
            label: '75',
        },
        {
            value: 85,
            label: '85',
        },
        {
            value: 95,
            label: '95',
        },
    ];



    function confirmZone() {
        setZone(newZone);
        printSelectedLocation(newZone);
        setShowPopup(false);
    }

    return (
        <div>
            <SideBar getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}></SideBar>
            <TopBar popupOpen = {showPopup} getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}/>
            {/*<div className={"sports_image"}>*/}
            {/*    <img style={{width: 218, height: "auto"}} src={require("../images/logoRM/logoRM_persona.png")} alt={"deportes"}/>*/}
            {/*</div>*/}

            {/*<div className={"mirror_sports_image"}>*/}
            {/*    <img style={{width: 218, height: "auto"}} src={require("../images/logoRM/logoRM_persona.png")} alt={"deportes"}/>*/}
            {/*</div>*/}

            <div className={"containerPrincipalFindRival"}>
                <div className="team_name_FR">
                    <br/>
                    You've chosen {team.name}
                    <br/>
                    Sport: {team.sport}
                </div>
                <br/>
                <form onSubmit={rivalMenuOpen && handleSubmit}>
                    <div className={"datePicker"}>
                        Choose a day to play:
                        <br/><br/>
                        <DatePicker
                            showIcon
                            selected={date}
                            dateFormat="dd/MM/yyyy"
                            onChange={date => setDate(date)}
                            minDate={new Date()}
                            showDisabledMonthNavigation
                            calendarContainer={MyContainer}
                        />
                        <Icon style ={{left:"-25px", top: "-40px", fontSize: "20"}} className="input-icon-log" icon="radix-icons:calendar" />
                    </div>
                    <div className={"time_select_container"}>
                        <div className={"time_select"}>
                            {/*<p>Select your time intervals of preference!</p>*/}
                            <Select
                                options={options}
                                value={selectedTimes}
                                onChange={setSelectedTimes}
                                defaultValues={defaultTimes}
                                isMulti
                            />
                            <Icon style ={{left:"-25px", top: "-5px", fontSize: "20px", position: "absolute"}} className="input-icon-log" icon="ion:time-outline" />
                        </div>
                    </div>
                    <div className={"ageSlider"}>
                        <Box sx={{ width: 300 }}>
                            <Slider
                                aria-label="Always visible"
                                defaultValue={25}
                                getAriaValueText={valuetext}
                                marks={marks}
                                min={18}
                                max={100}
                                value={averageAge}
                                onChange={handleAverageAgeChange}
                                valueLabelDisplay="on"
                            />
                        </Box>
                        <Icon style ={{left:"-30px", top: "-7.5px", fontSize: "20px", position: "absolute"}} className="input-icon-log" icon="streamline:interface-time-hour-glass-hourglass-loading-measure-clock-time" />
                    </div>
                    <div className={"checkboxRecurrent"}>
                        <FormGroup>
                            <FormControlLabel control=
                                                  {<Checkbox checked={checked}
                                                             onChange={handleCheckedBox} />}
                                              label="Recurrent search" />
                        </FormGroup>
                    </div>


                    <div className={"zone"}>
                        {changeLocationButton === 'Select location' && <p>Select your preferred zone: </p>}
                        {changeLocationButton !== 'Select location' && <p>Your preferred zone: {selectedLocation}</p>}
                        <button className={"selectLocationButton"} onClick={handleSelectLocation}> <Icon style ={{left:"-30px", top: "-5px", fontSize: "20"}} className="input-icon-log" icon="mi:location" /> {changeLocationButton} </button>
                        {showPopup && (
                            <div className="popupFR">
                                <BingMap
                                    onInfoboxesWithPushPinsChange={handleInfoboxesWithPushPins}
                                />
                                {(zone !== newZone && newZone.length !== 0) && (
                                    <div>
                                        <button className={"confirmLocation"} id="confirmLoc" onClick={confirmZone}>Confirm location</button>
                                    </div>
                                )}
                                <button className={"goBackSelLoc"} onClick={handleSelectLocation}>Go back</button>
                            </div>
                        )}
                    </div>


                    <button className={"findRivalButton"} id="submit" type="submit" onClick={openAndFindRivals}> Find rival!
                    </button>
                </form>
                <ToastContainer/> {/* Mover el ToastContainer aquí */}
            </div>
        </div>
    )
}




// export function FindRivalPage(props) {
//     const auth = useAuthProvider()
//     const token = auth.getToken();
//     const navigate = useNavigate();
//     const [errorMsg, setErrorMsg] = useState(undefined)
//
//     const options = [{label: "8:00-9:00", value: "8:00-9:00"},
//         {label: "9:00-10:00", value: "9:00-10:00"}, {label: "10:00-11:00", value: "10:00-11:00"},
//         {label: "11:00-12:00", value: "11:00-12:00"},
//         {label: "12:00-13:00", value: "12:00-13:00"},
//         {label: "13:00-14:00", value: "13:00-14:00"},
//         {label: "14:00-15:00", value: "14:00-15:00"},
//         {label: "15:00-16:00", value: "15:00-16:00"},
//         {label: "16:00-17:00", value: "16:00-17:00"},
//         {label: "17:00-18:00", value: "17:00-18:00"},
//         {label: "18:00-19:00", value: "18:00-19:00"},
//         {label: "19:00-20:00", value: "19:00-20:00"},
//         {label: "20:00-21:00", value: "20:00-21:00"},
//         {label: "21:00-22:00", value: "21:00-22:00"},
//         {label: "22:00-23:00", value: "22:00-23:00"},
//         {label: "23:00-00:00", value: "23:00-00:00"}
//     ]
//
//     // con esto lee los params
//     // const searchParams = useSearchParams();
//     // // con este lee el paramentro de "id"
//     // const id = searchParams.get("id")
//
//     // aca va al mySystem para agarrar los != teams
//     useEffect(() => {
//         getTeam(token, teamId, (team) => setTeam(team));
//     }, [teamId, token])
//     // aca va al mySystem para agarrar el team
//
//     useEffect(() => {
//         setFinalSelectedTimes(selectedTimes.map(option => option.value));
//     }, [selectedTimes]);
//
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const finalValues = selectedTimes.map(option => option.value)
//         setFinalSelectedTimes(finalValues)
//         if(!date || !finalSelectedTimes || !zone || !averageAge){
//             toast.error('Please fill out all the required fields', {
//                 position: "top-center",
//                 autoClose: 2500,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 progress: undefined,
//                 theme: "light",
//             });
//             return;
//         }
//         await findRivalMethod({
//             date: date,
//             time: finalSelectedTimes,
//             latitude: zone[0].toString(),
//             longitude: zone[1].toString(),
//             age:averageAge,
//             isRecurring:checked
//         })
//     }
//     const handleCheckedBox = (event) => {
//         setChecked(event.target.checked);
//     };
//     const findRivalMethod = (search) => {
//         if (rivalMenuOpen) {
//             findRival(token, teamId, search, (res) => {
//                     toast.success('Search is now active!', {
//                         containerId: 'toast-container',
//                         position: "top-center",
//                         autoClose: 5000,
//                         hideProgressBar: false,
//                         closeOnClick: true,
//                         pauseOnHover: true,
//                         draggable: true,
//                         progress: undefined,
//                         theme: "light",
//                     });
//                     console.log(res)
//                     setSearches(res.searches)
//                     setSearchId(res.searchId)
//                 },
//                 (res) => {
//                     toast.info('Search is already active!', {
//                         position: "top-center",
//                         autoClose: 5000,
//                         hideProgressBar: false,
//                         closeOnClick: true,
//                         pauseOnHover: true,
//                         draggable: true,
//                         progress: undefined,
//                         theme: "light",
//                     });
//                     console.log(res)
//                     setSearches(res.searches)
//                     setSearchId(res.searchId)
//                 },
//                 () => {
//                     toast.error('Something went wrong', {
//                             position: "top-center",
//                             autoClose: 5000,
//                             hideProgressBar: false,
//                             closeOnClick: true,
//                             pauseOnHover: true,
//                             draggable: true,
//                             progress: undefined,
//                             theme: "light",
//                         }
//                     )
//                 })
//         }
//     }
//
//     const playButton = async (id) => {
//         await newMatch(token, {
//                 candidate_search_id: id,
//                 searchId: searchId
//             },
//             async (res) => {
//                 toast.success('Request sent!', {
//                     containerId: 'toast-container',
//                     position: "top-center",
//                     autoClose: 5000,
//                     hideProgressBar: false,
//                     closeOnClick: true,
//                     pauseOnHover: true,
//                     draggable: true,
//                     progress: undefined,
//                     theme: "light",
//                 });
//                 console.log(res)
//                 await possibleSearchCandidates(token, searchId, (searches) => {
//                     setSearches(searches)
//                     if (searches.length === 0) {
//                         setNoSearchesCandidates("There are currently no more teams searching for rivals with your preferences");
//                     }
//                     console.log(searches)
//                 },)
//             },
//             () => {
//                 console.log('A match with this searches already exists!')
//             }
//         )
//
//     }
//
//     // const requestRivals = (user) => {
//     //
//     // }
//     const timeChange = (event) => {
//         setTime(event.target.value)
//     }
//     const MyContainer = ({className, children}) => {
//         return (
//             <div className={"calendarContainer"}>
//                 <CalendarContainer className={className}>
//                     <div style={{background: "transparent"}}>
//                     </div>
//                     <div style={{position: "relative"}}>{children}</div>
//                 </CalendarContainer>
//             </div>
//         );
//     };
//     function valuetext(value) {
//         return `${value}`;
//     }
//     const handleAverageAgeChange = (event, value) => {
//         setAverageAge(value);
//     };
//     const marks = [
//         {
//             value: 18,
//             label: '18',
//         },
//         {
//             value: 25,
//             label: '25',
//         },
//         {
//             value: 35,
//             label: '35',
//         },
//         {value:45,label:'45'},
//         {
//             value: 55,
//             label: '55',
//         },
//         {
//             value: 65,
//             label: '65',
//         },
//         {
//             value: 75,
//             label: '75',
//         },
//         {
//             value: 85,
//             label: '85',
//         },
//         {
//             value: 95,
//             label: '95',
//         },
//     ];
//
//
//
//     function confirmZone() {
//         setZone(newZone);
//         printSelectedLocation(newZone);
//         setShowPopup(false);
//     }
//
//
//     return (
//         <div>
//             <SideBar getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}></SideBar>
//             <TopBar popupOpen = {showPopup} getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}/>
//
//             <div className={"containerPrincipalFindRival"}>
//                 <div className="team_name_FR">
//                     <br/>
//                     You've chosen {team.name}
//                     <br/>
//                     Sport: {team.sport}
//                 </div>
//                 <br/>
//                 <form onSubmit={rivalMenuOpen && handleSubmit}>
//                     <div className={"datePicker"}>
//                         Choose a day to play:
//                         <br/><br/>
//                         <DatePicker
//                             showIcon
//                             selected={date}
//                             dateFormat="dd/MM/yyyy"
//                             onChange={date => setDate(date)}
//                             minDate={new Date()}
//                             showDisabledMonthNavigation
//                             calendarContainer={MyContainer}
//                         />
//                         <Icon style ={{left:"-25px", top: "-40px", fontSize: "20"}} className="input-icon-log" icon="radix-icons:calendar" />
//                     </div>
//                     <div className={"time_select"}>
//                         {/*<p>Select your time intervals of preference!</p>*/}
//                         <Select
//                             options={options}
//                             value={selectedTimes}
//                             onChange={setSelectedTimes}
//                             isMulti
//                         />
//                         <Icon style ={{left:"-25px", top: "-5px", fontSize: "20px", position: "absolute"}} className="input-icon-log" icon="ion:time-outline" />
//                     </div>
//                     <div className={"ageSlider"}>
//                         <Box sx={{ width: 300 }}>
//                             <Slider
//                                 aria-label="Always visible"
//                                 defaultValue={25}
//                                 getAriaValueText={valuetext}
//                                 marks={marks}
//                                 min={18}
//                                 max={100}
//                                 value={averageAge}
//                                 onChange={handleAverageAgeChange}
//                                 valueLabelDisplay="on"
//                             />
//                         </Box>
//                         <Icon style ={{left:"-30px", top: "-7.5px", fontSize: "20px", position: "absolute"}} className="input-icon-log" icon="streamline:interface-time-hour-glass-hourglass-loading-measure-clock-time" />
//                     </div>
//                     <div className={"checkboxRecurrent"}>
//                         <FormGroup>
//                             <FormControlLabel control=
//                                                   {<Checkbox checked={checked}
//                                                              onChange={handleCheckedBox} />}
//                                               label="Recurrent search" />
//                         </FormGroup>
//                     </div>
//
//
//                     <div className={"zone"}>
//                         {changeLocationButton === 'Select location' && <p>Select your preferred zone: </p>}
//                         {changeLocationButton !== 'Select location' && <p>Your preferred zone: {selectedLocation}</p>}
//                         <button className={"selectLocationButton"} onClick={handleSelectLocation}> <Icon style ={{left:"-30px", top: "-5px", fontSize: "20"}} className="input-icon-log" icon="mi:location" /> {changeLocationButton} </button>
//                         {showPopup && (
//                             <div className="popupFR">
//                                 <BingMap
//                                     onInfoboxesWithPushPinsChange={handleInfoboxesWithPushPins}
//                                 />
//                                 {(zone !== newZone && newZone.length !== 0) && (
//                                     <div>
//                                         <button className={"confirmLocation"} id="confirmLoc" onClick={confirmZone}>Confirm location</button>
//                                     </div>
//                                 )}
//                                 <button className={"goBackSelLoc"} onClick={handleSelectLocation}>Go back</button>
//                             </div>
//                         )}
//                     </div>
//
//
//                     <button className={"findRivalButton"} id="submit" type="submit" onClick={openAndFindRivals}> Find rival!
//                     </button>
//                 </form>
//                 {(rivalMenuOpen && searches.length > 0) &&
//                     <div>
//                         <div className={"title"}>
//                             Teams searching for rivals:
//                         </div>
//
//
//                         {/*    <select className={"team-select"} multiple={true} onChange={playMatch}>*/}
//                         {/*{teams.map(team =>*/}
//                         {/*    <option className={"team-select-option"} style={{textTransform: 'capitalize'}} value={team.id}>*/}
//                         {/*    nombre: {team.name}, deporte: {team.sport}, categoria: {team.group} </option>*/}
//                         {/*    // <p>nombre = {team.name}    deporte = {team.sport} </p>*/}
//                         {/*    // <option>{team.name}</option>*/}
//
//                         {/*    )*/}
//                         {/*}*/}
//                         {/*    </select>*/}
//
//
//                         {/*<div style={{display: 'flex', flexWrap: 'wrap', position: "relative"}}>*/}
//                         <div className={"searches-list"}>
//                             {searches.map((search) => (
//                                 <div>
//                                     <div className={"team-select"}>
//                                         <div className={"team-select.info"}>
//                                             <span style={{fontWeight: 'bold', marginLeft: '5px', marginBottom: '15px'}}> Team name: {search.search.team.name.charAt(0).toUpperCase() + search.search.team.name.substring(1).toLowerCase()}</span>
//                                             <p style={{marginLeft: '5px', marginBottom: '15px'}}> Age
//                                                 group: {search.search.team.age_group}</p>
//                                             <p style={{marginLeft: '5px', marginBottom: '15px'}}> Time(s) in common:
//                                                 {search.times.join(", ")}</p>
//                                         </div>
//                                         <br/><br/>
//                                         <div>
//                                             <button className={"button-play"}
//                                                     onClick={async () => await playButton(search.search.id)}>
//                                                 Play
//                                             </button>
//
//                                         </div>
//                                     </div>
//                                     <br/>
//                                 </div>
//                             ))}
//
//                             {/*<TextWithButton text = {team.name}/>))}*/}
//                         </div>
//                     </div>
//                 }
//                 {(rivalMenuOpen && searches.length === 0) && (
//
//                     <p className={"noTeamSearch"}>{noSearchesCandidates}</p>)
//                 }
//                 <ToastContainer/> {/* Mover el ToastContainer aquí */}
//             </div>
//         </div>
//     )
// }