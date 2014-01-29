/*global console:false, angular:false, Globalize:false */
var app = angular.module('delegations', []);

app.controller('mainCtrl', function($scope, $http) {
  var self = this;

  $scope.transportWays = [
    { nameEN: 'Train', namePL: 'Pociąg' },
    { nameEN: 'Bus', namePL: 'Autobus' },
    { nameEN: 'Airplane',  namePL: 'Samolot' }
  ];
  $scope.submitDate = Globalize.format(new Date(), 'yyyy-MM-dd');

  //for test currently
  $scope.dateFrom = '2014-01-05';
  $scope.dateTimeFrom = '10:00';
  $scope.dateTo = '2014-01-14';
  $scope.dateTimeTo = '18:30';

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

    var firstDayHours = (24 - Math.abs( date1 - new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) ) / (1000 * 60 * 60) );
    if(firstDayHours < 12) {
      days--;
      fHalfDays += (firstDayHours > 8 ? 1 : 0);
      fOneThirdDays += (firstDayHours <= 8 ? 1 : 0);
    }

    var lastDayHours = Math.abs( date2 - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()) ) / (1000 * 60 * 60);
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
    var i = 0;
    var iterator = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var firstDayHours = (24 - Math.abs( from - new Date(from.getFullYear(), from.getMonth(), from.getDate()) ) / (1000 * 60 * 60) );
    var dateType = (firstDayHours >= 12 ? 1 : (firstDayHours <= 8 ? 3 : 2));

    if (to <= from)
      return days;

    for(;;) {
      days.push({
        date: Globalize.format(iterator, 'yyyy-MM-dd (ddd)'),
        dayType: dateType,
        provBreakfast : (i++ > 0 ? true : false),
        provDinner : false,
        provSupper : false,
        excluded : false
      });
      dateType = 1; //because after first there are only full days
      if(iterator >= to)
        break;
      iterator.setDate(iterator.getDate() + 1);
    }

    var lastDay = days.last();
    if(lastDay.date !== days.first().date) {
      var lastDayHours = Math.abs( to - new Date(to.getFullYear(), to.getMonth(), to.getDate()) ) / (1000 * 60 * 60);
      lastDay.dayType = (lastDayHours >= 12 ? 1 : (lastDayHours <= 8 ? 3 : 2));
    }

    return days;
  };

  $scope.datePattern = (function() {
    var regexp = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
    return {
      test: function(value) {
        return regexp.test(value);
      }
    };
  })();

  $scope.timePattern = (function() {
    var regexp = /^([0-1]?\d|2[0-3]):([0-5]?\d)$/;
    return {
      test: function(value) {
        return regexp.test(value);
      }
    };
  })();

  $scope.delegationCost = function() {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.country === 'undefined')
      return 0;

    var dayDiem = $scope.country.diem;
    var wholeDiem = dayDiem * ($scope.days.fullDays + $scope.days.halfDays / 2 + $scope.days.oneThirdDays / 3);

    var valueToSubstract = 0;
    for (var i = 0; i < $scope.delegationDays.length; i++) {
      if($scope.delegationDays[i].provBreakfast)
        valueToSubstract += 0.15 * dayDiem / $scope.delegationDays[i].dayType; //day type: 3 when 1/3 day, 2 when 1/2 day for diem, etc
      if($scope.delegationDays[i].provDinner)
        valueToSubstract += 0.30 * dayDiem / $scope.delegationDays[i].dayType;
      if($scope.delegationDays[i].provSupper)
        valueToSubstract += 0.30 * dayDiem / $scope.delegationDays[i].dayType;
    }

    return wholeDiem - valueToSubstract;
  };

  $scope.datesChange = function() {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.dateTimeTo === 'undefined' || typeof $scope.dateTimeFrom === 'undefined')
      return;

    var dateFrom = new Date($scope.dateFrom + ' ' + $scope.dateTimeFrom);
    var dateTo = new Date($scope.dateTo + ' ' + $scope.dateTimeTo);

    $scope.days = self.daysDiff(dateFrom, dateTo);
    $scope.delegationDays = self.prepareDelegationDays(dateFrom, dateTo);
  };

  $scope.datesChange();
});