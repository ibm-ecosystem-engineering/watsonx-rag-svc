import {DiscoveryStoreParams} from "./discovery-store";
import * as process from "process";
import {IamAuthenticator} from "ibm-cloud-sdk-core";

export const getDiscoveryStoreParams = (): DiscoveryStoreParams => {
    return {
        projectId: process.env.DISCOVERY_PROJECT_ID,
        serviceUrl: process.env.DISCOVERY_SERVICE_URL,
        authenticator: new IamAuthenticator({
            apikey: process.env.DISCOVERY_API_KEY,
        }),
        collectionId: process.env.DISCOVERY_COLLECTION_ID,
        version: process.env.DISCOVERY_VERSION,
    }
}
