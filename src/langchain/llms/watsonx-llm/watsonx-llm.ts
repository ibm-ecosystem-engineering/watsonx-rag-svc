import {BaseLLMCallOptions, BaseLLMParams, LLM} from "langchain/llms/base";

import {GenerativeInput, WatsonxModel} from "../../../watsonx";
import {CallbackManagerForLLMRun} from "langchain/callbacks";

export interface WatsonxLLMCallOptions extends BaseLLMCallOptions {
    max_new_tokens: number;
    decoding_method: string;
    repetition_penalty: number;
    modelId?: string;
    projectId?: string;
}

export interface WatsonxLLMParams extends BaseLLMParams {
    accessToken: string;
    endpoint: string;
    projectId?: string;
    modelId?: string;
    batchSize?: number;
}

export class WatsonxLLM extends LLM<WatsonxLLMCallOptions> {

    private engine: WatsonxModel;
    readonly batchSize: number;

    constructor(fields: WatsonxLLMParams, configuration?) {
        super(fields);

        this.batchSize = fields?.batchSize || 4096;

        this.engine = new WatsonxModel({
            accessToken: fields?.accessToken,
            endpoint: fields?.endpoint,
            projectId: fields?.projectId,
            modelId: fields?.modelId,
            batchSize: this.batchSize,
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
                max_new_tokens: options.max_new_tokens,
                decoding_method: options.decoding_method,
                repetition_penalty: options.repetition_penalty,
            },
            modelId: options.modelId,
            projectId: options.projectId
        };
    }

    _llmType(): string {
        return "watsonx.ai";
    }
}
