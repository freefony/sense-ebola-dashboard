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
                        green: L.AwesomeMarkers.icon({
                            icon: 'circle',
                            markerColor: 'green',
                            prefix: 'icon'
                        }),
                        red: L.AwesomeMarkers.icon({
                            icon: 'circle',
                            markerColor: 'red',
                            prefix: 'icon'
                        }),
                        gray: L.AwesomeMarkers.icon({
                            icon: 'circle',
                            markerColor: 'gray',
                            prefix: 'icon'
                        })
                    }
                };

            function selectIcon(event_class, updateStatus) {
                switch (updateStatus) {
                    case 'lastDay':
                        return markers[event_class].green;
                    case 'lastTwoDays':
                        return markers[event_class].gray;
                    case 'outdated':
                        return markers[event_class].red;
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
                            icon: selectIcon('Event', feature.properties.updateStatus),
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
                  requestUpdatedJson('couchdb', function(newEvents) {
                      if (!(_.isEqual(clonedEvents, newEvents))) {
                          console.log('events have changed');
                          events = newEvents;
                          clonedEvents = _.clone(events);
                          if (eventsLayer) {
                            map.removeLayer(eventsLayer);
                          }
                          eventsLayer = createEventsLayer(events);
                          eventsLayer.addTo(map);
                          if (legend) {
                            map.removeLayer(legend);
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
                zoom: 10,
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
                  }
                }
              );
            }

          }
          callback(couchData);
        }
        /* END TEMPORARY REPLACEMENT*/

        function parseResponseJsonData(data) {
            var items = [];
            // data = _.pluck(data.rows,'doc');
            $.each(data, function(g, f) {

                if (f["dailyVisits"] && f["dailyVisits"].length > 0) {
                    var item = {},
                        lastDailyVisit = _.last(_.sortBy(f["dailyVisits"], 'dateOfVisit')),
                        timeDelta = new Date() - new Date(lastDailyVisit["dateOfVisit"]),
                        updateStatus = 'outdated';

                    if (timeDelta > 172800000) {
                        updateStatus = 'outdated';
                    } else if (timeDelta > 86400000) {
                        updateStatus = 'lastTwoDays';
                    } else {
                        updateStatus = 'lastDay';
                    }

                    if (lastDailyVisit["geoInfo"] && lastDailyVisit["geoInfo"]["coords"] && lastDailyVisit["geoInfo"]["coords"]["longitude"]) {
                        item.properties = {
                            name: f["OtherNames"] + " " + f["Surname"],
                            timestamp: lastDailyVisit["dateOfVisit"],
                            updateStatus: updateStatus
                        };
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
                type: "FeatureCollection",
                features: items
            };
        }
    });
