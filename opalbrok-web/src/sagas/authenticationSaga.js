import {call, put} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import AuthenticationApi from '../api/fbAuthentication';
import history from '../components/common/history';

export function* logIn(action) {
    try {
        const data = yield call(AuthenticationApi.logIn, action.credentials);
        yield put({type: types.AUTHENTICATION_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.AUTHENTICATION_FAILURE, error: e});
        history.push(`/error/${e}`);
    }
}

export function* logOut() {
    try {
        yield call(AuthenticationApi.logOut);
        yield put({type: types.LOG_OUT_SUCCESS});

    } catch (e) {
        yield put({type: types.LOG_OUT_FAILURE, message: e.message});
        history.push(`/error/${e}`);
    }
}