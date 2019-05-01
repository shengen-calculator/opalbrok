import * as types from './actionTypes';

export function catalogUploadRequest(params) {
    return { type: types.CATALOG_UPLOAD_REQUEST, params};
}

export function invoiceUploadRequest(params) {
    return { type: types.INVOICE_UPLOAD_REQUEST, params};
}
