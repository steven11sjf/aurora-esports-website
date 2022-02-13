# Gopherwatch League website
A website that shows Gopherwatch League standings, stats, matches and player information. It can be accessed live at www.gopherwatchleague.com. 

![The Gopherwatch League](/public/images/leaguelogo_header.png)

## How it works

The focus of this project is to create an easy-to-use backend for tournament administration to update and enter information, which the server then uses to generate a front-end format that displays information in an easily-digestible manner. 

### Data entry

In past seasons, the main form of disseminating information was through a Google Sheets spreadsheet, in which administration would manually update tournament info across the sheet. This was somewhat difficult as players directly read from the spreadsheet file, so it had a focus on ease of reading rather than data entry. As a result, much of the information would have to be entered in multiple cells manually. 

I decided to use Google Sheets for data entry as administration was already familiar with it. However, I made some major adjustments; the majority of information is only entered once now. There are separate sheets for different data points, such as the player data, match log, draft order and team information. Other sheets are present that serve to automate some of the numerical analysis for the server. For example, each team sheet has all the matches they participated in, as well as some team statistics for things such as map win rates. 

![Data entry into a google sheet](/docs/readme/spreadsheet.png)

### Integration with webserver

This repository contains the code for the webserver, including all files it serves. It is designed to run on the Heroku platform, and only requires the spreadsheet ID numbers and an internal identifier. The server pulls information on teams, format, etc from the Info sheet and stores it in a local JSON file. 

Each sheet has an update function that uses the BatchGet feature from google's Sheets API. This function pulls data from most tabs on the sheet and caches the data on the server in local JSON files. These files are then served to the client to retrieve information for each page. 

### Client-side code

On pages the client receives from the server, it uses Ajax to get the information stored in those XML requests and client-side JavaScript inserts this data into the client's HTML. There is also code that hyperlinks team and player names to their respective pages. This allows the client to traverse schedules, standings, player profiles, team pages and more that are dynamically generated by the data in each season's spreadsheet. Thus, most changes to the site can be made without needing to update the code base and rebuild to Heroku; this is mainly necessary when starting a new season and needing to add images for new teams and players. 

## Page-by-page information

### How URLs are used
The URL is used to preserve the state of the session. Generally, the first subdirectory is the name of the current season the player is viewing. The second subdirectory is the specific page. For example, /Season4/Home is the home page of Season 4, and /Season3/Standings is the standings of Season 3. 

For some automatically generated pages, further subdomains are used:

- Player pages: /[season]/Player/[player-name]
- Team pages: /[season]/Teams/[team-name]
- Tournament pages: /[season]/Tournament/[tournament-name]

### Navigation bar (all pages)

The navigation bar is automatically loaded at the top of each page using JavaScript and Ajax. It uses the first subdirectory of the URL to detect the season; if this is not a season, it loads the current season. It populates all links at the top with teams, tournaments and seasons that are available through the website. 

![The navbar](/docs/readme/navbar.png)

### Home page (/[season]/Home)

The home page is the landing page for each season. At the top it displays the current round of matches that are being played. Below that, it displays a list of blog posts which include power rankings, match recaps and patch notes for the website. 

![Home page for Season 4](/docs/readme/homepage.png)

### Team page (/[season]/Teams/[team])

The team pages include detailed information on each teams. At the top, it shows the team's logo, name, match and map records, and their position in the league. It shows the team's roster below it, and then all matches played by the team. At the bottom it shows a list of wins, losses and ties per map, as well as their win rate. 

![Team page for the Falkland Fennecs in Season 4](/docs/readme/teampage.png)

### Tournament page (/[season]/Tournament/[tournament])

The tournament pages show information on tournaments and their results. The top of the page shows bracket(s) that are rendered in HTML, with information about match times, teams and scores. Below that is a detailed list of matches that includes links to VODs (videos on demand) and maps played. The brackets and detailed match information are hyperlinked to each other so it is easy to find a match's details from the bracket or to find the match's bracket position from the details. 

![Thanksgiving Throwdown tournament page for Season 4](/docs/readme/tournamentpage.png)

### Schedule page (/[season]/Schedule)

The schedule page shows the full schedule of the regular season. It loads the current week, and has arrows to navigate to earlier and later weeks. 

![Schedule page for Season 4](/docs/readme/schedule.png)

### Standings page (/[season]/Standings)

The standings page shows the current standings in the season. It contains detailed columns including total points, matches won and lost, win-rates, and map wins, losses, ties and differential. 

![Standings for Season 4](/docs/readme/standings.png)

### Stats page (/[season]/Stats)

The stats page allows you to see players' statistics on different heroes. A dropdown at the top allows you to see a specific hero or to see the league averages for all heroes. Information collected includes eliminations, final blows, damage, deaths, healing dealt, damage blocked and time played. All fields are scaled to per 10 minutes to make stats between players comparable, with the exception of time played. The raw value of each field can be accessed by hovering over a value. 

![Stats page for Season 4](/docs/readme/stats.png)

### Draft page (/[season]/Draft)

The draft page shows the draft order. It lists players' battletag, draft number, the team they were drafted to, and their SR's (Skill Ratings) on each role. 

![Draft page for Season 4](/docs/readme/draft.png)

### Player pages (/[season]/Player/[player])

The player pages show a player's information. Players are given the option to submit some information about themselves, including their real name, pronouns, hometown, major, roster number, main role, favorite hero, social media links and a short bio. This is shown on their player page, as well as their SR's for each role they are eligible to play, and their player and hero stats. 

