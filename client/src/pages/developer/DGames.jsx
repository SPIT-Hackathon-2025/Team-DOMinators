import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../../../abi.json';
import { motion } from 'framer-motion';

const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
const CONTRACT_ABI = abi;

const DGames = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  
  // Game States
  const [gameType, setGameType] = useState('');
  const [gameId, setGameId] = useState('');
  const [gameDetails, setGameDetails] = useState(null);
  
  // NFT States
  const [tokenURI, setTokenURI] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [nftPrice, setNftPrice] = useState('');
  const [nftGameId, setNftGameId] = useState('');
  const [nftId, setNftId] = useState('');
  const [nftDetails, setNftDetails] = useState(null);
  const [nftIpfsHash, setNftIpfsHash] = useState('');
  
  // NFT Collection States
  const [allNFTs, setAllNFTs] = useState([]);
  const [groupedNFTs, setGroupedNFTs] = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [gameTypes, setGameTypes] = useState([]);

  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const gameContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        
        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(gameContract);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        
        const userBalance = await gameContract.getUserBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(userBalance));

        await fetchAllNFTs(gameContract);
      }
    };
    initEthers();
  }, []);

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
          forSale: details.forSale
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

  const handleTradeNFT = async (tokenId) => {
    try {
      const tx = await contract.tradeNFT(tokenId);
      await tx.wait();
      alert('NFT traded successfully!');
      await fetchAllNFTs(contract);
    } catch (error) {
      console.error('Error trading NFT:', error);
      alert('Error trading NFT: ' + error.message);
    }
  };

  const uploadGame = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.uploadGame(gameType);
      await tx.wait();
      alert('Game uploaded successfully!');
      setGameType('');
    } catch (error) {
      console.error('Error uploading game:', error);
      alert('Error uploading game');
    }
  };

  const getGameDetails = async (e) => {
    e.preventDefault();
    try {
      const details = await contract.getGameDetails(gameId);
      setGameDetails(details);
    } catch (error) {
      console.error('Error getting game details:', error);
      alert('Error fetching game details');
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.mintNFT(
        tokenURI,
        ipfsHash,
        ethers.utils.parseEther(nftPrice),
        nftGameId
      );
      await tx.wait();
      alert('NFT minted successfully!');
      clearNFTForm();
      await fetchAllNFTs(contract);
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error minting NFT');
    }
  };

  const getNFTDetails = async (e) => {
    e.preventDefault();
    try {
      const details = await contract.nftDetails(nftId);
      const ipfsHash = await contract.getNFTIPFSHash(nftId);
      setNftDetails(details);
      setNftIpfsHash(ipfsHash);
    } catch (error) {
      console.error('Error getting NFT details:', error);
      alert('Error fetching NFT details');
    }
  };

  const clearNFTForm = () => {
    setTokenURI('');
    setIpfsHash('');
    setNftPrice('');
    setNftGameId('');
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300 text-sm mb-1">Wallet Address</p>
              <p className="text-purple-400 font-medium truncate">{account}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm mb-1">Balance</p>
              <p className="text-green-400 font-medium">{balance} ESPX</p>
            </div>
          </div>
        </div>

        <div className="flex mb-6 space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'games' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('games')}
          >
            Games
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'nfts' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('nfts')}
          >
            NFTs
          </motion.button>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6">
          {activeTab === 'games' ? (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-white">Upload Game</h3>
                <form onSubmit={uploadGame} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Game Type"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Upload Game
                  </motion.button>
                </form>
              </div>

              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-white">Get Game Details</h3>
                <form onSubmit={getGameDetails} className="space-y-4">
                  <input
                    type="number"
                    placeholder="Game ID"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Get Details
                  </motion.button>
                </form>
                {gameDetails && (
                  <div className="mt-6 p-4 bg-gray-600/50 rounded-lg shadow-sm">
                    <p className="mb-2 text-gray-300"><span className="font-medium">Game Type:</span> {gameDetails.gameType}</p>
                    <p className="text-gray-300"><span className="font-medium">Developer:</span> {gameDetails.developer}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
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

              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold mb-6 text-white">Mint NFT</h3>
                <form onSubmit={mintNFT} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Token URI"
                    value={tokenURI}
                    onChange={(e) => setTokenURI(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="IPFS Hash"
                    value={ipfsHash}
                    onChange={(e) => setIpfsHash(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price (ESPX)"
                    value={nftPrice}
                    onChange={(e) => setNftPrice(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Game ID"
                    value={nftGameId}
                    onChange={(e) => setNftGameId(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Mint NFT
                  </motion.button>
                </form>
              </div>

              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-white">Get NFT Details</h3>
                <form onSubmit={getNFTDetails} className="space-y-4">
                  <input
                    type="number"
                    placeholder="NFT ID"
                    value={nftId}
                    onChange={(e) => setNftId(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Get Details
                  </motion.button>
                </form>
                {nftDetails && (
                  <div className="mt-6 p-4 bg-gray-600/50 rounded-lg shadow-sm">
                    <p className="mb-2 text-gray-300"><span className="font-medium">Owner:</span> {nftDetails.owner}</p>
                    <p className="mb-2 text-gray-300"><span className="font-medium">Price:</span> {ethers.utils.formatEther(nftDetails.price)} ESPX</p>
                    <p className="mb-2 text-gray-300"><span className="font-medium">For Sale:</span> {nftDetails.forSale ? 'Yes' : 'No'}</p>
                    <p className="mb-2 text-gray-300"><span className="font-medium">Game Type:</span> {nftDetails.gameType}</p>
                    <p className="text-gray-300"><span className="font-medium">IPFS Hash:</span> {nftIpfsHash}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DGames;