import React, {Component} from 'react';
import HomePage from './components/home/HomePage';
import ResultPage from './components/result/ResultPage';
import ErrorPage from './components/error/ErrorPage';
import LoginPage from './components/authentication/LoginPage';
import {bindActionCreators} from 'redux';
import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';
import history from '../src/components/common/history';
import PrivateRoute from './components/common/PrivateRoute';
import * as authenticationAction from './actions/authenticationActions';
import './App.css';
import { Router, Route } from 'react-router-dom';

class App extends Component {
    render() {
        const {auth} = this.props;
        return (
            <Router history={history}>
                <div>
                    <nav>
                        <NavLink exact to="/">Home Page</NavLink>
                        {" | "}
                        <NavLink to="/login">Login Page</NavLink>
                    </nav>
                    <Route path="/login" component={LoginPage}/>
                    <Route path="/error/:message" component={ErrorPage}/>
                    <Route path="/result/:code" component={ResultPage}/>
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
