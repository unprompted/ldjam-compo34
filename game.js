"use strict";

function Game(options) {
	this.options = {};
	for (var k in options) {
		this.options[k] = options[k];
	}
	this.velocity = [0, 0];
	this.position = [0, 0];
	this.gone = {};
	this.camera = 10;
	this.projectile = null;
	this.gameOver = false;
	this.start = true;
	this.countdown = 3;

	this.points = 0;
	this.kills = 0;

	document.location.hash = store(gGame);
	document.getElementById("share").href = document.location.href;

	if (this.options.button0 == undefined) {
		this.options.button0 = 2;
	}

	if (this.options.button1 == undefined) {
		this.options.button1 = 0;
	}

	if (!this.options.score) {
		this.options.score = 1;
	}

	if (!this.options.player) {
		this.options.player = makeImageData([
			'11111111',
			'10000001',
			'10100101',
			'10000001',
			'10100101',
			'10111101',
			'10000001',
			'11111111',
		], 16);
	}

	if (!this.options.enemy) {
		this.options.enemy = makeImageData([
			'11111111',
			'10000001',
			'10100101',
			'10000001',
			'10111101',
			'10100101',
			'10000001',
			'11111111',
		], 16);
	}

	if (!this.options.point) {
		this.options.point = makeImageData([
			'00000000',
			'00000000',
			'00011000',
			'00100100',
			'01011010',
			'01010010',
			'00100100',
			'00011000',
		], 16);
	}

	this.background = makeImageData([
		'1110',
		'0101',
		'0011',
		'1001',
	], 16);

	this.timer = [
		makeImageData([
			'110',
			'010',
			'010',
			'010',
			'111',
		], 16),
		makeImageData([
			'111',
			'001',
			'111',
			'100',
			'111',
		], 16),
		makeImageData([
			'111',
			'001',
			'011',
			'001',
			'111',
		], 16)
	];

	if (!this.options.level) {
		this.options.level = '00102';
	} else {
		this.options.level = '0' + this.options.level;
	}

	if (!this.options.jump) {
		this.options.jump = [1000, 3000, 0.25];
	}

	if (!this.options.shoot) {
		this.options.shoot = [300, 300, 0.1];
	}

	this.collect = [this.options.shoot[0], this.options.jump[1], (this.options.shoot[2] + this.options.jump[2]) / 2];

	return this;
};

