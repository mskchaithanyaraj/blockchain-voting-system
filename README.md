# 🗳️ Blockchain Voting System

A secure, transparent, and decentralized voting system built with Ethereum blockchain technology, React, Node.js, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This blockchain voting system ensures election integrity through:

- **Immutable Records**: All votes stored on Ethereum blockchain
- **Transparency**: Publicly verifiable results
- **Security**: Cryptographic verification and authentication
- **Privacy**: Anonymous voting with voter verification
- **Real-time Sync**: Backend automatically syncs with blockchain events

---

## ✨ Features

### Admin Features

- 👤 Admin account management
- ➕ Add and manage candidates
- 📝 Register voters (single or batch)
- 🚀 Start and end elections
- 📊 View real-time voting statistics
- 🏆 View election results with winner announcement

### Voter Features

- 🔐 Secure authentication
- 🦊 MetaMask wallet integration
- ✅ Check registration status
- 🗳️ Cast vote on blockchain
- 📈 View live election results
- 🔍 Transaction verification

### Technical Features

- 🔗 Ethereum blockchain integration
- 📡 Real-time event listeners
- 🔒 JWT authentication
- 🎨 Responsive UI with Tailwind CSS
- ⚡ Fast Vite build system
- 🗄️ MongoDB database for user management

---

## 🛠️ Technology Stack

### Blockchain

- **Ethereum**: Blockchain platform
- **Solidity**: Smart contract language (v0.8.20)
- **Truffle**: Development framework (v5.11.5)
- **Ganache**: Local blockchain (localhost:7545)
- **Ethers.js**: Web3 library (v6.15.0)

### Backend

- **Node.js**: Runtime environment (v22.19.0)
- **Express**: Web framework (v5.1.0)
- **MongoDB**: Database with Mongoose ODM (v8.19.0)
- **JWT**: Authentication
- **Bcrypt**: Password hashing

### Frontend

- **React**: UI library (v19.1.1)
- **Vite**: Build tool (v7.1.7)
- **Tailwind CSS**: Styling (v3.4.18)
- **React Router**: Navigation (v7.1.1)
- **Axios**: HTTP client
- **MetaMask**: Wallet integration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Admin    │  │   Voter    │  │   Shared Components    │ │
│  │  Dashboard │  │  Dashboard │  │  (Auth, Navigation)    │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│         │                │                    │               │
│         └────────────────┴────────────────────┘               │
│                          │                                    │
│              ┌───────────┴───────────┐                        │
│              │   Web3 Provider       │                        │
│              │   (Ethers.js)         │                        │
│              └───────────┬───────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼────────┐    │    ┌─────────▼─────────┐
    │   Backend API    │    │    │   Ganache Local   │
    │   (Express +     │    │    │   Blockchain      │
    │    MongoDB)      │    │    │   Network         │
    └─────────┬────────┘    │    └─────────┬─────────┘
              │             │              │
              │    ┌────────▼─────────┐    │
              │    │  Smart Contract  │    │
              │    │  (Voting.sol)    │    │
              │    └────────┬─────────┘    │
              │             │              │
              └─────────────┴──────────────┘
                    Event Listeners
```

---

## 📦 Prerequisites

Before installation, ensure you have:

1. **Node.js** (v18.0.0 or higher)

   - Download: https://nodejs.org/

2. **MongoDB** (Local or Atlas)

   - Atlas Cloud: https://www.mongodb.com/cloud/atlas
   - Or local: https://www.mongodb.com/try/download/community

3. **Ganache** (Local Blockchain)

   - Download: https://trufflesuite.com/ganache/

4. **MetaMask** (Browser Extension)

   - Download: https://metamask.io/download/

5. **Git**
   - Download: https://git-scm.com/downloads

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mskchaithanyaraj/blockchain-voting-system.git
cd blockchain-voting-system
```

### 2. Install Smart Contract Dependencies

```bash
cd contracts
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### 1. Setup Ganache

1. Open Ganache GUI
2. Create a new workspace or use Quickstart
3. Configure:

   - **RPC Server**: `HTTP://127.0.0.1:7545`
   - **Network ID**: `5777`
   - **Chain ID**: `1337`
   - **Gas Limit**: `6721975`

