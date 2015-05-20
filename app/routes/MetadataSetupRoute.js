/**
 * Created by 376346 on 2/26/14.
 */

var XLSX = require('xlsx');
var moment = require('moment');
var _ = require('lodash');
var Application = require('../models/Application').Application;
var MetMapping = require('../models/MetMapping').MetMapping;
var Contract = require('../models/Contract').Contract;
var DmDataMap =require('../models/DM').DmData;
var DmReleaseData =require('../models/DMRelease').DmReleaseData;
var ProjectMapping = require('../models/ProjectMapping').ProjectMapping;
var ProjectMappingRelease = require('../models/ProjectMappingReleaseSummary').ProjectMappingSummary;
var CCAPData = require('../models/CCAPData').CCAPData;
var PCM = require('../models/PCMRevised').PCMData;
var PCMData = require('../models/PCM').PCM;
var PHS = require('../models/PHS').PHS;
var DMData = require('../models/DM').DmData;
var Lookup = require('../models/Lookup').Lookup;

function listToArray(fullString, separator) {
    var fullArray = [];

    if (typeof fullString != 'undefined' && fullString != null && fullString != '') {
        if (fullString.indexOf(separator) == -1) {
            fullArray.push(fullString.trim());
        } else {
            fullArray = fullString.split(/[\n,]+/);
            for(var x=0;x<fullArray.length;x++){
                fullArray[x] = fullArray[x].trim();
            }
        }
    }

    return fullArray;
}

String.prototype.removeComma = function() {
    //console.log("Removing comma:"+this.replace(',', ''));
    return this.replace(',', '');
};

exports.loadReportingMonth = function(req,res){

    var startMonth = req.body.startMonth;
    //console.log ('MetaDataSetup Route Load Reporting Month - '+JSON.stringify(startMonth));

    var docs = [];
    var currentDt = moment().utc();
    //if(startMonth.month>0){
    currentDt.add('months', startMonth.month);
    //}

    for(var i=0;i<10;i++){
        var reportingMonthJson = {};
        reportingMonthJson.year = currentDt.get('year');
        reportingMonthJson.month = currentDt.get('month') + 1;
        reportingMonthJson.formattedDate = currentDt.format("MMMM YYYY");
        //console.log ('Reporting Month to be loaded -> '+JSON.stringify(reportingMonthJson));
        docs.push(reportingMonthJson);
        currentDt.add('months', 1);
    }
    //console.log ('MetaDataSetup Route Loaded Reporting Month -> '+JSON.stringify(docs));
    res.json(200, docs);
};

exports.uploadEAIExcel = function(req,res){
    var eaiExcelColumnNames = {
          application                    :   "Application"
        , eAIApplicationId               :   "EAI Application ID"
    };
    console.log('Create row on collection '+JSON.stringify(req.body.result));
    var user = req.session.user_profile;
    var json=req.body.result;
    var ApplicationData = new Application({
        eaiId :json[eaiExcelColumnNames.eAIApplicationId],
        applicationList : [],
        auditLog : {
            createdUserId : user.username,
            lastUpdatedUserId : user.username,
            createdTime : moment.utc().local(),
            lastUpdatedTime : moment.utc().local()
        }
    });
    //ApplicationData.Application=[];
    var applicationListName=listToArray(json[eaiExcelColumnNames.application],",");
    for(var z=0;z<applicationListName.length;z++){
        //var applicationName = {'Application' : applicationListName[z]};
        ApplicationData.applicationList.push({'applicationName':applicationListName[z]});
    }
    //console.log('EAI Application list - 'JSON.stringify(ApplicationData.applicationList));
    console.log('Store EAI - '+JSON.stringify(ApplicationData));

    ApplicationData.save(subUploadEAIExcelSave);

    function subUploadEAIExcelSave(err1){
        if(err1){
            console.log('EAI Excel save failed - '+err1);
            res.json(500, {'statusMsg' : 'Row '+json.item+' Errored out - '+err1});
        }else{
            res.json (200, {'item' : json.item});
        }
    }
};

/*function fetchDetailsFromProjectMapping(){
    console.log (' Inside fetchDetailsFromProjectMapping');

    ProjectMapping.aggregate([   { $project : {'pbm':'$_id.pbm','pbm1':'$_id.pbm1','pbm2':'$_id.pbm2','projectCode':'$_id.projectCode',_id:0}},
            { $sort : { pbm : 1 } }],
        subFetchDetailsFromProjectMapping);

    function subFetchDetailsFromProjectMapping(err, data){
        console.log('-----------------------------------------------');
        if (!err){
            console.log('ProjectMappingDeatils length=' + data.length);
            console.log('ProjectMappingDeatils - '+JSON.stringify(data));
            res.json(200, data);
        }
        else{
            var jsonResponse = {'errMsg' : 'ProjectMappingDeatils!'+err};
            res.json({500 : jsonResponse});
        }
    }
}*/

exports.uploadMetMapExcel=function(req,res){

    var metMappingExcelColumnNames = {
          businessUnit      :   "Business Unit"
        , pbm               :   "PBM"
        , pbm1              :   "PBM1"
        , pbm2              :   "PBM2"
        , portfolio         :   "PORTFOLIO"
    };
    console.log('Create row on collection '+JSON.stringify(req.body.result));
    var user = req.session.user_profile;
    var json=req.body.result;
    var MetDataMap1 = new MetMapping({
        metMap : {
            businessUnit : json[metMappingExcelColumnNames.businessUnit],
            pbm : json[metMappingExcelColumnNames.pbm],
            pbm1 : json[metMappingExcelColumnNames.pbm1],
            pbm2 : json[metMappingExcelColumnNames.pbm2],
            portfolio : json[metMappingExcelColumnNames.portfolio]
        },
        activeDate : Date.now(),
        auditLog : {
            createdUserId : user.username,
            lastUpdatedUserId : user.username,
            createdTime : moment.utc().local(),
            lastUpdatedTime : moment.utc().local()
        }
    });
    MetDataMap1.save(subUploadMetMapExcelSave);

    function subUploadMetMapExcelSave(err1){
        if(err1){
            console.log('MetMapping save failed - '+err1);
            res.json(500, {'statusMsg' : 'Row '+json.item+' Errored out - '+err1});
        }else{
            res.json (200, {'item' : json.item});
        }
    }
};

exports.directUploadMetMapping = function (req, res) {
    var xlsx = XLSX.readFile('D:/07.Build2.0/UPLOAD/MetlifeMapping.xlsx');
    var sheet_name_list = xlsx.SheetNames;
    var user = req.session.user_profile;
    console.log('Sheets available.....'+JSON.stringify(sheet_name_list));
    MetMapping.remove(subUploadMasterMapping);

    function subUploadMasterMapping(err){
        if(!err){
            console.log('Removed all rows from Met Mapping.....' );
            xlsx.SheetNames.forEach(function(y) {
                var parsedSheet = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[sheet_name_list[0]]);
                console.log('Parsed sheet -- '+ JSON.stringify(parsedSheet));

                for(i in parsedSheet){
                    var jsonObj = parsedSheet[i];
                    //console.log('JSON '+JSON.stringify(jsonObj));
                    var metlifeMapping = new MetMapping({
                        metMap: {
                            businessUnit : jsonObj["Business Unit"],
                            pbm : jsonObj.PBM,
                            pbm1 : jsonObj.PBM1,
                            pbm2 : jsonObj.PBM2,
                            portfolio : jsonObj.PORTFOLIO
                        },
                        auditLog : {
                            createdUserId : user.username,
                            lastUpdatedUserId : user.username,
                            createdTime : moment.utc().local(),
                            lastUpdatedTime : moment.utc().local()
                        }
                    });
                    metlifeMapping.activeDate = new Date();
                    console.log('JSON '+JSON.stringify(jsonObj));

                    metlifeMapping.save(subUploadMasterMappingSave);

                    function subUploadMasterMappingSave(err1){
                        if(err1){
                            console.log('Metlife Mapping save failed - '+err1);
                            res.json(500, {statusMsg : 'Met Mapping failed with error -'+err1});
                        }
                    }
                }
            });
        }else{
            console.log('Metlife Mapping remove all failed');
        }
    }
    res.json(200, {statusMsg : 'Met Mapping Upload success '});
};

