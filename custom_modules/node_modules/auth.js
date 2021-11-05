// ==========
// Module containing a google authentication function
// this file is part of the GWL website which is hosted at www.gopherwatchleague.com
// git repository at https://github.com/hyperbola0/gopherwatch-league-site
// 
// This function was derived from the StackOverflow answer https://stackoverflow.com/a/43415567,
// with minor changes to function with my code base.
// As this is under a CC BY-SA 3.0 license, this is also distributed under a CC BY-SA 3.0 license. 
// To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/3.0/
// ==========

// require google auth library
const {GoogleAuth, JWT} = require('google-auth-library');

// the scopes needed for operations
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']; // spreadsheet.readonly if the sheet is only read from

/**
 * provides the user (our server) with a JWT client token
 */
function authorize() {
    return new Promise(resolve => {
        const authFactory = new GoogleAuth();
        const jwtClient = new JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL, // env variable with the google email
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // env variable with the private key
            scopes: SCOPES
        });

        jwtClient.authorize(() => resolve(jwtClient));
    });
}

module.exports = {
    authorize,
}