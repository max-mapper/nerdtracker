var https = require('https')
var request = require('request')
var qs = require('querystring')
var tako = require('./tako.js')

var irc = require('irc');
var bot = new irc.Client('irc.freenode.net', 'nerdtracker5000', {
  channels: ['#nerdtracker'],
  retryCount: 5,
  retryDelay: 5000,
  debug: true // turns on verbose logging
})

var options = require('./options.js')()

var t = tako()
t.middle('json')

t.route('/', function(req, resp) {
  resp.end('go to /nerdtracker/login to register')
})

function getName(user){
  //look for a freenode irc name
  var match = /([^@< [\^{}-]+)@freenode.net/.exec(user.bio);
  return user.firstName + ((match && ' ('+match[1]+')') || '');
}

t.route('/nerdtracker/push', function(req, resp) {
  req.on('data', function (data) {
	data = qs.parse(data.toString());
    var checkin = JSON.parse(data.checkin);
	var name = getName(JSON.parse(data.user));
    var msg = name + ' just checked in at ' + checkin.venue.name
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
  return https.createServer(options, handler)
}, 443)
