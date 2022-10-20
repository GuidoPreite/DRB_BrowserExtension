window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
        case "be_downloadfile":
			let blobUrl = URL.createObjectURL(message.blob);
			chrome.downloads.download({ url: blobUrl, filename: message.fileName });
		break;
    }
});

function SendBEConnectionToDRB(iframeId, tokenValue) {
	let iframe = document.getElementById(iframeId);
	iframe.contentWindow.postMessage({command: "be_connection", token: tokenValue}, '*');
}

function ExtractToken(storageResult) {
	window.setTimeout(function() { SendBEConnectionToDRB("sandbox", storageResult.drb_be_token); }, 1000);
}

document.addEventListener("DOMContentLoaded", function() {
	chrome.storage.local.get(['drb_be_token'], function(result) { ExtractToken(result);	});
});