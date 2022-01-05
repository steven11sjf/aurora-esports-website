const ajaxReq = url => new Promise((resolve,reject) => {
	console.info(url);
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",url,true);
	xhttp.send();

	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			resolve(this);
		} else {
			if(xhttp.status != 200)
				reject(this);
		}
	}
});