exports.uploadProjectMapping = function(req,res){
    var projectMappingExcelColumnNames = {
          businessUnit      :   "Business Unit"
        , pbm               :   "PBM"
        , pbm1              :   "PBM1"
        , pbm2              :   "PBM2"
        , portfolio         :   "Portfolio"
        , projectCode       :   "Project Code"
        , esaProjectId      :   "ESA Project Id"
    };

    console.log('Create row on collection '+JSON.stringify(req.body.result));
    var user = req.session.user_profile;
    var jsonObj=req.body.result;

    if((typeof jsonObj[projectMappingExcelColumnNames.businessUnit] == 'undefined' || jsonObj["Business Unit"] == null || jsonObj["Business Unit"] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.pbm] == 'undefined' || jsonObj[projectMappingExcelColumnNames.pbm] == null || jsonObj[projectMappingExcelColumnNames.pbm] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.pbm1] == 'undefined' || jsonObj[projectMappingExcelColumnNames.pbm1] == null || jsonObj[projectMappingExcelColumnNames.pbm1] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.pbm2] == 'undefined' || jsonObj[projectMappingExcelColumnNames.pbm2] == null || jsonObj[projectMappingExcelColumnNames.pbm2] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.portfolio] == 'undefined' || jsonObj[projectMappingExcelColumnNames.portfolio] == null || jsonObj[projectMappingExcelColumnNames.portfolio] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.projectCode] == 'undefined' || jsonObj[projectMappingExcelColumnNames.projectCode] == null || jsonObj[projectMappingExcelColumnNames.projectCode] == '') ||
        (typeof jsonObj[projectMappingExcelColumnNames.esaProjectId] == 'undefined' || jsonObj[projectMappingExcelColumnNames.esaProjectId] == null || jsonObj[projectMappingExcelColumnNames.esaProjectId] == '')){

        console.log('Row missing expected values');
        res.json(500, {'statusMsg' : 'Row '+jsonObj.item+': Missing expected values: BU, PBM, PBM1, PBM2, Portfolio'});
    }

    MetMapping.aggregate([
        { $project :
        {'businessUnit':'$metMap.businessUnit'
            ,'pbm':'$metMap.pbm'
            ,'pbm1':'$metMap.pbm1'
            ,'pbm2':'$metMap.pbm2'
            ,'portfolio':'$metMap.portfolio'
            ,_id:0
        }
        },
        { $sort : { pbm : 1 } }
    ], subFetchMetMappingDetails);

    function subFetchMetMappingDetails(err, data){
        if (!err){
            //console.log('MetMapping Details length=' + data.length);
            console.log('Met Mapping aggregate - '+JSON.stringify(data));
            var x = -1;
            for(var z=0; z < data.length; z++){
                if(data[z].pbm==jsonObj[projectMappingExcelColumnNames.pbm]
                    && data[z].pbm1==jsonObj[projectMappingExcelColumnNames.pbm1]
                    && data[z].pbm2==jsonObj[projectMappingExcelColumnNames.pbm2]
                    && data[z].businessUnit== jsonObj[projectMappingExcelColumnNames.businessUnit]
                    && data[z].portfolio==jsonObj[projectMappingExcelColumnNames.portfolio] ){

                    x = z;
                    break;
                }
            }

            if(x>-1){
                console.log('Met Mapping aggregate Match found for key - '+JSON.stringify(data[x]));
            }else{
                console.log('Met Mapping aggregate Match not found for key and inserting values from sheet');
                res.json(500, {'statusMsg' : 'Row '+jsonObj.item+': Met Mapping aggregate Match not found for key'});
            }

            var projectMappingData = new ProjectMapping({
                projectMap :{
                    pbm : jsonObj[projectMappingExcelColumnNames.pbm],
                    pbm1 : jsonObj[projectMappingExcelColumnNames.pbm1],
                    pbm2 : jsonObj[projectMappingExcelColumnNames.pbm2],
                    projectCode : jsonObj[projectMappingExcelColumnNames.projectCode],
                    esaProjectId : jsonObj[projectMappingExcelColumnNames.esaProjectId],
                    businessUnit : jsonObj[projectMappingExcelColumnNames.businessUnit],
                    portfolio : jsonObj[projectMappingExcelColumnNames.portfolio]
                },
                auditLog : {
                    createdUserId : user.username,
                    lastUpdatedUserId : user.username,
                    createdTime : moment.utc().local(),
                    lastUpdatedTime : moment.utc().local()
                }
            });
            projectMappingData.save(subUploadProjectMappingExcelSave);

            function subUploadProjectMappingExcelSave(err1){
                if(err1){
                    console.log('ProjectMapping save failed - '+err1);
                    res.json(500, {'statusMsg' : 'Row '+jsonObj.item+' Errored out - '+err1});
                }else{
                    res.json (200, {'item' : jsonObj.item});
                }
            }
        }
        else{
            var jsonResponse = {'errMsg' : 'MetMapping Details Fetch failed!'+err};
            res.json({500 : jsonResponse});
        }
    }

};

exports.uploadProjectMappingRelease = function(req,res){
    var projectMappingExcelColumnNames = {
        businessUnit      :   "Business Unit"
        , pbm               :   "PBM"
        , pbm1              :   "PBM1"
        , pbm2              :   "PBM2"
        , portfolio         :   "Portfolio"
        , projectCode       :   "Project Code"
        , esaProjectId      :   "ESA Project Id"
    };

    console.log('Create row on collection '+JSON.stringify(req.body.result));
    var user = req.session.user_profile;
    var jsonObj=req.body.result;
    var projectMappingData = new ProjectMappingRelease({
        projectMapSummary :{
            pbm : jsonObj[projectMappingExcelColumnNames.pbm],
            pbm1 : jsonObj[projectMappingExcelColumnNames.pbm1],
            pbm2 : jsonObj[projectMappingExcelColumnNames.pbm2],
            projectCode : jsonObj[projectMappingExcelColumnNames.projectCode],
            esaProjectId : jsonObj[projectMappingExcelColumnNames.esaProjectId],
            businessUnit : jsonObj[projectMappingExcelColumnNames.businessUnit],
            portfolio : jsonObj[projectMappingExcelColumnNames.portfolio]
        },
         auditLog : {
        createdUserId : user.username,
        lastUpdatedUserId : user.username,
        createdTime : moment.utc().local(),
        lastUpdatedTime : moment.utc().local()
        }
    });
    projectMappingData.save(subUploadProjectMappingSummaryExcelSave);

    function subUploadProjectMappingSummaryExcelSave(err1){
        if(err1){
            console.log('ProjectMapping save failed - '+err1);
            res.json(500, {'statusMsg' : 'Row '+jsonObj.item+' Errored out - '+err1});
        }else{
            res.json (200, {'item' : jsonObj.item});
        }
    }
};

