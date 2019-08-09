const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils');

const addProducts = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition',
            'The function must be called while authenticated.');
    }

    const workbook = await utils.ReadXls(`/InBox/${data}`);
    const uktzMap = new Map();
    const promises = [];
    let counter = 0;

    const uktzTableSnapshot = await admin.firestore().collection('UKTZ_kod').get();

    uktzTableSnapshot.forEach(doc => {
        uktzMap.set(parseInt(doc.id), doc.data().G31);
    });

    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, number) => {
            if(number > 1) {
                const item = row.values[1].toString();
                const description = row.values[2];
                const descriptionUa = row.values[3];
                const oumH = row.values[4];
                const oumT = row.values[5];
                const oumU = row.values[6];
                const uktz = row.values[7];
                const g31 = uktzMap.has(uktz) ? uktzMap.get(uktz) : null;

                if(g31) {
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

                } else {
                    throw new functions.https.HttpsError('invalid-argument',
                        `Code uktz ${uktz} not found`);
                }

            }
        });

    });


    await Promise.all(promises);

    return {inserted: counter}
};


module.exports = addProducts;