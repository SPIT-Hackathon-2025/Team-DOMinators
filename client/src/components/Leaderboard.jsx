import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronUp } from 'lucide-react';

const mockLeaderboard = [
  { id: 1, name: 'CryptoWarrior', score: 1500 },
  { id: 2, name: 'MetaChampion', score: 1450 },
  { id: 3, name: 'NFTMaster', score: 1400 },
  { id: 4, name: 'ChainKnight', score: 1350 },
  { id: 5, name: 'DeFiTitan', score: 1300 },
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Simulating an API call for leaderboard data
    setTimeout(() => {
      setLeaderboard(mockLeaderboard);
    }, 1000);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden px-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
      >
        Leaderboard
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-300 mt-4"
      >
        Top players earn tournament discounts!
      </motion.p>

      <div className="w-full max-w-2xl mt-8">
        {leaderboard.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow-lg 
            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-800'}`}
          >
            <div className="flex items-center gap-4">
              {index < 3 && <Trophy size={24} className="text-white" />}
              <span className="text-lg font-semibold">{player.name}</span>
            </div>
            <span className="text-lg font-bold">{player.score} XP</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <ChevronUp size={32} className="text-purple-500" />
      </motion.div>
    </div>
  );
};

export default Leaderboard;