exports.uploadContractPDAD = function (req, res) {

   console.log('Create row on collection '+JSON.stringify(req.body.result));
    var user = req.session.user_profile;
    var json=req.body.result;
    var reptMonth,reptYear;
    reptMonth = json.reportingMonth.month;
    reptYear = json.reportingMonth.year;

    console.log('reptMonth: '+reptMonth);
    var contractExcelColumnNames = {
        businessUnit        :   "Business Unit"
        , pbm               :   "PBM"
        , pbm1              :   "PBM1"
        , pbm2              :   "PBM2"
        , portfolio         :   "Portfolio"
        , sow               :   "SOW#"
        , wo                :   "WO#"
        , pdad              :   "PDAD#"
        , cognizantLead     :   "Cognizant Lead"
        , status            :   "Status"
        , pdadApprovalStatus:   "PDAD Approval Status"
        , engagementModel   :   "Engagement Model"
        , engagementType    :   "Engagement Type"
        , pmCodes           :   "PM Codes"
        , startDate         :   "Start Date"
        , endDate           :   "End Date"
        , totalEstimate     :   "Total Estimate"
    };
    var dt = Date.now();
    if(moment.utc(json[contractExcelColumnNames.endDate], ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid()){
        console.log('Converting input date format - ');
        dt = moment.utc(json[contractExcelColumnNames.endDate], ["MM-DD-YYYY", "YYYY-MM-DD"]);
    }

    if(typeof json[contractExcelColumnNames.businessUnit] == 'undefined'
            || json[contractExcelColumnNames.businessUnit] == null
            || json[contractExcelColumnNames.businessUnit] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Business Unit not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.pbm] == 'undefined'
        || json[contractExcelColumnNames.pbm] == null
        || json[contractExcelColumnNames.pbm] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PBM not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.pbm1] == 'undefined'
        || json[contractExcelColumnNames.pbm1] == null
        || json[contractExcelColumnNames.pbm1] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PBM-1 not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.pbm2] == 'undefined'
        || json[contractExcelColumnNames.pbm2] == null
        || json[contractExcelColumnNames.pbm2] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PBM-2 not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.portfolio] == 'undefined'
        || json[contractExcelColumnNames.portfolio] == null
        || json[contractExcelColumnNames.portfolio] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Portfolio not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.wo] == 'undefined'
        || json[contractExcelColumnNames.wo] == null
        || json[contractExcelColumnNames.wo] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Work Order not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.sow] == 'undefined'
        || json[contractExcelColumnNames.sow] == null
        || json[contractExcelColumnNames.sow] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Statement of Work not available. Please validate'});
    }
    if(typeof json[contractExcelColumnNames.pdad] == 'undefined'
        || json[contractExcelColumnNames.pdad] == null
        || json[contractExcelColumnNames.pdad] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PDAD Agreement ID not available. Please validate'});
    }

    var pdad = new Contract({
        contractKey : {

            businessUnit : json[contractExcelColumnNames.businessUnit],
            pbm : json[contractExcelColumnNames.pbm],
            pbm1 : json[contractExcelColumnNames.pbm1],
            pbm2 : json[contractExcelColumnNames.pbm2],
            portfolio : json[contractExcelColumnNames.portfolio],
            purchaseOrder : {
                wo : json[contractExcelColumnNames.wo],
                pdad : json[contractExcelColumnNames.pdad],
                sow : json[contractExcelColumnNames.sow]
            }
        },
        auditLog : {
            createdUserId : user.username,
            lastUpdatedUserId : user.username,
            createdTime : moment.utc().local(),
            lastUpdatedTime : moment.utc().local()
        }
    });
    var contractReportingMonthSelected = req.body.contractReportingMonthSelected;
    console.log('contractReportingMonthSelected : '+contractReportingMonthSelected );

    pdad.pdadApprovalDetails =[];
    pdad.releases = [];
    pdad.pmCodes = [];
    if(typeof json[contractExcelColumnNames.cognizantLead] == 'undefined'
        || json[contractExcelColumnNames.cognizantLead] == null
        || json[contractExcelColumnNames.cognizantLead] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Cognizant Lead not available. Please validate'});
    }
    pdad.cognizantLead = json[contractExcelColumnNames.cognizantLead];
    if(typeof json[contractExcelColumnNames.status] == 'undefined'
        || json[contractExcelColumnNames.status] == null
        || json[contractExcelColumnNames.status] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PDAD status not available. Please validate'});
    }
    pdad.status = json[contractExcelColumnNames.status];

    if(typeof json[contractExcelColumnNames.engagementModel] == 'undefined'
        || json[contractExcelColumnNames.engagementModel] == null
        || json[contractExcelColumnNames.engagementModel] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Engagement Model not available. Please validate'});
    }
    pdad.engagementModel = json[contractExcelColumnNames.engagementModel];

    if(typeof json[contractExcelColumnNames.engagementType] == 'undefined'
        || json[contractExcelColumnNames.engagementType] == null
        || json[contractExcelColumnNames.engagementType] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Engagement Type not available. Please validate'});
    }
    pdad.engagementType = json[contractExcelColumnNames.engagementType];

    var pmCodes = listToArray(json[contractExcelColumnNames.pmCodes],",");
    if(!Array.isArray(pmCodes) || pmCodes.length == 0){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PM Codes not available. Please validate'});
    }
    for(var z=0;z<pmCodes.length;z++){
        var code = {'pmCode' : pmCodes[z]};
        pdad.pmCodes.push(code);
    }

    if(typeof json[contractExcelColumnNames.startDate] == 'undefined'
        || json[contractExcelColumnNames.startDate] == null
        || json[contractExcelColumnNames.startDate] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PDAD Start Date not available. Please validate'});
    }
    var startDate = json[contractExcelColumnNames.startDate];

    if(typeof json[contractExcelColumnNames.endDate] == 'undefined'
        || json[contractExcelColumnNames.endDate] == null
        || json[contractExcelColumnNames.endDate] == ''){
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - PDAD End Date not available. Please validate'});
    }
    var endDate = json[contractExcelColumnNames.endDate];

    var release ={};
    var projects = {};

    //Dump temporary N/A to project. Final target is to get this persisted to standardize the process
    projects.projectName = 'N/A';

    if(typeof endDate == 'undefined' || endDate == null || endDate == ''){
        console.log('Release End date not available and considering year end date');
        //endDate = moment.utc([2100,12,31]);
        release.releaseDate = moment.utc([2100,12,31]);
    }else{
        endDate = moment.utc(json[contractExcelColumnNames.endDate],["MM/DD/YYYY", "YYYY-MM-DD"]);
        console.log('Formatting Release End date from '+json[contractExcelColumnNames.endDate]+' to '+endDate);
        release.releaseName = '';
        release.releaseDate = moment(json[contractExcelColumnNames.endDate]).add('days',1);
    }

    if(typeof startDate == 'undefined' || startDate == null || startDate == ''){
        console.log('Release End date not available and considering year end date');
        //startDate = moment.utc([0001,01,01]);
        release.releaseStartDate = moment.utc([0001,01,01]);
    }else{
        release.releaseStartDate = moment(startDate).add('days',1);
        release.projects = [];
        projects.projectName = 'No Data';
    }
    // Storing Empty Data temporarily as there is no ProjectName Column in contract sheet
    release.projects.push(projects);
    pdad.releases.push(release);

    var pdadStatusDetails = {};
    pdadStatusDetails.modifiedReportingMonth = {};
    if(contractReportingMonthSelected == true){
        pdadStatusDetails.modifiedReportingMonth.month = reptMonth;
        pdadStatusDetails.modifiedReportingMonth.year = reptYear;
    }else{
        //Dump minimum date for reporting
        pdadStatusDetails.modifiedReportingMonth.month = 01;
        pdadStatusDetails.modifiedReportingMonth.year = 2014;
    }

    if(typeof json[contractExcelColumnNames.pdadApprovalStatus] != 'undefined' &&
        json[contractExcelColumnNames.pdadApprovalStatus] != ''){
        console.log('Row ' + json.item +' On time Approval status - '+json[contractExcelColumnNames.pdadApprovalStatus.toLowerCase()]);
        if(json[contractExcelColumnNames.pdadApprovalStatus].toLowerCase() != 'approved' &&
            json[contractExcelColumnNames.pdadApprovalStatus].toLowerCase() != 'pending' &&
            json[contractExcelColumnNames.pdadApprovalStatus].toLowerCase() != 'not-applicable'){

            return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Invalid On time approval status. Please validate'});
        }
    }else{
        console.log('On time Approval status - '+json[contractExcelColumnNames.pdadApprovalStatus.toLowerCase()]);
        return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Invalid On time approval status. Please validate'});
    }

    if(json[contractExcelColumnNames.pdadApprovalStatus].toLowerCase() != 'not-applicable'){
        pdadStatusDetails.onTimeApprovalStatus = json[contractExcelColumnNames.pdadApprovalStatus];
    }

    //Fixed PDAD logic modified as Engagement Type will change monthly
    pdadStatusDetails.engagementModel = json[contractExcelColumnNames.engagementModel];
    pdadStatusDetails.engagementType = json[contractExcelColumnNames.engagementType];
    //PDAD Status logic modified as latest startus might change between months
    pdadStatusDetails.status = json[contractExcelColumnNames.status];
    //Dump other fields onto change history and it can be used if required in future (11/10)
    pdadStatusDetails.cognizantLead = pdad.cognizantLead;
    //pdadStatusDetails.releases = pdad.releases;
    pdadStatusDetails.pmCodes = pdad.pmCodes;

    //pdadStatusDetails.endDate = new Date(release.releaseDate);
    pdadStatusDetails.modifiedOn = new Date(moment.utc().local());

    if(typeof json[contractExcelColumnNames.totalEstimate] == 'undefined'
            || json[contractExcelColumnNames.totalEstimate] == null){
        if(contractReportingMonthSelected){
            console.log('Row ' + json.item +' Total Estimate not available: '+json[contractExcelColumnNames.totalEstimate]);
        }else if(pdad.engagementType.toUpperCase() == 'FIXED-BID'){
            return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Total Estimate Not available for Fixed Bid Engagement. Please validate'});
        }
    }else{
        if(!isNaN(json[contractExcelColumnNames.totalEstimate])){
            var totalEstimate = new Number((json[contractExcelColumnNames.totalEstimate]));
            totalEstimate = parseFloat(totalEstimate);
            pdadStatusDetails.totalEstimate = (totalEstimate);
        }else{
            return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Invalid Total Estimate. Please validate'});
        }
    }

    console.log('Row ' + json.item +'PDAD change history to load: '+JSON.stringify(pdadStatusDetails));
    pdad.pdadChangeHistory.push(pdadStatusDetails);
    //console.log('pdadStatusDetails : '+ JSON.stringify(pdadStatusDetails));
    console.log('Row ' + json.item +'PDAD List to be loaded: '+JSON.stringify(pdad));

    var searchParams = {};
    searchParams['contractKey.businessUnit']        = json[contractExcelColumnNames.businessUnit];
    searchParams['contractKey.pbm']                 = json[contractExcelColumnNames.pbm];
    searchParams['contractKey.pbm1']                = json[contractExcelColumnNames.pbm1];
    searchParams['contractKey.pbm2']                = json[contractExcelColumnNames.pbm2];
    searchParams['contractKey.portfolio']           = json[contractExcelColumnNames.portfolio];
    searchParams['contractKey.purchaseOrder.wo']  = json[contractExcelColumnNames.wo];
    searchParams['contractKey.purchaseOrder.sow']  = json[contractExcelColumnNames.sow];
    searchParams['contractKey.purchaseOrder.pdad']  = json[contractExcelColumnNames.pdad];

    console.log('Row ' + json.item +' updateContractPDADApprovalDetails searchParams: '+JSON.stringify(searchParams));
    //console.log('release.releaseDate: '+ JSON.stringify(release.releaseDate));
    //var pdadStatus = json[contractExcelColumnNames.pdadApprovalStatus].toLowerCase();
    //var updateKey;
    //var diffEndDate = false,diffOnTimeApprovalStatus = false;
    //console.log('pdadStatus : '+pdadStatus);
    Contract.find(searchParams,'pdadApprovalDetails', updateContractPDADApprovalDetails);

    function updateContractPDADApprovalDetails(err,data){

        if(err){
            return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Check existing Contract validation failed.'});
        }

        console.log('Found Data is::: '+JSON.stringify(data));
        if(data.length > 0){
            if(!contractReportingMonthSelected){
                console.log('Row ' + json.item +'Contract data already available for reporting month not selected');
                return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Contract data already available. Please validate'});
            }
            //console.log('Update Triggered');
            //updateKey = true;
        }else{
            //console.log('Save Triggered');
            if(contractReportingMonthSelected){
                console.log('Row ' + json.item +'Contract data not available for reporting month selected');
                return res.json(500, {'statusMsg' : 'Row ' + json.item +' - Contract not available for update. Please validate'});
            }
            //updateKey = false;
        }
        next();
    }

    function next() {

        console.log('Inside Contract modify - ' + contractReportingMonthSelected);
        if (contractReportingMonthSelected) {
            Contract.update(searchParams,
                {
                    $set : {
                        "releases" : pdad.releases
                    },
                    $push: {
                        'pdadChangeHistory': pdadStatusDetails
                    }
                },
                {multi: true}, subUpdateContractData);
        } else {
            pdad.save(subUploadContractPDADSave);
        }

        function subUpdateContractData(err1, rowsAffected, raw) {
            if (err1) {
                res.json(500, {statusMsg: 'Row ' + json.item +' - Contract update failed - ' + JSON.stringify(err1)});
                console.log('Row ' + json.item +'contract data  update Data  failed - ' + err1);
            } else {
                console.log('Row ' + json.item +' Appended PDAD Array .........');
                res.json(500, {statusMsg: 'Row ' + json.item +' - Contract Data Updated successfully. Number of rows affected: ' + rowsAffected});
            }
        }

        function subUploadContractPDADSave(err2) {
            if (err2) {
                console.log('Row ' + json.item +' - PDAD save failed - ' + err2);
                res.json(500, {'statusMsg': 'Row ' + json.item + ' Contract Save Error out - ' + err2});
            } else {
                console.log('Row ' + json.item +' - PDAD save success - ');
                res.json(200, {'item': json.item});
            }
        }
    }
};

