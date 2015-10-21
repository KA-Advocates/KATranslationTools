  // ==UserScript==
  // @name        KA Crowdin Translation Tools
  // @namespace   kadeutsch.org/kacrowdintools
  // @include     https://crowdin.com/translate/khanacademy/*
  // @include     https://translate.khanacademy.org/translate/*
  // @description Various keyboard shortcuts to make KA translation on crowdin a little bit easier
  // @version     0.5.2
  // @grant       none
  // @author      Alain Schaefer & Uli Köhler
  // @updateURL   https://gist.githubusercontent.com/alani1/a62cd694ba35ed11744e/raw/KATranslationTools.user.js
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

      var valueIsInValueProperty = (txtBox.innerHTML == "");
      
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
      var valueIsInValueProperty = (txtBox.innerHTML == "");
      var txtBoxValue = (txtBox.innerHTML || txtBox.value);
      var newTxtBoxValue = txtBoxValue.replace(regex, replacement);
      //Set new value
      if(valueIsInValueProperty) {txtBox.value = newTxtBoxValue;}
      else {txtBox.innerHTML = newTxtBoxValue;}
  }

  /**
   * Simple replace without looking at original (untranslated) string.
   */
  function showImages() {
    console.log("showimag");
      var txtBox = document.getElementById('translation');
      var myDoc = document.getElementById('source_phrase_container');
      var sourceStr = myDoc.innerText;
      var expr =  /!\[\]\(([^\)]+)\)/g;
      while (( result = expr.exec(sourceStr)) !== null  ) {
        var tag = "<img src=\"" + result[1] + "\" />";
        console.log(tag);
          $("#translation_text_container").prepend(tag);
      }
  }

  function showAllQuestions() {
      var hint = $('#hint');
      while (!hint.is(":disabled")) {
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
        // extract the exercise name e.g. exercises=rounding-to-the-nearest-ten-or-hundred#xe9e1a3b9f44d9837
        var expr =  /.+=(.+)#.+/g
        var url = window.location.href;
        var result = expr.exec(url);
        
        // todo find out the language which is currently used on translate.khanacademy.org
        var proof = "https://crowdin.com/proofread/khanacademy/all/enus-de#q=e/";
        var url = proof + result[1]
        console.log(url);
        window.open(url,'_blank');
        if(chrome) {
          window.location.href = url;
        }
    }    
      
    // Alt+A for showing all exercise questions  
    if (e.altKey && e.keyCode == 65) {
      showAllQuestions();
    }  
    
    // Alt+N to move to the next exercise on translate.khanacademy.org
    if (e.altKey && e.keyCode == 78) {
        var item = $("li:has(a.active)");
        item.parent().children("li:eq("+(item.index()+1)+")").children("a").click();
        showAllQuestions();
    }
    
    // match Alt+O replace coordinates in the form of ( 4.5 , 5.6 ) with ( 4.5 | 5.6 ), white spaces are not trimmed
    if (e.altKey && e.keyCode == 79) {
        txtBox.innerHTML = txtBox.innerHTML.replace( /\(([-+]?[0-9]*\.?[0-9]+),( ?[-+]?[0-9]*\.?[0-9]+)\)/g, '($1|$2)' );
    }  
    // match Alt+I replace KA image urls & fix the Bing ImgURL error
    if (e.altKey && e.keyCode == 73) {

      //Fix the Bing ImgURL error
      txtBox.innerHTML = txtBox.innerHTML.replace('![] (','![](');
      txtBox.innerHTML = txtBox.innerHTML.replace('! [] (','![](');
      txtBox.innerHTML = txtBox.innerHTML.replace('Interaktive Grafik','interactive-graph');
      txtBox.innerHTML = txtBox.innerHTML.replace(/Radio/g,'radio');
      txtBox.innerHTML = txtBox.innerHTML.replace(/Eingabe-Zahl/,'input-number');  
      txtBox.innerHTML = txtBox.innerHTML.replace(/Eingabe-Nummer/g,'input-number');
      txtBox.innerHTML = txtBox.innerHTML.replace(/numerische Eingabe/g,'numeric-input'); 
      txtBox.innerHTML = txtBox.innerHTML.replace(/numerische-Eingang/g,'numeric-input');    
      txtBox.innerHTML = txtBox.innerHTML.replace(/☃ Bild/g,'☃ image');
      txtBox.innerHTML = txtBox.innerHTML.replace('**How','**Wie');
      txtBox.innerHTML = txtBox.innerHTML.replace('**What','**Was');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ ones}}/g,'\\text{ Einer}}');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ one}}/g,'\\text{ Einer}}');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ tens}}/g,'\\text{ Zehner}}');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ ten}}/g,'\\text{ Zehner}}');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ hundred}}/g,'\\text{ Hunderter}}');
      txtBox.innerHTML = txtBox.textContent.replace(/\\text{ hundreds}}/g,'\\text{ Hunderter}}');
      
      //Not sure what alanis stuff above should do, but it doesn't work. This one does.
      simpleReplaceInTxtbox(/!\s+\[\]\s+\(/g, "![](");

      // on regex for english, and second for translation string
      var expr =  /!\[\]\((.+?)\)/g
      var expr2 =  /!\[\]\((.+?)\)/g    
      
      replacePattern(expr,expr2); //causes exception.

    }
    // Alt+L: Show images in text
    if (e.altKey && e.keyCode == 76) {

      showImages();
    }
    // Replace math formulas contained in Dollar signs, Alt+U
    if (e.altKey && e.keyCode == 85) {
        // TODO: need to correctly handle escpade Dollar signs e.g. \$ should not be machted as start or end string works in Python and PHP \$.+?(?<!\\)\$ but no in javascript
          var expr = /(\$.+?\$)/g
          var expr2 = /(\$.+?\$)/g
          replacePattern(expr,expr2);
    }
    // Fix coordinates, Alt+W
    if (e.altKey && e.keyCode == 87) {
        var expr = /\$\((-?\d+(([\.,]|\{,\})\d+)?|-?[a-z])\s*[,;|]\s*(-?\d+(([\.,]|\{,\})\d+)?| -?[a-z])\)\$/g;
        simpleReplaceInTxtbox(expr, "\$($1{\\,}|{\\,}$4)\$");
    }
    // Other fixes, Alt+Q
    if (e.altKey && e.keyCode == 81) {
        //Dollary
        simpleReplaceInTxtbox(/\$\\\\\$(-?\d+([.,]\d+)?)\$/g, "$$$1{\\,}€\$");
        //Decimal dot to comma
        simpleReplaceInTxtbox(/(-?\d+)\.(-?\d+)/g, "$1{,}$2");
        //In number: Need {\,} instead of {\ }
        simpleReplaceInTxtbox(/(\d+)\{\\ \}(\d+)/g, "$1{\\,}$2");
        //In number: Need percentage
        simpleReplaceInTxtbox(/\\*\s*%\s*\$/g, "{\\,}\\%$$");
        //daß -> dass
        simpleReplaceInTxtbox(/daß/g, "dass");
        //daß -> dass
        simpleReplaceInTxtbox(/\.\s*\*\s+\*/g, ".**");
        //x-intercept / y-intercept
        simpleReplaceInTxtbox(/\$x\$-intercept/g, "Schnittpunkt mit der $$x$$-Achse");
        simpleReplaceInTxtbox(/\$y\$-intercept/g, "Schnittpunkt mit der $$y$$-Achse");

    }
  }
  document.addEventListener('keydown', key_event, true);