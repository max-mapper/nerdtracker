# nerdtracker

this is an IRC bot that uses the foursquare push API to send checkins (for users that have authorized it) into an IRC channel. this bot is currently running in #nerdtracker on freenode.

you'll need to generate your own options.js to use this, here's a template:

```js
var fs = require('fs')

module.exports = function() {
  return {
    baseURL: "https://myHTTPSendpointforfoursquarepushnotifications",
    ca:   fs.readFileSync('sub.class1.server.ca.pem'),
    key:  fs.readFileSync('ssl.key'),
    cert: fs.readFileSync('ssl.crt'),
    "fsqID": "",
    "fsqSecret": ""
  };
}
```

once you have all that stuff, just `npm install` and `npm start`. you'll probably need to use `sudo` to start it, as it binds to port 443