exports.uploadDMExcel=function(req,res){

    var dmExcelColumnNames = {
          pbm               :   "WO:PBM"
        , pbm1              :   "PBM-1"
        , pbm2              :   "Resource Manager"
        , po                :   "WO:PO #"
        , msow              :   "WO:MSOW#"
        , wo                :   "WO"
        , pdad              :   "PDAD"
        , projectCode       :   "Project Code"
        , businessArea      :   "Project Code:Business Area"
        , projectName       :   "Project Code:Project Name"
        , nActlOn           :   "(N) Actl ON"
        , nActlOff          :   "(N) Actl OF"
        , nForecast         :   "(N)Act $"
        , n1ActlOn          :   "(N+1) Actl ON"
        , n1ActlOff         :   "(N+1) Actl OF"
        , n1Fore            :   "(N+1) Fore"
        , n2ActlOn          :   "(N+2) Actl ON"
        , n2ActlOff         :   "(N+2) Actl OF"
        , n2ActlFore        :   "(N+2) Fore"
        , n3ActlOn          :   "(N+3) Actl ON"
        , n3ActlOff         :   "(N+3) Actl OF"
        , n3Fore            :   "(N+3) Fore"
        , offRateCalc       :   "Off rate (Calc)"
        , onRateCalc        :   "On Rate (Calc)"
    };
    //console.log('Load DM Data started');
    var text = '';
    var jsonObj = req.body.result;
    var user = req.session.user_profile;
    console.log('Parsed sheet -- '+ JSON.stringify(jsonObj));

    //CRE
    if( typeof jsonObj[dmExcelColumnNames.pbm]== 'undefined' || jsonObj[dmExcelColumnNames.pbm]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+'CRE Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM Invalid'});
    }
    //SUB-CRE
    if( typeof jsonObj[dmExcelColumnNames.pbm1]== 'undefined' || jsonObj[dmExcelColumnNames.pbm1]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+'PBM-1 Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM-1 Invalid'});
    }
    //AD Manager
    if( typeof jsonObj[dmExcelColumnNames.pbm2]== 'undefined' || jsonObj[dmExcelColumnNames.pbm2]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Resource Manager Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM-2 Invalid'});
    }
    //PM Code
    if( typeof jsonObj[dmExcelColumnNames.projectCode]== 'undefined' || jsonObj[dmExcelColumnNames.projectCode]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Project Code Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Project Code Invalid'});
    }
    //Purchase Order
    if( typeof jsonObj[dmExcelColumnNames.po]== 'undefined' || jsonObj[dmExcelColumnNames.po]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' WO:PO # Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Purchase Order Invalid'});
    }
    //Work Order
    if( typeof jsonObj[dmExcelColumnNames.msow]== 'undefined' || jsonObj[dmExcelColumnNames.msow]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Work Order Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Work Order Invalid'});
    }
    //PDAD
    /*if( typeof jsonObj["PDAD"]== 'undefined' || jsonObj["PDAD"]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' PDAD Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PDAD Invalid'});
    }*/

    ProjectMapping.aggregate([
        {
            $match: {
                'projectMap.pbm': jsonObj[dmExcelColumnNames.pbm]
                , 'projectMap.pbm1': jsonObj[dmExcelColumnNames.pbm1]
                , 'projectMap.pbm2': jsonObj[dmExcelColumnNames.pbm2]
                //, 'projectMap.projectCode': jsonObj["Project Code"]
            }
        },
        {
            $project: {
                'pbm': '$projectMap.pbm',
                'pbm1': '$projectMap.pbm1',
                'pbm2': '$projectMap.pbm2',
                'pmCode': '$projectMap.projectCode',
                'portfolio':'$projectMap.portfolio',
                _id: 0
            }
        },
        {
            $sort: {
                pbm: 1
            }
        }], subFetchDetailsFromProjectMapping);

    function subFetchDetailsFromProjectMapping(err, projectMapData){
        console.log('-----------------------------------------------');
        if (!err){
            //console.log('ProjectMappingDetails length=' + data.length);
            //console.log('ProjectMappingDetails - '+JSON.stringify(data));
            var x = -1;
            for(var z=0; z < projectMapData.length; z++){
                if(projectMapData[z].pmCode== jsonObj[dmExcelColumnNames.projectCode]){
                    x = z;
                    break;
                }else if(jsonObj[dmExcelColumnNames.projectCode].toString().toLowerCase() == 'na'){
                    x = z;
                    break;
                }
            }
            if(x < 0){
                console.log('Match not found for key and inserting values from sheet');
                text = 'Row '+jsonObj.item+' Ignored : Invalid Project Mapping Key : Please check it';
                return res.json(500,{
                    statusMsg:text
                });
                //res.json(500,{'statusMsg':'Message 1'});
            }
            var DMDataMap1 = new DmDataMap({
                dmKey : {
                    reportingMonth:{
                        month : jsonObj.reportingMonth.month,
                        year : jsonObj.reportingMonth.year
                    },
                    portfolio :projectMapData[x].portfolio,
                    pbm : jsonObj[dmExcelColumnNames.pbm],
                    pbm1 : jsonObj[dmExcelColumnNames.pbm1],
                    pbm2 : jsonObj[dmExcelColumnNames.pbm2],
                    pmCode : jsonObj[dmExcelColumnNames.projectCode],
                    purchaseOrder: {
                        sow : jsonObj[dmExcelColumnNames.po],
                        wo : jsonObj[dmExcelColumnNames.msow],
                        pdad : jsonObj[dmExcelColumnNames.pdad]
                    }
                },
                auditLog : {
                    createdUserId : user.username,
                    lastUpdatedUserId : user.username,
                    createdTime : moment.utc().local(),
                    lastUpdatedTime : moment.utc().local()
                }
            });
            DMDataMap1.projectInfo.businessArea = jsonObj[dmExcelColumnNames.businessArea];
            DMDataMap1.projectInfo.projectName=jsonObj[dmExcelColumnNames.projectName];

            if(isNaN(parseFloat(jsonObj[dmExcelColumnNames.offRateCalc]))
                || isNaN(parseFloat(jsonObj[dmExcelColumnNames.onRateCalc]))){
                //console.log('Invalid Record - Ignored to prevent further errors.');
                //res.json(500,{statusMsg:'Row '+jsonObj.item+' Ignored : Invalid Record : Ignored to prevent junk load. Please check format N, N+1, N+2, N+3'});
                text = 'Row '+jsonObj.item+' Ignored : Invalid Onshore or Offshore Calc : Ignored ';
                return res.json(500,{
                    statusMsg:text
                });
            }

            DMDataMap1.OffRate_Calc=parseFloat(jsonObj[dmExcelColumnNames.offRateCalc]);
            DMDataMap1.OnRate_Calc=parseFloat(jsonObj[dmExcelColumnNames.onRateCalc]);

            if((typeof jsonObj[dmExcelColumnNames.nActlOn] == 'undefined' || jsonObj[dmExcelColumnNames.nActlOn] == null || jsonObj[dmExcelColumnNames.nActlOn] == '')
                && (typeof jsonObj[dmExcelColumnNames.nActlOff] == 'undefined' || jsonObj[dmExcelColumnNames.nActlOff] == null || jsonObj[dmExcelColumnNames.nActlOff] == '')
                && (typeof jsonObj[dmExcelColumnNames.n1ActlOn] == 'undefined' || jsonObj[dmExcelColumnNames.n1ActlOn] == null || jsonObj[dmExcelColumnNames.n1ActlOn] == '')
                && (typeof jsonObj[dmExcelColumnNames.n1ActlOff] == 'undefined' || jsonObj[dmExcelColumnNames.n1ActlOff] == null || jsonObj[dmExcelColumnNames.n1ActlOff] == '')
                && (typeof jsonObj[dmExcelColumnNames.n2ActlOn] == 'undefined' || jsonObj[dmExcelColumnNames.n2ActlOn] == null || jsonObj[dmExcelColumnNames.n2ActlOn] == '')
                && (typeof jsonObj[dmExcelColumnNames.n2ActlOff] == 'undefined' || jsonObj[dmExcelColumnNames.n2ActlOff] == null || jsonObj[dmExcelColumnNames.n2ActlOff] == '')
                && (typeof jsonObj[dmExcelColumnNames.n3ActlOn] == 'undefined' || jsonObj[dmExcelColumnNames.n3ActlOn] == null || jsonObj[dmExcelColumnNames.n3ActlOn] == '')
                && (typeof jsonObj[dmExcelColumnNames.n3ActlOff] == 'undefined' || jsonObj[dmExcelColumnNames.n3ActlOff] == null || jsonObj[dmExcelColumnNames.n3ActlOff] == '')){
                //console.log('Blank Record - Ignored to prevent further errors.');
                //res.json(500,{statusMsg:'Row '+jsonObj.item+' Ignored : Blank Record : Ignored to prevent junk load. Please check N, N+1, N+2, N+3'});
                text = 'Row '+jsonObj.item+' Check Demand';
                return res.json(500,{
                    statusMsg:text
                });
            }

            /*if(isNaN(parseFloat(jsonObj["(N) Actl ON"])) || isNaN(parseFloat(jsonObj["(N) Actl OFF"]))
                || isNaN(parseFloat(jsonObj["(N+1) Actl ON"])) || isNaN(parseFloat(jsonObj["(N+1) Actl OFF"]))
                || isNaN(parseFloat(jsonObj["(N+2) Actl ON"])) || isNaN(parseFloat(jsonObj["(N+2) Actl OFF"]))
                || isNaN(parseFloat(jsonObj["(N+3) Actl ON"])) || isNaN(parseFloat(jsonObj["(N+3) Actl OFF"]))){
                //console.log('Invalid Record - Ignored to prevent further errors.');
                //res.json(500,{statusMsg:'Row '+jsonObj.item+' Ignored : Invalid Record : Ignored to prevent junk load. Please check format N, N+1, N+2, N+3'});
                text = 'Row '+jsonObj.item+' Ignored : Invalid Record : Ignored to prevent junk load. Please check format N, N+1, N+2, N+3';
                return res.json(500,{
                    statusMsg:text
                });
            }*/

            DMDataMap1.demandForecast = [];
            var nForecast = {};
            var temp = moment.utc([jsonObj.reportingMonth.year, jsonObj.reportingMonth.month - 1, 1]);
            nForecast.year = temp.get('year');
            nForecast.month = temp.get('month') + 1;
            //nForecast.year = jsonObj.reportingMonth.year;
            //nForecast.month = jsonObj.reportingMonth.month;

            if(typeof jsonObj[dmExcelColumnNames.nActlOn] =='undefined' || jsonObj[dmExcelColumnNames.nActlOn] == null){
                nForecast.actualOnshore = 0;
            }else{
                nForecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames.nActlOn].removeComma());
            }
            if(typeof jsonObj[dmExcelColumnNames.nActlOff] =='undefined' || jsonObj[dmExcelColumnNames.nActlOff] == null){
                nForecast.actualOffshore = 0;
            }else{
                nForecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames.nActlOff].removeComma());
            }

            //nForecast.actualForecast = parseFloat(jsonObj["(N)Act $"]);
            nForecast.actualForecast = 0;
            nForecast.actualForecast += DMDataMap1.OnRate_Calc*nForecast.actualOnshore;
            nForecast.actualForecast += DMDataMap1.OffRate_Calc*nForecast.actualOffshore;
            DMDataMap1.demandForecast.push(nForecast);
            console.log('Month demand n -- '+ JSON.stringify(nForecast));

            var n1Forecast = {};
            temp.add('months',1);
            n1Forecast.year = moment.utc(temp).get('year');
            n1Forecast.month = moment.utc(temp).get('month') + 1;

            //n1Forecast.month = 'March';
            if(typeof jsonObj[dmExcelColumnNames.n1ActlOn] =='undefined' || jsonObj[dmExcelColumnNames.n1ActlOn] == null){
                n1Forecast.actualOnshore = 0;
            }else{
                n1Forecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames.n1ActlOn].removeComma());
            }
            if(typeof jsonObj[dmExcelColumnNames.n1ActlOff] =='undefined' || jsonObj[dmExcelColumnNames.n1ActlOff] == null){
                n1Forecast.actualOffshore = 0;
            }else{
                n1Forecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames.n1ActlOff].removeComma());
            }

            //n1Forecast.actualForecast = parseFloat(jsonObj["(N+1) Fore"]);
            n1Forecast.actualForecast = 0;
            n1Forecast.actualForecast += DMDataMap1.OnRate_Calc*n1Forecast.actualOnshore;
            n1Forecast.actualForecast += DMDataMap1.OffRate_Calc*n1Forecast.actualOffshore;
            DMDataMap1.demandForecast.push(n1Forecast);
            console.log('Month demand n+1 -- '+ JSON.stringify(n1Forecast));

            var n2Forecast = {};
            //temp = moment.utc([jsonObj.reportingMonth.year, jsonObj.reportingMonth.month, 1]).add('months',2);
            temp.add('months',1);
            n2Forecast.year = moment.utc(temp).get('year');
            n2Forecast.month = moment.utc(temp).get('month') + 1;

            if(typeof jsonObj[dmExcelColumnNames.n2ActlOn] =='undefined' || jsonObj[dmExcelColumnNames.n2ActlOn] == null){
                n2Forecast.actualOnshore = 0;
            }else{
                n2Forecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames.n2ActlOn].removeComma());
            }
            if(typeof jsonObj[dmExcelColumnNames.n2ActlOff] =='undefined' || jsonObj[dmExcelColumnNames.n2ActlOff] == null){
                n2Forecast.actualOffshore = 0;
            }else{
                n2Forecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames.n2ActlOff].removeComma());
            }
            //n2Forecast.actualForecast = parseFloat(jsonObj["(N+2) Fore"]);
            n2Forecast.actualForecast = 0;
            n2Forecast.actualForecast += DMDataMap1.OnRate_Calc*n2Forecast.actualOnshore;
            n2Forecast.actualForecast += DMDataMap1.OffRate_Calc*n2Forecast.actualOffshore;
            DMDataMap1.demandForecast.push(n2Forecast);
            console.log('Month demand n+2 -- '+ JSON.stringify(n2Forecast));

            var n3Forecast = {};
            //temp = moment.utc([jsonObj.reportingMonth.year, jsonObj.reportingMonth.month, 1]).add('months',3);
            temp.add('months',1);
            n3Forecast.year = moment.utc(temp).get('year');
            n3Forecast.month = moment.utc(temp).get('month') + 1;
            if(typeof jsonObj[dmExcelColumnNames.n3ActlOn] =='undefined' || jsonObj[dmExcelColumnNames.n3ActlOn] == null){
                n3Forecast.actualOnshore = 0;
            }else{
                n3Forecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames.n3ActlOn].removeComma());
            }
            if(typeof jsonObj[dmExcelColumnNames.n3ActlOff] =='undefined' || jsonObj[dmExcelColumnNames.n3ActlOff] == null){
                n3Forecast.actualOffshore = 0;
            }else{
                n3Forecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames.n3ActlOff].removeComma());
            }

            //n3Forecast.actualForecast = parseFloat(jsonObj["(N+3) Fore"]);
            n3Forecast.actualForecast = 0;
            n3Forecast.actualForecast += DMDataMap1.OnRate_Calc*n3Forecast.actualOnshore;
            n3Forecast.actualForecast += DMDataMap1.OffRate_Calc*n3Forecast.actualOffshore;
            DMDataMap1.demandForecast.push(n3Forecast);
            console.log('DM to store -- '+ JSON.stringify(DMDataMap1));

            DMDataMap1.save(subUploadDMExcelSave);

            function subUploadDMExcelSave(err1){
                if(err1){
                    console.log('DmDataMap save failed - '+err1);
                    var errorText = '';
                    if( (11000 === err1.code || 11001 === err1.code) ){
                        errorText = 'Row '+jsonObj.item+' DUe to Unique Constraint. Please validate PBM/ PBM-1/ PBM-2/ PDAD/ Project Code';
                    }else{
                        errorText = 'Row '+jsonObj.item+' Errored out : '+err1;
                    }
                    return res.json(500,{
                        statusMsg:errorText
                    });
                    //res.json(500,{'statusMsg':'Message 5'});
                }else{
                    console.log('DmDataMap Item '+jsonObj.item+' saved : '+JSON.stringify(DMDataMap1));
                    return res.json(200,{
                        item:jsonObj.item
                    });
                }
            }
        }
        else{
            //var jsonResponse = {'errMsg' : 'ProjectMappingDetails!'+err};
            return res.json(500, {'statusMsg' : 'Row '+jsonObj.item+' ProjectMappingDetails Fetch Errored out - '+err});
        }
    }
};

