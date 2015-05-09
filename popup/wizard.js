$("#loading").append("<img src='" + chrome.extension.getURL("res/loader.gif") + "' width=300px>");

$.get('http://imgur.com/' , function(data){
	auth = extractAuth(data);
	if(!auth.url)
        {
                showNotLoggedIn();
        }else{
                showUserAccount(auth);
        }
});

function showNotLoggedIn(){
        $("#loading").hide();
        $("#notLoggedIn").show();
        addClickListener("#imgurLink", "http://www.imgur.com");
}

function showUserAccount(auth)
{
        addClickListener("#notifications", "https://imgur.com/user/" + auth.url);
        addClickListener("#userName", "https://imgur.com/user/" + auth.url);

        $("#userName").text("Hey, " + auth.url + "!");

        if(auth.notifications == "0")
                $("#notifications").text("You have no notifications... :(");
        else if (auth.notifications == "1")
                $("#notifications").text("You have 1 notification!");
        else
                $("#notifications").text("You have " + auth.notifications + " notifications!");


        $.get('http://imgur.com/user/' + auth.url + '/submitted/newest.json' , function(data){
                if(data.data.length != 0)
                {
                        addClickListener("#submission1", "https://imgur.com/gallery/" +  data.data[0].hash);
                        $("#submission1").prepend('<img class="gallery-img" src="https://i.imgur.com/' + (data.data[0].is_album ? data.data[0].album_cover : data.data[0].hash) + 'b.jpg">');
                        $("#submission1 .sub-title").text(data.data[0].title);
                        $("#submission1 .sub-view_score").text("Views: " + data.data[0].views + " | Score: " + data.data[0].score + " | Hot: " + (data.data[0].is_hot ? "Yes" : "No"));
                        var oldStats = '<br><div id="oldStatBar" style="height: 0.6em; width: 78%; max-width: 180px; margin-left:7em; background-color:#e44;"> <div style="width: ' +  data.data[0].ups*100/( data.data[0].ups+ data.data[0].downs) + '%; height: 100%; background-color: #85BF25;"> </div>';
                        $("#submission1").append(oldStats);
                }
                if(data.data.length > 1)
                {
                        addClickListener("#submission2", "https://imgur.com/gallery/" +  data.data[1].hash);
                        $("#submission2").prepend('<img class="gallery-img" src="https://i.imgur.com/' + (data.data[1].is_album ? data.data[1].album_cover : data.data[1].hash) + 'b.jpg">');
                        $("#submission2 .sub-title").text(data.data[1].title);
                        $("#submission2 .sub-view_score").text("Views: " + data.data[1].views + " | Score: " + data.data[1].score + " | Hot: " + (data.data[1].is_hot ? "Yes" : "No"));
                        var oldStats = '<br><div id="oldStatBar" style="height: 0.6em; width: 78%; max-width: 180px; margin-left:7em; background-color:#e44;"> <div style="width: ' +  data.data[1].ups*100/( data.data[1].ups+ data.data[1].downs) + '%; height: 100%; background-color: #85BF25;"> </div>';
                        $("#submission2").append(oldStats);
                }
        });

	$("#loading").hide();
	$("#userPanel").show();
}

function extractAuth(data)
{
	var index = data.indexOf("Imgur.Environment =");
	var data = data.substring(index, data.indexOf("};", index));
	if(data.indexOf("auth") == -1)
	{
		return {};
	}else{
		index = data.indexOf("auth");
		return JSON.parse(data.substring(index + 5, data.indexOf("},", index)+1));
	}
}

function addClickListener(query, link)
{
        $(query).click(function() {
                window.open(link);
        });
}
