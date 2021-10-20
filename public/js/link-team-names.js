var links_dict;

$(function() {
	// get season
	let season = window.location.pathname.split('/')[1];
	ajaxReq("/" + season + "/GetLinkDict")
	.then(res => {
		links_dict = JSON.parse(res.responseText);
		setTimeout(() => {addLinks();},500); // wait for js to complete
	})
	.catch(err => {
		console.log("FUCK MY BUSSY");
	});
});

function addLinks()
{
	//iterate the array
    $.each(links_dict,
        function() {
			// grab word/link from 'this' before it is changed
            var searchWord = this.word;
            var link = this.link;
			// jquery to get all instances of searchWord in a p object
            $('p:contains("' + searchWord + '")').each(function() {
				// replace first instance of searchWord with a link
                var newHtml = $(this).html().replace(searchWord, 
                    '<a class="auto-plink" href="'+link+'">' + searchWord + '</a>');
                $(this).html(newHtml);
            });
        }
    );
}