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
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 text-sm font-semibold"
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
              className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 text-sm font-semibold"
            >
              Switch Network
            </button>
          )}
          <div className="flex items-center space-x-2">
            <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            <button
              onClick={handleSwitchAccount}
              disabled={loading}
              className="px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-semibold"
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
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  // Full version (for pages)
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Wallet Connection
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isMetaMaskInstalled ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
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
              <p className="text-sm text-yellow-800 mb-2">
                MetaMask is not installed. Please install MetaMask to continue.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200 font-semibold text-sm"
              >
                Download MetaMask
              </a>
            </div>
          </div>
        </div>
      ) : isConnected ? (
        <div>
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Connected
              </span>
            </div>
          </div>

          {/* Account Management Buttons */}
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleSwitchAccount}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Switching..." : "Switch Account"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 font-semibold text-sm disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>

          {!isCorrectNetwork && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 mb-3">
                You are not connected to the Ganache network. Please switch to
                Chain ID 1337.
              </p>
              <button
                onClick={handleSwitchNetwork}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-semibold text-sm disabled:opacity-50"
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
          className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200 font-semibold disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
