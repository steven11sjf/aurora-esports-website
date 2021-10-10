// testing
var sheets = require('./custom_modules/spreadsheet-types');

// node module imports
var fs = require("fs");
var {google} = require('googleapis');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom-built modules
const googleAuth = require('./custom_modules/auth');
const constants = require('./custom_modules/consts');
const localfs = require('./custom_modules/localfs');

async function buildSheet(sheetObj, sheets) {
	return new Promise((resolve,reject) => {
		sheetObj.buildDirectory()
		.then(res => sheetObj.loadSheetInfo())
		.then(result => result.batchGetAll())
		.then(newResult => {
			sheets.push(sheetObj)
			resolve(sheets);
		})
		.catch(err => reject(err));
	});
}

function test() {
	var sheet = [];
	
	localfs.clearDataPromise()
	.then(() => {
		var s3sheet = new sheets.GWLRoundRobinSpreadsheet("Season 3", "Season3", false, '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM');
		var s4sheet = new sheets.GWLRoundRobinSpreadsheet("Season 4", "Season4", true, '1GGR4EvBzosLZf_Z0axr1PpA4ZMaPwYrw8Jr8WUXRioQ');
		console.log(s3sheet.spreadsheetId, s4sheet.spreadsheetId);
		buildSheet(s3sheet, sheet)
		.then(res => buildSheet(s4sheet,sheet))
		.then(res2 => localfs.writeJsonPromise("./data/sheets.json", res2))
		.then(console.log("Wrote json!"))
		.catch(err => console.error(err))
	})
	.catch(err => console.log(err));
} test();