// ==========
// The main web server code for the GWL website, a node express app running over http.
// This new version deprecates ./custom_modules/sheet-json-interface.js and uses the spreadsheet-types.js module
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin.
// ==========

// registers aliases
// makes it easier to include our other files without falling into ../../../ hell
require('module-alias/register');

// node submodules
var express = require("express");
var app = express();
var path = require('path');
var {google} = require('googleapis');
var cron = require('cron');
var favicon = require('serve-favicon');
require('dotenv').config();
const sheetsApi = google.sheets('v4');

// custom submodules
const googleAuth = require('@mymodules/auth'); // gets authorization for google sheets
const localfs = require('@mymodules/localfs'); // handles local json read/writes
const sheets = require('@mymodules/spreadsheet-types'); // Uses information from new spreadsheet module
const constants = require('@mymodules/consts'); // global constants

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
	.then((res2) => {
		console.log("\n===\nStarted up!")
		const server = app.listen(process.env.PORT || 9007, () => console.log('Listening!'));
	})
	.catch((error) => {
		console.error("A fatal error was encountered!");
		console.error(error);
		process.kill(process.pid, 'SIGTERM'); // /tp @s ~ -128 ~
	})}
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
	.then(json => {
		res.json(json)
	})
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

// sends tournament.json
app.get('/api/:season/tournament/:tourn/', async function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => {
		return new Promise((resolve,reject) => {
			if(season.meta.hasTournaments) {
				resolve(season.getTournamentInfo(req.params.tourn))
			} else {
				reject("NoTournFormat")
			}
		});
	})
	.then(json => res.json(json))
	.catch(err => {
		console.log(err);
		res.json ( {error: err} );
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
	.then(season => {
		return res.json(season.teams)
	})
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// sends seasons json
app.get('/api/seasons',function(req,res) {
	sheets.allSeasonInfo()
	.then(result => res.json(result));
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

// sends a season's tournaments if they exist
app.get('/api/:season/tournaments', function(req,res) {
	sheets.getSeason(req.params.season)
	.then(season => {
		if(season.meta.hasTournaments) {
			res.json(season.tournaments);
		} else {
			res.json( ["NO_TOURNS"] );
		}
	})
	.catch(err => {
		console.log(err);
		res.json( {error: err} );
	});
});

// entry page
app.get('/',function(req, res) {
	sheets.allSeasonInfo()
	.then(result => {
		res.redirect(`/${result[0].internal}/Home`)
	});
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

app.get('/:season/Tournament/:tourn', function(req,res) {
	res.sendFile(__dirname + '/client/tournament.html');
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

app.get('/About/',function(req,res) {
	res.sendFile(__dirname + '/client/about.html');
	PAGE_HITS++;
});

// send team files
app.get('/:season/Teams/:teamname/', function(req, res) {
	sheets.getSeason(req.params.season)
	.then(season => res.sendFile(__dirname + season.teamPageTemplatePath));
	PAGE_HITS++;
});

app.get('/:season/GetLinkDict',function(req,res) {
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
	res.redirect(constants.__discord_link);
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
	console.log("404'd on page: " + req.url)
	res.sendFile(__dirname + '/client/404.html');
});