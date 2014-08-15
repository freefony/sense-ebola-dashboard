'use strict';

angular.module('sedApp')
  .controller('LabResultsCtrl', function($scope, $filter, ngTableParams, LabResult) {
    var data = [];
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
          if (data.length)
            resolve(data);
          else {
            locals.loading = true;
            load(function(err) {
              if (err) {
                data = [];
                locals.error = true;
              }

              resolve(data);
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

    setInterval(function() {
      load(function(err) {
        if (!err)
          locals.tableParams.reload();
      });
    }, 300000);

    function load(cb) {
      if (!loading) {
        loading = true;

        LabResult.all()
          .then(function(result) {
            data = LabResult.normalize(result);
            cb();
          })
          .catch(function(err) {
            console.error(err);
            cb(err);
          })
          .finally(function() {
            loading = false;
          });
      }
    }
  });
