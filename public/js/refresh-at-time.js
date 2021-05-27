function refreshAt(hours, minutes, seconds) {
    var now = new Date();
    var then = new Date();

    if(now.getHours() > hours ||
       (now.getHours() == hours && now.getMinutes() > minutes) ||
        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    var timeout = (then.getTime() - now.getTime());
    setTimeout(function() { /*window.location.reload(true);*/ }, timeout);
}

function refreshAt5Mins() {
	var now = new Date();
	console.log(now);
	var last = new Date(now.getTime() - now.getTime % 300000);
	console.log(last);
	console.log("last update was at " + last.getHours() + ':' + last.getMinutes() + ':' + last.getSeconds());
	var next = new Date(last.getTime() + 305000); // 5mins 5seconds, to give server time to update
	console.log(next);
	console.log("will refresh at " + next.getHours() + ':' + last.getMinutes() + ':' + last.getSeconds());
	refreshAt(next.getHours(),next.getMinutes(),next.getSeconds());
}