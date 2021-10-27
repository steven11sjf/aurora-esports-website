var seasonname; // season name in address bar
var playername; // player name in address bar (with hyphen instead of hashtag)
var playerInfo; // object containing player info
var statsObj; // obj containing current stats
var teamsObj; // obj containing teams
var team; // teamsObj element for player team

// dictionary of accolade names and their icons
var accoladesDict = {
	"Season 1 All-Star" : "/images/playerpage/allstar.png",
	"Season 1 All-Star Captain" : "/images/playerpage/allstarcaptain.png",
	"Season 2 All-Star" : "/images/playerpage/allstar.png",
	"Season 2 All-Star Captain" : "/images/playerpage/allstarcaptain.png",
	"Season 3 All-Star" : "/images/playerpage/allstar.png",
	"Season 3 All-Star Captain" : "/images/playerpage/allstarcaptain.png",
	"Season 2 3rd Team All-Pro" : "/images/playerpage/3rdteam.png",
	"Season 2 2nd Team All-Pro" : "/images/playerpage/2ndteam.png",
	"Season 2 1st Team All-Pro" : "/images/playerpage/1stteam.png",
	"Season 1 3rd Team All-Pro" : "/images/playerpage/3rdteam.png",
	"Season 1 2nd Team All-Pro" : "/images/playerpage/2ndteam.png",
	"Season 1 1st Team All-Pro" : "/images/playerpage/1stteam.png",
	"Season 3 3rd Team All-Pro" : "/images/playerpage/3rdteam.png",
	"Season 3 2nd Team All-Pro" : "/images/playerpage/2ndteam.png",
	"Season 3 1st Team All-Pro" : "/images/playerpage/1stteam.png",
	"Season 1 Most Valuable Player" : "/images/playerpage/mvp.png",
	"Season 2 Most Valuable Player" : "/images/playerpage/mvp.png",
	"Season 1 Champion" : "/images/playerpage/trophy.png",
	"Season 2 Champion" : "/images/playerpage/trophy.png",
	"Season 3 Champion" : "/images/playerpage/trophy.png",
	"Administrator" : "/images/playerpage/admin.png",
	"Staff" : "/images/playerpage/staff.png",
	"Graphic Design" : "/images/playerpage/gdes.png",
	"Caster" : "/images/playerpage/headset.png",
	"Producer" : "/images/playerpage/camera.png",
	"Captain" : "/images/playerpage/captain.png",
	"Season 1 Commissioners Award" : "/images/playerpage/commissioneraward.png",
	"Season 2 Commissioners Award" : "/images/playerpage/commissioneraward.png"
};

function doAjax() {
	// run ajax requests on all promises
	let promiseArr = [];
	promiseArr.push(ajaxReq('/api/'+seasonname+'/playerjson/'+playername));
	promiseArr.push(ajaxReq('/api/'+seasonname+'/playerstats'));
	promiseArr.push(ajaxReq('/api/'+seasonname+'/teams'));
	
	Promise.all(promiseArr)
	.then(res => {
		playerInfo = JSON.parse(res[0].responseText);
		statsObj = JSON.parse(res[1].responseText);
		teamsObj = JSON.parse(res[2].responseText);
		if(playerInfo.error) Promise.reject("Server returned an error on player info!");
		if(statsObj.error) Promise.reject("Server returned an error on stats object!");
		if(teamsObj.error) Promise.reject("Server returned an error on teams object!");
		
		loadData();
	})
	.catch(err => {
		console.error(err);
	});
}

function loadData() {
	if(playerInfo.battletag == "") {
		alert('Player not found!');
		return;
	}
	
	// get player's team.
	for(i=0;i<teamsObj.length;++i) {
		if(teamsObj[i].name == playerInfo.team) team = teamsObj[i];
	}
	if(!team) {
		alert('Player has invalid team!');
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
	document.getElementById("bio").innerHTML = bioHtml;
	
	// since this relies on loading the stats, it's called after getGameStats receives the ajax response
	loadImage();
	loadNumberAndRole();
	loadSocials();
	loadTeam();
	loadAccolades();
	loadSRs();
	loadTables();
}

// loads the player's number and their main role, if they exist
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
	document.getElementById("player-header").style.backgroundColor = team.primaryColor;
	
	let imgpath = playerInfo.team.replace(/\s+/g,'');
	document.getElementById("team-icon").src = '/images/' + team.internal + '.png';
	document.getElementById("teamlink").href = '/' + seasonname + '/Teams/' + team.internal;
}

