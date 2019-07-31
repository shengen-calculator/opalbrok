import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import Header from "../common/Header";

class LoginPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            logging: false,
            credentials: {email: '', password: ''}
        };
        this.login = this.login.bind(this);
        this.updateCrdentials = this.updateCrdentials.bind(this);
    }

    updateCrdentials(event) {
        const field = event.target.name;
        let credentials = this.state.credentials;
        credentials[field] = event.target.value;
        return this.setState({credentials: credentials});
    }

    login(event) {
        event.preventDefault();

        if (!this.state.credentials.email || !this.state.credentials.password)
            return;

        this.props.actions.authenticationRequest({
            email: this.state.credentials.email,
            password: this.state.credentials.password
        })
    };

    render() {
        const {auth} = this.props;
        const {from} = this.props.location.state || {from: {pathname: '/'}};

        const emailClassName = this.state.credentials.email ? 'form-group' : 'form-group  has-error';
        const passwordClassName = this.state.credentials.password ? 'form-group' : 'form-group  has-error';

        if (auth.loggedIn === true) {
            return <Redirect to={from}/>
        }
        return (
            <div className="page-wrapper">
                <Header/>
                <div className="main-wrapper">
                    <div className="main">
                        <div className="document-title">
                            <div className="container">
                                <h1 className="center">Login Page</h1>
                            </div>
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-4 col-md-offset-4">
                                    <form method="get" action="?">
                                        <div className={emailClassName}>
                                            <label htmlFor="form-login-username">Username</label>
                                            <input type="text" className="form-control is-invalid"
                                                   id="form-login-username" name="email"
                                                   value={this.state.credentials.email}
                                                   onChange={this.updateCrdentials}/>
                                        </div>

                                        <div className={passwordClassName}>
                                            <label htmlFor="form-login-password">Password</label>
                                            <input type="password" className="form-control"
                                                   id="form-login-password" name="password"
                                                   value={this.state.credentials.password}
                                                   onChange={this.updateCrdentials}/>
                                        </div>

                                        <div className="form-group">
                                            <input type="submit"
                                                   disabled={auth.logging}
                                                   value={auth.logging ? 'Logging....' : 'Log In'}
                                                   onClick={this.login}
                                                   className="btn btn-secondary btn-block">
                                            </input>
                                        </div>

                                        <div className="row">
                                            <div className="col-xs-6 col-sm-6">
                                            </div>

                                            <div className="col-xs-6 col-sm-6">
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.authentication
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authenticationAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);