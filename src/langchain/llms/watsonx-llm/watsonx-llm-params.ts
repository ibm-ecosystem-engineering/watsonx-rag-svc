import {WatsonxLLMParams} from "./watsonx-llm";

export interface WatsonxLLmParams {
    modelId?: string;
    min_new_tokens?: number;
    max_new_tokens?: number;
    decoding_method?: string;
    repetition_penalty?: number;
}

export const getWatsonxLLMParams = (input: WatsonxLLmParams): WatsonxLLMParams => {
    const params = {
        apiKey: process.env.WML_API_KEY,
        identityUrl: process.env.IAM_URL,
        endpoint: process.env.WLM_ENDPOINT,
        projectId: process.env.WLM_PROJECT_ID,
        modelId: input.modelId || process.env.WLM_MODEL_ID || 'meta-llama/llama-2-70b-chat',
        config: {
            batchSize: parseInt(process.env.LLM_BATCH_SIZE || '4096'),
            min_new_tokens: input.min_new_tokens || parseInt(process.env.LLM_MIN_NEW_TOKENS || '1'),
            max_new_tokens: input.max_new_tokens || parseInt(process.env.LLM_MAX_NEW_TOKENS || '-1'),
            decoding_method: input.decoding_method || process.env.LLM_DECODING_METHOD || 'greedy',
            repetition_penalty: input.repetition_penalty || parseInt(process.env.LLM_REPETITION_PENALTY || '1'),
        }
    }

    if (!params.apiKey || !params.endpoint || !params.projectId) {
        throw new Error('WML_ACCESS_TOKEN, WLM_ENDPOINT, or WLM_PROJECT_ID env variable not set')
    }

    return params
}
