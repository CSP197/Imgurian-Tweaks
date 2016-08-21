var usingLargePanel = false;
var sideGalleryRemoved = false;

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
		startAddResizerButton();

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
			removeSideGallery();
		sideGalleryRemoved = items.sideGalleryRemoveEnabled;

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
	return ($(".account-user-name").text() != "");
}

function startCommentWatcher(userLoggedInBool, youTagAddEnabled, staffTagAddEnabled)
{
	var imgurEmployees = ["sarah", "alan", "spatrizi", "thespottedbunny", "tyrannoSARAusrex", "brianna", "andytuba", "talklittle"];

	// Find out the user's username
	var usersName = $(".account-user-name").text();

	$(document).on('DOMNodeInserted', '#comments-container .children:first', function(e){
		$(e.target).find('.author').each(function(i) {
			var comment_writer = $(this).find(".comment-username").text();
			if(userLoggedInBool && youTagAddEnabled)
				if(usersName == comment_writer)
					addCommentTag(this, "YOU");
			if(staffTagAddEnabled && $.inArray(comment_writer, imgurEmployees) != -1)
				addCommentTag(this, "STAFF");
		});
	});
}

function addCommentTag(comment, tag){
	var toInsert = '<span style="color: #39c442; padding: 0 4px; font-weight: 700; margin-left: 6px;">' + tag + ' </span>';
	if($(comment).find(".via").length != 0){
		$(toInsert).insertAfter($(comment).find(".via"));
	}else{
		$(toInsert).insertAfter($(comment).find(".comment-username"));
	}
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
	$(document).on('DOMCharacterDataModified', '.post-title', injectNewVoteBar);
}

function injectNewVoteBar()
{
	if($("#oldStatBar").length != 0)
	{
		window.setTimeout(injectNewVoteBar, 100);
		return;
	}

	var upvoteCount = 1;
	var downvoteCount = 0;

	var oldStats = `<div id="oldStatBar" onclick="$('.post-action-stats-points').click()"style="height: 40%; width: 30%; max-width: 300px; background-color:#e44; margin-bottom: 0.2em; border-radius: 8px;" class="post-action-icon"> 
						<div style="width: ` + upvoteCount*100/(upvoteCount+downvoteCount)  + `%; height: 100%; background-color: #85BF25; border-radius: 8px;"> </div>
					</div>`;

	if($("#oldStatBar").length == 0)
		$(oldStats).insertAfter(".post-action-actions button:last");
	else
		$("#oldStatBar").html('<div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount)  + '%; height: 100%; background-color: #85BF25; border-radius: 8px;"> </div>');

	// Get image data
	$.get( window.location.href + ".json", function( data ) {
		var upvoteCount = data.data.image.ups;
		var downvoteCount = data.data.image.downs;

		$("#oldStatBar").html('<div style="width: ' + upvoteCount*100/(upvoteCount+downvoteCount)  + '%; height: 100%; background-color: #85BF25; border-radius: 8px;"> </div>');
	});
}

function detectVoteBombs()
{
	return; // Need to figure out different way to "click"
	addLongPressListener(600, ".comment-vote.icon-upvote-fill", voteBomb, '.up');
	addLongPressListener(600, ".comment-vote.icon-downvote-fill", voteBomb, '.down');
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

	console.log(upOdown);


	// Otherwise upvote everything
	vbType = upOdown;

	// Also press the main arrow button if necessary
	var mainArrow;
	if(upOdown == '.up')
		mainArrow = ".comment-vote.icon-upvote-fill";
	else
		mainArrow = ".comment-vote.icon-downvote-fill";

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

function startAddResizerButton()
{
	addResizerButton();
	$(document).on('DOMCharacterDataModified', '.post-title', addResizerButton);
}

var imgContainerSize = 728;
var sideBarSize = 320;
var largePanelExtensionSize = 250;

function addResizerButton()
{
	if($("#resizeButton").length != 0)
	{
		window.setTimeout(addResizerButton, 100);
		return;
	}

	var resizeButton = '<img src="' + getCurrentResizePic() + '" id="resizeButton" style="height: 14px; margin-left: 16px; margin-right: -10px; -webkit-filter: invert(80%);" class="options-btn combobox post-menu right">';
	$(".post-action-meta div:first").append(resizeButton);
	$("#resizeButton").click(toggleSize);
}

function enlargeImagePanel()
{
	$("#inside").css("width", imgContainerSize + sideBarSize + largePanelExtensionSize + "px");
	$(".post-container").css("width", imgContainerSize + largePanelExtensionSize + "px");
	$(".post-header").css("width", imgContainerSize + largePanelExtensionSize + "px");
	$("#comments-container").css("width", imgContainerSize + largePanelExtensionSize + "px");
	$(".post-image img, .post-image video, .post-image object").css("max-width", imgContainerSize + largePanelExtensionSize + "px");
}

function revertToSmallImagePanel()
{
	$("#inside").css("width", imgContainerSize + sideBarSize + "px");
	$(".post-container").css("width", imgContainerSize + "px");
	$(".post-header").css("width", imgContainerSize + "px");
	$("#comments-container").css("width", imgContainerSize + "px");
	$(".post-image img, .post-image video, .post-image object").css("max-width", imgContainerSize + "px");;
}

function getCurrentResizePic()
{
	if (usingLargePanel) {
		return chrome.extension.getURL("res/fullscreen-exit-8x.png");
	}else {
		return chrome.extension.getURL("res/fullscreen-enter-8x.png");
	}
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

	if(sideGalleryRemoved){
		removeSideGallery();
	}
}


function removeSideGallery()
{
	$("#right-container").remove();
	$("#inside").css("width", "728px");
	if(usingLargePanel)
		$("#inside").css("width", imgContainerSize + largePanelExtensionSize + "px");
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
