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

var QUOTA_USE = 0;
var MAX_QUOTA_PER_MIN = 300;
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
const playersUpdateJob = cron.job('0/5 * * * *', () => {
	console.log('time is ' + getTime(0));
	refreshPlayerJson();
});
playersUpdateJob.start();
	

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

function refreshPlayerJson() {
	let json = '{"updated":"';
	json += getTime(0);
	json += '","nextUpdate":"';
	json += getTime(5);
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
	let json = '{"maps":[';
	getDataInRange(team + '!F70:J88', (rows) => {
		if(rows.length) {
			rows.map((row) => {
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
			json += ']}';
			
			callback(json);
		} else {
			callback('{"maps":[]}');
		}
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

app.get('/api/mapstats/:team/',function(req,res) {
	getMapStats(req.params.team, (json) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/api/roster/:team/',function(req,res) {
	getRoster(req.params.team, (json) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/api/matches/:team/',function(req,res) {
	getMatches(req.params.team, (json) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/api/teamstats/:team/',function(req,res) {
	getTeamStats(req.params.team, (json) => {
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
  res.redirect('/Home/');
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