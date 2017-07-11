const p2 = require('p2');

const Bullet = function() {

  this.shape = new p2.Circle({
    radius: 10
  });
  // this.shape.sensor = true;

  this.type = 'bullet';

  this.owner;
  this.color = '#ffffff';

  this.life = 30;

  this.body = new p2.Body({
    mass: 10,
    velocity: [0, 0],
    angularVelocity: 0
  })
  this.body.addShape(this.shape);

}

module.exports = Bullet;
