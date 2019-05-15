import React from 'react';

const InvoiceInfo = ({
                         total, netto, onStart, onColliUpdated,
                         onBruttoUpdated, colli, brutto, isGenerating
                     }) => (
    <div>
        <div className="row">
            <div className="col-sm-6">
                <div className="form-group">
                    <label>Total price, Euro</label>
                    <input type="text" className="form-control" disabled
                           value={total}/>
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
                <div className={colli === '' ? 'form-group has-error' : 'form-group'}>
                    <label>Colli</label>
                    <input type="text" onChange={onColliUpdated} className="form-control"
                           value={colli} disabled={isGenerating}/>
                </div>
            </div>

            <div className="col-sm-6">
                <div className={brutto === '' ? 'form-group has-error' : 'form-group'}>
                    <label>Brutto, kg</label>
                    <input type="text" onChange={onBruttoUpdated} className="form-control"
                           value={brutto} disabled={isGenerating}/>
                </div>
            </div>

        </div>
        <p>
            <button type="submit" onClick={onStart} disabled={isGenerating}
               className="btn btn-block btn-secondary">
                {isGenerating ? "Generating ..." : "Start"}</button>
        </p>
    </div>
);

export default InvoiceInfo;


