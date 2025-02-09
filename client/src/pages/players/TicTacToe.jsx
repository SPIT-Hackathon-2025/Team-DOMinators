import React, { useState, useEffect } from 'react';

const TicTacToe = ({ selectedAsset }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    if (selectedAsset) {
      setBackgroundImage(`https://ipfs.io/ipfs/${selectedAsset.ipfsHash}`);
    }
  }, [selectedAsset]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const winner = calculateWinner(board);
  const status = winner
    ? `Winner: ${winner}`
    : board.every((square) => square)
    ? 'Draw!'
    : `Next player: ${isXNext ? 'X' : 'O'}`;

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-md mx-auto" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Tic-Tac-Toe
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {board.map((square, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-24 h-24 bg-gray-700/50 rounded-lg flex items-center justify-center text-3xl font-bold text-white hover:bg-gray-600/50 transition-colors"
            disabled={square || winner}
          >
            {square}
          </button>
        ))}
      </div>
      <div className="mt-6 text-center text-lg font-medium text-gray-300">
        {status}
      </div>
      <button
        onClick={resetGame}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
      >
        Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;