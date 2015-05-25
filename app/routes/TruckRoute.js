/**
 * Created by Santhosh on 2015.
 */
var Post = require('../models/Post').Post;
var Truck = require('../models/Truck').Truck;

var _ = require("lodash");
var moment = require("moment");

exports.getTruckPostSummary = function(req,res){

    console.log("getTruckPostSummary started");
    var truckPostList = [];
    var returnData = {
        truckPostList : {
            headers : [],
            details : []
        }
    };

    var colDef = {};
    /*colDef.field = 'truckId';
     colDef.displayName = "Truck #";
     //colDef.headerClass = 'gridHeader';
     colDef.resizable = true;
     colDef.width = '15%';
     returnData.truckList.headers.push(colDef);*/

    colDef = {};
    colDef.field = 'source';
    colDef.displayName = "From";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '25%';
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'destination';
    colDef.displayName = "To";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '25%';
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'capacity';
    colDef.displayName = "Capacity Available";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '24%';
    ///colDef.cellClass = 'gridCurrentMonth';
    /*colDef.cellTemplate = '<div style="text-align:center;">';
     colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
     colDef.cellTemplate += '        <div class="ngCellText" >';
     colDef.cellTemplate += "            <div ng-class=\"{'ngRed': row.getProperty(col.field) > 200 }\">{{row.getProperty(col.field)}}";
     //colDef.cellTemplate += "                {{row.getProperty(col.field)}}";
     colDef.cellTemplate += '            </div>';
     colDef.cellTemplate += '        </div>';
     colDef.cellTemplate += '    </div>';
     colDef.cellTemplate += '</div>';*/
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'availableDate';
    colDef.displayName = "Available From";
    //colDef.headerClass = 'gridHeader';
    colDef.width = '25%';
    colDef.resizable = true;
    returnData.truckPostList.headers.push(colDef);

    //Truck.find(searchParams, subTruckSummary);
    Truck.aggregate(
        [
            {
                $match: {
                    "truck_details.isActive" : true
                }
            },
            {
                $unwind : "$posts"
            },
            {
                $match: {
                    "posts.status" : {"$nin":["REMOVED"]}
                }
            },
            {
                $project:
                {
                    //year: { $year: "$posts.truck_post.availability.date" },
                    //month: { $month: "$posts.truck_post.availability.date" },
                    //date: { $dayOfMonth: "$posts.truck_post.availability.date" },
                    source: "$posts.truck_post.availability.pickup_location",
                    destination: "$posts.truck_post.availability.delivery_location",
                    load : "$posts.truck_post.maximum_load.quantity",
                    unit : "$posts.truck_post.maximum_load.unit",
                    availableDate: "$posts.truck_post.availability.date"
                }
            },
            {
                $limit : 5
            }
        ], subTruckSummary
    );

    function subTruckSummary(err, data){
        if(!err){
            console.log('Data :' +JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var item = data[i];
                truckPostList.push({
                    source : item.source,
                    destination : item.destination,
                    capacity : item.load + " " + item.unit,
                    availableDate : moment(item.availableDate).format("Do MMM YYYY")
                })
            }
            returnData.truckPostList.details = truckPostList;
            //console.log('Truck data length=' + returnData.truckList.details.length);
            //console.log('Truck Data Rendered - '+JSON.stringify(returnData));
            res.json(200,returnData);
        }
        else{
            var jsonResponse = {'statusMsg' : ' Truck Fetch failed!'+err};
            res.json(500, jsonResponse);
        }
    }
};

exports.searchTruckPost = function(req,res){

    console.log("searchTruckPost started");
    var truckPostList = [];
    var returnData = {
        truckPostList : {
            headers : [],
            details : []
        }
    };

    var colDef = {};
    /*colDef.field = 'truckId';
     colDef.displayName = "Truck #";
     //colDef.headerClass = 'gridHeader';
     colDef.resizable = true;
     colDef.width = '15%';
     returnData.truckList.headers.push(colDef);*/

    colDef = {};
    colDef.field = 'source';
    colDef.displayName = "From";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '25%';
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'destination';
    colDef.displayName = "To";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '25%';
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'capacity';
    colDef.displayName = "Capacity Available";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '24%';
    ///colDef.cellClass = 'gridCurrentMonth';
    /*colDef.cellTemplate = '<div style="text-align:center;">';
     colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
     colDef.cellTemplate += '        <div class="ngCellText" >';
     colDef.cellTemplate += "            <div ng-class=\"{'ngRed': row.getProperty(col.field) > 200 }\">{{row.getProperty(col.field)}}";
     //colDef.cellTemplate += "                {{row.getProperty(col.field)}}";
     colDef.cellTemplate += '            </div>';
     colDef.cellTemplate += '        </div>';
     colDef.cellTemplate += '    </div>';
     colDef.cellTemplate += '</div>';*/
    returnData.truckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'availableDate';
    colDef.displayName = "Available From";
    //colDef.headerClass = 'gridHeader';
    colDef.width = '25%';
    colDef.resizable = true;
    returnData.truckPostList.headers.push(colDef);

    var filters = req.body.filters;

    if(typeof filters != "undefined" && filters.length > 0){
        //console.log("getTruckListSummary filters: "+JSON.stringify(filters));
        var searchParams = {};
        if(typeof filters[0] != "undefined" && filters[0] != null && filters[0].trim() != ""){
            //var fromRegex = "/^" + filters[0] + "$/i";
            //searchParams["locationCapableFrom"] = fromRegex;
            searchParams["posts.truck_post.availability.pickup_location"] = filters[0];
        }
        if(typeof filters[1] != "undefined" && filters[1] != null  && filters[1].trim() != ""){
            //var toRegex = "/^" + filters[1] + "$/i";
            //searchParams["locationCapableTo"] = toRegex;
            searchParams["posts.truck_post.availability.delivery_location"] = filters[1];
        }
        if(typeof filters[2] != "undefined" && filters[2] != null && typeof filters[3] != "undefined" && filters[3] != null) {
            var dateFilterRange = filters[2];
            var dateFilter = filters[3];
            //console.log("moment().utc(dateFilter.availableOn).get('year') - "+moment().utc(dateFilter).get('year'));
            //console.log("moment().utc(dateFilter.availableOn).get('month') - "+moment().utc(dateFilter).get('month'));
            //console.log("moment().utc(dateFilter.availableOn).get('date') - "+moment().utc(dateFilter).get('date'));
            if (dateFilterRange == 1) {
                searchParams["posts.truck_post.availability.date"] = {
                    $gte: new Date(
                        moment().utc(dateFilter).get('year'),
                        moment().utc(dateFilter).get('month'),
                        moment().utc(dateFilter).get('date'),
                        0,
                        0,
                        0,
                        0
                    ),
                    $lt: new Date(
                        moment().utc(dateFilter).get('year'),
                        moment().utc(dateFilter).get('month'),
                        moment().utc(dateFilter).get('date') + 1,
                        0,
                        0,
                        0,
                        0
                    )
                };
            } else if (dateFilterRange == 2) {
                searchParams["posts.truck_post.availability.date"] = {
                    $gte: new Date(
                        moment(dateFilter).get('year'),
                        moment(dateFilter).get('month'),
                        moment(dateFilter).get('date'),
                        0,
                        0,
                        0,
                        0
                    )
                };
            } else {
                var jsonResponse = {'statusMsg': ' Date Range Filter not valid'};
                res.json(500, jsonResponse);
            }
        }
    }else{
        var jsonResponse = {'statusMsg' : ' Date Range Filter required'};
        res.json(500, jsonResponse);
    }
    console.log("getTruckList searchParams: "+JSON.stringify(searchParams));

    //Truck.find(searchParams, subTruckSummary);
    Truck.aggregate(
        [
            {
                $match : searchParams
            },
            {
                $match: {
                    "truck_details.isActive" : true
                }
            },
            {
                $unwind : "$posts"
            },
            {
                $match: {
                    "posts.status" : {"$nin":["REMOVED"]}
                }
            },
            {
                $project:
                {
                    //year: { $year: "$posts.truck_post.availability.date" },
                    //month: { $month: "$posts.truck_post.availability.date" },
                    //date: { $dayOfMonth: "$posts.truck_post.availability.date" },
                    _id: 0,
                    truck_id: "$_id",
                    source: "$posts.truck_post.availability.pickup_location",
                    destination: "$posts.truck_post.availability.delivery_location",
                    load : "$posts.truck_post.maximum_load.quantity",
                    unit : "$posts.truck_post.maximum_load.unit",
                    availableDate: "$posts.truck_post.availability.date"
                }
            }
        ], subTruckSummary
    );

    function subTruckSummary(err, data){
        if(!err){
            console.log('Data :' +JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var item = data[i];
                truckPostList.push({
                    truck_id: item.truck_id,
                    source : item.source,
                    destination : item.destination,
                    capacity : item.load + " " + item.unit,
                    availableDate : moment(item.availableDate).format("Do MMM YYYY")
                })
            }
            returnData.truckPostList.details = truckPostList;
            //console.log('Truck data length=' + returnData.truckList.details.length);
            console.log('Truck Data Rendered - '+JSON.stringify(returnData));
            res.json(200,returnData);
        }
        else{
            var jsonResponse = {'statusMsg' : ' Truck Fetch failed!'+err};
            res.json(500, jsonResponse);
        }
    }
};

