# ENSIP-19 Primary Name Resolution Demo

This demo shows how to resolve an address’s primary name on Base using ENSIP‑19 (via CCIP Read on Ethereum mainnet) and how to fall back to a direct L2 reverse lookup on Base. It also demonstrates how to surface the resolved name in the OnchainKit Wallet connector.

## What it demonstrates
- ENSIP‑19 reverse resolution on Base using `viem.getEnsName({ address, coinType: toCoinType(base.id) })` against mainnet.
- Direct L2 reverse lookup on Base by calling `nameForAddr(address)` on the `L2ReverseRegistrar`.
- A connector label override: the Wallet button prefers the ENSIP‑19 name, and falls back to the L2 result when ENSIP‑19 is unavailable.

## Prerequisites
- Node 18+
- A mainnet RPC URL with sufficient CCIP/compute limits (Alchemy/Infura recommended)

Create `.env.local` in `ensip19-demo/ensip19-demo`:

```bash
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_api_key
```

## Run
```bash
pnpm install
pnpm dev
# open http://localhost:3000
```
