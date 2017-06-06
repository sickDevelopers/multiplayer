var server = require('http').createServer();
var io = require('socket.io')(server);
const _ = require('lodash');

const Game = require('./Game.js');

const frameSize = 30;
let frameIndex = 0;
const buffer = [];
let inputs = {};

const connectedClients = [];
const socketsPool = [];

const game = new Game();

setInterval(function() {

  game.updateFromInput(inputs);
  inputs = {};

  frameIndex++;
  if (game.diff()) {
    broadcastMessage('gameState', game.state);
    game.updateLastSentState();
  }
}, frameSize)

function broadcastMessage(channel, message) {
  for (let i = 0; i < socketsPool.length; i++) {
    socketsPool[i].emit(channel, message)
  }
}

io.on('connection', socket => {

  setInterval(function() {
      socket.emit('frameIndex', frameIndex);
  }, frameSize)

  socketsPool.push(socket);
  connectedClients.push(socket.client.id);
  game.addPlayer(socket.client.id);

  socket.emit('clientId', socket.client.id);
  broadcastMessage('clientData', connectedClients);

  socket.on('event', data => {
    console.log(data);
  });

  socket.on('input', inputBuffer => {
    if(!inputs[socket.client.id]) {
      inputs[socket.client.id] = [];
    }
    inputs[socket.client.id].push(...inputBuffer);
  })

  socket.on('playerPosition', position => {
    game.setPlayerPosition(socket.client.id, position);
  })

  socket.on('disconnect', () => {
    console.log('disconnected', socket.client.id)
    const id = socket.client.id;
    game.removePlayer(socket.client.id);
    _.remove(socketsPool, s => s.client.id === id);
    _.remove(connectedClients, c => c === id);
    broadcastMessage('clientData', connectedClients);
  });

});


server.listen(3000);
