import {buildMissingDocument, ContentStoreApi, StoredDocument} from "./content-store.api";

const docs: {[id: string]: {id: string, name: string, content: Buffer}} = {}

export class ContentStoreMemory implements ContentStoreApi {
    async getDocument(id: string): Promise<StoredDocument> {
        return docs[id] || buildMissingDocument(id);
    }

    async storeDocument(doc: StoredDocument): Promise<{ status: string }> {
        docs[doc.id] = doc

        return {status: 'success'};
    }

}
