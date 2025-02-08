import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../../../abi.json';

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

        // Fetch all NFTs after contract initialization
        await fetchAllNFTs(gameContract);
      }
    };
    initEthers();
  }, []);

  const fetchAllNFTs = async (contractInstance) => {
    setIsLoading(true);
    try {
      // Get all NFTMinted events from contract deployment
      const filter = contractInstance.filters.NFTMinted();
      const events = await contractInstance.queryFilter(filter);
      
      // Process events into NFT objects
      const nfts = await Promise.all(events.map(async (event) => {
        const { owner, tokenId, tokenURI, ipfsHash, price, gameType } = event.args;
        
        // Get current owner and sale status
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

      // Group NFTs by game type
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

  // Function to trade NFT
  const handleTradeNFT = async (tokenId) => {
    try {
      const tx = await contract.tradeNFT(tokenId);
      await tx.wait();
      alert('NFT traded successfully!');
      // Refresh NFT list
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
      // Refresh NFT list after minting
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
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="font-medium">Token ID: {nft.tokenId}</p>
      <p className="text-sm truncate">Owner: {nft.owner}</p>
      <p className="text-sm">Price: {nft.price} ESPX</p>
      <p className="text-sm">Game Type: {nft.gameType}</p>
      <p className="text-sm truncate">IPFS Hash: {nft.ipfsHash}</p>
      {nft.forSale && nft.owner !== account && (
        <button
          onClick={() => handleTradeNFT(nft.tokenId)}
          className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Buy NFT
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Wallet info section */}
      <div className="mb-8 mt-16 rounded-lg p-4 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-700 font-medium mb-2 md:mb-0">
            Wallet: <span className="text-blue-600">{account}</span>
          </p>
          <p className="text-gray-700 font-medium">
            Balance: <span className="text-green-600">{balance} ESPX</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6">
        <button
          className={`px-6 py-2 mr-2 rounded-t-lg font-medium ${
            activeTab === 'games' ? 'text-blue-600 shadow-md' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('games')}
        >
          Games
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-medium ${
            activeTab === 'nfts' ? 'text-blue-600 shadow-md' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('nfts')}
        >
          NFTs
        </button>
      </div>

      {/* Content */}
      <div className="rounded-lg shadow-md p-6">
        {activeTab === 'games' ? (
          <div className="space-y-8">
            {/* Game Forms */}
            <div>
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

            {/* Get Game Details Form */}
            <div>
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
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p>Game Type: {gameDetails.gameType}</p>
                  <p>Developer: {gameDetails.developer}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* NFT Type Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {gameTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-md ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* NFTs Grid */}
            {isLoading ? (
              <div className="text-center py-8">Loading NFTs...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedType === 'all'
                  ? allNFTs.map((nft) => <NFTCard key={nft.tokenId} nft={nft} />)
                  : groupedNFTs[selectedType]?.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))}
              </div>
            )}

            {/* Mint NFT Form */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Mint NFT</h3>
              <form onSubmit={mintNFT} className="space-y-4">
                <input
                  type="text"
                  placeholder="Token URI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="IPFS Hash"
                  value={ipfsHash}
                  onChange={(e) => setIpfsHash(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price (ESPX)"
                  value={nftPrice}
                  onChange={(e) => setNftPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Game ID"
                  value={nftGameId}
                  onChange={(e) => setNftGameId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Mint NFT
                </button>
              </form>
            </div>

            {/* Get NFT Details Form */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get NFT Details</h3>
              <form onSubmit={getNFTDetails} className="space-y-4">
                <input
                  type="number"
                  placeholder="NFT ID"
                  value={nftId}
                  onChange={(e) => setNftId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Details
                </button>
              </form>
              {nftDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p>Owner: {nftDetails.owner}</p>
                  <p>Price: {ethers.utils.formatEther(nftDetails.price)} ESPX</p>
                  <p>For Sale: {nftDetails.forSale ? 'Yes' : 'No'}</p>
                  <p>Game Type: {nftDetails.gameType}</p>
                  <p>IPFS Hash: {nftIpfsHash}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DGames;