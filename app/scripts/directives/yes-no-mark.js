'use strict';

angular.module('sedApp')
  .directive('yesNoMark', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/yes-no-mark.html',
      scope: {
        marked: '=ngModel',
      },
      replace: true
    };
  });
