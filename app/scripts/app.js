'use strict';

angular
    .module('sedApp', [
        'config',
        'ngSanitize',
        'ngRoute',
        'ngResource',
        'ngStorage',
        'ngTable',
        'ui.bootstrap',
        'ngCsv'
    ])
    .config(function($httpProvider, $routeProvider, paginationConfig) {

        paginationConfig.maxSize = 6;
        paginationConfig.boundaryLinks = true;
        paginationConfig.previousText = '<';
        paginationConfig.nextText = '>';
        paginationConfig.firstText = '<<';
        paginationConfig.lastText = '>>';

        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .when('/map', {
                templateUrl: 'views/map.html',
                controller: 'MapCtrl'
            })
            .when('/follow-ups', {
                templateUrl: 'views/follow-ups.html',
                controller: 'FollowUpsCtrl'
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
            '$rootScope', '$q', '$location', 'SETTINGS',
            function($rootScope, $q, $location, SETTINGS) {
                return {
                    'request': function(config) {
                        if (config.url.substr(0, SETTINGS.formHubUrl.length) === SETTINGS.formHubUrl) {
                            var username = $rootScope.currentUser ? $rootScope.currentUser.username : '';
                            var password = $rootScope.currentUser ? $rootScope.currentUser.password : '';

                            config.headers.Authorization = 'Basic ' + btoa(username + ':' + password);
                        }

                        return config;
                    },
                    'responseError': function(response) {
                        // switch (response.status) {
                        //     case 401:
                        //         if ($location.path() !== '/login') {
                        //             $location.search('back', $location.path()).path('/login');
                        //         }
                        //         break;
                        // }

                        return $q.reject(response);
                    }
                };
            }
        ]);
    })
    .run(function($rootScope, $route, SETTINGS, Auth) {
        $rootScope.SETTINGS = SETTINGS;

        $rootScope.logout = function() {
            Auth.logout();
            $route.reload();
        };
    })
    .controller('NavBar', function($scope, $location) {
        $scope.isActive = function(url) {
            return url == $location.path();
        }
    });
