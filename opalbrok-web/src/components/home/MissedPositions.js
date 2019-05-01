import React from 'react';

const MissedPositions = ({quantity, url}) => (
    <div>
        <div className="row">
            <div className="col-sm-12">
                <div className="form-group">
                    <label>Positions not found</label>
                    <input type="text" className="form-control" disabled
                           value={quantity}/>
                </div>
            </div>
        </div>
        <p>
            <a href={url} className="btn btn-block btn-primary" download="catalog.xls" >
                <i className="fa fa-download"/>Download Missed Positions</a>
        </p>
    </div>
);

export default MissedPositions;


