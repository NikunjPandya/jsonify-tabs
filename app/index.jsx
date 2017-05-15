console.log('Hello World!');

import React from 'react';
import $ from "jquery";
import { render } from 'react-dom';
import { Button } from 'react-bootstrap';
import Bootstrap from '../node_modules/bootstrap/less/bootstrap.less';
import Copyable from 'react-copyable';

const stores = {};
var scriptResultCount = 0;

const converttoFolderName = (domainName) => {
	var folderName = '';
	var words = domainName.split('.');
	for (var wordIndex in words) {
		if (words[wordIndex].toLowerCase() == 'www')
			continue;
		var word = words[wordIndex].charAt(0).toUpperCase();
		folderName = folderName + word + words[wordIndex].slice(1);
	}
	return folderName;
}

const getHostname = (url) => {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get the hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];

    return hostname
}

const getUniqueStoreFromUrl = (url) => {
	url = url.split('?')[0];
	const hostname = getHostname(url);

	const folderName = converttoFolderName(hostname);
	const storeConfig = {};
	storeConfig['urls'] = [];
	storeConfig['urls'].push(url);
	storeConfig['domainName'] = hostname;
	if (stores[folderName]){
		stores[folderName]['urls'].push(url);
	} else {
		stores[folderName] = storeConfig;
	}
	return storeConfig;
}

const addStoreCodeSelector = (url, selector) => {
	url = url.split('?')[0];
	const hostname = getHostname(url);
	const folderName = converttoFolderName(hostname);
	if (!stores[folderName].codeFieldSelectors){
		stores[folderName].codeFieldSelectors = {};
	}
	if (stores[folderName].codeFieldSelectors[url])
		stores[folderName].codeFieldSelectors[url] += ', ' + selector;
	else
		stores[folderName].codeFieldSelectors[url] = selector;
	scriptResultCount++;
}

const primSelectors = `
	input[name*=discount i],
	input[name*=coupon i],
	input[name*=promo i],
	input[name*=sourcecode i],
	input[name*=coupcode i],
	input[name*=reduction_code i],
	input[class*=discount i],
	input[class*=coupon i],
	input[class*=promo i],
	input[class*=sourcecode i]
`;
const secSelectors = `
	[id*=promo i],
	[id*=coupon i],
	[class*=promo i],
	[class*=coupon i]
`
const codeEval = "var list=[], nodes=document.querySelectorAll('" + primSelectors.split("\n").join('') + "'); function addValidPromoNode(el) { if(el.getBoundingClientRect().top && (el.tagName == 'INPUT' || el.outerHTML.indexOf('input') > -1))  list.push(el.outerHTML) } [].forEach.call(nodes, addValidPromoNode); if(!list.length) nodes=document.querySelectorAll('" + secSelectors.split("\n").join('') + "'); [].forEach.call(nodes, addValidPromoNode); window.location.href + ',,,' + list[0]";

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		  value: 'Please write an essay about your favorite DOM element.',
		  copy: false
		};
		var matches = window.location.href.match(/windowId=([0-9]+)/);
		if (matches && matches.length > 1) {
			this.windowId = parseInt(matches[1]);
		}
		this.handleClickEvent = this.handleClickEvent.bind(this);
		this.handleCopy = this.handleCopy.bind(this);
	}
	handleClickEvent (event) {
		const allStores = this.generateStoresConfig((result) => {
			this.setState({value: JSON.stringify(result, null, 2), copy: true});
		});
	}
	handleCopy (e) {
		e.preventDefault();
		var input = document.createElement('textarea');
	    document.body.appendChild(input);
	    input.value = this.state.value;
	    input.focus();
	    input.select();
	    document.execCommand('Copy');
	    input.remove();
	}
	handleChange(event) {
		this.setState({value: event.target.value});
	}
	generateStoresConfig (cb) {
		var self = this;
		var tabCount = 0;
		chrome.tabs.query({}, function (tabs) {
			// tabCount = tabs.length;
			for (var tabIndex in tabs) {
				var carturl = tabs[tabIndex].url;
				if (self.windowId && self.windowId == tabs[tabIndex].windowId && carturl.indexOf('trello.com') == -1) {
					tabCount++;
   					// chrome.tabs.executeScript( tabs[tabIndex].id, { code: "window.location.href + ',,,' + document.querySelector('input[name*=discount], input[name*=coupon], input[name*=promo], input[class*=discount], input[class*=coupon], input[class*=promo]').outerHTML" },
   					console.log(carturl)
   					chrome.tabs.executeScript( tabs[tabIndex].id, { code: codeEval },
   						function(results){
   							console.log(results[0])
   							if(results && results[0]) {
   								var elem = results[0];
   								elem = elem.split(',,,');
   								if(elem[1] == 'undefined')
   									return addStoreCodeSelector(elem[0], 'body');

   								var node = $(elem[1]),
   									id = node.attr('id'),
   									name = node.attr('name'),
   									cls = node.attr('class'),
   									selector;

   								if (id && id.trim()) {
								    selector = id.match(/:|\./) ? '[id="' + id.trim() + '"]' : '#' + id.trim();
								} else if (cls && cls.trim()) {
								    selector = '.' + cls.trim().split(' ').join('.');
								} else if (name && name.trim()) {
								    selector = '[name="' + name.trim() + '"]';
								}
   								return addStoreCodeSelector(elem[0], selector);
   							}
   							scriptResultCount++;
   						}
   					);
		    		getUniqueStoreFromUrl(carturl);
	    		}
			}
			var cnt = 0;
			var I = setInterval(() => {
				cnt++;
				if(tabCount == scriptResultCount || cnt >= 20) {
					clearInterval(I);
					console.log(JSON.stringify(stores));
					cb(stores);
				}
			}, 100);
		});
	}
	render () {
		return (
			<div>
			   <div id="stores" className={'floatleft'}>
			    	<Button onClick={this.handleClickEvent}> Generate Config </Button> &nbsp;
			    	{ this.state.copy ? 
			    		<Button onClick={this.handleCopy}> Copy Config </Button>
			    		: null
			    	}
			   </div>
			   <div id="copyable">
			   		<pre id='json'>{this.state.value}</pre>
			   </div>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));
