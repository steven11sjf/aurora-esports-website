// json for matchLog
var matchJson;

// stores log in page memory
function loadLog(json) {
	matchJson = json;
}

// gets the max week by iterating through matchJson
function getMaxWeek() {
	let max = 0;
	for(var i=0; i<matchJson.matches.length; ++i) {
		let r = parseInt(matchJson.matches[i].round);
		if(!isNaN(r) && r > max && matchJson.matches[i].tournament == "Season") max = r;
	}
	return max;
}

// generates a table for the given round's matches
function addRoundTable(round) {
	var res = "";
	
	// create header
	res += '<h2 class="round-header">Round ';
	res += round.toString();
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
	var matches = matchJson.matches;
	var roundString = round.toString();
	for(var i = 0; i < matches.length; i++) {
		if(roundString == matches[i].round && matches[i]["tournament"] == "Season") {
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
			res += '" src="/images/teamicons/';
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
			res += '" src="/images/teamicons/';
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
	
	document.getElementById("rounds-div").innerHTML = res;
}

// calculates the match's score and returns it as a p.match-score block
function getMatchScore(row) {
	var team1score = 0;
	var team2score = 0;
	var ties = 0;
	
	if(row.map1.winner == row.team1) team1score++;
	else if(row.map1.winner == row.team2) team2score++;
	else if(row.map1.winner == "Draw") ties++;
	
	if(row.map2.winner == row.team1) team1score++;
	else if(row.map2.winner == row.team2) team2score++;
	else if(row.map2.winner == "Draw") ties++;
	
	if(row.map3.winner == row.team1) team1score++;
	else if(row.map3.winner == row.team2) team2score++;
	else if(row.map3.winner == "Draw") ties++;
	
	if(row.map4.winner == row.team1) team1score++;
	else if(row.map4.winner == row.team2) team2score++;
	else if(row.map4.winner == "Draw") ties++;
	
	if(row.map5.winner == row.team1) team1score++;
	else if(row.map5.winner == row.team2) team2score++;
	else if(row.map5.winner == "Draw") ties++;
	
	if(row.map6.winner == row.team1) team1score++;
	else if(row.map6.winner == row.team2) team2score++;
	else if(row.map6.winner == "Draw") ties++;
	
	if(row.map7.winner == row.team1) team1score++;
	else if(row.map7.winner == row.team2) team2score++;
	else if(row.map7.winner == "Draw") ties++;
	
	if(row.map8.winner == row.team1) team1score++;
	else if(row.map8.winner == row.team2) team2score++;
	else if(row.map8.winner == "Draw") ties++;
	
	return '<p class="match-score">' + team1score + '-' + team2score + '</p>';
}

// generates the map field
// each map is a div that shows the map image, with a blue/red/gray border, and when hovered displays map name and winning team
function loadMatchMaps(row) {
	var res = '';
	var teamscore = 0;
	var oppscore = 0;
	var tiescore = 0;
	var team1 = row.team1;
	
	if(row.map1.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map2.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map3.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map4.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map5.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map6.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	if(row.map7.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	if(row.map8.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map8.name + ' - ' + row.map8.winner;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map8.name + ' - ' + row.map8.winner;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map8.name + ' - ' + row.map8.winner;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	return res;	
}

// gets the map image url based on the map's name
function getMapImage(name) {
	if(name == "Lijiang Tower")
		return "/images/maps/Lijiang.webp";
	if(name == "Busan")
		return "/images/maps/Busan.webp";
	if(name == "Ilios")
		return "/images/maps/Ilios.webp";
	if(name == "Nepal")
		return "/images/maps/Nepal.webp";
	if(name == "Oasis")
		return "/images/maps/Oasis.webp";
	
	if(name == "Circuit Royale")
		return "/images/maps/CircuitRoyale.webp";
	if(name == "Dorado")
		return "/images/maps/Oasis.webp";
	if(name == "Havana")
		return "/images/maps/Havana.webp";
	if(name == "Route: 66")
		return "/images/maps/Route66.webp";
	if(name == "Junkertown")
		return "/images/maps/Junkertown.webp";
	if(name == "Rialto")
		return "/images/maps/Rialto.webp";
	if(name == "Watchpoint: Gibraltar")
		return "/images/maps/Gibraltar.webp";
	
	if(name == "Midtown")
		return "/images/maps/Midtown.webp";
	if(name == "Paraiso")
		return "/images/maps/Paraiso.webp";
	if(name == "King&apos;s Row")
		return "/images/maps/KingsRow.webp";
	if(name == "Eichenwalde")
		return "/images/maps/Eichenwalde.webp";
	if(name == "Hollywood")
		return "/images/maps/Hollywood.webp";
	if(name == "Numbani")
		return "/images/maps/Numbani.webp";
	if(name == "Blizzard World")
		return "/images/maps/BlizzardWorld.webp";
	
	if(name == "Hanamura")
		return "/images/maps/Hanamura.webp";
	if(name == "Temple of Anubis")
		return "/images/maps/TempleOfAnubis.webp";
	if(name == "Volskaya Industries")
		return "/images/maps/VolskayaIndustries.jpg";
	
	if(name == "Colosseo")
		return "/images/maps/Colosseo.webp";
	if(name == "Esperanca")
		return "/images/maps/Esperanca.webp";
	if(name == "New Queen Street")
		return "/images/maps/NewQueenStreet.webp";
	
	console.log("Map not found: " + name);
	return "/images/Overwatch_circle_logo.png";
}