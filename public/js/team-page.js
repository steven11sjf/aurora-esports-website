var jsonReceived;

function doTeamAjax(team) {
	console.log("getting data for team " + team);
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/teaminfo/' + team, true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			jsonReceived = JSON.parse(xhttp.responseText);
			loadRosterTable(jsonReceived);
			loadMapTable(jsonReceived);
			loadMatchTable(jsonReceived);
			loadTeamStats(jsonReceived);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doTeamRosterAjax(team) {
	console.log("getting roster for team " + team);
	// create AJAX request for standingsTable
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/roster/' + team, true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			var jsonObj = JSON.parse(xhttp.responseText);
			loadRosterTable(jsonObj);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doMatchHistoryAjax(team) {
	// create AJAX request for standingsTable
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/matches/' + team, true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			var jsonObj = JSON.parse(xhttp.responseText);
			loadMatchTable(jsonObj);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doMapStatsAjax(team) {
	// create AJAX request for standingsTable
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/mapstats/' + team, true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			var jsonObj = JSON.parse(xhttp.responseText);
			loadMapTable(jsonObj);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doTeamStatsAjax(team) {
	// create AJAX request for standingsTable
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/teamstats/' + team, true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			var jsonObj = JSON.parse(xhttp.responseText);
			loadTeamStats(jsonObj);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}
		
// loads table into HTML
function loadRosterTable(jsonObj) {
	console.log(jsonObj);
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
		out += '<tr><td><p>';
		out += table[i]["tournament"];
		out += "</p></td><td><p>";
		out += table[i]["opponent"];
		out += "</p></td><td><p>";
		out += table[i]["date"];
		out += "<br>@<br>";
		out += table[i]["time"];
		out += "</p></td><td><p>";
		out += "Still in development";
		out += "</p></td><td><p>";
		out += table[i]["vod"];
		out += "</p></td></tr>";
	}

	document.getElementById("matchTable").getElementsByTagName("tbody")[0].innerHTML = out;
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
	console.log(jsonObj.stats);
	document.getElementById("team-page-league-matches").innerHTML = '(' + jsonObj.stats.wins + '-' + jsonObj.stats.losses + ')';
	document.getElementById("team-page-league-maps").innerHTML = '(' + jsonObj.stats.mapwins + '-' + jsonObj.stats.maplosses + '-' + jsonObj.stats.mapties + ')';
	document.getElementById("team-page-div-matches").innerHTML = '(' + jsonObj.stats.divwins + '-' + jsonObj.stats.divlosses + ')';
}

console.log("Loaded!");