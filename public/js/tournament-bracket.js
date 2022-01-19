var data;

function setData(d) {
	data = d;
	console.log("DATA: ",data);
}
	
var knownBrackets = [2,4,8,16,32], // brackets with "perfect" proportions (full fields, no byes)

	exampleTeams  = _.shuffle(["Staronzenhonza Smelly BOON1Es","New York Islanders","New York Rangers","Philadelphia Flyers","Pittsburgh Penguins","Boston Bruins","Buffalo Sabres","Montreal Canadiens","Ottawa Senators","Toronto Maple Leafs","Carolina Hurricanes","Florida Panthers","Tampa Bay Lightning","Washington Capitals","Winnipeg Jets","Chicago Blackhawks","Columbus Blue Jackets","Detroit Red Wings","Nashville Predators","St. Louis Blues","Calgary Flames","Colorado Avalanche","Edmonton Oilers","Minnesota Wild","Vancouver Canucks","Anaheim Ducks","Dallas Stars","Los Angeles Kings","Phoenix Coyotes","San Jose Sharks","Montreal Wanderers","Quebec Nordiques","Hartford Whalers"]), // because a bracket needs some teams!
	
	bracketCount = 0;

// recursively find depth of bracket
function getDepth(matchid, bname, matches) {
	let depths = _.map(_.filter(matches, function(m) { return (m.parent == matchid) && (m.bracketname == bname); }), function(m) { return getDepth(m.matchid, bname, matches); });
	if (depths.length == 0) return 1;
	return Math.max(...depths) + 1; // max element in array, plus one
	
}

// copies in data for match into bracket
function copyMatch(match, bracket) {
	bracket.bracketNo = match.matchid;
	bracket.date = match.date;
	bracket.time = match.time;
	bracket.teamnames = [match.team1, match.team2];
	bracket.bye = false;
	
	// check if its played, insert dummy variables if not
	if (match.played == "TRUE") {
		bracket.played = true;
		bracket.scores = getScores(match);
		bracket.winner = match.winner;
	} else {
		bracket.played = false;
		bracket.scores = ['-','-'];
		bracket.winner = "";
	}
	
	return bracket;
}

// gets the map score for the match
function getScores(match) {
	scores = [0,0];
	
	// sum maps that each team won
	if(match.map1.winner == match.team1) scores[0]++;
	else if(match.map1.winner == match.team2) scores[1]++;
	if(match.map2.winner == match.team1) scores[0]++;
	else if(match.map2.winner == match.team2) scores[1]++;
	if(match.map3.winner == match.team1) scores[0]++;
	else if(match.map3.winner == match.team2) scores[1]++;
	if(match.map4.winner == match.team1) scores[0]++;
	else if(match.map4.winner == match.team2) scores[1]++;
	if(match.map5.winner == match.team1) scores[0]++;
	else if(match.map5.winner == match.team2) scores[1]++;
	if(match.map6.winner == match.team1) scores[0]++;
	else if(match.map6.winner == match.team2) scores[1]++;
	if(match.map7.winner == match.team1) scores[0]++;
	else if(match.map7.winner == match.team2) scores[1]++;
	if(match.map8.winner == match.team1) scores[0]++;
	else if(match.map8.winner == match.team2) scores[1]++;
	
	// done :>
	return scores;
}
/*
 * Build our bracket "model"
 */
