/*global console:false, angular:false */
var app = angular.module('delegations', []);

app.controller('printCtrl', function($scope) {
  var self = this;

  self.prepareData = function() {
    var departureEnd = new Date($scope.root.departure.date + 'T' + $scope.root.departure.time.padLeft(5, '0') + ':00');
    var arrivalStart = new Date($scope.root.arrival.date + 'T' + $scope.root.arrival.time.padLeft(5, '0') + ':00');
    departureEnd.setTime(departureEnd.getTime() + $scope.root.departure.duration * 60 * 60 * 1000);
    arrivalStart.setTime(arrivalStart.getTime() - $scope.root.arrival.duration * 60 * 60 * 1000);
    $scope.root.departureEnd = departureEnd;
    $scope.root.arrivalStart = arrivalStart;
  };

  self.init = function() {
    if(typeof window.localStorage.delegation !== 'undefined'){
      $scope.root = angular.fromJson( window.localStorage.getItem('delegation') );
      self.prepareData();
    }
    else
      $scope.errorMsg = 'Nie znaleziono delegacji do pokazania!';
  };

  self.init();
});