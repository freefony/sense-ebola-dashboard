'use strict';

describe('SED', function() {
  beforeEach(function() {
    // See e2e/home.js
    browser.ignoreSynchronization = true;
  });

  it('should redirect to the login page', function() {
    browser.get('/');
    var expected = browser.baseUrl + '/#/login?back=';
    expect(browser.getCurrentUrl()).toEqual(expected);
  });

  describe('login page', function() {
    beforeEach(function() {
      browser.get('/#/login');
    });

    it('should disable submit if username/password are missing', function() {
      var form = element(by.tagName('form'));
      var submitButton = form.element(by.tagName('button'));
      expect(submitButton.isEnabled()).toBe(false);
    });
  });
});
