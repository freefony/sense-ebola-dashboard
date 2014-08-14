'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($scope, $filter, ngTableParams, FollowUp, contactFactory) {

    var data = [];
    var locals = $scope.locals = {
      loading: true,
      error: false,
      tableParams: new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          end: 'desc'
        }
      }, {
        total: 0,
        getData: function($defer, params) {
          if (data.length)
            resolve(data);
          else {

            FollowUp.all()
              .then(function(formHubData) {
                var response = {
                  Yes: true,
                  No: false
                };

                data = formHubData
                  .map(function(senseData) {
                    return {
                      name: senseData['ContactInformation/contact_name'],
                      time: senseData['_submission_time'],
                      interviewer: senseData['WELCOME/Contact_tracer'],
                      temperature: senseData['Clinicals/Temp_reading'],
                      diarrhoea: response[senseData['Clinicals/Anydiaarrhea']],
                      pharyngitis: response[senseData['Clinicals/Anypharyngitis']],
                      haemorrhagic: response[senseData['Clinicals/Anyhaemorrhagicsigns']],
                      headache: response[senseData['Clinicals/AnyHeadaches']],
                      maculopapular: response[senseData['Clinicals/Anymacuplopapularash']],
                      malaise: response[senseData['Clinicals/Anymalaise']],
                      musclePain: response[senseData['Clinicals/Anymusclepain']],
                      vomiting: response[senseData['Clinicals/Anyvomiting']]
                    };
                  });
                resolve(data);
              })
              .catch(function() {
                data = [];
                resolve(data);
                locals.error = true;
              })
              .finally(function() {
                locals.loading = false;
              });

          }

          function resolve(data) {
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        }
      })
    };

  });
