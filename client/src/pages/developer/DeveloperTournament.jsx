import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../../../abi.json";

const TournamentManager = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [splitRatios, setSplitRatios] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [winners, setWinners] = useState("");
  const [totalPrize, setTotalPrize] = useState("");
  const [tournaments, setTournaments] = useState([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b";
  const contract = new ethers.Contract(contractAddress, ABI, signer);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      const tournamentList = [];
      let i = 1;

      // Loop until we find an empty tournament (assuming tournaments are sequentially numbered)
      while (true) {
        try {
          const tournament = await contract.getTournamentDetails(i);
          tournamentList.push({ id: i, ...tournament });
          i++;
        } catch (error) {
          // Exit the loop if the tournament does not exist
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
      fetchTournaments(); // Refresh the tournament list
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
      fetchTournaments(); // Refresh the tournament list
    } catch (error) {
      console.error("Error distributing prize:", error);
      alert("Failed to distribute prize. Check the console for details.");
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Tournament Manager</h1>

      {/* Create Tournament Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Tournament</h2>
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
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <button
          onClick={createTournament}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Tournament
        </button>
      </div>

      {/* Distribute Prize Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Distribute Prize</h2>
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
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <button
          onClick={distributePrize}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Distribute Prize
        </button>
      </div>

     
      {/* Tournament List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Tournaments</h2>
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="p-4 border border-gray-300 rounded">
              <h3 className="text-lg font-bold">Tournament ID: {tournament.id}</h3>
              <p>Name: {tournament.name}</p>
              <p>Prize Pool: {ethers.utils.formatEther(tournament.prizePool)} ESPX</p>
              <p>Status: {tournament.status === 0 ? "Active" : "Closed"}</p>
              <p>Winner: {tournament.winner || "Not yet determined"}</p>
              <p>Players: {tournament.players.length}</p>
              <p>Split Ratios: {tournament.splitRatios.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentManager;