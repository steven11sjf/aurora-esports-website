// ==========
// Module containing data handling between the server and the cached json data
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// custom modules
const localfs = require('./localfs');
const constants = require('./consts');
const spreadsheets = require('./spreadsheet-types.js');

/** 
 * generates a dictionary of (word,link) pairs
 * contains team names and player page links.
 * saved into LINKS_JSON
 */
function generateLinkDict(season) {
	return new Promise((resolve,reject) => {	
		// get players
		console.log(`datahandler has ${season}`);
		season.getPlayers()
		.then(playersJson => {
			let dict = [];
			let players = playersJson.players;
			
			for(i=0;i<season.teams.length;++i) {
				if(!season.teams[i].name || !season.teams[i].internal) reject(`Error linking team: sheet name "${season.name}", teams index ${j}`);
				
				let w = season.teams[i].name;
				let l = "/" + season.internal + "/Teams/" + season.teams[i].internal;
				let entry = { word: w, link: l };
				dict.push(entry);
			}
			
			for(j=0;j<players.length;++j) {
				if(!players[j].battletag) reject(`Error linking player: sheet name "${season.name}, teams index ${j}`);
				
				let w = players[j].battletag;
				let l = `/${sheets[i].internal}/Player/${w.replace('#','-')}`;
				let entry = { word: w, link: l };
				dict.push(entry);
			}
			
			resolve(dict);
		})
		.catch(err => reject(err));
	});
}

function getPlayerFromJson(json, battletag) {
	return new Promise((resolve,reject) => {
		let players = json.players;
		for(i=0;i<players.length;++i) {
			if(players[i].battletag == battletag)
				resolve(players[i]);
		}
		reject("PlayerNotFound");
	});
}

module.exports = {
	generateLinkDict,
	getPlayerFromJson
}