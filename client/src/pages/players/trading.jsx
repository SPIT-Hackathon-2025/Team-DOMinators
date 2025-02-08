import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const NFTTrading = () => {
  const [tokenId, setTokenId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Contract addresses - replace with your deployed contract addresses
const NFT_CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
const TOKEN_CONTRACT_ADDRESS = "0x005dD250CD4122793E359D438B446524D6c61aA2";

  // Contract ABIs - using the full ABI for more accurate interaction
  const NFT_ABI = [
    "function tradeNFT(uint256 tokenId) public",
    "function getTransactionHistory(uint256 tokenId) public view returns (tuple(address from, address to, uint256 tokenId, uint256 price, uint256 timestamp)[])",
    "function nftDetails(uint256) public view returns (uint256 price, bool forSale)",
    "function approve(address to, uint256 tokenId)"
  ];

  const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ];

  const getContract = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      
      return { nftContract, tokenContract, signer };
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const contracts = await getContract();
      if (!contracts) throw new Error("Failed to initialize contracts");

      const { nftContract, tokenContract } = contracts;

      // Get NFT details from the mapping
      const details = await nftContract.nftDetails(tokenId);
      if (!details.forSale) {
        throw new Error("This NFT is not for sale");
      }

      const price = details.price;
      
      // Approve token spending
      try {
        const tokenApproval = await tokenContract.approve(NFT_CONTRACT_ADDRESS, price);
        await tokenApproval.wait();
        console.log("Token approval successful");
      } catch (approvalError) {
        throw new Error(`Token approval failed: ${approvalError.message}`);
      }

      // Execute trade
      try {
        const tradeTx = await nftContract.tradeNFT(tokenId);
        await tradeTx.wait();
        console.log("Trade successful");
      } catch (tradeError) {
        throw new Error(`Trade failed: ${tradeError.message}`);
      }

      setSuccess('NFT traded successfully!');
      await loadTransactionHistory(tokenId);
    } catch (err) {
      setError(err.message);
      console.error("Trade error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async (id) => {
    try {
      const contracts = await getContract();
      if (!contracts) throw new Error("Failed to initialize contracts");

      const { nftContract } = contracts;
      const history = await nftContract.getTransactionHistory(id);
      
      // Filter out empty transactions (if any)
      const validTransactions = history.filter(tx => 
        tx.from !== ethers.constants.AddressZero && 
        tx.to !== ethers.constants.AddressZero
      );
      
      setTransactions(validTransactions);
    } catch (err) {
      console.error("History loading error:", err);
      setError("Failed to load transaction history");
    }
  };

  useEffect(() => {
    if (tokenId) {
      loadTransactionHistory(tokenId);
    }
  }, [tokenId]);

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">NFT Trading Platform</h1>
      
      {/* Trade Form */}
      <form onSubmit={handleTrade} className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter Token ID"
            className="flex-1 p-2 border rounded"
            min="1"
          />
          <button
            type="submit"
            disabled={loading || !tokenId}
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
          >
            {loading ? 'Processing...' : 'Trade NFT'}
          </button>
        </div>
      </form>

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

      {/* Transaction History */}
      {transactions.length > 0 ? (
        <div>
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
      ) : tokenId && (
        <div className="text-gray-500 text-center py-4">
          No transaction history found for this NFT
        </div>
      )}
    </div>
  );
};

export default NFTTrading;