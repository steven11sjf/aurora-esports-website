// testing
var sheets = require("./custom_modules/spreadsheet-types");

// node module imports
var fs = require("fs");
var {google} = require('googleapis');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom-built modules
const googleAuth = require('./custom_modules/auth');
const constants = require('./custom_modules/consts');
const localfs = require('./custom_modules/localfs');

function test() {
	var test_sheet = new sheets.GWLRoundRobinSpreadsheet("Season -1", "SeasonMinus1", false, '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM');
	test_sheet.loadSheetInfo();
} test();