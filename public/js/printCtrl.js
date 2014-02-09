/*global console:false, angular:false */
var app = angular.module('delegations', []);

app.controller('printCtrl', function($scope) {
  var self = this;

  self.init = function() {
    if(typeof window.localStorage.delegation !== 'undefined'){
      $scope.root = angular.fromJson( window.localStorage.getItem('delegation') );
    }
    else
      $scope.errorMsg = 'Nie znaleziono delegacji do pokazania!';
  };

  self.init();
});