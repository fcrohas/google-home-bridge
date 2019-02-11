require('console-stamp')(console, '[HH:MM:ss.l]');
var fs = require('fs'),
  http = require('http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  fetch = require('node-fetch'),
  logger = require('morgan'),  
  devicesManager = require('./services/devices-manager'),
  app = express();
  // Routes
const authorization = require('./route/oauth2');
const homecontrol = require('./route/devices');
const jarvis = require('./route/jarvis');
// load device drivers
devicesManager.loadDrivers();
// Devices manager setter
jarvis.setDevicesManager(devicesManager);
homecontrol.setDevicesManager(devicesManager);

const requestSyncEndpoint = 'https://homegraph.googleapis.com/v1/devices:requestSync?key=';

app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(bodyParser.json());

function requestSync(authToken) {
  // REQUEST_SYNC
  const apiKey = "AIzaSyAExMyqMsll4ylWK8ZwompeFGzuIWcZHHI";
  const optBody = {
    'agentUserId': "googleassistant",
    'async': true
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  options.body = JSON.stringify(optBody);
  console.info("POST REQUEST_SYNC", requestSyncEndpoint + apiKey);
  console.info(`POST payload: ${JSON.stringify(options)}`);
  fetch(requestSyncEndpoint + apiKey, options).
    then(function(res) {
      console.log("request-sync response", res.status, res.statusText);
    });
}

// https mode
//https.createServer({
//  key: fs.readFileSync('letsencrypt/privkey.pem'),
//  cert: fs.readFileSync('letsencrypt/fullchain.pem')
//}, app).listen(443);

http.createServer(app).listen(80);

app.use(logger('dev'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/jarvis', jarvis.getRouter());
app.use('/homecontrol', homecontrol.getRouter());
app.use('/oauth2', authorization);

requestSync();
