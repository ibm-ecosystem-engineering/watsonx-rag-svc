
export interface GenerateRequest {
    question: string;
    modelId?: string;
    collectionId?: string;
}

export interface GenerateResult {
    question: string;
    generatedText: string;
}

export abstract class GenerativeApi {
    abstract generate(input: GenerateRequest): Promise<GenerateResult>;
}
