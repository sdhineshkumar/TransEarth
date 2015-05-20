function truckManageCtrl($scope, $http, $location, $anchorScroll, UserRequest, TruckRequest) {
    console.log('Inside truckManageCtrl - '+$scope.page.scope);

    $scope.truckForm = {};

    $scope.truck = TruckRequest.getSharedTruck();

    $scope.addTruckInd = false;
    $scope.editTruckInd = false;
    $scope.dumpTruck = function(){
        if(typeof $scope.truckShared != "undefined" && typeof $scope.truckShared.owner != "undefined" && typeof $scope.truckShared.company != "undefined"
            && $scope.truckShared.company.address_same_as_owner){
            $scope.disableAddress = $scope.truckShared.company.address_same_as_owner;
            $scope.truckShared.company.address = $scope.truckShared.owner.address;
        }
        if(typeof $scope.truckShared != "undefined" && typeof $scope.truckShared.owner != "undefined" && typeof $scope.truckShared.company != "undefined"
            && $scope.truckShared.company.contact_same_as_owner){
            $scope.disableContact = $scope.truckShared.company.contact_same_as_owner;
            $scope.truckShared.company.contact = $scope.truckShared.owner.contact;
        }
        if(typeof $scope.truckShared != "undefined" && typeof $scope.truckShared.truck_details != "undefined" ){
            $scope.truckShared.details = {};
            $scope.truckShared.details.name = $scope.truckShared.truck_details.name;
            $scope.truckShared.details.make = $scope.truckShared.truck_details.make;
            $scope.truckShared.details.model = $scope.truckShared.truck_details.model;
            $scope.truckShared.details.regno = $scope.truckShared.truck_details.reg_no;
            $scope.truckShared.details.load = $scope.truckShared.truck_details.maximum_load.quantity;
        }
        $scope.truck = $scope.truckShared;
        console.log("Truck dumped: "+JSON.stringify( $scope.truck));
    };

    if(typeof $scope.truck == "undefined" || $scope.truck == null){
        $scope.truck = {};
        $scope.truck.owner = {};
        $scope.truck.owner.address = {};
        $scope.truck.company = {};
        $scope.truck.company.address = {};
        $scope.page.header = "Add Truck";
        $scope.addTruckInd = true;
        $scope.editTruckInd = false;
        console.log("Truck to be added: "+JSON.stringify( $scope.truck));
    }else{
        $scope.page.header = "Edit Truck";
        $scope.addTruckInd = false;
        $scope.editTruckInd = true;

        $scope.truckShared = TruckRequest.getSharedTruck();
        $scope.dumpTruck();
        console.log('Truck to be editted: '+JSON.stringify($scope.truck));
    }
    /*if($scope.page.scope == "Add Truck"){
        $scope.page.header = "Add Truck";
        $scope.addTruckInd = true;
        $scope.editTruckInd = false;
    }else if($scope.page.scope == "Edit Truck"){
        console.log('Page scope - Edit Truck');
        $scope.page.header = "Edit Truck";
        $scope.editTruckInd = true;
        $scope.addTruckInd = false;
        $scope.truck = TruckRequest.getSharedTruck();
        console.log('Truck to be editted: '+JSON.stringify($scope.truck));
        //$scope.fetchTruck();
    }*/

    $scope.gotoHome = function(){
        TruckRequest.setSharedTruck(null);
        $scope.page.template = "/TransEarth/truck_owner_home";
        $scope.page.scope = "Truck Owner Home";
    };

    $scope.truckProcess = {};
    $scope.truckProcess.function = {};
    $scope.truckProcess.indicator = {};
    $scope.truckProcess.indicator.showCompanyDetails = false;
    $scope.truckProcess.indicator.showOwnerDetails = true;

    $scope.$watch('truck.details.regno', function() {
        $scope.truck.details.regno = $scope.truck.details.regno.replace(/\s+/g,'');
    });

    $scope.canDisableSameAddress = function(){
        console.log("canDisableSameAddress "+JSON.stringify($scope.truck.owner));
        if(typeof $scope.truck.company == "undefined" && $scope.truck.company == null){
            $scope.truck.company = {};
        }
        if($scope.disableAddress && typeof $scope.truck.owner.address.line1!="undefined"
                && typeof $scope.truck.owner.address.city!="undefined" && typeof $scope.truck.owner.address.state!="undefined" && typeof $scope.truck.owner.address.pincode!="undefined"
                && $scope.truck.owner.address.line1!=null && $scope.truck.owner.address.city!=null && $scope.truck.owner.address.state!=null && typeof $scope.truck.owner.address.pincode!=null){
                $scope.truck.company.address.line1 = $scope.truck.owner.address.line1;
                $scope.truck.company.address.line2 = $scope.truck.owner.address.line2;
                //$scope.truck.company.address.line3 = $scope.truck.owner.address.line3;
                $scope.truck.company.address.city = $scope.truck.owner.address.city;
                $scope.truck.company.address.state = $scope.truck.owner.address.state;
                $scope.truck.company.address.pincode = $scope.truck.owner.address.pincode;
                //$scope.disableAddress = true;
            }/*else{
                //$scope.disableAddress = false;
                //$scope.truck.company = {};
                $scope.truck.company.line1 = "";
                $scope.truck.company.line2 = "";
                //$scope.truck.company.line3 = "";
                $scope.truck.company.city = "";
                $scope.truck.company.state = "";
                $scope.disableAddress = false;
            }*/
    };
    $scope.canDisableSameContact = function(){
        //console.log("canDisableSameContact "+JSON.stringify($scope.truck.company));
        if(typeof $scope.truck.company == "undefined" && $scope.truck.company == null){
            $scope.truck.company = {};
        }
        if($scope.disableContact && typeof $scope.truck.owner.contact != "undefined" && typeof $scope.truck.owner.contact != null){
            $scope.truck.company.contact = $scope.truck.owner.contact;
            //$scope.disableContact = true;
        }/*else{
            $scope.truck.company.contact = "";
            //$scope.disableContact = false;
        }*/
    };

    $scope.truckProcess.function.showCompanyDetails = function(){
        if($scope.truckForm.first_name.$valid
            && $scope.truckForm.last_name.$valid
            && $scope.truckForm.first_name.$valid){
            $scope.truckProcess.indicator.showCompanyDetails = true;
        }else{
            $scope.truckProcess.indicator.showCompanyDetails = false;
        }
    };
    $scope.truckProcess.function.showOwnerDetails = function(){
        //console.log("User Type Form validity: "+$scope.truckForm.user_type.$valid);
        if($scope.truckForm.$valid){
            $scope.truckProcess.indicator.showOwnerDetails = true;
        }else{
            $scope.truckProcess.indicator.showOwnerDetails = false;
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
        $scope.truck = {};
    };

    $scope.submitForm = function () {

        // Set the 'submitted' flag to true
        $scope.truckProcess.indicator.submitted = true;
        $scope.truckProcess.indicator.saved = false;
        $scope.truckProcess.indicator.showAlert = false;

        if ($scope.truckForm.$valid) {
            console.log("Form is valid! "+JSON.stringify($scope.truck));

            if($scope.disableAddress){
                $scope.truck.company.address_same_as_owner = true;
            }else{
                $scope.truck.company.address_same_as_owner = false;
            }
            if($scope.disableContact){
                $scope.truck.company.contact_same_as_owner = true;
            }else{
                $scope.truck.company.contact_same_as_owner = false;
            }
            var url = "";
            if($scope.addTruckInd){
                url = "/TransEarth/addTruck";
            }else if($scope.editTruckInd){
                url = "/TransEarth/editTruck";
            }
            $http.post(url, {truck : $scope.truck})
                .success(function(data) {
                    console.log("Truck saved successfully");
                    $scope.truckProcess.indicator.saved = true;
                    TruckRequest.setSharedTruck(null);
                    TruckRequest.setSharedTruckProcessed(true);

                    $scope.page.template = "/TransEarth/truck_owner_home";
                    $scope.page.scope = "Truck Owner Home";
                    /*if($scope.addTruckInd){
                        $scope.truckProcess.indicator.showAlert = true;
                        successInfo(data.statusMsg, 'truck_home_alert');

                        //$scope.truckOwnerPage.showTruckList = true;
                        //$scope.truckOwnerPage.showPostList = true;

                        $scope.page.template = "/TransEarth/truck_owner_home";
                        $scope.page.scope = "Truck Owner Home";
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('truckManagePage');

                        // call $anchorScroll()
                        $anchorScroll();
                    }else if($scope.editTruckInd){
                        $scope.truckProcess.indicator.showAlert = true;
                        //successInfo(data.statusMsg, 'manage_truck_alert');
                        successInfo(data.statusMsg, 'truck_home_alert');

                        //$scope.truckOwnerPage.showTruckList = true;
                        //$scope.truckOwnerPage.showPostList = true;

                        $scope.page.template = "/TransEarth/truck_owner_home";
                        $scope.page.scope = "Truck Owner Home";
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('truckManagePage');

                        // call $anchorScroll()
                        $anchorScroll();

                    }*/
                }).error(function(data) {
                    console.log("Truck saved failed:"+data);
                    $scope.truckProcess.indicator.saved = false;
                    $scope.truckProcess.indicator.showAlert = true;
                    succesError(data.statusMsg, 'manage_truck_alert');
                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    $location.hash('truckManagePage');

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
            $scope.truckProcess.indicator.showAlert = true;
            succesAlert("Please correct the errors", 'manage_truck_alert');
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('truckManagePage');

            // call $anchorScroll()
            $anchorScroll();
        }
    };
}
