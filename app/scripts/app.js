'use strict';

angular
  .module('sedApp', [
    'config',
    'ngSanitize',
    'ngRoute',
    'ngResource',
    'nvd3ChartDirectives',
    'ui.bootstrap'
  ])
  .config(function($httpProvider, $routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    // Intercept 401s and redirect user to login
    $httpProvider.interceptors.push([
      '$q', '$location', function($q, $location) {
        return {
          'responseError': function(response) {
            switch (response.status) {
              case 401:
                if ($location.path() != '/login')
                  $location.search('back', $location.path()).path('/login');
                break;
            }

            return $q.reject(response);
          }
        };
      }
    ]);
  })
  .run(function($rootScope, $route, SETTINGS, Auth) {
    $rootScope.SETTINGS = SETTINGS;

    $rootScope.logout = function() {
      Auth.logout()
        .then(function() {
          $route.reload();
        })
    };
  })
  .controller('NavBar', function($scope, $location) {
    $scope.isActive = function(url) {
      return url == $location.path();
    }
  });
