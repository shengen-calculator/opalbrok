const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const utils = require('./utils');

const addProducts = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    const workbook = await utils.ReadXls(`/InBox/${data}`);
    const promises = [];
    let counter = 0;

    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, number) => {
            if(number > 1) {
                const item = row.values[4].toString();
                const description = row.values[1];
                const descriptionUa = row.values[2];
                const oumU = row.values[7];
                const oumH = row.values[5];
                const oumT = row.values[6];
                const uktz = row.values[8];
                const g31 = row.values[3];
                if(item) {
                    promises.push(admin.firestore().collection('products').doc(item.replace('/','#')).set({
                        item,
                        description,
                        descriptionUa,
                        oumU,
                        oumH,
                        oumT,
                        uktz,
                        g31
                    }));
                    counter++;
                }
            }
        });

        console.log(counter);
    });

    await Promise.all(promises);

    return {inserted: counter}
};


module.exports = addProducts;