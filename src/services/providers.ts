import {Provider} from "@nestjs/common";
import {provider as helloWorldProvider} from "./hello-world";
import {documentManagementProvider} from "./document-management";
import {generativeProvider} from "./generative";
import {modelManagementProvider} from "./model-management";

export * from './hello-world';
export * from './document-management';
export * from './generative';
export * from './model-management';

export const providers: Provider[] = [
    helloWorldProvider,
    documentManagementProvider,
    modelManagementProvider,
    generativeProvider,
];
