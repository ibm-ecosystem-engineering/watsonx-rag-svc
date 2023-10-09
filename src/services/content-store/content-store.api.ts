
export interface StoredDocument {
    id: string;
    name: string;
    content: Buffer;
}

export const buildMissingDocument = (id: string): StoredDocument => ({
    id,
    name: 'unknown',
    content: Buffer.from('not found')
})

export abstract class ContentStoreApi {
    abstract storeDocument(doc: StoredDocument): Promise<{status: string}>;
    abstract getDocument(id: string): Promise<StoredDocument>;
}
