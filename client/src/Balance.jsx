import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

const contractAddress = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";  // Replace with actual address
const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const BalanceButton = () => {
  const [balance, setBalance] = useState('0');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      }
    } catch (error) {
      setError('Error connecting to wallet');
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await fetchBalance(accounts[0]);
    } catch (error) {
      setError('Error connecting wallet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (userAddress) => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const balance = await contract.getUserBalance(userAddress);
      setBalance(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      setError('Error fetching balance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed mt-18 right-4 z-50 bg-opacity-20 bg-black backdrop-blur-md hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-full border border-white/20 flex items-center space-x-2 transition-all duration-200 group"
      >
        {account ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 group-hover:text-white">
                {loading ? (
                  <span className="inline-block animate-pulse">Loading...</span>
                ) : (
                  `${parseFloat(balance).toFixed(18)} ESPX`
                )}
              </span>
            </div>
          </>
        ) : (
          <span className="text-white/90 group-hover:text-white">Connect Wallet</span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-16 right-4 z-50 bg-black bg-opacity-80 backdrop-blur-lg rounded-xl border border-white/20 p-4 w-80 shadow-2xl">
          {!account ? (
            <div className="space-y-4">
              <p className="text-white/70 text-sm">Connect your wallet to view your ESPX balance</p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 border border-indigo-500"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Connected Wallet</p>
                <p className="font-mono text-sm text-white/90 bg-white/5 rounded-lg p-2">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/60 text-sm">ESPX Balance</p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xl font-semibold text-white">
                    {loading ? (
                      <span className="inline-block animate-pulse">Loading...</span>
                    ) : (
                      `${parseFloat(balance).toFixed(4)} ESPX`
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4">
              <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded-lg border border-red-500/30">
                {error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceButton;