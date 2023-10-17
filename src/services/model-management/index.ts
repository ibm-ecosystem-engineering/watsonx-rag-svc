import {Provider} from "@nestjs/common";
import {ModelManagementApi} from "./model-management.api";
import {ModelManagementWatsonx} from "./model-management.watsonx";

export * from './model-management.api'

let _instance: ModelManagementApi
export const modelManagementApi = () => {
    if (_instance) {
        return _instance
    }

    return _instance = new ModelManagementWatsonx();
}

export const modelManagementProvider: Provider = {
    provide: ModelManagementApi,
    useFactory: modelManagementApi,
}
