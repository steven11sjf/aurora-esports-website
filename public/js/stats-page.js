var season;
var herostats_obj;
var heroinfo_obj;
var table_type;
var loaded = 0;

// called when the dropdown is selected.
function dropdownSelected(value,value2) {
	let heroName = value;
	let statsPer10 = value2;
	if(heroName == "") return;
	console.log(heroName);
	console.log(statsPer10);
	
	if(!heroinfo_obj) { table_type = "All"; loadTable('/html/stats-all-header.html', heroName, statsPer10); }
	else if(heroinfo_obj[heroName] == "Tank") { table_type = "Tank"; loadTable('/html/stats-tank-header.html', heroName, statsPer10); }
	else if(heroinfo_obj[heroName] == "Damage") { table_type = "Damage"; loadTable('/html/stats-damage-header.html', heroName, statsPer10); }
	else if(heroinfo_obj[heroName] == "Support") { table_type = "Support"; loadTable('/html/stats-support-header.html', heroName, statsPer10); }
	else { table_type = "All"; loadTable('/html/stats-all-header.html', heroName, statsPer10); }
}


// clears the table, loads the new header and loads hero stats
function loadTable(header,hero, statsPer10) {
	// clear stats table body
	document.getElementById("statsTableBody").innerHTML = "";
	
	console.log(statsPer10);
	// use AJAX to get the new header
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",header,true);
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			document.getElementById("statsTableHeader").innerHTML = xhttp.responseText;
			console.log(statsPer10);
			loadHero(hero, statsPer10);
			console.log("Loaded new header!");
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doAjax() {
	return new Promise((resolve,reject) => {
		season = window.location.pathname.split('/')[1];
		ajaxReq('/api/'+season+'/playerstats')
		.then(res => {
			herostats_obj = JSON.parse(res.responseText);
			if(herostats_obj.error) {
				console.error("Server returned an error on /api/season/playerstats!");
				reject(err);
			}
			loaded++;
		})
		.catch(err => {
			console.error("Ajax req /api/season/playerstats failed!");
			reject(err);
		});

		ajaxReq('/json/heroinfo.json')
		.then(res => {
			heroinfo_obj = JSON.parse(res.responseText)
			loaded++;
		})
		.catch(err => {
			console.error("Ajax req /json/heroinfo.json failed!");
			reject(err);
		});
	});
};

function loadHero(dropdown,per10) {
	// check if page is loaded
	if(loaded!=2) {
		setTimeout(() => {loadHero(dropdown,per10);},500);
		return;
	}
	// get hero from dropdown
	let heroName = dropdown;
	if(heroName == "") return;
	console.log(heroName);
	console.log(per10);
	
	let inner = "";
	let stats = herostats_obj.stats;
	if(table_type == "All") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 60;
				if(timePlayed == 0) continue;
				let elims = parseInt(stats[i]["elims"]);
				let fb = parseInt(stats[i]["fb"]);
				let dmg = parseInt(stats[i]["damage"]);
				let deaths = parseInt(stats[i]["deaths"]);
				let healing = parseInt(stats[i]["healing"]);
				let blocked = parseInt(stats[i]["blocked"]);
				
				fixed_digits = 0;
				if(per10) {
					timePlayed = timePlayed / 10;
					elims = elims/timePlayed;
					fb = fb/timePlayed;
					dmg = dmg/timePlayed;
					deaths = deaths/timePlayed;
					healing = healing/timePlayed;
					blocked = blocked/timePlayed;
					timePlayed *= 10;
					fixed_digits = 2;
				}
				elims = elims.toFixed(fixed_digits);
				fb = fb.toFixed(fixed_digits);
				dmg = dmg.toFixed(0);
				deaths = deaths.toFixed(fixed_digits);
				blocked = blocked.toFixed(0);
				healing = healing.toFixed(0);
				timePlayed = timePlayed.toFixed(2);
				
				// generate table row
				inner += '<tr><td><p class="player-name">';
				inner += stats[i]["player"];
				inner += '</p></td><td><p class="team-name">';
				inner += stats[i]["team"];
				inner += '</p></td><td><p class="statcell elims-field" title="Total elims: ';
				inner += stats[i]["elims"];
				inner += '">';
				inner += elims;
				inner += '</p></td><td><p class="statcell fb-field" title="Total Final Blows: ';
				inner += stats[i]["fb"];
				inner += '">';
				inner += fb;
				inner += '</p></td><td><p class="statcell dmg-field" title="Total damage: ';
				inner += stats[i]["damage"];
				inner += '">';
				inner += dmg;
				inner += '</p></td><td><p class="statcell deaths-field" title="Total deaths: ';
				inner += stats[i]["deaths"];
				inner += '">';
				inner += deaths;
				inner += '</p></td><td><p class="statcell heals-field" title="Total healing: ';
				inner += stats[i]["healing"];
				inner += '">';
				inner += healing;
				inner += '</p></td><td><p class="statcell dblk-field" title="Total damage blocked: ';
				inner += stats[i]["blocked"];
				inner += '">';
				inner += blocked;
				inner += '</p></td><td><p class="statcell time-field">';
				inner += timePlayedString(timePlayed);
				inner += '</p></td></tr>';
			}
		}
	} else if (table_type == "Tank") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 60;
				if(timePlayed == 0) continue;
				let elims = parseInt(stats[i]["elims"]);
				let fb = parseInt(stats[i]["fb"]);
				let dmg = parseInt(stats[i]["damage"]);
				let deaths = parseInt(stats[i]["deaths"]);
				let blocked = parseInt(stats[i]["blocked"]);
				if(per10) {
					timePlayed = timePlayed / 10;
					elims = elims/timePlayed;
					fb = fb/timePlayed;
					dmg = dmg/timePlayed;
					deaths = deaths/timePlayed;
					blocked = blocked/timePlayed;
					timePlayed *= 10;
				}
				elims = elims.toFixed(2);
				fb = fb.toFixed(2);
				dmg = dmg.toFixed(0);
				deaths = deaths.toFixed(2);
				blocked = blocked.toFixed(0);
				timePlayed = timePlayed.toFixed(2);
				
				// generate table row
				inner += '<tr><td><p class="player-name">';
				inner += stats[i]["player"];
				inner += '</p></td><td><p class="team-name">';
				inner += stats[i]["team"];
				inner += '</p></td><td><p class="statcell elims-field" title="Total elims: ';
				inner += stats[i]["elims"];
				inner += '">';
				inner += elims;
				inner += '</p></td><td><p class="statcell fb-field" title="Total Final Blows: ';
				inner += stats[i]["fb"];
				inner += '">';
				inner += fb;
				inner += '</p></td><td><p class="statcell dmg-field" title="Total damage: ';
				inner += stats[i]["damage"];
				inner += '">';
				inner += dmg;
				inner += '</p></td><td><p class="statcell deaths-field" title="Total deaths: ';
				inner += stats[i]["deaths"];
				inner += '">';
				inner += deaths;
				inner += '</p></td><td><p class="statcell dblk-field" title="Total damage blocked: ';
				inner += stats[i]["blocked"];
				inner += '">';
				inner += blocked;
				inner += '</p></td><td><p class="statcell time-field">';
				inner += timePlayedString(timePlayed);
				inner += '</p></td></tr>';
			}
		}
	} else if (table_type == "Damage") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 60;
				if(timePlayed == 0) continue;
				let elims = parseInt(stats[i]["elims"]);
				let fb = parseInt(stats[i]["fb"]);
				let dmg = parseInt(stats[i]["damage"]);
				let deaths = parseInt(stats[i]["deaths"]);
				if(per10) {
					timePlayed = timePlayed / 10;
					elims = elims/timePlayed;
					fb = fb/timePlayed;
					dmg = dmg/timePlayed;
					deaths = deaths/timePlayed;
					timePlayed *= 10;
				}
				elims = elims.toFixed(2);
				fb = fb.toFixed(2);
				dmg = dmg.toFixed(0);
				deaths = deaths.toFixed(2);
				timePlayed = timePlayed.toFixed(2);
				
				// generate table row
				inner += '<tr><td><p class="player-name">';
				inner += stats[i]["player"];
				inner += '</p></td><td><p class="team-name">';
				inner += stats[i]["team"];
				inner += '</p></td><td><p class="statcell elims-field" title="Total elims: ';
				inner += stats[i]["elims"];
				inner += '">';
				inner += elims;
				inner += '</p></td><td><p class="statcell fb-field" title="Total Final Blows: ';
				inner += stats[i]["fb"];
				inner += '">';
				inner += fb;
				inner += '</p></td><td><p class="statcell dmg-field" title="Total damage: ';
				inner += stats[i]["damage"];
				inner += '">';
				inner += dmg;
				inner += '</p></td><td><p class="statcell deaths-field" title="Total deaths: ';
				inner += stats[i]["deaths"];
				inner += '">';
				inner += deaths;
				inner += '</p></td><td><p class="statcell time-field">';
				inner += timePlayedString(timePlayed);
				inner += '</p></td></tr>';
			}
		}
	} else if(table_type == "Support") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 60;
				if(timePlayed == 0) continue;
				let elims = parseInt(stats[i]["elims"]);
				let fb = parseInt(stats[i]["fb"]);
				let dmg = parseInt(stats[i]["damage"]);
				let deaths = parseInt(stats[i]["deaths"]);
				let healing = parseInt(stats[i]["healing"]);
				if(per10) {
					timePlayed = timePlayed / 10;
					elims = elims/timePlayed;
					fb = fb/timePlayed;
					dmg = dmg/timePlayed;
					deaths = deaths/timePlayed;
					healing = healing/timePlayed;
					timePlayed *= 10;
				}
				elims = elims.toFixed(2);
				fb = fb.toFixed(2);
				dmg = dmg.toFixed(0);
				deaths = deaths.toFixed(2);
				healing = healing.toFixed(0);
				timePlayed = timePlayed.toFixed(2);
				
				// generate table row
				inner += '<tr><td><p class="player-name">';
				inner += stats[i]["player"];
				inner += '</p></td><td><p class="team-name">';
				inner += stats[i]["team"];
				inner += '</p></td><td><p class="statcell elims-field" title="Total elims: ';
				inner += stats[i]["elims"];
				inner += '">';
				inner += elims;
				inner += '</p></td><td><p class="statcell fb-field" title="Total Final Blows: ';
				inner += stats[i]["fb"];
				inner += '">';
				inner += fb;
				inner += '</p></td><td><p class="statcell dmg-field" title="Total damage: ';
				inner += stats[i]["damage"];
				inner += '">';
				inner += dmg;
				inner += '</p></td><td><p class="statcell deaths-field" title="Total deaths: ';
				inner += stats[i]["deaths"];
				inner += '">';
				inner += deaths;
				inner += '</p></td><td><p class="statcell heals-field" title="Total healing: ';
				inner += stats[i]["healing"];
				inner += '">';
				inner += healing;
				inner += '</p></td><td><p class="statcell time-field">';
				inner += timePlayedString(timePlayed);
				inner += '</p></td></tr>';
			}
		}
	}
	console.log(inner);
	
	// enter data into table
	document.getElementById("statsTable").getElementsByTagName("tbody")[0].innerHTML = inner;
	
	// do linking
	addLinks();
}

function timePlayedString(timeRaw) {
	let mins = Math.floor(timeRaw);
	let hours = Math.floor(mins / 60);
	let seconds = (timeRaw - mins) * 60;
	let secondString = '';
	let minuteString = '';
	let hourString = '';
	let timeString = '';

	// less than 10 seconds
	if(Math.round(seconds) < 10) {
		secondString = '0' + Math.round(seconds).toString();
	} else {
		secondString = Math.round(seconds).toString();
	}

	// less than 10 minutes
	if(mins < 10) {
		minuteString = '0' + mins.toString();
	} else if(mins >= 60) {
		if(mins % 60 < 10) {
			minuteString = '0' + (mins % 60).toString();
		} else {
			minuteString = (mins % 60).toString();
		}
	} else {
		minuteString = mins.toString();
	}

	timeString = minuteString + ':' + secondString;

	// more than a hour
	if(hours > 0) {
		hourString = '0' + hours.toString();
		timeString = hourString + ':' + timeString;
	}

	return timeString;
}