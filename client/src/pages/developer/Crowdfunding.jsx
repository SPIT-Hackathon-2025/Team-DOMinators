import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Clock, Plus, X } from 'lucide-react';
import abi from '../../../abi.json';

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; 
const CONTRACT_ABI = abi;

const CrowdfundingComponent = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [crowdfundings, setCrowdfundings] = useState([]);
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedCrowdfundingId, setSelectedCrowdfundingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);

        loadCrowdfundings(contract);
      } else {
        alert('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const loadCrowdfundings = async (contract) => {
    try {
      // Fetch all CrowdfundingStarted events
      const crowdfundingStartedFilter = contract.filters.CrowdfundingStarted();
      const events = await contract.queryFilter(crowdfundingStartedFilter);

      const crowdfundings = [];

      // Loop through events to get crowdfunding IDs and fetch their details
      for (let event of events) {
        const crowdfundingId = event.args.crowdfundingId;
        const crowdfunding = await contract.crowdfundings(crowdfundingId);

        crowdfundings.push({
          id: crowdfundingId.toString(),
          creator: crowdfunding.creator,
          description: crowdfunding.description,
          goalAmount: ethers.utils.formatEther(crowdfunding.goalAmount),
          raisedAmount: ethers.utils.formatEther(crowdfunding.raisedAmount),
          isActive: crowdfunding.isActive,
        });
      }

      setCrowdfundings(crowdfundings);
    } catch (error) {
      console.error('Error loading crowdfundings:', error);
    }
  };

  const createCrowdfunding = async () => {
    if (!contract) return;

    try {
      const tx = await contract.startCrowdfunding(description, ethers.utils.parseEther(goalAmount));
      await tx.wait();
      alert('Crowdfunding created successfully!');
      setDescription('');
      setGoalAmount('');
      loadCrowdfundings(contract);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating crowdfunding:', error);
    }
  };

  const donateToCrowdfunding = async () => {
    if (!contract || selectedCrowdfundingId === null) return;

    try {
      const tx = await contract.donate(selectedCrowdfundingId, ethers.utils.parseEther(donationAmount));
      await tx.wait();
      alert('Donation successful!');
      setDonationAmount('');
      loadCrowdfundings(contract);
    } catch (error) {
      console.error('Error donating:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Crowdfunding
          </h1>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Crowdfunding
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crowdfundings.map((cf) => (
            <motion.div 
              key={cf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-2">{cf.description}</h3>
              <p className="text-gray-300 mb-4">Creator: {cf.creator}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">{cf.raisedAmount} / {cf.goalAmount} ETH</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(cf.raisedAmount / cf.goalAmount) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">{cf.isActive ? 'Active' : 'Closed'}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
                onClick={() => setSelectedCrowdfundingId(cf.id)}
              >
                <DollarSign className="w-5 h-5" />
                Donate
              </motion.button>
            </motion.div>
          ))}
        </div>

        {crowdfundings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No crowdfundings found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Crowdfunding
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); createCrowdfunding(); }} className="space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Goal Amount (ETH)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-6 py-3 font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                  type="submit"
                >
                  <Plus className="w-5 h-5" />
                  Create Crowdfunding
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCrowdfundingId !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-2xl relative"
            >
              <button
                onClick={() => setSelectedCrowdfundingId(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Donate to Crowdfunding
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); donateToCrowdfunding(); }} className="space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Donation Amount (ETH)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-6 py-3 font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                  type="submit"
                >
                  <DollarSign className="w-5 h-5" />
                  Donate
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrowdfundingComponent;