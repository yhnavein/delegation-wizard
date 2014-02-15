/*global console:false, angular:false */
var app = angular.module('delegations', []);

app.controller('printCtrl', function($scope) {
  var self = this;

  self.addTime = function(date, time) {
    var parts = time.split(':');
    if(parts.length < 2)
      return;

    date.reset(); //resetting time part
    date.addHours(parts[0]);
    date.addMinutes(parts[1]);
  };

  self.fixDate = function(date, time) {
    var newDate = new Date(date);
    newDate.reset();

    if(typeof time !== 'undefined')
      self.addTime(newDate, time);

    return newDate;
  };

  self.prepareData = function() {

    var departureEnd = self.fixDate($scope.root.departure.date, $scope.root.departure.time);
    var arrivalStart = self.fixDate($scope.root.arrival.date, $scope.root.arrival.time);

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