'use strict';

angular.module('sedApp')
  .factory('FollowUp', function($q, formHub) {
    var FORM_ID = 14;

    return {
      all: function() {
        var d = $q.defer();

        formHub.query({form_id: FORM_ID}).$promise
          .then(function(response) {
            angular.forEach(response, function(obj) {
              angular.forEach(obj, function(value, key) {
                if (key == 'date_visit' || key == '_submission_time')
                  obj[key] = new Date(value);
                else if (value == 'yes')
                  obj[key] = true;
                else if (value == 'no')
                  obj[key] = false;
              });
            });

            d.resolve(response);
          })
          .catch(function(error) {
            console.log(error);
            d.reject(error);
          });

        return d.promise;
      }
    }
  });
