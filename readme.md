# nerdtracker

this is an IRC bot that uses the foursquare push API to send checkins (for users that have authorized it) into an IRC channel. this bot is currently running in #nerdtracker on freenode.

you'll need to generate your own options.js to use this, here's a template:

```js
var fs = require('fs')

module.exports = function() {
  return {
  	nick: "nerdtracker5000",
  	channels: ["#nerdtracker"],
    baseURL: "https://myHTTPSendpointforfoursquarepushnotifications",
    port: 443,
    ca:   fs.readFileSync('sub.class1.server.ca.pem'), // omit if not handing SSL
    key:  fs.readFileSync('ssl.key'), // omit if not handling SSL
    cert: fs.readFileSync('ssl.crt'), // omit if not handling SSL
    "fsqID": "",
    "fsqSecret": ""
  };
}
```

once you have all that stuff, just `npm install` and `npm start`. you'll probably need to use `sudo` to start it, as it binds to port 443
