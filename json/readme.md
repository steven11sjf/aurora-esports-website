# Data storage structure

Data is mainly stored within json files in `/json/`. The file structure used to access is described below. 

## Directory structure
```
json/
| seasons.json
|-season/
  | matchlog.json
  | herostats.json
  | standings.json
  | players.json
  |-teams/
    | team.json
```

## json/seasons.json

Seasons are stored internally as classes defined in `./custom_modules/spreadsheet-types.js`. These each contain the structure of related spreadsheets and the functions used to access information in them. Spreadsheets are stringified and saved into `json/seasons.json`, and each class has a static function that loads these structures into an instance. 

## json/season

Seasons each have a folder generated using their internal name (for example, json/season3 or json/foo), where the internal name is stored in seasons.json. Each season's info is separated in this manner. 

## json/season/matchlog.json

The matchlog files store all match log info for that season. Each match is a row in the `matches` array. These objects contain the teams that played, the time and date of the match, the round number, a vod link, the maps played and winners of each, the winner of the match, and other data relevant to the season's structure (i.e. division and tournament). 

## json/season/herostats.json

The herostats files store all player's hero data. This is stored as a series of values stored in the `stats` array. These objects contain the player battletag, the hero played, and their cumulative stats. 

## json/season/standings.json

The standings files store the season's current standings. Pretty self-explanatory. 

## json/season/players.json

The players files store all players' information. This is data for the player pages and draft. 

## json/season/teams/team.json

The team files store information related to a team and are used to load the team pages. These store rosters, map winrate info, matches from the team, and season stats such as wins/losses, map W/L/T/DIFF, and standings ranking. 