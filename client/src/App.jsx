// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import Market from './pages/players/Market';
// import Tournament from './pages/players/Tournament';
// import LandingPage from './pages/LandingPage';
// import AuthPage from './pages/Login';
// import PHome from './pages/players/PHome';
// import DHome from './pages/developer/DHome';

// function App() {
  

//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-900 text-white">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={
//             <>
//               <LandingPage />    
//             </>
//           } />
//           <Route 
//           path="/login" 
//           element={
//             <AuthPage  
//               // setIsLoggedIn={setIsLoggedIn} 
//               // setUserType={setUserType} 
//             />
//           } 
//         />
//             <Route path='/marketplace' element={<Market/>}/>
//             <Route path="/tournaments" element={<Tournament />} />
//         </Routes>
//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Market from './pages/players/Market';
import Tournament from './pages/players/Tournament';
import LandingPage from './pages/LandingPage';
import PHome from './pages/players/PHome';
import DHome from './pages/developer/DHome';
import Login from './pages/Login';
import Register from './pages/SignUp';

import { auth } from './components/firebase';

function PrivateRoute({ children, userType }) {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Additional userType check can be implemented here if needed
  return children;
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
              <PrivateRoute userType="player">
                <PHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <PrivateRoute userType="player">
                <Market />
              </PrivateRoute>
            }
          />
          <Route
            path="/tournaments"
            element={
              <PrivateRoute userType="player">
                <Tournament />
              </PrivateRoute>
            }
          />
          
          {/* Developer routes */}
          <Route
            path="/developer/home"
            element={
              <PrivateRoute userType="developer">
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