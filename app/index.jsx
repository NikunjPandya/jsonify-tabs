console.log('Hello World!');

import React from 'react';
import { render } from 'react-dom';
import { Button } from 'react-bootstrap';
import Bootstrap from '../node_modules/bootstrap/less/bootstrap.less';
import fs from 'file-system';
import Copyable from 'react-copyable';


const stores = {};

const converttoFolderName = (domainName) => {
	var folderName = '';
	var words = domainName.split('.');
	for (var wordIndex in words) {
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

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		  value: 'Please write an essay about your favorite DOM element.'
		};

		this.handleClickEvent = this.handleClickEvent.bind(this);
	}
	handleClickEvent (event) {
		const allStores = this.generateStoresConfig((result) => {
			this.setState({value: JSON.stringify(result, null, 2)});
		});
	}
	handleChange(event) {
		this.setState({value: event.target.value});
	}
	generateStoresConfig (cb) {
		chrome.tabs.query({ }, function (tabs) {
			for (var tabIndex in tabs) {
	    		var carturl = tabs[tabIndex].url;
	    		getUniqueStoreFromUrl(carturl);
			}
			console.log(JSON.stringify(stores));
			cb(stores);
		});
	}
	render () {
		return (
			<div>
			   <div id="stores" className={'floatleft'}>
			    	<Button onClick={this.handleClickEvent}> Create unique store </Button>
			   </div>
			   <div id="copyable">
			   		<pre id='json'>{this.state.value}</pre>
			   </div>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));
