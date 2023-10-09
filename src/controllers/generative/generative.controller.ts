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
        @Query('min_new_tokens') min_new_tokens?: number,
        @Query('max_new_tokens') max_new_tokens?: number,
        @Query('decoding_method') decoding_method?: string,
        @Query('repetition_penalty') repetition_penalty?: number,
    ) {
        return this.service.generate({
            question,
            collectionId: collection,
            modelId,
            min_new_tokens,
            max_new_tokens,
            decoding_method,
            repetition_penalty,
        })
    }

}