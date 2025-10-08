# 🧪 Testing Guide

Comprehensive testing guide for the Blockchain Voting System.

---

## Table of Contents

1. [Setup Testing Environment](#setup-testing-environment)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Manual Testing Scenarios](#manual-testing-scenarios)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)

---

## 1. Setup Testing Environment

### Prerequisites

- Ganache running on port 7545
- MongoDB test database
- Backend server on port 5000
- Frontend on port 5173
- MetaMask configured

### Test Data Setup

```bash
# Start Ganache
# Note: Use Ganache GUI for easier account management

# Deploy fresh contract
cd contracts
truffle migrate --reset --network development

# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev
```

---

## 2. Unit Testing

### Smart Contract Unit Tests

File: `contracts/test/Voting.test.js`

```javascript
const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  let votingInstance;
  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];

  beforeEach(async () => {
    votingInstance = await Voting.new({ from: admin });
  });

  describe("Candidate Management", () => {
    it("should add candidate", async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.name, "Alice");
      assert.equal(candidate.party, "Party A");
    });

    it("should reject non-admin adding candidate", async () => {
      try {
        await votingInstance.addCandidate("Bob", "Party B", { from: voter1 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Only admin"));
      }
    });
  });

  describe("Voter Registration", () => {
    it("should register voter", async () => {
      await votingInstance.registerVoter(voter1, { from: admin });
      const voterStatus = await votingInstance.getVoterStatus(voter1);
      assert.equal(voterStatus.isRegistered, true);
      assert.equal(voterStatus.hasVoted, false);
    });

    it("should prevent duplicate registration", async () => {
      await votingInstance.registerVoter(voter1, { from: admin });
      try {
        await votingInstance.registerVoter(voter1, { from: admin });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Already registered"));
      }
    });
  });

  describe("Voting", () => {
    beforeEach(async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection("Test Election", { from: admin });
    });

    it("should allow registered voter to vote", async () => {
      await votingInstance.castVote(1, { from: voter1 });
      const voterStatus = await votingInstance.getVoterStatus(voter1);
      assert.equal(voterStatus.hasVoted, true);

      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.voteCount.toNumber(), 1);
    });

    it("should prevent voting twice", async () => {
      await votingInstance.castVote(1, { from: voter1 });
      try {
        await votingInstance.castVote(1, { from: voter1 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Already voted"));
      }
    });

    it("should prevent unregistered voter from voting", async () => {
      try {
        await votingInstance.castVote(1, { from: voter2 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Not registered"));
      }
    });
  });

  describe("Election Management", () => {
    it("should start election", async () => {
      await votingInstance.startElection("Test Election", { from: admin });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 1); // Active
    });

    it("should end election", async () => {
      await votingInstance.startElection("Test Election", { from: admin });
      await votingInstance.endElection({ from: admin });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 2); // Ended
    });
  });
});
```

Run contract tests:

```bash
cd contracts
truffle test
```

## 3. End-to-End Testing

### Manual E2E Test Script

Follow this complete workflow:

#### Test Case 1: Complete Admin Workflow

**Objective**: Verify admin can manage entire election

**Steps**:

1. Open http://localhost:5173
2. Click "Register"
3. Fill form:
   - Name: Admin Test
   - Email: admin@test.com
   - Address: 0x446995e992d953A6C56e8bABFBe3C5E21AcfF927 (from Ganache)
   - Password: Test123!
   - Role: Administrator
4. Click "Create Account"
5. Should auto-login and redirect to /admin/dashboard

**Expected Results**:

- ✅ Registration successful
- ✅ Auto-login works
- ✅ Redirected to admin dashboard
- ✅ Dashboard shows statistics (0 candidates, 0 voters, etc.)

---

#### Test Case 2: Add Candidates

**Steps**:

1. Navigate to "Candidates" page
2. Add Candidate 1:
   - Name: Alice Johnson
   - Party: Democratic Party
   - Click "Add Candidate"
3. Add Candidate 2:
   - Name: Bob Smith
   - Party: Republican Party
   - Click "Add Candidate"
4. Add Candidate 3:
   - Name: Carol White
   - Party: Independent
   - Click "Add Candidate"

**Expected Results**:

- ✅ Each candidate appears in the list immediately
- ✅ Success message shows
- ✅ Candidate cards display name, party, ID, and vote count (0)
- ✅ Dashboard updates to show 3 candidates

---

#### Test Case 3: Register Voters

**Steps**:

1. Navigate to "Voters" page
2. Copy 5 addresses from Ganache (accounts 1-5)
3. In "Batch Registration" section:
   - Paste addresses (one per line)
   - Click "Register All Voters"
4. Wait for confirmation

**Expected Results**:

- ✅ Success message shows "5 voters registered"
- ✅ Voters appear in list
- ✅ Each voter shows "Registered" status
- ✅ Dashboard updates to show 5 registered voters

---

#### Test Case 4: Start Election

**Steps**:

1. Navigate to "Election" page
2. Review election status (should be "Not Started")
3. Click "Start Election"
4. Confirm in modal
5. Wait for blockchain transaction

**Expected Results**:

- ✅ Confirmation modal appears
- ✅ Transaction processes successfully
- ✅ Status changes to "Active"
- ✅ Election name displays
- ✅ "Start Election" button disappears
- ✅ "End Election" button appears (but should be disabled until votes cast)

---

#### Test Case 5: Voter Registration and Login

**Steps**:

1. Logout (top right)
2. Click "Register"
3. Fill form:
   - Name: Voter Test
   - Email: voter1@test.com
   - Address: (use account 1 from Ganache - must match registered address)
   - Password: Voter123!
   - Role: Voter
4. Click "Create Account"
5. Should auto-login and redirect to /voter/dashboard

**Expected Results**:

- ✅ Registration successful
- ✅ Auto-login works
- ✅ Redirected to voter dashboard
- ✅ Dashboard shows:
  - Registration Status: Registered ✅
  - Voting Status: Not Voted
  - Total Candidates: 3
  - Election Status: Active

---

#### Test Case 6: MetaMask Connection

**Steps**:

1. On Voter Dashboard
2. MetaMask section should show "Connect MetaMask" button
3. Click "Connect MetaMask"
4. MetaMask popup opens
5. Select the account matching voter's registered address
6. Click "Connect"
7. If network wrong, MetaMask prompts to switch
8. Click "Switch Network"

**Expected Results**:

- ✅ MetaMask connects successfully
- ✅ Connected address displays (shortened format)
- ✅ Green checkmark shows "Connected"
- ✅ Ganache network active in MetaMask
- ✅ "Cast Your Vote" button becomes enabled

---

#### Test Case 7: Cast Vote

**Steps**:

1. Click "Cast Your Vote" (or navigate to /voter/vote)
2. Review all 3 candidates
3. Select "Alice Johnson" (radio button)
4. Click "Cast Vote" button
5. MetaMask popup opens
6. Review transaction details:
   - Gas fee shown
   - Contract address shown
7. Click "Confirm" in MetaMask
8. Wait for transaction confirmation (5-10 seconds)

**Expected Results**:

- ✅ Loading spinner shows "Submitting Vote..."
- ✅ MetaMask popup appears correctly
- ✅ Transaction confirms
- ✅ Success message shows with transaction hash
- ✅ Page updates showing "You have already voted"
- ✅ "Cast Vote" button becomes disabled
- ✅ Dashboard updates: Voting Status shows "Voted" with candidate ID

---

#### Test Case 8: Vote Multiple Voters

**Objective**: Test with 3-5 different voters

**Steps**:

1. Logout
2. Register and login as voter2@test.com (use account 2 from Ganache)
3. Connect MetaMask (switch account in MetaMask)
4. Cast vote for "Bob Smith"
5. Repeat for voters 3, 4, 5 (mix of votes for different candidates)

**Expected Results**:

- ✅ Each voter can vote once
- ✅ Votes recorded on blockchain
- ✅ Backend syncs automatically via event listeners
- ✅ Dashboard shows updated vote counts

---

#### Test Case 9: Prevent Double Voting

**Steps**:

1. As voter who already voted
2. Try to navigate to /voter/vote
3. Try to vote again

**Expected Results**:

- ✅ Page shows "You have already voted"
- ✅ Vote button disabled
- ✅ Clear message: "You have already cast your vote"

---

#### Test Case 10: Unregistered Voter Cannot Vote

**Steps**:

1. Logout
2. Register as voter (use address NOT registered by admin)
3. Login
4. Try to vote

**Expected Results**:

- ✅ Dashboard shows "Registration Status: Not Registered"
- ✅ "Cast Your Vote" button disabled
- ✅ Message: "You are not registered to vote"

---

#### Test Case 11: End Election

**Steps**:

1. Logout
2. Login as admin@test.com
3. Navigate to "Election" page
4. Click "End Election"
5. Confirm in modal
6. Wait for blockchain transaction

**Expected Results**:

- ✅ Confirmation modal appears
- ✅ Transaction processes
- ✅ Status changes to "Ended"
- ✅ Results section becomes visible
- ✅ Winner announcement shows (candidate with most votes)
- ✅ All vote counts displayed
- ✅ Percentages calculated correctly

---

#### Test Case 12: View Results (Admin)

**Steps**:

1. On Election page after ending
2. Review results section

**Expected Results**:

- ✅ Winner banner shows (gold gradient)
- ✅ Winner name, party, vote count, percentage
- ✅ All candidates listed in descending order by votes
- ✅ Progress bars show vote percentages
- ✅ Total votes matches sum of all candidate votes

---

#### Test Case 13: View Results (Voter)

**Steps**:

1. Logout
2. Login as voter
3. Navigate to "Results" page

**Expected Results**:

- ✅ Same results visible to voters
- ✅ Winner announcement
- ✅ Vote counts and percentages
- ✅ Rankings displayed

---

#### Test Case 14: Results Not Available Before Election Ends

**Steps**:

1. Start new election (don't end it)
2. As voter, navigate to /voter/results

**Expected Results**:

- ✅ Page shows "Results Not Available"
- ✅ Message: "Election is currently active"
- ✅ "Refresh Status" button available

---

## 5. Performance Testing

### Load Testing Scenarios

#### Scenario 1: Multiple Concurrent Voters

**Setup**:

- Register 20 voters
- Start election

**Test**:

- Have 20 voters vote simultaneously
- Measure: Transaction processing time, database updates

**Expected**:

- All votes processed successfully
- No race conditions
- Event listeners sync all votes

#### Scenario 2: Large Number of Candidates

**Setup**:

- Add 50 candidates

**Test**:

- Measure page load time
- Check candidate list rendering
- Vote casting performance

**Expected**:

- Page loads in < 2 seconds
- Smooth scrolling
- Vote submission works correctly

---

## 6. Security Testing

### Security Test Cases

#### Test Case 1: SQL Injection Prevention

**Test**:

```javascript
// Try to inject in login
POST /api/auth/login
{
  "email": "admin@test.com' OR '1'='1",
  "password": "anything"
}
```

**Expected**: ❌ Login fails, no SQL injection

#### Test Case 2: XSS Prevention

**Test**:

```javascript
// Try to inject script in candidate name
POST /api/admin/add-candidate
{
  "name": "<script>alert('XSS')</script>",
  "party": "Test"
}
```

**Expected**: ❌ Script not executed, sanitized input

#### Test Case 3: JWT Token Validation

**Test**:

```javascript
// Try to access admin route with voter token
GET /api/admin/candidates
Authorization: Bearer <voter-token>
```

**Expected**: ❌ 403 Forbidden, role-based access works

#### Test Case 4: Unauthorized Contract Calls

**Test**:

- Try to call admin functions from non-admin account
- Try to vote from unregistered address

**Expected**: ❌ Smart contract rejects, only authorized users can call

---

## 7. Testing Checklist

### Pre-Release Testing

#### ✅ Functionality

- [ ] User registration works
- [ ] Login/logout works
- [ ] Admin can add candidates
- [ ] Admin can register voters
- [ ] Admin can start election
- [ ] Voters can cast votes
- [ ] Admin can end election
- [ ] Results display correctly
- [ ] MetaMask integration works
- [ ] Network switching works

#### ✅ Security

- [ ] Authentication required for protected routes
- [ ] Role-based access control enforced
- [ ] JWT tokens expire correctly
- [ ] Passwords hashed
- [ ] Input validation works
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Smart contract access control enforced

#### ✅ Performance

- [ ] Pages load in < 3 seconds
- [ ] Transactions process within 30 seconds
- [ ] No memory leaks
- [ ] Event listeners don't cause lag
- [ ] Database queries optimized

#### ✅ User Experience

- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Success notifications appear
- [ ] Forms validate input
- [ ] Responsive on mobile
- [ ] Navigation intuitive
- [ ] Buttons disabled when appropriate

#### ✅ Edge Cases

- [ ] Handles network disconnection
- [ ] Handles MetaMask rejection
- [ ] Handles invalid addresses
- [ ] Handles duplicate votes
- [ ] Handles unregistered voters
- [ ] Handles election state changes

---

## Test Results Template

```
Test Date: YYYY-MM-DD
Tester: Name
Environment: Development/Production

Test Case: [Name]
Status: ✅ Pass / ❌ Fail
Details: [Description]
Issues Found: [List any issues]
Screenshots: [If applicable]

Performance Metrics:
- Page Load: X seconds
- Transaction Time: Y seconds
- API Response: Z ms

Browser Compatibility:
- Chrome: ✅
- Firefox: ✅
- Safari: ✅
- Edge: ✅

Mobile Compatibility:
- iOS: ✅
- Android: ✅
```

---

## Reporting Bugs

When reporting bugs, include:

1. Test case being executed
2. Expected behavior
3. Actual behavior
4. Steps to reproduce
5. Screenshots/videos
6. Console logs
7. Network tab (if API issue)
8. Environment details

---

**Happy Testing! 🧪**
