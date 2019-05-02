import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function catalogReducer(state = initialState.catalog, action) {
    switch (action.type) {

        case types.CATALOG_INSERT_REQUEST:
            return {
                ...state,
                isInserting: true
            };

        case types.CATALOG_INSERT_SUCCESS:
            return {
                ...state,
                isInserting: false
            };

        case types.CATALOG_INSERT_FAILURE:
            return {
                ...state,
                isInserting: false
            };

        default:
            return state;
    }
}