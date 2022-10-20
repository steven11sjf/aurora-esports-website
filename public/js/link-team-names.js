var links_dict;

$(function() {
	// get season
	let season = window.location.pathname.split('/')[1];
	ajaxReq("/" + season + "/GetLinkDict")
	.then(res => {
		links_dict = JSON.parse(res.responseText);
		console.log(links_dict);
		setTimeout(() => {addLinks();},500); // wait for js to complete
	})
	.catch(err => {
		console.log("Ajax for LinkDict failed!");
	});
});

function addLinks()
{
	//iterate the array
    $.each(links_dict.players,
        function() {
			// grab word/link from 'this' before it is changed
            var searchWord = this.word;
            var link = this.link;
			// jquery to get all instances of searchWord in a p object
            $('p:contains("' + searchWord + '")').not(".auto-plink").each(function() {
				
				// replace first instance of searchWord with a link
                var newHtml = $(this).html().replace(searchWord, 
                    '<a class="auto-plink" href="'+link+'">' + searchWord + '</a>');
                $(this).html(newHtml);
				$(this).addClass("auto-plink");
            });
        }
    );
	$.each(links_dict.teams,
        function() {
			// grab word/link from 'this' before it is changed
            var searchWord = this.word;
            var link = this.link;
			// jquery to get all instances of searchWord in a p object
            $('p:not(.auto-plink):contains("' + searchWord + '")').each(function() {
				
				// replace first instance of searchWord with a link
                var newHtml = $(this).html().replace(searchWord, 
                    '<a class="auto-plink" href="'+link+'">' + searchWord + '</a>');
                $(this).html(newHtml);
				$(this).addClass("auto-plink");
            });
        }
    );
}