var playername; // player name in address bar (with hyphen instead of hashtag)
var playerInfo; // object containing player info
var statsObj; // obj containing current stats

var teamColors = {
	"Djibouti Shorts" : "#93c6e3",
	"London Lumberjack Slams" : "#e8c46b",
	"Oceania Otters" : "#d5a99e",
	"Plymouth PMAs" : "#b83f24",
	"The Tenochitlan Tacos" : "#ecd23f",
	"Bendigo Bilbies" : "#e68f5a",
	"Gaming Golems" : "#5b5c5d",
	"Rialto Rincewinds" : "#e5ce7e",
	"Galapagos Gremlins" : "#37c837",
	"Wakanda BBQs" : "#d6d6d6"
};

// dictionary of accolade names and their icons
var accoladesDict = {
	"Season 1 All-Star" : "/images/playerpage/allstar.png",
	"Season 1 All-Star Captain" : "/images/playerpage/allstarcaptain.png",
	"Season 2 All-Star" : "/images/playerpage/allstar.png",
	"Season 2 All-Star Captain" : "/images/playerpage/allstarcaptain.png",
	"Season 2 3rd Team All-Pro" : "/images/playerpage/3rdteam.png",
	"Season 2 2nd Team All-Pro" : "/images/playerpage/2ndteam.png",
	"Season 2 1st Team All-Pro" : "/images/playerpage/1stteam.png",
	"Season 1 3rd Team All-Pro" : "/images/playerpage/3rdteam.png",
	"Season 1 2nd Team All-Pro" : "/images/playerpage/2ndteam.png",
	"Season 1 1st Team All-Pro" : "/images/playerpage/1stteam.png",
	"Season 1 Most Valuable Player" : "/images/playerpage/mvp.png",
	"Season 2 Most Valuable Player" : "/images/playerpage/mvp.png",
	"Season 1 Champion" : "/images/playerpage/trophy.png",
	"Season 2 Champion" : "/images/playerpage/trophy.png"
};

playername = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);

// gets the stats json
function getGameStats() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/playerstats/', true);
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			statsObj = JSON.parse(xhttp.responseText);
			loadTables();
		} else {
			if(xhttp.status != 200) {
				alert('Error loading stats! HTTP status code ' + xhttp.status);
			}
		}
	}
}

function doAjax() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/playerjson/' + playername, true);
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			playerInfo = JSON.parse(xhttp.responseText);
			console.log(playerInfo);
			loadData();
			getGameStats();
		} else {
			if(xhttp.status != 200) {
				alert('Error loading player info! HTTP status code ' + xhttp.status);
			}
		}
	}
}

function loadData() {
	if(playerInfo.battletag == "") {
		alert('Player not found!');
		return;
	}
	
	document.getElementById("player-name").innerHTML = playerInfo.realname;
	document.getElementById("player-tag").innerHTML = playerInfo.battletag;
	document.getElementById("pronouns").innerHTML = playerInfo.pronouns;
	document.getElementById("hometown").innerHTML = playerInfo.hometown;
	document.getElementById("major").innerHTML = playerInfo.major;
	document.getElementById("main-role").innerHTML = playerInfo.role;
	document.getElementById("favorite-hero").innerHTML = playerInfo.hero;
	
	let bioHtml = "" + playerInfo.bio.split("\n").join("<br>");
	console.log(bioHtml);
	document.getElementById("bio").innerHTML = bioHtml;
	
	loadImage();
	loadNumberAndRole();
	loadSocials();
	loadTeam();
	loadAccolades();
}

// loads the player's image
function loadImage() {
	if(playerInfo.picture == "") {
		// player does not have a picture, use hero
		if(playerInfo.hero == "") {
			// player does not have a favorite hero, no image selected
			document.getElementById("player-photo").innerHTML = '';
		} else {
			// player has a favorite hero, set image
			document.getElementById("player-photo").innerHTML = '<img src="/images/heroportraits/' + playerInfo.hero + '.png">';
		}
	} else {
		// player has a picture, use that
		document.getElementById("player-photo").innerHTML = '<img src="' + playerInfo.picture + '">';
	}
}

