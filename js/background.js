chrome.storage.sync.get({
	// Default values
	loadingGIFReplacementEnabled: true,
	loaderURL: chrome.extension.getURL("res/loader.gif"),
	loaderScaleFactor: 2.0,
	youTagAddEnabled: true,
	staffTagAddEnabled: true,
	oldBarEnabled: true,
	voteBombEnabled: true,
	largeImageModeEnabled: false,
	sideGalleryRemoveEnabled: false,
	uploadContextMenuEnabled: true,
	spreadTheLoveEnabled: false,
	notificationsEnabled: true
}, function(items) {
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

	if(items.notificationsEnabled)
		setInterval(checkForNotifications, 30000);

});

var currNotif = 0;

function checkForNotifications()
{
	$.get('http://imgur.com/' , function(data){
		var auth = extractAuth(data);
		if(!auth.notifications)
			return false;
		var newCount = auth.notifications;
		if (currNotif < newCount)
		{
			showNotification();
		}
		currNotif = newCount;
	});
}

function showNotification()
{
	chrome.notifications.create(
		'imgurMessage',
		{
			type: 'basic',
			iconUrl: './res/16x16.png',
			title: 'Imgur Notification!',
			message: 'You just got a new notification on imgur!',
			buttons: [],
			priority: 0,
			isClickable: true
		},
		function() { }
	);
	chrome.notifications.onClicked.addListener(
		function(){
			window.open("https://www.imgur.com");
			chrome.notifications.clear('imgurMessage');
		}
	);
	setTimeout(function(){
		chrome.notifications.clear('imgurMessage');
	}, 10000);
}

function extractAuth(data)
{
	var index = data.indexOf("Imgur.Environment =");
	var data = data.substring(index, data.indexOf("};", index));
	if(data.indexOf("auth") == -1)
	{
		return {};
	}else{
		index = data.indexOf("auth");
		return JSON.parse(data.substring(index + 5, data.indexOf("},", index)+1));
	}
}

function externalDataFetch(url, callback)
{
	$.get(url, function(data){
		callback(data);
	});
}


// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){

    }else if(details.reason == "update"){
	if(details.previousVersion != "1.3.0" && details.previousVersion != "1.3.1"  && details.previousVersion != "1.3.2")
        	window.open(chrome.extension.getURL("release_notes/index.html"));
    }
});
