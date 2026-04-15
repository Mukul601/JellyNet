# JellyNet

**Unified agentic marketplace — monetize API keys via x402 micropayments on Algorand.**

Built for **AlgoBharat Hack Series 3.0**.

## What it does (MVP)

**Pay-Per-Call API Proxy** — the simplest possible DePIN primitive:

1. Supplier pastes any API key → gets a unique x402-protected proxy URL + Algorand earnings address
2. AI agent hits the proxy → receives `HTTP 402 Payment Required`
3. Agent pays micro-USDC on Algorand testnet → retries with `X-Payment` header
4. Proxy forwards call to real API → supplier earns per call

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + x402 protocol |
| Frontend | Next.js 15 App Router + Tailwind + shadcn/ui |
| Payments | x402 + Algorand testnet (USDC ASA 10458941) |
| Database | SQLite (async SQLAlchemy) |
| Agent SDK | [VibeKit](https://www.getvibekit.ai/) + [AlgoKit](https://github.com/algorandfoundation/algokit-cli) |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Algorand testnet wallet with ALGO + USDC (see below)

### 1. Backend

```bash
cd jellynet/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure
cp ../.env.example .env
# Edit .env:
#   1. Generate ENCRYPTION_KEY (see .env.example comment)
#   2. Add ALGO_MASTER_MNEMONIC (25-word wallet mnemonic)

# Start
uvicorn main:app --reload
# → http://localhost:8000
# → Docs: http://localhost:8000/docs
```

### 2. Frontend

```bash
cd jellynet/frontend

npm install

# Install shadcn/ui components (run once)
npx shadcn@latest init   # when prompted: dark mode, tailwind, src/ = no
npx shadcn@latest add button card input label badge dialog toast table select separator

cp .env.local.example .env.local

npm run dev
# → http://localhost:3000
```

### 3. Run the test agent

```bash
cd jellynet

# Install standalone deps (if not in backend venv)
pip install httpx py-algorand-sdk

# Run
python test_agent.py \
  --endpoint-id <uuid-from-dashboard> \
  --mnemonic "word1 word2 ... word25" \
  --path v1/models
```

## Setting up Algorand Testnet Wallet

1. **Create wallet** — use [Pera Wallet](https://perawallet.io/) or AlgoKit:
   ```bash
   algokit goal account new
   ```

2. **Fund with ALGO** — testnet faucet:
   [https://bank.testnet.algorand.network/](https://bank.testnet.algorand.network/)

3. **Opt-in to USDC** (ASA ID: `10458941`):
   ```bash
   algokit goal asset optin --assetid 10458941 --account <your-address>
   ```

4. **Get testnet USDC**:
   [https://usdcfaucet.com/](https://usdcfaucet.com/) → select Algorand Testnet

5. **Add mnemonic to `.env`**:
   ```
   ALGO_MASTER_MNEMONIC=word1 word2 ... word25
   ```

## Full Flow Verification

```bash
# 1. Check backend is running
curl http://localhost:8000/health
# → {"status":"ok","chain":"algorand","network":"testnet","version":"0.1.0"}

# 2. Add a supplier key
curl -X POST http://localhost:8000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"My OpenAI Key","api_key":"sk-...","target_url":"https://api.openai.com","min_price_usdca":100}'

# 3. Hit proxy without payment (expect 402)
curl http://localhost:8000/proxy/<endpoint-id>/v1/models
# → HTTP 402 with x402 payment details JSON

# 4. Run test agent (full flow)
python test_agent.py --endpoint-id <uuid> --mnemonic "..."
# → Pays on-chain, gets real API response, prints tx hash + explorer link

# 5. Check transactions
curl http://localhost:8000/api/transactions
```

## Project Structure

```
jellynet/
├── backend/
│   ├── main.py              FastAPI app entry
│   ├── config.py            Pydantic-settings (chain-modular)
│   ├── database.py          Async SQLite
│   ├── models/              SQLAlchemy ORM models
│   ├── schemas/             Pydantic request/response schemas
│   ├── routes/
│   │   ├── keys.py          /api/keys CRUD + generate
│   │   ├── proxy.py         /proxy/* x402-gated reverse proxy
│   │   └── test.py          /api/test/run in-process agent
│   ├── services/
│   │   ├── chain_factory.py PaymentChain ABC + factory
│   │   ├── algorand_service.py Algorand USDC verification
│   │   ├── proxy_service.py httpx reverse proxy
│   │   └── x402_service.py  x402 protocol (402 builder + header decoder)
│   └── middleware/
│       └── payment_required.py FastAPI dependency (x402 gate)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         Landing page
│   │   ├── dashboard/       Supplier dashboard
│   │   └── test/            Test agent UI
│   ├── components/          UI components
│   └── lib/                 Types, API client, Algorand utils
│
├── test_agent.py            Standalone agent demo script
├── .env.example             Environment variable template
└── README.md
```

## Adding a New Chain

JellyNet's chain integration is modular. To add Solana, Base, etc.:

1. Create `backend/services/solana_service.py` implementing `PaymentChain`
2. Add `elif chain == "solana": return SolanaService(settings)` in `chain_factory.py`
3. Add chain-specific env vars to `config.py` + `.env.example`
4. No route code needs to change — only `chain_factory.py`

## Future Pillars

| Pillar | Description |
|---|---|
| API Quota Stacker | Stack multiple provider keys, auto-route by price/availability |
| Web-Limit MCP Node | Monetize ChatGPT/Gemini free tiers via MCP sessions |
| Residential IP Sharer | Privacy-preserving proxy bandwidth marketplace |
| Compute Sharer | Monetize local CPU/GPU/RAM in 25/50/75% slices |
| DPDP Consent Logs | On-chain data usage consent records for India compliance |

## References

- [VibeKit — Official Algorand Agentic Stack](https://www.getvibekit.ai/)
- [AlgoKit](https://github.com/algorandfoundation/algokit-cli)
- [x402 Protocol](https://github.com/BofAI/x402)
- [fastapi-x402 reference](https://github.com/jordo1138/fastapi-x402)
- [awesome-x402](https://github.com/xpaysh/awesome-x402)
- [AlgoBharat Hack Series 3.0](https://algobharat.in/)
