var fs = require("fs");
var {google} = require('googleapis');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom submodules
const googleAuth = require('./auth');
const localfs = require('./localfs');

const SPREADSHEET_ID = '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM';

const MATCHLOG_JSON = 'cached/matchlog.json';
const PLAYER_JSON = 'cached/players.json';
const HEROSTATS_JSON = 'cached/herostats.json';
const STANDINGS_JSON = 'cached/standings.json';
var CURRENT_WEEK = 5;


/* ======== HELPER FUNCTIONS ========= */

/**
 * Gets the time, offset by the number of minutes in the future
 * getTime(0) is current time
 * getTime(5) is the time in 5 minutes
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
 * run on all user input cells to make sure they can't put raw html increment
 */
function sanitize(string) {
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
	
	return output;
}

/**
 * gets the number of hourly and weekly page hits
 * returns the page hits obj
 */
function getPageHits() {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: SPREADSHEET_ID,
				ranges: [
					'SiteStats!B3:B98', // hourly hits					0
					'SiteStats!E3:K3' // weekly hits
				]
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				return response.data;
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

/* calculates the number of page hits and what cells to update */
function calcPageHits(obj,numHits) {
	row = 3 + get15Inc();
	day = getDay();
	timeCell = 'SiteStats!B' + row.toString();
	dayCell = 'SiteStats!' + String.fromCharCode(69+day) + '3';
	
	currTime = obj.valueRanges[0].values[row-3][0];
	currDay = obj.valueRanges[1].values[0][day];
	
	newStats = {
		"timeCell" : timeCell,
		"dayCell" : dayCell,
		"timeUpdated" : parseInt(currTime, 10) + numHits,
		"dayUpdated" : parseInt(currDay) + numHits
	};
	return newStats;
}

/* updates page hits with latest stats */
function updatePageHits(stats) {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchUpdate({
				auth: auth,
				spreadsheetId: SPREADSHEET_ID,
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
	
	storeTeamStats('cached/DjiboutiShorts.json',obj.valueRanges[2].values,obj.valueRanges[3].values,obj.valueRanges[4].values,obj.valueRanges[32].values);
	storeTeamStats('cached/LondonLumberjacks.json',obj.valueRanges[5].values,obj.valueRanges[6].values,obj.valueRanges[7].values,obj.valueRanges[33].values);
	storeTeamStats('cached/OceaniaOtters.json',obj.valueRanges[8].values,obj.valueRanges[9].values,obj.valueRanges[10].values,obj.valueRanges[34].values);
	storeTeamStats('cached/PlymouthPMAs.json',obj.valueRanges[11].values,obj.valueRanges[12].values,obj.valueRanges[13].values,obj.valueRanges[35].values);
	storeTeamStats('cached/TheTenochitlanTacos.json',obj.valueRanges[14].values,obj.valueRanges[15].values,obj.valueRanges[16].values,obj.valueRanges[36].values);
	storeTeamStats('cached/BendigoBilbies.json',obj.valueRanges[17].values,obj.valueRanges[18].values,obj.valueRanges[19].values,obj.valueRanges[37].values);
	storeTeamStats('cached/GamingGolems.json',obj.valueRanges[20].values,obj.valueRanges[21].values,obj.valueRanges[22].values,obj.valueRanges[38].values);
	storeTeamStats('cached/RialtoRincewinds.json',obj.valueRanges[23].values,obj.valueRanges[24].values,obj.valueRanges[25].values,obj.valueRanges[39].values);
	storeTeamStats('cached/GalapagosGremlins.json',obj.valueRanges[26].values,obj.valueRanges[27].values,obj.valueRanges[28].values,obj.valueRanges[40].values);
	storeTeamStats('cached/WakandaBBQs.json',obj.valueRanges[29].values,obj.valueRanges[30].values,obj.valueRanges[31].values,obj.valueRanges[41].values);
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
			json += `${row[0]}`;
			json += '","draft":"';
			json += `${row[1]}`;
			json += '","tank":"';
			json += `${row[2]}`;
			json += '","damage":"';
			json += `${row[3]}`;
			json += '","support":"';
			json += `${row[4]}`;
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
			json += `${row[0]}`;
			json += '","wins":"';
			json += `${row[1]}`;
			json += '","losses":"';
			json += `${row[2]}`;
			json += '","draws":"';
			json += `${row[3]}`;
			json += '","winrate":"';
			json += `${row[4]}`;
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
			json += `${row[0]}`;
			json += '","opponent":"';
			json += `${row[1]}`;
			json += '","date":"';
			json += `${row[2]}`;
			json += '","time":"';
			json += `${row[3]}`;
			json += '","played":"';
			json += `${row[4]}",`;
			json += `"map1":{"name":"${row[5]}","winner":"${row[6]}"},`;
			json += `"map2":{"name":"${row[7]}","winner":"${row[8]}"},`;
			json += `"map3":{"name":"${row[9]}","winner":"${row[10]}"},`;
			json += `"map4":{"name":"${row[11]}","winner":"${row[12]}"},`;
			json += `"map5":{"name":"${row[13]}","winner":"${row[14]}"},`;
			json += `"map6":{"name":"${row[15]}","winner":"${row[16]}"},`;
			json += `"map7":{"name":"${row[17]}","winner":"${row[18]}"},`;
			json += `"map8":{"name":"${row[19]}","winner":"${row[20]}"},`;
			json += `"winner":"${row[21]}",`;
			json += `"division":"${row[22]}",`;
			json += `"vod":"${row[23]}",`;
			json += `"round":"${row[24]}"},`;
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
	json += CURRENT_WEEK;
	json += ',"matches":[';
	if(rows.length) {
		rows.map((row) => {
			json += `{"tournament":"${row[0]}","played":"${row[7]}",`;
			json += `"team1":"${row[1]}","team2":"${row[2]}",`;
			json += `"division":"${row[4]}","date":"${row[5]}","time":"${row[6]}",`;
			json += `"map1":{"name":"${row[8]}","winner":"${row[9]}"},`;
			json += `"map2":{"name":"${row[10]}","winner":"${row[11]}"},`;
			json += `"map3":{"name":"${row[12]}","winner":"${row[13]}"},`;
			json += `"map4":{"name":"${row[14]}","winner":"${row[15]}"},`;
			json += `"map5":{"name":"${row[16]}","winner":"${row[17]}"},`;
			json += `"map6":{"name":"${row[18]}","winner":"${row[19]}"},`;
			json += `"map7":{"name":"${row[20]}","winner":"${row[21]}"},`;
			json += `"map8":{"name":"${row[22]}","winner":"${row[23]}"},`;
			json += `"matchwinner":"${row[24]}","vod":"${row[25]}","round":"${row[26]}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty MatchLog!");
		json += ']}';
	}
		
	jsonObj = JSON.parse(json);			
	localfs.writeJson(MATCHLOG_JSON, jsonObj, (res) => {});
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
			json += `{"player":"${row[0]}","hero":"${row[1]}",`;
			json += `"elims":"${row[2]}","fb":"${row[3]}",`;
			json += `"damage":"${row[4]}","deaths":"${row[5]}",`;
			json += `"healing":"${row[6]}","blocked":"${row[7]}",`;
			json += `"timeplayed":"${row[8]}","team":"${row[9]}"},`;
		});
		
		league.map((row) => {
			json += `{"player":"${row[0]}","hero":"${row[1]}",`;
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
	localfs.writeJson(HEROSTATS_JSON, jsonObj, (res) => {});
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
			json += `{"name":"${row[1]}","rank":"${row[0]}","points":"${row[3]}",`;
			json += `"win":"${row[4]}","loss":"${row[5]}",`;
			if(row[3]+row[4]==0) {
				json += `"pct":"0%",`;
			} else {
				let winrate = parseInt(row[4])+parseInt(row[5]);
				winrate = parseInt(row[4])/winrate*100;
				winrate = winrate.toFixed(2);
				json += `"pct":"${winrate}%",`;
			}
			json += `"mapwin":"${row[7]}","maploss":"${row[8]}","maptie":"${row[9]}",`;
			json += `"mapdiff":"${row[10]}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty standings!");
		json += ']}';
	}

	var obj = JSON.parse(json);
	league_standings = obj;
	localfs.writeJson(STANDINGS_JSON, obj, (res) => {});
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
				spreadsheetId: SPREADSHEET_ID,
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
	let curr = getPageHits();
	let next = calcPageHits(curr,numHits);
	updatePageHits(next);
}

/**
 * function that queries all values in the spreadsheet and caches them into local JSONs
 */
function batchGetSpreadsheet() {
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: SPREADSHEET_ID,
				ranges: [
					'MatchLog!A2:AA99', // match log					0
					'HeroStats!A2:J2000', // all hero stats				1
					'DjiboutiShorts!A5:L14', // DS roster				2
					'DjiboutiShorts!F70:J88', // DS map stats			3
					'DjiboutiShorts!A32:Y67', // DS match history		4
					'LondonLumberjacks!A5:L14', // LLS roster			5
					'LondonLumberjacks!F70:J88', // LLS map stats		6
					'LondonLumberjacks!A32:Y67', // LLS match history	7
					'OceaniaOtters!A5:L14', // OO roster				8
					'OceaniaOtters!F70:J88', // OO map stats			9
					'OceaniaOtters!A32:Y67', // OO match history		10
					'PlymouthPMAs!A5:L14', // PP roster					11
					'PlymouthPMAs!F70:J88', // PP map stats				12
					'PlymouthPMAs!A32:Y67', // PP match history			13
					'TheTenochitlanTacos!A5:L14', // TTT roster			14
					'TheTenochitlanTacos!F70:J88', // TTT map stats		15
					'TheTenochitlanTacos!A32:Y67', // TTT match history	16
					'BendigoBilbies!A5:L14', // BB roster				17
					'BendigoBilbies!F70:J88', // BB map stats			18
					'BendigoBilbies!A32:Y67', // BB match history		19
					'GamingGolems!A5:L14', // GG roster					20
					'GamingGolems!F70:J88', // GG map stats				21
					'GamingGolems!A32:Y67', // GG match history			22
					'RialtoRincewinds!A5:L14', // RR roster				23
					'RialtoRincewinds!F70:J88', // RR map stats			24
					'RialtoRincewinds!A32:Y67', // RR match history		25
					'GalapagosGremlins!A5:L14', // GPG roster			26
					'GalapagosGremlins!F70:J88', // GPG map stats		27
					'GalapagosGremlins!A32:Y67', // GPG match history	28
					'WakandaBBQs!A5:L14', // WB roster					29
					'WakandaBBQs!F70:J88', // WB map stats				30
					'WakandaBBQs!A32:Y67', // WB match history			31
					'DjiboutiShorts!J17:Q20', // DS team stats			32
					'LondonLumberjacks!J17:Q20', // LL team stats		33
					'OceaniaOtters!J17:Q20', // OO team stats			34
					'PlymouthPMAs!J17:Q20', // PP team stats			35
					'TheTenochitlanTacos!J17:Q20', // TTT team stats	36
					'BendigoBilbies!J17:Q20', // BB team stats			37
					'GamingGolems!J17:Q20', // GG team stats			38
					'RialtoRincewinds!J17:Q20', // RR team stats		39
					'GalapagosGremlins!J17:Q20', // GPG team stats		40
					'WakandaBBQs!J17:Q20', // WB team stats				41
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
				json += `${row[0]}`;
				json += '","team":"';
				json += `${row[1]}`;
				json += '","draft":"';
				json += `${row[2]}`;
				json += '","tank":"';
				json += `${row[9]}`;
				json += '","dps":"';
				json += `${row[10]}`;
				json += '","support":"';
				json += `${row[11]}`;
				json += `","mvp":"${row[12]}","realname":"${row[13]}","playernumber":"${row[14]}",`;
				json += `"pronouns":"${row[15]}","hometown":"${row[16]}","major":"${row[17]}",`;
				json += `"twitch":"${row[18]}","twitter":"${row[19]}","youtube":"${row[20]}","instagram":"${row[21]}","reddit":"${row[22]}",`;
				let accolades = row[25];
				if(accolades != undefined) {
					accolades = accolades.split("\n").join("\\n");
				}
				let bio = row[27];
				if(bio != undefined) {
					bio = bio.split("\"").join("\\\"");
					bio = bio.split("\n").join("\\n");
				}
				json += `"role":"${row[23]}","hero":"${row[24]}","accolades":"${accolades}","picture":"${row[26]}","bio":"${bio}"},`;
			});
			
			json = json.replace(/,$/,'');
			json += ']}';
			
			json = json.split("\"undefined\"").join("\"\"");
			obj = JSON.parse(json);			
			localfs.writeJson(PLAYER_JSON, obj, (res) => {});
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