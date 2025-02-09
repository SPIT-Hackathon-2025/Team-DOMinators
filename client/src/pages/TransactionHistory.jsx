import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTokens, setTotalTokens] = useState(0);

  // Contract address would be passed as prop in production
  const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
  const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getTransactionHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct EspeonXNFT.Transaction[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const allTransactions = [];
      
      // Changed to loop for exactly 15 iterations
      for (let i = 1; i <= 15; i++) {
        try {
          const history = await contract.getTransactionHistory(i);
          if (history && history.length > 0) {
            allTransactions.push(...history);
          }
        } catch (err) {
          continue;
        }
      }

      allTransactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      setTransactions(allTransactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatPrice = (price) => {
    // Multiply the price by 10^18 for display
    const bigPrice = ethers.utils.formatEther(price);
    const multiplied = (parseFloat(bigPrice) * Math.pow(10, 18)).toLocaleString('fullwide', {useGrouping: false});
    return multiplied;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-black/40 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">All Token Transactions</h2>
        <button 
          onClick={fetchAllTransactions}
          className="px-4 py-2 bg-blue-500/80 text-white rounded hover:bg-blue-600/80 transition-all duration-300 backdrop-blur-sm"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-white/80">Loading transactions...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/20">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Token ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Price (x10^18)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    #{tx.tokenId.toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {formatAddress(tx.from)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {formatAddress(tx.to)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {formatPrice(tx.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {formatTimestamp(tx.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-white/80">No transactions found.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;