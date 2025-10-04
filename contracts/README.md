# Blockchain Voting System - Smart Contracts

## Overview

This directory contains the Solidity smart contracts for a secure blockchain-based voting system built with Truffle and deployed on Ganache.

## Contract Architecture

### Voting.sol

**Main voting contract with complete election management**

#### Key Features:

- **Admin Controls**: Only admin can add candidates, register voters, start/end elections
- **Election States**: NotStarted → Active → Ended
- **Voter Registration**: Admin registers voters before election starts
- **Vote Casting**: Registered voters can cast one vote during active election
- **Results**: View results after election ends
- **Events**: All major actions emit events for backend tracking

#### Core Functions:

**Admin Functions (only before election starts):**

- `addCandidate(name, party)` - Add a candidate
- `registerVoter(address)` - Register a single voter
- `registerVotersBatch(addresses[])` - Register multiple voters
- `startElection()` - Start the election (requires candidates and voters)
- `endElection()` - End the election (only during active state)
- `changeAdmin(newAdmin)` - Transfer admin rights

**Voter Functions:**

- `castVote(candidateId)` - Cast a vote (only registered voters, only once)

**View Functions (anyone can call):**

- `getCandidate(id)` - Get candidate details
- `getAllCandidates()` - Get all candidates with vote counts
- `getVoter(address)` - Get voter details
- `isVoterRegistered(address)` - Check if voter is registered
- `hasVoterVoted(address)` - Check if voter has voted
- `getElectionState()` - Get complete election state
- `getResults()` - Get final results (only after election ends)

#### Events Emitted:

- `ElectionCreated(name, timestamp)`
- `ElectionStarted(startTime, timestamp)`
- `ElectionEnded(endTime, timestamp)`
- `CandidateAdded(candidateId, name, party)`
- `VoterRegistered(voter, timestamp)`
- `VoteCast(voter, candidateId, timestamp)`
- `AdminChanged(oldAdmin, newAdmin)`

#### Security Features:

- **One Vote Per Address**: Each registered voter can only vote once
- **Access Control**: Admin-only functions for setup and control
- **State Management**: Actions restricted to appropriate election states
- **Address Validation**: Prevents zero addresses and duplicate registrations
- **Vote Privacy**: Voters can see if they voted, but not who they voted for (except themselves)

## Project Structure

```
contracts/
├── contracts/
│   ├── Migrations.sol       # Truffle migrations tracker
│   └── Voting.sol           # Main voting contract
├── migrations/
│   └── 1_initial_migration.js
├── test/                    # Test files (to be added)
├── build/                   # Compiled contracts (gitignored)
├── truffle-config.js        # Truffle configuration
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables (gitignored)
```

## Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Ganache RPC endpoint
ETH_RPC_URL=http://127.0.0.1:7545

# Chain ID (Ganache default)
CHAIN_ID=5777

# Private key of deployer account (get from Ganache)
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Ganache

- Open Ganache UI
- Start the workspace: **OBESE-BALL**
- RPC Server: `http://127.0.0.1:7545`
- Network ID: `5777`

### 3. Get Deployer Private Key

1. In Ganache, click the key icon next to any account
2. Copy the **PRIVATE KEY** (not the mnemonic)
3. Add it to your `.env` file as `DEPLOYER_PRIVATE_KEY`

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Deploy to Ganache

```bash
npm run deploy:ganache
```

### 6. Reset Deployment (if needed)

```bash
npm run deploy:reset
```

## NPM Scripts

- `npm run compile` - Compile contracts
- `npm run deploy:ganache` - Deploy to Ganache network
- `npm run deploy:reset` - Reset and redeploy (clears previous deployments)
- `npm run test` - Run tests
- `npm run console` - Open Truffle console connected to Ganache

## Interacting with Contracts

### Using Truffle Console

```bash
npm run console
```

```javascript
// Get deployed contract instance
const voting = await Voting.deployed();

// Get accounts
const accounts = await web3.eth.getAccounts();
const admin = accounts[0];
const voter1 = accounts[1];
const voter2 = accounts[2];

// Add candidates
await voting.addCandidate("Alice Johnson", "Party A", { from: admin });
await voting.addCandidate("Bob Smith", "Party B", { from: admin });

// Register voters
await voting.registerVoter(voter1, { from: admin });
await voting.registerVoter(voter2, { from: admin });

// Start election
await voting.startElection({ from: admin });

// Cast votes
await voting.castVote(1, { from: voter1 });
await voting.castVote(2, { from: voter2 });

// End election
await voting.endElection({ from: admin });

// Get results
const results = await voting.getResults();
console.log(results);
```

## Viewing Transactions in Ganache

After deploying or interacting with contracts:

1. **Transactions Tab** - See all transactions with:

   - Transaction hash
   - Block number
   - Gas used
   - From/To addresses

2. **Blocks Tab** - See blocks mined with:

   - Block number
   - Transactions included
   - Timestamp

3. **Events Tab** - See contract events emitted:

   - Event name
   - Parameters
   - Transaction hash

4. **Contracts Tab** - See deployed contracts:
   - Contract address
   - Balance
   - Storage

## Gas Costs (Approximate)

- Deploy Voting contract: ~2,500,000 gas
- Add candidate: ~100,000 gas
- Register voter: ~70,000 gas
- Start election: ~50,000 gas
- Cast vote: ~80,000 gas
- End election: ~30,000 gas

## Next Steps

1. ✅ Contracts created and compiled
2. ⏳ Create deployment script
3. ⏳ Deploy to Ganache
4. ⏳ Integrate with backend
5. ⏳ Integrate with frontend

## Security Considerations

- **Admin Key Security**: The admin private key has full control. Keep it secure.
- **Voter Registration**: Only admin can register voters (prevents unauthorized voting)
- **One Vote Rule**: Enforced at smart contract level (cannot be bypassed)
- **Immutable Votes**: Once cast, votes cannot be changed
- **Transparent Results**: Anyone can verify results after election ends
- **Event Logging**: All actions are logged as events for audit trail

## License

MIT
