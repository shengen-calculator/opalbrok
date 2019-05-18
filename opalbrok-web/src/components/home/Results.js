import React from 'react';

const Results = ({urlOne, urlTwo}) => (
    <div className="row">
        <div className="col-md-6">
            <p>
                <a href={urlTwo} className="btn btn-block btn-default" download>
                    <i className="fa fa-download"/>
                    MD
                </a>
            </p>
        </div>
        <div className="col-md-6">
            <p>
                <a href={urlOne} className="btn btn-block btn-default" download>
                    <i className="fa fa-download"/>
                    E
                </a>
            </p>
        </div>
    </div>
);

export default Results;


