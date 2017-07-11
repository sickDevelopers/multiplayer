const GameCore = require('./GameCore');
const Player = require('./Player');

const GameCore_Client = function(renderer) {

  this.fakeLag = 0;

  // ping configuration
  this.pingTick = 1000;
  this.netLatency = 0;
  this.netPing = 0.001;
  this.lastPing = 0.0001;

  this.renderer = renderer;

  this.clientTime = 0.01;
  this.netOffset = 100; //100 ms latency between server and client interpolation for other clients
  this.serverTime = 0.01;

  // approach to net logic
  this.naiveApproach = true;
  this.clientSidePrediction = false;
  this.serverReconciliation = false;

  // input
  this.inputSequence = 0;

  this.serverUpdates = [];

  this.io = require('socket.io-client');
  this.serverUri = 'http://localhost';

  this.player;

  this.clientConnect();

  this.createClientPingTimer();

}

GameCore_Client.prototype = new GameCore();
GameCore_Client.prototype.constructor = GameCore_Client;


GameCore_Client.prototype.setViewport = function(width, height) {
  this.viewport = {
    x: 0,
    y: 0,
    width: width,
    height: height
  }
}

GameCore_Client.prototype.adjustViewport = function() {
  this.viewport = Object.assign({}, this.viewport, {
    x: this.player.body.position[0] - (this.viewport.width / 2),
    y: this.player.body.position[1] - (this.viewport.height / 2)
  });
  // console.log(this.viewport);
}

GameCore_Client.prototype.onServerMessage = function(channel, data) {
  switch(channel) {
    case 'p':
      this.onPong(data);
      break;
    case 'onserverupdate':
      this.onServerUpdate(data);
      break;
    case 'playerId':
      this.setLocalPlayerId(data);
      break;
    case 'playerDisconnected':
      this.removePlayer(data);
      break;
    default:
      break;
  }
}

GameCore_Client.prototype.setLocalPlayerId = function(id) {
  console.log('player id', id);
  this.player.id = id;
}

GameCore_Client.prototype.onServerUpdate = function(data) {

  this.serverTime = data.t;
  //Update our local offset time from the last server update
  this.clientTime = this.serverTime - (this.netOffset/1000);

  if (this.naiveApproach) {

    this.lanApproachUpdate(data);

  } else {
    // implementare metodo per lag di rete



    this.serverUpdates.push(data);

  }

}

GameCore_Client.prototype.lanApproachUpdate = function(data) {
  Object.keys(data.positions).forEach(pId => {

    if (pId === this.player.id) {

      this.player.body.position = data.positions[pId].pos
      this.player.body.angle = data.positions[pId].angle;
      this.player.health = data.positions[pId].health;
      this.player.points = data.positions[pId].points;
      this.player.isAlive = data.positions[pId].isAlive;

    } else {

      if(!this.players[pId]) {
        console.log('player joined');
        this.addPlayer(pId);
      }
      this.players[pId].body.position = data.positions[pId].pos;
      this.players[pId].body.angle = data.positions[pId].angle;
      this.players[pId].health = data.positions[pId].health;
      this.players[pId].points = data.positions[pId].points;
      this.players[pId].isAlive = data.positions[pId].isAlive;

    }

  })

  Object.keys(data.bullets).forEach(bulletId => {

    let endPointX = data.bullets[bulletId].pos[0],
      endPointY = data.bullets[bulletId].pos[1],
      startPointX = this.player.body.position[0],
      startPointY = this.player.body.position[1];

      const ownerId = data.bullets[bulletId].owner;
      let owner = this.players[ownerId] || this.player;

      let bulletParams = {
        bulletId,
        startPointX ,
        startPointY,
        owner
      }

    if (!this.bullets[bulletId]) {
      this.addBullet(bulletParams);
    } else {
      this.bullets[bulletId].body.position = [data.bullets[bulletId].pos[0], data.bullets[bulletId].pos[1]];
    }

  });

  // eliminazione dei bullet presenti
  Object.keys(this.bullets).forEach(bulletId => {
    if (!data.bullets[bulletId]) {
      this.world.removeBody(this.bullets[bulletId].body);
      delete this.bullets[bulletId];
    }
  })

  this.adjustViewport();
}


GameCore_Client.prototype.clientConnect = function() {
  this.socket = this.io.connect('http://localhost:' + this.gamePort);
  this.socket.on('connect', () => {
    this.player = new Player();
  })
  this.socket.on('connected', () => {
    console.log('connected');
  })
  this.socket.on('disconnect', () => {
    this.onDisconnect();
  })
  this.socket.on('error', () => {
    console.log('error');
  })
  this.socket.on('message', (channel, message) => {
    this.onServerMessage(channel, message);
  })
}

GameCore_Client.prototype.onPong = function(data) {
  this.netPing = new Date().getTime() - parseFloat(data);
  this.netLatency = this.netPing / 2;
}

GameCore_Client.prototype.createClientPingTimer = function() {
  setInterval(() => {
    this.lastPingTime = new Date().getTime() - this.fakeLag;
    this.socket.send('p', this.lastPingTime);
  }, this.pingTick)
}

GameCore_Client.prototype.onDisconnect = function() {
  console.log("disconnect");
}

/*
Raggruppa gli input e li manda al server
Se this.clientSidePrediction è true, allora fa client side prediction
*/
GameCore_Client.prototype.handleInput = function() {

  var xDir = 0;
  var yDir = 0;
  var input = [];
  this.clientHasInput = false;

  // key A
  if (this.renderer.keyIsDown(65)) {
    xDir = -1;
    input.push('l');
  }
  // key D
  if (this.renderer.keyIsDown(68)) {
    xDir = 1;
    input.push('r')
  }
  // key W
  if (this.renderer.keyIsDown(87)) {
    yDir = -1;
    input.push('u')
  }
  // key S
  if (this.renderer.keyIsDown(83)) {
    yDir = 1;
    input.push('d')
  }

  input.push('m:' + this.renderer.mouseX + ':' + this.renderer.mouseY);

  if (input.length) {
    this.inputSequence += 1;
    this.player.inputs.push({
      inputs: input,
      time: this.localTime.toFixed(3),
      seq: this.inputSequence
    })

    const packetSent = this.player.inputs;

    // console.log('sent', packetSent);
    this.socket.send('input', packetSent);

    // Do client-side prediction.
    // if (this.clientSidePrediction) {
    //   // this.entities[this.entity_id].applyInput(input);
    //   this.processInput(this.player);
    // }

    this.player.inputs = [];

    // return this.createVectorFromDirection(xDir, yDir);
    return [xDir, yDir];

  } else {
    return [0, 0];
  }

}

GameCore_Client.prototype.handleMouseClick = function(x, y) {
  this.inputSequence += 1;

  x = this.getWorldX(x);
  y = this.getWorldY(y);

  // console.log('World click', x, y);

  let mouseInput = {
    inputs: ['click:'+ x + ':' + y],
    time: this.localTime.toFixed(3),
    seq: this.inputSequence
  }
  this.player.inputs.push(mouseInput);
  // console.log(this.player.inputs);
}


GameCore_Client.prototype.clientUpdate = function() {
  // console.log('clientUpdate');
  this.handleInput();

  // this.player.inputs = [];

}

module.exports = GameCore_Client;
