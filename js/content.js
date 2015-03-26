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
});