exports.getMyTrucks = function(req,res){

    console.log("getMyTrucks started");
    var myTruckList = [];
    var returnData = {
        myTruckList : {
            headers : [],
            details : []
        }
    };

    var colDef = {};
    colDef.field = 'action';
    colDef.displayName = "Action";
    //colDef.headerClass = 'gridHeader';
    colDef.cellTemplate = '<div style="text-align:center;">';
    colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
    colDef.cellTemplate += '        <div class="ngCellText" >';
    colDef.cellTemplate += '            <a href="#" ng-click="editTruck(row.entity.truck_id)">';
    colDef.cellTemplate += '                <i class="glyphicon glyphicon-pencil custom-blue-basic adjust-size"></i>';
    colDef.cellTemplate += '            </a>';
    colDef.cellTemplate += '            <a href="#" ng-click="removeTruck(row.entity.truck_id, row.entity.regNo)">';
    colDef.cellTemplate += '                <i class="glyphicon glyphicon-remove-sign custom-red-mid adjust-size"></i>';
    colDef.cellTemplate += '            </a>';
    colDef.cellTemplate += '        </div>';
    colDef.cellTemplate += '    </div>';
    colDef.cellTemplate += '</div>';
    colDef.resizable = true;
    colDef.width = '10%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    colDef = {};
    colDef.field = 'regNo';
    colDef.displayName = "Reg No";
    //colDef.headerClass = 'gridHeader';
    colDef.cellTemplate = '<div style="text-align:center;">';
    colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
    colDef.cellTemplate += '        <div class="ngCellText" >';
    colDef.cellTemplate += '            <a href="#" ng-click="getTruckDetails(row.entity.truck_id)">';
    colDef.cellTemplate += '                {{row.entity.regNo}}';
    colDef.cellTemplate += '            </a>';
    colDef.cellTemplate += '        </div>';
    colDef.cellTemplate += '    </div>';
    colDef.cellTemplate += '</div>';
    colDef.resizable = true;
    colDef.width = '19%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    colDef = {};
    colDef.field = 'make';
    colDef.displayName = "Make";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '20%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    colDef = {};
    colDef.field = 'model';
    colDef.displayName = "Model";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '20%';
    ///colDef.cellClass = 'gridCurrentMonth';
    /*colDef.cellTemplate = '<div style="text-align:center;">';
     colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
     colDef.cellTemplate += '        <div class="ngCellText" >';
     colDef.cellTemplate += "            <div ng-class=\"{'ngRed': row.getProperty(col.field) > 200 }\">{{row.getProperty(col.field)}}";
     //colDef.cellTemplate += "                {{row.getProperty(col.field)}}";
     colDef.cellTemplate += '            </div>';
     colDef.cellTemplate += '        </div>';
     colDef.cellTemplate += '    </div>';
     colDef.cellTemplate += '</div>';*/
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    colDef = {};
    colDef.field = 'capacity';
    colDef.displayName = "Capacity";
    //colDef.headerClass = 'gridHeader';
    colDef.width = '17%';
    colDef.resizable = true;
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    colDef = {};
    colDef.field = 'addPost';
    colDef.displayName = "Add Post";
    //colDef.headerClass = 'gridHeader';
    colDef.cellTemplate = '<div style="text-align:center;">';
    colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
    colDef.cellTemplate += '        <div class="ngCellText" >';
    //colDef.cellTemplate += '            <a href="#" ng-click="removeTruck(row.entity.truck_id, row.entity.regNo)">';
    colDef.cellTemplate += '            <a id="xxs" href="#" ng-click="addTruckPost(row.entity.truck_id)" class="btn btn-primary btn-xs">Add Post</a>';
    //colDef.cellTemplate += '            </a>';
    //colDef.cellTemplate += '            <a id="xxs" href="#" class="btn btn-primary btn-xs">Add Post</a>';
    colDef.cellTemplate += '        </div>';
    colDef.cellTemplate += '    </div>';
    colDef.cellTemplate += '</div>';
    colDef.resizable = true;
    colDef.width = '13%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckList.headers.push(colDef);

    var filters = req.body.filters;

    var searchParams = {};
    if(typeof req.session.user_profile != "undefined" && req.session.user_profile != null){
        searchParams["current_tracker.user.username"] = req.session.user_profile.username;
    }else{
        var jsonResponse = {'statusMsg' : ' Truck Owner Details not reachable'};
        res.json(500, jsonResponse);
    }

    console.log("getMyTrucks searchParams: "+JSON.stringify(searchParams));

    //Truck.find(searchParams, subTruckSummary);
    Truck.aggregate(
        [
            {
                $match : searchParams
            },
            {
                $match: {
                    "truck_details.isActive" : true
                }
            },
            {
                $project:
                {
                    "_id" : 0,
                    truck_id: "$_id",
                    regNo: "$truck_details.reg_no",
                    make: "$truck_details.make",
                    model : "$truck_details.model",
                    load : "$truck_details.maximum_load.quantity",
                    unit : "$truck_details.maximum_load.unit"
                }
            }
        ], subMyTrucks
    );

    function subMyTrucks(err, data){
        if(!err){
            console.log('Data :' +JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var item = data[i];
                myTruckList.push({
                    truck_id : item.truck_id,
                    regNo : item.regNo,
                    make : item.make,
                    model : item.model,
                    capacity : item.load + " " + item.unit
                })
            }
            returnData.myTruckList.details = myTruckList;
            //console.log('Truck data length=' + returnData.truckList.details.length);
            console.log('Truck Data Rendered - '+JSON.stringify(returnData));
            res.json(200,returnData);
        }
        else{
            var jsonResponse = {'statusMsg' : ' Truck Fetch failed!'+err};
            res.json(500, jsonResponse);
        }
    }
};

