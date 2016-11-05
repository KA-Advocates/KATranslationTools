
// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {

	chrome.tabs.create({url:"https://github.com/KA-Advocates/KATranslationTools"});

});
