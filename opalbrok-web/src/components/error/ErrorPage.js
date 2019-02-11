import React, {Component} from 'react';

class ErrorPage extends Component {
    render() {
        return (
            <div>
                <h1>Error Page</h1>
                <h2>{this.props.match.params.message}</h2>
            </div>
        );
    }
}
export default ErrorPage;