exports.getMyTruckPosts = function(req,res){

    console.log("getMyTruckPosts started");
    var myTruckPostList = [];
    var returnData = {
        myTruckPostList : {
            headers : [],
            details : []
        }
    };

    var colDef = {};
    colDef.field = 'action';
    colDef.displayName = "Action";
    //colDef.headerClass = 'gridHeader';
    colDef.cellTemplate = '<div style="text-align:center;">';
    colDef.cellTemplate += '    <div class="ngCellText" style="color:grey;">';
    colDef.cellTemplate += '        <div class="ngCellText" >';
    colDef.cellTemplate += '            <a href="#" ng-click="editTruckPost(row.entity.truck_id, row.entity.post_id)">';
    colDef.cellTemplate += '                <i class="glyphicon glyphicon-pencil custom-blue-basic adjust-size"></i>';
    colDef.cellTemplate += '            </a>';
    colDef.cellTemplate += '            <a href="#" ng-click="removeTruckPost(row.entity.truck_id, row.entity.post_id, row.entity.regNo, row.entity.capacity, row.entity.availableDate)">';
    colDef.cellTemplate += '                <i class="glyphicon glyphicon-remove-sign custom-red-mid adjust-size"></i>';
    colDef.cellTemplate += '            </a>';
    //colDef.cellTemplate += '            <i class="fa fa-eyedropper"></i> <div ng-class="{\'ngRed\': row.getProperty(col.field) > 200 }\">{{row.getProperty(col.field)}}';
    colDef.cellTemplate += '            </div>';
    colDef.cellTemplate += '        </div>';
    colDef.cellTemplate += '    </div>';
    colDef.cellTemplate += '</div>';
    colDef.resizable = true;
    colDef.resizable = true;
    colDef.width = '10%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'regNo';
    colDef.displayName = "Reg No";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '17%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'source';
    colDef.displayName = "From";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '19%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'destination';
    colDef.displayName = "To";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '19%';
    ///colDef.cellClass = 'gridCurrentMonth';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'capacity';
    colDef.displayName = "Capacity";
    //colDef.headerClass = 'gridHeader';
    colDef.width = '17%';
    colDef.resizable = true;
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    colDef = {};
    colDef.field = 'availableDate';
    colDef.displayName = "Available On";
    //colDef.headerClass = 'gridHeader';
    colDef.resizable = true;
    colDef.width = '19%';
    colDef.cellClass = "small-font";
    colDef.headerClass = "small-font";
    returnData.myTruckPostList.headers.push(colDef);

    var filters = req.body.filters;

    var searchParams = {};
    if(typeof req.session.user_profile != "undefined" && req.session.user_profile != null){
        searchParams["current_tracker.user.username"] = req.session.user_profile.username;
    }else{
        var jsonResponse = {'statusMsg' : ' Truck Owner Details not reachable'};
        res.json(500, jsonResponse);
    }

    console.log("getMyTruckPosts searchParams: "+JSON.stringify(searchParams));

    //Truck.find(searchParams, subTruckSummary);
    Truck.aggregate(
        [
            {
                $match : searchParams
            },
            {
                $match: {
                    "truck_details.isActive" : true
                }
            },
            {
                $unwind : "$posts"
            },
            {
                $match: {
                    "posts.status" : {"$nin":["REMOVED"]}
                }
            },
            {
                $project:
                {
                    _id: 0,
                    truck_id: "$_id",
                    regNo: "$truck_details.reg_no",
                    post_id: "$posts._id",
                    source: "$posts.truck_post.availability.pickup_location",
                    destination : "$posts.truck_post.availability.delivery_location",
                    availableDate : "$posts.truck_post.availability.date",
                    load : "$posts.truck_post.maximum_load.quantity",
                    unit : "$posts.truck_post.maximum_load.unit"
                }
            }
        ], subMyTruckPosts
    );

    function subMyTruckPosts(err, data){
        if(!err){
            console.log('Data :' +JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var item = data[i];
                myTruckPostList.push({
                    truck_id : item.truck_id,
                    post_id : item.post_id,
                    regNo : item.regNo,
                    source : item.source,
                    destination : item.destination,
                    availableDate : moment(item.availableDate).format("Do MMM YYYY"),
                    capacity : item.load + " " + item.unit
                })
            }
            returnData.myTruckPostList.details = myTruckPostList;
            //console.log('Truck data length=' + returnData.truckList.details.length);
            console.log('Truck Post Data Rendered - '+JSON.stringify(returnData));
            res.json(200,returnData);
        }
        else{
            var jsonResponse = {'statusMsg' : ' Truck Post Fetch failed!'+err};
            res.json(500, jsonResponse);
        }
    }
};

