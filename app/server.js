
const app = require('express')();
const bodyParser = require('body-parser');
const moment = require('moment');
const { EventEmitter } = require('events');

let eventEmitter = new EventEmitter();
let port;

function setConfig(config) {
  port = config.port;
}

/**
 * Body parser middleware
 */
app.use((req, res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk;
  });

  req.on('end', () => {
    next();
  });
});

/**
 * Route for accept the XML feeds
 */
app.post('/feeds', (req, res) => {
  
  let xml = req.rawBody;

  // response to data provider
  res.sendStatus(200);

  const reqInfo = {
    feedType: req.get('x-meta-feed-type') || 'N',
    competition: req.get('x-meta-competition-id') || 'N',
    season: req.get('x-meta-season-id') || 'N',
    timestamp: req.get('x-meta-production-server-timeStamp') ? 
      req.get('x-meta-production-server-timeStamp').replace(/:|-| /g,"") : 
      moment().format('YYYYMMDDHHmmss')
  };

  // notify the app
  eventEmitter.emit('received', xml, reqInfo);

});

/**
 * Start the server
 */
function init() {
  let server = app.listen(port, () => {
    console.log('Server listening at port localhost:%s', server.address().port);
  });
  return server;
}

module.exports = { eventEmitter, setConfig, init }