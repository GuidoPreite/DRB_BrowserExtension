chrome.action.onClicked.addListener(function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("drb_be_gettoken.htm") });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if(tab.url.indexOf("https://callbackurl") === 0) {
		if(tab.url.indexOf("https://callbackurl/#access_token") === 0) {
			let access_token = tab.url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
			chrome.storage.local.set({drb_be_token: access_token}, function() {
				chrome.tabs.update({url: chrome.runtime.getURL("drb_be_sandbox.htm")});
			});
		} else {
			chrome.tabs.update({url: chrome.runtime.getURL("drb_be_gettoken.htm")});
		}
	}
});