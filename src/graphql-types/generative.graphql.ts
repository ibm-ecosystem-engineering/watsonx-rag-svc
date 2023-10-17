import {GenerateRequest, GenerateResult} from "../services";
import {Field, InputType, ObjectType} from "@nestjs/graphql";

@InputType()
export class GenerateInput implements GenerateRequest {
    @Field()
    question: string;
    @Field({nullable: true})
    collectionId?: string;
    @Field({nullable: true})
    modelId?: string;
    @Field({nullable: true})
    min_new_tokens?: number;
    @Field({nullable: true})
    max_new_tokens?: number;
    @Field({nullable: true})
    decoding_method?: string;
    @Field({nullable: true})
    repetition_penalty?: number;
}

@ObjectType()
export class GenerateResultGraphql implements GenerateResult {
    @Field()
    question: string;
    @Field()
    generatedText: string;
}
