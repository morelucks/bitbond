import { createConfig, testnet } from "@midl/core";
import { xverseConnector } from "@midl/connectors";

export const midlConfig = createConfig({
    networks: [testnet],
    connectors: [xverseConnector()],
    persist: true,
});
