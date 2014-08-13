angular.module('sedApp')
  .directive('yesNoMark', function($compile) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var name = attrs['ngModel'];
        var htmlText = '<i class="glyphicon" ng-class="{\'glyphicon-ok\': ' + name + ', \'glyphicon-remove\': !' + name + '}"></i>';

        element.replaceWith($compile(htmlText)(scope));
      }
    }
  });