exports.removeDMRelease = function(req, res){
    DmReleaseData.remove(subRemoveDMRelease);

    function subRemoveDMRelease(err1){
        if(err1){
            console.log('DmDataReleaseMap Remove failed - '+err1);
            var errorText = 'DmDataReleaseMap Remove Errored out : '+err1;
            return res.json(500,{
                statusMsg:errorText
            });
            //res.json(500,{'statusMsg':'Message 5'});
        }else{
            console.log('DmDataReleaseMap Success');
            return res.json(200,"success");
        }
    }
    console.log("removeDMReleaseeeeeeee");
};

exports.uploadDMReleaseExcel=function(req,res){

    var text = '';
    var jsonObj = req.body.result;
    var user = req.session.user_profile;
    console.log('Parsed sheet -- '+ JSON.stringify(jsonObj));

    var selectedDate = {
        month : jsonObj.reportingMonth.month - 1,
        year : jsonObj.reportingMonth.year
    };
    var excelDate = {
        month:selectedDate.month,
        year:selectedDate.year
    };
    var dmExcelColumnNames = {
        pbm                 :   "WO:PBM"
        , pbm1              :   "PBM1"
        , pbm2              :   "Resource Manager"
        , po                :   "WO:PO#"
        , msow              :   "WO:MSOW#"
        , wo                :   "WO"
        , pdad              :   "PDAD"
        , portfolio         :   "Portfolio"
        , projectCode       :   "Project Code"
        , businessArea      :   "Project Code:Business Area"
        , projectName       :   "Project Code:Project Name"
    };

    var testDate = moment.utc([selectedDate.year]);
    for(var i=0;i<12;i++){
        var testOffShoreActual = testDate.format('YY MMM')+ " Hr Actl Off";
        dmExcelColumnNames["n"+i+"ActlOn"]  = testDate.format('YY MMM')+ " Hr Actl On";
        dmExcelColumnNames["n"+i+"ActlOff"] = testDate.format('YY MMM')+ " Hr Actl Off";
        dmExcelColumnNames["n"+i+"DemandOn"]  = testDate.format('YY MMM')+ " On";
        dmExcelColumnNames["n"+i+"DemandOff"]  = testDate.format('YY MMM')+ " Off";
        testDate.add("months", 1);
    }

    console.log("Modified dmExcelColumnNames: "+JSON.stringify(dmExcelColumnNames));

    //CRE
    if( typeof jsonObj[dmExcelColumnNames.pbm]== 'undefined' || jsonObj[dmExcelColumnNames.pbm]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+'CRE Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM Invalid'});
    }
    //SUB-CRE
    if( typeof jsonObj[dmExcelColumnNames.pbm1]== 'undefined' || jsonObj[dmExcelColumnNames.pbm1]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+'PBM-1 Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM-1 Invalid'});
    }
    //AD Manager
    if( typeof jsonObj[dmExcelColumnNames.pbm2]== 'undefined' || jsonObj[dmExcelColumnNames.pbm2]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Resource Manager Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PBM-2 Invalid'});
    }
    //PM Code
    if( typeof jsonObj[dmExcelColumnNames.projectCode]== 'undefined' || jsonObj[dmExcelColumnNames.projectCode]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Project Code Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Project Code Invalid'});
    }
    //Purchase Order
    if( typeof jsonObj[dmExcelColumnNames.po]== 'undefined' || jsonObj[dmExcelColumnNames.po]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' WO:PO # Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Purchase Order Invalid'});
    }
    //Work Order
    if( typeof jsonObj[dmExcelColumnNames.msow]== 'undefined' || jsonObj[dmExcelColumnNames.msow]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Work Order Not available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Work Order Invalid'});
    }
  /*  if( typeof jsonObj[dmExcelColumnNames.portfolio]== 'undefined' || jsonObj[dmExcelColumnNames.portfolio]==null){
        console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' Portfolio not  available');
        return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' Portfolio Invalid'});
    }*/
    //PDAD
    /*if( typeof jsonObj["PDAD"]== 'undefined' || jsonObj["PDAD"]==null){
     console.log(jsonObj['item']+' - '+'Item '+(jsonObj.item)+' PDAD Not available');
     return res.json(500, {'statusMsg' : 'Item '+(jsonObj.item)+' PDAD Invalid'});
     }*/

    ProjectMappingRelease.aggregate([
        {
            $match: {
                'projectMapSummary.pbm': jsonObj[dmExcelColumnNames.pbm]
                , 'projectMapSummary.pbm1': jsonObj[dmExcelColumnNames.pbm1]
                , 'projectMapSummary.pbm2': jsonObj[dmExcelColumnNames.pbm2]
                , 'projectMapSummary.projectCode': jsonObj[dmExcelColumnNames.projectCode]
            }
        },
        {
            $project: {
                'pbm': '$projectMapSummary.pbm',
                'pbm1': '$projectMapSummary.pbm1',
                'pbm2': '$projectMapSummary.pbm2',
                'pmCode': '$projectMapSummary.projectCode',
                'portfolio':'$projectMapSummary.portfolio',
                _id: 0
            }
        },
        {
            $sort: {
                pbm: 1
            }
        }], subFetchDetailsFromProjectMapping);
  /*  subFetchDetailsFromProjectMapping(false, {});*/
    function subFetchDetailsFromProjectMapping(err, projectMapData){
        //console.log('-----------------------------------------------');
        if (!err){
            console.log("Details fetched for project Mapping-------->"+projectMapData);
            var x = -1;
            for(var z=0; z < projectMapData.length; z++){
                if(projectMapData[z].pmCode== jsonObj[dmExcelColumnNames.projectCode]){
                    x = z;
                    break;
                }else if(jsonObj[dmExcelColumnNames.projectCode].toString().toLowerCase() == 'na'){
                    x = z;
                    break;
                }
            }
            if(x < 0){
                console.log('Match not found for key and inserting values from sheet');
                text = 'Row '+jsonObj.item+' Ignored : Invalid Project Mapping Key : Please check it';
                return res.json(500,{
                    statusMsg:text
                });
                //res.json(500,{'statusMsg':'Message 1'});
            }

            var DMDataRelease = new DmReleaseData({
                dmReleaseKey : {
                    //portfolio :projectMapData[x].portfolio,
                    pbm : jsonObj[dmExcelColumnNames.pbm],
                    pbm1 : projectMapData[x].pbm1,
                    pbm2 : jsonObj[dmExcelColumnNames.pbm2],
                    portfolio :projectMapData[x].portfolio,
                    pmCode : jsonObj[dmExcelColumnNames.projectCode]
                },
                purchaseOrder: {
                    sow : jsonObj[dmExcelColumnNames.po],
                    wo : jsonObj[dmExcelColumnNames.msow],
                    pdad : jsonObj[dmExcelColumnNames.pdad]
                },
                projectInfo: {
                    businessArea : jsonObj[dmExcelColumnNames.businessArea],
                    projectName : jsonObj[dmExcelColumnNames.projectName]
                },
                auditLog : {
                    createdUserId : user.username,
                    lastUpdatedUserId : user.username,
                    createdTime : moment.utc().local(),
                    lastUpdatedTime : moment.utc().local()
                }
            });
            console.log("DM Data to start with: "+JSON.stringify(DMDataRelease));

            var testRpt = {
                "year" : jsonObj.reportingMonth.year,
                "month" : jsonObj.reportingMonth.month - 1
            };

            var screenReportingMonth = {
                "year" : jsonObj.reportingMonth.year,
                "month" : jsonObj.reportingMonth.month - 1
            };
            var actualToTrackDate = moment.utc([screenReportingMonth.year, screenReportingMonth.month]);

            for(var i=0;i<12;i++){
                var testForecast = {};
                var processingReportingMonth = {
                    "year" : jsonObj.reportingMonth.year,
                    "month" : i
                };
                var processingDate = moment.utc([processingReportingMonth.year, processingReportingMonth.month]);
                var isBeforeFlag = processingDate.isBefore(actualToTrackDate);
                var isSameFlag = processingDate.isSame(actualToTrackDate);
                if(isBeforeFlag || isSameFlag){
                    testForecast.year=processingReportingMonth.year;
                    testForecast.month=processingReportingMonth.month+1;
                    if(typeof jsonObj[dmExcelColumnNames["n"+i+"ActlOn"]] != "undefined" && jsonObj[dmExcelColumnNames["n"+i+"ActlOn"]] != null){
                        testForecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames["n"+i+"ActlOn"]].removeComma());
                    }else{
                        testForecast.actualOnshore = 0;
                    }
                    if(typeof jsonObj[dmExcelColumnNames["n"+i+"ActlOff"]] != "undefined" && jsonObj[dmExcelColumnNames["n"+i+"ActlOff"]] != null){
                        testForecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames["n"+i+"ActlOff"]].removeComma());
                    }else{
                        testForecast.actualOffshore = 0;
                    }
                }else{
                    testForecast.year=processingReportingMonth.year;
                    testForecast.month=processingReportingMonth.month +1;
                    if(typeof jsonObj[dmExcelColumnNames["n"+i+"DemandOn"]] != "undefined" && jsonObj[dmExcelColumnNames["n"+i+"DemandOn"]] != null){
                        testForecast.actualOnshore = parseFloat(jsonObj[dmExcelColumnNames["n"+i+"DemandOn"]].removeComma());
                    }else{
                        testForecast.actualOnshore = 0;
                    }
                    if(typeof jsonObj[dmExcelColumnNames["n"+i+"DemandOff"]] != "undefined" && jsonObj[dmExcelColumnNames["n"+i+"DemandOff"]] != null){
                        testForecast.actualOffshore = parseFloat(jsonObj[dmExcelColumnNames["n"+i+"DemandOff"]].removeComma());
                    }else{
                        testForecast.actualOffshore = 0;
                    }
                }
                console.log("Push Test Forecast: "+JSON.stringify(testForecast));
                DMDataRelease.demandForecast.push(testForecast);
            }

            testRpt.month = testRpt.month - 1;
            console.log("DM Data Prepared: "+JSON.stringify(DMDataRelease));
           // return res.json(200, DMDataMap1);

            DMDataRelease.save(subUploadDMExcelSave);

            function subUploadDMExcelSave(err1){
                if(err1){
                    console.log('DmDataMap save failed - '+err1);
                    var errorText = '';
                    if( (11000 === err1.code || 11001 === err1.code) ){
                        errorText = 'Row '+jsonObj.item+' DUe to Unique Constraint. Please validate PBM/ PBM-1/ PBM-2/ PDAD/ Project Code';
                    }else{
                        errorText = 'Row '+jsonObj.item+' Errored out : '+err1;
                    }
                    return res.json(500,{
                        statusMsg:errorText
                    });
                    //res.json(500,{'statusMsg':'Message 5'});
                }else{
                    console.log('DmDataMap Item '+jsonObj.item+' saved : '+JSON.stringify(DMDataRelease));
                    return res.json(200,{
                        item:jsonObj.item
                    });
                }
            }
        }
        else{
            //var jsonResponse = {'errMsg' : 'ProjectMappingDetails!'+err};
            return res.json(500, {'statusMsg' : 'Row '+jsonObj.item+' ProjectMappingDetails Fetch Errored out - '+err});
        }
    }
};

