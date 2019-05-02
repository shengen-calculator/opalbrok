import React from 'react';
import * as authenticationAction from '../../actions/authenticationActions';
import * as uploadAction from '../../actions/uploadActions';
import * as functionAction from '../../actions/functionActions';
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
            fileUpload: null,
            isShowInvoiceInfo: false,
            isShowMissedPositions: false,
            colli: '',
            brutto: ''
        };

        this.logout = this.logout.bind(this);
        this.fileOnSelect = this.fileOnSelect.bind(this);
        this.fileOnUpload = this.fileOnUpload.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onColliUpdated = this.onColliUpdated.bind(this);
        this.onBruttoUpdated = this.onBruttoUpdated.bind(this);
    }

    componentDidMount() {
        if (this.props.invoice.missedPositions > 0) {
            this.setState({
                isShowMissedPositions: true
            });
        } else {
            if ((this.props.invoice.urlTwo && this.props.invoice.urlOne) ||
                (this.props.invoice.netto && this.props.invoice.total)) {
                this.setState({
                    colli: this.props.invoice.colli,
                    brutto: this.props.invoice.brutto,
                    isShowInvoiceInfo: true
                })
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        const isWorking = this.props.upload.isLoading ||
            this.props.invoice.isCalculating || this.props.catalog.isInserting;
        const willStop = !nextProps.upload.isLoading &&
            !nextProps.invoice.isCalculating && !nextProps.catalog.isInserting;

        if (isWorking && willStop) {
            if (this.props.upload.isLoading) {
                const isCatalog = utils.isCatalog(this.state.fileUpload.name);
                if (isCatalog) {
                    this.props.funcActions.catalogInsertRequest(
                        utils.getName(this.state.fileUpload.name, this.props.auth.email));
                } else {
                    this.props.funcActions.calculateInvoiceRequest(
                        utils.getName(this.state.fileUpload.name, this.props.auth.email));
                }
            }
            if (this.props.invoice.isCalculating) {
                if (this.props.invoice.missedPositions > 0) {
                    this.setState({fileUpload: null, isShowMissedPositions: true});
                } else {
                    this.setState({fileUpload: null, isShowInvoiceInfo: true});
                }

            }
            if (this.props.catalog.isInserting) {

                if(this.props.invoice.fileName) {
                    this.props.funcActions.calculateInvoiceRequest(
                        this.props.invoice.fileName);
                } else {
                    this.setState({fileUpload: null});
                }
            }

        }

    }


    fileOnSelect(event) {
        event.preventDefault();
        if (event.target.files.length > 0)
            this.setState({
                fileUpload: event.target.files[0],
                isShowInvoiceInfo: false,
                isShowMissedPositions: false,
                colli: '',
                brutto: ''
            });

    }

    fileOnUpload(event) {
        event.preventDefault();
        const isCatalog = utils.isCatalog(this.state.fileUpload.name);
        if (isCatalog) {
            this.props.uploadActions.catalogUploadRequest({
                filePath: utils.getPath(this.state.fileUpload.name, this.props.auth.email),
                file: this.state.fileUpload
            });
        } else {
            this.props.uploadActions.invoiceUploadRequest({
                filePath: utils.getPath(this.state.fileUpload.name, this.props.auth.email),
                file: this.state.fileUpload
            });
        }
    }

    onColliUpdated(event) {
        event.preventDefault();
        if (!isNaN(event.target.value)) {
            this.setState({
                ...this.state,
                colli: event.target.value
            });
        }
    }

    onBruttoUpdated(event) {
        event.preventDefault();
        if (!isNaN(event.target.value)) {
            this.setState({
                ...this.state,
                brutto: event.target.value
            });
        }
    }

    onStart(event) {
        event.preventDefault();
        if (this.state.brutto && this.state.colli) {
            this.props.funcActions.generateResultsRequest({
                colli: this.state.colli,
                brutto: this.state.brutto,
                netto: this.props.invoice.netto,
                total: this.props.invoice.total
            });
        }
    }

    logout() {
        this.props.authActions.logoutRequest();
        history.push('/');
    }


    render() {
        const isWorking = this.props.upload.isLoading ||
            this.props.invoice.isCalculating || this.props.catalog.isInserting;
        let status;
        if (this.props.upload.isLoading)
            status = 'Uploading ...';
        if (this.props.invoice.isCalculating)
            status = 'Calculating ...';
        if (this.props.catalog.isInserting)
            status = 'Inserting ...';

        let isShowResults = false;
        if (this.props.invoice.urlOne && this.props.invoice.urlTwo && !this.state.fileUpload)
            isShowResults = true;

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
                                                isWorking={isWorking || this.props.invoice.isGenereting}
                                                status={status}
                                    />

                                    {(this.state.isShowMissedPositions) &&
                                    <MissedPositions quantity={this.props.invoice.missedPositions}
                                                     url={this.props.invoice.missedPositionsUrl}/>}

                                    {(this.state.isShowInvoiceInfo) &&
                                    <InvoiceInfo total={this.props.invoice.total}
                                                 netto={this.props.invoice.netto}
                                                 onStart={this.onStart}
                                                 onBruttoUpdated={this.onBruttoUpdated}
                                                 onColliUpdated={this.onColliUpdated}
                                                 colli={this.state.colli}
                                                 brutto={this.state.brutto}
                                                 isGenerating={this.props.invoice.isGenereting}/>}

                                    {(isShowResults) && <Results
                                        urlOne={this.props.invoice.urlOne}
                                        urlTwo={this.props.invoice.urlTwo}
                                    />}
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
        upload: state.fileUpload,
        invoice: state.invoice,
        catalog: state.catalog
    };
}

function mapDispatchToProps(dispatch) {
    return {
        authActions: bindActionCreators(authenticationAction, dispatch),
        uploadActions: bindActionCreators(uploadAction, dispatch),
        funcActions: bindActionCreators(functionAction, dispatch)
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage));