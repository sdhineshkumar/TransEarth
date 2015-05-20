//var TransEarthApp = angular.module('TransEarthApp', ['ngRoute', 'ui.bootstrap', "ngGrid", "ngTable", 'ngSanitize']);
var TransEarthApp = angular.module('TransEarthApp', ['ngRoute', 'ui.bootstrap', 'ngGrid', 'ui.bootstrap', 'ngTable']);

TransEarthApp.factory('httpInterceptor', function ($q, $rootScope, $log) {

    var numLoadings = 0;

    return {
        request: function (config) {

            numLoadings++;

            // Show loader
            $rootScope.$broadcast("loader_show");
            return config || $q.when(config)

        },
        response: function (response) {

            if ((--numLoadings) === 0) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return response || $q.when(response);

        },
        responseError: function (response) {

            if (!(--numLoadings)) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return $q.reject(response);
        }
    };
});

TransEarthApp.factory('UserRequest', function () {

    var user_profile = {};

    function setUserProfile(user){
        if(typeof user.username != "undefined" && user.username != null && user.username != ""){
            user_profile.username = user.username;
        }
        if(typeof user.user_type != "undefined" && user.user_type != null && user.user_type != ""){
            user_profile.user_type = user.user_type;
        }
        if(typeof user.display_name != "undefined" && user.display_name != null && user.display_name != ""){
            user_profile.display_name = user.display_name;
        }
        if(typeof user.email != "undefined" && user.email != null && user.email != ""){
            user_profile.email = user.email;
        }
        if(typeof user.user_information != "undefined" && user.user_information != null){
            user_profile.user_information = user.user_information;
        }
    }
    function getUserName(){
        return user_profile.username;
    }
    function getEmail(){
        return user_profile.email;
    }
    function getUserType(){
        return user_profile.user_type;
    }

    return {
        getUserName : getUserName,
        getEmail : getEmail,
        getUserType : getUserType,
        setUserProfile : setUserProfile
    };
});

TransEarthApp.factory('TruckRequest', function(){
    var _truck;
    var _processed;
    //var _truck;
    return {
        getSharedTruck : function(){
            //console.log("Truck Request Get Shared Truck Details:"+JSON.stringify(_truck));
            return _truck;
        },
        setSharedTruck : function(truck){
            //console.log("Truck Request Set Shared Truck Details:"+JSON.stringify(truck));
            _truck = truck;
        },
        isSharedTruckProcessed : function(){
            return _processed;
        },
        setSharedTruckProcessed : function(status){
            _processed = status;
        }
    };
});

TransEarthApp.factory('TruckPostRequest', function(){
    var _truck;
    var _postId;
    var _saved;
    return {
        getSharedTruck : function(){
            //console.log("Truck Post Request Get Shared Truck Details:"+JSON.stringify(_truck));
            return _truck;
        },
        setSharedTruck : function(truck){
            //console.log("Truck Post Request Set Shared Truck Details:"+JSON.stringify(truck));
            _truck = truck;
        },
        getSharedTruckPostId : function(){
            //console.log("Truck Post Request Get Shared Post ID:"+_postId);
            return _postId;
        },
        setSharedTruckPostId : function(postId){
            //console.log("Truck Post Request Set Shared Post ID:"+postId);
            _postId = postId;
        },
        isSharedTruckPostProcessed : function(){
            return _saved;
        },
        setSharedTruckPostProcessed : function(status){
            _saved = status;
        }
    };
});

TransEarthApp.factory('LoadRequest', function(){
    var _load;
    var _processed;
    return {
        getSharedLoad : function(){
            //console.log("Load Request Get Shared Truck Details:"+JSON.stringify(_load));
            return _load;
        },
        setSharedLoad : function(load){
            //console.log("Load Request Set Shared Truck Details:"+JSON.stringify(load));
            _load = load;
        },
        isSharedLoadProcessed : function(){
            return _processed;
        },
        setSharedLoadProcessed : function(status){
            _processed = status;
        }
    };
});

TransEarthApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});

TransEarthApp.directive("loader", function ($rootScope) {
    return function ($scope, element, attrs) {
        $scope.$on("loader_show", function () {
            return element.show();
        });
        return $scope.$on("loader_hide", function () {
            return element.hide();
        });
    };
});

TransEarthApp.directive('collapseSection', function() {
    return {
        controller: function noteChange($scope) {
            $scope.note = "E";
            $scope.change = function(){
                if($scope.note == "E"){
                    $scope.note = "C";
                }else{
                    $scope.note = "E";
                }
            };
        },
        restrict: 'EA',
        transclude: true,
        scope: true,
        link: function($scope, element, attrs, noteChange) {
            var title= angular.element(element.parent().parent().children().children()[1]),
                body = angular.element(element.parent().parent().parent().children()[1]);
            title.on('click', function($event) {
                if (typeof body != 'undefined'
                    && typeof body[0] != 'undefined'
                    && typeof body[0].style != 'undefined'){
                    var section = 'block';
                    if(body[0].style.display == 'none'){
                        section = 'block';
                    }else{
                        section = 'none';
                    }
                    body.css({
                        display: section
                    });
                }
                $event.preventDefault();
            });
        },
        template: '<div class="pull-right glyphicon title2"><a href="#" ng-click="change()" ng-class="{\'glyphicon-chevron-down\': note == \'C\', \'glyphicon-chevron-right\': note != \'C\'}"></a></div>'
    };
});

TransEarthApp.directive('ngCompare', function () {
    return {
        require: 'ngModel',
        link: function (scope, currentEl, attrs, ctrl) {
            var comparefield = document.getElementsByName(attrs.ngCompare)[0]; //getting first element
            compareEl = angular.element(comparefield);

            //current field key up
            currentEl.on('keyup', function () {
                if (compareEl.val() != "") {
                    var isMatch = currentEl.val() === compareEl.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });

            //Element to compare field key up
            compareEl.on('keyup', function () {
                if (currentEl.val() != "") {
                    var isMatch = currentEl.val() === compareEl.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });
        }
    }
});

TransEarthApp.directive('numbers-only', function(){
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                // this next if is necessary for when using ng-required on your input.
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined
                if (inputValue == undefined) return '';
                var transformedInput = inputValue.replace(/[^0-9]+/g, '');
                if (transformedInput!=inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
});

//Route Provider to load views with ng-view
TransEarthApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider) {
        //alert('Inside Route Provider'+$routeProvider);
        $routeProvider.
            when('/index', {
                templateUrl: 'partials/blank.html',
                controller: 'indexCtrl'
            }).
            when('/truckList', {
                templateUrl: 'partials/trucks_grid.html',
                controller: 'truckListCtrl'
            }).
            when('/loadList', {
                templateUrl: 'partials/loads_grid.html',
                controller: 'loadListCtrl'
            }).
            when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'loginCtrl'
            }).
            otherwise({
                //templateUrl: 'partials/blank.html',
                controller: 'indexCtrl'
            });
    }]);

var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0])
            if (!isNaN(milliseconds)) {
                input[key] = new Date(milliseconds);
            }
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}

