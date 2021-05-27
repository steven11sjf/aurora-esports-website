var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
var cron = require('cron');
app.use(bodyparser());
require('dotenv').config();
const sheetsApi = google.sheets('v4');
const googleAuth = require('./auth');

const SPREADSHEET_ID = '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM';
const PLAYER_JSON = 'players.json';
const MATCHLOG_JSON = 'matchlog.json';

var QUOTA_USE = 0;
var MAX_QUOTA_PER_MIN = 60;
var TEAM_INFO = [];

function getTeamInfo() {
	getDataInRange('Info!$A$2:$C$10', (rows) => {
		rows.map((row) => {
			TEAM_INFO.push({name: row[0], division: row[1], internal: row[2]});
		});
	});
}
getTeamInfo();

function getTeam(internal, callback) {
	for(var i = 0; i < TEAM_INFO.length; ++i) {
		if(TEAM_INFO[i].internal === internal) callback(TEAM_INFO[i]);
	}
	callback(null);
}

function getTeams(callback) {
	let teams = [];
	for(var i=0; i<TEAM_INFO.length; ++i) {
		teams.push(TEAM_INFO[i].name);
	}
	callback(teams);
}

// schedules
const playersUpdateJob = cron.job('0/1 * * * *', () => {
	console.log('time is ' + getTime(0));
	refreshPlayerJson();
});
playersUpdateJob.start();

const batchUpdateJob = cron.job('30 0/1 * * * *', () => {
	console.log('time is ' + getTime(0));
	batchGetSpreadsheet(storeBatchGet);
});
batchUpdateJob.start();
	

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
 * Opens a local JSON stored in __dirname/json/
 * Parses the json into an object and sends it to the callback
 */
