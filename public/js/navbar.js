// navbar.js
// this is linked to every page

function loadNavbarLinks() {
	// get season name from address bar
	let sname = window.location.pathname.split('/')[1];
	console.log(`linking navbar! sname=${sname}`);

	// load static buttons with season links
	$("#nav-home-link").attr("href",`/${sname}/Home`);
	$("#nav-schedule-link").attr("href",`/${sname}/Schedule`);
	$("#nav-standings-link").attr("href",`/${sname}/Standings`);
	$("#nav-stats-link").attr("href",`/${sname}/Stats`);
	$("#nav-draft-link").attr("href",`/${sname}/Draft`);
	
	// make ajax request for navbar info
	ajaxReq(`/api/NavInfo/${sname}`)
	.then(res => {
		if(res.error) {
			console.log(res.error);
			alert(`Error: /api/${sname}/teams returned error: ${err}\n\nPlease send this to hyperbola0#4962 on the discord to make sure they're aware.`);
			return;
		}
		console.log("=== NAVBAR AJAX RETURNED ===");
		const data = JSON.parse(res.responseText);
		console.log(data);
		// populate seasons list
		for(i=0; i<data.seasons.length; ++i) {
			$('#nav-season-dropdown-contents').append(`<li><a class="dropdown-item" href="/${data.seasons[i].internal}/Home">${data.seasons[i].name}</a></li>`);
		}
		
		// populate team list
		for(i=0;i<data.teams.length;++i) {
			$('#nav-team-dropdown-contents').append(`<li><a class="dropdown-item" href=\"/${sname}/Teams/${data.teams[i].internal}\">${data.teams[i].name}</a></li>`);
		}
		
		// populate tournament list
		if(data.tournaments.length == 1) {
			// if there's only one tournament (typically playoffs) don't use a dropdown, just show the tournament name
			$('#navbarTournamentsDropdown').removeClass("dropdown-toggle");
			$('#navbarTournamentsDropdown').removeAttr('data-bs-toggle aria-expanded');
			$('#navbarTournamentsDropdown').attr('href', `/${sname}/Tournament/${data.tournaments[0].internal}`)
			$('#navbarTournamentsDropdown').html(data.tournaments[0].name);
			$('nav-tourn-dropdown-contents').remove();
		}
		else {
			for(i=0; i<data.tournaments.length; ++i) {
				$('#nav-tourn-dropdown-contents').append(`<li><a class="dropdown-item" href=\"/${sname}/Tournament/${data.tournaments[i].internal}\">${data.tournaments[i].name}</a></li>`);
			}
		}
		
		console.log("navbar linked!");
	})
	.catch(err => console.log(err));
}

document.addEventListener("DOMContentLoaded", function() {
	loadNavbarLinks();
});