"use strict";

function SoundEditor() {
	this.start = true;
	this.data = [null, null, null];
	this.downTime = null;
	this.part = 0;
	return this;
};

SoundEditor.prototype.update = function() {
	if (this.start && (gKeyDown['0'] || gKeyDown['1'])) {
		return;
	}
	this.start = false;
	var min = [20, 20, 0.001];
	var max = [20000, 20000, 1.0];

	var fontSize = 16;
	gContext.font = fontSize + 'px courier new';
	gContext.fillStyle = '#fff';
	gContext.fillText("start frequency", 1.5 * 640 / 7 - gContext.measureText('start frequency').width / 2, 2 * fontSize);
	gContext.fillText("end frequency", 3.5 * 640 / 7 - gContext.measureText('end frequency').width / 2, 2 * fontSize);
	gContext.fillText("duration", 5.5 * 640 / 7 - gContext.measureText('duration').width / 2, 2 * fontSize);

	for (var i = 0; i < this.data.length; i++) {
		var kHeight = 240;
		gContext.strokeStyle = '#fff';
		gContext.strokeRect((2 * i + 1) * 640 / 7, 3 * fontSize, 640 / 7, kHeight);
		if (this.data[i] != null) {
			var v = (this.data[i] - min[i]) / (max[i] - min[i]);
			gContext.fillStyle = '#fff';
			gContext.fillRect((2 * i + 1) * 640 / 7, 3 * fontSize + kHeight * (1 - v), 640 / 7, kHeight * v);
		}
	}

	if (this.part < this.data.length) {
		if (gKeyPressed['0']) {
			this.data[this.part] = Math.random() * (max[this.part] - min[this.part]) + min[this.part];
			this.part++;
		} else {
			var now = Date.now();
			if (!this.downTime && gKeyDown['1']) {
				this.downTime = now;
			}
			if (this.downTime) {
				var v = Math.min((now - this.downTime) / 1000.0, 1.0);
				this.data[this.part] = v * (max[this.part] - min[this.part]) + min[this.part];
				if (!gKeyDown['1'] || (now - this.downTime) / 1000.0 > 1.0) {
					this.part++;
					this.downTime = null;
				}
			}
		}
		var names = ['start frequency', 'end frequency', 'duration'];
		gContext.fillStyle = '#fff';
		gContext.font = 'bold ' + fontSize + 'px courier new';
		gContext.fillText("set " + names[this.part], 640 / 2 - gContext.measureText('set ' + names[this.part]).width / 2, 320);
		gContext.font = fontSize + 'px courier new';
		gContext.fillText("1 hold to set", 640 / 2 - gContext.measureText('1 hold to set').width / 2, 320 + fontSize);
		gContext.fillText("0 random", 640 / 2 - gContext.measureText('0 random').width / 2, 320 + fontSize * 2);
	} else {
		gContext.fillStyle = '#fff';
		gContext.fillText("1 hear it", 640 / 2 - gContext.measureText('1 hear it').width / 2, 320 + fontSize);
		gContext.fillText("0 done", 640 / 2 - gContext.measureText('0 done').width / 2, 320 + fontSize * 2);
		if (gKeyPressed['1']) {
			tone(this.data[0], this.data[1], this.data[2]);
		}
		if (gKeyPressed['0'] && this.completed) {
			this.completed(this.data);
		}
	}
};