Game.prototype.update = function() {
	if (this.start && (gKeyDown['0'] || gKeyDown['1'])) {
		return;
	}
	this.start = false;

	if (this.countdown > 0) {
		this.countdown -= gTimeDelta / 1000;
		if (this.countdown > 0) {
			var i = Math.min(Math.floor(this.countdown), 2);
			gContext.putImageData(this.timer[i], 640 / 2 - 16 * 3, 480 / 2 - 16 * 3);
		} else {
			this.countdown = 0;
		}
		return;
	}

	for (var i = 0; i < this.options.level.length; i++) {
		if (!this.gone[i]) {
			var c = this.options.level.charAt(i);
			if (c == '1') {
				gContext.putImageData(this.options.enemy, i * 16 * 8 * 2 - this.position[0] + this.camera, 240);
			} else if (c == '2') {
				gContext.putImageData(this.options.point, i * 16 * 8 * 2 - this.position[0] + this.camera, 240);
			}
		}
	}
	var tile = Math.round(this.position[0] / (16 * 8 * 2));
	if (!this.gone[tile]) {
		var hit = this.options.level.charAt(tile);
		if (hit == '1' && this.position[1] <= 16 * 8) {
			if (this.velocity[1] < 0) {
				this.gone[tile] = true;
				this.velocity[1] = 1.5;
				this.kills++;
				tone(this.collect[1], this.collect[0], this.collect[2]);
			} else {
				this.gameOver = true;
				this.gone[tile] = true;
			}
		} else if (hit == '2' && this.position[1] <= 16 * 8) {
			tone(this.collect[0], this.collect[1], this.collect[2]);
			this.points += this.options.score;
			this.gone[tile] = true;
		}
	}

	if (this.projectile != null) {
		gContext.fillStyle = '#fff';
		var screenPosition = this.projectile - this.position[0] + this.camera;
		gContext.fillRect(screenPosition, 240 + 16 * 8 / 2, 16, 16);
		this.projectile += gTimeDelta;
		var p = Math.floor(this.projectile / (16 * 8 * 2));
		var hit = this.options.level.charAt(p);
		if (hit == '1' && !this.gone[p]) {
			this.gone[p] = true;
			this.projectile = null;
		}
		if (screenPosition > 640) {
			this.projectile = null;
		}
	}

	gContext.putImageData(this.options.player, this.camera, 240 - this.position[1]);
	this.position[0] += this.velocity[0] * gTimeDelta;
	this.position[1] += this.velocity[1] * gTimeDelta;
	this.velocity[1] -= 0.005 * gTimeDelta;
	if (this.position[1] <= 0 && !this.gameOver) {
		this.position[1] = 0;
		this.velocity[1] = 0;
	}

	if (this.gameOver) {
		this.position[0] -= 2 * gTimeDelta;
		if (this.position[1] > -480) {
			this.position[1] -= gTimeDelta * 0.1;
		} else {
			var fontSize = 16;
			gContext.fillStyle = '#fff';
			gContext.font = 'bold ' + fontSize + 'px courier new';
			gContext.fillText('game over', 640 / 2 - gContext.measureText('game over').width / 2, 240 - 2 * fontSize);
			gContext.font = fontSize + 'px courier new';
			gContext.fillText('1 retry', 640 / 2 - gContext.measureText('1 retry').width / 2, 240 + 16 * 8 + 2 * fontSize);
			gContext.fillText('0 back', 640 / 2 - gContext.measureText('1 retry').width / 2, 240 + 16 * 8 + 3 * fontSize);
			if (gKeyPressed['1'] && this.completed) {
				this.completed(1);
			}
			if (gKeyPressed['0'] && this.completed) {
				this.completed(0);
			}
		}
	} else if (tile > this.options.level.length) {
		var targetCamera = 640 / 2 - (16 * 8) / 2;
		if (this.camera < targetCamera) {
			this.camera += gTimeDelta / 5;
		} else {
			this.camera = targetCamera;
			if (this.velocity[1] == 0) {
				this.velocity[1] = 1.5;
			}
			var fontSize = 16;
			gContext.font = fontSize + 'px courier new';
			gContext.fillStyle = '#fff';
			gContext.fillText('1 again', 640 / 2 - gContext.measureText('1 again').width / 2, 240 + 16 * 8 + 2 * fontSize);
			gContext.fillText('0 back', 640 / 2 - gContext.measureText('1 again').width / 2, 240 + 16 * 8 + 3 * fontSize);

			var results = '';
			if (this.points) {
				if (results.length) {
					results += ', ';
				}
				results += this.points + (this.points == 1 ? ' point' : ' points');
			}
			if (this.kills) {
				if (results.length) {
					results += ', ';
				}
				results += this.kills + (this.kills == 1 ? ' enemy vanquished' : ' enemies vanquished');
			}
			gContext.fillText(results, 640 / 2 - gContext.measureText(results).width / 2, 240 + 16 * 8 + 5 * fontSize);
			if (gKeyPressed['1'] && this.completed) {
				this.completed(1);
			}
			if (gKeyPressed['0'] && this.completed) {
				this.completed(0);
			}
		}
	} else {
		for (var i = 0; i < 12; i++) {
			for (var j = 0; j < 2; j++) {
				gContext.putImageData(this.background, i * 16 * 4 - this.position[0] % (16 * 4), 240 + 16 * 8 + j * 16 * 4);
			}
		}
		var jump = this.velocity[1] == 0 &&
			(this.options.button0 == 0 && gKeyDown['0'] ||
			this.options.button1 == 0 && gKeyDown['1']);
		var shoot = this.projectile == null &&
			(this.options.button0 == 1 && gKeyDown['0'] ||
			this.options.button1 == 1 && gKeyDown['1']);
		var move = this.projectile == null &&
			(this.options.button0 == 2 && gKeyDown['0'] ||
			this.options.button1 == 2 && gKeyDown['1'] ||
			this.options.button0 != 2 && this.options.button1 != 2);
		if (jump) {
			this.velocity[1] = 1.5;
			tone(this.options.jump[0], this.options.jump[1], this.options.jump[2]);
		}
		if (shoot) {
			this.projectile = this.position[0];
			tone(this.options.shoot[0], this.options.shoot[1], this.options.shoot[2]);
		}
		if (move) {
			this.velocity[0] = 1;
		} else {
			this.velocity[0] = 0;
		}
	}
};

function packImage(imageData) {
	var result = '';
	for (var i = 0; i < imageData.width / 16; i++) {
		for (var j = 0; j < imageData.height / 16; j++) {
			result += (imageData.data[j * imageData.width * 4 * 16 + i * 4 * 16] ? '1' : '0');
		}
	}
	return result;
}

function unpackImageData(data) {
	var pixels = [];
	console.debug(data);
	for (var i = 0; i < 8; i++) {
		var line = '';
		for (var j = 0; j < 8; j++) {
			line += data.charAt(j * 8 + i);
		}
		pixels.push(line);
	}
	return makeImageData(pixels, 16);
}

function store(game) {
	var simple = {};
	for (var k in game) {
		if (game[k] instanceof ImageData) {
			simple[k] = packImage(game[k]);
		} else {
			simple[k] = game[k];
		}
	}
	return JSON.stringify(simple);
};

function load(game) {
	var simple = JSON.parse(game);
	for (var k in simple) {
		if (['player', 'enemy'].indexOf(k) != -1) {
			simple[k] = unpackImageData(simple[k]);
		}
	}
	return simple;
};
