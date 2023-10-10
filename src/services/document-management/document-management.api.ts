import {QueryLargePassages} from "ibm-watson/discovery/v2";
import {BaseRetriever} from "langchain/schema/retriever";
import {CollectionResult, ListCollectionsResult, ListDocumentsResult} from "../../langchain";

export interface AddDocumentParams {
    collectionId?: string;
    fileContent: NodeJS.ReadableStream | Buffer;
    filename: string;
    metadata?: Record<string, any>
}

export interface AddDocumentResult {
    documentId: string;
    collectionId: string;
}

export interface ListDocumentsParams {
    collectionId?: string;
    count?: number;
    statuses?: string[];
}

export interface DocumentModel {
    documentId: string;
    filename: string;
    status: string;
    path?: string;
}

export interface QueryDocumentsParams {
    collectionId?: string;
    filter?: string;
    naturalLanguageQuery?: string;
    count?: number;
    passages?: QueryLargePassages;
}

export interface DocumentDetailModel {
    pageContent: string;
    metadata: any;
}

export interface QueryDocumentsResult {
    documents: DocumentDetailModel[];
    count: number;
}

export interface RetrieverParams {
    collectionId?: string;
}

export interface ListCollectionsParams {
    includeDefault?: boolean;
}

export interface CreateCollectionParams {
    name: string;
    description?: string;
}

export interface GetDocumentParams {
    documentId: string;
}

export interface GetDocumentResult {
    documentId: string;
    filename: string;
    pageContent: Buffer;
}

export abstract class DocumentManagementApi {
    abstract listCollections(params?: ListCollectionsParams): Promise<ListCollectionsResult>;
    abstract createCollection(params: CreateCollectionParams): Promise<CollectionResult>;
    abstract listDocuments(params: ListDocumentsParams): Promise<ListDocumentsResult>;
    abstract addDocument(params: AddDocumentParams): Promise<AddDocumentResult>;
    abstract getDocument(params: GetDocumentParams): Promise<GetDocumentResult>;
    abstract query(params: QueryDocumentsParams): Promise<QueryDocumentsResult>;
    abstract asRetriever(params: RetrieverParams): Promise<BaseRetriever>;
}
