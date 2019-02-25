import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import './LoginPage.css';

class LoginPage extends Component {
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

        this.props.actions.authenticationRequest({
            email: this.state.credentials.email,
            password: this.state.credentials.password
        })
    };

    render() {
        const {auth} = this.props;
        const {from} = this.props.location.state || {from: {pathname: '/'}};

        if (auth.loggedIn === true) {
            return <Redirect to={from}/>
        }
        return (
            <div className="login-page">
                <h1>Login Page</h1>
                <form>
                    <div className="email-input">
                        <input type="text"
                               name="email"
                               value={this.state.credentials.email}
                               onChange={this.updateCrdentials}/>
                    </div>
                    <div className="password-input">
                        <input type="password"
                               name="password"
                               value={this.state.credentials.password}
                               onChange={this.updateCrdentials}/>
                    </div>
                    <div className="submit-input">
                        <input type="submit"
                               disabled={auth.logging}
                               value={auth.logging ? 'Logging....' : 'Log In'}
                               onClick={this.login}/>
                    </div>
                </form>
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