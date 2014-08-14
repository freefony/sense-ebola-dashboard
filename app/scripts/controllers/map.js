'use strict';

angular.module('sedApp')
  .controller('MapCtrl', function($scope, FollowUp, couchdb) {
    $scope.title = 'Map';
    initiateMap();



    function initiateMap() {
      var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © OpenStreetMap contributors',
        osm = L.tileLayer(osmUrl, {minZoom: 6, maxZoom: 18, attribution: osmAttrib}),
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
            black: L.AwesomeMarkers.icon({
              icon: 'circle',
              markerColor: 'black',
              prefix: 'icon'
            }),
            purple: L.AwesomeMarkers.icon({
              icon: 'circle',
              markerColor: 'purple',
              prefix: 'icon'
            })
          }
        };

      function selectIcon(event_class, event_type) {
        switch (event_type) {
          case 'case':
            return markers[event_class].purple;
          case 3:
            return markers[event_class].red;
          case 1:
            return markers[event_class].green;
          case 2:
            return markers[event_class].green;
        }
        // Unknown event type?
        return markers[event_class].red;

      }

      function markerPopup(marker_properties) {
        var infoText = marker_properties.name;

        return infoText;
      }

      function createEventsLayer(events) {
    //    console.log(events);
        return L.geoJson(events, {
          style: {
            "weight": 1,
            "opacity": 0.3,
          },
          pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
              icon: selectIcon('Event', feature.properties.event_type),
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

      // function createVehicleDriveLayer(data) {
      //   var locations = data.features, polylines = [];
      //   if (locations.length > 0) {
      //     var driver = locations[0].properties.driver, i = 0 , linepoints = [];
      //     while (i < locations.length) {
      //
      //       if (locations[i].properties.driver != driver) {
      //         driver = locations[i].properties.driver;
      //         polylines.push(linepoints);
      //         linepoints = [];
      //       }
      //       linepoints.push([locations[i].geometry.coordinates[1], locations[i].geometry.coordinates[0]]);
      //       i++;
      //     }
      //     polylines.push(linepoints);
      //   }
      //   var colorOptions = ['red', 'blue', 'green', 'yellow'], colorChoice = 0;
      //   var layer = L.layerGroup(), pline;
      //   for (j = 0; j < polylines.length; j++) {
      //     pline = new L.Polyline(polylines[j], {
      //       color: colorOptions[colorChoice],
      //       weight: 5,
      //       smoothFactor: 10
      //
      //     });
      //     layer.addLayer(pline);
      //     colorChoice++;
      //     if (colorChoice > 3) {
      //       colorChoice = 0;
      //     }
      //   }
      //   return layer;
      // }

      // Facilities GeoJSON Layer
      var events, clonedEvents, eventsLayer;

      requestUpdatedJson('couchdb', function (events) {
        clonedEvents = _.clone(events);
        eventsLayer = createEventsLayer(events);
        eventsLayer.addTo(map);
        var overlayMaps = {
          "Events": eventsLayer,
//        "Vehicle positions": vehiclePositionsLayer,
        };
//      map.fitBounds(eventsLayer.getBounds());
        L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
      });//,
        //vehiclePositions = requestUpdatedJson('/latest_vehicle_locations/600/'),
        //clonedVehiclePositions = _.clone(vehiclePositions),
        //vehiclePositionsLayer = createVehicleDriveLayer(vehiclePositions);

      setInterval(function() {
        requestUpdatedJson('couchdb', function (newEvents) {
          if (!(_.isEqual(clonedEvents, newEvents))) {
            console.log('events have changed');
            events = newEvents;
            clonedEvents = _.clone(events);
            map.removeLayer(eventsLayer);
            eventsLayer = createEventsLayer(events);
            eventsLayer.addTo(map);
            L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
          }
        });
      }, 300000);

      // setInterval(function() {
      //   var newVehiclePositions = requestUpdatedJson('/latest_vehicle_locations/600/');
      //   if (!(_.isEqual(clonedVehiclePositions, newVehiclePositions))) {
      //     console.log('vehicle positions have changed');
      //     vehiclePositions = newVehiclePositions;
      //     clonedVehiclePositions = _.clone(vehiclePositions);
      //     map.removeLayer(vehiclePositionsLayer);
      //     vehiclePositionsLayer = createVehicleDriveLayer(vehiclePositions);
      //     vehiclePositionsLayer.addTo(map);
      //   }
      // }, 5000);

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

    }


   function service(serviceName) {
     if (serviceName=='followup') {
       return FollowUp;
     } else {
       return couchdb;
     }
   }
// function getDriver(driverId) {
//     return "Driver " + driverId;
// }
//    function getBubbleName(f) {
//      return ""//"Driver: " + "<b>" + f.driver_phone + "</b>" + "<br>" + f.lat + ", " + f.lon + "<br>" + "Event Code: " + f.event_code + "<br>" + f.event_name + "<br>" + new Date(f.timestamp * 1000);
//    }

    function requestUpdatedJson(serviceName, callback) {
      service(serviceName).all().then(function(response) {
        callback(parseResponseJsonData(response));
      });
    }

    function parseResponseJsonData(data) {
      var items = [];
      //var events_array = [];
      console.log(data);
      $.each(data, function(i, f) {
        if (f["_geolocation"][0] != null) {
          var item = {};
          item.properties = {
            name: f["ContactInformation/contact_name"],
            event_type: 'case',
            timestamp: f["_submission_time"]
          };
          item.geometry = {
            type: "Point",
            coordinates: [parseFloat(f["_geolocation"][1]), parseFloat(f["_geolocation"][0])]
          };
          item.type = "Feature";
          items.push(item);
          console.log(item)
          //  events_array.push(f);
          //  console.log(events_array);
       }
      });

      // return the FeatureCollection
      return { type: "FeatureCollection", features: items };
    }
  });
