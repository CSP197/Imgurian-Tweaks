chrome.storage.sync.get(["loaderURL", "enableLoadingGIFReplacement", "youTag", "loaderScaleFactor", "oldBarEnabled"], function (items) {
	
	var sizeTimer;

	if(items.youTag)
		$('#comments').bind('DOMNodeInserted DOMNodeRemoved', function() {
			var usersName = $(".account-user-name").text();
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

	if(items.enableLoadingGIFReplacement)
	{
		var scaleFactor = items.loaderScaleFactor;
		
		$('body').bind('DOMNodeInserted DOMNodeRemoved', function() {
			if($(".tipsy-inner img").length == 0)
				return;
			
			var newSize = $(".tipsy-inner img").width();

			
			if(newSize <= 30)
				newSize *= scaleFactor;
			
			$(".tipsy-inner img").css("width", newSize + "px");
		});

		$('head').append('<style id="d"> #side-gallery .small-loader, #small-loader {background-repeat: no-repeat !important; background-size:' + scaleFactor*40 + 'px auto !important; } #side-gallery .small-loader, #small-loader { height: ' + scaleFactor*40 + 'px !important; width: ' + scaleFactor*40 + 'px  !important; }  #cboxLoadingGraphic, .zoom-loader { height: auto !important;  width: ' + scaleFactor*40 + 'px !important;}  .outside-loader { width: ' + scaleFactor*40 + 'px !important; height: auto !important; }  #past-wrapper #past-loader { width:' + scaleFactor*48 + 'px !important; height:auto !important; }  #shareonimgur #share-loader { width:' + scaleFactor*24 + 'px !important; height:auto !important; } </style>'); 
	}
	
	/*
	var dataString = $('script[type="text/javascript"]:contains("widgetFactory.mergeConfig"):eq(2)').text();
	dataString = dataString.substring(dataString.indexOf("image"), dataString.indexOf("group"));
	dataString = dataString.substring(dataString.indexOf("{"), dataString.lastIndexOf("}") + 1);
	var imageData = JSON.parse(dataString);
	image data extraction
	*/

	if(items.oldBarEnabled)
	{
		// Open the stats box for data extraction
		$(".stats-link").click(); $(".analyticsOnly").hide(); $("#cboxClose").click(); $(".analyticsOnly").show(); 
		
		$('#info-analytics').bind('DOMNodeInserted DOMNodeRemoved', function() {
			// Merge the two stat lines into one
			$(".stats-link br").remove();
			$(".point-info").css("margin-right", "12px");
			$(".stats-link").css("width", "30%");
			
			// Allow for 50ms for data collection
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
});