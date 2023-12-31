import DiscoveryV2 from "ibm-watson/discovery/v2";
import {Document} from "langchain/document";
import {getType} from 'mime';

import {
    AddDocumentParams,
    AddDocumentResult, CreateCollectionParams,
    DocumentManagementApi, GetDocumentParams, GetDocumentResult, ListCollectionsParams,
    ListDocumentsParams,
    QueryDocumentsParams,
    QueryDocumentsResult,
    RetrieverParams
} from "./document-management.api";
import {streamToBuffer} from "../../util";
import {
    CollectionResult,
    discoveryStore,
    DiscoveryStore, DocumentMetadata, getDiscoveryStoreParams,
    ListCollectionsResult,
    ListDocumentsResult
} from "../../langchain";
import {contentStoreApi, ContentStoreApi} from "../content-store";

interface DiscoveryConfig {
    projectId: string;
    collectionId: string;
    documentCount: number;
    passageCount: number;
    answerCount: number;
}

export class DocumentManagementDiscovery implements DocumentManagementApi {

    constructor(
        private readonly store: ContentStoreApi = contentStoreApi(),
        private readonly discovery: DiscoveryStore = discoveryStore(getDiscoveryStoreParams()),
    ) {}

    async addDocument(params: AddDocumentParams): Promise<AddDocumentResult> {
        const {projectId, collectionId} = await this.getDiscoveryConfig(params.collectionId)

        const document: Document = {
            pageContent: (await streamToBuffer(params.fileContent)).toString(),
            metadata: this.buildDocumentMetadata(params),
        }

        return this.discovery
            .addDocument(document, {
                projectId,
                collectionId,
                preventDuplicates: true,
            })
            .then(documentId => ({
                documentId,
                collectionId,
            }))
            .then(async doc => {
                await this.store.storeDocument({
                    id: doc.documentId,
                    name: params.filename,
                    content: await streamToBuffer(params.fileContent)
                })

                return doc
            })
    }

    async getDiscoveryConfig(collectionId?: string, useDefaultCollectionId: boolean = true): Promise<DiscoveryConfig> {
        const projectId: string = process.env.DISCOVERY_PROJECT_ID;
        const defaultCollectionId: string = process.env.DISCOVERY_DEFAULT_COLLECTION_ID;
        const documentCount: number = parseInt(process.env.DISCOVERY_DOCUMENT_COUNT || '5');
        const passageCount: number = parseInt(process.env.DISCOVERY_PASSAGE_COUNT || '5');
        const answerCount: number = parseInt(process.env.DISCOVERY_ANSWER_COUNT || '5');

        if (!projectId) {
            throw new Error('DISCOVERY_PROJECT_ID env variable not set')
        }

        if (!collectionId) {
            return {
                projectId,
                collectionId: useDefaultCollectionId ? defaultCollectionId : undefined,
                documentCount,
                passageCount,
                answerCount,
            }
        }

        return {
            projectId,
            collectionId,
            documentCount,
            passageCount,
            answerCount,
        }
    }

    buildDocumentMetadata(params: AddDocumentParams): Record<string, any> {
        return Object.assign(
            {},
            params.metadata || {},
            {
                filename: params.filename,
                fileContentType: getType(params.filename),
            })
    }

    async listDocuments(params: ListDocumentsParams): Promise<ListDocumentsResult> {
        const {projectId, collectionId} = await this.getDiscoveryConfig(params.collectionId)

        const result = await this.discovery
            .listDocuments({
                projectId,
                collectionId,
                count: params.count,
            })
            .then(response => response)

        return {
            documents: await Promise.all(result.documents.map(async doc => {
                const {filename, status} = doc.filename
                    ? {filename: doc.filename, status: doc.status}
                    : (await this.discovery.getDocument({projectId, collectionId, documentId: doc.documentId}).then((doc: DocumentMetadata) => ({filename: doc.filename, status: doc.status})));

                return {
                    documentId: doc.documentId,
                    filename: filename || 'unknown',
                    status: status || 'unknown',
                }
            })),
            count: result.count,
        }
    }

    async query(params: QueryDocumentsParams): Promise<QueryDocumentsResult> {
        const {projectId, collectionId} = await this.getDiscoveryConfig(params.collectionId, false)

        const documents = await this.discovery
            .query(params.naturalLanguageQuery, {
                projectId,
                collectionIds: collectionId ? [collectionId] : undefined,
                filter: params.filter,
                count: params.count,
                passages: params.passages,
            })
            .then(response => response)

        return {
            documents,
            count: documents.length,
        }
    }

    async listCollections(params: ListCollectionsParams = {includeDefault: false}): Promise<ListCollectionsResult> {
        const {projectId, collectionId} = await this.getDiscoveryConfig()

        return this.discovery
            .listCollections({
                projectId
            })
            .then(result => {
                if (params?.includeDefault) {
                    return result
                }

                return {
                    collections: result.collections.filter(c => c.collectionId !== collectionId)
                }
            })
    }

    async createCollection(params: CreateCollectionParams): Promise<CollectionResult> {
        const {projectId} = await this.getDiscoveryConfig(undefined, false)

        return this.discovery
            .createCollection({
                projectId,
                name: params.name,
                description: params.description,
            })
    }

    async asRetriever(params: RetrieverParams) {
        const {projectId, collectionId, documentCount, passageCount} = await this.getDiscoveryConfig(params.collectionId, false)

        const collectionIds: string[] = collectionId ? [collectionId] : undefined
        const count: number = documentCount;
        const passages: DiscoveryV2.QueryLargePassages = {
            enabled: true,
            per_document: true,
            max_per_document: passageCount,
            find_answers: false,
            max_answers_per_passage: 5,
        }

        return this.discovery
            .asRetriever(Object.assign(
                {count, passages},
                {projectId, collectionIds})
            );
    }

    async getDocument(params: GetDocumentParams): Promise<GetDocumentResult> {
        return this.store
            .getDocument(params.documentId)
            .then(doc => ({
                documentId: doc.id,
                filename: doc.name,
                pageContent: doc.content
            }))
    }

}
