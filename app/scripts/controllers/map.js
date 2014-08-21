'use strict';

function CommonMapController(focusArea) {
    return function($rootScope, $scope, $element, dataLoader) {
        $scope.title = 'Map';

        $scope.initiateMap = function() {
            var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                osm = L.tileLayer(osmUrl, {
                    minZoom: 6,
                    maxZoom: 18,
                    attribution: false
                }),
                markers = {
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

                },
                mapCenter = focusArea ? focusArea.slice(0,2) : [0,0],
                mapZoom = focusArea ? focusArea[2] : 6;

            function selectIcon(itemProperties) {
                if (itemProperties.symptomatic) {
                    return markers.red;
                }
                switch (itemProperties.updateStatus) {
                    case 'lastDay':
                        return markers.green;
                    case 'lastTwoDays':
                        return markers.gray;
                    case 'outdated':
                        return markers.yellow;
                }
                // Unknown update status?
                console.log('Unknown update status: ' + itemProperties.updateStatus);
                return markers.red;

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
                            icon: selectIcon(feature.properties),
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
                var newData = dataLoader.contactData();
                if (!newData) { return; }

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
                    if (!focusArea) {
                        map.fitBounds(eventsLayer.getBounds());
                    }
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



            var map = L.map($element.next()[0].querySelector('.map'), { // TODO: Is there a more angularesque way to get to the map element inside the current controller's container element?
                center: new L.LatLng(mapCenter[0], mapCenter[1]),
                zoom: mapZoom,
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

    };
}

angular.module('sedApp').controller('MapCtrl', new CommonMapController());
angular.module('sedApp').controller('LagosMapCtrl', new CommonMapController([6.5959695, 3.3089232, 10]));
