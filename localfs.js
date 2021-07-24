var bodyparser = require('body-parser');
var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
require('dotenv').config();

/**
 * Saves an object to a local JSON stored in __dirname/json/path
 * Stringifies the json automatically
 */
function writeJson(path, obj) {
	try {
		str = JSON.stringify(obj);
		fs.writeFile(__dirname + '/json/' + path, str, function(err) {
			if(err) {
				throw err;
			}
			console.log('saved file /json/' + path);
		});
	} catch (e) {
		console.log(e);
	}
}

/**
 * Opens a local JSON stored in __dirname/json/
 * Parses the json into an object and sends it to the callback
 */
function openJson(path, callback) {
	console.log('opening file /json/' + path);
	fs.readFile(__dirname + '/json/' + path, function(err, data) {
		if(err) throw err;
		try {
			obj = JSON.parse(data);
			callback(obj);
		} catch (e) {
			console.log(e);
		}
	});
}

module.exports = {
	writeJson,
	openJson
}