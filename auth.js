const {GoogleAuth, JWT} = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function authorize() {
    return new Promise(resolve => {
        const authFactory = new GoogleAuth();
        const jwtClient = new JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
            scopes: SCOPES
        });

        jwtClient.authorize(() => resolve(jwtClient));
    });
}

module.exports = {
    authorize,
}