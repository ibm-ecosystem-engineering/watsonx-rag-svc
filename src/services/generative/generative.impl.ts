import {Document} from "langchain/document";
import {LLM} from "langchain/llms/base";
import {PromptTemplate} from "langchain/prompts";
import {StringOutputParser} from "langchain/schema/output_parser";
import {BaseRetriever} from "langchain/schema/retriever";
import {RunnablePassthrough, RunnableSequence} from "langchain/schema/runnable";

import {GenerateRequest, GenerateResult, GenerativeApi} from "./generative.api";
import {getWatsonxLLMParams, WatsonxLLM} from "../../langchain";
import {documentManagementApi, DocumentManagementApi} from "../document-management";
import {modelManagementApi, ModelManagementApi} from "../model-management";

export class GenerativeImpl implements GenerativeApi {

    constructor(
        private readonly models: ModelManagementApi = modelManagementApi(),
        private readonly store: DocumentManagementApi = documentManagementApi(),
    ) {}

    async generate(input: GenerateRequest): Promise<GenerateResult> {

        const model: LLM = await this.models.getModel(input.modelId);

        const retriever: BaseRetriever = await this.store.asRetriever(input);

        const template: string = `Answer the question based only on the following context:
{context}

Question: {question}`

        const serializeDocs = (docs: Document[]) => {
            const result: string = docs
                .map(doc => doc.pageContent)
                .join('\n')

            const trimmedResult = result.slice(0, Math.min(result.length, getModelBatchSize(model) - (template.length + input.question.length)))

            if (trimmedResult.length !== result.length) {
                console.log(`Trimmed ${result.length - trimmedResult.length} characters from document results`)
            }

            return trimmedResult;
        }

        const chain = RunnableSequence.from([
            {
                context: retriever.pipe(serializeDocs),
                question: new RunnablePassthrough(),
            },
            PromptTemplate.fromTemplate(template),
            model,
            new StringOutputParser()
        ]);

        const generatedText = await chain.invoke(input.question);

        console.log('Result: ', {question: input.question, generatedText});

        return {
            question: input.question,
            generatedText,
        };
    }

}

const getModelBatchSize = (llm: LLM): number => {
    return (llm as any).batchSize || Number.MAX_VALUE
}
