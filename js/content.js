var usingLargePanel = false;

// Fetch user's saved settings
chrome.storage.sync.get(
	{
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
		spreadTheLoveLimitEnabled: true
	}, function(items) {
		usingLargePanel = items.largeImageModeEnabled;
		addResizerButton();

		if(items.loadingGIFReplacementEnabled)
			startLoadingGifResizing(items.loaderScaleFactor);

		var url = window.location.href;
		if(url.indexOf("/gallery/") <= -1 && url.indexOf("/favorites/") <= -1)
			return;

		var userLoggedInBool = userLoggedIn();

		if(items.youTagAddEnabled || items.staffTagAddEnabled)
			startCommentWatcher(userLoggedInBool, items.youTagAddEnabled, items.staffTagAddEnabled);

		if(items.oldBarEnabled)
			startOldBarInject();

		if(items.voteBombEnabled && userLoggedInBool)
			detectVoteBombs();

		if(items.spreadTheLoveEnabled && userLoggedInBool)
			spreadTheLove(items.spreadTheLoveLimitEnabled);

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

function startCommentWatcher(userLoggedInBool, youTagAddEnabled, staffTagAddEnabled)
{
	var imgurEmployees = ["sarah ", "alan ", "spatrizi ", "thespottedbunny ", "tyrannoSARAusrex ", "brianna ", "andytuba ", "talklittle "];

	// Find out the user's username
	var usersName = $(".account-user-name").text() + ' ';

	// Run each time a comment is added
	$('#comments-container').bind('DOMNodeInserted', function(e) {
		$(e.target).find('.author a:first-child').each(function(i) {
			if(userLoggedInBool && youTagAddEnabled)
				if(usersName == $(this).text())
					$(this).html($(this).html() + ' <span class="green">YOU </span>');
			if(staffTagAddEnabled && $.inArray($(this).text(), imgurEmployees) != -1)
				$(this).html($(this).html() + ' <span class="green">STAFF </span>');
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
	injectNewVoteBar();

	// Each time the image is changed, tell imgur to update the stats
	$('.post-title').bind('DOMNodeInserted DOMNodeRemoved', function() {
		injectNewVoteBar();
	});
}

function injectNewVoteBar()
{
	var upvoteCount = 1;
	var downvoteCount = 0;

	// Merge the two stat lines into one
	$(".action-bar .views-info").css("clear", "none");
	$(".point-info").css("margin-right", "0.5em");
	$(".stats-link").css("width", "30%");

	var oldStats = '<div id="oldStatBar" style="height: 0.6em; width: 78%; max-width: 300px; margin-top:1.7em; background-color:#e44;"> <div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount) + '%; height: 100%; background-color: #85BF25;"> </div>';
	if($("#oldStatBar").length == 0)
		$(".stats-link").append(oldStats);
	else
		$("#oldStatBar").html('<div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount) + '%; height: 100%; background-color: #85BF25;">');

	// Get image data
	$.get( window.location.href + ".json", function( data ) {
		var upvoteCount = data.data.image.ups;
		var downvoteCount = data.data.image.downs;

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
	$("#inside").css("width", "1200px");
	$(".post-container").css("width", "880px");
	$(".post-header").css("width", "840px");
	$(".post-title").css("max-width", "660px");
	$("#comments-container").css("width", "840px");
	$(".post-image img, .post-image video, .post-image object").css("width", "820px");

	// MegaMode
	/*
$(".main-image .panel").css("width", "70vw");
	$(".main-image .image img").css("max-width", "70vw");
	$("#comments-container").css("width", "70vw");
	$("#content").css("width", "93vw");
$("#right-content").css("width", "20vw");
$("#side-gallery").css("width", "100%");
	*/
}

function revertToSmallImagePanel()
{
	$("#inside").css("width", "1000px");
	$(".post-container").css("width", "680px");
	$(".post-header").css("width", "640px");
	$(".post-title").css("max-width", "440px");
	$("#comments-container").css("width", "640px");
	$(".post-image img, .post-image video, .post-image object").css("width", "620px");
}

function getCurrentResizePic()
{
	if (usingLargePanel) {
		return chrome.extension.getURL("res/fullscreen-exit-8x.png");
	}else {
		return chrome.extension.getURL("res/fullscreen-enter-8x.png");
	}
}

function addResizerButton()
{
	var resizeButton = '<img src="' + getCurrentResizePic() + '" id="resizeButton" style="height: 14px; margin-top: 12px; -webkit-filter: invert(60%);" class="options-btn combobox post-menu right">';
	$(".image-options.button-container").prepend(resizeButton);
	$("#resizeButton").click(toggleSize);
}

function toggleSize()
{
	usingLargePanel = !usingLargePanel;
	$("#resizeButton").attr('src', getCurrentResizePic());
	if(usingLargePanel)
	{
		enlargeImagePanel();
	}else {
		revertToSmallImagePanel();
	}

	if($("#right-content").length == 0)
	{
		removeSideGallery(usingLargePanel);
	}

	chrome.storage.sync.set({
		largeImageModeEnabled: usingLargePanel
	});
}


function removeSideGallery(largePanelEnabled)
{
	$("#right-content").remove();
	$("#inside").css("width", "680px");
	if(largePanelEnabled)
		$("#inside").css("width", "885px");
}

function getDateString()
{
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth();
	var yyyy = today.getFullYear();
	return mm + "/" + dd + "/" + yyyy;
}

function spreadTheLove(limitEnabled)
{
	var clickedToday = localStorage.getItem("imgurtweaksSTL");
	if(!limitEnabled || clickedToday != getDateString())
	{
		var loveButtonCode = '<span class="favorite-image btn btn-grey" id="spreadLoveButton" style="margin-top:10px; margin-left:58px; padding-bottom: 10px;text-align:center;">❤ Spread the love! ❤ </span>';
		$(loveButtonCode).insertAfter(".right #side-gallery");
		$( "#spreadLoveButton" ).click(function() {
			if(limitEnabled)
				$("#spreadLoveButton").remove();
			window.open("http://imgur.com/account/messages?STLrecipient=" + getRandomUser());
		});
	}
}

function getRandomUser()
{
	var users = $(".author a:first-child");
	return users[Math.floor(Math.random() * users.size())].text;
}
