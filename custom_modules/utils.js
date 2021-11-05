// ==========
// Module containing code utilities that assist in common commands
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// searches an array of objects for a (parameter)(value) pair
// returns the index of the element, or -1 if it does not exist
// example: array "arr" of team objects, want to search for internal id "DjiboutiShorts". searchArrayForParameter(arr,"internal","DjiboutiShorts") returns the index. 
function searchArrayForParameter(arr,param,value) {
	for(i=0;i<arr.length;++i) {
		// check the "param" value at array index i
		if(arr[i][param] == value) {
			return i;
		}
	}
	
	return -1;
}

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

/*
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

/*
 * Gets a specific player from the object defined. 
 */
function getPlayerFromObj(obj, battletag) {
	return new Promise((resolve,reject) => {
		let players = obj.players;
		for(i=0;i<players.length;++i) {
			if(players[i].battletag == battletag)
				resolve(players[i]);
		}
		reject("PlayerNotFound");
	});
}

// node exports
module.exports = {
	searchArrayForParameter,
	sanitize,
	generateLinkDict,
	getPlayerFromObj,
}