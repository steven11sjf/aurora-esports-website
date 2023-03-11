function createYouTube(week, matchJson) {
  var res = "";
  var matchesToList = [];
  var matches = matchJson.matches;
  var weekString = week.toString();

  for(var i = 0; i < matches.length; i++) {
    if(weekString == matches[i].round && matches[i]["tournament"] == "Season") {
      if(matches[i]["played"] == "TRUE" && matches[i]["embed"] != "undefined") {
        matchesToList.push(matches[i]);
      }
    }
  }

  res += '<h1 class="center section-header">Watch Some Matches</h1>';
  res += '<div class="slideshow-container">';

  for(var i = 0; i < matchesToList.length; i++) {
    res += '<div class="youtubeSlides"><iframe width="560" height="315" src="';
    res += matchesToList[i]["embed"];
    res += '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
  }

  res += '<a class="prev" onclick="plusYoutubeSlides(-1)">&#10094;</a>';
  res += '<a class="next" onclick="plusYoutubeSlides(1)">&#10095;</a>';
   res += '</div><br><div style="text-align:center">'

  for(var i = 0; i < matchesToList.length; i++) {
    res += '<span class="youtubeDot" onclick="currentYoutubeSlide('
    res += i+1;
    res += ')"></span>';
  }

  res += '</div>';

  document.getElementById("youtube").innerHTML = res;
}


let youtubeSlides = 1;
showYoutubeSlides(youtubeSlides);

// Next/previous controls
function plusYoutubeSlides(n) {
  showYoutubeSlides(youtubeSlides += n);
}

// Thumbnail image controls
function currentYoutubeSlide(n) {
  showYoutubeSlides(youtubeSlides = n);
}

function showYoutubeSlides(n) {
  let i;
  let slides = document.getElementsByClassName("youtubeSlides");
  let dots = document.getElementsByClassName("youtubeDot");
  if (n > slides.length) {youtubeSlides = 1}
  if (n < 1) {youtubeSlides = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[youtubeSlides-1].style.display = "block";
  dots[youtubeSlides-1].className += " active";
}