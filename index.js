// ==========
// The main web server code for the GWL website, a node express app running over http.
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// node submodules
var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var path = require('path');
var {google} = require('googleapis');
var cron = require('cron');
var favicon = require('serve-favicon');
app.use(bodyparser());
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom submodules
const googleAuth = require('./custom_modules/auth'); // gets authorization for google sheets
const localfs = require('./custom_modules/localfs'); // handles local json read/writes
const spreadsheet = require('./custom_modules/sheet-json-interface'); // gets information from google sheet into /json/cached/
const jsonData = require('./custom_modules/data-handler'); // handles accessing data from locally cached files.
const constants = require('./custom_modules/consts'); // global constants

var PAGE_HITS = 0; // stores page hits until next cron job

// startup tasks to build cache
function startup() {
	spreadsheet.batchGetSpreadsheet();
	spreadsheet.refreshPlayerJson();
	jsonData.generateLinkDict();

	// start server
	app.listen(process.env.PORT || 9007, () => console.log('Listening!'));
}
startup();


// SCHEDULES

// updates player json every minute
const playersUpdateJob = cron.job('0/1 * * * *', () => {
	spreadsheet.refreshPlayerJson();
});
playersUpdateJob.start();

// runs a batch update every minute at 30 seconds
const batchUpdateJob = cron.job('30 0/1 * * * *', () => {
	spreadsheet.batchGetSpreadsheet();
});
batchUpdateJob.start();

// updates the website's stats every 2 minutes
const statisticsUpdateJob = cron.job('0/2 * * * *', () => {
	spreadsheet.doStats(PAGE_HITS);
	PAGE_HITS = 0;
});
if(process.env.ISPROD == "TRUE") statisticsUpdateJob.start();

// sends players.json
app.get('/GetAllPlayersJson', function(req, res) {
	localfs.openJson(constants.PLAYER_JSON, (obj) => {
		json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends standings.json
app.get('/GetStandings', function(req, res) {
	localfs.openJson(constants.STANDINGS_JSON, (obj) => {
		json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends team.json
app.get('/api/teaminfo/:team/',function(req,res) {
	localfs.openJson('cached/' + req.params.team + '.json', (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends matchlog.json
app.get('/api/matchlog',function(req,res) {
	localfs.openJson(constants.MATCHLOG_JSON, (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends article with given id in blog.json
app.get('/api/GetBlog/:blogid/',function(req,res) {
	localfs.openJson(constants.BLOG_JSON, (obj) => {
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

// sends herostats.json
app.get('/api/playerstats', function(req,res) {
	localfs.openJson(constants.HEROSTATS_JSON, (obj) => {
		var json = JSON.stringify(obj);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends blog.json
app.get('/api/BlogBlurbs/',function(req,res) {
	localfs.openJson(constants.BLOG_JSON, (obj) => {
		var json = JSON.stringify(obj);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.write(json);
		res.end();
	});
});

// sends a player's info with given battletag in players.json
app.get('/api/playerjson/:player', function(req,res) {
	let player = req.params.player.replace('-','#');
	localfs.openJson(constants.PLAYER_JSON, (obj) => {
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
	localfs.openJson(constants.LINKS_JSON, (obj) => {
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
	res.redirect(constants.__report_link);
	PAGE_HITS++;
});

app.get('/favicon.ico', function(req,res) {
	res.sendFile(__dirname + '/public/images/leaguelogo.png');
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/client/404.html');
});