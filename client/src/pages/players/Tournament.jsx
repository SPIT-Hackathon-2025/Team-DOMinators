import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Leaderboard from '../../components/Leaderboard';

const TournamentDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState({});

  // Contract configuration
  const contractAddress = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; 
  const contractABI = [
    // Only including relevant ABI functions for tournaments
    {
      "inputs": [{"internalType": "uint256","name": "tournamentId","type": "uint256"}],
      "name": "joinTournament",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "tournamentId","type": "uint256"}],
      "name": "getTournamentDetails",
      "outputs": [{
        "components": [
          {"internalType": "string","name": "name","type": "string"},
          {"internalType": "uint256","name": "prizePool","type": "uint256"},
          {"internalType": "address[]","name": "players","type": "address[]"},
          {"internalType": "enum EspeonXNFT.TournamentStatus","name": "status","type": "uint8"},
          {"internalType": "address","name": "winner","type": "address"},
          {"internalType": "uint256[]","name": "splitRatios","type": "uint256[]"}
        ],
        "internalType": "struct EspeonXNFT.Tournament",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.providers.Web3Provider(window.ethereum);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
      return null;
    }
  };

  const fetchTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = await connectWallet();
      if (!provider) return;
      
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // For demo purposes, we'll check tournaments with IDs 1-10
      const tournamentPromises = [];
      for (let i = 1; i <= 10; i++) {
        tournamentPromises.push(contract.getTournamentDetails(i).catch(() => null));
      }
      
      const results = await Promise.all(tournamentPromises);
      const activeTournaments = results
        .map((tournament, index) => ({
          ...tournament,
          id: index + 1
        }))
        .filter(tournament => tournament && tournament.status === 0); // Status 0 is Active
      
      setTournaments(activeTournaments);
    } catch (err) {
      setError('Failed to fetch tournaments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournamentId) => {
    setJoinLoading(prev => ({ ...prev, [tournamentId]: true }));
    setError('');
    try {
      const provider = await connectWallet();
      if (!provider) return;
      
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.joinTournament(tournamentId);
      await tx.wait();
      
      // Refresh tournaments after successful join
      await fetchTournaments();
    } catch (err) {
      setError('Failed to join tournament: ' + err.message);
    } finally {
      setJoinLoading(prev => ({ ...prev, [tournamentId]: false }));
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen px-8 py-22">
        <Leaderboard />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold  text-purple-400 to-pink-400 bg-clip-text mb-8">Active Tournaments</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 border-indigo-700 border-1">
                <div className="p-6 bg-gradient-to-t from-slate-900 to-slate-700">
                  <h2 className="text-2xl font-semibold text-gray-300 mb-2">{tournament.name}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-200">
                      Prize Pool: {ethers.utils.formatEther(tournament.prizePool)} ETH
                    </p>
                    <p className="text-gray-200">
                      Players: {tournament.players.length}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => joinTournament(tournament.id)}
                        disabled={joinLoading[tournament.id]}
                        className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-700  hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joinLoading[tournament.id] ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Joining...
                          </span>
                        ) : (
                          'Join Tournament'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && tournaments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active tournaments found</p>
          </div>
        )}
      </div>
    
    </div>
  );
};

export default TournamentDashboard;