function openLocalJSON(path, callback) {
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

function writeLocalJSON(path, obj) {
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


function testWrite() {
	console.log('one');
	var asdf = {
		"str1": "hello",
		"str2": "goodbye",
		"info": {
			"name": "hyperbola0",
			"number": 11,
			"sr": {
				"tank": 2200,
				"dps": 1500,
				"support": 2700
			}
		}
	};
	var fdsa = '{ "str1" : "peepee", "array":[ "one":"poo", "two":"aaaaa" ]}';
	writeLocalJSON('test1.json', asdf, (res) => {});
	writeLocalJSON('test2.json', fdsa, (res) => {
		var sdfg = '';
		openLocalJSON('test2.json', sdfg);
		console.log('last');
	});
}

function testRead() {
	openLocalJSON('test1.json', (obj) => {
		console.log(obj);
		var num = obj.info.sr.tank + obj.info.sr.dps + obj.info.sr.support;
		num = num / 3;
		console.log('player ' + obj.info.name + ' with SR ' + num);
	});
}

function getDataInRange(range, callback) {
	// don't call if you need more quota
	if(QUOTA_USE >= MAX_QUOTA_PER_MIN - 3) {
		console.log('Exceeding max quota! QUOTA_USE=' + QUOTA_USE);
		return;
	}
	else {
		// increment the quota and decrement it after one minute
		QUOTA_USE+=1;
		setTimeout(function(){ QUOTA_USE-=1; },60000);
	}
	
	console.log('Connecting to Google API to receive data ' + range + ', current quota use is ' + QUOTA_USE);
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

batchGetSpreadsheet(storeBatchGet);

function batchGetSpreadsheet(callback) {
	// don't call if you need more quota
	if(QUOTA_USE >= MAX_QUOTA_PER_MIN - 3) {
		console.log('Exceeding max quota! QUOTA_USE=' + QUOTA_USE);
		return;
	}
	else {
		// increment the quota and decrement it after one minute
		QUOTA_USE+=1;
		setTimeout(function(){ QUOTA_USE-=1; },60000);
	}
	
	console.log('Connecting to Google API to receive batch data, current quota use is ' + QUOTA_USE);
	googleAuth.authorize()
		.then((auth) => {
			sheetsApi.spreadsheets.values.batchGet({
				auth: auth,
				spreadsheetId: SPREADSHEET_ID,
				ranges: [
					'MatchLog!A2:Z99', // match log						0
					'HeroStats!A2:I2000', // all hero stats				1
					'DjiboutiShorts!A5:L14', // DS roster				2
					'DjiboutiShorts!F70:J88', // DS map stats			3
					'DjiboutiShorts!A32:X67', // DS match history		4
					'LondonLumberjacks!A5:L14', // LLS roster			5
					'LondonLumberjacks!F70:J88', // LLS map stats		6
					'LondonLumberjacks!A32:X67', // LLS match history	7
					'OceaniaOtters!A5:L14', // OO roster				8
					'OceaniaOtters!F70:J88', // OO map stats			9
					'OceaniaOtters!A32:X67', // OO match history		10
					'PlymouthPMAs!A5:L14', // PP roster					11
					'PlymouthPMAs!F70:J88', // PP map stats				12
					'PlymouthPMAs!A32:X67', // PP match history			13
					'TheTenochitlanTacos!A5:L14', // TTT roster			14
					'TheTenochitlanTacos!F70:J88', // TTT map stats		15
					'TheTenochitlanTacos!A32:X67', // TTT match history	16
					'BendigoBilbies!A5:L14', // BB roster				17
					'BendigoBilbies!F70:J88', // BB map stats			18
					'BendigoBilbies!A32:X67', // BB match history		19
					'GamingGollums!A5:L14', // GG roster				20
					'GamingGollums!F70:J88', // GG map stats			21
					'GamingGollums!A32:X67', // GG match history		22
					'RialtoRincewinds!A5:L14', // RR roster				23
					'RialtoRincewinds!F70:J88', // RR map stats			24
					'RialtoRincewinds!A32:X67', // RR match history		25
					'GalapagosGremlins!A5:L14', // GPG roster			26
					'GalapagosGremlins!F70:J88', // GPG map stats		27
					'GalapagosGremlins!A32:X67', // GPG match history	28
					'WakandaBBQs!A5:L14', // WB roster					29
					'WakandaBBQs!F70:J88', // WB map stats				30
					'WakandaBBQs!A32:X67', // WB match history			31
					'DjiboutiShorts!B17:E26', // DS team stats			32
					'LondonLumberjacks!B17:E26', // LL team stats		33
					'OceaniaOtters!B17:E26', // OO team stats			34
					'PlymouthPMAs!B17:E26', // PP team stats			35
					'TheTenochitlanTacos!B17:E26', // TTT team stats	36
					'BendigoBilbies!B17:E26', // BB team stats			37
					'GamingGollums!B17:E26', // GG team stats			38
					'RialtoRincewinds!B17:E26', // RR team stats		39
					'GalapagosGremlins!B17:E26', // GPG team stats		40
					'WakandaBBQs!B17:E26', // WB team stats				41
				]
			}, function (err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				callback(response.data);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}

function storeBatchGet(obj) {
	storeMatchLog(obj.valueRanges[0].values); // store match log
	storeHeroStats(obj.valueRanges[1].values); // store hero stats
	
	storeTeamStats('DjiboutiShorts.json',obj.valueRanges[2].values,obj.valueRanges[3].values,obj.valueRanges[4].values,obj.valueRanges[32].values);
	storeTeamStats('LondonLumberjacks.json',obj.valueRanges[5].values,obj.valueRanges[6].values,obj.valueRanges[7].values,obj.valueRanges[33].values);
	storeTeamStats('OceaniaOtters.json',obj.valueRanges[8].values,obj.valueRanges[9].values,obj.valueRanges[10].values,obj.valueRanges[34].values);
	storeTeamStats('PlymouthPMAs.json',obj.valueRanges[11].values,obj.valueRanges[12].values,obj.valueRanges[13].values,obj.valueRanges[35].values);
	storeTeamStats('TheTenochitlanTacos.json',obj.valueRanges[14].values,obj.valueRanges[15].values,obj.valueRanges[16].values,obj.valueRanges[36].values);
	storeTeamStats('BendigoBilbies.json',obj.valueRanges[17].values,obj.valueRanges[18].values,obj.valueRanges[19].values,obj.valueRanges[37].values);
	storeTeamStats('GamingGollums.json',obj.valueRanges[20].values,obj.valueRanges[21].values,obj.valueRanges[22].values,obj.valueRanges[38].values);
	storeTeamStats('RialtoRincewinds.json',obj.valueRanges[23].values,obj.valueRanges[24].values,obj.valueRanges[25].values,obj.valueRanges[39].values);
	storeTeamStats('GalapagosGremlins.json',obj.valueRanges[26].values,obj.valueRanges[27].values,obj.valueRanges[28].values,obj.valueRanges[40].values);
	storeTeamStats('WakandaBBQs.json',obj.valueRanges[29].values,obj.valueRanges[30].values,obj.valueRanges[31].values,obj.valueRanges[41].values);
}

function storeMatchLog(rows) {
	var json = '{"updated":"';
	json += getTime(0);
	json += '","matches":[';
	if(rows.length) {
		rows.map((row) => {
			json += `{"tournament":"${row[0]}","played":"${row[7]}",`;
			json += `"team1":"${row[1]}","team2":"${row[2]}",`;
			json += `"division":"${row[4]}","date":"${row[5]}","time":"${row[6]}",`;
			json += `"maps":[{"map":"${row[8]}","winner":"${row[9]}"},`;
			json += `{"map":"${row[10]}","winner":"${row[11]}"},`;
			json += `{"map":"${row[12]}","winner":"${row[13]}"},`;
			json += `{"map":"${row[14]}","winner":"${row[15]}"},`;
			json += `{"map":"${row[16]}","winner":"${row[17]}"},`;
			json += `{"map":"${row[18]}","winner":"${row[19]}"},`;
			json += `{"map":"${row[20]}","winner":"${row[21]}"},`;
			json += `{"map":"${row[22]}","winner":"${row[23]}"}],`;
			json += `"matchwinner":"${row[24]}","vod":"${row[25]}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty MatchLog!");
		json += ']}';
	}
		
	jsonObj = JSON.parse(json);			
	writeLocalJSON(MATCHLOG_JSON, jsonObj, (res) => {});
}

function storeHeroStats(rows) {
	var json = '{"updated":"';
	json += getTime(0);
	json += '","stats":[';
	if(rows.length) {
		rows.map((row) => {
			json += `{"player":"${row[0]}","hero":"${row[1]}",`;
			json += `"elims":"${row[2]}","fb":"${row[3]}",`;
			json += `"damage":"${row[4]}","deaths":"${row[5]}",`;
			json += `"healing":"${row[6]}","blocked":"${row[7]}",`;
			json += `"timeplayed":"${row[8]}"},`;
		});
		
		json = json.replace(/,$/,'');
		json += ']}';
	} else {
		console.log("Pulled an empty HeroStats!");
		json += ']}';
	}
	
	jsonObj = JSON.parse(json);			
	writeLocalJSON(MATCHLOG_JSON, jsonObj, (res) => {});
}

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
			json += `"vod":"${row[23]}"},`;
		});
			
		json = json.replace(/,$/,'');
		json += '],';
	} else {
		json += '],';
	}
	
	// store stats
	json += '"stats":{';
	if(stats.length) {
		json += `"wins":"${stats[0][0]}",`;
		json += `"losses":"${stats[1][0]}",`;
		json += `"mapwins":"${stats[2][0]}",`;
		json += `"maplosses":"${stats[3][0]}",`;
		json += `"mapties":"${stats[4][0]}",`;
		json += `"divwins":"${stats[5][0]}",`;
		json += `"divlosses":"${stats[6][0]}",`;
		json += `"ndivwins":"${stats[7][0]}",`;
		json += `"ndivlosses":"${stats[8][0]}",`;
		json += `"mapdiff":"${stats[9][0]}"}}`;
	} else {
		json += '"wins":"0","losses":"0","mapwins":"0","maplosses":"0","mapties":"0","divwins":"0","divlosses":"0","ndivwins":"0","ndivlosses":"0","mapdiff":"0"}}'	;
	}
	
	jsonObj = JSON.parse(json);
	writeLocalJSON(filename, jsonObj, (res) => {});
}
function refreshPlayerJson() {
	let json = '{"updated":"';
	json += getTime(0);
	json += '","nextUpdate":"';
	json += getTime(1);
	json += '","players":['
	getDataInRange('PlayerInfo!A2:S76', (rows) => {
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
				json += '","discordtag":"';
				
				if(row[13]=='yes')
					json += `${row[12]}`;
				else
					json += 'PRIVATE';
				
				json += '","morebtags":"';
				json += `${row[14]}`;
				json += '","pronouns":"';
				json += `${row[15]}`;
				json += '","bio":"';
				json += `${row[16]}`;
				json += '","twitch":"';
				json += `${row[17]}`;
				json += '","twitter":"';
				json += `${row[18]}`;
				json += '"},';
			});
			
			json = json.replace(/,$/,'');
			json += ']}';
			
			obj = JSON.parse(json);			
			writeLocalJSON(PLAYER_JSON, obj, (res) => {});
		} else {
			console.log('Player info is empty!');
		}
	});
}
refreshPlayerJson();

function getRoster(team, callback) {
	let json = '{"roster":[';
	getDataInRange(team + '!A5:L14', (rows) => {
		if(rows.length) {
			rows.map((row) => {
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
			json += ']}';
			
			callback(json);
		} else {
			callback('{"roster":[]}');
		}
	});
}

function getMapStats(team, callback) {
	openLocalJSON(team + '.json', (obj) => {
		json = JSON.stringify(obj);
		callback(json);
	});
}

function getMatches(team, callback) {
	let json = '{"matches":[';
	getDataInRange(team + '!A32:X67', (rows) => {
		if(rows.length) {
			rows.map((row) => {
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
				json += `"vod":"${row[23]}"},`;
			});
			
			json = json.replace(/,$/,'');
			json += ']}';
			
			callback(json);
		} else {
			callback('{"maps":[]}');
		}
	});
}

function getTeamStats(team, callback) {
	let json = '{"stats":{';
	getDataInRange(team + '!B17:B26', (rows) => {
		if(rows.length) {
			json += `"wins":"${rows[0][0]}",`;
			json += `"losses":"${rows[1][0]}",`;
			json += `"mapwins":"${rows[2][0]}",`;
			json += `"maplosses":"${rows[3][0]}",`;
			json += `"mapties":"${rows[4][0]}",`;
			json += `"divwins":"${rows[5][0]}",`;
			json += `"divlosses":"${rows[6][0]}",`;
			json += `"ndivwins":"${rows[7][0]}",`;
			json += `"ndivlosses":"${rows[8][0]}",`;
			json += `"mapdiff":"${rows[9][0]}"}}`;

			callback(json);
		} else {
			callback('{"stats":{"wins":"0","losses":"0","mapwins":"0","maplosses":"0","mapties":"0","divwins":"0","divlosses":"0","ndivwins":"0","ndivlosses":"0","mapdiff":"0"}}');
		}
	});
}

app.get('/GetTeams', function(req, res) {
	getTeams((teams) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(JSON.stringify(teams));
		res.end();
	});
});

app.get('/GetAllPlayersJson', function(req, res) {
	openLocalJSON(PLAYER_JSON, (obj) => {
		json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/GetStandings', function(req, res) {
	let json = '{"teams":[';
	
	getDataInRange('Standings!B15:R22', (rows) => {
		if(rows.length) {
			rows.map((row) => {
				json += '{"name":"';
				json += `${row[0]}`;
				json += '","win":"';
				json += `${row[2]}`;
				json += '","loss":"';
				json += `${row[3]}`;
				json += '","pct":"';
				json += `${row[4]}`;
				json += '","mapwin":"';
				json += `${row[5]}`;
				json += '","maploss":"';
				json += `${row[6]}`;
				json += '","maptie":"';
				json += `${row[7]}`;
				json += '","mapdiff":"';
				json += `${row[8]}`;
				json += '"},';
			});
			json = json.replace(/,$/,'');
			json += ']}';
			
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.write(json);
			res.end();
		} else {
			json += ']}';
			
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.write(json);
			res.end();
		}
	});
});

// new endpoint for team info
app.get('/api/teaminfo/:team/',function(req,res) {
	openLocalJSON(req.params.team + '.json', (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});


app.listen(process.env.PORT || 9007, () => console.log('Listening on port 9007!'));
__discord_link = "https://discord.gg/HxxNybCgM4"

// entry page
app.get('/',function(req, res) {
  res.redirect('/Draft/');
});

app.get('/Home/', function(req, res) {
	res.sendFile(__dirname + '/client/welcome.html');
});

app.get('/Standings/', function(req, res) {
	res.sendFile(__dirname + '/client/standings.html');
});

app.get('/Schedule/', function(req, res) {
	res.sendFile(__dirname + '/client/schedule.html');
});

app.get('/Stats/', function(req, res) {
	res.sendFile(__dirname + '/client/stats.html');
});

app.get('/Draft/', function(req, res) {
	res.sendFile(__dirname + '/client/draft.html');
});

// send team files
app.get('/Teams/:teamname/', function(req, res) {
	res.sendFile(__dirname + '/client/Teams/' + req.params.teamname + '.html');
});

// redirects user to discord link
app.get('/Discord/', function(req, res) {
	res.redirect(__discord_link);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/client/404.html');
});