'use strict';
const functions = require('firebase-functions');
const mkdirp = require('mkdirp-promise');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const excel = require('exceljs');


admin.initializeApp();


exports.generateResults = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }
    return {
        urlOne: 'www.google.com.ua',
        urlTwo: 'www.yahoo.com'
    };
});

exports.calculateInvoice = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    // read data from xlsx-file

    if (!data) {
        throw new functions.https.HttpsError('invalid-argument',
            'The function must be called with one argument "file Name"');
    }
    const filePath = `/InBox/${data}`;
    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    await mkdirp(tempLocalDir);
    const file = bucket.file(filePath);

    await file.download({destination: tempLocalFile});

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(tempLocalFile);
    let grandTotal = 0;
    let weightTotal = 0;
    let notFound = 0;


    const promises = [];
    const catalogItems =[];
    const invoiceItems = [];

    //check if the all positions are presents in catalog

    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, number) => {
            if(number > 1) {
                const item = row.values[2];
                const totalPrice = row.values[8];
                const weight = row.values[9];

                if(item) {
                    promises.push(
                        admin.firestore().collection('products').doc(item.replace('/','#')).get()
                    );

                    grandTotal += totalPrice;
                    weightTotal += weight;
                    invoiceItems.push(item);

                }
            }

        });
    });

    const snapshots = await Promise.all(promises);

    snapshots.forEach(querySnapshot => {

        const row = querySnapshot.data();
        if(!row)
            notFound++;
        else {
            catalogItems.push(row);
        }
    });

    fs.unlinkSync(tempLocalFile);

    if(notFound === 0) {
        return {
            total: grandTotal,
            netto: weightTotal,
            missedPositions: 0,
            url: ''
        };
    }

    const absenItems = invoiceItems.filter(i => !catalogItems.find(a => i === a.item));

    const catalogFileName = "catalog.xlsx";
    const catalogFilePath = `/OutBox/${catalogFileName}`;
    const tempLocalCatalogFile = path.join(os.tmpdir(), catalogFileName);
    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const metadata = {
        contentType: contentType,
        contentDisposition: `filename="${catalogFileName}"`
    };

    const catalogWorkbook = new excel.Workbook();


    // create new sheet with pageSetup settings for A4 - landscape
    const catalogWorksheet =  catalogWorkbook.addWorksheet('sheet1', {
        pageSetup:{paperSize: 9, orientation:'landscape'}
    });

    catalogWorksheet.columns = [
        { header: 'Description', key: 'description', width: 32 },
        { header: 'DescriptionUa', key: 'descriptionUa', width: 32 },
        { header: 'G31', key: 'g31', width: 50},
        { header: 'Item', key: 'item', width: 10},
        { header: 'OumH', key: 'oumH', width: 10},
        { header: 'OumT', key: 'oumT', width: 10},
        { header: 'OumU', key: 'oumU', width: 10},
        { header: 'Uktz', key: 'uktz', width: 10}
    ];

    absenItems.forEach(x => {
        const rowValues = [];
        rowValues[4] = x;
        catalogWorksheet.addRow(rowValues);
    });

    await catalogWorkbook.xlsx.writeFile(tempLocalCatalogFile);

    await bucket.upload(tempLocalCatalogFile, {destination: catalogFilePath, metadata: metadata});

    fs.unlinkSync(tempLocalCatalogFile);

    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const catalogFile = bucket.file(catalogFilePath);
    const signedUrl = await catalogFile.getSignedUrl(config);


    return {
        total: grandTotal,
        netto: weightTotal,
        missedPositions: absenItems.length,
        url: signedUrl
    };

});

exports.addProducts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    const filePath = `/InBox/${data}`;
    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    await mkdirp(tempLocalDir);
    const file = bucket.file(filePath);

    await file.download({destination: tempLocalFile});

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(tempLocalFile);
    const promises = [];
    let counter = 0;

    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, number) => {
            if(number > 1) {
                const item = row.values[4];
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

    fs.unlinkSync(tempLocalFile);

    return {inserted: counter}

});

