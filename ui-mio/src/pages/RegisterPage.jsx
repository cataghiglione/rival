import * as React from 'react'
import {Link} from "react-router-dom";
import {useState} from "react";
import {useNavigate} from "react-router";
import {register} from "../service/mySystem";
import "../css/Login.css"
import "../images/RivalMatch_logoRecortado.png"

function goToLogin() {
    window.location.href = "/login"
}
export const RegisterPage = () => {

    const [username, setUsername] = useState('')
    const [mail, setMail] = useState('')
    const [password, setPassword] = useState('')
    const[name, setName] = useState('')
    const[lastName, setLastName] = useState('')

    const [errorMsg, setErrorMsg] = useState(undefined)
    const navigate = useNavigate();

    const handleSubmit = async e => {
        console.log("Estoy aca");
        e.preventDefault();
        if(!username || !name || !lastName || !mail || !password){
            setErrorMsg('Please fill out all the required fields')
            return;
        }
        registerUser({
            username: username,
            firstName: name,
            lastName: lastName,
            email: mail,
            password: password
        })
    }

    const resetForm = () => {
        setUsername('')
        setPassword('')
        setName('')
        setMail('')
        setLastName('')
    }

    const registerUser = (user) => {
        console.log("pase!")
        register(
            user,
            () => navigate("/login?ok=true"),
            () => {
                setErrorMsg('User already exists!')
                resetForm();
            }
        )
    }

    const usernameChange = (event) => {
        setUsername(event.target.value)
    }

    const passwordChange = (event) => {
        setPassword(event.target.value)
    }
    const nameChange = (event) => {
        setName(event.target.value)
    }
    const lastNameChange = (event) => {
        setLastName(event.target.value)
    }
    const mailChange = (event) => {
        setMail(event.target.value)
    }
    function RegisterRequest(){
        console.log("Im requesting a register!");
    }

    return (
        <div className={"mainContainer"}>
            {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

            <img style={{ width: 218, height: "auto"}} src={require("../images/RivalMatch_logoRecortado.png")} alt={"Logo"}/>
            <form onSubmit={handleSubmit}>
                <br/>
                <div>
                    <input type="email"
                           placeholder="name@example.com"
                           value={mail}
                           name="email"
                           onChange={mailChange}/>
                </div>

                <br/>
                <div>
                    <input type="Name"
                    id="Name"
                    placeholder="Name"
                    name ="Name"
                    value={name}
                    onChange={nameChange}/>
                </div>
                <br/>
                <div>
                    <input
                        type="lastName"
                        id="lastName"
                        placeholder="Last Name"
                        name="lastName"
                        value={lastName}
                        onChange={lastNameChange}/>
                </div>
                <br/>
                <div>
                    <input
                        type="username"
                        id="username"
                        placeholder="username"
                        name="username"
                        value={username}
                        onChange={usernameChange}/>
                </div>
                <br/>
                <div>
                    <input type="password"
                           id="floatingPassword"
                           placeholder="Password"
                           name="password"
                           value={password}
                           onChange={passwordChange}/>
                </div>
                <br/>
                <br/>
                <div>
                    {/*<button type="submit" className={"signUpButton"}>Sign up</button>*/}
                    <button id="submit" type="submit" onClick={() => RegisterRequest()}>Register</button>
                </div>
                <br/>
                <div>
                    <button className={"goToSignUp"} onClick={goToLogin}>Go to Login</button>
                </div>
            </form>
        </div>
    )
}
