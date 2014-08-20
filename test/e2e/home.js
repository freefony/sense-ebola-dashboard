'use strict';

describe('SED homepage', function() {
  beforeEach(function() {
    // XXX: Protractor will wait until `$http` calls have resolved on first page
    // load. App makes multiple calls to API which fail until user has logged
    // in, hence Protractor will never synchronise. Blocked on item:71
    browser.ignoreSynchronization = true;

    browser.get('/');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('EOC Lagos | Ebola Outbreak Response');
  });
});
