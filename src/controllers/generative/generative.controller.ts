import {Controller, Get, Query} from "@nestjs/common";
import {GenerativeApi} from "../../services";
import {ApiQuery, ApiTags} from "@nestjs/swagger";

@ApiTags('generative')
@Controller('generate')
export class GenerativeController {
    constructor(private readonly service: GenerativeApi) {}

    @ApiQuery({
        name: "question",
        type: String,
        description: "The question that will be answered fron the document repository",
        required: true
    })
    @ApiQuery({
        name: "collectionId",
        type: String,
        description: "The collection id used to restrict the documents for the answer. If not provided, all collections will be searched.",
        required: false
    })
    @ApiQuery({
        name: "modelId",
        type: String,
        description: "The generative model used to process the documents. If not provided the default model will be used.",
        required: false
    })
    @ApiQuery({
        name: "min_new_tokens",
        type: Number,
        description: "The min number of tokens to be returned",
        required: false
    })
    @ApiQuery({
        name: "max_new_tokens",
        type: Number,
        description: "The max number of tokens to be returned",
        required: false
    })
    @ApiQuery({
        name: "repetition_penalty",
        type: Number,
        description: "The repetition penalty value",
        required: false
    })
    @ApiQuery({
        name: "decoding_method",
        type: String,
        description: "The decoding method to use",
        required: false
    })
    @Get()
    async generate(
        @Query('question') question: string,
        @Query('collectionId') collectionId?: string,
        @Query('modelId') modelId?: string,
        @Query('min_new_tokens') min_new_tokens?: string,
        @Query('max_new_tokens') max_new_tokens?: string,
        @Query('decoding_method') decoding_method?: string,
        @Query('repetition_penalty') repetition_penalty?: string,
    ) {
        return this.service.generate({
            question,
            collectionId,
            modelId,
            min_new_tokens: handleOptionalNumber(min_new_tokens),
            max_new_tokens: handleOptionalNumber(max_new_tokens),
            decoding_method,
            repetition_penalty: handleOptionalNumber(repetition_penalty),
        })
    }

}

export const handleOptionalNumber = (value?: string): number | undefined => {
    if (value === undefined) {
        return undefined;
    }

    return parseInt(value);
}