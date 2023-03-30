var options = {
	channel: "auroraesportsmn",
	width: 940,
	height: 360,
};
var player = new Twitch.Player("twitch", options);

player.addEventListener(Twitch.Player.READY, initiate)

function initiate() {
	player.addEventListener(Twitch.Player.ONLINE, handleOnline);
	player.removeEventListener(Twitch.Player.READY, initiate);
}

function handleOnline() {
	document.getElementById("twitch").classList.remove('hide');
	player.removeEventListener(Twitch.Player.ONLINE, handleOnline);
	player.addEventListener(Twitch.Player.OFFLINE, handleOffline);
	player.setMuted(false);
}