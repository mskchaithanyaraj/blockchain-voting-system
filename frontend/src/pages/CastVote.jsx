import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Wallet,
  Vote,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: "var(--clr-background-primary)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
            style={{
              border: "4px solid var(--clr-surface-primary)",
              borderTop: "4px solid var(--clr-text-primary)",
            }}
          ></div>
          <p style={{ color: "var(--clr-text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--clr-background-primary)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Cast Your Vote
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Select your preferred candidate and submit your vote
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 rounded-lg p-4 border"
            style={{
              backgroundColor: "var(--clr-error-surface)",
              borderColor: "var(--clr-error-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle
                  className="h-5 w-5"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="mb-6 rounded-lg p-4 border"
            style={{
              backgroundColor: "var(--clr-success-surface)",
              borderColor: "var(--clr-success-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle
                  className="h-5 w-5"
                  style={{
                    color: "var(--clr-success-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-success-text)",
                  }}
                >
                  {success}
                </p>
                {txHash && (
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline font-semibold flex items-center mt-1"
                    style={{ color: "var(--clr-success-text)" }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Block Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div
          className="mb-6 rounded-lg shadow-md p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Step 1: Connect Wallet
          </h3>
          {!web3Provider.isMetaMaskInstalled() ? (
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--clr-warning-surface)",
                borderColor: "var(--clr-warning-border)",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-warning-text)",
                }}
              >
                MetaMask is not installed. Please install MetaMask to vote.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline font-semibold flex items-center"
                style={{ color: "var(--clr-warning-text)" }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Download MetaMask
              </a>
            </div>
          ) : walletConnected ? (
            <div
              className="flex items-center justify-between rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--clr-success-surface)",
                borderColor: "var(--clr-success-border)",
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: "var(--clr-success-primary)",
                  }}
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--clr-text-tertiary)",
                    }}
                  >
                    Connected Address
                  </p>
                  <p
                    className="font-mono text-sm font-semibold"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    {walletAddress
                      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(
                          -8
                        )}`
                      : ""}
                  </p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: "var(--clr-success-primary)",
                  color: "white",
                }}
              >
                Connected
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="w-full px-6 py-3 rounded-lg transition duration-200 font-semibold flex items-center justify-center"
              style={{
                backgroundColor: "var(--clr-primary-a10)",
                color: "var(--clr-text-inverse)",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect MetaMask
            </button>
          )}
        </div>

        {/* Candidate Selection */}
        <div
          className="mb-6 rounded-lg shadow-md p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Step 2: Select Candidate
          </h3>
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: "var(--clr-text-secondary)" }}>
                No candidates available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition duration-200"
                  style={{
                    borderColor:
                      selectedCandidateId === candidate.id
                        ? "var(--clr-success-primary)"
                        : "var(--clr-surface-a20)",
                    backgroundColor:
                      selectedCandidateId === candidate.id
                        ? "var(--clr-success-surface)"
                        : "var(--clr-surface-a10)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCandidateId !== candidate.id) {
                      e.target.style.borderColor = "var(--clr-surface-a30)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCandidateId !== candidate.id) {
                      e.target.style.borderColor = "var(--clr-surface-a20)";
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidateId === candidate.id}
                    onChange={() => setSelectedCandidateId(candidate.id)}
                    className="h-5 w-5 focus:ring-2"
                    style={{
                      accentColor: "var(--clr-success-primary)",
                    }}
                    disabled={voterStatus.hasVoted || electionState !== 1}
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-lg font-bold"
                          style={{
                            color: "var(--clr-text-primary)",
                          }}
                        >
                          {candidate.name}
                        </p>
                        <p style={{ color: "var(--clr-text-secondary)" }}>
                          {candidate.party}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-sm"
                          style={{
                            color: "var(--clr-text-tertiary)",
                          }}
                        >
                          Candidate ID
                        </p>
                        <p
                          className="text-lg font-semibold"
                          style={{
                            color: "var(--clr-text-primary)",
                          }}
                        >
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
        <div
          className="rounded-lg shadow-md p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Step 3: Submit Vote
          </h3>
          <button
            onClick={handleVote}
            disabled={!canVote() || voting}
            className="w-full py-4 px-6 rounded-lg font-bold text-lg transition duration-200 flex items-center justify-center"
            style={{
              backgroundColor:
                canVote() && !voting
                  ? "var(--clr-success-primary)"
                  : "var(--clr-surface-a40)",
              color:
                canVote() && !voting
                  ? "var(--clr-text-inverse)"
                  : "var(--clr-text-tertiary)",
              cursor: canVote() && !voting ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (canVote() && !voting) {
                e.target.style.opacity = "0.9";
              }
            }}
            onMouseLeave={(e) => {
              if (canVote() && !voting) {
                e.target.style.opacity = "1";
              }
            }}
          >
            {voting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                Submitting Vote...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Vote className="h-6 w-6 mr-3" />
                Cast Vote
              </span>
            )}
          </button>
          {!canVote() && (
            <p
              className="mt-3 text-sm text-center"
              style={{
                color: "var(--clr-text-secondary)",
              }}
            >
              {getDisabledReason()}
            </p>
          )}
          {voting && (
            <p
              className="mt-3 text-sm text-center"
              style={{
                color: "var(--clr-text-secondary)",
              }}
            >
              Please confirm the transaction in MetaMask...
            </p>
          )}
        </div>

        {/* Information Box */}
        <div
          className="mt-6 rounded-lg p-4 border"
          style={{
            backgroundColor: "rgba(33, 73, 138, 0.1)",
            borderColor: "rgba(33, 73, 138, 0.2)",
          }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <Info
                className="h-5 w-5"
                style={{
                  color: "var(--clr-info-a0)",
                }}
              />
            </div>
            <div className="ml-3">
              <p
                className="text-sm"
                style={{
                  color: "var(--clr-info-a0)",
                }}
              >
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
