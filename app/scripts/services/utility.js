'use strict';

/**
 * @ngdoc service
 * @name senseEbolaDashboardApp.utility
 * @description
 * # utility
 * Service in the senseEbolaDashboardApp.
 */
angular.module('sedApp')
  .service('utility', function utility() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.toTitleCase = function(str){
      return (str||"").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

  });
