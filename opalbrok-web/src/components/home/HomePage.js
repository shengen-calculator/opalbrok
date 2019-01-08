import React, {Component} from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import history from '../common/history';

class HomePage extends Component {
    constructor(props, context) {
        super(props, context);

        this.logout = this.logout.bind(this);
    }

    logout() {
        this.props.actions.logoutRequest();
        history.push('/');
    }
    render() {
        return (
            <div>
                <h1>Home Page</h1>
                <button onClick={this.logout}>Log Out</button>
            </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage));