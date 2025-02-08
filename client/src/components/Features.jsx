import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, ShoppingBag, Sword } from 'lucide-react';

const FeatureCard = ({ title, description, icon, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.2 }}
    whileHover={{ scale: 1.05 }}
    className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-all"
  >
    <motion.div 
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
      className="text-purple-500 mb-4"
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const Features = () => {
  const features = [
    {
      title: "Tokenized Assets",
      description: "Convert in-game items into blockchain-based assets with true ownership and scarcity.",
      icon: <Sword size={32} />
    },
    {
      title: "Player-Driven Economy",
      description: "Earn rewards based on skill and performance with transparent token-based systems.",
      icon: <Coins size={32} />
    },
    {
      title: "Cross-Game Marketplace",
      description: "Trade digital assets seamlessly between different esports titles.",
      icon: <ShoppingBag size={32} />
    },
    {
      title: "Tournament Ecosystem",
      description: "Participate in blockchain-verified tournaments with smart contract prize distribution.",
      icon: <Trophy size={32} />
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-xl text-gray-400">Experience the future of esports gaming</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;