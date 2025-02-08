import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from '../../components/Hero';
import Features from '../../components/Features';

const DHome = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
         <Hero />
         <Features />
    </div>
  )
}

export default DHome;