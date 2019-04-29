import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function fileUploadReducer(state = initialState.fileUpload, action) {
    switch (action.type) {

        case types.FILE_UPLOAD_REQUEST:
            return {
                ...state,
                isLoading: true
            };

        case types.FILE_UPLOAD_SUCCESS:
            return {
                ...state,
                isLoading: false,
                fileName: action.data.metadata.name
            };

        case types.FILE_UPLOAD_FAILURE:
            return {
                ...state,
                isLoading: false
            };

        default:
            return state;
    }
}