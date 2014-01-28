/*global describe:false, angular:false, expect:false, it:false, beforeEach:false, module:false, inject:false */
'use strict';

describe('delegations main controller', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('ngQuickDate'));
    beforeEach(module('delegations'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        ctrl = $controller('mainCtrl', { $scope: scope, $http: $http });
    }));


    // date diffing tests

    it('days diff between 2013-01-02 and 2013-01-05 is 4', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2), new Date(2013,0,5));
        expect(days.fullDays).toEqual(4);
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

    it('days diff between 2013-01-02 and 2013-02-02 is 32', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2), new Date(2013,1,2));
        expect(days.fullDays).toEqual(32);
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
        expect(days.halfDays).toEqual(1);
        expect(days.oneThirdDays).toEqual(0);
    });

    it('days diff between 2013-01-02 19:00 and 2013-01-03 9:00 is 0', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,19,0,0), new Date(2013,0,3,9,0,0));
        expect(days.fullDays).toEqual(0);
        expect(days.halfDays).toEqual(1);
        expect(days.oneThirdDays).toEqual(1);
    });

    it('days diff between 2013-01-02 10:00 and 2013-01-06 18:30 is 5', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,10,0,0), new Date(2013,0,6,18,30,0));
        expect(days.fullDays).toEqual(5);
    });

    it('days diff between 2013-01-02 19:00 and 2013-01-06 11:30 is 3', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,19,0,0), new Date(2013,0,6,11,30,0));
        expect(days.fullDays).toEqual(3);
        expect(days.halfDays).toEqual(1);
        expect(days.oneThirdDays).toEqual(1);
    });

});