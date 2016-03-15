"use strict";

function ImageEditor() {
	this.kWidth = 256;
	this.kHeight = 256;
	this.kTop = 30;
	this.kLeft = 640 / 2 - this.kWidth / 2;
	this.kSpriteSize = 8;
	this.image = new Array(this.kSpriteSize * this.kSpriteSize);
	for (var i = 0; i < this.kSpriteSize * this.kSpriteSize; i++) {
		this.image[i] = 0;
	}
	this.pixelsFilled = 0;
	return this;
}

ImageEditor.prototype.update = function() {
	if (this.title) {
		var fontSize = 16;
		gContext.font = 'bold ' + fontSize + 'px courier new';
		gContext.fillStyle = '#fff';
		gContext.fillText(this.title, 640 / 2 - gContext.measureText(this.title).width / 2, fontSize);
	}
	for (var i = 0; i < this.kSpriteSize; i++) {
		for (var j = 0; j < this.kSpriteSize; j++) {
			var p = j * this.kSpriteSize + i;
			if (this.pixelsFilled > p) {
				gContext.fillStyle = this.image[p] ? '#fff' : '#000';
				gContext.fillRect(
					this.kLeft + (i * this.kWidth / this.kSpriteSize),
					this.kTop + (j * this.kHeight / this.kSpriteSize),
					this.kWidth / this.kSpriteSize,
					this.kHeight / this.kSpriteSize);
			} else if (this.pixelsFilled == p) {
				gContext.fillStyle = pulseColor();
				gContext.fillRect(
					this.kLeft + (i * this.kWidth / this.kSpriteSize),
					this.kTop + (j * this.kHeight / this.kSpriteSize),
					this.kWidth / this.kSpriteSize,
					this.kHeight / this.kSpriteSize);
			} else {
				gContext.strokeStyle = '#fff';
				gContext.strokeRect(
					this.kLeft + (i * this.kWidth / this.kSpriteSize),
					this.kTop + (j * this.kHeight / this.kSpriteSize),
					this.kWidth / this.kSpriteSize,
					this.kHeight / this.kSpriteSize);
			}
		}
	}

	if (this.suggested) {
		var fontSize = 16;
		gContext.font = fontSize + 'px courier new';
		gContext.fillStyle = '#fff';
		gContext.fillText('suggested: ' + this.suggested.substring(this.pixelsFilled, this.pixelsFilled + 8), 10, this.kTop + this.kHeight + 2 * fontSize);
	}

	if (gKeyPressed['0']) {
		this.image[this.pixelsFilled++] = 0;
	} else if (gKeyPressed['1']) {
		this.image[this.pixelsFilled++] = 1;
	}

	if (this.pixelsFilled == this.kSpriteSize * this.kSpriteSize && this.completed) {
		var image = [];
		for (var i = 0; i < this.kSpriteSize; i++) {
			var line = '';
			for (var j = 0; j < this.kSpriteSize; j++) {
				line += this.image[i * this.kSpriteSize + j] ? '1' : '0';
			}
			image.push(line);
		}
		this.completed(makeImageData(image, 16));
	}
}

