import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { db } from "../../components/firebase"; // Import Firestore instance
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Replace with your deployed contract address and ABI
import abi from '../../../abi.json'
const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; 
const CONTRACT_ABI = abi;

const PlayerGovernance = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState({}); // Track votes for each proposal
  const [comments, setComments] = useState({}); // Track comments for each proposal
  const [newComment, setNewComment] = useState(""); // Track new comment input

  // Connect to the Ethereum provider (MetaMask)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Function to fetch proposal history
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalDescriptions = await contract.getProposalHistory();
      setProposals(proposalDescriptions);

      // Fetch votes and comments from Firestore for each proposal
      const votesData = {};
      const commentsData = {};
      for (let i = 0; i < proposalDescriptions.length; i++) {
        const proposalDoc = await getDoc(doc(db, "proposals", `proposal_${i}`));
        if (proposalDoc.exists()) {
          votesData[i] = proposalDoc.data().votes || { yes: 0, no: 0 };
          commentsData[i] = proposalDoc.data().comments || [];
        } else {
          votesData[i] = { yes: 0, no: 0 };
          commentsData[i] = [];
        }
      }
      setVotes(votesData);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      alert("Failed to fetch proposals.");
    } finally {
      setLoading(false);
    }
  };

  // Function to vote on a proposal
  const voteOnProposal = async (proposalId, voteType) => {
    try {
      setLoading(true);

      // Update Firestore with the new vote
      const proposalRef = doc(db, "proposals", `proposal_${proposalId}`);
      const proposalDoc = await getDoc(proposalRef);

      if (proposalDoc.exists()) {
        const currentVotes = proposalDoc.data().votes || { yes: 0, no: 0 };
        if (voteType === 1) {
          currentVotes.yes += 1;
        } else {
          currentVotes.no += 1;
        }
        await updateDoc(proposalRef, { votes: currentVotes });
      } else {
        await setDoc(proposalRef, {
          votes: { yes: voteType === 1 ? 1 : 0, no: voteType === 0 ? 1 : 0 },
          comments: [],
        });
      }

      // Update local state
      setVotes((prevVotes) => ({
        ...prevVotes,
        [proposalId]: {
          yes: voteType === 1 ? (prevVotes[proposalId]?.yes || 0) + 1 : prevVotes[proposalId]?.yes || 0,
          no: voteType === 0 ? (prevVotes[proposalId]?.no || 0) + 1 : prevVotes[proposalId]?.no || 0,
        },
      }));

      alert(`Vote ${voteType === 1 ? "Yes" : "No"} submitted successfully!`);
    } catch (error) {
      console.error("Error voting on proposal:", error);
      alert("Failed to vote on proposal.");
    } finally {
      setLoading(false);
    }
  };

  // Function to add a comment to a proposal
  const addComment = async (proposalId) => {
    if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      setLoading(true);

      // Update Firestore with the new comment
      const proposalRef = doc(db, "proposals", `proposal_${proposalId}`);
      await updateDoc(proposalRef, {
        comments: arrayUnion(newComment),
      });

      // Update local state
      setComments((prevComments) => ({
        ...prevComments,
        [proposalId]: [...(prevComments[proposalId] || []), newComment],
      }));

      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals();
  }, []);

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-2xl mx-auto bg-opacity-10 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Proposal History</h2>
        <button
          onClick={fetchProposals}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-400 mb-4"
        >
          {loading ? "Fetching..." : "Refresh Proposals"}
        </button>

        <div className="space-y-4">
          {proposals.map((proposal, index) => (
            <div
              key={index}
              className="p-6 bg-opacity-20 backdrop-blur-md rounded-lg shadow-md border border-gray-700"
            >
              <p className="text-white text-lg font-semibold mb-2">{proposal}</p>

              {/* Voting System */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => voteOnProposal(index, 1)} // 1 = Yes
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                >
                  👍 Yes ({votes[index]?.yes || 0})
                </button>
                <button
                  onClick={() => voteOnProposal(index, 0)} // 0 = No
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400"
                >
                  👎 No ({votes[index]?.no || 0})
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-4">
                <h3 className="text-white text-lg font-semibold mb-2">Comments</h3>
                <div className="space-y-2">
                  {(comments[index] || []).map((comment, commentIndex) => (
                    <div
                      key={commentIndex}
                      className="p-3 bg-opacity-10 backdrop-blur-md rounded-lg text-white border border-gray-700"
                    >
                      <p>{comment}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addComment(index)}
                    disabled={loading}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 disabled:bg-purple-400"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerGovernance;