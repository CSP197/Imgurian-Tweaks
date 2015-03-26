chrome.storage.sync.get(["loaderURL", "enableLoadingGIFReplacement", "youTag", "loaderScaleFactor"], function (items) {
	
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
		$('body').bind('DOMNodeInserted DOMNodeRemoved', function() {
			if($(".tipsy-inner img").length == 0)
				return;
			
			var newSize = $(".tipsy-inner img").width();

			var scaleFactor = items.loaderScaleFactor;
			
			if(newSize <= 30)
				newSize *= scaleFactor;
			
			$(".tipsy-inner img").css("width", newSize + "px");
		});

		$('head').append('<style id="d"> #side-gallery .small-loader, #small-loader {background-repeat: no-repeat !important; background-size:' + scaleFactor*100 + 'px auto !important; } #side-gallery .small-loader, #small-loader { height: ' + scaleFactor*100 + 'px !important; width: ' + scaleFactor*100 + 'px !important; }  #cboxLoadingGraphic, .zoom-loader { width: ' + scaleFactor*100 + '% !important; }  .outside-loader { width:' + scaleFactor*100 + '% !important; height:' + scaleFactor*100 + '% !important; }  #past-wrapper #past-loader { width:' + scaleFactor*48 + 'px !important; height:' + scaleFactor*48 + 'px !important; }  #shareonimgur #share-loader { width:' + scaleFactor*24 + 'px !important; height:' + scaleFactor*24 + 'px !important; } </style>'); 
	}
});