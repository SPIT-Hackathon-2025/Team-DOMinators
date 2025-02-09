// import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import ABI from "../../../abi.json";
// import TournamentDashboard from "../players/Tournament";


// const TournamentManager = () => {
//   const [tournamentName, setTournamentName] = useState("");
//   const [prizePool, setPrizePool] = useState("");
//   const [splitRatios, setSplitRatios] = useState("");
//   const [tournamentId, setTournamentId] = useState("");
//   const [winners, setWinners] = useState("");
//   const [totalPrize, setTotalPrize] = useState("");
//   const [tournaments, setTournaments] = useState([]);

//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   const signer = provider.getSigner();
//   const contractAddress = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
//   const contract = new ethers.Contract(contractAddress, ABI, signer);

//   // Fetch all tournaments
//   const fetchTournaments = async () => {
//     try {
//       const tournamentList = [];
//       let i = 1;

//       // Loop until we find an empty tournament (assuming tournaments are sequentially numbered)
//       while (true) {
//         try {
//           const tournament = await contract.getTournamentDetails(i);
//           tournamentList.push({ id: i, ...tournament });
//           i++;
//         } catch (error) {
//           // Exit the loop if the tournament does not exist
//           break;
//         }
//       }

//       setTournaments(tournamentList);
//     } catch (error) {
//       console.error("Error fetching tournaments:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTournaments();
//   }, []);

//   const createTournament = async () => {
//     try {
//       const ratios = splitRatios.split(",").map((ratio) => parseInt(ratio.trim(), 10));
//       const tx = await contract.createTournament(tournamentName, ethers.utils.parseEther(prizePool), ratios);
//       await tx.wait();
//       alert("Tournament created successfully!");
//       fetchTournaments(); // Refresh the tournament list
//     } catch (error) {
//       console.error("Error creating tournament:", error);
//       alert("Failed to create tournament. Check the console for details.");
//     }
//   };

//   const distributePrize = async () => {
//     try {
//       const winnerAddresses = winners.split(",").map((address) => address.trim());
//       const tx = await contract.distributePrize(tournamentId, winnerAddresses, ethers.utils.parseEther(totalPrize));
//       await tx.wait();
//       alert("Prize distributed successfully!");
//       fetchTournaments(); // Refresh the tournament list
//     } catch (error) {
//       console.error("Error distributing prize:", error);
//       alert("Failed to distribute prize. Check the console for details.");
//     }
//   };

//   return (
//     <div className="CREATE-TOURNAMENT p-6 rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Tournament Manager</h1>

//       {/* Create Tournament Section */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Create Tournament</h2>
//         <input
//           type="text"
//           placeholder="Tournament Name"
//           value={tournamentName}
//           onChange={(e) => setTournamentName(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <input
//           type="text"
//           placeholder="Prize Pool (in ESPX)"
//           value={prizePool}
//           onChange={(e) => setPrizePool(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <input
//           type="text"
//           placeholder="Split Ratios (comma-separated, e.g., 50,30,20)"
//           value={splitRatios}
//           onChange={(e) => setSplitRatios(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <button
//           onClick={createTournament}
//           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//         >
//           Create Tournament
//         </button>
//       </div>

//       {/* Distribute Prize Section */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Distribute Prize</h2>
//         <input
//           type="text"
//           placeholder="Tournament ID"
//           value={tournamentId}
//           onChange={(e) => setTournamentId(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <input
//           type="text"
//           placeholder="Winners (comma-separated addresses)"
//           value={winners}
//           onChange={(e) => setWinners(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <input
//           type="text"
//           placeholder="Total Prize (in ESPX)"
//           value={totalPrize}
//           onChange={(e) => setTotalPrize(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <button
//           onClick={distributePrize}
//           className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
//         >
//           Distribute Prize
//         </button>
//       </div>

     
//       {/* Tournament List Section */}
//       <TournamentDashboard/>
//     </div>
//   );
// };

