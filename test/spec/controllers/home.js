'use strict';

describe('Home controller', function() {

  var rootScope, scope, controller;

  beforeEach(module('sedApp'));

  beforeEach(inject(function(_$rootScope_, _$controller_) {
    rootScope = _$rootScope_;
    scope = _$rootScope_.$new();
    controller = _$controller_('HomeCtrl', {$scope: scope});
  }));

  it('scope should exist', function() {
    expect(scope).toBeDefined();
  });
});