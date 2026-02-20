# ₿ BitBond

> **Bitcoin-native escrow protocol for freelancers and clients, built on Midl infrastructure.**

Trustless agreements sealed on-chain. Funds locked in a smart contract. Released only when conditions are met.

**No middleman. No custody risk. No ambiguity.**

---

## 🚀 Live Demo

> Demo available in submission video — full flow from wallet connection to on-chain fund release.

- **Block Explorer:** [blockscout.staging.midl.xyz](https://blockscout.staging.midl.xyz)
- **Network:** Midl Regtest (Bitcoin-native EVM)

---

## 🔥 Features

| Feature | Status |
|---|---|
| 🔗 Xverse Wallet Connection | ✅ |
| 💼 Create Escrow Agreement | ✅ |
| 🔒 Lock Funds On-Chain | ✅ |
| 👥 Two-Party Escrow (Client & Freelancer) | ✅ |
| ✅ Approve & Release Funds | ✅ |
| ⚠️ Dispute Protection | ✅ |
| ↩️ Refund After Deadline | ✅ |
| 🧾 On-Chain Transaction Proof | ✅ |
| ⚡ Midl RPC Integration | ✅ |
| 🎨 Premium Production UI | ✅ |

---

## 🧠 How It Works

### 1️⃣ Client Creates Escrow
Client inputs freelancer address, payment amount, work description, and deadline. Signs via Xverse → funds locked in BitBondEscrow contract.

### 2️⃣ Smart Contract Stores Agreement
Funds are held securely in contract storage. No admin. No backdoor.

### 3️⃣ Freelancer Completes Work
Freelancer delivers work off-chain.

### 4️⃣ Client Approves
Client clicks **"Approve & Release Funds"** → contract transfers funds directly to the freelancer.

### 5️⃣ UI Updates
Status changes to **RELEASED**, TX hash displayed, explorer link provided.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│             BitBond Frontend            │
│    React + Vite + TypeScript            │
│    Midl JS SDK (@midl/react, executor)  │
│    Wagmi v2 + Viem                      │
└────────────────┬────────────────────────┘
                 │ Midl RPC
                 ▼
┌─────────────────────────────────────────┐
│         Midl Protocol Layer             │
│   Bitcoin-native EVM execution          │
│   BTC transaction anchoring             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         BitBondEscrow.sol               │
│   createEscrow()  → locks funds         │
│   releaseFunds()  → pays freelancer     │
│   raiseDispute()  → flags dispute       │
│   refundAfterDeadline() → returns BTC   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│             Bitcoin Network             │
│        Immutable, trustless ledger      │
└─────────────────────────────────────────┘
```

---

## 🔐 Security

- Only client can approve release
- Only client/freelancer can raise disputes
- Refund only after deadline
- Reentrancy protection on all state-changing functions
- No admin withdrawal function
- Double-release prevention via status enum

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.28 |
| Deployment | Hardhat + `@midl/hardhat-deploy` |
| Frontend | React 18 + Vite + TypeScript |
| Bitcoin SDK | `@midl/core`, `@midl/react`, `@midl/executor` |
| Wallet | Xverse via `@midl/connectors` |
| EVM Interaction | Wagmi v2 + Viem |
| Styling | Vanilla CSS (dark mode, glassmorphism) |
| Network | Midl Regtest |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Xverse Wallet](https://www.xverse.app) browser extension
- Midl Regtest BTC (claim from [faucet.midl.xyz](https://faucet.midl.xyz))

### Install

```bash
git clone https://github.com/morelucks/bitbond
cd bitbond
npm install --legacy-peer-deps
```

### Deploy Contract

```bash
# Set your BIP39 mnemonic
npx hardhat vars set MNEMONIC

# Get your addresses
npx hardhat midl:address

# Deploy to Midl Regtest
npx hardhat deploy --network regtest

# Verify on Blockscout
npx hardhat verify <CONTRACT_ADDRESS> --network regtest
```

After deployment, update `src/contracts/BitBondEscrow.ts` with your contract address.

### Run Frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗺 Roadmap

| Phase | Features |
|---|---|
| ✅ Phase 1 (Hackathon) | Core escrow, wallet integration, clean UI, on-chain confirmation |
| 🔄 Phase 2 | Dispute resolution, milestone-based payments, DAO arbitration |
| 🔮 Phase 3 | Cross-chain support, freelancer marketplace, reputation scoring |

---

## 👥 Team

Built by **morelucks** for the Midl VibeHack 2025

---

## 📜 License

MIT
