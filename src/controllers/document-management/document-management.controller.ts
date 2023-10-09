import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import {
    AddDocumentResult,
    CreateCollectionParams,
    DocumentManagementApi,
    GetDocumentResult,
    QueryDocumentsResult
} from "../../services";
import {CreateCollectionResult, DocumentMetadata, ListCollectionsResult, ListDocumentsResult} from "../../langchain";
import {FileInterceptor} from "@nestjs/platform-express";
import {getType} from "mime";
import {ApiProperty, ApiQuery, ApiTags} from "@nestjs/swagger";
import {handleOptionalNumber} from "../generative";

class CreateCollection implements CreateCollectionParams {
    @ApiProperty()
    name: string;
    @ApiProperty({required: false})
    description?: string;
}

class AddDocument {
    @ApiProperty()
    name: string;
    @ApiProperty({required: false})
    collectionId?: string;
    @ApiProperty({required: false})
    metadata?: any
}

@ApiTags('documents')
@Controller('documents')
export class DocumentManagementController {
    constructor(private readonly service: DocumentManagementApi) {}

    @Get('collection')
    async listCollections(): Promise<ListCollectionsResult> {
        return this.service.listCollections()
    }

    @Post('collection')
    async createCollection(
        @Body() params: CreateCollection
    ): Promise<CreateCollectionResult> {
        return this.service.createCollection(params)
    }

    @ApiQuery({
        name: "collectionId",
        type: String,
        description: "The collection id to look for the document. If not provide, will use the default collection id.",
        required: false
    })
    @ApiQuery({
        name: "count",
        type: Number,
        description: "The number of documents to retrieve. If not provided the default will be used.",
        required: false
    })
    @ApiQuery({
        name: "status",
        type: [String],
        description: "The status values to search for. If not provided all statuses will be searched.",
        required: false
    })
    @Get('document')
    async listDocuments(
        @Query('collectionId') collectionId?: string,
        @Query('count') count?: string,
        @Query('status') status?: string[]
    ): Promise<ListDocumentsResult> {
        const statuses: string[] = Array.isArray(status) ? status : (status ? [status] : undefined)

        return this.service
            .listDocuments({
                collectionId,
                count: handleOptionalNumber(count),
                statuses,
            })
            .then(result => ({
                count: result.count,
                documents: result.documents.map(mapDocumentPath('/documents/document'))
            }))
    }

    @ApiQuery({
        name: "query",
        type: String,
        description: "The natural language query for the document repository",
        required: true
    })
    @ApiQuery({
        name: "collectionId",
        type: String,
        description: "The collection id to look for the document. If not provide, will use the default collection id.",
        required: false
    })
    @ApiQuery({
        name: "count",
        type: Number,
        description: "The number of documents to retrieve. If not provided the default will be used.",
        required: false
    })
    @ApiQuery({
        name: "documentPassages",
        type: Boolean,
        description: "Flag indicating that passages should be returned per document",
        required: false
    })
    @ApiQuery({
        name: "answers",
        type: Boolean,
        description: "Flag indicating that answers should be returned per passage",
        required: false
    })
    @Get('query')
    async query(
        @Query('query') query: string,
        @Query('collectionId') collectionId?: string,
        @Query('count') count?: string,
        @Query('documentPassages') documentPassages?: string,
        @Query('answers') answers?: string,
    ): Promise<QueryDocumentsResult> {

        return this.service.query({
            naturalLanguageQuery: query,
            collectionId,
            count: handleOptionalNumber(count),
            passages: {
                enabled: true,
                per_document: handleOptionalBoolean(documentPassages),
                max_per_document: 5,
                find_answers: handleOptionalBoolean(answers),
                max_answers_per_passage: 5,
            }
        })
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async addDocument(@Body() input: AddDocument, @UploadedFile() file: Express.Multer.File): Promise<AddDocumentResult> {
        return this.service.addDocument({
            collectionId: input.collectionId,
            filename: input.name,
            metadata: input.metadata,
            fileContent: file.buffer
        })
    }

    @Get('document/:id/:name')
    async downloadFileByName(
        @Param('id') documentId: string,
        @Param('name') name: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        const document: GetDocumentResult = await this.service.getDocument({documentId});

        const filename = document.filename || name;

        (res as any).set({
            'Content-Type': getType(filename),
            'Content-Disposition': `attachment; filename="${filename}"`
        })

        return new StreamableFile(document.pageContent, {type: getType(filename)});
    }

    @Get('document/:id')
    async downloadFile(
        @Param('id') documentId: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        const document: GetDocumentResult = await this.service.getDocument({documentId});

        // TODO handle missing filename
        (res as any).set({
            'Content-Type': getType(document.filename),
            'Content-Disposition': `attachment; filename="${document.filename}"`
        })

        return new StreamableFile(document.pageContent, {type: getType(document.filename)});
    }
}

export const mapDocumentPath = (basePath: string) => {
    return (doc: DocumentMetadata): DocumentMetadata => {
        const path: string = doc.filename
            ? `${basePath}/${doc.documentId}/${doc.filename}`
            : `${basePath}/${doc.documentId}`

        return Object.assign(
            {},
            doc,
            {path}
        )
    }
}

export const handleOptionalBoolean = (value?: string): boolean | undefined => {
    if (value === undefined) {
        return undefined
    }

    return value === 'true'
}