# Gopherwatch League Website

![The Gopherwatch League logo](/public/images/Gopherwatch_League.png)

## Description

This repository contains the code for the Gopherwatch League's website, which is hosted with Heroku at [www.gopherwatchleague.com](www.gopherwatchleague.com). The backend for the site runs on Node.js, utilizing Google Sheets as a database. The frontend uses html, css and javascript. 

### "What the #&%! is that backend setup?!?"

In previous seasons, league information was kept updated in a Google spreadsheet shared with players. This allowed an easy way to quickly update information after matches, as well as allow league participants to read sheets in a decently well-formatted way. However, the admin team had some features we wanted such as statistics that were not as clear in a spreadsheet, and the sheet itself was somewhat difficult to navigate. 

In May 2021, I suggested developing a website that would pull data from spreadsheets and present information in a more digestible manner. I had prior experience using Node.js hosted on Heroku from a course I took in Fall 2020, and began writing up a server that used Google's API to pull data from a spreadsheet. 

The initial variant of the site called Google APIs on each page load to load data, but I quickly ran into a big issue. The free tier of Google sheets's API only allows for 60 requests per second, which would stop access for everyone if someone just refreshed a page repeatedly. I realized I had to cache the data from the sheet somewhere, but Heroku does not have persistent storage so I would lose the data every time the server was inactive. I eventually came to the solution where the server waits for all API queries to resolve and cache before attaching to the port to ensure visitors get the most recent data. 

### Features

- Easily access multiple seasons of the league through the website
- Update most data through the spreadsheets, not requiring commits to make updates
- Access tournament standings, match schedule, team and player stats, and customizable player pages

### To-Do list

- Playoff tab and bracket
- Unify player profiles across seasons
- Webpage UI overhaul

## Instructions

### Building and running

Install Node.js and download/extract this project. It is designed to work with Heroku which uses environmental variables to hold values such as API access tokens and the port to listen to. You can set these up yourself or use a Node plugin to read from a file if you are running the server locally. 

First, run `npm run-script build`, which creates a directory for all the seasons used and caches the current data in these folders. After this, run `npm start` to start the server. 

### Add a new season to the website

If the season is using a new format, follow [these instructions](#create-a-new-season-format) to create a new format for the backend to parse the sheet properly. 

Create a spreadsheet for the new season and share it with the Google account your api token is connected to. Then open [build.js](build.js) and add a new sheet in the build function. Then follow the instructions in [Building and running](#building-and-running) to cache the new data. 

### Create a new season format

To create a new season format, first set up a new Google spreadsheet. Figure out a way to enter data in a manner that makes it easy to use one `spreadsheets.values.batchGet` call, as the Google API limits calls per minute and each season requires one, as well as website statistics update. 

After this, create a new GWLSpreadsheet class. Duplicate [GWLSpreadsheetTemplate](custom_modules/node_modules/SheetClasses/GWLSpreadsheetTemplate.js) and follow the instructions and TODO comments to correctly parse the data from the spreadsheet (see [GWLRoundRobinSpreadsheet](custom_modules/node_modules/SheetClasses/GWLRoundRobinSpreadsheet) for a working example). Then, edit [spreadsheet-types](custom_modules/node_modules/spreadsheet-types.js) to add a `require` statement, and update the if/else statement in the `loadSheet()` function to allow it to load the new class. Finally, go to [build.js](build.js) and add its constructor to the array in build.js, which will automatically build the directory, get teams from the sheet and run a batchGetAll to cache data. 

### Other common stuff

will be added soon :)

## 