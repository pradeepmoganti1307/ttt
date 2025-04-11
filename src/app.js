import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/deno';
import {
  joinLobby,
  setUpCxt,
  joinGame,
  serveGameBoard,
  setGameCxt,
  validatePlayer,
  mark,
  shouldPlay,
  redirectTo,
  serveResults,
  resetLobby,
} from './handlers.js';

export const createApp = (game) => {
  const app = new Hono();

  app.use('*', logger());
  app.use(setUpCxt({ game }));
  app.post('/tic-tac-toe/join-lobby', joinLobby, redirectTo('/wait.html'));
  app.get('/tic-tac-toe/join-game', joinGame);
  app.get('/tic-tac-toe/board', setGameCxt, serveGameBoard);
  app.use('/tic-tac-toe/mark/:row/:col', setGameCxt, validatePlayer);
  app.post('/tic-tac-toe/mark/:row/:col', mark, redirectTo('/result.html'));
  app.use('/tic-tac-toe/ready-to-play', setGameCxt);
  app.get('/tic-tac-toe/ready-to-play', shouldPlay, redirectTo('/result.html'));
  app.get('/tic-tac-toe/results', setGameCxt, serveResults);
  app.use('/tic-tac-toe/play-again', setGameCxt);
  app.get('/tic-tac-toe/play-again', resetLobby, redirectTo('/wait.html'));
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
