// tourney String
var tourneyString;

function setTournamentString(str) {
	tourneyString = str.replace(/-/g,' ');
	document.getElementById('tournament-name').innerHTML = tourneyString;
}
// gets the max week by iterating through matchJson
function getTourneyDepth() {
	let max = 0;
	for(var i=0; i<matchJson.matches.length; ++i) {
		let r = parseInt(matchJson.matches[i].round);
		if(!isNaN(r) && r > max && matchJson.matches[i].tournament == tourneyString) max = r;
	}
	return max;
}

// generates a table for the given tournament depth (finals, semis, quarters, wildcard)
function addTourneyTable(depth) {
	var res = "";
	
	// create header
	res += '<h2 class="round-header">';
	// title from depth
	if(depth<0) res += 'Contact your local dev because tournament depth is negative'; // obligatory 'oops'
	if(depth==0) res += 'Play-ins'; // 0 is a special case for stuff like 10 teams in playoffs. Play-ins go here. 
	if(depth==1) res += 'Finals';
	if(depth==2) res += 'Semifinals';
	if(depth==3) res += 'Quarterfinals';
	if(depth>3) res += 'Round of ' + Math.pow(2,depth); // catch-all in case yall have some wild fkin tournaments with 16+ teams. probably won't happen but hey, its one line of code for future proofing
	res += '</h2>';
	
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
	var matches = matchJson.matches;
	var roundString = depth.toString();
	for(var i = 0; i < matches.length; i++) {
		if(roundString == matches[i].round && matches[i]["tournament"] == tourneyString) {
			matchCount++; // increment how many rows there are
			res += '<tr><td><p class="match-time">';
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