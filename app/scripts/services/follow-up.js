'use strict';

angular.module('sedApp')
  .factory('FollowUp', function($q, formHub) {
    var FORM_ID = 18;
    var DATES = ['start', 'end', 'today', '_submission_time', 'ContactInformation/date_of_visit'];

    return {
      all: function() {
        var d = $q.defer();

        formHub.query({form_id: FORM_ID}).$promise
          .then(function(response) {
            for (var i = 0; i < response.length; i++) {
              var obj = response[i];

              angular.forEach(obj, function(value, key) {
                if (DATES.indexOf(key) >= 0)
                  this[key] = moment(value).toDate();

                if (angular.isString(value)) {
                  if (value.toLowerCase() == 'yes')
                    this[key] = true;
                  else if (value.toLowerCase() == 'no')
                    this[key] = false;
                }

                // angular 'orderBy' filter has issues with fields that have a '/'
                // in their names, so we add '/'-free versions of them for sorting.
                if (key.indexOf('/') >= 0)
                  this[key.replace(/\//g, '_')] = this[key];
              }, obj);
            }

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
