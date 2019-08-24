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

const isDataRow = (row) => {
    if (isNaN(row.values[6]) || isNaN(row.values[7]) || isNaN(row.values[8])) {
        return false;
    }
    return row.values[8] === Math.round(row.values[6] * row.values[7] * 100) / 100;
};

const paintHeader = (worksheet, columnsNumber) => {
    const cells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1', 'N1', 'O1', 'P1'];

    cells.slice(0, columnsNumber).forEach(key => {
        worksheet.getCell(key).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'E6E6FA'
            }
        };
    });
};

module.exports.PaintHeader = paintHeader;
module.exports.ReadXls = readXls;
module.exports.GetBucket = getBucket;
module.exports.isDataRow = isDataRow;