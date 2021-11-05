// ==========
// Module containing spreadsheet objects and associated functions
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// node module imports
var fs = require("fs");
var {google} = require('googleapis');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom-built modules
const googleAuth = require('@mymodules/auth');
const localfs = require('@mymodules/localfs');
const utils = require('@mymodules/utils');

// ===========
// To add a new format:
//
// 1. Write a new class in a new file and save to SheetClasses folder
// 2. Import the sheet below to be able to use it
// 3. Go to function loadSheet and add the type to the if/else branch
// ===========

// import sheet formats
var GWLSpreadsheet = require('@sheets/GWLSpreadsheet');
var GWLRoundRobinSpreadsheet = require('@sheets/GWLRoundRobinSpreadsheet');

var sheets = [];

// function that loads one sheet and returns a promise
const loadSheet = (sh) => new Promise((resolve,reject) => {
	let type;
	if(sh.format == "unformatted") {
		type = GWLSpreadsheet;
	} else if(sh.format == "roundrobin") {
		type = GWLRoundRobinSpreadsheet;
	} else {
		console.log("format invalid " + JSON.stringify(sh));
		reject('InvalidFormatField');
	}

	// correct class stored in type, use it to load object
	type.loadObject(sh)
	.then(res => resolve(res))
	.catch(err => {
		console.log("loadObject failed, sh = " + JSON.stringify(sh));
	});
});

// function that loads all sheets into memory
function init() {
	return new Promise((res,reject) => {
		// open sheet info
		localfs.openJsonPromise('./data/sheets.json')
		.then((data) => {
			// creates array of (unresolved) promises for loadSheet functions
			let promiseArr = [];
			for(i=0;i<data.length;++i) {
				promiseArr.push(loadSheet(data[i]));
			}
			
			// executes when all promises are resolved to a GWLSpreadsheet object
			Promise.all(promiseArr)
			.then(doneArr => {
				console.log("All sheet-loading promises executed!");
				sheets = doneArr;
				res(doneArr)
			})
			.catch(err => {
				console.log("one of the promises fucked up! ", err);
				reject(err);
			});
		})
		.catch(err => reject(err))
	});
}

// function that updates all sheets
function updateAll() {
	return new Promise((fulfill,reject) => {
		let updated = [];
		let promiseArr = [];
		
		// array of all promises for batchGetAll
		for(i=0;i<sheets.length;++i) {
			if(sheets[i].ongoing) {
				promiseArr.push(sheets[i].batchGetAll());
			}
		}
		
		// executes when all promises have resolved
		Promise.all(promiseArr)
		.then(doneArr => {
			console.log("All sheets updated!");
			let updated = [];
			doneArr.map((row) => updated.push(row.name));
			fulfill(updated);
		})
		.catch(err => {
			console.log("one of the batchupdates fucked up! ", err);
			reject(err);
		});
	});
}

// function that returns the season with internal name
function getSeason(iname) {
	return new Promise((resolve,reject) => {
		console.log(iname)
		for(i=0;i<sheets.length;++i) {
			console.log(sheets[i].internal);
			if(sheets[i].internal==iname) {
				console.log("here");
				resolve(sheets[i]);
			}
		}
		console.log("FJIOWEJFNUIODSAPFHNJJUIPAJFDISDAOPFJDAS        ", iname);
		reject("InvalidSeason");
	});
}

// function that returns arr of sheets with name, internal
function allSeasonInfo() {
	return new Promise((resolve,reject) => {
		let result = [];
		for(i=0;i<sheets.length;++i) {
			let temp = {
				name: sheets[i].name,
				internal: sheets[i].internal
			};
			// put temp in front of array, so seasons are reverse chronological order
			result.unshift(temp)
		}
		resolve(result);
	});
}

// builds the linking dictionaries for all seasons
function buildDictionaries() {
	return new Promise((resolve,reject) => {
		// array of promises to resolve
		let promiseArr = [];
		for(i=0;i<sheets.length;i++) {
			promiseArr.push(sheets[i].generateLinkDict());
		}
		
		// executes when all dictionaries have been completed
		Promise.all(promiseArr)
		.then(doneArr => {
			console.log("All dictionaries built!");
			resolve(doneArr);
		})
		.catch(err => {
			console.log("One of the dictionaries fucked up! ", err);
			reject(err);
		});
	});
}

module.exports = {
	init,
	updateAll,
	getSeason,
	sheets,
	buildDictionaries,
	allSeasonInfo
}