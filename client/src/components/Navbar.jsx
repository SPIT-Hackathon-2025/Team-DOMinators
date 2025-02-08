import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../components/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

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
            {/* Show these links only when user is authenticated */}
            {user && (
              <React.Fragment>
                
                {user.type === 'player' && (
                  <Link to="/player/home" className="text-gray-300 hover:text-purple-500 transition-colors">
                    Home
                  </Link>
                )}
                  {user.type === 'developer' && (
                  <Link to="/developer/home" className="text-gray-300 hover:text-purple-500 transition-colors">
                    Home
                  </Link>
                )}
                <Link to="/marketplace" className="text-gray-300 hover:text-purple-500 transition-colors">
                  Marketplace
                </Link>
                <Link to="/tournaments" className="text-gray-300 hover:text-purple-500 transition-colors">
                  Tournaments
                </Link>
                {/* Add Crowdfunding link if user is a developer */}
                {user.type === 'player' && (
                  <Link to="/community" className="text-gray-300 hover:text-purple-500 transition-colors">
                    Community
                  </Link>
                )}
                  {user.type === 'developer' && (
                  <Link to="/crowdfunding" className="text-gray-300 hover:text-purple-500 transition-colors">
                    Crowdfunding
                  </Link>
                )}
              </React.Fragment>
            )}
            
            {/* Show login/register when not authenticated, logout when authenticated */}
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-purple-500 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Show these links only when user is authenticated */}
            {user && (
              <React.Fragment>
                <Link to="/" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
                  Home
                </Link>
                <Link to="/marketplace" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
                  Marketplace
                </Link>
                <Link to="/tournaments" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
                  Tournaments
                </Link>
                {/* Add Crowdfunding link if user is a developer */}
                {user.type === 'developer' && (
                  <Link to="/crowdfunding" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
                    Crowdfunding
                  </Link>
                )}
                {user.type === 'player' && (
                  <Link to="/community" className="block text-gray-300 hover:text-purple-500 transition-colors py-2">
                    Community
                  </Link>
                )}
              </React.Fragment>
            )}
            
            {/* Show login/register when not authenticated, logout when authenticated */}
            {!user ? (
              <React.Fragment>
                <Link 
                  to="/login" 
                  className="block text-gray-300 hover:text-purple-500 transition-colors py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors mt-4"
                >
                  Register
                </Link>
              </React.Fragment>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors mt-4"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;