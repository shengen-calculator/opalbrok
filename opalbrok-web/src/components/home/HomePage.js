import React from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import * as uploadAction from '../../actions/uploadActions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import UploadFile from './UploadFile';
import MissedPositions from './MissedPositions';
import InvoiceInfo from './InvoiceInfo';
import Results from './Results';
import history from '../common/history';
import * as utils from '../../utils/fileNameService';


class HomePage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            fileUpload: null
        };

        this.logout = this.logout.bind(this);
        this.fileOnSelect = this.fileOnSelect.bind(this);
        this.fileOnUpload = this.fileOnUpload.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.upload.isLoading && !nextProps.upload.isLoading) {
            const isCatalog = utils.isCatalog(this.state.fileUpload.name);
            this.setState({fileUpload: null});
            this.startHandling(isCatalog);
        }
    }

    startHandling(isCatalog) {

    }

    fileOnSelect(event) {
        event.preventDefault();
        if(event.target.files.length > 0)
            this.setState({fileUpload: event.target.files[0]});

    }
    fileOnUpload(event) {
        event.preventDefault();
        this.props.uploadActions.fileUploadRequest({
            filePath: utils.getPath(this.state.fileUpload.name, this.props.auth.email),
            file: this.state.fileUpload
        });
    }

    logout() {
        this.props.authActions.logoutRequest();
        history.push('/');
    }


    render() {
        const uploading = this.props.upload.isLoading;
        return (
            <div className="main-wrapper">
                <div className="main">
                    <div className="document-title">
                        <div className="container">
                            <h1 className="center">Home Page</h1>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8 col-md-offset-2">
                                <form>

                                    <UploadFile file={this.state.fileUpload}
                                                onChange={this.fileOnSelect}
                                                onLoad={this.fileOnUpload}
                                                uploading={uploading}
                                    />

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
        auth: state.authentication,
        upload: state.fileUpload
    };
}

function mapDispatchToProps(dispatch) {
    return {
        authActions: bindActionCreators(authenticationAction, dispatch),
        uploadActions: bindActionCreators(uploadAction, dispatch)
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage));