import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, DollarSign, Users, AlertCircle, Plus, Award, Check, X, Calendar, Clock } from 'lucide-react';

const TournamentCard = ({ tournament, onDistributePrizes }) => {
  const { id, name, prizePool, splitRatios, status, winners = [], description, startDate, endDate, startTime, endTime } = tournament;

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
        <div className="flex items-center gap-3 text-gray-300">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{startDate} to {endDate}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{startTime} - {endTime}</span>
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

export default TournamentCard;