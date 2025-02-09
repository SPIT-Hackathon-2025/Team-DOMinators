import React, { useState, useEffect } from 'react';
import { getAssetDetails } from '../../components/firebase';

const ConnectFour = ({ account, preferences }) => {
  const [board, setBoard] = useState(Array(6).fill(Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [showAssetList, setShowAssetList] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-800');

  const handleClick = (col) => {
    if (winner) return;

    const newBoard = board.map((row) => [...row]);
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        checkWinner(newBoard, row, col);
        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
        break;
      }
    }
  };

  const checkWinner = (board, row, col) => {
    const directions = [
      [1, 0], // Vertical
      [0, 1], // Horizontal
      [1, 1], // Diagonal (top-left to bottom-right)
      [1, -1], // Diagonal (top-right to bottom-left)
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === currentPlayer
        ) {
          count++;
        } else {
          break;
        }
      }
      for (let i = 1; i < 4; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === currentPlayer
        ) {
          count++;
        } else {
          break;
        }
      }
      if (count >= 4) {
        setWinner(currentPlayer);
        return;
      }
    }
  };

  const handleUseAsset = async (assetId) => {
    const assetDetails = await getAssetDetails(assetId);
    if (assetDetails && assetDetails.color) {
      setBackgroundColor(assetDetails.color);
    }
    setSelectedAsset(assetId);
    setShowAssetList(false);
  };

  return (
    <div className={`${backgroundColor} rounded-xl p-8 shadow-2xl w-full max-w-md mx-auto`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Connect Four
      </h2>
      <button
        onClick={() => setShowAssetList(!showAssetList)}
        className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
      >
        Use Asset
      </button>
      {showAssetList && (
        <div className="mb-4">
          {Object.keys(preferences).map((assetId) => (
            preferences[assetId].ConnectFour && (
              <div
                key={assetId}
                onClick={() => handleUseAsset(assetId)}
                className="p-2 mb-2 bg-gray-700 rounded-lg cursor-pointer"
              >
                Asset ID: {assetId}
              </div>
            )
          ))}
        </div>
      )}
      <div className="grid grid-cols-7 gap-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => handleClick(colIndex)}
            >
              {cell && (
                <div
                  className={`w-10 h-10 rounded-full ${
                    cell === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>
      {winner && (
        <div className="mt-4 text-xl font-bold">
          {winner === 'red' ? 'Red' : 'Yellow'} wins!
        </div>
      )}
    </div>
  );
};

export default ConnectFour;