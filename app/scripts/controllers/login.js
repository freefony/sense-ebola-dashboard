'use strict';

angular.module('sedApp')
  .controller('LoginCtrl', function($location, Auth) {
    var back = ($location.search() && $location.search().back) || '/';

    this.user = {};
    this.error = '';
    this.submitted = false;

    this.submit = function(form) {
      var _this = this;

      this.submitted = true;
      this.error = '';

      if (form.$valid) {
        Auth.login(this.user)
          .then(function() {
            $location.search('back', null);
            $location.path(back);
          })
          .catch(function(err) {
            _this.error = err.data.reason;
            form.$setPristine();
          });
      }
    };
  });
