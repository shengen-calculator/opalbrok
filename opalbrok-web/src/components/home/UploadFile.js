import React from 'react';
import '../../css/fileinput.min.css';


const UploadFile = ({file, onLoad, onChange, isWorking, status}) => {
    const clearInput = (event) => {
        event.target.value = null;
    };

    return (
        <div>
            <div className="form-group">
                <div className="file-input file-input-ajax-new">
                    <div className="input-group ">
                        <div
                            className="form-control file-caption  kv-fileinput-caption">
                            <div className="file-caption-name">
                                {(file !== null) && <span className="glyphicon glyphicon-file kv-caption-icon"/>}
                                {(file !== null) && file.name}
                            </div>
                        </div>

                        <div className="input-group-btn">
                            <div
                                className={isWorking ?
                                    'btn btn-primary btn-file disabled' :
                                    'btn btn-primary btn-file'}>Browse<input
                                type="file" name="form-register-photo"
                                onChange={onChange}
                                onClick={clearInput}
                                disabled={isWorking}/></div>
                        </div>
                    </div>
                </div>
            </div>

            <p>
                {(file !== null) &&
                <button type="submit" className="btn btn-block btn-secondary"
                        onClick={onLoad} disabled={isWorking}>{isWorking ? status : 'Load file'}</button>}
            </p>
        </div>
    );
};

export default UploadFile;