import React from 'react';

const InvoiceInfo = ({
                         total, netto, isTotalNotVerified, isNettoNotVerified,
                         onStart, onColliUpdated,onBruttoUpdated, colli,
                         brutto, isGenerating
                     }) => (
    <div>
        <div className="row">
            <div className="company-stats">
                <div className="company-stat col-xs-12 col-sm-6">
                    <span>
                        Total price, Euro
                        {isTotalNotVerified && <div className="resume-main-not-verified">
                            <i className="fa fa-warning"/>
                        </div>}
                    </span>
                    <strong>{total}</strong>
                </div>

                <div className="company-stat col-xs-12 col-sm-6">
                    <span>
                        Netto, kg
                        {isNettoNotVerified && <div className="resume-main-not-verified">
                            <i className="fa fa-warning"/>
                        </div>}
                    </span>
                    <strong>{netto}</strong>
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
