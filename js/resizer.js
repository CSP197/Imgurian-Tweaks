var sizeTimer;

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

$('body').bind('DOMNodeInserted DOMNodeRemoved', function() {
	if($(".tipsy-inner img").length == 0)
		return;
	
	var newSize = $(".tipsy-inner img").width();

	if(newSize <= 30)
		newSize *= 1.80;
	
	$(".tipsy-inner img").css("width", newSize + "px");
});

$('head').append('<style id="d"> #side-gallery .small-loader, #small-loader {background-repeat: no-repeat !important; background-size: 100px auto !important; } </style>'); 

