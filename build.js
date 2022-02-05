// registers aliases
// makes it easier to include our other files without falling into ../../../ hell
require('module-alias/register');

// node module imports
var fs = require("fs");
var {google} = require('googleapis');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom-built modules
const googleAuth = require('@mymodules/auth');
const constants = require('@mymodules/consts');
const localfs = require('@mymodules/localfs');
var sheets = require('@mymodules/spreadsheet-types');
var GWLRoundRobinSpreadsheet = require('@sheets/GWLRoundRobinSpreadsheet');

// builds a spreadsheet using its buildDirectory, loadSheetInfo and batchGetAll functions
async function buildSheet(sheetObj) {
	return new Promise((resolve,reject) => {
		sheetObj.buildDirectory()
		.then(res => sheetObj.loadSheetInfo())
		.then(result => {result.batchGetAll()})
		.then(newResult => {
			console.log("RESOLVED: ", sheetObj);
			resolve(sheetObj);
		})
		.catch(err => {
			console.log("===ERR=== on ", sheetObj.internal);
			reject(err);
		});
	});
}

// clears the data folder and rebuilds all sheets
function build() {
	var sheet = [];
	
	// clear all data in ./data
	localfs.clearDataPromise()
	.then(() => {
		var arr = [];
		var promises = [];

		// Declare sheets below, push sheets to array
		// MAKE SURE TO PUSH LATEST SHEETS LAST :^)
		arr.push(new GWLRoundRobinSpreadsheet("Season 3", "Season3", false, '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM'));
		arr.push(new GWLRoundRobinSpreadsheet("Season 4", "Season4", false, '1GGR4EvBzosLZf_Z0axr1PpA4ZMaPwYrw8Jr8WUXRioQ'));
		arr.push(new GWLRoundRobinSpreadsheet("Season 5", "Season5", true, '1IZvGqUOmNn4p2yubCNDGvE68PM0A1HmlBgKUgLOTgm0'));
		
		// promise all to build sheets
		for(i=0;i<arr.length;++i) {
			promises.push(buildSheet(arr[i] ));
		}
		
		Promise.all(promises)
		.then(res => localfs.writeJsonPromise("./data/sheets.json", res))
		.then(console.log("Wrote json!"))
		.catch(err => console.error(err))
	})
	.catch(err => console.log(err));
} build();