4. Note the first account address (Admin account)

### 2. Deploy Smart Contract

```bash
cd contracts
truffle migrate --reset --network development
```

**Important**: Copy the deployed contract address from the output!

### 3. Update Contract Configuration

Update `backend/contracts/voting-contract.json` and `frontend/src/contracts/voting-contract.json`:

```json
{
  "address": "YOUR_DEPLOYED_CONTRACT_ADDRESS",
  "abi": [...]
}
```

Also update `frontend/src/web3/contractConfig.js`:

```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 4. Configure Backend Environment

Create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/blockchain-voting

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Blockchain Configuration
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
ADMIN_PRIVATE_KEY=YOUR_GANACHE_ADMIN_PRIVATE_KEY

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Getting Admin Private Key from Ganache**:

1. Open Ganache
2. Click on the key icon next to the first account
3. Copy the private key
4. Paste in `ADMIN_PRIVATE_KEY`

### 5. Configure Frontend

The frontend uses proxy configuration in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
```

### 6. Setup MetaMask

1. Install MetaMask browser extension
2. Import Account:
   - Click MetaMask icon → Import Account
   - Paste private key from Ganache account
3. Add Ganache Network:
   - Click MetaMask → Networks → Add Network
   - **Network Name**: Ganache Local
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
   - Click Save

---

## 🏃 Running the Application

### Terminal 1: Start Ganache

```bash
# Open Ganache GUI and start the workspace
# Ensure it's running on http://127.0.0.1:7545
```

### Terminal 2: Start Backend

```bash
cd backend
npm run dev
```

Expected output:

```
Server running on port 5000
MongoDB Connected: cluster0.mongodb.net
Blockchain service initialized
Event listeners started
```

### Terminal 3: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v7.1.7  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Access the Application

Open browser: **http://localhost:5173**

---

## 📖 Usage Guide

### For Administrators

#### 1. Register Admin Account

1. Navigate to http://localhost:5173/register
2. Fill in the form:
   - **Name**: Your name
   - **Email**: admin@example.com
   - **Ethereum Address**: First address from Ganache (0x...)
   - **Password**: Choose strong password
   - **Role**: Select "Administrator"
3. Click "Create Account"

#### 2. Login as Admin

1. Navigate to http://localhost:5173/login
2. Enter admin credentials
3. You'll be redirected to Admin Dashboard

#### 3. Add Candidates

1. Navigate to "Candidates" page
2. Fill in candidate details:
   - Candidate Name
   - Party Name
3. Click "Add Candidate"
4. Repeat for all candidates

#### 4. Register Voters

**Single Voter:**

1. Navigate to "Voters" page
2. Enter voter's Ethereum address (from Ganache)
3. Click "Register Voter"

**Batch Registration:**

1. Navigate to "Voters" page
2. In "Batch Registration" section
3. Enter multiple addresses (one per line)
4. Click "Register All Voters"

#### 5. Start Election

1. Navigate to "Election" page
2. Review election details
3. Click "Start Election" button
4. Confirm in modal
5. Election is now active!

#### 6. Monitor Voting

- Dashboard shows real-time statistics
- View total votes, voter turnout
- Monitor voting progress

#### 7. End Election

1. Navigate to "Election" page
2. Click "End Election" button
3. Confirm in modal
4. View results with winner announcement

---

### For Voters

#### 1. Register Voter Account

1. Navigate to http://localhost:5173/register
2. Fill in the form:
   - **Name**: Your name
   - **Email**: voter@example.com
   - **Ethereum Address**: Your Ganache address
   - **Password**: Choose password
   - **Role**: Select "Voter"
3. Click "Create Account"

> **Note**: Admin must register your Ethereum address on blockchain before you can vote!

#### 2. Login as Voter

1. Navigate to http://localhost:5173/login
2. Enter voter credentials
3. You'll be redirected to Voter Dashboard

#### 3. Connect MetaMask

