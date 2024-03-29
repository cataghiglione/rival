import React, {useEffect, useState} from 'react';
import {useAuthProvider} from "../auth/auth";

import "../css/CurrentSearches.scss"
import {
    confirmMatch,
    currentSearches,
    declineMatch,
    deleteSearch,
    getPendingConfirmations,
    getTeam, newContact
} from "../service/mySystem";
import {TopBar} from "./TopBar/TopBar";
import {ToastContainer} from "react-toastify";
import SideBar from "./SideBar";
import {toast} from "react-toastify";
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import {IconButton, Tooltip} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {useNavigate} from "react-router";
import Stack from '@mui/material/Stack';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import {ChatFill} from "react-bootstrap-icons";
import Spinner from "react-bootstrap/Spinner";


export function CurrentSearchesPage(props) {
    const auth = useAuthProvider()
    const navigate = useNavigate()
    const token = auth.getToken();
    const team_id = props.getTeamId;
    const [popupMsg, setPopupMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function goToHome() {
        window.location.href = "/home"
    }

    const [searches, setSearches] = useState([]);
    const [recurringSearches, setRecurringSearches] = useState([])
    const [team, setTeam] = useState('');
    const [selectedSearch, setSelectedSearch] = useState('');
    const [pendingMatches, setPendingMatches] = useState([])
    /* const [mapState, setMapState] = useState(false) */
    /*  const [teamSelectedLoc, setTeamSelectedLoc] = useState([0,0])
      const [pushpin, setPushpin] = useState([])
      const [locationHandle, setLocationHandle] = useState("")
  */

    //Aca agregue un const que es RecurringSearches, en este estan solamente las busquedas recurrentes, hice esto
    //porque me parecia que en una busqueda normal, necesitas saber el dia (tipo el numerito) y el mes, pero en
    //una busqueda recurrente necesitas saber el dia de la semana, porque con el numerito no vas a adivinar que
    //dia de la semana pusiste, aparte serian infinitos numeritos.
    useEffect(() => {
        currentSearches(token, team_id, (searches) => {
            setSearches(searches.searches)
            setRecurringSearches(searches.recurringSearches)
        });
    }, [team_id, token])
    useEffect(() => {
            getPendingConfirmations(token, team_id, (matches) => {
                    setPendingMatches(matches)
                }, (matches) => {
                    // TODO ERROR CALLBACK
                }
            )
        },
        [team_id, token]
    )
    useEffect(() => {
            getPendingConfirmations(token, team_id, (matches) => {
                    setPendingMatches(matches)
                }, (matches) => {
                    // TODO ERROR CALLBACK
                }
            )
        },
        [props.getReload]
    )

    useEffect(() => {
        getTeam(token, team_id, (team) => setTeam(team));
    }, [token, team_id])


    const ConfirmationDialog = ({message, onConfirm, onCancel}) => {
        return (
            <div>
                <p>{message}</p>
                <button className={"confirmationButton"} onClick={onConfirm}>Confirm</button>
                <button className={"cancelDeleteButton"} onClick={onCancel}>Cancel</button>
            </div>
        );
    };
    const [showConfirmation, setShowConfirmation] = useState(false);


    const handleDeleteClick = (search) => {
        setShowConfirmation(true);
        setSelectedSearch(search);
    };
    const handleCancel = () => {
        setShowConfirmation(false);
    };
    const handleConfirm = () => {
        setIsLoading(true)
        deleteSearch(
            token,
            selectedSearch.id,
            () => {
                setPopupMsg('Delete successful');
                setTimeout(() => {
                    setPopupMsg('');
                }, 180);
                currentSearches(token, team_id, (searches) => {
                    setSearches(searches.searches)
                    setRecurringSearches(searches.recurringSearches)
                });
                getPendingConfirmations(token, team_id, (matches) => {
                    setPendingMatches(matches)
                })
                setIsLoading(false)
            },
            (error) => {
                setPopupMsg('Error');
                setTimeout(() => {
                    setPopupMsg('');
                }, 180);
                setIsLoading(false)
            }
        );
        setShowConfirmation(false);
    };
    const handleConfirmMatch = async (match_id) => {
        setIsLoading(true)
        await confirmMatch(token, match_id, team_id, () => {
            getPendingConfirmations(token, team_id, (matches) => {
                    setPendingMatches(matches)
                    toast.success('Confirmation sent!', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    // and takes you to that contact (hacleo hoy)
                }, (matches) => {
                    // TODO ERROR CALLBACK
                    setIsLoading(false)
                }
            )
            currentSearches(token, team_id, (searches) => {
                setSearches(searches.searches)
                setRecurringSearches(searches.recurringSearches)
                setIsLoading(false)
            })
        })
    }
    const handleDeclineMatch = async (match_id) => {
        setIsLoading(true)
        await declineMatch(
            token, match_id, team_id, () => {
                getPendingConfirmations(token, team_id, (matches) => {
                        setPendingMatches(matches)
                        toast.success('Match rejected!', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                        setIsLoading(false)


                    }, () => {
                        // TODO ERROR CALLBACK

                    }
                )
            }
        )

    }

    function findOrCreateContact(otherTeamId) {
        newContact(token, {
                team1_id: team_id,
                team2_id: otherTeamId
            }, (res) => {
                console.log(res)
                navigate(`/webSocketChat?contactId=${res}&targetId=${otherTeamId}`)
            },
            () => {
                // TODO when error callback happens it takes you only to the /chat, without throwing the error on console
                console.log('Contact already exists!')
                navigate("/webSocketChat")
            }
        )
    }


    const handleGoBackClick = (id) => {
        window.location.href = `/findRival?id=${id}`

    }

    return (
        <div>
            <SideBar getTeamId={props.getTeamId} toggleTeamId={props.toggleTeamId}></SideBar>

            {popupMsg !== "" && <div className="searches-popup">{popupMsg}</div>}
            {showConfirmation === true && (
                <div className={"popup"}>
                    <div className={"popup-1"}>
                        <ConfirmationDialog
                            message="Are you sure you want to delete this search?"
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            )}

            <TopBar toggleTeamId={props.toggleTeamId} getTeamId={props.getTeamId}/>
            {isLoading && (
                <div className={"spinner"}>
                    <Spinner animation={"border"}/>
                </div>
            )}


            {!isLoading && (
                <div>
                    {searches.length > 0 && (
                        <div>
                            {searches.length < 4 && <div className="line" style={{top: '230px'}}></div>}
                            {searches.length < 4 && <div className="line" style={{top: '130px'}}></div>}
                        </div>
                    )}
                    {recurringSearches.length > 0 && (
                        <div>
                            {recurringSearches.length < 4 && <div className="line" style={{top: '350px'}}></div>}
                            {recurringSearches.length < 4 && <div className="line" style={{top: '450px'}}></div>}
                        </div>
                    )}
                    {pendingMatches.length > 0 && (
                        <div>
                            {pendingMatches.length < 3 && <div className="line" style={{top: '570px'}}></div>}
                            {pendingMatches.length < 3 && <div className="line" style={{top: '705px'}}></div>}
                        </div>
                    )}

                    <div className={"containerSearchPage"}>
                        <div className={"currentSearchesTitle"}>
                            {team.name}'s current searches:
                        </div>
                        <div className={"recurrentSearchesTitle"}>
                            {team.name}'s recurring searches:
                        </div>
                        <div className={"pendingMatchesTitle"}>
                            {team.name}'s pending confirmations:
                        </div>
                        <div className={"currentSearchesList"}>
                            {searches.length > 0 && (
                                searches.map((search) => (
                                    <div>
                                        <div className={"search-select"}>
                                            <div key={search.id} className={"search-select.info"}>
                                                <p>Time(s): {search.times.join(", ")}</p>
                                                <p>Day: {search.day}/{search.month + 1}</p>
                                            </div>
                                            <Tooltip title={"Cancel search"}>
                                                <IconButton aria-label="delete"
                                                            onClick={() => handleDeleteClick(search)}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={"Check search matches"}>
                                                <IconButton aria-label="delete"
                                                            onClick={() => handleGoBackClick(search.id)}>
                                                    <SearchIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))

                            )}

                        </div>
                        <div className={"recurringSearchesList"}>
                            {recurringSearches.length > 0 && (
                                recurringSearches.map((recurring) => (
                                    <div>
                                        <div className={"recurring-select"}>
                                            <div key={recurring.id} className={"recurring-select.info"}>
                                                <p>Time(s): {recurring.times.join(", ")}</p>
                                                <p>Days: {recurring.weekDay}</p>
                                            </div>
                                            <Tooltip title={"Cancel searching"}>
                                                <IconButton aria-label="delete"
                                                            onClick={() => handleDeleteClick(recurring)}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={"Check search matches"}>
                                                <IconButton aria-label="delete"
                                                            onClick={() => handleGoBackClick(recurring.id)}>
                                                    <SearchIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                )))
                            }

                        </div>
                        <div className={"pendingConfirmationsList"}>
                            {pendingMatches.length > 0 && (
                                pendingMatches.map((match) => (
                                    <div className={"matches-select"}>
                                        <div key={match.id} className="matches-select.info">
                                            <p>Rival: {match.team2.name}
                                            </p>
                                            <p>Time(s): {match.time.join(", ")}</p>
                                            <p>Day: {match.day}</p>
                                        </div>
                                        {match.team1Confirmed ? (
                                            <p>You have confirmed this match, wait for the other team to confirm</p>
                                        ) : (
                                            <div>
                                                <Stack direction="row" spacing={16}>
                                                    <Tooltip title={"Confirm match"}>
                                                        <IconButton onClick={() => handleConfirmMatch(match.id)}>
                                                            <CheckOutlinedIcon/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={"Decline match"}>
                                                        <IconButton onClick={() => handleDeclineMatch(match.id)}>
                                                            <DoDisturbAltOutlinedIcon/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={"Open chat"}>
                                                        <IconButton onClick={() => findOrCreateContact(match.team2.id)}>
                                                            <QuestionAnswerOutlinedIcon/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        {searches.length === 0 && (
                            <div>
                                <br/>
                                <div className={"noSearchesTitle"}>
                                    You don't have any active searches
                                    <SentimentDissatisfiedOutlinedIcon/>
                                </div>
                                <br/><br/>


                            </div>
                        )}
                        {recurringSearches.length === 0 && (
                            <div>
                                <br/>
                                <div className={"noRecurringSearchesTitle"}>
                                    You don't have any recurring searches
                                    <SentimentDissatisfiedOutlinedIcon/>
                                </div>
                                <br/><br/>


                            </div>
                        )}
                        {pendingMatches.length === 0 && (
                            <div>
                                <br/>
                                <div className={"noPendingMatchesTitle"}>
                                    You don't have any pending confirmations
                                    <SentimentDissatisfiedOutlinedIcon/>
                                </div>
                                <br/>
                            </div>
                        )}


                    </div>
                </div>
            )}
            <ToastContainer/> {/* Mover el ToastContainer aquí */}
        </div>


    )


}

/*
{mapState &&
                    <div className="popup" style={{top: "30%"}}>
                        <BingMap
                            infoboxesWithPushPins = {
                                {"location": [teamSelectedLoc.latitude, teamSelectedLoc.longitude],
                                "addHandler":"mouseover",
                                "infoboxOption": { title: 'Your location'},
                                "pushPinOption":{ title: 'Your location', description: 'Pushpin' },
                                "infoboxAddHandler": {"type" : "click", callback: this.callBackMethod },
                                "pushPinAddHandler": {"type" : "click", callback: this.callBackMethod }}}
                        />
                        <button onClick={OpenCloseMap}>Close Map</button>
                    </div>
}}

                ----------------

                const newInfoboxesWithPushPins = [{
                "location": [teamSelectedLoc.latitude, teamSelectedLoc.longitude],
                "addHandler":"mouseover",
                "infoboxOption": { title: 'Your location'},
                "pushPinOption":{ title: 'Your location', description: 'Pushpin' },
                "infoboxAddHandler": {"type" : "click", callback: this.callBackMethod },
                "pushPinAddHandler": {"type" : "click", callback: this.callBackMethod }
            }]
            setPushpin(newInfoboxesWithPushPins)
            setLocationHandle(JSON.stringify(teamSelectedLoc))
*/