function addLinks()
{
	console.log("linking teams");
	var x = document.querySelectorAll(".team-name > p");
	var y = document.querySelectorAll(".team-name");
	var selected;
	for(i = 0; i < x.length; ++i)
	{
		let inner = x[i].innerHTML;
		console.log(inner);
		if(inner == 'Djibouti Shorts') 
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/DjiboutiShorts">' + inner + '</a>';
		else if(inner == 'London Lumberjack Slams')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/LondonLumberjackSlams">' + inner + '</a>';
		else if(inner == 'Oceania Otters')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/OceaniaOtters">' + inner + '</a>';
		else if(inner == 'Plymouth PMAs')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/PlymouthPMAs">' + inner + '</a>';
		else if(inner == 'The Tenochitlan Tacos')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/TheTenochitlanTacos">' + inner + '</a>';
		else if(inner == 'Bendigo Bilbies')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/BendigoBilbies">' + inner + '</a>';
		else if(inner == 'Gaming Golems')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/GamingGolems">' + inner + '</a>';
		else if(inner == 'Rialto Rincewinds')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/RialtoRincewinds">' + inner + '</a>';
		else if(inner == "Galapagos Gremlins")
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/GalapagosGremlins">' + inner + '</a>';
		else if(inner == 'Wakanda BBQs')
			x[i].innerHTML = '<a style="text-decoration: none; color: #000000;" href="/Teams/WakandaBBQs">' + inner + '</a>';
		else
			x[i].innerHTML = inner;
	}
	console.log("done!");
}