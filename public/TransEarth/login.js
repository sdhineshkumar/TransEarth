function loginCtrl($scope, $http, $location, $anchorScroll, UserRequest) {
    console.log('Inside loginCtrl - '+$scope.error);

    $scope.core = {};

    if(typeof $scope.error != "undefined" && $scope.error != null){
        $scope.login.authFailed = true;
        succesError($scope.error, "login_alert");
    }
    $scope.user = {};

    $scope.signUp = function(){
        console.log("Signup clicked");
        $scope.page.template = ''+"/TransEarth/signup";
    };

    $scope.login = function(){
        console.log("Login clicked:: "+JSON.stringify($scope.user));
        $scope.login.authFailed = false;
        $scope.login.messageAvailable = false;
        $http.post("/TransEarth/login", {username : $scope.user.username, password : $scope.user.password})
            .success(function(data) {
                console.log("Logged in");
                $scope.core.loggedIn = true;
                UserRequest.setUserProfile({
                    username : "ksanthosh82",
                    user_type : "truck_owner",
                    display_name : "Santhosh",
                    email : "as@as.com",
                    user_information : ""
                });
                $scope.page.template = ''+"/TransEarth";
                //$location.url("/");
            }).error(function(data) {
                console.log("Logged in Error: "+data);
                $scope.core.loggedIn = false;
                $scope.login.authFailed = true;
                succesError(data, 'login_alert');
                //$scope.messageAvailable = true;
                //$scope.index.messageAvailable = true;
                //succesError(data.statusMsg, 'indexTruckListMessage');
                //succesError("Login failed", 'login_alert');
            });
    };

    $scope.countryList = [
        { CountryId: 1, Name: 'India' }
    ];

    $scope.userTypes = [
        { type: 'truck_owner', Name: 'Truck Owner' },
        { type: 'load_owner', Name: 'Load Owner' }
    ];

    $scope.cityList = [];
    $scope.register = {};
    $scope.register.showAccountDetails = false;
    $scope.register.showPersonalDetails = false;
    $scope.showAccountDetails = function(){
        //console.log("User Type Form validity: "+$scope.userForm.user_type.$valid);
        if($scope.userForm.user_type.$valid){
            $scope.register.showAccountDetails = true;
        }else{
            $scope.register.showAccountDetails = false;
        }
    };
    $scope.showAccountDetails = function(){
        console.log("User Type Form validity: "+$scope.userForm.user_type.$valid);
        if($scope.userForm.user_type.$valid){
            $scope.register.showAccountDetails = true;
        }else{
            $scope.register.showAccountDetails = false;
        }
    };
    $scope.passwordMismatch = true;
    $scope.passwordValidation = function() {
        if ($scope.user.confirmPassword != undefined) {
            if ($scope.user.password != $scope.user.confirmPassword) {
                $scope.passwordMismatch = true;
            } else {
                $scope.passwordMismatch = false;
            }
        }
    };

    /*$scope.$watch('user.country', function (newVal,oldVal) {

        if (newVal == 1)
            $scope.cityList = [
                { CountryId: 1, CityId: 1, Name: 'Noida' },
                { CountryId: 1, CityId: 2, Name: 'Delhi' }];
        else if (newVal == 2)
            $scope.cityList = [
                { CountryId: 2, CityId: 3, Name: 'Texas' },
                { CountryId: 2, CityId: 4, Name: 'NewYork' }];
        else
            $scope.cityList = [];
    });*/

    // function to submit the form after all validation has occurred
    $scope.reset = function(){
        $scope.user = {};
        $scope.register = {};
        $scope.passwordMismatch = true;
        $location.hash('registerForm');
        $anchorScroll();
    };

    $scope.submitForm = function () {

        // Set the 'submitted' flag to true
        $scope.submitted = true;
        $scope.saved = false;

        if ($scope.userForm.$valid) {
            console.log("Form is valid! "+JSON.stringify($scope.user));

            $http.post("/TransEarth/createUser", {user : $scope.user})
                .success(function(data) {
                    console.log("User saved successfully");
                    $scope.saved = true;
                    $scope.register.showAccountDetails = false;
                    $scope.register.showPersonalDetails = false;
                    $scope.passwordMismatch = true;
                    $scope.user = {};
                    succesAlert("User registered successfully", 'login_alert');
                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    $location.hash('registerForm');

                    // call $anchorScroll()
                    $anchorScroll();
                }).error(function(data) {
                    console.log("User saved failed:"+JSON.stringify(data));
                    $scope.saved = true;
                    succesError(data.statusMsg, 'login_alert');
                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    $location.hash('registerForm');

                    // call $anchorScroll()
                    $anchorScroll();
                    //$scope.messageAvailable = true;
                    //$scope.index.messageAvailable = true;
                    //succesError(data.statusMsg, 'indexTruckListMessage');
                    //succesError("Login failed", 'login_alert');
                });
        }
        else {
            //alert("Please correct errors!");
            $scope.saved = true;
            succesError("Please correct Errors", 'login_alert');
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('registerForm');

            // call $anchorScroll()
            $anchorScroll();
        }
    };
}