// export default TournamentManager;

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../../../abi.json";
import TournamentDashboard from "../players/Tournament";
import tournament from '../../assets/tournament.png'
import Tournament from "../../components/Tournaments";
const TournamentManager = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [splitRatios, setSplitRatios] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [winners, setWinners] = useState("");
  const [totalPrize, setTotalPrize] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
  const contract = new ethers.Contract(contractAddress, ABI, signer);

  const fetchTournaments = async () => {
    try {
      const tournamentList = [];
      let i = 1;
      while (true) {
        try {
          const tournament = await contract.getTournamentDetails(i);
          tournamentList.push({ id: i, ...tournament });
          i++;
        } catch (error) {
          break;
        }
      }
      setTournaments(tournamentList);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const createTournament = async () => {
    try {
      const ratios = splitRatios.split(",").map((ratio) => parseInt(ratio.trim(), 10));
      const tx = await contract.createTournament(tournamentName, ethers.utils.parseEther(prizePool), ratios);
      await tx.wait();
      alert("Tournament created successfully!");
      setShowCreateDialog(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Failed to create tournament. Check the console for details.");
    }
  };

  const distributePrize = async () => {
    try {
      const winnerAddresses = winners.split(",").map((address) => address.trim());
      const tx = await contract.distributePrize(tournamentId, winnerAddresses, ethers.utils.parseEther(totalPrize));
      await tx.wait();
      alert("Prize distributed successfully!");
      setShowDistributeDialog(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error distributing prize:", error);
      alert("Failed to distribute prize. Check the console for details.");
    }
  };

  // Dummy data for closed tournaments
  const closedTournaments = [
    {
      id: 1,
      name: "Winter Championship 2024",
      prizePool: "10000 ESPX",
      winners: ["0x1234...5678", "0x8765...4321"],
      endDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Spring Masters",
      prizePool: "15000 ESPX",
      winners: ["0x2468...1357", "0x1357...2468"],
      endDate: "2024-02-28"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-28 ">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left mb-22">
  {/* Image Section */}
  <div className="md:w-auto w-full flex justify-center md:justify-end">
    <img 
      src={tournament}
      alt="Tournament Central" 
      className="w-48 h-48 object-cover rounded-lg shadow-lg mr-4"
    />
  </div>

  {/* Text Section */}
  <div className="md:w-auto w-full">
    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      Welcome to Tournament Central
    </h1>
    <p className="text-gray-600 max-w-md">
      Manage your esports tournaments, create new competitions, and distribute prizes all in one place. 
      Join the next generation of competitive gaming management.
    </p>
  </div>
</div>



      {/* Action Buttons and Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "active"
                ? "bg-indigo-600 text-white"
                : " text-white-700 border-b border-indigo-600"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Tournaments
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "closed"
                ? "bg-indigo-600 text-white"
                : " text-white-700 border-b border-indigo-600"
            }`}
            onClick={() => setActiveTab("closed")}
          >
            Closed Tournaments
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Tournament
          </button>
          <button
            onClick={() => setShowDistributeDialog(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Distribute Prize
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6">
        {activeTab === "active" ? (
          <Tournament />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {closedTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-gradient-to-t from-slate-900 to-slate-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-indigo-700 mt-9"
              >
                <h3 className="text-xl text-gray-100 font-semibold mb-3">{tournament.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">Prize Pool: {tournament.prizePool}</p>
                  <p className="text-gray-300">End Date: {tournament.endDate}</p>
                  <div>
                    <p className="font-medium text-gray-400">Winners:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {tournament.winners.map((winner, index) => (
                        <li key={index}>{winner}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tournament Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Tournament</h2>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Tournament Name"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Prize Pool (in ESPX)"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Split Ratios (comma-separated, e.g., 50,30,20)"
              value={splitRatios}
              onChange={(e) => setSplitRatios(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={createTournament}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Create Tournament
            </button>
          </div>
        </div>
      )}

      {/* Distribute Prize Dialog */}
      {showDistributeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Distribute Prize</h2>
              <button
                onClick={() => setShowDistributeDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Tournament ID"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Winners (comma-separated addresses)"
              value={winners}
              onChange={(e) => setWinners(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Total Prize (in ESPX)"
              value={totalPrize}
              onChange={(e) => setTotalPrize(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={distributePrize}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Distribute Prize
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManager;