import * as React from 'react'
import {useEffect, useState} from 'react'
import {useNavigate} from "react-router";
import {useAuthProvider} from "../auth/auth";
import {useMySystem} from "../service/mySystem";

function goToTeams() {
    window.location.href = "/pickTeam"
}

function goToUserInfo() {
    window.location.href = "/userInfo"
}

export const HomePage = () => {
    const navigate = useNavigate()
    const mySystem = useMySystem()
    const auth = useAuthProvider()
    const token = auth.getToken();
    const [user, setUser] = useState('')
    const [once, setOnce] = useState(true);

    const signOut = () => {
        auth.removeToken();

        //TODO falta llamar al server
        navigate("/");
    }
    const getUser = () => {
        console.log(token)
        mySystem.getUser(token, (user) => setUser(user))
        console.log(user)
        setOnce(false);
    }

    return (
        <div>
            {once && getUser()}
            <nav className="navbar navbar-default" role="navigation">
                <div>
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <a href="" onClick={signOut}>Sign Out</a>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="container">
                <h1>Hi {user.firstName}
                </h1>
            </div>
            <div>
                <button id="submit" type="submit" onClick={() => goToTeams()}>Teams</button>
            </div>

            <footer className="footer">
                <a href="" onClick={goToUserInfo}>User Information</a>
            </footer>
        </div>
    )
}