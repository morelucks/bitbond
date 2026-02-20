import { createConfig, testnet, mainnet } from "@midl/core";
import { xverseConnector } from "@midl/connectors";

export const midlConfig = createConfig({
    networks: [testnet, mainnet],
    connectors: [xverseConnector()],
    persist: true,
});
