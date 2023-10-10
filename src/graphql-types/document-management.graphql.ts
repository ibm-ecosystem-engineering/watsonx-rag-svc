import {Field, InputType, ObjectType} from "@nestjs/graphql";
import {CollectionResult, ListCollectionsResult, ListDocumentsResult} from "../langchain";
import {
    AddDocumentParams,
    CreateCollectionParams,
    DocumentModel,
    ListDocumentsParams,
    QueryDocumentsParams,
    QueryDocumentsResult
} from "../services";

@ObjectType({description: 'Collection'})
export class Collection implements CollectionResult {
    @Field()
    collectionId: string;
    @Field({nullable: true})
    description?: string;
    @Field()
    name: string;
}

@ObjectType({description: 'Collections list'})
export class ListCollections implements ListCollectionsResult {
    @Field(() => [Collection])
    collections: CollectionResult[];
}

@InputType()
export class CreateCollectionInput implements CreateCollectionParams {
    @Field()
    name: string;
    @Field({nullable: true})
    description?: string;
}

@ObjectType({description: 'Document'})
export class Document implements DocumentModel {
    @Field()
    documentId: string;
    @Field()
    filename: string;
    @Field()
    status: string;
    @Field({nullable: true})
    path?: string;
}

@InputType()
export class ListDocumentsInput implements ListDocumentsParams {
    @Field({nullable: true})
    collectionId?: string;
    @Field({nullable: true})
    count?: number;
    @Field(() => [String], {nullable: true})
    statuses?: string[];
}

@ObjectType({description: 'Documents list'})
export class ListDocuments implements ListDocumentsResult {
    @Field()
    count: number;
    @Field(() => [Document])
    documents: DocumentModel[];
}

@InputType()
export class QueryDocumentsInput implements QueryDocumentsParams {
    @Field()
    naturalLanguageQuery: string;
    @Field({nullable: true})
    collectionId?: string;
    @Field({nullable: true})
    filter?: string;
    @Field({nullable: true})
    count?: number;
}

export interface MetadataGraphql {
    key: string;
    value: string;
}

export interface DocumentDetailGraphql {
    pageContent: string;
    metadata: MetadataGraphql[];
}

@ObjectType()
export class DocumentMetadata implements MetadataGraphql {
    @Field()
    key: string;
    @Field()
    value: string;
}

@ObjectType()
export class DocumentDetail implements DocumentDetailGraphql {
    @Field()
    pageContent: string;
    @Field(() => [DocumentMetadata], {nullable: true})
    metadata: MetadataGraphql[];
}

@ObjectType()
export class QueryDocuments implements QueryDocumentsResult {
    @Field()
    count: number;
    @Field(() => [DocumentDetail])
    documents: DocumentDetailGraphql[];
}