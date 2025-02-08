import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Gamepad, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../components/firebase";

// Constants for user types (matching registration)
const USER_TYPES = {
  PLAYER: 'player',
  DEVELOPER: 'developer'
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { email, password, userType } = formData;
    
    if (!userType) {
      toast.error("Please select your user type");
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const collectionName = userType === USER_TYPES.PLAYER ? "Players" : "Developers";
      const navigationPath = userType === USER_TYPES.PLAYER ? "/player/home" : "/developer/home";

      // Check both user document and user type
      const [userDoc, userTypeDoc] = await Promise.all([
        getDoc(doc(db, collectionName, userCredential.user.uid)),
        getDoc(doc(db, "UserTypes", userCredential.user.uid))
      ]);

      if (userDoc.exists() && userTypeDoc.exists() && userTypeDoc.data().type === userType) {
        toast.success("Welcome back! 🎮");
        setTimeout(() => {
          navigate(navigationPath);
        }, 1500);
      } else {
        await auth.signOut();
        toast.error("Invalid user type or account not found. Please check your selection.");
      }
    } catch (error) {
      const errorMessage = error?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { type: USER_TYPES.PLAYER, icon: Gamepad, label: "Player", description: "Access your games" },
            { type: USER_TYPES.DEVELOPER, icon: Code, label: "Developer", description: "Manage your games" }
          ].map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                formData.userType === type 
                  ? 'bg-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              type="button"
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-center opacity-75">{description}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Enter your password"
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
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-400">
            New to the platform?{' '}
            <a href="/register" className="text-purple-400 hover:underline">
              Create Account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;