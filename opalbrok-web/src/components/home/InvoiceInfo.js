import React from 'react';

const InvoiceInfo = ({price, netto}) => (
    <div>
        <div className="row">
            <div className="col-sm-6">
                <div className="form-group">
                    <label>Total price, Euro</label>
                    <input type="text" className="form-control" disabled
                           value={price}/>
                </div>
            </div>

            <div className="col-sm-6">
                <div className="form-group">
                    <label>Netto, kg</label>
                    <input type="text" className="form-control" disabled
                           value={netto}/>
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
    </div>
);

export default InvoiceInfo;


