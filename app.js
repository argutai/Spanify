var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const path = require('path');
const { translate } = require('google-translate-api-browser');
const bodyParser = require('body-parser');


var client_id = process.env.client_id;
var client_secret = process.env.client_secret;
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri


const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

var app = express();
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/showsong', function(req, res) {
  // Redirect the user to the showsong page with access_token embedded in the URL
  res.sendFile(path.join(__dirname, 'public', 'showsong.html'));
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    async function gettokens(options) {
      return new Promise((resolve, reject) => {
        request.post(options, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            resolve(body);
          } else {
            res.redirect('/#' +
            querystring.stringify({
            error: 'invalid_token'
          }));
        }});
      });
    }

    (async () => {

      // Get Access token
      const tokens = await gettokens(authOptions);
      const access_token = tokens.access_token;
      const refresh_token = tokens.refresh_token;

      res.redirect('/showsong?access_token=' + access_token);

    })();
  }
});


app.use(bodyParser.json());
app.post('/translate', async (req, res) => {
  try {
    const stringData = req.body.stringData;
    const translation = await translate(stringData, { to: "en", corsUrl: "http://cors-anywhere.herokuapp.com/" });
    console.log(translation.text);
    res.send(translation.text); // Send the translated text to the client
  } catch (err) {
    console.error(err);
    res.status(500).send('Error translating string');
  }
});

console.log('Listening on 8888');
app.listen(8888);