'use strict';

angular.module('sedApp')
  .service('dataLoader', function aggregatedData($rootScope, $q, FollowUp, contactFactory) {
    var followUps = [];
    var contacts = [];

    function load() {
      $q.all([
          FollowUp.all(),
          contactFactory.all()
        ])
        .then(function(response) {
          var updated = false;

          if (!angular.equals(followUps, response[0])) {
            followUps = response[0];
            updated = true;
          }

          if (!angular.equals(contacts, response[1])) {
            contacts = response[1];
            updated = true;
          }

          if (updated)
            $rootScope.$emit('dataUpdated');
        })
    }
  });
