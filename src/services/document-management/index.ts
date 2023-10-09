import {Provider} from "@nestjs/common";
import {DocumentManagementApi} from "./document-management.api";
import {DocumentManagementDiscovery} from "./document-management.discovery";

export * from './document-management.api'

let _instance: DocumentManagementApi;


export const documentManagementApi = () => {
    if (_instance) {
        return _instance
    }

    return _instance = new DocumentManagementDiscovery();
}

export const documentManagementProvider: Provider = {
    provide: DocumentManagementApi,
    useFactory: documentManagementApi,
}
