import { useState, useEffect } from "react";
import * as web3Provider from "../web3/web3Provider";

/**
 * Wallet Connect Component
 * Reusable MetaMask wallet connection button with status display
 */
const WalletConnect = ({ onConnect, onDisconnect, compact = false }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkWalletStatus();

    // Setup event listeners
    if (web3Provider.isMetaMaskInstalled()) {
      web3Provider.onAccountsChanged(handleAccountsChanged);
      web3Provider.onChainChanged(handleChainChanged);
    }

    return () => {
      web3Provider.removeAllListeners();
    };
  }, []);

  const checkWalletStatus = async () => {
    try {
      const installed = web3Provider.isMetaMaskInstalled();
      setIsMetaMaskInstalled(installed);

      if (installed) {
        const address = await web3Provider.getConnectedAddress();
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);

          const correctNetwork = await web3Provider.isConnectedToGanache();
          setIsCorrectNetwork(correctNetwork);

          if (onConnect) {
            onConnect(address);
          }
        }
      }
    } catch (err) {
      console.error("Error checking wallet status:", err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setWalletAddress(null);
      if (onDisconnect) {
        onDisconnect();
      }
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      if (onConnect) {
        onConnect(accounts[0]);
      }
    }
  };

  const handleChainChanged = async () => {
    const correctNetwork = await web3Provider.isConnectedToGanache();
    setIsCorrectNetwork(correctNetwork);
    if (!correctNetwork) {
      setError("Please switch to Ganache network (Chain ID 1337)");
    } else {
      setError(null);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const address = await web3Provider.connectWallet();
      await web3Provider.switchToGanache();

      setWalletAddress(address);
      setIsConnected(true);
      setIsCorrectNetwork(true);

      if (onConnect) {
        onConnect(address);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setWalletAddress(null);
      setIsConnected(false);
      setIsCorrectNetwork(false);
      setError(null);

      // Call disconnect callback
      if (onDisconnect) {
        onDisconnect();
      }

      // Note: MetaMask doesn't have a direct disconnect method
      // Users need to disconnect from MetaMask directly or switch accounts
    } catch (err) {
      console.error("Error disconnecting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use selectAccount to force account selection dialog
      const address = await web3Provider.selectAccount();
      await web3Provider.switchToGanache();

      setWalletAddress(address);
      setIsConnected(true);
      setIsCorrectNetwork(true);

      if (onConnect) {
        onConnect(address);
      }
    } catch (err) {
      console.error("Error switching account:", err);
      setError(err.message || "Failed to switch account");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      setLoading(true);
      setError(null);
      await web3Provider.switchToGanache();
      setIsCorrectNetwork(true);
    } catch (err) {
      console.error("Error switching network:", err);
      setError(err.message || "Failed to switch network");
    } finally {
      setLoading(false);
    }
  };

  // Compact version (for navbar or small spaces)
  if (compact) {
    if (!isMetaMaskInstalled) {
      return (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg transition-all duration-200 text-caption font-medium hover:scale-105"
          style={{
            background: "var(--clr-gradient-warning)",
            color: "var(--clr-text-on-accent)",
          }}
        >
          Install MetaMask
        </a>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center space-x-2">
          {!isCorrectNetwork && (
            <button
              onClick={handleSwitchNetwork}
              disabled={loading}
              className="px-3 py-2 rounded-lg transition-all duration-200 text-caption font-medium disabled:opacity-50 hover:scale-105"
              style={{
                background: "var(--clr-gradient-warning)",
                color: "var(--clr-text-on-accent)",
              }}
            >
              Switch Network
            </button>
          )}
          <div className="flex items-center space-x-2">
            <div
              className="px-3 py-2 rounded-lg text-caption font-mono backdrop-blur-sm border"
              style={{
                backgroundColor: "var(--clr-success-surface)",
                borderColor: "var(--clr-success-border)",
                color: "var(--clr-success-text)",
              }}
            >
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            <button
              onClick={handleSwitchAccount}
              disabled={loading}
              className="px-2 py-2 rounded-lg transition-all duration-200 text-caption font-medium disabled:opacity-50 hover:scale-105"
              style={{
                background: "var(--clr-gradient-primary)",
                color: "var(--clr-text-on-accent)",
              }}
              title="Switch Account"
            >
              ↻
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-4 py-2 rounded-lg transition-all duration-200 text-caption font-medium disabled:opacity-50 hover:scale-105"
        style={{
          background: "var(--clr-gradient-warning)",
          color: "var(--clr-text-on-accent)",
        }}
      >
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  // Full version (for pages)
  return (
    <div
      className="rounded-xl p-6 backdrop-blur-sm border transition-all duration-300"
      style={{
        backgroundColor: "var(--clr-surface-primary)",
        borderColor: "var(--clr-surface-a10)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h3
        className="text-heading-3 font-medium mb-4 transition-colors duration-300"
        style={{ color: "var(--clr-text-primary)" }}
      >
        Wallet Connection
      </h3>

      {error && (
        <div
          className="mb-4 rounded-lg p-3 border backdrop-blur-sm"
          style={{
            backgroundColor: "var(--clr-error-surface)",
            borderColor: "var(--clr-error-border)",
          }}
        >
          <p
            className="text-caption transition-colors duration-300"
            style={{ color: "var(--clr-error-text)" }}
          >
            {error}
          </p>
        </div>
      )}

      {!isMetaMaskInstalled ? (
        <div
          className="rounded-lg p-4 border backdrop-blur-sm"
          style={{
            backgroundColor: "var(--clr-warning-surface)",
            borderColor: "var(--clr-warning-border)",
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 transition-colors duration-300"
                style={{ color: "var(--clr-warning-primary)" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p
                className="text-caption mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-warning-text)" }}
              >
                MetaMask is not installed. Please install MetaMask to continue.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg transition-all duration-200 font-medium text-caption hover:scale-105"
                style={{
                  background: "var(--clr-gradient-warning)",
                  color: "var(--clr-text-on-accent)",
                }}
              >
                Download MetaMask
              </a>
            </div>
          </div>
        </div>
      ) : isConnected ? (
        <div>
          <div
            className="flex items-center justify-between rounded-lg p-4 mb-4 border backdrop-blur-sm"
            style={{
              backgroundColor: "var(--clr-success-surface)",
              borderColor: "var(--clr-success-border)",
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="rounded-full p-2"
                style={{ backgroundColor: "var(--clr-success-primary)" }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "var(--clr-text-on-accent)" }}
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
                <p
                  className="text-caption-sm transition-colors duration-300"
                  style={{ color: "var(--clr-text-muted)" }}
                >
                  Connected Address
                </p>
                <p
                  className="font-mono text-caption font-medium transition-colors duration-300"
                  style={{ color: "var(--clr-success-text)" }}
                >
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className="px-3 py-1 rounded-full text-caption-sm font-medium"
                style={{
                  backgroundColor: "var(--clr-success-primary)",
                  color: "var(--clr-text-on-accent)",
                }}
              >
                Connected
              </span>
            </div>
          </div>

          {/* Account Management Buttons */}
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleSwitchAccount}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-caption disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--clr-gradient-primary)",
                color: "var(--clr-text-on-accent)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {loading ? "Switching..." : "Switch Account"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-caption disabled:opacity-50 border hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--clr-surface-secondary)",
                borderColor: "var(--clr-surface-a20)",
                color: "var(--clr-text-secondary)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Disconnect
            </button>
          </div>

          {!isCorrectNetwork && (
            <div
              className="rounded-lg p-4 border backdrop-blur-sm"
              style={{
                backgroundColor: "var(--clr-warning-surface)",
                borderColor: "var(--clr-warning-border)",
              }}
            >
              <p
                className="text-caption mb-3 transition-colors duration-300"
                style={{ color: "var(--clr-warning-text)" }}
              >
                You are not connected to the Ganache network. Please switch to
                Chain ID 1337.
              </p>
              <button
                onClick={handleSwitchNetwork}
                disabled={loading}
                className="px-4 py-2 rounded-lg transition-all duration-200 font-medium text-caption disabled:opacity-50 hover:scale-105"
                style={{
                  background: "var(--clr-gradient-warning)",
                  color: "var(--clr-text-on-accent)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {loading ? "Switching..." : "Switch to Ganache"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "var(--clr-gradient-warning)",
            color: "var(--clr-text-on-accent)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
