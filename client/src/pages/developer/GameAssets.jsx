import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';

const GameAssets = ({ contract, account, refreshNFTs }) => {
  const [assetForm, setAssetForm] = useState({
    gameName: '',
    assetName: '',
    gameType: '',
    unlockLevel: '',
    price: ''
  });
  const [myAssets, setMyAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      fetchMyAssets();
    }
  }, [contract, account]);

  const fetchMyAssets = async () => {
    setIsLoading(true);
    try {
      const filter = contract.filters.NFTMinted(account);
      const events = await contract.queryFilter(filter);
      
      const assets = await Promise.all(events.map(async (event) => {
        const { tokenId, tokenURI, ipfsHash, price, gameType } = event.args;
        const details = await contract.nftDetails(tokenId);
        
        return {
          tokenId: tokenId.toString(),
          tokenURI,
          ipfsHash,
          price: ethers.utils.formatEther(price),
          gameType,
          gameName: details.gameName || 'Unknown Game',
          assetName: details.assetName || 'Unknown Asset',
          unlockLevel: details.unlockLevel || '0',
          forSale: details.forSale
        };
      }));

      setMyAssets(assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.mintNFT(
        `${assetForm.gameName}/${assetForm.assetName}`,
        `${assetForm.gameType}_${assetForm.unlockLevel}`,
        ethers.utils.parseEther(assetForm.price),
        0
      );
      await tx.wait();
      alert('Asset uploaded successfully!');
      setAssetForm({
        gameName: '',
        assetName: '',
        gameType: '',
        unlockLevel: '',
        price: ''
      });
      await fetchMyAssets();
      if (refreshNFTs) refreshNFTs();
    } catch (error) {
      console.error('Error uploading asset:', error);
      alert('Error uploading asset');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Upload Game Asset
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Game Name</label>
              <input
                type="text"
                name="gameName"
                value={assetForm.gameName}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Asset Name</label>
              <input
                type="text"
                name="assetName"
                value={assetForm.assetName}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Game Type</label>
              <select
                name="gameType"
                value={assetForm.gameType}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Game Type</option>
                <option value="action">Action</option>
                <option value="adventure">Adventure</option>
                <option value="rpg">RPG</option>
                <option value="strategy">Strategy</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Unlock Level</label>
              <input
                type="number"
                name="unlockLevel"
                value={assetForm.unlockLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Price (ESPX)</label>
              <input
                type="number"
                name="price"
                value={assetForm.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="md:col-span-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Upload Asset
              </motion.button>
            </div>
          </form>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Assets
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your assets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAssets.map((asset) => (
                <motion.div 
                  key={asset.tokenId} 
                  className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">{asset.assetName}</h3>
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                      #{asset.tokenId}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium">Game:</span> {asset.gameName}</p>
                    <p><span className="font-medium">Type:</span> {asset.gameType}</p>
                    <p><span className="font-medium">Level Required:</span> {asset.unlockLevel}</p>
                    <p><span className="font-medium">Price:</span> {asset.price} ESPX</p>
                    <p><span className="font-medium">Status:</span> {asset.forSale ? 'For Sale' : 'Not For Sale'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && myAssets.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No assets found. Start by uploading your first asset!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameAssets;