const _ = require('lodash');
const Player = require('./Player')
const Bullet = require('./Bullet')
const Obstacle = require('./Obstacle')

const p2 = require('p2');

const GameCore = function(gameInstance) {

  this.gameInstance = gameInstance;

  // timers
  this.deltaTime = 1 / 1000;
  this.lastFrameTime = 0.0001;
  this.physicsTimeStep = 1 / 60;


  this.localTime = 0.016;            //The local
  this.deltaTime = new Date().getTime();    //The local timer delta
  this.deltaTimeEstimated = new Date().getTime();   //The local timer last frame time

  // this.mainLoopUpdateRate = 2000;
  this.mainLoopUpdateRate = 1000 / 30;

  this.server = (this.gameInstance !== undefined);
  this.socket = null;

  this.players = {};

  this.bullets = {};

  this.obstacles = {};

  this.playerSpeed = 20;

  this.gamePort = 8502;

  this.world = new p2.World({
    gravity: [0, 0]
  });

  this.buildMap();

  this.createWorldEvents();

  this.createTimer();

}

GameCore.prototype.createWorldEvents = function() {

  this.world.on("beginContact",function(event){

      console.log('collision');

      // Check if our sensor body is involved in this contact event.
      // This might be false if the user added more bodies via the
      // GUI, that collides.
      // if(event.bodyA===body || event.bodyB===body){
      //
      //     // Check if the body is added to the world. This should be
      //     // true, but better be safe.
      //     if(body.world){
      //
      //         // Remove the body from the world.
      //         world.removeBody(body);
      //     }
      // }
  });

}

// Main loop update
GameCore.prototype.update = function(t) {

  this.deltaTime = this.lastFrameTime ? ((t - this.lastFrameTime) / 1000.0).toFixed(3) : 0.016;

  this.lastFrameTime = t;

  if (this.server) {
    this.serverUpdate();
  } else {
    this.clientUpdate();
  }

  setTimeout(() => {
    this.update(new Date().getTime())
  }, this.mainLoopUpdateRate);

}

GameCore.prototype.processInput = function(player) {

  let xDir = 0;
  let yDir = 0;

  // let movementVector = this.createVectorFromDirection(0, 0);
  let movementVector = [0, 0];
  let angle = 0
  let newBullets = [];

  if (player.inputs.length) {
    for (var i = 0; i < player.inputs.length; i++) {

        // controllo sequenzialità degli input
        if (player.inputs[i].seq <= player.lastInputSeq) {
          continue
        }

        let inputsArray = player.inputs[i];

        for (var j = 0; j < inputsArray.inputs.length; j++) {
          const k = inputsArray.inputs[j];
          switch (k) {
            case 'l':
              xDir -= 1;
              break;
            case 'r':
              xDir += 1;
              break;
            case 'u':
              yDir -= 1;
              break;
            case 'd':
              yDir += 1;
              break;
          }

          // mouse position
          if(k[0] === 'm') {
              let splitted = k.split(':');
              angle = Math.atan2(splitted[2] - player.body.position[1], splitted[1] - player.body.position[0]);

              // console.log('angle', angle)

              angle = angle * (180/Math.PI);
              // player.body.angle = angle;
          }

          // click del mouse
          if (k[0] === 'c' && k[1] === 'l') {
            let splitted = k.split(':');
            newBullets.push([splitted[1], splitted[2]]);
          }

        }

        // movementVector = this.createVectorFromDirection(xDir, yDir) // creazione del vettore con p2
        movementVector = [xDir, yDir];

        // pulizia degli inputs
        if (player.inputs.length) {
          player.lastInputTime = player.inputs[player.inputs.length -1].time;
          player.lastInputSeq = player.inputs[player.inputs.length -1].seq;
        }

    }
  }

  return {
    movementVector,
    angle,
    newBullets
  };

}

GameCore.prototype.createTimer = function(){
    setInterval(() => {
        this.deltaTime = new Date().getTime() - this.deltaTimeEstimated;
        this.deltaTimeEstimated = new Date().getTime();
        this.localTime += this.deltaTime / 1000.0;
    }, 4);
}


GameCore.prototype.createVectorFromDirection = function(xDir, yDir) {
  return {
    x: (xDir * (this.playerSpeed)),
    y: (yDir * (this.playerSpeed))
  }
}

GameCore.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
    //Add a 2d vector with another one and return the resulting vector
GameCore.prototype.v_add = function(a,b) {
  return {
    x: (parseFloat(a.x) + parseFloat(b.x)).toFixed(3),
    y: (parseFloat(a.y) + parseFloat(b.y)).toFixed(3)
  };
};

    //Simple linear interpolation
GameCore.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
    //Simple linear interpolation between 2 vectors
GameCore.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

GameCore.prototype.buildMap = function() {
  console.log('build map');
  const obstacle = new Obstacle();
  obstacle.id = Math.random().toString(36).substring(2);
  this.obstacles[obstacle.id] = obstacle;

  this.world.addBody(obstacle.body);

}

GameCore.prototype.addPlayer = function(socketId) {
  console.log('add Player');
  var p = new Player();
  p.id = socketId;
  this.players[p.id] = p;

  this.world.addBody(p.body);
}

GameCore.prototype.addBullet = function(bulletId, startX, startY, xDir, yDir) {
  var b = new Bullet();
  b.body.position = [startX, startY];

  b.id = bulletId;
  this.bullets[b.id] = b;
  this.world.addBody(b.body);
}

GameCore.prototype.removePlayer = function(id) {
  delete this.players[id];
}

module.exports = GameCore;
