import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Market from './pages/players/Market';
import Tournament from './pages/players/Tournament';
import DeveloperTournament from './pages/developer/DeveloperTournament';
import LandingPage from './pages/LandingPage';
import PHome from './pages/players/PHome';
import DHome from './pages/developer/DHome';
import Login from './pages/Login';
import Register from './pages/SignUp';
import Crowdfunding from './pages/developer/Crowdfunding'; // Import Crowdfunding component

import { auth, db } from './components/firebase';
import CommunityPage from './pages/players/CommunityPage';

function PrivateRoute({ children, allowedUserType }) {
  const [userType, setUserType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        try {
          const userTypeDoc = await getDoc(doc(db, "UserTypes", user.uid));
          if (userTypeDoc.exists()) {
            setUserType(userTypeDoc.data().type);
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
        }
      }
      setLoading(false);
    };

    if (authChecked) {
      checkUserType();
    }
  }, [user, authChecked]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to={`/${userType}/home`} />;
  }

  return children;
}

function TournamentRouter() {
  const [userType, setUserType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        try {
          const userTypeDoc = await getDoc(doc(db, "UserTypes", user.uid));
          if (userTypeDoc.exists()) {
            setUserType(userTypeDoc.data().type);
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
        }
        setLoading(false);
      }
    };

    if (user) {
      checkUserType();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (userType === "developer") {
    return <DeveloperTournament />;
  } else if (userType === "player") {
    return <Tournament />;
  }

  return <Navigate to={`/${userType}/home`} />;
}

function App() {
  const [authIntialized, setAuthInitialized] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authIntialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <ToastContainer />
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Player routes */}
          <Route
            path="/player/home"
            element={
              <PrivateRoute allowedUserType="player">
                <PHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <PrivateRoute allowedUserType="player">
                <Market />
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute allowedUserType="player">
                <CommunityPage />
              </PrivateRoute>
            }
          />
          
          {/* Tournament route */}
          <Route
            path="/tournaments"
            element={<TournamentRouter />}
          />
          
          {/* Developer routes */}
          <Route
            path="/developer/home"
            element={
              <PrivateRoute allowedUserType="developer">
                <DHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/crowdfunding"
            element={
              <PrivateRoute allowedUserType="developer">
                <Crowdfunding />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;