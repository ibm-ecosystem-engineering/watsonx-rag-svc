import {LLM} from "langchain/llms/base";

import {ModelManagementApi} from "./model-management.api";
import {getWatsonxLLMParams, WatsonxLLM} from "../../langchain";

export class ModelManagementWatsonx implements ModelManagementApi {
    async getModel(modelId?: string): Promise<LLM> {
        return new WatsonxLLM(getWatsonxLLMParams(modelId))
    }

}
