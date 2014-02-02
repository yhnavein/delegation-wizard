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
    var fullDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var fullDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if(fullDate2 === fullDate1) {
      var hours = Math.abs( date1 - date2 ) / (1000 * 60 * 60);

      return {
        fullDays : (hours > 12 ? 1 : 0),
        halfDays : (hours <= 12 && hours > 8 ? 1 : 0),
        oneThirdDays : (hours <= 8 ? 1 : 0)
      };
    }

    var fullHours = Math.abs( date1 - date2 ) / (1000 * 60 * 60);
    var days = Math.floor( fullHours / 24 );
    var lastDayHours = fullHours - days * 24;

    if(lastDayHours >= 12)
      days++;

    return {
      fullDays : days,
      halfDays : (lastDayHours < 12 && lastDayHours >= 8 ? 1 : 0),
      oneThirdDays : (lastDayHours < 8 && lastDayHours > 0 ? 1 : 0)
    };
  };

  self.prepareDelegationDays = function(from, to) {
    var days = [];
    var i = 0;

    var fullHours = Math.abs( to - from ) / (1000 * 60 * 60);

    if(fullHours <= 24) {
      days.push({
        date: Globalize.format(from, 'yyyy-MM-dd (ddd)'),
        fromDate: Globalize.format(from, '(ddd) yyyy-MM-dd HH:mm'),
        toDate: Globalize.format(to, '(ddd) yyyy-MM-dd HH:mm'),
        hours: fullHours,
        dayType: (fullHours >= 12 ? 1 : (fullHours <= 8 ? 3 : 2)),
        provBreakfast : false,
        provDinner : false,
        provSupper : false,
        excluded : false
      });
      return days;
    }

    var lastDayHours = fullHours % 24;
    var iterator = new Date(from.getTime());
    var nextDay = new Date(from.getTime());
    nextDay.setDate(iterator.getDate() + 1);
    var dateType = 1;


    if (to <= from)
      return days;

    for(;;) {
      if(iterator >= to)
        break;

      days.push({
        date: Globalize.format(iterator, 'yyyy-MM-dd (ddd)'),
        fromDate: Globalize.format(iterator, '(ddd) yyyy-MM-dd HH:mm'),
        toDate: Globalize.format(nextDay, '(ddd) yyyy-MM-dd HH:mm'),
        hours: 24,
        dayType: dateType,
        provBreakfast : (i++ > 0 ? true : false),
        provDinner : false,
        provSupper : false,
        excluded : false
      });
      dateType = 1; //because after first there are only full days
      iterator.setDate(iterator.getDate() + 1);
      nextDay.setDate(iterator.getDate() + 1);
    }

    var lastDay = days.last();

    lastDay.toDate = Globalize.format(to, '(ddd) yyyy-MM-dd HH:mm');
    lastDay.hours = lastDayHours;
    lastDay.dayType = (lastDayHours >= 12 ? 1 : (lastDayHours <= 8 ? 3 : 2));

    return days;
  };

  self.foodCostToSubstract = function(delegationDays, dayDiem) {
    var valueToSubstract = 0;
    for (var i = 0; i < delegationDays.length; i++) {
      if(delegationDays[i].provBreakfast)
        valueToSubstract += 0.15 * dayDiem / delegationDays[i].dayType; //day type: 3 when 1/3 day, 2 when 1/2 day for diem, etc
      if(delegationDays[i].provDinner)
        valueToSubstract += 0.30 * dayDiem / delegationDays[i].dayType;
      if(delegationDays[i].provSupper)
        valueToSubstract += 0.30 * dayDiem / delegationDays[i].dayType;
    }
    return valueToSubstract;
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

  $scope.refreshCurrencyRate = function() {
    if(typeof $scope.country === 'undefined' || $scope.country === null)
      return;

    var curr = $scope.country.currency;
    var date = $scope.submitDate;

    if(typeof date === 'undefined' || date === null)
      return;

    $http.get('/nbp/getPLNRate?currency=' + curr + '&date=' + date).success(function(data) {
      $scope.exchangeRate = data;
      console.log(data);
    });
  };

  $scope.delegationCost = function() {
    if(typeof $scope.dateTo === 'undefined' || typeof $scope.dateFrom === 'undefined' || typeof $scope.country === 'undefined')
      return 0;

    var dayDiem = $scope.country.diem;
    var wholeDiem = dayDiem * ($scope.days.fullDays + $scope.days.halfDays / 2 + $scope.days.oneThirdDays / 3);
    var valueToSubstract = self.foodCostToSubstract($scope.delegationDays, dayDiem);

    return wholeDiem - valueToSubstract;
  };

  $scope.allCosts = function() {
    var delegationCost = $scope.delegationCost();
    if($scope.exchangeRate == null)
      return delegationCost;

    return delegationCost * $scope.exchangeRate.averageRate / $scope.exchangeRate.multiplier;
      // parseInt($scope.hotels.selCurr) +
      // parseInt($scope.transportCost.selCurr) +
      // parseInt($scope.publicTransport.selCurr) +
      // parseInt($scope.otherCosts.selCurr);
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