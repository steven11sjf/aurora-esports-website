var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
var cron = require('cron');
var favicon = require('serve-favicon');
app.use(bodyparser());
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom submodules
const googleAuth = require('./auth'); // gets authorization for google sheets
const localfs = require('./localfs'); // handles local json read/writes
const spreadsheet = require('./sheet-json-interface'); // gets information from google sheet into /json/cached/
//const jsonData = require('./data-handler'); // handles accessing data from locally cached files.

const __report_link = 'https://docs.google.com/forms/d/e/1FAIpQLSfbxZpTM4A9Ukt-_uAJqL4qUw2VlaPKgb2oiAf-xW68yKiTww/viewform?usp=sf_link';
const SPREADSHEET_ID = '1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM';
const PLAYER_JSON = 'players.json';
const MATCHLOG_JSON = 'matchlog.json';
const HEROSTATS_JSON = 'herostats.json';
const STANDINGS_JSON = 'standings.json';
const BLOG_JSON = 'blog.json';
const LINKS_JSON = 'dictionary.json';

var QUOTA_USE = 0;
var MAX_QUOTA_PER_MIN = 60;
var CURRENT_WEEK = 5;
var PAGE_HITS = 0;

var league_standings;

// generates a dictionary of (word,link) pairs
// contains team names and player page links.
function generateLinkDict() {
	var dict = [
		{
			word: "Djibouti Shorts",
			link: "/Teams/DjiboutiShorts/"
		},
		{
			word: "London Lumberjack Slams",
			link: "/Teams/LondonLumberjackSlams/"
		},
		{
			word: "Oceania Otters",
			link: "/Teams/OceaniaOtters/"
		},
		{
			word: "Plymouth PMAs",
			link: "/Teams/PlymouthPMAs/"
		},
		{
			word: "The Tenochitlan Tacos",
			link: "/Teams/TheTenochitlanTacos/"
		},
		{
			word: "Bendigo Bilbies",
			link: "/Teams/BendigoBilbies/"
		},
		{
			word: "Gaming Golems",
			link: "/Teams/GamingGolems/"
		},
		{
			word: "Rialto Rincewinds",
			link: "/Teams/RialtoRincewinds/"
		},
		{
			word: "Galapagos Gremlins",
			link: "/Teams/GalapagosGremlins/"
		},
		{
			word: "Wakanda BBQs",
			link: "/Teams/WakandaBBQs/"
		}
	];
	
	// generate player names
	localfs.openJson(PLAYER_JSON,(player_obj) => {
		let players = player_obj.players;
		for(i=0; i<players.length; ++i) {
			let w = players[i].battletag;
			let l = "/Player/" + w.replace('#','-');
			let entry = { word: w, link: l };
			dict.push(entry);
		}
		
		localfs.writeJson(LINKS_JSON, dict);
		console.log("Generated link dictionary!");
	});
}
generateLinkDict();

// schedules
const playersUpdateJob = cron.job('0/1 * * * *', () => {
	spreadsheet.refreshPlayerJson();
});
playersUpdateJob.start();

const batchUpdateJob = cron.job('30 0/1 * * * *', () => {
	spreadsheet.batchGetSpreadsheet();
});
batchUpdateJob.start();

const statisticsUpdateJob = cron.job('0/2 * * * *', () => {
	spreadsheet.doStats(PAGE_HITS);
	PAGE_HITS = 0;
});
if(process.env.ISPROD == "TRUE") statisticsUpdateJob.start();


function getDay() {
	let date_curr = new Date();
	let date_obj = new Date(date_curr.toLocaleString("en-US", { timeZone: "America/Chicago" }));
	return date_obj.getDay();
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
	localfs.writeJson('test1.json', asdf, (res) => {});
	localfs.writeJson('test2.json', fdsa, (res) => {
		var sdfg = '';
		localfs.openJson('test2.json', sdfg);
		console.log('last');
	});
}

function testRead() {
	localfs.openJson('test1.json', (obj) => {
		console.log(obj);
		var num = obj.info.sr.tank + obj.info.sr.dps + obj.info.sr.support;
		num = num / 3;
		console.log('player ' + obj.info.name + ' with SR ' + num);
	});
}

spreadsheet.batchGetSpreadsheet();

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

spreadsheet.refreshPlayerJson();

