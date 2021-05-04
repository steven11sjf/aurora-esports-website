var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
app.use(bodyparser());
require('dotenv').config();
const sheetsApi = google.sheets('v4');
const googleAuth = require('./auth');

const SPREADSHEET_ID = '19K8WDxhzxXqePn_nMAZWunnIMOF7dFqP2BWapfdUN6s';

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
					return console.log(err);
				}
				var rows = response.data.values;
				callback(rows);
			});
		})
		.catch((err) => {
			console.log('auth error', err);
		});
}
	
function listTeams() {
	getDataInRange('Standings!C15:C22', (rows) => {
		rows.map((row) => {
			console.log(`${row[0]}`);
		});
	});
}

//listTeams();

app.get('/GetStandings', function(req, res) {
	let json = '{"teams":[';
	
	getDataInRange('Standings!C15:R22', (rows) => {
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

// redirects user to discord link
app.get('/Discord/', function(req, res) {
	res.redirect(__discord_link);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/client/404.html');
});