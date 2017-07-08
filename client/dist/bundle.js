/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Network = {

  socket: null,
  firstConnection: true,
  socketId: null,

  openSocket: function openSocket() {
    Network.socket = io('http://localhost:3000');
    Network.socket.on('connect', Network.onConnect);
  },

  onConnect: function onConnect() {
    console.log('connected');
    if (Network.firstConnection) {
      Network.setupEvents();
    }
    Network.firstConnection = false;
  },

  setupEvents: function setupEvents() {

    Network.socket.on('frameIndex', function (data) {
      // ping ?
    });

    Network.socket.on('clientId', function (data) {
      Network.socketId = data;
      // player.id = data;
      // game.players.push(player);
    });

    Network.socket.on('clientData', function (data) {
      console.log(data);
    });

    Network.socket.on('gameState', function (data) {
      console.log('gameState', data);
      var player = Object.assign({}, _.find(game.players, function (p) {
        return p.id === Network.socketId;
      }));
      mergeGameData(data);
    });

    Network.socket.on('disconnect', function () {
      console.log('disconnect');
    });
  }

};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Network = __webpack_require__(0);

var game = {
  players: []
};

var player = {
  id: null,
  color: 'rgb(255,255,255)',
  pos: {
    x: null,
    y: null
  }
};

var keys = {};
var frameSize = 300;

var inputBuffer = [];

startMovementTimer = function startMovementTimer() {
  movementInterval = setInterval(function () {}, frameSize);
};

function mergeGameData(data) {

  _.assignIn(game, data);

  _.remove(game.players, function (p) {
    return p.id === Network.socketId;
  });

  game.players.push(player);
}

document.addEventListener('keydown', function (event) {
  keys[event.key] = true;
});

document.addEventListener('keyup', function (event) {
  keys[event.key] = false;
});

function sendInputs() {
  if (inputBuffer.length > 0) {
    Network.socket.emit('input', inputBuffer);
    inputBuffer = [];
  }
}

Network.openSocket();

setInterval(sendInputs, frameSize);

function mouseClicked() {

  if (!player.pos.x) {
    Network.socket.emit('playerPosition', [mouseX, mouseY]);

    player.pos = {
      x: mouseX,
      y: mouseY
    };

    // startMovementTimer();
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

  movePlayer();

  for (var i = 0; i < game.players.length; i++) {
    var color = game.players[i].color || '#99ff33';
    stroke(color);
    point(game.players[i].pos.x, game.players[i].pos.y);
  }
}

function movePlayer() {

  // var i = new Input(keys);
  // inputBuffer.push(i);

  if (keys.w) {
    player.pos.y -= 2;
  }

  if (keys.s) {
    player.pos.y += 2;
  }

  if (keys.a) {
    player.pos.x -= 2;
  }

  if (keys.d) {
    player.pos.x += 2;
  }
}

/***/ })
/******/ ]);