angular.module('sedApp')
  .directive('yesNoMark', function($compile) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var name = attrs['ngModel'];
        var htmlText = '<i class="fa" ng-class="{\'fa-check text-danger\': ' + name + ', \'fa-minus\': !' + name + '}"></i>';

        element.replaceWith($compile(htmlText)(scope));
      }
    }
  });
