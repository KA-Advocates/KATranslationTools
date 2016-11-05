  // ==UserScript==
  // @name        KA Crowdin Translation Tools
  // @namespace   kadeutsch.org/kacrowdintools
  // @include     https://crowdin.com/translate/khanacademy/*
  // @include     https://translate.khanacademy.org/translate/*
  // @description Various keyboard shortcuts to make KA translation on crowdin a little bit easier
  // @version     0.5.3
  // @grant       none
  // @author      Alain Schaefer & Uli Köhler
  // @updateURL   https://raw.githubusercontent.com/ulikoehler/KATranslationTools/master/KATranslationTools.user.js
  // ==/UserScript==

  /*
   Alt + A : Show all excercises (only on translate.khanacadey.org)
   Alt + N : Move to next exercise (only on translate.khanacadey.org)
   Alt + P : Open all new Window with Strings in proofread modus on crowdin (only on translate.khanacadey.org)
   Alt + U : Replace all formulas with formulas from englisch original (works on crowin.net and translate.khanacademy.org)
   Alt + I : replace Image URLs and fix common german Bing-Translation Errors (works on crowin.net and translate.khanacademy.org)
   Alt + W : Auto-fix coordinates. Works only for coordinates WITHOUT operators.
   Alt + Q : Other fixes. Currently: Convert $\\$123$ to $123{\,}€$ ; Convert simple numbers with dot to comma
   Alt + L : Show images
   */

   
