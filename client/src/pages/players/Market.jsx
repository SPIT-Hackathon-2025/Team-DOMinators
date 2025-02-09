import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import abi from '../../../abi.json'
const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; // Replace with your contract address
const TOKEN_CONTRACT_ADDRESS = "0x005dD250CD4122793E359D438B446524D6c61aA2"; // Replace with your token contract address
const CONTRACT_ABI = abi;
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const Market = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [allNFTs, setAllNFTs] = useState([]);
  const [groupedNFTs, setGroupedNFTs] = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [gameTypes, setGameTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize Ethers and Contracts
  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const gameContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        const tokenContractInstance = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, web3Signer);

        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(gameContract);
        setTokenContract(tokenContractInstance);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const userBalance = await gameContract.getUserBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(userBalance));

        await fetchAllNFTs(gameContract);
      }
    };
    initEthers();
  }, []);

  // Fetch All NFTs
  const fetchAllNFTs = async (contractInstance) => {
    setIsLoading(true);
    try {
      const filter = contractInstance.filters.NFTMinted();
      const events = await contractInstance.queryFilter(filter);

      const nfts = await Promise.all(events.map(async (event) => {
        const { owner, tokenId, tokenURI, ipfsHash, price, gameType } = event.args;
        const currentOwner = await contractInstance.ownerOf(tokenId);
        const details = await contractInstance.nftDetails(tokenId);

        return {
          tokenId: tokenId.toString(),
          owner: currentOwner,
          tokenURI,
          ipfsHash,
          price: ethers.utils.formatEther(price),
          gameType,
          forSale: details.forSale,
        };
      }));

      setAllNFTs(nfts);

      const grouped = nfts.reduce((acc, nft) => {
        if (!acc[nft.gameType]) {
          acc[nft.gameType] = [];
        }
        acc[nft.gameType].push(nft);
        return acc;
      }, {});

      setGroupedNFTs(grouped);
      setGameTypes(['all', ...Object.keys(grouped)]);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
    setIsLoading(false);
  };

  // Handle NFT Trade
  const handleTradeNFT = async (tokenId) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const details = await contract.nftDetails(tokenId);
      if (!details.forSale) {
        throw new Error("This NFT is not for sale");
      }

      const price = details.price;

      // Approve token spending
      const tokenApproval = await tokenContract.approve(CONTRACT_ADDRESS, price);
      await tokenApproval.wait();
      console.log("Token approval successful");

      // Execute trade
      const tradeTx = await contract.tradeNFT(tokenId);
      await tradeTx.wait();
      console.log("Trade successful");

      setSuccess('NFT traded successfully!');
      await fetchAllNFTs(contract);
      await loadTransactionHistory(tokenId);
    } catch (err) {
      setError(err.message);
      console.error("Trade error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Transaction History
  const loadTransactionHistory = async (tokenId) => {
    try {
      const history = await contract.getTransactionHistory(tokenId);
      const validTransactions = history.filter(
        (tx) => tx.from !== ethers.constants.AddressZero && tx.to !== ethers.constants.AddressZero
      );
      setTransactions(validTransactions);
    } catch (err) {
      console.error("History loading error:", err);
      setError("Failed to load transaction history");
    }
  };

  // NFT Card Component
  const NFTCard = ({ nft }) => (
    <motion.div
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-lg font-semibold mb-2 text-white">Token ID: {nft.tokenId}</p>
      <p className="text-sm text-gray-300 truncate mb-1">Owner: {nft.owner}</p>
      <p className="text-sm text-gray-300 mb-1">Price: {nft.price} ESPX</p>
      <p className="text-sm text-gray-300 mb-1">Game Type: {nft.gameType}</p>
      <p className="text-sm text-gray-300 truncate mb-3">IPFS Hash: {nft.ipfsHash}</p>
      {nft.forSale && nft.owner !== account && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTradeNFT(nft.tokenId)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Buy NFT
        </motion.button>
      )}
    </motion.div>
  );

  // Format Address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format Timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        {/* Tabs */}
        <div className="flex mb-6 space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'assets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('assets')}
          >
            Assets
          </motion.button>
        </div>

        {/* Assets Tab Content */}
        {activeTab === 'assets' && (
          <div className="space-y-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {gameTypes.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading NFTs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedType === 'all'
                  ? allNFTs.map((nft) => <NFTCard key={nft.tokenId} nft={nft} />)
                  : groupedNFTs[selectedType]?.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))}
              </div>
            )}

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left font-semibold">From</th>
                        <th className="p-4 text-left font-semibold">To</th>
                        <th className="p-4 text-left font-semibold">Price</th>
                        <th className="p-4 text-left font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="p-4">{formatAddress(tx.from)}</td>
                          <td className="p-4">{formatAddress(tx.to)}</td>
                          <td className="p-4">{ethers.utils.formatEther(tx.price)} ESPX</td>
                          <td className="p-4">{formatTimestamp(tx.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                <p className="font-medium">Success:</p>
                <p>{success}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;