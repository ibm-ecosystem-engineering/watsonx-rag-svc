import {buildMissingDocument, ContentStoreApi, StoredDocument} from "./content-store.api";

export class ContentStoreMemory implements ContentStoreApi {
    async getDocument(id: string): Promise<StoredDocument> {
        return buildMissingDocument(id);
    }

    async storeDocument(doc: StoredDocument): Promise<{ status: string }> {
        return {status: 'success'};
    }

}
