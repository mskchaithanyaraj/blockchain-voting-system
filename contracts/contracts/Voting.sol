// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @dev Main voting contract with admin controls and election state management
 */
contract Voting {
    // Admin address
    address public admin;
    
    // Election state
    enum ElectionState { NotStarted, Active, Ended }
    ElectionState public electionState;
    
    // Election metadata
    string public electionName;
    uint256 public startTime;
    uint256 public endTime;
    
    // Candidate structure
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool exists;
    }
    
    // Voter structure
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 registrationTime;
    }
    
    // Mappings
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;
    
    // Counters
    uint256 public candidateCount;
    uint256 public totalVotes;
    uint256 public registeredVoterCount;
    
    // Events
    event ElectionCreated(string name, uint256 timestamp);
    event ElectionStarted(uint256 startTime, uint256 timestamp);
    event ElectionEnded(uint256 endTime, uint256 timestamp);
    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(address indexed voter, uint256 timestamp);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier whenNotStarted() {
        require(electionState == ElectionState.NotStarted, "Election has already started");
        _;
    }
    
    modifier whenActive() {
        require(electionState == ElectionState.Active, "Election is not active");
        _;
    }
    
    modifier whenEnded() {
        require(electionState == ElectionState.Ended, "Election has not ended");
        _;
    }
    
    /**
     * @dev Constructor sets the deployer as admin
     */
    constructor(string memory _electionName) {
        admin = msg.sender;
        electionName = _electionName;
        electionState = ElectionState.NotStarted;
        emit ElectionCreated(_electionName, block.timestamp);
    }
    
    /**
     * @dev Add a candidate (only admin, only before election starts)
     */
    function addCandidate(string memory _name, string memory _party) 
        public 
        onlyAdmin 
        whenNotStarted 
        returns (uint256) 
    {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        require(bytes(_party).length > 0, "Party name cannot be empty");
        
        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            voteCount: 0,
            exists: true
        });
        
        emit CandidateAdded(candidateCount, _name, _party);
        return candidateCount;
    }
    
    /**
     * @dev Register a voter (only admin, only before election starts)
     */
    function registerVoter(address _voterAddress) 
        public 
        onlyAdmin 
        whenNotStarted 
    {
        require(_voterAddress != address(0), "Invalid voter address");
        require(!voters[_voterAddress].isRegistered, "Voter already registered");
        
        voters[_voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedCandidateId: 0,
            registrationTime: block.timestamp
        });
        
        registeredVoterCount++;
        emit VoterRegistered(_voterAddress, block.timestamp);
    }
    
    /**
     * @dev Register multiple voters in batch (only admin, only before election starts)
     */
    function registerVotersBatch(address[] memory _voterAddresses) 
        public 
        onlyAdmin 
        whenNotStarted 
    {
        for (uint256 i = 0; i < _voterAddresses.length; i++) {
            address voterAddr = _voterAddresses[i];
            if (voterAddr != address(0) && !voters[voterAddr].isRegistered) {
                voters[voterAddr] = Voter({
                    isRegistered: true,
                    hasVoted: false,
                    votedCandidateId: 0,
                    registrationTime: block.timestamp
                });
                registeredVoterCount++;
                emit VoterRegistered(voterAddr, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Start the election (only admin)
     */
    function startElection() public onlyAdmin whenNotStarted {
        require(candidateCount > 0, "Cannot start election without candidates");
        require(registeredVoterCount > 0, "Cannot start election without registered voters");
        
        electionState = ElectionState.Active;
        startTime = block.timestamp;
        
        emit ElectionStarted(startTime, block.timestamp);
    }
    
    /**
     * @dev End the election (only admin)
     */
    function endElection() public onlyAdmin whenActive {
        electionState = ElectionState.Ended;
        endTime = block.timestamp;
        
        emit ElectionEnded(endTime, block.timestamp);
    }
    
    /**
     * @dev Cast a vote (only registered voters, only during active election)
     */
    function castVote(uint256 _candidateId) public whenActive {
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        require(candidates[_candidateId].exists, "Invalid candidate");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }
    
    /**
     * @dev Get candidate details
     */
    function getCandidate(uint256 _candidateId) 
        public 
        view 
        returns (
            uint256 id,
            string memory name,
            string memory party,
            uint256 voteCount,
            bool exists
        ) 
    {
        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.voteCount,
            candidate.exists
        );
    }
    
    /**
     * @dev Get all candidates
     */
    function getAllCandidates() 
        public 
        view 
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            uint256[] memory voteCounts
        ) 
    {
        ids = new uint256[](candidateCount);
        names = new string[](candidateCount);
        parties = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            Candidate memory candidate = candidates[i];
            ids[i - 1] = candidate.id;
            names[i - 1] = candidate.name;
            parties[i - 1] = candidate.party;
            voteCounts[i - 1] = candidate.voteCount;
        }
        
        return (ids, names, parties, voteCounts);
    }
    
    /**
     * @dev Get voter details
     */
    function getVoter(address _voterAddress) 
        public 
        view 
        returns (
            bool isRegistered,
            bool hasVoted,
            uint256 votedCandidateId,
            uint256 registrationTime
        ) 
    {
        Voter memory voter = voters[_voterAddress];
        return (
            voter.isRegistered,
            voter.hasVoted,
            voter.votedCandidateId,
            voter.registrationTime
        );
    }
    
    /**
     * @dev Check if voter has voted (privacy-preserving)
     */
    function hasVoterVoted(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].hasVoted;
    }
    
    /**
     * @dev Check if voter is registered
     */
    function isVoterRegistered(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].isRegistered;
    }
    
    /**
     * @dev Get election results (only after election ends)
     */
    function getResults() 
        public 
        view 
        whenEnded
        returns (
            uint256[] memory candidateIds,
            string[] memory candidateNames,
            uint256[] memory voteCounts,
            uint256 totalVotesCast
        ) 
    {
        return (
            getAllCandidatesIds(),
            getAllCandidatesNames(),
            getAllCandidatesVoteCounts(),
            totalVotes
        );
    }
    
    /**
     * @dev Get election state
     */
    function getElectionState() 
        public 
        view 
        returns (
            string memory name,
            ElectionState state,
            uint256 _candidateCount,
            uint256 _registeredVoterCount,
            uint256 _totalVotes,
            uint256 _startTime,
            uint256 _endTime
        ) 
    {
        return (
            electionName,
            electionState,
            candidateCount,
            registeredVoterCount,
            totalVotes,
            startTime,
            endTime
        );
    }
    
    /**
     * @dev Change admin (only current admin)
     */
    function changeAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        require(_newAdmin != admin, "New admin is same as current admin");
        
        address oldAdmin = admin;
        admin = _newAdmin;
        
        emit AdminChanged(oldAdmin, _newAdmin);
    }
    
    // Internal helper functions
    function getAllCandidatesIds() internal view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            ids[i - 1] = candidates[i].id;
        }
        return ids;
    }
    
    function getAllCandidatesNames() internal view returns (string[] memory) {
        string[] memory names = new string[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            names[i - 1] = candidates[i].name;
        }
        return names;
    }
    
    function getAllCandidatesVoteCounts() internal view returns (uint256[] memory) {
        uint256[] memory voteCounts = new uint256[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            voteCounts[i - 1] = candidates[i].voteCount;
        }
        return voteCounts;
    }
}
