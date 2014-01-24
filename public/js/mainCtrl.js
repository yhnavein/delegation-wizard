/*global console:false, angular:false */
var app = angular.module('delegations', ['ui.bootstrap']);

app.controller('mainCtrl', function($scope, $http) {
  var self = this;

  $scope.transportWays = [ 'Train', 'Bus', 'Flight' ];

  $http({
      method: 'GET',
      url: '/countries.json'
    }).
      success(function(data) {
        $scope.countriesList = angular.fromJson(data);
    });
});