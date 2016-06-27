'use strict';

var app = angular.module('example', [
	'ngSanitize',
  'ui.router',
  'angular-timeline',
	'angular-scroll-animate'
]);

app.config(function($stateProvider) {
  $stateProvider.state('home', {
    url:         '',
    controller: 'ExampleCtrl',
    templateUrl: 'example.html'
  });
	$stateProvider.state('about', {
		url:         '/about',
		controller: '',
		templateUrl: 'about.html'
	});
});
