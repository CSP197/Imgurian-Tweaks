var url = window.location.href;
if(url.indexOf("messages?STLrecipient=") > -1)
{
        localStorage.setItem("imgurtweaksSTL", getDateString());
        var recepient = url.split("messages?STLrecipient=")[1];
        $("#pm-form").prepend("<p style='padding:2px; margin-bottom: 10px'><b> Spread the Love! </b> Make someone's day by sending them a nice message!</p>");
        $(".new-message-text").click();
        $("input[type='text'][name='recipient']").val(recepient);
        var randomText = "I hope you have a great day! Remember not to let anything bring you down!";
        $("textarea[title='Message']").val(randomText);
        $("#cboxContent").height("285px");
        $("#cboxLoadedContent").height("285px");
        var extensionIcon = '<img style="float:right; height:32px; padding-right:10px;" src="' + chrome.extension.getURL("res/marquee.png") + '">';
	$(extensionIcon).insertAfter("#pm-send-button");
}
