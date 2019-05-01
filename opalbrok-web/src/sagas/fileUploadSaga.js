import {call, put} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import StorageApi from '../api/fbStorage';
import history from '../components/common/history';

export function* catalogUpload(action) {
    try {
        const data = yield call(StorageApi.upload, action.params);
        yield put({type: types.CATALOG_UPLOAD_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.CATALOG_UPLOAD_FAILURE, error: e});
        history.push(`/error/${e.message.toString().replace('/','-')}`);
    }
}

export function* invoiceUpload(action) {
    try {
        const data = yield call(StorageApi.upload, action.params);
        yield put({type: types.INVOICE_UPLOAD_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.INVOICE_UPLOAD_FAILURE, error: e});
        history.push(`/error/${e.message.toString().replace('/','-')}`);
    }
}