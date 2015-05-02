// Fetch user's saved settings
chrome.storage.sync.get(
	{
		// Default values
		loadingGIFReplacementEnabled: true,
		loaderURL: chrome.extension.getURL("res/loader.gif"),
		loaderScaleFactor: 2.0,
		youTagEnabled: true,
		oldBarEnabled: true,
		voteBombEnabled: true,
		largeImageModeEnabled: false,
		sideGalleryRemoveEnabled: false,
		uploadContextMenuEnabled: true,
		spreadTheLoveEnabled: true
	},
	function (items)
	{
		if(items.loadingGIFReplacementEnabled)
			startLoadingGifResizing(items.loaderScaleFactor);

		var url = window.location.href;
		if(url.indexOf("/gallery/") <= -1 && url.indexOf("/favorites/") <= -1)
			return;

		var userLoggedInBool = userLoggedIn();

		if(items.youTagEnabled && userLoggedInBool)
			startYouTagWatcher();

		if(items.oldBarEnabled)
			startOldBarInject();

		if(items.voteBombEnabled && userLoggedInBool)
			detectVoteBombs();

		if(items.spreadTheLoveEnabled && userLoggedInBool)
			spreadTheLove();

		if(items.largeImageModeEnabled)
			enlargeImagePanel();

		if(items.sideGalleryRemoveEnabled)
			removeSideGallery(items.largeImageModeEnabled);

		/*
		var dataString = $('script[type="text/javascript"]:contains("widgetFactory.mergeConfig"):eq(2)').text();
		dataString = dataString.substring(dataString.indexOf("image"), dataString.indexOf("group"));
		dataString = dataString.substring(dataString.indexOf("{"), dataString.lastIndexOf("}") + 1);
		var imageData = JSON.parse(dataString);
		image data extraction... may be useful later
		*/

	});

// Returns whether or not a user is logged in
function userLoggedIn()
{
	return ($(".account-user-name").text() != "")
}

function startYouTagWatcher()
{
	// Run each time a comment is added
	$('#comments-container').bind('DOMNodeInserted', function() {
		// Find out the user's username
		var usersName = $(".account-user-name").text() + ' ';

		// If there is a comment with the same username, add a YOU tag
		var commentAuthors = $(".author a:first-child")
		.each(function(index)
		{
			if(usersName == $(this).text())
				$(this).html($(this).html() + ' <span class="green">YOU </span>');
		});
	});
}

function startLoadingGifResizing(scaleFactor)
{
	// Run each time the body is modified
	$('body').bind('DOMNodeInserted DOMNodeRemoved', function() {
		// If no loading gif is present, do nothing
		if($(".tipsy-inner img").length == 0)
			return;

		// Otherwise calculate a new size
		var newSize = $(".tipsy-inner img").width();

		if(newSize <= 30)
			newSize *= scaleFactor;

		// Update the size
		$(".tipsy-inner img").css("width", newSize + "px");
	});

	// Inject CSS for resizing other images
	$('head').append('<style id="d"> #side-gallery .small-loader, #small-loader {background-repeat: no-repeat !important; background-size:' + scaleFactor*40 + 'px auto !important; } #side-gallery .small-loader, #small-loader { height: ' + scaleFactor*40 + 'px !important; width: ' + scaleFactor*40 + 'px  !important; }  #cboxLoadingGraphic, .zoom-loader { height: auto !important;  width: ' + scaleFactor*40 + 'px !important;}  .outside-loader { width: ' + scaleFactor*40 + 'px !important; height: auto !important; }  #past-wrapper #past-loader { width:' + scaleFactor*48 + 'px !important; height:auto !important; }  #shareonimgur #share-loader { width:' + scaleFactor*24 + 'px !important; height:auto !important; } </style>');
}

function startOldBarInject()
{
	// Each time the image is changed, tell imgur to update the stats
	$('.under-title-info').bind('DOMNodeInserted DOMNodeRemoved', function() {
		// Open the stats box invisibly for data extraction
		$(".stats-link").click(); $(".analyticsOnly").hide(); $("#cboxClose").click(); $(".analyticsOnly").show();
	});

	// Each time the analytics are updated, update the infobar
	$('#info-analytics').bind('DOMNodeInserted DOMNodeRemoved', function() {
		// Merge the two stat lines into one
		$(".stats-link br").remove();
		$(".point-info").css("margin-right", "12px");
		$(".stats-link").css("width", "30%");

		// Get upvote/downvote counts
		var upvoteCount = parseInt($(".ups-total .value").text().replace(/,/g, ''));
		var downvoteCount = parseInt($(".downs-total .value").text().replace(/,/g, ''));

		// Inject stat bar
		var oldStats = '<div id="oldStatBar" style="height: 0.6em; width: 78%; max-width: 300px; margin-top:1.7em; background-color:#e44;"> <div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount) + '%; height: 100%; background-color: #85BF25;"> </div>';
		if($("#oldStatBar").length == 0)
			$(".stats-link").append(oldStats);
		else
			$("#oldStatBar").html('<div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount) + '%; height: 100%; background-color: #85BF25;">');
	});
}

function detectVoteBombs()
{
	addLongPressListener(600, "#mainUpArrow", voteBomb, '.up');
	addLongPressListener(600, "#mainDownArrow", voteBomb, '.down');
}

var vbType = 'na';

function voteBomb(upOdown)
{
	// If everything is already upvoted, undo the upvotes
	if(vbType == upOdown)
	{
		$(upOdown).click();
		vbType = 'na';
		return;
	}

	// Otherwise upvote everything
	$(upOdown).not('.pushed').click();
	vbType = upOdown;

	// Also press the main arrow button if necessary
	var mainArrow;
	if(upOdown == '.up')
		mainArrow = "#mainUpArrow";
	else
		mainArrow = "#mainDownArrow";

	if($(mainArrow).not('.pushed').length != 0)
		$(mainArrow).click();
}

function addLongPressListener(presslength, query, func, param)
{
	var startTime;

	$(query).on('mousedown', function(e){
		startTime = new Date().getTime();
	});

	$(query).on('mouseleave', function(e){
		startTime = 0;
	});

	$(query).on('mouseup', function(e){
		if ( new Date().getTime() >= (startTime + presslength) )
			func(param);
	});
}

function enlargeImagePanel()
{
	$(".main-image .panel").css("width", "63em");
	$("#comments-container").css("width", "63em");
	$("#content").css("width", "91em");
}

function removeSideGallery(largePanelEnabled)
{
	$(".next-prev-browse").remove();
	$("#side-gallery").remove();
	$(".advertisement").remove();
	$("#content").css("width", "610px");
	if(largePanelEnabled)
	{
		$("#content").css("width", "60em");
		$(".main-image .panel").css("width", "60em");
		$("#comments-container").css("width", "60em");
	}
}

function getDateString()
{
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth();
	var yyyy = today.getFullYear();
	return mm + "/" + dd + "/" + yyyy;
}

function spreadTheLove()
{
	var clickedToday = localStorage.getItem("imgurtweaksSTL");
	if(clickedToday != getDateString())
	{
		var loveButtonCode = '<span class="favorite-image btn btn-grey" id="spreadLoveButton" style="margin-left:78px; padding-bottom: 10px;text-align:center;">❤ Spread the love! ❤ </span>';
		$(loveButtonCode).insertAfter(".right #side-gallery");
		$( "#spreadLoveButton" ).click(function() {
			window.open("http://imgur.com/account/messages?STLrecipient=" + getRandomUser());
		});
	}
}

function getRandomUser()
{
	var users = $(".author a:first-child");
	return users[Math.floor(Math.random() * users.size())].text;
}
