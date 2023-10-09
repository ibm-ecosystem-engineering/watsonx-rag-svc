import pThrottle from "p-throttle";
import DiscoveryV2 = require("ibm-watson/discovery/v2");
import {UserOptions} from "ibm-cloud-sdk-core";

const throttle = pThrottle({
    limit: 5,
    interval: 1000,
})

export const createDiscoveryV2 = (options: UserOptions): DiscoveryV2 => {
    const discovery = new DiscoveryV2(options);

    const originalQuery = discovery.query.bind(discovery);
    discovery.query = throttle((params: DiscoveryV2.QueryParams) => {
        return originalQuery(params)
    }) as any

    const originalAddDocument = discovery.addDocument.bind(discovery);
    discovery.addDocument = throttle((params: DiscoveryV2.AddDocumentParams) => {
        return originalAddDocument(params);
    }) as any

    return discovery;
}
