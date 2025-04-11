import { TicTacToe } from './ttt.js';
import _ from 'npm:lodash';

class TttGameRoom {
  #waitingPlayers;
  #games;
  #players;
  #gameID;
  #playerID;

  constructor(maxPlayers) {
    this.#gameID = 500;
    this.#playerID = 100;
    this.#waitingPlayers = [];
    this.#games = new Map();
    this.#players = new Map();
    this.maxPlayers = maxPlayers;
  }

  #isValidPlayerID(id) {
    return this.#players.has(Number(id));
  }

  addToRoom(name, id) {
    if (this.#waitingPlayers.length >= this.maxPlayers) return null;
    const playerID = this.#isValidPlayerID(id) ? id : this.#playerID++;

    this.#players.set(playerID, name);
    this.#waitingPlayers.push(playerID);

    return [playerID, this.#gameID];
  }

  isLobbyFull(gameID) {
    const isFull = this.#waitingPlayers.length === this.maxPlayers;

    if (isFull && !this.#games.has(this.#gameID)) {
      this.#intializeGame();
    }

    return isFull || this.#games.has(Number(gameID)); //this is odd,  refactor...
  }

  #intializeGame() {
    const players = this.#waitingPlayers;
    const ttt = new TicTacToe(...players);
    this.#games.set(this.#gameID, { ttt, players });

    this.#waitingPlayers = [];
    this.#gameID += 1;
  }

  tttInstanceOf(gameID) {
    const { ttt } = this.#games.get(Number(gameID));
    return ttt;
  }

  getPlayerName(playerID) {
    return this.#players.get(Number(playerID));
  }
}

export default TttGameRoom;
