
process.env.NODE_ENV = 'test';

let chai = require('chai');
let should = require('chai').should();
chai.use(require('chai-fs'));
let rewire = require('rewire');
let parser = require('xml2js').parseString;
let moment = require('moment');
let fs = require('fs');
let path = require('path');

let filemanager = rewire('../app/filemanager');
const config = require('../app/config')[process.env.NODE_ENV].files;
const basepath = config.basepath;

const headersInfo = {
  feedType: '1',
  competition: '123',
  season: '2017',
  timestamp: moment().format('YYYYMMDDHHmmss')
};

const testXML = `
  <?xml version="1.0" encoding="UTF-8"?>
  <!-- Copyright 2001-2015 Opta Sportsdata Ltd. All rights reserved. -->

  <!-- PRODUCTION HEADER
       produced on:        valde-jobq-a05.nexus.opta.net
       production time:    20150730T010037,183Z
       production module:  Opta::Feed::XML::Soccer::F9
  -->
  <SoccerFeed TimeStamp="20150730T020037+0100">
    <SoccerDocument Type="Latest" uID="f827601">
      <Competition uID="c420">
        <Country>Copa Libertadores</Country>
        <Name>Copa Libertadores</Name>
        <Round>
          <Name>Final</Name>
          <RoundNumber>6</RoundNumber>
        </Round>
        <Stat Type="season_id">2014</Stat>
        <Stat Type="season_name">Season 2014/2015</Stat>
        <Stat Type="symid">SUD_CL</Stat>
        <Stat Type="matchday">15</Stat>
      </Competition>
    </SoccerDocument>
  </SoccerFeed>
`;

let xmlfilename = [headersInfo.competition, headersInfo.season, headersInfo.feedType, headersInfo.timestamp].join('-') + '.xml';
let xmlfilepath = path.join(basepath, 'xml', xmlfilename);

let testJSON;

let jsonfilename = [headersInfo.competition, headersInfo.season, headersInfo.feedType, headersInfo.timestamp].join('-') + '.json';
let jsonfilepath = path.join(basepath, 'json', jsonfilename);

describe('File Manager', function() {

  beforeEach(function() {
    filemanager.setConfig({basepath: basepath});
  });

  describe('Config', function() {

    it('should set files base path by config', function() {
      filemanager.__get__('basepath').should.equal(basepath);
    });

  });

  describe('Saving XML files', function() {

    it('should save a .xml file', function(done) {

      filemanager.saveXML({
        file: testXML,
        details: headersInfo
      });

      setTimeout(function() {
        xmlfilepath.should.be.a.file();
        done();
      }, 100);

    });

    it('should have XML format content', function(done) {

      fs.readFile(xmlfilepath, 'utf8', function(err, data) {
        data.should.equal(testXML);
        done();
      });

    });

  });

  describe('Saving JSON files', function() {

    it('should save a .json file', function(done) {

      const opt = {
        explicitArray: false, 
        attrkey: "attrs", 
        charkey: "val"
      };

      parser(testXML, opt, (err, json) => {
        testJSON = json;

        filemanager.saveJSON({
          file: JSON.stringify(json),
          details: headersInfo
        });
      });

      setTimeout(function() {
        jsonfilepath.should.be.a.file();
        done();
      }, 100);

    });

    it('should have JSON format content', function(done) {

      fs.readFile(jsonfilepath, 'utf8', function(err, data) {
        data.should.equal(JSON.stringify(testJSON));
        done();
      });

    });

  });

});