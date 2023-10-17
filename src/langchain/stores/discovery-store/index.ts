import {DiscoveryStoreParams} from "./discovery-store";
import {DiscoveryStoreImpl} from "./discovery-store.impl";

export * from './discovery-store'
export * from './discovery-store-params'

export const discoveryStore = (options: DiscoveryStoreParams) => {
    return new DiscoveryStoreImpl(options);
}
