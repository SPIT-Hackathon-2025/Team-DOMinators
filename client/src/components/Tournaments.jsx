import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, DollarSign, Play, ClipboardList } from 'lucide-react';

const TournamentCard = ({ title, prize, date, participants, game, status, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="bg-gray-800 rounded-xl p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <motion.span 
        whileHover={{ scale: 1.1 }}
        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
          status === 'Live' ? 'bg-green-600' :
          status === 'Upcoming' ? 'bg-blue-600' :
          'bg-red-600'
        }`}
      >
        {status === 'Live' && <Play size={12} />}
        {status}
      </motion.span>
    </div>
    <div className="space-y-2 text-gray-400">
      <p className="flex items-center gap-2"><Trophy size={16} /> {game}</p>
      <p className="flex items-center gap-2"><DollarSign size={16} /> Prize Pool: {prize} ETH</p>
      <p className="flex items-center gap-2"><Calendar size={16} /> {date}</p>
      <p className="flex items-center gap-2"><Users size={16} /> {participants} participants</p>
    </div>
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {status === 'Live' ? <Play size={16} /> : 
       status === 'Upcoming' ? <ClipboardList size={16} /> : 
       <Trophy size={16} />}
      {status === 'Live' ? 'Watch Now' : 
       status === 'Upcoming' ? 'Register' : 
       'View Results'}
    </motion.button>
  </motion.div>
);


const Tournaments = () => {
  const tournaments = [
    {
      title: "EspeonX Masters",
      prize: "100",
      date: "2024-02-15",
      participants: "128",
      game: "League of Legends",
      status: "Live"
    },
    {
      title: "Crypto Cup 2024",
      prize: "50",
      date: "2024-02-20",
      participants: "64",
      game: "CSGO",
      status: "Upcoming"
    },
    {
      title: "Battle Royale Championship",
      prize: "75",
      date: "2024-02-10",
      participants: "256",
      game: "Fortnite",
      status: "Completed"
    },
    {
      title: "NFT Warriors League",
      prize: "25",
      date: "2024-02-25",
      participants: "32",
      game: "Dota 2",
      status: "Upcoming"
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold mb-4">Tournaments</h2>
          <p className="text-xl text-gray-400">Compete in blockchain-verified competitions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tournaments.map((tournament, index) => (
            <TournamentCard key={index} {...tournament} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tournaments;