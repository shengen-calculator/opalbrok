import * as types from './actionTypes';

export function catalogInsertRequest(params) {
    return { type: types.CATALOG_INSERT_REQUEST, params};
}

export function calculateInvoiceRequest(params) {
    return { type: types.INVOICE_CALCULATE_REQUEST, params};
}

export function generateResultsRequest(params) {
    return { type: types.INVOICE_GENERATE_RESULT_REQUEST, params};
}