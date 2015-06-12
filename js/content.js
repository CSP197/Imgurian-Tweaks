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
		spreadTheLoveEnabled: false
	},
	function (items)
	{
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

function startCommentWatcher(userLoggedInBool, youTagAddEnabled, staffTagAddEnabled)
{
	var imgurEmployees = ["sarah ", "alan ", "spatrizi ", "thespottedbunny ", "tyrannoSARAusrex ", "brianna ", "andytuba ", "talklittle "];

	// Find out the user's username
	var usersName = $(".account-user-name").text() + ' ';

	// Run each time a comment is added
	$('#comments-container').bind('DOMNodeInserted', function(e) {
		var changedAuthor = $(e.target).find(".author a:first-child");

		if(userLoggedInBool && youTagAddEnabled)
			if(usersName == $(changedAuthor).text())
				$(changedAuthor).html($(changedAuthor).html() + ' <span class="green">YOU </span>');
		if(staffTagAddEnabled && $.inArray($(changedAuthor).text(), imgurEmployees) != -1)
			$(changedAuthor).html($(changedAuthor).html() + ' <span class="green">STAFF </span>');
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
	$('#image-title-container').bind('DOMNodeInserted DOMNodeRemoved', function() {
		injectNewVoteBar();
	});
}

function injectNewVoteBar()
{
	var upvoteCount = 1;
	var downvoteCount = 0;

	// Merge the two stat lines into one
	$(".stats-link br").remove();
	$(".point-info").css("margin-right", "12px");
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
	$(".main-image .panel").css("width", "63em");
	$(".main-image .image img").css("max-width", "63em");
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
		$(".main-image .image img").css("max-width", "60em");
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
/*
function addResizerButton()
{
	<div id="options-btn" class="options-btn combobox post-menu right" name="size">
            <span class="selection"></span>
            <span class="icon-menu"></span>
    </div>
}
*/
