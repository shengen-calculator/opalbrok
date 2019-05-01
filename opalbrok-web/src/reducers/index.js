import {combineReducers} from 'redux';
import authentication from './authenticationReducer';
import fileUpload from './fileUploadReducer';
import catalog from './catalogReducer';
import invoice from './invoiceReducer';

const rootReducer = combineReducers({
    authentication,
    fileUpload,
    catalog,
    invoice
});

export default rootReducer;