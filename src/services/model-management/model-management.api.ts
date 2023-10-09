import {LLM} from "langchain/llms/base";

export abstract class ModelManagementApi {
    abstract getModel(modelId?: string): Promise<LLM>;
}
