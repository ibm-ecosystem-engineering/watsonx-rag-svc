import { HelloWorldController } from './hello-world';
import {DocumentManagementController} from "./document-management";
import {GenerativeController} from "./generative";

export * from './hello-world';

export const controllers = [
    HelloWorldController,
    DocumentManagementController,
    GenerativeController,
];
