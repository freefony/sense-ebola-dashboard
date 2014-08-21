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
    var visitsByDate = [];
    var mergedData = [];
    var contactData = null;

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
      visitsByDate: function() {
        return visitsByDate;
      },
      mergedData: function() {
        return mergedData;
      },
      contactData: function() {
        return contactData;
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

          if (!angular.equals(visitsByDate, response[2].rows)) {
            visitsByDate = response[2].rows;
            updated = true;
          }

          if (updated) {
            console.log('data updated');
            updateMergedData();
            updateContactData();
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
          if (!(err.status && err.status===401)) {
            timeout = $timeout(load, ERROR_RELOAD_DELAY);
          }
        })
        .finally(function() {
          loading = false;
        });
    }

    function updateMergedData() {
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

      var couchdbData = visitsByDate
        .filter(function(item) {
          return (item.value.doc_type == 'contact');
        })
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

    function updateContactData() {
      var i, fullName, couchContact,
        couchData = _.where(_.pluck(contacts, 'doc'), {
          doc_type: 'contact'
        });

      for (i = 0; i < followUps.length; i++) {
        fullName = followUps[i]['ContactInformation/contact_name'].split('  ');
        if (fullName.length < 2) {
          fullName.push('');
        }
        couchContact = _.where(couchData, {
          Surname: fullName[0],
          OtherNames: fullName[1]
        });
        if (couchContact.length === 0) {
          console.log('Received data for unknown contact: ' + fullName.join(', '));
        }
        else if (couchContact.length > 1) {
          console.log('Received data with ambiguous contact name: ' + fullName.join(', '));
        }
        else {
          if (!couchContact[0].hasOwnProperty('dailyVisits')) {
            couchContact[0].dailyVisits = [];
          }

          couchContact[0].dailyVisits.push({
            dateOfVisit: followUps[i].end.toISOString(),
            geoInfo: {
              coords: {
                longitude: followUps[i]._geolocation[1],
                latitude: followUps[i]._geolocation[0],
              }
            },
            symptoms: {
              temperature: followUps[i]['Clinicals/Temp_reading'],
              diarrhoea: followUps[i]['Clinicals/Anydiaarrhea'],
              pharyngitis: followUps[i]['Clinicals/Anypharyngitis'],
              haemorrhagic: followUps[i]['Clinicals/Anyhaemorrhagicsigns'],
              headache: followUps[i]['Clinicals/AnyHeadaches'],
              maculopapular: followUps[i]['Clinicals/Anymacuplopapularash'],
              malaise: followUps[i]['Clinicals/Anymalaise'],
              musclePain: followUps[i]['Clinicals/Anymusclepain'],
              vomiting: followUps[i]['Clinicals/Anyvomiting']
            }
          });
        }
      }

      contactData = parseResponseJsonData(couchData);
    }

    function parseResponseJsonData(data) {
      var items = [],
        updatedToday = 0,
        missingContacts = [];

      data = _.sortBy(data, function(contact) {
        return [contact.Surname, contact.OtherNames].join("_");
      });

      // data = _.pluck(data.rows,'doc');
      data.forEach(function(f) {
        if (f.dailyVisits && f.dailyVisits.length > 0) {
          var item = {},
            lastDailyVisit = _.last(_.sortBy(f.dailyVisits, 'dateOfVisit')),
            currentDate = new Date(),
            visitDate = new Date(lastDailyVisit.dateOfVisit),
            updateStatus = 'outdated',
            timeDelta;
          // Set the hour, minute and second of the current and visit date to zero before comparing.
          // That way markers will only turn green if they are from the same day instead of being from in-between 24 h.
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          visitDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
          timeDelta = currentDate - visitDate;

          // take all items with visits today and only active items for older visits.
          if (timeDelta < 86400000) {
            updateStatus = 'lastDay';
            updatedToday++;
          }
          else if (f.status === 'active') {
            if (timeDelta >= 172800000) {
              updateStatus = 'outdated';
              missingContacts.push({surname: f.Surname, otherNames: f.OtherNames});
            }
            else {
              updateStatus = 'lastTwoDays';
              missingContacts.push({surname: f.Surname, otherNames: f.OtherNames});
            }
          }
          else {
            return;
          }

          if (lastDailyVisit.geoInfo && lastDailyVisit.geoInfo.coords && lastDailyVisit.geoInfo.coords.longitude) {
            item.properties = {
              name: f.OtherNames + ' ' + f.Surname,
              timestamp: lastDailyVisit.dateOfVisit,
              updateStatus: updateStatus,
              symptomatic: false,
              temperature: lastDailyVisit.symptoms.temperature,
            };

            if (lastDailyVisit.symptoms.temperature > 38 ||
                lastDailyVisit.symptoms.diarrhoea ||
                lastDailyVisit.symptoms.pharyngitis ||
                lastDailyVisit.symptoms.haemorrhagic ||
                lastDailyVisit.symptoms.headache ||
                lastDailyVisit.symptoms.maculapapular ||
                lastDailyVisit.symptoms.malaise ||
                lastDailyVisit.symptoms.musclePain ||
                lastDailyVisit.symptoms.vomiting) {
              item.properties.symptomatic = true;
            }
            item.geometry = {
              type: 'Point',
              coordinates: [
                parseFloat(lastDailyVisit.geoInfo.coords.longitude),
                parseFloat(lastDailyVisit.geoInfo.coords.latitude)
              ]
            };
            item.type = 'Feature';
            items.push(item);
          }
        }
        else {
          missingContacts.push({surname: f.Surname, otherNames: f.OtherNames});
        }
      });

      // return the FeatureCollection
      return {
        events: {
          type: 'FeatureCollection',
          features: items
        },
        stats: {
          total: updatedToday + missingContacts.length,
          updated: updatedToday
        },
        missingContacts: missingContacts
      };
    }
  });
