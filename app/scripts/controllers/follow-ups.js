'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($scope, $filter, ngTableParams, aggregatedData) {

    var RELOAD_DELAY = 300000;
    $scope.MAX_TEMP = 38;
    $scope.csvHeader = [
      'Name',
      'Time',
      'Interviewer',
      'Temperature',
      'Pharyngitis',
      'Haemorrhagic',
      'Headache',
      'Maculopapular',
      'Malaise',
      'Muscle Pain',
      'Vomiting'
    ];

    function getFileName() {
      return 'follow-ups-'+ $filter('date')(new Date(), 'yyyy-MM-dd hh-mm-ss');
    }

    $scope.fileName = getFileName();
    $scope.changeFileName = function() {
      $scope.fileName = getFileName();
    };

    var data = [];
    $scope.csvData = data;
    var loading = false;
    var locals = $scope.locals = {
      loading: true,
      error: false,
      totalItems: 0,
      currentPage: 1,
      tableParams: new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          time: 'desc'
        }
      }, {
        total: 0,
        counts: [],
        getData: function($defer, params) {
          loading = true;
          if (data.length)
            resolve(data);
          else {

            aggregatedData.mergedData()
              .then(function(merged) {
                data = merged;
                $scope.csvData = data;
                resolve(data);
              })
              .catch(function() {
                data = [];
                resolve(data);
                locals.error = true;
              })
              .finally(function() {
                loading = false;
                locals.loading = false;
              });

          }

          function resolve(data) {
            var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            locals.totalItems = orderedData.length;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        }
      })
    };

    setInterval(function() {

      if (!loading) {
        loading = true;
        aggregatedData.mergedData()
          .then(function(merged) {
            data = merged;
            $scope.csvData = data;
            locals.tableParams.reload();
          })
          .catch(function(reason) {
            console.error(reason);
          })
          .finally(function() {
            loading = false;
          });
      }

    }, RELOAD_DELAY);

  });
