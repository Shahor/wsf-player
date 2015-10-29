(function () {
	'use strict';

	var cb = function () {};

	function doXHR(url, callback) {
		callback = callback || function () {};
		/* Pooor poooor pooooooor man's XHR
		I'm doing this because current browsers don't allow
		for XHR calls easily on localhost (without a server answering
		the proper headers) because of CORS policies.
		I know this is ugly, and right now I don't care, I just need
		it to work for the lesson's purpose
		*/

		var script = document.createElement('script');
		script.setAttribute('src', url);
		// I feel dirty
		cb = callback;

		document.body.appendChild(script);

		script.addEventListener('load', function (e) {
			script.remove();
		});
	}

	window.jsonpCallback = function (data) {
		cb(data);
	}

	window.doXHR = doXHR;
}());
