import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function catalogReducer(state = initialState.catalog, action) {
    switch (action.type) {

        case types.CATALOG_INSERT_REQUEST:
            return {
                ...state
            };

        case types.CATALOG_INSERT_SUCCESS:
            return {
                ...state
            };

        case types.CATALOG_INSERT_FAILURE:
            return {
                ...state
            };

        default:
            return state;
    }
}