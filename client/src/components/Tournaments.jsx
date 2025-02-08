// import React from 'react';
// import { motion } from 'framer-motion';
// import { Trophy, Users, Calendar, DollarSign, Play, ClipboardList } from 'lucide-react';

// const TournamentCard = ({ title, prize, date, participants, game, status, index }) => (
//   <motion.div 
//     initial={{ opacity: 0, x: -20 }}
//     whileInView={{ opacity: 1, x: 0 }}
//     viewport={{ once: true }}
//     transition={{ delay: index * 0.1 }}
//     whileHover={{ scale: 1.05 }}
//     className="bg-gray-800 rounded-xl p-6"
//   >
//     <div className="flex justify-between items-start mb-4">
//       <h3 className="text-xl font-semibold">{title}</h3>
//       <motion.span 
//         whileHover={{ scale: 1.1 }}
//         className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
//           status === 'Live' ? 'bg-green-600' :
//           status === 'Upcoming' ? 'bg-blue-600' :
//           'bg-red-600'
//         }`}
//       >
//         {status === 'Live' && <Play size={12} />}
//         {status}
//       </motion.span>
//     </div>
//     <div className="space-y-2 text-gray-400">
//       <p className="flex items-center gap-2"><Trophy size={16} /> {game}</p>
//       <p className="flex items-center gap-2"><DollarSign size={16} /> Prize Pool: {prize} ETH</p>
//       <p className="flex items-center gap-2"><Calendar size={16} /> {date}</p>
//       <p className="flex items-center gap-2"><Users size={16} /> {participants} participants</p>
//     </div>
//     <motion.button 
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
//     >
//       {status === 'Live' ? <Play size={16} /> : 
//        status === 'Upcoming' ? <ClipboardList size={16} /> : 
//        <Trophy size={16} />}
//       {status === 'Live' ? 'Watch Now' : 
//        status === 'Upcoming' ? 'Register' : 
//        'View Results'}
//     </motion.button>
//   </motion.div>
// );


// const Tournaments = () => {
//   const tournaments = [
//     {
//       title: "EspeonX Masters",
//       prize: "100",
//       date: "2024-02-15",
//       participants: "128",
//       game: "League of Legends",
//       status: "Live"
//     },
//     {
//       title: "Crypto Cup 2024",
//       prize: "50",
//       date: "2024-02-20",
//       participants: "64",
//       game: "CSGO",
//       status: "Upcoming"
//     },
//     {
//       title: "Battle Royale Championship",
//       prize: "75",
//       date: "2024-02-10",
//       participants: "256",
//       game: "Fortnite",
//       status: "Completed"
//     },
//     {
//       title: "NFT Warriors League",
//       prize: "25",
//       date: "2024-02-25",
//       participants: "32",
//       game: "Dota 2",
//       status: "Upcoming"
//     }
//   ];

//   return (
//     <section className="py-20 bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16" data-aos="fade-up">
//           <h2 className="text-4xl font-bold mb-4">Tournaments</h2>
//           <p className="text-xl text-gray-400">Compete in blockchain-verified competitions</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {tournaments.map((tournament, index) => (
//             <TournamentCard key={index} {...tournament} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Tournaments;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, DollarSign, Users, Calendar, Play, Medal, Clock, 
         ChevronRight, Award, Star, Settings, X, Share2 } from 'lucide-react';

const TournamentCard = ({ tournament, onJoin, onViewDetails }) => {
  const { name, prizePool, startDate, participants, maxParticipants, 
          game, status, registration } = tournament;

  const getStatusColor = (status) => {
    switch(status) {
      case 'live': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'upcoming': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <motion.span 
          whileHover={{ scale: 1.05 }}
          className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
        >
          {status === 'live' && <Play className="w-3 h-3 inline mr-1" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </motion.span>
      </div>

      <div className="space-y-3 text-gray-300">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          <span>{game}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <span>{prizePool} ETH Prize Pool</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span>{new Date(startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span>{participants}/{maxParticipants} Participants</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(tournament)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium 
                     text-white shadow-md flex items-center justify-center gap-2"
        >
          <ChevronRight className="w-4 h-4" />
          View Details
        </motion.button>
        {status === 'upcoming' && registration === 'open' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onJoin(tournament)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                       hover:from-green-600 hover:to-emerald-600 rounded-lg font-medium 
                       text-white shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Join Now
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const TournamentDetails = ({ tournament, onClose }) => {
  if (!tournament) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 
                      shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 
                         to-pink-400 bg-clip-text text-transparent">
              {tournament.name}
            </h2>
            <button className="text-gray-400 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Prize Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-yellow-400" /> 1st Place
                  </span>
                  <span>{tournament.prizePool * 0.5} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-gray-400" /> 2nd Place
                  </span>
                  <span>{tournament.prizePool * 0.3} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-700" /> 3rd Place
                  </span>
                  <span>{tournament.prizePool * 0.2} ETH</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Tournament Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Start: {new Date(tournament.startDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{tournament.participants}/{tournament.maxParticipants} Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>{tournament.format}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Rules & Requirements</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {tournament.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          {tournament.participants > 0 && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Top Participants</h3>
              <div className="space-y-3">
                {tournament.topParticipants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{participant.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TournamentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('live');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      name: "EspeonX Masters",
      prizePool: 100,
      startDate: "2024-02-15T14:00:00",
      participants: 64,
      maxParticipants: 128,
      game: "League of Legends",
      status: "live",
      format: "Single Elimination",
      registration: "closed",
      rules: [
        "Must be ranked Diamond or above",
        "Teams must have 5 players",
        "All participants must be verified",
        "Match schedules are fixed"
      ],
      topParticipants: [
        { name: "ProGamer123", rating: 2400 },
        { name: "EspeonMaster", rating: 2350 },
        { name: "CryptoWarrior", rating: 2300 }
      ]
    },
    // Add more tournament data as needed
  ]);

  const handleJoinTournament = (tournament) => {
    // Implement join logic
    console.log('Joining tournament:', tournament.name);
  };

  const filteredTournaments = tournaments.filter(t => t.status === selectedTab);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 
                         to-pink-400 bg-clip-text text-transparent mb-4">
            Tournament Arena
          </h1>
          <p className="text-gray-400 text-lg">
            Compete, Win, and Earn Crypto Rewards
          </p>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          {['live', 'upcoming', 'completed'].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700/50 text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={handleJoinTournament}
              onViewDetails={setSelectedTournament}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedTournament && (
            <TournamentDetails
              tournament={selectedTournament}
              onClose={() => setSelectedTournament(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TournamentDashboard;