var crypto = require('crypto')
var fs = require("fs")
var https = require('https')
var http = require("http")
var request = require('request')
var url = require('url')
var querystring = require('querystring')
var qs = require('querystring')
var irc = require("irc")
var tako = require('./tako.js')

var options = require('./options.js')()
if( !options.port ) port = 443;

var irc = require('irc');
var bot = new irc.Client('irc.freenode.net', options.nick, {
  channels: options.channels,
  retryCount: 5,
  retryDelay: 5000,
  debug: true // turns on verbose logging
})

var t = tako()
t.middle('json')

t.route('/', function(req, resp) {
  resp.end('go to /nerdtracker/login to register')
})

t.route('/nerdtracker/push', function(req, resp) {
  req.on('data', function (data) {
    var checkin = JSON.parse(qs.parse(data.toString()).checkin)
    var msg = checkin.user.firstName + ' just checked in at ' + checkin.venue.name
    if (checkin.venue && checkin.venue.location && checkin.venue.location.address) msg = msg + ' (' + checkin.venue.location.address + ', ' + checkin.venue.location.city + ')'
    if (checkin.shout) msg = msg + ': ' + checkin.shout
    bot.say('#nerdtracker', msg)
  })

  req.on('end', function() {
    resp.end('thanks foursquare')
  })
})

t
  .route('/nerdtracker/login', function (req, resp) {
    var u = 'https://foursquare.com/oauth2/authenticate'
        + '?client_id=' + options.fsqID
        + '&response_type=code'
        + '&redirect_uri=' + options.baseURL + '/nerdtracker/callback'
        ;
    resp.statusCode = 302
    resp.setHeader('location', u)
    resp.end()
  })

t
  .route('/nerdtracker/callback', function (req, resp) {
    var u = 'https://foursquare.com/oauth2/access_token'
       + '?client_id=' + options.fsqID
       + '&client_secret=' + options.fsqSecret
       + '&grant_type=authorization_code'
       + '&redirect_uri=' + options.baseURL + '/nerdtracker/callback'
       + '&code=' + req.qs.code
       ;
    request.get({url:u}, function (e, r, body) {
      resp.statusCode = 200
      var dataz = JSON.parse(body)
      dataz.registration_success = true
      dataz.all_done = true
      bot.say('#nerdtracker', 'a new person just registered!')
      resp.end(JSON.stringify(dataz))
    })
  })
  
t.listen(function(handler) {
  if( options.ca && options.key && options.cert ){
    return https.createServer(options, handler)
  }
  else {
    return http.createServer(handler)
  }
}, options.port)
