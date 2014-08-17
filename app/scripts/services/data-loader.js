'use strict';

angular.module('sedApp')
  .service('dataLoader', function dataLoader($rootScope, $q, $timeout, FollowUp, contactFactory, utility) {
    var RELOAD_DELAY = 300000;
    var ERROR_RELOAD_DELAY = 1000;

    var timeout = null;
    var loading = false;
    var error = null;
    var initialLoad = true;
    var lastUpdate = null;
    var followUps = [];
    var contacts = [];
    var contactsByDate = [];
    var mergedData = [];

    load();

    return {
      load: load,
      loading: function() {
        return loading;
      },
      error: function() {
        return error;
      },
      initialLoad: function() {
        return initialLoad;
      },
      lastUpdate: function() {
        return lastUpdate;
      },
      followUps: function() {
        return followUps;
      },
      contacts: function() {
        return contacts;
      },
      contactsByDate: function() {
        return contactsByDate;
      },
      mergedData: function() {
        return mergedData;
      }
    };

    function load() {
      if (loading)
        return;

      loading = true;
      if (timeout) {
        $timeout.cancel(timeout);
        timeout = null;
      }

      $rootScope.$emit('startLoad');

      $q.all([
          FollowUp.all(),
          contactFactory.all(),
          contactFactory.viewByDate()
        ])
        .then(function(response) {
          var updated = false;

          if (!angular.equals(followUps, response[0])) {
            followUps = response[0];
            updated = true;
          }

          if (!angular.equals(contacts, response[1].rows)) {
            contacts = response[1].rows;
            updated = true;
          }

          if (!angular.equals(contactsByDate, response[2].rows)) {
            contactsByDate = response[2].rows;
            updated = true;
          }

          if (updated) {
            console.log('data updated');
            merge();
            $rootScope.$emit('dataUpdated');
          }

          initialLoad = false;
          error = null;
          lastUpdate = new Date();
          $rootScope.$emit('endLoad');

          timeout = $timeout(load, RELOAD_DELAY);
        })
        .catch(function(err) {
          console.log(err);
          error = err;
          $rootScope.$emit('endLoad', err);

          timeout = $timeout(load, ERROR_RELOAD_DELAY);
        })
        .finally(function() {
          loading = false;
        });
    }

    function merge() {
      var formHubData = followUps
        .map(function(senseData) {
          return {
            name: utility.toTitleCase(senseData['ContactInformation/contact_name']),
            time: new Date(senseData['_submission_time']),
            interviewer: utility.toTitleCase(senseData['WELCOME/Contact_tracer']),
            temperature: senseData['Clinicals/Temp_reading'],
            diarrhoea: senseData['Clinicals/Anydiaarrhea'],
            pharyngitis: senseData['Clinicals/Anypharyngitis'],
            haemorrhagic: senseData['Clinicals/Anyhaemorrhagicsigns'],
            headache: senseData['Clinicals/AnyHeadaches'],
            maculopapular: senseData['Clinicals/Anymacuplopapularash'],
            malaise: senseData['Clinicals/Anymalaise'],
            musclePain: senseData['Clinicals/Anymusclepain'],
            vomiting: senseData['Clinicals/Anyvomiting'],
            latitude: senseData['_geolocation'][0],
            longitude: senseData['_geolocation'][1],
            accuracy: ' ',
            gender: ' ',
            age: ' ',
            address: ' ',
            state: senseData['ContactInformation/state'],
            lga: senseData['ContactInformation/lga'],
            phone: ' '
          };
        });

      var couchdbData = contactsByDate
        .map(function(senseData) {
          var value = senseData.value;
          var coords = value.visitData.geoInfo ? value.visitData.geoInfo.coords : undefined;

          return {
            name: utility.toTitleCase(value.Surname + ' ' + value.OtherNames),
            time: new Date(senseData.key),
            interviewer: utility.toTitleCase(value.visitData.interviewer),
            temperature: value.visitData.symptoms.temperature,
            diarrhoea: value.visitData.symptoms.diarrhoea,
            pharyngitis: value.visitData.symptoms.pharyngitis,
            haemorrhagic: value.visitData.symptoms.haemorrhagic,
            headache: value.visitData.symptoms.headache,
            maculopapular: value.visitData.symptoms.maculopapular,
            malaise: value.visitData.symptoms.malaise,
            musclePain: value.visitData.symptoms.musclePain,
            vomiting: value.visitData.symptoms.vomiting,
            latitude: coords ? coords.latitude : 0,
            longitude: coords ? coords.longitude : 0,
            accuracy: coords ? coords.accuracy : 0,
            gender: value.Gender,
            age: value.Age,
            address: value.Address,
            state: value.State,
            lga: value.LGA,
            phone: value.Phone
          };
        });

      mergedData = formHubData.concat(couchdbData)
        .sort(function(a, b) {
          if (a.time > b.time) return -1;
          if (a.time < b.time) return 1;
          return 0;
        });
    }
  });
