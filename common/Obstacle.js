const p2 = require('p2');

const Obstacle = function(type, x, y, width, height) {

  this.type = type;

  this.shape = new p2.Box({
    width: width,
    height: height
  });

  this.body = new p2.Body({
    velocity: [0, 0],
    angularVelocity: 0,
    position: [x, y]
  })
  this.body.addShape(this.shape);

}

module.exports = Obstacle;
