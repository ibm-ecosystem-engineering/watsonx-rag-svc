import {LLM} from "langchain/llms/base";

export interface GetModelParams {
    modelId?: string;
    min_new_tokens?: number;
    max_new_tokens?: number;
    decoding_method?: string;
    repetition_penalty?: number;
}

export abstract class ModelManagementApi {
    abstract getModel(params: GetModelParams): Promise<LLM>;
}
