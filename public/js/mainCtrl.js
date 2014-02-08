/*global console:false, angular:false */
var app = angular.module('delegations', []);

app.controller('mainCtrl', function($scope, $http, $filter) {
  var self = this;
  $scope.root = {};

  $scope.transportWays = [
    { nameEN: 'Train', namePL: 'Pociąg' },
    { nameEN: 'Bus', namePL: 'Autobus' },
    { nameEN: 'Airplane',  namePL: 'Samolot' }
  ];

  //putting some default values
  $scope.root.submitDate = $filter('date')(new Date(), 'yyyy-MM-dd');
  $scope.root.transportName = $scope.transportWays.last();
  $scope.root.startCity = 'Warszawa';

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

  self.onLoadComplete = function(data) {
    $scope.countriesList = angular.fromJson(data);

    if(typeof window.localStorage.delegation !== 'undefined'){
      $scope.root = angular.fromJson( window.localStorage.getItem('delegation') );
      $scope.root.country = $scope.countriesList.find(function(el) {
        return el.code === $scope.root.country.code;
      });
      $scope.root.transportName = $scope.transportWays.find(function(el) {
        return el.namePL === $scope.root.transportName.namePL;
      });
    }
    else
      $scope.datesChange();
  };

  self.prepareDelegationDays = function(from, to) {
    var days = [];
    var fullHours = Math.abs( to - from ) / (1000 * 60 * 60);

    if(fullHours <= 24) {
      days.push({
        date: new Date( from.getTime()),
        fromDate: new Date( from.getTime()),
        toDate: new Date( to.getTime()),
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
        date: new Date( iterator.getTime() ),
        fromDate: new Date( iterator.getTime() ),
        toDate: new Date( nextDay.getTime() ),
        hours: 24,
        dayType: dateType,
        provBreakfast : true,
        provDinner : false,
        provSupper : false,
        excluded : false
      });
      dateType = 1; //because after first there are only full days
      iterator.setDate(iterator.getDate() + 1);
      nextDay.setDate(iterator.getDate() + 1);
    }

    var lastDay = days.last();

    lastDay.provBreakfast = (lastDayHours >= 12);
    lastDay.toDate = to;
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
    if(typeof $scope.root.country === 'undefined' || $scope.root.country === null)
      return;

    var curr = $scope.root.country.currency;
    var date = $scope.root.submitDate;

    if(typeof date === 'undefined' || date === null)
      return;

    $http.get('/nbp/getPLNRate?currency=' + curr + '&date=' + date).success(function(data) {
      $scope.root.exchangeRate = data;
      console.log(data);
    });
  };

  $scope.delegationCost = function() {
    if(typeof $scope.root.dateTo === 'undefined' || typeof $scope.root.dateFrom === 'undefined' || typeof $scope.root.country === 'undefined')
      return 0;

    var dayDiem = $scope.root.country.diem;
    var wholeDiem = dayDiem * ($scope.root.days.fullDays + $scope.root.days.halfDays / 2 + $scope.root.days.oneThirdDays / 3);
    var valueToSubstract = self.foodCostToSubstract($scope.root.delegationDays, dayDiem);

    return wholeDiem - valueToSubstract;
  };

  $scope.allCosts = function() {
    var delegationCost = $scope.delegationCost();
    if(typeof $scope.root.exchangeRate === 'undefined' || $scope.root.exchangeRate === null)
      return delegationCost;

    return delegationCost * $scope.root.exchangeRate.averageRate / $scope.root.exchangeRate.multiplier;
      // parseInt($scope.hotels.selCurr) +
      // parseInt($scope.transportCost.selCurr) +
      // parseInt($scope.publicTransport.selCurr) +
      // parseInt($scope.otherCosts.selCurr);
  };

  $scope.datesChange = function() {
    if(typeof $scope.root.dateTo === 'undefined' || typeof $scope.root.dateFrom === 'undefined' || typeof $scope.root.dateTimeTo === 'undefined' || typeof $scope.root.dateTimeFrom === 'undefined')
      return;

    var dateFrom = new Date($scope.root.dateFrom + 'T' + $scope.root.dateTimeFrom.padLeft(5, '0') + ':00');
    var dateTo = new Date($scope.root.dateTo + 'T' + $scope.root.dateTimeTo.padLeft(5, '0') + ':00');

    if(!dateFrom.isValid() || !dateTo.isValid())
      return;

    $scope.root.days = self.daysDiff(dateFrom, dateTo);
    $scope.root.delegationDays = self.prepareDelegationDays(dateFrom, dateTo);
  };

  $scope.goToPrint = function() {
    window.localStorage.setItem('delegation', angular.toJson($scope.root));
  };

  $http({
    method: 'GET',
    url: '/countries.json'
  }).success(self.onLoadComplete);

});