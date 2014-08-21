'use strict';

angular.module('sedApp')
  .controller('NotDoneCtrl', function($rootScope, $scope, $filter, ngTableParams, dataLoader) {

    var locals = $scope.locals = {
      totalItems: 0,
      currentPage: 1,
      tableParams: new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          surname: 'asc'
        }
      }, {
        total: 0,
        counts: [],
        getData: function($defer, params) {
          console.log(dataLoader.mapData())
          var data = dataLoader.mapData().missingContacts;

          var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
          locals.totalItems = orderedData.length;
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      })
    };

    $rootScope.$on('dataUpdated', function() {
      locals.tableParams.reload();
    });
  });
