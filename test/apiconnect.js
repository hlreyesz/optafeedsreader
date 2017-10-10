
process.env.NODE_ENV = 'test';

let chai = require('chai');
let should = require('chai').should();
chai.use(require('chai-http'));
let rewire = require('rewire');
let parser = require('xml2js').parseString;

require('./test-server/api-test-server');

let api = rewire('../app/apiconnect');
const config = require('../app/config')[process.env.NODE_ENV].api;

describe('API', function() {

  beforeEach(function() {
    api.setConfig(config);
  });

  describe('Config', function() {

    it('should set url by config', function() {

      api.__get__('url').should.equal(config.url);

    });

    it('should create auth token by config', function() {

      let buffer = new Buffer(config.key + ':' + config.secret);
      const auth = buffer.toString('base64');

      api.__get__('auth').should.equal(auth);

    });

  });

  describe('Request', function() {

    it('should send JSON created from XML and details and emit \'sended\' event with same params', function(done) {

      const headersInfo = {
        feedType: 'N',
        competition: 'N',
        season: 'N',
        timestamp: 'N'
      };

      const xml = `
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

      const opt = {
        explicitArray: false, 
        attrkey: "attrs", 
        charkey: "val"
      };

      parser(xml, opt, function(err, json) {
        should.not.exist(err);
        json.should.be.an('object');

        api.sendData(json, headersInfo);

        api.eventEmitter.on('sended', function(data, info) {
          data.should.deep.equal(json);
          info.should.deep.equal(headersInfo);
          done();
        });
      });

    });

  });

});