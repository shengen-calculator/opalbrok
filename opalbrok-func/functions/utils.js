const mkdirp = require('mkdirp-promise');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const excel = require('exceljs');
const configuration = require('./settings');

const getBucket = () => admin.storage().bucket(configuration.bucketId);

const readXls = async (filePath) => {
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    await mkdirp(tempLocalDir);
    const file = getBucket().file(filePath);

    await file.download({destination: tempLocalFile});

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(tempLocalFile);
    fs.unlinkSync(tempLocalFile);
    return workbook;
};

module.exports.ReadXls = readXls;
module.exports.GetBucket = getBucket;