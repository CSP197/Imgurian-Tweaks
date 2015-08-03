// Saves options to chrome.storage.sync.
function save_options() {
	chrome.storage.sync.set({
		loaderURL: document.getElementById('gifURL').value,
		loaderScaleFactor: document.getElementById('scalingFactorSlider').value,
		loadingGIFReplacementEnabled: document.getElementById('gifReplacement').checked,
		youTagAddEnabled: document.getElementById('youTagAddEnabled').checked,
		staffTagAddEnabled: document.getElementById('staffTagAddEnabled').checked,
		oldBarEnabled: document.getElementById('oldBarEnabled').checked,
		voteBombEnabled: document.getElementById('voteBombEnabled').checked,
		largeImageModeEnabled: document.getElementById('largeImageModeEnabled').checked,
		sideGalleryRemoveEnabled: document.getElementById('sideGalleryRemoveEnabled').checked,
		uploadContextMenuEnabled: document.getElementById('uploadContextMenuEnabled').checked,
		spreadTheLoveEnabled: document.getElementById('spreadTheLoveEnabled').checked,
		notificationsEnabled: document.getElementById('notificationsEnabled').checked,
		STLMessage: document.getElementById('STLMessage').value,
		spreadTheLoveLimitEnabled: document.getElementById('spreadTheLoveLimitEnabled').checked
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
		// Reload the extension
		chrome.runtime.reload();
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
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
		notificationsEnabled: true,
		STLMessage: "I hope you have a great day! Don't let anything bring you down!",
		spreadTheLoveLimitEnabled: true
	}, function(items) {
		document.getElementById('gifURL').value = items.loaderURL;
		document.getElementById('scalingFactorData').value = items.loaderScaleFactor;
		document.getElementById('scalingFactorSlider').value = items.loaderScaleFactor;
		if(items.loadingGIFReplacementEnabled)
			$("#previewIMG").click();
		document.getElementById('gifReplacement').checked = items.loadingGIFReplacementEnabled;
		if(!items.loadingGIFReplacementEnabled)
		{
			// Disable all
		}
		document.getElementById('youTagAddEnabled').checked = items.youTagAddEnabled;
		document.getElementById('staffTagAddEnabled').checked = items.staffTagAddEnabled;
		document.getElementById('oldBarEnabled').checked = items.oldBarEnabled;
		document.getElementById('voteBombEnabled').checked = items.voteBombEnabled;
		document.getElementById('largeImageModeEnabled').checked = items.largeImageModeEnabled;
		document.getElementById('sideGalleryRemoveEnabled').checked = items.sideGalleryRemoveEnabled;
		document.getElementById('uploadContextMenuEnabled').checked = items.uploadContextMenuEnabled;
		document.getElementById('spreadTheLoveEnabled').checked = items.spreadTheLoveEnabled;
		document.getElementById('notificationsEnabled').checked = items.notificationsEnabled;
		document.getElementById('STLMessage').value = items.STLMessage;
		document.getElementById('spreadTheLoveLimitEnabled').checked = items.spreadTheLoveLimitEnabled;
		updateSTLView();
	});
}

// Add event listeners
document.addEventListener('DOMContentLoaded', restore_options);

$('#scalingFactorSlider').on("change mousemove", function() {
	$("#previewIMG").click();
});

$("#previewIMG").click(function(){
	// Update the slider data value from the slider's value
	$('#scalingFactorData').text($('#scalingFactorSlider').val());
	// Inject the image
	var srcCode = '<img src="' + $("#gifURL").val() + '" height="' + 36 * $('#scalingFactorData').text() + 'px" width=auto>';
	$("#previewArea").html(srcCode);
});

$("#save").click(function(){
	save_options();
});

function updateSTLView(){
	if(document.getElementById('spreadTheLoveEnabled').checked)
	{
		$('#STLMessageSetter').css("display", "inline");
	}else{
		$('#STLMessageSetter').css("display", "none");
	}
}

$('#spreadTheLoveEnabled').click(updateSTLView);
