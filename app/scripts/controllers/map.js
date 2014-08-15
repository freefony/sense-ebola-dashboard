'use strict';

angular.module('sedApp')
    .controller('MapCtrl', function($scope, FollowUp, contactFactory) {
        $scope.title = 'Map';

        $scope.initiateMap = function() {
            var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                osmAttrib = 'Map data © OpenStreetMap contributors',
                osm = L.tileLayer(osmUrl, {
                    minZoom: 6,
                    maxZoom: 18,
                    attribution: osmAttrib
                }),
                markers = {

                    Event: {
                        green: L.icon({
                            iconUrl: '/images/marker-green.png',
                            iconSize: [20,14],
                            shadowSize: [20,14],
                            iconAnchor: [10,14],
                            shadowAnchor: [20,7],
                            popupAnchor: [0,0]
                        }),
                        red: L.icon({
                            iconUrl: '/images/marker-red.png',
                            iconSize: [20,14],
                            shadowSize: [20,14],
                            iconAnchor: [10,14],
                            shadowAnchor: [20,7],
                            popupAnchor: [0,0]
                        }),
                        gray: L.icon({
                            iconUrl: '/images/marker-gray.png',
                            iconSize: [20,14],
                            shadowSize: [20,14],
                            iconAnchor: [10,14],
                            shadowAnchor: [20,7],
                            popupAnchor: [0,0]
                        }),
                        yellow: L.icon({
                            iconUrl: '/images/marker-yellow.png',
                            iconSize: [20,14],
                            shadowSize: [20,14],
                            iconAnchor: [10,14],
                            shadowAnchor: [20,7],
                            popupAnchor: [0,0]
                        }),
                    }
                };

            function selectIcon(event_class, itemProperties) {
                if (itemProperties.symptomatic) {
                    return markers[event_class].red;
                }
                switch (itemProperties.updateStatus) {
                    case 'lastDay':
                        return markers[event_class].green;
                    case 'lastTwoDays':
                        return markers[event_class].gray;
                    case 'outdated':
                        return markers[event_class].yellow;
                }
                // Unknown update status?
                console.log('Unknown update status: ' + updateStatus)
                return markers[event_class].red;

            }

            function markerPopup(marker_properties) {
                var date = new Date(marker_properties.timestamp),
                    infoText = '<p>' + marker_properties.name + '</p><p>' + date + '</p>';

                return infoText;
            }

            function createEventsLayer(events) {
                return L.geoJson(events, {
                    style: {
                        "weight": 1,
                        "opacity": 0.3,
                    },
                    pointToLayer: function(feature, latlng) {
                        return L.marker(latlng, {
                            icon: selectIcon('Event', feature.properties),
                        });
                    },
                    onEachFeature: function(feature, layer) {
                        /*
                        var events = document.getElementById('events'),
                          featureDiv = document.createElement('div');
                        featureDiv.classList.add('event-div');
                        $(featureDiv).html(feature.properties.name);
                        events.insertBefore(featureDiv, events.firstChild.nextSibling);
                        */
                        if (feature.properties && feature.properties.name) {

                            layer.bindPopup(markerPopup(feature.properties));
                        }
                    }
                });
            }


            // Facilities GeoJSON Layer
            var events = [], clonedEvents = [], eventsLayer, legend;

            function getData() {
                  requestUpdatedJson('couchdb', function(newData) {
                      if (!(_.isEqual(clonedEvents, newData['events']))) {
                          console.log('followups have changed');
                          jQuery('#total-contacts').html(newData.stats.total);
                          jQuery('#updated-contacts').html(newData.stats.updated);
                          events = newData['events'];
                          clonedEvents = _.clone(events);
                          if (eventsLayer) {
                            map.removeLayer(eventsLayer);
                          }
                          eventsLayer = createEventsLayer(events);
                          eventsLayer.addTo(map);
                          if (legend) {
                            legend.removeFrom(map);
                          }
                          legend = L.control.layers(baseMaps, {
                            "Latest followups": eventsLayer,
                          }, {
                              collapsed: false
                          });
                          legend.addTo(map);
                      }
                  });
            }

            var map = L.map('map', {
                center: new L.LatLng(6.5, 3.3),
                zoom: 12,
                minZoom: 1,
                maxZoom: 18,
                layers: [osm]
            });

            var baseMaps = {
                "Map": osm
            };

            getData();
            setInterval(function(){getData();}, 300000);
        }

        function getService(serviceName) {
            if (serviceName == 'followup') {
                return FollowUp;
            } else {
                return contactFactory;
            }
        }

        // function requestUpdatedJson(serviceName, callback) {
        //     getService(serviceName).all().then(function(response) {
        //         callback(parseResponseJsonData(response));
        //     });
        // }


        /* TEMPORARY REPLACEMENT FUNCTIONS FOR MIXING FORMHUB AND COUCHDB DATA */
        function requestUpdatedJson(unusedVariable, callback) {
            getService('followup').all().then(function(formhubData) {
              getService('couchdb').all().then(function(couchData) {
                attachFormhubToCouchData(formhubData, couchData, function(response) {
                  callback(parseResponseJsonData(response));
                });
              });
            });
        }

        function attachFormhubToCouchData(formhubData, rawCouchData, callback) {
          var i, fullName, couchContact,
          couchData = _.pluck(rawCouchData.rows, 'doc');
          for (i=0;i<formhubData.length;i++) {
            fullName = formhubData[i]["ContactInformation/contact_name"].split('  ');
            if (fullName.length<2) {
              fullName.push('');
            }
            couchContact = _.where(couchData, {Surname:fullName[0], OtherNames:fullName[1]});
            if (couchContact.length==0) {
              console.log("Received data for unknown contact: " + fullName.join(', '));
            } else if (couchContact.length>1) {
              console.log("Received data with ambiguous contact name: " + fullName.join(', '));
            } else {
              if (!couchContact[0].hasOwnProperty('dailyVisits')) {
                couchContact[0].dailyVisits=[];
              }

              couchContact[0].dailyVisits.push(
                {
                  dateOfVisit: formhubData[i]["end"].toISOString(),
                  geoInfo: {
                    coords: {
                      longitude: formhubData[i]["_geolocation"][1],
                      latitude: formhubData[i]["_geolocation"][0],
                    }
                  },
                  symptoms: {
                      temperature: formhubData[i]['Clinicals/Temp_reading'],
                      diarrhoea: formhubData[i]['Clinicals/Anydiaarrhea'],
                      pharyngitis: formhubData[i]['Clinicals/Anypharyngitis'],
                      haemorrhagic: formhubData[i]['Clinicals/Anyhaemorrhagicsigns'],
                      headache: formhubData[i]['Clinicals/AnyHeadaches'],
                      maculopapular: formhubData[i]['Clinicals/Anymacuplopapularash'],
                      malaise: formhubData[i]['Clinicals/Anymalaise'],
                      musclePain: formhubData[i]['Clinicals/Anymusclepain'],
                      vomiting: formhubData[i]['Clinicals/Anyvomiting']
                  }
                }
              );
            }

          }
          callback(couchData);
        }
        /* END TEMPORARY REPLACEMENT*/

        function parseResponseJsonData(data) {
            var items = [], totalContacts, updatedToday = 0;
            // data = _.pluck(data.rows,'doc');
            totalContacts = data.length;
            $.each(data, function(g, f) {

                if (f["dailyVisits"] && f["dailyVisits"].length > 0) {
                    var item = {},
                        lastDailyVisit = _.last(_.sortBy(f["dailyVisits"], 'dateOfVisit')),
                        currentDate = new Date(),
                        visitDate = new Date(lastDailyVisit["dateOfVisit"]),
                        updateStatus = 'outdated',
                        timeDelta;
                    // Set the hour, minute and second of the current and visit date to zero before comparing.
                    // That way markers will only turn green if they are from the same day instead of being from in-between 24 h.
                    currentDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate());
                    visitDate = new Date(visitDate.getFullYear(),visitDate.getMonth(),visitDate.getDate());
                    timeDelta = currentDate - visitDate;
                    if (timeDelta >= 172800000) {
                        updateStatus = 'outdated';
                    } else if (timeDelta >= 86400000) {
                        updateStatus = 'lastTwoDays';
                    } else {
                        updateStatus = 'lastDay';
                        updatedToday++;
                    }

                    if (lastDailyVisit["geoInfo"] && lastDailyVisit["geoInfo"]["coords"] && lastDailyVisit["geoInfo"]["coords"]["longitude"]) {
                        item.properties = {
                            name: f["OtherNames"] + " " + f["Surname"],
                            timestamp: lastDailyVisit.dateOfVisit,
                            updateStatus: updateStatus,
                            symptomatic: false,
                            temperature: lastDailyVisit.symptoms.temperature,
                        };

                        if (lastDailyVisit.symptoms.temperature>38||
                          lastDailyVisit.symptoms.diarrhoea||
                          lastDailyVisit.symptoms.pharyngitis||
                          lastDailyVisit.symptoms.haemorrhagic||
                          lastDailyVisit.symptoms.headache||
                          lastDailyVisit.symptoms.maculapapular||
                          lastDailyVisit.symptoms.malaise||
                          lastDailyVisit.symptoms.musclePain||
                          lastDailyVisit.symptoms.vomiting) {
                            item.properties.symptomatic = true;
                        }
                        item.geometry = {
                            type: "Point",
                            coordinates: [parseFloat(lastDailyVisit["geoInfo"]["coords"]["longitude"]), parseFloat(lastDailyVisit["geoInfo"]["coords"]["latitude"])]
                        };
                        item.type = "Feature";
                        items.push(item);
                    }
                }
            });



            // return the FeatureCollection
            return {
              events: {
                  type: "FeatureCollection",
                  features: items
                },
                stats: {
                  total: totalContacts,
                  updated: updatedToday
                }
              };
        }
    });
