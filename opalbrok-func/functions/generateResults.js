const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const excel = require('exceljs');
const utils = require('./utils');

const generateResults = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition',
            'The function must be called while authenticated.');
    }

    if (!data.fileName) {
        throw new functions.https.HttpsError('invalid-argument',
            'The function must be called with one argument "file Name"');
    }
    const workbook = await utils.ReadXls(`/InBox/${data.fileName}`);

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
                OumU: row.oumU,
                Country: inv.country,
                Netto: inv.weight,
                G31: row.g31
            });
        }
    });

    resultItems.sort((a, b) =>
        (a.Uktz > b.Uktz) ? 1 : (a.Uktz === b.Uktz) ?
            ((a.Country > b.Country) ? 1 : (a.Country === b.Country ?
                ((a.DescriptionUa.localeCompare(b.DescriptionUa) > 0) ? 1 :
                    (a.DescriptionUa.localeCompare(b.DescriptionUa) === 0 ?
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


    resultEWorksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: 'E6E6FA'
        }
    };


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


    resultMdWorksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: 'E6E6FA'
        }
    };

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
    let sectionTwo = [];
    let oldRow = {
        Uktz:'',
        Country:'',
        DescriptionUa:''
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
                rowMdValues[6] = Math.round(((data.brutto - data.netto) *
                    totalNetto / data.netto + totalNetto)*1000)/1000;
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

            if(oldRow.DescriptionUa === x.DescriptionUa) {
                if(oldRow.Country !== x.Country) {
                    sectionTwo.push({
                        Uktz: x.Uktz,
                        G31: x.DescriptionUa,
                        Country: x.Country,
                        DescriptionUa: x.DescriptionUa,
                        Item: ''
                    });
                }
            } else {

                sectionTwo.push({
                    Uktz: x.Uktz,
                    G31: x.DescriptionUa,
                    Country: x.Country,
                    DescriptionUa: x.DescriptionUa,
                    Item: ''
                });
            }

        } else {
            sectionTwo.push({
                Uktz: x.Uktz,
                G31: x.DescriptionUa,
                Country: x.Country,
                DescriptionUa: x.DescriptionUa,
                Item: ''
            });

            t++;
            p = 1;
            if(oldRow.Uktz) {
                const rowMdValues = [];
                rowMdValues[1] = oldRow.Uktz;
                rowMdValues[2] = oldRow.G31;
                rowMdValues[3] = oldRow.Country;
                rowMdValues[4] = Math.round(data.colli * totalNetto / data.netto);
                rowMdValues[5] = totalQuntity;
                rowMdValues[6] = Math.round(((data.brutto - data.netto) *
                    totalNetto / data.netto + totalNetto)*1000)/1000;
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

        sectionTwo.push({
            Uktz: x.Uktz,
            G31: `арт.${x.Item} -${x.Quantity}${x.OumU};`,
            Country: x.Country,
            DescriptionUa: x.DescriptionUa,
            Item: x.Item
        });

        oldRow = x;

    });

    // last grouped row

    const rowMdValues = [];
    rowMdValues[1] = oldRow.Uktz;
    rowMdValues[2] = oldRow.G31;
    rowMdValues[3] = oldRow.Country;
    rowMdValues[4] = Math.round(data.colli * totalNetto / data.netto);
    rowMdValues[5] = totalQuntity;
    rowMdValues[6] = Math.round(((data.brutto - data.netto) *
        totalNetto / data.netto + totalNetto)*1000)/1000;
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


    //add section two
    sectionTwo.sort((a, b) =>
        (a.Uktz > b.Uktz) ? 1 : (a.Uktz === b.Uktz) ?
            ((a.DescriptionUa.localeCompare(b.DescriptionUa) > 0) ? 1 :
                (a.DescriptionUa.localeCompare(b.DescriptionUa) === 0 ?
                ((a.Item > b.Item) ? 1 : (a.Item === b.Item ?
                    (a.G31 > b.G31 ? 1 : -1) : -1)) : -1)): -1);

    sectionTwo.forEach(x => {
        const rowMdValues = [];
        rowMdValues[1] = x.Uktz;
        rowMdValues[2] = x.G31;
        rowMdValues[3] = x.Country;
        rowMdValues[8] = 0;

        resultMdWorksheet.addRow(rowMdValues);
    });


    //end of add section two

    await reusltEWorkbook.xlsx.writeFile(tempLocalResultEFile);
    await reusltMdWorkbook.xlsx.writeFile(tempLocalResultMdFile);

    await utils.GetBucket().upload(tempLocalResultEFile, {destination: resultEFilePath, metadata: metadataE});
    await utils.GetBucket().upload(tempLocalResultMdFile, {destination: resultMdFilePath, metadata: metadataMd});

    fs.unlinkSync(tempLocalResultEFile);
    fs.unlinkSync(tempLocalResultMdFile);

    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const reusltEFile = utils.GetBucket().file(resultEFilePath);
    const reusltMdFile = utils.GetBucket().file(resultMdFilePath);

    const resultEUrl = await reusltEFile.getSignedUrl(config);
    const resultMdUrl = await reusltMdFile.getSignedUrl(config);


    return {
        urlOne: resultEUrl,
        urlTwo: resultMdUrl
    };
};
module.exports = generateResults;