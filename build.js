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
var GWLDivisionSpreadsheet = require('@sheets/GWLDivisionSpreadsheet');
const playerlist = require('@mymodules/player-list-utils');
var utils = require('@mymodules/utils');
const GWLWebsiteSpreadsheet = require('@sheets/GWLWebsiteSpreadsheet');

// builds a spreadsheet using its buildDirectory, loadSheetInfo and batchGetAll functions
async function buildSheet(sheetObj) {
	return new Promise((resolve,reject) => {
		sheetObj.buildDirectory()
		.then(res => sheetObj.loadSheetInfo())
		.then(result => result.batchGetAll())
		.then(newResult => resolve(sheetObj))
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
		arr.push(new GWLRoundRobinSpreadsheet("Season 5", "Season5", false, '1IZvGqUOmNn4p2yubCNDGvE68PM0A1HmlBgKUgLOTgm0'));
		arr.push(new GWLDivisionSpreadsheet("Season 5.5", "Season5.5", true, '1rjwOiKJDN82Zmre40ZcUiBOyZK39jhVRfM5g16alf4k'));
		
		// promise all to build sheets
		for(i=0;i<arr.length;++i) {
			promises.push( buildSheet(arr[i]) );
		}
		
		Promise.all(promises)
		.then(res => localfs.writeJsonPromise("./data/sheets.json", res))
		.then(rees => {
			// open an instance of GWLWebsiteSpreadsheet to let the player load it
			var siteSheet = new GWLWebsiteSpreadsheet();
			// promise all to build player list
			var playerPromises = [];
			for(i=0; i<rees.length;++i) {
				playerPromises.push( rees[i].getPlayers() );
			}
			
			Promise.all(playerPromises)
			.then(res2 => {
				// store new player info in order
				for (const players of res2) playerlist.storeNewPlayerInfo(players);
				playerlist.savePlayerInfo();
				playerlist.writePlayerInfoToSpreadsheet(siteSheet);
			});
		})
		.then(console.log("Wrote json!"))
		.catch(err => console.error(err))
	})
	.catch(err => console.log(err));
} build();