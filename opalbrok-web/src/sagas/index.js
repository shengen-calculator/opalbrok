import {takeLatest} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import {logIn, logOut} from "./authenticationSaga";

function* mySaga() {
    yield takeLatest(types.LOG_OUT_REQUEST, logOut);
    yield takeLatest(types.AUTHENTICATION_REQUEST, logIn);

}

export default mySaga;