import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Shield } from 'lucide-react';
import sword from '../assets/sword.png';
import shield from '../assets/shield.png';
import dagger from '../assets/dagger.png';
import wings from '../assets/wings.png';

const MarketplaceItem = ({ name, price, image, rarity, index }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="bg-gray-800 rounded-xl overflow-hidden"
  >
    <div className="aspect-w-1 aspect-h-1 flex items-center justify-center my-10 ">
      <img src={image} alt={name} className="w-40 h-40 object-cover" />
    </div>
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <motion.span 
          whileHover={{ scale: 1.1 }}
          className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
            rarity === 'Legendary' ? 'bg-yellow-600' :
            rarity === 'Epic' ? 'bg-purple-600' :
            'bg-blue-600'
          }`}
        >
          <Star size={12} />
          {rarity}
        </motion.span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-purple-400 flex items-center gap-1">
          <Shield size={16} />
          {price} ETH
        </span>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <ShoppingCart size={16} />
          Buy Now
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const Marketplace = () => {
  const items = [
    { name: "Dragon Slayer Sword", price: "0.5", image: sword, rarity: "Legendary" },
    { name: "Mystic Shield", price: "0.3", image: shield, rarity: "Epic" },
    { name: "Shadow Dagger", price: "0.2", image: dagger, rarity: "Rare" },
    { name: "Phoenix Wings", price: "0.4", image: wings, rarity: "Epic" }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold mb-4">Marketplace</h2>
          <p className="text-xl text-gray-400">Discover and trade unique in-game assets</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <MarketplaceItem key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marketplace;