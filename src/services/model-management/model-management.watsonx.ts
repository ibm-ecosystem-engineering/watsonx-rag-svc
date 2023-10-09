import {LLM} from "langchain/llms/base";

import {GetModelParams, ModelManagementApi} from "./model-management.api";
import {getWatsonxLLMParams, WatsonxLLM} from "../../langchain";

export class ModelManagementWatsonx implements ModelManagementApi {
    async getModel(params: GetModelParams): Promise<LLM> {
        return new WatsonxLLM(getWatsonxLLMParams(params))
    }

}
