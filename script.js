"use strict";
var gContext;
var gKeyDown = {}
var gKeyPressed = {}
var gMode;
var gTimeDelta = 0;
var gLastFrame = Date.now();
var gTimer;

var gGame = {};

document.addEventListener("DOMContentLoaded", function() {
	var canvas = document.getElementById("canvas");
	gContext = canvas.getContext("2d");

	if (document.location.hash) {
		try {
			gGame = load(document.location.hash.substring(1));
		} catch (e) {
			console.debug(e);
		}
	}

	document.body.onkeydown = function(event) {
		if (event.which == 48 || event.which == 96) {
			gKeyDown['0'] = true;
		}
		if (event.which == 49 || event.which == 97) {
			gKeyDown['1'] = true;
		}
	}

	document.body.onkeyup = function(event) {
		if (event.which == 48 || event.which == 96) {
			gKeyDown['0'] = false;
		}
		if (event.which == 49 || event.which == 97) {
			gKeyDown['1'] = false;
		}
	}

	document.body.onkeypress = function(event) {
		if (event.which == 48 || event.which == 96) {
			gKeyPressed['0'] = true;
		}
		if (event.which == 49 || event.which == 97) {
			gKeyPressed['1'] = true;
		}
		if ((event.which == 48 || event.which == 49 || event.which == 96 || event.which == 97) &&
			!(gMode instanceof Game) &&
			!(gMode instanceof SoundEditor)) {

			var min = 40;
			var max = 2000;
			var f = Math.random() * (max - min) + min;
			tone(f, f, 0.1);
		}
	}

	makeMainMenu();
	window.requestAnimationFrame(update);
});

function makeMainMenu() {
	var menu = new Menu({
		title: 'become a game developer in 60 seconds',
		options: ['create', 'test'],
		footer: 'buttons: 0 and 1',
		image: makeImageData([
			'11001110110011101100111',
			'01001010010010100100101',
			'01001010010010100100101',
			'01001010010010100100101',
			'11101110111011101110111',
			'00000000000000000000000',
			'00111100100100010111000',
			'00100001010110110100000',
			'00101101110101010110000',
			'00100101010100010100000',
			'00111101010100010111000',
		], 16)}
	);
	menu.completed = function(result) {
		if (result == 0) {
			gTimer = 60;
			makeCreateMenu();
		} else {
			gTimer = undefined;
			makeGame();
		}
	};
	gMode = menu;
}

function makeCreateMenu() {
	var menu = new Menu({title: 'make game', options: [
		'[' + (gGame.player ? 'x' : ' ') + '] player',
		'[' + (gGame.enemy ? 'x' : ' ') + '] enemy',
		'[' + (gGame.score ? 'x' : ' ') + '] score',
		'[' + (gGame.jump ? 'x' : ' ') + '] jump',
		'[' + (gGame.shoot ? 'x' : ' ') + '] shoot',
		'[' + (gGame.button0 != undefined ? 'x' : ' ') + '] buttons',
		'[' + (gGame.level ? 'x' : ' ') + '] level',
		'    ship it',
	]});
	menu.completed = function(result) {
		if (result == 0) {
			makeImageEditor('player',
				'00111100'+
				'00111100'+
				'00111100'+
				'10011001'+
				'11111111'+
				'00011000'+
				'00100100'+
				'00100100');
		} else if (result == 1) {
			makeImageEditor('enemy',
				'00111100'+
				'01000010'+
				'10000001'+
				'10100101'+
				'10000001'+
				'11011011'+
				'01011010'+
				'01111110');
		} else if (result == 2) {
			gGame.score = 1;
			makeScoreEditor();
		} else if (result == 3) {
			makeSoundEditor('jump');
		} else if (result == 4) {
			makeSoundEditor('shoot');
		} else if (result == 5) {
			makeButtonsMenu();
		} else if (result == 6) {
			gGame.level = '';
			makeLevelEditor();
		} else if (result == 7) {
			gTimer = undefined;
			makeGame();
		}
	}
	gMode = menu;
}

function makeImageEditor(what, suggested) {
	var editor = new ImageEditor();
	editor.suggested = suggested;
	editor.title = 'draw ' + what + ' by pressing 1 and 0';
	editor.completed = function(result) {
		gGame[what] = result;
		makeCreateMenu();
	};
	gMode = editor;
}

function makeSoundEditor(what) {
	var editor = new SoundEditor();
	editor.completed = function(result) {
		gGame[what] = result;
		makeCreateMenu();
	};
	gMode = editor;
}

