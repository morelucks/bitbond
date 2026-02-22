import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import { vars, type HardhatUserConfig } from "hardhat/config";
import { midlRegtest } from "@midl/executor";

const MNEMONIC = vars.get("MNEMONIC", "test test test test test test test test test test test junk");

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    networks: {
        regtest: {
            url: midlRegtest.rpcUrls.default.http[0],
            chainId: midlRegtest.id,
            accounts: {
                mnemonic: MNEMONIC,
            },
        },
    },
    etherscan: {
        apiKey: {
            regtest: "empty",
        },
        customChains: [
            {
                network: "regtest",
                chainId: midlRegtest.id,
                urls: {
                    apiURL: "https://blockscout.staging.midl.xyz/api",
                    browserURL: "https://blockscout.staging.midl.xyz",
                },
            },
        ],
    },
};

export default config;
