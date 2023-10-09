import {Document} from "langchain/document";
import DiscoveryV2, {QueryLargePassages, QueryParams, ResultPassageAnswer} from "ibm-watson/discovery/v2";

import {
    AddDocumentOptions,
    CollectionResult,
    CreateCollectionOptions,
    CreateCollectionResult,
    DiscoveryConfig,
    DiscoveryStore,
    DiscoveryStoreParams,
    DocumentProcessor, FindDocumentOptions,
    ListCollectionsOptions,
    ListCollectionsResult,
    ListDocumentsOptions,
    ListDocumentsResult,
    QueryDocumentOptions
} from "./discovery-store";
import {DiscoveryRetriever} from "../../retrievers";
import {createDiscoveryV2} from "../../../watsonx";
import {createHash} from "node:crypto";
import {first} from "../../../util";
import {response} from "express";

export class DiscoveryStoreImpl implements DiscoveryStore {
    readonly discovery: DiscoveryV2;
    readonly config: DiscoveryConfig;

    constructor(options: DiscoveryStoreParams) {
        this.discovery = createDiscoveryV2(options);

        this.config = {
            projectId: options.projectId,
            collectionId: options.collectionId
        }
    }

    async addDocuments(documents: Document[], options?: AddDocumentOptions): Promise<string[] | void> {
        return Promise.all(
            documents.map(doc => this.addDocument(doc, options))
        );
    }

    async addDocument(document: Document, options?: AddDocumentOptions): Promise<string> {
        const discoveryConfig: DiscoveryConfig = this.getConfig(options)

        if (options.preventDuplicates) {
            const documentId: string | undefined = await this.findDocumentByContents(document, options);

            if (documentId) {
                return documentId;
            }
        }

        const filename = document.metadata.filename
        const fileContentType = document.metadata.fileContentType

        const params = Object.assign(
            discoveryConfig,
            {
                file: Buffer.from(document.pageContent),
                filename,
                fileContentType,
                metadata: JSON.stringify(document.metadata)
            }
        )

        return this.discovery
            .addDocument(params)
            .then(result => result.result.document_id)
    }

    getConfig(options: AddDocumentOptions = {}): DiscoveryConfig {
        const config = {
                projectId: options.projectId || this.config.projectId,
                collectionId: options.collectionId || this.config.collectionId,
        }

        if (!config.projectId || !config.collectionId) {
            throw new Error('ProjectId and CollectionId are required')
        }

        return config;
    }

    async findDocumentByContents(document: Document, options?: FindDocumentOptions): Promise<string> {
        const {projectId, collectionId} = this.getConfig(options)

        const sha256 = createHash('sha256').update(document.pageContent).digest('hex')

        return this.discovery
            .listDocuments({
                projectId,
                collectionId,
                sha256
            })
            .then(response => response.result.documents)
            .then(documents => first(documents.map(doc => doc.document_id)))
    }

    async query(naturalLanguageQuery: string, options: QueryDocumentOptions = {}): Promise<Document[]> {
        const discoveryConfig = this.getQueryConfig(options)

        const passages: DiscoveryV2.QueryLargePassages = options.passages || {
            enabled: true,
            per_document: true,
            max_per_document: 5,
        }

        const processor: DocumentProcessor = options.processor || ((documents) => documents)

        const params: QueryParams = Object.assign(
            {},
            options,
            discoveryConfig,
            {
                naturalLanguageQuery,
                passages,
            }
        )

        return this.discovery
            .query(params)
            .then(response => response.result)
            .then(result => queryResponseToDocument(result, passages))
            .then(documents => processor(documents))
    }

    getQueryConfig(options: QueryDocumentOptions = {}): {projectId: string, collectionIds?: string[]} {
        const projectId: string = options.projectId || this.config.projectId;

        if (!projectId) {
            throw new Error('ProjectId is required')
        }

        return {
            projectId,
            collectionIds: options.collectionIds,
        };
    }

    asRetriever(options?: QueryDocumentOptions): DiscoveryRetriever {
        return new DiscoveryRetriever({discoveryStore: this, options})
    }

    createCollection(options: CreateCollectionOptions): Promise<CreateCollectionResult> {
        const projectId: string = options.projectId || this.config.projectId;

        return this.discovery
            .createCollection({
                projectId,
                name: options.name,
                description: options.description,
            })
            .then(response => response.result)
            .then(toCollectionResult)
    }

    async listCollections(options: ListCollectionsOptions): Promise<ListCollectionsResult> {
        const projectId: string = options.projectId || this.config.projectId;

        const filterCollections = options.filter || (() => true)

        const collections = await this.discovery
            .listCollections({
                projectId,
            })
            .then(response => response.result)
            .then(result => result.collections.map(toCollectionResult))

        return {
            collections: collections.filter(filterCollections)
        }
    }

    async listDocuments(options: ListDocumentsOptions): Promise<ListDocumentsResult> {
        const projectId: string = options.projectId || this.config.projectId;
        const collectionId: string = options.collectionId || this.config.collectionId;

        const documents = await this.discovery
            .listDocuments({
                projectId,
                collectionId,
                status: options.statuses && options.statuses.length > 0 ? options.statuses.join(',') : undefined,
                sha256: options.sha256,
            })
            .then(response => response.result)
            .then(result => result.documents)
            .then(documents => documents.map(doc => ({
                documentId: doc.document_id,
                status: doc.status,
                filename: doc.filename,
            })))

        return {
            documents,
            count: documents.length,
        }
    }
}

export const queryResponseToDocument = (result: DiscoveryV2.QueryResponse, passages: QueryLargePassages): Document[] => {
    const passageToString = ({passage_text, answers}: {passage_text: string | undefined, answers: ResultPassageAnswer[] | undefined}): string => {
        if (answers && answers.length > 0) {
            return answers
                .map(answer => answer.answer_text)
                .join('\n')
        }

        return passage_text || ''
    }

    if (passages.per_document) {
        return result.results.map((val: DiscoveryV2.QueryResult) => {
            const metadata = Object.assign(
                {document_id: val.document_id},
                val.metadata,
                val.result_metadata,
            )

            const pageContent = (val.document_passages || []).map(passageToString).join('\n')

            return new Document<Record<string, any>>({
                pageContent,
                metadata
            })
        })
    } else {
        return result.passages.map((val: DiscoveryV2.QueryResponsePassage) => {
            const metadata = Object.assign(
                {
                    document_id: val.document_id,
                    collection_id: val.collection_id,
                    passage_score: val.passage_score
                }
            )

            const pageContent = passageToString({passage_text: val.passage_text, answers: val.answers})

            return new Document({
                pageContent,
                metadata,
            })
        })
    }
}

const toCollectionResult = (collection: DiscoveryV2.Collection | DiscoveryV2.CollectionDetails): CollectionResult => {
    return {
        collectionId: collection.collection_id,
        name: collection.name,
        description: (collection as DiscoveryV2.CollectionDetails).description,
    }
}