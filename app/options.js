'use strict';

function standardRulesLoaded() {
	document.getElementById('translation-rules').value = this.responseText;
}

function loadStandardRules() {
	var lang = document.getElementById('language').value;
	
	if (lang.length > 0) {
		
		var res = chrome.extension.getURL( lang + '.rules' );
		console.log(res);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = standardRulesLoaded; // Implemented elsewhere.
		xhr.open('GET', res, true);
		xhr.send();
		
	}
	
	document.getElementById('language').value = '';
	
}

function loadOptions() {
  chrome.storage.sync.get({
    translationRules: ''
  }, function (items) {
    document.getElementById('translation-rules').value = items.translationRules;
  });
}

function saveOptions() {

  var rules = document.getElementById('translation-rules').value;
  chrome.storage.sync.set({
    translationRules: rules
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved. Please reload the Page with Crowdin-Editor';
    setTimeout(function () {
      status.textContent = '';
    }, 2500);
  });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('language').addEventListener('change', loadStandardRules);