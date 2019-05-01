import React from 'react';

const Results = ({urlOne, urlTwo}) => (
    <div className="row">
        <div className="col-md-6">
            <p>
                <a href={urlOne} className="btn btn-block btn-primary">
                    <i className="fa fa-download"/>
                    Download 1
                </a>
            </p>
        </div>
        <div className="col-md-6">
            <p>
                <a href={urlTwo} className="btn btn-block btn-secondary">
                    <i className="fa fa-download"/>
                    Download 2
                </a>
            </p>
        </div>
    </div>
);

export default Results;


