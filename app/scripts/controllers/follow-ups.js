'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($scope, $filter, ngTableParams, aggregatedData) {
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
      tableParams: new ngTableParams({
        page: 1,
        count: 20,
        sorting: {
          time: 'desc'
        }
      }, {
        total: 0,
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
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        }
      })
    };

    function exportToCSV() {



    }

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

    }, 300000);

  });
