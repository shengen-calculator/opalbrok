import React from 'react';
import '../../css/fileinput.min.css';

const UploadFile = ({fileName}) => (
    <div>
        <div className="form-group">
            <div className="file-input file-input-ajax-new">
                <div className="input-group ">
                    <div
                        className="form-control file-caption  kv-fileinput-caption">
                        <div className="file-caption-name">
                            <span className="glyphicon glyphicon-file kv-caption-icon"/>
                            {fileName}
                        </div>
                    </div>

                    <div className="input-group-btn">
                        <div className="btn btn-primary btn-file">Browse<input
                            type="file" name="form-register-photo"
                            id="form-register-photo"/></div>
                    </div>
                </div>
            </div>
        </div>
        <p>
            <a href="#figwam" className="btn btn-block btn-default">Load file</a>
        </p>
    </div>
);

export default UploadFile;