import {Provider} from "@nestjs/common";
import {GenerativeApi} from "./generative.api";
import {GenerativeImpl} from "./generative.impl";

export * from './generative.api'

let _instance: GenerativeApi
export const generativeApi = () => {
    if (_instance) {
        return _instance
    }

    return _instance = new GenerativeImpl()
}

export const generativeProvider: Provider = {
    provide: GenerativeApi,
    useFactory: generativeApi,
}
