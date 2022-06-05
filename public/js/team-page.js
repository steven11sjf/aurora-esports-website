var jsonReceived;
var fullName;
var season;
var team;

function doTeamAjax() {
	
	console.log("getting data for team " + team);
	ajaxReq(`/api/${season}/teaminfo/${team}`)
	.then(res => {
		jsonReceived = JSON.parse(res.responseText);
		if(jsonReceived.error) {
			console.log("Server failed to retrieve team info!");
			return
		}
		fullName = jsonReceived.name;
		loadRosterTable(jsonReceived);
		loadTeamInfo(jsonReceived);
		loadMapTable(jsonReceived);
		loadMatchTable(jsonReceived);
		loadTeamStats(jsonReceived);
	})
	.catch(res => {
		console.error("AJAX Request Failed! " + this.status, res);
	});
}
		
// loads table into HTML
function loadRosterTable(jsonObj) {
	var out = "";
	var table = jsonObj.roster;
	for(i = 0; i < table.length; i++) {
		out += '<tr><td><p>';
		out += table[i]["name"];
		out += "</p></td><td><p>";
		if(table[i]["draft"] == "0")
			out += 'C';
		else
			out += table[i]["draft"];
		out += "</p></td><td><p>";
		out += table[i]["tank"];
		out += "</p></td><td><p>";
		out += table[i]["damage"];
		out += "</p></td><td><p>";
		out += table[i]["support"];
		out += "</p></td></tr>";
	}

	document.getElementById("rosterTable").getElementsByTagName("tbody")[0].innerHTML = out;
}

// loads table into HTML
function loadMatchTable(jsonObj) {
	var out = "";
	var table = jsonObj.matches;
	for(i = 0; i < table.length; i++) {
		if(table[i]["winner"] == fullName) {
			out += '<tr class="match-win"><td><p>';
		} else if(table[i]["played"] == "FALSE") {
			out += '<tr class="match-unplayed"><td><p>';
		} else {
			out += '<tr class="match-loss"><td><p>';
		}
		out += table[i]["tournament"];
		out += "</p></td><td><p>";
		out += table[i]["opponent"];
		out += "</p></td><td><p>";
		if(table[i]["date"] == "" || table[i]["date"] == "TBA" || table[i]["date"] == "undefined")
			out += "TBA";
		else {
			out += table[i]["date"];
			out += "<br>@<br>";
			out += table[i]["time"];
		}
		out += '</p></td><td><div class="mapimgs">';
		if(table[i]["played"] == "FALSE") {
			out += "";
		} else {
			out += loadMatchMaps(table[i]);
		}
		out += '</div></td><td><button onclick="window.open(\'';
		if(table[i]["vod"] == "undefined" || table[i]["vod"] == "") {
			out += '#\',\'_blank\');" class="btn-unplayed" disabled="true">VOD</button>';
		} else {
			out += table[i]["vod"];
			out += '\',\'_blank\');" class="btn-vod">VOD</button>';
		}
		out += "</td></tr>";
	}

	document.getElementById("matchTable").getElementsByTagName("tbody")[0].innerHTML = out;
}

function loadMatchMaps(row) {
	var res = "";
	var teamscore = 0;
	var oppscore = 0;
	
	console.log(row);
	console.log(fullName);
	
	if(row.map1.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else if(row.map1.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map1.name + ' - ' + row.map1.winner;
		res += '"><img src="';
		res += getMapImage(row.map1.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map2.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else if(row.map2.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map2.name + ' - ' + row.map2.winner;
		res += '"><img src="';
		res += getMapImage(row.map2.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map3.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else if(row.map3.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map3.name + ' - ' + row.map3.winner;
		res += '"><img src="';
		res += getMapImage(row.map3.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map4.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else if(row.map4.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map4.name + ' - ' + row.map4.winner;
		res += '"><img src="';
		res += getMapImage(row.map4.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map5.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else if(row.map5.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map5.name + ' - ' + row.map5.winner;
		res += '"><img src="';
		res += getMapImage(row.map5.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map6.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else if(row.map6.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map6.name + ' - ' + row.map6.winner;
		res += '"><img src="';
		res += getMapImage(row.map6.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map7.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else if(row.map7.winner == "Draw") {
		res += '<div class="mapdraw" title="';
		res += row.map7.name + ' - ' + row.map7.winner;
		res += '"><img src="';
		res += getMapImage(row.map7.name);
		res += '"></div>';
	} else {
		return res;
	}
	
	if(row.map8.winner == fullName) {
		teamscore++;
		res += '<div class="mapwin" title="';
		res += row.map8.name + ' - ' + row.map8.winner;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == row.opponent) {
		oppscore++;
		res += '<div class="maploss" title="';
		res += row.map8.name + ' - ' + row.map8.winner;
		res += '"><img src="';
		res += getMapImage(row.map8.name);
		res += '"></div>';
	} else if(row.map8.winner == "Draw") {
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
	
	if(name == "King&apos;s Row")
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


// loads table into HTML
function loadMapTable(jsonObj) {
	var out = "";
	var table = jsonObj.maps;
	for(i = 0; i < table.length; i++) {
		out += '<tr><td><p>';
		out += table[i]["mapname"];
		out += "</p></td><td><p>";
		out += table[i]["wins"];
		out += "</p></td><td><p>";
		out += table[i]["losses"];
		out += "</p></td><td><p>";
		out += table[i]["draws"];
		out += "</p></td><td><p>";
		out += table[i]["winrate"];
		out += "</p></td></tr>";
	}

	document.getElementById("mapTable").getElementsByTagName("tbody")[0].innerHTML = out;
}

function loadTeamStats(jsonObj) {
	console.info(jsonObj.stats);
	document.getElementById("team-page-league-matches").innerHTML = jsonObj.stats.Season.wins + 'W - ' + jsonObj.stats.Season.losses + 'L';
	document.getElementById("team-page-league-maps").innerHTML = '(' + jsonObj.stats.Season.mapwins + 'W - ' + jsonObj.stats.Season.maplosses + 'L - ' + jsonObj.stats.Season.mapties + 'T)';
	document.getElementById("team-page-league-rank").innerHTML = 'League: ' + jsonObj.stats.All.rank;
}

function loadTeamInfo(jsonObj) {
	// set icon
	$('#team-page-icon').attr('src','/images/'+team.replace(/\s+/g,'')+'.png');
	// set team name
	$('#team-page-name').text(jsonObj.name);
	// if division exists, set division
	if($('#team-page-div').length > 0) {
		$('#team-page-div').text(jsonObj.division);
	}
	// set team color
	$('body').attr('style','background-color:'+jsonObj.color1+';');
	// set secondary color
	$('.secondary-color').css("color", jsonObj.color2);
}

document.addEventListener("DOMContentLoaded", function() {
	season = window.location.pathname.split('/')[1];
	team = window.location.pathname.split('/')[3];
	
	doTeamAjax();
});