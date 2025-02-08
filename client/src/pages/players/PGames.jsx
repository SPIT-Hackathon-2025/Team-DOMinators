import React, { useState } from 'react';
import TicTacToe from './TicTacToe';
import ConnectFour from './ConnectFour'; // Import the ConnectFour component

const PGames = () => {
  const [showTicTacToe, setShowTicTacToe] = useState(false);
  const [showConnectFour, setShowConnectFour] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto mt-16">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Play Games
        </h1>

        {!showTicTacToe && !showConnectFour ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tic-Tac-Toe Card */}
            <div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setShowTicTacToe(true)}
            >
              <h3 className="text-xl font-bold text-white mb-2">Tic-Tac-Toe</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                A classic game of Tic-Tac-Toe. Play against a friend or test your skills!
              </p>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="font-medium">2 Players</span>
              </div>
            </div>

            {/* Connect Four Card */}
            <div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setShowConnectFour(true)}
            >
              <h3 className="text-xl font-bold text-white mb-2">Connect Four</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                A two-player connection game. Drop discs and connect four to win!
              </p>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="font-medium">2 Players</span>
              </div>
            </div>
          </div>
        ) : showTicTacToe ? (
          <TicTacToe />
        ) : (
          <ConnectFour />
        )}
      </div>
    </div>
  );
};

export default PGames;