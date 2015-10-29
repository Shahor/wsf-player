(function () {
	// Wait for the DOM to be parsed before executing the code
	document.addEventListener('DOMContentLoaded', function (e) {
		'use strict';

		var	isPlaying = false,
			audioPlayer = document.querySelector('audio'),
			Controls = document.querySelector('#controls'),
			Reader = document.querySelector('#reader'),
			Timemarker = document.querySelector('#timemarker'),
			ProgressBar = document.querySelector("#progress");

		/**
		 * @param  {Boolean} doDisplay : Wether to display or hide the timemarker
		 */
		function displayTimemarker (doDisplay) {
			var display = 'none';

			if (doDisplay) {
				display = 'inline-block';
			}

			Timemarker.style.display = display;
		}

		audioPlayer.addEventListener('pause', function () {
			isPlaying = false;
			Reader.value = 'Play';
		});

		audioPlayer.addEventListener('playing', function () {
			isPlaying = true;
			Reader.value = 'Pause';

			// We don't know what the duration of the song is before we start playing it
			displayTimemarker(true);
		});

		audioPlayer.addEventListener('ended', function () {
			displayTimemarker(false);
			ProgressBar.value = 0;
		});

		Controls.addEventListener('click', function (e) {
			var target = e.target;

			// Handle the play/pause feature
			if (target.id === 'reader') {
				if (isPlaying) {
					audioPlayer.pause();
				} else {
					audioPlayer.play();
				}
			}

			// Stop the player
			if (target.id === 'stop') {
				audioPlayer.pause();

				audioPlayer.currentTime = 0;
				displayTimemarker(false);
			}
		});

		/*
		Handle the sliders' events
		 */
		Controls.addEventListener('input', function (e) {
			var target = e.target;

			// I use this to filter out which inputs I'm going to consider
			if (['volume', 'playbackRate'].indexOf(target.id) < 0) {
				return;
			}

			// Setting the corresponding value to the audioplayer
			audioPlayer[target.id] = target.value;

			// This indicator is here only for the playbackRate slider, therefore I have to test if it exists before I can use it;
			var indicator = document.querySelector('#' + target.id + 'Indicator');
			if (indicator) {
				// Indicate the current playbackRate to the user
				indicator.textContent = target.value;
			}
		});

		// Handle the ProgressBar logic
		ProgressBar.addEventListener('click', function (e) {
			var controlPosition = ProgressBar.getBoundingClientRect(),
				mousePosition = e.clientX,
				progressWidth = this.clientWidth;

			// Get the percentage of the ProgressBar the user clicked on
			var percentage = (mousePosition - controlPosition.left) / progressWidth;
			// Get the time value corresponding to that percentage of the file's duration
			var newValue = audioPlayer.duration * percentage.toFixed(2);

			// Apply it
			audioPlayer.currentTime = Math.round(newValue);
		});

		// Handle the time updates
		audioPlayer.addEventListener('timeupdate', function (e) {
			var currentTime = Math.floor(this.currentTime);

			// Format the display properly
			var minutes = Math.floor(currentTime / 60),
				seconds = currentTime % 60;

			// Pad the seconds
			if (minutes < 10) minutes = '0' + minutes;
			if (seconds < 10) seconds = '0' + seconds;

			// Display the current time
			Timemarker.textContent = minutes + ':' + seconds;
			// Update the progress bar
			ProgressBar.value = (currentTime / audioPlayer.duration) * 100;
		});
	});
}());
