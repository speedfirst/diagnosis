'use strict';

angular.module('diagnosisApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('diagnosis', {
        url: '/diagnosis',
        templateUrl: 'app/diagnosis/diagnosis.html',
        controller: 'DiagnosisCtrl'
      });
  });