function loadNumberAndRole() {
	document.getElementById("player-number").textContent = playerInfo.playernumber;
	
	if(playerInfo.role == "Damage") {
		document.getElementById("role-image").src = "/images/playerpage/damage.png";
	} else if(playerInfo.role == "Tank") {
		document.getElementById("role-image").src = "/images/playerpage/tank.png";
	} else if(playerInfo.role == "Support") {
		document.getElementById("role-image").src = "/images/playerpage/support.png";
	} else {
		document.getElementById("role-image").src = "";
	}
}

// loads social media
function loadSocials() {
	let socialsDiv = document.getElementById("socials");
	if(playerInfo.twitch != "") {
		socialsDiv.innerHTML += '<a target="_blank" href="' + playerInfo.twitch + '"><img src="/images/playerpage/twitch.png"></a>';
	}
	if(playerInfo.youtube != "") {
		socialsDiv.innerHTML += '<a target="_blank" href="' + playerInfo.youtube + '"><img src="/images/playerpage/youtube.png"></a>';
	}
	if(playerInfo.twitter != "") {
		socialsDiv.innerHTML += '<a target="_blank" href="' + playerInfo.twitter + '"><img src="/images/playerpage/twitter.png"></a>';
	}
	if(playerInfo.instagram != "") {
		socialsDiv.innerHTML += '<a target="_blank" href="' + playerInfo.instagram + '"><img src="/images/playerpage/instagram.png"></a>';
	}
	if(playerInfo.reddit != "") {
		socialsDiv.innerHTML += '<a target="_blank" href="' + playerInfo.reddit + '"><img src="/images/playerpage/reddit.png"></a>';
	}
}

// loads team and color
function loadTeam() {
	// sets color
	document.getElementById("player-header").style.backgroundColor = teamColors[playerInfo.team];
	
	let imgpath = playerInfo.team.split(" ").join("-").toLowerCase();
	document.getElementById("team-icon").src = '/images/' + imgpath + '.png';
	document.getElementById("teamlink").href = '/Teams/' + playerInfo.team.split(" ").join("");
}

// loads accolades
function loadAccolades() {
	if(playerInfo.accolades == "") {
		document.getElementById("awards").innerHTML += '<p>No accolades earned... yet!</p>';
		return;
	}
	let accolades = playerInfo.accolades.split(";");
	let accoladesDiv = document.getElementById("awards");
	console.log(accolades);
	
	for(i=0; i<accolades.length; ++i) {
		let html = '<div class="award"><img src="';
		html += accoladesDict[accolades[i]];
		html += '"><p>';
		html += accolades[i];
		html += '</p></div>';
		
		accoladesDiv.innerHTML += html;
	}
}

// loads the tables
function loadTables() {
	loadHeroStats();
	loadCareerStats();
	hideUnusedElements();
}

// loads hero stats table 
function loadHeroStats() {
	let table = document.getElementById("hero-stats");
	let btag = playerInfo.battletag;
	let result = "";
	let so = statsObj.stats;

	for(i=0;i<so.length; ++i) {
		if(so[i]["player"] == btag) {
			let timeplayed = parseInt(so[i]["timeplayed"]) / 600; // time played in 10 min increments
			// hero image - hero - elims - fb - damage - deaths - healing - blocked - time played
			result += '<tr><td><img src="/images/heroportraits/';
			result += so[i]["hero"].replace(':','');
			result += '.png"></td><td>';
			result += so[i]["hero"];
			result += '</td><td title="Total elims: ';
			result += so[i]["elims"];
			result += '">';
			
			let e10 = parseInt(so[i]["elims"]) / timeplayed;
			result += e10.toFixed(2);
			result += '</td><td title="Total final blows: ';
			result += so[i]["fb"];
			result += '">';
			let fb10 = parseInt(so[i]["fb"]) / timeplayed;
			result += fb10.toFixed(2);
			result += '</td><td title="Total damage: ';
			result += so[i]["damage"];
			result += '">';
			let dmg10 = parseInt(so[i]["damage"]) / timeplayed;
			result += dmg10.toFixed(0);
			result += '</td><td title="Total deaths: ';
			result += so[i]["deaths"];
			result += '">';
			let d10 = parseInt(so[i]["deaths"]) / timeplayed;
			result += d10.toFixed(2);
			result += '</td><td title="Total healing: ';
			result += so[i]["healing"];
			result += '">';
			let h10 = parseInt(so[i]["healing"]) / timeplayed;
			result += h10.toFixed(0);
			result += '</td><td title="Total damage blocked: ';
			result += so[i]["blocked"];
			result += '">';
			let db10 = parseInt(so[i]["blocked"]) / timeplayed;
			result += db10.toFixed(0);
			result += '</td><td>';
			let tp = timeplayed * 10;
			result += tp.toFixed(2) + ' mins</td></tr>';
		}
	}
	
	table.innerHTML = result;
}

