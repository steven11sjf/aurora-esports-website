// ==========
// Module containing all code pulling data from the spreadsheet
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
const googleAuth = require('./auth');
const constants = require('./consts');
const localfs = require('./localfs');

/* ======== HELPER FUNCTIONS ========= */

/**
 * returns the number of 15-min increments between midnight and 11:45pm
 * this is between 0 and 95
 * for example, 2:15AM returns 9
 *
 * used when updating website stats
 */ 
function get15Inc() {
	let date_curr = new Date();
	let date_obj = new Date(date_curr.toLocaleString("en-US", { timeZone: "America/Chicago" }));
	let inc = date_obj.getHours() * 4;
	inc += Math.floor(date_obj.getMinutes() / 15);
	return inc;
}

/**
 * Gets the time, offset by the number of minutes in the future
 * getTime(0) is current time
 * getTime(5) is the time in 5 minutes
 *
 * used to display time, or store time last modified in json caches
 */
function getTime(mins) {
	let date_curr = new Date();
	let date_obj = new Date(new Date(date_curr.getTime() + mins * 60 * 1000).toLocaleString("en-US", {timeZone: "America/Chicago"}));
	let year = date_obj.getFullYear();
	let month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
	let day = ("0" + date_obj.getDate()).slice(-2);
	let hours = ("0" + date_obj.getHours()).slice(-2);
	let minutes = ("00" + date_obj.getMinutes()).slice(-2);
	let seconds = ("00" + date_obj.getSeconds()).slice(-2);
	
	let date = day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds;
	return date;
}

/**
 * sanitizes user input
 * run on all user input cells to make sure they can't inject raw html
 */
function sanitize(string) {
	// ignore empty cells
	if(string == undefined) return string;
	let output = string;
	
	// < to &lt;
	output = output.split("<").join("&lt;");
	// > to &rt;
	output = output.split(">").join("&rt;");
	// & to &amp;
	output = output.split("&").join("&amp;");
	// " to &quot;
	output = output.split("\"").join("&quot;");
	// ' to &apos;
	output = output.split("'").join("&apos;");
	// newline to \\n
	output = output.split("\n").join("\\n");
	
	return output;
}

/** 
 * gets day of week
 * used when updating site stats
 */
function getDay() {
	let date_curr = new Date();
	let date_obj = new Date(date_curr.toLocaleString("en-US", { timeZone: "America/Chicago" }));
	return date_obj.getDay();
}

/**
 * gets the number of hourly and weekly page hits
 * calls calcPageHits() with results
 */
