var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
app.use(bodyparser());

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// tokens.json stores the user's access tokens, and is created automatically on first authorization
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listTeams);
});

/**
 * Create an OAuth2 client with given credential and execute callback function
 */
 function authorize(credentials, callback) {
	 const {client_secret, client_id, redirect_uris} = credentials.web;
	 const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0]);
	
	fs.readFile(TOKEN_PATH, (err, token) => {
		if(err) return getNewToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
 }
 
 /**
  * get and store new token after prompting for user authorization, and execute callback
  */
function getNewToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log("Authorize this app by visiting this url: ", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if(err) return console.error('Error while trying to retrieve access token', err);
			oAuth2Client.setCredentials(token);
			// store token to disk
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if(err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

function listTeams(auth) {
	const sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.get({
		spreadsheetId: '19K8WDxhzxXqePn_nMAZWunnIMOF7dFqP2BWapfdUN6s',
		range: 'Standings!C15:C22',
	}, (err, res) => {
		if(err) return console.log('The API returned an error: ' + err);
		const rows = res.data.values;
		if(rows.length) {
			console.log('Team');
			rows.map((row) => {
				console.log(`${row[0]}`);
			});
		} else {
			console.log('No data found.');
		}
	});
}

app.get('/GetStandings', function(req, res) {
	let json = '{"teams":[';
	
	fs.readFile('credentials.json', (err, content) => {
		if (err) return console.log('Error loading client secret file:', err);
		// Authorize a client with credentials, then call the Google Sheets API.
		authorize(JSON.parse(content), (auth) => {
			const sheets = google.sheets({version: 'v4', auth});
			sheets.spreadsheets.values.get({
				spreadsheetId: '19K8WDxhzxXqePn_nMAZWunnIMOF7dFqP2BWapfdUN6s',
				range: 'Standings!C15:R22',
			}, (err, result) => {
				if(err) return console.log('the API returned an error: ' + err);
				const rows = result.data.values;
				if(rows.length) {
					console.log('Team, W, L, STRK:');
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