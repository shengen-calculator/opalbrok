import React, {Component} from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import UploadFile from './UploadFile';
import MissedPositions from './MissedPositions';
import InvoiceInfo from './InvoiceInfo';
import Results from './Results';
import {storage} from '../../api/database';
import history from '../common/history';

class HomePage extends Component {
    constructor(props, context) {
        super(props, context);

        this.logout = this.logout.bind(this);
        this.updatePathToFile = this.updatePathToFile.bind(this);
        this.load = this.load.bind(this);
    }

    updatePathToFile(event) {
        return this.setState({path: event.target.files[0]});
    }

    logout() {
        this.props.actions.logoutRequest();
        history.push('/');
    }

    load() {
        const position = this.props.auth.email.indexOf('@');
        const storageRef = storage.ref(
            `/InBox/${this.props.auth.email.substr(0, position)}_${this.state.path.name}`);
        storageRef.put(this.state.path)
            .then(function (snapshot) {
                const news = snapshot;
                return news;
            })
            .catch((e) => {
                history.push(`/error/${e.message}`);
            });
    }

    render() {
        return (
            /* <div>
                 <h1>Home Page</h1>

                 <input type="file" onChange={this.updatePathToFile}/>
                 <button onClick={this.load}>Load File</button>
                 <button onClick={this.logout}>Log Out</button>
             </div>*/
            <div className="main-wrapper">
                <div className="main">
                    <div className="document-title">
                        <div className="container">
                            <h1 className="center">Home Page</h1>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
                                <form>

                                    <UploadFile fileName='pofigname.xlsx'/>

                                    {(1 === 2) && <MissedPositions quantity={25}/>}

                                    {(3 === 4) && <InvoiceInfo price={210} netto={315}/>}

                                    {(5 === 6) && <Results/>}

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
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