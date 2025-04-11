import { assertEquals, assert } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';
import TttGameRoom from '../src/game-room.js';

describe('App', () => {});

describe('GET /not-Found', () => {
  it('should respond with not Found 404', async () => {
    const app = createApp();
    const response = await app.request('/not-found');
    assertEquals(response.status, 404);
  });
});

describe('GET  /tic-tac-toe/join-game', () => {
  it('should respond with no-Content 204 if players are not enough', async () => {
    const game = new TttGameRoom(2);
    const app = createApp(game);
    const response = await app.request('/tic-tac-toe/join-game');

    assertEquals(response.status, 204);
    assertEquals(await response.text(), '');
  });
});

describe('GET /tic-tac-toe/join-game', () => {
  it('should respond with redirection', async () => {
    const game = new TttGameRoom(2);
    game.addToRoom('alice');
    game.addToRoom('bob');

    const app = createApp(game);
    const response = await app.request('/tic-tac-toe/join-game');

    assertEquals(response.headers.get('location'), '/game.html');
    assertEquals(response.status, 303);
  });
});

describe('POST /tic-tac-toe/join-lobby', () => {
  it('should set a cookie in the context', async () => {
    const game = new TttGameRoom(2);
    const app = createApp(game);
    const fd = new FormData();
    fd.append('player-name', 'alice');

    const response = await app.request('/tic-tac-toe/join-lobby', {
      method: 'POST',
      body: fd,
    });

    const actualCookies = response.headers.get('set-cookie');

    assert(actualCookies.includes('gameID=500'));
    assert(actualCookies.includes('playerID=100'));
  });
});

describe('POST /tic-tac-toe/join-lobby', () => {
  it('should respond with redirection to wait.html', async () => {
    const game = new TttGameRoom(2);
    const app = createApp(game);

    const response = await app.request('/tic-tac-toe/join-lobby', {
      method: 'POST',
    });

    assertEquals(response.status, 303);
  });
});

