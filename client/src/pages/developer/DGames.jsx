import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../../../abi.json';
import details from '../../assets/details.jpg';
import upload from '../../assets/upload.png';
import { motion } from 'framer-motion';
import axios from 'axios';
import TransactionHistory from '../TransactionHistory';
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

  // Image Upload States
  const [nftImage, setNftImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNftImage(file);
    setUploadError('');
    setUploadingImage(true);

    try {
      const fileData = new FormData();
      fileData.append("file", file);

      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRETKEY,
          "Content-Type": "multipart/form-data",
        },
      });

      const ipfsHash = response.data.IpfsHash;
      setIpfsHash(ipfsHash);
    } catch (error) {
      console.error('IPFS upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.mintNFT(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`, // Use the IPFS URL as the tokenURI
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
    setNftImage(null);
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
                ? 'bg-purple-600 from-purple-600 to-pink-600 text-white shadow-md' 
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
                ? 'bg-purple-600 from-purple-600 to-pink-600 text-white shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('nfts')}
          >
            Assets
          </motion.button>
        </div>

        <div className=" rounded-xl shadow-lg p-6">
          {activeTab === 'games' ? (
             <div className="space-y-1 max-w-6xl mx-auto px-4">
             {/* Top Section */}
             <div className="flex gap-8 items-start">
               {/* Left Image */}
               <div className="w-1/3">
                 <div className="aspect-square  rounded-lg flex items-center justify-center">
                   <img 
                     src={upload}
                     alt="Game Preview" 
                     className="rounded-lg object-cover"
                   />
                 </div>
               </div>
       
               {/* Upload Game Form */}
               <div className="flex-1 mt-28">
                 <h3 className="text-lg font-semibold mb-4">Upload Game</h3>
                 <form onSubmit={uploadGame} className="space-y-4">
                   <input
                     type="text"
                     placeholder="Game Type"
                     value={gameType}
                     onChange={(e) => setGameType(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   <button
                     type="submit"
                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                   >
                     Upload Game
                   </button>
                 </form>
               </div>
             </div>
       
             {/* Bottom Section */}
             <div className="flex gap-8 items-start">
               {/* Get Game Details Form */}
               <div className="flex-1 mt-18">
                 <h3 className="text-lg font-semibold mb-4">Get Game Details</h3>
                 <form onSubmit={getGameDetails} className="space-y-4">
                   <input
                     type="number"
                     placeholder="Game ID"
                     value={gameId}
                     onChange={(e) => setGameId(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   <button
                     type="submit"
                     className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                   >
                     Get Details
                   </button>
                 </form>
                 {gameDetails && (
                   <div className="mt-4 p-4 bg-gray-50 rounded-md text-gray-700">
                     <p>Game Type: {gameDetails.gameType}</p>
                     <p>Developer: {gameDetails.developer}</p>
                   </div>
                 )}
               </div>
       
               {/* Right Image */}
               <div className="w-1/3">
                 <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
                   <img 
                     src={details}
                     alt="Game Details Preview" 
                     className="rounded-lg object-cover"
                   />
                 </div>
               </div>
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
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">NFT Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="text-sm text-purple-400 mt-2">
                        Uploading image to IPFS...
                      </div>
                    )}
                    {uploadError && (
                      <div className="text-sm text-red-400 mt-2">
                        {uploadError}
                      </div>
                    )}
                    {nftImage && (
                      <div className="mt-4">
                        <img
                          src={URL.createObjectURL(nftImage)}
                          alt="NFT preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="IPFS Hash"
                    value={ipfsHash}
                    onChange={(e) => setIpfsHash(e.target.value)}
                    className="w-full bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    readOnly
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
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
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
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Get Details
                  </motion.button>
                </form>
                {nftDetails && (
                  <div className="mt-6 p-4 bg-gray-600/50 rounded-lg shadow-sm text-gray-700">
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
        <TransactionHistory />
      </div>
    </div>
  );
};

export default DGames;