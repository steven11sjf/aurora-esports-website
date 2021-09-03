// ==========
// Module containing website configuration details
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

/**
 * SEASON FORMAT:
 *
 * name          The formatted name of the season (displayed in the website)
 * internal      The internal name used for the file system (folders, etc)
 * format        The format of the season, which determines what spreadsheet template was used/read:
 *  roundrobin   A round-robin tournament, where N teams play every other team in (N-1) rounds
 *  division     A division-based tournament, where teams are placed in multiple divisions and have separate division/nondivision tracking on the standings
 *  tournaments  A tournament-based format where teams play a few rounds, then face off in a tournament to earn additional points
 *  legacy       The format used in Season 0 and 1 which does not include stats.
 * ongoing       A true value means the tournament is still running and the spreadsheet will be accessed while the site is live to pull the latest information
 *               A false value means the builder will build the cache and save it, so the site does not need to use up quota on that sheet.
 * spreadsheetId The id for the spreadsheet which allows it to access the sheets.
 */
const seasons = [
	// list of seasons
	{
		"name" : "Season 3", // formatted name for the season
		"internal" : "season3", // unformatted name used in file system (folders, file names)
		"format" : "roundrobin", // the format the regular season is run in, in this case the round robin format
		"ongoing" : true, // whether the tournament is completed (does not poll spreadsheet for updates)
		"spreadsheetId" : "1tRHl68j9kqzJzScS0v9X3KdrS2UgycY0hvteI7_56xM"
	},
	{
		"name" : "Season 2",
		"internal" : "season2",
		"format" : "division",
		"ongoing" : false,
		"spreadsheetId" : 
	}
];