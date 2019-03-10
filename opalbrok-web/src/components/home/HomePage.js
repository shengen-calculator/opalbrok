import React, {Component} from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {storage} from '../../api/database';
import history from '../common/history';
import '../../css/fileinput.min.css';

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
                                <form method="get" action="?">

                                    <div className="form-group">
                                        <div className="file-input file-input-ajax-new">
                                            <div className="input-group ">
                                                <div
                                                    className="form-control file-caption  kv-fileinput-caption">
                                                    <div className="file-caption-name">
                                                        pofigname.xls
                                                    </div>
                                                </div>

                                                <div className="input-group-btn">
                                                    <div className="btn btn-primary btn-file">Browse<input
                                                        type="file" name="form-register-photo"
                                                        id="form-register-photo"/></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <p>
                                        <a href="#figwam" className="btn btn-block btn-default">Load
                                            file</a>
                                    </p>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label>Positions not found</label>
                                                <input type="text" className="form-control" disabled
                                                       value={14}/>
                                            </div>
                                        </div>

                                    </div>

                                    <p>
                                        <a href="#fignam" className="btn btn-block btn-success"><i className="fa fa-download"></i>Download 3</a>
                                    </p>


                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Total price, Euro</label>
                                                <input type="text" className="form-control" disabled
                                                       value={250}/>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Netto, kg</label>
                                                <input type="text" className="form-control" disabled
                                                       value={315}/>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Colli</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Brutto, kg</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>

                                    </div>
                                    <p>
                                        <a href="#fignam" className="btn btn-block btn-secondary">Start</a>
                                    </p>

                                    <p>
                                        <a href="#fignam" className="btn btn-block btn-success"><i className="fa fa-download"></i>Download 1</a>
                                    </p>

                                    <p>
                                        <a href="#fignam" className="btn btn-block btn-success"><i className="fa fa-download"></i>Download 2</a>
                                    </p>


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