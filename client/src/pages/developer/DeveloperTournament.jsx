import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, AlertCircle, Plus, Award, Check } from 'lucide-react';

const CreateTournamentForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    prizePool: '',
    splitRatios: ['60', '30', '10'] // Default split for top 3
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      splitRatios: formData.splitRatios.map(ratio => parseInt(ratio))
    });
  };

  const handleSplitChange = (index, value) => {
    const newSplitRatios = [...formData.splitRatios];
    newSplitRatios[index] = value;
    setFormData({ ...formData, splitRatios: newSplitRatios });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 mb-8"
      onSubmit={handleSubmit}
    >
      <h3 className="text-2xl font-bold mb-6">Create Tournament</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tournament Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Prize Pool (ETH)</label>
          <input
            type="number"
            step="0.01"
            value={formData.prizePool}
            onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Prize Split Ratios (%)</label>
          <div className="flex gap-4">
            {formData.splitRatios.map((ratio, index) => (
              <input
                key={index}
                type="number"
                value={ratio}
                onChange={(e) => handleSplitChange(index, e.target.value)}
                className="w-24 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder={`${index + 1}st`}
                required
              />
            ))}
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 rounded-lg px-4 py-2 flex items-center justify-center gap-2"
        type="submit"
      >
        <Plus size={20} />
        Create Tournament
      </motion.button>
    </motion.form>
  );
};

const TournamentCard = ({ tournament, onDistributePrizes }) => {
  const { id, name, prizePool, splitRatios, status, winners = [] } = tournament;

  const handleDistribute = () => {
    // Mock winners addresses for demonstration
    const mockWinners = [
      "0x1234...5678",
      "0x5678...9012",
      "0x9012...3456"
    ];
    onDistributePrizes(id, mockWinners);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800 rounded-xl p-6 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <motion.span 
          className={`px-3 py-1 rounded-full text-sm ${
            status === 'active' ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          {status}
        </motion.span>
      </div>
      <div className="space-y-2 text-gray-400">
        <p className="flex items-center gap-2">
          <DollarSign size={16} /> Prize Pool: {prizePool} ETH
        </p>
        <p className="flex items-center gap-2">
          <Trophy size={16} /> Split Ratios: {splitRatios.join('% / ')}%
        </p>
        {winners.length > 0 && (
          <p className="flex items-center gap-2">
            <Award size={16} /> Winners Announced
          </p>
        )}
      </div>
      {status === 'active' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDistribute}
          className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Award size={16} />
          Distribute Prizes
        </motion.button>
      )}
    </motion.div>
  );
};

const DeveloperTournament = () => {
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      name: "EspeonX Masters",
      prizePool: "100",
      splitRatios: [60, 30, 10],
      status: "active"
    },
    {
      id: 2,
      name: "Crypto Cup 2024",
      prizePool: "50",
      splitRatios: [70, 20, 10],
      status: "closed",
      winners: ["0x1234...5678", "0x5678...9012", "0x9012...3456"]
    }
  ]);

  const handleCreateTournament = (tournamentData) => {
    const newTournament = {
      id: tournaments.length + 1,
      ...tournamentData,
      status: "active"
    };
    setTournaments([...tournaments, newTournament]);
  };

  const handleDistributePrizes = (tournamentId, winners) => {
    setTournaments(tournaments.map(tournament => 
      tournament.id === tournamentId
        ? { ...tournament, status: 'closed', winners }
        : tournament
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tournament Management</h1>
          <p className="text-xl text-gray-400">Create and manage your blockchain-verified tournaments</p>
        </div>

        <CreateTournamentForm onSubmit={handleCreateTournament} />

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Active & Closed Tournaments</h2>
          {tournaments.map(tournament => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onDistributePrizes={handleDistributePrizes}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperTournament;