import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-gray-900 bg-opacity-90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-purple-500">
              EspeonX
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-purple-500 transition-colors">
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-300 hover:text-purple-500 transition-colors">
              Marketplace
            </Link>
            <Link to="/tournaments" className="text-gray-300 hover:text-purple-500 transition-colors">
              Tournaments
            </Link>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
              Connect Wallet
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
              Home
            </Link>
            <Link to="/marketplace" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
              Marketplace
            </Link>
            <Link to="/tournaments" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
              Tournaments
            </Link>
            <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors mt-4">
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;