1. Click "Connect MetaMask" button
2. MetaMask popup will appear
3. Select the account matching your registered address
4. Click "Connect"
5. If prompted, switch to Ganache network

#### 4. Cast Your Vote

1. Navigate to "Cast Vote" page
2. Review all candidates
3. Select your preferred candidate (radio button)
4. Click "Cast Vote" button
5. MetaMask will open for transaction confirmation
6. Review gas fees
7. Click "Confirm"
8. Wait for transaction confirmation
9. Success! Your vote is recorded on blockchain

#### 5. View Results

1. Navigate to "Results" page
2. Available only after admin ends election
3. View:
   - Winner announcement
   - Detailed vote counts
   - Percentages
   - Rankings

---

## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "ethAddress": "0x...",
  "role": "voter"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "token": "jwt-token...",
  "user": { ... }
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

---

### Admin Endpoints

#### Add Candidate

```http
POST /admin/add-candidate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Candidate Name",
  "party": "Party Name"
}
```

#### Register Voter

```http
POST /admin/register-voter
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "voterAddress": "0x..."
}
```

#### Register Voters (Batch)

```http
POST /admin/register-voters-batch
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "voterAddresses": ["0x...", "0x...", "0x..."]
}
```

#### Start Election

```http
POST /admin/start-election
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "electionName": "General Election 2025"
}
```

#### End Election

```http
POST /admin/end-election
Authorization: Bearer <admin-token>
```

#### Get All Candidates (Admin)

```http
GET /admin/candidates
Authorization: Bearer <admin-token>
```

#### Get Results (Admin)

```http
GET /admin/results
Authorization: Bearer <admin-token>
```

---

### Voter Endpoints

#### Cast Vote

```http
POST /voter/vote
Authorization: Bearer <voter-token>
Content-Type: application/json

{
  "candidateId": 1,
  "voterPrivateKey": ""  // Empty when using MetaMask
}
```

#### Get Voter Status

```http
GET /voter/status
Authorization: Bearer <voter-token>
```

#### Get Candidates

```http
GET /voter/candidates
Authorization: Bearer <voter-token>
```

#### Get Election State

```http
GET /voter/election-state
Authorization: Bearer <voter-token>
```

#### Get Results

```http
GET /voter/results
Authorization: Bearer <voter-token>
```

#### Get My Vote

```http
GET /voter/my-vote
Authorization: Bearer <voter-token>
```

---

## 📜 Smart Contract

### Voting.sol Functions

#### Admin Functions

- `addCandidate(name, party)`: Add new candidate
- `registerVoter(address)`: Register voter address
- `startElection(name)`: Start election with name
- `endElection()`: End election and finalize results

#### Voter Functions

- `castVote(candidateId)`: Cast vote for candidate

#### View Functions

- `getCandidate(id)`: Get candidate details
- `getCandidateCount()`: Get total candidates
- `getVoterStatus(address)`: Check if voter registered/voted
- `getElectionState()`: Get current election state (0=NotStarted, 1=Active, 2=Ended)
- `electionName()`: Get election name
- `totalVotes()`: Get total votes cast

#### Events

- `CandidateAdded(id, name, party)`
- `VoterRegistered(address)`
- `VoteCast(voter, candidateId)`
- `ElectionStarted(name, timestamp)`
- `ElectionEnded(timestamp)`

---

## 📁 Project Structure

