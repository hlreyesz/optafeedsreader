
const request = require('request');
const { EventEmitter } = require('events');

let eventEmitter = new EventEmitter();
let url, auth;

function setConfig(config) {
  url = config.url;

  let buffer = new Buffer(config.key + ':' + config.secret);
  auth = buffer.toString('base64');
}

/**
 * Send JSON to Gladiadores API using Basic Auth
 */
function sendData(data, info) {
  request({
    url: url,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth
    },
    json: true,
    body: data
  }, function(error, response) {
    if (error) {
      console.log('Error sending data to API: ', error);
    }
    else if (response && response.statusCode != 200) {
      console.log('API response status: ' + response.statusCode);
    }
    else {
      eventEmitter.emit('sended', data, info);
    }
  });
}

module.exports = { eventEmitter, setConfig, sendData }