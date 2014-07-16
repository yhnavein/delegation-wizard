/*global describe:false, angular:false, expect:false, it:false, beforeEach:false, module:false, inject:false */
'use strict';

describe('counting days properly', function(){
    var scope, ctrl, httpBackend;

    beforeEach(module('mgcrea.ngStrap'));
    beforeEach(module('delegations-print'));

    beforeEach(inject(function($rootScope, $controller, $httpBackend, $http) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        ctrl = $controller('printCtrl', { $scope: scope, $http: $http });
    }));

    it('days diff between 2014-07-10 07:20 and 2014-07-11 22:50 is 1d15h30m', function() {
        var days = ctrl.daysDiff(new Date(2014,6,10,7,20,0), new Date(2014,6,11,22,50,0));
        expect(days.fullDays).toEqual(1);
        expect(days.hours).toEqual(15);
        expect(days.minutes).toEqual(30);
    });

    it('days diff between 2013-01-02 19:00 and 2013-01-03 9:00 is 0d15h0m', function() {
        var days = ctrl.daysDiff(new Date(2013,0,2,19,0,0), new Date(2013,0,3,9,0,0));
        expect(days.fullDays).toEqual(0);
        expect(days.hours).toEqual(14);
        expect(days.minutes).toEqual(0);
    });

});

