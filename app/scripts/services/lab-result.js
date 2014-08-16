'use strict';

angular.module('sedApp')
  .factory('LabResult', function($q, formHub, utility) {
    var FORM_ID = 20;
    var DATES = [
      '_submission_time',
      'today',
      'start',
      'end',
      'ClinicalSignsandSymptoms/date_initial_symptom',
      'HospitalizationInformation/date_hospital_admission',
      'HospitalizationInformation/date_of_isolation',
      'LabInformation/date_specimen_collected',
      'LabInformation/date_of_results',
      'PatientInformation/date_of_report',
      'PatientInformation/date_residing_atloc',
      'PatientInformation/if_dead_date'
    ];

    function normalize(results) {
      return  results.map(function(result) {
        return {
          name: utility.toTitleCase(result['PatientInformation/surname'] + '  ' + result['PatientInformation/othername']),
          time: result['_submission_time'],
          interviewer: utility.toTitleCase(result['WELCOME/DataRecorder']),
          temperature: result['ClinicalSignsandSymptoms/Temp_reading'],
          type: result['LabInformation/sampletypes'],
          collect_date: result['LabInformation/date_specimen_collected'],
          results_date: result['LabInformation/date_of_results'],
          results: result['LabInformation/labstatusresults'],
          status: result['PatientInformation/status_of_patient'],
          fever: result['ClinicalSignsandSymptoms/AnyFever'] == '1'
        };
      });
    }

    return {
      all: function() {
        var d = $q.defer();

        formHub.query({form_id: FORM_ID}).$promise
          .then(function(response) {
            for (var i = 0; i < response.length; i++) {
              var obj = response[i];

              angular.forEach(obj, function(value, key) {
                if (DATES.indexOf(key) >= 0)
                  this[key] = moment(value).toDate();

                // angular 'orderBy' filter has issues with fields that have a '/'
                // in their names, so we add '/'-free versions of them for sorting.
                if (key.indexOf('/') >= 0)
                  this[key.replace(/\//g, '_')] = this[key];
              }, obj);
            }

            d.resolve(response);
          })
          .catch(function(error) {
            console.log(error);
            d.reject(error);
          });

        return d.promise;
      },
      normalize: normalize
    }
  });
