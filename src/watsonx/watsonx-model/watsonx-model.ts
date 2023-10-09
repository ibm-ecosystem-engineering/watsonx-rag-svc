import Axios, {AxiosInstance} from 'axios';
import pThrottle from 'p-throttle';

import {delay} from "../../util/delay";

const throttle = pThrottle({
    limit: 2,
    interval: 1000,
})

export interface GenerativeInputParameters {
    decoding_method: string;
    min_new_tokens?: number;
    max_new_tokens: number;
    repetition_penalty: number;
}

export interface GenerativeInput {
    modelId?: string;
    input: string;
    projectId?: string;
    parameters: GenerativeInputParameters;
}

export interface GenerativeResponse {
    generatedText: string;
}

export interface GenerativeConfig {
    accessToken: string;
    projectId?: string;
    endpoint: string;
    modelId?: string;
    batchSize?: number;
}

interface GenerativeBackendResponse {
    model_id: string;
    created_at: string;
    results: GenerativeBackendResponseResult[];
}

interface GenerativeBackendResponseResult {
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
    stop_reason: string;
}

export type GenerateFunction = (input: string) => Promise<GenerativeResponse>;

export class WatsonxModel {
    private readonly client: AxiosInstance;
    private readonly projectId?: string;
    private readonly url: string;
    private readonly modelId?: string;

    constructor(config: GenerativeConfig) {
        this.client = Axios.create({
            baseURL: config.endpoint,
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                "Content-Type": 'application/json',
                Accept: 'application/json',
            },
        })

        this.url = config.endpoint;
        this.projectId = config.projectId;
        this.modelId = config.modelId;
    }

    generateFunction(config: Omit<GenerativeInput, 'input'>): GenerateFunction {
        return (input: string) => this.generate(Object.assign({}, config, {input}))
    }

    async generate(input: GenerativeInput): Promise<GenerativeResponse> {
        return this.generateInternal(input, 0);
    }

    private async generateInternal(params: GenerativeInput, retryCount: number = 0): Promise<GenerativeResponse> {
        const input = params.input.slice(0, Math.min(4096, params.input.length))

        const throttledGenerate = throttle(async (genParams: GenerativeInput) => {
            return this.client
                .post<GenerativeBackendResponse>(this.url, {
                    model_id: genParams.modelId || this.modelId,
                    input,
                    parameters: genParams.parameters,
                    project_id: genParams.projectId || this.projectId,
                })
                .then(result => {
                    return {generatedText: result.data.results[0].generated_text};
                })
        })

        return throttledGenerate(params)
            .catch(err => {
                const status = err.response?.status;
                if (status == 429 && retryCount < 4) {
                    console.log('Too many requests!!! Retrying: ' + (retryCount + 1))
                    return delay(1000 * Math.random(), () => this.generateInternal(params, retryCount + 1))
                }

                console.log('Error generating text: ', err);
                throw err;
            })
    }
}