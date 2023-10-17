import {Args, Query, Resolver} from "@nestjs/graphql";

import {GenerateInput, GenerateResultGraphql} from "../../graphql-types";
import {GenerateResult, GenerativeApi} from "../../services";

@Resolver()
export class GenerativeResolver {
    constructor(private readonly service: GenerativeApi) {
    }

    @Query(() => GenerateResultGraphql)
    async generate(
        @Args('input') input: GenerateInput
    ): Promise<GenerateResult> {
        return this.service.generate(input)
    }
}