exports.uploadDMExcelFileUpload=function(req,res){
    console.log('Temp shutdown service');
    var user = req.session.user_profile;
    res.json(200, {statusMsg : 'Data Successfully Inserted'});
};
/*exports.uploadDMExcelFileUpload=function(req,res){
 console.log('Load DM Data Data started');
 var jsonObj = req.body.result;
 console.log('Parsed sheet -- '+ JSON.stringify(jsonObj));
 var parsedSheet = jsonObj;
 DmDataMap.find({}, subUploadDMExcelFileUpload);

 function subUploadDMExcelFileUpload(err2, doc) {
 if (!err2) {
 console.log('Demand Data load  - '+JSON.stringify(doc));
 for(var i=1;i<jsonObj.length;i++){
 console.log('Demand Data load to be loaded with index '+i+' - '+JSON.stringify(jsonObj[i]));
 var DMDataMap1 = new DmDataMap();
 DMDataMap1.pbm = jsonObj[i][0];
 DMDataMap1.pbm1 = jsonObj[i][1];
 DMDataMap1.pbm2 = jsonObj[i][2];
 DMDataMap1.PO = jsonObj[i][3];
 DMDataMap1.MSOW = jsonObj[i][4];
 DMDataMap1.WO = jsonObj[i][5];
 DMDataMap1.PDAD = jsonObj[i][6];
 DMDataMap1.ProjectCode = jsonObj[i][7];
 DMDataMap1.BusinessArea = jsonObj[i][8];
 DMDataMap1.ProjectName=jsonObj[i][9];
 DMDataMap1.Reporting_Date.Reporting_Month=jsonObj[i][10];
 DMDataMap1.Reporting_Date.Reporting_Year='2014';
 DMDataMap1.demandForecast = [];
 var nForecast = {};
 nForecast.year = 2014;
 nForecast.month = 'February';
 nForecast.actualOnshore = jsonObj[i][11];
 nForecast.actualOffshore = jsonObj[i][12];
 nForecast.actualForecast = jsonObj[i][13];
 DMDataMap1.demandForecast.push(nForecast);
 var n1Forecast = {};
 n1Forecast.year = 2014;
 n1Forecast.month = 'March';
 n1Forecast.actualOnshore = jsonObj[i][14];
 n1Forecast.actualOffshore = jsonObj[i][15];
 n1Forecast.actualForecast = jsonObj[i][16];
 DMDataMap1.demandForecast.push(n1Forecast);
 var n2Forecast = {};
 n2Forecast.year = 2014;
 n2Forecast.month = 'April';
 n2Forecast.actualOnshore = jsonObj[i][17];
 n2Forecast.actualOffshore = jsonObj[i][18];
 n2Forecast.actualForecast = jsonObj[i][19];
 DMDataMap1.demandForecast.push(n2Forecast);
 var n3Forecast = {};
 n3Forecast.year = 2014;
 n3Forecast.month = 'May';
 n3Forecast.actualOnshore = jsonObj[i][20];
 n3Forecast.actualOffshore = jsonObj[i][21];
 n3Forecast.actualForecast = jsonObj[i][22];
 DMDataMap1.demandForecast.push(n3Forecast);

 DMDataMap1.OffRate_Calc=jsonObj[i][23];
 DMDataMap1.OnRate_Calc=jsonObj[i][24];
 DMDataMap1.save(subUploadDMExcelFileUploadSave);

 function subUploadDMExcelFileUploadSave(err3){
 if(err3){
 console.log('Demand Data Save failed for JSON - '+JSON.stringify(DMDataMap1)+ ' - Error' +err3);
 }
 else{
 //console.log('Demand Data Save Success for JSON - '+JSON.stringify(DMDataMap1));
 }
 }
 }
 }else{
 console.log('error in dbb');
 }
 }
 res.json(200, {statusMsg : 'Data Successfully Inserted'});
 }*/

