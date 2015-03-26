chrome.storage.sync.get(["loaderURL", "enableLoadingGIFReplacement"], function (items) {
	// If the user has disabled GIF Replacement, do noting
	if(!items.enableLoadingGIFReplacement)
		return;
	
	// Otherwise redirect all loader requests to the user's custom URL
	chrome.webRequest.onBeforeRequest.addListener(

		function(details) {
			// Redirecting default loader image to custom url image.
			return {redirectUrl: items.loaderURL};
		},

		// Applies to all imgur default loader gifs
		{urls: ["*://s.imgur.com/images/loaders/*/*.gif"]},

		// In request blocking mode
		["blocking"]
	  
	);
});