//Head controller to load page title
function coreController($scope, $rootScope, $http, $location, UserRequest) {
//function coreController($scope, $route, $http, $location, UserRequest) {
    //alert('Inside coreController');
    $scope.siteTitle = 'Transport Earth';
    $scope.page = {};
    //$scope.page.template = "/TransEarth/site_home";
    $scope.core = {};
    $scope.core.truck_owner = false;
    $scope.core.load_owner = false;
    $scope.login = {};
    $scope.login.authFailed = false;
    $scope.login.messageAvailable = false;

    $scope.user = {};
    $scope.core.loggedIn = false;

    $http.get('/TransEarth/getLoggedInUserProfile')
        .success(function(data){
            //console.log("Get User Profile: "+JSON.stringify(data));
            if(typeof data.user != 'undefined'){
                $scope.user = data.user;
                $scope.core.loggedIn = true;
                if(typeof $scope.user.user_type != "undefined"){
                    if($scope.user.user_type == "truck_owner"){
                        $scope.core.truck_owner = true;
                        $scope.core.load_owner = false;
                    }
                    if($scope.user.user_type == "load_owner"){
                        $scope.core.truck_owner = false;
                        $scope.core.load_owner = true;
                    }
                }
                //console.log("Core Profile: "+JSON.stringify($scope.core));
            }
            if($scope.core.truck_owner){
                $scope.page.template = "/TransEarth/truck_owner_home";
                $scope.page.scope = "Truck Owner Home";
            }else if($scope.core.load_owner){
                $scope.page.template = "/TransEarth/load_owner_home";
                $scope.page.scope = "Load Owner Home";
            }else{
                $scope.page.template = "/TransEarth/site_home";
                $scope.page.scope = "Site Base Home";
            }
        }).error(function(err){
            alert("Error accessing user profile:"+err);
        });
    //console.log("User: "+$scope.user);

    //console.log("User Details: "+$scope.user);
    /*$scope.$watch('pageTemplate', function(pageTemplate) {
        console.log("pageTemplate: "+JSON.stringify(pageTemplate));
    }, true);*/

    /*$http.get('/TransEarth/getAuthMsg')
        .success(function(data){
            console.log("Get Auth Message: "+JSON.stringify(data));
            $scope.login.messageAvailable = false;
            if(typeof data.initial != 'undefined'){
                $scope.login.messageAvailable = false;
                $scope.page.template = "/TransEarth/site_home";
                //alert($scope.authFailed);
            }else if(typeof data.messageAvailable !='undefined' && data.messageAvailable != null && data.messageAvailable){
                $scope.login.messageAvailable = true;
                $scope.page.template = "/TransEarth/login";
                succesError(data, 'login_alert');
                //alert(JSON.stringify(data));
            }else{
                $scope.page.template = "/TransEarth/site_home";
            }
            //alert('$scope.authFailed Data - '+JSON.stringify(data));
        }).error(function(data){
            alert("error accessing Auth message");
        });*/

    $scope.loginClicked = function(){
        //console.log("Login clicked");
        $scope.page.template = ''+"/TransEarth/login";
        $scope.page.scope = "Login";
        //console.log("Login clicked : "+$scope.pageTemplate);
    };
    $scope.signupClicked = function(){
        //console.log("Login clicked");
        $scope.page.template = ''+"/TransEarth/signup";
        $scope.page.scope = "Register";
        //console.log("Login clicked : "+$scope.pageTemplate);
    };

    $scope.searchTrucks = function(){
        //console.log("Search Trucks clicked");
        $scope.page.template = ''+"/TransEarth/searchTrucks";
        $scope.page.scope = "Search Trucks";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.searchLoad = function(){
        //console.log("Search Load clicked");
        $scope.page.template = ''+"/TransEarth/searchLoad";
        $scope.page.scope = "Search Load";
        //console.log("Search Load clicked : "+$scope.pageTemplate);
    };

    $scope.loadMyTrucks = function(){
        //console.log("Truck Owner Home Page clicked");
        $scope.page.template = ''+"/TransEarth/truck_owner_home";
        $scope.page.scope = "Truck Owner Home";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.addTruck = function(){
        //console.log("Add Truck clicked");
        $scope.page.template = ''+"/TransEarth/manage_truck";
        $scope.page.scope = "Add Truck";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };

    $scope.loadMyLoads = function(){
        console.log("My Loads clicked");
        $scope.page.template = ''+"/TransEarth/load_owner_home";
        $scope.page.scope = "Load Owner Home";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.addLoad = function(){
        //console.log("My Loads clicked");
        $scope.page.template = ''+"/TransEarth/manage_load";
        $scope.page.scope = "Add Load";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    //$scope.$route = $route;
}

