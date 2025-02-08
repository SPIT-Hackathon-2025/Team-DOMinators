import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Gamepad, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../components/firebase";

// Constants for user types
const USER_TYPES = {
  PLAYER: 'player',
  DEVELOPER: 'developer'
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    userType: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getUserData = (type, email, username) => {
    const baseData = {
      email,
      username,
      createdAt: new Date().toISOString(),
    };

    if (type === USER_TYPES.PLAYER) {
      return {
        ...baseData,
        gamesOwned: [],
        achievements: [],
        level: 1,
        experience: 0,
        lastLoginDate: new Date().toISOString(),
        preferredGenres: [],
      };
    }

    return {
      ...baseData,
      publishedGames: [],
      totalSales: 0,
      developerRating: 0,
      studioName: "",
      developerBio: "",
    };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const { email, password, username, userType } = formData;
    
    if (!email || !password || !username || !userType) {
      toast.error("Please fill in all fields and select a user type");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const collectionName = userType === USER_TYPES.PLAYER ? "Players" : "Developers";
        const userData = getUserData(userType, email, username);

        // Store user type reference
        await setDoc(doc(db, "UserTypes", user.uid), {
          type: userType,
          email: user.email,
          createdAt: new Date().toISOString()
        });

        // Store user data
        await setDoc(doc(db, collectionName, user.uid), userData);
        
        toast.success("Welcome to the platform! 🎮");
        
        // Delayed navigation to prevent race conditions
        setTimeout(() => {
          navigate(userType === USER_TYPES.PLAYER ? "/player/home" : "/developer/home");
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Join the Gaming Community</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { type: USER_TYPES.PLAYER, icon: Gamepad, label: "Player", description: "Play and collect games" },
            { type: USER_TYPES.DEVELOPER, icon: Code, label: "Developer", description: "Create and publish games" }
          ].map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                formData.userType === type 
                  ? 'bg-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-center opacity-75">{description}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Choose a username"
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_-]+$"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Create password"
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.userType}
            className={`w-full py-3 bg-purple-600 text-white rounded-lg transition-all ${
              isSubmitting || !formData.userType
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already registered?{' '}
            <a href="/login" className="text-purple-400 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;