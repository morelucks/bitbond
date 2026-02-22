# ₿ BitBond

> **Bitcoin-native escrow protocol for freelancers and clients, built on Midl infrastructure.**

Trustless agreements sealed on-chain. Funds locked in a smart contract. Released only when conditions are met.

**No middleman. No custody risk. No ambiguity.**

---

## 🚀 Project Structure

```
bitbond/
├── frontend/          # React + TypeScript UI
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   └── contracts/
│   └── package.json
│
├── contract/          # Solidity smart contracts
│   ├── BitBondEscrow.sol
│   ├── deploy/
│   └── hardhat.config.ts
│
└── README.md
```

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Xverse Wallet](https://www.xverse.app) browser extension
- Midl Regtest BTC (claim from [faucet.midl.xyz](https://faucet.midl.xyz))

### 1. Deploy Smart Contract

```bash
cd contract
npm install
npx hardhat vars set MNEMONIC
npm run deploy
```

Copy the deployed contract address.

### 2. Run Frontend

```bash
cd frontend
npm install --legacy-peer-deps

# Update contract address in src/contracts/BitBondEscrow.ts
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

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

## 🗺 Roadmap

| Phase | Features |
|---|---|
| ✅ Phase 1 (Hackathon) | Core escrow, wallet integration, clean UI, on-chain confirmation |
| 🔄 Phase 2 | Dispute resolution, milestone-based payments, DAO arbitration |
| 🔮 Phase 3 | Cross-chain support, freelancer marketplace, reputation scoring |

---

## 👥 Team

Built by **morelucks** for the Midl VibeHack 2026

---

## 📜 License

MIT
