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

  self.extractDates = function(func) {
    var dates = $scope.root.delegationDays.findAll(func);
    if(typeof dates === 'undefined' || dates === null)
      return [];

    return dates.map(function(el) {
      return new Date( el.date );
    });
  };

  self.prepareData = function() {

    var departureEnd = self.fixDate($scope.root.departure.date, $scope.root.departure.time);
    var arrivalStart = self.fixDate($scope.root.arrival.date, $scope.root.arrival.time);

    departureEnd.setTime(departureEnd.getTime() + $scope.root.departure.duration * 60 * 60 * 1000);
    arrivalStart.setTime(arrivalStart.getTime() - $scope.root.arrival.duration * 60 * 60 * 1000);
    $scope.root.departureEnd = departureEnd;
    $scope.root.arrivalStart = arrivalStart;

    $scope.breakfastDays = self.extractDates(function(el) {
      return el.provBreakfast === true;
    });
    $scope.dinnerDays = self.extractDates(function(el) {
      return el.provDinner === true;
    });
    $scope.supperDays = self.extractDates(function(el) {
      return el.provSupper === true;
    });

    $scope.root.days.hours = Math.floor($scope.root.days.hours);
  };

  self.init = function() {
    if(typeof window.localStorage.delegation !== 'undefined'){
      $scope.root = angular.fromJson( window.localStorage.getItem('delegation') );
      self.prepareData();
    }
    else
      $scope.errorMsg = 'Nie znaleziono delegacji do pokazania!';
  };

  $scope.sumExpenses = function() {
    var sum = $scope.root.delegationCost * $scope.root.exchangeRate.averageRate;

    if(typeof $scope.root.expenses === 'undefined' || $scope.root.expenses === null)
      return sum;

    for (var i = 0; i < $scope.root.expenses.length; i++) {
      sum += $scope.root.expenses[i].plnValue;
    }

    return sum;
  };

  self.init();
});