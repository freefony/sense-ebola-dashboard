'use strict';

angular.module('sedApp')
  .factory('Auth', function Auth($rootScope, $sessionStorage) {
    $rootScope.currentUser = null;
    $rootScope.app = $rootScope.app || {
      init: false
    };

    if ($sessionStorage.user)
      set($sessionStorage.user);

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
        $sessionStorage.user = user;
        set(user);
      },

      /**
       * Unauthenticate user
       */
      logout: function() {
        $sessionStorage.user = null;
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