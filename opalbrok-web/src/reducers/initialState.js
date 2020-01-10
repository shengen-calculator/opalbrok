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
        isNettoVerified: false,
        total: 0,
        isTotalVerified: false,
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
