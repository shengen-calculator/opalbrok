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

    if (!data.fileName) {
        throw new functions.https.HttpsError('invalid-argument',
            'The function must be called with one argument "file Name"');
    }
    const filePath = `/InBox/${data.fileName}`;
    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    await mkdirp(tempLocalDir);
    const file = bucket.file(filePath);

    await file.download({destination: tempLocalFile});

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(tempLocalFile);


    const promises = [];
    const resultItems =[];
    const invoiceItems = [];

    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, number) => {
            if(number > 1) {
                const item = row.values[2].toString();
                const quantity = row.values[6];
                const price = row.values[7];
                const totalPrice = row.values[8];
                const country = row.values[11];

                if(item) {
                    promises.push(
                        admin.firestore().collection('products').doc(item.replace('/','#')).get()
                    );

                    invoiceItems.push({
                        item,
                        quantity,
                        price,
                        totalPrice,
                        country
                    });

                }
            }

        });
    });

    const snapshots = await Promise.all(promises);

    snapshots.forEach(querySnapshot => {

        const row = querySnapshot.data();
        const inv = invoiceItems.find(x => x.item === row.item);
        if(row){
            resultItems.push({
                Uktz: row.uktz,
                DescriptionUa: row.descriptionUa.trimRight(),
                Item: row.item,
                Price: inv.price,
                TotalPrice: inv.totalPrice,
                Quantity: inv.quantity,
                OumT: row.oumT,
                Country: inv.country
            });
        }
    });

    fs.unlinkSync(tempLocalFile);

    resultItems.sort((a, b) =>
        (a.Uktz > b.Uktz) ? 1 : (a.Uktz === b.Uktz) ?
            ((a.Country > b.Country) ? 1 : (a.Country === b.Country ?
                ((a.DescriptionUa.localeCompare(b.DescriptionUa) > 0) ? 1 : (a.DescriptionUa.localeCompare(b.DescriptionUa) === 0 ?
                    (a.Item > b.Item ? 1 : -1) : -1)) : -1)): -1);

    // generate result E

    const resultEFileName = "result_E.xlsx";
    const resultEFilePath = `/OutBox/${resultEFileName}`;
    const tempLocalResultEFile = path.join(os.tmpdir(), resultEFileName);
    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const metadata = {
        contentType: contentType,
        contentDisposition: `filename="${resultEFileName}"`
    };

    const reusltEWorkbook = new excel.Workbook();


    // create new sheet with pageSetup settings for A4 - landscape
    const resultEWorksheet =  reusltEWorkbook.addWorksheet('sheet1', {
        pageSetup:{paperSize: 15, orientation:'landscape'}
    });

    resultEWorksheet.columns = [
        { header: 'Товар', key: 'tovar', width: 5 },
        { header: 'Поз', key: 'poz', width: 5},
        { header: 'Description_UA', key: 'description', width: 52},
        { header: 'Item', key: 'item', width: 18},
        { header: 'Price', key: 'price', width: 10},
        { header: 'Total_Price', key: 'tot_price', width: 10},
        { header: 'Б', key: 'b', width: 2},
        { header: 'Н', key: 'n', width: 2},
        { header: 'Quantity', key: 'quantity', width: 10},
        { header: 'OUM_T', key: 'oum', width: 10},
        { header: 'TM', key: 'tm', width: 15},
        { header: 'Выр', key: 'vir', width: 15},
        { header: 'Country', key: 'country', width: 10}
    ];

    let t = 0;
    let p = 0;
    let country = '';
    let uktz = '';

    resultItems.forEach(x => {

        if(uktz === x.Uktz) {
            if(country === x.Country) {
                p++;
            } else {
                t++;
                p = 1;
            }

        } else {
            t++;
            p = 1;
        }

        uktz = x.Uktz;
        country = x.Country;

        const rowValues = [];
        rowValues[1] = t;
        rowValues[2] = p;
        rowValues[3] = x.DescriptionUa;
        rowValues[4] = x.Item;
        rowValues[5] = x.Price;
        rowValues[6] = x.TotalPrice;

        rowValues[9] = x.Quantity;
        rowValues[10] = x.OumT;
        rowValues[11] = 'нема даних';
        rowValues[12] = 'нема даних';
        rowValues[13] = x.Country;
        resultEWorksheet.addRow(rowValues);


    });

    await reusltEWorkbook.xlsx.writeFile(tempLocalResultEFile);

    await bucket.upload(tempLocalResultEFile, {destination: resultEFilePath, metadata: metadata});

    fs.unlinkSync(tempLocalResultEFile);

    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const reusltEFile = bucket.file(resultEFilePath);
    const resultEUrl = await reusltEFile.getSignedUrl(config);




    return {
        urlOne: resultEUrl,
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
                const item = row.values[2].toString();
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

    fs.unlinkSync(tempLocalFile);

    return {inserted: counter}

});

