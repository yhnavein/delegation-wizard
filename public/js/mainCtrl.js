/*global console:false, angular:false */
var app = angular.module('delegations', ['ngQuickDate']);

app.controller('mainCtrl', function($scope, $http) {
  var self = this;

  $scope.transportWays = [ 'Train', 'Bus', 'Airplane' ];

  $http({
      method: 'GET',
      url: '/countries.json'
    }).
      success(function(data) {
        $scope.countriesList = angular.fromJson(data);
    });

  self.daysDiff = function(date1, date2) {
    var fHalfDays = 0, fOneThirdDays = 0;
    var fullDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var fullDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if(fullDate2 === fullDate1) {
      var hours = Math.abs( date2 - date1 ) / (1000 * 60 * 60);

      return {
        fullDays : (hours > 12 ? 1 : 0),
        halfDays : (hours <= 12 && hours > 8 ? 1 : 0),
        oneThirdDays : (hours <= 8 ? 1 : 0)
      };
    }

    var days = Math.floor( Math.abs( fullDate2 - fullDate1 ) / (1000 * 60 * 60 * 24) ) + 1;

    var firstDayHours = (24 - Math.floor( Math.abs( date1 - new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) ) / (1000 * 60 * 60) ));
    if(firstDayHours < 12) {
      days--;
      fHalfDays += (firstDayHours > 8 ? 1 : 0);
      fOneThirdDays += (firstDayHours <= 8 ? 1 : 0);
    }

    var lastDayHours = Math.floor( Math.abs( date2 - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()) ) / (1000 * 60 * 60) );
    if(lastDayHours < 12 && lastDayHours > 0) {
      days--;
      fHalfDays += (lastDayHours > 8 ? 1 : 0);
      fOneThirdDays += (lastDayHours <= 8 ? 1 : 0);
    }

    return {
      fullDays : days,
      halfDays : fHalfDays,
      oneThirdDays : fOneThirdDays
    };
  };

  self.prepareDelegationDays = function(from, to) {
    var days = [];
    var iterator = new Date(from.getFullYear(), from.getMonth(), from.getDate());

    if (to <= from)
      return days;

    for(;;) {
      days.push({
        date: iterator.toLocaleDateString(),
        dayType: 1,
        provBreakfast : false,
        provDinner : false,
        provSupper : false,
        excluded : false
      });
      if(iterator >= to)
        break;
      iterator.setDate(iterator.getDate() + 1);
    }

    return days;
  };

  $scope.delegationCost = function() {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.country === 'undefined')
      return 0;

    return $scope.country.diem * ($scope.days.fullDays + $scope.days.halfDays / 2 + $scope.days.oneThirdDays / 3);
  };

  $scope.datesChange = function(f) {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined')
      return;

    $scope.days = self.daysDiff($scope.dateFrom, $scope.dateTo);
    $scope.delegationDays = self.prepareDelegationDays($scope.dateFrom, $scope.dateTo);
  };
});