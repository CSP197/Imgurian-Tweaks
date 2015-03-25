var newURL = "http://loadinggif.com/generated-image?imageId=7&bgColor=%23ffffff&fgColor=%238500ff&transparentBg=1&download=0&random=0.3687119714450091";

chrome.webRequest.onBeforeRequest.addListener(

	// Checking if it is not redirecting to all steps.
	function(details) {
		
		// Redirecting it to all steps page.
		return {redirectUrl: newURL};
	},

	// Applies to following url patterns
	{urls: ["*://s.imgur.com/images/loaders/*/*.gif"]},

	// In request blocking mode
	["blocking"]
  
);