# File structure

| Location | Contents |
| :--- | :--- |
| ./build.js | Builds the server; this entails accessing the sheets, using the `Info` tab to retrieve team and tournament names, caching data for completed seasons, and building the global player list structure. |
| ./index.js | The main server code; this is what is run when the server is started. Contains the Express server, handles the spreadsheet module, and contains all endpoints. |
| ./client/Blog/\* | This contains HTML templates used in the blog endpoints, and AJAX is used to fill in the contents. |
| ./client/Teams/\* | This contains HTML files used for team pages. Since there can be differences between seasons (i.e. there are divisions in Season 5.5), there are separate pages which are specified in the Sheet class which is used. |
| ./client/\* | Assorted pages which are unchanged across seasons. Their page name is fairly self-explanatory as to their purpose. |
| ./custom_modules/\* | Custom Node modules designed for the server. Accessed via `require('@mymodules/*')`. |
| ./custom_modules/node_modules/SheetClasses/\* | These classes either are or are derived from the GWLSpreadsheet class. Each handles various functions related to accessing, caching, and serving data from the spreadsheet. More information can be found in `./custom_modules/node_modules/SheetClasses/GWLSpreadsheet.js`. |
| ./data/\* | Cached data from the spreadsheets. Data is stored in a season's folder (i.e. `./data/Season5.5/*`. Seasons that are not completed will not have their data uploaded to git. Most data is cached in JSON format, making it easy to send to users. |
| ./docs/\* | Screenshots for the README |
| ./json/\* | Deprecated version of `./data/*`. Only the blog.json file, which contains article info, hasn't been ported. |
| ./public/\* | Static assets |
| ./public/css/\* | CSS stylesheets for various pages and common features |
| ./public/html/\* | Static HTML used in various places, including stats page, the navbar, and blog post contents. |
| ./public/images/\* | A pile of images that is half organized and 3/4 image dumping ground lol |
| ./public/js/\* | JavaScript used in client browsers
| ./public/json/\* | Static JSON assets, list of accolades and hero data |

# Module info

## auth.js

This handles authorization for Google Sheets API in a single function call, `authorize()`. 

## consts.js

Contains constants that are typically referenced. I think I put a lot of stuff in here then never went through to actually link it so most things aren't used. 

## froala-upload-helper.js

Handles upload of text and image from the Blog editor. Customized version of a demo on their site. 

Images are stored as they are added in `./public/newblog/<user id>/`, where user id is the unix timestamp the page was uploaded. Extremely unlikely to have two of the same ID's since two users would have to load `.com/blog/new` simultaneously. 

When text is uploaded, it adds it to the folder in a `content.html` file. 

When the article is generated, it creates a ZIP file in `./public/newblog/<user id>` and returns this file's location. 

## localfs.js

This contains functions to simplify read/write of JSON files. 

writeJson writes an object as a stringified JSON to the specified path. writeJsonPromise does the same but it returns a promise for asynchronous use. 

openJson opens a file, attempts to turn it from JSON to object, and returns the object in a callback. openJsonPromise does the same but returns a promise. 

clearDataPromise clears all data stored in `./data`, and is used during build. 

## player-list-utils.js

Combines all seasons' players into one dataset and caches it on the server and in the website spreadsheet. This is used during build. 

## spreadsheet-types.js

