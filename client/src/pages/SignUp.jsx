import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../components/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Gamepad, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const collectionName = userType === "player" ? "Players" : "Developers";
        const userData = {
          email: user.email,
          username: username,
          createdAt: new Date().toISOString(),
          ...(userType === "player" 
            ? {
                gamesOwned: [],
                achievements: [],
                level: 1,
                experience: 0
              }
            : {
                publishedGames: [],
                totalSales: 0,
                developerRating: 0
              })
        };

        await setDoc(doc(db, "UserTypes", user.uid), {
          type: userType,
          email: user.email
        });

        await setDoc(doc(db, collectionName, user.uid), userData);
        
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate(userType === "player" ? "/player/home" : "/developer/home");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { type: "player", icon: Gamepad, label: "Player" },
            { type: "developer", icon: Code, label: "Developer" }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                userType === type 
                  ? 'bg-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Choose a username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Create password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-purple-600 text-white rounded-lg transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-purple-700'
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
}

export default Register;
