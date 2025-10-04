# Deployment Guide

## Prerequisites

Before deploying, ensure:

1. ✅ **Ganache is running**

   - Workspace: OBESE-BALL
   - RPC Server: http://127.0.0.1:7545
   - Network ID: 5777

2. ✅ **You have a deployer private key**
   - Get it from Ganache (click key icon next to any account)

## Step-by-Step Deployment

### Step 1: Create .env file

Create a `.env` file in the `contracts/` directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Then edit `.env` and add your Ganache private key:

```env
# Ganache RPC endpoint
ETH_RPC_URL=http://127.0.0.1:7545

# Chain ID (Ganache default)
CHAIN_ID=5777

# Private key of deployer account (get from Ganache)
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**⚠️ Important:**

- Copy the ENTIRE private key from Ganache (starts with `0x`)
- Never commit this file to Git (already in .gitignore)

### Step 2: Compile Contracts

```bash
npm run compile
```

Expected output:

```
✓ Compiling .\contracts\Voting.sol
> Compiled successfully using:
   - solc: 0.8.20+commit.a1b79de6.Emscripten.clang
```

### Step 3: Deploy to Ganache

```bash
npm run deploy:ganache
```

This will:

1. Deploy the Voting contract
2. Save deployment info to `deployments/` folder
3. Automatically copy artifacts to backend and frontend folders
4. Display contract address and deployment details

Expected output:

```
========================================
🚀 Starting Voting Contract Deployment
========================================

Network: ganache
Deployer Account: 0x...
Available Accounts: 10

📋 Deploying with parameters:
  Election Name: General Election 2025

✅ Contract Deployed Successfully!
📍 Contract Address: 0x...
👤 Admin Address: 0x...

💾 Deployment info saved to:
   deployments/voting-ganache.json
   deployments/voting-contract.json

📊 Contract Information:
  Election Name: General Election 2025
  Admin: 0x...
  Election State: 0
  Candidate Count: 0
  Registered Voters: 0

========================================
✨ Deployment Complete!
========================================
```

### Step 4: Verify in Ganache

Open Ganache UI and check:

1. **Transactions Tab**

   - You should see a contract creation transaction
   - Status: Success
   - Gas used: ~2,500,000

2. **Blocks Tab**

   - New block should be mined
   - Contains your deployment transaction

3. **Contracts Tab** (if available)
   - Shows your deployed contract address
   - Current state and storage

### Step 5: Note the Contract Address

Copy the contract address from the output. You'll need it for:

- Backend `.env`: `CONTRACT_ADDRESS=0x...`
- Frontend `.env`: `VITE_CONTRACT_ADDRESS=0x...`

## Deployment Files

After deployment, you'll find:

### contracts/deployments/

- `voting-ganache.json` - Full deployment details
- `voting-contract.json` - Simplified for apps (ABI + address)

### Automatically Copied To:

- `backend/contracts/voting-contract.json`
- `frontend/src/contracts/voting-contract.json`

## Redeploy (Reset)

To redeploy from scratch (clears migration history):

```bash
npm run deploy:reset
```

Use this when:

- You modified the contract
- You want a fresh deployment
- Previous deployment failed

## Troubleshooting

### Error: "Cannot find module '../build/contracts/Voting.json'"

**Solution:** Run `npm run compile` first

### Error: "sender doesn't have enough funds"

**Solution:**

- Check deployer account has ETH in Ganache
- Verify private key is correct
- Make sure Ganache is running

### Error: "Invalid JSON RPC response"

**Solution:**

- Verify Ganache is running on http://127.0.0.1:7545
- Check `ETH_RPC_URL` in .env
- Restart Ganache if needed

### Error: "private key should be Buffer or string with 0x prefix"

**Solution:**

- Ensure private key starts with `0x`
- Don't include quotes around the key in .env

### Deployment succeeds but artifacts not copied

**Solution:**

```bash
# Manually copy artifacts
npm run copy-artifacts
```

## Manual Artifact Copy (if needed)

If automatic copy fails:

```bash
node scripts/copy-artifacts.js
```

## Testing Deployment

After deployment, test using Truffle console:

```bash
npm run console
```

```javascript
// Get deployed instance
const voting = await Voting.deployed();

// Check admin
const admin = await voting.admin();
console.log("Admin:", admin);

// Check election name
const name = await voting.electionName();
console.log("Election Name:", name);

// Check election state (0 = NotStarted)
const state = await voting.electionState();
console.log("State:", state.toString());
```

## Next Steps After Deployment

1. ✅ Update `backend/.env` with `CONTRACT_ADDRESS`
2. ✅ Update `frontend/.env` with `VITE_CONTRACT_ADDRESS`
3. ✅ Verify contract ABI is copied to both folders
4. ✅ Start backend server
5. ✅ Start frontend app
6. ✅ Begin testing!

## Important Notes

- **Contract Address Changes**: Every redeployment creates a new address
- **Update .env files**: After each deployment, update backend and frontend
- **Ganache Reset**: If you reset Ganache, you must redeploy
- **Network Consistency**: Ensure all apps point to same Ganache instance