function makeButtonMenu(button) {
	var menu = new Menu({title: 'what does ' + button + ' do?', options: [
		'jump',
		'shoot',
		'move',
		'nothing',
	]});
	return menu;
}

function makeButtonsMenu(button) {
	var menu = makeButtonMenu('0');
	menu.completed = function(result) {
		gGame['button0'] = result;
		menu = makeButtonMenu('1');
		menu.completed = function(result) {
			gGame['button1'] = result;
			makeCreateMenu();
		}
		gMode = menu;
	};
	gMode = menu;
}

function update() {
	gContext.fillStyle = '#000';
	gContext.fillRect(0, 0, 640, 480);

	var now = Date.now();
	gTimeDelta = now - gLastFrame;
	gLastFrame = now;

	if (gTimer != undefined) {
		if (gTimer > 0) {
			gTimer -= gTimeDelta / 1000;
		} else {
			gTimer = 0;
		}
	}

	if (gMode) {
		gMode.update();
	} else {
		gContext.fillStyle = pulseColor();
		gContext.fillRect(0, 0, 640, 480);
	}

	for (var i in gKeyPressed) {
		gKeyPressed[i] = false;
	}

	if (!(gMode instanceof Game) && gTimer !== undefined) {
		var fontSize = 16;
		gContext.font = 'bold ' + fontSize + 'px courier new';
		gContext.fillStyle = '#fff';
		var remaining = Math.round(gTimer);
		if (gTimer <= 0) {
			remaining = 'OUT OF TIME! SHIP IT! OUT OF TIME! SHIP IT! OUT OF TIME!  111!';
			gContext.fillStyle = pulseColor();
		}
		gContext.fillText(remaining, 640 - gContext.measureText(remaining).width - 1, 480 - 1);
	}

	window.requestAnimationFrame(update);
}

function pulseColor() {
	var pulse = (Math.sin(15 * Date.now() / 1000) + 1) / 2;
	var value = Math.floor(255 * pulse).toString();
	return 'rgb(' + value + ',' + value + ',' + value + ')';
}

function blinkColor() {
	var blink = (Math.floor(4 * Date.now() / 1000) & 1) == 0;
	var value = Math.floor(255 * blink).toString();
	return 'rgb(' + value + ',' + value + ',' + value + ')';
}

function bits(value, count) {
	var result = '';
	for (var i = 0; i < count; i++) {
		if ((value & (1 << i)) != 0) {
			result = '1' + result;
		} else {
			result = '0' + result;
		}
	}
	return result;
}

function makeImageData(pixels, scale) {
	var height = pixels.length;
	var width = pixels[0].length;

	var data = gContext.createImageData(width * scale, height * scale);
	for (var i = 0; i < width * scale; i++) {
		for (var j = 0; j < height * scale; j++) {
			var v = pixels[Math.floor(j / scale)].charAt(Math.floor(i / scale)) == '1';
			data.data[4 * (j * width * scale + i) + 0] = v ? 255 : 0;
			data.data[4 * (j * width * scale + i) + 1] = v ? 255 : 0;
			data.data[4 * (j * width * scale + i) + 2] = v ? 255 : 0;
			data.data[4 * (j * width * scale + i) + 3] = 255;
		}
	}
	return data;
}

function makeGame() {
	var game = new Game(gGame);
	game.completed = function(result) {
		if (result == 1) {
			makeGame();
		} else {
			makeMainMenu();
		}
	};
	gMode = game;
}

function makeLevelEditor() {
	var menu = new Menu({title: 'choose object for location ' + gGame.level.length, options: [
		'nothing',
		'enemy',
		'points',
		'finish',
	]});
	menu.completed = function(result) {
		if (result == 0) {
			gGame.level += '0';
			makeLevelEditor();
		} else if (result == 1) {
			gGame.level += '1';
			makeLevelEditor();
		} else if (result == 2) {
			gGame.level += '2';
			makeLevelEditor();
		} else if (result == 3) {
			makeCreateMenu();
		}
	};
	gMode = menu;
}

function makeScoreEditor() {
	var menu = new Menu({title: 'how many points?: ' + gGame.score, options: [
		'more',
		'done',
	]});
	menu.completed = function(result) {
		if (result == 0) {
			gGame.score *= 10;
			if (gGame.score < 10000000000000000000) {
				makeScoreEditor();
			} else {
				makeCreateMenu();
			}
		} else if (result == 1) {
			makeCreateMenu();
		}
	};
	gMode = menu;
}
