const redirectTo = (url) => (globalThis.location = url);

const joiningGame = () => {
  const intervalID = setInterval(async () => {
    const response = await fetch('/tic-tac-toe/join-game');

    if (!response.redirected) return;
    clearInterval(intervalID);

    redirectTo(response.url);
  }, 1000);
};

const main = () => {
  joiningGame(); //polling for every 1000ms
};

globalThis.onload = main;
