import {CloudantV1} from "@ibm-cloud/cloudant";

import {buildMissingDocument, ContentStoreApi, StoredDocument} from "./content-store.api";
import {cloudantDocAsObject} from "../../backends";

const databases = {};

const documentDatabase: string = 'databases';

export class ContentStoreCloudant implements ContentStoreApi {
    constructor(private readonly client: CloudantV1) {}

    async getDatabase(db: string): Promise<string> {
        if (databases[db]) {
            return db;
        }

        return this.client
            .putDatabase({db})
            .then(() => {
                // TODO create design document

                databases[db] = true;
                return db;
            })
            .catch(err => {
                if (err.code === 412) {
                    databases[db] = true;
                    return db;
                }

                console.error('Error creating database: ', {err});

                throw err;
            })
    }

    async getDocument(docId: string): Promise<StoredDocument> {
        const db: string = await this.getDatabase(documentDatabase)

        return this.client
            .getDocument({
                db,
                docId,
            })
            .then(cloudantDocAsObject)
            .catch(() => buildMissingDocument(docId))
    }

    async storeDocument(document: StoredDocument): Promise<{ status: string }> {
        const db: string = await this.getDatabase(documentDatabase)

        return this.client
            .postDocument({
                db,
                document,
            })
            .then(result => ({status: 'success'}))
    }

}
