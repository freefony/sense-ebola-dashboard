'use strict';

describe('SED auth', function() {
  beforeEach(function() {
    // See e2e/home.js
    browser.ignoreSynchronization = true;
  });

  it('should redirect to the login page', function() {
    browser.get('/');
    var expected = browser.baseUrl + '/#/login?back=';
    expect(browser.getCurrentUrl()).toEqual(expected);
  });

  it('should not submit if username/password are missing', function() {
    browser.get('/#/login');
    var form = element(by.tagName('form'));
    form.submit();
    var helpBlocks = form.all(by.css('.help-block'));
    expect(helpBlocks.count()).toBe(1);
  });
});
