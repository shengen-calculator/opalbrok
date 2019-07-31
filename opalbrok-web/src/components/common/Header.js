import React, {Component} from 'react';
import history from "./history";
import {bindActionCreators} from 'redux';
import * as authenticationAction from "../../actions/authenticationActions";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

class Header extends Component {
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
        const {pathname} = this.props.location;
        const showLogIn = pathname !== '/login';
        debugger;
        const {auth} = this.props;
        return (
            <div className="header-wrapper">
                <div className="header">
                    <div className="header-top">
                        <div className="container">
                            <div className="header-brand">

                                <div className="header-slogan">
                                    <span className="header-slogan-text">Custom Broker</span>
                                </div>
                            </div>

                            <ul className="header-actions nav nav-pills">
                                <li>
                                    {showLogIn &&
                                    <a href="#logout" onClick={this.logout}>{auth.loggedIn ? 'Log Out' : 'Log In'}</a>}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
