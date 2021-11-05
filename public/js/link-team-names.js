/*var links_dict;

$(function() {
	// create AJAX request for standingsTable
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/GetLinkDict", true);
	xhttp.send();
	
	// runs when response is received
	xhttp.onreadystatechange = function() {
		contentType = xhttp.getResponseHeader("content-type");
		if(contentType != "application/json; charset=utf-8") console.log(contentType);
		if(this.readyState == 4 && this.status == 200){
			links_dict = JSON.parse(xhttp.responseText);
			setTimeout(() => {  addLinks(); }, 500); // wait 1 second for all js to complete
		} else {
			if(xhttp.status != 200) {
				alert(xhttp.status);
			}
		}
	}
});

function addLinks()
{
	//iterate the array
    $.each(links_dict,
        function() {
            var searchWord = this.word;
            var link = this.link;
			console.log(searchWord,link);
            $('p:contains("' + searchWord + '")').each(function() {
				
                var newHtml = $(this).html().replace(searchWord, 
                    '<a class="auto-plink" href="'+link+'">' + searchWord + '</a>');
                $(this).html(newHtml);
				console.log(newHtml);
            });
        }
    );
}*/