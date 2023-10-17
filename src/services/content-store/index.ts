import {ContentStoreApi} from "./content-store.api";
import {ContentStoreCloudant} from "./content-store.cloudant";
import {ContentStoreMemory} from "./content-store.memory";
import {cloudantBackendConfig, cloudantClient} from "../../backends";

export * from './content-store.api'

let _instance: ContentStoreApi;
export const contentStoreApi = () => {
    if (_instance) {
        return _instance;
    }

    const cloudantConfig = cloudantBackendConfig();
    if (cloudantConfig.apikey && cloudantConfig.url) {
        return _instance = new ContentStoreCloudant(cloudantClient(cloudantConfig));
    }

    console.log('Cloudant config missing')
    return _instance = new ContentStoreMemory();
}
