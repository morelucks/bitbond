# BitBond Smart Contracts

Solidity contracts for the BitBond escrow protocol on Midl.

## Setup

```bash
npm install
npx hardhat vars set MNEMONIC
```

## Deploy

```bash
# Deploy to Midl Regtest
npm run deploy

# Deploy to Mainnet
npm run deploy:mainnet
```

## Verify

```bash
npm run verify <CONTRACT_ADDRESS>
```

## Contract Address

Update `frontend/src/contracts/BitBondEscrow.ts` after deployment.