// loads the player's image
function loadImage() {
	if(playerInfo.picture == "") {
		// player does not have a picture, use hero
		if(playerInfo.hero == "") {
			// player does not have favorite hero, use most played
			let mostplayed = getMostPlayedHero();
			if(mostplayed == '') {
				// no heroes played, no image selected
				document.getElementById("player-photo").innerHTML = '';
			} else {
				// has most playtime on hero, use their image
				document.getElementById("player-photo").innerHTML = '<img src="/images/heroportraits/' + mostplayed + '.png">';
			}
		} else {
			// player has a favorite hero, set image
			document.getElementById("player-photo").innerHTML = '<img src="/images/heroportraits/' + playerInfo.hero + '.png">';
		}
	} else {
		// player has a picture, use that
		document.getElementById("player-photo").innerHTML = '<img src="' + playerInfo.picture + '">';
	}
}

// loads accolades
function loadAccolades() {
	if(playerInfo.accolades == "" && playerInfo.mvp == "0") {
		document.getElementById("awards").innerHTML += '<p>No accolades earned... yet!</p>';
		return;
	}
	let accolades = playerInfo.accolades.split("\n");
	let accoladesDiv = document.getElementById("awards");
	
	if(playerInfo.mvp != "0" && playerInfo.mvp != "") {
		// add match mvps
		let mvp = '<div class="award"><img src="/images/playerpage/match_mvp.png"><p>Match MVP x' + playerInfo.mvp + '</p></div>';
		console.log(playerInfo.mvp,mvp);
		accoladesDiv.innerHTML += mvp;
	}
	
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

// returns the player's hero most played
function getMostPlayedHero() {
	let name = '';
	let time = 0.0;
	for(i=0;i<statsObj.stats.length;++i){
		if(statsObj.stats[i]["player"] == playerInfo.battletag) {
			let temp_t = parseFloat(statsObj.stats[i]["timeplayed"]);
			if(temp_t > time) {
				name = statsObj.stats[i]["hero"];
				time = temp_t;
			}
		}
	}
	return name;
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
	
	// this is a sketchy workaround, but if timeplayed is zero then the player theoretically has no other stats. so setting timeplayed to 1 should make it still zero. 
	if(timeplayed == 0) timeplayed = 1;
	
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

// set the player's SRs
function loadSRs() {
	let tankrank = getRank(playerInfo.tank);
	let dpsrank = getRank(playerInfo.dps);
	let supportrank = getRank(playerInfo.support);
	console.log(tankrank,dpsrank,supportrank);
	
	// set tank sr
	if(playerInfo.tank == "-") {
		document.getElementById("tank-rank").setAttribute('style','display:none;');
	} else {
		document.getElementById("tank-sr").textContent = playerInfo.tank;
		document.getElementById("tank-tier").src = "/images/ranks/" + tankrank;
	}
	// set dps sr
	if(playerInfo.dps == "-") {
		document.getElementById("damage-rank").setAttribute('style','display:none;');
	} else {
		document.getElementById("damage-sr").textContent = playerInfo.dps;
		document.getElementById("damage-tier").src = "/images/ranks/" + dpsrank;
	}
	// set support sr
	if(playerInfo.support == "-") {
		document.getElementById("support-rank").setAttribute('style','display:none;');
	} else {
		document.getElementById("support-sr").textContent = playerInfo.support;
		document.getElementById("support-tier").src = "/images/ranks/" + supportrank;
	}
	
}

// get rank icon for sr
function getRank(sr) {
	let num = parseInt(sr);
	if(num == NaN || num < 0 || num > 5000) return "nil.png";
	else if(num < 1500) return "bronze.png";
	else if(num < 2000) return "silver.png";
	else if(num < 2500) return "gold.png";
	else if(num < 3000) return "plat.png";
	else if(num < 3500) return "diamond.png";
	else if(num < 4000) return "masters.png";
	else return "grandmasters.png";
}

document.addEventListener("DOMContentLoaded", function() {
	seasonname = window.location.pathname.split('/')[1];
	playername = window.location.pathname.split('/')[3];
	
	doAjax();
});