var p2 = require('p2');

const Player = function(params) {

  this.inputs = [];

  Object.assign(this, params);

  this.shape = new p2.Circle({
    radius: 10
  });

  this.body = new p2.Body({
    mass: 1,
    position: [50,50],
    velocity: [0, 0],
    angularVelocity: 0,
    damping: 0.95
  })
  this.body.addShape(this.shape);

}

Player.prototype.getRenderCircle = function() {
  return [
    this.shape.radius * 1.8,
    this.shape.radius * 1.8,
  ]
}

module.exports = Player;
