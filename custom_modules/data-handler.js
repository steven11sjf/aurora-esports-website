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

/** 
 * generates a dictionary of (word,link) pairs
 * contains team names and player page links.
 * saved into LINKS_JSON
 */
function generateLinkDict() {
	// teams
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
	localfs.openJson(constants.PLAYER_JSON,(player_obj) => {
		let players = player_obj.players;
		for(i=0; i<players.length; ++i) {
			let w = players[i].battletag;
			let l = "/Player/" + w.replace('#','-');
			let entry = { word: w, link: l };
			dict.push(entry);
		}
		
		localfs.writeJson(constants.LINKS_JSON, dict);
		console.log("Generated link dictionary!");
	});
}

module.exports = {
	generateLinkDict,
}