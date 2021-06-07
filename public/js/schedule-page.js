var matchJson;

function loadLog(json) {
	matchJson = json;
}

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
		if(roundString == matches[i].round) {
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
			res += matches[i]["team1"].replace(/\s+/g,'-').toLowerCase();
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
			res += matches[i]["team2"].replace(/\s+/g,'-').toLowerCase();
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
	
	document.getElementById("rounds-div").innerHTML += res;
}

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

function loadMatchMaps(row) {
	var res = '<div class="matchscore"></div>';
	var teamscore = 0;
	var oppscore = 0;
	var tiescore = 0;
	var team1 = row.team1;
	
	if(row.map1.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map1.name;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map1.name;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map1.name;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map2.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map2.name;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map2.name;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map2.name;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map3.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map3.name;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map3.name;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map3.name;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map4.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map4.name;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map4.name;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map4.name;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map5.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map5.name;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map5.name;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map5.name;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map6.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map6.name;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map6.name;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map6.name;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	if(row.map7.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map7.name;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map7.name;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map7.name;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	if(row.map8.winner == team1) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map8.name;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == row.team2) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map8.name;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == "Draw") {
		tiescore++;
		res += '<div class="mapdraw" title="';
		res += row.map8.name;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else {
		return res;	
	}
	
	return res;	
}

function getMapImage(name) {
	if(name == "Lijiang Tower")
		return "https://static.playoverwatch.com/img/pages/maps/images/lijiang-tower.jpg";
	if(name == "Busan")
		return "https://static.playoverwatch.com/img/pages/maps/images/busan.jpg";
	if(name == "Ilios")
		return "https://static.playoverwatch.com/img/pages/maps/images/ilios.jpg";
	if(name == "Nepal")
		return "https://static.playoverwatch.com/img/pages/maps/images/nepal.jpg";
	if(name == "Oasis")
		return "https://static.playoverwatch.com/img/pages/maps/images/oasis.jpg";
	
	if(name == "Dorado")
		return "https://static.playoverwatch.com/img/pages/maps/images/dorado.jpg";
	if(name == "Havana")
		return "https://static.playoverwatch.com/img/pages/maps/images/havana.jpg";
	if(name == "Route: 66")
		return "https://static.playoverwatch.com/img/pages/maps/images/route-66.jpg";
	if(name == "Junkertown")
		return "https://static.playoverwatch.com/img/pages/maps/images/junkertown.jpg";
	if(name == "Rialto")
		return "https://static.playoverwatch.com/img/pages/maps/images/rialto.jpg";
	if(name == "Watchpoint: Gibraltar")
		return "https://static.playoverwatch.com/img/pages/maps/images/watchpoint-gibraltar.jpg";
	
	if(name == "King's Row")
		return "https://static.playoverwatch.com/img/pages/maps/images/kings-row.jpg";
	if(name == "Eichenwalde")
		return "https://static.playoverwatch.com/img/pages/maps/images/eichenwalde.jpg";
	if(name == "Hollywood")
		return "https://static.playoverwatch.com/img/pages/maps/images/hollywood.jpg";
	if(name == "Numbani")
		return "https://static.playoverwatch.com/img/pages/maps/images/numbani.jpg";
	if(name == "Blizzard World")
		return "https://static.playoverwatch.com/img/pages/maps/images/blizzard-world.jpg";
	
	if(name == "Hanamura")
		return "https://static.playoverwatch.com/img/pages/maps/images/hanamura.jpg";
	if(name == "Temple of Anubis")
		return "https://static.playoverwatch.com/img/pages/maps/images/temple-of-anubis.jpg";
	if(name == "Volskaya Industries")
		return "https://static.playoverwatch.com/img/pages/maps/images/volskaya-industries.jpg";
	
	console.log("Map not found: " + name);
	return "/images/Overwatch_circle_logo.png";
}