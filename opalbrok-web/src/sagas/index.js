import {takeLatest} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import {logIn, logOut} from "./authenticationSaga";
import {catalogUpload, invoiceUpload} from "./fileUploadSaga";
import {invoiceCalculate, addProducts, generateResults} from "./functionSaga";

function* mySaga() {
    yield takeLatest(types.LOG_OUT_REQUEST, logOut);
    yield takeLatest(types.AUTHENTICATION_REQUEST, logIn);
    yield takeLatest(types.CATALOG_UPLOAD_REQUEST, catalogUpload);
    yield takeLatest(types.INVOICE_UPLOAD_REQUEST, invoiceUpload);
    yield takeLatest(types.INVOICE_CALCULATE_REQUEST, invoiceCalculate);
    yield takeLatest(types.INVOICE_GENERATE_RESULT_REQUEST, generateResults);
    yield takeLatest(types.CATALOG_INSERT_REQUEST, addProducts);
}

export default mySaga;