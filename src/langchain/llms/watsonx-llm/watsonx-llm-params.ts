import {WatsonxLLMParams} from "./watsonx-llm";

export const getWatsonxLLMParams = (modelId?: string): WatsonxLLMParams => {
    const params = {
        accessToken: process.env.WML_ACCESS_TOKEN,
        endpoint: process.env.WLM_ENDPOINT,
        projectId: process.env.WLM_PROJECT_ID,
        modelId: modelId || process.env.WLM_MODEL_ID || 'granite-13b-chat-v1',
        batchSize: parseInt(process.env.WLM_BATCH_SIZE || '4000'),
    }

    if (!params.accessToken || !params.endpoint || !params.projectId) {
        throw new Error('WML_ACCESS_TOKEN, WLM_ENDPOINT, or WLM_PROJECT_ID env variable not set')
    }

    return params
}
