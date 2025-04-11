import { assert, assertEquals, assertFalse } from 'jsr:@std/assert';
import TttGameRoom from '../src/game-room.js';
import { TicTacToe } from '../src/ttt.js';

Deno.test('should initialize maxPlayer to 2', () => {
  const game = new TttGameRoom(2);

  assertEquals(game.maxPlayers, 2);
});

Deno.test('should allow you to add player into Room maxPlayers 2', () => {
  const game = new TttGameRoom(2);

  assertEquals(game.addToRoom('alice'), [100, 500]);
  assertEquals(game.addToRoom('bob'), [101, 500]);
  assertEquals(game.addToRoom('charlie'), null);
});

Deno.test('should return boolean based on no of players in lobby', () => {
  const game = new TttGameRoom(2);

  assertEquals(game.addToRoom('alice'), [100, 500]);
  assertFalse(game.isLobbyFull());
  assertEquals(game.addToRoom('bob'), [101, 500]);
  assert(game.isLobbyFull());
});

Deno.test('should return the ttt instance when game is intialized', () => {
  const game = new TttGameRoom(2);

  assertEquals(game.addToRoom('alice'), [100, 500]);
  assertFalse(game.isLobbyFull());
  assertEquals(game.addToRoom('bob'), [101, 500]);
  assert(game.isLobbyFull());
  assert(game.tttInstanceOf(500) instanceof TicTacToe);
  assert(game.isLobbyFull(500));

  assertEquals(game.addToRoom('alice'), [102, 501]);
  assertFalse(game.isLobbyFull());
  assertEquals(game.addToRoom('bob'), [103, 501]);
  assert(game.isLobbyFull());
  assert(game.tttInstanceOf(500) instanceof TicTacToe);
});
