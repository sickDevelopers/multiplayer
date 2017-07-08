const p2 = require('p2');

const Obstacle = function() {

  this.shape = new p2.Circle({
    radius: 40
  });

  this.life = 30;

  this.body = new p2.Body({
    velocity: [0, 0],
    angularVelocity: 0,
    position: [150, 150]
  })
  this.body.addShape(this.shape);

}

module.exports = Obstacle;