exports.addTruck = function(req, res){

    console.log("Add Truck started for "+JSON.stringify(req.body.truck));

    var input = req.body.truck;

    if(typeof input == "undefined" || input == null){
        return res.json(500, {statusMsg:'Truck Input invalid'});
    }

    var truck = new Truck({
        truck_id : Math.floor((Math.random() * 10000) + 1),
        current_tracker : {
            time : new Date(),
            user : {
                username: req.session.user_profile.username,
                email: req.session.user_profile.email,
                first_name: req.session.user_profile.user_information.first_name,
                last_name: req.session.user_profile.user_information.last_name,
                display_name : req.session.user_profile.display_name,
                company_name: req.session.user_profile.user_information.company_name,
                user_type : req.session.user_profile.user_type,
                contact : req.session.user_profile.user_information.contact[0]
            }
        },
        owner : {
            first_name: input.owner.first_name,
            last_name: input.owner.last_name,
            address : {
                line1 : input.owner.address.line1,
                line2 : input.owner.address.line2,
                //line3 : { type: String, trim : true},
                city : input.owner.address.city,
                state : input.owner.address.state,
                //country : input.owner.address.country,
                pincode : input.owner.address.pincode
            },
            contact : input.owner.contact
        },
        company : {
            name: input.company.name,
            address_same_as_owner : input.company.address_same_as_owner,
            contact_same_as_owner : input.company.contact_same_as_owner,
            address : {
                line1 : input.company.address.line1,
                line2 : input.company.address.line2,
                //line3 : { type: String, trim : true},
                city : input.company.address.city,
                state : input.company.address.state,
                //country : input.company.address.country,
                pincode : input.company.address.pincode
            },
            contact : input.company.contact
        },
        truck_details : {
            type : input.details.type,
            make : input.details.make,
            model : input.details.model,
            reg_no : input.details.regno,
            isActive : true,
            minimum_load : {
                quantity : input.details.load,
                unit : "Tons"
            },
            maximum_load : {
                quantity : input.details.load,
                unit : "Tons"
            }
            //discontinueReason : {type: String, trim: true}
        },
        //posts : [postSchema],
        auditLog : {
            createdUserId : req.session.user_profile.username,
            lastUpdatedUserId : req.session.user_profile.username,
            createdTime : new Date(),
            lastUpdatedTime : new Date()
        }
    });

    console.log("Before Save Truck");
    truck.save(subSaveTruck);

    function subSaveTruck(err1){
        console.log("Save Truck Sub method");
        if(err1){
            console.log('Truck save failed - '+err1);
            res.json(500, {statusMsg:'Truck save failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck saved successfully'});
        }
    }
};

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
exports.getTruckById = function(req, res){

    console.log("Inside getTruckById");
    var truckId = req.body.truckId;

    if(typeof truckId == "undefined" || truckId == null){
        return res.json(500, {"statusMsg" : "Cannot update truck with Id undefined"});
    }else{
        Truck.findOne({
            "_id" : ObjectId.fromString(truckId)
        }, subGetTruckById);
    }

    function subGetTruckById(err, data){
        if(err){
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck found:"+JSON.stringify(data));
            return res.json(200, data);
        }
    }
};

