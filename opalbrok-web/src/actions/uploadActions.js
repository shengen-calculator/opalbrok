import * as types from './actionTypes';

export function fileUploadRequest(params) {
    return { type: types.FILE_UPLOAD_REQUEST, params};
}
