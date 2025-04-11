const redirectTo = (url) => (globalThis.location = url);
const crpnMsg = (name) => `Current Player: ${name}`;
const createBoard = (matrix) => {
  const cells = [];

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const cell = document.createElement('div');
      cell.id = `${row},${col}`;
      cell.textContent = matrix[row][col];
      cells.push(cell);
    }
  }

  return cells;
};

const mark = async (event) => {
  const id = event.target.id;
  const [row, col] = id.split(',');
  const url = `/tic-tac-toe/mark/${row}/${col}`;
  const response = await fetch(url, { method: 'POST' });

  if (response.ok) return renderBoard();
  if (response.redirected) return redirectTo(response.url);
};

const readyToPlay = (delay) => {
  const intervalID = setInterval(async () => {
    const response = await fetch('/tic-tac-toe/ready-to-play');
    if (response.redirected) {
      clearInterval(intervalID);
      redirectTo(response.url);
    }

    if (response.ok) {
      clearInterval(intervalID);
      renderBoard();
    }
  }, delay);
};

const renderBoard = async () => {
  const response = await fetch('/tic-tac-toe/board');
  const { name, board: matrix } = await response.json();
  const board = document.querySelector('.board');
  const crpn = document.querySelector('#crpn');
  const cells = createBoard(matrix);
  crpn.textContent = crpnMsg(name);

  board.replaceChildren(...cells);
  board.addEventListener('click', mark);
  readyToPlay(1000);
  return;
};

const main = () => {
  renderBoard();
};

globalThis.onload = main;
