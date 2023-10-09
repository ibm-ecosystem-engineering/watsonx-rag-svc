import {Provider} from "@nestjs/common";

import {HelloWorldResolver} from "./hello-world";
import {DocumentManagementResolver} from "./document-management";
import {GenerativeResolver} from "./generative";

export * from './hello-world'
export * from './document-management'
export * from './generative'

export const providers: Provider[] = [
    HelloWorldResolver,
    DocumentManagementResolver,
    GenerativeResolver,
]
