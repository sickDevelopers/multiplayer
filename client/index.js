import GameCore_Client from '../common/GameCore_Client';
import renderer from './app/renderer';
import Player from '../common/Player';



import p5 from 'p5';

setTimeout(function() {
  console.log('document ready');

  var rend = new p5(renderer);
  var core = new GameCore_Client(rend);

  let {height, width} = renderer.getDocumentSize();
  console.log(height, width)
  core.setViewport(width, height);

  core.player = new Player();

  core.update();

  rend.draw = () => {
    rend.background(51);



    rend.strokeWeight(1);
    rend.stroke('#ffffff');
    rend.fill('#fff');
    rend.point(core.getScreenX(0), core.getScreenY(0))

    // PLAYER
    rend.noStroke();
    rend.fill('#fff');
    rend.stroke(core.player.color);
    rend.ellipse(
      core.getScreenX(core.player.body.position[0]),
      core.getScreenY(core.player.body.position[1]),
      core.player.getRenderCircle()[0],
      core.player.getRenderCircle()[1]
    );

    // LIFE BAR
    rend.rectMode(rend.CORNER);
    rend.fill('#00ff00');
    rend.noStroke();
    rend.rect(
      20, 20, core.player.health * 10, 20
    )

    // LIFE BAR STROKE
    rend.rectMode(rend.CORNER);
    rend.noFill();
    rend.stroke('#ffffff');
    rend.rect(
      20, 20, 100, 20
    )

    // ALTRI PLAYERS

    for (let player in core.players) {
      if (core.players[player].isAlive) {
          rend.fill('#fff');
      } else {
        rend.fill('gray');
      }

      rend.stroke(core.players[player].color);
      rend.ellipse(
        core.getScreenX(parseFloat(core.players[player].body.position[0])),
        core.getScreenY(parseFloat(core.players[player].body.position[1])),
        core.players[player].getRenderCircle()[0],
        core.players[player].getRenderCircle()[1]
      );

      // contenuto della barra vita
      rend.rectMode(rend.CORNER);
      rend.fill('#00ff00');
      rend.noStroke();
      rend.rect(
        core.getScreenX(parseFloat(core.players[player].body.position[0])) - 10,
        core.getScreenY(parseFloat(core.players[player].body.position[1])) - 23,
        core.players[player].health * 2, 6
      )

      // strke barra vita
      rend.rectMode(rend.CENTER);
      rend.noFill();
      rend.stroke('#ffffff');
      rend.rect(
        core.getScreenX(parseFloat(core.players[player].body.position[0])),
        core.getScreenY(parseFloat(core.players[player].body.position[1])) - 20,
        20, 5
      )
    }


    rend.fill('#fff');
    for (let bullet in core.bullets) {
      rend.stroke(core.bullets[bullet].owner.color);
      rend.ellipse(
        core.getScreenX(core.bullets[bullet].body.position[0]),
        core.getScreenY(core.bullets[bullet].body.position[1]),
        10, 10);
    }

    for (let obstacleId in core.obstacles) {

      rend.rectMode(rend.CENTER);
      rend.strokeWeight(1);
      rend.stroke('#ffffff');
      rend.noFill()

      switch (core.obstacles[obstacleId].type) {
        case 'rect':
          rend.rect(
            core.getScreenX(core.obstacles[obstacleId].body.position[0]),
            core.getScreenY(core.obstacles[obstacleId].body.position[1]),
            core.obstacles[obstacleId].shape.width,
            core.obstacles[obstacleId].shape.height
          );
          break;
        default:
          break;
      }
    }


  }

  rend.mouseClicked = function() {
      core.handleMouseClick(rend.mouseX, rend.mouseY);
  }


}, 200)
