import {CallbackManagerForRetrieverRun} from "langchain/callbacks";
import {Document} from 'langchain/document';
import {BaseRetriever, BaseRetrieverInput} from "langchain/schema/retriever";

import {DiscoveryStore, QueryDocumentOptions} from "../../stores";

export interface DiscoveryRetrieverInput extends BaseRetrieverInput {
    discoveryStore: DiscoveryStore;
    options?: QueryDocumentOptions;
}

export class DiscoveryRetriever extends BaseRetriever {

    discoveryStore: DiscoveryStore;
    options?: QueryDocumentOptions;

    constructor(fields: DiscoveryRetrieverInput) {
        super(fields);

        this.discoveryStore = fields.discoveryStore;
        this.options = fields.options;
    }

    get lc_namespace(): string[] {
        return ['langchain', 'retrievers', 'discovery-retriever']
    }

    async _getRelevantDocuments(
        query: string,
        runManager?: CallbackManagerForRetrieverRun
    ): Promise<Document[]> {
        return this.discoveryStore.query(query, this.options)
    }

}