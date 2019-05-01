import {takeLatest} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import {logIn, logOut} from "./authenticationSaga";
import {catalogUpload, invoiceUpload} from "./fileUploadSaga";

function* mySaga() {
    yield takeLatest(types.LOG_OUT_REQUEST, logOut);
    yield takeLatest(types.AUTHENTICATION_REQUEST, logIn);
    yield takeLatest(types.CATALOG_UPLOAD_REQUEST, catalogUpload);
    yield takeLatest(types.INVOICE_UPLOAD_REQUEST, invoiceUpload);
}

export default mySaga;