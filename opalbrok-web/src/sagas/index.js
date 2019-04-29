import {takeLatest} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import {logIn, logOut} from "./authenticationSaga";
import {fileUpload} from "./fileUploadSaga";

function* mySaga() {
    yield takeLatest(types.LOG_OUT_REQUEST, logOut);
    yield takeLatest(types.AUTHENTICATION_REQUEST, logIn);
    yield takeLatest(types.FILE_UPLOAD_REQUEST, fileUpload);
}

export default mySaga;