// ==========
// The main web server code for the GWL website, a node express app running over http.
// This new version deprecates ./custom_modules/sheet-json-interface.js and uses the spreadsheet-types.js module
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
const sheets = require('./custom_modules/spreadsheet-types'); // Uses information from new spreadsheet module
const jsonData = require('./custom_modules/data-handler'); // handles accessing data from locally cached files.
const constants = require('./custom_modules/consts'); // global constants

var PAGE_HITS = 0; // stores page hits until next cron job

// gracefully exit
process.on('SIGTERM', () => {
	if(server) server.close(() => {
		console.log("Process terminated internally");
	});
});

// startup tasks to build cache
function startup() {
	sheets.init()
	.then((sh) => sheets.updateAll())
	.then((res) => sheets.buildDictionaries())
	.then((res2) => console.log("Started up!"))
	.catch((error) => {
		console.error("A fatal error was encountered!");
		console.error(error);
		process.kill(process.pid, 'SIGTERM'); // /tp @s ~ -128 ~
	})
	// TODO link dicts
	

	// start server
	const server = app.listen(process.env.PORT || 9007, () => console.log('Listening!'));
}
startup();


// SCHEDULES


// runs a batch update every two minutes
const batchUpdateJob = cron.job('0/2 * * * *', () => {
	sheets.updateAll()
	.then(res => console.log("Updated seasons ", res))
});
batchUpdateJob.start();

// updates the website's stats every 2 minutes
const statisticsUpdateJob = cron.job('0/2 * * * *', () => {
//	spreadsheet.doStats(PAGE_HITS);
	PAGE_HITS = 0;
});
//if(process.env.ISPROD == "TRUE") statisticsUpdateJob.start();

// sends players.json
app.get('/api/:season/GetAllPlayersJson', async function(req, res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getPlayers())
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// sends standings.json
app.get('/api/:season/GetStandings', async function(req, res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getStandings())
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// sends team.json
app.get('/api/:season/teaminfo/:team/', async function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getTeamInfo(req.params.team))
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// sends matchlog.json
app.get('/api/:season/matchlog',async function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getMatches())
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// sends teams json
app.get('/api/:season/teams',async function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => res.json(season.teams))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
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
app.get('/api/:season/playerstats', async function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getHeroStats())
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
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
app.get('/api/:season/playerjson/:player', function(req,res) {
	let player = req.params.player.replace('-','#');
	sheets.getSeason(req.params.season)
	.then(season => season.getPlayerInfo(player))
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// entry page
app.get('/',function(req, res) {
	res.redirect('/Season3/Home/');
});

app.get('/Home/', function(req,res) {
	res.redirect('/');
});

app.get('/:season/Home/', function(req, res) {
	res.sendFile(__dirname + '/client/welcome.html');
	PAGE_HITS++;
});

app.get('/:season/Standings/', function(req, res) {
	res.sendFile(__dirname + '/client/standings.html');
	PAGE_HITS++;
});

app.get('/:season/Schedule/', function(req, res) {
	res.sendFile(__dirname + '/client/schedule.html');
	PAGE_HITS++;
});

app.get('/:season/Stats/', function(req, res) {
	res.sendFile(__dirname + '/client/stats.html');
	PAGE_HITS++;
});

app.get('/:season/Draft/', function(req, res) {
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
app.get('/:season/Teams/:teamname/', function(req, res) {
	sheets.getSeason(req.params.season)
	.then(season => res.sendFile(__dirname + season.teamPageTemplatePath));
	PAGE_HITS++;
});

app.get(':season/GetLinkDict',function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => season.getLinkDict())
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

app.get('/:season/Player/:playertag', function(req,res) {
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