import React from 'react';
import '../../css/fileinput.min.css';

const UploadFile = ({file, uploading, onChange, onLoad}) => (
    <div>
        <div className="form-group">
            <div className="file-input file-input-ajax-new">
                <div className="input-group ">
                    <div
                        className="form-control file-caption  kv-fileinput-caption">
                        <div className="file-caption-name">
                            {(file !== null) && <span className="glyphicon glyphicon-file kv-caption-icon"/>}
                            {(file !==null) && file.name}
                        </div>
                    </div>

                    <div className="input-group-btn">
                        <div className="btn btn-primary btn-file">Browse<input
                            type="file" name="form-register-photo" onChange={onChange}
                            id="form-register-photo"/></div>
                    </div>
                </div>
            </div>
        </div>

        <p>
            {(file !== null && !uploading) &&
            <a href="#upload" className="btn btn-block btn-default" onClick={onLoad}>Load file</a>}
        </p>
        <p>
            {(uploading) &&
            <a href="#upload" className="btn btn-block btn-default" disabled onClick={onLoad}>Loading...</a>}
        </p>
    </div>
);

export default UploadFile;