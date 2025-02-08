import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "../components/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Gamepad, Code } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error("Please select your user type");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const collectionName = userType === "player" ? "Players" : "Developers";
      const navigationPath = userType === "player" ? "/player/home" : "/developer/home";

      const userDoc = await getDoc(doc(db, collectionName, userCredential.user.uid));
      const userTypeDoc = await getDoc(doc(db, "UserTypes", userCredential.user.uid));

      if (userDoc.exists() && userTypeDoc.exists() && userTypeDoc.data().type === userType) {
        toast.success("Login successful!");
        navigate(navigationPath);
      } else {
        await auth.signOut();
        toast.error("Invalid user type or account not found.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-400">
            New user?{" "}
            <a href="/register" className="text-purple-400 hover:underline">
              Register Here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;


// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// import { getDoc, setDoc, doc } from "firebase/firestore";
// import React, { useState } from "react";
// import { auth, db } from "../components/firebase";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Code, Gamepad2 } from "lucide-react";

// function AuthPage({ isLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [userType, setUserType] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!userType) {
//       toast.error("Please select your user type", { position: "bottom-center" });
//       return;
//     }
    
//     try {
//       let userCredential;
//       if (isLogin) {
//         userCredential = await signInWithEmailAndPassword(auth, email, password);
//       } else {
//         userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await setDoc(doc(db, "Users", userCredential.user.uid), { type: userType, email });
//       }
      
//       const userDoc = await getDoc(doc(db, "Users", userCredential.user.uid));
//       if (userDoc.exists() && userDoc.data().type === userType) {
//         toast.success("User authenticated successfully!", { position: "top-center" });
//         navigate(userType === "player" ? "/playerDashboard" : "/developerDashboard");
//       } else {
//         await auth.signOut();
//         toast.error("Invalid user type or account not found.", { position: "bottom-center" });
//       }
//     } catch (error) {
//       toast.error(error.message, { position: "bottom-center" });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//         <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">{isLogin ? "Welcome Back" : "Create an Account"}</h2>

//         <div className="grid grid-cols-2 gap-3 mb-8">
//           {[{ type: "player", icon: Gamepad2, label: "Player" }, { type: "developer", icon: Code, label: "Developer" }].map(({ type, icon: Icon, label }) => (
//             <button
//               key={type}
//               onClick={() => setUserType(type)}
//               className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${userType === type ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//             >
//               <Icon size={24} />
//               <span className="text-sm font-medium">{label}</span>
//             </button>
//           ))}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email address</label>
//             <input type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-600" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-600" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>
          
//           <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">{isLogin ? "Sign In" : "Sign Up"}</button>
          
//           <p className="text-center text-sm text-gray-600">
//             {isLogin ? "New user? " : "Already have an account? "}
//             <a href={isLogin ? "/register" : "/login"} className="text-indigo-600 hover:underline">{isLogin ? "Register Here" : "Login Here"}</a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AuthPage;
