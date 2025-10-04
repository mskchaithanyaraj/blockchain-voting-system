// Import the deployed contract artifacts
import votingContract from "../contracts/voting-contract.json";

// Contract address from deployment
export const CONTRACT_ADDRESS = votingContract.contractAddress;

// Contract ABI (Application Binary Interface)
export const CONTRACT_ABI = votingContract.abi;

// Ganache network configuration
export const GANACHE_NETWORK = {
  chainId: "0x539", // 1337 in hexadecimal
  chainIdDecimal: 1337,
  chainName: "Ganache Local",
  rpcUrl: "http://127.0.0.1:7545",
  blockExplorerUrl: null,
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

// Export default config object
export default {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  network: GANACHE_NETWORK,
};
