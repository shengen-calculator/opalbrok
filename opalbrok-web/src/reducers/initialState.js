export default {
    authentication: {
        loggedIn: false,
        email: '',
        errors: '',
        logging: false,
        outing: false
    },
    fileUpload: {
        fileName: '',
        isLoading: false
    },
    invoice: {
        isCalculating: false,
        missedPositions:0,
        missedPositionsUrl: '',
        netto: 0,
        total: 0,
        colli: '',
        brutto: '',
        isGenereting: false,
        urlOne:'',
        urlTwo: '',
        fileName: ''
    },
    catalog: {
        isInserting: false,
        fileName: ''
    }
};