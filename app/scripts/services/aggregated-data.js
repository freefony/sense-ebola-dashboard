'use strict';

/**
 * @ngdoc service
 * @name senseEbolaDashboardApp.aggregatedData
 * @description
 * # aggregatedData
 * Service in the senseEbolaDashboardApp.
 */
angular.module('sedApp')
  .service('aggregatedData', function aggregatedData($q, FollowUp, contactFactory, utility) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.mergedData = function() {
      var deferred = $q.defer();
      var promises = [
        FollowUp.all(),
        contactFactory.viewByDate()
      ];
      $q.all(promises)
        .then(function(resolved) {
          var response = {
            'Yes': 'true',
            'No': 'false'
          };
          var formHubData = resolved[0]
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
            }),
              couchdbData = resolved[1].rows
                .map(function(senseData) {
                  return {
                    name: utility.toTitleCase(senseData.value.Surname + ' ' + senseData.value.OtherNames),
                    time: new Date(senseData.key),
                    interviewer: utility.toTitleCase(senseData.value.visitData.interviewer),
                    temperature: senseData.value.visitData.symptoms.temperature,
                    diarrhoea: senseData.value.visitData.symptoms.diarrhoea,
                    pharyngitis: senseData.value.visitData.symptoms.pharyngitis,
                    haemorrhagic: senseData.value.visitData.symptoms.haemorrhagic,
                    headache: senseData.value.visitData.symptoms.headache,
                    maculopapular: senseData.value.visitData.symptoms.maculopapular,
                    malaise: senseData.value.visitData.symptoms.malaise,
                    musclePain: senseData.value.visitData.symptoms.musclePain,
                    vomiting: senseData.value.visitData.symptoms.vomiting,
                    latitude: angular.isDefined(senseData.value.visitData.geoInfo.coords) ? senseData.value.visitData.geoInfo.coords.latitude : 0,
                    longitude: angular.isDefined(senseData.value.visitData.geoInfo.coords) ? senseData.value.visitData.geoInfo.coords.longitude : 0,
                    accuracy: angular.isDefined(senseData.value.visitData.geoInfo.coords) ? senseData.value.visitData.geoInfo.coords.accuracy : 0,
                    gender: senseData.value.Gender,
                    age: senseData.value.Age,
                    address: senseData.value.Address,
                    state: senseData.value.State,
                    lga: senseData.value.LGA,
                    phone: senseData.value.Phone
                  };
                });
          var mergedData = formHubData.concat(couchdbData);
          deferred.resolve(mergedData
            .sort(function(a, b) {
              if (new Date(a.time).getTime() > new Date(b.time).getTime()){
                return -1;
              }
              if (new Date(a.time).getTime() < new Date(b.time).getTime()){
                return 1;
              }
              return 0;
            }));
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

  });
