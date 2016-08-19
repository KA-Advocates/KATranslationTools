# KATranslationTools

Utility scripts for translating Khan Academy

## How to install

In Chrome/Chromium

* Install [Tampermonkey user script manager](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). If link does not work, search for "Tapermonkey" in the [Chrome web store](https://chrome.google.com/webstore)
* Open [this link](https://github.com/ulikoehler/KATranslationTools/raw/master/KATranslationTools.user.js)
* You should see the Tampermonkey page with a green bar at the top (else, Tampermonkey has not been installed correctly)
* Click on "Install" button (located in the upper left)

For Firefox you can use [Greasmonkey](https://addons.mozilla.org/de/firefox/addon/greasemonkey/) which should work in a similar way but I ([ulikoehler](https://github.com/ulikoehler)) haven't tested this method yet.

## How to use

*Note:* Currently the script primarily contains german translation code. This means:

* "$1,234.5$" is translated to "$1{\,}234{,}5$"
* "$(5,4)$" (coordinate) is translated to "$(5{\,}|{\,}4)$". The "{\,}" are *indeed* neccessary to avoid the | sticking to the numbers. These are called thin spaces and can't be replaced by simple spaces.

**Important:** When running Alt+U to replace formulas, *all* "\\text{...}" are kept! This is especially useful with annotated calculations and in conjunction with Ctrl+V

Go to either [Crowdin](https://crowdin.com/project/khanacademy/de) or the [KA translation dashboard](https://www.khanacademy.org/translations/de/) for your language and navigate the site until you can see a string and its translation.

Key combos:
* Alt + A : Show all excercises (only on translate.khanacadey.org)
* Alt + N : Move to next exercise (only on translate.khanacadey.org)
* Alt + P : Open all new Window with Strings in proofread modus on crowdin (only on translate.khanacadey.org)
* Alt + U : Replace all formulas with formulas from englisch original (works on crowin.net and translate.khanacademy.org)
* Alt + I : replace Image URLs and fix common german Bing-Translation Errors (works on crowin.net and translate.khanacademy.org)
* Alt + W : Auto-fix coordinates. Works only for coordinates WITHOUT operators.
* Alt + Q : Other fixes. Currently: Convert $\\$123$ to $123{\,}€$ ; Convert simple numbers with dot to comma
* Alt + L : Show images

Frequently used key combinations (*Note:* You can submit in Crowdin with Ctrl+Return! Don't bother using your mouse!):

* Alt+CWQ: Copy english source string to translation, autofix coordinates and others (includes autotranslation of common phrases). This is used for simple strings like "In conclusion, $x=123$" or "$x=5.$3" (which is translated to $x=5{,}3$)
* Ctrl+V Alt+UIWQ: Insert string from clipboard (which you need to Ctrl+C-copy from a similar string which you have already translated), then replace formulas (keeps "\\text{...}" elements from your translation!) and image URLs, then fix coordinates and apply various fixes including auto-translation of common phrases.