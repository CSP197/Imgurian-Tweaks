chrome.storage.sync.get(["loaderURL", "enableLoadingGIFReplacement"], function (items) {
	if(!items.enableLoadingGIFReplacement)
		return;
	
	chrome.webRequest.onBeforeRequest.addListener(

		// Checking if it is not redirecting to all steps.
		function(details) {
			
			// Redirecting it to all steps page.
			return {redirectUrl: items.loaderURL};
		},

		// Applies to following url patterns
		{urls: ["*://s.imgur.com/images/loaders/*/*.gif"]},

		// In request blocking mode
		["blocking"]
	  
	);
});