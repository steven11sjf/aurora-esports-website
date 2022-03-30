// ==========
// Module run on ./build.js that combines all gopherwatch player profiles into one dataset and caches into the main site sheet
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2022 Steven Franklin. 
// ==========

// local filesystem io
const localfs = require("@mymodules/localfs");
const sheet = require("@mymodules/spreadsheet-types").websiteSheet;

// filename to save player_info to
const FILE_PATH = "./data/player_info.json";

// local var storing player info
var player_info = [];
// another local var storing a list of battletags, used to search for added players faster
var player_info_btags = [];

// load a spreadsheet's players into player_info using its player json file
// this overwrites existing information, with the exception of teams and accolades, which it will prepend the latest info.
function storeNewPlayerInfo(playersObj) {
	// extract season from Object
	var season = playersObj.season;
	// iterate through all its players
	for (const p of playersObj.players) {
		// try to get the index of the tag
		const idx = player_info_btags.indexOf(p.battletag);
		
		// if it doesn't exist, copy the player over as a new player
		if(idx < 0) {
			let pl = newPlayer(p, season);
			
			// push element to arrays
			player_info.push(pl);
			player_info_btags.push(pl.battletag);
		}
		
		// if it does exist, overwrite the existing entry, but append to teams and accolades
		else {
			// update player
			let pl = updatePlayer(p, idx, season);
			
			// put clone in player_info and overwrite idx
			player_info[idx] = pl;
		}
	}
}

// create a new player entry
function newPlayer(storedPlayer, season) {
	let playerObj = {};
	
	// copy team to teams element
	playerObj.teams = storedPlayer.team;
	
	// copy all other fields
	var fieldsToCopy = ["battletag", "mvp", "accolades", "tank", "dps", "support", "realname", "playernumber", "pronouns", "hometown", "major", "twitch", "twitter", "youtube", "instagram", "reddit", "role", "hero", "picture", "bio"];
	for(const field of fieldsToCopy) {
		playerObj[field] = storedPlayer[field];
	}
	
	// add season that roles were updated
	playerObj.tankLastUpdated = season;
	playerObj.dpsLastUpdated = season;
	playerObj.supportLastUpdated = season;
	
	console.log(playerObj);
	return playerObj;
}

// update a player with a new entry
// checks for empty information
function updatePlayer(newPlayerEntry, idx, season) {
	// new player Object
	let playerObj = {};
	
	// add "easy" one-line data fields
	playerObj.battletag = newPlayerEntry.battletag;
	playerObj.teams = newPlayerEntry.team + "\n" + player_info[idx].teams;
	playerObj.mvp = (parseInt(newPlayerEntry.mvp) + parseInt(newPlayerEntry.mvp)).toString()
	
	// add SRs to player object
	var srFields = ["tank", "dps", "support"];
	for(const field of srFields) {
		updateField(playerObj, newPlayerEntry, player_info[idx], field, "-", season);
	}
	
	// list of fields to update if changes (not equal to "")
	var updateFields = ["realname", "playernumber", "pronouns", "hometown", "major", "twitch", "twitter", "youtube", "instagram", "reddit", "role", "hero", "picture", "bio"];
	
	// update said fields
	for(const field of updateFields) {
		updateField(playerObj, newPlayerEntry, player_info[idx], field);
	}
	
	return playerObj;
}

// helper function to update a field if it is changed
// newObj: the object that is being constructed
// newEntry		the new player object being entered
// oldEntry		the old player object that was entered
// field		the field being updated
// emptyString	the empty string if it exists
// the season to display when it was last updated
function updateField(newObj, newEntry, oldEntry, field, emptyString = "", season = null) {
	// update field
	newObj[field] = newEntry[field] != emptyString ? newEntry[field] : oldEntry[field]
	if(season) {
		newObj[field + "LastUpdated"] = newEntry[field] != emptyString ? season : oldEntry[field + "LastUpdated"];
	}
}

// private func to sort array by battletag
function sortList() {
	player_info.sort((a,b) => (a.battletag > b.battletag) ? 1 : -1);
}

// write to spreadsheet
function writePlayerInfoToSpreadsheet(inSheet = null) {
	// sort list of players
	sortList();
	
	// set spreadsheet to either inSheet or the default sheet.
	spreadsheet = (inSheet == null) ? sheet : inSheet;
	
	// open website sheet and send a Update request
	spreadsheet.storePlayerInfo(player_info)
	.catch(err => {
		console.error(`Error storing sheet info!\nRejection reason: ${err}`);
		console.trace();
	});
}

// save all players into FILE_PATH
function savePlayerInfo() {
	localfs.writeJsonPromise(FILE_PATH, player_info)
}

// load all players from FILE_PATH
function loadPlayerInfo() {
	localfs.openJson(FILE_PATH, (res) => { return res; });
}

module.exports = {
	storeNewPlayerInfo,
	writePlayerInfoToSpreadsheet,
	savePlayerInfo,
	loadPlayerInfo
}