function getBracket(data, bname, headerRequired) {
	
	// matches for bracket
	var matches = _.filter(data, function(b) { return b.bracketname == bname; });
	
	// find depth of bracket
	var highest = getDepth(_.filter(matches, function(b) { return b.parent == 0; })[0].matchid, bname, data);
	
	// build tree upside-down
	var bracket = []
	// fill with byes, overwrite later w real matches
	for(i=0; i<Math.pow(2,highest)-1;++i) {
		bracket.push({
			bye:		true
		});
	}
	
	// enter first match
	copyMatch(_.filter(matches, function(b) { return b.parent == 0; })[0], bracket[0]);
	// loop through chart, fill in children
	for(i=0; i<bracket.length; ++i) {
		// ignore byes
		if(bracket[i].bye) continue;
		
		// calculate location in bracket
		let curHeight = Math.floor(Math.log2(i+1)); // 2
		let curRemainder = i - Math.pow(2,curHeight) + 1; // 3
		let childHeight = curHeight+1; // 3
		let childRemainder = curRemainder * 2; // 6
		let firstChild = Math.pow(2,childHeight) + childRemainder - 1; // 13
		
		// continue if child is outside Range
		if(firstChild > bracket.length) continue;
		
		// fill children
		let children = _.filter(matches, function(b) { return b.parent == bracket[i].bracketNo; });
		if(children.length > 0) {
			// fill child 1 in correct slot
			if(children[0].winner == bracket[i].teamnames[0])
				copyMatch(children[0], bracket[firstChild+1]);
			else
				copyMatch(children[0], bracket[firstChild]);
		}
		
		if(children.length > 1) {
			// fill child 2
			if(children[1].winner == bracket[i].teamnames[1])
				copyMatch(children[1], bracket[firstChild]);
			else
				copyMatch(children[1], bracket[firstChild+1]);
		}
	}
	
	// invert bracket
	output = bracket.reverse();
	// print
	console.log(output);
	// render bracket
	renderBrackets(output, bname, headerRequired);
}

var bracketCount = 0; // global counter for how many brackets

/*
 * Inject our brackets
 */
function renderBrackets(struct, bname, headerRequired) {
	var height = Math.log2(struct.length+1);
	
	var group = $('<div class="group'+height+'" id="b'+bracketCount+'"></div>');
	
	var idx = 0;
	for(i=height-1;i>=0;--i) {
		var round = $('<div class="r'+(height-i)+'"></div>');
		for(;idx<=struct.length-Math.pow(2,i);++idx) {
			var gg = struct[idx];
			if(gg.bye)
				round.append('<div></div>');
			else {
				console.log("scores for match ",gg.bracketNo,": ",gg.scores);
				// get data
				let winner = gg.scores[0] > gg.scores[1] ? 1 : 0; // slot that won
				
				// generate bracket lines
				let generated = '<div><div class="bracketbox"><a href="#Matchlog-';
				generated += `${bname.replace(/\s+/g,'_')}-${gg.bracketNo}`;
				generated += '"><div class="matchbox" id="Bracket-';
				generated += `${bname.replace(/\s+/g,'_')}-${gg.bracketNo}`;
				generated += '"><div class="mb-matchinfo"><span class="mb-title">Match ';
				generated += gg.bracketNo; 
				generated += '</span><span class="mb-datetime">';
				generated += !gg.date ? "unscheduled" : `${gg.date} @ ${gg.time}`;
				generated += '</span></div><div class="mb-teaminfo ';
				if (!gg.played) {
					generated += 'mb-unplayed"><span class="mb-teamname">';
					generated += gg.teamnames[0];
					generated += '</span><span class="mb-score">-</span></div><div class="mb-teaminfo mb-unplayed"><span class="mb-teamname">';
					generated += gg.teamnames[1];
					generated += '</span><span class="mb-score">-</span></div></div></div></div>';
				} else {
					generated += gg.winner == gg.teamnames[0] ? 'mb-winner' : 'mb-loser';
					generated += '"><span class="mb-teamname">';
					generated += gg.teamnames[0];
					generated += '</span><span class="mb-score">';
					generated += gg.scores[0];
					generated += '</span></div><div class="mb-teaminfo ';
					generated += gg.winner == gg.teamnames[1] ? 'mb-winner' : 'mb-loser';
					generated += '"><span class="mb-teamname">';
					generated += gg.teamnames[1];
					generated += '</span><span class="mb-score">';
					generated += gg.scores[1];
					generated += '</span></div></div></a></div></div>';
				}
				
				// append to the round data
				round.append(generated);
			}
		}
		group.append(round);
	}
	if(headerRequired)
		$('#brackets').append(`<h2 class="round-header">${bname}</h2>`);
	$('#brackets').append(group);
	
	bracketCount++;
	console.log(_);
}