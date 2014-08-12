'use strict';

angular.module('sedApp')
  .factory('formHub', function($resource, SETTINGS) {
    return $resource(SETTINGS.formHubUrl + ':form_id', {
      form_id: '@form_id'
    }, {
    });
  });
