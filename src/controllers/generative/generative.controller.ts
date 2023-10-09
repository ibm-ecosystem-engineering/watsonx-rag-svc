import {Controller, Get, Query} from "@nestjs/common";
import {GenerativeApi} from "../../services";

@Controller('generate')
export class GenerativeController {
    constructor(private readonly service: GenerativeApi) {}

    @Get()
    async generate(
        @Query('question') question: string,
        @Query('collection') collection?: string,
        @Query('modelId') modelId?: string,
    ) {
        return this.service.generate({
            question,
            collectionId: collection,
            modelId,
        })
    }

}