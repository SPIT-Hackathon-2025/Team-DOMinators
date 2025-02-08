import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import { motion } from 'framer-motion';
import { Gamepad2, Rocket, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/gaming-bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Gamepad2 size={64} className="text-purple-500" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        >
          EspeonX
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto"
        >
          Revolutionizing Esports Ownership & Player Rewards through Blockchain Technology
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row justify-center gap-4 "
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <Rocket size={20} />
            Get Started
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-purple-500 hover:border-purple-400 rounded-lg text-lg font-semibold"
          >
            Learn More
          </motion.button>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown size={32} className="text-purple-500" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;