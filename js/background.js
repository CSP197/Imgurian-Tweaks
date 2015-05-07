chrome.storage.sync.get({
	// Default values
	loadingGIFReplacementEnabled: false,
	loaderURL: '',
	loaderScaleFactor: 1,
	commentTagAddEnabled: true,
	oldBarEnabled: true,
	voteBombEnabled: true,
	largeImageModeEnabled: false,
	sideGalleryRemoveEnabled: false,
	uploadContextMenuEnabled: true,
},
 function (items) {
	// If the user wants the uploading context menu, add it
	if(items.uploadContextMenuEnabled)
	{
		function uploadToImgur(imgURL)
		{
			var uploadURL = "http://imgur.com/api/upload/?url=" + encodeURI(imgURL);
			window.open(uploadURL);
		}

		chrome.contextMenus.create({
			title: "Upload image to imgur",
			contexts:["image"],
			onclick: function(info) {
				uploadToImgur(info.srcUrl);
			}
		});
	}

	// If the user has disabled GIF Replacement, do exit
	if(!items.loadingGIFReplacementEnabled)
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

	setInterval(checkForNotifications,30000);

});

function checkForNotifications()
{
	$.get('http://imgur.com/account/notifications.json' , function(data){
		console.log(data);
	});
}
