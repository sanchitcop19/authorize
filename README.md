# authorize
Authorization flows for common APIs using OAuth in Node.js

Code for all services be structured as follows: 
- Top-level directory (call it D) named after the service containing all relevant files
- file named after the service inside D, running which will print the Bearer token to the console
- secrets.json inside D containing any sensitive attributes required to fetch the Bearer token
- examples.js containing small snippets using the service's API as a demonstration

Done:

- Dropbox

Coming:

- Spotify
- Google APIs