This stores an array of ES6 classes that inherit from GWLSpreadsheet, and provides functions to get data from them. Used extensively in index.js. See the [GWLSpreadsheet](#GWL-Spreadsheet) section for more details on methods. 

`init()` loads all sheets into memory using their `loadSheet()` functions. these are stored in `sheets[]`. 

`updateAll()` takes any ongoing tournaments and runs the `batchGetAll()` function, then resolves with the updated data. 

`getSeason(iname)` resolves with the `GWLSpreadsheet` class with the internal name parameter, or rejects with "InvalidSeason". 

`allSeasonInfo()` resolves an object with the name and internal name of each season in reverse chronological order. Used in the Seasons dropdown on the site. 

`buildDictionaries()` builds the linking dictionaries for all seasons. See [LinkDict](#LinkDict) for more information. 

`buildTeamJson()` builds the `teams.json` file, which is a list of teams in each season. This is retrieved by `getTeamJson()`. 

## utils.js

This contains utility functions. 

`SearchArrayForParameter(arr,param,value)`: Searches the array `arr`, checks each value for the parameter `param`, and returns the index of the element if it matches the specified `value`, i.e. if `arr[i].param = value` it would return `i`. This is useful for things like looking for a specific battletag in an array of players. 

`sanitize(string)` sanitizes input taken from external and potentially contaminated sources. Converts things like apostrophes, quotes, arrows and ampersands to `&apos;`, `&quot;`, etc to prevent breaking HTML or code. 

`getPlayerFromObj(obj,battletag)`: basically a specialized version of `searchArrayForParameter`. Probably one of these should be deprecated, !RemindMe 2 days lol. 

`printMessage`: Prints a message to the console and resolves with the previous Promise result. Used to debug in chained Promises. 

### LinkDict

Link Dictionaries, or LinkDicts, are key-value pairs of phrases that are automatically linked to HTML pages. This is run on all pages so dynamically generated content will properly link team names and player profiles. 

# GWL Spreadsheet

Ah, here we finally are, the meat and potatoes of the backend. `GWLSpreadsheet.js` is an abstract class that provides methods for retrieving data from the spreadsheet, caching it into `./data`, and accessing it within the server. All spreadsheets derive from it and implement methods. 

## Fields

`name` is a string representing the user-facing name of the season (i.e. "Season 5.5"). Set in `build.js`. 

`internal` is a string representing the internally used name, which must be compatible with URIs and file system paths (i.e. "Season5.5", or "Season5-5", but not "Season 5.5" as spaces aren't allowed). Set in `build.js`. 

`ongoing` is a boolean whether the season is currently in progress and expecting updates. if `false`, the season will not check the spreadsheet for updates until the project is rebuilt. Set in `build.js`. 

`spreadsheetId` is the spreadsheet's id. This is the string after the last '/' in the URL when it is accessed in Google Sheets. The spreadsheet must also have access granted to the service account. Set in `build.js`. 

`teams` is an array of teams, which is generated at build time. 

`teamPageTemplatePath` is the path to the teampage HTML stored in `./client/Teams/`. 

`format` is the format of the sheet, for example "RoundRobin" or "Divisions". This is checked to make sure the correct class is used in `loadObject()` when loading a serialized sheet.

`className` is the name of the class used, i.e. "GWLSpreadsheet" or "GWLRoundRobinSpreadsheet". 

`meta` contains metadata information, which is stored in an object. Can include flags (i.e. `meta = { hasStats : true }`). 

`currentRound` is an integer representing the current round/week of matches being played in a season. Updated in `batchGetAll()`. 

## Methods

`constructor(name, internal, ongoing, spreadsheetId)` is used in build to instantiate a new class. 

`buildDirectory()` is used in build. It creates the `./data/<internal>/teams` folder, and copies `./gitignore_template` in if it is an ongoing tournament and data is likely to change in the coming weeks, which prevents frequent updates in the `./data` folder on Git. 

`generateLinkDict()` is used at server startup after running `batchGetAll()` to generate the [link dictionary](#LinkDict) for the season. 

`loadObject(obj)` is used at server startup to load sheets serialized in `./data/sheets.json` into the class. It returns a promise which resolves with the sheet when successful, and rejects with "InvalidFormat" if the format field does not match. 

`loadSheetInfo()` is used in build. It accesses the `info` tab of the spreadsheet to load all teams and tournaments, which are needed to run `batchGetAll()`. 

`batchGetAll()` is used to update the cache for a sheet. It submits a BatchGet request to Google's API with a list of ranges. This typically includes match log, hero stats, standings, player info, teams and tournaments. It then handles the data and stores it in the `./data/<season>/` folder. 

`storeLinkDict(dict)` and `getLinkDict()` each will store or retrieve a link dictionary, respectively. 

`getPlayerInfo(battletag)` retrieves a specific player's battletag from the season and returns it. 

`getPlayers()` returns all player data from the season; in essence, the JSON data in `./data/<season>/players.json`. 

`getStandings()` returns the standings data, typically in `./data/<season>/standings.json`. 

`getTeamInfo(team)` retrieves a specific team's info for the season. 

`getMatches()` returns all matches played in the season, typically `./data/<season>/matchlog.txt`. 

## Existing sheet formats

`GWLSpreadsheetTemplate` is a template formatted to guide developers through implementing a new spreadsheet. 

`GWLRoundRobinSpreadsheet` is a spreadsheet using the round robin format, where teams play a set of matches within single group before proceeding to playoffs. 

`GWLDivisionSpreadsheet` is a spreadsheet using a division format, where teams are split into divisions and rankings are based on in-division and out-of-division matches. 

### GWLWebsiteSpreadsheet

The Website Spreadsheet is a work in progress intended to provide more integrated data for things like player profiles, player statistics and website statistics. Currently merged player profiles are implemented, but other features are not. This is currently low priority, as I have been considering upgrading from Sheets to a database. Given Aurora's existence and the future challenge of having multiple games, I am likely to pivot to that once the site is functional. 