// ==========
// Module containing all code pulling data from the spreadsheet
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// Google form to report website issues
const __report_link = 'https://docs.google.com/forms/d/e/1FAIpQLSfbxZpTM4A9Ukt-_uAJqL4qUw2VlaPKgb2oiAf-xW68yKiTww/viewform?usp=sf_link';
// Discord server invite link
const __discord_link = "https://discord.gg/HxxNybCgM4";

// google spreadsheet id for season 3
const SPREADSHEET_ID = '1GGR4EvBzosLZf_Z0axr1PpA4ZMaPwYrw8Jr8WUXRioQ';
// path for json containing player info
const PLAYER_JSON = 'cached/players.json';
// path for json containing match info
const MATCHLOG_JSON = 'cached/matchlog.json';
// path for json containing hero stats
const HEROSTATS_JSON = 'cached/herostats.json';
// path for json containing league standings
const STANDINGS_JSON = 'cached/standings.json';
// path for json containing the blog metadata
const BLOG_JSON = 'blog.json';
// path for dictionary that links phrases (team names and player names) to pages (team pages and player pages)
const LINKS_JSON = 'cached/dictionary.json';

// the round currently being played
const CURRENT_ROUND = 5;

// node exports
module.exports = {
	__report_link,
	__discord_link,
	SPREADSHEET_ID,
	PLAYER_JSON,
	MATCHLOG_JSON,
	HEROSTATS_JSON,
	STANDINGS_JSON,
	BLOG_JSON,
	LINKS_JSON,
	CURRENT_ROUND
}