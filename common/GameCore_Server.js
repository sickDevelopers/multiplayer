const GameCore = require('./GameCore');

const GameCore_Server = function() {

  this.serverTime = 0;
  this.lastState = {};

  this.updatePhysicsRate = 1000 / 30;

  this.httpsServer = require('http').createServer();
  this.io = require('socket.io')(this.httpsServer);

  this.socketsPool = [];

  this.createPhysicsSimulationTimer();

}

GameCore_Server.prototype = new GameCore({});
GameCore_Server.prototype.constructor = GameCore_Server;

GameCore_Server.prototype.start = function() {
  this.httpsServer.listen(this.gamePort);
  this.io.on('connection', socket => {
    this.socketsPool.push(socket);
    this.addPlayer(socket.client.id);
    socket.on('message', (channel, message) => {
      this.onClientMessage(socket, channel, message);
    })
    socket.on('p', data => {
      this.onPing(data);
    })
    socket.on('disconnect', () => {
      console.log('disconnect', socket.client.id);
      this.removePlayer(socket.client.id);
      this.broadcast('playerDisconnected', socket.client.id);
    })
    socket.send('playerId', socket.client.id);
  });
  this.update();
}

GameCore_Server.prototype.onClientMessage = function(socket, channel, message) {
  switch(channel) {
    case 'p':
      this.onPing(socket, message);
      break;
    case 'input':
      this.handleClientInput(socket, message);
      break;
    default:
      break;
  }
}

GameCore_Server.prototype.handleClientInput = function(socket, inputs) {
  this.players[socket.client.id].inputs.push(...inputs);
}

GameCore_Server.prototype.onPing = function(socket, data) {
  socket.send('p', data);
}

GameCore_Server.prototype.broadcast = function(channel, message) {
  for (let i = 0; i < this.socketsPool.length; i++) {
    this.socketsPool[i].send(channel, message)
  }
}

GameCore_Server.prototype.updatePhysics = function() {
  Object.keys(this.players).forEach(id => {
    this.updateSinglePlayerPhysics(this.players[id]);
  })

  Object.keys(this.bullets).forEach(id => {
    this.updateBulletsPhysics(this.bullets[id]);
  })

  this.world.step(this.physicsTimeStep);

}

GameCore_Server.prototype.updateBulletsPhysics = function(bullet) {

  bullet.life--;

  if (bullet.life <= 0) {
    this.world.removeBody(bullet.body);
    delete this.bullets[bullet.id];
  }
}

GameCore_Server.prototype.updateSinglePlayerPhysics = function(player) {


  let {movementVector, angle, newBullets} = this.processInput(player);

  if (!player.isAlive) {
    this.world.removeBody(player.body);
    return;
  }

  movementVector[0] = this.playerSpeed * movementVector[0];
  movementVector[1] = this.playerSpeed * movementVector[1];

  player.body.applyImpulse(movementVector);

  if (angle !== 0) {
    angle = angle * Math.PI / 180;
    player.body.angle = angle;
  }

  var bulletId = Math.random().toString(36).substring(2),
    startX,
    startY,
    endX,
    endY;

  for (let i = 0; i < newBullets.length; i++) {

    // startX = player.body.position[0] + (40 * Math.cos(player.body.angle)),
    // startY = player.body.position[1] + (40 * Math.sin(player.body.angle)),

    startX = player.body.position[0],
    startY = player.body.position[1],


    endX = parseFloat(newBullets[i][0]),
    endY = parseFloat(newBullets[i][1]);

    var bulletDirectionAngle = Math.atan2(endY - startY, endX - startX);

    let bulletParams = {
      bulletId,
      startX,
      startY,
      owner: player.id
    }

    this.addBullet(bulletParams);

    var magnitude = 1000;
    var vector = [Math.cos(bulletDirectionAngle) * magnitude , Math.sin(bulletDirectionAngle) * magnitude];
    this.bullets[bulletId].body.velocity = vector;

  }



  player.inputs = [];

}

// send updates to all clients
GameCore_Server.prototype.serverUpdate = function() {

  this.serverTime = this.localTime;

  this.lastState = {
    positions: Object.keys(this.players).reduce((acc, next) => {
      acc[next] = {
        pos: this.players[next].body.position,
        angle: this.players[next].body.angle,
        health: this.players[next].health,
        points: this.players[next].points,
        isAlive: this.players[next].isAlive
      }
      return acc;
    }, {}),
    bullets: Object.keys(this.bullets).reduce((acc, next) => {
      // console.log('sent bullets', this.bullets[next].body.position);
      acc[next] = {
        pos: this.bullets[next].body.position,
        owner: this.bullets[next].owner
      }
      return acc;
    }, {}),
    inputSequence: Object.keys(this.players).reduce((acc, next) => {
      acc[next] = {
        pos: this.players[next].lastInputSeq,
      }
      return acc;
    }, {}),
    t: this.serverTime
  }

  // send state to all players
  this.broadcast('onserverupdate', this.lastState);

};

GameCore_Server.prototype.createPhysicsSimulationTimer = function() {

    setInterval(() => {
        // this._pdt = (new Date().getTime() - this._pdte)/1000.0;
        // this._pdte = new Date().getTime();

        this.updatePhysics();
    }, this.updatePhysicsRate);

};


module.exports = GameCore_Server;
