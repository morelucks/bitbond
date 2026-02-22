import { HDNodeWallet } from "ethers";
import { vars } from "hardhat/config";

async function main() {
  const mnemonic = vars.get("MNEMONIC");
  const wallet = HDNodeWallet.fromPhrase(mnemonic);
  
  console.log("\n🔑 Your Wallet Address:");
  console.log("Address:", wallet.address);
  console.log("\n📍 Get testnet BTC:");
  console.log("1. Go to: https://faucet.midl.xyz");
  console.log("2. Enter address:", wallet.address);
  console.log("3. Claim testnet BTC\n");
}

main().catch(console.error);
