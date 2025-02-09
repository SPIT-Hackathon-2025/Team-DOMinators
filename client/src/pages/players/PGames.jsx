import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TicTacToe from './TicTacToe';
import ConnectFour from './ConnectFour';
import abi from '../../../abi.json';
import PlayerChatbot from './PlayerAiAgent';
import { saveUserPreference, getUserPreferences } from '../../components/firebase';

const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; // Replace with your contract address
const CONTRACT_ABI = abi;

const PGames = () => {
  const [showTicTacToe, setShowTicTacToe] = useState(false);
  const [showConnectFour, setShowConnectFour] = useState(false);
  const [account, setAccount] = useState('');
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);

          await fetchOwnedNFTs(contract, accounts[0]);
          const userPreferences = await getUserPreferences(accounts[0]);
          setPreferences(userPreferences);
        } catch (err) {
          setError('Failed to connect to the blockchain. Please ensure MetaMask is installed and connected.');
          console.error('Initialization error:', err);
        }
      } else {
        setError('Please install MetaMask to use this application.');
      }
    };
    initEthers();
  }, []);

  const fetchOwnedNFTs = async (contract, walletAddress) => {
    setIsLoading(true);
    try {
      const filter = contract.filters.NFTMinted();
      const events = await contract.queryFilter(filter);

      const nfts = await Promise.all(events.map(async (event) => {
        const { owner, tokenId, tokenURI, ipfsHash, price, gameType } = event.args;
        const currentOwner = await contract.ownerOf(tokenId);

        if (currentOwner.toLowerCase() === walletAddress.toLowerCase()) {
          const details = await contract.nftDetails(tokenId);
          return {
            tokenId: tokenId.toString(),
            owner: currentOwner,
            tokenURI,
            ipfsHash,
            price: ethers.utils.formatEther(price),
            gameType,
            forSale: details.forSale,
          };
        } else {
          return null;
        }
      }));

      const owned = nfts.filter((nft) => nft !== null);
      setOwnedNFTs(owned);
    } catch (err) {
      setError('Failed to fetch NFTs. Please try again.');
      console.error('Error fetching NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssetForGame = async (assetId, gameType, enabled) => {
    await saveUserPreference(account, assetId, gameType, enabled);
    const userPreferences = await getUserPreferences(account);
    setPreferences(userPreferences);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Play Games
        </h1>

        {!showTicTacToe && !showConnectFour ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setShowTicTacToe(true)}
            >
              <h3 className="text-xl font-bold text-white mb-2">Tic-Tac-Toe</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                A classic game of Tic-Tac-Toe. Play against a friend or test your skills!
              </p>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="font-medium">2 Players</span>
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setShowConnectFour(true)}
            >
              <h3 className="text-xl font-bold text-white mb-2">Connect Four</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                A two-player connection game. Drop discs and connect four to win!
              </p>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="font-medium">2 Players</span>
              </div>
            </div>
          </div>
        ) : showTicTacToe ? (
          <TicTacToe account={account} preferences={preferences} />
        ) : (
          <ConnectFour account={account} preferences={preferences} />
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            My Owned Assets
          </h2>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading assets...</p>
            </div>
          ) : ownedNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedNFTs.map((nft) => (
                <div
                  key={nft.tokenId}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">Token ID: {nft.tokenId}</h3>
                  <p className="text-sm text-gray-300 truncate mb-1">Owner: {nft.owner}</p>
                  <p className="text-sm text-gray-300 mb-1">Price: {nft.price} ESPX</p>
                  <p className="text-sm text-gray-300 mb-1">Game Type: {nft.gameType}</p>
                  <p className="text-sm text-gray-300 truncate mb-3">IPFS Hash: {nft.ipfsHash}</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences[nft.tokenId]?.TicTacToe || false}
                        onChange={(e) => toggleAssetForGame(nft.tokenId, 'TicTacToe', e.target.checked)}
                      />
                      Tic-Tac-Toe
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences[nft.tokenId]?.ConnectFour || false}
                        onChange={(e) => toggleAssetForGame(nft.tokenId, 'ConnectFour', e.target.checked)}
                      />
                      Connect Four
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No assets owned by this wallet address.</p>
          )}
        </div>
        <PlayerChatbot/>
      </div>
    </div>
  );
};

export default PGames;