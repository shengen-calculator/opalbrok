import React from 'react';
import Header from "../common/Header";

class ErrorPage extends React.Component {
    render() {
        return (
            <div className="page-wrapper">
                <Header/>
                <div className="main-wrapper">
                    <div className="main">
                        <div className="document-title">
                            <div className="container">
                                <h1 className="center">Error Page</h1>
                            </div>
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-10 col-sm-offset-1 text-center">
                                    <form method="get" action="?">
                                        <div className="row">
                                            <h2 className="page-header">{this.props.match.params.message}</h2>
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

export default ErrorPage;