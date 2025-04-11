import { createApp } from './app.js';
import TttGameRoom from './game-room.js';

const main = () => {
  const game = new TttGameRoom(2);
  const app = createApp(game);
  const port = 8000;
  Deno.serve({ port }, app.fetch);
};

main();
