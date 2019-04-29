import {combineReducers} from 'redux';
import authentication from './authenticationReducer';
import fileUpload from './fileUploadReducer';

const rootReducer = combineReducers({
    authentication,
    fileUpload
});

export default rootReducer;