function getPageHits(numHits) {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: constants.SPREADSHEET_ID,
				ranges: [
					'SiteStats!B3:B98', // hourly hits					0
					'SiteStats!E3:K3' // weekly hits
				]
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				calcPageHits(response.data,numHits);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

/**
 * calculates the number of page hits and what cells to update
 * calls updatePageHits() to push results to sheet
 */
function calcPageHits(obj,numHits) {
	// get current cells using current time/day
	row = 3 + get15Inc();
	day = getDay();
	timeCell = 'SiteStats!B' + row.toString();
	dayCell = 'SiteStats!' + String.fromCharCode(69+day) + '3'; // charcode 69+cell = cells E3:K3
	
	// get current values in the sheet
	currTime = obj.valueRanges[0].values[row-3][0];
	currDay = obj.valueRanges[1].values[0][day];
	
	// create new object that adds numHits to current totals
	newStats = {
		"timeCell" : timeCell,
		"dayCell" : dayCell,
		"timeUpdated" : parseInt(currTime, 10) + numHits,
		"dayUpdated" : parseInt(currDay) + numHits
	};
	
	// call updatePageHits to update site with latest counts
	updatePageHits(newStats);
}

/* updates page hits with latest stats
 * called by calcPageHits()
 */
function updatePageHits(stats) {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchUpdate({
				auth: auth,
				spreadsheetId: constants.SPREADSHEET_ID,
				resource: {
					data: [
						{
							range: stats.timeCell,
							values: [[ stats.timeUpdated ]]
						},
						{
							range: stats.dayCell,
							values: [[ stats.dayUpdated ]]
						}
					],
					valueInputOption: "USER_ENTERED"
				}
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ', err);
					console.log(response);
					return;
				}
				
				// log successful update to console
				console.log("Updated values " + stats.timeCell + " to " + stats.timeUpdated + ", and " + stats.dayCell + " to " + stats.dayUpdated);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

/**
 * Stores the results of batchGetSpreadsheet in the JSONs
 */
function storeBatchGet(obj) {
	storeMatchLog(obj.valueRanges[0].values); // store match log
	storeHeroStats(obj.valueRanges[1].values,obj.valueRanges[43].values,obj.valueRanges[44].values); // store hero stats
	storeLeagueStandings(obj.valueRanges[42].values); // store the league standings
	
	storeTeamStats('cached/BengaliBoom.json',obj.valueRanges[2].values,obj.valueRanges[3].values,obj.valueRanges[4].values,obj.valueRanges[32].values);
	storeTeamStats('cached/FalklandFennecs.json',obj.valueRanges[5].values,obj.valueRanges[6].values,obj.valueRanges[7].values,obj.valueRanges[33].values);
	storeTeamStats('cached/GalacticWaterBears.json',obj.valueRanges[8].values,obj.valueRanges[9].values,obj.valueRanges[10].values,obj.valueRanges[34].values);
	storeTeamStats('cached/HighlandHydroHomies.json',obj.valueRanges[11].values,obj.valueRanges[12].values,obj.valueRanges[13].values,obj.valueRanges[35].values);
	storeTeamStats('cached/HoneyBunchesOfOks.json',obj.valueRanges[14].values,obj.valueRanges[15].values,obj.valueRanges[16].values,obj.valueRanges[36].values);
	storeTeamStats('cached/JerichoJackalopes.json',obj.valueRanges[17].values,obj.valueRanges[18].values,obj.valueRanges[19].values,obj.valueRanges[37].values);
	storeTeamStats('cached/PompeiiPelicans.json',obj.valueRanges[20].values,obj.valueRanges[21].values,obj.valueRanges[22].values,obj.valueRanges[38].values);
	storeTeamStats('cached/SingaporeSeekers.json',obj.valueRanges[23].values,obj.valueRanges[24].values,obj.valueRanges[25].values,obj.valueRanges[39].values);
	storeTeamStats('cached/StockholmSyndromes.json',obj.valueRanges[26].values,obj.valueRanges[27].values,obj.valueRanges[28].values,obj.valueRanges[40].values);
	storeTeamStats('cached/USSRUnicorns.json',obj.valueRanges[29].values,obj.valueRanges[30].values,obj.valueRanges[31].values,obj.valueRanges[41].values);
}

/**
 * Stores the team's stats in a cached json
 */
function storeTeamStats(filename,roster,maps,matches,stats) {
	var json = `{"updated":"`;
	json += getTime(0);
	
	// store roster
	json += '","roster":[';
	if(roster.length) {
		roster.map((row) => {
			json += '{"name":"';
			json += `${sanitize(row[0])}`;
			json += '","draft":"';
			json += `${sanitize(row[1])}`;
			json += '","tank":"';
			json += `${sanitize(row[2])}`;
			json += '","damage":"';
			json += `${sanitize(row[3])}`;
			json += '","support":"';
			json += `${sanitize(row[4])}`;
			json += '"},';
		});
		
		json = json.replace(/,$/,'');
		json += '],';
	} else {
		json += '],';
	}
	
	// store maps
	json += '"maps":[';
	if(maps.length) {
		maps.map((row) => {
			json += '{"mapname":"';
			json += `${sanitize(row[0])}`;
			json += '","wins":"';
			json += `${sanitize(row[1])}`;
			json += '","losses":"';
			json += `${sanitize(row[2])}`;
			json += '","draws":"';
			json += `${sanitize(row[3])}`;
			json += '","winrate":"';
			json += `${sanitize(row[4])}`;
			json += '"},';
		});
			
		json = json.replace(/,$/,'');
		json += '],';
	} else {
		json += '],';
	}
	
	// store matches 
	json += '"matches":[';
	if(matches && matches.length) {
		matches.map((row) => {
			json += '{"tournament":"';
			json += `${sanitize(row[0])}`;
			json += '","opponent":"';
			json += `${sanitize(row[1])}`;
			json += '","date":"';
			json += `${sanitize(row[2])}`;
			json += '","time":"';
			json += `${sanitize(row[3])}`;
			json += '","played":"';
			json += `${sanitize(row[4])}",`;
			json += `"map1":{"name":"${sanitize(row[5])}","winner":"${sanitize(row[6])}"},`;
			json += `"map2":{"name":"${sanitize(row[7])}","winner":"${sanitize(row[8])}"},`;
			json += `"map3":{"name":"${sanitize(row[9])}","winner":"${sanitize(row[10])}"},`;
			json += `"map4":{"name":"${sanitize(row[11])}","winner":"${sanitize(row[12])}"},`;
			json += `"map5":{"name":"${sanitize(row[13])}","winner":"${sanitize(row[14])}"},`;
			json += `"map6":{"name":"${sanitize(row[15])}","winner":"${sanitize(row[16])}"},`;
			json += `"map7":{"name":"${sanitize(row[17])}","winner":"${sanitize(row[18])}"},`;
			json += `"map8":{"name":"${sanitize(row[19])}","winner":"${sanitize(row[20])}"},`;
			json += `"winner":"${sanitize(row[21])}",`;
			json += `"division":"${sanitize(row[22])}",`;
			json += `"vod":"${sanitize(row[23])}",`;
			json += `"round":"${sanitize(row[24])}"},`;
		});
			
		json = json.replace(/,$/,'');
		json += '],';
	} else {
		json += '],';
	}
	
	// store stats
	json += '"stats":{';
	if(stats.length) {
		stats.map((row) => {
			json += `"${row[0]}":{`;
			json += `"wins":"${row[1]}","losses":"${row[2]}","mapwins":"${row[3]}","maplosses":"${row[4]}","mapties":"${row[5]}","mapdiff":"${row[6]}","rank":"${row[7]}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += '}}';
	} else {
		json += '}}';
	}

	jsonObj = JSON.parse(json);
	localfs.writeJson(filename, jsonObj, (res) => {});
}

/**
 * Stores the match log in a json.
 */
function storeMatchLog(rows) {
	var json = '{"updated":"';
	json += getTime(0);
	json += '","currentround":';
	json += constants.CURRENT_ROUND;
	json += ',"matches":[';
	if(rows.length) {
		rows.map((row) => {
			json += `{"tournament":"${sanitize(row[0])}","played":"${sanitize(row[7])}",`;
			json += `"team1":"${sanitize(row[1])}","team2":"${sanitize(row[2])}",`;
			json += `"division":"${sanitize(row[4])}","date":"${sanitize(row[5])}","time":"${sanitize(row[6])}",`;
			json += `"map1":{"name":"${sanitize(row[8])}","winner":"${sanitize(row[9])}"},`;
			json += `"map2":{"name":"${sanitize(row[10])}","winner":"${sanitize(row[11])}"},`;
			json += `"map3":{"name":"${sanitize(row[12])}","winner":"${sanitize(row[13])}"},`;
			json += `"map4":{"name":"${sanitize(row[14])}","winner":"${sanitize(row[15])}"},`;
			json += `"map5":{"name":"${sanitize(row[16])}","winner":"${sanitize(row[17])}"},`;
			json += `"map6":{"name":"${sanitize(row[18])}","winner":"${sanitize(row[19])}"},`;
			json += `"map7":{"name":"${sanitize(row[20])}","winner":"${sanitize(row[21])}"},`;
			json += `"map8":{"name":"${sanitize(row[22])}","winner":"${sanitize(row[23])}"},`;
			json += `"matchwinner":"${sanitize(row[24])}","vod":"${sanitize(row[25])}","round":"${sanitize(row[26])}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty MatchLog!");
		json += ']}';
	}
		
	jsonObj = JSON.parse(json);			
	localfs.writeJson(constants.MATCHLOG_JSON, jsonObj, (res) => {});
}

/**
 * Stores hero stats in the json
 */
function storeHeroStats(rows,league,totals) {
	var json = '{"updated":"';
	json += getTime(0);
	json += '","stats":[';
	if(rows && rows.length && league && league.length) {
		rows.map((row) => {
			json += `{"player":"${sanitize(row[0])}","hero":"${sanitize(row[1])}",`;
			json += `"elims":"${row[2]}","fb":"${row[3]}",`;
			json += `"damage":"${row[4]}","deaths":"${row[5]}",`;
			json += `"healing":"${row[6]}","blocked":"${row[7]}",`;
			json += `"timeplayed":"${row[8]}","team":"${row[9]}"},`;
		});
		
		league.map((row) => {
			json += `{"player":"${sanitize(row[0])}","hero":"${sanitize(row[1])}",`;
			json += `"elims":"${row[2]}","fb":"${row[3]}",`;
			json += `"damage":"${row[4]}","deaths":"${row[5]}",`;
			json += `"healing":"${row[6]}","blocked":"${row[7]}",`;
			json += `"timeplayed":"${row[8]}","team":"The Gopherwatch League"},`;
		});
		
		json = json.replace(/,$/,'');
		json += '],"averages":{';
		json += `"elims":"${parseFloat(totals[0][0]).toFixed(2)}","elims10":"${parseFloat(totals[1][0]).toFixed(2)}","fb":"${parseFloat(totals[0][1]).toFixed(2)}","fb10":"${parseFloat(totals[1][1]).toFixed(2)}",`;
		json += `"dmg":"${parseFloat(totals[0][2]).toFixed(2)}","dmg10":"${parseFloat(totals[1][2]).toFixed(2)}","deaths":"${parseFloat(totals[0][3]).toFixed(2)}","deaths10":"${parseFloat(totals[1][3]).toFixed(2)}",`;
		json += `"healing":"${parseFloat(totals[0][4]).toFixed(2)}","healing10":"${parseFloat(totals[1][4]).toFixed(2)}","blocked":"${parseFloat(totals[0][5]).toFixed(2)}","blocked10":"${parseFloat(totals[1][5]).toFixed(2)}"}}`;
	} else {
		console.log("Pulled an empty HeroStats!");
		json += ']}';
	}
	
	jsonObj = JSON.parse(json);			
	localfs.writeJson(constants.HEROSTATS_JSON, jsonObj, (res) => {});
}

/**
 * stores the league's standings in STANDINGS_JSON
 */
function storeLeagueStandings(rows) {
	var json = '{"updated":"';
	json += getTime(0);
	json += '","Teams":[';
	if(rows && rows.length) {
		rows.map((row) => {
			json += `{"name":"${sanitize(row[1])}","rank":"${sanitize(row[0])}","points":"${sanitize(row[3])}",`;
			json += `"win":"${sanitize(row[4])}","loss":"${sanitize(row[5])}",`;
			if(row[3]+row[4]==0) {
				json += `"pct":"0%",`;
			} else {
				let winrate = parseInt(row[4])+parseInt(row[5]);
				winrate = parseInt(row[4])/winrate*100;
				winrate = winrate.toFixed(2);
				json += `"pct":"${winrate}%",`;
			}
			json += `"mapwin":"${sanitize(row[7])}","maploss":"${sanitize(row[8])}","maptie":"${sanitize(row[9])}",`;
			json += `"mapdiff":"${sanitize(row[10])}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty standings!");
		json += ']}';
	}

	var obj = JSON.parse(json);
	league_standings = obj;
	localfs.writeJson(constants.STANDINGS_JSON, obj, (res) => {});
}
/* ======== PUBLIC FUNCTIONS =========== */

/**
 * Gets all data in the given ranges
 */
function getDataInRange(range, callback) {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.get({
				auth: auth,
				spreadsheetId: constants.SPREADSHEET_ID,
				range: range
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				var rows = response.data.values;
				callback(rows);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

/**
 * Takes in the number of page hits in the last minute, and updates the sheet
 */
function doStats(numHits) {
	if(numHits == 0) return; // skip if no pages have been loaded
	getPageHits(numHits);
}

/**
 * function that queries all values in the spreadsheet and caches them into local JSONs
 */
function batchGetSpreadsheet() {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: constants.SPREADSHEET_ID,
				ranges: [
					'MatchLog!A2:AA99', // match log					0
					'HeroStats!A2:J2000', // all hero stats				1
					'BengaliBoom!A5:L14', // DS roster				2
					'BengaliBoom!F70:J88', // DS map stats			3
					'BengaliBoom!A32:Y67', // DS match history		4
					'FalklandFennecs!A5:L14', // LLS roster			5
					'FalklandFennecs!F70:J88', // LLS map stats		6
					'FalklandFennecs!A32:Y67', // LLS match history	7
					'GalacticWaterBears!A5:L14', // OO roster				8
					'GalacticWaterBears!F70:J88', // OO map stats			9
					'GalacticWaterBears!A32:Y67', // OO match history		10
					'HighlandHydroHomies!A5:L14', // PP roster					11
					'HighlandHydroHomies!F70:J88', // PP map stats				12
					'HighlandHydroHomies!A32:Y67', // PP match history			13
					'HoneyBunchesOfOks!A5:L14', // TTT roster			14
					'HoneyBunchesOfOks!F70:J88', // TTT map stats		15
					'HoneyBunchesOfOks!A32:Y67', // TTT match history	16
					'JerichoJackalopes!A5:L14', // BB roster				17
					'JerichoJackalopes!F70:J88', // BB map stats			18
					'JerichoJackalopes!A32:Y67', // BB match history		19
					'PompeiiPelicans!A5:L14', // GG roster					20
					'PompeiiPelicans!F70:J88', // GG map stats				21
					'PompeiiPelicans!A32:Y67', // GG match history			22
					'SingaporeSeekers!A5:L14', // RR roster				23
					'SingaporeSeekers!F70:J88', // RR map stats			24
					'SingaporeSeekers!A32:Y67', // RR match history		25
					'StockholmSyndromes!A5:L14', // GPG roster			26
					'StockholmSyndromes!F70:J88', // GPG map stats		27
					'StockholmSyndromes!A32:Y67', // GPG match history	28
					'USSRUnicorns!A5:L14', // WB roster					29
					'USSRUnicorns!F70:J88', // WB map stats				30
					'USSRUnicorns!A32:Y67', // WB match history			31
					'BengaliBoom!J17:Q20', // DS team stats			32
					'FalklandFennecs!J17:Q20', // LL team stats		33
					'GalacticWaterBears!J17:Q20', // OO team stats			34
					'HighlandHydroHomies!J17:Q20', // PP team stats			35
					'HoneyBunchesOfOks!J17:Q20', // TTT team stats	36
					'JerichoJackalopes!J17:Q20', // BB team stats			37
					'PompeiiPelicans!J17:Q20', // GG team stats			38
					'SingaporeSeekers!J17:Q20', // RR team stats		39
					'StockholmSyndromes!J17:Q20', // GPG team stats		40
					'USSRUnicorns!J17:Q20', // WB team stats				41
					'Standings!A15:K24', // standings					42
					'HeroStats!L2:T32', // league-wide hero stats		43
					'HeroStats!N34:S35', // league averages				44 
				]
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				storeBatchGet(response.data);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

/**
 * refreshes the player json
 * TODO add to the batchGetSpreadsheet function and deprecate
 */
function refreshPlayerJson() {
	let json = '{"updated":"';
	json += getTime(0);
	json += '","nextUpdate":"';
	json += getTime(1);
	json += '","players":['
	getDataInRange('PlayerInfo!A2:AC100', (rows) => {
		if(rows.length) {
			rows.map((row) => {
				json += '{"battletag":"';
				json += `${sanitize(row[0])}`;
				json += '","team":"';
				json += `${sanitize(row[1])}`;
				json += '","draft":"';
				json += `${sanitize(row[2])}`;
				json += '","tank":"';
				json += `${sanitize(row[9])}`;
				json += '","dps":"';
				json += `${sanitize(row[10])}`;
				json += '","support":"';
				json += `${sanitize(row[11])}`;
				json += `","mvp":"${sanitize(row[12])}","realname":"${sanitize(row[13])}","playernumber":"${sanitize(row[14])}",`;
				json += `"pronouns":"${sanitize(row[15])}","hometown":"${sanitize(row[16])}","major":"${sanitize(row[17])}",`;
				json += `"twitch":"${sanitize(row[18])}","twitter":"${sanitize(row[19])}","youtube":"${sanitize(row[20])}","instagram":"${sanitize(row[21])}","reddit":"${sanitize(row[22])}",`;
				let accolades = row[25];
				if(accolades != undefined) {
					accolades = accolades.split("\n").join("\\n");
				}
				let bio = row[27];
				if(bio != undefined) {
					bio = bio.split("\"").join("\\\"");
					bio = bio.split("\n").join("\\n");
				}
				json += `"role":"${sanitize(row[23])}","hero":"${sanitize(row[24])}","accolades":"${sanitize(row[25])}","picture":"${sanitize(row[26])}","bio":"${sanitize(row[27])}"},`;
			});
			
			json = json.replace(/,$/,'');
			json += ']}';
			
			json = json.split("\"undefined\"").join("\"\"");
			obj = JSON.parse(json);			
			localfs.writeJson(constants.PLAYER_JSON, obj, (res) => {});
		} else {
			console.log('Player info is empty!');
		}
	});
}

/**
 * functions that are exported to node module
 */
module.exports = {
	doStats,
	batchGetSpreadsheet,
	getDataInRange,
	refreshPlayerJson
}