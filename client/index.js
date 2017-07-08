import GameCore_Client from '../common/GameCore_Client';
import renderer from './app/renderer';
import Player from '../common/Player';

import p5 from 'p5';

setTimeout(function() {
  console.log('document ready');

  var rend = new p5(renderer);
  var core = new GameCore_Client(rend);
  core.player = new Player();

  core.update();

  rend.draw = () => {
    rend.background(51);
    rend.strokeWeight(1);

    rend.ellipse(core.player.body.position[0], core.player.body.position[1],
      core.player.getRenderCircle()[0], core.player.getRenderCircle()[1]);

    for (let player in core.players) {
      rend.ellipse(parseFloat(core.players[player].body.position[0]), parseFloat(core.players[player].body.position[1]),
       core.players[player].getRenderCircle()[0], core.players[player].getRenderCircle()[1]);
    }

    for (let bullet in core.bullets) {
      rend.ellipse(core.bullets[bullet].body.position[0], core.bullets[bullet].body.position[1],
        10, 10);
    }

    for (let obstacleId in core.obstacles) {
      rend.ellipse(core.obstacles[obstacleId].body.position[0], core.obstacles[obstacleId].body.position[1],
        40, 40);
    }

  }

  rend.mouseClicked = function() {
      core.handleMouseClick(rend.mouseX, rend.mouseY);
  }


}, 200)
