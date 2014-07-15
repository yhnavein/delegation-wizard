/*global console:false, angular:false */
var app = angular.module('delegations', ['ui.bootstrap']);

app.controller('mainCtrl', function($scope, $http, $filter) {
  var self = this;
  $scope.root = { departure: {}, arrival: {} };

  $scope.transportWays = [
    { nameEN: 'Train', namePL: 'Pociąg' },
    { nameEN: 'Bus', namePL: 'Autobus' },
    { nameEN: 'Airplane',  namePL: 'Samolot' }
  ];

  $scope.step = 1;
  $scope.showSpinner = false;
  $scope.defaults = { provBreakfast : true };

  //putting some default values
  $scope.root.submitDate = $filter('date')(new Date(), 'yyyy-MM-dd');
  $scope.root.departure.transport = $scope.transportWays.last();
  $scope.root.arrival.transport = $scope.transportWays.last();
  $scope.root.startCity = 'Warszawa';
  $scope.root.expenses = [];

  self.daysDiff = function(date1, date2) {
    var fullDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var fullDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    if(date1 >= date2)
      return { fullDays: 0, halfDays: 0, oneThirdDays: 0 };

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
      oneThirdDays : (lastDayHours < 8 && lastDayHours > 0 ? 1 : 0),
      hours : lastDayHours,
      minutes : (fullHours - Math.floor( fullHours )) * 60
    };
  };

  self.onLoadComplete = function(data) {
    $scope.countriesList = angular.fromJson(data);

    if(typeof window.localStorage.delegation !== 'undefined'){
      $scope.root = angular.fromJson( window.localStorage.getItem('delegation') );
      $scope.root.country = $scope.countriesList.find(function(el) {
        return el.code === $scope.root.country.code;
      });
      $scope.root.departure.transport = $scope.transportWays.find(function(el) {
        return el.namePL === $scope.root.departure.transport.namePL;
      });
      $scope.root.arrival.transport = $scope.transportWays.find(function(el) {
        return el.namePL === $scope.root.arrival.transport.namePL;
      });
    }
    else
      $scope.datesChange();
  };

  self.prepareDelegationDays = function(from, to) {
    var days = [];
    var fullHours = (to - from) / (1000 * 60 * 60);

    if(fullHours < 0)
      return days;

    if(fullHours <= 24) {
      days.push({
        date: new Date( from.getTime() ),
        fromDate: new Date( from.getTime() ),
        toDate: new Date( to.getTime() ),
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
        dayType: 1,
        provBreakfast : true,
        provDinner : false,
        provSupper : false,
        excluded : false
      });
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
        valueToSubstract += 0.15 * dayDiem;
      if(delegationDays[i].provDinner)
        valueToSubstract += 0.30 * dayDiem;
      if(delegationDays[i].provSupper)
        valueToSubstract += 0.30 * dayDiem;
    }
    return valueToSubstract;
  };

  self.addTime = function(date, time) {
    var parts = time.split(':');
    if(parts.length < 2)
      return;

    date.reset(); //resetting time part
    date.addHours(parts[0]);
    date.addMinutes(parts[1]);
  };

  self.prepareExpenses = function(root) {
    if(typeof root.expenses === 'undefined' || root.expenses === null)
      return;

    for(var i=0;i<root.expenses.length;i++) {
      root.expenses[i].rate = root.expenses[i].rateType ? root.expenses[i].customRate : root.exchangeRate.averageRate;

      if(root.expenses[i].currency === 'PLN'){
        root.expenses[i].plnValue = root.expenses[i].price;
        root.expenses[i].rate = root.exchangeRate.averageRate;
      }
      else
        root.expenses[i].plnValue = (root.expenses[i].rate * root.expenses[i].price).round(2);
    }
  };

  $scope.timePattern = (function() {
    var regexp = /^([0-1]?\d|2[0-3]):([0-5]?\d)$/;
    return {
      test: function(value) {
        return regexp.test(value);
      }
    };
  })();

  $scope.changeProvMeal = function (mealName) {
    var keyName = 'prov' + mealName;
    var newValue = $scope.defaults[keyName];

    for (var i = 0; i < $scope.root.delegationDays.length; i++) {
      $scope.root.delegationDays[i][keyName] = newValue;
    }
  };

  $scope.changeCurrency = function(exp, curr){
    exp.currency = curr;
  };

  $scope.addExpense = function(){
    if(typeof $scope.root.expenses === 'undefined')
      $scope.root.expenses = [];

    $scope.root.expenses.push({
      currency: $scope.root.country.currency
    });
  };

  $scope.removeExpense = function(exp) {
    if(typeof $scope.root.expenses === 'undefined')
      return;

    $scope.root.expenses.remove(exp);
  };

  $scope.refreshCurrencyRate = function() {
    if(typeof $scope.root.country === 'undefined' || $scope.root.country === null)
      return;

    var curr = $scope.root.country.currency;
    var travelTime = $scope.root.country.travelTime;
    var date = $scope.root.submitDate;

    if(typeof date === 'undefined' || date === null)
      return;

    date = $filter('date')(date, 'yyyy-MM-dd');

    if(travelTime && !($scope.root.departure.duration || $scope.root.arrival.duration)) {
      $scope.root.departure.duration = travelTime;
      $scope.root.arrival.duration = travelTime;
    }

    $scope.showSpinner = true;
    $http.get('/nbp/getPLNRate?currency=' + curr + '&date=' + date).success(function(data) {
      $scope.root.exchangeRate = data;
      $scope.showSpinner = false;
    });
  };

  $scope.isFirstStepValid = function(validationStep1) {
    return validationStep1.$valid && $scope.root.delegationDays.length > 0;
  };

  $scope.isStepValid = function(validationStep1, validationStep3) {
    return ($scope.step > 0 && $scope.step < 3 && validationStep1.$valid && $scope.root.delegationDays.length > 0) || ($scope.step === 3 && validationStep3.$valid);
  };

  $scope.isValid = function(validationStep1, validationStep3) {
    return (validationStep1.$valid && $scope.root.delegationDays.length > 0 && validationStep3.$valid);
  };

  $scope.delegationCost = function() {
    if($scope.root.days === null || typeof $scope.root.days === 'undefined' || typeof $scope.root.country === 'undefined')
      return 0;

    var dayDiem = $scope.root.country.diem;
    var wholeDiem = dayDiem * ($scope.root.days.fullDays + $scope.root.days.halfDays / 2 + $scope.root.days.oneThirdDays / 3);
    var valueToSubstract = self.foodCostToSubstract($scope.root.delegationDays, dayDiem);

    return wholeDiem - valueToSubstract;
  };

  $scope.changeRateType = function(exp, type) {
    if(type === 0)
      exp.customRate = null;

    exp.rateType = type;
  };

  $scope.datesChange = function() {
    if(typeof $scope.root.departure.date === 'undefined' || typeof $scope.root.arrival.date === 'undefined' || typeof $scope.root.arrival.time === 'undefined' || typeof $scope.root.departure.time === 'undefined')
      return;

    if(typeof $scope.root.departure.date === 'string')
      $scope.root.departure.date = new Date($scope.root.departure.date);
    if(typeof $scope.root.arrival.date === 'string')
      $scope.root.arrival.date = new Date($scope.root.arrival.date);

    var dateFrom = $scope.root.departure.date.clone();
    var dateTo = $scope.root.arrival.date.clone();

    self.addTime(dateFrom, $scope.root.departure.time);
    self.addTime(dateTo, $scope.root.arrival.time);

    if(!dateFrom.isValid() || !dateTo.isValid())
      return;

    $scope.root.days = self.daysDiff(dateFrom, dateTo);
    $scope.root.delegationDays = self.prepareDelegationDays(dateFrom, dateTo);
  };

  $scope.dateOptions = {
    startingDay: 1,
    showWeeks: false
  };

  $scope.goToPrint = function() {
    $scope.root.delegationCost = $scope.delegationCost().round(2);
    self.prepareExpenses($scope.root);
    window.localStorage.setItem('delegation', angular.toJson($scope.root));
    window.location = '/print';
  };

  $scope.changeStep = function(step) {
    $scope.step = step;
  };

  $http({
    method: 'GET',
    url: '/countries.json'
  }).success(self.onLoadComplete);

});