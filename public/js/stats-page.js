var herostats_obj;
var heroinfo_obj;
var table_type;

// called when the dropdown is selected.
function dropdownSelected(value) {
	let heroName = value;
	if(heroName == "") return;
	console.log(heroName);
	
	if(heroName == "__LEAGUE_STANDINGS__") { table_type = "All"; loadTable('/html/stats-all-header.html', heroName); }
	else if(heroinfo_obj[heroName] == "Tank") { table_type = "Tank"; loadTable('/html/stats-tank-header.html', heroName); }
	else if(heroinfo_obj[heroName] == "Damage") { table_type = "Damage"; loadTable('/html/stats-damage-header.html', heroName); }
	else if(heroinfo_obj[heroName] == "Support") { table_type = "Support"; loadTable('/html/stats-support-header.html', heroName); }
	else { table_type = "All"; loadTable('/html/stats-all-header.html', heroName); }
}


// clears the table, loads the new header and loads hero stats
function loadTable(header,hero) {
	// clear stats table body
	document.getElementById("statsTableBody").innerHTML = "";
	
	// use AJAX to get the new header
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",header,true);
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			document.getElementById("statsTableHeader").innerHTML = xhttp.responseText;
			loadHero(hero);
			console.log("Loaded new header!");
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
}

function doAjax() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", '/api/playerstats/', true);
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			herostats_obj = JSON.parse(xhttp.responseText);
			console.log(herostats_obj);
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/json/heroinfo.json', true);
	xhr.send();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			heroinfo_obj = JSON.parse(xhr.responseText);
		} else {
			if(xhr.status != 200) {
				alert(xhr.status);
			}
		}
	}
}
doAjax();

function loadHero(dropdown) {
	// get hero from dropdown
	let heroName = dropdown;
	if(heroName == "") return;
	console.log(heroName);
	
	let inner = "";
	let stats = herostats_obj.stats;
	if(table_type == "All") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				// calculate per/10 stats
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 600; // set it to per 10
				let elims = parseInt(stats[i]["elims"])/timePlayed;
				elims = elims.toFixed(2);
				let fb = parseInt(stats[i]["fb"])/timePlayed;
				fb = fb.toFixed(2);
				let dmg = parseInt(stats[i]["damage"])/timePlayed;
				dmg = dmg.toFixed(0);
				let deaths = parseInt(stats[i]["deaths"])/timePlayed;
				deaths = deaths.toFixed(2);
				let healing = parseInt(stats[i]["healing"])/timePlayed;
				healing = healing.toFixed(0);
				let blocked = parseInt(stats[i]["blocked"])/timePlayed;
				blocked = blocked.toFixed(0);
				timePlayed *= 10;
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
				inner += timePlayed;
				inner += ' min</p></td></tr>';
			}
		}
	} else if (table_type == "Tank") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				// calculate per/10 stats
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 600; // set it to per 10
				let elims = parseInt(stats[i]["elims"])/timePlayed;
				elims = elims.toFixed(2);
				let fb = parseInt(stats[i]["fb"])/timePlayed;
				fb = fb.toFixed(2);
				let dmg = parseInt(stats[i]["damage"])/timePlayed;
				dmg = dmg.toFixed(0);
				let deaths = parseInt(stats[i]["deaths"])/timePlayed;
				deaths = deaths.toFixed(2);
				let blocked = parseInt(stats[i]["blocked"])/timePlayed;
				blocked = blocked.toFixed(0);
				timePlayed *= 10;
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
				inner += timePlayed;
				inner += ' min</p></td></tr>';
			}
		}
	} else if (table_type == "Damage") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				// calculate per/10 stats
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 600; // set it to per 10
				let elims = parseInt(stats[i]["elims"])/timePlayed;
				elims = elims.toFixed(2);
				let fb = parseInt(stats[i]["fb"])/timePlayed;
				fb = fb.toFixed(2);
				let dmg = parseInt(stats[i]["damage"])/timePlayed;
				dmg = dmg.toFixed(0);
				let deaths = parseInt(stats[i]["deaths"])/timePlayed;
				deaths = deaths.toFixed(2);
				timePlayed *= 10;
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
				inner += timePlayed;
				inner += ' min</p></td></tr>';
			}
		}
	} else if(table_type == "Support") {
		for(i=0;i<stats.length;++i) {
			// enter into the table if this row contains the hero
			if(stats[i]["hero"] == heroName) {
				// calculate per/10 stats
				let timePlayed = parseInt(stats[i]["timeplayed"]);
				timePlayed = timePlayed / 600; // set it to per 10
				let elims = parseInt(stats[i]["elims"])/timePlayed;
				elims = elims.toFixed(2);
				let fb = parseInt(stats[i]["fb"])/timePlayed;
				fb = fb.toFixed(2);
				let dmg = parseInt(stats[i]["damage"])/timePlayed;
				dmg = dmg.toFixed(0);
				let deaths = parseInt(stats[i]["deaths"])/timePlayed;
				deaths = deaths.toFixed(2);
				let healing = parseInt(stats[i]["healing"])/timePlayed;
				healing = healing.toFixed(0);
				timePlayed *= 10;
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
				inner += timePlayed;
				inner += ' min</p></td></tr>';
			}
		}
	}
	console.log(inner);
	
	// enter data into table
	document.getElementById("statsTable").getElementsByTagName("tbody")[0].innerHTML = inner;
	
	// do linking
	addLinks();
}