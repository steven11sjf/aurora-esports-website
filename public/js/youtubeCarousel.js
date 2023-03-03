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