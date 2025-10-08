import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  GANACHE_NETWORK,
} from "./contractConfig";

/**
 * Check if MetaMask is installed
 * @returns {boolean} True if MetaMask is available
 */
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== "undefined";
};

/**
 * Get the Web3 provider from MetaMask
 * @returns {ethers.BrowserProvider} Web3 provider instance
 * @throws {Error} If MetaMask is not installed
 */
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to use this application."
    );
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get the signer (connected wallet) from MetaMask
 * @returns {Promise<ethers.JsonRpcSigner>} Signer instance
 * @throws {Error} If MetaMask is not installed or user rejects connection
 */
export const getSigner = async () => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return signer;
};

/**
 * Connect to MetaMask and request account access
 * @returns {Promise<string>} Connected wallet address
 * @throws {Error} If connection fails or user rejects
 */
export const connectWallet = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask extension."
      );
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Please create an account in MetaMask."
      );
    }

    const address = accounts[0];
    console.log("Connected to wallet:", address);
    return address;
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    if (error.code === 4001) {
      throw new Error("User rejected the connection request.");
    }
    throw error;
  }
};

/**
 * Force MetaMask to show account selection dialog
 * @returns {Promise<string>} Selected wallet address
 * @throws {Error} If connection fails or user rejects
 */
export const selectAccount = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask extension."
      );
    }

    // Use wallet_requestPermissions to force account selection
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    // Then get the selected accounts
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Please create an account in MetaMask."
      );
    }

    const address = accounts[0];
    console.log("Selected account:", address);
    return address;
  } catch (error) {
    console.error("Error selecting account:", error);
    if (error.code === 4001) {
      throw new Error("User rejected the account selection.");
    }
    throw error;
  }
};

/**
 * Get the currently connected wallet address
 * @returns {Promise<string|null>} Wallet address or null if not connected
 */
export const getConnectedAddress = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }

    const provider = getProvider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    console.error("Error getting connected address:", error);
    return null;
  }
};

/**
 * Get the voting contract instance with signer
 * @param {boolean} readOnly - If true, returns contract with provider only (for read operations)
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export const getContract = async (readOnly = false) => {
  try {
    if (readOnly) {
      const provider = getProvider();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } else {
      const signer = await getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw new Error(
      "Failed to initialize contract. Please ensure MetaMask is connected."
    );
  }
};

/**
 * Switch MetaMask network to Ganache
 * @returns {Promise<boolean>} True if network switch successful
 * @throws {Error} If network switch fails
 */
export const switchToGanache = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed.");
    }

    // Try to switch to Ganache network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_NETWORK.chainId }],
    });

    console.log("Switched to Ganache network");
    return true;
  } catch (error) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: GANACHE_NETWORK.chainId,
              chainName: GANACHE_NETWORK.chainName,
              rpcUrls: [GANACHE_NETWORK.rpcUrl],
              nativeCurrency: GANACHE_NETWORK.nativeCurrency,
            },
          ],
        });
        console.log("Ganache network added and switched");
        return true;
      } catch (addError) {
        console.error("Error adding Ganache network:", addError);
        throw new Error("Failed to add Ganache network to MetaMask.");
      }
    } else {
      console.error("Error switching to Ganache network:", error);
      throw new Error("Failed to switch to Ganache network.");
    }
  }
};

/**
 * Get the current network/chain ID
 * @returns {Promise<number>} Chain ID
 */
export const getCurrentChainId = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch (error) {
    console.error("Error getting chain ID:", error);
    throw error;
  }
};

/**
 * Check if connected to Ganache network
 * @returns {Promise<boolean>} True if connected to Ganache
 */
export const isConnectedToGanache = async () => {
  try {
    const chainId = await getCurrentChainId();
    return chainId === GANACHE_NETWORK.chainIdDecimal;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

/**
 * Get account balance in ETH
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in ETH
 */
export const getBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

/**
 * Listen for account changes in MetaMask
 * @param {Function} callback - Callback function to handle account change
 */
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      console.log("MetaMask is locked or no accounts available");
      callback(null);
    } else {
      console.log("Account changed to:", accounts[0]);
      callback(accounts[0]);
    }
  });
};

/**
 * Listen for network changes in MetaMask
 * @param {Function} callback - Callback function to handle network change
 */
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  window.ethereum.on("chainChanged", (chainId) => {
    console.log("Network changed to:", chainId);
    callback(parseInt(chainId, 16));
  });
};

/**
 * Remove all MetaMask event listeners
 */
export const removeAllListeners = () => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
};

export default {
  isMetaMaskInstalled,
  getProvider,
  getSigner,
  connectWallet,
  selectAccount,
  getConnectedAddress,
  getContract,
  switchToGanache,
  getCurrentChainId,
  isConnectedToGanache,
  getBalance,
  onAccountsChanged,
  onChainChanged,
  removeAllListeners,
};