exports.editTruck = function(req, res){

    console.log("Edit Truck started");
    var input = req.body.truck;
    if(typeof input == "undefined" || input == null){
        return res.json(500, {statusMsg:'Truck Input invalid'});
    }
    if(typeof input._id == "undefined" || input._id == null
        || typeof input.truck_id == "undefined" || input.truck_id == null){
        return res.json(500, {statusMsg:'Empty Truck ID passed - Stopping Hack Updates'});
    }
    console.log("Truck to be edited input:"+JSON.stringify(input));

    Truck.findOne({
        "_id" : ObjectId.fromString(input._id)
    }, subValidTruckById);

    function subValidTruckById(err, data){
        if(err){
            console.log("Truck found for update error:"+JSON.stringify(err));
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck found for update:"+JSON.stringify(data));
            //return res.json(200, data);
            updateTruck();
        }
    }

    function updateTruck(){

        console.log("Updating found Truck: "+input._id);
        Truck.update(
            { _id : input._id },
            { $set:
                {
                    current_tracker : {
                        time : new Date(),
                        user : {
                            username: req.session.user_profile.username,
                            email: req.session.user_profile.email,
                            first_name: req.session.user_profile.user_information.first_name,
                            last_name: req.session.user_profile.user_information.last_name,
                            display_name : req.session.user_profile.display_name,
                            company_name: req.session.user_profile.user_information.company_name,
                            user_type : req.session.user_profile.user_type,
                            contact : req.session.user_profile.user_information.contact[0]
                        }
                    },
                    owner : {
                        first_name: input.owner.first_name,
                        last_name: input.owner.last_name,
                        address : {
                            line1 : input.owner.address.line1,
                            //line2 : input.owner.address.line2,
                            //line3 : { type: String, trim : true},
                            city : input.owner.address.city,
                            state : input.owner.address.state,
                            //country : input.owner.address.country,
                            pincode : input.owner.address.pincode
                        },
                        contact : input.owner.contact
                    },
                    company : {
                        name: input.company.name,
                        address_same_as_owner : input.company.address_same_as_owner,
                        contact_same_as_owner : input.company.contact_same_as_owner,
                        address : {
                            line1 : input.company.address.line1,
                            //line2 : input.company.address.line2,
                            //line3 : { type: String, trim : true},
                            city : input.company.address.city,
                            state : input.company.address.state,
                            //country : input.company.address.country,
                            pincode : input.company.address.pincode
                        },
                        contact : input.company.contact
                    },
                    truck_details : {
                        type : input.details.type,
                        make : input.details.make,
                        model : input.details.model,
                        reg_no : input.details.regno,
                        isActive : true,
                        minimum_load : {
                            quantity : input.details.load,
                            unit : "Tons"
                        },
                        maximum_load : {
                            quantity : input.details.load,
                            unit : "Tons"
                        }
                        //discontinueReason : {type: String, trim: true}
                    },
                    //posts : [postSchema],
                    auditLog : {
                        createdUserId : req.session.user_profile.username,
                        lastUpdatedUserId : req.session.user_profile.username,
                        createdTime : new Date(),
                        lastUpdatedTime : new Date()
                    }
                }
            },
            subUpdateTruck
        );
    }

    function subUpdateTruck(err1){
        console.log("Update Truck Sub method");
        if(err1){
            console.log('Truck update failed - '+err1);
            res.json(500, {statusMsg:'Truck Update Failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck Updated Successfully'});
        }
    }
};

