import {CallbackManagerForLLMRun} from "langchain/callbacks";
import {BaseLLMCallOptions, BaseLLMParams, LLM} from "langchain/llms/base";

import {GenerativeInput, WatsonxModel} from "../../../watsonx";

export interface WatsonxLLMCallOptions extends BaseLLMCallOptions {
    min_new_tokens: number;
    max_new_tokens: number;
    decoding_method: string;
    repetition_penalty: number;
    batchSize?: number;
    modelId?: string;
    projectId?: string;
}

export interface WatsonxLLMParams extends BaseLLMParams {
    accessToken: string;
    endpoint: string;
    projectId?: string;
    modelId?: string;
    config: Partial<Omit<WatsonxLLMCallOptions, 'projectId' | 'modelId'>>;
}

export class WatsonxLLM extends LLM<WatsonxLLMCallOptions> {

    private engine: WatsonxModel;
    readonly config: Partial<WatsonxLLMCallOptions>;

    constructor(fields: WatsonxLLMParams, configuration?) {
        super(fields);

        this.config = Object.assign(
            {},
            fields.config || {},
            {
                min_new_tokens: fields.config?.min_new_tokens || 1,
                batchSize: fields.config?.batchSize || 4096,
            }
        )

        this.engine = new WatsonxModel({
            accessToken: fields?.accessToken,
            endpoint: fields?.endpoint,
            projectId: fields?.projectId,
            modelId: fields?.modelId,
            batchSize: this.config.batchSize,
        });
    }

    _call(
        prompt: string,
        options: this["ParsedCallOptions"],
        runManager?: CallbackManagerForLLMRun
    ): Promise<string> {
        const params: GenerativeInput = this.extractParams(prompt, options);

        return this.engine
            .generate(params)
            .then(result => result.generatedText);
    }

    extractParams(prompt: string, options: this["ParsedCallOptions"]): GenerativeInput {
        return {
            input: prompt,
            parameters: {
                min_new_tokens: options.min_new_tokens || this.config.min_new_tokens,
                max_new_tokens: options.max_new_tokens || this.config.max_new_tokens,
                decoding_method: options.decoding_method || this.config.decoding_method,
                repetition_penalty: options.repetition_penalty || this.config.repetition_penalty,
            },
            modelId: options.modelId,
            projectId: options.projectId
        };
    }

    _llmType(): string {
        return "watsonx.ai";
    }
}
