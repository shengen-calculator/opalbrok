import {storage} from './database';

class StorageApi {
    static upload(params) {
        const ref = storage.ref(params.filePath);
        return ref.put(params.file);
    }
}

export default StorageApi;