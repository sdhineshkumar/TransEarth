function loadManageCtrl($scope, $http, $location, $anchorScroll, UserRequest, LoadRequest) {
    console.log('Inside loadManageCtrl - ');

    $scope.loadProcess = {};
    $scope.loadProcess.function = {};
    $scope.loadProcess.indicator = {};

    $scope.addLoadInd = false;
    $scope.editLoadInd = false;
    var sharedLoad = LoadRequest.getSharedLoad();
    if(typeof sharedLoad != "undefined" && sharedLoad != null){
        $scope.page_header = "Edit Load";
        $scope.editLoadInd = true;
        $scope.addLoadInd = false;
        //$scope.loadForm = {};
        $scope.load = sharedLoad;
        console.log("Shared Load: "+JSON.stringify($scope.load));
        $scope.disableAddress = $scope.load.company.address_same_as_owner;
        $scope.disableContact = $scope.load.company.contact_same_as_owner;
        $scope.loadProcess.indicator.showCompanyDetails = true;
        $scope.loadProcess.indicator.showOwnerDetails = true;
    }else{
        $scope.page_header = "Add Load";
        $scope.addLoadInd = true;
        $scope.editLoadInd = false;
        //$scope.loadForm = {};
        $scope.load = {};
        $scope.load.owner = {};
        $scope.load.owner.address = {};
        $scope.load.company = {};
        $scope.load.company.address = {};
        $scope.load.details = {};
        $scope.load.details.pickup = {};
        $scope.load.details.pickup.address = {};
        $scope.load.details.delivery = {};
        $scope.load.details.delivery.address = {};
        $scope.loadProcess.indicator.showCompanyDetails = false;
        $scope.loadProcess.indicator.showOwnerDetails = true;
    }

    $scope.pickup = {};
    $scope.pickup.date = new Date();
    $scope.pickup.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.pickup.opened = false;
    $scope.pickup.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log("pickup.Opened");
        $scope.pickup.opened = true;
    };

    $scope.delivery = {};
    $scope.delivery.date = new Date();
    $scope.delivery.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.delivery.opened = false;
    $scope.delivery.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log("delivery.Opened");
        $scope.delivery.opened = true;
    };

    $scope.getMaterials = function(){
        $http.post("/TransEarth/getMaterialTypes", {})
            .success(function(data) {
                //console.log("Materials looked up:"+JSON.stringify(data));
                $scope.materialTypeList = data;
                var options = '';
                options += '<option data-hidden="true">Choose one</option>';
                $.each(data, function (i, row) {
                    //console.log(JSON.stringify(row));
                    options += '<option>' + row + '</option>';
                });
                //alert(id+' - '+options);
                //Apply html with option
                //applyHtml("materialType", options);
                //applySelect("materialType");
            }).error(function(err) {
                console.log("Materials Lookup failed:"+JSON.stringify(err));
            });
    };
    $scope.getMaterials();
    $scope.canDisableSameAddress = function(){
        //console.log("canDisableSameAddress "+JSON.stringify($scope.load.company));
        if(typeof $scope.load.company == "undefined" && $scope.load.company == null){
            $scope.load.company = {};
        }
        if($scope.disableAddress && typeof $scope.load.owner != "undefined" && typeof $scope.load.owner.address != "undefined"
                && typeof $scope.load.owner.address.line1!="undefined" && typeof $scope.load.owner.address.city!="undefined"
                && typeof $scope.load.owner.address.state!="undefined" && typeof $scope.load.owner.address.pincode!="undefined"
                && $scope.load.owner.address.line1!=null && $scope.load.owner.address.city!=null && $scope.load.owner.address.state!=null
                && typeof $scope.load.owner.address.pincode!=null){
                $scope.load.company.address.line1 = $scope.load.owner.address.line1;
                $scope.load.company.address.line2 = $scope.load.owner.address.line2;
                //$scope.load.company.address.line3 = $scope.load.owner.address.line3;
                $scope.load.company.address.city = $scope.load.owner.address.city;
                $scope.load.company.address.state = $scope.load.owner.address.state;
                $scope.load.company.address.pincode = $scope.load.owner.address.pincode;
                $scope.load.company.address_same_as_owner = true;
                //$scope.disableAddress = true;
            }/*else{
                //$scope.disableAddress = false;
                //$scope.load.company = {};
                $scope.load.company.line1 = "";
                $scope.load.company.line2 = "";
                //$scope.load.company.line3 = "";
                $scope.load.company.city = "";
                $scope.load.company.state = "";
                $scope.disableAddress = false;
            }*/
    };
    $scope.canDisableSameContact = function(){
        //console.log("canDisableSameContact "+JSON.stringify($scope.load.company));
        if(typeof $scope.load.company == "undefined" && $scope.load.company == null){
            $scope.load.company = {};
        }
        if($scope.disableContact && typeof $scope.load.owner != "undefined"
            && typeof $scope.load.owner.contact != "undefined" && typeof $scope.load.owner.contact != null){
            $scope.load.company.contact = $scope.load.owner.contact;
            //$scope.disableContact = true;
        }/*else{
            $scope.load.company.contact = "";
            //$scope.disableContact = false;
        }*/
    };

    $scope.loadProcess.function.showCompanyDetails = function(){
        if($scope.loadForm.first_name.$valid
            && $scope.loadForm.last_name.$valid
            && $scope.loadForm.first_name.$valid){
            $scope.loadProcess.indicator.showCompanyDetails = true;
        }else{
            $scope.loadProcess.indicator.showCompanyDetails = false;
        }
    };
    $scope.loadProcess.function.showOwnerDetails = function(){
        //console.log("User Type Form validity: "+$scope.loadForm.user_type.$valid);
        if($scope.loadForm.$valid){
            $scope.loadProcess.indicator.showOwnerDetails = true;
        }else{
            $scope.loadProcess.indicator.showOwnerDetails = false;
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
        $scope.load = {};
    };

    $scope.submitForm = function () {

        // Set the 'submitted' flag to true
        $scope.loadProcess.indicator.submitted = true;
        $scope.loadProcess.indicator.saved = false;
        $scope.loadProcess.indicator.showAlert = false;

        $scope.loadProcess.indicator.showAlert = false;
        if ($scope.loadForm.$valid) {
            //console.log("Form is valid! "+JSON.stringify($scope.load));

            if($scope.disableAddress){
                $scope.load.company.address_same_as_owner = true;
            }else{
                $scope.load.company.address_same_as_owner = false;
            }
            if($scope.disableContact){
                $scope.load.company.contact_same_as_owner = true;
            }else{
                $scope.load.company.contact_same_as_owner = false;
            }

            var url = "";
            if($scope.addLoadInd){
                url = "/TransEarth/addLoad";
            }else if($scope.editLoadInd){
                url = "/TransEarth/editLoad";
            }
            //$scope.loadProcess.indicator.showAlert = false;
            console.log("AJAX URL to be posted to "+url+" with input: "+JSON.stringify($scope.load));
            $http.post(url, {load : $scope.load})
                .success(function(data) {
                    console.log("Load saved successfully");
                    $scope.loadProcess.indicator.saved = true;
                    $scope.load = {};
                    $scope.loadProcess.indicator.showAlert = true;
                    succesAlert("Load added successfully", 'manage_load_alert');
                    LoadRequest.setSharedLoad(null);
                    LoadRequest.setSharedLoadProcessed(true);

                    $scope.page.template = "/TransEarth/load_owner_home";
                    $scope.page.scope = "Load Owner Home";

                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    //$location.hash('page-header');

                    // call $anchorScroll()
                    //$anchorScroll();
                }).error(function(data) {
                    console.log("Load saved failed:"+data);
                    $scope.loadProcess.indicator.saved = false;
                    $scope.loadProcess.indicator.showAlert = true;
                    succesError(data.statusMsg, 'manage_load_alert');
                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    $location.hash('headerBar');

                    // call $anchorScroll()
                    $anchorScroll();
                    //$scope.messageAvailable = true;
                    //$scope.index.messageAvailable = true;
                    //succesError(data.statusMsg, 'indexLoadListMessage');
                    //succesError("Login failed", 'login_alert');
                });
        }
        else {
            //alert("Please correct errors!");
            $scope.loadProcess.indicator.showAlert = true;
            succesAlert("Please correct the errors", 'manage_load_alert');
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('page-header');
        }
    };
}
