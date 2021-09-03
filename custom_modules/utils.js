// ==========
// Module containing code utilities that assist in common commands
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// see file ./LICENSE for full license details.
// (c) 2021 Steven Franklin. 
// ==========

// searches an array of objects for a (parameter)(value) pair
// returns the index of the element, or -1 if it does not exist
// example: array "arr" of team objects, want to search for internal id "DjiboutiShorts". searchArrayForParameter(arr,"internal","DjiboutiShorts") returns the index. 
function searchArrayForParameter(arr,param,value) {
	for(i=0;i<arr.length;++i) {
		// check the "param" value at array index i
		if(arr[i][param] == value) {
			return i;
		}
	}
	
	return -1;
}

function testSAFP() {
	let arr = [
		{
			"team" : "foo",
			"internal" : "owo"
		},
		{
			"team" : "bar",
			"internal" : "uwu"
		},
		{
			"team" : "foobar",
			"internal" : "nya"
		}
	];
	
	console.log('Searching for param "team" and value "foobar"','Value: ' + searchArrayForParameter(arr,"team","foobar"));
	console.log('Searching for param "internal" and value "owo"','Value: ' + searchArrayForParameter(arr,"internal","owo"));
	console.log('Searching for param "team" and value "poo"','Value: ' + searchArrayForParameter(arr,"team","poo"));
	console.log('Searching for param "fax" and value "tru"','Value: ' + searchArrayForParameter(arr,"fax","tru"));
	
	console.log('Team with internal name "uwu": ', arr[searchArrayForParameter(arr,"internal","uwu")].team);
	console.log('Team with team name "foobar": ', arr[searchArrayForParameter(arr,"team","foobar")].internal);
}
testSAFP();

// node exports
module.exports = {
	searchArrayForParameter,
}