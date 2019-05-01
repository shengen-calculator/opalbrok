import {call, put} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import FunctionsApi from '../api/fbFunctions';
import history from '../components/common/history';

export function* invoiceCalculate(action) {
    try {
        const data = yield call(FunctionsApi.calculateInvoice, action.params);
        yield put({type: types.INVOICE_CALCULATE_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.INVOICE_CALCULATE_FAILURE, error: e});
        history.push(`/error/${e.message}`);
    }
}

export function* addProducts(action) {
    try {
        const data = yield call(FunctionsApi.addProducts, action.params);
        yield put({type: types.CATALOG_INSERT_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.CATALOG_INSERT_FAILURE, error: e});
        history.push(`/error/${e.message}`);
    }
}

export function* generateResults(action) {
    try {
        const data = yield call(FunctionsApi.generateResults, action.params);
        yield put({type: types.INVOICE_GENERATE_RESULT_SUCCESS, data: data});

    } catch (e) {
        yield put({type: types.INVOICE_GENERATE_RESULT_FAILURE, error: e});
        history.push(`/error/${e.message}`);
    }
}