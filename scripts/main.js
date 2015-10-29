(function () {
	// Wait for the DOM to be parsed before executing the code
	document.addEventListener('DOMContentLoaded', function (e) {
		'use strict';

		var	isPlaying = false,
			audioPlayer = document.querySelector('audio'),
			Controls = document.querySelector('#controls'),
			Reader = document.querySelector('#reader'),
			Timemarker = document.querySelector('#timemarker'),
			ProgressBar = document.querySelector("#progress"),
			Playlistcontainer = document.querySelector('#playlistContainer');

		var playlist = null;


		doXHR('songs/songs.json', function (songs) {
			playlist = songs;
			Playlistcontainer.textContent = '';

			songs.forEach(function (song, index) {
				var songElement = document.createElement('li');
				songElement.setAttribute('trackNumber', index);
				songElement.setAttribute('url', song.url);
				songElement.textContent = song.artist + ' - ' + song.title;
				Playlistcontainer.appendChild(songElement);
			});
		});

		audioPlayer.addEventListener('canplay', function () {
			audioPlayer.play();
		})

		Playlistcontainer.addEventListener('click', function (e) {
			var target = e.target,
				trackNumber = parseInt(target.getAttribute('trackNumber'), 10);

			audioPlayer.setAttribute('src', target.getAttribute('url'));
			audioPlayer.trackNumber = parseInt(target.getAttribute('trackNumber'), 10);
			highlightTrack(trackNumber);
			audioPlayer.play();
		});

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

		function stopReading() {
			audioPlayer.pause();
			audioPlayer.currentTime = audioPlayer.trackNumber = ProgressBar.value = 0;

			/* The audio tag is buggy. Calling load after having removed the src
			will effectively empty the buffer but will prevent the 'pause' event
			to be triggered (we called .pause()), therefore leaving our player in a
			shitty state. This is my dirty trick to prevent that. */
			setTimeout(function () {
				audioPlayer.removeAttribute('src');
				audioPlayer.load();
			}, 0);

			displayTimemarker(false);
			cleanHighlights();
		}

		/*
		Remove all the highlights
		 */
		function cleanHighlights() {
			// document.querySelectorAll returns a NodeList, it looks like an array, almost behaves like an array
			// but is not an array and therefore doesn't have the .forEach method available.
			// That's why I make an Array.from this list to have an array instead.
			Array.from(document.querySelectorAll('.playing')).forEach(function (element) {
				element.classList.remove('playing');
			})
		}

		/*
		Simple function to highlight the given track
		 */
		function highlightTrack(track) {
			track = document.querySelector("li[trackNumber='" + track + "']");

			cleanHighlights();
			if (!track) return;
			track.classList.add('playing');
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

			// Are there any songs left to play?
			// Remember, playlist is an array and its index starts at 0, that's why the - 2 here, because of
			// the 0 shift, and we want to have at least one more song to play
			if (audioPlayer.trackNumber < playlist.length - 2) {
				audioPlayer.trackNumber++;
				audioPlayer.setAttribute('src', playlist[audioPlayer.trackNumber].url);
				highlightTrack(audioPlayer.trackNumber);
			} else {
				stopReading();
			}
		});

		Controls.addEventListener('click', function (e) {
			var target = e.target;

			// Handle the play/pause feature
			if (target.id === 'reader') {
				if (isPlaying) {
					audioPlayer.pause();
				} else {
					// No track is being played, set the first track as the one we want to play, and play it
					if (!audioPlayer.hasAttribute('src')) {
						audioPlayer.trackNumber = 0;
						audioPlayer.setAttribute('src', playlist[0].url);
						highlightTrack(0);
					} else {
						// Resume play
						audioPlayer.play();
					}
				}
			}

			// Stop the player
			if (target.id === 'stop') {
				stopReading();
			}

			if (['next', 'prev'].indexOf(target.id) >= 0) {
				if (!isPlaying) return;

				if (target.id === 'next') {
					audioPlayer.trackNumber += 1;
				} else {
					audioPlayer.trackNumber -= 1;
				}

				// Is the new tracknumber value outside of the playlist boundaries ? (Meaning : does it represent
				// a inexistant track?)
				if (audioPlayer.trackNumber < 0 || audioPlayer.trackNumber > playlist.length - 1) {
					stopReading();
				} else { // new track exists, play it!
					audioPlayer.setAttribute('src', playlist[audioPlayer.trackNumber].url);
					highlightTrack(audioPlayer.trackNumber)
				}
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
			if (!isPlaying) return;
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

			// Weird but in some cases this happens
			if (!currentTime) {
				currentTime = 0;
			}

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
