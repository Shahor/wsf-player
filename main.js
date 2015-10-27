(function () {
	document.addEventListener('DOMContentLoaded', function (e) {
		'use strict';

		console.log("Player started");
		var audioPlayer = document.querySelector('audio');

		var isPlaying = false;
		var Controls = document.querySelector('#controls');
		var Reader = document.querySelector('#reader');
		var Timestamp = document.querySelector('#timestamp');

		audioPlayer.addEventListener('pause', function () {
			isPlaying = false;
			Reader.value = 'Play';
		});

		audioPlayer.addEventListener('play', function () {
			isPlaying = true;
			Reader.value = 'Pause';
		});

		Controls.addEventListener('click', function (e) {
			var target = e.target;

			if (target.id === 'reader') {
				if (isPlaying) {
					audioPlayer.pause();
				} else {
					audioPlayer.play();
				}
			}
			if (target.id === 'stop') {
				audioPlayer.pause();
				audioPlayer.currentTime = 0;
			}
		});

		audioPlayer.addEventListener('timeupdate', function (e) {
			Timestamp.textContent = this.currentTime;
		});
	});
}());
