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


@Controller('documents')
export class DocumentManagementController {
    constructor(private readonly service: DocumentManagementApi) {}

    @Get('collection')
    async listCollections(): Promise<ListCollectionsResult> {
        return this.service.listCollections()
    }

    @Post('collection')
    async createCollection(
        @Body() params: CreateCollectionParams
    ): Promise<CreateCollectionResult> {
        return this.service.createCollection(params)
    }

    @Get('document')
    async listDocuments(
        @Query('collectionId') collectionId?: string,
        @Query('count') count?: number,
        @Query('status') status?: string[]
    ): Promise<ListDocumentsResult> {
        const statuses: string[] = Array.isArray(status) ? status : (status ? [status] : undefined)

        return this.service
            .listDocuments({
                collectionId,
                count,
                statuses,
            })
            .then(result => ({
                count: result.count,
                documents: result.documents.map(mapDocumentPath('/documents/document'))
            }))
    }

    @Get('query')
    async query(
        @Query('query') query: string,
        @Query('collectionId') collectionId?: string,
        @Query('count') count?: number,
        @Query('status') status?: string[],
        @Query('documentPassages') documentPassages?: boolean,
        @Query('answers') answers?: boolean,
    ): Promise<QueryDocumentsResult> {
        return this.service.query({
            naturalLanguageQuery: query,
            collectionId,
            count,
            passages: {
                enabled: true,
                per_document: !!documentPassages,
                max_per_document: 5,
                find_answers: !!answers,
                max_answers_per_passage: 5,
            }
        })
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async addDocument(@Body() input: {name: string, collectionId?: string, metadata: any}, @UploadedFile() file: Express.Multer.File): Promise<AddDocumentResult> {
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