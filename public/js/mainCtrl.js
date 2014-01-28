/*global console:false, angular:false, Globalize:false */
var app = angular.module('delegations', []);

app.controller('mainCtrl', function($scope, $http) {
  var self = this;

  $scope.transportWays = [ 'Train', 'Bus', 'Airplane' ];
  $scope.submitDate = Globalize.format(new Date(), 'dd-MM-yyyy');

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
        date: Globalize.format(iterator, 'dd-MM-yyyy'),
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

  $scope.datePattern = (function() {
    var regexp = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
    return {
      test: function(value) {
        return regexp.test(value);
      }
    };
  })();

  $scope.timePattern = (function() {
    var regexp = /^([0-1]?\d|2[0-3]):([0-5]?\d)/;
    return {
      test: function(value) {
        return regexp.test(value);
      }
    };
  })();

  $scope.delegationCost = function() {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.country === 'undefined')
      return 0;

    return $scope.country.diem * ($scope.days.fullDays + $scope.days.halfDays / 2 + $scope.days.oneThirdDays / 3);
  };

  $scope.datesChange = function(f) {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.dateTimeTo === 'undefined' || typeof $scope.dateTimeFrom === 'undefined')
      return;

    var dateFrom = new Date($scope.dateFrom + ' ' + $scope.dateTimeFrom);
    var dateTo = new Date($scope.dateTo + ' ' + $scope.dateTimeTo);

    $scope.days = self.daysDiff(dateFrom, dateTo);
    $scope.delegationDays = self.prepareDelegationDays(dateFrom, dateTo);
  };
});