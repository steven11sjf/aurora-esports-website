// navbar.js
// this is linked to every page

function loadNavbarLinks() {
	// get season name from address bar
	let sname = window.location.pathname.split('/')[1];
	console.log(`linking navbar! sname=${sname}`);

	// load static buttons with season links
	$("#navlink-home").attr("href",`/${sname}/Home`);
	$("#navlink-schedule").href = `/${sname}/Schedule`;
	$("#navlink-standings").href = `/${sname}/Standings`;
	$("#navlink-stats").href = `/${sname}/Stats`;
	$("#navlink-draft").href = `/${sname}/Draft`;
	
	// make ajax request for list of teams
	ajaxReq(`/api/${sname}/teams`)
	.then(res => {
		if(res.error) {
			console.log(res.error);
			alert(`Error: /api/${sname}/teams returned error: ${err}\n\nPlease send this to hyperbola0#4962 on the discord to make sure they're aware.`);
			return;
		}
		console.log("=== NAVBAR AJAX RETURNED ===");
		for(i=0;i<res.length;++i) {
			$('#navlink-teams-dropdown').append(`<a href=\"/${sname}/Teams/${res[i].internal}\">${res[i].name}</a>`);
		}
		
		console.log("navbar linked!");
	})
	.catch(err => console.log(error));
}

document.addEventListener("DOMContentLoaded", function() {
	loadNavbarLinks();
});