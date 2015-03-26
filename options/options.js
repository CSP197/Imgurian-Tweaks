function updateSliderData()
{
		document.getElementById('scalingFactorData').innerHTML = document.getElementById('scalingFactorSlider').value;
}

// Saves options to chrome.storage.sync.
function save_options() {
	chrome.storage.sync.set({
		loaderURL: document.getElementById('gifURL').value,
		loaderScaleFactor: document.getElementById('scalingFactorSlider').value,
		enableLoadingGIFReplacement: document.getElementById('gifReplacement').checked,
		youTag: document.getElementById('YouAdder').checked,
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	
	$('#scalingFactorSlider').on("change mousemove", function() {
		$("#previewIMG").click();
	});
	
	$("#previewIMG").click(function(){
		$('#scalingFactorData').text($('#scalingFactorSlider').val());
		var srcCode = '<img src="' + $("#gifURL").val() + '" height="' + 36 * $('#scalingFactorData').text() + 'px" width=auto>';
        $("#previewArea").html(srcCode);
    }); 

	$("#save").click(function(){
		save_options();
    }); 

	
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		enableLoadingGIFReplacement: false,
		loaderURL: '',
		loaderScaleFactor: 1,
		youTag: true,
	}, function(items) {
		document.getElementById('gifURL').value = items.loaderURL;
		document.getElementById('scalingFactorData').value = items.loaderScaleFactor;
		document.getElementById('scalingFactorSlider').value = items.loaderScaleFactor;
		if(items.enableLoadingGIFReplacement)
			$("#previewIMG").click();
		document.getElementById('gifReplacement').checked = items.enableLoadingGIFReplacement;
		if(!items.enableLoadingGIFReplacement)
		{
			// Disable all
		}
		document.getElementById('YouAdder').checked = items.youTag;
	});
}

document.addEventListener('DOMContentLoaded', restore_options)