import {call, put} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import StorageApi from '../api/fbStorage';
import history from '../components/common/history';

export function* fileUpload(action) {
    try {
        const data = yield call(StorageApi.upload, action.params);
        yield put({type: types.FILE_UPLOAD_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.FILE_UPLOAD_FAILURE, error: e});
        history.push(`/error/${e.message.toString().replace('/','-')}`);
    }
}