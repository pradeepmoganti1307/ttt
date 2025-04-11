import { setCookie, getCookie } from 'hono/cookie';

const setUpCxt = (gameMeta) => async (ctx, next) => {
  ctx.gameMeta = gameMeta;

  await next();
};

const joinLobby = async (ctx, next) => {
  const { game } = ctx.gameMeta;
  const { 'player-name': playerName } = await ctx.req.parseBody();
  const [playerID, gameID] = game.addToRoom(playerName);

  setCookie(ctx, 'gameID', gameID);
  setCookie(ctx, 'playerID', playerID);

  return next();
};

const resetLobby = async (ctx, next) => {
  const { game, gameCxt } = ctx.gameMeta;
  const { playerID } = gameCxt;
  const playerName = game.getPlayerName(playerID);
  const [validPlayerID, gameID] = game.addToRoom(playerName, playerID);

  setCookie(ctx, 'gameID', gameID);
  setCookie(ctx, 'playerID', validPlayerID);

  await next();
};

const joinGame = (ctx) => {
  const { game } = ctx.gameMeta;
  const gameID = getCookie(ctx, 'gameID');
  const arePaired = game.isLobbyFull(gameID);

  if (!arePaired) return ctx.body(null, 204);
  return ctx.redirect('/game.html', 303);
};

const setGameCxt = async (ctx, next) => {
  const { game } = ctx.gameMeta;
  const gameID = +getCookie(ctx, 'gameID');
  const playerID = +getCookie(ctx, 'playerID');
  const ttt = game.tttInstanceOf(gameID);
  const currentPlayerID = +ttt.getCurrentPlayer();

  ctx.gameMeta.gameCxt = { ttt, currentPlayerID, playerID };
  return await next();
};

const serveGameBoard = (ctx) => {
  const { game, gameCxt } = ctx.gameMeta;
  const { ttt, currentPlayerID } = gameCxt;
  const name = game.getPlayerName(currentPlayerID);
  const [board, isGameOver] = [ttt.getBoard(), ttt.isGameOver()];

  return ctx.json({ name, board, isGameOver });
};

const shouldPlay = async (ctx, next) => {
  const { gameCxt } = ctx.gameMeta;
  const { currentPlayerID, playerID, ttt } = gameCxt;

  if (ttt.isGameOver()) return await next();
  if (currentPlayerID !== playerID) return ctx.body(null, 409);
  return ctx.body(null, 204);
};

const validatePlayer = async (ctx, next) => {
  const { gameCxt } = ctx.gameMeta;
  const { currentPlayerID, playerID } = gameCxt;

  if (currentPlayerID !== playerID) return ctx.body(null, 409);
  await next();
};

const mark = async (ctx, next) => {
  const { gameCxt } = ctx.gameMeta;
  const { ttt } = gameCxt;
  const { row, col } = ctx.req.param();
  ttt.mark(+row, +col);

  if (!ttt.isGameOver()) return ctx.body(null, 204);
  await next();
};

const redirectTo = (path) => (ctx) => ctx.redirect(path, 303);

const serveResults = (ctx) => {
  const { gameCxt, game } = ctx.gameMeta;
  const { ttt } = gameCxt;
  const symbol = ttt.getCurrentSymbol();
  const [isDraw, winner] = [ttt.isDraw(), game.getPlayerName(ttt.winner)];

  return ctx.json({ isDraw, winner, symbol });
};

export {
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
};
