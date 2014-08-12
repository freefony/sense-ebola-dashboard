'use strict';

angular.module('sedApp')
  .controller('LoginCtrl', function($scope, $location, Auth) {
    var back = ($location.search() && $location.search().back) || '/';
    var scope = $scope.scope = {
      user: {},
      error: '',
      submitted: false
    };

    $scope.login = function(form) {
      scope.submitted = true;
      scope.error = '';

      if (form.$valid) {
        Auth.login(scope.user);
        $location.search('back', null);
        $location.path(back);
      }
    };
  });
