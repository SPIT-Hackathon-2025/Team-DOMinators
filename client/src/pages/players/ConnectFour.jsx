import React, { useState } from 'react';

const ConnectFour = () => {
  const [board, setBoard] = useState(Array(6).fill(Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);

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

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Connect Four</h2>
      <div className="grid grid-cols-7 gap-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer"
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