"use script";

var gAudio = null;
var gGain = null;

function tone(frequency0, frequency1, duration) {
	var Context = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
	if (!gAudio && Context) {
		gAudio = new Context();
	}
	if (!gGain && gAudio) {
		gGain = gAudio.createGain();
		gGain.connect(gAudio.destination);
		gGain.gain.value = 0.15;
	}
	var now = gAudio.currentTime;
	var oscillator = gAudio.createOscillator();
	oscillator.frequency.setValueAtTime(frequency0, now);
	oscillator.frequency.linearRampToValueAtTime(frequency1, now + duration);
	oscillator.type = 'sine';
	oscillator.connect(gGain);
	oscillator.start(now);
	oscillator.stop(gAudio.currentTime + duration);
}
