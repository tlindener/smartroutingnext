'use strict';

var ExampleCtrl = function($rootScope, $document, $timeout, $scope, $http) {

  $scope.locationStart = "";
  $scope.locationStop = "";
  $scope.preference = "";
  $scope.routePreference = "";
  $scope.side = '';
  $scope.submitRequest = function() {
    var req = {
      method: 'POST',
      url: 'http://localhost:8080/request',
      headers: {
        'Content-Type': "application/json"
      },
      data: {
        origin: $scope.locationStart,
        destination: $scope.locationStop,
        preference: $scope.routePreference
      }
    }

    $http(req).then(function successCallback(response) {
      var evts = [];
			$scope.headline = "Smarter Routing recommends the following route"
      $scope.influenced = "Your route was influenced by " + response.data.influenced;
      response.data.route.forEach(function(element) {
        var icon;
        switch (element.travel_mode.toLowerCase()) {
          case "walking":
            icon = "icon_foot.svg";
            break;
          case "tansit":
            icon = "icon_train.svg";
            break;
          case "bicycling":
            icon = "icon_bike.svg";
            break;
          default:
            icon = "icon_train.svg";
            break;
        }
        evts.push({
          badgeClass: 'info',
          badgeIconClass: icon,
          title: element.html_instructions,
          when: element.duration.text.replace("mins", "minutes") + " by " + element.travel_mode,
          content: ''
        });
      })
      $scope.events = evts;
    }, function errorCallback(response) {
      console.log(response);
    });

  };
  // $scope.events = [{
  // 	badgeClass: 'info',
  // 	badgeIconClass: 'glyphicon-check',
  // 	title: 'First heading',
  // 	when: '11 hours ago via Twitter',
  // 	content: 'Some awesome content.'
  // }, {
  // 	badgeClass: 'warning',
  // 	badgeIconClass: 'glyphicon-credit-card',
  // 	title: 'Second heading',
  // 	when: '12 hours ago via Twitter',
  // 	content: 'More awesome content.'
  // }, {
  // 	badgeClass: 'default',
  // 	badgeIconClass: 'glyphicon-credit-card',
  // 	title: 'Third heading',
  // 	titleContentHtml: '<img class="img-responsive" src="http://www.freeimages.com/assets/183333/1833326510/wood-weel-1444183-m.jpg">',
  // 	contentHtml: lorem,
  // 	footerContentHtml: '<a href="">Continue Reading</a>'
  // }];
  $scope.events = [];
  $scope.prefs = ["bike", "comfy", "bike (ignore Weather)", "DEBUG: bike (bad Weather)"];
  $scope.addEvent = function() {
    $scope.events.push({
      badgeClass: 'info',
      badgeIconClass: 'glyphicon-check',
      title: 'First heading',
      when: '3 hours ago via Twitter',
      content: 'Some awesome content.'
    });

  };
  // optional: not mandatory (uses angular-scroll-animate)
  $scope.animateElementIn = function($el) {
    $el.removeClass('timeline-hidden');
    $el.addClass('bounce-in');
  };

  // optional: not mandatory (uses angular-scroll-animate)
  $scope.animateElementOut = function($el) {
    $el.addClass('timeline-hidden');
    $el.removeClass('bounce-in');
  };

  $scope.leftAlign = function() {
    $scope.side = 'left';
  }

  $scope.rightAlign = function() {
    $scope.side = 'right';
  }

  $scope.defaultAlign = function() {
    $scope.side = ''; // or 'alternate'
  }
};

angular.module('example').controller('ExampleCtrl', ExampleCtrl);
