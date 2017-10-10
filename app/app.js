
let server = require('./server');
let apiconnect = require('./apiconnect');
let filemanager = require('./filemanager');

const { parseString } = require('xml2js');

/**
 * Setting each config dependency 
 */
const config = require('./config')[process.env.NODE_ENV];
server.setConfig(config.server);
apiconnect.setConfig(config.api);
filemanager.setConfig(config.files);

/**
 * Endpoint for feeds
 */
server.init();

/**
 * Send JSON to Gladiadores API 
 */
server.eventEmitter.on('received', (xml, info) => {
  const opt = {
    explicitArray: false, 
    attrkey: "attrs", 
    charkey: "val"
  };

  parseString(xml, opt, (err, json) => {
    if (err) {
      console.log('Error parsing XML', err);
    }
    else {
      apiconnect.sendData(json, info);
    }

    filemanager.saveXML({
      file: xml,
      details: info
    });
  });
});

/**
 * Log JSON if API accepted it
 */
apiconnect.eventEmitter.on('sended', (data, info) => {
  filemanager.saveJSON({ 
    file: JSON.stringify(data),
    details: info
  });
});