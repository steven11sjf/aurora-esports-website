// tourney String
var tourneyString;
// match data
var data;

function loadTournamentMatches(d) {
	data = d;
}

function setTournamentString(str) {
	tourneyString = str.replace(/-/g,' ');
	document.getElementById('tournament-name').innerHTML = tourneyString.replace(/_/g,' ');
}

// generates a table for the given tournament bracket
function addTourneyTable(bracket,includeHeader) {
	var res = "";
	
	// create header
	if(includeHeader) {
		res += '<h2 class="round-header">';
		res += bracket;
		res += '</h2>';
	}
	
	// create table header
	res += '<table class="round-table center"><thead><tr>';
	res += '<th style="width:10%;" scope="col">Date</th>';
	res += '<th style="width:10%;" scope="col">Image</th>';
	res += '<th style="width:15%;" scope="col">Team 1</th>';
	res += '<th style="width:30%;" scope="col">Maps</th>';
	res += '<th style="width:15%;" scope="col">Team 2</th>';
	res += '<th style="width:10%;" scope="col">Image</th>';
	res += '<th style="width:10%;" scope="col">VOD</th>';
	res += '</tr></thead><tbody>';
	
	// create table contents
	var matchCount = 0;
	var matches = data.matches;
	for(var i = 0; i < matches.length; i++) {
		if(matches[i]["bracketname"] == bracket) {
			matchCount++; // increment how many rows there are
			res += '<tr id="Matchlog-';
			res += `${bracket.replace(/\s+/g,'_')}-${matches[i].matchid}`; // id tag = "<bracket w/o spaces>-<matchid>"
			res += '" onclick="window.location=\'#Bracket-';
			res += `${bracket.replace(/\s+/g,'_')}-${matches[i].matchid}`;
			res += '\';"><td><p class="match-time">';
			if(matches[i]["date"] == "TBA" || matches[i]["date"] == "") {
				res += 'TBA';
			} else {
				res += matches[i]["date"];
				res += '<br>@<br>';
				res += matches[i]["time"];
			}
			res += '</p></td><td class="schedule-team blue-team"><img class="table-img left-float" title="';
			res += matches[i]["team1"];
			res += '" src="/images/';
			res += matches[i]["team1"].replace(/\s+/g,'');
			res += '.png"></td><td class="schedule-team blue-team"><p class="schedule-team-name right-float">'
			res += matches[i]["team1"];
			res += '</p></td><td><div class="mapimgs">';
			if(matches[i]["played"] == "FALSE") {
				res += "";
			} else {
				res += '<div class="score">';
				res += getMatchScore(matches[i]);
				res += '</div>';
				res += loadMatchMaps(matches[i]);
			}
			res += '</div></td><td class="schedule-team red-team"><p class="schedule-team-name left-float">'
			res += matches[i]["team2"];
			res += '</p></td><td class="schedule-team red-team"><img class="table-img right-float" title="';
			res += matches[i]["team2"];
			res += '" src="/images/';
			res += matches[i]["team2"].replace(/\s+/g,'');
			res += '.png"></td><td>';
			if(matches[i]["vod"] == "undefined" || matches[i]["vod"] == "") {
				res += '<p class="vod-text">No VOD</p>';
			} else {
				res += '<a class="vod-link" href="' + matches[i]["vod"] + '">VOD</a>';
			}
			res += '</td></tr>';
		}
	}
	res += '</tbody></table>';
	
	// don't do anything if there were no matches (basically edge case for playins)
	if(matchCount == 0) {
		return;
	}
	
	document.getElementById("rounds-div").innerHTML += res;
}

// other functions like getMatchScore, loadMatchMaps, and getMapImage are used from schedule-page.js since they don't care if its a tournament or regular match. 
// this is so it's only one place to update to add maps etc. 