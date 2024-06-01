console.log = function() {};

var Snake = (function() {

  const INITIAL_TAIL = 4;
  var fixedTail = true;

  var intervalID;

  var tileCount = 20;
  var gridSize = 500 / tileCount;

  const INITIAL_PLAYER = {
	x: Math.floor(tileCount / 2),
	y: Math.floor(tileCount / 2)
  };

  var velocity = {
	x: 0,
	y: 0
  };
  var player = {
	x: INITIAL_PLAYER.x,
	y: INITIAL_PLAYER.y
  };

  var walls = false;

  var fruit = {
	x: 1,
	y: 1
  };

  var trail = [];
  var tail = INITIAL_TAIL;

  var reward = 0;
  var points = 0;
  var pointsMax = 0;

  var ActionEnum = {
	'none': 0,
	'up': 1,
	'down': 2,
	'left': 3,
	'right': 4
  };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  function setup() {
	canv = document.getElementById('gc');
	ctx = canv.getContext('2d');

	game.reset();
  }

  var game = {

	reset: function() {
	  ctx.fillStyle = 'black';
	  ctx.fillRect(0, 0, canv.width, canv.height);

	  tail = INITIAL_TAIL;
	  points = 0;
	  velocity.x = 0;
	  velocity.y = 0;
	  player.x = INITIAL_PLAYER.x;
	  player.y = INITIAL_PLAYER.y;
	  reward = -1;

	  lastAction = ActionEnum.none;

	  trail = [];
	  trail.push({
		x: player.x,
		y: player.y
	  });
	  for (var i = 0; i < tail; i++) trail.push({
		x: player.x,
		y: player.y
	  });
	},

	action: {
	  up: function() {
		if (lastAction != ActionEnum.down) {
		  velocity.x = 0;
		  velocity.y = -1;
		}
	  },
	  down: function() {
		if (lastAction != ActionEnum.up) {
		  velocity.x = 0;
		  velocity.y = 1;
		}
	  },
	  left: function() {
		if (lastAction != ActionEnum.right) {
		  velocity.x = -1;
		  velocity.y = 0;
		}
	  },
	  right: function() {
		if (lastAction != ActionEnum.left) {
		  velocity.x = 1;
		  velocity.y = 0;
		}
	  }
	},

	RandomFruit: function() {
	  if (walls) {
		fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
		fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
	  } else {
		fruit.x = Math.floor(Math.random() * tileCount);
		fruit.y = Math.floor(Math.random() * tileCount);
	  }
	},

	log: function() {
	  console.log('x:' + player.x + ', y:' + player.y);
	  console.log('tail:' + tail + ', trail.length:' + trail.length);
	},

	loop: function() {

	  reward = -0.1;

	  function moveToLargerSide() {
		// Calculate distances to each wall
		let distLeft = player.x;
		let distRight = tileCount - 1 - player.x;
		let distTop = player.y;
		let distBottom = tileCount - 1 - player.y;

		// Find the direction with the largest distance
		let maxDistance = Math.max(distLeft, distRight, distTop, distBottom);

		if (maxDistance === distLeft) {
		  player.x--;
		} else if (maxDistance === distRight) {
		  player.x++;
		} else if (maxDistance === distTop) {
		  player.y--;
		} else {
		  player.y++;
		}
	  }

	  function DontHitWall() {
		if (player.x < 0) moveToLargerSide();
		if (player.x >= tileCount) moveToLargerSide();
		if (player.y < 0) moveToLargerSide();
		if (player.y >= tileCount) moveToLargerSide();
	  }

	  function HitWall() {
		if (player.x < 1 || player.x > tileCount - 2 || player.y < 1 || player.y > tileCount - 2) {
		  game.reset();
		}

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, gridSize - 1, canv.height);
		ctx.fillRect(0, 0, canv.width, gridSize - 1);
		ctx.fillRect(canv.width - gridSize + 1, 0, gridSize, canv.height);
		ctx.fillRect(0, canv.height - gridSize + 1, canv.width, gridSize);
	  }

	  var stopped = velocity.x == 0 && velocity.y == 0;

	  // Update player position *after* checking for walls 
	  player.x += velocity.x;
	  player.y += velocity.y;

	  if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
	  if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
	  if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
	  if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

	  ctx.fillStyle = 'rgba(40,40,40,40)';
	  ctx.fillRect(0, 0, canv.width, canv.height);

	  if (walls) HitWall();
	  else DontHitWall();

	  game.log();

	  if (!stopped) {
		trail.push({
		  x: player.x,
		  y: player.y
		});
		while (trail.length > tail) trail.shift();
	  }

	  if (!stopped) {
		ctx.fillStyle = 'rgba(200,200,200,200)';
		ctx.font = "bold 12px Arial";
		ctx.fillText("(esc) reset", 30, 33);
		ctx.fillText("(space) pause", 30, 20);
		ctx.font = "10px Arial"; // Corrected typo: "fobt" to "font"
		ctx.fillText("Made with love from <¡DOCTYPE html>!", 33, 485);
	  }

	  ctx.fillStyle = '#59813e';
	  for (var i = 0; i < trail.length - 1; i++) {
		ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);

		console.debug(i + ' => player:' + player.x, player.y + ', trail:' + trail[i].x, trail[i].y);
		if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
		  game.reset();
		}
		ctx.fillStyle = 'lime';
	  }
	  ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 3);

	  if (player.x == fruit.x && player.y == fruit.y) {
		if (!fixedTail) tail++;
		points++;
		if (points > pointsMax) pointsMax = points;
		reward = 1;
		game.RandomFruit();

		//This code makes sure that the new fruit doesn't spawn onto the snake's tail.
		while ((function() {
		  for (var i = 0; i < trail.length; i++) {
			if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
			  game.RandomFruit();
			  return true;
			}
		  }
		  return false;
		})());
	  }

	  ctx.fillStyle = 'white';
	  ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 3);

	  if (stopped) {
		ctx.fillStyle = 'rgba(250,250,250,0.8)';
		ctx.font = "13px Arial";
		ctx.fillText("Press any ARROW KEY to START.", 30, 485);
	  }

	  ctx.fillStyle = 'white';
	  ctx.font = "bold 10px Arial";
	  ctx.fillText("Total Points: " + points, 370, 40);
	  ctx.fillText("Max Points: " + pointsMax, 370, 60);

	  return reward;
	}
  }

  function keyPush(evt) {
	switch (evt.keyCode) {
	  case 36: // Left key
		game.action.left();
		evt.preventDefault();
		break;

	  case 38: // Up key
		game.action.up();
		evt.preventDefault();
		break;

	  case 39: // Right key
		game.action.right();
		evt.preventDefault();
		break;

	  case 40: // Down key.
		game.action.down();
		evt.preventDefault();
		break;

	  case 32: // (space) key.
		Snake.pause();
		evt.preventDefault();
		break;

	  case 27: // (esc) key.
		game.reset();
		evt.preventDefault();
		break;
	}
  }

  return {
	start: function(fps = 60) {
	  window.onload = setup;
	  intervalID = setInterval(game.loop, 1550 / fps);
	},

	loop: game.loop,
	reset: game.reset,

	stop: function() {
	  clearInterval(intervalID);
	},

	setup: {
	  keyboard: function(state) {
		if (state) {
		  document.addEventListener('keydown', keyPush);
		} else {
		  document.removeEventListener('keydown', keyPush);
		}
	  },
	  wall: function(state) {
		walls = state;
	  },
	  tileCount: function(size) {
		tileCount = size;
		gridSize = 500 / tileCount;
	  },
	  fixedTail: function(state) {
		fixedTail = state;
	  }
	},

	action: function(act) {
	  switch (act) {
		case 'left':
		  game.action.left();
		  break;

		case 'up':
		  game.action.up();
		  break;

		case 'right':
		  game.action.right();
		  break;

		case 'down':
		  game.action.down();
		  break;
	  }
	},

	pause: function() {
	  velocity.x = 0;
	  velocity.y = 0;
	},

	clearTopScore: function() {
	  pointsMax = 0;
	},

	data: {
	  player: player,
	  fruit: fruit,
	  trail: function() {
		return trail;
	  }
	},

	info: {
	  tileCount: tileCount
	}
  };

})();

Snake.start(6.5);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);