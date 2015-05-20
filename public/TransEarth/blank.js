var loginApp = angular.module('loginApp',[]);

function loginController($scope, $window, $http) {
    //alert('Inside loginController'+$.fn.jquery);
    $scope.user = {id : "", password : ""};
    $scope.petTitle = 'MMIS - Authentication';
    $scope.headerTitle = 'МĔŤĹĨŦĔ МĔŤŔĨČŚ ĨŃŦŐŔМĂŤĨŐŃ ŚŶŚŤĔМ';
    $scope.authFailed = false;
    $scope.loginAlert = 'Authentication Failed';
    $scope.mmisHeader = 'MetLife Metrics Dashboard';
    $scope.mmisMessages = '';
    $scope.messageAvailable = false;
    //$scope.messages = [];
    //$scope.mmisMessages = ['Opportunity exists to make further'
      //                      +'progress towards achieving Build 2.0 strategic objectives'];


    $http.get('/MMIS/getAuthMsg')
        .success(function(data){
            $scope.authFailed = false;
            if(typeof data.initial != 'undefined'){
                $scope.authFailed = false;
                //alert($scope.authFailed);
            }else if(typeof data.invalid !='undefined' && data.invalid != null && data.invalid){
                $scope.messagesAvailable = true;
                $scope.messages = "Session invalid";
                //alert(JSON.stringify(data));
            }else{
                $scope.authFailed = true;
            }
            //alert('$scope.authFailed Data - '+JSON.stringify(data));
        }).error(function(data){
            alert("error accessing Auth message");
        });

    $scope.loginSubmit = function(){
        alert('Inside loginController Submit - '+ JSON.stringify($scope.user));
        $scope.messagesAvailable = false;
        if($scope.user.id == '' || $scope.user.password == ''){
            //alert('Inside loginController Submit');
            $scope.authFailed = true;
            succesAlert('Login failed - User Input required', 'login_alert');
        }else{
            //alert('loginForm: ' + JSON.stringify($scope.user));
            $scope.resetUser = $scope.user;
            $window.location.href='/MMIS/login';
            /*$location.path('/MMIS');
             $http.post(url, {user : $scope.user})
             .error(function(data) {
             alert('Save Failed '+url+' Error: ' + data);
             //var err = eval("(" + data.responseText + ")");
             succesErrro('Login failed ', 'login_alert');
             });*/
        }
    };

}
