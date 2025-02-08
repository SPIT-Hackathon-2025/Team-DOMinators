import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, DollarSign, Users, AlertCircle, Plus, Award, Check, X } from 'lucide-react';

const CreateTournamentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    prizePool: '',
    numberOfUsers: 3, // Default number of users
    splitRatios: Array(3).fill('') // Default split ratios for 3 users
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      splitRatios: formData.splitRatios.map(ratio => parseInt(ratio))
    });
    onClose();
    setFormData({ name: '', prizePool: '', numberOfUsers: 3, splitRatios: Array(3).fill('') });
  };

  const handleSplitChange = (index, value) => {
    const newSplitRatios = [...formData.splitRatios];
    newSplitRatios[index] = value;
    setFormData({ ...formData, splitRatios: newSplitRatios });
  };

  const handleNumberOfUsersChange = (e) => {
    const numberOfUsers = parseInt(e.target.value);
    setFormData({
      ...formData,
      numberOfUsers,
      splitRatios: Array(numberOfUsers).fill('')
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Tournament
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Tournament Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter tournament name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Prize Pool (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Number of Users to Split Prize</label>
                <select
                  value={formData.numberOfUsers}
                  onChange={handleNumberOfUsersChange}
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Users
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Prize Split Ratios (%)</label>
                <div className="grid grid-cols-3 gap-4">
                  {formData.splitRatios.map((ratio, index) => (
                    <div key={index} className="relative">
                      <input
                        type="number"
                        value={ratio}
                        onChange={(e) => handleSplitChange(index, e.target.value)}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder={`${index + 1}st place`}
                        required
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  ))}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-6 py-3 font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                type="submit"
              >
                <Plus className="w-5 h-5" />
                Create Tournament
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TournamentCard = ({ tournament, onDistributePrizes }) => {
  const { id, name, prizePool, splitRatios, status, winners = [] } = tournament;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <motion.span 
          className={`px-4 py-1 rounded-full text-sm font-medium ${
            status === 'active' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : status === 'upcoming'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}
        >
          {status}
        </motion.span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-gray-300">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{prizePool} ETH</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <Trophy className="w-5 h-5 text-purple-400" />
          <div className="flex gap-2">
            {splitRatios.map((ratio, index) => (
              <span key={index} className="px-3 py-1 bg-gray-700/50 rounded-lg font-medium">
                {ratio}%
              </span>
            ))}
          </div>
        </div>
        {winners.length > 0 && (
          <div className="flex items-center gap-3 text-gray-300">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Winners Announced</span>
          </div>
        )}
      </div>
      {status === 'active' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDistributePrizes(id, [])}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
        >
          <Award className="w-5 h-5" />
          Distribute Prizes
        </motion.button>
      )}
    </motion.div>
  );
};

const DeveloperTournament = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
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
    },
    {
      id: 3,
      name: "Future Stars 2025",
      prizePool: "75",
      splitRatios: [50, 30, 20],
      status: "upcoming"
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

  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedTab === 'active') return tournament.status === 'active';
    if (selectedTab === 'upcoming') return tournament.status === 'upcoming';
    if (selectedTab === 'closed') return tournament.status === 'closed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mt-11 mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tournament Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-6 py-3 font-medium text-white shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Tournament
          </motion.button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedTab === 'active'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            Active Tournaments
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedTab === 'upcoming'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            Upcoming Tournaments
          </button>
          <button
            onClick={() => setSelectedTab('closed')}
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedTab === 'closed'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            Closed Tournaments
          </button>
        </div>

        <CreateTournamentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTournament}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map(tournament => (
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