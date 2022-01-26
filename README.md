# authorize
Authorization flows for common APIs using OAuth in Node.js

Code for all services be structured as follows: 
- Top-level directory (call it D) named after the service containing all relevant files
- file named after the service inside D, running which will print the Bearer token to the console
    - main() function inside this file will return the token, call as fit for your project
- secrets.json inside D containing any sensitive attributes required to fetch the Bearer token.
    - This must be filled out prior to running the above file
    - Make sure not commit these secrets to any repo. Add to .gitignore if needed, or (preferably) store them as an environment variable or some secure place like AWS secrets manager.
- examples.js containing small snippets using the service's API as a demonstration
- README.md containing service-specific callouts



See linked project in the Projects tab for status on the different services.
