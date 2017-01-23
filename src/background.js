function init(config){

    chrome.browserAction.onClicked.addListener(function (tab) {
        var filter = { active: true, currentWindow: true };
        chrome.tabs.query(filter, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { toggleSelectionMode: true });
        });
    });

    chrome.webRequest.onBeforeRequest.addListener(function (filter) {
        console.log("onBeforeRequest");
    }, { urls: ["<all_urls>"] })

    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
            details.requestHeaders.push({ name: 'PointOut', value: '' });
            console.log(details.requestHeaders);
            return { requestHeaders: details.requestHeaders };
        },{ urls: ["*://*." + config.host + "/*"] },
        ["blocking", "requestHeaders"]);


}

var config = new Config();
init(config);