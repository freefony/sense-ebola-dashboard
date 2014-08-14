'use strict';

angular.module('sedApp')
  .factory('contactFactory', function contactFactory(couchdb) {

    var DB_NAME = 'sense_contacts';

    function getAll() {
      return couchdb.allDocs({_db: DB_NAME}).$promise;
    }

    return {
      all: getAll
    }
  });