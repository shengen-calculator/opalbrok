import React, {Component} from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

class ResultPage extends Component {

    render() {
        return (
            <div>
                <h1>Result Page</h1>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultPage));