import React, { useState } from "react";
import { ethers } from "ethers";

// Replace with your deployed contract address and ABI
import abi from '../../../abi.json'
const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; 
const CONTRACT_ABI = abi;

const ProposalComponent = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Connect to the Ethereum provider (MetaMask)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Function to create a proposal
  const createProposal = async () => {
    if (!description) {
      alert("Please enter a description for the proposal.");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.createProposal(description);
      await tx.wait();
      alert("Proposal created successfully!");
      setDescription("");
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-2xl mx-auto  bg-opacity-10 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Create Proposal</h1>
        <input
          type="text"
          placeholder="Enter proposal description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg  bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createProposal}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
        >
          {loading ? "Creating..." : "Create Proposal"}
        </button>
      </div>
    </div>
  );
};

export default ProposalComponent;