
const fs = require('fs');
const path = require('path');

let basepath;

function setConfig(config) {
  basepath = config.basepath;
}

function createFile(filename, data) {
  fs.writeFile(filename, data, err => {
    if (err) {
      return console.log('Error saving file', err);
    }
  });
}

function saveFile(obj, type) {
  let filename = [obj.details.competition, obj.details.season, obj.details.feedType, obj.details.timestamp].join('-') + '.' + type;

  createFile(path.join(basepath, type, filename), obj.file);
}

function saveXML(obj) {
  saveFile(obj, 'xml');
}

function saveJSON(obj) {
  saveFile(obj, 'json');
}

module.exports = { setConfig, saveXML, saveJSON }