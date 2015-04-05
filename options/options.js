// Saves options to chrome.storage.sync.
function save_options() {
	chrome.storage.sync.set({
		loaderURL: document.getElementById('gifURL').value,
		loaderScaleFactor: document.getElementById('scalingFactorSlider').value,
		loadingGIFReplacementEnabled: document.getElementById('gifReplacement').checked,
		youTagEnabled: document.getElementById('youAddEnabled').checked,
		oldBarEnabled: document.getElementById('oldBarEnabled').checked,
		voteBombEnabled: document.getElementById('voteBombEnabled').checked,
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
		loadingGIFReplacementEnabled: false,
		loaderURL: '',
		loaderScaleFactor: 1,
		youTagEnabled: true,
		oldBarEnabled: true,
		voteBombEnabled: true,
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
		document.getElementById('youAddEnabled').checked = items.youTagEnabled;
		document.getElementById('oldBarEnabled').checked = items.oldBarEnabled;
		document.getElementById('voteBombEnabled').checked = items.voteBombEnabled;
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
