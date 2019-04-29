export function getPath(fileName, email) {
    const position = email.indexOf('@');
    const ext = fileName.split('.').pop();
    if(isCatalog(fileName)) {
        return `/InBox/${email.substr(0, position)}_catalog.${ext}`;
    } else {
        return `/InBox/${email.substr(0, position)}_invoice.${ext}`;
    }

}

export function isCatalog(fileName) {
    return fileName.indexOf('cat') > -1;
}