exports.removeTruck = function(req, res){

    console.log("Remove Truck started for "+JSON.stringify(req.session.user_profile));

    var input = req.body.truck;

    if(typeof input == "undefined" || input == null){
        return res.json(500, {statusMsg:'Truck Input invalid'});
    }

    if(typeof input._id == "undefined" || input._id == null){
        return res.json(500, {statusMsg:'Empty Truck ID passed - Stopping Hack Removes'});
    }

    Truck.findOne({
        "_id" : ObjectId.fromString(input._id)
    }, subValidTruckById);

    function subValidTruckById(err, data){
        if(err){
            console.log("Truck found for remove error:"+JSON.stringify(err));
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck found for remove:"+JSON.stringify(data));
            //return res.json(200, data);
            removeTruck();
        }
    }

    function removeTruck(){

        console.log("Removing found Truck: "+input._id);
        Truck.update(
            { _id : input._id },
            { $set:
            {
                "truck_details.isActive" : false
            }
            },
            subRemoveTruck
        );
    }

    function subRemoveTruck(err1){
        console.log("Remove Truck Sub method");
        if(err1){
            console.log('Truck remove failed - '+err1);
            res.json(500, {statusMsg:'Truck Remove Failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck Removed Successfully'});
        }
    }
};

exports.addTruckPost = function(req, res){

    console.log("Add Truck started for "+JSON.stringify(req.session.user_profile));

    var truckId = req.body.truckId;
    var new_post = req.body.post;

    if(typeof truckId == "undefined" || truckId == null){
        return res.json(500, {statusMsg:'Truck Input invalid'});
    }
    if(typeof new_post == "undefined" || new_post == null){
        return res.json(500, {statusMsg:'Truck Post Details invalid'});
    }

    var post = {
        status : "ADDED",
        truck_post : {
            availability : {
                date : new_post.pickup.date,
                pickup_location : new_post.source,
                delivery_location : new_post.destination
            },
            minimum_load : {
                quantity : new_post.load,
                unit : "Tons"
            },
            maximum_load : {
                quantity : new_post.load,
                unit : "Tons"
            }
        }
    };

    Truck.findOne({
        "_id" : ObjectId.fromString(truckId)
    }, subValidTruckById);

    function subValidTruckById(err, data){
        if(err){
            console.log("Truck found for post update error:"+JSON.stringify(err));
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck found for update:"+JSON.stringify(data));
            //return res.json(200, data);
            addPostToTruck();
        }
    }

    function addPostToTruck(){
        console.log("Before Save Truck Post");
        Truck.update(
            {"_id" : ObjectId.fromString(truckId)},
            { $push: { posts: post } },
            subAddTruckPost
        );
    }

    function subAddTruckPost(err1){
        console.log("Save Truck Post Sub method");
        if(err1){
            console.log('Add Truck Post save failed - '+err1);
            res.json(500, {statusMsg:'Add Truck Post save failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck Post Added Successfully'});
        }
    }
};

exports.getTruckPostById = function(req, res){

    console.log("Inside getTruckPostById");
    var truckId = req.body.truckId;
    var postId = req.body.postId;

    if(typeof truckId == "undefined" || truckId == null){
        return res.json(500, {"statusMsg" : "Cannot update truck with Id undefined"});
    }else{
        Truck.findOne({
            "_id" : ObjectId.fromString(truckId),
            "posts._id" : ObjectId.fromString(postId)
        }, subGetTruckById);
    }

    function subGetTruckById(err, data){
        if(err){
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck Post found:"+JSON.stringify(data));
            return res.json(200, data);
        }
    }
};

