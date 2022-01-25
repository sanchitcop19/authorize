const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const _ = require("lodash");

const SECRETS_FILENAME = "./secrets.json";
const {
    CLIENT_ID,
    CLIENT_SECRET,
    ACCESS_CODE,
    REFRESH_TOKEN,
} = require(SECRETS_FILENAME);

const TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";

/**
 *
 * NOTE: You only need to do this once, but perform the following steps before running this file:
 *
 * 1. Navigate to this URL: https://www.dropbox.com/oauth2/authorize?client_id={CLIENT_ID}&response_type=code&token_access_type=offline
 * 2. Give the necessary permissions by following the wizard
 * 3. Copy the access code shown on the website at the end and store it in ACCESS_CODE inside secrets.json
 * 4. Set the CLIENT_ID and CLIENT_SECRET variables in secrets.json, they are App key and App secret respectively from the Dropbox app console
 *
 * The access code retrieved above is single use, so if you run into errors make sure to perform the above steps again before re-trying.
 * Also make sure to document your issue in the Issues tab for this repo.
 *
 */

/**
 *
 * Using the access code obtained through the auth flow described at the top of the file, it fetches a short-lived access token and
 * a refresh token. The refresh token is stored in the secrets.json file and is used to retrieve an access token each time an access
 * token expires.
 *
 * @returns {Object}
 */
async function authorize() {
    if (REFRESH_TOKEN) return { refresh_token: REFRESH_TOKEN };

    let tokenResponse;

    try {
        const formData = new FormData();
        _.entries({
            code: ACCESS_CODE,
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }).forEach((attribute) => formData.append(attribute[0], attribute[1]));

        tokenResponse = await axios({
            url: TOKEN_URL,
            method: "post",
            headers: formData.getHeaders(),
            data: formData,
        });
    } catch (err) {
        // if the above API fails, run the script in debug mode to inspect the error object.
        // Logging the error object does not seem to print the reason
        throw err;
    }

    const { access_token, refresh_token } = tokenResponse.data;

    fs.writeFileSync(
        path.join(__dirname, SECRETS_FILENAME),
        JSON.stringify({
            CLIENT_ID,
            CLIENT_SECRET,
            ACCESS_CODE,
            REFRESH_TOKEN: refresh_token,
        })
    );

    return { access_token, refresh_token };
}

/**
 * Using the refresh token, fetch a short lived Bearer token. This token can be used to authorize any other Dropbox requests (e.g. listing files, deleting files etc.)
 * by passing in the Authorization header set to "Bearer {access_token}" without the double quotes. The sl. at the beginning of the token stands for short-lived.
 *
 * @param {Object} arg
 * @param {String} access_token Bearer token received in the same flow used to fetch the refresh token.
 *                              This will only be passed in the first time the app is authorized since we receive the access token along with the refresh token,
 *                              and the token will be fetched through the API in all subsequent runs since we have the refresh token stored.
 * @param {String} refresh_token Static token used to fetch a short-lived Bearer token, saved in secrets.json
 * @returns
 */
async function getAccessToken({ access_token, refresh_token }) {
    if (access_token) return access_token;

    const formData = new FormData();
    _.entries({
        refresh_token,
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    }).forEach((attribute) => formData.append(attribute[0], attribute[1]));

    const tokenResponse = await axios({
        url: TOKEN_URL,
        method: "post",
        headers: formData.getHeaders(),
        data: formData,
    });

    return tokenResponse.data.access_token;
}

async function getDropboxToken() {
    const { access_token, refresh_token } = await authorize();
    const token = await getAccessToken({ access_token, refresh_token });
    return token;
}

// run the dropbox.js file to view the token in the console output
// import getDropboxToken in your module as fit and use the return value in other Dropbox API requests
(async () => {
    if (_.some([ACCESS_CODE, CLIENT_ID, CLIENT_SECRET], attribute => !attribute)) {
        console.error(`ERROR: Please set all variables inside ${__dirname}/secrets.json before proceeding`);
        return;
    }
    console.log(await getDropboxToken());
})();
