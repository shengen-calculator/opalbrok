import React, {Component} from 'react';
import HomePage from './components/home/HomePage';
import ErrorPage from './components/error/ErrorPage';
import LoginPage from './components/authentication/LoginPage';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import history from '../src/components/common/history';
import PrivateRoute from './components/common/PrivateRoute';
import * as authenticationAction from './actions/authenticationActions';
import { Router, Route } from 'react-router-dom';

import './css/font-style.css';
import './css/font-awesome.min.css';
import './css/App.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);
        this.logout = this.logout.bind(this);
    }

    logout(event) {
        event.preventDefault();
        this.props.actions.logoutRequest();
        history.push('/');
    }

    render() {
        const {auth} = this.props;
        return (
            <Router history={history}>
                <div className="page-wrapper">
                    <div className="header-wrapper">
                        <div className="header">
                            <div className="header-top">
                                <div className="container">
                                    <div className="header-brand">

                                        <div className="header-slogan">
                                        <span
                                            className="header-slogan-text">Custom Broker</span>
                                        </div>
                                    </div>

                                    <ul className="header-actions nav nav-pills">
                                        <li><a href="#logout" onClick={this.logout}>{auth.loggedIn ? 'Log Out' : 'Log In'}</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
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

function mapStateToProps(state, ownProps) {
    return {
        auth: state.authentication
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authenticationAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
