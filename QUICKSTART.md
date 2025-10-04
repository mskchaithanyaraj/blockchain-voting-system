# 🚀 Quick Start Guide

Get the Blockchain Voting System up and running in 10 minutes!

## ⚡ Prerequisites Check

Make sure you have installed:

- ✅ Node.js (v18+)
- ✅ Ganache GUI
- ✅ MongoDB (Atlas or Local)
- ✅ MetaMask Browser Extension

---

## 📦 Step 1: Clone and Install (3 minutes)

```bash
# Clone repository
git clone https://github.com/mskchaithanyaraj/blockchain-voting-system.git
cd blockchain-voting-system

# Install all dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

---

## ⛓️ Step 2: Setup Ganache (2 minutes)

1. **Open Ganache GUI**
2. **Create New Workspace**
   - Click "New Workspace"
   - Name it "Voting System"
3. **Configure Settings**
   - Server Tab:
     - Hostname: `127.0.0.1`
     - Port: `7545`
     - Network ID: `5777`
   - Chain Tab:
     - Chain ID: `1337`
     - Gas Limit: `6721975`
4. **Save and Start**

5. **Copy Admin Account**
   - Note the first account address (starts with 0x...)
   - Click key icon to copy private key
   - Save both for later!

---

## 📜 Step 3: Deploy Smart Contract (1 minute)

```bash
cd contracts
truffle migrate --reset --network development
```

**⚠️ IMPORTANT**: Copy the deployed contract address from output!

Example output:

```
> contract address:    0x70905eA57Fe75D8da97C948A329ad079B9941Ce7
```

---

## ⚙️ Step 4: Configure Backend (2 minutes)

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blockchain-voting

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-key-min-32-chars

# Blockchain
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0x70905eA57Fe75D8da97C948A329ad079B9941Ce7
ADMIN_PRIVATE_KEY=your-ganache-admin-private-key-from-step-2

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Update Contract Files**:

1. `backend/contracts/voting-contract.json`
2. `frontend/src/contracts/voting-contract.json`

Update the `address` field in both files with your deployed contract address.

3. `frontend/src/web3/contractConfig.js`

```javascript
export const CONTRACT_ADDRESS = "0x70905eA57Fe75D8da97C948A329ad079B9941Ce7"; // Your address
```

---

## 🦊 Step 5: Setup MetaMask (1 minute)

### Add Ganache Network

1. Open MetaMask → Networks → Add Network
2. Fill in:
   - **Network Name**: Ganache Local
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
3. Save

### Import Account

1. MetaMask → Account Icon → Import Account
2. Paste private key from Ganache (Step 2)
3. Account imported!

---

## 🏃 Step 6: Run Everything (1 minute)

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Expected: `Server running on port 5000` ✅

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Expected: `Local: http://localhost:5173` ✅

---

## 🎉 Step 7: Test the Application!

### Open Browser

Navigate to: **http://localhost:5173**

### Test Admin Flow (2 minutes)

1. **Register Admin**

   - Click "Get Started"
   - Name: Admin User
   - Email: admin@test.com
   - Ethereum Address: (paste from Ganache - first account)
   - Password: admin123
   - Role: Administrator
   - Click "Create Account"

2. **Add Candidates**

   - Navigate to Candidates page
   - Add 3 candidates:
     - Candidate A, Party X
     - Candidate B, Party Y
     - Candidate C, Party Z

3. **Register Voters**

   - Navigate to Voters page
   - Copy 3-4 Ethereum addresses from Ganache
   - Paste in batch registration (one per line)
   - Click "Register All Voters"

4. **Start Election**
   - Navigate to Election page
   - Click "Start Election"
   - Confirm

### Test Voter Flow (2 minutes)

1. **Logout** (top right)

2. **Register Voter**

   - Click "Register"
   - Name: Voter User
   - Email: voter@test.com
   - Ethereum Address: (one of the registered addresses)
   - Password: voter123
   - Role: Voter
   - Click "Create Account"

3. **Connect MetaMask**

   - Click "Connect MetaMask"
   - Select account
   - Switch to Ganache network if prompted

4. **Cast Vote**

   - Navigate to "Cast Vote"
   - Select a candidate
   - Click "Cast Vote"
   - Confirm in MetaMask
   - Wait for confirmation ✅

5. **Logout and Login as Admin**

6. **End Election**

   - Navigate to Election page
   - Click "End Election"
   - Confirm

7. **View Results**
   - See winner announcement
   - View vote counts and percentages

---

## ✅ Success Checklist

- [x] Ganache running on port 7545
- [x] Contract deployed successfully
- [x] Backend running on port 5000
- [x] Frontend running on port 5173
- [x] Admin can add candidates
- [x] Admin can register voters
- [x] Admin can start election
- [x] Voter can connect MetaMask
- [x] Voter can cast vote
- [x] Admin can end election
- [x] Results display correctly

---

## 🆘 Quick Troubleshooting

### Backend won't start

```bash
# Check MongoDB connection
# Verify .env file exists
# Ensure port 5000 is free
```

### MetaMask not connecting

```bash
# Restart MetaMask
# Verify Ganache network added
# Check Chain ID is 1337
```

### Transaction fails

```bash
# Ensure voter is registered on blockchain
# Check MetaMask has sufficient ETH
# Verify contract address is correct
```

### "Voter not registered" error

```bash
# Admin must register voter's address first
# Use exact address from MetaMask
# Check registration transaction confirmed
```

---

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [API Documentation](README.md#api-documentation)
- Check the [Testing Guide](TESTING.md)
- Review the [Architecture](README.md#architecture)

---

## 🎊 Congratulations!

You've successfully set up a blockchain voting system! 🎉

**Happy Voting! 🗳️**
