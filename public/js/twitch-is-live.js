var client_id = "bcbs35nrwfdjp8gbgced3z0x2mgjb1";
var redirect = 'http://localhost';

function GetAuthToken()
{
	fetch(
		"https://id.twitch.tv/oauth2/authorize",
		{
			"headers": {
				'Client-ID': client_id,
				'Authorization': "Bearer " + access_token;)
	  .then(
};

function CheckOnlineStatus()
{
	$.ajax({
		url: "https://api.twitch.tv/helix/channels",
		broadcaster_id: "esportsumn",
		dataType: 'json',
		header: {
			'Client-ID': client_id
		},
		success: function(channel)
		{
			if(channel["stream"] == null)
			{
				window.alert("offline");
			} else {
				window.alert("online");
			}
		},
		error: function(error)
		{
			console.log(error)
		}
	});
};

CheckOnlineStatus();