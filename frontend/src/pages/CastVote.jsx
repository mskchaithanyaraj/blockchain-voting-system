import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api.service";
import * as web3Provider from "../web3/web3Provider";

/**
 * Cast Vote Page
 * Allows voters to select a candidate and cast their vote using MetaMask
 */
const CastVote = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [voterStatus, setVoterStatus] = useState({
    isRegistered: false,
    hasVoted: false,
  });
  const [electionState, setElectionState] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    fetchPageData();
    checkWalletConnection();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch voter status
      const statusResponse = await apiService.getVoterStatus();
      setVoterStatus(statusResponse.data.data);

      // Fetch candidates
      const candidatesResponse = await apiService.getCandidates();
      setCandidates(candidatesResponse.data.data || []);

      // Fetch election state
      const stateResponse = await apiService.getElectionState();
      setElectionState(stateResponse.data.data.state.stateNumber);
    } catch (err) {
      console.error("Error fetching page data:", err);
      setError(err.message || "Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      if (web3Provider.isMetaMaskInstalled()) {
        const address = await web3Provider.getConnectedAddress();
        if (address) {
          setWalletAddress(address);
          setWalletConnected(true);

          // Check if connected to Ganache
          const isGanache = await web3Provider.isConnectedToGanache();
          if (!isGanache) {
            setError(
              "Please switch to Ganache network (Chain ID 1337) in MetaMask"
            );
          }
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setError(null);
      const address = await web3Provider.connectWallet();
      await web3Provider.switchToGanache();
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  const handleVote = async () => {
    if (!selectedCandidateId) {
      setError("Please select a candidate");
      return;
    }

    if (!walletConnected) {
      setError("Please connect your MetaMask wallet first");
      return;
    }

    try {
      setVoting(true);
      setError(null);
      setSuccess(null);
      setTxHash(null);

      // Get contract instance with signer
      const contract = await web3Provider.getContract(false);

      // Cast vote on blockchain
      console.log("Casting vote for candidate:", selectedCandidateId);
      const tx = await contract.castVote(selectedCandidateId);

      console.log("Transaction submitted:", tx.hash);
      setTxHash(tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Update backend (event listener should handle this, but we can also call API)
      try {
        await apiService.castVote({
          candidateId: selectedCandidateId,
          voterPrivateKey: "", // Not needed when using MetaMask
        });
      } catch (apiErr) {
        console.warn(
          "Backend update failed (event listener will handle):",
          apiErr
        );
      }

      setSuccess(
        `Vote cast successfully! Transaction: ${tx.hash.slice(
          0,
          10
        )}...${tx.hash.slice(-8)}`
      );

      // Refresh voter status
      setTimeout(() => {
        fetchPageData();
      }, 2000);
    } catch (err) {
      console.error("Error casting vote:", err);
      let errorMessage = "Failed to cast vote";

      if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected by user";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const canVote = () => {
    return (
      voterStatus.isRegistered &&
      !voterStatus.hasVoted &&
      electionState === 1 &&
      walletConnected &&
      selectedCandidateId !== null
    );
  };

  const getDisabledReason = () => {
    if (!voterStatus.isRegistered) {
      return "You are not registered to vote";
    }
    if (voterStatus.hasVoted) {
      return "You have already voted";
    }
    if (electionState === 0) {
      return "Election has not started yet";
    }
    if (electionState === 2) {
      return "Election has ended";
    }
    if (!walletConnected) {
      return "Please connect your MetaMask wallet";
    }
    if (!selectedCandidateId) {
      return "Please select a candidate";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cast Your Vote
          </h1>
          <p className="text-gray-600">
            Select your preferred candidate and submit your vote
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
                {txHash && (
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-900 underline font-semibold"
                  >
                    View on Block Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Step 1: Connect Wallet
          </h3>
          {!web3Provider.isMetaMaskInstalled() ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">
                MetaMask is not installed. Please install MetaMask to vote.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-yellow-900 underline font-semibold"
              >
                Download MetaMask
              </a>
            </div>
          ) : walletConnected ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Connected Address</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {walletAddress
                      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(
                          -8
                        )}`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Connected
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
            >
              Connect MetaMask
            </button>
          )}
        </div>

        {/* Candidate Selection */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Step 2: Select Candidate
          </h3>
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No candidates available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition duration-200 ${
                    selectedCandidateId === candidate.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidateId === candidate.id}
                    onChange={() => setSelectedCandidateId(candidate.id)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500"
                    disabled={voterStatus.hasVoted || electionState !== 1}
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {candidate.name}
                        </p>
                        <p className="text-gray-600">{candidate.party}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Candidate ID</p>
                        <p className="text-lg font-semibold text-gray-900">
                          #{candidate.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Vote Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Step 3: Submit Vote
          </h3>
          <button
            onClick={handleVote}
            disabled={!canVote() || voting}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition duration-200 ${
              canVote() && !voting
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {voting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting Vote...
              </span>
            ) : (
              "Cast Vote"
            )}
          </button>
          {!canVote() && (
            <p className="mt-3 text-sm text-center text-gray-600">
              {getDisabledReason()}
            </p>
          )}
          {voting && (
            <p className="mt-3 text-sm text-center text-gray-600">
              Please confirm the transaction in MetaMask...
            </p>
          )}
        </div>

        {/* Information Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your vote is recorded on the blockchain
                and cannot be changed once submitted. Make sure you have
                selected the correct candidate before voting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastVote;
