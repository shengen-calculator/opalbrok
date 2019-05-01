import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function invoiceReducer(state = initialState.invoice, action) {
    switch (action.type) {

        case types.INVOICE_GENERATE_RESULT_REQUEST:
            return {
                ...state
            };

        case types.INVOICE_GENERATE_RESULT_SUCCESS:
            return {
                ...state
            };

        case types.INVOICE_GENERATE_RESULT_FAILURE:
            return {
                ...state
            };

        case types.INVOICE_CALCULATE_REQUEST:
            return {
                ...state
            };

        case types.INVOICE_CALCULATE_SUCCESS:
            return {
                ...state
            };

        case types.INVOICE_CALCULATE_FAILURE:
            return {
                ...state
            };

        default:
            return state;
    }
}