exports.uploadPDAD = function (req, res) {
    var xlsx = XLSX.readFile('D:/07.Build2.0/UPLOAD/PDAD.xlsx');
    var sheet_name_list = xlsx.SheetNames;
    var user = req.session.user_profile;
    console.log('Sheets available.....'+JSON.stringify(sheet_name_list));

    Contract.remove(subUploadPDAD);

    function subUploadPDAD(err){
        if(!err){
            console.log('Removed all rows from PDAD List.....' );
            xlsx.SheetNames.forEach(function(y) {
                var parsedSheet = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[sheet_name_list[0]]);
                console.log('Parsed sheet -- '+ JSON.stringify(parsedSheet));

                for(i in parsedSheet){
                    var jsonObj = parsedSheet[i];
                    console.log('Loading PDAD : '+JSON.stringify(jsonObj));
                    if(!moment(jsonObj["End Date"],'MM/DD/YYYY').isValid()){
                        console.log('Skipping row due to invalid date format - Expected MM/DD/YYYY : '+JSON.stringify(jsonObj));
                        continue;
                    }
                    var releaseDate = moment(jsonObj["End Date"],'MM/DD/YYYY');
                    var pdad = new Contract({
                        _id : {
                            businessUnit : jsonObj["Business Unit"],
                            pbm : jsonObj.PBM,
                            pbm1 : jsonObj.PBM1,
                            pbm2 : jsonObj.PBM2,
                            portfolio : jsonObj.PORTFOLIO,
                            purchaseOrder : {
                                sow : jsonObj['SOW#'],
                                wo : jsonObj['WO#'],
                                pdad : jsonObj['PDAD#']
                            }
                        },
                        releaseDate : releaseDate,
                        auditLog : {
                            createdUserId : user.username,
                            lastUpdatedUserId : user.username,
                            createdTime : moment.utc().local(),
                            lastUpdatedTime : moment.utc().local()
                        }
                    });
                    console.log('PDAD List to be loaded: '+JSON.stringify(pdad));
                    pdad.save(subUploadPDADSave);

                    function subUploadPDADSave(err1){
                        if(err1){
                            console.log('PDAD save failed - '+err1);
                            res.json(500, {statusMsg:'PDAD save failed and stopping load - '+err1});
                        }
                    }
                }
            });
        }else{
            console.log('PDAD remove all failed');
            res.json(500, {statusMsg:'PDAD remove all failed - '+err});
        }
    }
    res.json(200, {statusMsg:'PDAD Load Success '});
};

exports.uploadEAI = function (req, res) {
    var xlsx = XLSX.readFile('D:/07.Build2.0/UPLOAD/ApplicationList.xlsx');
    var sheet_name_list = xlsx.SheetNames;
    var user = req.session.user_profile;
    console.log('Sheets available.....'+JSON.stringify(sheet_name_list));

    Application.remove(subUploadEAI);

    function subUploadEAI(err){
        if(!err){
            console.log('Removed all rows from Application List.....' );
            xlsx.SheetNames.forEach(function(y) {
                var parsedSheet = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[sheet_name_list[0]]);
                console.log('Parsed sheet -- '+ JSON.stringify(parsedSheet));

                for(i in parsedSheet){
                    var jsonObj = parsedSheet[i];
                    var eai = parseInt(jsonObj.EAI);
                    if(eai == null || eai < 1){
                        res.json(500, {statusMsg:'Please correct the input - Application save for - '+JSON.stringify(jsonObj)});
                    }

                    var application = new Application({
                        eaiId : eai,
                        applicationList : [],
                        auditLog : {
                            createdUserId : user.username,
                            lastUpdatedUserId : user.username,
                            createdTime : moment.utc().local(),
                            lastUpdatedTime : moment.utc().local()
                        }
                    });
                    var test = jsonObj.Applications;
                    var applications = test.split(',');
                    console.log('Application List to be loaded: '+JSON.stringify(applications));
                    if(applications.length < 1){
                        res.json(500, {statusMsg:'Please correct the input - ApplicationList is empty for - '+JSON.stringify(jsonObj)});
                    }
                    for(var x=0;x<applications.length;x++){
                        application.applicationList.push(applications[x].trim());
                    }
                    console.log('EAI - Application List to be loaded: '+JSON.stringify(application));
                    application.save(subUploadEAISave);

                    function subUploadEAISave(err1){
                        if(err1){
                            console.log('Application save failed - '+err1);
                            res.json(500, {statusMsg:'Application save failed - '+err1});
                        }
                    }
                }
            });
        }else{
            console.log('ApplicationList remove all failed');
            res.json(500, {statusMsg:'ApplicationList remove all failed - '+err});
        }
    }
    res.json(200, {statusMsg:'ApplicationList Load Success '});
};

exports.extractReportingMonth = function(req,res){

    var collectionName = req.body.collectionName;
    var sessionBU = req.session.bu_filter;
    console.log('Inside extractReportingMonth with input - '+req.body.collectionName);
    console.log('Inside extractReportingMonth with BU Filter  - '+sessionBU);

    var buFilter = {};
    if(collectionName == "PHS"){
        buFilter = {
            'phsKey.contract.businessUnit': {
                "$in" : sessionBU
            }
        };
        PHS.distinct("phsKey.reportingMonth", buFilter, loadReportingMonth);
    }else if(collectionName == "CCAPData"){
        /*buFilter = {
            'ccapKey.businessUnit': {
                "$in" : sessionBU
            }
        };*/
        CCAPData.distinct("ccapKey.reportingMonth", buFilter, loadReportingMonth);
    }else if(collectionName == "PCMData"){
        /*buFilter = {
            'pcmKey.businessUnit': {
                "$in" : sessionBU
            }
        };*/
        PCMData.distinct("pcmKey.reportingMonth", buFilter, loadReportingMonth);
    }else if(collectionName == "PCM"){
        /*buFilter = {
            'pcmKey.businessUnit': {
                "$in" : sessionBU
            }
        };*/
        PCM.distinct("pcmKey.reportingMonth", buFilter, loadReportingMonth);
    }else if(collectionName == "DMData"){
        /*buFilter = {
            'dmKey.businessUnit': {
                "$in" : sessionBU
            }
        };*/
        DMData.distinct("dmKey.reportingMonth", buFilter, loadReportingMonth);
    }

    function loadReportingMonth(err, data){
        if(err){
            console.log('Error with extractReportingMonth - '+JSON.stringify(err));
            res.json(500, err);
        }else{
            var output = [];
            console.log('Fetched data for extractReportingMonth - '+JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var reportingMonthJson = data[i];
                //reportingMonthJson.year = currentDt.get('year');
                //reportingMonthJson.month = currentDt.get('month') + 1;
                var momentDt = moment([reportingMonthJson.year, reportingMonthJson.month - 1]).utc().local();
                reportingMonthJson.formattedDate = momentDt.format("MMMM YYYY");
                //console.log ('Reporting Month to be loaded -> '+JSON.stringify(reportingMonthJson));
                output.push(reportingMonthJson);
            }
            console.log('Response for extractReportingMonth before sort - '+JSON.stringify(output));
            var response = _.sortBy(output, ["year", "month"]);
            console.log('Response for extractReportingMonth - '+JSON.stringify(response));
            res.json(200, response);
        }
    }
    //console.log ('MetaDataSetup Route Loaded Reporting Month -> '+JSON.stringify(docs));

};

exports.extractPdadModifiedMonth = function(req,res){

    var collectionName = req.body.collectionName;
    var sessionBU = req.session.bu_filter;
    console.log('Inside extractPdadModifiedMonth with input - '+req.body.collectionName);
    console.log('Inside extractPdadModifiedMonth with BU Filter  - '+sessionBU);

    var buFilter = {};
    if(collectionName == "Contract"){
        buFilter = {
            'contractKey.businessUnit': {
                "$in" : sessionBU
            }
        };
        Contract.distinct("pdadChangeHistory.modifiedReportingMonth", buFilter, loadReportingMonth);
    }else{
        res.json(500, {"statusMsg" : "Only Contract collection applicable for Modified Reporting month filter"});
    }

    function loadReportingMonth(err, data){
        if(err){
            console.log('Error with extractPdadModifiedMonth - '+JSON.stringify(err));
            res.json(500, err);
        }else{
            var output = [];
            console.log('Fetched data for extractPdadModifiedMonth - '+JSON.stringify(data));
            for(var i=0;i<data.length;i++){
                var reportingMonthJson = data[i];
                //reportingMonthJson.year = currentDt.get('year');
                //reportingMonthJson.month = currentDt.get('month') + 1;
                var momentDt = moment([reportingMonthJson.year, reportingMonthJson.month - 1]).utc().local();
                reportingMonthJson.formattedDate = momentDt.format("MMMM YYYY");
                //console.log ('Reporting Month to be loaded -> '+JSON.stringify(reportingMonthJson));
                output.push(reportingMonthJson);
            }
            console.log('Response for extractPdadModifiedMonth before sort - '+JSON.stringify(output));
            var response = _.sortBy(output, ["year", "month"]);
            console.log('Response for extractPdadModifiedMonth - '+JSON.stringify(response));
            res.json(200, response);
        }
    }
    //console.log ('MetaDataSetup Route Loaded Reporting Month -> '+JSON.stringify(docs));

};

