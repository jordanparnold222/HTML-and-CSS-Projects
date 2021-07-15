// ==UserScript==
// @name           Find unused styles
// @namespace      xplannerplus.com
// @description    Find unused classes for now
// @version 0.0.6
// @author Maksym Chyrkov
// @homepage https://code.google.com/p/find-unused-classes/
// @copyright 2011, Maksym Chyrkov (http://blog.xplannerplus.org/)
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @include        *
// ==/UserScript==
'use strict';
var win, isMonkey = false, log;
if(typeof unsafeWindow === 'undefined'){
	win = window;
}else{
	win = unsafeWindow;
	isMonkey = true;
}
if(typeof GM_log === 'undefined'){
	if(!win.console){
		log = function(){};
	}else{
		log = win.console.log;
	}
}else{
	log = GM_log;
}

function checkClasses() {
	var styleSheets = document.styleSheets, i, j, k, rule, rulesToCheck = [], classesInCss = [], classesInHtml = [], classRegExp = /\.(\S+)/g, myArray, selector, selectors, className, elementsToCheck = [], currentElement, childNodes, classNames,startTime, innerHTML = '';
	startTime = Date.now();
	for(i = 0; i < styleSheets.length; i++){
		if(styleSheets[i].href === null
				|| styleSheets[i].href.indexOf(location.host) > -1){
			for(j = 0; j < styleSheets[i].cssRules.length; j++){
				rulesToCheck.push(styleSheets[i].cssRules[j]);	
			}
			while(rulesToCheck.length>0){
				rule=rulesToCheck.shift();
				if(rule.type === 1){
					selectors = rule.selectorText.split(',');
					for(k = 0; k < selectors.length; k++){
						selector = selectors[k];
						while((myArray = classRegExp.exec(selector)) != null){
							className = myArray[1].split(':')[0];
							if(classesInCss.indexOf(className) === -1){
								classesInCss.push(className);
							}
						}
					}
				}else if(rule.type==4){
					rulesToCheck = rulesToCheck.concat(rule.cssRules);
				}else if(rule.type===5){
					log('Ignoring font-face cssRule type', rule);
				}else{
					log('Unregistered cssRule type', rule);
				}
			}
		}else{
			log('Ignored stylesheet from: ' + styleSheets[i].href);
		}
	}
	log('proccessing of css styles took:' + (Date.now()-startTime));
	classesInCss.sort();
	log(classesInCss);
	elementsToCheck.push(document.body);
	startTime = Date.now();
	while(elementsToCheck.length > 0){
		currentElement = elementsToCheck.pop();
		childNodes = currentElement.childNodes;
		for(i = 0; i < childNodes.length; i++){
			if(childNodes[i].nodeType === 1){
				elementsToCheck.push(childNodes[i]);
			}
		}

		if(currentElement.className.length > 0){
			classNames = currentElement.className.split(' ');
			for(i = 0; i < classNames.length; i++){
				className = classNames[i];
				if(className != '' && classesInHtml.indexOf(className) === -1){
					classesInHtml.push(className);
				}
			}
		}
	}
  log('proccessing of html took:' + (Date.now()-startTime));
	startTime = Date.now();
	classesInHtml.sort();

	var resultTable = document.createElement('table');
	innerHTML += '<tr><th>class in css</th><th>class in html</th></tr>';
	if(classesInCss.length === 0){
		innerHTML += '<tr><td colspan=\'2\'>No css styles found</td></tr>';
	}
	log(classesInHtml);
	i = j = 0;
	for(i = 0; i < classesInCss.length; i++){
		if(classesInCss[i] === classesInHtml[j]){
			innerHTML += '<tr style=\'background:green;\'><td>'
					+ classesInCss[i] + '</td><td>' + classesInHtml[j++] + '</td></tr>';
		}else if(classesInCss[i] < classesInHtml[j]){
			innerHTML += '<tr style=\'background:red;\'><td>'
					+ classesInCss[i] + '</td><td> </td></tr>';
		}else{
			while(classesInCss[i] > classesInHtml[j]){
				innerHTML += '<tr style=\'background:red;\'><td> </td><td>'
						+ classesInHtml[j++] + '</td></tr>';
			}
			if(classesInCss[i] === classesInHtml[j]){
				innerHTML += '<tr style=\'background:green;\'><td>'
						+ classesInCss[i] + '</td><td>' + classesInHtml[j++] + '</td></tr>';
			}
		}
	}
	log(innerHTML);
	resultTable.innerHTML = innerHTML;
	document.body.appendChild(resultTable);
	log('output took:' + (Date.now()-startTime));
}

if(isMonkey){
	GM_registerMenuCommand('Check for unused classes', checkClasses);
}else{
	checkClasses();
}
