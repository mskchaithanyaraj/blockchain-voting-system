require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // Development network for Ganache
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777", // Match Ganache network ID
      gas: 6721975,
      gasPrice: 20000000000, // 20 gwei
      from: undefined, // Will use the first account from provider
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [process.env.DEPLOYER_PRIVATE_KEY],
          providerOrUrl: process.env.ETH_RPC_URL || "http://127.0.0.1:7545",
          numberOfAddresses: 1,
          shareNonce: true,
          derivationPath: "m/44'/60'/0'/0/",
        });
      },
    },

    // Development network (Truffle's built-in) - Configured for Ganache
    development: {
      host: "127.0.0.1",
      port: 7545, // Changed from 8545 to 7545 to match Ganache
      network_id: "5777", // Match Ganache network ID
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },

  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "paris", // Compatible with Ganache
      },
    },
  },

  // Directory structure
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts",
  migrations_directory: "./migrations",
  test_directory: "./test",

  // Plugins
  plugins: [],
};
