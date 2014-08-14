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

            contactFactory.all()
              .then(function(senseContacts) {
                data = senseContacts.rows
                  .map(function(senseData) {
                    return {
                      name: senseData.value.Surname + ' ' + senseData.value.OtherNames,
                      time: senseData.key,
                      interviewer: senseData.value.visitData.interviewer,
                      temperature: senseData.value.visitData.symptoms.temperature,
                      diarrhoea: senseData.value.visitData.symptoms.diarrhoea,
                      pharyngitis: senseData.value.visitData.symptoms.pharyngitis,
                      haemorrhagic: senseData.value.visitData.symptoms.haemorrhagic,
                      headache: senseData.value.visitData.symptoms.headache,
                      maculopapular: senseData.value.visitData.symptoms.maculopapular,
                      malaise: senseData.value.visitData.symptoms.malaise,
                      musclePain: senseData.value.visitData.symptoms.musclePain,
                      vomiting: senseData.value.visitData.symptoms.vomiting
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
