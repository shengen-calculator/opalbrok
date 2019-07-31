import React, {Component} from 'react';
import HomePage from './components/home/HomePage';
import ErrorPage from './components/error/ErrorPage';
import LoginPage from './components/authentication/LoginPage';
import {connect} from 'react-redux';
import history from '../src/components/common/history';
import PrivateRoute from './components/common/PrivateRoute';
import { Router, Route } from 'react-router-dom';

import './css/font-style.css';
import './css/font-awesome.min.css';
import './css/App.css';

class App extends Component {

    render() {
        const {auth} = this.props;
        return (
            <Router history={history}>
                <div className="page-wrapper">
                    <Route path="/login" component={LoginPage}/>
                    <Route path="/error/:message" component={ErrorPage}/>
                    <PrivateRoute exact path="/"
                                  authed={auth.loggedIn}
                                  component={HomePage}
                    />
                </div>
            </Router>

        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.authentication
    };
}

export default connect(mapStateToProps)(App);
