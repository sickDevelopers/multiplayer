const _ = require('lodash');

const Game = function() {
  this.state = {
    players: []
  }
  this.lastSentState = null;
  this.changed = false;
}

Game.prototype.setChanged = function() {
  this.changed = true;
}

// true se lo stato è cambiato
Game.prototype.diff = function() {
  if (this.lastSentState == null) {
    return true;
  }
  return this.changed;
}

Game.prototype.removePlayer = function(id) {
  _.remove(this.state.players, p => p.id === id);
  this.setChanged();
}

Game.prototype.updateLastSentState = function() {
  this.lastSentState = Object.assign({}, this.state);
  this.changed = false;
}

Game.prototype.updateFromInput = function(inputBuffer) {

  console.log('updateFromInput', inputBuffer);

  const keys = Object.keys(inputBuffer);

  keys.forEach(playerId => {
    const player = _.find(this.state.players, p => p.id === playerId);

    // muovo utente
    const moves = _.flatten(inputBuffer[playerId]);

    for (let i = 0; i < moves.length; i++) {

      if(!player) {
        return;
      }

      switch (moves[i].keyCode) {
        case 'a':
          player.pos.x -= 5;
          break;
          case 'd':
            player.pos.x += 5;
            break;
            case 'w':
              player.pos.y -= 5;
              break;
              case 's':
                player.pos.y += 5;
                break;
        default:
          break;
      }

    }

    this.setChanged();


  })

}

Game.prototype.addPlayer = function(socketId) {
  this.state.players.push({
    id : socketId,
    pos: {
      x: Infinity,
      y: Infinity
    }});
  this.setChanged();
}

Game.prototype.setPlayerPosition = function(id, position) {
  const player = _.find(this.state.players, p => p.id === id);
  player.pos = {
    x: position[0],
    y: position[1]
  }
  this.setChanged();
}

module.exports = Game;
