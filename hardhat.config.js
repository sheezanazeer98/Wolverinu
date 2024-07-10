require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork:"localhost",
  networks: {
    sepolia: {
      chainId: 11155111,
      url: [process.env.PROVIDER_URL],
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: [process.env.ETHERSCAN_API_KEY]
    }
  }
};