exports.editTruckPost = function(req, res){

    console.log("Edit Truck started for "+JSON.stringify(req.session.user_profile));

    var truckId = req.body.truckId;
    var post = req.body.post;

    if(typeof truckId == "undefined" || truckId == null){
        return res.json(500, {"statusMsg" : "Cannot update truck with Id undefined"});
    }else{
        Truck.findOne({
            "_id" : ObjectId.fromString(truckId),
            "posts._id" : ObjectId.fromString(post._id)
        }, subValidTruckById);
    }

    function subValidTruckById(err, data){
        if(err){
            console.log("Truck found for update post error:"+JSON.stringify(err));
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck found for update Post:"+JSON.stringify(data));
            //return res.json(200, data);
            updateTruckPost();
        }
    }

    function updateTruckPost(){

        console.log("Updating found Truck Post: "+truckId+" with post id: "+post._id);
        var current_tracker = {
            time : new Date(),
                user : {
                username: req.session.user_profile.username,
                    email: req.session.user_profile.email,
                    first_name: req.session.user_profile.user_information.first_name,
                    last_name: req.session.user_profile.user_information.last_name,
                    display_name : req.session.user_profile.display_name,
                    company_name: req.session.user_profile.user_information.company_name,
                    user_type : req.session.user_profile.user_type,
                    contact : req.session.user_profile.user_information.contact[0]
            }
        };
        var auditLog = {
            createdUserId : req.session.user_profile.username,
                lastUpdatedUserId : req.session.user_profile.username,
                createdTime : new Date(),
                lastUpdatedTime : new Date()
        };

        var truck_post = {
            availability : {
                date : post.pickup.date,
                pickup_location : post.source,
                delivery_location : post.destination
            },
            minimum_load : {
                quantity : post.load,
                unit : "Tons"
            },
            maximum_load : {
                quantity : post.load,
                unit : "Tons"
            }
        };

        Truck.update(
            {
                _id : truckId,
                "posts._id" : post._id
            },
            { $set:
                {
                    "posts.$.truck_post" : truck_post

                }
            },
            subUpdateTruckPost
        );
    }

    function subUpdateTruckPost(err1){
        console.log("Update Truck Post Sub method");
        if(err1){
            console.log('Truck Post update failed - '+err1);
            res.json(500, {statusMsg:'Truck Post Update Failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck Post Updated Successfully'});
        }
    }
};

exports.removeTruckPost = function(req, res){

    console.log("Remove Truck Post started for "+JSON.stringify(req.session.user_profile));

    var truckId = req.body.truckId;
    var postId = req.body.postId;

    if(typeof truckId == "undefined" || truckId == null){
        return res.json(500, {statusMsg:'Empty Truck passed for removing - Stopping Hack Remove'});
    }

    if(typeof postId == "undefined" || postId == null){
        return res.json(500, {statusMsg:'Empty Post passed for removing - Stopping Hack Removes'});
    }

    Truck.findOne({
        "_id" : ObjectId.fromString(truckId),
        "posts._id" : ObjectId.fromString(postId)
    }, subValidTruckById);

    function subValidTruckById(err, data){
        if(err){
            console.log("Truck Post found for remove error:"+JSON.stringify(err));
            return res.json(500, {"statusMsg" : "Cannot find truck with Id :"+JSON.stringify(err)});
        }else{
            console.log("Truck Post found for remove:"+JSON.stringify(data));
            //return res.json(200, data);
            removeTruckPost();
        }
    }

    function removeTruckPost(){

        console.log("Removing found Truck Post : "+postId+" for truck: "+truckId);
        Truck.update(
            {
                "_id" : ObjectId.fromString(truckId),
                "posts._id" : ObjectId.fromString(postId)
            },
            { $set:
            {
                "posts.$.status" : "REMOVED"
            }
            },
            subRemoveTruck
        );
    }

    function subRemoveTruck(err1){
        console.log("Remove Truck Post Sub method");
        if(err1){
            console.log('Truck remove failed - '+err1);
            res.json(500, {statusMsg:'Truck Post Remove Failed - '+JSON.stringify(err1)});
        }else{
            res.json(200, {statusMsg:'Truck Post Removed Successfully'});
        }
    }
};