describe('GET /tic-tac-toe/* demo game', () => {
  it('should respond with the crt state of board and player name', async () => {
    const game = new TttGameRoom(2);
    const app = createApp(game);

    const client1 = new FormData();
    client1.append('player-name', 'alice');

    const client2 = new FormData();
    client2.append('player-name', 'bob');

    const cl1ReqOptions = { method: 'POST', body: client1 };
    const cl1ReqCookie = { headers: { cookie: 'gameID=500; playerID=100' } };

    const cl2ReqOptions = { method: 'POST', body: client2 };
    const cl2ReqCookie = { headers: { cookie: 'gameID=500; playerID=101' } };

    await app.request('/tic-tac-toe/join-lobby', cl1ReqOptions);
    await app.request('/tic-tac-toe/join-lobby', cl2ReqOptions);
    await app.request('/tic-tac-toe/join-game', cl1ReqCookie);
    await app.request('/tic-tac-toe/join-game', cl2ReqCookie);

    const cl1Res = await app.request('/tic-tac-toe/board', cl1ReqCookie);
    const { name: client1Turn1, board: pl1Board } = await cl1Res.json();

    const cl2Res = await app.request('/tic-tac-toe/board', cl2ReqCookie);
    const { name: client2Turn1, board: pl2Board } = await cl2Res.json();

    assertEquals(client1Turn1, 'alice');
    assert(pl1Board instanceof Array);

    assertEquals(client2Turn1, 'alice');
    assert(pl2Board instanceof Array);

    await app.request('/tic-tac-toe/mark/0/0', {
      method: 'POST',
      headers: { cookie: 'gameID=500; playerID=100' }, //alice move
    });

    const cl1Res2 = await app.request('/tic-tac-toe/board', cl1ReqCookie);
    const { name: client1Turn2 } = await cl1Res2.json();

    const cl2Res2 = await app.request('/tic-tac-toe/board', cl2ReqCookie);
    const { name: client2Turn2 } = await cl2Res2.json();

    assertEquals(client1Turn2, 'bob');
    assertEquals(client2Turn2, 'bob');

    await app.request('/tic-tac-toe/mark/0/1', {
      method: 'POST',
      headers: { cookie: 'gameID=500; playerID=101' }, //bob move
    });

    const cl1Res3 = await app.request('/tic-tac-toe/board', cl1ReqCookie);
    const { name: client1Turn3 } = await cl1Res3.json();

    const cl2Res3 = await app.request('/tic-tac-toe/board', cl2ReqCookie);
    const { name: client2Turn3 } = await cl2Res3.json();

    assertEquals(client1Turn3, 'alice');
    assertEquals(client2Turn3, 'alice');

    await app.request('/tic-tac-toe/mark/1/1', {
      method: 'POST',
      headers: { cookie: 'gameID=500; playerID=100' }, //alice move
    });

    const cl1Res4 = await app.request('/tic-tac-toe/board', cl1ReqCookie);
    const { name: client1Turn4 } = await cl1Res4.json();

    const cl2Res4 = await app.request('/tic-tac-toe/board', cl2ReqCookie);
    const { name: client2Turn4 } = await cl2Res4.json();

    assertEquals(client1Turn4, 'bob');
    assertEquals(client2Turn4, 'bob');

    const cl2PollReqSuccess = await app.request(
      '/tic-tac-toe/ready-to-play',
      cl2ReqCookie
    );

    assertEquals(cl2PollReqSuccess.status, 204);

    await app.request('/tic-tac-toe/mark/1/2', {
      method: 'POST',
      headers: { cookie: 'gameID=500; playerID=101' }, //bob move
    });

    const cl2PollReqReject = await app.request(
      '/tic-tac-toe/ready-to-play',
      cl2ReqCookie
    );

    assertEquals(cl2PollReqReject.status, 409);
    const cl1Res5 = await app.request('/tic-tac-toe/board', cl1ReqCookie);
    const { name: client1Turn5 } = await cl1Res5.json();

    const cl2Res5 = await app.request('/tic-tac-toe/board', cl2ReqCookie);
    const { name: client2Turn5 } = await cl2Res5.json();

    assertEquals(client1Turn5, 'alice');
    assertEquals(client2Turn5, 'alice');

    const cl1Res6 = await app.request('/tic-tac-toe/mark/2/2', {
      method: 'POST',
      headers: { cookie: 'gameID=500; playerID=100' }, //alice move
    });

    const cl2Res6 = await app.request(
      '/tic-tac-toe/ready-to-play',
      cl2ReqCookie
    );

    assertEquals(cl1Res6.status, 303);
    assertEquals(cl1Res6.headers.get('location'), '/result.html');
    assertEquals(cl2Res6.status, 303);
    assertEquals(cl2Res6.headers.get('location'), '/result.html');
  });
});

describe('GET /tic-tac-toe/play-again', () => {
  it('should redirect client to lobby again with same playerID and diff gameID', async () => {
    const game = new TttGameRoom(2);
    const app = createApp(game);

    const client1 = new FormData();
    client1.append('player-name', 'alice');

    const client2 = new FormData();
    client2.append('player-name', 'bob');
    const cl1ReqOptions = { method: 'POST', body: client1 };
    const cl1ReqCookie = { headers: { cookie: 'gameID=500; playerID=100' } };

    const cl2ReqOptions = { method: 'POST', body: client2 };
    const cl2ReqCookie = { headers: { cookie: 'gameID=500; playerID=101' } };

    await app.request('/tic-tac-toe/join-lobby', cl1ReqOptions);
    await app.request('/tic-tac-toe/join-lobby', cl2ReqOptions);
    await app.request('/tic-tac-toe/join-game', cl1ReqCookie);
    await app.request('/tic-tac-toe/join-game', cl2ReqCookie);
    const res = await app.request('/tic-tac-toe/play-again', cl1ReqCookie);
    const actualCookies = res.headers.get('set-cookie');
    assertEquals(res.status, 303);

    assertEquals(res.headers.get('location'), '/wait.html');

    assert(actualCookies.includes('gameID=501'));
    assert(actualCookies.includes('playerID=100'));
  });
});
