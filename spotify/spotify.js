const spotifyAPI = require("spotify-web-api-node");
const _ = require('lodash');

const { CLIENT_ID, CLIENT_SECRET } = require("./my_secrets.json");

async function main() {
    if (_.some([CLIENT_ID, CLIENT_SECRET], secret => !secret)) logger.error(`Please define the CLIENT_ID and CLIENT_SECRET variables in ${__dirname}/secrets.json`)
    const spotifyClient = new spotifyAPI({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });
    
    const token = await spotifyClient.clientCredentialsGrant();
    return token.body.access_token;
}

(async () => {
    console.log(`Access Token: \n${await main()}\n`);
})();
