'use strict';

angular.module('sedApp')
  .factory('contactFactory', function contactFactory(couchdb) {

    var DB_NAME = 'sense_contacts';


    function getAll() {
      return couchdb.allDocs({_db: DB_NAME}).$promise;
    }

    function getViewByDate() {
      return couchdb.view({_db: DB_NAME, _param:'visits', _sub_param: 'byDate'}).$promise;
    }
    function getContactsViewByNames(){
        return couchdb.view({_db : "new_sense", _param:"contacts_views", _sub_param : "ordered_by_name"})
    }
    return {
      all: getAll,
      viewByDate: getViewByDate,
      orderedByName : getContactsViewByNames
    }
  });