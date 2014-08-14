'use strict';

/**
 * @ngdoc service
 * @name senseEbolaDashboardApp.aggregatedData
 * @description
 * # aggregatedData
 * Service in the senseEbolaDashboardApp.
 */
angular.module('sedApp')
  .service('aggregatedData', function aggregatedData($q, FollowUp, contactFactory) {
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
            Yes: true,
            No: false
          };
          var formHubData = resolved[0]
            .map(function(senseData) {
              return {
                name: senseData['ContactInformation/contact_name'],
                time: senseData['_submission_time'],
                interviewer: senseData['WELCOME/Contact_tracer'],
                temperature: senseData['Clinicals/Temp_reading'],
                diarrhoea: response[senseData['Clinicals/Anydiaarrhea']],
                pharyngitis: response[senseData['Clinicals/Anypharyngitis']],
                haemorrhagic: response[senseData['Clinicals/Anyhaemorrhagicsigns']],
                headache: response[senseData['Clinicals/AnyHeadaches']],
                maculopapular: response[senseData['Clinicals/Anymacuplopapularash']],
                malaise: response[senseData['Clinicals/Anymalaise']],
                musclePain: response[senseData['Clinicals/Anymusclepain']],
                vomiting: response[senseData['Clinicals/Anyvomiting']]
              };
            }),
              couchdbData = resolved[1].rows
                .map(function(senseData) {
                  return {
                    name: senseData.value.Surname + ' ' + senseData.value.OtherNames,
                    time: senseData.key,
                    interviewer: senseData.value.visitData.interviewer,
                    temperature: senseData.value.visitData.symptoms.temperature,
                    diarrhoea: senseData.value.visitData.symptoms.diarrhoea,
                    pharyngitis: senseData.value.visitData.symptoms.pharyngitis,
                    haemorrhagic: senseData.value.visitData.symptoms.haemorrhagic,
                    headache: senseData.value.visitData.symptoms.headache,
                    maculopapular: senseData.value.visitData.symptoms.maculopapular,
                    malaise: senseData.value.visitData.symptoms.malaise,
                    musclePain: senseData.value.visitData.symptoms.musclePain,
                    vomiting: senseData.value.visitData.symptoms.vomiting
                  };
                });
          var mergedData = formHubData.concat(couchdbData);
          deferred.resolve(mergedData
            .sort(function(a, b) {
              if (new Date(a.time).getTime() > new Date(b.time).getTime()){
                return 1;
              }
              if (new Date(a.time).getTime() < new Date(b.time).getTime()){
                return -1;
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
