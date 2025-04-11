const redirectTo = (url) => (globalThis.location = url);

const playAgain = async () => {
  const response = await fetch('/tic-tac-toe/play-again');
  if (response.redirected) redirectTo(response.url);
  return;
};

const renderResults = async () => {
  const response = await fetch('/tic-tac-toe/results');
  const { isDraw, winner, symbol } = await response.json();
  const resultsBox = document.querySelector('.result-box h2');
  resultsBox.textContent = [isDraw, winner, symbol].join(' -- ');
  return;
};

const main = () => {
  const playAgainBtn = document.querySelector('#play-again');
  playAgainBtn.addEventListener('click', playAgain);
  renderResults();
};

globalThis.onload = main;
