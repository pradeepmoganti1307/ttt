const redirectTo = (url) => (globalThis.location = url);

const joinLobby = async (event) => {
  event.preventDefault();

  const response = await fetch('/tic-tac-toe/join-lobby', {
    method: 'POST',
    body: new FormData(event.target),
  });

  redirectTo(response.url);
};

const main = () => {
  const form = document.querySelector('#entry-to-ttt');
  form.addEventListener('submit', joinLobby);
};

globalThis.onload = main;
