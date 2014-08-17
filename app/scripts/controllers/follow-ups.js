'use strict';

angular.module('sedApp')
  .controller('FollowUpsCtrl', function($rootScope, $scope, $filter, ngTableParams, dataLoader) {
    $scope.MAX_TEMP = 38;
    $scope.csvHeader = [
      'Name',
      'Time',
      'Interviewer',
      'Temperature',
      'diarrhoea',
      'Pharyngitis',
      'Haemorrhagic',
      'Headache',
      'Maculopapular',
      'Malaise',
      'Muscle Pain',
      'Vomiting',
      'Latitude',
      'Longitude',
      'Accuracy',
      'Gender',
      'Age',
      'Address',
      'State',
      'LGA',
      'Phone'
    ];

    function getFileName() {
      return 'follow-ups-' + $filter('date')(new Date(), 'yyyy-MM-dd hh-mm-ss');
    }

    $scope.fileName = getFileName();
    $scope.changeFileName = function() {
      $scope.fileName = getFileName();
    };

    var locals = $scope.locals = {
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
          var data = dataLoader.mergedData();
          $scope.csvData = data;

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
