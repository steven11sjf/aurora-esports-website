// ==========
// Module containing json read/write functions
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// node module imports
var fs = require("fs");
require('dotenv').config();
/**
 * Saves an object to a local JSON stored in __dirname/json/path
 * Stringifies the json automatically
 */
function writeJson(path, obj) {
	try {
		str = JSON.stringify(obj); // stringify object
		fs.writeFile(__dirname + '/../json/' + path, str, function(err) {
			if(err) {
				throw err;
			}
			console.log('saved file /json/' + path);
		});
	} catch (e) {
		console.log("object not able to be stringified!","file " + path + " not written");
	}
}

/**
 * Saves an object to a local JSON stored in path
 * Same as writeJson but returns a promise
 */
const writeJsonPromise = (path,obj) => {
	return new Promise((resolve,reject) => {
		try {
			str = JSON.stringify(obj); // stringify object
			fs.writeFile(path, str, function(err) {
				if(err) {
					reject(err);
				}
				console.log('saved file ' + path);
				resolve(obj);
			});
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Opens a local JSON stored in __dirname/json/
 * Parses the json into an object and sends it to the callback
 */
function openJson(path, callback) {
	console.log('opening file /json/' + path);
	fs.readFile(__dirname + '/../json/' + path, function(err, data) {
		if(err) throw err;
		try {
			obj = JSON.parse(data);
			callback(obj);
		} catch (e) {
			// called if data is not able to be parsed into a valid json
			console.log("file " + path + "is not a valid JSON! String contents:",data);
		}
	});
}

/**
 * Opens a local json stored in path
 * Parses json into object and returns it as a promise
 */
const openJsonPromise = (path) => {
	return new Promise((resolve,reject) => {
		console.log('opening file ' + path);
		fs.readFile(path, function(err, data) {
			if(err) reject(err);
			try {
				obj = JSON.parse(data);
				resolve(obj);
			} catch (e) {
				// called if data does not resolve to a valid json
				reject(e);
			}
		});
	});
}

/**
 * Clears data stored in /data
 */
const clearDataPromise = () => {
	return new Promise(async (resolve,reject) => {
		try {
			console.log('Clearing ./data!');
			fs.promises.rm('./data', { recursive: true })
			.then(res => {
				return fs.promises.mkdir('./data');
			})
			.then(res2 => {
				return resolve('./data');
			})
			.catch((err) => reject(err))
		} catch(err) {
			reject(err);
		}
	});
}
		

module.exports = {
	writeJson,
	openJson,
	writeJsonPromise,
	openJsonPromise,
	clearDataPromise
}