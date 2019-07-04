const admin = require('firebase-admin');
const functions = require('firebase-functions');
const calculateInvoice = require('./calculateInvoice');
const generateResults = require('./generateResults');
const addProducts = require('./addProducts');

admin.initializeApp();

exports.generateResults = functions.https.onCall(async (data, context) => {
    return generateResults(data, context);
});

exports.calculateInvoice = functions.https.onCall(async (data, context) => {
    return calculateInvoice(data, context);
});

exports.addProducts = functions.https.onCall(async (data, context) => {
    return addProducts(data, context);
});

