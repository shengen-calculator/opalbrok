'use strict';
const functions = require('firebase-functions');
const mkdirp = require('mkdirp-promise');
const admin = require('firebase-admin');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const excel = require('exceljs');
// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 1024;
const THUMB_MAX_WIDTH = 1024;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

admin.initializeApp();

exports.generateResultsTest = functions.https.onRequest(async (req, res) => {
//exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
    // File and directory paths.
    const filePath = req.query.text;
    const contentType = 'image/jpeg';//object.contentType; // This is the image MIME type
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
    const outThumbFilePath = `/OutBox/${THUMB_PREFIX}${fileName}`;
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

// Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        return console.log('This is not an image.');
    }

// Exit if the image is already a thumbnail.
    if (fileName.startsWith(THUMB_PREFIX)) {
        return console.log('Already a Thumbnail.');
    }

// Cloud Storage files.
    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    const file = bucket.file(filePath);
    const thumbFile = bucket.file(outThumbFilePath);
    const metadata = {
        contentType: contentType,
        // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
        // 'Cache-Control': 'public,max-age=3600',
    };

// Create the temp directory where the storage file will be downloaded.
    await mkdirp(tempLocalDir);
// Download file from bucket.
    await file.download({destination: tempLocalFile});
    console.log('The file has been downloaded to', tempLocalFile);
// Generate a thumbnail using ImageMagick.
    await spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], {capture: ['stdout', 'stderr']});
    console.log('Thumbnail created at', tempLocalThumbFile);
// Uploading the Thumbnail.
    await bucket.upload(tempLocalThumbFile, {destination: outThumbFilePath, metadata: metadata});
    console.log('Thumbnail uploaded to Storage at', thumbFilePath);
// Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);
// Get the Signed URLs for the thumbnail and original image.
    const config = {
        action: 'read',
        expires: '03-01-2500',
    };

    const results = await Promise.all([
        thumbFile.getSignedUrl(config),
        file.getSignedUrl(config),
    ]);
    console.log('Got Signed URLs.');
    const thumbResult = results[0];
    const originalResult = results[1];
    const thumbFileUrl = thumbResult[0];
    const fileUrl = originalResult[0];

    return res.send(`${fileUrl},${thumbFileUrl}`);
    // Add the URLs to the Database
    //await admin.database().ref('images').push({path: fileUrl, thumbnail: thumbFileUrl});
    //return console.log('Thumbnail URLs saved to database.');
});

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

    const catalogFileName = "catalog.xlsx";
    const catalogFilePath = `/OutBox/${catalogFileName}`;
    const tempLocalCatalogFile = path.join(os.tmpdir(), catalogFileName);
    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const metadata = {
        contentType: contentType,
        contentDisposition: `filename="${catalogFileName}"`
    };

    const workbook = new excel.Workbook();
    // create new sheet with pageSetup settings for A4 - landscape
    const worksheet =  workbook.addWorksheet('sheet1', {
        pageSetup:{paperSize: 9, orientation:'landscape'}
    });
    worksheet.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 32 },
        { header: 'D.O.B.', key: 'dob', width: 10, outlineLevel: 1 }
    ];

    // Add a couple of Rows by key-value, after the last current row, using the column keys
    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});
    worksheet.addRow({id: 2, name: 'Doe John', dob: new Date(1965,1,7)});

    const rowValues = [];
    rowValues[1] = 4;
    rowValues[2] = 'Kyle';
    rowValues[3] = new Date();
    worksheet.addRow(rowValues);

    await workbook.xlsx.writeFile(tempLocalCatalogFile);

    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    await bucket.upload(tempLocalCatalogFile, {destination: catalogFilePath, metadata: metadata});

    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalCatalogFile);
    // Get the Signed URLs
    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const catalogFile = bucket.file(catalogFilePath);
    const signedUrl = await catalogFile.getSignedUrl(config);


    return {
        total: 245.18,
        netto: 390,
        missedPositions: 2,
        url: `${signedUrl[0]}`
    };
});

exports.addProducts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }
    return {inserted: 20};
});

exports.importCatalog = functions.https.onRequest(async (req, res) => {
    const filePath = '/InBox/catalog.xlsx';
    const bucket = admin.storage().bucket('broker-d9a50.appspot.com');
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);

    await mkdirp(tempLocalDir);
// Download file from bucket.

    const file = bucket.file(filePath);

    await file.download({destination: tempLocalFile});

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(tempLocalFile);

    const promises = [];

    workbook.eachSheet((worksheet, sheetId) => {
        worksheet.eachRow((row, number) => {
            const item = row.values[1];
            const description = row.values[2];
            const descriptionUa = row.values[3];
            const oumU = row.values[4];
            const oumH = row.values[5];
            const oumT = row.values[6];
            const uktz = row.values[7];
            const g31 = row.values[8];
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
        });

    });
    await Promise.all(promises);

    fs.unlinkSync(tempLocalFile);

    res.status(200).send({status: 'Ok'});

});
