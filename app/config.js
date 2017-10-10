
const path = require('path');

module.exports = {
  prod: {
    server: {
      port: 8989
    },
    api: {
      url: 'http://glad.com/feeds',
      key: 'prodkey',
      secret: 'prodsecret',
    },
    files: {
      basepath: path.normalize(__dirname + '/../feeds/')
    }
  },
  dev: {
    server: {
      port: 8989
    },
    api: {
      url: 'http://localhost:3001/feeds',
      key: 'devkey',
      secret: 'devsecret',
    },
    files: {
      basepath: path.normalize(__dirname + '/../feeds/')
    }
  },
  test: {
    server: {
      port: 3000
    },
    api: {
      url: 'http://localhost:3001/feeds',
      key: 'testkey',
      secret: 'testsecret',
    },
    files: {
      basepath: path.normalize(__dirname + '/../test/feeds/')
    }
  },
};