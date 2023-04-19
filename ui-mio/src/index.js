import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {TeamIdProvider} from './service/teamId'

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <TeamIdProvider>
                <App />
            </TeamIdProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
)
;
