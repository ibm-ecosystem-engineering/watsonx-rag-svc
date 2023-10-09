import {Document} from "langchain/document";
import {BaseRetriever} from "langchain/schema/retriever";
import {UserOptions} from "ibm-cloud-sdk-core";
import DiscoveryV2, {QueryLargePassages, QueryLargeSimilar, QueryLargeSuggestedRefinements} from "ibm-watson/discovery/v2";

export interface DiscoveryConfig {
    projectId: string;
    collectionId: string;
}

export interface DiscoveryStoreParams extends UserOptions, Partial<DiscoveryConfig> {
}

export interface AddDocumentOptions extends Partial<DiscoveryConfig> {
    preventDuplicates?: boolean;
}

export interface FindDocumentOptions extends Partial<DiscoveryConfig> {

}

export type DocumentProcessor = (documents: Document[]) => Document[]


export interface QueryDocumentOptions {
    projectId?: string;
    collectionIds?: string[];
    filter?: string;
    aggregation?: string;
    count?: number;
    offset?: number;
    sort?: string;
    suggestedRefinements?: QueryLargeSuggestedRefinements;
    passages?: QueryLargePassages;
    similar?: QueryLargeSimilar;
    processor?: DocumentProcessor;
}

export interface ListDocumentsOptions {
    projectId: string;
    collectionId?: string;
    count?: number;
    statuses?: string[];
    sha256?: string;
}

export interface DocumentMetadata {
    documentId: string;
    filename: string;
    status: string;
    path?: string;
}

export interface ListDocumentsResult {
    documents: DocumentMetadata[];
    count: number;
}

export interface ListCollectionsOptions {
    projectId: string;
    filter?: (result: CollectionResult) => boolean
}

export interface CollectionResult {
    collectionId: string;
    name: string;
    description?: string;
}

export interface ListCollectionsResult {
    collections: CollectionResult[];
}

export interface CreateCollectionOptions {
    projectId: string;
    name: string;
    description?: string;
}

export interface CreateCollectionResult {
    collectionId: string;
    name: string;
    description?: string;
}

export abstract class DiscoveryStore {
    readonly discovery: DiscoveryV2;
    abstract addDocuments(documents: Document[], options?: AddDocumentOptions): Promise<string[] | void>;
    abstract addDocument(document: Document, options?: AddDocumentOptions): Promise<string>;
    abstract listDocuments(options: ListDocumentsOptions): Promise<ListDocumentsResult>;
    abstract listCollections(options: ListCollectionsOptions): Promise<ListCollectionsResult>;
    abstract createCollection(options: CreateCollectionOptions): Promise<CreateCollectionResult>;
    abstract findDocumentByContents(document: Document, options?: FindDocumentOptions): Promise<string>;
    abstract query(naturalLanguageQuery: string, options?: QueryDocumentOptions): Promise<Document[]>;
    abstract asRetriever(options?: QueryDocumentOptions): BaseRetriever;
}
