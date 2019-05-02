import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function invoiceReducer(state = initialState.invoice, action) {
    switch (action.type) {

        case types.INVOICE_GENERATE_RESULT_REQUEST:
            return {
                ...state,
                isGenereting: true,
                colli: action.params.colli,
                brutto: action.params.brutto,
                urlOne: '',
                urlTwo: ''
            };

        case types.INVOICE_GENERATE_RESULT_SUCCESS:
            return {
                ...state,
                isGenereting: false,
                urlOne: action.data.urlOne,
                urlTwo: action.data.urlTwo
            };

        case types.INVOICE_GENERATE_RESULT_FAILURE:
            return {
                ...state,
                isGenereting: false,
                colli:'',
                brutto:''
            };

        case types.INVOICE_CALCULATE_REQUEST:
            return {
                ...state,
                isCalculating: true,
                fileName: action.params,
                urlOne: '',
                urlTwo: '',
                colli:'',
                brutto:''
            };

        case types.CATALOG_INSERT_REQUEST:
            return {
                ...state,
                urlOne: '',
                urlTwo: '',
            };

        case types.AUTHENTICATION_SUCCESS:
            return {
                ...state,
                isCalculating: false,
                isGenereting: false
            };

        case types.INVOICE_CALCULATE_SUCCESS:
            return {
                ...state,
                isCalculating: false,
                missedPositions: action.data.missedPositions,
                missedPositionsUrl: action.data.url,
                netto: action.data.netto,
                total: action.data.total
            };

        case types.INVOICE_CALCULATE_FAILURE:
            return {
                ...state,
                isCalculating: false,
                missedPositions: 0,
                missedPositionsUrl: '',
                netto: 0,
                total: 0
            };

        default:
            return state;
    }
}