function getRoster(team, callback) {
	let json = '{"roster":[';
	spreadsheet.getDataInRange(team + '!A5:L14', (rows) => {
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
	localfs.openJson(team + '.json', (obj) => {
		json = JSON.stringify(obj);
		callback(json);
	});
}

function getMatches(team, callback) {
	let json = '{"currentround":';
	json += CURRENT_WEEK;
	json += ',"matches":[';
	spreadsheet.getDataInRange(team + '!A32:Y67', (rows) => {
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
	spreadsheet.getDataInRange(team + '!B17:B26', (rows) => {
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

app.get('/GetAllPlayersJson', function(req, res) {
	localfs.openJson(PLAYER_JSON, (obj) => {
		json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/GetStandings', function(req, res) {
	localfs.openJson(STANDINGS_JSON, (obj) => {
		json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// new endpoint for team info
app.get('/api/teaminfo/:team/',function(req,res) {
	localfs.openJson(req.params.team + '.json', (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// endpoint for full match log
app.get('/api/matchlog',function(req,res) {
	localfs.openJson(MATCHLOG_JSON, (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// endpoint for blog
app.get('/api/GetBlog/:blogid/',function(req,res) {
	localfs.openJson('blog.json', (obj) => {
		for(i=0; i<obj["blog-posts"].length; i++) {
			if(req.params.blogid == obj["blog-posts"][i]["id"])
			{
				var json = JSON.stringify(obj["blog-posts"][i]);
				console.log('found blog id ' + obj["blog-posts"][i]["id"]);
				
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.write(json);
				return res.end();
			}
		}
		
		console.log('blog id ' + req.params.blogid + ' not found!');
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write('{"date":"","title":"Post not found!","by":"","tags":[],"contents":[]}');
		res.end();
	});
});

// endpoint for player stats
app.get('/api/playerstats', function(req,res) {
	localfs.openJson(HEROSTATS_JSON, (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

app.get('/api/BlogBlurbs/',function(req,res) {
	localfs.openJson('blog.json', (obj) => {
		var json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// endpoint for player page info 
app.get('/api/playerjson/:player', function(req,res) {
	let player = req.params.player.replace('-','#');
	localfs.openJson(PLAYER_JSON, (obj) => {
		for(i=0; i<obj.players.length; ++i) {
			if(obj.players[i].battletag == player) {
				let p = obj.players[i];
				res.json(p);
				return;
			}
		}
		
		res.json('{"battletag":""}');
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
	PAGE_HITS++;
});

app.get('/Standings/', function(req, res) {
	res.sendFile(__dirname + '/client/standings.html');
	PAGE_HITS++;
});

app.get('/Schedule/', function(req, res) {
	res.sendFile(__dirname + '/client/schedule.html');
	PAGE_HITS++;
});

app.get('/Stats/', function(req, res) {
	res.sendFile(__dirname + '/client/stats.html');
	PAGE_HITS++;
});

app.get('/Draft/', function(req, res) {
	res.sendFile(__dirname + '/client/draft.html');
	PAGE_HITS++;
});

app.get('/Blog/',function(req,res) {
	res.redirect('/Home/');
	PAGE_HITS++;
});

app.get('/Blog/:blogid/',function(req,res) {
	res.sendFile(__dirname + '/client/Blog/blog_template.html');
	PAGE_HITS++;
});
app.get('/Blog/Tag/:blogid/',function(req,res) {
	res.sendFile(__dirname + '/client/Blog/blog_tag.html');
	PAGE_HITS++;
});

// send team files
app.get('/Teams/:teamname/', function(req, res) {
	res.sendFile(__dirname + '/client/Teams/' + req.params.teamname + '.html');
	PAGE_HITS++;
});

app.get('/GetLinkDict',function(req,res) {
	localfs.openJson(LINKS_JSON, (obj) => {
		res.json(obj);
	});
});

app.get('/Player/:playertag', function(req,res) {
	res.sendFile(__dirname + '/client/player-page.html');
	PAGE_HITS++;
});

// redirects user to discord link
app.get('/Discord/', function(req, res) {
	res.redirect(__discord_link);
	PAGE_HITS++;
});

app.get('/BugReport/', function(req,res) {
	res.redirect(__report_link);
	PAGE_HITS++;
});

app.get('/favicon.ico', function(req,res) {
	res.sendFile(__dirname + '/public/images/leaguelogo.png');
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/client/404.html');
});