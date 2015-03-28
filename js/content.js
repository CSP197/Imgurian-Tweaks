// Fetch user's saved settings
chrome.storage.sync.get(
	{
		// Default values
		enableLoadingGIFReplacement: false,
		loaderURL: '',
		loaderScaleFactor: 1,
		youTagEnabled: true,
		oldBarEnabled: true,
		voteBombEnabled: true,
	}, 
	function (items)
	{
		if(items.youTagEnabled)
			startYouTagWatcher();

		if(items.enableLoadingGIFReplacement)
			startLoadingGifResizing(items.loaderScaleFactor);
		
		if(items.oldBarEnabled)
			startOldBarInject();
		
		if(items.voteBombEnabled)
			detectVoteBombs();
		
		/*
		var dataString = $('script[type="text/javascript"]:contains("widgetFactory.mergeConfig"):eq(2)').text();
		dataString = dataString.substring(dataString.indexOf("image"), dataString.indexOf("group"));
		dataString = dataString.substring(dataString.indexOf("{"), dataString.lastIndexOf("}") + 1);
		var imageData = JSON.parse(dataString);
		image data extraction... may be useful later
		*/
		
	});

function startYouTagWatcher()
{
	// Run each time a comment is added
	$('#comments').bind('DOMNodeInserted DOMNodeRemoved', function() {
		// Find out the user's username
		var usersName = $(".account-user-name").text();
		
		// If there is a comment with the same username, add a YOU tag
		var commentAuthors = $(".author a")
		.filter(function(index)
			{
				return index % 3 == 0;
			}
		)
		.each(function(index)
		{
			if(usersName == $(this).text())
				$(this).html($(this).html() + ' <span class="green">YOU</span>');
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