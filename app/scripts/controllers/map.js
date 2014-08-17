'use strict';

angular.module('sedApp')
    .controller('MapCtrl', function($rootScope, $scope, dataLoader) {
        $scope.title = 'Map';

        $scope.initiateMap = function() {
            var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                osm = L.tileLayer(osmUrl, {
                    minZoom: 6,
                    maxZoom: 18,
                    attribution: false
                }),
                markers = {

                    Event: {
                        green: L.icon({
                            iconUrl: '/images/marker-green.png',
                            iconSize: [14, 14],
                            shadowSize: [20, 14],
                            iconAnchor: [10, 7],
                            shadowAnchor: [20, 7],
                            popupAnchor: [-3, -5]
                        }),
                        red: L.icon({
                            iconUrl: '/images/marker-red.png',
                            iconSize: [14, 14],
                            shadowSize: [20, 14],
                            iconAnchor: [10, 7],
                            shadowAnchor: [20, 7],
                            popupAnchor: [-3, -5]
                        }),
                        gray: L.icon({
                            iconUrl: '/images/marker-gray.png',
                            iconSize: [14, 14],
                            shadowSize: [20, 14],
                            iconAnchor: [10, 7],
                            shadowAnchor: [20, 7],
                            popupAnchor: [-3, -5]
                        }),
                        yellow: L.icon({
                            iconUrl: '/images/marker-yellow.png',
                            iconSize: [14, 14],
                            shadowSize: [20, 14],
                            iconAnchor: [10, 14],
                            shadowAnchor: [20, 7],
                            popupAnchor: [-3, -5]
                        }),
                    }
                };

            function selectIcon(eventClass, itemProperties) {
                if (itemProperties.symptomatic) {
                    return markers[eventClass].red;
                }
                switch (itemProperties.updateStatus) {
                    case 'lastDay':
                        return markers[eventClass].green;
                    case 'lastTwoDays':
                        return markers[eventClass].gray;
                    case 'outdated':
                        return markers[eventClass].yellow;
                }
                // Unknown update status?
                console.log('Unknown update status: ' + updateStatus);
                return markers[eventClass].red;

            }

            function markerPopup(markerProperties) {
                var date = new Date(markerProperties.timestamp),
                    infoText = '<p>' + markerProperties.name + '</p>' + '<p>Temperature: ' + markerProperties.temperature + '</p>' + '<p>' + date + '</p>';

                return infoText;
            }

            function createEventsLayer(events) {
                return L.geoJson(events, {
                    style: {
                        'weight': 1,
                        'opacity': 0.3,
                    },
                    pointToLayer: function(feature, latlng) {
                        var markerOptions = {
                            icon: selectIcon('Event', feature.properties),
                        };
                        if (feature.properties.symptomatic) {
                          markerOptions.zIndexOffset=1000;
                        }

                        return L.marker(latlng, markerOptions);
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
            var events = [],
                clonedEvents = [],
                eventsLayer;//, legend;

            function getData() {
                var newData = dataLoader.mapData();
                if (!newData) return;

                if (!(_.isEqual(clonedEvents, newData.events))) {
                    $scope.contacts = {
                      total: newData.stats.total,
                      updated: newData.stats.updated,
                      missing: newData.stats.missing
                    };
                    events = newData.events;
                    clonedEvents = _.clone(events);
                    if (eventsLayer) {
                        map.removeLayer(eventsLayer);
                    }
                    eventsLayer = createEventsLayer(events);
                    eventsLayer.addTo(map);
                    map.fitBounds(eventsLayer.getBounds());
                    //if (legend) {
                    //    legend.removeFrom(map);
                    //}
                    //legend = L.control.layers(baseMaps, {
                    //    'Latest followups': eventsLayer,
                    //}, {
                    //    collapsed: false
                    //});
                    //legend.addTo(map);
                }
            }

            var map = L.map('map', {
                center: new L.LatLng(6.5959695, 3.3089232),
                zoom: 12,
                minZoom: 1,
                maxZoom: 18,
                layers: [osm],
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: 'topleft'
                }
            });

            map.attributionControl.setPrefix('');
            //var baseMaps = {
          //      'Map': osm
          //  };

          $rootScope.$on('dataUpdated', function() {
            getData();
          });

          getData();
        };

    });
