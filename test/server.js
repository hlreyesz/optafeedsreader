
let chai = require('chai');
let should = require('chai').should();
chai.use(require('chai-http'));
let rewire = require('rewire');

let server = rewire('../app/server');
const config = require('../app/config')[process.env.NODE_ENV].server;
const port = config.port

describe('Server', function() {

  beforeEach(function() {
    server.setConfig({port:port});
  });

  describe('Config', function() {

    it('should set port by config', function() {
      server.__get__('port').should.equal(port);
    });

    it('should init in port setted', function() {
      let httpServer = server.init();
      httpServer.address().port.should.equal(port);
      httpServer.close();
    });

  });

  describe('Request / Response', function() {

    let httpServer;
    beforeEach(function() {
      httpServer = server.init();
    });

    it('should respond OK on POST /feeds', function(done) {

      chai.request(httpServer)
        .post('/feeds')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          done();
        });

    });

    it('should emit \'received\' event with raw body xml as first param', function(done) {

      const sendedXML = `
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

      let emmittedXML;

      chai.request(httpServer)
        .post('/feeds')
        .send(sendedXML)
        .end(function(err, res) {
          emmittedXML.should.equal(sendedXML);
          done();
        });

      server.eventEmitter.on('received', function(xml, reqInfo) {
        emmittedXML = xml;
      });

    });

    it('should emit \'received\' event with request custom headers as second param', function(done) {

      const headerTimestamp = '2017-01-01 12:00:00';
      const headersInfo = {
        feedType: '1',
        competition: '123',
        season: '2017',
        timestamp: headerTimestamp.replace(/:|-| /g,"")
      };

      let infoToCheck;

      chai.request(httpServer)
        .post('/feeds')
        .set('x-meta-feed-type', headersInfo.feedType)
        .set('x-meta-competition-id', headersInfo.competition)
        .set('x-meta-season-id', headersInfo.season)
        .set('x-meta-production-server-timeStamp', headerTimestamp)
        .end(function(err, res) {
          infoToCheck.should.be.deep.equal(headersInfo);
          done();
        });

      server.eventEmitter.on('received', function(xml, info) {
        infoToCheck = info;
      });

    });

    afterEach(function() {
      httpServer.close();
    });

  });

});