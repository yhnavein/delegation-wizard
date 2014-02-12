/*global describe:false, angular:false, expect:false, it:false, beforeEach:false, module:false, inject:false */
'use strict';

describe('counting days properly', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('delegations'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        ctrl = $controller('mainCtrl', { $scope: scope, $http: $http });
    }));


    it('days diff between 2013-01-02 and 2013-01-05 is 3', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2), new Date(2013,0,5));
        expect(days.fullDays).toEqual(3);
    });

    it('days diff between 2013-01-02 and 2013-01-02 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2), new Date(2013,0,2));
        expect(days.fullDays).toEqual(0);
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-02 23:00 is 1', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,2,23,0,0));
        expect(days.fullDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:30 and 2013-01-02 22:30 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,30,0), new Date(2013,0,2,22,30,0));
        expect(days.fullDays).toEqual(0);
        expect(days.halfDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:30 and 2013-01-02 22:31 is 1', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,30,0), new Date(2013,0,2,22,31,0));
        expect(days.fullDays).toEqual(1);
        expect(days.halfDays).toEqual(0);
    });

    it('days diff between 2013-01-02 10:30 and 2013-01-02 22:29 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,30,0), new Date(2013,0,2,22,29,0));
        expect(days.fullDays).toEqual(0);
        expect(days.halfDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-02 15:00 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,2,15,0,0));
        expect(days.fullDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(1);
    });

    it('days diff between 2013-01-02 and 2013-02-02 is 31', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2), new Date(2013,1,2));
        expect(days.fullDays).toEqual(31);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-02 15:00 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,2,15,0,0));
        expect(days.fullDays).toEqual(0);
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-03 9:00 is 1', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,3,9,0,0));
        expect(days.fullDays).toEqual(1);
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(0);
    });

    it('days diff between 2013-01-02 19:00 and 2013-01-03 9:00 is 1', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,19,0,0), new Date(2013,0,3,9,0,0));
        expect(days.fullDays).toEqual(1); // hours diff == 14. 14 > 12, so it's a full day
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(0);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-06 18:30 is 4', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,6,18,30,0));
        expect(days.fullDays).toEqual(4);
        expect(days.halfDays).toEqual(1);
    });

    it('days diff between 2013-01-02 19:00 and 2013-01-06 11:30 is 4', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,19,0,0), new Date(2013,0,6,11,30,0));
        expect(days.fullDays).toEqual(4);
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(0);
    });

    it('exactly 24 hours abroad is treated as only 1 day', function() {
        var days = ctrl.daysDiff(new Date(2013,0,4,19,0,0), new Date(2013,0,5,19,0,0));
        expect(days.fullDays).toEqual(1);
        expect(days.halfDays).toEqual(0);
        expect(days.oneThirdDays).toEqual(0);
    });

});


describe('presenting days summary', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('delegations'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        ctrl = $controller('mainCtrl', { $scope: scope, $http: $http });
    }));


    it('standard date range', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,15,0), new Date(2013,0,5,5,0));
        //to have 3 days
        var lastDay = days.last();
        expect(lastDay.dayType).toEqual(1);
    });

    it('one day date range (around half a day)', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,10,0), new Date(2013,0,2,19,0));
        //to have 1 day
        var day = days.first();
        expect(day.dayType).toEqual(2);
    });

    it('one day date range (more than half a day)', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,7,0), new Date(2013,0,2,21,0));
        //to have 1 day
        var day = days.first();
        expect(day.dayType).toEqual(1);
    });

    it('one day date range (less than one third a day)', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,10,15), new Date(2013,0,2,16,0));
        //to have 1 day
        var day = days.first();
        expect(day.dayType).toEqual(3);
    });

});


describe('calculating food costs (for substracing)', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('delegations'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        scope.country = { nameEN: "United Kingdom", namePL: "Wielka Brytania", code: "GB", diem: 35, currency: "GBP" };
        ctrl = $controller('mainCtrl', { $scope: scope, $http: $http });
    }));


    it('one day date range (around half a day), no meals', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,10,0), new Date(2013,0,2,19,0));
        //to have 1 day
        var day = days.first();
        day.provBreakfast = false;
        day.provDinner = false;
        day.provSupper = false;
        var foodCost = ctrl.foodCostToSubstract(days, scope.country.diem);
        expect(foodCost).toEqual(0);
    });

    it('one day date range (around half a day), all meals', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,10,0), new Date(2013,0,2,19,0));
        //to have 1 day
        var day = days.first();
        day.provBreakfast = true;
        day.provDinner = true;
        day.provSupper = true;
        var foodCost = ctrl.foodCostToSubstract(days, scope.country.diem);
        expect(foodCost).toEqual(35 * 0.5 * 0.75);
    });

    it('exactly 24 hours abroad, one breakfast, one dinner', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,19,0), new Date(2013,0,3,19,0));
        //to have 1 day
        var day = days.first();
        day.provBreakfast = true;
        day.provDinner = true;
        day.provSupper = false;
        var foodCost = ctrl.foodCostToSubstract(days, scope.country.diem);
        expect(foodCost).toEqual(15.75);
    });

    it('2+ days, two breakfasts, one dinner', function() {
        var days = ctrl.prepareDelegationDays(new Date(2013,0,2,19,0), new Date(2013,0,5,5,0));
        //to have 3 days
        var day = days.first();
        day.provBreakfast = false;
        day.provDinner = true;
        day.provSupper = false;
        day = days[1];
        day.provBreakfast = true;
        day.provDinner = false;
        day.provSupper = false;
        day = days.last();
        day.provBreakfast = true;
        day.provDinner = false;
        day.provSupper = false;
        var foodCost = ctrl.foodCostToSubstract(days, scope.country.diem);
        expect(foodCost).toEqual(18.375);
    });

});


describe('calculating diem costs', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('delegations'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        ctrl = $controller('mainCtrl', { $scope: scope, $http: $http });
        scope.root.country = { nameEN: "United Kingdom", namePL: "Wielka Brytania", code: "GB", diem: 35, currency: "GBP" };
    }));


    it('one day date range (around half a day), all meals provided', function() {
        scope.root.departure = {
            date: '2013-01-02',
            time: '10:00'
        };
        scope.root.arrival = {
            date: '2013-01-02',
            time: '19:00'
        };
        scope.datesChange();

        //to have 1 day
        var day = scope.root.delegationDays.first();
        day.provBreakfast = true;
        day.provDinner = true;
        day.provSupper = true;

        expect(scope.delegationCost()).toEqual(35 * 0.5 * 0.25);
    });

});
