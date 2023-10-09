import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {DocumentDetailModel, DocumentManagementApi, QueryDocumentsResult} from "../../services";
import {CreateCollectionResult, ListCollectionsResult, ListDocumentsResult} from "../../langchain";
import {
    Collection,
    CreateCollectionInput,
    DocumentDetailGraphql,
    ListCollections,
    ListDocuments,
    ListDocumentsInput,
    MetadataGraphql,
    QueryDocuments,
    QueryDocumentsInput
} from "../../graphql-types";

@Resolver()
export class DocumentManagementResolver {
    constructor(private readonly service: DocumentManagementApi) {}

    @Query(() => [ListCollections])
    async listCollections(): Promise<ListCollectionsResult> {
        return this.service.listCollections();
    }

    @Mutation(() => Collection)
    async createCollection(
        @Args('input') input: CreateCollectionInput
    ): Promise<CreateCollectionResult> {
        return this.service.createCollection(input)
    }

    @Query(() => [ListDocuments])
    async listDocuments(
        @Args('input') input: ListDocumentsInput
    ): Promise<ListDocumentsResult> {
        return this.service.listDocuments(input);
    }

    @Query(() => QueryDocuments)
    async query(
        @Args('input') input: QueryDocumentsInput
    ): Promise<QueryDocumentsResult> {
        return this.service
            .query(input)
            .then(result => ({
                count: result.count,
                documents: result.documents.map(toDocumentDetailGraphql)
            }))
    }
}

const toDocumentDetailGraphql = (document: DocumentDetailModel): DocumentDetailGraphql => {
    return {
        pageContent: document.pageContent,
        metadata: toMetadataGraphql(document.metadata)
    }
}

const toMetadataGraphql = (metadata: any): MetadataGraphql[] => {
    return Object.keys(metadata).map(key => ({key, value: metadata[key]}))
}
