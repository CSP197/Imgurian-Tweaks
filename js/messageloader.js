var url = window.location.href;

if(url.indexOf("messages?STLrecipient=") > -1)
{

    var recepient = url.split("messages?STLrecipient=")[1];

    $(".new-message-text").click();
    $("input[type='text'][name='recipient']").val(recepient);

    if(recepient.indexOf("potatocannon") == -1)
    {
        chrome.storage.sync.get({
            // Default values
            STLMessage: "I hope you have a great day! Don't let anything bring you down!"
        }, function(items) {
            $("textarea[title='Message']").val(items.STLMessage);
        });
        $("#pm-form").prepend("<p style='padding:2px; margin-bottom: 10px'><b> Spread the Love! </b> Make someone's day by sending them a nice message!</p>");
        $("#cboxContent").height("285px");
        $("#cboxLoadedContent").height("285px");
    }

    var extensionIcon = '<img style="float:right; height:32px; padding-right:10px;" src="' + chrome.extension.getURL("res/marquee.png") + '">';
    $(extensionIcon).insertAfter("#pm-send-button");
    localStorage.setItem("imgurtweaksSTL", getDateString());
}
