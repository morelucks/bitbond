import { createConfig, testnet, mainnet } from "@midl/core";
import { xverseConnector } from "@midl/connectors";

export const midlConfig = createConfig({
    networks: [mainnet, testnet], // Mainnet first for production
    connectors: [xverseConnector()],
    persist: true,
});
