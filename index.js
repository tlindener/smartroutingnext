// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var morgan = require('morgan');
// call the packages we need
var GoogleMapsAPI = require('googlemaps');
var async = require('async');
var request = require('request');
var distances = require('./distances.json');
var geolib = require('geolib');
// SETUP FOR GOOGLE APIS
var config = googleSetup('ENTER GOOGLE APIKEY HERE');
var lodash = require('lodash');

function googleSetup(key) {
  return {
    key: key,
    // google_client_id:   'test-client-id',
    stagger_time: 1000,
    encode_polylines: false,
    secure: true,
    // proxy:              'http://127.0.0.1:9999',
    // google_private_key: 'test-private-key'
  };
}
var gmAPI = new GoogleMapsAPI(config);

app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
console.log(__dirname); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
  'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
  type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json

app.post('/request', function(req, res) {
  console.log("______RECEIVED REQUEST______");
  console.log("Travel from _ to _");
  console.log(req.body.origin + " - " + req.body.destination);
  console.log("____________________________");
  var params = {
    origin: req.body.origin,
    destination: req.body.destination,
    mode: 'transit',
    departure_time: new Date()
  };

  var cityCoordinates;
  var route;
  async.series([
            function(callback) {
      gmAPI.directions(params, function(err, results) {
        console.log("_______ROUTENPLAN API_______");
        route = results.routes[0].legs[0];
        console.log(JSON.stringify(route));
        console.log("____________________________");
        cityCoordinates = route.end_location;
        callback(null, route);
      });
            },
            function(callback) {
      console.log("________WEATHER API________");
      console.log("Location Coordinates: " + JSON.stringify(cityCoordinates));

      var url = "http://api.openweathermap.org/data/2.5/forecast";
      var qs = {
        lat: cityCoordinates.lat,
        lon: cityCoordinates.lng,
        appid: "ENTER OPENWEATHERMAP API EKY HERE"
      }
      request({
        "url": url,
        "qs": qs
      }, function(err, results) {
                var data = JSON.parse(results.body);
        var weather = {
          id: data.list[1].weather[0].id,
          main: data.list[1].weather[0].main,
          description: data.list[1].weather[0].description,
          cloudiness: data.list[1].clouds.all

        }

        if(data.list[0] && data.list[0].rain)
        {
          weather.rainVolume= data.list[0].rain["3h"];
        }

        console.log(JSON.stringify(weather));
        console.log("____________________________");
        callback(null, weather);
      });

            },
            function(callback) {
      console.log("________DISTANCE API________");
      console.log("Location Coordinates: " + JSON.stringify(cityCoordinates));

      var stations = distances.stations;
      var distanceMatrix = distances.distances;
      var url = "http://api.openweathermap.org/data/2.5/forecast";
      var transitPaths = lodash.filter(route.steps, x => x.travel_mode == "TRANSIT");
      console.log("transistPaths=" + transitPaths);
      if (transitPaths.length == 1) {
        var startLocation = {
          latitude: transitPaths[0].start_location.lat,
          longitude: transitPaths[0].start_location.lng
        };
        var endLocation = {
          latitude: transitPaths[0].end_location.lat,
          longitude: transitPaths[0].end_location.lng
        };
        console.log("startLocation=" + JSON.stringify(startLocation));
        console.log("endLocation=" + JSON.stringify(endLocation));
        var shortestPath1 = {
          distance: Infinity
        };
        var shortestPath2 = {
          distance: Infinity
        };
        stations.forEach(function(item, index, array) {
          var location = {
            latitude: item[item.length - 1].replace(",", "."),
            longitude: item[item.length - 2].replace(",", ".")
          };
          var startPointPath = geolib.getDistance(startLocation, location);
          if (startPointPath < shortestPath1.distance) {
            shortestPath1.distance = startPointPath;
            shortestPath1.index = index;
            shortestPath1.location = location;

          }
          var endPointPath = geolib.getDistance(endLocation, location);
          if (endPointPath < shortestPath2.distance) {
            shortestPath2.distance = endPointPath;
            shortestPath2.index = index;
            shortestPath2.location = location;

          }
        });

        console.log("shortestPathStart=" + JSON.stringify(shortestPath1));
        console.log("shortestPathEnd=" + JSON.stringify(shortestPath2));
        console.log("shortestPathStartMatrix=" + JSON.stringify(distanceMatrix[shortestPath1.index][shortestPath2.index]));
        var stations = {
          station1: shortestPath1,
          station2: shortestPath2,
                distance: distanceMatrix[shortestPath1.index][shortestPath2.index]
        };
        callback(null, stations)
      }else if(transitPaths.length > 1){
        var startLocation = {
          latitude: transitPaths[0].start_location.lat,
          longitude: transitPaths[0].start_location.lng
        };
        var endLocation = {
          latitude: transitPaths[transitPaths.length-1].end_location.lat,
          longitude: transitPaths[transitPaths.length-1].end_location.lng
        };
        console.log("startLocation=" + JSON.stringify(startLocation));
        console.log("endLocation=" + JSON.stringify(endLocation));
        var shortestPath1 = {
          distance: Infinity
        };
        var shortestPath2 = {
          distance: Infinity
        };
        stations.forEach(function(item, index, array) {
          var location = {
            latitude: item[item.length - 1].replace(",", "."),
            longitude: item[item.length - 2].replace(",", ".")
          };
          var startPointPath = geolib.getDistance(startLocation, location);
          if (startPointPath < shortestPath1.distance) {
            shortestPath1.distance = startPointPath;
            shortestPath1.index = index;
            shortestPath1.location = location;

          }
          var endPointPath = geolib.getDistance(endLocation, location);
          if (endPointPath < shortestPath2.distance) {
            shortestPath2.distance = endPointPath;
            shortestPath2.index = index;
            shortestPath2.location = location;

          }
        });

        console.log("shortestPathStart=" + JSON.stringify(shortestPath1));
        console.log("shortestPathEnd=" + JSON.stringify(shortestPath2));
        console.log("shortestPathStartMatrix=" + JSON.stringify(distanceMatrix[shortestPath1.index][shortestPath2.index]));
        var stations = {
          station1: shortestPath1,
          station2: shortestPath2,
          distance: distanceMatrix[shortestPath1.index][shortestPath2.index]
        };
        callback(null, stations)
      }

            }
        ], function(err, results) {
    console.log("_______PREFERENCE API_______");
    var preference = req.body.preference;
    var route = results[0];
    var weather = results[1];
    var distanceAPI = results[2];
    var influence = "preference";
    var calculatedRoute = [];
    if (preference == 'comfy') {
        calculatedRoute= route.steps;
    }
    if(preference == "DEBUG: bike (bad Weather)"){
      calculatedRoute= route.steps;
      influence = "shitty weather, it could rain (DEBUG)";
    }
    else if (preference == 'bike' || preference == 'bike (ignore Weather)') {
      var shittyWeather = false;
      if (weather.id == 800) {
        shittyWeather = false;
        console.log("CLEAR SKY");
      }
      else if (weather.id >= 500 && weather.id < 600 && preference != "bike (ignore Weather)") {
        shittyWeather = true;
        calculatedRoute= route.steps;
        influence = "shitty weather, it could rain";
        console.log("RAIN");
      }
      else if (weather.id >= 600 && weather.id < 700 && preference != "bike (ignore Weather)") {
        shittyWeather = true;
        calculatedRoute= route.steps;
        influence = "shitty weather, it could snow";
        console.log("SNOW");
      }
      else if (weather.id >= 801 && weather.id < 810) {
        shittyWeather = false;
        console.log("CLOUDS");
      }
      else if (weather.id >= 900 && weather.id < 1000 && preference != "bike (ignore Weather)") {
        shittyWeather = true;
        calculatedRoute= route.steps;
        influence = "shitty weather, it could rain";
        console.log("RAIN");
      }

      if (shittyWeather == false) {
        if (weather.rainVolume >= 51) {
          console.log("RAINED / SNOWED A LOT RECENTLY");
          weather.description = 'recently extreme rain/snow';
          weather.main = 'still wet';
          calculatedRoute= route.steps;
          influence = "shitty weather, it is still wet";
          shittyWeather = true;
        }
      }
      weather.shittyWeather = shittyWeather;
      if (shittyWeather == true) {
        console.log('TRANSIT');
      }
      else {
        console.log('BICYCLE');
        var transitNum = 0;
        route.steps.forEach(function(item){
          if(item.travel_mode != "TRANSIT"){
          calculatedRoute.push(item);
        }else{
          if(transitNum ==0)
          {
            console.log("distance="+distanceAPI.distance);
              calculatedRoute.push(  {
                  duration: {
                    text: Math.floor(distanceAPI.distance/300)+' mins',
                    value: 237
                  },
                  html_instructions: 'From Stadtrad Station 1 to Stadtrad Station 2',
                  travel_mode: "bicycling"

            });
            transitNum++;
          }
        }
        })
      }
      // adjusting trains with bycicle
    }
    else {
      // Schnell - best guess by google
    }

    var response = {
      maps_directions: route,
      route: calculatedRoute,
      weather: weather,
      influenced: influence
    };

    res.send(response);
    console.log("____________________________");
  });

});
// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
