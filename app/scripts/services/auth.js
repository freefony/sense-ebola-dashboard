'use strict';

angular.module('sedApp')
  .factory('Auth', function Auth($rootScope, $q) {
    $rootScope.currentUser = null;
    $rootScope.app = $rootScope.app || {
      init: false
    };

    // no async operation, so set init to true right away
    $rootScope.app.init = true;

    function set(user) {
      if (user != $rootScope.currentUser) {
        $rootScope.currentUser = user;
        $rootScope.$emit('currentUserChanged', user);
      }
    }

    return {
      /**
       * Authenticate user
       *
       * @param  {Object}   user     - login info
       */
      login: function(user) {
        set(user);
      },

      /**
       * Unauthenticate user
       */
      logout: function() {
        set(null);
      },

      /**
       * Returns current user
       *
       * @return {Object} user
       */
      currentUser: function() {
        return $rootScope.currentUser;
      },

      /**
       * Simple check to see if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return !!$rootScope.currentUser;
      }
    };
  });