
var game = {
  players: []
};

var clientFrameIndex = null;
var frameSize = 30;

var inputBuffer = [];

startFrameIndexTimer = function(value) {
  clientFrameIndex = value;
  frameInterval = setInterval(function() {
    clientFrameIndex++;
    // console.log(clientFrameIndex);
  }, frameSize)
}

serverFrameIndex = 0

var Network = {

  socket: null,
  firstConnection : true,
  socketId: null,

  openSocket: function() {
    Network.socket = io('http://localhost:3000');
    Network.socket.on('connect', Network.onConnect)
  },

  onConnect: function() {
    console.log('connected')
    if(Network.firstConnection) {
        Network.setupEvents()
    }
    Network.firstConnection = false;
  },

  setupEvents: function() {

    Network.socket.on('frameIndex', function(data) {
      serverFrameIndex = data;
      if (!clientFrameIndex) {
        startFrameIndexTimer(data);
      }
    })

    Network.socket.on('clientId', function(data) {
      Network.socketId = data;
    })

    Network.socket.on('clientData', function(data) {
      console.log(data);
    })

    Network.socket.on('gameState', function(data) {
      console.log('gameState', data);
      var player = Object.assign({}, _.find(game.players, function(p) {
        return p.id === Network.socketId
      }));

      mergeGameData(data);

      // Object.assign(game, data);
      // game.players[Network.socketId] = player;

    })

    Network.socket.on('disconnect', function() {
      console.log('disconnect')
    })
  }

}

function mergeGameData(data) {

  _.assignIn(game, data);

}

var Input = function() {
  this.keyCode = null;
}

document.addEventListener('keydown', function(event) {
  var keyName = event.key;
  var input = new Input();
  input.keyCode = event.key;
  inputBuffer.push(input);

  movePlayer(input);
})

function sendInputs() {
  if (inputBuffer.length > 0) {
    Network.socket.emit('input', inputBuffer);
    inputBuffer = [];
  }
}

Network.openSocket();

setInterval(sendInputs, frameSize);

function mouseClicked() {

  var player = _.find(game.players, function(p) {
    return p.id === Network.socketId
  });

  if (!player.pos.x) {
      Network.socket.emit('playerPosition', [mouseX, mouseY])

      player.pos = {
        x : mouseX,
        y: mouseY
      };
  }
  return false;
}

function setup() {
  createCanvas(300, 300);
  background(51);
}

function draw() {
  background(51);
  strokeWeight(10);
  stroke(255);
  for(var i = 0; i < game.players.length; i++) {
    point(game.players[i].pos.x, game.players[i].pos.y);
  }

}

function movePlayer(input) {

  var player = _.find(game.players, function(p) {
    return p.id === Network.socketId;
  })

  switch (input.keyCode) {
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
