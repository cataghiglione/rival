const restApiEndpoint = "http://localhost:4326"

export const login = (credentials, okCallback, errorCallback) =>{
    fetch(`${restApiEndpoint}/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    }).then(resp => {
        if (resp.status === 201) {
            resp.json().then(body => okCallback(body))
        } else {
            errorCallback("Invalid user or password")
        }
    }).catch(e => errorCallback("Unable to connect to My System API"))
}
export const register = (user, okCallback, errorCallback) => {
    fetch('http://localhost:4326/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(resp => {
        if (resp.status === 201) {
            okCallback()
        } else {
            errorCallback()
        }
    })
}
export const newTeam = (token,user, okCallback, errorCallback) => {
    console.log("estoy en mysistem")
    fetch(`${restApiEndpoint}/newTeam`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token

        },
        body: JSON.stringify(user)
    }).then(resp => {
        if (resp.status === 201) {
            okCallback()
        } else {
            errorCallback()
        }
    })
}

export const signOut = (token, okCallback, errorCallback) => {
    fetch(`${restApiEndpoint}/auth`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(resp => {
        if (resp.status === 200) {
            okCallback();
        } else {
            errorCallback("Could not sign out")
        }
    })
}

export const listTeams = (token, okCallback, errorCallback) => {
    fetch('http://localhost:4326/pickTeam', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(resp => {
        if (resp.status === 200) {
            resp.json().then(teams => okCallback(teams))
        } else {
            errorCallback("Could not load teams")
        }
    })
}

export const getUser = (token, okCallback, errorCallback) => {
    fetch(`${restApiEndpoint}/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(resp => {
        if (resp.status === 200) {
            // var mydata = JSON.parse(resp);
            // okCallback(mydata)
            resp.json().then(value => {
                okCallback(JSON.parse(value));
            }).catch(err => {
                console.log(err);
            });
        } else {
            errorCallback("no llegue")
            okCallback("")
        }
        return resp.body;
    })
}

export const findRival = (token,id, okCallback, errorCallback) => {
    fetch(`${restApiEndpoint}/findRival?id=${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    }).then(resp => {
        if (resp.status === 200) {
            resp.json().then(teams => okCallback(teams))
        } else {
            errorCallback()
        }
    })
}

export const getTeam = (token, id, okCallback, errorCallback) => {
    //                                aca agregas al path del *back* el id
    fetch(`${restApiEndpoint}/getTeamById?id=${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(resp => {
        if (resp.status === 200) {
            // var mydata = JSON.parse(resp);
            // okCallback(mydata)
            resp.json().then(value => {
                okCallback(JSON.parse(value));
            }).catch(err => {
                console.log(err);
            });
        } else {
            errorCallback()
        }
        return resp.body;
    })
}