exports.cleanupTable = function (req, res) {

    console.log('Inside cleanupTable with input - '+req.body.collectionName);
    console.log('cleanupTable Business unit considered - '+JSON.stringify(req.session.bu_filter));
    console.log('cleanupMonth considered - '+JSON.stringify(req.body.cleanupMonth));

    var sessionBU = req.session.bu_filter;
    var filter = {};
    var statusMessage = {};
    var collectionName = req.body.collectionName;
    var cleanupMonth = req.body.cleanupMonth;

    statusMessage = {
        statusMsg : "CLEANUP of " + collectionName + " under Business Units " + req.session.bu_filter  +" completed Successfully!!!!"
    };
    var reportingMonth = null;

    if(typeof cleanupMonth == "undefined" || cleanupMonth == null || cleanupMonth.year == "undefined" || cleanupMonth.year == null){
        reportingMonth = null;
    }else{
        reportingMonth = {
            year : cleanupMonth.year,
            month : cleanupMonth.month
        };
        statusMessage = {
            statusMsg : "CLEANUP of " + collectionName + " under Business Units " + req.session.bu_filter  + " with Reporting Month filter " + reportingMonth.year + reportingMonth.month + " completed Successfully!!!!"
        };
    }

    /*console.log('Cleanup Skipped with input: '+ JSON.stringify(collectionName) + JSON.stringify(reportingMonth) + " for BU "+JSON.stringify(sessionBU));
    return res.json(200, {
        statusMsg : 'Cleanup Skipped with input: '+ JSON.stringify(collectionName) + JSON.stringify(reportingMonth) + " for BU "+JSON.stringify(sessionBU)
    });*/

    if(typeof sessionBU == 'undefined' || sessionBU == null || !Array.isArray(sessionBU) || sessionBU.length == 0){
        return res.json(500, {
            statusMsg : 'Cleanup Failed with error: '+'Invalid BU List on session'
        });
    }

    if(collectionName == "EAISetup"){
        Application.remove({},removeResult);
    }else if(collectionName == "MetMapping"){
        filter = {
            'metMap.businessUnit': {
                "$in" : sessionBU
            }
        };
        console.log('MetMapping Cleanup Filter - '+JSON.stringify(filter));
        MetMapping.remove(filter,removeResult);
    }else if(collectionName == "ProjectMapping"){
        filter = {
            'projectMap.businessUnit': {
                "$in" : sessionBU
            }
        };
        console.log('Project Mapping Cleanup Filter - '+JSON.stringify(filter));
        ProjectMapping.remove(filter,removeResult);
    }else if(collectionName == "ProjectMappingSummary"){
        filter = {
            'projectMapSummary.businessUnit': {
                "$in" : sessionBU
            }
        };
        console.log('Project Mapping Cleanup Filter - '+JSON.stringify(filter));
        ProjectMappingRelease.remove(filter,removeResult);
    }else if(collectionName == "Contract"){
        filter = {
            'contractKey.businessUnit': {
                "$in" : sessionBU
            }
        };
        console.log('Contract Cleanup Filter - '+JSON.stringify(filter));
        if(reportingMonth != null){
            var pullFilter = {};
            pullFilter["pdadChangeHistory"] = {};
            pullFilter.pdadChangeHistory.modifiedReportingMonth = {};
            pullFilter.pdadChangeHistory.modifiedReportingMonth.month = reportingMonth.month;
            pullFilter.pdadChangeHistory.modifiedReportingMonth.year = reportingMonth.year;
            Contract.update(
                filter,
                {$pull : pullFilter},
                { multi: true },
                removeResult
            );
        }else{
            Contract.remove(filter,removeResult);
        }

    }else if(collectionName == "DMData"){
        if(reportingMonth != null){
            filter["dmKey.reportingMonth.month"] = reportingMonth.month;
            filter["dmKey.reportingMonth.year"] = reportingMonth.year;
        }
        console.log('DM Cleanup Filter - '+JSON.stringify(filter));
        DmDataMap.remove(filter, removeResult);
    }else if(collectionName == "DMReleaseData"){
        console.log('DM Release Cleanup Filter - '+JSON.stringify(filter));
        DmReleaseData.remove(filter, removeResult);
    }else if(collectionName == "CCAPData"){
        if(reportingMonth != null){
            filter["ccapKey.reportingMonth.month"] = reportingMonth.month;
            filter["ccapKey.reportingMonth.year"] = reportingMonth.year;
        }
        console.log('CCAP Cleanup Filter - '+JSON.stringify(filter));
        CCAPData.remove(filter, removeResult);
    }else if(collectionName == "PCM"){
        if(reportingMonth != null){
            filter["pcmKey.reportingMonth.month"] = reportingMonth.month;
            filter["pcmKey.reportingMonth.year"] = reportingMonth.year;
        }
        console.log('PCMA Cleanup Filter - '+JSON.stringify(filter));
        PCM.remove(filter, removeResult);
    }else if(collectionName == "PCMData"){
        if(reportingMonth != null){
            filter["pcmKey.reportingMonth.month"] = reportingMonth.month;
            filter["pcmKey.reportingMonth.year"] = reportingMonth.year;
        }
        console.log('PCMR Cleanup Filter - '+JSON.stringify(filter));
        PCMData.remove(filter, removeResult);
    }else if(collectionName == "PHS"){
        filter = {
            'phsKey.contract.businessUnit': {
                "$in" : sessionBU
            }
        };
        if(reportingMonth != null){
            filter["phsKey.reportingMonth.month"] = reportingMonth.month;
            filter["phsKey.reportingMonth.year"] = reportingMonth.year;
        }
        console.log('PHS Cleanup Filter - '+JSON.stringify(filter));

        PHS.remove(filter,removeResult);
    }else {
        statusMessage = {
            statusMsg: "Invalid CLEANUP source considered of " + collectionName + " under Business Units " + req.session.bu_filter + ". Please validate with technical team!!!!"
        };
        res.json(500, {
            statusMsg : 'Cleanup Failed with error: Invalid Collection'
        });
    }

    function removeResult(err, writeResult){
        if(!err){
            console.log(collectionName + ' data Cleaned up' + " with count of rows removed - " + JSON.stringify(writeResult));
            statusMessage.statusMsg += " with count of rows removed - " + writeResult;
            res.json(200, statusMessage);
        }else{
            console.log(collectionName + ' data Clean up Failed - '+err);
            res.json(500, {
                statusMsg : 'Cleanup Failed with error: '+JSON.stringify(err)
            });
        }
    }
};

//var cp = require('child_process').spawn;
var cmd1 = require('cmd-exec').init();
//var cmd2 = require('cmd-exec').init();

exports.exportCollections = function (req, res) {

    console.log('Inside exportCollections ');
    //Server setting
    //var batchScriptPath = "D:/Server/Export/Backup/PET_Export ";
    //var mongoDir = "D:/Mongo/Mongo/mongodb/bin ";
    //var exportDir = "D:/Server/Export/Backup ";
    //Local settings
    var batchScriptPath = "D:/05.IMPAQS/MONGODB/PETNG_Bkup/PET_Export ";
    var mongoDir = "D:/05.IMPAQS/MONGODB/bin ";
    var exportDir = "D:/05.IMPAQS/MONGODB/PETNG_Bkup ";
    var directoryName = "";

    if(typeof req.session != "undefined" && typeof req.session.user_profile != "undefined" && req.session.user_profile != null){
        directoryName = req.session.user_profile.username + "_" + moment().utc().local().format("YYYY-MM-DD-HH.mm.ss ");
    }else{
        directoryName = "Scheduled_" + moment().utc().local().format("YYYY-MM-DD-HH.mm.ss ");
    }

    /*cmd1.exec("d:", function(err1, out1){
        if (err1) {
            console.log(err1.message);
            res.json(200, err1);
        } else {
            console.log(out1.message);
            cmd1.exec("dir", function(err2, out2){
                if (err2) {
                    console.log(err2.message);
                    res.json(200, err2);
                } else {
                    console.log(out2.message);
                    res.json(200, out2);
                }
            });
            //res.json(200, "Success");
        }
    });*/

    cmd1.exec("d:", function(err1, out1){
        if (err1) {
            console.log(err1.message);
            res.json(500, err1);
        } else {
            console.log(out1.message);
            cmd1.exec(batchScriptPath + mongoDir + exportDir + directoryName, function(err2, out2){
                if (err2) {
                    console.log(err2.message);
                    res.json(500, err2);
                } else {
                    console.log(out2.message);
                    var response = out2.message.split("...");
                    res.json(200, response);
                }
            });
            //res.json(200, "Success");
        }
    });

};

exports.phsBackupCopy = function (req, res) {

    console.log('Inside phsBackupCopy ');
    //Server setting
    //var batchScriptPath = "D:/Server/Export/Backup/PHS_Backup ";
    //var mongoDir = "D:/Mongo/Mongo/mongodb/bin ";
    //Local settings
    var batchScriptPath = "D:/05.IMPAQS/MONGODB/PETNG_Bkup/PHS_Backup ";
    var mongoDir = "D:/05.IMPAQS/MONGODB/bin ";

    cmd1.exec("d:", function(err1, out1){
        if (err1) {
            console.log(err1.message);
            res.json(500, err1);
        } else {
            console.log(out1.message);
            cmd1.exec(batchScriptPath + mongoDir , function(err2, out2){
                if (err2) {
                    console.log(err2.message);
                    res.json(500, err2);
                } else {
                    console.log(out2.message);
                    var response = out2.message.split("...");
                    console.log("response : "+response);
                    res.json(200, response);
                }
            });
            //res.json(200, "Success");
        }
    });

};

