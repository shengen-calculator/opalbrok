import React from 'react';
import '../../css/fileinput.min.css';

const UploadFile = ({file, onLoad, onChange, isWorking, status}) => (
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
                        <div className={isWorking ? 'btn btn-primary btn-file disabled' : 'btn btn-primary btn-file'}>Browse<input
                            type="file" name="form-register-photo"
                            onChange={onChange}
                            disabled={isWorking}/></div>
                    </div>
                </div>
            </div>
        </div>

        <p>
            {(file !== null)&&
            <a href="#upload" className="btn btn-block btn-default"
               onClick={onLoad} disabled={isWorking}>{isWorking ? status : 'Load file'}</a>}
        </p>
    </div>
);

export default UploadFile;