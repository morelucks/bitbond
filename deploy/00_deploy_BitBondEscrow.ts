import type { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async (hre) => {
    /**
     * Initializes the MIDL hardhat deploy SDK
     * This sets up the BTC account derived from your MNEMONIC
     */
    await hre.midl.initialize();

    /**
     * Queue the BitBondEscrow deployment intention
     * Constructor takes no arguments — escrows are created via createEscrow()
     */
    await hre.midl.deploy("BitBondEscrow", []);

    /**
     * Sends both BTC and EVM transactions to the Midl network
     * This anchors the contract deployment on Bitcoin
     */
    await hre.midl.execute();

    console.log("✅ BitBondEscrow deployed successfully!");
    console.log("📋 Check the deployments/ folder for the contract address.");
    console.log(
        "🔍 Verify on Blockscout: https://blockscout.staging.midl.xyz"
    );
};

deploy.tags = ["main", "BitBondEscrow"];
export default deploy;
