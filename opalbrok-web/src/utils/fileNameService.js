export function getPath(fileName, email) {
    return `/InBox/${getName(fileName, email)}`;
}

export function getName(fileName, email) {
    const position = email.indexOf('@');
    const ext = fileName.split('.').pop();
    if(isCatalog(fileName)) {
        return `${email.substr(0, position)}_catalog.${ext}`;
    } else {
        return `${email.substr(0, position)}_invoice.${ext}`;
    }
}

export function isCatalog(fileName) {
    return fileName.toLowerCase().indexOf('cat') > -1;
}