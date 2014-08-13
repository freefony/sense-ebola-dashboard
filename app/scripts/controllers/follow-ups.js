'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($scope, $filter, ngTableParams, FollowUp) {
    var data = [];
    var locals = $scope.locals = {
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
              .then(function(response) {
                data = response;
                resolve(data);
              })
              .catch(function(error) {
                locals.error = true;
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
