import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../../../abi.json'
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
    <div className="min-h-screen bg-transparent p-8">
      <h1 className="text-3xl font-bold mb-8">Crowdfunding</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create Crowdfunding</h2>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Goal Amount (ETH)"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className="p-2 border rounded mb-2 w-full"
        />
        <button
          onClick={createCrowdfunding}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create Crowdfunding
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Donate to Crowdfunding</h2>
        <select
          value={selectedCrowdfundingId || ''}
          onChange={(e) => setSelectedCrowdfundingId(e.target.value)}
          className="p-2 border rounded mb-2 w-full"
        >
          <option value="">Select a Crowdfunding</option>
          {crowdfundings.map((cf) => (
            <option key={cf.id} value={cf.id}>
              {cf.description} (Goal: {cf.goalAmount} ETH)
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Donation Amount (ETH)"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          className="p-2 border rounded mb-2 w-full"
        />
        <button
          onClick={donateToCrowdfunding}
          className="bg-green-500 text-white p-2 rounded"
        >
          Donate
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Crowdfundings</h2>
        <div className="grid grid-cols-1 gap-4">
          {crowdfundings.map((cf) => (
            <div key={cf.id} className="p-4 border rounded">
              <h3 className="text-xl font-bold">{cf.description}</h3>
              <p>Creator: {cf.creator}</p>
              <p>Goal: {cf.goalAmount} ETH</p>
              <p>Raised: {cf.raisedAmount} ETH</p>
              <p>Status: {cf.isActive ? 'Active' : 'Closed'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrowdfundingComponent;