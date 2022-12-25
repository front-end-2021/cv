//ready
var vmGoalAction = vmGoalAction || {};
vmGoalAction.pop = {};
vmGoalAction.isRedirect = false;
vmGoalAction.IsFirstLoad = true;
vmGoalAction.addType = { MainGoal: 1, SubGoal: 2, Action: 3 };
vmGoalAction.goalsView = {};
vmGoalAction.fibuOptions = undefined;
vmGoalAction.popActionFibu = undefined;
vmGoalAction.subOptions = undefined;
vmGoalAction.popSubProduct = undefined;

vmGoalAction.isSaveFilter = false;
vmGoalAction.popEditMainGoal = undefined;
vmGoalAction.popEditIndependence = undefined;
vmGoalAction.PreventFFClickAfterDrag = false;
vmGoalAction.checkOpenPopup = false;
vmGoalAction.SubmarketIdFile = null;
vmGoalAction.IndependenceIdFile = null;
vmGoalAction.GoalActionViews = [];
vmGoalAction.popSelectRegion = undefined;
vmGoalAction.popActionIndex = undefined;
vmGoalAction.enumGoalAction = { SubMarketProduct: 1, Independency: 2 };
var tempMainGoalId = undefined;
vmGoalAction.popKpiGoalAction = undefined;
vmGoalAction.popConnectionOverview = undefined;
vmGoalAction.goalsViewIndependency = {};
var vmPopName = vmPopName || {};
vmGoalAction.enumArea = { Submarket: 1, Independency: 2 };
vmGoalAction.pop.ReminderManager = {};
vmGoalAction.popKpiGoal = undefined;
vmGoalAction.setupDescriptionTooltip;
vmGoalAction.setupTooltip;
vmGoalAction.SelectorId = {
    action: 'first load',
    done: function (actionStr) { this.action = 'done ' + actionStr }
}

window.onresize = function onresize() {
    var windowWidth = $('body').width() - 40;

    if (window.devicePixelRatio < 0.3) {
        $('.msgGoalExpandView.msaTriggerResize').css({ 'clear': 'both' });
    } else {
        $('.msgGoalExpandView.msaTriggerResize').css({ 'clear': '' });
    };
    if (window.devicePixelRatio < 1) {
        $('span[class^="msa-action-uicon-done"] > span').css({
            'width': '-webkit-fill-available',
            'height': '-webkit-fill-available',
            'max-height': '-webkit-fill-available',
            'margin-top': '0'
        });
    } else {
        $('span[class^="msa-action-uicon-done"] > span').css({
            'width': '',
            'height': '',
            'max-height': '',
            'margin-top': ''
        });
    };

    $('.msaGroupActionScrollView').width(windowWidth - 42 - 286 * 2 - 74);

};

vmGoalAction.dataservice = (function () {
    var callAjaxGoalAction = function (divId, funcName, entryData, requestType, successCallBack) {       
        var url = "../Handlers/MsGoalAction.ashx?funcName=" + funcName + "&projid=" + sHandler.ProjectId + "&strid=" + sHandler.StrategyId + "&lang=" + sHandler.Lang;        
        return callAjax(divId, url, entryData, successCallBack, requestType).then((data) => {
            if(typeof successCallBack == 'function') successCallBack(data); return data;
        });
    };

    var callAjaxByPost = function (funcName, entryData, successFunc, loadingdiv) {
        return callAjaxGoalAction(loadingdiv || 'loading-goalaction', funcName, entryData, AjaxConst.PostRequest, successFunc);
    };

    var callAjaxByPostWithOutLoading = function (funcName, entryData, successFunc) {
        return callAjaxGoalAction("", funcName, entryData, AjaxConst.PostRequest, successFunc);
    };

    var callAjaxByGet = function (funcName, entryData, successFunc, loadingdiv) {
        var url = "../Handlers/MsGoalAction.ashx?funcName=" + funcName + "&projid=" + projectId + "&lang=" + kLg.language + "&strid=" + strategyId;

        for (var propertyName in entryData) {
            if (entryData.hasOwnProperty(propertyName)) {
                url += "&" + propertyName + "=" + entryData[propertyName];
            }
        }
        callAjax(loadingdiv || 'loading-goalaction', url, null, successFunc, AjaxConst.GetRequest);
        
    };
    function getGoalFromActPopup(successFunc) {
        var actpopup = vmCommon.AddressBar.ClientQuery.getActpopup();
        var url = "../Handlers/MsGoalAction.ashx?funcName=getgoalfromactpopup" + "&projid=" + projectId + "&strid=" + strategyId + "&lang=" + kLg.language + '&actpopup=' + actpopup;
        callAjax('loading-goalaction', url, JSON.stringify({}), successFunc, AjaxConst.PostRequest);
    }
    var getSetting = function (entryData, successFunc) {
        vmGoalAction.regionId = 0;
        callAjaxByPost("getSetting", entryData, successFunc);
    };

    var getOverview = function (entryData, successFunc) {
        callAjaxByPost("getOverview", entryData, successFunc);
    };

    var getGoalViewWithoutFilter = function (entryData, successFunc) {
        return callAjaxByPost("getGoalViewWithoutFilter", entryData, successFunc);
    };

    var getGoalViewNonFilter = function (entryData, successFunc) {
        return callAjaxByPostWithOutLoading("getGoalViewNonFilter", entryData, successFunc);
    };

    var getListGoalViewNonFilter = function (entryData, successFunc) {
        return callAjaxByPostWithOutLoading("getListGoalViewNonFilter", entryData, successFunc);
    };

    var getGoalViewByIndependencyWithoutFilter = function (entryData, successFunc) {
        return callAjaxByPost("getGoalViewByIndependencyWithoutFilter", entryData, successFunc);
    };
    var getGoalViewByIndependencyWithoutFilterForMaster = function (entryData, successFunc) {
        return callAjaxByPost("getGoalViewByIndependencyWithoutFilterForMaster", entryData, successFunc);
    };

    var getSubmarketProductViewWithFilter = function (entryData, firstCreate, saveFilter, successFunc) {

        var url = "../Handlers/MsGoalAction.ashx?funcName=getSubmarketProductViewWithFilter" + "&projid=" + projectId + "&lang=" + kLg.language + "&strid=" + strategyId;
        if (firstCreate)
            url = url + "&firstCreate=true";
        if (saveFilter)
            url = url + "&saveFilter=true";
        callAjax('loading-goalaction', url, JSON.stringify(entryData), successFunc, AjaxConst.PostRequest);

    };

    var duplicateGoal = function (entryData, successFunc) {
        callAjaxByPost("duplicateGoal", entryData, successFunc);
    };

    var deleteGoal = function (entryData, successFunc) {
        callAjaxByPost("deleteGoal", entryData, successFunc);
    };

    var deleteAction = function (entryData, successFunc) {
        callAjaxByPost("deleteAction", entryData, successFunc);
    };

    var getGoal = function (entryData, successFunc) {
        callAjaxByGet("getGoal", entryData, successFunc);
    };

    var getAction = function (entryData, successFunc) {
        return callAjaxByPost("getAction", entryData, successFunc);
    };

    var getActionDisordered = function (entryData, successFunc) {
        callAjaxByPost("getActionDisordered", entryData, successFunc);
    };

    var deleteIndependency = function (entryData, successFunc) {
        callAjaxByGet("deleteIndependency", entryData, successFunc);
    };

    var updateActionEP = function (entryData, successFunc) {
        callAjaxByGet("updateActionEP", entryData, successFunc);
    };

    var updateActionFinish = function (entryData, successFunc) {
        callAjaxByGet("updateActionFinish", entryData, successFunc);
    };

    var updateGoalFinish = function (entryData, successFunc) {
        callAjaxByGet("updateGoalFinish", entryData, successFunc);
    };

    var getIndependencyById = function (entryData, successFunc) {
        callAjaxByGet("getIndependencyById", entryData, successFunc);
    };

    var getMainGoalTemplate = function (entryData, successFunc) {
        callAjaxByGet("getmaingoaltemplate", entryData, successFunc);
    };

    var getSubGoalTemplate = function (entryData, successFunc) {
        callAjaxByGet("getsubgoaltemplate", entryData, successFunc);
    };

    var getFileDOCX = function (entryData, successFunc) {
        callAjaxByPost("getfiledocx", entryData, successFunc);
    };

    var getActionFibu = function (entryData, successFunc) {
        callAjaxByPost("getactionfibu", entryData, successFunc);
    };

    //
    var saveGoalFilter = function (entryData, successFunc) {
        callAjaxByPost("savegoalfilter", entryData, successFunc);
    };

    var sortAction = function (entryData, successFunc) {
        callAjaxByPost("sortaction", entryData, successFunc);
    };

    var getAreaReloadByMaster = function (entryData, successFunc) {
        callAjaxByPostWithOutLoading("sortaction", entryData, successFunc);
    };

    var cloneFilterToMix = function (entryData, successFunc) {
        callAjaxByPost("clonefiltertomix", entryData, successFunc);
    };
    var cloneFilterToEdit = function (entryData, successFunc) {
        callAjaxByPost("clonefiltertoedit", entryData, successFunc);
    };

    var cloneFilterToRoadMap = function (entryData, successFunc) {
        callAjaxByPost("clonefiltertoroadmap", entryData, successFunc);
    };

    var saveExpand = function (entryData, successFunc) {
        if (vmCommon.AddressBar.ClientQuery.isActpopup()) {
            return;
        };

        callAjaxByPostWithOutLoading("saveexpand", entryData, successFunc);
        
    };

    function saveexpandsubgoal(entryData, successFunc) {
        if (vmCommon.AddressBar.ClientQuery.isActpopup()) {
            return;
        };

        callAjaxByPostWithOutLoading("saveexpandsubgoal", entryData, successFunc);
        
    };

    var getExpand = function (entryData, successFunc) {
        callAjaxByPostWithOutLoading("getexpand", entryData, successFunc);
    };

    var loadDataFirstTime = function (entryData, successFunc) {
        callAjaxByPostWithOutLoading("loaddatafirsttime", entryData, successFunc);
    };

    var customExcel = function (entryData, successFunc) {
        callAjaxByPost("customexcel", entryData, successFunc);
    };

    var getKpiGoalData = function (entryData, successFunc) {
        callAjaxByPost("getkpigoaldata", entryData, successFunc);
    };

    var getTopicMenu = function (entryData, successFunc) {
        callAjaxByPost("gettopicmenu", entryData, successFunc);
    };

    var getOrganisationPerson = function (entryData, successFunc) {
        callAjaxByPost("getorganisationperson", entryData, successFunc);
    };

    var getSelectedIndex = function (entryData, successFunc) {
        callAjaxByPost("getselectedindex", entryData, successFunc);
    };

    var getKpiGoalDetail = function (entryData, successFunc) {
        callAjaxByPost("getkpigoaldetail", entryData, successFunc);
    };

    var saveKpiGoal = function (entryData, successFunc) {
        callAjaxByPost("savekpigoal", entryData, successFunc);
    };

    var getKpiActionDetail = function (entryData, successFunc) {
        callAjaxByPost("getkpiactiondetail", entryData, successFunc);
    };

    var saveKpiAction = function (entryData, successFunc) {
        callAjaxByPost("savekpiaction", entryData, successFunc);
    };

    var exportExcel = function (entryData, successFunc) {
        callAjaxByPost("exportexcel", entryData, successFunc);
    };

    var changeMasterSub = function (entryData, successFunc) {
        callAjaxByPost("changemastersub", entryData, successFunc);
    };

    var getSelectedMasterIndex = function (entryData, successFunc) {
        callAjaxByPost("getselectedmasterindex", entryData, successFunc);
    };

    //getlandregionmenudata
    var getLandRegionMenuData = function (entryData, successFunc) {
        callAjaxByPost("getlandregionmenudata", entryData, successFunc);
    };

    var getKpiData = function (entryData, successFunc) {
        callAjaxByPost("getkpidata", entryData, successFunc);
    };

    // colunm / actionplancolunm/ edit colunm name
    var _updateColumnName = function (entryData, successFunc) {
        callAjaxByPost("actionplan_update_colunm_name", entryData, successFunc);
    };

    var _swapColumn = function (entryData, successFunc) {
        callAjaxByPost("actionplan_swap_column", entryData, successFunc);
    };

    var _deleteColumn = function (entryData, successFunc) {
        callAjaxByPost("actionplan_delete_colunm", entryData, successFunc);
    };

    var changeGoalLevel = function (entryData, successFunc) {
        callAjaxByPost("changegoallevel", entryData, successFunc);
    };

    var getMenuLink = function (entryData, successFunc) {
        callAjaxByPost("getmenulink", entryData, successFunc);
    };

    var getMenuLinkInfos = function (entryData, successFunc) {
        callAjaxByPost("getmenulinkinfos", entryData, successFunc);
    };

    function getUpdateUrlCloseActpopup() {
        callAjaxByPost("getupdateurlcloseactpopup", {}, function (res) { });
    };

    function buildingGoalActionForBoardLine(entryData, successFunc) {
        callAjaxByPost("buildinggoalactionforboardline", entryData, successFunc);
    };

    function getParentInfo(entryData, successFunc) {
        callAjaxByPost("getparentinfo", entryData, successFunc);
    };

    function getGoalActionDataContext(entryData, successFunc) {
        callAjaxByPost("getgoalactiondatacontext", entryData, successFunc);
    };

    function exportGoalAction(entryData, successFunc) {
        callAjaxByPost("exportgoalaction", entryData, successFunc);
    };
    function saveActionReduceSize(entryData, successFunc) {
        return callAjaxByPost("saveactionreducesize", entryData, successFunc);
    };
    function getGoalActionMenuByArea(entryData, successFunc) {
        return callAjaxByPost("getgoalactionmenubyarea", entryData, successFunc);
    };
    function savemenufocus(entryData, successFunc) {
        return callAjaxByPost("savemenufocus", entryData, successFunc);
    };

    function savemenuhidden(entryData, successFunc) {
        return callAjaxByPost("savemenuhidden", entryData, successFunc);
    };
    function getGoalActionContentByMaingoal(entryData, successFunc) {       // entryData = { MainGoalId }
        return callAjaxByPost("getgoalactioncontentbymaingoal", entryData, successFunc);
    };
    function getGoalActionContentBySubgoal(entryData, successFunc) {       // entryData = { SubGoalId }
        return callAjaxByPost("getgoalactioncontentbysubgoal", entryData, successFunc);
    };
    function getGoalActionContentByArea(entryData, successFunc) {           // entryData = { SubMarketProductId, IndependencyId }
        return callAjaxByPost("getgoalactioncontentbyarea", entryData, successFunc);
    };
    function saveMenuFocusIfNotExist(entryData, successFunc) {
        return callAjaxByPost("savemenufocusifnotexist", entryData, successFunc);
    };
    function changeStartDate(entryData, successFunc) {
        return callAjaxByPost("changestartdate", entryData, successFunc);
    };
    function changeEndDate(entryData, successFunc) {
        return callAjaxByPost("changeenddate", entryData, successFunc);
    };

    return {
        callAjaxByPost: callAjaxByPost,
        callAjaxByGet: callAjaxByGet,
        callAjaxByPostWithOutLoading: callAjaxByPostWithOutLoading,
        getSetting: getSetting,
        getOverview: getOverview,
        changeEndDate: changeEndDate,
        getGoalViewWithoutFilter: getGoalViewWithoutFilter,
        getGoalViewNonFilter: getGoalViewNonFilter,
        changeStartDate: changeStartDate,
        getGoalViewByIndependencyWithoutFilter: getGoalViewByIndependencyWithoutFilter,
        getGoalViewByIndependencyWithoutFilterForMaster: getGoalViewByIndependencyWithoutFilterForMaster,
        getSubmarketProductViewWithFilter: getSubmarketProductViewWithFilter,
        duplicateGoal: duplicateGoal,
        deleteGoal: deleteGoal,
        deleteAction: deleteAction,
        getGoal: getGoal,
        getAction: getAction,

        getKpiGoalDetail: getKpiGoalDetail,
        getKpiActionDetail: getKpiActionDetail,
        saveKpiGoal: saveKpiGoal,
        saveKpiAction: saveKpiAction,

        deleteIndependency: deleteIndependency,
        updateActionEP: updateActionEP,
        updateActionFinish: updateActionFinish,
        updateGoalFinish: updateGoalFinish,
        getIndependencyById: getIndependencyById,
        getMainGoalTemplate: getMainGoalTemplate,
        getSubGoalTemplate: getSubGoalTemplate,

        getActionFibu: getActionFibu,
        saveGoalFilter: saveGoalFilter,
        sortAction: sortAction,
        getAreaReloadByMaster: getAreaReloadByMaster,
        cloneFilterToMix: cloneFilterToMix,
        cloneFilterToRoadMap: cloneFilterToRoadMap,
        saveExpand: saveExpand,
        saveexpandsubgoal: saveexpandsubgoal,
        loadDataFirstTime: loadDataFirstTime,
        getListGoalViewNonFilter: getListGoalViewNonFilter,
        customExcel: customExcel,
        getExpand: getExpand,
        cloneFilterToEdit: cloneFilterToEdit,
        getKpiGoalData: getKpiGoalData,
        getTopicMenu: getTopicMenu,
        getOrganisationPerson: getOrganisationPerson,
        getSelectedIndex: getSelectedIndex,
        exportExcel: exportExcel,
        changeMasterSub: changeMasterSub,
        getSelectedMasterIndex: getSelectedMasterIndex,
        getLandRegionMenuData: getLandRegionMenuData,
        getKpiData: getKpiData,
        getFileDOCX: getFileDOCX,
        updateColumnName: _updateColumnName,
        deleteColumn: _deleteColumn,
        swapColumn: _swapColumn,
        changeGoalLevel: changeGoalLevel,
        getMenuLink: getMenuLink,
        getGoalFromActPopup: getGoalFromActPopup,
        getUpdateUrlCloseActpopup: getUpdateUrlCloseActpopup,
        buildingGoalActionForBoardLine: buildingGoalActionForBoardLine, getActionDisordered: getActionDisordered,
        getMenuLinkInfos: getMenuLinkInfos, getParentInfo: getParentInfo, getGoalActionDataContext: getGoalActionDataContext, exportGoalAction: exportGoalAction,
        saveActionReduceSize: saveActionReduceSize, getGoalActionMenuByArea: getGoalActionMenuByArea,
        getGoalActionContentByMaingoal: getGoalActionContentByMaingoal,
        getGoalActionContentBySubgoal: getGoalActionContentBySubgoal, getGoalActionContentByArea: getGoalActionContentByArea,
        savemenufocus: savemenufocus, savemenuhidden: savemenuhidden, 
        
        saveMenuFocusIfNotExist: saveMenuFocusIfNotExist
    };
})();

vmGoalAction.loadDataFirstTime = function () {
    vmGoalAction.dataservice.loadDataFirstTime(null, function (serData) {
        $("#goalActionView").empty();
        $("#regionoverview").empty();
        $("#independencyView").empty();

        if (serData.Role < 0) {
            return;
        }
        if (typeof MsaApp == 'object') {
            MsaApp.pushLoadTimeActions('vmGoalAction.dataservice.loadDataFirstTime');
            MsaApp.setData(serData.value, 'loadDataFirstTime'); 
        }
        vmGoalAction.Role = serData.value.Role;
        vmGoalAction.simpleView = serData.value.Data.Item1;
        vmGoalAction.GoalActionViews = serData.value.Data.Item2;
        vmGoalAction.MsRegionRole = serData.value.MsRegionRole;
        vmGoalAction.IsOverdue = serData.value.IsOverdue;
        vmGoalAction.IsCheckActionDate = serData.value.IsCheckActionDate;
        var mgid = vmCommon.AddressBar.ClientQuery.Decode.get('mgid');
        mgid && vmGoalAction.expandService.addX(mgid, 1000); // MaingoalNav: 1000
        vmCommon.AddressBar.SubGoal && vmGoalAction.expandService.addX(vmCommon.AddressBar.SubGoal, 2000); // SubgoalNav: 2000
        var smid = vmCommon.AddressBar.ClientQuery.Decode.get('smid');
        smid && vmGoalAction.expandService.addX(smid, 1); // submarketId: 1
        var independid = vmCommon.AddressBar.ClientQuery.Decode.get('independid');
        independid != '0' && vmGoalAction.expandService.addX(independid, 2); // indItems: 2
    });
};

vmGoalAction.getTemplate = function (type, successFunc) {
    if (type === vmCommon.GoalType.MainGoal) {
        vmGoalAction.dataservice.getMainGoalTemplate(null, successFunc);
    } else {
        vmGoalAction.dataservice.getSubGoalTemplate(null, successFunc);
    }
};

vmGoalAction.getLandActionType = function () {
    var objQuery = new queryString(true);
    return parseInt(objQuery.get('landactiontype')) || null;
};
//ready
$(function () {
    vmCommon.AddressBar.Self();         // use instant object (like const variable in javascript ECMA 5-6)
    vmGoalAction.loadSetting();
    if (!vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
        return;
    }
    else {
        // check currentPage để hàm khởi tạo chạy đúng vì hàm khởi tạo cũng được chạy ở page khác
        // và file msGoalAction.js cũng được nhúng cùng ở page khác
        msFilter.controlService.init(vmCommon.FilterType.ActionPlan, function(data){
            vmGoalAction.loadDataFirstTime();
        });
    }

    document.title = kLg.tabActionPlan;
    vmGoalAction.setupLanguage();
   
    $('body').append($('#nprogressActionPlanDisableAll'));
    $('#nprogressActionPlanDisableAll').on('click', function (ev) {
        ev.stopImmediatePropagation();
    });
    
});
function updateNameMainGoal(id, text, isNav) {
    editMainGoalUnload(id, text, isNav);
}

function editMainGoalUnload(id, text, isNav) {
    var info = isNav
        ? vmGoalAction.getParentInfo($("td[goalid~='" + id + "']"))
        : vmGoalAction.getParentInfo($("#" + id + "tmg"));
    if (info == undefined) return;

    var obj = { Id: id, Text: text, IsNav: isNav };
    var url = "/Handlers/MsGoalAction.ashx?funcName=changeTitleMainGoal&projid=" + projectId + "&regid=" + info.RegionId + "&lang=" + kLg.language + "&strid=" + strategyId;
    callAjax('loadingRegionMatrix', url, JSON.stringify(obj), function (data) {
        vmGoalAction.simpleView.ListTitle = data.value;

    }, AjaxConst.PostRequest);
}

function bindSwitchSpanToInputLibTileMainGoal(updateNameMainGoal, cssSelector, removeHover, addHover, maxlength) {

    var currentText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        if (maxlength)
            $input.attr('maxlength', maxlength);
        else
            $input.attr('maxlength', 100);
        currentText = $(this).text();

        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.attr("id", $(this).attr("id"));
        $input.width('141px');
        $input.addClass('span-to-input');
        removeHover();
        $input.on("mouseleave", switchToSpan);
        $input.select();

        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };

    var switchToSpan = function () {

        var $span = $("<span>", {
            text: $(this).val()

        });
        var objId = $(this).closest('td').attr('id');

        var isNav = true; // isNaN(objId) ? $("#" + objId).closest("div[mstype='smpArea']").is("[isnav]") : $("#" + objId).closest("div[mstype='childArea']").is("[isnav]");

        if (isNav)
            objId = $(this).closest('td').attr('goalid');

        if ($(this).val().trim().length > 0) {
            updateNameMainGoal(objId, $(this).val(), isNav);
        } else {
            $span.text(currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.attr("id", $(this).attr("id"));
        $span.on("click", switchToInput);

    };

    $("." + cssSelector).on("dblclick", switchToInput);

}

function updateNameSubGoal(id, text, isNav) {
    void function editSubGoalUnload() {
        var info = isNav
            ? vmGoalAction.getParentInfo($("td[goalid~='" + id + "']"))
            : vmGoalAction.getParentInfo($("#" + id + "tsg"));
        if (info == undefined) return;

        var obj = { Id: id, Text: text, IsNav: isNav };
        var url = "/Handlers/MsGoalAction.ashx?funcName=changeTitleSubGoal&projid=" + projectId + "&regid=" + info.RegionId + "&lang=" + kLg.language + "&strid=" + strategyId;
        callAjax('loadingRegionMatrix', url, JSON.stringify(obj), function (data) {
            vmGoalAction.simpleView.ListTitle = data.value;

        }, AjaxConst.PostRequest);
    }();
}

function bindSwitchSpanToInputLibTitleSubGoal(updateNameSubGoal, cssSelector, removeHover, addHover, maxlength) {
    var currentText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        $input.attr('maxlength', maxlength);
        currentText = $(this).text();

        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.attr("id", $(this).attr("id"));
        $input.width('140px');
        $input.addClass('span-to-input');
        removeHover();
        $input.on("mouseleave", switchToSpan);
        $input.select();

        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };

    var switchToSpan = function () {
        var $span = $("<span>", {
            text: $(this).val()

        });
        var objId = $(this).closest('td').attr('id');

        var isNav = true; // $("#" + objId).closest("div[mstype='smpArea']").is("[isnav]");
        if (isNav)
            objId = $(this).closest('td').attr('goalid');

        if ($(this).val().trim().length > 0) {
            updateNameSubGoal(objId, $(this).val(), isNav);
            $(this).closest('.msaMaingoalParent').find('.msaMgMenuitemAddsubgoal').text(kLg.addSG1 + $(this).val() + kLg.addSG2);
        } else {
            $span.text(currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.attr("id", $(this).attr("id"));
        $span.on("click", switchToInput);
    };

    $("." + cssSelector).on("dblclick", switchToInput);
}

function updateNameAction(id, text, isNav) {
    $('.' + id + 'aac').text(text);
    $('span.' + id + 'aac').text(kLg.addSG1 + ($('input#' + id + 'tac').val() || kLg.labelActionName) + kLg.addSG2);

    var obj = { Id: id, Text: text, IsNav: isNav };
    var url = "/Handlers/MsGoalAction.ashx?funcName=changeTitleAction&projid=" + projectId + "&lang=" + kLg.language + "&strid=" + strategyId;
    callAjax('loadingRegionMatrix', url, JSON.stringify(obj), function (data) {
        vmGoalAction.simpleView.ListTitle = data.value;

    }, AjaxConst.PostRequest);
};
function bindSwitchSpanToInputLibTitleAction(updateNameAction, cssSelector, removeHover, addHover, maxlength) {
    var currentText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        if (maxlength)
            $input.attr('maxlength', maxlength);
        else
            $input.attr('maxlength', 100);
        currentText = $(this).text();

        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.attr("id", $(this).attr("id"));
        $input.width('170px');
        $input.addClass('span-to-input');

        $input.on("mouseleave", switchToSpan);
        $input.select();

        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };

    var switchToSpan = function () {
        var $span = $("<span>", { text: $(this).val() });

        var isNav = true; // $("#" + objId).closest("div[mstype='smpArea']").is("[isnav]");        
        var objId = $(this).closest('td').attr('data-subgoal-id');

        if ($(this).val().trim().length > 0) {
            updateNameAction(objId, $(this).val(), isNav);
        } else {
            $span.text(currentText);
        };

        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.attr("id", $(this).attr("id"));
        $span.on("click", switchToInput);

    };

    $("." + cssSelector).on("dblclick", switchToInput);
}

function bindSwitchSpanToInputLibTitleColunm(updateNameColunm, cssSelector, removeHover, addHover, maxlength) {
    var currentText = '';

    var switchToInput = function (el) {
        
        var mainGoalId = $(el).attr('data-maingoalid');

        var $input = $("<input>", {
            val: $(el).text(),
            type: "text"
        });

        $input.attr("data-maingoalid", mainGoalId);

        if (maxlength)
            $input.attr('maxlength', maxlength);
        else
            $input.attr('maxlength', 100);
        currentText = $(el).text();

        $input.addClass(cssSelector);
        $input.attr("data-id", $(el).attr("data-id"));
        $input.css({ 'color': 'black' });
        $(el).replaceWith($input);
        $input.width('170px');
        $input.addClass('span-to-input');
        removeHover();
        $input.on("mouseleave", switchToSpan);
        $input.focus();

        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };


    var switchToSpan = function () {
        var $span = $("<span>", {
            text: $(this).val()

        });
        var objId = $(this).attr('data-id');
        var mainGoalId = $(this).attr('data-maingoalid');

        var isNav = $("#" + objId).closest("div[mstype='smpArea']").is("[isnav]");

        if ($(this).val().trim().length > 0 && currentText != $(this).val().trim()) {
            var info = vmGoalAction.getChildElem($(this));
            updateNameColunm(objId, $(this).val(), isNav, () => {
                var isReset = false;

                if (msFilter.controlService.hasCriteria(mFilter.enumFilter.customerJourney)) {
                    var isHasResult = vmGoalAction.hasColumnResultFilter(objId, mainGoalId);
                    isReset = !isHasResult &&
                        !msFilter.controlService.checkFitFilter([], mFilter.enumFilter.customerJourney);
                }

                if (isReset) {
                    vmGoalAction.listNavMaingoalVM = {};
                    msFilter.controlService.reLoadData();
                } 

                setTimeout(function () {
                    msFilter.controlService.reLoadDataFilter();
                }, 1000);

                setTimeout(function () {
                    msFilter.controlService.reLoadDataFilter();
                }, 100);


                // Loi tu code SHA-1: c7215e5c180afa3500d08a8e3247df19a47432bc (Date-7/21/2020 4:04:17PM)
                // Co the bi conflict nen dev merged code bi sai
                vmGoalAction.redirectTo(objId);
            });
        } else {
            $span.text(currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.attr("data-id", objId);
        handleClick();

    };

}

vmGoalAction.simpleViewState = vmGoalAction.simpleViewState || {};

vmGoalAction.bindOverViewCallBack = function () {
    return;
    var that = this;

    vmGoalAction.enableAddDependencyButton();

    if (!$.isEmptyObject(vmGoalAction.listNavMaingoalVM)) {

        var arrPromise = [];

        vmGoalAction.simpleView.ListSubmarketProduct.forEach((smp) => {
            smp.Products.forEach((p) => {

                var prod = that.listNavMaingoalVM[p.SubMarketProductId];

                if (prod) {
                    var arg = {
                        SubMarketProductId: p.SubMarketProductId,
                        IndependenceId: null
                    }

                    arrPromise.push(new Promise((resolve, reject) => {
                        resolve(arg);
                    }));

                }
            });
        });

        vmGoalAction.simpleView.SubMarketProductViewGroup.forEach(msr => {
            msr.MarketSegmentGroups.forEach(ms => {
                ms.ListSubmarketProduct.forEach(smp => {
                    smp.Products.forEach(p => {

                        var prod = that.listNavMaingoalVM[p.SubMarketProductId];

                        if (prod) {
                            var arg = {
                                SubMarketProductId: p.SubMarketProductId,
                                IndependenceId: null
                            }

                            arrPromise.push(new Promise((resolve, reject) => {
                                resolve(arg);
                            }));

                        }

                    });
                });
            });
        });

        vmGoalAction.simpleView.ListIndependence.forEach(ind => {
            ind.ListSubIndependency.forEach(subInd => {

                var sub = that.listNavMaingoalVM[subInd.Id];

                if (sub) {
                    var arg = {
                        SubMarketProductId: null,
                        IndependenceId: subInd.Id
                    }

                    arrPromise.push(new Promise((resolve, reject) => {
                        resolve(arg);
                    }));

                    //if ($('#collapseChildIndepend' + subInd.Id).hasClass('in')) {
                    //    arrPromise.push(new Promise((resolve, reject) => {
                    //        resolve(arg);
                    //    }));
                    //}
                }
            });
        });

        if (that.compairState()) {
            Promise.all(arrPromise).then((args) => {
                for (var i = 0, l = args.length; i < l; i++) {
                    that.bindChild(args[i].SubMarketProductId, args[i].IndependenceId);
                }
            })

            that.setState();
            return;
        }
        else {
            vmGoalAction.dictProduct = {};
            vmGoalAction.listNavMaingoalVM = {};
        }
    }

    that.setState();

    function bindEvent() {
        vmGoalAction.setupMenuIcon('#goalActionView');
        vmGoalAction.setupMenuIcon('#regionoverview');
        vmGoalAction.setupMenuIcon('#independencyView');

        vmGoalAction.bindToggleParentEvent();

        function changePositionIndependency(sourceId, desId, position, desMdf, sourceMdf, listsource) {
            var url = "../Handlers/MsGoalAction.ashx?funcName=changePosIndependency&projid=" + projectId + "&strid=" + strategyId;
            var obj = { Moving: { DesId: desId, SourceId: sourceId, Position: position, ParentSourceId: projectId, SourceMdf: sourceMdf, DesMdf: desMdf }, SortObjs: listsource };
            callAjax("loading-goalaction", url, JSON.stringify(obj), function (data) {
                var rs = data.value;
                if (rs.ResultStatus < 0) {
                    pAlert(kLg.msgConflictData).then(function () {
                        location.reload();
                    });
                } else if (rs.ResultStatus > 0) {
                    $("#parentIndependency" + sourceId).attr("mindex", rs.NewIndex);
                    if (rs.IsReset) {
                        var i = 0;
                        $("#independencyView").find("div.panel[mstype='parentArea']").each(function () {
                            i += 1000;
                            $(this).attr("mindex", i);
                        });
                    }
                }

            }, AjaxConst.PostRequest);
        }

        function setColorProductPanel() {
            var listSubPro = vmGoalAction.simpleView.ListSubmarketProductWithColor;

            if (!listSubPro) return;
            for (var i = 0; i < listSubPro.length; i++) {
                var subId = listSubPro[i].Id;
                var eval = listSubPro[i].AvgEvaluation;
                $("#subpanel" + subId).removeClassRegEx('evaluation');
                if (eval == 200) {
                    $("#subpanel" + subId).addClass('evaluation-heading-parent-default');
                } else {
                    $("#subpanel" + subId).addClass(ChoseColorPercent(eval));
                }
                var subpro = listSubPro[i].Products;
                for (var j = 0; j < subpro.length; j++) {
                    var submarketproId = subpro[j].SubMarketProductId;
                    $("#propanel" + submarketproId).removeClassRegEx('evaluation');
                    if (subpro[j].NumberOfProductEval == 0) {
                        $("#propanel" + submarketproId).addClass('evaluation-heading-parent-default');
                    } else {
                        $("#propanel" + submarketproId).addClass(ChoseColorPercent(subpro[j].EvaluationResult));
                    }
                }
            }
        }

        setColorProductPanel();

        var titleMainGoalOne = kLg.labelMainGoalName;
        var objQuery = new queryString(true);

        var fromDash = objQuery.get('fromdash') || null,
            fromSm = objQuery.get('fromsm') || null;
        vmGoalAction.isRedirect = fromSm != null || fromDash != null || vmCommon.AddressBar.ClientQuery.isActpopup();

        var srcIndex = 0, desIndex = 0, preListIndependency = [];
        $("#independencyView").sortable({
            revert: false,
            items: "div.panel[mstype='parentArea'][ise]",
            cancel: "td[mstype='mainGoal'],td[mstype='subGoal'],div[mstype='action'],table",
            helper: function (event, ui) {
                var $clone = $(ui).clone();
                $clone.css("position", "absolute");
                return $clone.get(0);
            },
            //containment: "#independencyView",
            start: function (event, ui) {
                preListIndependency = [];
                $("#independencyView").find('.panel[mstype=parentArea]').each(function () {
                    preListIndependency.push({ Id: $(this).attr('parentid'), Mdf: $(this).attr('mdf'), MIndex: $(this).attr('mindex') });
                });

                srcIndex = ui.item.index();
            },
            stop: function (event, ui) {
                desIndex = ui.item.index();

                var srcObj = preListIndependency[srcIndex], desObj = preListIndependency[desIndex];
                var pos = desIndex > srcIndex ? 1 : 0;

                if (srcObj.Id === desObj.Id) {
                    return;
                }

                changePositionIndependency(srcObj.Id, desObj.Id, pos, desObj.Mdf, srcObj.Mdf, preListIndependency);
            }
        });
        $("#independencyView").sortable("enable");

        vmGoalAction.visibleIndependencyRole(vmGoalAction.MsRegionRole);
    }

    bindEvent();
    
    vmGoalAction.expandService.scrollToLastSubgoalNav();

    if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {      // backlog item 24222
        vmGoalAction.hasMenuShowGoto = function (typeId) {
            // typeId == vmCommon.MTabType.Roadmap / vmCommon.MTabType.Marketingmix / vmCommon.MTabType.Teamboard
            return bindMKMenuStyle(typeId) !== '';
        };
        vmGoalAction.setHideGotoOtherTabInMenu = function () {
            if (vmGoalAction.hasMenuShowGoto(vmCommon.MTabType.Roadmap) && $('.link-Roadmap').length > 0) {
                $('.link-Roadmap').each(function () {
                    let $divider = $(this).closest('li').prev('.divider');
                    $divider.remove();
                });
                $('.link-Roadmap').remove();
            }
            if (vmGoalAction.hasMenuShowGoto(vmCommon.MTabType.Marketingmix) && $('.link-gotoMix').length > 0) {
                $('.link-gotoMix').each(function () {
                    let $divider = $(this).closest('li').prev('.divider');
                    $divider.remove();
                });
                $('.link-gotoMix').remove();
            }
        }
    }
};

vmGoalAction.setState = function () {
    var that = this;
    that.simpleViewState = that.simpleView;
}

vmGoalAction.getState = function (simpleView) {
    var rs = {};
    return rs;
}
vmGoalAction.compairState = function () {
    var that = this;
    if (JSON.stringify(that.getState(that.simpleViewState)) == JSON.stringify(that.getState(that.simpleView))) {
        return true;
    }
    else {
        return false;
    }
}
vmGoalAction.visibleIndependencyRole = function (roleId) {
    if (roleId >= vmCommon.MemberRole.Edit) {
        $("#btnAddIndependency").removeClass("bg-disable");
        $("#btnAddIndependency").removeAttr("disabled");

        $(".overallthread").removeClass("hidden");
    } else {
        $("#btnAddIndependency").addClass("bg-disable");
        $("#btnAddIndependency").attr("disabled", "disabled");

        $(".overallthread").addClass("hidden");
    }
};
vmGoalAction.bindOverallView = function (dataEntry, firstCreate, saveFilter) {
    $('#goalActionView').empty();
    $('#regionoverview').empty();
    $('#independencyView').empty();

};
vmGoalAction.loadSetting = function () {
    var promise = new Promise(function (resolveFnc, rejectFnc) {
        vmGoalAction.dataservice.getSetting(null, function (serverData) {
            if (typeof updatePaletteFrom == 'function') {
                updatePaletteFrom(serverData.value.PaletteColors);
            }

            vmGoalAction.setting = vmGoalAction.setting || {};
            vmGoalAction.setting.GoalEvaluation = serverData.value.GoalEvaluation;
            vmGoalAction.setting.ProtocolStatus = serverData.value.ProtocolStatus;
            vmGoalAction.setting.ActionField = serverData.value.ActionField;
            vmGoalAction.setting.ActionInstrument = serverData.value.ActionInstrument;
            vmGoalAction.setting.SubjetThemas = serverData.value.SubjetThemas;
            vmGoalAction.setting.ListLandType = serverData.value.ListLandType;
            vmGoalAction.setting.ListFullRegion = serverData.value.ListFullRegion;
            vmGoalAction.setting.ListCurrency = serverData.value.ListCurrency;
            vmGoalAction.setting.ActAdvertiser = serverData.value.ActAdvertiser;
            vmGoalAction.setting.ActAdvertisingMaterial = serverData.value.ActAdvertisingMaterial;
            vmGoalAction.setting.ActAdvertisingMaterial.find(i => { if (i.Id == -2) { i.Name = kLg.AdvertisingMultiple; return true; } });
            vmGoalAction.setting.Accounts = serverData.value.Accounts;
            vmGoalAction.setting.GoalCategory = serverData.value.GoalCategory;
            vmGoalAction.setting.ActionCategory = serverData.value.ActionCategory;

            vmGoalAction.setting.GoalEvaluation.unshift({ Name: "", Id: -1 });
            vmGoalAction.setting.ProtocolStatus.unshift({ Name: "", Id: -1 });

            vmGoalAction.setting.ActionInstrument.unshift({ Name: "", Id: -1 });

            if (vmCommon.AddressBar.ClientQuery.isActpopup()) {
                vmGoalAction.dataservice.getGoalFromActPopup(function (data) {
                    console.log("getGoalFromActPopup:", data.value);
                    getGoalFromActpopup(data.value);
                    resolveFnc(data.value.UrlDecoded);
                })
            } else {
                resolveFnc('nopopupdecoded');
            }
        });
    });
    if (vmCommon.checkCurrentPage(vmCommon.enumPage.Dashboard) && typeof vmDashboard === 'object') {
        vmDashboard.AddressBar.promise = promise;
    } else {
        vmCommon.AddressBar.ClientQuery.promise = promise;
    }
};
vmGoalAction.openPopSelectRegion = function () {
    vmGoalAction.popSelectRegion = showPopup(vmGoalAction.popSelectRegion,
        $("#popActionFibu"),
        vmCommon.rootUrl + "Contents/MsPopSelectRegion.html",
        {
            title: kLg.strSelectionFormat.format(vmGoalAction.RegionTitle ? vmGoalAction.RegionTitle : kLg.lblRegions),
            width: 650,
            height: 525,
            resizable: false
        }
    );
};
vmGoalAction.openPopSubProduct = function (title) {
    vmGoalAction.popSubProduct = showPopup(vmGoalAction.popSubProduct,
        $("#popActionFibu"),
        vmCommon.rootUrl + "Contents/MsPopEditSubProduct.html",
        {
            title: title,
            width: 650,
            height: 525,
            resizable: false
        }
    );
};
vmGoalAction.openPopupActionFibu = function (actionId) {
    if (vmGoalAction.fibuOptions.hasData) {
        vmGoalAction.showPopFibu(kLg.titleActionFibu);
    } else {
        vmGoalAction.dataservice.getActionFibu({ actionId: actionId, regionId: vmGoalAction.fibuOptions.RegionId, IndependencyId: vmGoalAction.fibuOptions.IndependencyId }, function (res) {

            vmGoalAction.fibuOptions.hasData = true;
            vmGoalAction.fibuOptions.ActionId = actionId;

            vmGoalAction.fibuOptions.CurrencyRates = res.value.CurrencyRates;
            vmGoalAction.fibuOptions.FibuSettings = res.value.FibuSettings;

            vmGoalAction.showPopFibu(kLg.titleActionFibu);
        });
    }

};

vmGoalAction.showPopFibu = function (title) {
    vmGoalAction.popActionFibu = showPopup(vmGoalAction.popActionFibu,
        $("#popActionFibu"),
        vmCommon.rootUrl + "Contents/MsPopActionFibu.html",
        {
            title: title,
            width: screen.width - 50,
            height: 525,
            resizable: false
        }
    );
};

vmGoalAction.showAddGoalPopup = function (title) {

    vmGoalAction.getTemplate(vmGoalAction.goalOptions.GoalType, function (res) {
        vmGoalAction.goalTemplates = res.value;
        vmGoalAction.popEditMainGoal = showPopup(vmGoalAction.popEditMainGoal,
            $('#popEditMainGoal'),
            vmCommon.rootUrl + 'Contents/MsPopEditGoal.html',
            {
                title: title,
                width: 1080,
                height: 530,
                resizable: false
            }
        );
    });
    return new Promise(function (resolve) {
        resolve(title);
    });
};

vmGoalAction.showEditNamePopUp = function (title) {
    vmGoalAction.popEditName = showPopup(vmGoalAction.popEditName,
        $('#popEditName'),
        vmCommon.rootUrl + 'Contents/MsPopName.html',
        {
            width: 400,
            height: 156,
            resizable: false
        }
    );
    vmGoalAction.popEditName.title(title);
};

vmGoalAction.showAddActionPopup = function (title) {
    if (!title) {
        title = `${kLg.titlepAddMainGoalNew1}${kLg.labelActionName}${kLg.titlepAddMainGoalNew2}`;
        vmGoalAction.popEditAction.options.title = title;
    }
    vmGoalAction.popEditAction = showPopup(vmGoalAction.popEditAction,
        $('#popEditAction'),
        vmCommon.rootUrl + 'Contents/MsPopEditAction.html',
        {
            title: (language === 'pm') ? kLg.titlepAddAction : title,
            width: 1080,
            height: 605,
            resizable: false
        }
    );
    return new Promise(function (resolve) {
        resolve(title);
    });
};

vmGoalAction.showAddIndependencePopup = function (title, height) {
    vmGoalAction.popEditIndependence = showPopup(vmGoalAction.popEditIndependence,
        $('#popEditIndependence'),
        vmCommon.rootUrl + 'Contents/MsPopEditIndependence.html',
        {
            title: title,
            width: 650,
            height: height,
            resizable: false
        }
    );
};

vmGoalAction.openActionIndex = function (title) {
    vmGoalAction.popActionIndex = showPopup(vmGoalAction.popActionIndex,
        $("#popActionIndex"),
        vmCommon.rootUrl + "Contents/MsPopActionIndex2.html",
        {
            title: title,
            width: vmGoalAction.kpiActionOptions.enableOutcomeTime ? 947 : 732,
            height: 512,
            resizable: false
        }
    );
};

vmGoalAction.customConnect = function (element, connections) {
    var e = { productid: 0, parentid: 0 };
    $.extend(e, element);
    var temp;
    if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
        temp = $.grep(connections, function (item) {
            return (item.Type === 1 && item.SubProductId !== Number(e.parentid)) || (item.Type === 2 && item.SubProductId !== Number(e.productid));
        });
    } else {
        temp = connections;
    }

    var newId = 1;
    $.each(temp, function (index, item) {
        item.Id = newId++;
    });
    return temp;
};

vmGoalAction.bindCustomConnection = function (event, connections) {     // event = info
    var proId = typeof event == "object" && event.ProductId ? event.ProductId : undefined;
    proId = proId == undefined ? event.productId : proId;
    var subId = typeof event == "object" && event.SubmarketId ? event.SubmarketId : undefined;
    subId = subId == undefined ? event.submarketId : subId;

    var temp;
    if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
        temp = $.grep(connections, function (item) {
            return (item.Type === 1 && item.SubProductId !== Number(subId)) || (item.Type === 2 && item.SubProductId !== Number(proId));
        });
    } else {
        temp = connections;
    }
    var newId = 1;
    $.each(temp, function (index, item) {
        item.Id = newId++;
    });
    return temp;
};

vmGoalAction.bindIndependencyConnection = function (res) {
    var sp = res;
    var newId = 1;
    $.each(sp, function (index, item) {
        item.Id = newId++;
    });
    return sp;
};

vmGoalAction.showAddSubGoal = function (e, selfElmName) {
    vmGoalAction.getOpenArea(e);
    var $parentElem = $(e).parents('td[mstype=mainGoal]'),
     info = vmGoalAction.getChildElem(e);
    var mainGoalId = $(e).attr('data-id') || $parentElem.attr('goalId');        
    var entryData = {
        goalId: vmCommon.emptyGuid,
        independencyId: info.IndependencyId,
        regionId: info.RegionId,
        productId: info.ProductId,
        parentId: mainGoalId,
        subMarketId: info.SubMarketId,
        subMarketProductId: info.SubMarketProductId,
        goalType: vmCommon.GoalActionContentType.SubGoal
    };
    vmGoalAction.currency = {};
    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {
            vmGoalAction.goalOptions = {
                GoalType: vmCommon.GoalType.SubGoal,
                ParentId: mainGoalId,
                IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
            };

            vmGoalAction.currency.Name = info.CurrencyName;
            vmGoalAction.goalOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.bindCustomConnection(e, serData.value.CustomConnection);

            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;

            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.goalOptions.isRedirect = true;

            $.extend(vmGoalAction.goalOptions, info);
            vmGoalAction.setLimitedDateGoal(mainGoalId, vmGoalAction.getSourceByInfo(info));

            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.goalOptions.IsCalendar = serData.value.IsCalendar;
            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

            var title = kLg.titlepAddMainGoalNew1 + htmlEscape($(e).closest('.msaMaingoalParent').find('.msaSubgoalTitle').children().first().text());
            void function setTitleWhenCollapseIn() {
                if (selfElmName) {
                    var goalId = $(selfElmName).attr('data-id');
                    var $collapseIn = $('#collapseGoal' + goalId);
                    if (!$collapseIn.hasClass('in')) {
                        title = htmlEscape($(selfElmName).children('.msaMgMenuitemAddsubgoal').text());
                    };
                };
            }();
            vmGoalAction.SelectorId.action = 'vmGoalAction.showAddMainSubAction';
            vmGoalAction.showAddGoalPopup(title + kLg.titlepAddMainGoalNew2);
        }
    });
};

vmGoalAction.showEditGoal = function (e) {
    vmGoalAction.getOpenArea(e);
    var $parentElement = $(e).parents('td[isgoal=true]');
    var info = vmGoalAction.getChildElem(e);
    var goalId = $(e).attr('data-id') || $parentElement.attr('goalId'),
        mdf = $parentElement.attr('mdf'), mstype = $parentElement.attr('mstype'), parentid = $parentElement.attr("parentid");

    var entryData = {
        goalId: goalId,
        independencyId: info.IndependencyId,
        regionId: info.RegionId,
        productId: info.ProductId,
        subMarketId: info.SubMarketId,
        subMarketProductId: info.SubMarketProductId,
        parentId: parentid,
        goalType: parentid && parentid != vmCommon.emptyGuid ? vmCommon.GoalActionContentType.SubGoal : vmCommon.GoalActionContentType.MainGoal
    };
    
    vmGoalAction.currency = {};
    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {

            vmGoalAction.goalOptions = {
                IsEdit: true,
                Goal: serData.value.TheObject,
                Url: serData.value.Url,
                IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
            };

            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

            vmGoalAction.currency.Name = info.CurrencyName;

            vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.bindCustomConnection(e, serData.value.CustomConnection);

            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
            vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;

            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
            //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.goalOptions.isRedirect = true;

            $.extend(vmGoalAction.goalOptions, info);
            vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

            //manh: file
            vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);

            vmGoalAction.SelectorId.mainGoal = goalId;
            vmGoalAction.SelectorId.action = 'vmGoalAction.showEditGoal';
            var title = $(e).closest('.msaMaingoalParent').find('.msaMaingoalTitle').children().text();
            if (!title) {
                title += kLg.labelMainGoalName;
            };
            vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);

        }
    });
};

vmGoalAction.openPopupSubGoalBoard = function (serData, boardColumnId, boardLineId) {
    var e = { productid: 0, parentid: 0 };
    vmGoalAction.currency = {};

    var goal = serData.value.TheObject;
    var info = serData.value.AreaInfo;

    vmGoalAction.goalOptions = {
        IsEdit: false,
        Goal: goal,
        Url: serData.value.Url,
        ParentId: goal.ParentId,
        GoalType: vmCommon.GoalType.SubGoal,
        BoardColumnId: boardColumnId,
        FromBoard: true,
        BoardLineId: boardLineId,
        PathParentId: serData.PathParentId,
        PathParentMdf: serData.PathParentMdf
    };

    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

    vmGoalAction.currency.Name = info.Currency;
    vmGoalAction.goalOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);

    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
    //vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;

    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
    //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
    if (!vmGoalAction.goalOptions.HasMasterGoal ||
        (vmGoalAction.goalOptions.MasterGoal && goal.MasterId && !vmGoalAction.goalOptions.MasterGoal.some(t => t.Id == goal.MasterId)))
        goal.MasterId = null;

    vmGoalAction.Role = serData.value.RoleId;
    vmGoalAction.goalOptions.isRedirect = true;

    $.extend(vmGoalAction.goalOptions, info);
    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

    vmGoalAction.goalOptions.SubMarketProductId = vmGoalAction.goalOptions.SubMarketProductId;

    vmGoalAction.SelectorId.action = 'vmGoalAction.showEditSubGoal';
    var titleSg =  kLg.titlepAddMainGoalNew1 + kLg.labelSubGoalName + kLg.titlepAddMainGoalNew2;
    vmGoalAction.showAddGoalPopup(titleSg);
};

vmGoalAction.openPopupMainGoalBoard = function (serData, boardColumnId, boardLineId) {
    var goal = serData.value.TheObject;
    var info = serData.value.AreaInfo;

    var e = { productid: 0, parentid: 0 };
    vmGoalAction.currency = {};

    vmGoalAction.goalOptions = {
        IsEdit: false,
        Goal: goal,
        Url: serData.value.Url,
        GoalType: vmCommon.GoalType.MainGoal,
        BoardColumnId: boardColumnId,
        BoardLineId: boardLineId,
        PathParentId: serData.PathParentId,
        PathParentMdf: serData.PathParentMdf
    };

    vmGoalAction.goalOptions.FromBoard = true;

    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
    vmGoalAction.currency.Name = info.Currency;

    vmGoalAction.goalOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);

    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;

    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
    if (!vmGoalAction.goalOptions.HasMasterGoal ||
        (vmGoalAction.goalOptions.MasterGoal && goal.MasterId && !vmGoalAction.goalOptions.MasterGoal.some(t => t.Id == goal.MasterId)))
        goal.MasterId = null;

    vmGoalAction.Role = serData.value.RoleId;
    vmGoalAction.RegionId = info.RegionId;
    vmGoalAction.goalOptions.isRedirect = true;

    $.extend(vmGoalAction.goalOptions, info);
    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;

    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

    vmGoalAction.goalOptions.SubMarketProductId = vmGoalAction.goalOptions.SubMarketProductId;

    //manh: file
    //vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);
    vmGoalAction.SelectorId.action = 'vmGoalAction.openPopupMainGoal';
    vmGoalAction.showAddGoalPopup(kLg.titlepAddMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepAddMainGoalNew2);
};

vmGoalAction.openPopupMainGoal = function (entryData, info, element) {
    var e = { productid: 0, parentid: 0 };
    $.extend(e, element);
    vmGoalAction.currency = {};
    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {
            vmGoalAction.goalOptions = {
                IsEdit: true,
                Goal: serData.value.TheObject,
                Url: serData.value.Url,
                IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
            };

            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

            vmGoalAction.currency.Name = info.CurrencyName;

            vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);

            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
            vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;

            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
            //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.RegionId = entryData.regionId;
            vmGoalAction.goalOptions.isRedirect = true;

            $.extend(vmGoalAction.goalOptions, info);
            vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;

            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

            //manh: file
            vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);
            vmGoalAction.SelectorId.action = 'vmGoalAction.openPopupMainGoal';
            vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(e.title) + kLg.titlepEditMainGoalNew2);
        }
    });
};
function dblClickMainGoal(e) {
    vmGoalAction.getOpenArea(e);
    var info = vmGoalAction.getChildElem(e);
    var goalId = $(e).attr('goalId');

    var entryData = {
        goalId: goalId, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId,
        subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, goalType: vmCommon.GoalActionContentType.MainGoal
    };
    var proId = $(event).closest("div[mstype=child]").attr("productid");
    var subId = $(event).closest("div[mstype=parentArea]").attr("parentid");
    var element = { productid: proId, parentid: subId, title: getPopTitleMaingoal(e) };
    vmGoalAction.SelectorId.mainGoal = goalId;
    vmGoalAction.SelectorId.action = 'vmGoalAction.showEditGoal';
    vmGoalAction.openPopupMainGoal(entryData, info, element);
};

//show edit subgoal
vmGoalAction.showEditSubGoal = function (e) {
    vmGoalAction.getOpenArea(e);
    var info = vmGoalAction.getChildElem(e);
    var _submarketprdId = $(e).attr('data-submarketproductid'),
        _independenceId = $(e).attr('data-independencyid');

    info.SubMarketProductId = info.SubMarketProductId || (_submarketprdId == 'null' ? undefined : _submarketprdId);
    info.IndependencyId = info.IndependencyId || (_independenceId == 'null' ? undefined : _independenceId);
    var goalId = $(e).attr('data-id'),
        parentId = $(e).attr('parentid');

    var entryData = {
        goalId: goalId,
        independencyId: info.IndependencyId,
        regionId: info.RegionId,
        productId: info.ProductId,
        subMarketId: info.SubMarketId,
        subMarketProductId: info.SubMarketProductId,
        goalType: vmCommon.GoalActionContentType.SubGoal,
        parentId: parentId
    };
    vmGoalAction.currency = {};

    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {

            vmGoalAction.goalOptions = {
                IsEdit: true,
                Goal: serData.value.TheObject,
                Url: serData.value.Url,
                ParentId: serData.value.TheObject.ParentId,
                IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
            };

            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

            vmGoalAction.currency.Name = info.CurrencyName;

            vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.bindCustomConnection(e, serData.value.CustomConnection);

            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
            vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;

            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
            //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.goalOptions.isRedirect = true;

            $.extend(vmGoalAction.goalOptions, info);
            vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

            //manh: file
            vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.SubGoal, vmGoalAction.Role);

            var title = getPopTitleSubgoal(e);
            vmGoalAction.SelectorId.action = 'vmGoalAction.showEditSubGoal';
            vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);
        }
    });
};

vmGoalAction.openPopupSubGoal = function (entryData, info, element) {
    var e = { productid: 0, parentid: 0 };
    $.extend(e, element);
    vmGoalAction.currency = {};
    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {

            vmGoalAction.goalOptions = {
                IsEdit: true,
                Goal: serData.value.TheObject,
                Url: serData.value.Url,
                ParentId: serData.value.TheObject.ParentId,
                IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
            };

            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

            vmGoalAction.currency.Name = info.CurrencyName;

            vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);

            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
            vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;

            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
            //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.goalOptions.isRedirect = true;

            $.extend(vmGoalAction.goalOptions, info);
            vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

            vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.SubGoal, vmGoalAction.Role);
            vmGoalAction.SelectorId.action = 'vmGoalAction.showEditSubGoal';
            vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(e.title) + kLg.titlepEditMainGoalNew2);
        }
    });
};
function dblClickSubGoal(e) {
    vmGoalAction.getOpenArea(e);
    var info = vmGoalAction.getChildElem(e);
    var _submarketprdId = $(e).attr('data-submarketproductid'),
        _independenceId = $(e).attr('data-independencyid');

    info.SubMarketProductId = info.SubMarketProductId || (_submarketprdId == 'null' || _submarketprdId == 'undefined' ? undefined : _submarketprdId);
    info.IndependencyId = info.IndependencyId || (_independenceId == 'null' ? undefined : _independenceId);

    var goalId = $(e).attr('data-id');
    var parentId = $(e).attr("parentid");

    var entryData = {
        goalId: goalId, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId,
        subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, goalType: vmCommon.GoalActionContentType.SubGoal, parentId: parentId
    };
    var proId = $(event).closest("div[mstype=child]").attr("productid");
    var subId = $(event).closest("div[mstype=parentArea]").attr("parentid");
    var element = { productid: proId, parentid: subId, title: getPopTitleSubgoal(e) };
    vmGoalAction.SelectorId.action = 'vmGoalAction.showEditSubGoal';
    vmGoalAction.openPopupSubGoal(entryData, info, element);
};

vmGoalAction.getMasterKpiForGoal = function (subMarketProductId, independencyId, goalId) {
    var datas = subMarketProductId ? vmGoalAction.goalsView[subMarketProductId] : vmGoalAction.goalsViewIndependency[independencyId];
    if (datas == undefined) return [];

    for (var m = 0; m < datas.length; m++) {
        var rs = [];
        var flag = false;

        var main = datas[m];
        rs = rs.concat(main.MasterKpis);
        if (main.Id == goalId) flag = true;

        var subs = main.ListSubGoal;
        for (var s = 0; s < subs.length; s++) {
            var sub = subs[s];
            rs = rs.concat(sub.MasterKpis);

            if (sub.Id == goalId) flag = true;
        }

        if (flag) {
            return rs;
        }
    }

    return [];
};

vmGoalAction.getMasterKpiForAction = function (subMarketProductId, independencyId, subGoalId) {
    var datas = subMarketProductId ? vmGoalAction.goalsView[subMarketProductId] : vmGoalAction.goalsViewIndependency[independencyId];
    if (datas == undefined) return [];

    var rs = [];
    for (var m = 0; m < datas.length; m++) {
        var main = datas[m];
        var subs = main.ListSubGoal;

        for (var s = 0; s < subs.length; s++) {
            var sub = subs[s];
            if (sub.Id == subGoalId) {
                rs = rs.concat(sub.MasterKpis);
                rs = rs.concat(main.MasterKpis);
                return rs;
            }
        }
    }

    return rs;
};

//vmGoalAction.showEditAction = function (e) {
//    vmGoalAction.getOpenArea(e);
//    var $elem = $(e),
//        $parentElement = $elem.parents('div[mstype=action]');

//    var info = vmGoalAction.getChildElem(e),
//        actionId = $parentElement.attr('actionId'),
//        goalId = $elem.closest("td").attr("parentid");
    
//    vmGoalAction.currency = {};
//    var entryData = {
//        actionId: actionId, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId,
//        subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, parentId: goalId
//    };
//    vmGoalAction.dataservice.getAction(entryData, function (serData) {

//        if (vmCommon.checkConflict(serData.value.ResultStatus)) {
//            vmGoalAction.actionOptions = {
//                IsEdit: true,
//                Action: serData.value.TheObject,
//                Templates: serData.value.Templates
//            };

//            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

//            vmGoalAction.currency.Name = info.CurrencyName;
//            vmGoalAction.actionOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.bindCustomConnection(e, serData.value.CustomConnection);

//            vmGoalAction.actionOptions.RegionSelectable = serData.value.RegionSelectable;
//            vmGoalAction.actionOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
//            vmGoalAction.actionOptions.CurrencyRates = serData.value.CurrencyRates;
//            vmGoalAction.actionOptions.MasterGoal = serData.value.MasterGoal;
//            //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
//            vmGoalAction.actionOptions.HasMasterGoal = serData.value.HasMasterGoal;

//            vmGoalAction.Role = serData.value.RoleId;
//            vmGoalAction.actionOptions.isRedirect = true;

//            vmGoalAction.actionOptions.SubProductGroups = serData.value.SubProductGroups;
//            vmGoalAction.actionOptions.SubClientGroups = serData.value.SubClientGroups;

//            vmGoalAction.actionOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
//            vmGoalAction.actionOptions.ActionDefaultValue = serData.value.ActionDefaultValue;
//            vmGoalAction.actionOptions.CustomViews = serData.value.CustomViews;
//            vmGoalAction.actionOptions.ActionStream = serData.value.ActionStream;
//            vmGoalAction.actionOptions.ActionTodoDataX = serData.value.ActionTodoDataX;
//            vmGoalAction.actionOptions.GoalId = vmGoalAction.actionOptions.Action.GoalId;

//            vmGoalAction.actionOptions.CustomerJourneyGroups = serData.value.CustomerJourneyGroups;

//            vmGoalAction.actionOptions.IsHasKpi = serData.value.IsHasKpi;
//            vmGoalAction.actionOptions.IsHasFibu = serData.value.IsHasFibu;

//            $.extend(vmGoalAction.actionOptions, info);
//            var title = getPopTitleAction(e);

//            //manh: file
//            vmFile.setAssignedU(entryData.actionId, vmCommon.enumType.Action, vmGoalAction.Role);
//            vmGoalAction.SelectorId.action = 'vmGoalAction.showEditAction';
//            vmGoalAction.showAddActionPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);
//        }
//    });

//};

//function getPopTitleAction(e) {
//    var title = $(e).closest(".msaSubGoalTable ").find('.cssNameAction').text();
//    title = title ? title : kLg.labelActionName;
//    return title;
//};
function getPopTitleSubgoal(e) {
    var title;// = $(e).closest(".msaMgExpandGetTitle").find(".cssNameSubGoal").text();
    title = title ? title : kLg.labelSubGoalName;
    return title;
};
function getPopTitleMaingoal(e) {
    var title = $(e).closest("table").find("thead tr:eq(0) td:eq(0) div:eq(0) span").text();
    title = title ? title : kLg.labelMainGoalName;
    return title;
};



vmGoalAction.openPopupAddActionDisordered = function (boardColumnId, boardLineId) {
    vmGoalAction.currency = { Name: "" };

    vmGoalAction.dataservice.getActionDisordered({ EndDate: new Date() }, function (serData) {
        if (!vmCommon.checkConflict(serData.value.ResultStatus))
            return;

        var action = serData.value.TheObject ? serData.value.TheObject : { Color: "#B8C92E" };
        let areaInfo = serData.value.AreaInfo;

        //vmGoalAction.currency = { Name: info.Currency };

        vmGoalAction.actionOptions = {
            isEdit: false,
            action: action,
            templates: [],
            //RegionId: info.RegionId,
            //Url: serData.value.Url,
            //BoardColumnId: null,
            //GoalId: action.GoalId,
            parentSubMarketProductId: vmCommon.emptyGuid,
            boardColumnId: boardColumnId,
            isDisordered: true,
            parentStart: new Date(),
            boardLineId: boardLineId,
            currency: areaInfo.Currency
        };

        //vmGoalAction.actionOptions.FromBoard = true;
        vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
        //vmGoalAction.currency.Name = info.Currency;

        vmGoalAction.actionOptions.customConnection = [];

        vmGoalAction.actionOptions.regionSelectable = false;
        vmGoalAction.actionOptions.kpiGoalSelectable = false;
        vmGoalAction.actionOptions.currencyRates = [];
        vmGoalAction.actionOptions.masterGoal = [];
        vmGoalAction.actionOptions.hasMasterGoal = false;

        vmGoalAction.role = serData.value.RoleId;
        vmGoalAction.actionOptions.isRedirect = true;
        vmGoalAction.actionOptions.subProductGroups = serData.value.SubProductGroups;
        vmGoalAction.actionOptions.subClientGroups = serData.value.SubClientGroups;
        vmGoalAction.actionOptions.actionPlanRegions = [];
        vmGoalAction.actionOptions.actionDefaultValue = serData.value.ActionDefaultValue;
        vmGoalAction.actionOptions.customViews = serData.value.CustomViews;
        vmGoalAction.actionOptions.actionStream = [];
        vmGoalAction.actionOptions.actionTodoDataX = serData.value.ActionTodoDataX;
        //vmGoalAction.actionOptions.GoalId = vmGoalAction.actionOptions.Action.GoalId;
        vmGoalAction.actionOptions.isHasKpi = serData.value.IsHasKpi;
        vmGoalAction.actionOptions.isHasFibu = false;

        vmGoalAction.actionOptions.customerJourneyGroups = serData.value.CustomerJourneyGroups;

        //$.extend(vmGoalAction.actionOptions, info);
        //vmFile.setAssignedU(actionId, vmCommon.enumType.Action, vmGoalAction.Role);

        vmGoalAction.showAddActionPopup(kLg.addDetachedSubgoal1 + kLg.labelActionName + kLg.addDetachedSubgoal2);
    });

};

vmGoalAction.openPopupActionBoard = function (serData, boardColumnId, boardLineId) {
    var e = { productid: 0, parentid: 0 };
    var action = serData.value.TheObject;
    var info = serData.value.AreaInfo;

    if (info.SubMarketProductId == null) info.SubMarketProductId = vmCommon.emptyGuid;

    //vmGoalAction.currency = {};

    vmGoalAction.actionOptions = {
        isEdit: false,
        action: action,
        templates: serData.value.Templates,
        currency: info.Currency,
        regionId: info.RegionId,
        productId: info.ProductId,
        subMarketId: info.SubMarketId,
        url: serData.value.Url,

        goalId: action.GoalId,
        parentSubMarketProductId: info.SubMarketProductId,
        boardColumnId: boardColumnId,
        boardLineId: boardLineId,
        subMarketProductId: info.SubMarketProductId,
        independencyId: info.independencyId,
        pathParentId: serData.PathParentId,
        pathParentMdf: serData.PathParentMdf,
        fromBoard: true
    };

    //vmGoalAction.actionOptions.FromBoard = true;

    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
    //vmGoalAction.currency.Name = info.Currency;

    //vmGoalAction.actionOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);
    vmGoalAction.actionOptions.customConnection = info.independencyId > 0 ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : info.subMarketProductId && info.subMarketProductId != vmCommon.emptyGuid ? vmGoalAction.bindCustomConnection({ ProductId: areaInfo.ProductId, SubMarketId: areaInfo.SubMarketId }, serData.value.CustomConnection) : [];

    vmGoalAction.actionOptions.regionSelectable = serData.value.RegionSelectable;
    vmGoalAction.actionOptions.kpiGoalSelectable = serData.value.KpiGoalSelectable;
    vmGoalAction.actionOptions.currencyRates = serData.value.CurrencyRates;
    vmGoalAction.actionOptions.masterGoal = serData.value.MasterGoal;
    vmGoalAction.actionOptions.hasMasterGoal = serData.value.HasMasterGoal;
    //valid master budget

    var isSelectBudget = vmGoalAction.actionOptions.HasMasterGoal && vmGoalAction.actionOptions.MasterGoal != null
    action.MasterBudgets = action.MasterBudgets.filter(t => isSelectBudget && vmGoalAction.actionOptions.MasterGoal.some(x => x.Id == t.MasterId));

    vmGoalAction.role = serData.value.RoleId;
    vmGoalAction.actionOptions.isRedirect = true;

    vmGoalAction.actionOptions.subProductGroups = action.SubProductGroups;
    vmGoalAction.actionOptions.subClientGroups = action.SubClientGroups;
    vmGoalAction.actionOptions.actionPlanRegions = serData.value.ActionPlanRegions;
    vmGoalAction.actionOptions.actionDefaultValue = serData.value.ActionDefaultValue;
    vmGoalAction.actionOptions.customViews = serData.value.CustomViews;
    vmGoalAction.actionOptions.actionStream = serData.value.ActionStream;
    vmGoalAction.actionOptions.actionTodoDataX = serData.value.ActionTodoDataX;
    //vmGoalAction.actionOptions.goalId = action.GoalId;
    vmGoalAction.actionOptions.isHasKpi = serData.value.IsHasKpi;
    vmGoalAction.actionOptions.isHasFibu = serData.value.IsHasFibu;

    vmGoalAction.actionOptions.customerJourneyGroups = action.CustomerJourneyGroups;

    $.extend(vmGoalAction.actionOptions, info);
    const title = `${kLg.titlepAddMainGoalNew1}${kLg.labelActionName}${kLg.titlepAddMainGoalNew2}`;
    vmGoalAction.showAddActionPopup(title);
};

vmGoalAction.openPopupAction = function (entryData, info, element) {
   // alert("vmGoalAction.openPopupAction");
    var e = { productid: 0, parentid: 0 };
    $.extend(e, element);
    vmGoalAction.regionId = info.RegionId;
    vmGoalAction.currency = {};
    vmGoalAction.dataservice.getAction(entryData, function (serData) {
        if (vmCommon.checkConflict(serData.value.ResultStatus)) {
            vmGoalAction.actionOptions = {
                IsEdit: true,
                Action: serData.value.TheObject,
                Templates: serData.value.Templates,
                RegionId: info.RegionId,
                Url: serData.value.Url
            };

            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

            vmGoalAction.currency.Name = info.CurrencyName;

            vmGoalAction.actionOptions.customConnection = info.IndependencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : vmGoalAction.customConnect(e, serData.value.CustomConnection);

            vmGoalAction.actionOptions.RegionSelectable = serData.value.RegionSelectable;
            vmGoalAction.actionOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
            vmGoalAction.actionOptions.CurrencyRates = serData.value.CurrencyRates;
            vmGoalAction.actionOptions.MasterGoal = serData.value.MasterGoal;
            vmGoalAction.actionOptions.HasMasterGoal = serData.value.HasMasterGoal;

            vmGoalAction.Role = serData.value.RoleId;
            vmGoalAction.actionOptions.isRedirect = true;
            vmGoalAction.actionOptions.SubProductGroups = serData.value.SubProductGroups;
            vmGoalAction.actionOptions.SubClientGroups = serData.value.SubClientGroups;
            vmGoalAction.actionOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
            vmGoalAction.actionOptions.ActionDefaultValue = serData.value.ActionDefaultValue;
            vmGoalAction.actionOptions.CustomViews = serData.value.CustomViews;
            vmGoalAction.actionOptions.ActionStream = serData.value.ActionStream;
            vmGoalAction.actionOptions.ActionTodoDataX = serData.value.ActionTodoDataX;
            vmGoalAction.actionOptions.GoalId = vmGoalAction.actionOptions.Action.GoalId;
            vmGoalAction.actionOptions.IsHasKpi = serData.value.IsHasKpi;
            vmGoalAction.actionOptions.IsHasFibu = serData.value.IsHasFibu;

            vmGoalAction.actionOptions.CustomerJourneyGroups = serData.value.CustomerJourneyGroups;

            $.extend(vmGoalAction.actionOptions, info);

            vmFile.setAssignedU(entryData.actionId, vmCommon.enumType.Action, vmGoalAction.Role);

            vmGoalAction.showAddActionPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(e.title) + kLg.titlepEditMainGoalNew2);
        }
    });
};

function getGoalFromActpopup(data) {
    if (data.EntryData.LandId == 0 && data.EntryData.RegionId == 0 && data.EntryData.ProductId == 0) {
        vmCommon.AddressBar.ClientQuery.resetAddressBar();
        return;
    }
    vmCommon.AddressBar.ClientQuery.Decode.setActpopup(data.UrlDecoded);
    var entryData = {
        goalId: data.EntryData.Id, independencyId: data.EntryData.IndependencyId, regionId: data.EntryData.RegionId, productId: data.EntryData.ProductId,
        subMarketId: data.EntryData.SubmarketId, subMarketProductId: data.EntryData.SubMarketProductId, goalType: data.EntryData.GoalType
    };
    var info = Object.assign({}, data.InfoData);
    info.IndependencyId = data.EntryData.IndependencyId;
    info.ProductId = data.EntryData.ProductId;
    info.RegionId = data.EntryData.RegionId;
    info.SubmarketId = data.EntryData.SubmarketId;
    info.SubMarketProductId = data.EntryData.SubMarketProductId;

    if (data.EntryData.GoalType == vmCommon.GoalActionContentType.MainGoal) {
        vmGoalAction.openPopupMainGoal(entryData, info, { productid: data.EntryData.ProductId, parentid: data.EntryData.ParentId, title: data.InfoData.TitleMainGoal ? data.InfoData.TitleMainGoal : kLg.labelMainGoalName });

    } else if (data.EntryData.GoalType == vmCommon.GoalActionContentType.SubGoal) {
        entryData.parentId = data.EntryData.ParentId;
        vmGoalAction.openPopupSubGoal(entryData, info, { productid: data.EntryData.ProductId, parentid: data.EntryData.ParentId, title: data.InfoData.TitleSubGoal ? data.InfoData.TitleSubGoal : kLg.labelSubGoalName });

        vmCommon.AddressBar.SubGoal = data.EntryData.Id;
    } else if (data.EntryData.GoalType == vmCommon.GoalActionContentType.Action) {
        var entryDt = {
            actionId: data.EntryData.Id, independencyId: data.EntryData.IndependencyId,
            regionId: data.EntryData.RegionId, productId: data.EntryData.ProductId,
            subMarketId: data.EntryData.SubmarketId, subMarketProductId: data.EntryData.SubMarketProductId,
            parentId: data.EntryData.ParentId
        }

        vmCommon.AddressBar.SubGoal = data.EntryData.ParentId;
        vmCommon.AddressBar.Action = data.EntryData.Id;
        vmGoalAction.openPopUpAction2({
            actionId: data.EntryData.Id,
            subMarketProductId: data.EntryData.SubMarketProductId,
            independencyId: data.EntryData.IndependencyId,
            parentId: data.EntryData.ParentId,
            isEdit: true,
            title: kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2
        });
        //vmGoalAction.openPopupAction(entryDt, info, { productid: data.EntryData.ProductId, parentid: data.EntryData.ParentId, title: data.InfoData.TitleAction ? data.InfoData.TitleAction : kLg.labelActionName })
    }

};

vmGoalAction.setLimitedDateGoal = function (parentId, mtype) {
    var mgoal = vmGoalAction.findGoalById(parentId, mtype);
    var fixDate;
    if (mgoal && mgoal.ListSubGoal) {
        if (mgoal.ListSubGoal.length > 0) {
            var fistSub = mgoal.ListSubGoal[mgoal.ListSubGoal.length - 1];

            fixDate = fistSub.Date
                ? vmCommon.tryJsonToLocalDate(fistSub.Date)
                : (fistSub.StartDate ? vmCommon.tryJsonToLocalDate(fistSub.StartDate) : (mgoal.StartDate ? vmCommon.tryJsonToLocalDate(mgoal.StartDate) : new Date()));

            vmGoalAction.goalOptions.parentStart = fixDate;
            vmGoalAction.goalOptions.parentEnd = fixDate;
        } else {
            fixDate = mgoal.StartDate ? vmCommon.tryJsonToLocalDate(mgoal.StartDate) : new Date();

            vmGoalAction.goalOptions.parentStart = fixDate;
            vmGoalAction.goalOptions.parentEnd = fixDate;
        }

        vmGoalAction.goalOptions.parentMasterId = mgoal.MasterId;
    } else {
        vmGoalAction.goalOptions.parentStart = new Date();
        vmGoalAction.goalOptions.parentEnd = new Date();
        vmGoalAction.goalOptions.parentMasterId = null;
    }
}

vmGoalAction.findGoalById = function (gid, lst) {
    var mgoal = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].Id === gid) {
            mgoal = lst[i];
            break;
        }
    }

    return mgoal;
};

vmGoalAction.findSubGoalById = function (subid, lst) {
    var subgoal = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].Id === subid) {
            subgoal = lst[i];
            break;
        }
    }

    return subgoal;
}

vmGoalAction.findById = function (objid, lst) {
    var obj = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].Id == objid) {
            obj = lst[i];
            break;
        }
    }

    return obj;
}

vmGoalAction.findTitleSubmarketById = function (gid, lst) {
    var titlelang = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].SubMarketProductId == gid) {
            titlelang = lst[i];
            break;
        }
    }

    return titlelang;
};

vmGoalAction.findTitleGoalById = function (gid, lst) {
    var titlelang = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].GoalId == gid) {
            titlelang = lst[i];
            break;
        }
    }

    return titlelang;
};

vmGoalAction.findTitleIndependencyById = function (gid, lst) {
    var titlelang = undefined;
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].IndependencyId == gid) {
            titlelang = lst[i];
            break;
        }
    }

    return titlelang;
};

vmGoalAction.getTypeByInfo = function (minfo) {
    if (minfo.SubMarketProductId) {
        return vmGoalAction.enumGoalAction.SubMarketProduct;
    } else {
        return vmGoalAction.enumGoalAction.Independency;
    }
}

vmGoalAction.getSourceByInfo = function (minfo) {
    if (minfo.SubMarketProductId) {
        return vmGoalAction.goalsView[minfo.SubMarketProductId];
    } else {
        return vmGoalAction.goalsViewIndependency[minfo.IndependencyId];
    }
}

function getElementMainGoal(tr) {
    if (tr) {
        tempMainGoalId = tr.children(":eq(1)[mstype=mainGoal]").attr("goalid");
        if (tempMainGoalId === undefined) {
            getElementMainGoal(tr.prev());
        }
    }
    return tempMainGoalId;
}

vmGoalAction.toggleMarket = function (msrid, e) {
    return new Promise(reslv => {
        vmGoalAction.openMarket(msrid, e).then(function () {
            reslv(msrid, e);    // dainb
        });
        if ($(e).data("isOpened")) {    //TODO: open child
     //       vmGoalAction.openOnlyOne(e, vmCommon.collapseType.Market);
        }
    });
};

vmGoalAction.openMarket = function (msrid, e) {
    return new Promise((reslv) => {
        $(e).css({ 'pointer-events': 'none' });
        $(e).off('dblclick').dblclick(function () {
            return false;
        });
        setTimeout(function () {
            $(e).css({ 'pointer-events': 'auto' });
            reslv(msrid, e);
        }, 111);

        var area = $(e).closest(".areagroup").attr("id");       // area == goalActionView || regionoverview
        var isOpened = $(e).data("isOpened") ? true : false;

        void function toggleMarketIcon() {
            var marketIcon = $(e).find("span.market-icon.msaIcCollapExpand");
            $(marketIcon).toggleClass("font-arrow-right");
            $(marketIcon).toggleClass("font-arrow-down");
        }();
        $(e).data("isOpened", !isOpened);

        var contentMarket = $(e).closest("div.market-title").next("div.market-content");
        $(contentMarket).toggleClass("hidden");

        if (vmSetting.ProjectInfo.IsShowMarketLabel && area != "regionoverview") {
            if (isOpened) {
                vmGoalAction.expandService.remove(msrid, 3);
            } else {
                vmGoalAction.expandService.add(msrid, 3);
            }
        }
    });
};

vmCommon.collapseType = { Market: 1, Parent: 2, Child: 3, MainGoal: 4, SubGoal: 5 };
//vmGoalAction.openOnlyOne = function (e, level) {        //e: toggle element
//    //1: market, 2: parent, 3: child, 4: maingoal, 5: subgoal
//    //var marketLink, parentLink, childLink, mainGoalLink, subGoalLink;
//    if (level == vmCommon.collapseType.Market) {
//        //open market
//        if (!$(e).data("isOpened"))
//            $(e).click();           // vmGoalAction.toggleMarket

//        //open parent
//        if ($(e).attr("cn") == 1) {

//        }
//    }
//    else if (level == vmCommon.collapseType.Parent) {
//        //if (!$(e).data("isOpened")) $(e).click();

//    }
//    else if (level == vmCommon.collapseType.Child) {
//        var childId = $(e).attr("id");
//        var isMarketArea = isNaN(Number(childId));
//        var elementChildId = (isMarketArea ? "#collapseProd" : "#collapseChildIndepend") + childId;

//        vmGoalAction.expandService.addX(childId);

//    }
//    else if (level == vmCommon.collapseType.MainGoal) {

//    }
//};

//vmGoalAction.toggleProduct = function (submarketProductId, e, func) {

//};

vmGoalAction.dictMaingoalViewModel = vmGoalAction.dictMaingoalViewModel || {};

vmGoalAction.asignToggle = {
    CountAll: 0, CountChildrent: 0,
    resetAll: function () {
        this.CountAll = this.CountChildrent = 0;
    },
    isEqual: function (callBack) {
        if (this.CountAll > 0 && this.CountChildrent === this.CountAll) {
            if (callBack) callBack();
            return true;
        } else {
            return false
        }
    }
};
vmGoalAction.SelectorId.setDataCollapsed = function (e, goalview) {
    if (!e && vmGoalAction.SelectorId.mainGoal) {
        e = '#collapsed' + vmGoalAction.SelectorId.mainGoal;
    };
    var totalSubgoal = goalview.ListSubGoal.length;
    var totalAction = 0;
    var totalMainGoal = 0;
    if (goalview.Name != null) { totalMainGoal = 1; }
    if (totalSubgoal > 0) {
        for (var sgi = 0; sgi < goalview.ListSubGoal.length; sgi++) {
            if (goalview.ListSubGoal[sgi].Name == null) totalSubgoal--;
            totalAction += goalview.ListSubGoal[sgi].ListAction.length;
        }
    }
    var $parentCollapsedBar = $(e).closest('.parentCollapsedBar');
    $parentCollapsedBar.find('.msaMgCollapseBarName').first().text(goalview.Name || '');
    if (goalview.StartDate)
        $parentCollapsedBar.find('.msaMgCollapseBarStartDate').first().text(kendo.toString(goalview.StartDate.jsonToDate(), "d"));
    if (goalview.Date) {
        var endDate = kendo.toString(goalview.Date.jsonToDate(), "d");
        $parentCollapsedBar.find('.msaMgCollapseBarEndDate').first().html('&nbsp; &mdash; &nbsp;' + endDate)
    }

    var $msaMgCollapseBarCategory = $parentCollapsedBar.find('.msaMgCollapseBarCategory').first();
    if (goalview.Category) {
        $msaMgCollapseBarCategory.text(goalview.Category);
        $msaMgCollapseBarCategory.prev().removeClass('msa-opacity0')

    } else {
        $msaMgCollapseBarCategory.text('');
        $msaMgCollapseBarCategory.prev().addClass('msa-opacity0');
    }

    var $msaMgCollapseBarThePeople = $parentCollapsedBar.find('.msaMgCollapseBarThePeople').first();
    if (goalview.ThePeople) {
        $msaMgCollapseBarThePeople.text(goalview.ThePeople);
        $msaMgCollapseBarThePeople.prev().removeClass('msa-opacity0');
    } else {
        $msaMgCollapseBarThePeople.text('');
        $msaMgCollapseBarThePeople.prev().addClass('msa-opacity0');
    };

    var isCost = goalview.ActualCost != null && goalview.ActualCost != 0;
    //if (isCost) {
    //    //$parentCollapsedBar.find('.msaMgCollapseBar_C').first().text('C ');
    //    //$parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameC').text(goalview.CurrencyName);
    //   // $parentCollapsedBar.find('.msaMgCollapseBarActCost').first().text(vmCommon.formatCost(goalview.ActualCost));
    //} else {
    //    //$parentCollapsedBar.find('.msaMgCollapseBar_C').first().text('');
    //    //$parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameC').text('');
    //    //$parentCollapsedBar.find('.msaMgCollapseBarActCost').first().text('');
    //}

  //  isCost = goalview.ExpectedCost != null && goalview.ExpectedCost != 0;
    //if (isCost) {
    ////    $parentCollapsedBar.find('.msaMgCollapseBar_P').first().text('P ');
    //   // $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameP').text(goalview.CurrencyName);
    // //   $parentCollapsedBar.find('.msaMgCollapseBarExpCost').first().text(vmCommon.formatCost(goalview.ExpectedCost));
    //} else {
    // //   $parentCollapsedBar.find('.msaMgCollapseBar_P').first().text('');
    //  //  $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameP').text('');
    //  //  $parentCollapsedBar.find('.msaMgCollapseBarExpCost').first().text('');
    //}

    //var $msaMgCollapseBarBudget = $parentCollapsedBar.find('.msaMgCollapseBarBudget').first();
    //var $msaMgCollapseBarBudgetParent = $msaMgCollapseBarBudget.closest('.msaMgCollapseBarBudgetParent');
    //if (goalview.IsMasterGoal || !goalview.IsAssignMaster) {
    //    $msaMgCollapseBarBudget.text(vmCommon.formatOriginCost(goalview.MarkBudget));
    //    $parentCollapsedBar.find('.msaMgCollapseBar_O').first().text('O ');
    //    $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameO').first().text(goalview.MasterCurrency);
    //    if (goalview.MarkBudget && goalview.MarkBudget < 0) {
    //        $msaMgCollapseBarBudgetParent.addClass('exceeded-cost')
    //    } else {
    //        $msaMgCollapseBarBudgetParent.removeClass('exceeded-cost')
    //    };
    //} else if (goalview.Budget !== null && goalview.Budget > 0) {
    //    $msaMgCollapseBarBudget.text(vmCommon.formatOriginCost(goalview.Budget - goalview.ExpectedCost));
    //    $parentCollapsedBar.find('.msaMgCollapseBar_O').first().text('o ');
    //    $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameO').first().text(goalview.CurrencyName);
    //    if (getCssOverdueCost(goalview.ExpectedCost, goalview.Budget)) {
    //        $msaMgCollapseBarBudgetParent.addClass('exceeded-cost');
    //    } else {
    //        $msaMgCollapseBarBudgetParent.removeClass('exceeded-cost');
    //    };
    //} else {
    //    $msaMgCollapseBarBudget.text('');
    //    $parentCollapsedBar.find('.msaMgCollapseBar_O').first().text('');
    //    $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameO').first().text('');
    //};

   // isCost = goalview.Budget != null && goalview.Budget > 0;
   // var $msaMgCollapseBarOverdueCostEx = $parentCollapsedBar.find('.msaMgCollapseBarOverdueCostEx').first();
  //  if (isCost) {
      //  var $msaMgCollapseBarOverdueCostExPrt = $msaMgCollapseBarOverdueCostEx.closest('.msaMgCollapseBarOverdueCostExPrt');
        //if (getCssOverdueCostEx(goalview)) {
        //    $msaMgCollapseBarOverdueCostExPrt.addClass('exceeded-cost');
        //} else {
        //    $msaMgCollapseBarOverdueCostExPrt.removeClass('exceeded-cost');
        //}
        //$parentCollapsedBar.find('.msaMgCollapseBar_B').text('B ');
      //  $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameB').text(goalview.CurrencyName);
     //   $msaMgCollapseBarOverdueCostEx.text(vmCommon.formatCost(goalview.Budget));
  //  } else {
        //$parentCollapsedBar.find('.msaMgCollapseBar_B').text('');
       // $parentCollapsedBar.find('.msaMgCollapseBarCurrencyNameB').text('');
      //  $msaMgCollapseBarOverdueCostEx.text('');
  //  };

   // $(e).closest('div[mstype="mainGoal"]').find('.msa-sum-msa').html(totalMainGoal + ' | ' + totalSubgoal + ' | ' + totalAction);
};

vmGoalAction.toggleMaingoals = function (e, submarketProductId, goalId) {
    return;
    $('.msaToggleMaingoal').addClass('msa-pointer-none');
    var that = this;

    var isSubmarket = isNaN(submarketProductId);
    var data = isSubmarket
        ? vmGoalAction.goalsView[submarketProductId]
        : vmGoalAction.goalsViewIndependency[submarketProductId];
    var isEdit = isSubmarket
        ? $("#" + submarketProductId).closest("div[class='lr-row']").is("[ise]")
        : $("div[independencyid~='" + submarketProductId + "']").closest("div[parentname][parentid]").is("[ise]");
    var goalview = vmCommon.findByFunc(data, function (item) { return item.Id == goalId; });

    if (goalview) goalview.ListSubGoal.map(t => {
        t.isExpand = vmGoalAction.expandService.isSubGoalExpand(t.Id);
        var title = vmGoalAction.findTitleGoalById(t.Id, vmGoalAction.simpleView.ListTitle);
        t.titleAction = title ? title.TitleAction : kLg.labelActionName;
    });

    var collapseGoalIdSelector = '#collapseGoal' + goalId;
    var $collapseGoalgoalId = $(collapseGoalIdSelector);

    void function addHandlerExpandCollapseFirstTime() {
        $collapseGoalgoalId.off('hide.bs.collapse').on("hide.bs.collapse", function () {
            //$(this).find('.msaMgExpandCollapseClosets').hide();
            //void function setIconToggleAllMaingoal() {
            //    var $expandAll = $(e).closest('.msaProdGroupWrap').find('.msaToggleExpandMg').first();
            //    var $parentList = $(e).closest('.msaGrpCollapseMg');
            //    var sumChildExpanded = 0;

            //    $parentList.children().each(function () {
            //        var $_this = $(this);
            //        if ($_this.height() > $_this.children().first().height()) sumChildExpanded++;
            //    });

            //    $(e).closest('.msaProdGroupWrap').hasClass('hidden-kpi-icon') && $(e).closest('.msaProdGroupWrap').removeClass('hidden-kpi-icon');
            //    if (sumChildExpanded == 0) {
            //        $expandAll.addClass('font-arrow-right').removeClass('font-arrow-down');
            //        !$(e).closest('.msaProdGroupWrap').hasClass('hidden-kpi-icon') && $(e).closest('.msaProdGroupWrap').addClass('hidden-kpi-icon');
            //    };
            //}();

            void function cssToggle() {
                var $mainGoalParent = $(e).closest('.msaMaingoalParent');
                $mainGoalParent.find('.msaToggleMaingoal').first().children().each(function (idx) {
                    if (idx == 0) $(this).find('.msaMgIcCollapseExpand').first().removeClass('text-before-color-white');
                    if (idx == 1) {

                        $(this).children().first().css({ 'color': '', 'max-width': '', 'width': '', 'text-overflow': '' });
                    }
                    if (idx > 1) $(this).show();
                });
               // $mainGoalParent.children().first().children('.msaMgCollapseHead').removeClass('msa-mg-collapse-head')

                $mainGoalParent.find('.drpMenuMainGoal').next().css({ 'border-right-color': '#C1C1C1' }).children().show();
            }();
        });
        $collapseGoalgoalId.off('show.bs.collapse').on("show.bs.collapse", function () {
            $(this).find('.msaSubgoalMenuDrp').hide();

            //var $expandAll = $(e).closest('.msaProdGroupWrap').find('.msaToggleExpandMg');
            //$expandAll.addClass('font-arrow-down').removeClass('font-arrow-right');

            $(e).closest('.msaProdGroupWrap').hasClass('hidden-kpi-icon') && $(e).closest('.msaProdGroupWrap').removeClass('hidden-kpi-icon');

            void function cssToggle() {
                var $mainGoalParent = $(e).closest('.msaMaingoalParent');
                $mainGoalParent.find('.msaToggleMaingoal').first().children().each(function (idx) {
                    if (idx == 0) $(this).find('.msaMgIcCollapseExpand').first().addClass('text-before-color-white');
                    if (idx == 1) {

                        $(this).children().first().css({
                            'color': 'white', 'max-width': '230%', 'text-overflow': 'ellipsis', 'overflow': 'hidden', 'float' : 'left' });
                    }
                    if (idx > 1) $(this).hide();
                });

             //   $mainGoalParent.children().first().children('.msaMgCollapseHead').addClass('msa-mg-collapse-head')

                $mainGoalParent.find('.drpMenuMainGoal').next().css({ 'border-right-color': 'white' }).children().hide();
            }();
        });
        $collapseGoalgoalId.off('shown.bs.collapse').on("shown.bs.collapse", function (event) {
            event.stopPropagation();
            if ($(this).is($(event.target))) {
                vmGoalAction.expandService.add(goalId, 1000);
            };

            $(this).find('.msaSubgoalMenuDrp').show();
            enableExpandAll();
            $(e).find('.msaMgIcCollapseExpand').first().addClass('font-arrow-down').removeClass('font-arrow-right');

            if ($(this).is($(event.target))) {
                $(this).find('.msaSubgoalHeadMenuDrp').off('show.bs.dropdown').on('show.bs.dropdown', function (evt) {
                    $(this).closest('.msgGoalExpandView.collapse.in').removeClass('over-hidden');
                    var $this = $(this).children('.msaSgCustomDropdownMenu').first();
                    var menuItemPos = $this.offset();
                    var $ul = $(this).children('.dropdown-menu').last();
                    var ulHeight = $ul.outerHeight();

                    if (menuItemPos.top + 18 + ulHeight > $(window).height())
                        $ul.css({ top: (ulHeight + 5) * (-1) });
                    else
                        $ul.css({ top: '15px' });

                });
                $(this).find('.msaSubgoalHeadMenuDrp').off('hidden.bs.dropdown').on('hidden.bs.dropdown', function (evt) {
                    $(this).closest('.msgGoalExpandView.collapse.in').addClass('over-hidden');
                });

                //void function removeListItemInMenuMainSubGoalRoleNoAccess() {
                //    if (parseInt($(e).closest('div[mstype="smpArea"]').attr('data-product-roleid')) < 0) {
                //        var selector = '#collapseProd' + submarketProductId;
                //        $(selector).find('.liHideOnNoAccess').remove();
                //        $(selector).find('.ui-draggable').draggable({ disabled: true });
                //        $(selector).find('.ui-draggable').css({ 'overflow': 'unset' });
                //        $(selector).find('span[x]').off('dblclick');
                //    }
                //}();
            }

            if (vmGoalAction.kpRegionService.IdMain) {
                const _idMain = $(this).attr('id');
                if (_idMain.includes(vmGoalAction.kpRegionService.IdMain)) {
                    //console.log('$collapseGoalgoalId shown', $(this), _idMain, vmGoalAction.kpRegionService.IdMain, vmGoalAction.kpRegionService.IdSub);
                    if (typeof vmGoalAction.kpRegionService.FuncClickSub == 'function') {
                        vmGoalAction.kpRegionService.FuncClickSub();
                    } else if (typeof vmGoalAction.kpRegionService.FuncDirect == 'function') {
                        vmGoalAction.kpRegionService.FuncDirect();
                    }
                }
            }

        });
        $collapseGoalgoalId.off('hidden.bs.collapse').on("hidden.bs.collapse", function (event) {
            event.stopPropagation();
            if ($(this).is($(event.target))) {
                vmGoalAction.expandService.remove(goalId, 1000);
            };

            $(this).addClass('over-hidden');
            enableExpandAll();
            $(e).find('.msaMgIcCollapseExpand').first().addClass('font-arrow-right').removeClass('font-arrow-down');

            //var $child = $(this).find('.msaMgExpandCollapseClosets');
            //if ($child.length > 0) {
            //    $child.remove();
            //}
        });

        function enableExpandAll() {
            $('.msaToggleMaingoal').removeClass('msa-pointer-none');
            vmGoalAction.asignToggle.CountChildrent += 1;
            vmGoalAction.asignToggle.isEqual(function () {
                //var $expandAll = $(e).closest('.msaProdGroupWrap').find('.msaToggleExpandMg');
                //$expandAll.removeClass('msa-pointer-none');
            });
            (!!vmGoalAction.setHideGotoOtherTabInMenu) && vmGoalAction.setHideGotoOtherTabInMenu(); // backlog item 24222
        }
    }();

    var isCollapse = (!$collapseGoalgoalId.hasClass('in')) || $collapseGoalgoalId.height() < 1 || !vmGoalAction.expandService.isGoalExpand(goalId);

    $collapseGoalgoalId.attr({ 'data-bind': 'source: data, visible: isExpand', 'data-template': "temp-goal" });

    var findModel = that.dictMaingoalViewModel[goalId];

    var goalviewTitle = { goalview: [goalview], submarketProductId: submarketProductId, isEdit: isEdit };

    var isCollapse = (!$collapseGoalgoalId.hasClass('in')) || $collapseGoalgoalId.height() < 1 || vmGoalAction.expandService.isGoalExpand(goalId);
    if (!findModel) {
        findModel = kendo.observable({
            id: goalId,
            data: goalviewTitle,
            isExpand: isCollapse,
            updateData: function () {
                this.data.trigger('change');
                this.initToggle();
            },
            initToggle: initToggle
        });

        that.dictMaingoalViewModel[goalId] = findModel;
    }
    else {
        findModel.set('data', goalviewTitle);
        findModel.set('isExpand', isCollapse);
    }

    kendo.bind($collapseGoalgoalId, findModel);

  //  vmGoalAction.openOnlyOne(e, vmCommon.collapseType.MainGoal);

    function initToggle() {
        return;
        //vmGoalAction.setupDescriptionTooltip();
        //vmGoalActionDragDrop.DragDropTable();

        var subTitle = vmGoalAction.findTitleGoalById(goalId, vmGoalAction.simpleView.ListTitle);
        vmGoalAction.bindLabelMSA(submarketProductId, subTitle, goalId);

        vmGoalAction.kpRegionService.init(submarketProductId, data);

        vmGoalAction.apLinkOverviewService.init(submarketProductId);

        var $parentItem = $(e).closest('.msaMaingoalParent');
        var $liAddSub = $parentItem.find('span.' + submarketProductId + 'asg');
        var subgoalTitleName = $parentItem.find('.msaSubgoalTitle').children().text();
        if (subgoalTitleName)
            $liAddSub.text(kLg.addSG1 + subgoalTitleName + kLg.addSG2);

        //save expand
        var isGoalNavExpand = $("div[gnavid~='" + goalId + "']").last().find("a[class~='collapsed']").length === 0;
        isGoalNavExpand = isCollapse;
        if (isGoalNavExpand) {
            handleMouse(true);
            void function hideButtonAddOnHeaderMainSub() {
                var area = $(e).closest(".areagroup").attr("id");
                if (area == "regionoverview") {
                    var selector = '#collapseProd' + submarketProductId;
                    $(selector).find('.msaHideOnRegionOverview').hide();
                }
            }();
        }

        void function handleSigleDoubleClickSubgoal() {
            $('.msaSubgoalToggle').off('click').click(function () {
                var $this = $(this);
                setTimeout(function () {
                    var dblclick = parseInt($this.data('double'), 10);
                    if (dblclick > 0) {
                        $this.data('double', dblclick - 1);
                    } else {
                        var $headScroll = $this.closest('.msaCollapseSubgoal').toggleClass('msa-collapse-subgoal');
                        if ($headScroll.hasClass('msa-collapse-subgoal')) {
                            $this.closest('.msa-subgoal-table').find('.msaGroupActionScrollView').hide();
                            // show tooltip
                            $headScroll.find('.msaSubgoalNavBarTitle').each(function () {
                                if ($(this).data('kendoTooltip') == undefined) {
                                    $(this).kendoTooltip({
                                        autoHide: true,
                                        content: $(this).attr('data-tooltip'),
                                        width: 300,
                                        position: "bottom"
                                    });
                                }
                            });
                        } else {
                            $this.closest('.msa-subgoal-table').find('.msaGroupActionScrollView').show();
                            // destroy tooltip
                            if ($headScroll.find('.msaSubgoalNavBarTitle').first().data('kendoTooltip')) {
                                $headScroll.find('.msaSubgoalNavBarTitle').first().data('kendoTooltip').destroy();
                            }
                        };

                        $this.closest('table').toggleClass('msa-border-bottom');
                        //$icon = $this.find('.msaSgArrowCollapseExpand');
                        //$icon.toggleClass('text-before-color-white');
                        //$icon.toggleClass('msa-colorc1');
                        //$icon.toggleClass('font-arrow-down');
                        //$icon.toggleClass('font-arrow-right');

                        var subgoalId = $this.attr('id').split('collapseSubgoal')[1];
                        //vmGoalAction.expandService.toggleSubgoalNav(subgoalId, true);

                        var subTitle = vmGoalAction.findTitleGoalById(subgoalId, vmGoalAction.simpleView.ListTitle);
                        vmGoalAction.bindLabelMSA(null, subTitle, subgoalId);

                        //void function setIconToggleAllsubgoal() {
                        //    var $parent = $this.closest('.msaSubgoalWrap').parent();
                        //    var sumChild = $parent.children('.msaSubgoalWrap').length;
                        //    var sumChildCollapsed = $parent.find('.msa-collapse-subgoal').length;

                        //    var $msasubgoalexpandall = $this.closest('.msaMgExpandGetTitle').find('.onClickSubgoalToggleAll');
                        //    if (sumChild == sumChildCollapsed) {
                        //        $msasubgoalexpandall.addClass('font-arrow-right').removeClass('font-arrow-down');
                        //    } else {
                        //        $msasubgoalexpandall.addClass('font-arrow-down').removeClass('font-arrow-right');
                        //    }
                        //}();

                        handleMouse();

                        if (vmGoalAction.kpRegionService.IdSub) {
                            const _idSub = $this.attr('id');
                            if (_idSub.includes(vmGoalAction.kpRegionService.IdSub) && typeof vmGoalAction.kpRegionService.FuncDirect == 'function') {
                                vmGoalAction.kpRegionService.FuncDirect(); //console.log(_idSub, vmGoalAction.kpRegionService.IdSub);
                            }
                        }
                    }
                }, 300);
            }).off('dblclick').dblclick(function (elm) {
                $(this).data('double', 2);
                // show edit
                var $menuEdit = $(this).next().find('.msaCollapsedEditSubgoal').first();
                $menuEdit = $($menuEdit.get(0));
                if ($menuEdit) $menuEdit.click();
            });
        }();

        function handleMouse(isFirst) {
            var $parent = $(e).closest('.collapsed-maingoal');
            $parent.find('.msa-subgoal-rowchild, .row-child2, .maingoal-div.row-child').off('mouseleave').mouseleave(function () {
                $(this).children('.ms-dropdow').removeClass('open');
            });

            if (isFirst)
                void function setIconToggleAllsubgoal() {
                    var totalsubCollapsed = 0, $lstSub = $parent.find('.msaSubgoalWrap').children('table');
                    $lstSub.each(function (idx) {
                        if ($(this).children('thead').hasClass('msa-collapse-subgoal'))
                            totalsubCollapsed++;
                    });
                    var $msasubgoalexpandall = $parent.find('.onClickSubgoalToggleAll');
                    if ($lstSub.length == totalsubCollapsed) {
                        $msasubgoalexpandall.addClass('font-arrow-right').removeClass('font-arrow-down');
                    } else {
                        $msasubgoalexpandall.addClass('font-arrow-down').removeClass('font-arrow-right');
                    }
                }();

        };

    }

    initToggle();
};

vmGoalAction.toggleExpandMg = function (el) {
    var $this = $(el);
    var $parentList = $this.closest('.msaProdGroupWrap').find('.msaGrpCollapseMg');

    if ($parentList.height() < 3) return;

    void function disableClickAndDblClick() {
        $this.addClass('msa-pointer-none');
        $this.off('dblclick').dblclick(function () {
            return false;
        });
    }();

    var $parent = $this.closest('.msaProdGroupWrap').find('.msaGrpCollapseMg');

    var sumChildExpanded = 0;
    $parentList.find('.msgGoalExpandView.collapse').each(function () {
        if ($(this).height() > 3) {
            sumChildExpanded += 1;
        }
    });
    vmGoalAction.asignToggle.resetAll();
    if (sumChildExpanded == 0) {
       
        return;
    };


};

vmGoalAction.onClickSubgoalToggleAll = function (el) {
    var $this = $(el);
    var sumChildCollapsed = $this.closest('.msa-mg-expand').find('.msa-collapse-subgoal').length;
    var sumChild = $this.closest('.msa-mg-expand').find('.msaSubgoalWrap').length;

    if (!sumChild) return; // khong co list action

};

vmGoalAction.openKpiGoalAction = function () {
    vmGoalAction.popKpiGoalAction = showPopup(vmGoalAction.popKpiGoalAction,
        $("#popkpigoalaction"),
        vmCommon.rootUrl + "Contents/MsPopKpiGoalAction.html",
        {
            title: "",
            width: 860,
            height: 512,
            resizable: false,
            animation: false
        }
    );
};

vmGoalAction.closeKpiGoalAction = function () {
    if (vmGoalAction.popKpiGoalAction) {
        vmGoalAction.destroyKpiGoalAction();
    }
};

vmGoalAction.destroyKpiGoalAction = function () {
    if (vmGoalAction.popKpiGoalAction) {
        vmGoalAction.popKpiGoalAction.destroy();
        vmGoalAction.popKpiGoalAction = null;
        $(".body-content").after("<div id='popkpigoalaction'></div>");
    }
};

vmGoalAction.openPopConnectionOverview = function (id, typeid, areaId) {
    var title = kLg.lblApConnection;
    if (vmGoalAction.popConnectionOverview) {
        vmGoalAction.popConnectionOverview.vueVM != undefined && vmGoalAction.popConnectionOverview.vueVM != null
            && vmGoalAction.popConnectionOverview.vueVM.reload();
    }
    else {
        vmGoalAction.popConnectionOverview = showPopup(vmGoalAction.popConnectionOverview,
            $("#popConnectionOverview"),
            vmCommon.rootUrl + "Contents/MsPopConnectionOverview.html",
            {
                title: title,
                width: 860,
                height: 512,
                resizable: false,
                close: function () {
                    MsaApp.closeApLinkOverviewUrl();
                }
            }
        );

        vmGoalAction.popConnectionOverview.id = id;
        vmGoalAction.popConnectionOverview.typeId = typeid;
        vmGoalAction.popConnectionOverview.areaId = areaId;

        if (typeof MsaApp !== 'object')
            $(".k-overlay").css({ "opacity": "0" });
    }
};

vmGoalAction.closePopConnectionOverview = function () {
    if (vmGoalAction.popConnectionOverview) {
        vmGoalAction.destroyPopConnectionOverview();
    }
};

vmGoalAction.destroyPopConnectionOverview = function () {
    if (vmGoalAction.popConnectionOverview) {
        vmGoalAction.popConnectionOverview.destroy();
        vmGoalAction.popConnectionOverview = null;
        $(".body-content").after("<div id='popConnectionOverview'></div>");
    }
};

vmGoalAction.kpRegionService = function () {
    var areas = {}; masterData = {};

    var getExpandData = function (masterid, regionid, type) {
        var kpiRegions = masterData[masterid];
        if (kpiRegions == undefined || kpiRegions.length == 0) return null;

        var kpiRegion = vmCommon.findByFunc(kpiRegions, function (it) { return it.Id == regionid; });
        if (kpiRegion == null) return null;

        return type == -1 ? kpiRegion : vmCommon.findByFunc(kpiRegion.PercentItems, function (it) { return it.TypeId == type; });
    };

    var clearExpandData = function (area) {
        delete areas[area.AreaId];
    };

    var getAreaData = function (areaid) {
        var area = areas[areaid];
        if (area == undefined) {
            area = { AreaId: areaid, isOpenMenu: false, isOpenIcon: false };
            areas[areaid] = area;
        }

        return area;
    };

    var bindArea = function (area) {
        //bind menu
        if (area.isOpenMenu) {
            var expandData = getExpandData(area.MasterId, area.RegionId, area.Type);

            if (expandData == null || expandData.Blocks.length == 0) {
                clearExpandData(area);
                vmGoalAction.destroyKpiGoalAction();
                return;
            }

            vmGoalAction.kpiGaOptions = {};
            vmGoalAction.kpiGaOptions.AreaId = area.AreaId;
            vmGoalAction.kpiGaOptions.Data = expandData;

            vmGoalAction.openKpiGoalAction();
        } else {
            if (area.isOpenIcon) {
                vmGoalAction.destroyKpiGoalAction();
                vmGoalAction.closePopConnectionOverview();
            }
        }
    };

    var close = function (areaid) {
        var area = getAreaData(areaid);
        area.isOpenMenu = false;
        area.isOpenIcon = false;

        area.MasterId = undefined;
        area.RegionId = undefined;
        area.Type = undefined;

        bindArea(area);

        $('.kpigapopover-sticky').find('.icon-kr-item').attr('data-smkpid', '0');
        $('.kpigapopover-sticky').find('.icon-kr-item').hide();
        if ($('.kpigapopover-sticky').find('.icon-link-item').css('display') == 'none') {
            $('.kpigapopover-sticky').hide();
        } else {
            $('.kpigapopover-sticky').show();
        }
    };

    var collapse = function (areaid) {
        var area = getAreaData(areaid);
        area.isOpenMenu = false;
        area.isOpenIcon = true;

        bindArea(area);
        $('.kpigapopover-sticky').show();
        $('.kpigapopover-sticky').find('.icon-kr-item').show();
    };

    var expand = function (areaid, masterid, regionid, type) {      // vmGoalAction.kpRegionService.expand
        var area = getAreaData(areaid);
        area.isOpenMenu = true;
        area.isOpenIcon = false;

        if (masterid != undefined) area.MasterId = masterid;
        if (regionid != undefined) area.RegionId = regionid;
        if (type != undefined) area.Type = type;

        bindArea(area);
        $('.kpigapopover-sticky').find('.icon-kr-item').hide();
        $('.kpigapopover-sticky').hide();
    };

    var init = function (areaid, goalview) {                        // vmGoalAction.kpRegionService.init, areaid = smpid
        for (var i = 0; i < goalview.length; i++) {
            var main = goalview[i];
            if (!main.IsMasterGoalKpi) continue;

            var subs = main.ListSubGoal;
            for (var j = 0; j < subs.length; j++) {
                var sub = subs[j];

                masterData[sub.Id] = sub.KpiRegions;
            }
        }

        var area = getAreaData(areaid);
        bindArea(area);
    };

    var moveNew = function (gElement, tolerance) {
        var id = $(gElement).attr('data-id');
        vmGoalAction.redirectToNew(id)
    };

    var move = function (gElement, tolerance) {
        var scrollTop = $(".body-content").scrollTop();
        $(".body-content").animate({ scrollTop: $(gElement).offset().top - 132 + scrollTop });
    };

    var redirect = function (ga, gatypeid, isResetFilterToDefault) {        // Hàm này được gọi từ popup MsPopKpiGoalAction.html
        //TODO: 1. close navigator form, 2. redirect
        var smpId = ga.SubMarketProductId;
        var indId = ga.ThemaId;
        var isMarketArea = ga.SubMarketProductId != null && ga.SubMarketProductId != vmCommon.emptyGuid;

        var childid = isMarketArea ? smpId : indId;

        if (vmSetting.ProjectInfo.IsShowMarketLabel) {
            var msrid = $("#" + childid).closest("div.market-content").attr("msrid");
            if (!$("div.market-content[msrid='" + msrid + "']").is(":visible")) {
                $("a.market-link[msrid='" + msrid + "']").click();       // vmGoalAction.toggleMarket
            }
        }

        var parentid = $("#" + childid).closest("div[mstype='parentArea']").attr("parentid");
        
        //expand parent
        var tp = (isMarketArea ? "s" : "i") + parentid;
        
        //expand child
        var childContentId = isMarketArea ? "collapseProd" + smpId : "collapseChildIndepend" + indId;
        const $childContent = $("#" + childContentId);
        
        var isOpen = $childContent.hasClass("in");
        var isHasData = $childContent.data("hasData") ? true : false;

        //expand navigator
        var navigatorId = gatypeid == vmCommon.GoalActionContentType.MainGoal ? ga.Id : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.ParentId : ga.GrandId;
        var isOpening = $("div#collapseGoal" + navigatorId).hasClass("in");

        function getElement() {
            var gElement;
            switch (gatypeid) {
                case vmCommon.GoalActionContentType.Action:
                    gElement = $("div[actionid='" + ga.Id + "']");
                    break;
                case vmCommon.GoalActionContentType.SubGoal:
                    gElement = $("thead[data-id='" + ga.Id + "']");
                    break;
                case vmCommon.GoalActionContentType.MainGoal:
                    gElement = $("div[goalid='" + ga.Id + "']");
                    break;
                default:
            }
            return gElement && gElement.length > 0 ? gElement : null;
        };

        if (!isOpen) {
            var timeout = isHasData ? 50 : 3000;
            if (!isHasData) setTimeout(function () {
                if (vmGoalAction.popKpiGoalAction != undefined && $childContent.length > 0 && !isResetFilterToDefault) {
                    vmGoalAction.popKpiGoalAction.close();
                }
            }, timeout);

            var childLink = $("a[href='#" + childContentId + "']");
            if (childLink.length == 0) {
                //reset filter to: all land, all region
                msFilter.controlService.resetFilterToDefault().then(function (res) {
                    redirect(ga, gatypeid, true);
                });
                return;
            }

            Promise.all([$("a[href='#" + childContentId + "']").click()]).then((values) => {     // vmGoalAction.toggleProduct || vmGoalAction.toggleChildIndependency
                if (!isOpening) {
                    vmGoalAction.kpRegionService.FuncClickMain = function () {
                        if ($("a#collapsed" + navigatorId).length > 0) {
                            vmGoalAction.kpRegionService.IdMain = navigatorId;      // console.trace();
                   //         $("a#collapsed" + navigatorId).click();     // vmGoalAction.toggleMaingoals
                        }
                    }
                }
                
                //open sugoal navigation
                if (gatypeid == vmCommon.GoalActionContentType.Action || gatypeid == vmCommon.GoalActionContentType.SubGoal) {
                    vmGoalAction.kpRegionService.FuncClickSub = function () {
                        var subNavigatorId = gatypeid == vmCommon.GoalActionContentType.Action ? ga.ParentId : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.Id : null;
                        var subNav = $("thead[data-id='" + subNavigatorId + "']");
                        var subIsOpen = !$(subNav).hasClass("msa-collapse-subgoal");
                        if (!subIsOpen) {
                            vmGoalAction.kpRegionService.IdSub = subNavigatorId;            // console.trace();
                            $("#collapseSubgoal" + subNavigatorId).click();
                        }
                    }
                }

                vmGoalAction.kpRegionService.FuncDirect = function () {
                    var gElement = getElement();
                    var tolerance = !isOpening ? $("div#collapseGoal" + navigatorId).height() + $(gElement).height() : 0;
                    setTimeout(function () {
                        moveNew(gElement, tolerance);
                    }, 400);
                }
            });
        } else {
            if (!isOpening)
                $("a#collapsed" + navigatorId).click();

            //open sugoal navigation
            if (gatypeid == vmCommon.GoalActionContentType.Action || gatypeid == vmCommon.GoalActionContentType.SubGoal) {
                var subNavigatorId = gatypeid == vmCommon.GoalActionContentType.Action ? ga.ParentId : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.Id : null;
                var subNav = $("thead[data-id='" + subNavigatorId + "']");

                var subIsOpen = !$(subNav).hasClass("msa-collapse-subgoal");
                if (!subIsOpen)
                    $("#collapseSubgoal" + subNavigatorId).click();
            }

            var gElement = getElement();
            var tolerance = !isOpening ? $("div#collapseGoal" + navigatorId).height() + $(gElement).height() : 0;
            setTimeout(function () {
                moveNew(gElement, tolerance);
            }, 400);
        }
    };

    var edit = function (ga, gatypeid, areaid) {
        //collapse(areaid);
        vmGoalAction.fitCriterias = [];
        vmGoalAction.openArea = ga.ThemaId ? vmGoalAction.enumArea.Independency : vmGoalAction.enumArea.Submarket;

        var info = {
            SubMarketProductId: ga.SubMarketProductId || undefined,
            IndependencyId: ga.ThemaId || undefined,
            RegionId: ga.RegionId || undefined,
            CurrencyName: ga.Currency,
            ProductId: ga.ProductId,
            SubMarketId: ga.SubMarketId,
            IsMasterGoal: false
        };
        vmGoalAction.currency = {};
        vmGoalAction.RegionId = info.RegionId;
        vmGoalAction.currency.Name = info.CurrencyName;

        //editaction
        if (gatypeid == vmCommon.GoalActionContentType.Action) {
            var entryData = { actionId: ga.Id, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId, subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, parentId: ga.GoalId };
            vmGoalAction.dataservice.getAction(entryData, function (serData) {

                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                    vmGoalAction.actionOptions = {
                        IsEdit: true,
                        Action: serData.value.TheObject,
                        Templates: serData.value.Templates,
                        RegionId: info.RegionId,
                        Url: serData.value.Url
                    };

                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

                    vmGoalAction.Role = serData.value.RoleId;

                    if (info.IndependencyId) {
                        //vmFilter.bindIndependencyConnection(serData.value.CustomConnection);
                        vmGoalAction.actionOptions.customConnection = vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection);
                    } else {
                        //vmFilter.customConnection = [];
                        var proId = info.ProductId;
                        var subId = info.SubMarketId;

                        var temp;
                        if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
                            temp = $.grep(serData.value.CustomConnection, function (item) {
                                return (item.Type === 1 && item.SubProductId !== Number(subId)) || (item.Type === 2 && item.SubProductId !== Number(proId));
                            });
                        } else {
                            temp = serData.value.CustomConnection;
                        }

                        var newId = 1;
                        $.each(temp, function (index, item) {
                            item.Id = newId++;
                        });

                        vmGoalAction.actionOptions.customConnection = temp;
                    }

                    vmGoalAction.actionOptions.KpiRegionArea = areaid;

                    vmGoalAction.actionOptions.RegionSelectable = serData.value.RegionSelectable;
                    vmGoalAction.actionOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                    vmGoalAction.actionOptions.CurrencyRates = serData.value.CurrencyRates;
                    vmGoalAction.actionOptions.MasterGoal = serData.value.MasterGoal;
                    //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
                    vmGoalAction.actionOptions.HasMasterGoal = serData.value.HasMasterGoal;

                    vmGoalAction.actionOptions.SubProductGroups = serData.value.SubProductGroups;
                    vmGoalAction.actionOptions.SubClientGroups = serData.value.SubClientGroups;

                    vmGoalAction.actionOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                    vmGoalAction.actionOptions.ActionDefaultValue = serData.value.ActionDefaultValue;
                    vmGoalAction.actionOptions.CustomViews = serData.value.CustomViews;
                    vmGoalAction.actionOptions.ActionStream = serData.value.ActionStream;
                    vmGoalAction.actionOptions.ActionTodoDataX = serData.value.ActionTodoDataX;
                    vmGoalAction.actionOptions.GoalId = vmGoalAction.actionOptions.Action.GoalId;

                    vmGoalAction.actionOptions.IsHasKpi = serData.value.IsHasKpi;
                    vmGoalAction.actionOptions.IsHasFibu = serData.value.IsHasFibu;

                    vmGoalAction.actionOptions.CustomerJourneyGroups = serData.value.CustomerJourneyGroups;

                    $.extend(vmGoalAction.actionOptions, info);

                    vmFile.setAssignedU(entryData.actionId, vmCommon.enumType.Action, vmGoalAction.Role);

                    var smkId = info.SubMarketProductId;
                    var inpId = info.IndependencyId;
                    var title = "";
                    var spanId = "";
                    if (inpId == undefined) {
                        spanId = smkId + "tac";

                    } else {
                        spanId = inpId + "tac";
                    }

                    title = $('#' + spanId).text();

                    vmGoalAction.showAddActionPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);
                }
            });

        } else {
            var entryData = { goalId: ga.Id, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId, subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, parentId: ga.ParentId, goalType: ga.ParentId && ga.ParentId != vmCommon.emptyGuid ? vmCommon.GoalActionContentType.SubGoal : vmCommon.GoalActionContentType.MainGoal };
            vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                    vmGoalAction.goalOptions = {
                        IsEdit: true,
                        Goal: serData.value.TheObject,
                        Url: serData.value.Url,
                        IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
                    };

                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

                    vmGoalAction.Role = serData.value.RoleId;

                    if (info.IndependencyId) {
                        //vmFilter.bindIndependencyConnection(serData.value.CustomConnection);
                        vmGoalAction.goalOptions.customConnection = vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection);
                    } else {

                        //vmFilter.customConnection = [];
                        var proId = info.ProductId;
                        var subId = info.SubMarketId;

                        var temp;
                        if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
                            temp = $.grep(serData.value.CustomConnection, function (item) {
                                return (item.Type === 1 && item.SubProductId !== Number(subId)) || (item.Type === 2 && item.SubProductId !== Number(proId));
                            });
                        } else {
                            temp = serData.value.CustomConnection;
                        }

                        var newId = 1;
                        $.each(temp, function (index, item) {
                            item.Id = newId++;
                        });

                        vmGoalAction.goalOptions.customConnection = temp;
                        //vmFilter.customConnection = temp;
                    }

                    vmGoalAction.goalOptions.KpiRegionArea = areaid;
                    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
                    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
                    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
                    vmGoalAction.goalOptions.IsMasterGoal = false;

                    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                    //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
                    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

                    $.extend(vmGoalAction.goalOptions, info);
                    vmGoalAction.goalOptions.GoalType = (gatypeid == vmCommon.GoalActionContentType.MainGoal) ? vmCommon.GoalType.MainGoal : vmCommon.GoalType.SubGoal;

                    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

                    //manh: file
                    vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);

                    var smkId = info.SubMarketProductId;
                    var inpId = info.IndependencyId;
                    var title = "";
                    var spanId = "";
                    if (inpId == undefined) {
                        spanId = smkId + "tmg";

                    } else {
                        spanId = inpId + "tmg";
                    }

                    title = $('#' + spanId).text();

                    vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);
                }
            });
        }
    };

    return { init: init, expand: expand, collapse: collapse, close: close, scroll: scroll, redirect: redirect, edit: edit, move: move };
}();

vmGoalAction.apLinkOverviewService = function () {
    var areas = {}; masterData = {};

    var getAreaData = function (areaid) {
        var area = areas[areaid];
        if (area == undefined) {
            area = { AreaId: areaid, isShowPopup: false, isShowIcon: false, goalActionId: null, linkTypeId: 0 };
            areas[areaid] = area;
        }
        return area;
    };

    var getAreaInfoOpen = function () {
        var keys = Object.keys(areas);
        var rs = null;
        var temp = null;

        for (var i = 0, l = keys.length; i < l; i++) {
            temp = areas[keys[i]];
            if (temp.isShowPopup) {
                rs = temp;
                break;
            }
        }
        return rs;
    };

    var bindArea = function (area) {
        //var iconLink = 'linkoverview-navigate-icon' + area.AreaId;
        ////bind icon
        //if (area.isShowIcon) {
        //    $("#" + iconLink).closest("div.icon-link-item").removeClass("visibility-hidden");
        //    $("#" + iconLink).closest('.icon-kr-goal').children('.visibility-hidden').length != 2 && $("#" + iconLink).closest('.kpigapopover').removeClass('visibility-hidden');
        //    $("#" + iconLink).closest("div.icon-link-item").attr({ "linkId": area.goalActionId, "linkType": area.linkTypeId });
        //} else {
        //    $("#" + iconLink).closest("div.icon-link-item").addClass("visibility-hidden");
        //    $("#" + iconLink).closest('.icon-kr-goal').children('.visibility-hidden').length == 2 && $("#" + iconLink).closest('.kpigapopover').addClass('visibility-hidden');
        //}

        //bind menu
        if (area.isShowPopup) {
            vmGoalAction.openPopConnectionOverview(area.goalActionId, area.linkTypeId, area.AreaId);
        } else {
            if (area.isShowIcon) {
                vmGoalAction.closePopConnectionOverview();
            }
        }
    };

    var close = function (areaid) {
        var area = getAreaData(areaid);
        area.isShowPopup = false;
        area.isShowIcon = false;

        area.MasterId = undefined;
        area.RegionId = undefined;
        area.Type = undefined;

        area.goalActionId = null;
        area.linkTypeId = 0;

        bindArea(area);
        $('.kpigapopover-sticky').find('.icon-link-item').attr('data-smkpid', '0');
        $('.kpigapopover-sticky').find('.icon-link-item').attr('linkid', '0');
        $('.kpigapopover-sticky').find('.icon-link-item').attr('linktype', '0');
        $('.kpigapopover-sticky').find('.icon-link-item').hide();
        if ($('.kpigapopover-sticky').find('.icon-kr-item').css('display') == 'none') {
            $('.kpigapopover-sticky').hide();
        } else {
            $('.kpigapopover-sticky').show();
        }
    };

    var collapse = function (areaId, goalActionId, linkTypeId) {
        var area = getAreaData(areaId);
        area.isShowPopup = false;
        area.isShowIcon = true;

        area.goalActionId = goalActionId;
        area.linkTypeId = linkTypeId;

        bindArea(area);
        $('.kpigapopover-sticky').show();
        $('.kpigapopover-sticky').find('.icon-link-item').show();
    };

    var expand = function (areaId, goalActionId, linkTypeId) {  //vmGoalAction.apLinkOverviewService.expand
        var area = getAreaData(areaId);
        area.isShowPopup = true;
        area.isShowIcon = false;

        area.goalActionId = goalActionId;
        area.linkTypeId = linkTypeId;

        bindArea(area);
        $('.kpigapopover-sticky').find('.icon-link-item').hide();
        $('.kpigapopover-sticky').hide();
    };

    var init = function (areaid) {
        var area = getAreaData(areaid);

        var openArea = getAreaInfoOpen();
        if (openArea && openArea.AreaId != area.AreaId) {
            bindArea(openArea);
        }
        else {
            bindArea(area);
        }
    };

    var scrollItem = function (area) {
        var $areaId = $("#kpi-navigate-icon" + area.AreaId);
        var divIcon = $areaId.closest("div.icon-kr-goal");

        var $grpPrd = $areaId.closest(".msaMaingoalParent");
        if ($grpPrd.length < 1) return;

        if (divIcon.length > 0) {
            var posTop = $grpPrd.offset() ? $grpPrd.offset().top : 0;
            var newIconPos = 0;

            if (posTop < 100) {
                newIconPos = Math.abs(posTop - 132 + 40);
            };
            if (posTop < 270 - $grpPrd.height()) {
                newIconPos = $grpPrd.height() - 200;
            };

            var $item = $areaId.closest('.msaMaingoalParent');
            var delta = 0;
            if ($grpPrd.offset() && $item.offset()) {
                delta = $item.offset().top - $grpPrd.offset().top;
            };

            newIconPos -= delta;
            $(divIcon).css({ "margin-top": (newIconPos) + "px" });
        }
    };

    var scroll = function () {
        for (pro in areas) {
            scrollItem(areas[pro]);
        }
    };

    var moveNew = function (gElement, tolerance) {
        var id = $(gElement).attr('data-id');
        vmGoalAction.redirectToNew(id)
    };

    var move = function (gElement, tolerance) {
        var scrollTop = $(".body-content").scrollTop();
        $(".body-content").animate({ scrollTop: $(gElement).offset().top - 132 + scrollTop });
    };

    var redirect = function (ga, gatypeid, isResetFilterToDefault) {
        //TODO: 1. close navigator form, 2. redirect
        var smpId = ga.SubMarketProductId;
        var indId = ga.ThemaId;
        var isMarketArea = ga.SubMarketProductId != null && ga.SubMarketProductId != vmCommon.emptyGuid;

        var childid = isMarketArea ? smpId : indId;

        if (vmSetting.ProjectInfo.IsShowMarketLabel) {
            var msrid = $("#" + childid).closest("div.market-content").attr("msrid");
            if (!$("div.market-content[msrid='" + msrid + "']").is(":visible")) {
                $("a.market-link[msrid='" + msrid + "']").click();          // vmGoalAction.toggleMarket
            }
        }

        var parentid = $("#" + childid).closest("div[mstype='parentArea']").attr("parentid");

        //expand parent
        var tp = (isMarketArea ? "s" : "i") + parentid;
        //expand child
        var childContentId = isMarketArea ? "collapseProd" + smpId : "collapseChildIndepend" + indId;
        var isOpen = $("#" + childContentId).hasClass("in");
        var isHasData = $("#" + childContentId).data("hasData") ? true : false;

        //expand navigator
        var navigatorId = gatypeid == vmCommon.GoalActionContentType.MainGoal ? ga.Id : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.ParentId : ga.GrandId;
        var isOpening = $("div#collapseGoal" + navigatorId).hasClass("in");

        function getElement() {
            var gElement;
            switch (gatypeid) {
                case vmCommon.GoalActionContentType.Action:
                    gElement = $("div[actionid='" + ga.Id + "']");
                    break;
                case vmCommon.GoalActionContentType.SubGoal:
                    gElement = $("thead[data-id='" + ga.Id + "']");
                    break;
                case vmCommon.GoalActionContentType.MainGoal:
                    gElement = $("div[goalid='" + ga.Id + "']");
                    break;
                default:
            }
            return gElement && gElement.length > 0 ? gElement : null;
        };

        if (!isOpen) {
            var timeout = isHasData ? 50 : 3000;
            if (!isHasData) setTimeout(function () {
                if (vmGoalAction.popKpiGoalAction != undefined && $("#" + childContentId).length > 0 && !isResetFilterToDefault) {
                    vmGoalAction.popKpiGoalAction.close();
                }
            }, timeout);

            var childLink = $("a[href='#" + childContentId + "']");
            if (childLink.length == 0) {
                //reset filter to: all land, all region
                msFilter.controlService.resetFilterToDefault().then(function (res) {
                    redirect(ga, gatypeid, true);
                });
                return;
            }

            Promise.all([$("a[href='#" + childContentId + "']").click()]).then((values) => {     // vmGoalAction.toggleProduct || vmGoalAction.toggleChildIndependency
                if (!isOpening) {
                    vmGoalAction.kpRegionService.FuncClickMain = function () {
                        if ($("a#collapsed" + navigatorId).length > 0) {
                            vmGoalAction.kpRegionService.IdMain = navigatorId;      // console.trace();
                     //       $("a#collapsed" + navigatorId).click();     // vmGoalAction.toggleMaingoals
                        }
                    }
                }

                //open sugoal navigation
                if (gatypeid == vmCommon.GoalActionContentType.Action || gatypeid == vmCommon.GoalActionContentType.SubGoal) {
                    vmGoalAction.kpRegionService.FuncClickSub = function () {
                        var subNavigatorId = gatypeid == vmCommon.GoalActionContentType.Action ? ga.ParentId : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.Id : null;
                        var subNav = $("thead[data-id='" + subNavigatorId + "']");
                        var subIsOpen = !$(subNav).hasClass("msa-collapse-subgoal");
                        if (!subIsOpen) {
                            vmGoalAction.kpRegionService.IdSub = subNavigatorId;            // console.trace();
                            $("#collapseSubgoal" + subNavigatorId).click();
                        }
                    }
                }

                vmGoalAction.kpRegionService.FuncDirect = function () {
                    var gElement = getElement();
                    var tolerance = !isOpening ? $("div#collapseGoal" + navigatorId).height() + $(gElement).height() : 0;
                    setTimeout(function () {
                        moveNew(gElement, tolerance);
                    }, 400);
                }
            });
        } else {
            if (!isOpening)
                $("a#collapsed" + navigatorId).click();

            //open sugoal navigation
            if (gatypeid == vmCommon.GoalActionContentType.Action || gatypeid == vmCommon.GoalActionContentType.SubGoal) {
                var subNavigatorId = gatypeid == vmCommon.GoalActionContentType.Action ? ga.ParentId : gatypeid == vmCommon.GoalActionContentType.SubGoal ? ga.Id : null;
                var subNav = $("thead[data-id='" + subNavigatorId + "']");

                var subIsOpen = !$(subNav).hasClass("msa-collapse-subgoal");
                if (!subIsOpen)
                    $("#collapseSubgoal" + subNavigatorId).click();
            }

            var gElement = getElement();
            var tolerance = !isOpening ? $("div#collapseGoal" + navigatorId).height() + $(gElement).height() : 0;
            setTimeout(function () {
                moveNew(gElement, tolerance);
            }, 400);
        }
    };

    var edit = function (ga, gatypeid, areaid) {
        //collapse(areaid);
        vmGoalAction.fitCriterias = [];
        vmGoalAction.openArea = ga.ThemaId ? vmGoalAction.enumArea.Independency : vmGoalAction.enumArea.Submarket;

        var info = {
            SubMarketProductId: ga.SubMarketProductId || undefined,
            IndependencyId: ga.ThemaId || undefined,
            RegionId: ga.RegionId || undefined,
            CurrencyName: ga.Currency,
            ProductId: ga.ProductId,
            SubMarketId: ga.SubMarketId,
            IsMasterGoal: false
        };
        vmGoalAction.currency = {};
        vmGoalAction.RegionId = info.RegionId;
        vmGoalAction.currency.Name = info.CurrencyName;

        //editaction
        if (gatypeid == vmCommon.GoalActionContentType.Action) {
            var entryData = { actionId: ga.Id, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId, subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, parentId: ga.GoalId };
            vmGoalAction.dataservice.getAction(entryData, function (serData) {

                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                    vmGoalAction.actionOptions = {
                        IsEdit: true,
                        Action: serData.value.TheObject,
                        Templates: serData.value.Templates,
                        RegionId: info.RegionId,
                        Url: serData.value.Url
                    };

                    info.CurrencyName = serData.value.AreaInfo.Currency;
                    vmGoalAction.currency.Name = serData.value.AreaInfo.Currency;

                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
                    vmGoalAction.Role = serData.value.RoleId;

                    if (info.IndependencyId) {
                        //vmFilter.bindIndependencyConnection(serData.value.CustomConnection);
                        vmGoalAction.actionOptions.customConnection = vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection);
                    } else {
                        //vmFilter.customConnection = [];
                        var proId = info.ProductId;
                        var subId = info.SubMarketId;

                        var temp;
                        if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
                            temp = $.grep(serData.value.CustomConnection, function (item) {
                                return (item.Type === 1 && item.SubProductId !== Number(subId)) || (item.Type === 2 && item.SubProductId !== Number(proId));
                            });
                        } else {
                            temp = serData.value.CustomConnection;
                        }

                        var newId = 1;
                        $.each(temp, function (index, item) {
                            item.Id = newId++;
                        });

                        vmGoalAction.actionOptions.customConnection = temp;
                    }

                    vmGoalAction.actionOptions.KpiRegionArea = areaid;

                    vmGoalAction.actionOptions.RegionSelectable = serData.value.RegionSelectable;
                    vmGoalAction.actionOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                    vmGoalAction.actionOptions.CurrencyRates = serData.value.CurrencyRates;
                    vmGoalAction.actionOptions.MasterGoal = serData.value.MasterGoal;
                    //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
                    vmGoalAction.actionOptions.HasMasterGoal = serData.value.HasMasterGoal;

                    vmGoalAction.actionOptions.SubProductGroups = serData.value.SubProductGroups;
                    vmGoalAction.actionOptions.SubClientGroups = serData.value.SubClientGroups;

                    vmGoalAction.actionOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                    vmGoalAction.actionOptions.ActionDefaultValue = serData.value.ActionDefaultValue;
                    vmGoalAction.actionOptions.CustomViews = serData.value.CustomViews;
                    vmGoalAction.actionOptions.ActionStream = serData.value.ActionStream;
                    vmGoalAction.actionOptions.ActionTodoDataX = serData.value.ActionTodoDataX;
                    vmGoalAction.actionOptions.GoalId = vmGoalAction.actionOptions.Action.GoalId;

                    vmGoalAction.actionOptions.IsHasKpi = serData.value.IsHasKpi;
                    vmGoalAction.actionOptions.IsHasFibu = serData.value.IsHasFibu;

                    vmGoalAction.actionOptions.CustomerJourneyGroups = serData.value.CustomerJourneyGroups;

                    $.extend(vmGoalAction.actionOptions, info);

                    vmFile.setAssignedU(entryData.actionId, vmCommon.enumType.Action, vmGoalAction.Role);

                    var smkId = info.SubMarketProductId;
                    var inpId = info.IndependencyId;
                    var title = "";
                    var spanId = "";
                    if (inpId == undefined) {
                        spanId = smkId + "tac";

                    } else {
                        spanId = inpId + "tac";
                    }

                    title = $('#' + spanId).text();

                    vmGoalAction.showAddActionPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);

                }
            });


        } else {
            var entryData = { goalId: ga.Id, independencyId: info.IndependencyId, regionId: info.RegionId, productId: info.ProductId, subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId, parentId: ga.ParentId, goalType: ga.ParentId && ga.ParentId != vmCommon.emptyGuid ? vmCommon.GoalActionContentType.SubGoal : vmCommon.GoalActionContentType.MainGoal };
            vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                    vmGoalAction.goalOptions = {
                        IsEdit: true,
                        Goal: serData.value.TheObject,
                        Url: serData.value.Url,
                        IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
                    };

                    info.CurrencyName = serData.value.AreaInfo.Currency;
                    vmGoalAction.currency.Name = serData.value.AreaInfo.Currency;

                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

                    vmGoalAction.Role = serData.value.RoleId;

                    if (info.IndependencyId) {
                        //vmFilter.bindIndependencyConnection(serData.value.CustomConnection);
                        vmGoalAction.goalOptions.customConnection = vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection);
                    } else {

                        //vmFilter.customConnection = [];
                        var proId = info.ProductId;
                        var subId = info.SubMarketId;

                        var temp;
                        if (vmGoalAction.openArea === vmGoalAction.enumArea.Submarket) {
                            temp = $.grep(serData.value.CustomConnection, function (item) {
                                return (item.Type === 1 && item.SubProductId !== Number(subId)) || (item.Type === 2 && item.SubProductId !== Number(proId));
                            });
                        } else {
                            temp = serData.value.CustomConnection;
                        }

                        var newId = 1;
                        $.each(temp, function (index, item) {
                            item.Id = newId++;
                        });

                        vmGoalAction.goalOptions.customConnection = temp;
                        //vmFilter.customConnection = temp;
                    }

                    vmGoalAction.goalOptions.KpiRegionArea = areaid;
                    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
                    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
                    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
                    vmGoalAction.goalOptions.IsMasterGoal = false;

                    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                    //vmFilter.HasMasterGoal = serData.value.HasMasterGoal;
                    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

                    $.extend(vmGoalAction.goalOptions, info);
                    vmGoalAction.goalOptions.GoalType = (gatypeid == vmCommon.GoalActionContentType.MainGoal) ? vmCommon.GoalType.MainGoal : vmCommon.GoalType.SubGoal;

                    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

                    //manh: file
                    vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);

                    var smkId = info.SubMarketProductId;
                    var inpId = info.IndependencyId;
                    var title = "";
                    var spanId = "";
                    if (inpId == undefined) {
                        spanId = smkId + "tmg";

                    } else {
                        spanId = inpId + "tmg";
                    }

                    title = $('#' + spanId).text();

                    vmGoalAction.showAddGoalPopup(kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2);
                }
            });
        }
    };

    return { init: init, expand: expand, collapse: collapse, close: close, scroll: scroll, redirect: redirect, edit: edit, move: move };
}();

//Task: 8119
vmGoalAction.goalFilterService = function () {
    var dataFilter = {}, sourceFilter = {}, emptyFilter = {}, dragFilter = {};

    var invisibleItem = function (id) {
        var strId = (isNaN(Number(id)) ? "#collapseProd" : "#collapseChildIndepend") + id;
        var isSelectEmpty = checkExist(-1, dataFilter[id]);

        var els = $(strId).find("td[mstype='mainGoal']");

        for (var i = 0; i < els.length; i++) {
            var el = els[i], parent = $(el).closest("tr"), temp = [parent];
            var rowCount = Number($(el).attr("rowspan"));
            if (rowCount > 1) {
                var nextTr = parent;
                for (var j = 0; j < rowCount - 1; j++) {
                    nextTr = nextTr.next();

                    temp.push(nextTr);
                }
            }

            var isShow = checkExist($(el).attr("goalId"), dataFilter[id])
                || (isSelectEmpty && checkExist($(el).attr("goalId"), emptyFilter[id]));

            if (!isShow) {
                for (var k = 0; k < temp.length; k++) {
                    $(temp[k]).hide();
                }
            } else {
                for (var l = 0; l < temp.length; l++) {
                    $(temp[l]).show();
                }
            }
        }

        var emptyRows = $(strId).find("tbody td.empty-row");
        if ($(strId).closest("div[mstype='childArea']").is("[ise]") && $(strId).find("tbody tr.data-row:visible").length === 0 && emptyRows.length === 0) {
            $(strId + " tbody").append('<tr><td class="empty-row ui-droppable" colspan="3"></td></tr>');

           // vmGoalActionDragDrop.DragDropTable();
        }
        else if ($(strId).find("tbody tr.data-row:visible").length > 0 && emptyRows.length > 0) {
            $(emptyRows).closest("tr").remove();
        }
    };

    var onFinish = function (e) {

    };

    var onClose = function (e) {

    }

    var bindGoalFilter = function (id, goalview, isUpdate) {
        var divId = "actionplan-navigate-menu" + id;
        bindTemplate(divId, "template-actionplan-navigate-goals", goalview);


        return;


        var src = [], srcEmpty = [], val = [], emptyRow = { Id: -1, Name: htmlEncode("<p>&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp</p>") };

        var isNotName = false, indexNotName = 0;
        for (var i = 0; i < goalview.length; i++) {
            var goal = { Id: goalview[i].Id, Name: goalview[i].Name, Index: goalview[i].MIndex };

            if (goalview[i].Name) {
                src.push(goal);
            } else {
                srcEmpty.push(goal);

                if (isNotName) {
                    continue;
                }

                indexNotName = i;
                isNotName = true;
            }
        }

        if (isNotName) {
            src.splice(indexNotName, 0, emptyRow);
        }

        emptyFilter[id] = srcEmpty;
        sourceFilter[id] = src;

        if (isUpdate) {
            val = vmCommon.deepCopy(dataFilter[id]);
        } else {
            val = vmCommon.deepCopy(src);

            if (!isNotName) {
                val.push(emptyRow);
            }

            dataFilter[id] = val;
        }

        $("#select" + id).kendoMultiSelect({
            dataTextField: "Name",
            dataValueField: "Id",
            dataSource: src,
            value: val,
            change: function () {
                dataFilter[id] = this.dataItems();
                invisibleItem(id);

                //
                var temp = [];
                for (var j = 0; j < dataFilter[id].length; j++) {
                    temp.push(dataFilter[id][j].Id);
                }

                var flag = isNaN(Number(id));
                vmGoalAction.dataservice.saveGoalFilter({ SmpId: flag ? id : null, indId: flag ? null : id, goalIds: temp.join() });
            }
        });

        $("#" + divId).closest("div.pop-filter-goal").draggable({
            containment: $("#select" + id).closest(".panel"),
            axis: "x",
            cursor: "move",
            cancel: "div.k-multiselect",
            stop: function () {
                var dragOff = $(this).offset();
                dragFilter[id] = { IsShow: false, PX: dragOff.left, PY: dragOff.top };
            }
        });

        invisibleItem(id);
    };

    var updateItemFilter = function (id, item) {
        var temp = dataFilter[id] || [];

        var isExist = false;
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].Id === item.Id) {
                temp[i] = item;
                isExist = true;
                break;
            }
        }

        if (!isExist) {
            temp.push(item);
        }

        dataFilter[id] = temp;
    };

    var addItemFilter = function (id, item) {
        var temp = dataFilter[id] || [];

        if (!checkExist(item.Id, temp)) {
            temp.push(item);
        }

        dataFilter[id] = temp;
    };

    var removeItemFilter = function (id, item) {
        var temp = dataFilter[id] || [];

        for (var i = 0; i < temp.length; i++) {
            if (temp[i].Id === item.Id) {
                temp.splice(i, 1);
                break;
            }
        }

        dataFilter[id] = temp;
    };

    return {
        bindGoalFilter: bindGoalFilter,
        updateItemFilter: updateItemFilter,
        addItemFilter: addItemFilter,
        removeItemFilter: removeItemFilter,
        onFinish: onFinish,
        onClose: onClose
    };
}();

function checkExist(id, lst) {
    if (lst !== null && lst !== undefined) {
        for (var i = 0; i < lst.length; i++) {
            if (lst[i].Id === id) {
                return true;
            }
        }
    }
    return false;
};

vmGoalAction.bindLabelMSA = function (submarketProductId, titlelang, goalId) {
    submarketProductId = goalId ? goalId : submarketProductId;

    var spanMainGoalId = submarketProductId + "tmg";
    var spanSubGoalId = submarketProductId + "tsg";
    var spanActionId = submarketProductId + "tac";
    //var spanAddSubGoalId = submarketProductId + "asg";
    var spanAddActionId = submarketProductId + "aac";

    var titleMainGoal = (titlelang && titlelang.TitleMainGoal) ? titlelang.TitleMainGoal : kLg.labelMainGoalName;
    var titleMSubGoal = (titlelang && titlelang.TitleSubGoal) ? titlelang.TitleSubGoal : kLg.labelSubGoalName;
    var titleAction = (titlelang && titlelang.TitleAction) ? titlelang.TitleAction : kLg.labelActionName;

    var spanText = goalId ? 'span[goaltid="' : 'span[class="';
    if ($(spanText + spanMainGoalId + '"]').length > 0) {
        $(spanText + spanMainGoalId + '"]').text(titleMainGoal);

    }
    if ($(spanText + spanSubGoalId + '"]').length > 0) {
        $(spanText + spanSubGoalId + '"]').text(titleMSubGoal);
    }
    if ($(spanText + spanActionId + '"]').length > 0) {
        $(spanText + spanActionId + '"]').text(titleAction);
    }

    if ($('span.' + spanAddActionId).length > 0) {
        $('span.' + spanAddActionId).text(kLg.addSG1 + (titleAction || kLg.labelActionName) + kLg.addSG2);
    }

    //if (vmGoalAction.Role >= vmCommon.MemberRole.Edit) {
    //    bindConvertToInput();
    //}
}

//vmGoalAction.toggleParent = function (e) {
//    $(e).off('dblclick').dblclick(function () {
//        return false;
//    });

//    var area = $(e).closest(".areagroup").attr("id");
//    var isMarketArea = area == "regionoverview" || area == "goalActionView";

//    var dataId = $(e).attr("data-id");

//    var $content = null;
//    if (isMarketArea) {
//        var block = $(e).closest("div.marketgroup");
//        $content = $(block).find((isMarketArea ? "#collapseSubmarket" : "#collapseParentIndepend") + dataId);
//    } else {
//        $content = $("#collapseParentIndepend" + dataId);
//        sortableThema($("a[href='#collapseParentIndepend" + dataId + "']"));
//    }

//    //open child
//    if ($content.length == 0) return;

//    var typeId = isMarketArea ? 1 : 2;
//    var isOpened = $(e).data("isOpened") ? true : false;

//    $(e).data("isOpened", !isOpened);

//    $content.removeClass('dnb-display-none');
//    var $icCollapse = $(e).find(".msaParentCollapseExpand");
//    if (isOpened) {
//        // collapse
//        $content.hide();
//        $icCollapse.addClass('font-arrow-right').removeClass('font-arrow-down');
//    } else {
//        // expand
//        $content.show();
//        $icCollapse.addClass('font-arrow-down').removeClass('font-arrow-right');
//    }

//    if (area != "regionoverview") {
//        if (isOpened) {
//            vmGoalAction.expandService.remove(dataId, typeId);
//            return;
//        }
//        else
//            vmGoalAction.expandService.add(dataId, typeId);
//    }

//    if (!isOpened)
//        vmGoalAction.openOnlyOne(e, vmCommon.collapseType.Parent);
//};

function sortableThema(e) {
    function changePositionIndependencyId(sourceId, sourceMdf, desId, desMdf, position, parentId, listsource) {
        vmGoalAction.PreventFFClickAfterDrag = true;
        var url = "../Handlers/MsGoalAction.ashx?funcName=changePosThema&projid=" + projectId + "&strid=" + strategyId;

        var obj = { Moving: { DesId: desId, SourceId: sourceId, Position: position, ParentSourceId: parentId, SourceMdf: sourceMdf, DesMdf: desMdf }, SortObjs: listsource };
        callAjax("loading-goalaction", url, JSON.stringify(obj), function (data) {

            var rs = data.value;
            if (rs.ResultStatus == -6) {
                pAlert(kLg.msgNoRole).then(function () {
                    location.reload();
                });
            }
            else if (rs.ResultStatus < 0) {
                pAlert(kLg.msgConflictData).then(function () {
                    location.reload();
                });
            } else {
                msFilter.controlService.reLoadDataFilter();

                $("div.panel-group[mstype='childArea'][childid='" + rs.SrcId + "']").attr("mindex", rs.NewIndex);
                if (rs.IsReset) {
                    var i = 0;
                    $("#collapseParentIndepend" + parentId).find("div.panel-group[mstype='childArea']").each(function () {
                        i += 1000;
                        $(this).attr("mindex", i);
                    });
                }
            }

            setTimeout(function () { vmGoalAction.PreventFFClickAfterDrag = false; }, 100);
        }, AjaxConst.PostRequest);
    }

    var srcIndex = 0, desIndex = 0, sortAreaId = $(e).attr("href"), ovarId, preListThema = [];

    $($(e).attr("href")).sortable({
        revert: false,
        axis: "y",
        items: "div.panel-group[mstype='childArea'][ise]",
        cancel: "div.itemDraggable,td[mstype='mainGoal'],td[mstype='subGoal'],div[mstype='action'],table",
        scroll: true,

        scrollSensitivity: 0,
        helper: function (event, ui) {
            var $clone = $(ui).clone();
            $clone.css("position", "absolute");
            return $clone.get(0);
        },
        //helper: "clone",
        start: function (event, ui) {
            preListThema = [];

            ovarId = $(e).closest('div[mstype=parentArea]').attr("parentid");
            $(sortAreaId).find("div.panel-group[mstype='childArea']").each(function () {
                preListThema.push({ Id: $(this).attr("childid"), Mdf: $(this).attr("mdf"), MIndex: $(this).attr("mindex") });
            });

            srcIndex = ui.item.index();

        },
        stop: function (event, ui) {
            desIndex = ui.item.index();

            var srcObj = preListThema[srcIndex], desObj = preListThema[desIndex];
            var pos = desIndex > srcIndex ? 1 : 0;

            if (srcObj.Id === desObj.Id) {
                return;
            }

            changePositionIndependencyId(srcObj.Id, srcObj.Mdf, desObj.Id, desObj.Mdf, pos, ovarId, preListThema);
        }
    });

    //--end LongDm--

}

vmGoalAction.sortAction = function (e) {

    var isHasAction = parseInt($(e).attr('data-actions')) > 1;//$(elem).next().find("div[mstype='action']").length > 1;
    if (!isHasAction) return;

    var subId = $(e).attr('data-id');
    var info = vmGoalAction.getChildElem(e);
    vmGoalAction.dataservice.sortAction({ subgoalid: subId }, function (res) {
        if (res.value > 0) {
      //      vmGoalAction.bindChild(info.SubMarketProductId, info.IndependencyId);
            vmGoalAction.expandService.addSubgoalNavItem(subId);
        }

    });
};

vmGoalAction.deleteGoal = function (e) {
    var $parentElement = $(e).parents('td[isgoal=true]') || $(e).parents('div[isgoal=true]'),
        mstype = $(e).attr('data-mstype') || $parentElement.attr('mstype'),
        message = '',
        masterIds = [];
    var info = vmGoalAction.getChildElem(e);
    var goalId = $(e).attr('data-id') || $parentElement.attr('data-id'),
        mdf = $(e).attr('data-mdf') || $parentElement.attr('mdf');

    var entryData = { goalId: goalId, mdf: mdf };
    
    var smkId = info.SubMarketProductId;
    var inpId = info.IndependencyId;
    var titleMainGoal = "";
    var titleSubGoal = "";
    var spanMGId = "";
    var spanSGId = "";
    if (inpId == undefined) {
        spanMGId = smkId + "tmg";
        spanSGId = smkId + "tsg";
    } else {
        spanMGId = inpId + "tmg";
        spanSGId = inpId + "tsg";
    }

    titleMainGoal = $('#' + spanMGId).text();
    titleSubGoal = $('#' + spanSGId).text();

    if (mstype === "mainGoal") {
        message = kLg.confirmDeleteMG1 + titleMainGoal + kLg.confirmDeleteMG2;

        //task: 7382
        var maingoal = vmGoalAction.findGoalById(goalId, vmGoalAction.getSourceByInfo(info));
        if (maingoal == undefined) {
            return;
        }

        if (maingoal.MasterId) {
            masterIds.push(maingoal.MasterId);
        }

        for (var i = 0; i < maingoal.ListSubGoal.length; i++) {
            var subgoal = maingoal.ListSubGoal[i];

            if (subgoal.MasterId) {
                if (masterIds.indexOf(subgoal.MasterId) === -1) {
                    masterIds.push(subgoal.MasterId);
                }
            }

            for (var j = 0; j < subgoal.ListAction.length; j++) {
                var action = subgoal.ListAction[j];
                if (action.MasterId) {
                    if (masterIds.indexOf(action.MasterId) === -1) {
                        masterIds.push(action.MasterId);
                    }
                }
            }
        }

    } else if (mstype === "subGoal") {
        entryData.mdf = $(e).attr('data-mdf');
        message = kLg.confirmDeleteSG1 + titleSubGoal + kLg.confirmDeleteSG2;
        var maingoalId = $parentElement.attr('parentId');
        var maingoal2 = vmGoalAction.findGoalById(maingoalId, vmGoalAction.getSourceByInfo(info));
        if (maingoal2 == undefined) {
            return;
        }

        var subgoal2 = vmGoalAction.findSubGoalById(goalId, maingoal2.ListSubGoal);
        if (subgoal2 == undefined) {
            return;
        }

        if (subgoal2.MasterId) {
            masterIds.push(subgoal2.MasterId);
        }

        for (var k = 0; k < subgoal2.ListAction.length; k++) {
            var action2 = subgoal2.ListAction[k];
            if (action2.MasterId) {
                if (masterIds.indexOf(action2.MasterId) === -1) {
                    masterIds.push(action2.MasterId);
                }
            }
        }

    }

    pConfirm(message)
        .then(function () {
            //delete before update 2 db
            var $collapseMaingoal = $(e).closest('.collapsed-maingoal');
            if (mstype === "subGoal") {
                $collapseMaingoal = $(e).closest('.msaSubgoalWrap');
            };
            $collapseMaingoal.hide();
            if (mstype == undefined) { mstype = "subGoal" }
            vmFile.checkEnableDeleteFileMarketing(entryData.goalId, mstype.toLowerCase()).then(t => {
                vmGoalAction.dataservice.deleteGoal(entryData, function (serData) {
                    
                    if (mstype === "mainGoal") {
                        var pid = smkId || inpId;
                        vmGoalAction.goalFilterService.removeItemFilter(pid, { Id: goalId });
                    }

                    vmFile.deleteMultiFileMarketing(t).then(x => {
                        msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, function () {
                            if (!vmGoalAction.checkRole(serData)) return;

                        });
                    });

                    if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                        MsaApp.deleteEvalXYZ(entryData.goalId)
                    }
                });
            });
        });
};

vmGoalAction.deleteColumn = function (e) {
    var that = this;
    vmGoalAction.getOpenArea(e);
    var info = vmGoalAction.getChildElem(e);
    var goalId = $(e).attr("data-subgoalid") || vmCommon.emptyGuid;
    var columnId = $(e).attr("data-columnid") || 0;

    pConfirm(kLg.confirmDeleteAc1 + kLg.confirmDeleteAc2)
        .then(function () {
            var entryData = { ActionPlanColunmId: columnId, GoalId: goalId };
            vmGoalAction.dataservice.deleteColumn(entryData, function (serData) {

                msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, function () {
                    
                });
            });
        });
}

vmGoalAction.openPopEditColumn = function (id, goalId, mainGoalId, isExpand) {
    
    vmCommon.currentMarket = { Id: id, GoalId: goalId, MainGoalId: mainGoalId };
    vmCommon.popEditType = showPopup(vmCommon.popEditType, $('#popCustomerJourneySeAssignColunm'),
        vmCommon.rootUrl + 'Contents/MsPopCustomerJourneySeAssignColunm.html',
        {
            height: 304,
            width: 500,
            resizable: false
        });

    var title = id == 0 ? kLg.addNewColumn : kLg.editColumn;

    vmCommon.popEditType.title(htmlDecode(title));

    vmCommon.popEditType.CallbackFunc = function (columnId) {       // delegate/callback
        if (typeof MsaApp == 'object') {
            if (isExpand == false && id == 0) {
                MsaApp.pushExpand(goalId, 'subgoal');       // expand subgoal
            }
            if (id != 0) {
                MsaApp.pushLoadTimeActions('MsPopCustomerJourneySeAssignColunm_html_Edit');
            } else if (id == 0 && columnId) {            // add new column
                const __key = `vmGoalAction_openPopEditColumn_addColumn_${columnId}`;
                MsaApp.setMapDelegate(__key, function () {
                    MsaApp.scrollX(`[direction-id=column_${columnId}]`, function donex() {
                        MsaApp.scrollY(`[direction-id=column_${columnId}]`, function doney() {
                            MsaApp.deleteMapDelegate(__key);
                        });
                    });
                });
            }
            MsaApp.reloadAllDataOfPage(id != 0 ? 'openPopEditColumn_updateColumn' : 'openPopEditColumn_addColumn').then(() => {
                console.log('a ====> callback from MsPopCustomerJourneySeAssignColunm.html', columnId);
                
                MsaApp.canReaction();
            });
        }
    };
};

vmGoalAction.deleteAction = function (e) {
    var $parentElement = $(e).parents("div[mstype~='action']");
    var info = vmGoalAction.getChildElem(e);
    var smkId = info.SubMarketProductId;
    var inpId = info.IndependencyId;
    var titleAction = "";
    var spanAcId = "";
    if (inpId == undefined) {
        spanAcId = smkId + "tac";
    } else {
        spanAcId = inpId + "tac";
    }

    titleAction = $('#' + spanAcId).text();

    pConfirm(kLg.confirmDeleteAc1 + titleAction + kLg.confirmDeleteAc2)
        .then(function () {
            //task: 7382
            var actionId = $parentElement.attr('actionId'),
                mdf = $parentElement.attr('mdf');

            var columnid = $($parentElement).closest('div[mstype="column"]').attr('data-columnid');
            var subId = $($(e).parents('td').prev()[0]).attr("data-id");
            var mainId = $($(e).parents('td').prev()[0]).attr("parentid");

            var maingoal = vmGoalAction.findGoalById(mainId, vmGoalAction.getSourceByInfo(info));

            var subgoal = undefined;
            if (maingoal) {
                subgoal = vmGoalAction.findSubGoalById(subId, maingoal.ListSubGoal);
            }

            if (subgoal === undefined || subgoal === null) {
                return;
            }

            var action = vmGoalAction.findById(actionId, subgoal.ListAction);

            var masterIds = [];
            //master bubget
            masterIds = masterIds.concat(vmCommon.selectProperty(action.MasterBudgets || [], "MasterId")).unique();
            //master kpi
            masterIds = masterIds.concat(vmGoalAction.getMasterKpiForAction(smkId, inpId, subgoal.Id)).unique();

            var entryData = { actionId: actionId, mdf: mdf };

            vmFile.checkEnableDeleteFileMarketing(entryData.actionId, 'action').then(t => {

                vmGoalAction.dataservice.deleteAction(entryData, function (serData) {
                    if (!vmGoalAction.checkRole(serData)) return;

                    vmFile.deleteMultiFileMarketing(t).then((x) => {

                        if (vmCommon.checkConflict(serData.value)) {
                            msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, function () {

                            });

                            if (columnid) {
                                vmGoalAction.redirectTo(columnid);
                            }
                        }
                    });
                    vmGoalAction.expandService.addSubgoalNavItem(subId);

                    if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                        MsaApp.deleteEvalXYZ(entryData.actionId)
                    }
                });
            });
        });
};


vmGoalAction.showEditIndependence = function (e, id) {
    vmGoalAction.IndepencencyOptions = {};

    vmGoalAction.listRegions = null;
    if (!vmGoalAction.listRegions) {
        vmGoalAction.listRegions = [];

        var lands = vmGoalAction.setting.ListLandType.LandTypes;
        for (var j = 0; j < lands.length; j++) {
            var land = lands[j];
            for (var k = 0; k < land.Regions.length; k++) {
                if (land.Regions[k].Id)
                    vmGoalAction.listRegions.push({ Name: land.Regions[k].Name, Id: land.Regions[k].Id, RoleId: 1 });
            }
        }

    }

    if (e) { //Update child thread
        var entryData = { id: id };
        
        var $childElem = $(e).parents('div[mstype=childArea]');
        var mdf = $childElem.attr("mdf");

        vmGoalAction.dataservice.getIndependencyById(entryData, function (serData) {
            if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                var independency = serData.value.TheObject;
                vmGoalAction.parentId = independency.ParentId;
                vmGoalAction.IsEditIndependency = true;
                vmGoalAction.IndepencencyOptions = {
                    Name: independency.Name,
                    Id: id,
                    Mdf: mdf,
                    Regions: independency.Regions || [],
                    SelectAllRegion: independency.SelectAllRegion,
                    Elem: $childElem,
                    IsMasterGoal: independency.IsMasterGoal,
                    IsMasterGoalKpi: independency.IsMasterGoalKpi,
                    CurrencyId: independency.CurrencyId,
                    CreatedBy: independency.CreatedBy,
                    IsEdit: independency.IsEdit,
                    IsCreater: independency.IsCreater,
                    Accounts: independency.Accounts,
                    ParentId: independency.ParentId
                };

                vmGoalAction.listRegions = vmGoalAction.IndepencencyOptions.IsCreater && vmGoalAction.IndepencencyOptions.IsEdit ? vmGoalAction.GetRegionRole(independency.CreatedBy, independency.Regions) : vmGoalAction.GetSelectedRegionRole(vmUser.currentAccount.Id, independency.Regions);
                vmGoalAction.showAddIndependencePopup(kLg.gaTitleEditOverallThread, 323);//SONPT. Need edit
            }
        });
    } else {
        if (id > 0) { // add child thread. id is parent thread Id
            // ajax get vmGoalAction.listRegions theo parent selected
            vmGoalAction.parentId = id;
            vmGoalAction.IsEditIndependency = false;
            vmGoalAction.showAddIndependencePopup(kLg.gaLblThread, 323);
        } else { // add overall thread and child
            if (vmGoalAction.listRegions.length) {
                vmGoalAction.parentId = 0;
                vmGoalAction.IsEditIndependency = false;
                vmGoalAction.showAddIndependencePopup(kLg.gaTitleAddOverallThread, 365);
            } else {
                pAlert(kLg.gaMesgRequireRegion);
            }
        }

    }
};

vmGoalAction.enableShowGoalView = function (goalview) {
    for (var i = 0; i < goalview.length; i++) {
        var goal = goalview[i];
        goal.IsShow = 1;
        if (goal.ListSubGoal.length > 0) {
            for (var j = 0; j < goal.ListSubGoal.length; j++) {
                var subgoal = goal.ListSubGoal[j];
                subgoal.IsShow = 1;
                if (subgoal.ListAction.length > 0) {
                    for (var k = 0; k < subgoal.ListAction.length; k++) {
                        subgoal.ListAction[k].IsShow = 1;
                    }
                }
            }
        }
    }
};

vmGoalAction.bindChildByIds = function (Ids, expect) {
    if (Ids.length === 0)
        return;

    for (var i = 0; i < Ids.length; i++) {
        var $elem = $("#" + Ids[i]);

        var smpId = $elem.closest("div[mstype='child']").attr("submarketproductid");
        var indId = $elem.closest("div[mstype='child']").attr("independencyid");

        if ((smpId == undefined && indId == undefined) || (expect && smpId == expect.SubMarketProductId && indId == expect.IndependencyId))
            continue;

    }
}

// Rebind data model get from server into exists viewmodel
vmGoalAction.reloadMaingoalViewModel = function (goalview) {
    goalview.map(t => {
        var findModel = vmGoalAction.dictMaingoalViewModel[t.Id];

        if (findModel) {

            t.ListSubGoal.map(sg => {
                sg.isExpand = vmGoalAction.expandService.isSubGoalExpand(sg.Id);
            });

            findModel.set('data[0][0].goalview', [t]);
            findModel.updateData();
        }
    });
};

vmGoalAction.appendIndependency = function (id, name, currency) {
    var data = { Id: id, Name: name, Role: 1, CurrencyName: currency };
    var hrml = kendo.template($("#temp-childIndepend").html())(data);

    $('#collapseParentIndepend' + vmGoalAction.parentId).find('.panel-body').append(hrml);

    //
    var abc = $('#collapseChildIndepend' + id).prev();
    $(abc).children("span[data-toggle=dropdown]").off('click').click(function () {
        (!!vmGoalAction.setHideGotoOtherTabInMenu) && vmGoalAction.setHideGotoOtherTabInMenu(); // backlog item 24222
        
        var itemWidth = $(this).outerWidth();
        var menuItemPos = $(this).offset();
        var $ul = $(this).next();
        var ulHeight = $ul.outerHeight(),
            ulWidth = $ul.outerWidth();

        if (menuItemPos.top + 18 + ulHeight > $(window).height())
            $ul.css({ top: menuItemPos.top - ulHeight, left: menuItemPos.left - ulWidth + itemWidth });
        else
            $ul.css({ top: menuItemPos.top + 18, left: menuItemPos.left - ulWidth + itemWidth });
    });
    
   // vmGoalActionDragDrop.setupDragDrop();
};

vmGoalAction.showEditThread = function (e, id) {
    var parentId = $(e).parents('div[mstype=parentArea]').attr('parentId'),
        theTitle;
    if (id) {
        var $childElem = $(e).parents('div[mstype=childArea]');
        var name = $childElem.attr("childName"),
            mdf = $childElem.attr("mdf");

        vmPopName.Name = name;
        vmPopName.options = { id: id, mdf: mdf, elem: $childElem };
        vmPopName.Type = "UpdateSubIndependency";
        theTitle = kLg.gaTitleEditThread;

    } else {

        vmPopName.Name = "";
        vmPopName.Type = "CreateSubIndependency";
        vmPopName.independencyId = 1;
        vmPopName.options = { parentId: parentId };
        theTitle = kLg.gaTitleAddThread;
        vmGoalAction.tempIndependencyId = $(e).closest('.panel-default').attr('id');
    }

    vmGoalAction.showAddIndependencePopup(theTitle, 255);
};

vmGoalAction.showEditOverallThread = function (e, id) {
    var isEdit = $("#parentIndependency" + id).is("[ise]");

    var parentElement = $(e).parents('div[mstype=parentArea]');
    var mdf = parentElement.attr("mdf");
    vmPopName.Name = parentElement.attr("parentname");
    vmPopName.options = { id: id, mdf: mdf, elem: parentElement, isEdit: isEdit };
    vmGoalAction.showEditNamePopUp(kLg.gaTitleEditOverallThread);
};


vmGoalAction.DeleteIndependency = function (e, type) {
    pConfirm(kLg.confirmDeleteIndependence)
        .then(function () {
            var $elem, $parent,
                id;
            var mdf = 0;
            if (type == "parent") {
                $elem = $(e).parents('div[mstype=parentArea]');
                id = $elem.attr('parentId');
                mdf = $elem.attr('mdf');
            } else if (type == "child") {
                $elem = $(e).parents('div[mstype=childArea]');
                id = $elem.attr('childId');
                mdf = $elem.attr('mdf');

                $parent = $(e).closest("div[mstype=parentArea]");

                isMasterGoal = $elem.find("span[class='master-title']").length > 0;

            }

            var entryData = { id: id, mdf: mdf };
            vmGoalAction.dataservice.deleteIndependency(entryData, function (serData) {

                msFilter.controlService.reLoadDataFilter();

                if (!vmGoalAction.checkRole(serData)) return;

                if (vmCommon.checkConflict(serData.value)) {
                    $elem.remove();
                    if (typeof (msFilter) != "undefined") {
                        var independency = { Id: entryData.id };
                        if (type == "parent") {

                        } else if (type == "child") {


                            var childs = $parent.find("div[mstype=childArea]");
                            if (childs.length === 0) {
                                $parent.remove();
                            } else {
                                if (isMasterGoal) {
                                    if ($parent.find("div[mstype='childArea'] span[class='master-title']").length === 0) {
                                        var temp = $parent.find("div[class~='panel-heading-mass-parent']")[0];
                                        $(temp).find("span[class='master-title']").remove();
                                    }
                                }
                            }
                        }
                        vmGoalAction.reloadMasterFilter();
                    }
                    vmGoalAction.reloadMasterGoalKpiTitle();
                }
            });
        });
};

vmGoalAction.reloadMasterGoalKpiTitle = function () {

    var parents = $("#independencyView").find("div[mstype~='parentArea']");

    var hasMastergoal = false, hasMastergoalKpi = false, tid, status;
    for (var i = 0; i < parents.length; i++) {
        hasMastergoal = $(parents[i]).find("span[class='master-title'][status='3'][type='child']").length > 0 || $(parents[i]).find("span[class='master-title'][status='1'][type='child']").length > 0;
        hasMastergoalKpi = $(parents[i]).find("span[class='master-title'][status='3'][type='child']").length > 0 || $(parents[i]).find("span[class='master-title'][status='2'][type='child']").length > 0;

        temp = $(parents[i]).find("div[class~='panel-heading-mass-parent']")[0];
        var $parent = $(temp).find("span[class='master-title']");

        if ($parent.length > 0) {
            tid = $parent.attr('tid');

            $(temp).find("span[class='master-title']").remove();
        }

        if (hasMastergoal && hasMastergoalKpi) {
            status = 3;
            $(temp).append("<span tid='" + tid + "' class='master-title' status='" + status + "'>" + kLg.textMastergoalAndBudget + "</span>");
        }
        else if (hasMastergoal) {
            status = 1;
            $(temp).append("<span tid='" + tid + "' class='master-title' status='" + status + "'>" + kLg.textMasterbudget + "</span>");
        }
        else if (hasMastergoalKpi) {
            status = 2;
            $(temp).append("<span tid='" + tid + "' class='master-title' status='" + status + "'>" + kLg.textMastergoal + "</span>");
        }
    }
};

//#region Action
vmGoalAction.UpdateActionEP = function (e) {
    var $parentElement = $(e).parents('div[mstype=action]');
    var info = vmGoalAction.getChildElem(e);
    var actionId = $parentElement.attr('actionId'),
        mdf = $parentElement.attr('mdf'),
        maingoalEl = $("div[actionid~='" + actionId + "']").closest("div[gnavid]"),
        isCalendar = $(e).hasClass('icon-deactivate-w');

    var entryData = { id: actionId, isCalendar: isCalendar, mdf: mdf };
    vmGoalAction.dataservice.updateActionEP(entryData, function (serData) {
        if (!vmGoalAction.checkRole(serData)) return;

        if (vmCommon.checkConflict(serData.value)) {
         //   vmGoalAction.bindChild(info.SubMarketProductId, info.IndependencyId);
        }
    });
}

vmGoalAction.showSubActionDescription = function (e) {

    if ($(e).data("kendoTooltip")) return;
    var val = $(e).attr("desValue");
    if (val) {
        vmGoalAction.tooltipSubActionHolder = $(e).kendoTooltip({
            autoHide: true,
            hide: subActionDescriptionOnHide,
            position: "top",
            content: val
        });

        $(e).trigger('mouseenter');

        setTimeout(function () {
            var subactiontooltip = $("#tooltip-subaction").parent().parent().parent();
            subactiontooltip.find("div.k-callout-s").css("margin-left", "100px");
            var topval = parseInt(subactiontooltip.css("top").substring(0, subactiontooltip.css("top").length - 2));

        }, 125);
    }

};

function buildSubActionDescription(action, currency) {

    if (action) {
        var container = "", costStr = "", todoStr = "";

        if (action.ActionCosts && action.ActionCosts.length > 0) {
            costStr += "<table style='width: 713px; margin: 0 auto;'><theader><tr style='background-color: #76838a; color:white;'>";
            costStr += "<th style='width: 275px; overflow: hidden; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.titleSubActionActivity + "</p></th>";
            costStr += "<th style='width: 90px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.labelStart + "</p></th>";
            costStr += "<th style='width: 90px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.labelEnd + "</p></th>";
            costStr += "<th style='width: 129px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.gaLblExpectedCost + "</p></th>";
            costStr += "<th style='width: 129px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.gaLblActualCost + "</p></th>";
            costStr += "</tr></theader><tbody>";
            for (var h = 0; h < action.ActionCosts.length; h++) {
                costStr += "<tr>";
                costStr += "<td style='min-width: 275px;max-width: 275px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><p style='margin-left: 5px;min-height: 27px;'>" + action.ActionCosts[h].Description + "</p></td>";
                if (action.ActionCosts[h].StartDate)
                    costStr += "<td style='min-width: 90px;max-width: 90px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + kendo.toString(action.ActionCosts[h].StartDate.jsonToDate(), "d") + "</span></td>";
                else
                    costStr += "<td style='min-width: 90px;max-width: 90px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'></td>";
                if (action.ActionCosts[h].EndDate)
                    costStr += "<td style='min-width: 90px;max-width: 90px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + kendo.toString(action.ActionCosts[h].EndDate.jsonToDate(), "d") + "</span></td>";
                else
                    costStr += "<td style='min-width: 90px;max-width: 90px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'></td>";
                costStr += "<td style='min-width: 129px;max-width: 129px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='float:left;margin-left: 5px;'>" + currency + "</span><span style='float:right;margin-right:5px;font-size: 12px;'>" + (action.ActionCosts[h].ExpectedCost > 0 ? vmCommon.formatCost(action.ActionCosts[h].ExpectedCost) : 0) + "</span></td>";
                costStr += "<td style='min-width: 129px;max-width: 129px;border-top: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='float:left;margin-left: 5px;'>" + currency + "</span><span style='float:right;margin-right:5px;font-size: 12px;'>" + (action.ActionCosts[h].ActualCost > 0 ? vmCommon.formatCost(action.ActionCosts[h].ActualCost) : 0) + "</span></td>";
                costStr += "</tr>";
            }
            costStr += "</tbody></table>";
        }

        if (action.ActionTodos && action.ActionTodos.length > 0) {
            let w = 713;
            if (action.IsShowFinish) w += (60 + 140);

            todoStr += "<table style='width: " + w +"px; margin: 0 auto; border-radius: 3px;'><theader><tr style='background-color: #76838a; color:white;'>";
            todoStr += "<th style='width: 275px; overflow: hidden; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.titleToDos + "</p></th>";
            todoStr += "<th style='width: 90px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + "Due Date" + "</p></th>";

            if (action.IsShowFinish)
                todoStr += "<th style='width: 60px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.labelFinishAction + "</p></th>";

            todoStr += "<th style='width: 219px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.labelRes + "</p></th>";
            todoStr += "<th style='width: 129px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;'>" + kLg.labelCategories + "</p></th>";

            if (action.IsShowFinish)
                todoStr += "<th style='width: 139px; text-align: center; border: #e6e6e6 1px solid;'><p style='margin-top: 8px;font-weight: 150;max-width: 136px;height: 20px;overflow: hidden;padding-top: 4px;'>" + htmlDecode(kLg.gaLblField) + "</p></th>";

            todoStr += "</tr></theader><tbody>";

            for (var h = 0; h < action.ActionTodos.length; h++) {
                var x = action.ActionTodos[h];
                todoStr += "<tr>";
                todoStr += "<td style='height:36px;min-width: 275px;max-width: 275px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;min-height: 27px;'>" + htmlDecode(x.Name || "") + "</span></td>"; //vmCommon.bindStringDefault(x.Name)
                if (x.DueDate)
                    todoStr += "<td style='min-width: 90px;max-width: 90px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + kendo.toString(x.DueDate.jsonToDate(), "d") + "</span></td>";
                else
                    todoStr += "<td style='min-width: 90px;max-width: 90px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'></td>";

                if (action.IsShowFinish) {
                    let ficon = "<div><span class='" + (x.Finish ? "icon-16  icon-select-gray" : "") + "' style='display: inline-block;'></span></div>";
                    todoStr += "<td style='min-width: 60px;max-width: 50px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;text-align: center;'>" + ficon + "</td>";
                }
                    

                todoStr += "<td style='min-width: 219px;max-width: 219px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + vmCommon.bindPersonTodoColumn(x.Persons) + "</span></td>";
                todoStr += "<td style='min-width: 129px;max-width: 129px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + htmlDecode(x.CategoryName || "") + "</span></td>"; //vmCommon.bindStringDefault(x.CategoryName)

                if (action.IsShowFinish) {
                    let departmentName = x.ActionTodoDepartments && x.ActionTodoDepartments.length > 0 ? x.ActionTodoDepartments.map(t => t.Name).join(", ") : "";
                    todoStr += "<td style='min-width: 139px;max-width: 129px;border-bottom: #e6e6e6 1px solid;border-right: #e6e6e6 1px solid;border-left: #e6e6e6 1px solid;'><span style='margin-left: 5px;'>" + htmlDecode(departmentName) + "</span></td>";
                }
                    

                todoStr += "</tr>";
            }

            todoStr += "</tbody></table>";
        }

        if (costStr.length > 0 || todoStr.length > 0) {
            let wd = 720;
            if (action.IsShowFinish) wd += (60 + 140);

            container += "<div id='tooltip-subaction' style='text-align:left; min-width: " + wd + "px !important; max-width: 708px !important; min-height: 70px !important;'>";
            container += costStr;
            container += todoStr;
            container += "</div>";
        }

        return container;
    } else
        return "";
}

function subActionDescriptionOnHide(e) {
    e.sender.destroy();
}

vmGoalAction.UpdateGoalFinish = function (e) {
    if (vmGoalAction.Role < vmCommon.MemberRole.Edit) return;

    var $parentElement = $(e).parents('td[isgoal=true]');
    var info = vmGoalAction.getChildElem(e);
    var goalId = $parentElement.attr('goalId'),
        mdf = $parentElement.attr('mdf'),
        isCalendar = $(e).hasClass('icon-deactivate-w');

    var entryData = { id: goalId, finish: isCalendar, isFinishAll: false, mdf: mdf };
    ynConfirm(kLg.msgFinishAll).then(function () {
        entryData.isFinishAll = true;
        vmGoalAction.dataservice.updateGoalFinish(entryData, function (serData) {
            if (!vmGoalAction.checkRole(serData)) return;

            if (vmCommon.checkConflict(serData.value)) {
            //    vmGoalAction.bindChild(info.SubMarketProductId, info.IndependencyId);
            }
        });
    }, function () {
        vmGoalAction.dataservice.updateGoalFinish(entryData, function (serData) {
            if (!vmGoalAction.checkRole(serData)) return;

            if (vmCommon.checkConflict(serData.value)) {
            //    vmGoalAction.bindChild(info.SubMarketProductId, info.IndependencyId);
            }
        });
    });
}

//#endregion

vmGoalAction.redirectToSubmarket = function (submarketId, productId, landId, regionId, isxy) {
    var subId = isxy ? productId : submarketId;
    var proId = isxy ? submarketId : productId;

    var filtersearch = [{ TypeId: vmCommon.EnumFilterType.Market, ChildId: 0 }];
    var jsonObject = { LandId: landId, RegionId: regionId, FilterValue: JSON.stringify(filtersearch) };
    var url = '/Handlers/MarketFilterHandler.ashx?funcName=updatefilterfromgoalaction' + "&projid=" + projectId + '&regid=' + regionId + "&submarketid=" + subId;
    callAjax('loadingRegionMatrix', url, JSON.stringify(jsonObject), function () {
        window.location = '/Pages/MsSubMarketProduct.aspx?lang=' + kLg.language + '&projid=' + projectId + '&regid=' + regionId + '&strid=' + strategyId
            + "&subid=" + subId + "&prodid=" + proId;
    }, AjaxConst.PostRequest);
};
//#endregion

//#region Utils

vmGoalAction.getOpenArea = function (elem) {
    if ($(elem).parents('#goalActionView').length > 0) {
        vmGoalAction.openArea = vmGoalAction.enumArea.Submarket;
    } else if ($(elem).parents('#independencyView').length > 0) {
        vmGoalAction.openArea = vmGoalAction.enumArea.Independency;
    }
    vmGoalAction.fitCriterias = [];
};

vmGoalAction.getChildElem = function (e) {
    var $childElement = $(e).parents('div[mstype=child]');
    var regionElement = $(e).closest("div[class='lr-row']");

    var isXy = $childElement.attr("isxy");

    var productId = isXy === "true" ? $childElement.attr("submarketid") : $childElement.attr("productid");
    var submarketId = isXy === "true" ? $childElement.attr("productid") : $childElement.attr("submarketid");

    var currencyUnit = $(e).attr('data-cry') || $childElement.attr("cry");
    var regionId = ($(regionElement).attr("rid") || $(e).attr('data-regionid')) || -1;
    productId = productId || $(e).attr('data-productid');
    submarketId = submarketId || $(e).attr('data-submarketid');
    var submarketProductId = $(e).attr('data-submarketproductid') || $childElement.attr('submarketproductid');
    var independencyId = $(e).attr('data-independencyid') || $childElement.attr('independencyId');

    return {
        SubMarketProductId: submarketProductId,
        IndependencyId: independencyId,
        RegionId: regionId,
        CurrencyName: currencyUnit,
        ProductId: productId,
        SubMarketId: submarketId,
        IsMasterGoal: $childElement.is("[mastergoal]")
    };
};

vmGoalAction.getParentInfo = function (elem) {
    var info = undefined;
    var parent = $(elem).closest("div[mstype='child'][id^='collapse']");

    if (parent.length > 0)
        info = {
            IndependencyId: $(parent).attr("independencyid"),
            SubMarketProductId: $(parent).attr("submarketproductid"),
            RegionId: $($(parent).closest("div[class='lr-row']")).attr("rid") || -1
        };

    return info;
};

vmGoalAction.setupMenuIcon = function (selector) {
    $(selector + ' span[data-toggle=dropdown]').off('click').click(function () {
        (!!vmGoalAction.setHideGotoOtherTabInMenu) && vmGoalAction.setHideGotoOtherTabInMenu(); // backlog item 24222

        var itemWidth = $(this).outerWidth();
        var menuItemPos = $(this).offset();
        var $ul = $(this).next();
        var ulHeight = $ul.outerHeight(),
            ulWidth = $ul.outerWidth();

        if (menuItemPos.top + 18 + ulHeight > $(window).height())
            $ul.css({ top: menuItemPos.top - ulHeight, left: menuItemPos.left - ulWidth + itemWidth });
        else
            $ul.css({ top: menuItemPos.top + 18, left: menuItemPos.left - ulWidth + itemWidth });
    });
};

vmGoalAction.clampText = function (selector) {
    $(selector + ' .line-clamp').each(function () {
        clamp(this, 3);
    });

};

vmGoalAction.checkRole = function (data) {
    if (data.Role < 0) {
        //Task 5218

        return false;
    }
    if (data.Role < 1) {

        return false;
    }

    return true;
};

vmGoalAction.disableAddDependencyButton = function () {
    $('#btnAddIndependency').attr('disabled', 'disabled');
    $('#btnAddIndependency').addClass('bg-disable');
};

vmGoalAction.enableAddDependencyButton = function () {
    $('#btnAddIndependency').removeAttr('disabled');
    $('#btnAddIndependency').removeClass('bg-disable');
};

vmGoalAction.bindToggleParentEvent = function (selector) {
    var theSelector;
    if (selector)
        theSelector = selector + ' .parent-body';
    else
        theSelector = '.parent-body';
    $(theSelector).off('show.bs.collapse').on('show.bs.collapse', function (e) {
        var $span = $($(e.target).prev().find('span')[0]);
        if ($span.is('[xxyy]')) {
            $span.find('.msaIcCollapExpand').addClass('font-arrow-down').removeClass('font-arrow-right');
        }

    }).off('hide.bs.collapse').on('hide.bs.collapse', function (e) {
        var $span = $($(e.target).prev().find('span')[0]);
        if ($span.is('[xxyy]')) {
            $span.find('.msaIcCollapExpand').addClass('font-arrow-right').removeClass('font-arrow-down');
        }

    });
};

vmGoalAction.setupDescriptionTooltip = function (selector) {
    var theSelector;
    if (selector)
        theSelector = selector + ' .ms-tooltip';
    else
        theSelector = '.ms-tooltip';
    $(theSelector).each(function () {
        var description = $(this).attr('data-tooltip');

        if (description) {
            if ($(this).data('kendoTooltip') == undefined) {
                $(this).kendoTooltip({
                    autoHide: true,
                    content: description,
                    position: "bottom",
                    show: function (e) {
                        var $content = e.sender.content;
                        var isHtmlFormat = false;
                        var cssObj = { 'width': '0' };

                        $content.find('section').each(function () {	// fixbugs 17421
                            if ($(this).attr('id') == 'collection-highlights-container')
                                $(this).css({ 'width': '' });
                        });
                        $content.find('.pDesContent.dnbDesHtmlFormat').each(function () {
                            var $this = $(this);
                            isHtmlFormat = isHtmlFormat || vmCommon.TexEditor.isHtmlFomat($this.html());
                            if (isHtmlFormat) {
                                $this.css({ 'width': 'auto' });
                                var css_Obj = vmCommon.TexEditor.getCssFrom($this);
                                if (parseInt(cssObj.width) < parseInt(css_Obj.width)) {
                                    cssObj = css_Obj;
                                }
                            };
                        });
                        
                        if (isHtmlFormat) {
                            cssObj['overflow'] = 'hidden';
                            $content.css(cssObj);
                        }
                    }
                });
            }
        }
    });

    $('.ms-tooltip[data-role="tooltip"]').mouseleave(function () {
        var kdtlltip = $(this).data('kendoTooltip');
        if(kdtlltip) kdtlltip.hide();
    });
};

vmGoalAction.setUpMouseClick = function (selector) {
    var divDragDropQG;                      // TienPM disable drag-drop when click

    var iconSelector, dropdownSelector, wrapperSelector;
    if (selector) {
        iconSelector = selector + ' .icon-dropdow';
        wrapperSelector = selector + ' .wrapper-goalaction';
        dropdownSelector = selector + ' .ms-dropdow';
    } else {
        iconSelector = '.icon-dropdow';
        wrapperSelector = '.wrapper-goalaction';
        dropdownSelector = '.ms-dropdow';
    }

    $(iconSelector).off('click').on('click', function () {
        if ($(dropdownSelector).hasClass('open')) {
            $(wrapperSelector).removeClass('td-hovers');
            $(wrapperSelector).addClass('td-hover');
        } else {
            $(wrapperSelector).removeClass('td-hover');
            $(this).parents('div.wrapper-goalaction').addClass('td-hovers');
            $(this).parents('.itemDraggable').draggable({ disabled: true });
            divDragDropQG = $(this).parents('.itemDraggable');
        }
        $(document).mouseup(function (e) {
            divDragDropQG.draggable({ disabled: false });
            var container = $(iconSelector);
            if (!container.is(e.target)) {
                $(wrapperSelector).removeClass('td-hovers');
                $(wrapperSelector).addClass('td-hover');
            };
        });
    });

};

vmGoalAction.focusFirstInput = function (area) {
    $(area + ' input[type=text]:enabled').first().focus();
};

vmGoalAction.keepIgnoreFilters = function () {
    
};

vmGoalAction.checkFitFilterNoChild = function (value, source, type) {

    if (value == null || value.length < 1 || !source.length || source.length < 1)
        return false;

    var flag = false,
        sourceId = [];

    for (var i = 0; i < source.length; i++) {
        sourceId.push(source[i].Id);
    }

    if ($.isArray(value)) {
        if (!value.length && source.length)
            return false;
        if (!value.length)
            return true;
        for (var i = 0; i < value.length; i++) {
            if (sourceId.indexOf(parseInt(value[i].Id)) >= 0) {
                flag = true;
                break;
            }
        }
        if (flag) {
            for (var i = 0; i < source.length; i++) {
                vmGoalAction.fitCriterias.push({ TypeValue: type, ParentValue: source[i].Id, ChildValue: -1 });
            }
        }
    } else {
        var isAll = $.grep(source, function (item) { return item.Id === -2 }).length > 0;
        if (isAll) {
            vmGoalAction.fitCriterias.push({ TypeValue: type, ParentValue: -2, ChildValue: -1 });
            return value ? true : false;
        }

        for (var i = 0; i < source.length; i++) {
            if (value === source[i].Id) {
                flag = true;
                vmGoalAction.fitCriterias.push({ TypeValue: type, ParentValue: source[i].Id, ChildValue: -1 });
            }
        }
    }

    return flag;
};

vmGoalAction.checkType = function (type) {
    return true;

};

vmGoalAction.checkVisibility = function (visibility) {
    return true;

};

vmGoalAction.checkDate = function (dateRange) {
    return !msFilter.controlService.hasCriteria(mFilter.enumFilter.date) || msFilter.controlService.hasParent(dateRange, mFilter.enumFilter.date);

};

vmGoalAction.resetFilter = function () {
    //TODO: recode late
};

vmGoalAction.setupLanguage = function () {
    $('#lblIndependencyTitle').text(kLg.gaLblIndependencyAreaTitle);
    $('#btnAddGoalIndependency').text(kLg.gaTitleAddOverallThread);
    $("#linkMarketSegment").text(kLg.tabMarketSegment);
    $("#linkSubMarketSegment").text(kLg.tabSubMarketProduct);
};

vmGoalAction.expandAll = function (e) {
    //HoaND create expand when click parent GoalAction
    //If parent there's one child -> expand
    //Else not expand
    $(e).click();

    var tmpAttr = $(e).attr('class');

    if (tmpAttr.indexOf('collapsed') >= 0) {
        setTimeout(function () {
            vmGoalAction.expandAll(e);
        }, 135);
    }
};

vmGoalAction.ActionUpdateMaster = function () {

    if (vmGoalAction.GoalMaster.FirstCost === vmGoalAction.GoalMaster.LastCost &&
        vmGoalAction.GoalMaster.FirstIds.equals(vmGoalAction.GoalMaster.LastIds)) {
        return;
    }

    if (vmGoalAction.GoalMaster.FirstIds.length > 0) {
        vmGoalAction.reLoadMasterArea(vmGoalAction.GoalMaster.FirstIds);
    }

    if (vmGoalAction.GoalMaster.LastIds.length > 0 && !vmGoalAction.GoalMaster.LastIds.equals(vmGoalAction.GoalMaster.FirstIds)) {
        vmGoalAction.reLoadMasterArea(vmGoalAction.GoalMaster.LastIds);
    }

    vmGoalAction.MasterCost = {};
    return;
};

vmGoalAction.GoalUpdateMaster = function (goalId, smpId, indId) {

    if (goalId) {
        var info = { SubMarketProductId: smpId, IndependencyId: indId };
        var maingoal = vmGoalAction.findGoalById(goalId, vmGoalAction.getSourceByInfo(info));

        if (maingoal == undefined) {
            return;
        }
    }
};

vmGoalAction.reLoadMasterKpiArea = function () {
    var ids = $("a[ms-role='child'][masterkpi]").map(function () { return Number($(this).attr("id")); });
    if (ids.length == 0) return;

    ids = $.grep(ids, function (it) { return $("#collapseChildIndepend" + it).data("hasData"); });
    if (ids.length == 0) return;

};

vmGoalAction.reLoadMasterArea = function (masterIds) {

    if (masterIds.length === 0) {
        return;
    }
    var independencies = [];

    for (var i = 0; i < masterIds.length; i++) {
        var masterId = masterIds[i];
        var items = $("td[goalid='" + masterId + "']");
        if (items.length === 0) {
            continue;
        }
        var $masterItem = items[0];
        var independencyId = $($masterItem.closest("div[mstype='childArea']")).attr("childid");
        var selector = '#collapseChildIndepend' + independencyId;
        if ($(selector).data("hasData")) {
            if (independencies.indexOf(independencyId) === -1) {
                independencies.push(independencyId);
            }
        }
    }

    if (independencies.length > 0) {
        vmGoalAction.bindChildMaster(independencies);
    }
};

vmGoalAction.bindChildMaster = function (independencyIds) {
    var that = this;

    var entryData = {
        independencyIds: [],
        filterObject: msFilter.controlService.getQueryFilter(vmCommon.FilterType.ActionPlan),//vmFilter.filterContainer,
        isConnection: [],
        isSubConnection: [],
        isEdit: []
    };

    if (independencyIds === undefined) return;

    for (var i = 0; i < independencyIds.length; i++) {
        var independencyId = independencyIds[i];
        var $collapseChildIndepend = $('#collapseChildIndepend' + independencyId);
        if (!$collapseChildIndepend.data("hasData") && !$collapseChildIndepend.hasClass('in'))
            continue;

        var isConnection = $("#" + independencyId).hasClass("item-connection");
        var isSubConnection = $("#" + independencyId).hasClass("sub-item-connection");
        var isEdit = $("#" + independencyId).closest("div[mstype='childArea']").is("[ise]");

        entryData.independencyIds.push(independencyId);
        entryData.isConnection.push(isConnection);
        entryData.isSubConnection.push(isSubConnection);
        entryData.isEdit.push(isEdit);
    }

    if (entryData.independencyIds.length === 0) return;

    vmGoalAction.dataservice.getGoalViewByIndependencyWithoutFilterForMaster(entryData, function (serData) {
        for (var j = 0; j < independencyIds.length; j++) {
            var independencyId = independencyIds[j];

            var isNav = $("#" + independencyId).closest("div[mstype='childArea']").is("[isnav]");
            var goalview = serData.value[independencyId],
                selector = '#collapseChildIndepend' + independencyId;

            if (!goalview) {
                return;
            }

            vmGoalAction.goalsViewIndependency[independencyId] = goalview;

            var goalviewTitle = [{ goalview: goalview, submarketProductId: independencyId, isEdit: entryData.isEdit[j] }];


            var dataNav = isNav ? goalview : goalviewTitle;
            for (var i = 0; i < goalview.length; i++) {
                goalview[i].SubMarketProductId = independencyId;
            }

            var maingoalNavIsOpen = [];
            if (isNav) {
                var maingoalNavEl = $("[mstype~='childArea'][childid~='" + independencyId + "']").find("div[gnavid]");
                $.grep(maingoalNavEl, function (x) { if ($(x).height() > 50) maingoalNavIsOpen.push($(x).attr("gnavid")); });
            }

            vmGoalAction.bindNavMaingoals(independencyId, "collapseChildIndepend" + independencyId, dataNav);
            vmGoalAction.apLinkOverviewService.init(independencyId);
        }
        
    });

};

vmGoalAction.reLoadOpenIndependency = function (expects) {
    if (expects.constructor !== Array) {
        return;
    }

    var independencies = [];
    var items = $("#independencyView").find("div[mstype='childArea']");
    for (var i = 0; i < items.length; i++) {
        var independencyId = $(items[i]).attr("childid");

        if (expects.indexOf(independencyId) !== -1) {
            continue;
        }

        if (independencyId && $('#collapseChildIndepend' + independencyId).data("hasData")) {
            if (independencies.indexOf(independencyId) === -1) {
                independencies.push(independencyId);
            }
        }
    }

    if (independencies.length > 0) {
        vmGoalAction.bindChildMaster(independencies);
    }
};

vmGoalAction.reLoadOpenIndependencyMaster = function () {
    var independencies = [];

    var items = $("#independencyView").find("div[mstype='childArea']");
    for (var i = 0; i < items.length; i++) {
        if ($(items[i]).find("span[class='master-title']").length === 0)
            continue;

        var independencyId = $(items[i]).attr("childid");

        if (independencyId && $('#collapseChildIndepend' + independencyId).data("hasData")) {
            if (independencies.indexOf(independencyId) === -1) {
                independencies.push(independencyId);
            }
        }
    }

    if (independencies.length > 0) {
        vmGoalAction.bindChildMaster(independencies);
    }
};

vmGoalAction.reLoadTitle = function (id, currentState) {
    //child
    var childTitle = $("span.master-title[tid='" + id + "']");
    var childText = currentState == 3 ? kLg.textMastergoalAndBudget : (currentState == 2 ? kLg.textMastergoal : (currentState == 1 ? kLg.textMasterbudget : ''));

    $(childTitle).text(childText);
    $(childTitle).attr("status", currentState);

    //parent
    var pid = $(childTitle).attr("parentid");

    var parentTitle = $("span.master-title[tid='" + pid + "']");
    var parentText;
    if ($("span.master-title[parentid='" + pid + "'][status='3']").length > 0 || ($("span.master-title[parentid='" + pid + "'][status='2']").length > 0 && $("span.master-title[parentid='" + pid + "'][status='1']").length > 0))
        parentText = kLg.textMastergoalAndBudget;
    else if ($("span.master-title[parentid='" + pid + "'][status='2']").length > 0)
        parentText = kLg.textMastergoal;
    else if ($("span.master-title[parentid='" + pid + "'][status='1']").length > 0)
        parentText = kLg.textMasterbudget;
    else parentText = "";

    $(parentTitle).text(parentText);
};

vmGoalAction.reloadMasterFilter = function () {
    
};

vmGoalAction.subService = function () {
    var model, subSource = [], clientSource = [], groupCount = 15, rootType = { SubProduct: 1, SubClient: 2, CustomerJourney: 3 }, crmClientItem, cusSource = [];

    var getGroupSub = function (data) {
        var src = [];
        if (data.length === 0) return [];

        //organisation		
        data.filter(t => t.TypeId == 7 && t.IsSelect).forEach(t => {
            src.push(t);
        });

        var temps = vmCommon.deepCopy(data);

        var groups = [], products = [], subProducts = [];
        for (var i = 0; i < temps.length; i++) {
            var item = temps[i];
            switch (item.TypeId) {
                case 1:
                    groups.push(item);
                    continue;
                case 2:
                    products.push(item);
                    continue;
                case 3:
                    subProducts.push(item);
                    continue;
                default:
                    continue;
            }
        }

        //1.normal
        var gIds = [];
        for (var j = 0; j < groups.length; j++) {
            var group = groups[j];

            if (group.IsSelect) {
                group.groupClass = temps.some(t => t.ParentId == group.ObjectId) ? "group-sub" : "";

                gIds.push(group.ObjectId);
                src.push(group);
            }
        }

        var pIds = [];
        for (var k = 0; k < products.length; k++) {
            var product = products[k];
            if (product.IsSelect) {
                pIds.push(product.ObjectId);

                if (gIds.indexOf(product.ParentId) === -1) {
                    product.groupClass = temps.some(t => t.ParentId == product.ObjectId) ? "group-sub" : "";
                    src.push(product);
                }
            }
        }

        for (var l = 0; l < subProducts.length; l++) {
            var sub = subProducts[l];

            if (sub.IsSelect && pIds.indexOf(sub.ParentId) === -1) {
                sub.groupClass = "";
                src.push(sub);
            }
        }


        return src;
    };

    var groupSub = function () {
        if (model.autoSubSrc == undefined || model.labeSubSrc == undefined) return;

        var autoSrc = vmCommon.deepCopy(model.autoSubSrc),
            labeSrc = vmCommon.deepCopy(model.labeSubSrc);

        model.set("displaySrc", getGroupSub(autoSrc.concat(labeSrc)));
        model.set("autoSubSrc", autoSrc);
    };

    var groupClient = function () {
        if (model.autoClientSrc == undefined || model.labeClientSrc == undefined) return;

        var autoSrc = vmCommon.deepCopy(model.autoClientSrc),
            labeSrc = vmCommon.deepCopy(model.labeClientSrc);

        var temps = getGroupSub(autoSrc.concat(labeSrc));
        if (crmClientItem && crmClientItem.DataState !== dataState.Deleted) temps.unshift(crmClientItem);

        model.set("displayClientSrc", temps);
        model.set("autoClientSrc", autoSrc);
    };

    var groupCus = function () {
        if (model.autoCusSrc == undefined || model.labeCusSrc == undefined) return;

        var autoSrc = vmCommon.deepCopy(model.autoCusSrc),
            labeSrc = vmCommon.deepCopy(model.labeCusSrc);

        model.set("displayCusSrc", getGroupSub(autoSrc.concat(labeSrc)));
        model.set("autoCusSrc", autoSrc);
    };

    var dataToSave = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoSubSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeSubSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        return $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Unchanged && ((it.Id == null && it.IsSelect) || (it.Id != null && !it.IsSelect));
        });
    };

    var dataClientToSave = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoClientSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeClientSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        var temps = $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Unchanged && ((it.Id == null && it.IsSelect) || (it.Id != null && !it.IsSelect));
        });

        if (crmClientItem && crmClientItem.DataState !== dataState.Unchanged) {
            temps.push(crmClientItem);
        }

        return temps;
    };

    var dataCusToSave = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoCusSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeCusSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        return $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Unchanged && ((it.Id == null && it.IsSelect) || (it.Id != null && !it.IsSelect));
        });
    };

    var dataSelected = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoSubSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeSubSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        return $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Deleted && it.IsSelect;
        });
    };

    var dataClientSelected = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoClientSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeClientSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        return $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Deleted && it.IsSelect;
        });
    };

    var dataCusSelected = function () {
        var spgTemp = [], i = 0;
        var autoSrc = model.autoCusSrc;
        for (i = 0; i < autoSrc.length; i++) {
            spgTemp.push(autoSrc[i]);
        }

        var labeSrc = model.labeCusSrc;
        for (i = 0; i < labeSrc.length; i++) {
            spgTemp.push(labeSrc[i]);
        }

        return $.grep(spgTemp, function (it) {
            return it.DataState !== dataState.Deleted && it.IsSelect;
        });
    };

    var autoChangeByGroup = function (item, rType) {
        var src = [], des = [];

        switch (rType) {
            case rootType.SubProduct:
                src = item.IsSelect ? model.autoSubSrc : model.labeSubSrc;
                des = item.IsSelect ? model.labeSubSrc : model.autoSubSrc;
                break;
            case rootType.SubClient:
                src = item.IsSelect ? model.autoClientSrc : model.labeClientSrc;
                des = item.IsSelect ? model.labeClientSrc : model.autoClientSrc;
                break;
        }

        var productIds = [], i = 0;
        for (i = src.length - 1; i >= 0; i--) {
            var product = src[i];

            if (product.ParentId === item.ObjectId && product.TypeId === 2) {
                productIds.push(product.ObjectId);

                product.IsSelect = item.IsSelect;

                if ((product.Id == null && !product.IsSelect) || (product.Id != null && product.IsSelect)) {
                    product.DataState = dataState.Unchanged;
                } else {
                    product.DataState = dataState.Modified;
                }

                src.splice(i, 1);
                des.push(product);
            }
        }

        for (i = 0; i < productIds.length; i++) {
            var proId = productIds[i];
            for (var j = src.length - 1; j >= 0; j--) {
                var sub = src[j];

                if (sub.ParentId === proId && sub.TypeId === 3) {
                    sub.IsSelect = item.IsSelect;

                    if ((sub.Id == null && !sub.IsSelect) || (sub.Id != null && sub.IsSelect)) {
                        sub.DataState = dataState.Unchanged;
                    } else {
                        sub.DataState = dataState.Modified;
                    }

                    src.splice(j, 1);
                    des.push(sub);
                }
            }

        }
    };

    var autoChangeByProduct = function (item, rType) {

        var src = [], des = [];

        switch (rType) {
            case rootType.SubProduct:
                src = item.IsSelect ? model.autoSubSrc : model.labeSubSrc;
                des = item.IsSelect ? model.labeSubSrc : model.autoSubSrc;
                break;
            case rootType.SubClient:
                src = item.IsSelect ? model.autoClientSrc : model.labeClientSrc;
                des = item.IsSelect ? model.labeClientSrc : model.autoClientSrc;
                break;
        }


        //subproduct
        for (var j = src.length - 1; j >= 0; j--) {
            var sub = src[j];

            if (sub.ParentId === item.ObjectId && sub.TypeId === 3) {
                sub.IsSelect = item.IsSelect;

                if ((sub.Id == null && !sub.IsSelect) || (sub.Id != null && sub.IsSelect)) {
                    sub.DataState = dataState.Unchanged;
                } else {
                    sub.DataState = dataState.Modified;
                }

                src.splice(j, 1);
                des.push(sub);
            }
        }

        //product group
        var groupId = item.ParentId;

        var autoSrc = [], labeSrc = [];
        switch (rType) {
            case rootType.SubProduct:
                autoSrc = model.autoSubSrc, labeSrc = model.labeSubSrc;
                break;
            case rootType.SubClient:
                autoSrc = model.autoClientSrc, labeSrc = model.labeClientSrc;
                break;
        }

        var childCount = $.grep(labeSrc, function (it) { return it.ParentId === groupId && it.TypeId === 2; }).length;

        var group, i;
        for (i = autoSrc.length - 1; i >= 0; i--) {
            if (autoSrc[i].ObjectId === groupId && autoSrc[i].TypeId === 1) {
                group = autoSrc[i];

                if (group.ChildCount === childCount) {
                    group.IsSelect = true;

                    if ((group.Id == null && !group.IsSelect) || (group.Id != null && group.IsSelect)) {
                        group.DataState = dataState.Unchanged;
                    } else {
                        group.DataState = dataState.Modified;
                    }

                    autoSrc.splice(i, 1);
                    labeSrc.push(group);
                    break;
                }
            }
        }

        if (group) return;

        for (i = labeSrc.length - 1; i >= 0; i--) {
            if (labeSrc[i].ObjectId === groupId && labeSrc[i].TypeId === 1) {
                group = labeSrc[i];

                if (group.ChildCount !== childCount) {
                    group.IsSelect = false;

                    if ((group.Id == null && !group.IsSelect) || (group.Id != null && group.IsSelect)) {
                        group.DataState = dataState.Unchanged;
                    } else {
                        group.DataState = dataState.Modified;
                    }
                }

                labeSrc.splice(i, 1);
                autoSrc.push(group);
                break;
            }
        }

    };

    var autoChangeBySubProduct = function (item, rType) {
        var productId = item.ParentId, groupId;

        var autoSrc = [], labeSrc = [];
        switch (rType) {
            case rootType.SubProduct:
                autoSrc = model.autoSubSrc, labeSrc = model.labeSubSrc;
                break;
            case rootType.SubClient:
                autoSrc = model.autoClientSrc, labeSrc = model.labeClientSrc;
                break;
        }

        var subCount = $.grep(labeSrc, function (it) { return it.ParentId === productId && it.TypeId === 3; }).length;
        var product, i;

        //product
        for (i = autoSrc.length - 1; i >= 0; i--) {
            if (autoSrc[i].ObjectId === productId && autoSrc[i].TypeId === 2) {
                product = autoSrc[i];
                groupId = product.ParentId;

                if (product.ChildCount === subCount) {
                    product.IsSelect = true;

                    if ((product.Id == null && !product.IsSelect) || (product.Id != null && product.IsSelect)) {
                        product.DataState = dataState.Unchanged;
                    } else {
                        product.DataState = dataState.Modified;
                    }

                    autoSrc.splice(i, 1);
                    labeSrc.push(product);
                    break;
                }
            }
        }

        if (product === undefined) {
            for (i = labeSrc.length - 1; i >= 0; i--) {
                if (labeSrc[i].ObjectId === productId && labeSrc[i].TypeId === 2) {
                    product = labeSrc[i];
                    groupId = product.ParentId;

                    if (product.ChildCount !== subCount) {
                        product.IsSelect = false;

                        if ((product.Id == null && !product.IsSelect) || (product.Id != null && product.IsSelect)) {
                            product.DataState = dataState.Unchanged;
                        } else {
                            product.DataState = dataState.Modified;
                        }
                    }

                    labeSrc.splice(i, 1);
                    autoSrc.push(product);
                    break;
                }
            }
        }

        //product group
        if (groupId === undefined) return;
        var proCount = $.grep(labeSrc, function (it) { return it.ParentId === groupId && it.TypeId === 2; }).length;

        var group;
        for (i = autoSrc.length - 1; i >= 0; i--) {
            if (autoSrc[i].ObjectId === groupId && autoSrc[i].TypeId === 1) {
                group = autoSrc[i];

                if (group.ChildCount === proCount) {
                    group.IsSelect = true;

                    if ((group.Id == null && !group.IsSelect) || (group.Id != null && group.IsSelect)) {
                        group.DataState = dataState.Unchanged;
                    } else {
                        group.DataState = dataState.Modified;
                    }

                    autoSrc.splice(i, 1);
                    labeSrc.push(group);
                    break;
                }
            }
        }

        if (group === undefined) {
            for (i = labeSrc.length - 1; i >= 0; i--) {
                if (labeSrc[i].ObjectId === groupId && labeSrc[i].TypeId === 1) {
                    group = labeSrc[i];

                    if (group.ChildCount !== proCount) {
                        group.IsSelect = false;

                        if ((group.Id == null && !group.IsSelect) || (group.Id != null && group.IsSelect)) {
                            group.DataState = dataState.Unchanged;
                        } else {
                            group.DataState = dataState.Modified;
                        }
                    }

                    labeSrc.splice(i, 1);
                    autoSrc.push(group);
                    break;
                }
            }
        }
    };

    var autoChangeByItemGroup = function (item, rType) {
        var autoSrc = [], labeSrc = [];
        switch (rType) {
            case rootType.SubProduct:
                autoSrc = model.autoSubSrc, labeSrc = model.labeSubSrc;
                break;
            case rootType.SubClient:
                autoSrc = model.autoClientSrc, labeSrc = model.labeClientSrc;
                break;
            case rootType.CustomerJourney:
                autoSrc = model.autoCusSrc, labeSrc = model.labeCusSrc;
                break;
        }

        function getIndexParents(src, item) {
            var lst = [];
            for (var i = 0; i < src.length; i++) {
                var temp = src[i];
                if (temp.ObjectId == item.ParentId && temp.TypeId == (item.TypeId - 1)) {
                    lst.push(i);

                    if ((temp.TypeId == 3 || temp.TypeId == 2) && src.some(t => t.ObjectId == temp.ParentId && t.TypeId == (temp.TypeId - 1))) lst = lst.concat(getIndexParents(src, temp));
                }
            }

            return lst;
        };

        function getIndexChilds(src, parent) {
            var lst = [];
            for (var i = 0; i < src.length; i++) {
                var temp = src[i];
                if (temp.ParentId == parent.ObjectId && temp.TypeId == (parent.TypeId + 1)) {
                    lst.push(i);

                    if ((temp.TypeId == 1 || temp.TypeId == 2) && src.filter(t => t.ParentId == temp.ObjectId && t.TypeId == (temp.TypeId + 1)).length > 0) lst = lst.concat(getIndexChilds(src, temp));
                }
            }

            return lst;
        }

        //for child
        var froms = item.IsSelect ? autoSrc : labeSrc;
        var tos = item.IsSelect ? labeSrc : autoSrc;

        var indexChilds = getIndexChilds(froms, item);

        for (var i = froms.length - 1; i >= 0; i--) {
            if (indexChilds.indexOf(i) < 0) continue;

            var child = froms.splice(i, 1)[0];

            child.IsSelect = item.IsSelect;
            if ((child.Id == null && !child.IsSelect) || (child.Id != null && child.IsSelect)) {
                child.DataState = dataState.Unchanged;
            } else {
                child.DataState = dataState.Modified;
            }

            tos.push(child);
        }

        //for parent
        if (item.IsSelect == false) {
            var indexParents = getIndexParents(labeSrc, item);
            for (var i = labeSrc.length - 1; i >= 0; i--) {
                if (indexParents.indexOf(i) < 0) continue;

                var parent = labeSrc.splice(i, 1)[0];
                parent.IsSelect = false;
                parent.groupClass = "";

                if ((parent.Id == null && !parent.IsSelect) || (parent.Id != null && parent.IsSelect)) {
                    parent.DataState = dataState.Unchanged;
                } else {
                    parent.DataState = dataState.Modified;
                }

                autoSrc.push(parent);
            }
        }

    };

    var autoChange = function (item, rType) {
        if (item == null) return;

        var typeId = item.TypeId;
        switch (typeId) {
            case 1:

                autoChangeByItemGroup(item, rType);
                break;
            case 2:

                autoChangeByItemGroup(item, rType);
                break;
            case 3:

                autoChangeByItemGroup(item, rType);
                break;
            case 5:
                break;
            default:
        }
    };

    var init = function (viewModel, source, clients, crmClient) {
        model = viewModel;
        subSource = vmCommon.deepCopy(source);
        clientSource = vmCommon.deepCopy(clients);
        crmClientItem = crmClient;

        groupSub();
        groupClient();
        groupCus();
        return function (callback) {
            if (typeof callback == 'function') {
                callback();
            }
        }
    };

    var deleteCrmClientItem = function () {
        if (crmClientItem)
            crmClientItem.IsSelect = false;
        crmClientItem.DataState = dataState.Deleted;
    };


    return {
        init: init,
        dataToSave: dataToSave,
        autoChange: autoChange,
        getGroupSub: getGroupSub,
        groupSub: groupSub,
        groupClient: groupClient,
        groupCus: groupCus,
        dataSelected: dataSelected,
        rootType: rootType,
        dataClientToSave: dataClientToSave,
        dataClientSelected: dataClientSelected,
        deleteCrmClientItem: deleteCrmClientItem,
        dataCusToSave: dataCusToSave,
        dataCusSelected: dataCusSelected
    };
}();

vmGoalAction.reloadOpenMasterGoalArea = function (except) {
    var smpIds = [];
    var indIds = [];

    //submarketproduct
    $("#goalActionView span.master-title").not(".hidden").each(function () { var smpid = $(this).attr("smpid"); if ($("#collapseProd" + smpid).data("hasData") && except.smpIds && except.smpIds.indexOf(smpid) == -1) smpIds.push(smpid); })

    //regionoverview
    $("#regionoverview span.master-title").not(".hidden").each(function () { var smpid = $(this).attr("smpid"); if ($("#collapseProd" + smpid).data("hasData") && except.smpIds && except.smpIds.indexOf(smpid) == -1) smpIds.push(smpid); })

    //independency
    $("#independencyView span.master-title[type='child']").not(".hidden").each(function () { var childid = isNaN($(this).attr("tid")) ? 0 : parseInt($(this).attr("tid")); if ($("#collapseChildIndepend" + childid).data("hasData") && except.indIds && except.indIds.indexOf(childid) == -1) indIds.push(childid); })

};

vmGoalAction.expandService = (function () {
    "use strict";

    var grandItems = [], subItems = [], indItems = [], items = [], gnavItems = [], sgnavItems = [];
    var isSaving = false, savingTimer, hasData = false, enableService = true, grandSource = "", typeId;
    var enumType = {
        MaingoalNav: 1000,
        SubgoalNav: 2000,
    };

    var setDataState = function (flag) {
        hasData = flag;
    };

    var init = function (ex) {
        if (!ex) return;

        //child
        typeId = ex.TypeId;
        items = ex.ExpandValue ? ex.ExpandValue.split(",") : [];

        //parent
        var temps = ex.ExpandParentValue ? ex.ExpandParentValue.split(",") : [];

        for (var i = 0, len = temps.length; i < len; i++) {
            if (temps[i].lastIndexOf("s") === -1) {
                indItems.pushx(temps[i]);
            } else {
                subItems.pushx(parseInt(temps[i]).toString());
            }
        }

        //grand
        grandItems = ex.ExpandGrandValue ? ex.ExpandGrandValue.split(",") : [];
        grandSource = ex.ExpandGrandSource || "";

        //maingoal nav
        gnavItems = ex.ExpandMaingoalNavValue ? ex.ExpandMaingoalNavValue.split(",") : [];

        //subgoal nav
        sgnavItems = ex.ExpandSubgoalValue ? ex.ExpandSubgoalValue.split(',').filter(x => { return x != ''; }) : [];
        if (sgnavItems.length > 0 && sgnavItems.length != 2) {
            sgnavItems = [sgnavItems[sgnavItems.length - 1]];
        }
    };

    var reInit = function () {
        vmGoalAction.dataservice.getExpand(null, function (res) {
            init(res.value);
        });
    };

    var dataToSave = function () {
        return {
            expandValue: items.join(","),
            expandParentValue: subItems.map(function (s) { return s + "s"; }).join(",") + (subItems.length > 0 && indItems.length > 0 ? "," : "") + indItems.join(","),
            expandGrandValue: grandItems.join(","),
            expandMaingoalNavValue: gnavItems.join(","),
            ExpandSubgoalValue: sgnavItems ? sgnavItems.join(",") : null,
            typeId: typeId
        };
    };

    var save = function () {

        if (isSaving) {
            clearTimeout(savingTimer);
        }

        isSaving = true;
        var entry = dataToSave();

     //   vmGoalAction.dataservice.saveExpand(entry);
        isSaving = false;

    };

    var expand = function () {
        //enableService = false;
        if (items.length === 0 && subItems.length === 0 && indItems.length === 0 && grandItems.length === 0 && gnavItems.length === 0) return;

        //expand grand
        for (var l = 0; l < grandItems.length; l++) {
            var msrid = grandItems[l];
            if ($("#goalActionView div.market-content[msrid='" + msrid + "']").hasClass("hidden")) {
                var selector = "#goalActionView a.market-link[msrid='" + msrid + "']";
                if ($(selector).height() < 50)
                    $(selector).click();
            }
        }

        //expand parent theme
        for (var j = 0, jlen = indItems.length; j < jlen; j++) {
            var selector = "a[toggleparent='i" + indItems[j] + "']";

            if (!$(selector).data("isOpened")) {
                $(selector).click();

            };
            sortableThema($("a[href='#collapseParentIndepend" + indItems[j] + "']"));
        }

        //expand parent product
        for (var k = 0, klen = subItems.length; k < klen; k++) {
            var sub = $("#goalActionView a[toggleparent='s" + subItems[k] + "']");

            if (!$(sub).data("isOpened")) $(sub).click();
        }

        //expand child
        for (var i = 0, len = items.length; i < len; i++) {
            var isSubmarket = isNaN(items[i]);
            if (isSubmarket) {
                if (!$("collapseProd" + items[i]).hasClass("in")) {
                    $("#goalActionView #" + items[i]).click();
                }

            }
            else {
                if (!$("#independencyView #collapseChildIndepend" + items[i]).hasClass("in"))
                    $("#independencyView #" + items[i]).click();
            }
        }
    };

    function expandGoalNav(mainGoalIdArr) {
        var goalExpandArr = vmCommon.deepCopy(gnavItems);
        var length = 0;
        var dict_1 = {};

        if (mainGoalIdArr) {
            goalExpandArr = [];

            length = mainGoalIdArr.length;
            for (var i = 0; i < length; i++) {
                dict_1[mainGoalIdArr[i]] = mainGoalIdArr[i];
            }

            length = gnavItems.length;
            for (var i = 0; i < length; i++) {
                dict_1[gnavItems[i]] != null && goalExpandArr.push(gnavItems[i]);
            }
        }

        for (var i = 0; i < goalExpandArr.length; i++) {
            var gnav = $("a[href~='#collapseGoal" + goalExpandArr[i] + "']");
            var divNav = $("#collapseGoal" + goalExpandArr[i]);
            var isOpen = divNav.hasClass('in');
            if (!isOpen) {

                if (gnav.length > 0) {
                    gnav[0].click();
                }
            }
        }
    };

    function toggleSubgoalNav(subgoalId, isChange, isOpenIfOneChild) {
        var index = -1;

        for (var i = 0, l = sgnavItems.length; i < l; i++) {
            if (sgnavItems[i] === subgoalId) {
                if (isChange) {
                    index = i;
                } else {
                    // first load
                    /*if (sgnavItems[l - 1] === subgoalId) */
                    {
                        var $this = $('#collapseSubgoal' + subgoalId);

                        $thead = $this.closest('.msaCollapseSubgoal');
                        $thead.removeClass('msa-collapse-subgoal');
                        if (!$thead.hasClass('msa-collapse-subgoal')) {
                            $this.closest('.msaSubGoalTable').find('.msaGroupActionScrollView').show();
                        };
                        //$thead.find('.msaSgArrowCollapseExpand').addClass('text-before-color-white').addClass('font-arrow-down').removeClass('msa-colorc1').removeClass('font-arrow-right');
                    }
                };
                break;
            }
        };
        
        if (isChange && !isOpenIfOneChild) {
            if (index < 0) {
                // expand
                sgnavItems.push(subgoalId);
            } else {
                // collapse                
                sgnavItems.splice(index, 1);
            };
            udateService();
        };
        
    }

    function scrollToLastSubgoalNav() {
        var subgoalId = sgnavItems[sgnavItems.length - 1];
        var $sub = $(`div[data-id="${subgoalId}"]`);
        if ($sub.length > 0) {
            var $subFirst = $sub.first();
            if ($subFirst.offset().top > $(window).height()) {
                setTimeout(function () {
                    $(".body-content").animate({
                        // Scroll chieu doc
                        scrollTop: $subFirst.offset().top - 150
                    }, 696
                    );
                }, 333);
            }
        }
    }

    function udateService() {
        return;
        var entry = {
            //ExpandSubgoalValue: sgnavItems.length > 0 ? sgnavItems.join(",") : null,
            ExpandSubgoalValue: sgnavItems.length > 0 ? sgnavItems[sgnavItems.length -1] + '' : null
        };
        vmGoalAction.dataservice.saveexpandsubgoal(entry);
    };
    var toSqlQuery = function (type) {
        var src = type ? (type === 1 ? subItems : type === 2 ? indItems : type === enumType.MaingoalNav ? gnavItems : grandItems) : items;
        var strGrandItems = "";
        for (var i = 0; i < src.length; i++) {
            if (strGrandItems.length > 0) strGrandItems += ",'" + grandItems[i] + "'";
            else strGrandItems = "'" + grandItems[i] + "'";
        }

    };

    var add = function (item, type) {
        if (item == undefined) return;
        var temp = item.toString();

        var src = getSrc(type);
        //var isPushed = "no";
        if (src.indexOf(temp) === -1) {
            src.push(temp);
            save();
            //isPushed = "yes";
        }
    };

    var addX = function (item, type) {
        if (item == undefined) return;
        var temp = item.toString();
        var src = getSrc(type);
        //var isPushed = "no";
        if (src.indexOf(temp) === -1) {
            src.push(temp);
            //isPushed = "yes";
        }

    };

    var remove = function (item, type) {
        if (typeof item == 'undefined') return;
        var temp = item.toString();
        var src = getSrc(type);

        var index = src.indexOf(temp);
        if (index >= 0) {
            src.splice(index, 1);
            save();
        }
    };

    var clear = function (isShowMarketLabel) {
        items = []; subItems = []; indItems = []; grandItems = []; gnavItems = [], sgnavItems = [];

        save();
    };

    var get = function () {
        return items;
    };

    var getSrc = function (type) {
        return type ? (type === 1 ? subItems : type === 2 ? indItems : type === enumType.MaingoalNav ? gnavItems : type === enumType.SubgoalNav ? sgnavItems : grandItems) : items;
    };

    var exportExcel = function () {
        var smpExpands = $('[data-queue-reload]').map(function () { return $(this).attr('smk-product-id'); }).get();
        var indExpands = $('[data-queue-reload]').map(function () { return $(this).attr('theme-id'); }).get();

        if (smpExpands.length == 0 && indExpands.length == 0) return;

        function getShortItem(list) {
            var rs = [];
            for (var i = 0; i < list.length; i++) {
                var main = list[i];
                var smpId = main.SubMarketProductId;
                var indId = main.IndependencyId;

                var mShort = { Id: main.Id, Childs: [], SubMarketProductId: smpId, IndependencyId: indId, IsShow: main.IsShow };

                var subs = main.ListSubGoal;

                for (var j = 0; j < subs.length; j++) {
                    var sub = subs[j];
                    var sShort = { Id: sub.Id, Childs: [], SubMarketProductId: smpId, IndependencyId: indId, IsShow: sub.IsShow };

                    var acts = sub.ListAction;

                    for (var k = 0; k < acts.length; k++) {
                        var act = acts[k];
                        if (act.IsShow == 0) continue;

                        var aShort = { Id: act.Id, Childs: [], SubMarketProductId: smpId, IndependencyId: indId, IsShow: act.IsShow };

                        sShort.Childs.push(aShort);
                    }

                    if (sShort.IsShow == 1 || sShort.Childs.length > 0)
                        mShort.Childs.push(sShort);
                }

                if (mShort.IsShow == 1 || mShort.Childs.length > 0)
                    rs.push(mShort);
            }

            return rs;
        }

        var goalActions = [];
        for (var i = 0; i < smpExpands.length; i++) {
            var smpId = smpExpands[i];
            //var datas = vmGoalAction.goalsView[smpId];
            var datas = typeof MsaApp == 'object' ? MsaApp.getListMainFrom(smpId) : [];

            goalActions = goalActions.concat(getShortItem(datas));
        }

        for (var i = 0; i < indExpands.length; i++) {
            var indId = indExpands[i];
            //var datas = vmGoalAction.goalsViewIndependency[indId];
            var datas = typeof MsaApp == 'object' ? MsaApp.getListMainFromInd(indId) : [];

            goalActions = goalActions.concat(getShortItem(datas));
        }

        vmGoalAction.dataservice.exportExcel({ submarketproductids: smpExpands, independencyids: indExpands, goalActions: goalActions }, function (res) {
            var data = res.value;
            vmCommon.GetFileFromUrl(data.Url, data.Name);
        });

    };

    var isGoalExpand = function (goalId) {
        return gnavItems.findIndex(t => t.toUpperCase() == goalId.toUpperCase()) != -1;
    }

    var isSubGoalExpand = function (goalId) {
        return sgnavItems.findIndex(t => t.toUpperCase() == goalId.toUpperCase()) != -1;
    }

    return {
        init: init, save: save, add: add, addX: addX, remove: remove, clear: clear, get: get, expand: expand, expandGoalNav: expandGoalNav,
        toSqlQuery: toSqlQuery, toggleSubgoalNav: toggleSubgoalNav,
        setDataState: setDataState,
        reInit: reInit,
        exportExcel: exportExcel,
        addSubgoalNavItem: function (subgoalId) {
            sgnavItems.push(subgoalId);
            udateService();
        },
        isGoalExpand: isGoalExpand,
        isSubGoalExpand: isSubGoalExpand,
        enumType: enumType,
        getSrc: getSrc,
        isProductExpand: function (itemId) {
            return items.length == 0 ? true : items.filter(function (el) { return el == itemId }).length > 0;
        },
        dataToSave: dataToSave,
        scrollToLastSubgoalNav: scrollToLastSubgoalNav,
        log: function () {
            console.log('grandItems, subItems, indItems, gnavItems, sgnavItems, items');
            console.log(JSON.parse(JSON.stringify(grandItems)), JSON.parse(JSON.stringify(subItems)), JSON.parse(JSON.stringify(indItems)), JSON.parse(JSON.stringify(gnavItems)), JSON.parse(JSON.stringify(sgnavItems)), JSON.parse(JSON.stringify(items)));
        }
    };
})();

vmGoalAction.checkFitSubProductSubClientV3 = function (item, typeFilter, addOption) {
    if (!item) return true;
    var sources = msFilter.controlService.getSource();

    function getSubProduct(parentData) {
        if (!parentData || parentData.length == 0) return [];

        var productIds = parentData.map(t => t.Id);
        if (productIds.length == 0) return [];

        var subs = sources.subProducts || [];
        if (subs.length == 0) return [];

        var rs = [];
        for (var k = 0; k < subs.length; k++) {
            if (productIds.indexOf(subs[k].ParentId) !== -1) {
                rs.push(subs[k]);
            }
        }

        return rs;
    };

    function getSubClient(parentData) {
        if (!parentData || parentData.length == 0) return [];

        var submarketIds = parentData.map(t => t.Id);
        if (submarketIds.length == 0) return [];

        var subs = sources.subClients || [];
        if (subs.length == 0) return [];

        var rs = [];
        for (var k = 0; k < subs.length; k++) {
            if (submarketIds.indexOf(subs[k].ParentId) !== -1) {
                rs.push(subs[k]);
            }
        }

        return rs;
    };

    function getSubProducts(parents) {
        if (!parents) return [];
        var childs = [];
        for (var i = 0; i < parents.length; i++) {
            var subproductstemp = getSubProduct(parents[i].Name);
            if (subproductstemp.length > 0)
                vmCommon.pushApply(childs, subproductstemp);
        }
        return childs;
    }

    function getSubClients(parents) {
        if (!parents) return [];
        var childs = [];
        for (var i = 0; i < parents.length; i++) {
            var subclientstemp = getSubClient(parents[i].Name);
            if (subclientstemp.length > 0)
                vmCommon.pushApply(childs, subclientstemp);
        }
        return childs;
    }

    function getNameById(list, id) {
        var retName = '';
        if (!list || list.length < 1) return null;
        for (var i = 0; i < list.length; i++) {
            if (retName.length > 0) break;
            if (list[i].Id && list[i].Id === id && list[i].Name) retName = list[i].Name;
        }

        return retName;
    };

    function isContainName(list, name) {
        if (!name || name.length < 1) return false;
        var isContain = false;
        if (!list || list.length < 1) return false;
        for (var i = 0; i < list.length; i++) {
            if (isContain) break;
            if (list[i].Name && list[i].Name === name)
                isContain = true;
        }
        return isContain;
    };

    function compareByParent(sources, selecteds, predicate) {

        if (!sources || !selecteds) return false;
        if (!predicate) predicate = "ObjectIds";
        var isValid = false;

        for (var i = 0; i < sources.length; i++) {
            for (var j = 0; j < selecteds.length; j++) {
                if (isValid) break;
                var objectId = selecteds[j][predicate] !== undefined ? (selecteds[j][predicate] + "") : "";
                if ((selecteds[j].Id !== undefined && sources[i].Id !== undefined && sources[i].Id === selecteds[j].Id)
                    || (sources[i].Id !== undefined && objectId.indexOf(sources[i].Id) !== -1))
                    isValid = true;
            }
        }

        return isValid;
    }

    function compareBySubs(sources, selecteds, predicate) {

        if (!sources || !selecteds) return false;
        if (!predicate) predicate = "ObjectIds";
        var isValid = false;

        for (var i = 0; i < sources.length; i++) {
            for (var j = 0; j < selecteds.length; j++) {
                if (isValid) break;
                var objectId = selecteds[j][predicate] !== undefined ? (selecteds[j][predicate] + "") : "";
                if (sources[i].Id !== undefined && objectId.indexOf(sources[i].Id) !== -1)
                    isValid = true;
            }
        }

        return isValid;
    }

    var enumItemFilter = { ProductOrSubMarket: 1, SubProductOrSubClient: 2 };

    function getListChild(parent, id) {
        if (parent == null) {
            return [];
        }
        for (var i = 0; i < parent.length; i++) {
            if (parent[i].Id == id) {
                var list = parent[i].ItemFilters;
                return list;
            }
        }
        return [];
    };

    function filterByParentId(type, parentId, listParents, listChilds) {
        if (parseInt(parentId) <= 0) return listChilds;
        var listChildsFiltered = [];
        var parentName = getNameById(listParents, parentId);
        if (parentName && parentName.length > 0) {
            switch (type) {
                case enumItemFilter.ProductOrSubMarket:
                    for (var i = 0; i < listParents.length; i++) {
                        if (listParents[i].Name === parentName)
                            vmCommon.pushApply(listChildsFiltered, getListChild(listParents, listParents[i].Id) || []);
                    }
                    break;
                case enumItemFilter.SubProductOrSubClient:
                    for (var i = 0; i < listChilds.length; i++) {
                        if (listChilds[i].ParentName === parentName)
                            listChildsFiltered.push(listChilds[i]);
                    }
                    break;
            }

        }

        return listChildsFiltered;
    };

    if (addOption && (((typeFilter === mFilter.enumFilter.productGroup && (!item.OwnerProductName || !item.OwnerProductGroupName))) || ((typeFilter === mFilter.enumFilter.market && (!item.OwnerSubMarketName || !item.OwnerMarketSegmentName))))) {
        item.OwnerProductName = addOption.OwnerProductName;
        item.OwnerProductGroupName = addOption.OwnerProductGroupName;

        item.OwnerSubMarketName = addOption.OwnerSubMarketName;
        item.OwnerMarketSegmentName = addOption.OwnerMarketSegmentName;
    }


    var filter, a, b, c, isResetSubProduct = false, isResetSubClient = false;
    switch (typeFilter) {
        case mFilter.enumFilter.productGroup:
            isResetSubProduct = false;
            var productgroups = sources.productGroup;//vmFilter.GetList(vmFilter.enumFilter.productGroup, true) || [];
            var products = [];
            for (var i = 0; i < productgroups.length; i++) {
                var producttemp = getListChild(productgroups, productgroups[i].Id) || [];
                if (producttemp.length > 0)
                    vmCommon.pushApply(products, producttemp);
            }

            var subDataSelected = vmGoalAction.subService.dataSelected();
            var groupSelected = $.grep(subDataSelected, function (x) { return x.TypeId === 1; });
            var prosSelected = $.grep(subDataSelected, function (x) { return x.TypeId === 2; });
            var subsSelected = $.grep(subDataSelected, function (x) { return x.TypeId === 3; });

            var itemFilters = msFilter.controlService.getItemFilters(mFilter.enumFilter.productGroup);
            for (var i = 0; i < itemFilters.length; i++) {
                filter = itemFilters[i];
                //if (filter.TypeValue === vmFilter.enumFilter.productGroup) {
                var productFilter = filterByParentId(enumItemFilter.ProductOrSubMarket, filter.ParentValue, productgroups, products);
                var subProductFilter = filterByParentId(enumItemFilter.SubProductOrSubClient, filter.ChildValue, productFilter, getSubProducts(productFilter));
                var groupName = getNameById(productgroups, filter.ParentValue);
                var productName = getNameById(productFilter, filter.ChildValue);
                var subName = getNameById(subProductFilter, filter.ChildValue1);
                a = filter.ParentValue;
                b = filter.ChildValue;
                c = filter.ChildValue1;
                if ((b <= 0 && c <= 0 && item.OwnerProductGroupName !== undefined && item.OwnerProductGroupName === groupName)
                    || (b > 0 && c <= 0 && item.OwnerProductName !== undefined && item.OwnerProductName === productName)
                    || (a > 0 && b <= 0 && c <= 0 && (isContainName(groupSelected, groupName) || compareByParent(productFilter, prosSelected) || compareBySubs(subProductFilter, subsSelected)))
                    || (a > 0 && b > 0 && c <= 0 && isContainName(groupSelected, groupName) && (compareByParent(productFilter, prosSelected) || compareByParent(subProductFilter, subsSelected)))
                    || (b > 0 && c <= 0 && ((compareByParent(productFilter, prosSelected) && isContainName(prosSelected, productName)) || compareByParent(subProductFilter, subsSelected)))
                    || (c > 0 && compareBySubs(subProductFilter, subsSelected) && isContainName(subsSelected, subName))) {
                    //vmGoalAction.fitCriterias.push({ TypeValue: vmFilter.enumFilter.productGroup, ParentValue: filter.ParentValue, ChildValue: filter.ChildValue, ChildValue1: filter.ChildValue1 });
                }
                else isResetSubProduct = true;

                //}
            }

            if (isResetSubProduct)
                msFilter.controlService.removeItemFilter(mFilter.enumFilter.productGroup);

            return isResetSubProduct;
        case mFilter.enumFilter.market:
            //isResetSubClient = false;
            var markets = sources.market;//vmFilter.GetList(vmFilter.enumFilter.market, true) || [];
            var submarkets = [];
            for (var i = 0; i < markets.length; i++) {
                var clienttemp = getListChild(markets, markets[i].Id) || [];
                if (clienttemp.length > 0)
                    vmCommon.pushApply(submarkets, clienttemp);
            }

            var clientDataSelected = vmGoalAction.subService.dataClientSelected();
            var marketsSelected = $.grep(clientDataSelected, function (x) { return x.TypeId === 1; });
            var subMarsSelected = $.grep(clientDataSelected, function (x) { return x.TypeId === 2; });
            var clientsSelected = $.grep(clientDataSelected, function (x) { return x.TypeId === 3; });

            var itemFilters = msFilter.controlService.getItemFilters(mFilter.enumFilter.market);
            for (var i = 0; i < itemFilters.length; i++) {
                filter = itemFilters[i];
                //if (filter.TypeValue === vmFilter.enumFilter.market) {

                var subMarketFilter = filterByParentId(enumItemFilter.ProductOrSubMarket, filter.ParentValue, markets, submarkets);
                var subClientFilter = filterByParentId(enumItemFilter.SubProductOrSubClient, filter.ChildValue, subMarketFilter, getSubClients(subMarketFilter));
                var marketName = getNameById(markets, filter.ParentValue);
                var subMarketName = getNameById(subMarketFilter, filter.ChildValue);
                var clientName = getNameById(subClientFilter, filter.ChildValue1);
                a = filter.ParentValue;
                b = filter.ChildValue;
                c = filter.ChildValue1;
                if ((b <= 0 && c <= 0 && item.OwnerMarketSegmentName !== undefined && item.OwnerMarketSegmentName === marketName)
                    || (b > 0 && c <= 0 && item.OwnerSubMarketName !== undefined && item.OwnerSubMarketName === subMarketName)
                    || (a > 0 && b <= 0 && c <= 0 && (isContainName(marketsSelected, marketName) || compareByParent(subMarketFilter, subMarsSelected, "ObjectId") || compareBySubs(subClientFilter, clientsSelected, "ObjectId")))
                    || (a > 0 && b > 0 && c <= 0 && isContainName(marketsSelected, marketName) && (compareByParent(subMarketFilter, subMarsSelected, "ObjectId") || compareByParent(subClientFilter, clientsSelected, "ObjectId")))
                    || (b > 0 && c <= 0 && ((compareByParent(subMarketFilter, subMarsSelected, "ObjectId") && isContainName(subMarsSelected, subMarketName)) || compareByParent(subClientFilter, clientsSelected, "ObjectId")))
                    || (c > 0 && compareBySubs(subClientFilter, clientsSelected, "ObjectId") && isContainName(clientsSelected, clientName))) {
                    //vmGoalAction.fitCriterias.push({ TypeValue: vmFilter.enumFilter.market, ParentValue: filter.ParentValue, ChildValue: filter.ChildValue, ChildValue1: filter.ChildValue1 });
                }
                else isResetSubClient = true;
                //}
            }

            if (isResetSubClient)
                msFilter.controlService.removeItemFilter(mFilter.enumFilter.market);

            return isResetSubClient;
        default:
            return false;
    }
};

vmGoalAction.isTextSearchNotEmpty = function () {
    var stext = $("#textSearch").val();

    return stext != null && stext.length > 0;
};

vmGoalAction.checkFitWorkingRange = function (startDate, endDate, fibus) {
    var wr = msFilter.controlService.getWorkingRange;//vmFilter.filterContainer.WorkingRange;

    //1. Wr is null or blank
    if (!wr || (!wr.Start && !wr.End)) {
        return false;
    }

    var wrStart = wr.Start, wrEnd = wr.End, flag = false;

    //2. Has filter master
    if (false) {
        return false;
    }
    else if (msFilter.controlService.hasCriteria(mFilter.enumFilter.fibuKostenstellen) && (fibus && fibus.length > 0)) {
        var valueDate = fibus[0].FibuDate || (typeof fibus[0].FibuDate === "string" ? fibus[0].FibuDate.jsonToDate() : fibus[0].FibuDate);
        for (var i = 1, len = fibus.length; i < len; i++) {
            var tempDate = fibus[i].FibuDate || (typeof fibus[i].FibuDate === "string" ? fibus[i].FibuDate.jsonToDate() : fibus[i].FibuDate);
            if (tempDate) {
                valueDate = valueDate ? (vmCommon.compareDate2(tempDate, valueDate) > 0 ? tempDate : valueDate) : fibus[i].FibuDate;
            }
        }

        if (valueDate) {
            flag = !(valueDate != null && (!wrStart || vmCommon.compareDate2(valueDate, wrStart) >= 0) && (!wrEnd || vmCommon.compareDate2(valueDate, wrEnd) <= 0));


            if (flag) {
                var year = valueDate.getFullYear();
                vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: new Date(year, 0, 1), ChildValue1: new Date(year, 11, 31), ParentValue: year });
            } else {
                vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: wrStart, ChildValue1: wrEnd });
            }

        } else {
            flag = !(
                (startDate && (!wrStart || vmCommon.compareDate2(startDate, wrStart) >= 0) && (!wrEnd || vmCommon.compareDate2(startDate, wrEnd) <= 0))
                || (endDate && (!wrStart || vmCommon.compareDate2(endDate, wrStart) >= 0) && (!wrEnd || vmCommon.compareDate2(endDate, wrEnd) <= 0))
            );

            if (flag) {
                vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: startDate, ChildValue1: endDate });
            } else {
                vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: wrStart, ChildValue1: wrEnd });
            }
        }

        return flag;

    } else {
        flag = !(
            (startDate && (!wrStart || vmCommon.compareDate2(startDate, wrStart) >= 0) && (!wrEnd || vmCommon.compareDate2(startDate, wrEnd) <= 0))
            || (endDate != null && (!wrStart || vmCommon.compareDate2(endDate, wrStart) >= 0) && (!wrEnd || vmCommon.compareDate2(endDate, wrEnd) <= 0))
        );
    }

    if (flag) {
        vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: startDate, ChildValue1: endDate });
    } else {
        vmGoalAction.fitCriterias.push({ TypeValue: mFilter.enumFilter.workingRange, ChildValue: wrStart, ChildValue1: wrEnd });
    }

    return flag;
};

vmGoalAction.checkFitSubClient = function () {
    return true;
    //TODO: recode late
    //var subFilter = vmFilter.GetList(vmFilter.enumFilter.market, true);
    //var datas = vmGoalAction.subService.dataClientSelected();

    //if (subFilter == null) {
    //    return false;
    //}

    //if (datas.length === 0) {
    //    return true;
    //}

    //var isHasGroup = false, isHasProduct = false, isHasSubProduct = false;

    //var checkFitByType2 = function (src, filters, type) {
    //    var flag = false;
    //    var groupData = $.grep(src, function (it) { return it.TypeId === type; });
    //    if (groupData.length > 0) {
    //        var groupIds = vmCommon.selectProperty(groupData, "ObjectIds").join(",").split(",");

    //        for (var i = 0; i < groupIds.length; i++) {
    //            if (!isNaN(Number(groupIds[i])) && filters.indexOf(Number(groupIds[i])) !== -1) {
    //                flag = true;
    //                break;
    //            }
    //        }
    //    }

    //    return flag;
    //};

    //var group1 = subFilter, group2 = [], group3 = [];
    //for (var i = 0; i < group1.length; i++) {
    //    vmCommon.pushApply(group2, subFilter[i].ItemFilters);
    //}

    //for (var i = 0; i < group2.length; i++) {
    //    vmCommon.pushApply(group3, vmFilter.getSubClient(group2[i].Name));
    //}

    //if (group1.length !== 0) {
    //    isHasGroup = checkFitByType2(datas, group1, 1);
    //}

    //if (group2.length !== 0) {
    //    isHasProduct = checkFitByType2(datas, group2, 2);
    //}

    //if (group3.length !== 0) {
    //    isHasSubProduct = checkFitByType2(datas, group3, 3);
    //}

    //var isReset = !(isHasGroup || isHasProduct || isHasSubProduct);

    //if (!isReset) {
    //    var temp = $.grep(vmFilter.DFilter, function (it) { return it.TypeValue === vmFilter.enumFilter.market; });
    //    for (var i = 0; i < temp.length; i++) {
    //        vmGoalAction.fitCriterias.push(temp[i]);
    //    }
    //}

    //return isReset;
};

vmGoalAction.checkFitSubProductGroup = function (datas, subFilter) {
    return true;

    //TODO: recode late
    //if (subFilter == null) {
    //    return false;
    //}

    //if (datas.length === 0) {
    //    return true;
    //}

    //var isHasGroup = false, isHasProduct = false, isHasSubProduct = false;

    //var checkFitByType = function (src, filters, type) {
    //    var flag = false;
    //    var groupData = $.grep(src, function (it) { return it.TypeId === type; });
    //    if (groupData.length > 0) {
    //        var groupIds = vmCommon.selectProperty(groupData, "ObjectIds").join(",").split(",");

    //        for (var i = 0; i < groupIds.length; i++) {
    //            if (!isNaN(Number(groupIds[i])) && filters.indexOf(Number(groupIds[i])) !== -1) {
    //                flag = true;
    //                break;
    //            }
    //        }
    //    }

    //    return flag;
    //};

    //if (subFilter.groups.length !== 0) {
    //    isHasGroup = checkFitByType(datas, subFilter.groups, 1);
    //}

    //if (subFilter.products.length !== 0) {
    //    isHasProduct = checkFitByType(datas, subFilter.products, 2);
    //}

    //if (subFilter.subProducts.length !== 0) {
    //    isHasSubProduct = checkFitByType(datas, subFilter.subProducts, 3);
    //}

    //var isReset = !(isHasGroup || isHasProduct || isHasSubProduct);

    //if (!isReset) {
    //    var temp = $.grep(vmFilter.DFilter, function (it) { return it.TypeValue === vmFilter.enumFilter.productGroup; });
    //    for (var i = 0; i < temp.length; i++) {
    //        vmGoalAction.fitCriterias.push(temp[i]);
    //    }
    //}

    //return isReset;
};

//fit subclient filter
vmGoalAction.checkFitSubClientGroup = function (datas, mkFilter) {
    return true;

    //TODO: recode late
    //if (mkFilter == null) {
    //    return false;
    //}

    //if (datas.length === 0) {
    //    return true;
    //}

    //var isHasMarket = false, isHasSubMarket = false, isHasSubClient = false;

    //var checkFitByType = function (src, filters, type) {
    //    var flag = false;
    //    var groupData = $.grep(src, function (it) { return it.TypeId === type; });
    //    if (groupData.length > 0) {
    //        var groupIds = vmCommon.selectProperty(groupData, "ObjectId");

    //        for (var i = 0; i < groupIds.length; i++) {
    //            if (!isNaN(Number(groupIds[i])) && filters.indexOf(Number(groupIds[i])) !== -1) {
    //                flag = true;
    //                break;
    //            }
    //        }
    //    }

    //    return flag;
    //};

    //if (mkFilter.markets.length !== 0) {
    //    isHasMarket = checkFitByType(datas, mkFilter.markets, 1);
    //}

    //if (mkFilter.subMarkets.length !== 0) {
    //    isHasSubMarket = checkFitByType(datas, mkFilter.subMarkets, 2);
    //}

    //if (mkFilter.subClients.length !== 0) {
    //    isHasSubClient = checkFitByType(datas, mkFilter.subClients, 3);
    //}

    //var isReset = !(isHasMarket || isHasSubMarket || isHasSubClient);

    //if (!isReset) {
    //    var temp = $.grep(vmFilter.DFilter, function (it) { return it.TypeValue === vmFilter.enumFilter.market; });
    //    for (var i = 0; i < temp.length; i++) {
    //        vmGoalAction.fitCriterias.push(temp[i]);
    //    }
    //}

    //return isReset;
};

vmGoalAction.gotoMixService = function () {
    var queue = [], timeInterval;
    var redirect = function () {
        var flag = true;
        var goalId = queue.pop();
        if (queue.length === 0) {
            flag = false;
        }
        if (goalId) {
            var url = "/Pages/MsMarketingMix.aspx?lang=" + kLg.language + "&projid=" + projectId + "&strid=" + strategyId;
            url += '&gotomix=1';
            vmGoalAction.dataservice.cloneFilterToMix({ goalid: goalId }, function (res) {
                window.open(url, "_blank");
            });
        }

        return flag;
    };

    var stopInterval = function () {
        clearInterval(timeInterval); timeInterval = undefined;
    };

    var startInterval = function () {
        redirect();
        timeInterval = setInterval(function () {
            if (!redirect()) {
                stopInterval();
            };
        }, 1000);
    };

    var gotoMix = function (goalId,e) {
        //Truyền goalid mới từ vue nên comment lại goalid cũ
        //var goalId = $(e).attr('data-id');
        if (goalId == undefined || goalId == vmCommon.emptyGuid) return;
        //add to queue
        queue.unshift(goalId);

        if (timeInterval == undefined) {
            startInterval();
        }

        var dataType = $(e).attr('data-type');
        if (dataType == '2') {
            vmGoalAction.expandService.addSubgoalNavItem(goalId);
        }
    };

    return { gotoMix: gotoMix, intervalState: function () { return timeInterval ? "running" : "stopped" } };
}();

vmGoalAction.gotoRMService = function () {
    var queue = [], timeInterval;

    var redirect = function () {
        var flag = true;
        var goalId = queue.pop();
        if (queue.length === 0) {
            flag = false;
        }

        if (goalId) {
            var url = "/Pages/MsRoadmap.aspx?lang=" + kLg.language + "&projid=" + projectId + "&strid=" + strategyId;
            url += '&gotomix=1';
            vmGoalAction.dataservice.cloneFilterToRoadMap({ goalid: goalId }, function (res) {
                window.open(url, "_blank");
            });
        }

        return flag;
    };

    var stopInterval = function () {
        clearInterval(timeInterval); timeInterval = undefined;
    };

    var startInterval = function () {
        redirect();
        timeInterval = setInterval(function () {
            if (!redirect()) {
                stopInterval();
            };
        }, 1000);
    };

    var gotoRoadMap = function (goalId,e) {
                //Truyền goalid mới từ vue nên comment lại goalid cũ
        //var goalId = $(e).attr('data-id');
        if (goalId == undefined || goalId == vmCommon.emptyGuid) return;
        //add to queue
        queue.unshift(goalId);

        if (timeInterval == undefined) {
            startInterval();
        }

        var dataType = $(e).attr('data-type');
        if (dataType == '2') {
            vmGoalAction.expandService.addSubgoalNavItem(goalId);
        }
    };

    return { gotoRoadMap: gotoRoadMap };
}();

vmGoalAction.hasColumnResultFilter = function (colId, mainGoalId) {
    var flag = false;
    $("div.msa-subgoal-view-column[maingoalid='" + mainGoalId + "']").each(function () {
        var columnId = $(this).attr("data-columnid");
        if (columnId == colId) return;

        if ($(this).find("div[mstype='action'][result]").length > 0) flag = true;
    });

    return flag;
};

vmGoalAction.getCustomerJourneyColumn = function (colId, mainGoalId) {
    var values = [];
    $("div.msa-subgoal-view-column[maingoalid='" + mainGoalId + "'][cid][hasaction]").each(function () {
        var columnId = $(this).attr("data-columnid");
        if (columnId == colId) return;

        var cId = $(this).attr("cid");
        var typeId = $(this).attr("ctype");

        if (isNaN(Number(cId)) || isNaN(Number(typeId))) return;

        if (!values.some(t => t.TypeId == typeId && t.ObjectId == cId)) {
            values.push({ ObjectId: Number(cId), TypeId: Number(typeId) });
        }
    });

    return values;
};

vmGoalAction.hasResultsFilter = function (id, parentId, smkId, indId) {
    var areaId = smkId || indId;

    if (!id || id === vmCommon.emptyGuid) {
        return !(parentId) || (parentId === vmCommon.emptyGuid);
    }

    var areaCpn = MsaApp.componentService(MsaApp.IsShowNavigationMenu).get(areaId);// actionPlanComponents[areaId];
    if (areaCpn == undefined) return false;
    if (typeof areaCpn.getGoalActionResult != 'function') return [];
    var rsIds = areaCpn.getGoalActionResult(id);
    return !rsIds.some(t => t != id);
};

vmGoalAction.isActionFitFilterMaster = function (id, parentId, firstIds, lastIds) {

    if (!parentId || parentId === vmCommon.emptyGuid) {
        return lastIds.length === 0 || msFilter.controlService.isFitFilter(lastIds, mFilter.enumFilter.masterGoal);
    }

    if (firstIds.equals(lastIds))
        return false;

    if (firstIds.length === 0)
        return false;

    if (lastIds.length > 0 && msFilter.controlService.isFitFilter(lastIds, mFilter.enumFilter.masterGoal)) {
        return false;
    }

    var area = $("#" + parentId).closest("div[mstype='child']");

    if (area.length === 0) {
        return true;
    }

    var mgroup = $("#" + parentId).attr("mgroup");
    var count = $(area).find("div[mstype='action'][result][mgroup='" + mgroup + "']").length;

    if (count === 0)
        return true;

    if (!id || id === vmCommon.emptyGuid) {
        return false;
    }

    if ($("#" + id).is("[result]")) {
        return !(count > 1);
    } else {
        return false;
    }
};

vmGoalAction.isGoalFitFilterMaster = function (type, id, parentId, firstId, lastId) {
    if (type === vmCommon.GoalType.MainGoal) {

        if (!id || id === vmCommon.emptyGuid || $("#" + id).is("[result]")) {
            return !lastId || lastId === vmCommon.emptyGuid || !msFilter.controlService.isFitFilter([lastId], mFilter.enumFilter.masterGoal);
        }

        if (!lastId || lastId === vmCommon.emptyGuid)
            return false;

        return msFilter.controlService.isFitFilter([lastId], mFilter.enumFilter.masterGoal);
    }

    //+ add subgoal without maingoal
    if (!parentId) {
        return !lastId || lastId === vmCommon.emptyGuid || !msFilter.controlService.isFitFilter([lastId], mFilter.enumFilter.masterGoal);
    }

    //+ edit subgoal + add subgoal with maingoal
    if (firstId === lastId)
        return false;

    if (!firstId)
        return false;

    if (lastId && msFilter.controlService.isFitFilter([lastId], mFilter.enumFilter.masterGoal)) {
        return false;
    }

    var area = $("#" + parentId).closest("div[mstype='child']");

    if (area.length === 0) {
        return true;
    }

    var mgroup = $("#" + parentId).attr("mgroup");
    var count = $(area).find("div[result][mgroup='" + mgroup + "']").length;

    if ($("#" + parentId).is("[result]")) {
        --count;
    }

    if (count === 0) {
        return true;
    }

    if (!id || id === vmCommon.emptyGuid) {
        return false;
    }
    var countChild = $("#" + id).closest("tr.data-row").find("div[result][mstype='action']").length;

    if ($("#" + id).is("[result]"))
        ++countChild;

    return !(count > countChild);
};

vmGoalAction.isGoalFitVisibility = function (theGoal) {
    //create maingoal, subgoal
    if (!theGoal.Id || theGoal.Id === vmCommon.emptyGuid) {
        return true;
    }

    //TODO: recode late
    var viState = msFilter.controlService.getVisibilityState();
    if (viState === mFilter.enumFilterVisibility.ShowAll) {
        return false;
    }

    var isVisibility = viState !== mFilter.enumFilterVisibility.Hide;
    if (isVisibility === theGoal.Visibility) {
        return false;
    }

    //edit
    var area = $("#" + theGoal.Id).closest("div[mstype='child']");
    if (area.length === 0) {
        return true;
    }

    var mgroup = $("#" + theGoal.Id).attr("mgroup");
    var count = $(area).find("div[result][mgroup='" + mgroup + "']").length;

    //edit maingoal
    if (!theGoal.ParentId || theGoal.ParentId === vmCommon.emptyGuid) {


        if ($("#" + theGoal.ParentId).is("[result]")) {
            --count;
        }

        return theGoal.IsVisibilityAll || count === 0;
    }

    //edit subgoal
    var countChild = $("#" + theGoal.Id).closest("tr.data-row").find("div[result][mstype='action']").length;

    if ($("#" + theGoal.Id).is("[result]"))
        ++countChild;

    return !(count > countChild);
};

vmGoalAction.isGoalFitToDo = function (id, parentId, smkId, indId) {
    if (!msFilter.controlService.hasCriteria(mFilter.enumFilter.date)) return false;

    //if (vmFilter.filterContainer.Dates == null || vmFilter.filterContainer.Dates.length < 1)
    //    return false;

    var areaId = smkId || indId, hasResult = false;

    if (!id || id === vmCommon.emptyGuid) {
        return !(parentId) || (parentId === vmCommon.emptyGuid);
    }

    var mgroup = $("#" + id).attr("mgroup");

    var collapeId = (smkId ? "collapseProd" : "collapseChildIndepend") + areaId;

    var f = [], o = [];
    vmCommon.findAllByFunc(f, vmFilter.filterContainer.Dates, function (it) { return it.Id === vmFilter.enumDate.AlreadyFnished; });
    vmCommon.findAllByFunc(o, vmFilter.filterContainer.Dates, function (it) { return it.Id === vmFilter.enumDate.StillOpen; });

    if (f.length > 0 && o.length > 0) {
        hasResult = true;
    }
    else if (f.length > 0) {
        hasResult = $("#" + collapeId).find("div[result][mgroup=" + mgroup + "][itemfinished]:not([id='" + id + "'])").length > 0;
    }
    else if (o.length > 0) {
        hasResult = $("#" + collapeId).find("div[result][mgroup=" + mgroup + "][itemstillopen]:not([id='" + id + "'])").length > 0;
    }

    return !hasResult;
};

//ENTITY: [ActionCost]
function ActionCost(startDate) {
    this.Id = 0;
    this.StartDate = startDate;
    this.EndDate = startDate;
    this.ExpectedCost = 0;
    this.ActualCost = 0;
    this.MIndex = 0;
    this.NumberOfDay = startDate ? 0 : null;

    this.DataState = dataState.Added;
    this.IsShow = true;

    this.FibuSupplier = "";
    this.FibuDescription = "";
    this.FibuSupplierId = null;
    this.Fibus = [];
    this.IsConnectionUp = false;
    this.Finish = false;
    this.Reminder = { TypeId: 2, ReminderDay: null, ReminderTime: null, Description: '' };
    this.Description = "";

    return this;
};

function MasterBudget() {
    this.Id = 0;
    this.MasterId = vmCommon.emptyGuid;
    this.MPercent = 0;
    this.DataState = dataState.Added;
    this.IsVisible = true;
    this.Src = [];
    this.MIndex = 0;
    this.Budget = "";
    this.ExpectedCost = "";
    this.ActualCost = "";

    return this;
}

vmGoalAction.autoSubHeight = function () {
    if ($("#subpanel .ms-icon-delete-gray").length > 0) {
        if ($('.col-md-6-fix.col-md-6.noPaddingLeft.abs-bottom-left').height() > 110) {
            var range = $('.col-md-6-fix.col-md-6.noPaddingLeft.abs-bottom-left').height() - 70;
            $("#subpanel").attr('style', "margin-left: 0;margin-right: 0;position: relative; margin-top: " + range + "px;");
        } else {
            $("#subpanel").attr('style', "margin-left: 0;margin-right: 0;position: relative;");
        }
    } else {
        $("#subpanel").attr('style', "margin-left: 0;margin-right: 0;position: relative;");
    }

};

vmGoalAction.openPopReminder = function (e, type) {

    vmGoalAction.pop.ReminderManager = undefined;
    vmGoalAction.item = e;
    vmGoalAction.ReminderType = type;
    vmGoalAction.pop.ReminderManager = showPopup(vmGoalAction.pop.ReminderManager,
        $('#pop-Reminder'),
        vmCommon.rootUrl + 'Contents/CrmPopReminder.html',
        {
            title: kLg.reminder,
            height: 250,
            width: 640,
            resizable: false
        }
    );
};

$("#goalactionbound").on("click", ".kpiregionurl", function (e) {
    var type = $(e.currentTarget).attr("urltype");
    if (type == undefined || isNaN(Number(type))) return;
    type = Number(type);

    var masterid = $(e.currentTarget).closest("td").attr("parentid");
    if (masterid == undefined) return;

    var areaid = $(e.currentTarget).closest("div[mstype='childArea']").attr("childid") || $(e.currentTarget).closest("div[mstype='smpArea']").attr("smpid");
    if (areaid == undefined) return;

    var regionid = $(e.currentTarget).closest("div.kpiregion").attr("regionid");
    if (regionid == undefined) return;
    regionid = Number(regionid);
    //expand
    vmGoalAction.kpRegionOptions = { isShowHidden: false, isShowAll: true };
    vmGoalAction.kpRegionService.expand(areaid, masterid, regionid, type);
    const $krItem = $('.kpigapopover-sticky').find('.icon-kr-item');
    $krItem.show();
    $krItem.attr('data-smkpid', areaid);
});

$("#goalactionbound").on("click", ".aplink-overview-url", function (e) {
    var id = $(e.currentTarget).attr("connectionlink");
    if (id == undefined) return;
    var typeid = $(e.currentTarget).attr("typeid");
    var parentInfo = vmGoalAction.getParentInfo($(e.currentTarget));
    var areaid = parentInfo.SubMarketProductId || parentInfo.IndependencyId;

    vmGoalAction.apLinkOverviewService.expand(areaid, id, typeid);
    const $linkItem = $('.kpigapopover-sticky').find('.icon-link-item');
    $linkItem.show();
    $linkItem.attr('data-smkpid', areaid);
    $linkItem.attr('linkid', id);
    $linkItem.attr('linktype', typeid);
    $linkItem.attr('title', kLg.lblApConnection);
});

$("#goalactionbound").on("click", ".onexpandkr-sticky", function (e) {
    var id = $(e.target).closest('.icon-kr-item').attr('data-smkpid');
    vmGoalAction.kpRegionService.expand(id);
});
$("#goalactionbound").on("click", ".onclosekr-sticky", function (e) {
    var id = $(e.target).closest('.icon-kr-item').attr('data-smkpid');
    vmGoalAction.kpRegionService.close(id);
});

$("#goalactionbound").on("click", ".oncloselink-sticky", function (e) {
    var id = $(e.target).closest('.icon-link-item').attr('data-smkpid');
    vmGoalAction.apLinkOverviewService.close(id);
});
$("#goalactionbound").on("click", ".onexpandlink-sticky", function (e) {
    var $kpiApSticky = $(e.target).closest('.icon-link-item');
    var areaId = $kpiApSticky.attr('data-smkpid');
    var id = $kpiApSticky.attr('linkid');
    var typeId = $kpiApSticky.attr('linktype');
    vmGoalAction.apLinkOverviewService.expand(areaId, id, typeId);
});

//oncollape
$("#goalactionbound").on("click", ".navigate-menu", function (e) {
    var gid = $(e.currentTarget).attr("gid");
    var gElement = $("td[goalid='" + gid + "'][mstype='mainGoal']");

    if (gElement.length === 0) {
        gElement = $("td[goalid='" + gid + "'][mstype='subGoal']");
        if (gElement.length === 0) return;
    };

    var scrollTop = $(".body-content").scrollTop();
    $(".body-content").animate({ scrollTop: $(gElement).offset().top - 132 + scrollTop });
});

vmGoalAction.onClickDropdownMaingoalCollapse = function (el) {
    (!!vmGoalAction.setHideGotoOtherTabInMenu) && vmGoalAction.setHideGotoOtherTabInMenu(); // backlog item 24222

    //if (!$(el).closest('.msaMgCollapseHead').hasClass('msa-mg-collapse-head')) {
    //    $(el).closest('div[mstype="parentContent"]').mouseleave(function () {
    //        $(el).parent().removeClass('open')
    //    });
    //}
};

vmGoalAction.updateIndependency = function (independency) {
    var parents = vmGoalAction.simpleView.ListIndependence;
    if (parents == undefined || parents.length === 0) return;

    for (var i = 0; i < parents.length; i++) {
        var parent = parents[i];

        if (parent.Id == independency.Id) {
            parent.Name = independency.Name;
            parent.IsMasterGoal = independency.IsMasterGoal;
            parent.IsMasterGoalKpi = independency.IsMasterGoalKpi;
            break;
        }

        var childs = parent.ListSubIndependency || [];
        for (var j = 0; j < childs.length; j++) {
            var child = childs[j];
            if (child.Id == independency.Id) {
                child.Name = independency.Name;
                child.IsMasterGoal = independency.IsMasterGoal;
                child.IsMasterGoalKpi = independency.IsMasterGoalKpi;
                break;
            }
        }
    }
};

vmGoalAction.showPopKpiGoal = function () {

    vmGoalAction.popKpiGoal = showPopup(vmGoalAction.popKpiGoal,
        $("#popkpigoal"),
        vmCommon.rootUrl + "Contents/MsPopKpiGoal.html",
        {
            title: vmGoalAction.goalOptions.GoalType === vmCommon.GoalType.MainGoal ? kLg.titleKpiMainGoal : kLg.titleKpiSubGoal,
            height: 512,
            width: 940,
            resizable: false
        }
    );
};

vmGoalAction.getTopicIconView = function (typeId) {

    switch (typeId) {
        case vmCommon.KpiGoalTopicType.LandRegion:
            return "icon-kpi-location-gray";
        case vmCommon.KpiGoalTopicType.Market:
            return "icon-kpi-market-gray";
        case vmCommon.KpiGoalTopicType.Product:
            return "icon-kpi-product-gray";
        case vmCommon.KpiGoalTopicType.Goal:
            return "icon-kpi-goal-gray";
        default:
            return "";
    }
};


vmGoalAction.listNavMaingoalVM = vmGoalAction.listNavMaingoalVM || {};

vmGoalAction.bindNavMaingoals = function (id, selector, data, bindEvent) {
    var that = this;

    var findModel = that.listNavMaingoalVM[id];

    if (!findModel) {
        findModel = kendo.observable({
            id: id,
            data: [data],
            updateData: function () {
                this.data.trigger('change');

                typeof this.bindEvent == 'function' && this.bindEvent();

                var maingoalIdArr = this.data[0].map(t => t.Id);

                that.expandService.expandGoalNav(maingoalIdArr);
            },
            bindEvent: bindEvent
        });

        that.listNavMaingoalVM[id] = findModel;

        kendo.bind($('#' + selector), findModel);
    }
    else {
        if (vmGoalAction.expandService.isProductExpand(id)) {
            findModel.set('data', [data]);
            findModel.updateData();
        }
    }
};

vmGoalAction.checkAndExpandGoalNav = function (goalId) {

    if (!goalId) return;
    setTimeout(function () {
        var gnavItem = $("div[gnavid~='" + goalId + "']");
        if (gnavItem.length > 0) {
            var aTag = $(gnavItem[0]).find("a[href~='#collapseGoal" + goalId + "']");
            if (aTag.length > 0 && $(gnavItem[0]).height() < 50) {
                $(aTag[0]).click();

            }
        }
    }, 111);

};

vmGoalAction.redirectTo = function (elementId, parentInfo) {
    if (!vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) return;

    if (parentInfo) {
        if (parentInfo.IndependencyId > 0) {
            if (!$("#collapseChildIndepend" + parentInfo.IndependencyId).hasClass('in')) {
                $("#independencyView #" + parentInfo.IndependencyId).click();
            }
        }
        else if (!$("#collapseProd" + parentInfo.SubMarketProductId).hasClass('in')) {
            $("#goalActionView #" + parentInfo.SubMarketProductId).click();
        }
    }

    var time = 0;
    var timeMax = 15000;
    var timeStep = 500;
    var timeDelay = 50;
    var abcInterval;

    setTimeout(function () {
        abcInterval = setInterval(function () {
            if (time >= timeMax) {
                clearInterval(abcInterval);
                return;
            }

            var element = $("div[anchor-id='" + elementId + "']");

            if (element.length > 0 && $(element).offset().top != 0) {
                console.log($(element).offset().top);
                clearInterval(abcInterval);
                setTimeout(function () {
                    var scrollTop = $(".body-content").scrollTop();

                    var headHeight = $(".ms-header").height() + $(".submenu").height();
                    var bodyHeight = $(".body-content").height();
                    var itemHeight = $(element).height();
                    var isAction = $(element).is("[mstype='action']");
                    var isColumn = $(element).is("[mstype='column']");

                    if (isAction || isColumn) {
                        var $parent = element.closest('.msaColumnViewSroll');
                        var $column = isColumn ? element : element.closest('.msa-subgoal-view-column');

                        if ($parent.length > 0) {
                            var scrollLeft = $($parent).scrollCenter($column, 100);

                            var $parent = $(element).closest('.msaGroupActionScrollView');
                            var $this = $parent.find('.msaColumnViewSroll');

                            var $viewColumn = $($parent).find('.msa-subgoal-view-column');

                            var sumWidthColumn = 0;
                            $viewColumn.each(function (i, e) {
                                sumWidthColumn += $(e).width();
                            });

                            if (sumWidthColumn > $this.width()) {
                                if (scrollLeft < 1) {
                                    $parent.children('.msa-btn-scroll-left').hide();
                                    $parent.children('.msa-btn-scroll-right').show();
                                }
                                else if (scrollLeft >= sumWidthColumn - $this.width()) {
                                    $parent.children('.msa-btn-scroll-right').hide();
                                    $parent.children('.msa-btn-scroll-left').show();
                                }
                                else {
                                    $parent.children('.msa-btn-scroll-left').show();
                                    $parent.children('.msa-btn-scroll-right').show();
                                }
                            }
                        }
                    }

                    $(".body-content").animate({ scrollTop: $(element).offset().top - (bodyHeight - itemHeight) / 2 - headHeight + scrollTop });

                }, 100);

                //clearInterval(abcInterval);
            } else time += timeStep;
        }, timeStep);
    }, timeDelay);
};

vmGoalAction.redirectToNew = function (elementId, parentInfo) {
    
    // 0 === $.active \
    if (!vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) return;

    if (parentInfo) {
        if (parentInfo.IndependencyId) {
            if (!$("#collapseChildIndepend" + parentInfo.IndependencyId).hasClass('in')) {
                $("#independencyView #" + parentInfo.IndependencyId).click();
            }
        }
        else if (!$("#collapseProd" + parentInfo.SubMarketProductId).hasClass('in')) {
            $("#goalActionView #" + parentInfo.SubMarketProductId).click();
        }
    }

    var element = $("div[anchor-id='" + elementId + "']");

    if (element.length > 0) {
        setTimeout(function () {
            var scrollTop = $(".body-content").scrollTop();
            var headHeight = $(".ms-header").height() + $(".submenu").height();
            var bodyHeight = $(".body-content").height();
            var itemHeight = $(element).height();

            $(".body-content").stop().animate(
                { scrollTop: $(element).offset().top - (bodyHeight - itemHeight) / 2 - headHeight + scrollTop },
                400, function () {
                    if (vmGoalAction.kpRegionService.IdMain || vmGoalAction.kpRegionService.IdSub) {
                        if (typeof vmGoalAction.kpRegionService.FuncClickMain == 'function') delete vmGoalAction.kpRegionService.FuncClickMain;
                        if (typeof vmGoalAction.kpRegionService.FuncClickSub == 'function') delete vmGoalAction.kpRegionService.FuncClickSub;
                        if (typeof vmGoalAction.kpRegionService.FuncDirect == 'function') delete vmGoalAction.kpRegionService.FuncDirect;
                        if (vmGoalAction.kpRegionService.IdMain) delete vmGoalAction.kpRegionService.IdMain;
                        if (vmGoalAction.kpRegionService.IdSub) delete vmGoalAction.kpRegionService.IdSub;
                    }
                }
            );
        }, 10);
    }
};

vmGoalAction.GetRegionRole = function (accountId, contains) {
    var lst = msFilter.controlService.getRegionAccountRoles(),//vmFilter.RegionAccountRoles,
        rs = [];

    for (var i = 0; i < lst.length; i++) {
        if (lst[i].AccountId === accountId && (lst[i].RoleId > 0 || contains.indexOf(lst[i].Id) > -1)) {
            rs.push({ Id: lst[i].Id, Name: lst[i].Name, RoleId: lst[i].RoleId });
        }
    }

    return rs;
};

vmGoalAction.GetSelectedRegionRole = function (accountId, contains) {
    var lst = msFilter.controlService.getRegionAccountRoles(),//vmFilter.RegionAccountRoles,
        rs = [];

    for (var i = 0; i < lst.length; i++) {
        if (lst[i].AccountId === accountId && contains.indexOf(lst[i].Id) > -1) {
            rs.push({ Id: lst[i].Id, Name: lst[i].Name, RoleId: lst[i].RoleId });
        }
    }

    return rs;
};

vmGoalAction.showPopupGoalActionEval = function (type) {
    var path = vmCommon.rootUrl + "Contents/MsPopGoalActionEval2.html";

    var template = type == 1 ? vmEditGoal.optionTemp.Applying : vmEditAction.viewModel.get("templateId");

    vmGoalAction.goalActionEvalOptions = vmGoalAction.goalActionEvalOptions || {};
    vmGoalAction.goalActionEvalOptions.goalActionModel = type == 1 ? vmEditGoal.viewModel.get("goal") : vmEditAction.viewModel.get("action");
    vmGoalAction.goalActionEvalOptions.objectType = type;
    
    vmGoalAction.goalActionEvalOptions.isShowDirect = false;
    vmGoalAction.goalActionEvalOptions.role = type == 1 ? vmGoalAction.Role : vmGoalAction.role;// vmGoalAction.Role;
    vmGoalAction.goalActionEvalOptions.goalActionTemplateId = template != null ? template.Id : null;
    vmGoalAction.goalActionEvalOptions.goalActionTemplate = template;

    var goalActionName = vmGoalAction.goalActionEvalOptions.goalActionModel.Name;
    var encodingTemplate = kendo.template("${title}");
    var encodingData = { title: kLg.titleApEvaluation + (goalActionName != null && goalActionName.length > 0 ? ' / ' + goalActionName : '') };

    if (vmGoalAction.popGoalActionEval)
        vmGoalAction.popGoalActionEval.refresh(path).center().open();
    else {
        vmGoalAction.popGoalActionEval = $("#popGoalActionEval").kendoWindow({
            width: '1290px',
            minWidth: '1290px',
            height: '700px',
            minHeight: '700px',
            title: encodingData.title,
            content: path,
            actions: [
                "Maximize",
                "Close"
            ],
            modal: true
        }).data("kendoWindow").center();
    }

    vmGoalAction.goalActionEvalOptions.cb = function () {        
        if (vmCommon.checkCurrentPage(vmCommon.enumPage.SubMarket)) {
            reloadTooltipForm();
        }

        if (vmCommon.checkCurrentPage(vmCommon.enumPage.TeamBoard)) {
            vmGoalAction.actionOptions && vmGoalAction.actionOptions.goalActionNavigationCallback;
            vmGoalAction.goalOptions && vmGoalAction.goalOptions.goalActionNavigationCallback;      // fixbug: 23257
        }
    };

};


vmGoalAction.showPopupGoalActionEval_Edit = function (objectData, type) {
    var path = vmCommon.rootUrl + "Contents/MsPopGoalActionEval2.html";
    if (typeof MsaApp == 'object' && MsaApp) MsaApp.setLastActiveElement(objectData.TheObject.Id);
    vmGoalAction.goalActionEvalOptions = vmGoalAction.goalActionEvalOptions || {};

    var viewModel = kendo.observable({ ga: objectData.TheObject });
    vmGoalAction.goalActionEvalOptions.goalActionModel = viewModel.ga;// objectData.TheObject;
    vmGoalAction.goalActionEvalOptions.objectType = type;
    vmGoalAction.goalActionEvalOptions.isShowDirect = true;
    
    vmGoalAction.goalActionEvalOptions.role = objectData.RoleId;
    vmGoalAction.goalActionEvalOptions.goalActionTemplateId = null;

    var goalActionName = vmGoalAction.goalActionEvalOptions.goalActionModel.Name;
    var encodingTemplate = kendo.template("${title}");
    var encodingData = { title: kLg.titleApEvaluation + (goalActionName != null && goalActionName.length > 0 ? ' / ' + goalActionName : '') };

    if (vmGoalAction.popGoalActionEval)
        vmGoalAction.popGoalActionEval.refresh(path).center().open();
    else {
        vmGoalAction.popGoalActionEval = $("#popGoalActionEval").kendoWindow({
            width: '1290px',
            minWidth: '1290px',
            height: '810px',
            minHeight: '810px',
            title: encodingData.title,
            content: path,
            actions: [
                "Maximize",
                "Close"
            ],
            modal: true
        }).data("kendoWindow").center();
    }
};

vmGoalAction.isBelongRegionView = function (elem) {
    return $(elem).closest("div#regionoverview").length > 0;
};

vmGoalAction.isReloadByRegionView = function (theObject) {
    if (theObject.Id == null || theObject.Id == vmCommon.emptyGuid) return false;

    var root = $("#" + theObject.Id).closest("div#regionoverview");
    if (root.length == 0) return false;

    var isResult = $("#" + theObject.Id).is("[result]");
    if (isResult == false) return false;

    var area = $("#" + theObject.Id).closest("div[mstype='child']");
    if (area.length == 0) return false;

    var count = $(area).find("div[result]").length;
    var regionOverviewId = msFilter.controlService.getRegionOverview();

    if (regionOverviewId == null) return false;
    var selectedRegionIds = theObject.ActionPlanRegions.filter(t => t.DataState != dataState.Deleted).map(t => t.ObjectId);

    return selectedRegionIds.indexOf(regionOverviewId) == -1 && count == 1;
};

vmGoalAction.popEditLink = undefined;
vmGoalAction.openPopEditLink = function () {
    vmGoalAction.popEditLink = showPopup(vmGoalAction.popEditLink,
        $("#popEditLink"),
        vmCommon.rootUrl + "Contents/MsPopEditLink.html",
        {
            title: kLg.titlePopConnection,
            width: 650,
            height: 525,
            resizable: false
        }
    );
};

//ENTITY
function ActionPlanLink() {
    this.Id = 0;
    this.GoalActionId = null;
    this.LinkId = null;
    this.GoalActionTypeId = 0;
    this.LinkTypeId = 0;
    this.KpiInfo = {};
    this.ApEvaluation = null;
    this.IsShow = true;
    this.DataState = dataState.Added;
    this.Url = "";
    this.MIndex = 0;
    this.IsMasterLink = false;
    this.IsActive = true;
    this.IsVisibility = true;
    this.TodoPercent = null;
};

vmGoalAction.mergeMenuLink = function (source, links, link) {
    var tempSource = vmCommon.deepCopy(source);

    var markParent = function (parentId, parentLevel) {
        var parent = tempSource.find(t => t.Id == parentId && t.Level == parentLevel);
        if (parent) {
            parent.IsPath = true;
            if (parent.ParentId) markParent(parent.ParentId, parentLevel - 1);
        }
    };

    links.filter(t => t.DataState != dataState.Deleted).forEach(l => {
        var item = tempSource.find(t => t.Id == l.LinkId && t.TypeId == l.LinkTypeId);
        if (item == undefined) return;

        item.IsSelect = true;
        item.IsSelectable = false;

        if (item.ParentId) markParent(item.ParentId, item.Level - 1);
    });

    if (link) {
        var linkItem = tempSource.find(t => t.Id == link.LinkId);
        if (linkItem) {
            linkItem.IsSelect = true;

            if (linkItem.ParentId) markParent(linkItem.ParentId, linkItem.Level - 1);
        }
    }

    return tempSource;
};

vmGoalAction.gaExportService = function () {
    var exportGa = function (subMarketProductId, independencyId) {
        vmGoalAction.dataservice.exportGoalAction({ subMarketProductId, independencyId }, function (res) {
            if (res.value.ResultStatus == -2) { //error
            } 
            else if (res.value.ResultStatus == 0) { //no data
            } 
            else if (res.value.ResultStatus == 1) { //success
                var link = document.createElement("a");
                link.download = res.value.TheObject.FileName;
                link.href = window.location.origin + "/" + res.value.TheObject.Path;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                delete link;
            }

        });
    };

    var importGa = function (subMarketProductId, independencyId) {
        vmGoalAction.openPopImport({
            title: kLg.importFragenset, callback: function (files) {
                var url = "../Handlers/MsGoalAction.ashx?funcName=importgoalaction" + "&projid=" + projectId + "&strid=" + strategyId + "&lang=" + kLg.language;
                var importData = new FormData();
                if (subMarketProductId)
                    importData.append("submarketproductid", subMarketProductId);

                if (independencyId)
                    importData.append("independencyid", independencyId);
                importData.append(files[0].name, files[0]);

                vmCommon.sendFile(url, importData, function (res) {
                    
                    if (res.value == 1) {
                        pAlert(kLg.lblImportSuccess).then(function () {
                            msFilter.controlService.resetFilter(true);
                            MsaApp.reloadAllDataOfPage('gaExportService_importGoalAction').then(() => {
                                console.log('action => vmGoalAction.openPopImport finished Handlers', 'directTo');
                            });
                        });
                    }
                    else if (res.value == -6) {
                        pAlert(kLg.msgImportMissingXml);
                    }
                    else if (res.value == -3) {
                        pAlert("error");
                    }
                    else if (res.value == -1) {
                        pAlert(kLg.msgImportConflict);
                    }
                });
            },
            multifile: false
        });
    };

    return { exportGa: exportGa, importGa: importGa };
}();

vmGoalAction.popImport = undefined;
vmGoalAction.openPopImport = function (opts) {
    opts = opts || {};
    vmGoalAction.importOptions = {};
    vmGoalAction.importOptions.callBack = opts.callback;

    vmGoalAction.popImport = showPopup(vmGoalAction.popImport,
        $("#popimport"),
        vmCommon.rootUrl + "Contents/PopImport.html",
        {
            title: opts.title,
            width: 416,
            height: 142,
            resizable: false
        }
    );
};

vmGoalAction.getGoalActions = function (type) {
    var mains = [];

    //main
    for (const pro in vmGoalAction.goalsViewIndependency) mains = mains.concat(vmGoalAction.goalsViewIndependency[pro]);
    for (const pro in vmGoalAction.goalsView) mains = mains.concat(vmGoalAction.goalsView[pro]);
    if (type == vmCommon.GoalActionContentType.MainGoal)
        return mains;

    //sub
    var subs = [];
    mains.forEach(t => subs = subs.concat(t.ListSubGoal));
    if (type == vmCommon.GoalActionContentType.SubGoal)
        return subs;

    //action
    var actions = [];
    subs.forEach(t => actions = actions.concat(t.ListAction));
    if (type == vmCommon.GoalActionContentType.Action)
        return actions;

    return [];
};

vmGoalAction.openPopUpGoal2 = function (info) {
    
    var title = (info.isEdit === true) ? kLg.titlepEditMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepEditMainGoalNew2 : kLg.titlepAddMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepAddMainGoalNew2
    if (info.goalType === vmCommon.GoalActionContentType.SubGoal) {
        title = (info.isEdit === true) ? kLg.titlepEditMainGoalNew1 + kLg.labelSubGoalName + kLg.titlepEditMainGoalNew2 : kLg.titlepAddMainGoalNew1 + kLg.labelSubGoalName + kLg.titlepAddMainGoalNew2;
    }
    if (info.Title) {
        title = info.Title;
        delete info.Title;
    }
    vmGoalAction.dataservice.getGoal(info, function (serData) {
        if (!vmCommon.checkConflict(serData.value.ResultStatus)) return;

        let areaInfo = serData.value.AreaInfo;
        vmGoalAction.goalOptions = {
            IsEdit: info.isEdit,
            Goal: serData.value.TheObject
        };

        $.extend(vmGoalAction.goalOptions, areaInfo);
        $.extend(vmGoalAction.goalOptions, info);

        if (typeof vmDashboard === 'object') {
            vmDashboard.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
        }

        if (info.IndependencyId) {
            vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection);
        } else {
            vmGoalAction.bindCustomConnection(info, serData.value.CustomConnection);
        }

        vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
        vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
        //vmGoalAction.goalOptions.RegionId = areaInfo.RegionId; vmGoalAction.goalOptions.IndependencyId = areaInfo.IndependencyId;
        vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;

        vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
        vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;

        vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
        vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;

        vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
        vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
        vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

        vmGoalAction.Role = serData.value.RoleId;
        
        if (info.goalType == vmCommon.GoalActionContentType.MainGoal)
            vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
        else {
            if (info.isEdit == false && (!info.parentId || info.parentId == vmCommon.emptyGuid)) {
                // neu tao moi va khong co cha => subgoal doc lap
                vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoalWithoutMainGoal;
            } else {
                vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
                vmGoalAction.goalOptions.ParentId = info.parentId;
            }
        }
        
        if (info.goalType === vmCommon.GoalActionContentType.SubGoal) {
            vmFile.setAssignedU(info.goalId, vmCommon.enumType.SubGoal, vmGoalAction.Role);
        } else {
            vmFile.setAssignedU(info.goalId, vmCommon.enumType.Goal, vmGoalAction.Role);
        }
        vmGoalAction.showAddGoalPopup(title);
    });
};

vmGoalAction.openPopUpAction2 = function (info) {
    var entryData = {
        actionId: info.actionId,
        independencyId: info.independencyId,
        subMarketProductId: info.subMarketProductId,
        parentId: info.parentId,
        endDate: info.endDate
    };

    return vmGoalAction.dataservice.getAction(entryData, function (serData) {
        if (!vmCommon.checkConflict(serData.value.ResultStatus))
            return;
        
        let areaInfo = serData.value.AreaInfo;

        vmGoalAction.actionOptions = {
            isEdit: info.isEdit,
            action: serData.value.TheObject,
            templates: serData.value.Templates,
            currency: areaInfo.Currency,
            regionId: areaInfo.RegionId,
            productId: areaInfo.ProductId,
            subMarketId: areaInfo.SubMarketId,
            url: serData.value.Url
        };
        $.extend(vmGoalAction.actionOptions, info);

        vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

        serData.value.CustomConnection.forEach((item, i) => { item.Id = i + 1 });
        vmGoalAction.actionOptions.customConnection = info.independencyId > 0 ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection) : info.subMarketProductId && info.subMarketProductId != vmCommon.emptyGuid ? vmGoalAction.bindCustomConnection({ ProductId: areaInfo.ProductId, SubMarketId: areaInfo.SubMarketId }, serData.value.CustomConnection) : [];

        vmGoalAction.actionOptions.regionSelectable = serData.value.RegionSelectable;
        vmGoalAction.actionOptions.kpiGoalSelectable = serData.value.KpiGoalSelectable;
        vmGoalAction.actionOptions.currencyRates = serData.value.CurrencyRates;
        vmGoalAction.actionOptions.masterGoal = serData.value.MasterGoal;
        vmGoalAction.actionOptions.hasMasterGoal = serData.value.HasMasterGoal;

        vmGoalAction.role = info.roleId || serData.value.RoleId;
        vmGoalAction.actionOptions.isRedirect = true;

        vmGoalAction.actionOptions.subProductGroups = serData.value.SubProductGroups;
        vmGoalAction.actionOptions.subClientGroups = serData.value.SubClientGroups;
        vmGoalAction.actionOptions.actionPlanRegions = serData.value.ActionPlanRegions;
        vmGoalAction.actionOptions.actionDefaultValue = serData.value.ActionDefaultValue;
        vmGoalAction.actionOptions.customViews = serData.value.CustomViews;
        vmGoalAction.actionOptions.actionStream = serData.value.ActionStream;
        vmGoalAction.actionOptions.actionTodoDataX = serData.value.ActionTodoDataX;
        vmGoalAction.actionOptions.goalId = info.parentId;
        vmGoalAction.actionOptions.customerJourneyGroups = serData.value.CustomerJourneyGroups;
        vmGoalAction.actionOptions.isHasKpi = serData.value.IsHasKpi;
        vmGoalAction.actionOptions.isHasFibu = serData.value.IsHasFibu;
        vmFile.setAssignedU(entryData.actionId, vmCommon.enumType.Action, vmGoalAction.role);
        const title = info.title || `${kLg.titlepAddMainGoalNew1}${kLg.labelActionName}${kLg.titlepAddMainGoalNew2}`;
        vmGoalAction.showAddActionPopup(title);        
    });

};

vmGoalAction.checkEnableSI = function (action) {
    if(!action) return;
    if(!action.ActionCosts) return;
    var costs = $.grep(action.ActionCosts, function (it) { return it.DataState !== dataState.Deleted; });
    var todos = action.ActionTodos;

    var isFinish = costs.every(function (it) { return it.Finish; }) && todos.every(function (it) { return it.Finish; });

    var maxDate = vmGoalAction.getIndexOfMaxDate(action.ActionCosts).MaxDate;
    return maxDate != null && (isFinish || (vmCommon.compareDate2(maxDate, new Date()) <= 0));
};

vmGoalAction.getIndexOfMaxDate = function (costs) {
    var maxDate = null, maxIndex = 0;
    if (costs.length == 0) return { MaxDate: maxDate, MaxIndex: maxIndex };

    var tempCosts = $.grep(costs, function (it) { return it.DataState !== dataState.Deleted; });
    //tempCosts = vmCommon.deepCopy(tempCosts);
    maxDate = vmCommon.deepCopy(tempCosts[0].EndDate);
    maxIndex = 0;

    if (maxDate == null) {
        return { MaxDate: maxDate, MaxIndex: maxIndex };
    }

    for (var i = 1, len = tempCosts.length; i < len; i++) {
        if (tempCosts[i].EndDate == null) {
            maxDate = null;
            maxIndex = i;
            break;
        }

        if (typeof maxDate === "string") {
            if (maxDate.indexOf("/Date") !== -1) {
                maxDate = maxDate.jsonToDate();
            } else {
                maxDate = new Date(maxDate);
            }
        }

        if (typeof tempCosts[i].EndDate === "string") {
            if (tempCosts[i].EndDate.indexOf("/Date") !== -1) {
                tempCosts[i].set("EndDate", tempCosts[i].EndDate.jsonToDate());
            } else {
                tempCosts[i].set("EndDate", new Date(tempCosts[i].EndDate));
            }
        }

        if (vmCommon.compareDate2(maxDate, tempCosts[i].EndDate) === -1) {
            maxDate = vmCommon.deepCopy(tempCosts[i].EndDate);
            maxIndex = i;
        }
    }

    if (typeof maxDate === "string") {
        maxDate = maxDate.toDate();
    }

    return { MaxDate: maxDate, MaxIndex: maxIndex };
};

vmGoalAction.getIndexOfMinDate = function (costs) {
    var tempCosts = $.grep(costs, function (it) { return it.DataState !== dataState.Deleted; });

    var minDate = tempCosts[0].StartDate, minIndex = 0;
    for (var i = 0, len = tempCosts.length; i < len; i++) {
        if (tempCosts[i].StartDate == null) {
            minDate = null;
            minIndex = i;
            break;
        }

        if (minDate == null) {
            minDate = vmCommon.deepCopy(tempCosts[i].StartDate);
            minIndex = i;
            continue;
        }

        if (typeof minDate === "string") {
            if (minDate.indexOf("/Date") !== -1) {
                minDate = minDate.jsonToDate();
            } else {
                minDate = new Date(minDate);
            }
        }

        if (typeof tempCosts[i].StartDate === "string") {
            if (tempCosts[i].StartDate.indexOf("/Date") !== -1) {
                tempCosts[i].set("StartDate", tempCosts[i].StartDate.jsonToDate());
            } else {
                tempCosts[i].set("StartDate", new Date(tempCosts[i].StartDate));
            }
        }

        if (vmCommon.compareDate2(minDate, tempCosts[i].StartDate) === 1) {
            minDate = vmCommon.deepCopy(tempCosts[i].StartDate);
            minIndex = i;
        }
    }

    if (typeof minDate === "string") {
        minDate = minDate.toDate();
    }

    return { MinDate: minDate, MinIndex: minIndex };
};