import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying BitBondEscrow...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "BTC\n");

  if (balance === 0n) {
    console.log("❌ No balance! Get testnet BTC:");
    console.log("1. Go to: https://faucet.midl.xyz");
    console.log("2. Enter:", deployer.address);
    console.log("3. Claim testnet BTC");
    process.exit(1);
  }

  const BitBondEscrow = await hre.ethers.getContractFactory("BitBondEscrow");
  const escrow = await BitBondEscrow.deploy({
    gasPrice: 1000000000, // 1 gwei
  });
  
  console.log("⏳ Waiting for deployment...");
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("\n✅ BitBondEscrow deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Copy this address:", address);
  console.log("2. Update frontend/src/contracts/BitBondEscrow.ts");
  console.log("3. Verify on: https://blockscout.staging.midl.xyz/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
