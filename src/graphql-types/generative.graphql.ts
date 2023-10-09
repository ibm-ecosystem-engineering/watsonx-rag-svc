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
}

@ObjectType()
export class GenerateResultGraphql implements GenerateResult {
    @Field()
    question: string;
    @Field()
    generatedText: string;
}
