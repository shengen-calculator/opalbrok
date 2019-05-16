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
                const weight = row.values[9];
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
                        country,
                        weight
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
                Country: inv.country,
                Netto: inv.weight,
                G31: row.g31
            });
        }
    });

    fs.unlinkSync(tempLocalFile);

    resultItems.sort((a, b) =>
        (a.Uktz > b.Uktz) ? 1 : (a.Uktz === b.Uktz) ?
            ((a.Country > b.Country) ? 1 : (a.Country === b.Country ?
                ((a.DescriptionUa.localeCompare(b.DescriptionUa) > 0) ? 1 : (a.DescriptionUa.localeCompare(b.DescriptionUa) === 0 ?
                    (a.Item > b.Item ? 1 : -1) : -1)) : -1)): -1);

    // generate results

    const resultEFileName = "result_E.xlsx";
    const resultMdFileName = "result_Md.xlsx";

    const resultEFilePath = `/OutBox/${resultEFileName}`;
    const resultMdFilePath = `/OutBox/${resultMdFileName}`;

    const tempLocalResultEFile = path.join(os.tmpdir(), resultEFileName);
    const tempLocalResultMdFile = path.join(os.tmpdir(), resultMdFileName);

    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const metadataE = {
        contentType: contentType,
        contentDisposition: `filename="${resultEFileName}"`
    };
    const metadataMd = {
        contentType: contentType,
        contentDisposition: `filename="${resultMdFileName}"`
    };

    const reusltEWorkbook = new excel.Workbook();
    const reusltMdWorkbook = new excel.Workbook();


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


    const resultMdWorksheet =  reusltMdWorkbook.addWorksheet('MD', {
        pageSetup:{paperSize: 8, orientation:'landscape'}
    });

    resultMdWorksheet.columns = [
        { header: 'UKTZ', key: 'uktz', width: 16 },
        { header: 'G31', key: 'g31', width: 52},
        { header: 'Страна', key: 'country', width: 10},
        { header: 'Места', key: 'colli', width: 6},
        { header: 'Кол', key: 'quantity', width: 14},
        { header: 'Бвес', key: 'b', width: 14},
        { header: 'Нвес', key: 'n', width: 14},
        { header: 'Стоимость', key: 'price', width: 14}
    ];



    let t = 0;
    let p = 0;
    let totalQuntity = 0;
    let totalNetto = 0;
    let totalPrice = 0;
    let maxWeight = 0;
    let maxWeightRowIndex = 0;
    let rowMdIndex = 1;
    let grandTotalBrutto = 0;
    let grandTotalColli = 0;
    let oldRow = {
        Uktz:'',
        Country:''
    };

    resultItems.forEach(x => {

        if(oldRow.Uktz === x.Uktz) {
            if(oldRow.Country === x.Country) {
                p++;
                totalQuntity += x.Quantity;
                totalNetto += x.Netto;
                totalPrice += x.TotalPrice;
            } else {
                t++;
                p = 1;

                const rowMdValues = [];
                rowMdValues[1] = oldRow.Uktz;
                rowMdValues[2] = oldRow.G31;
                rowMdValues[3] = oldRow.Country;
                rowMdValues[4] = Math.round(data.colli * totalNetto / data.netto);
                rowMdValues[5] = totalQuntity;
                rowMdValues[6] = Math.round(((data.brutto - data.netto) * totalNetto / data.netto + totalNetto)*1000)/1000;
                rowMdValues[7] = totalNetto;
                rowMdValues[8] = totalPrice;

                resultMdWorksheet.addRow(rowMdValues);
                rowMdIndex++;

                grandTotalBrutto += rowMdValues[6];
                grandTotalColli += rowMdValues[4];

                if(maxWeight < rowMdValues[6]) {
                    maxWeightRowIndex = rowMdIndex;
                    maxWeight = rowMdValues[6];
                }


                totalQuntity = x.Quantity;
                totalNetto = x.Netto;
                totalPrice = x.TotalPrice;

            }

        } else {
            t++;
            p = 1;
            if(oldRow.Uktz) {
                const rowMdValues = [];
                rowMdValues[1] = oldRow.Uktz;
                rowMdValues[2] = oldRow.G31;
                rowMdValues[3] = oldRow.Country;
                rowMdValues[4] = Math.round(data.colli * totalNetto / data.netto);
                rowMdValues[5] = totalQuntity;
                rowMdValues[6] = Math.round(((data.brutto - data.netto) * totalNetto / data.netto + totalNetto)*1000)/1000;
                rowMdValues[7] = totalNetto;
                rowMdValues[8] = totalPrice;

                resultMdWorksheet.addRow(rowMdValues);
                rowMdIndex++;

                grandTotalBrutto += rowMdValues[6];
                grandTotalColli += rowMdValues[4];

                if(maxWeight < rowMdValues[6]) {
                    maxWeightRowIndex = rowMdIndex;
                    maxWeight = rowMdValues[6];
                }

            } else {
                totalQuntity += x.Quantity;
                totalNetto += x.Netto;
                totalPrice += x.TotalPrice;
            }

            totalQuntity = x.Quantity;
            totalNetto = x.Netto;
            totalPrice = x.TotalPrice;
        }

        const rowEValues = [];
        rowEValues[1] = t;
        rowEValues[2] = p;
        rowEValues[3] = x.DescriptionUa;
        rowEValues[4] = x.Item;
        rowEValues[5] = x.Price;
        rowEValues[6] = x.TotalPrice;

        rowEValues[9] = x.Quantity;
        rowEValues[10] = x.OumT;
        rowEValues[11] = 'нема даних';
        rowEValues[12] = 'нема даних';
        rowEValues[13] = x.Country;
        resultEWorksheet.addRow(rowEValues);


        oldRow = x;

    });

    // last grouped row

    const rowMdValues = [];
    rowMdValues[1] = oldRow.Uktz;
    rowMdValues[2] = oldRow.G31;
    rowMdValues[3] = oldRow.Country;
    rowMdValues[4] = Math.round(data.colli * totalNetto / data.netto);
    rowMdValues[5] = totalQuntity;
    rowMdValues[6] = Math.round(((data.brutto - data.netto) * totalNetto / data.netto + totalNetto)*1000)/1000;
    rowMdValues[7] = totalNetto;
    rowMdValues[8] = totalPrice;

    resultMdWorksheet.addRow(rowMdValues);
    rowMdIndex++;

    grandTotalBrutto += rowMdValues[6];
    grandTotalColli += rowMdValues[4];

    if(maxWeight < rowMdValues[6]) {
        maxWeightRowIndex = rowMdIndex;
        maxWeight = rowMdValues[6];
    }

    // end last grouped row

    // correction
    resultMdWorksheet.getCell(maxWeightRowIndex, 6).value += data.brutto - grandTotalBrutto;
    resultMdWorksheet.getCell(maxWeightRowIndex, 4).value += data.colli - grandTotalColli;
    // end correction

    await reusltEWorkbook.xlsx.writeFile(tempLocalResultEFile);
    await reusltMdWorkbook.xlsx.writeFile(tempLocalResultMdFile);

    await bucket.upload(tempLocalResultEFile, {destination: resultEFilePath, metadata: metadataE});
    await bucket.upload(tempLocalResultMdFile, {destination: resultMdFilePath, metadata: metadataMd});

    fs.unlinkSync(tempLocalResultEFile);
    fs.unlinkSync(tempLocalResultMdFile);

    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const reusltEFile = bucket.file(resultEFilePath);
    const reusltMdFile = bucket.file(resultMdFilePath);

    const resultEUrl = await reusltEFile.getSignedUrl(config);
    const resultMdUrl = await reusltMdFile.getSignedUrl(config);


    return {
        urlOne: resultEUrl,
        urlTwo: resultMdUrl
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

