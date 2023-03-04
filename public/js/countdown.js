function createUpcoming(week, matchJson) {
  var res = "";
  var matchesToParse = [];
  var matches = matchJson.matches;
  var weekString = week.toString();

  for(var i = 0; i < matches.length; i++) {
    if(weekString == matches[i].round && matches[i]["tournament"] == "Season") {
      if(matches[i]["played"] == "FALSE" && matches[i]["date"] != "") {
        matchesToParse.push(matches[i]);
      }
    }
  }

  var upcomingMatch = matchesToParse[0];
  for(var i = 0; i < matchesToParse.length; i++) {
    console.log(matchesToParse[i]["date"]);
    var dateToCheck = matchesToParse[i]["date"] + matchesToParse[i]["time"];
    console.log("dateToCheck " + dateToCheck);
    var upcomingDateTime = upcomingMatch["date"] + upcomingMatch["time"];
    console.log("upcomingDateTime " + upcomingDateTime);
    console.log(upcomingDateTime);
    if(dateToCheck < upcomingDateTime) {
        upcomingMatch = matchesToParse[i];
    }
  }

  res += '<div class="leftTeam">\n<img src="\/images\/teamicons\/';
  res += upcomingMatch["team1"].replace(/\s+/g,'');
  res += '.png" width="50" height="50"><p>';
  res += upcomingMatch["team1"];
  res += '</p></div><div class="countdown" id="timer" style="background-color: white;"></div><div class="rightTeam">\n<img src="\/images\/teamicons\/';
  res += upcomingMatch["team2"].replace(/\s+/g,'');
  res += '.png" width="50" height="50"><p>'
  res += upcomingMatch["team2"];
  res += '</p></div>';

  document.getElementById("upcoming").innerHTML = res;
  const date = upcomingMatch["date"].split("/");
  const time = upcomingMatch["time"].split(":");
  var hour = parseInt(time[0]) + 12;
  let mins = parseInt(time[1].substring(0,2));
  var dateTime = new Date(parseInt(date[2]),parseInt(date[0]),parseInt(date[1]),hour,mins);
  countdown(dateTime);
}

function countdown(dateTime) {
  // Set the date we're counting down to
  var countDownDate = new Date(dateTime).getTime();

  // Update the count down every 1 second
  var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var html = "";

    if(days > 0) {
      html = days + "d " + hours + "h "
      + minutes + "m " + seconds + "s ";
    }

    if(hours > 0) {
      html = hours + "h " + minutes + "m "
      + seconds + "s ";
    }

    if(minutes == 0 && seconds == 0) {
      html = "<img src=\"/images/Aurora_Esports_Circle_Logo.png\" width=\"50\" height=\"50\">"
    }

    if(html == "") {
      html = minutes + "m " + seconds + "s ";
    }

    // Display the result in the element with id="demo"
    document.getElementById("timer").innerHTML = html;

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "EXPIRED";
    }
  }, 1000);
}