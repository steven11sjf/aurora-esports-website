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
<<<<<<< HEAD
const googleAuth = require('./auth');
const constants = require('./consts');
const localfs = require('./localfs');

// helper function that sanitizes data taken from external source (ie spreadsheet cells) to make sure attackers cannot break code or html
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

// base class for Gopherwatch League spreadsheet
class GWLSpreadsheet {
	name; // name of the season
	internal; // internal name used
	ongoing; // whether the tournament is ongoing
	spreadsheetId; // the spreadsheet's id (string after the last '/' in url)
	teams; // the teams in the tournament
	format; // the format of the tournament
	meta; // metadata info object (i.e. meta.hasStats = true)
	
	// creates a spreadsheet
	constructor(name, internal, ongoing, spreadsheetId) {
		this.name = name;
		this.internal = internal;
		this.ongoing = ongoing;
		this.spreadsheetId = spreadsheetId;
		this.format = "unformatted";
		this.teams = [];
		this.meta = {};
	}
	
	// builds the directory structure
	buildDirectory() {
		console.info('Using default buildDirectory, but it is best practice to override');
		fs.mkdirSync("./json/" + this.internal);
		fs.mkdirSync("./json/" + this.internal + "/teams");
	}
	
	// loads a serialized object into the class
	static loadObject(obj) {
		// check it is the correct format
		if(obj.format != "unformatted") {
			console.log("Object is not a GWLSpreadsheet object!");
			return null;
		}
		var sheet = new GWLSpreadsheet(obj.name, obj.internal, obj.ongoing, obj.spreadsheetId);
		return sheet;
	}
	
	// abstract method to access spreadsheet info (typically stored in Info tab)
	loadSheetInfo() {
		console.error('You have not implemented the method loadSheetInfo!');
	}
	
	// abstract method to BatchGet all info
	batchGetAll() {
		console.error('You have not implemented the method batchGetAll!');
	}
	
	// abstract method to get player info
	getPlayerInfo(battletag) {
		console.error('You have not implemented the method getPlayerInfo!');
	}
}

// class for round robin tournaments
class GWLRoundRobinSpreadsheet extends GWLSpreadsheet {
	// creates a round robin spreadsheet
	constructor(name, internal, ongoing, spreadsheetId) {
		super(name, internal, ongoing, spreadsheetId);
		this.format = "roundrobin";
		this.meta.hasStats = true;
		this.meta.hasPlayerProfiles = true;
		console.log(this);
		this.buildDirectory();
	}
	
	// loads a serialized object into the class
	static loadObject(obj) {
		if(obj.format != "roundrobin") {
			console.log("Object is not a GWLRoundRobinSpreadsheet object!");
			return null;
		}
		var sheet = new GWLRoundRobinSpreadsheet(obj.name, obj.internal, obj.ongoing, obj.spreadsheetId);
		sheet.teams = obj.teams;
		return sheet;
	}
	
	// accesses spreadsheet info
	loadSheetInfo() {
		googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: this.spreadsheetId,
				ranges: [
					'Info!A2:C21',			// 1 Team names
				]
			}, (err, response) => {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				
				// store teams
				let teams = response.data.valueRanges[0].values;
				teams.map((row) => {
					let obj = {};
					obj.name = row[0];
					obj.internalName = row[2];
					this.teams.push(obj);
				});
				
				console.log("Loaded team info!", this);
				this.batchGetAll();
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
	}
	
	// stores data captured by batchGetAll
	storeBatchGet(data) {
		console.log(data);
		// store matchlog info
		{
			let rows = data.valueRanges[0].values;
			var json = '{"matches":[';
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
				
			let jsonObj = JSON.parse(json);			
			localfs.writeJson(this.internal + '/matchlog.json', jsonObj, (res) => {});
		}
		
		// store hero stats
		{
			let rows = data.valueRanges[1].values;
			let league = data.valueRanges[2].values;
			let totals = data.valueRanges[3].values;
			
			var json = '{"stats":[';
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
			
			let jsonObj = JSON.parse(json);
			localfs.writeJson(this.internal + '/herostats.json', jsonObj, (res) => {});
		}
		
		// store standings
		{
			let rows = data.valueRanges[4].values;
			let json = '{"Teams":[';
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
			localfs.writeJson(this.internal + '/standings.json', obj, (res) => {});
		}
		
		// store player info
		{
			let rows = data.valueRanges[5].values;
			let json = '{"players":['
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
				let obj = JSON.parse(json);			
				localfs.writeJson(this.internal + '/players.json', obj, (res) => {});
			} else {
				console.log('Player info is empty!');
			}
		}
		
		// store team info
		let offset = 6; // what index team info starts
		for(let i=0; i<this.teams.length; i++) {
			// check the value ranges for the team exist
			if(!data.valueRanges[offset+4*i+3]) {
				console.error('Invalid batchGetAll response! data.valueRanges[' + (offset+4*i+3) + '] does not exist!')
				break;
			}
			
			// map to variables
			let filename = this.internal + '/teams/' + this.teams[i].internalName + '.json';
			let roster = data.valueRanges[offset+4*i].values;
			let maps = data.valueRanges[offset+4*i+1].values;
			let matches = data.valueRanges[offset+4*i+2].values;
			let stats = data.valueRanges[offset+4*i+3].values;
			
			// store roster
			let json = '{"roster":[';
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

			console.log(json);
			let jsonObj = JSON.parse(json);
			localfs.writeJson(filename, jsonObj, (res) => {});
		}
		
		console.log('Batch get for season "' + this.name + '" complete!');
	}
	
	// batch get all info for sheet
	batchGetAll() {
		console.log("teams:",this.teams);
		// generate ranges
		let ranges = [];
		ranges.push('MatchLog!A2:AA361');
		ranges.push('HeroStats!A2:J2000');
		ranges.push('HeroStats!L2:T32');
		ranges.push('HeroStats!N34:S35');
		ranges.push('Standings!A15:K24');
		ranges.push('PlayerInfo!A2:AC200');
		for(let i=0; i<this.teams.length; i++) {
			ranges.push(this.teams[i].internalName + '!A5:L14') // roster
			ranges.push(this.teams[i].internalName + '!F70:J88') // map stats
			ranges.push(this.teams[i].internalName + '!A32:Y67') // match history
			ranges.push(this.teams[i].internalName + '!J17:Q20') // team stats
		}
		
		console.log(ranges);
		
		// get data on all ranges
		googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: constants.SPREADSHEET_ID,
				ranges: ranges
			}, (err, response) => {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				this.storeBatchGet(response.data);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
	}
}

module.exports = {
	GWLSpreadsheet,
	GWLRoundRobinSpreadsheet,
=======
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
>>>>>>> seasons-update
}