(function(){   
   /**
    * Alt+Q: Various fixes & autotranslations for common phrases
    */
   function altQAction() {
        //Dollary
        simpleReplaceInTxtbox( /\$\\\\\$(-?\d+([.,]\d+)?)\$/g, '$$$1{\\,}€\$');
        //Decimal dot to comma
        simpleReplaceInTxtbox(/(-?\d+\}?)\.(-?\d+|\\\\[a-z]+\{\d+)/g, '$1{,}$2');
        //In number: Need {\,} instead of {\ }
        simpleReplaceInTxtbox(/(\d+)\{\\ \}(\d+)/g, '$1{\\,}$2');
        //In number: Need percentage
        simpleReplaceInTxtbox(/\\*\s*%\s*\$/g, '{\\,}\\%$$');
		
		doAutoTranslation();
   }

   /**
    * Alt+W: Fix coordinates
    */
   function altWAction() {    
        var expr = /\$([A-Z]?\{?)\(\s*(-?\d+(([\.,]|\{,\})\d+)?|-?[a-z]|-?\\\\[a-z]+[A-Z]?\{-?\d+[.,]?\d*\})\s*[,;|]\s*(-?\d+(([\.,]|\{,\})\d+)?|-?[a-z]|-?\\\\[a-z]+[A-Z]?\{-?\d+[.,]?\d*\})\s*\)(\}?)\$/g;
        simpleReplaceInTxtbox(expr, '$$$1($2{\\,}|{\\,}$5)$8$$');
   }

   function altUAction() {
      //Find \\text{...} segments that we can re-insert later
      var textSegments = findTextSegments();
      // TODO: need to correctly handle escpade Dollar signs e.g. \$ should not be machted as start or end string works in Python and PHP \$.+?(?<!\\)\$ but no in javascript
      var expr = /(\$.+?\$)/g
      var expr2 = /(\$.+?\$)/g
      replacePattern(expr,expr2);
      //Re-insert text segments
      replaceTextSegments(textSegments);
   }

   /**
    * Alt+I: Image fixes and replace image URLs & do autotranslations
    */
   function altIAction() {
      //Fix the Bing ImgURL error
      simpleReplaceInTxtbox(/!\s+\[\]\s+\(/g, '![](');

	  doAutoTranslations();
	  
      // on regex for english, and second for translation string
      var expr =  /!\[\]\((.+?)\)/g
      var expr2 =  /!\[\]\((.+?)\)/g          
      replacePattern(expr,expr2); //causes exception.

   }

   
  /**
   *  
   */ 
  function doAutoTranslations() {
	
	chrome.storage.sync.get({
		translationRules: ''
	}, function (items) {
		
		//Every rule is on a separate line, remove comments
		var rules = items.translationRules.split('\n');
		var ruleWithoutComments = items.translationRules.split('//')[0];
		
		for ( i in ruleWithoutComments ) {
			
			if ( rules[i].length > 0 ) {
				console.log(rules[i]);
				//Split the rule into Regexp separated by comma from the repalcement String
				var rule = rules[i].split(',');
				simpleReplaceInTxtbox(new RegExp(rules[0]), rules[1]);
			}
		}
		
	});		
  }   
  /**
   * Get the text value in the textbox.
   * For debugging purposes ONLY. The information where to replace
   * the value is lost!!
   */
  function getTxtboxValue(regex, replacement) {
      var txtBox = document.getElementById('translation');
      return (txtBox.innerHTML || txtBox.value);
  }

  function replacePattern(expr,expr2){
      
      //find the propper Crowdin HTML Elements
      var myDoc = document.getElementById('source_phrase_container');
      var txtBox = document.getElementById('translation');
      
      //copy the HTML values
      var sourceStr = myDoc.innerText;
      var txtBoxValue = (txtBox.innerHTML || txtBox.value);

      var valueIsInValueProperty = (txtBox.innerHTML == '');
      
      var result;
      var newTextBoxValue = txtBoxValue;
      
      //replace every occurence of pattern with corresponding occurence in sourcestring e.g. 1st with 1st, 2nd with 2nd
      while (( result = expr.exec(sourceStr)) !== null  ) {
          txtBoxResult = expr2.exec(txtBoxValue);  
          //console.log('replacing ' + txtBoxResult[0] + " with " + result[0]);
          newTextBoxValue = newTextBoxValue.replace(txtBoxResult[0], result[0]);
      }
      //Set new value
      if(valueIsInValueProperty) {txtBox.value = newTextBoxValue;}
      else {txtBox.innerHTML = newTextBoxValue;}
  }

  /**
   * Simple replace without looking at original (untranslated) string.
   */
  function simpleReplaceInTxtbox(regex, replacement) {
      var txtBox = document.getElementById('translation');
      var valueIsInValueProperty = (txtBox.innerHTML == '');
      var txtBoxValue = (txtBox.innerHTML || txtBox.value);
      var newTxtBoxValue = txtBoxValue.replace(regex, replacement);
      //Set new value
      if(valueIsInValueProperty) {txtBox.value = newTxtBoxValue;}
      else {txtBox.innerHTML = newTxtBoxValue;}
  }

  /**
   * Simple replace without looking at original (untranslated) string.
   */
  function findTextSegments() {
      var txtBox = document.getElementById('translation');
      var valueIsInValueProperty = (txtBox.innerHTML == '');
      var txtBoxValue = (txtBox.innerHTML || txtBox.value);
      var matches = [];
      var found;
      var rgx = /\\\\text\s?\{([^\}]+)\}/g;
      while (found = rgx.exec(txtBoxValue)) {
          matches.push(found[0]);
      }
      return matches;
  }

  /**
   * Simple replace without looking at original (untranslated) string.
   */
  function replaceTextSegments(newSegments) {
      var txtBox = document.getElementById('translation');
      var valueIsInValueProperty = (txtBox.innerHTML == '');
      var txtBoxValue = (txtBox.innerHTML || txtBox.value);
      var toReplace = [];
      var found;
      //Search current values that should be replaced
      var rgx = /\\\\text\s?\{([^\}]+)\}/g;
      while (found = rgx.exec(txtBoxValue)) {
          toReplace.push(found[0]);
      }
      //Perform replace
      for (var i = newSegments.length - 1; i >= 0; i--) {
        console.log('Replacing ' + toReplace[i] + ' by ' + newSegments[i]);
        simpleReplaceInTxtbox(toReplace[i], newSegments[i]);
      }
  }

  /**
   * Alt+P: Proofread mode. Only works if you have proofread permission
   */
  function altPAction() {
    // extract the exercise name e.g. exercises=rounding-to-the-nearest-ten-or-hundred#xe9e1a3b9f44d9837
    var expr =  /.+=(.+)#.+/g
    var url = window.location.href;
    var result = expr.exec(url);
    
    // todo find out the language which is currently used on translate.khanacademy.org
    var proof = 'https://crowdin.com/proofread/khanacademy/all/enus-de#q=e/';
    var url = proof + result[1]
    console.log(url);
    window.open(url,'_blank');
    if(chrome) {
      window.location.href = url;
    }
  }

  var imagesShown = false;

  /**
   * Simple replace without looking at original (untranslated) string.
   */
  function showImages() {
    console.log('showimag');
      var txtBox = document.getElementById('translation');
      var myDoc = document.getElementById('source_phrase_container');
      var sourceStr = myDoc.innerText;
      var expr =  /!\[\]\(([^\)]+)\)/g;
      while (( result = expr.exec(sourceStr)) !== null  ) {
        var tag = '<img class=\"greasemonkey-image\" src=\"' + result[1] + '\" />';
        console.log(tag);
          $('#translation_text_container').prepend(tag);
      }
  }

  function showAllQuestions() {
      var hint = $('#hint');
      while (!hint.is(':disabled')) {
          hint.click();
      }
  }

  /**
   * Experimental opening of URL in new tab.
   * DOES NOT WORK for Alt+P due to security restrictions.
   */
  function chromeOpenURL(url) {
    var yourCustomJavaScriptCode = 'var win = window.open(\"' + url + '\", "_blank"); win.focus();';
    var script = document.createElement('script');
    var code = document.createTextNode('(function() {' + yourCustomJavaScriptCode + '})();');
    script.appendChild(code);
    (document.body || document.head).appendChild(script);

  }
  // TODO check on which host we are running, Alt+P and Alt+A only work on translate.khanacademy.org, the others on crowdin.com
  function key_event(e) {
    var txtBox = document.getElementById('translation');
    
    // Alt+P open this exercise in the proofread modus, only works if you have proofread permission on crowdin
    if (e.altKey && e.keyCode == 80) {
        altPAction();
    }    
      
    // Alt+A for showing all exercise questions  
    if (e.altKey && e.keyCode == 65) {
        showAllQuestions();
    }  
    
    // Alt+N to move to the next exercise on translate.khanacademy.org
    if (e.altKey && e.keyCode == 78) {
        var item = $('li:has(a.active)');
        item.parent().children('li:eq('+(item.index()+1)+')').children('a').click();
        showAllQuestions();
    }
    
    // match Alt+O replace coordinates in the form of ( 4.5 , 5.6 ) with ( 4.5 | 5.6 ), white spaces are not trimmed
    if (e.altKey && e.keyCode == 79) {
        txtBox.innerHTML = txtBox.innerHTML.replace( /\(([-+]?[0-9]*\.?[0-9]+),( ?[-+]?[0-9]*\.?[0-9]+)\)/g, '($1|$2)' );
    }  
    // match Alt+I replace KA image urls & fix the Bing ImgURL error
    if (e.altKey && e.keyCode == 73) {
        altIAction()
    }
    // Alt+L: Show images in text
    if (e.altKey && e.keyCode == 76) {
      if(imagesShown) {
        $('.greasemonkey-image').remove();
        imagesShown = false;
      } else {
        showImages();
        imagesShown = true;
      }
    }
    // Replace math formulas contained in Dollar signs, Alt+U
    if (e.altKey && e.keyCode == 85) {
        altUAction();
    }
    // Fix coordinates, Alt+W
    if (e.altKey && e.keyCode == 87) {
        altWAction();
    }
    // Other fixes, Alt+Q
    if (e.altKey && e.keyCode == 81) {
        altQAction();
    }
  }
  
  
  document.addEventListener('keydown', key_event, true);  
  
  var $ = Zepto,
	$menu = $('#translation_container #action_copy_source').parent(),
	$changeFormatBtn = $('<button tabindex="-1" title="Alt + I" class="btn btn-icon"><i class="static-icon-copy"></i></button>'),
	$translation = $('#translation');
	
  $changeFormatBtn.css('background', 'url("http://www.glidetraining.com/wp-content/uploads/2015/03/5commastyle.gif") 3px 7px no-repeat');
  $menu.append($changeFormatBtn);
  $changeFormatBtn.on('click', altIAction);
  
})();
