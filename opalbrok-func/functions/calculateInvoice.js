const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const excel = require('exceljs');
const utils = require('./utils');

const calculateInvoice = async (data, context) => {

    if (!process.env.FUNCTIONS_EMULATOR) {
        if (!context.auth) {
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
        }
    }

    if (!data) {
        throw new functions.https.HttpsError('invalid-argument',
            'The function must be called with one argument "file Name"');
    }

    const workbook = await utils.ReadXls(`/InBox/${data}`);
    let grandTotal = 0;
    let weightTotal = 0;
    let verified = {
        isNettoVerified: false,
        isTotalVerified: false
    };
    let notFound = 0;


    const promises = [];
    const catalogItems = [];
    const invoiceItems = [];
    let isCalculateStarted = false;
    let isCalculateEnded = false;

    //check if the all positions are presents in catalog

    let worksheet = workbook.getWorksheet('Invoice');
    worksheet.eachRow((row) => {
        if (isCalculateEnded !== true) {
            if (utils.isDataRow(row)) {
                isCalculateStarted = true;
                const item = {
                    id: row.values[2].toString(),
                    description: row.values[3].toString(),
                    descriptionUa: row.values[4].toString(),
                    uom: row.values[5].toString()
                };

                const totalPrice = row.values[8];
                const weight = row.values[9];

                if (item.id) {
                    promises.push(
                        admin.firestore().collection('products').doc(item.id.replace('/', '#')).get()
                    );

                    grandTotal += totalPrice;
                    weightTotal += weight;
                    invoiceItems.push(item);

                }
            } else {
                if (isCalculateStarted === true) {
                    isCalculateEnded = true;
                    utils.dataVerify(row, verified, grandTotal, weightTotal);
                }
            }
        } else {
            utils.dataVerify(row, verified, grandTotal, weightTotal);
        }
    });


    const snapshots = await Promise.all(promises);

    snapshots.forEach(querySnapshot => {

        const row = querySnapshot.data();
        if (!row)
            notFound++;
        else {
            catalogItems.push(row);
        }
    });

    if (notFound === 0) {
        return {
            total: Math.round(grandTotal * 100) / 100,
            isTotalVerified: verified.isTotalVerified,
            netto: Math.round(weightTotal * 100) / 100,
            isNettoVerified: verified.isNettoVerified,
            missedPositions: 0,
            url: ''
        };
    }

    const absenItems = invoiceItems.filter(i => !catalogItems.find(a => i.id === a.item));

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
    const catalogWorksheet = catalogWorkbook.addWorksheet('sheet1', {
        pageSetup: {paperSize: 9, orientation: 'landscape'}
    });

    catalogWorksheet.columns = [
        {header: 'Item', key: 'item', width: 20},
        {header: 'Description', key: 'description', width: 32},
        {header: 'DescriptionUa', key: 'descriptionUa', width: 32},
        {header: 'OumH', key: 'oumH', width: 7},
        {header: 'OumT', key: 'oumT', width: 7},
        {header: 'OumU', key: 'oumU', width: 7},
        {header: 'Uktz', key: 'uktz', width: 12}
    ];


    utils.PaintHeader(catalogWorksheet, 7);

    absenItems.forEach(x => {
        const rowValues = [];
        rowValues[1] = x.id;
        rowValues[2] = x.description;
        rowValues[3] = x.descriptionUa;
        rowValues[4] = x.uom;
        rowValues[5] = x.uom === 'P' ? 796 : 6;
        rowValues[6] = x.uom === 'P' ? 'шт' : 'м';
        catalogWorksheet.addRow(rowValues);
    });

    await catalogWorkbook.xlsx.writeFile(tempLocalCatalogFile);

    await utils.GetBucket().upload(tempLocalCatalogFile, {destination: catalogFilePath, metadata: metadata});

    fs.unlinkSync(tempLocalCatalogFile);

    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const catalogFile = utils.GetBucket().file(catalogFilePath);
    const signedUrl = await catalogFile.getSignedUrl(config);


    return {
        total: Math.round(grandTotal * 100) / 100,
        netto: Math.round(weightTotal * 100) / 100,
        isTotalVerified: false,
        isNettoVerified: false,
        missedPositions: absenItems.length,
        url: signedUrl
    };
};

module.exports = calculateInvoice;
