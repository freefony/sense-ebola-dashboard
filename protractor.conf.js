'use strict';

function getCapabilities() {
  var browsers = {
    chrome: {
      browserName: 'chrome',
      chromeOptions: {
        args: [
          '--disable-extensions'
        ]
      },
    },
    firefox: {
      browserName: 'firefox',
    },
    safari: {
      browserName: 'safari'
    },
    opera: {
      browserName: 'opera'
    }
  };

  var capabilities = [
    browsers.chrome
  ];

  if (process.env.PROTRACTOR_BROWSERS) {
    var env = process.env.PROTRACTOR_BROWSERS.split(',');
    capabilities = env.map(function(browser) {
      if (browsers[browser]) {
        return browsers[browser];
      }
    });
  }

  if (process.env.TRAVIS) {
    var options = {
      build: process.env.TRAVIS_BUILD_NUMBER,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      name: 'Sense Ebola Dashboard E2E Tests'
    };

    capabilities.push(browsers.firefox, browsers.opera);

    capabilities = capabilities.map(function(browser) {
      for (var prop in options) {
        browser[prop] = options[prop];
      }
      return browser;
    });
  }

  return capabilities;
}

exports.config = {
  specs: [
    'test/e2e/**/*.js'
  ],
  multiCapabilities: getCapabilities(),
  baseUrl: 'http://localhost:9001'
};
