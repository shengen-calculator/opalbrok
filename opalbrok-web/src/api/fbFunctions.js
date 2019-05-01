import {functions} from './database';

class FunctionsApi {
    static calculateInvoice(invoice){
        const func = functions.httpsCallable('calculateInvoice');
        return func(invoice);
    }
    static addProducts(catalog){
        const func = functions.httpsCallable('addProducts');
        return func(catalog);
    }
    static generateResults(invoice){
        const func = functions.httpsCallable('generateResults');
        return func(invoice);
    }
}

export default FunctionsApi;