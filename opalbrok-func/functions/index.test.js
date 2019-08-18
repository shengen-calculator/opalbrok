const addProducts = require('./addProducts');
const generateResults = require('./generateResults');
const calculateInvoice = require('./addProducts');


test('add Products', () => {
    // noinspection JSIgnoredPromiseFromCall
    expect(
        addProducts('abc.xlsx', {auth: 'peter'})
    ).rejects.toThrow();
});

test('generate Results', () => {
    // noinspection JSIgnoredPromiseFromCall
    expect(
        generateResults('abc.xlsx', {auth: 'peter'})
    ).rejects.toThrow();

});

test('calculate Invoice', () => {
    // noinspection JSIgnoredPromiseFromCall
    expect(
        calculateInvoice('abc.xlsx', {auth: 'peter'})
    ).rejects.toThrow();

});