```
blockchain-voting-system/
├── contracts/                    # Smart Contract
│   ├── contracts/
│   │   ├── Voting.sol           # Main voting contract
│   │   └── Migrations.sol
│   ├── migrations/
│   │   ├── 1_initial_migration.js
│   │   └── 2_deploy_voting.js
│   ├── build/contracts/         # Compiled contracts
│   ├── deployments/             # Deployment artifacts
│   ├── test/                    # Contract tests
│   ├── truffle-config.js
│   └── package.json
│
├── backend/                     # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # MongoDB connection
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   └── voter.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   └── Vote.model.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── voter.routes.js
│   │   ├── services/
│   │   │   ├── blockchain.service.js
│   │   │   └── event-listener.service.js
│   │   └── index.js
│   ├── contracts/               # Contract ABI
│   ├── .env
│   └── package.json
│
└── frontend/                    # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── AdminRoute.jsx
    │   │   ├── ErrorMessage.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── LoginForm.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── RegisterForm.jsx
    │   │   ├── SuccessMessage.jsx
    │   │   ├── VoterRoute.jsx
    │   │   └── WalletConnect.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── contracts/           # Contract ABI
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── CastVote.jsx
    │   │   ├── Home.jsx
    │   │   ├── ManageCandidates.jsx
    │   │   ├── ManageElection.jsx
    │   │   ├── ManageVoters.jsx
    │   │   ├── ViewResults.jsx
    │   │   └── VoterDashboard.jsx
    │   ├── services/
    │   │   └── api.service.js
    │   ├── web3/
    │   │   ├── contractConfig.js
    │   │   └── web3Provider.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🧪 Testing

### Manual Testing Checklist

#### ✅ Backend Testing

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Blockchain service initialized
- [ ] Event listeners started

#### ✅ Smart Contract Testing

- [ ] Contract deployed successfully
- [ ] Admin can add candidates
- [ ] Admin can register voters
- [ ] Admin can start election
- [ ] Voters can cast votes
- [ ] Admin can end election
- [ ] Events emitted correctly

#### ✅ Authentication Testing

- [ ] User can register as admin
- [ ] User can register as voter
- [ ] User can login
- [ ] JWT token generated
- [ ] Protected routes blocked without token
- [ ] Role-based access control works

#### ✅ Admin Workflow Testing

- [ ] Admin dashboard displays statistics
- [ ] Can add multiple candidates
- [ ] Can register voters (single)
- [ ] Can register voters (batch)
- [ ] Can start election
- [ ] Cannot start already active election
- [ ] Can end election
- [ ] Results display correctly

#### ✅ Voter Workflow Testing

- [ ] Voter dashboard shows status
- [ ] MetaMask connection works
- [ ] Network switching to Ganache works
- [ ] Unregistered voter cannot vote
- [ ] Registered voter can see candidates
- [ ] Can cast vote with MetaMask
- [ ] Transaction confirmation displays
- [ ] Cannot vote twice
- [ ] Cannot vote before election starts
- [ ] Cannot vote after election ends
- [ ] Results visible after election ends

#### ✅ UI/UX Testing

- [ ] Responsive design works on mobile
- [ ] Navigation between pages smooth
- [ ] Loading states display
- [ ] Error messages clear and helpful
- [ ] Success notifications appear
- [ ] Forms validate input
- [ ] Buttons disabled appropriately

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"

**Solution**:

- Check MongoDB Atlas connection string in `.env`
- Ensure IP address whitelisted in Atlas
- Verify credentials are correct

#### 2. "MetaMask not connecting"

**Solution**:

- Ensure MetaMask installed
- Check Ganache network added correctly
- Verify Chain ID is 1337
- Try disconnecting and reconnecting

#### 3. "Transaction failed"

**Solution**:

- Ensure sufficient ETH in Ganache account
- Check gas limit settings
- Verify contract address is correct
- Restart Ganache and redeploy contract

#### 4. "Voter not registered" error

**Solution**:

- Admin must register voter's Ethereum address first
- Ensure correct address being used
- Check blockchain transaction confirmed

#### 5. "Invalid token" error

**Solution**:

- Token may be expired (default 7 days)
- Logout and login again
- Check JWT_SECRET matches between requests

#### 6. Backend not starting

**Solution**:

- Check all dependencies installed: `npm install`
- Verify `.env` file exists and configured
- Check port 5000 not already in use
- Review console for specific error messages

#### 7. Frontend build errors

**Solution**:

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check all imports are correct
- Verify React version compatibility

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**M S K Chaithanya Raj**

- GitHub: [@mskchaithanyaraj](https://github.com/mskchaithanyaraj)

---

## 🙏 Acknowledgments

- Ethereum Foundation
- Truffle Suite
- MetaMask Team
- React Community
- Tailwind CSS Team

---

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Email: mskchaithanyaraj@example.com

---

**Built with ❤️ using Blockchain Technology**
