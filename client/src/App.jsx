import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { getDoc, doc } from "firebase/firestore";
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

import { auth, db } from './components/firebase';

function PrivateRoute({ children, allowedUserType }) {
  const [userType, setUserType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const user = auth.currentUser;

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

    checkUserType();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to={`/${userType}/home`} />;
  }

  return children;
}

function TournamentRouter() {
  const [userType, setUserType] = React.useState(null);
  const user = auth.currentUser;

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const userTypeDoc = await getDoc(doc(db, "UserTypes", user.uid));
        if (userTypeDoc.exists()) {
          setUserType(userTypeDoc.data().type);
        }
      }
    };

    checkUserType();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (userType === "developer") {
    return <DeveloperTournament />;
  }

  return <Tournament />;
}

function App() {
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
          
          {/* Tournament route with dynamic rendering */}
          <Route
            path="/tournaments"
            element={
              <PrivateRoute>
                <TournamentRouter />
              </PrivateRoute>
            }
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;