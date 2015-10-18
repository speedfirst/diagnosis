'use strict';

angular.module('diagnosisApp')
  .controller('DiagnosisCtrl', function ($scope, $http) {
    // $scope.formData = {
    //   ph: 7.34,
    //   paco2: 36,
    //   beecf: -4,
    //   sb: 21,
    //   ab: 19,
    //   na: 40,
    //   cl: 1
    // };

    $scope.processForm = function(isValid) {

      if (!isValid) {
        $scope.errorMsg = '提交数据非法，请重新输入';
        return;
      }

      console.log('send diagnosis request', $scope.formData);
      $scope.diagnosisResult = null;

      // convert all the data to number
      for (var key in $scope.formData) {
        $scope.formData[key] = parseFloat($scope.formData[key]);
      }

      $http.post('/api/diagnosis', $scope.formData).success(
        function(result) {
          console.log('get diagnosis result', result);
          $scope.diagnosisResult = result.comment5;
          $scope.diagnosisResp = JSON.stringify(result, null, "  ");
        });
    }
  });
