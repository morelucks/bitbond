# BitBond Frontend

React + TypeScript frontend for BitBond escrow protocol.

## Tech Stack

- React 19 + Vite
- TypeScript
- Midl SDK (@midl/react, @midl/executor)
- Wagmi v2 + Viem
- Xverse Wallet Integration

## Setup

```bash
npm install --legacy-peer-deps
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Configuration

Update contract address in `src/contracts/BitBondEscrow.ts` after deployment.
