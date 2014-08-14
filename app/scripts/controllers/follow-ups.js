'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($scope, $filter, ngTableParams, aggregatedData) {

    var data = [];
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
          if (data.length)
            resolve(data);
          else {

            aggregatedData.mergedData()
              .then(function(merged) {
                data = merged;
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
