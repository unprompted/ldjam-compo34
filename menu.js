"use strict";

function Menu(configuration) {
	this.title = configuration.title;
	this.options = configuration.options;
	this.footer = configuration.footer;
	this.image = configuration.image;
	this.bitsNeeded = 0;
	this.fontSize = 16;
	this.bits = '';
	var count = this.options.length;
	while (count > 1) {
		this.bitsNeeded += 1;
		count /= 2;
	}
	return this;
}

Menu.prototype.update = function() {
	gContext.font = 'bold ' + this.fontSize + 'px courier new';
	gContext.fillStyle = '#fff';
	gContext.fillText(this.title, 640 / 2 - gContext.measureText(this.title).width / 2, this.fontSize);

	var maxWidth = 0;
	for (var i = 0; i < this.options.length; i++) {
		maxWidth = Math.max(maxWidth, gContext.measureText(this.options[i]).width);
	}

	for (var i = 0; i < this.options.length; i++) {
		gContext.font = this.fontSize + 'px courier new';
		gContext.fillStyle = '#fff';
		gContext.fillText(bits(i, this.bitsNeeded) + ' ' + this.options[i], 640 / 2 - maxWidth / 2, this.fontSize * (i + 3));
	}
	gContext.font = this.fontSize + 'px courier new';
	gContext.fillStyle = '#fff';
	var text = '';
	for (var i = 0; i < this.bitsNeeded; i++) {
		text += '0';
	}
	gContext.fillText(this.bits, 640 / 2 - maxWidth / 2, this.fontSize * (this.options.length + 4));
	gContext.fillStyle = blinkColor();
	gContext.fillRect(640 / 2 - maxWidth / 2 + gContext.measureText(this.bits).width, this.fontSize * (this.options.length + 3), 10, this.fontSize);

	if (this.footer) {
		gContext.font = this.fontSize + 'px courier new';
		gContext.fillStyle = '#fff';
		gContext.fillText(this.footer, 640 / 2 - gContext.measureText(this.footer).width / 2, 480 - this.fontSize);
	}

	if (this.image) {
		gContext.putImageData(this.image, 640 / 2 - this.image.width / 2, 480 / 2 - this.image.height / 2);
	}

	if (gKeyPressed['0']) {
		this.bits += '0';
	} else if (gKeyPressed['1']) {
		this.bits += '1';
	}

	if (this.bits.length >= this.bitsNeeded && this.completed) {
		var result = 0;
		for (var i = 0; i < this.bits.length; i++) {
			result *= 2;
			if (this.bits.charAt(i) == '1') {
				result |= 1;
			}
		}
		this.completed(result);
	}
}