function loadCareerStats() {
	let table = document.getElementById("career-stats");
	let btag = playerInfo.battletag;
	let so = statsObj.stats;
	
	let timeplayed = 0;
	let elims = 0;
	let fb = 0;
	let dmg = 0;
	let deaths = 0;
	let healing = 0;
	let blocked = 0;
	
	console.log(btag);
	for(i=0; i<so.length; ++i) {
		if(so[i]["player"] == btag) {
			timeplayed += parseFloat(so[i]["timeplayed"]);
			elims += parseInt(so[i]["elims"]);
			fb += parseInt(so[i]["fb"]);
			dmg += parseInt(so[i]["damage"]);
			deaths += parseInt(so[i]["deaths"]);
			healing += parseInt(so[i]["healing"]);
			blocked += parseInt(so[i]["blocked"]);
		}
	}
	
	document.getElementById("career-elims").innerHTML = `<td>Eliminations</td><td>${elims}</td><td>${(elims*600/timeplayed).toFixed(2)}</td><td>${statsObj.averages.elims}</td><td>${statsObj.averages.elims10}</td>`;
	document.getElementById("career-fbs").innerHTML = `<td>Final Blows</td><td>${fb}</td><td>${(fb*600/timeplayed).toFixed(2)}</td><td>${statsObj.averages.fb}</td><td>${statsObj.averages.fb10}</td>`;
	document.getElementById("career-dmg").innerHTML = `<td>Damage Dealt</td><td>${dmg}</td><td>${(dmg*600/timeplayed).toFixed(0)}</td><td>${statsObj.averages.dmg}</td><td>${statsObj.averages.dmg10}</td>`;
	document.getElementById("career-deaths").innerHTML = `<td>Deaths</td><td>${deaths}</td><td>${(deaths*600/timeplayed).toFixed(2)}</td><td>${statsObj.averages.deaths}</td><td>${statsObj.averages.deaths10}</td>`;
	document.getElementById("career-heals").innerHTML = `<td>Healing Done</td><td>${healing}</td><td>${(healing*600/timeplayed).toFixed(0)}</td><td>${statsObj.averages.healing}</td><td>${statsObj.averages.healing10}</td>`;
	document.getElementById("career-blocked").innerHTML = `<td>Damage Blocked</td><td>${blocked}</td><td>${(blocked*600/timeplayed).toFixed(0)}</td><td>${statsObj.averages.blocked}</td><td>${statsObj.averages.blocked10}</td>`;
}

// removes elements when they are not set (for example, hometown/major images and player number)
function hideUnusedElements() {
	if(playerInfo.playernumber == "") {
		document.getElementById("player-number").setAttribute('style','display:none;');
	}
	if(playerInfo.role == "") {
		document.getElementById("role-image").setAttribute('style','display:none;');
	}
	if(playerInfo.hometown == "") {
		document.getElementById("hometown-img").setAttribute('style','display:none;');
	}
	if(playerInfo.major == "") {
		document.getElementById("major-img").setAttribute('style','display:none;');
	}
}