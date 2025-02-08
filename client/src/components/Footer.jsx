import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-purple-500">
              EspeonX
            </Link>
            <p className="mt-4 text-gray-400">
              Revolutionizing esports through blockchain technology
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
              <Link to="/marketplace" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-purple-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Medium
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Stay updated with the latest news and updates
            </p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 EspeonX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;