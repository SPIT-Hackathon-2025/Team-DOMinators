import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json' // Adjust the import path based on your project structure
import { auth } from './components/firebase';

const BalanceDisplay = () => {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; 
  useEffect(() => {
    const fetchBalance = async () => {
      const user = auth.currentUser;
      if (user) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS, // Replace with your contract address
          abi,
          signer
        );

        try {
          const userBalance = await contract.getUserBalance(user.uid);
          setBalance(ethers.utils.formatUnits(userBalance, 18)); // Assuming 18 decimals
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
      setLoading(false);
    };

    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-800 p-2 rounded-lg shadow-lg">
      <span className="text-white font-semibold">ESPX Balance:</span>
      <span className="ml-2 text-purple-400 font-bold">{balance} ESPX</span>
    </div>
  );
};

export default BalanceDisplay;