![BOON1E's player page for Season 4](/docs/readme/playerpage.png)

## Reasoning behind decisions

### Using Google Spreadsheets

In prior seasons the admin team behind the league used a Google Spreadsheet to track info (as mentioned in the data entry section above). This meant that they were familiar with adding information to spreadsheets already. It would be difficult to explain databases to them with the (relatively small) amount of info that we require, compared to simply formatting a spreadsheet in a way that they could easily see where to add relevant data. This has the added benefit of being able to configure the sheet to give them drop-down choices for each field (i.e. only allow team names, or list the maps teams are allowed to play on). The sheet also handles parsing the data and calculating information. For example, from a list of matches played the sheet calculates the tournament's standings and each team's win rates on different maps. This makes it easy to ensure information is accurately calculated and reduces the load on client and server side code, since few calculations are needed. 

### Spreadsheet classes

The league often changes its rules and tournament format between seasons. For example, Seasons 1 of the league did not track player statistics, and Seasons 1 and 2 used a division format for the regular season rather than a round robin used in Seasons 3, 4 and 5. This means that different tournaments have different types of data needed. I decided to implement ES6 JavaScript classes to use inheritance. The base class GWLSpreadsheet.js contains virtual methods for common requests from the server and allows each spreadsheet to retrieve and internally store its data however works best. For example, the loadSheetInfo function accesses the spreadsheet and enters important information to build the file structure (for example, the list of teams and midseason tournaments), and the batchGetAll function pulls all data from the sheet and places it in local JSON files. Then, the class can define methods such as getTeamInfo to retrieve a team's information to display on a web page. 

### Build.js and index.js, and data directory in Git

Since one of the project's main goals is to minimize the amount of code commits necessary to change website information, I have reduced most changes in the spreadsheet to the point of only requiring a season spreadsheet's id to be included in the code base. This requires that the code needs two sets of API requests to Google servers to cache its data. The first call is done in GWLSpreadsheet.loadSheetInfo and pulls data from an `Info` tab in the spreadsheet. This page contains important structural information such as the list of team names and midseason tournaments. The server then constructs a larger API BatchGet request that queries tabs named after each team and tournament for the detailed information on their respective pages. 

As loadSheetInfo is mainly necessary in constructing the tournament's data storage structure, it only changes on significant adjustments such as a new season beginning or a change in the number of teams or tournaments in a season. It would be possible to run this on server startup but it would add around 5 seconds to the server's start-up time. Given that the Heroku free plan already has a 5-10 second spin-up time for servers, it makes more sense to build this data before pushing code so it can skip this step. The main downside is that it updates the cached data on each commit which adds clutter to the repository. 

## Future update plans

- Create a "Website spreadsheet" to contain some information that does not change across seasons. This would include page view statistics which were removed temporarily after support for multiple seasons on the site was added. It could also store player profile page information and allow it to link to all teams a player has played on. 
- Adjust the data directory so that the git repository only stores the folder structure and the `/data/sheets.json` file that the server needs. 

## Glossary (for those unfamiliar with Overwatch or the Gopherwatch League)

| Term | Definition |
| :--- | :--------- |
| Overwatch | A team based first-person shooter with MOBA elements developed by Blizzard Entertainment |
| Heroes | Playable characters in Overwatch; each one has unique abilities and weapons |
| Roles | A general classification of heroes into three distinct categories: <br>Damage characters (referred to as DPS by the community) are good at dealing high damage and confirming eliminations. <br>Support characters can provide significant healing and abilities that assist other teammates. <br>Tank characters have higher health and abilities such as barriers to draw aggression and help keep teammates alive. |
| SR | Skill Rating, a rating assigned to players by playing the game's competitive mode. It is based on [competitive chess's Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system), which is designed to calculate relative skill levels between players in zero-sum games. This system is not perfect but does a good determination of a player's skill in relation to the rest of the player base on each role. |
| Season | In this repo, season refers to one season of the Gopherwatch League. These are typically four months in duration, and include a draft, a regular season of 7-9 weeks, and a postseason that lasts 3 weeks. There are also occasionally mid-season tournaments. (In Overwatch, season refers to a two-month block of time in the competitive mode, which records players' peak Skill Ratings.) |
| Team | A team of 6-10 players that compete together throughout the season. In game, six players can play at a time, and captains can switch players and roles in and out during each map (see below). |
| Match | A match played in the league. Each match is played between two teams at a time the captains agree upon based on player availability. Usually matches consist of a first-to-three series of maps (see below), though this is sometimes adjusted. For example, play-in matches can be first-to-two and the grand finals are often first-to-four. |
| Map (Overwatch) | Overwatch contains 21 maps (19 of which are legal in competitive matches), which are essentially "levels" in the game. They can have different objectives, such as controlling an area for a length of time or pushing a cart through a level. These usually separate teams into "attack" and "defense" positions, where the attacking team attempts to break the defense's position in order to gain objective control. Both teams must attack and defend on these points and the winner is whoever progresses the furthest. |
| Map (Gopherwatch League) | In the context of the Gopherwatch League (and Overwatch tournaments in general), each match is a series of maps played between teams. Since heroes can be better or worse on different maps, it is difficult to determine the better team from one map alone. So matches are scored based on which team wins more maps. |
| VOD | Video on Demand. This is the term the popular livestreaming website Twitch uses to refer to old streams stored on its servers that can be replayed similar to a YouTube video. Since VODs are deleted after roughly two weeks, the videos are exported to YouTube (when admins remember :stuck_out_tongue:). |
