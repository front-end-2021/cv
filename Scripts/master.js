/* Minification failed. Returning unminified contents.
(7588,15-16): run-time error JS1010: Expected identifier: .
(7588,15-16): run-time error JS1195: Expected expression: .
 */
var projectId = 42381;
var strategyId = 44743;
var language = 'en';
var vmCrmEnum = vmCrmEnum || {};
vmCrmEnum.cssFiles = ["frontend.css", "multiplechoice.png", "simplechoice.png", "bg-header-overview.png", "logo_footer.png"];

vmCrmEnum.KeywordSetting = {
    Equal: 1,
    Contains: 2,
    Empty: 5,
    NoEmpty: 6,
    Greater: 3,
    Less: 4,
    From: 7,
    To: 8,
    NotContains: 9,
    FromTo: 10,
    ShowChanges: 11
};

vmCrmEnum.SettingType = {
    Marketing: 1,
    Organisation: 2,
    Person: 3,
    Activities: 4,
    CrowdProject: 5,
    EMailContent: 6

};
vmCrmEnum.ActivitieSetting = {
    Category: 1,
    Priority: 2,
    Relationdhip: 3,
    Status: 4,
    CreatedOn: 5,
    NameOfOrg: 6,
    NameOfPerson: 7,
    Responsibility: 8,
    Begin: 9,
    Due: 10,
    Finish: 11,
    Rolle: 12,
    LastStatus: 13,
    New: 14
};
vmCrmEnum.PersonSetting = {
    Address: 1,
    Telephone: 2,
    Fax: 3,
    Email: 4,
    Website: 5,
    Network: 6,
    Resource: 7,
    Competence: 8,
    Tags: 10,
    Position: 11,
    ArtOfRelationship: 12,
    Land: 14,
    Salutation: 24,
    Title: 25,
    Responsibility: 26,
    Plz: 18,
    BirthDay: 30,
    Category: 31
};
vmCrmEnum.OrganisationSetting = {
    Address: 1,
    Telephone: 2,
    Fax: 3,
    Email: 4,
    Website: 5,
    Network: 6,
    Resource: 7,
    Competence: 8,
    Category: 9,
    LegalForm: 10,
    Employee: 11,
    Branch: 12,
    Tags: 13,
    Land: 14,
    Plz: 18,
    KundenNr: 21,
    ArtOfRelationship: 22,
    Responsibility: 23,
    Revenue: 24
};
vmCrmEnum.arrCategories = [];

vmCrmEnum.ResultStatus = {
    FILENOTFOUND: -6,
    DONOTHING: -5,
    ROLLBACK: -4,
    ERROR: -3,
    USING: -2,
    CONFLICT: -1,
    NOROLE: 0,
    SUCCESS: 1,
    DUPLICATE: -7,
    NOCHANGE: -9
};

vmCrmEnum.QuestionType = {
    Ratingscale: 1,
    SimpleChoice: 2,
    SimpleDrop: 3,
    MultipleChoice: 4,
    ForcedChoiceItem: 5,
    ForcedDropItem: 6,
    SinglelineText: 7,
    MultilineText: 8,
    Image: 9,
    Data: 10,
    NText: 11,//HoaND        
    SimpleChoiceWithImage: 12,
    MultipleChoiceWithImage: 13,
    ModuleText: 14,
    Document: 15,
    Article: 16
};

vmCrmEnum.SinglelineType = {
    Standard: 1,
    Number: 2,
    Currency: 3
};

vmCrmEnum.LinkQuestionType = {
    Nothing: 0,
    Hideall: -1
};

vmCrmEnum.MainTitle = {
    Nothing: 0,
    GroupTittle: 1
};

vmCrmEnum.AdminErrorType = {
    Ok: 0,
    Type: 1,
    Name: 2,
    Size: 3,
    Duplicate: -7,
    NotFileEdit: -6,
    MaxLengthName: -8
};

vmCrmEnum.ECodeLastAction = {
    PersonField: 5,
    PersonType: 6,
    ActivityField: 8,
    ActivityType: 9,
    ShowAllActivityPage: 12,
    ShowAllActivityCrm: 13,
    ActivitySubField: 14,
    ActivitySubType: 15,
    CrowdField: 16,
    CrowdType: 17,
    ShowAllCrowd: 18,
    LAST_LAN_ID: 25
};

vmCrmEnum.ExportChildType =
{
    Thema: 1,
    Group: 2,
    Title: 3,
    Question: 4,
    Answer: 5,
    SubQuestion: 6
}
vmCrmEnum.SENDEMAILTO =
{
    ALL: 2,
    NOTSTARTED: 1, // not access frontend
    NOTFINISHED: 0
}
vmCrmEnum.CrmCategoriesExtensionType = { CrowdProject: 1, Word: 2, StatusCheck: 3 };

vmCrmEnum.MovingQuestionType = {
    Nothing: 0,
    GroupToGroup: 1,
    QuestionToQuestion: 2,
    QuestionToSubQuestion: 3,
    SubQuestionToQuestion: 4,
    SubQuestionToSubQuestion: 5
};
;
var vmCommon = vmCommon || {};
vmCommon.enumType = {
    Market: "market",
    Land: "land",
    Region: "region",
    Submarket: "submarket",
    Label: "label",
    ProductGroup: "productgroup",
    Product: "product",
    Target: "target",
    Demand: "demand",
    Action: "action",
    Goal: "maingoal",
    SubGoal: "subgoal",
    MarketSegmentRegion: "marketsegmentregion",
    SubMarketProduct: "submarketproduct",
    CrmStatusProtocol: "crmstatusprotocol",
    CrmActivity: "crmactivity",
    CrmOrganisation: 'crmorganisation',
    CrmPerson: 'crmperson',
    CrmLinkQuestion: 'linkquestion',
    CrmLinkAnswer: 'linkanswer',
    CrmThema: 'crmthema',
    SubProduct: "subproduct",
    SubClient: "subclient",
    ActionTodoFile: "actiontodofile"
};
vmCommon.SubmarketTitle = '';
vmCommon.DefaultFinishText = "Besten Dank für Ihre Teilnahme. Wenn Sie zurück zum Fragebogen möchten, klicken Sie bitte auf diesen ";
vmCommon.DefaultFolder = { WORDTEMPLATE: "Word Vorlage", FORMATDOCUMENT: "Format Unterlage" };

vmCommon.cssActive = 'list-group-item no-border tab-organ active';
vmCommon.cssInActive = 'list-group-item no-border tab-organ';
vmCommon.IconNotAssignFile = "icon-16 icon-folder-organ icon-right";
vmCommon.IconAssignFile = "icon-16 icon-file-assign-crm icon-right";
vmCommon.cssMarginTopDepartment = { marginTop: '-71px', height: '71px' };
vmCommon.cssMarginTopStreet = { marginTop: '2px', height: '30px' };
vmCommon.cssPassive = 'title-passive';
vmCommon.cssImPassive = 'title-tab';
vmCommon.popEditType = undefined;
vmCommon.popEditDescription = undefined;
vmCommon.popEdit = undefined;
vmCommon.popEditRegion = undefined;
vmCommon.currentMarket = {};
vmCommon.currentControl = undefined;
vmCommon.IsWaitResult = true;
vmCommon.clickTimeout = undefined;
vmCommon.currentPageName = undefined;
vmCommon.rootUrl = ``;
vmCommon.PopupInstance = (function () {
    var checker = {};
    var isOpening = function (name) {
        if (checker[name]) {
            return true;
        }
        checker[name] = true;
        return false;
    };
    var close = function (name) {
        checker[name] = false;
    };
    return {
        isOpening: isOpening,
        close: close
    };
})();

vmCommon.PersonExportType = {
    NORMAL: 0,
    QUESTIONLINK: 1
};

vmCommon.FilterType = {
    SubMarket: 1,
    ActionPlan: 2,
    Mix: 3,
    PortiloAnalyse: 4,
    DashBoard: 5, //tab6
    MarketSegment: 7,
    Budget: 8, //tab1
    AdvertisingMaterial: 9, //tab 2
    MasterGoal: 10, //tab3
    Campaign: 11, //tab4
    ProductAndStakeHolderGroup: 12, //tab5
    RoadMap: 14
};

vmCommon.EnumFilterType = {
    Product: 1,
    Market: 2
};

vmCommon.EnumMarketFilterType = {
    Land: 1,
    Market: 2
};

vmCommon.KpiGoalTopicType = {
    LandRegion: 1,
    Market: 2,
    Product: 3,
    Goal: 4
};

vmCommon.MsKpiGoalIndexType = {
    LAND: 1,
    REGION: 2,
    MARKET: 3,
    SUBMARKET: 4,
    SUBCLIENT: 5,
    GROUP: 6,
    PRODUCT: 7,
    SUBPRODUCT: 8,
    MAINGOAL: 9,
    SUBGOAL: 10
};

vmCommon.KpiGoalType = {
    TIME: 1,
    TOPIC: 2,
    INDEX: 3,
    INDEXTIME: 4,
    FORMATITEMVALUE: 5,
    FORMATITEM: 6,

    TIMEMASTER: 7,
    TOPICMASTER: 8,
    INDEXMASTER: 9,
    INDEXTIMEMASTER: 10
};

vmCommon.KpiActionType = {
    TIME: 1,
    //TOPIC: 2,
    INDEX: 3,
    INDEXTIME: 4
};

vmCommon.EnumOperation = {
    And: 1,
    Or: 2
};

vmCommon.ResultData = {
    NAMEDUPLICATE: 1,
    SUCCESS: 0,
    NOTHING: -1,
    CONFLICT: -3,
    SENT_MAIL_ERROR: -5,
    NO_ROLE: -6,
    CONTAIN_CHILD: -2
};

vmCommon.ResultState = {
    CONFLICT: -1,
    NOTHING: 0,
    SUCCESS: 1
};

vmCommon.TabRole = {
    TAB_VIEW: 22,
    TAB_NOACCESS: 23
}

vmCommon.SettingRole = {
    SETTING_EDIT: 24,
    SETTING_VIEW: 25
}

vmCommon.MTabType =
{
    Market: 1,
    SubMarket: 2,
    ActionPlan: 3,
    Marketingmix: 4,
    Teamboard: 5,
    Dashboard: 6,
    Roadmap: 7
}

vmCommon.GoalActionContentType =
{
    MainGoal: 1,
    SubGoal: 2,
    Action: 3,
    Column: 4
};
vmCommon.RMGoalActionType =
{
    MainGoal: 1,
    SubGoal: 2,
    Action: 3,
    Activity: 4
};

vmCommon.LinkProductType =
{
    Group: 1,
    Product: 2,
    Subproduct: 3
};

vmCommon.removeByFunc = function (source, compareFunc) {
    for (var i = 0; i < source.length; i++) {
        var site = source[i];
        if (compareFunc(site, i) == true) {
            source.splice(i, 1);
            return source;
        }
    }
    return source;
};

vmCommon.findIndexByFunc = function (source, compareFunc) {
    if (source) {
        for (var i = 0; i < source.length; i++) {
            var site = source[i];
            if (compareFunc(site, i) == true) {
                return i;
            }
        }
    }
    return -1;
};

Array.prototype.removeByFunc = function (compareFunc) {
    var removeItems = [];
    var source = this;

    if (source && source.length > 0) {
        for (var i = source.length - 1; i >= 0; i--) {
            if (compareFunc(source[i], i) == true) {
                var temp = source.splice(i, 1);
                removeItems.push(temp);
            }
        }
    }

    return removeItems;
};

vmCommon.findByFunc = function (source, compareFunc) {
    if (source) {
        for (var i = 0; i < source.length; i++) {
            if (compareFunc(source[i], i) == true) {
                return source[i];
            }
        }
    }
    return null;
};

Array.prototype.removeX = function (item) {
    if (item == null) return;

    var index = this.indexOf(item);
    if (index >= 0)
        this.splice(index, 1);
};

vmCommon.selectProperty = function (source, property) {

    if (source) {
        var rs = [];
        for (var i = 0; i < source.length; i++) {
            if (source[i][property]) {
                rs.push(source[i][property]);
            }
        }

        return rs;
    }

    return null;
};

//deep copy object array to other other object array
vmCommon.pushApply = function (source, array, itemAdd, compare) {
    var hasItemAdd = typeof (itemAdd) == "function";
    var hasCompare = typeof (compare) == "function";
    for (var i = 0; i < array.length; i++) {
        if (!hasCompare || compare(array[i], i) == true) {
            source.push(hasItemAdd ? itemAdd(array[i], i) : array[i]);
        }
    }
    return source;
};

vmCommon.findAllByFunc = function (res, source, compareFunc) {
    if (source) {
        for (var i = 0; i < source.length; i++) {
            if (compareFunc(source[i], i) == true) {
                res.push(source[i]);
            }
        }
    }
    return res;
};

vmCommon.getPositionByXY = function (element, ui, xDrag, yDrag) {
    var pos = ui.draggable.offset();
    var dpos = $(element).offset();

    let rs = 0;

    if (dpos.top == yDrag) {
        rs = dpos.left > xDrag ? 1 : 0;
    } else {
        rs = pos.top < dpos.top ? 1 : 0;
    }

    return rs;
};

vmCommon.getPositionByX = function (element, ui, xDrag) {
    var pos = ui.draggable.offset();
    return pos.left > xDrag ? 1 : 0;
};
vmCommon.getPositionByY = function (element, ui, yDrag) {
    var pos = ui.draggable.offset();
    return pos.top > yDrag ? 1 : 0;
};
vmCommon.getPosUpByY = function (offset, yDrag) {
    return offset.top > yDrag ? 1 : 0;
};

vmCommon.LSeparate = [{ Id: vmCommon.EnumOperation.And, Name: '-' }, { Id: vmCommon.EnumOperation.Or, Name: '/' }];

function bindTemplate(elmId, templateId, dataSource) {
    elmId = '#' + elmId;
    templateId = '#' + templateId;
    if ($(elmId).length < 1 || $(templateId).length < 1)
        return;
    var template = kendo.template($(templateId).html());
    $(elmId).html(template(dataSource));
}

(function ($) {
    $.fn.setCursorToTextEnd = function () {
        var $initialVal = this.val();
        this.val($initialVal + ' ');
        this.val($initialVal);
    };
})(jQuery);
function queryString(isServer, qs) {

    this.params = {};
    this.count = 0;

    if (qs == null) {
        if (isServer == true) {
            this.urlParams = location.search.substring(1, location.search.length);
            qs = this.urlParams;
        }
        else {
            this.urlParams = window.location.hash + "";
            var url = this.urlParams;
            if (url.length > 0) {
                qs = url.substring(1);
            }

        }
    }
    else if (qs != "" && qs.length > 0) {
        this.urlParams = qs;
        qs = qs.substring(1);
    }
    if (qs == undefined || qs.length == 0) return;
    qs = qs.replace(/\+/g, ' ');
    qs = decodeURIComponent(qs);
    if (qs.indexOf('?') > -1) qs = qs.substring(qs.indexOf('?') + 1, qs.length);
    var args = qs.split('&'); // parse out name/value pairs separated via &

    // split out each name=value pair
    this.count = args.length;
    for (var i = 0; i < this.count; i++) {
        var pair = args[i].split('=');
        var name = decodeURIComponent(pair[0]).toLowerCase();

        var value = (pair.length == 2)
            ? decodeURIComponent(pair[1])
            : name;

        this.params[name] = value;
    }
}
queryString.prototype.getInt = function (key, defaultValue) {
    key = key.toLowerCase();
    var value = this.params[key];
    if (value == null) return defaultValue || null;
    return parseInt(value) || null;
};

queryString.prototype.get = function (key, defaultValue) {
    key = key.toLowerCase();
    var value = this.params[key];
    return (value != null) ? value : defaultValue;
};

queryString.prototype.set = function (key, value) {
    key = key.toLowerCase();
    if (this.params[key] == null) {
        this.urlParams = this.count > 0 ?
            this.urlParams + "&" + key + "=" + value
            : this.urlParams + key + "=" + value;
    }
    else {
        this.urlParams = this.urlParams.replace(key + "=" + this.params[key], key + "=" + value);
    }
    return this;
};

queryString.prototype.remove = function (key) {
    if (this.params[key] != null) {
        this.urlParams = this.urlParams.replace("?" + key + "=" + this.params[key], "")
            .replace("&" + key + "=" + this.params[key], "");
        this.params[key] = null;
    }
    return this;
};

// Quyennb
function showMask() {
    $('#bodymask').show();
}
function hideMask() {
    $('#bodymask').hide();
}

function showLoadingMask(divId) {
    $("#" + divId).addClass("loading");
}
function HideLoadingMask(divId) {
    $("#" + divId).removeClass("loading");
}

/*---Ajax Helper---*/
var AjaxConst = {};
AjaxConst.GetRequest = 'GET';
AjaxConst.PostRequest = 'POST';
function callAjax(divId, url, entryData, successCallBack, requestType, errorCallBack) {
    var divLoading = $('#' + divId);
    divLoading.show();
    const data = sHandler.getHandler(url, entryData);
    return new Promise((resolve) => {
        divLoading.hide();
        resolve(data);
        if(typeof successCallBack == 'function') successCallBack(data);
        if(typeof errorCallBack == 'function') errorCallBack();
    });
}

function callAjaxPromise(url, entryData = null) {
    const data = sHandler.getHandler(url, entryData);
    return new Promise((resolve) => {
        resolve(data);
    });
}

vmCommon.sendFile = function (url, formData, successCallBack, divId) {
    vmCommon.ajaxDisplayBefore(divId);

    var divLoading = $('#' + divId);
    var isDisplayed = divLoading.css('display') == 'none';
    if (isDisplayed)
        divLoading.css('display', 'block');
    return $.ajax({
        url: url,
        data: formData,
        dataType: "json",
        cache: false,
        contentType: false,
        processData: false,
        type: AjaxConst.PostRequest,
        success: function (data) {
            if (data != null && data.error != null) {
                if (data.error === "error") {
                    pAlert(kLg.errorMessage + ": " + data.time).then(function () {
                        window.location = "../Default.aspx?lang=" + kLg.language;
                    });
                } else if (data.error === "timeout") {
                    pAlert(kLg.timeoutMessage).then(function () {
                        window.location = "../Login.aspx?lang=" + kLg.language + "&retUrl=" + window.location.hash;
                    });
                } else if (data.error === "permission") {
                    pAlert(kLg.msgPermissionDenied).then(function () {
                        window.location = "../Default.aspx?lang=" + kLg.language;
                    });
                }

                vmCommon.ajaxDisplayAfter(divId);
                return;
            }
            if (typeof (successCallBack) === "function")
                successCallBack(data);
            vmCommon.ajaxDisplayAfter(divId);
        },
        error: function (xhr, status, error) {
            if (isDisplayed)
                divLoading.css('display', 'none');
            else {
                divLoading.empty();
            }

            if (error.length == 0)
                return;
            if (error === 'timeout')
                alert(kLg.msgAjaxTimeout);
            else
                alert(kLg.unknownErrorMessage);
        }
    });
};

function callAjaxPostGet(divId, url, postData, getData, successFunc, errorCallBack) {
    var reqType = AjaxConst.GetRequest;
    if (typeof getData === "object") {
        for (var propertyName in getData) {
            url += "&" + propertyName + "=" + getData[propertyName];
        }
    }
    if (postData) {
        reqType = AjaxConst.PostRequest;
        postData = JSON.stringify(postData);
    }
    return callAjax(divId, url, postData, successFunc, reqType, errorCallBack);
}


function callAjaxAccount(divId, funcName, entryData, successCallBack, requestType) {
    var url = "Handlers/AccountHandler.ashx?funcName=" + funcName;
    callAjax(divId, url, entryData, successCallBack, requestType);
}

function callAjaxMarketSegmentEvalHandler(divId, funcName, projectId, regionId, entryData, requestType, successCallBack) {
    var url = "/Handlers/MsMarketSegmentEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + "&regid=" + regionId;
    callAjax(divId, url, entryData, successCallBack, requestType);
}

function callAjaxProductEvaluation(divId, funcName, projectId, regionId, entryData, requestType, successCallBack) {
    var url = "/Handlers/MsSubMarketEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + "&regid=" + regionId;
    callAjax(divId, url, entryData, successCallBack, requestType);
}

function callAjaxCollapseExpandGoals(divId, url, entryData, successCallBack, requestType, errorCallBack) {
    var divLoading = $('#' + divId);
    var isDisplayed = divLoading.css('display') == 'none';
    if (isDisplayed)
        divLoading.css('display', 'block');
    divLoading.html('<div id="loading-center-helper"></div><div id="loading-center" style="display: block"></div>');
    $.ajax({
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: entryData,
        cache: false,
        async: true,
        type: requestType,
        responseType: "json",
        success: function (data) {
            if (data == null)
                return;
            if (data.error != null) {
                if (isDisplayed) {
                    divLoading.css('display', 'none');
                } else {
                    divLoading.empty();
                }

                if (data.error == "error") {
                    var datetimeNow = new Date();
                    var formattedDate = datetimeNow.getDate() + "/" + (datetimeNow.getMonth() + 1) + "/" + datetimeNow.getFullYear() + " " + datetimeNow.getHours() + ":" + datetimeNow.getMinutes() + ":" + datetimeNow.getSeconds();
                    alert(kLg.errorMessage + ": " + formattedDate);
                    if (typeof (errorCallBack) === 'function') {
                        errorCallBack(data);
                    }
                }
                else if (data.error == "timeout") {
                    alert(kLg.timeoutMessage);
                    window.location = "Login.aspx?lang=" + kLg.language + "&retUrl=" + window.location.hash;
                }
                return;
            }
            if (isDisplayed)
                divLoading.css('display', 'none');

            successCallBack(divId, data);
        },
        error: function (xhr, status, error) {
            if (isDisplayed)
                divLoading.css('display', 'none');
            else {
                divLoading.empty();
            }

            if (error.length == 0)
                return;
            if (error === 'timeout')
                alert(kLg.msgAjaxTimeout);
            else
                alert(kLg.unknownErrorMessage);
        }
    });
}
/*---End Ajax Helper---*/

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var stringLength = 8;
    var randomstring = '';
    for (var i = 0; i < stringLength; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

function randomString2(len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var stringLength = len;
    var randomstring = '';
    for (var i = 0; i < stringLength; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

function loadControl(ctrl, div, params, callback) {
    // active tab
    showMask();
    $(div).html("<div style=' height: 100%; float:left; width: 100%;'><center><img src='/images/ajax-loader.gif' alt='loading...' /></center></div>");
    var url = 'ajax.aspx?ctrl=' + ctrl;
    if (params) url += '&' + params;
    $.ajax({
        url: url,
        cache: false,
        success: function (data) {
            //get response text only
            $('#' + div).html(data);
            //attach some events
            //AttachEvents();
            hideMask();
        },
        error: function (obj, message, excepton) {
            //alert(message + '\n' + excepton);
            hideMask();
        },
        complete: callback
    });
};

function postControl(ctrl, paramHolderId, params, callback) {
    var isValidate = true;
    if (isValidate == true) {
        showMask();
        var url = 'ajax.aspx?ctrl=' + ctrl;
        var posData = getParams(paramHolderId);
        if (params) url += '&' + params;
        $.ajax({
            url: url,
            type: "post",
            data: posData,
            cache: false,
            success: function (data) {
                hideMask();
                alert(data);
            },
            error: function (obj, mes, ex) {
                alert(mes + "\n" + url + "\n" + ex);
                hideMask();
            },
            complete: callback
        });
    }
}
function postControlGetValue(ctrl, paramHolderId, params, ctrolVal, callback) {
    var isValidate = true;
    if (isValidate == true) {
        showMask();
        var url = 'ajax.aspx?ctrl=' + ctrl;
        var posData = getParams(paramHolderId);
        if (params) url += '&' + params;
        $.ajax({
            url: url,
            type: "post",
            data: posData,
            cache: false,
            success: function (data) {
                hideMask();
                var rt = data.split('^');
                if (rt[1] != undefined) $('#' + ctrolVal).val(rt[1]);
                alert(rt[0]);
            },
            error: function (obj, mes, ex) {
                alert(mes + "\n" + url + "\n" + ex);
                hideMask();
            },
            complete: callback
        });
    }
}
function postControlNoMessage(ctrl, paramHolderId, params, callback) {
    var isValidate = true;
    if (isValidate == true) {
        showMask();
        var url = 'ajax.aspx?ctrl=' + ctrl;

        var posData = getParams(paramHolderId);
        if (params) url += '&' + params;
        $.ajax({
            url: url,
            type: "post",
            data: posData,
            cache: false,
            success: function (data) {
                hideMask();
            },
            error: function (obj, mes, ex) {

                alert(mes + "\n" + url + "\n" + ex);
                hideMask();
            },
            complete: callback
        });
    }
}

function getParams(wrapperId) {

    var retVal = [];
    if (wrapperId == null || wrapperId.length == 0) return retVal;
    $('#' + wrapperId).find('input').not('[type=checkbox]').each(function () {
        var thisid = $(this).attr('id');
        retVal[thisid] = encodeURIComponent($('#' + thisid).val());
    });
    $('#' + wrapperId).find('input[type=checkbox]').each(function () {
        var thisid = $(this).attr('id');
        retVal[thisid] = $('#' + thisid).attr('checked');
    });
    $('#' + wrapperId).find('input[type=radio]').each(function () {
        var thisid = $(this).attr('id');
        retVal[thisid] = $('#' + thisid).attr('checked');
    });
    $('#' + wrapperId).find('select').each(function () {
        var thisid = $(this).attr('id');
        retVal[thisid] = encodeURIComponent($('#' + thisid).val());
    });
    $('#' + wrapperId).find('textarea').each(function () {
        var thisid = $(this).attr('id');
        retVal[thisid] = encodeURIComponent($('#' + thisid).val());
    });

    $('#' + wrapperId).find('textarea').each(function () {

        var thisid = $(this).attr('id');
        alert(thisid);
        retVal[thisid] = encodeURIComponent($('#' + thisid).val());
    });
    return retVal;
}

function setHeightPopUp(popUp, height) {
    //0: not change, 1: change, -1: fix
    var state = 0;
    if (popUp) {
        if (height < ($(window).height() - 50)) {
            popUp.wrapper.css({
                height: height
            });
            popUp.center();
            state = 1;
        } else {
            popUp.wrapper.css({
                height: $(window).height() - 80
            });
            popUp.center();
            state = -1;
        }
    }

    return state;
};

function resizePopUp(popUp, opt) {
    if (popUp) {
        if (opt.height) {
            popUp.wrapper.css({
                height: opt.height
            });
        }
        if (opt.width) {
            popUp.wrapper.css({
                width: opt.width
            });
        }

        popUp.center();
    }
};

function setHeightPopUpFix(popUp, height) {
    if (popUp) {
        if (height < ($(window).height() - 50)) {
            popUp.wrapper.css({
                height: height
            });

        } else {
            popUp.wrapper.css({
                height: $(window).height() - 80
            });

        }
    }
};

function setHeightPopUpBottom(popUp, height) {
    if (popUp) {
        if (height < ($(window).height() - 50)) {
            popUp.wrapper.css({
                height: height,
                margin: '35px 0 0 0'
            });
            popUp.center();
        } else {
            popUp.wrapper.css({
                height: $(window).height() - 80,
                margin: '35px 0 0 0'
            });
            popUp.center();
        }
    }
}

function showPopup2(theWindow, windowElem, path, title, width, height, closeCallback, resizable) {
    if (theWindow)
        theWindow.refresh(path).center().open();
    else {
        windowElem.show();
        theWindow = windowElem.kendoWindow({
            maxHeight: $(window).height() - 100,
            width: width,
            height: height,
            title: title,
            content: path,
            actions: [
                "Close"
            ],
            modal: true,
            resizable: resizable,
            close: closeCallback
        }).data("kendoWindow").center();
    }
    return theWindow;
}

function showTempNamePopup(theWindow, windowElem, tempNameElem, title, closeCallback) {
    if (theWindow) {
        theWindow.title(title);
        theWindow.refresh().center().open();
    } else {
        windowElem.show();
        theWindow = windowElem.kendoWindow({
            width: '350px',
            height: '145px',
            resizable: false,
            title: title,
            actions: [
                "Close"
            ],
            modal: true,
            activate: function () {
                var nameElem = tempNameElem || $('#txtTempName');
                nameElem.focus();
            },
            close: closeCallback
        }).data("kendoWindow");
        theWindow.center();
    }
    return theWindow;
}

function showImportTempPopup(theWindow, windowElem, path, closeCallback) {
    if (theWindow) {
        theWindow.refresh(path).center().open();
    } else {
        windowElem.show();
        theWindow = windowElem.kendoWindow({
            width: '600px',
            minWidth: '600px',
            maxHeight: $('window').height() - 100,
            title: kLg.btnImportTemp,
            content: path,
            actions: [
                "Close"
            ],
            resizable: false,
            modal: true,
            close: closeCallback
        }).data("kendoWindow").center();
    }
    return theWindow;
}

function showDialog(msg) {

    $('#alertDialog').append(msg);
    $.blockUI(
        {
            message: $('#alertDialog'),
            css: {
                top: '10%',
                left: ($(window).width() - 400) / 2 + 'px',
                width: 400 + "px",
                border: '0 none',
                background: 'none',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                textAlign: 'left'
            }
        });
}

function closeLayoutNew(divId) {
    $("#" + divId).hide();
    $("div.blockUI").unblock();
}

function closePopup(classRemove) {

    if (typeof (classRemove) === "function")
        classRemove();

    if (classRemove == null || typeof (classRemove) === "function") classRemove = "block-content";
    $.unblockUI();
    $("." + classRemove).remove();
}

function ChoseColorPercent(x) {
    switch (true) {
        case (x > -11 && x < 0):
            return "evaluation-negative1";
        case (x > -21 && x < -10):
            return "evaluation-negative2";
        case (x > -31 && x < -20):
            return "evaluation-negative3";
        case (x > -41 && x < -30):
            return "evaluation-negative4";
        case (x > -51 && x < -40):
            return "evaluation-negative5";
        case (x > -61 && x < -50):
            return "evaluation-negative6";
        case (x > -71 && x < -60):
            return "evaluation-negative7";
        case (x > -81 && x < -70):
            return "evaluation-negative8";
        case (x > -91 && x < -80):
            return "evaluation-negative9";
        case (x > -101 && x < -90):
            return "evaluation-negative10";
        case (x == 0):
            return "evaluation-zero";

        case (x > 0 && x < 11):
            return "evaluation-positive1";
        case (x > 10 && x < 21):
            return "evaluation-positive2";
        case (x > 20 && x < 31):
            return "evaluation-positive3";
        case (x > 30 && x < 41):
            return "evaluation-positive4";
        case (x > 40 && x < 51):
            return "evaluation-positive5";
        case (x > 50 && x < 61):
            return "evaluation-positive6";
        case (x > 60 && x < 71):
            return "evaluation-positive7";
        case (x > 70 && x < 81):
            return "evaluation-positive8";
        case (x > 80 && x < 91):
            return "evaluation-positive9";
        case (x > 90 && x < 101):
            return "evaluation-positive10";
        default: //null
            return "evaluation-none";
    }
}

function ChoseColorPercentInActive(x) {
    switch (true) {
        case (x > -11 && x < 0):
            return "evaluation-negative1_inactive";
        case (x > -21 && x < -10):
            return "evaluation-negative2_inactive";
        case (x > -31 && x < -20):
            return "evaluation-negative3_inactive";
        case (x > -41 && x < -30):
            return "evaluation-negative4_inactive";
        case (x > -51 && x < -40):
            return "evaluation-negative5_inactive";
        case (x > -61 && x < -50):
            return "evaluation-negative6_inactive";
        case (x > -71 && x < -60):
            return "evaluation-negative7_inactive";
        case (x > -81 && x < -70):
            return "evaluation-negative8_inactive";
        case (x > -91 && x < -80):
            return "evaluation-negative9_inactive";
        case (x > -101 && x < -90):
            return "evaluation-negative10_inactive";
        case (x == 0):
            return "evaluation-zero_inactive";

        case (x > 0 && x < 11):
            return "evaluation-positive1_inactive";
        case (x > 10 && x < 21):
            return "evaluation-positive2_inactive";
        case (x > 20 && x < 31):
            return "evaluation-positive3_inactive";
        case (x > 30 && x < 41):
            return "evaluation-positive4_inactive";
        case (x > 40 && x < 51):
            return "evaluation-positive5_inactive";
        case (x > 50 && x < 61):
            return "evaluation-positive6_inactive";
        case (x > 60 && x < 71):
            return "evaluation-positive7_inactive";
        case (x > 70 && x < 81):
            return "evaluation-positive8_inactive";
        case (x > 80 && x < 91):
            return "evaluation-positive9_inactive";
        case (x > 90 && x < 101):
            return "evaluation-positive10_inactive";
        default:
            return "evaluation-none";
    }
}

function ChoseColorChroma(x) {
    switch (true) {
        case (x > -11 && x < 0):
            return "chroma-evaluation-negative1";
        case (x > -21 && x < -10):
            return "chroma-evaluation-negative2";
        case (x > -31 && x < -20):
            return "chroma-evaluation-negative3";
        case (x > -41 && x < -30):
            return "chroma-evaluation-negative4";
        case (x > -51 && x < -40):
            return "chroma-evaluation-negative5";
        case (x > -61 && x < -50):
            return "chroma-evaluation-negative6";
        case (x > -71 && x < -60):
            return "chroma-evaluation-negative7";
        case (x > -81 && x < -70):
            return "chroma-evaluation-negative8";
        case (x > -91 && x < -80):
            return "chroma-evaluation-negative9";
        case (x > -101 && x < -90):
            return "chroma-evaluation-negative10";
        case (x == 0):
            return "chroma-evaluation-zero";

        case (x > 0 && x < 11):
            return "chroma-evaluation-positive1";
        case (x > 10 && x < 21):
            return "chroma-evaluation-positive2";
        case (x > 20 && x < 31):
            return "chroma-evaluation-positive3";
        case (x > 30 && x < 41):
            return "chroma-evaluation-positive4";
        case (x > 40 && x < 51):
            return "chroma-evaluation-positive5";
        case (x > 50 && x < 61):
            return "chroma-evaluation-positive6";
        case (x > 60 && x < 71):
            return "chroma-evaluation-positive7";
        case (x > 70 && x < 81):
            return "chroma-evaluation-positive8";
        case (x > 80 && x < 91):
            return "chroma-evaluation-positive9";
        case (x > 90 && x < 101):
            return "chroma-evaluation-positive10";
        default:
            return "evaluation-none";
    }
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisp*/) {
        'use strict';

        if (!this) {
            throw new TypeError();
        }

        var objects = Object(this);
        var len = objects.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisp = arguments[1];
        for (var i in objects) {
            if (objects.hasOwnProperty(i)) {
                if (fun.call(thisp, objects[i], i, objects)) {
                    res.push(objects[i]);
                }
            }
        }

        return res;
    };
}

function clearError(divId, source) {
    if (typeof (source) === 'object')
        source.length = 0;
    $('#' + divId).empty();
}

function showError(divId, source) {
    var isOne = (typeof (source) === "object" && source.length == 1);
    if (typeof (source) === "string" || isOne) {
        var msg = isOne ? source[0] : source;
        $('#' + divId).empty().append('<div class="alert alert-danger">' + msg + '</div>');
    }
    else if (source.length > 1)
        bindTemplate(divId, 'tmpErrors', source);
}

function showSuccess(divId, source) {
    var isOne = (typeof (source) === "object" && source.length == 1);
    if (typeof (source) === "string" || isOne) {
        var msg = isOne ? source[0] : source;
        $('#' + divId).empty().append('<div class="alert alert-success">' + msg + '</div>');
    }
    else if (source.length > 1)
        bindTemplate(divId, 'tmpSuccesses', source);
}

//#region Encode/Decode HTML
function htmlDecode(value) {
    return $('<div />').text(value).html();
}

function htmlEncode(value) {
    return $('<div />').html(value).text();
}
var dataState = { Detached: 1, Unchanged: 2, Added: 4, Deleted: 8, Modified: 16 };
//#endregion

//SubMarket
function isValidValue(value) {
    if (value == null || value == '') return false;
    return true;
}

function checkValueInput(inputValue, original, lblEror) {
    if (original.revert == inputValue) {
        original.reset();
        return false;
    }
    if (isValidValue(inputValue)) {
        if (inputValue.length > 100) {
            $(original).find('input:first').attr('title', kLg.msgMaxLength100);
            $(original).find('input:first').tooltip('show');
            return false;
        } else {
            $('#' + lblEror).hide();
            return true;
        }
    } else {
        original.reset();
        return false;
    }
}

function checkValueMaxLength(inputValue, original, lblEror) {
    if (original.revert == inputValue) {
        original.reset();
        return false;
    }
    //if (isValidValue(inputValue)) {
    if (inputValue.length > 100) {
        $('#' + lblEror).show();
        $('#' + lblEror).text(kLg.msgMaxLength100);

        return false;
    } else {
        //$('#lblError').hide();
        $('#' + lblEror).hide();
        return true;
    }
   
}

function callAjaxSubMarket(jsonObject, url, callback) {
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        data: JSON.stringify(jsonObject),
        async: true,
        success: function (data) {
            callback(data, jsonObject);
        },
        error: onFail
    });
}

//Set Edit 
function setEditbale(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: '95%',
        css: 'input-xlarge',
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('input', this).val();
            return checkValueInput(valueInput, original, "lblError");

        }
    });
}

//Set Edit 
function setDemandEditbale(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: '95%',
        css: 'input-xlarge',
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('input', this).val();
            return checkValueInput(valueInput, original, "lblProductError");

        }
    });
}

//Set TargetEdit 
function setTargetEditbale(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: '300px',
        css: 'input-xlarge',
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('input', this).val();
            return checkValueInput(valueInput, original, "lblProductError");

        }
    });
}

//Set Edit 
function setLabelEditbale(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: 115 + "px",
        css: 'input-xlarge',
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('input', this).val();
            return checkValueInput(valueInput, original, "lblError");
        }
    });
}

function setEditbaleSwotanalyse(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: '95%',
        height: '30px',
        css: 'input-jedit',
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('input', this).val();
            var rs = checkValueInput(valueInput, original, "lblSwotEditError");
            return rs;

        }
    });
}

function setEditbaleSwotanalyseCanBeNull(id, callback, customFunction) {
    $(id).editable(callback, {
        type: 'textarea', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: 'Cancel', //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: '99%',
        height: '30px',
        css: 'input-jedit',
        placeholder: kLg.doubleclick,
        onsubmit: function (settings, original) {
            customFunction();
            var valueInput = $('textarea', this).val();
            //return checkValueMaxLength(valueInput, original, "lblSwotEditError");
            return true;

        }
    });
}

function setEditalePriorityGoalAction(spanId, spanValue, callback) {
    var arrId = spanId.split("_");
    $(spanId).editable(callback, {
        type: 'text', //type of form field you want, could also be ‘textarea’
        select: true,
        onblur: 'submit',
        //cancel: kLg.cancel, //label of the cancel button
        tooltip: kLg.doubleclick, //tooltip to show when user hovers over the editable text
        event: 'dblclick', //type of event to activate the editable text (click is default)
        width: 350 + "px",
        css: 'input-xlarge',
        elmId: arrId[1],
        elmValue: spanValue,
        onsubmit: function () {
            //var valueInput = $('input', this).val();
            //var ngon = checkValueInput(valueInput, original);
            return true;
        }
    });
}

function getTruncateText(lengthCell, truncateText) {
    var tsize = 5;
    if (truncateText.length > 5 * lengthCell) {
        if (lengthCell == 2) tsize = 4;
        if (lengthCell == 1) tsize = 3;
        truncateText = truncateText.substring(0, tsize * lengthCell) + "...";
    }
    return truncateText;
}

function getTruncateSmallText(lengthCell, truncateText) {
   
    switch (true) {
        case (lengthCell == 1):
            if (truncateText.length > 5 * lengthCell)
                truncateText = truncateText.substring(0, 5 * lengthCell - 2) + "...";
        case (lengthCell == 2):
            if (truncateText.length > 6 * lengthCell)
                truncateText = truncateText.substring(0, 5 * lengthCell) + "...";
        case (lengthCell > 2):
            if (truncateText.length > 7 * lengthCell)
                truncateText = truncateText.substring(0, 7 * lengthCell) + "...";
    }
    return truncateText;

}

function getTruncateStrategieText(truncateText) {
    if (truncateText.length > 15) {
        truncateText = truncateText.substring(0, 15) + "...";
    }
    return truncateText;
}

function onFail(result) {
    console.log(result);
    $("#main-content").html('Ajax failed');
}

function addMouseOver(strClass) {
    var target = $(strClass);
    target.mouseenter(function () {
        var imgRemove = $('.imgRemove', this);
        if (!imgRemove.length > 0) {
            $(this).unbind('mousedown');
        }
        $('.imgAdd:first', this).show();
        $('.imgRemove:first', this).show();
    });
    target.mouseleave(function () {
        $('.imgRemove:first', this).hide();
        $('.imgAdd:first', this).hide();
    });
}

function setVerticalCellText(lengthCell, textlang, divId, size) {
    var font = { font: 'bold ' + size + 'px Segoe UI, Arial, sans-serif' };
    //var fill = { fill: "hsb(199deg, 1, 1)" };
    var fill = { fill: "rgb(0,0,0)" };
    var idDiv = $(divId).attr('id');
    var spandId = divId + "S";
    var cellId = divId + "C";
    var height;
    if (lengthCell < 3) {
        height = $(cellId).height() - lengthCell * 4;
    } else {
        height = $(cellId).height() - lengthCell;
    }
    if (size == 11) {
        var tsize = 3;
        var truncateOldText = getTruncateSmallText(lengthCell, textlang);
    } else {
        tsize = 3.5;
        truncateOldText = getTruncateText(lengthCell, textlang);
    }
    var y = $(cellId).height() / 2 + textlang.length * tsize;

    if (truncateOldText.length != textlang.length) {
        $(cellId).attr('title', textlang);
        y = height;
    }

    $(spandId).text(truncateOldText);
    var R = window.Raphael(idDiv, 40, height);
    R.text(20, y, truncateOldText)
        .attr(font)
        .attr(fill)
        .rotate(-90, true).attr({ 'text-anchor': 'start' });
    $(spandId).hide();
}

function redirectDefault() {
    window.location = "/Default.aspx?lang=" + kLg.language;
}

Date.prototype.toMString = function () {
    var month = this.getMonth() + 1;
    return this.getFullYear() + "-" + month + "-" + this.getDate();
};

vmCommon.tryDateToMString = function (value) {
    if (value instanceof Date) {
        return value.toMString();
    }
    return value;
};

vmCommon.tryToServerDate = function (value) {
    if (value instanceof Date) {
        return value.toServerDate();
    }
    return value;
}
Date.prototype.toServerDate = function () {
    var date = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
};

Date.prototype.toLocalDate = function () {
    return new Date(this.getTime() + this.getTimezoneOffset() * 60 * 1000);
};

String.prototype.jsonToDate = function () {
    return new Date(parseInt(this.substr(6))).toLocalDate();
};

String.prototype.jsonStringToDate = function () {
    return new Date(this);
};

vmCommon.tryJsonToLocalDate = function (value) {
    if (typeof value === 'string') {
        return value.jsonToDate();
    }
    return value;
}
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}
String.prototype.insertAt = function (start, delCount, newSubStr) {
    newSubStr = newSubStr || '';
    newSubStr = newSubStr.toString();
    var begin = this.slice(0, start);
    var end = this.slice(start + Math.abs(delCount));
    return (begin + newSubStr + end);
};

String.prototype.encodeDola = function () {
    var string = this;
    var indices = vmCommon.pushApply([], string, function (item, index) { return index; }, function (item) { return item === "$"; });

    for (var i = 0; i < indices.length; i++) {
        var index = indices[i];
        if (i > 0) index = index + 2;

        string = string.replaceAt(index, "\\$");
    }

    return string;
};

String.prototype.encodePercent = function () {
    var string = this;
    var indices = vmCommon.pushApply([], string, function (item, index) { return index; }, function (item) { return item === "%"; });

    for (var i = 0; i < indices.length; i++) {
        var index = indices[i];
        if (i > 0) index = index + 2;

        string = string.replaceAt(index, "\\%");
    }

    return string;
};

String.prototype.encodeSymbol = function () {
    var string = this;
    if (string.length == 0) return string;
    //string = string.replace("$", "\\$");
    string = string.replaceAll("%", "\\%");
    string = string.replaceAll("0", "\\0");
    string = string.replaceAll(".", "");
    string = string.replaceAll(";", "");
    string = string.replaceAll("'", "");
    return string;
};

var templateAction = { Add: 1, Update: 2 };
var templateType = {
    Evaluation: 0,
    Competition: 1,
    ProductPosition: 2,
    MarketSegmentReview: 3,
    ProductDesign: 4,
    Swotanalyse: 5,
    SubmarketProduct: 6,
    MainGoal: 7,
    SubGoal: 8,
    ApEvaluationTemplate: 12,
    ApProductTemplate: 13,
    ApSwotanalyseTemplate: 14,
};
vmCommon.GoalType = { MainGoal: 0, SubGoal: 1, SubGoalWithoutMainGoal: 2, Action: 3 };
vmCommon.checkConflict = function (result) {
    if (result && result === -1) {
        alert(kLg.msgConflictData);
        return false;
    }
    return true;
};
vmCommon.emptyGuid = "00000000-0000-0000-0000-000000000000";
vmCommon.empty = "";

vmCommon.compareDate = function (date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    if (date1.getTime() > date2.getTime()) {
        return 1;
    }
    else if (date1.getTime() == date2.getTime()) {
        return 0;
    } else {
        return -1;
    }
};

vmCommon.compareDate2 = function (date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        return 0;
    }

    var d1 = new Date(+date1);
    var d2 = new Date(+date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    if (d1.getTime() > d2.getTime()) {
        return 1;
    }
    else if (d1.getTime() == d2.getTime()) {
        return 0;
    } else {
        return -1;
    }
};

vmCommon.MemberRole = { NoProject: -2, NoRole: -1, View: 0, Edit: 1, Owner: 2 };
vmCommon.ProjectRole = {
    GroupOwner: 1,
    ProjectOwner: 4,
    ProjectEdit: 5,
    ProjectView: 6,
    StrategyEdit: 7,
    StrategyView: 8,
    ProjectNoAccess: 18
};

vmCommon.enumPorfoColor = { DarkGreen: '#568c11', LightGreen: '#a7e327', LightOrange: '#f2834e', DarkOrange: '#c21a1a' };

vmCommon.enumBudgetColor = { ColorB: '#4f61a4', NeColor: '#A74420', NeColor2: '#ff6200', ColorO: '#598c59', ColorP: '#EDD03F', ColorC: '#c0b7a6' };

vmCommon.sortType = { ASC: 'ASC', DESC: 'DESC' };

vmCommon.Paggination = { ItemPerPage: 50, PageStart: 1 };
vmCommon.paging = (function () {
    var pagingFloor = 3;
    var displayPagingCount = 5;

    var getPages = function (currentPage, totalPage) {
        var pages = [], pageIndex;

        if (currentPage <= pagingFloor) {
            pageIndex = 1;
        } else {
            if (totalPage <= displayPagingCount) {
                pageIndex = 1;
            } else {
                if (currentPage > totalPage - pagingFloor) {
                    pageIndex = totalPage - displayPagingCount + 1;
                } else {
                    pageIndex = currentPage - pagingFloor + 1;
                    pageIndex = pageIndex > 0 ? pageIndex : 1;
                }
            }
        }
        for (var i = 1; i <= displayPagingCount && pageIndex <= totalPage; i++) {
            pages.push(pageIndex);
            pageIndex++;
        }

        return pages;
    };

    return {
        getPages: getPages
    };
})();

var colorPalette = colorPalette || [
    '8d0f00', 'b84300', '6b5800', '004300', '00555e', '002f73', '5421ab', '5f3d1d', '191919',
    'e52000', 'fd7400', 'c1aa03', '0a7c00', '009181', '0046a8', '9a22cc', '905011', '373737',
    'ff443f', 'fb9f00', 'f2d500', '34ba18', '00c2a7', '256bd0', 'eb23af', 'a86925', '5c5c5c',
    'ff96a8', 'ffd314', 'fff814', '4dfd1a', '4effea', '65a0f4', 'ff68d3', 'de9038', '9a9a9a',
    'ffd9c9', 'fff1b4', 'fffdcf', 'd1ff4b', 'c2fff2', 'a8cbff', 'ffb4fc', 'f8bb6c', 'dcdcdc'
];
var colorPaletteAction = colorPaletteAction || [
    '#1FD4AF', '#b84300', '#6b5800', '#004300', '#00555e', '#002f73', '#5421ab', '#5f3d1d', '#191919',
    '#DE7EB5', '#fd7400', '#c1aa03', '#0a7c00', '#009181', '#0046a8', '#9a22cc', '#905011', '#373737',
    '#EAE572', '#fb9f00', '#f2d500', '#b8c92e', '#00c2a7', '#256bd0', '#eb23af', '#a86925', '#5c5c5c',
    '#DE9C7E', '#ffd314', '#fff814', '#4dfd1a', '#4effea', '#65a0f4', '#ff68d3', '#de9038', '#9a9a9a',
    '#ffcab3', '#fff1b4', '#fffdcf', '#d1ff4b', '#c2fff2', '#a8cbff', '#ffb4fc', '#f8bb6c', '#dcdcdc'
];
var colorPaletteActionk = colorPaletteActionk || [
    '#1FD4AF', '#b84300', '#6b5800', '#004300', '#00555e', '#002f73', '#5421ab', '#5f3d1d', '#191919',
    '#DE7EB5', '#fd7400', '#c1aa03', '#0a7c00', '#009181', '#0046a8', '#9a22cc', '#905011', '#373737',
    '#EAE572', '#fb9f00', '#f2d500', '#b8c92e', '#00c2a7', '#256bd0', '#eb23af', '#a86925', '#5c5c5c',
    '#DE9C7E', '#ffd314', '#fff814', '#4dfd1a', '#4effea', '#3090BE', '#ff68d3', '#de9038', '#9a9a9a',
    '#ffcab3', '#fff1b4', '#fffdcf', '#d1ff4b', '#c2fff2', '#a8cbff', '#ffb4fc', '#f8bb6c', '#dcdcdc'
];

function updatePaletteFrom(arrPalette) {
    if (Array.isArray(arrPalette) && arrPalette.length > 0) {
        colorPalette = arrPalette;
        colorPaletteAction = arrPalette;
        colorPaletteActionk = arrPalette;
        
    }
}

vmCommon.defaultColor = '#fb9f00';

function refreshMarketPage() {
    location.reload();
}

function setMarketButtonVisibilitiy() {
    $('a.remove').hide();
    $('div.filterItem').hover(function () {
        $(this).find('a.remove').show();
    }, function () {
        $(this).find('a.remove').hide();
    });
};

(function ($) {
    $.fn.extend({
        donetyping: function (callback, timeout) {
            timeout = timeout || 1e3; // 1 second default timeout
            var timeoutReference,
                doneTyping = function (el) {
                    //if (!timeoutReference) return; 
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function (i, el) {
                var $el = $(el);
                $el.is(':input') && $el.keyup(function () {
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function () {
                        doneTyping(el);
                    }, timeout);
                }).blur(function () {

                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function () {
                        doneTyping(el);
                    }, timeout);
                });
            });
        }
    });
})(jQuery);

vmCommon.showAllDescription = function () {
    vmCommon.popEditDescription = showPopup(vmCommon.popEditDescription, $('#popDescriptionMarket'),
        vmCommon.rootUrl + 'Contents/MsPopDescription.html',
        {
            height: 168,
            width: 500,
            resizable: false
        });
    vmCommon.popEditDescription.title(kLg.labelDes);
}

function removeAllHover() {
    $('table.tbgrid-marketing td').removeClass('td-hover');
    $('table.tbgrid td').removeClass('td-hover');
}

function addAllHover() {
    $('table.tbgrid td').addClass('td-hover');
    $('table.tbgrid td.is-null').removeClass('td-hover');
    $('table.tbgrid-marketing td').addClass('td-hover');
    $('table.tbgrid-marketing td.is-null').removeClass('td-hover');
}

function bindSwitchSpanToInput(updateMarketData, cssSelector, maxlength) {
    bindSwitchSpanToInputLib(updateMarketData, cssSelector, removeAllHover, addAllHover, maxlength);
}

function bindSwitchSpanToInputWithParent(updateMarketData, cssSelector) {
    bindSwitchSpanToInputLibWithParent(updateMarketData, cssSelector, removeAllHover, addAllHover, maxlength);
}
function bindSwitchSpanToInputLib(updateMarketData, cssSelector, removeHover, addHover, maxlength) {
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
        $input.width('90%');
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
            text: $(this).val(),
            style: "white-space:pre;"
        });
        var id = $(this).closest('td').attr('id');

        if ($(this).val().trim().length > 0) {
            updateMarketData(id, $(this).val());
        } else {
            $span.text(currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.on("click", switchToInput);

    };
    $("." + cssSelector).on("dblclick", switchToInput);
}

function bindSwitchSpanToInputCatLib(updateMarketData, cssSelector, maxlength) {
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
        $input.width('90%');
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
        var $span = $("<span>", {
            text: $(this).val(),
            style: "white-space:pre;"
        });

        var typeId = $(this).closest('td').attr('itype');
        var levelId = $(this).closest('td').attr('ilv');
        if ($(this).val().trim().length > 0) {
            updateMarketData(typeId, levelId, $(this).val());
        } else {
            $span.text(currentText);
        }
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.on("click", switchToInput);

    };

    $("." + cssSelector).on("dblclick", switchToInput);

}

function bindSwitchSpanToInputLibWithParent(updateMarketData, cssSelector, removeHover, addHover) {
    var currentText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        currentText = $(this).text();
        $input.attr('maxlength', 100);
        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.width('90%');
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
        var id = $(this).closest('td').attr('id');
        var parentid = $(this).closest('td').attr('parentid');

        if ($(this).val().trim().length > 0) {
            updateMarketData(parentid, id, $(this).val());
        } else {
            $span.text(currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.on("click", switchToInput);

    };
    $("." + cssSelector).on("dblclick", switchToInput);
}

function bindSwitchSpanToInputLibIndex(updateMarketData, cssSelector, removeHover, addHover) {
    var currentText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        currentText = $(this).text();
        $input.attr('maxlength', 50);
        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.width('90%');
        $input.addClass('span-to-input-subMarket');
        $input.addClass("label-input nameField w-100per-word-break");
        $input.addClass("label-input w-100per-word-break nameField boxSizing compeName");
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
        var e = $(this);
        if ($(this).val().trim().length > 0) {
            updateMarketData(e);
            $span.attr('title', $(this).val());
        } else {
            $span.text(currentText);
            $span.attr('title', currentText);
        }

        addHover();
        $span.addClass(cssSelector);
        $span.addClass("label-input nameField w-100per-word-break");
        $span.addClass("w-100per-word-break nameField boxSizing compeName");

        $(this).replaceWith($span);
        $span.on("click", switchToInput);

    };
    $("." + cssSelector).on("click", switchToInput);
}

function checkInputLabelNull(id) {
    var param = id.split("L");
    var labelId = param[1];
    var submarketId = param[2];
    if ((labelId == "0") || (submarketId == "0")) {
        return true;
    }

    return false;
}

function showHideFilter(order) {
    $("#parentId" + order).parent("span").hide();
    $("#childId" + order).parent("span").hide();
    $("#parentId" + order).hide();
    $("#childId" + order).hide();
}
function setNullCustomFilter() {
    $("#typeFilter0").kendoDropDownList({
        optionLabel: kLg.filterLabelSelect,
        autoBind: true,
        text: kLg.filterLabelSelect
    });
    showHideFilter(0);
    $("#btnMarketFilter").prop("disabled", true);
    $("#btnAddFilter").prop("disabled", true);
    $("#btnAddFilter").addClass("bg-disable");
    $("#btnMarketFilter").addClass("bg-disable");
}

function checkFilterSearch(marketFilter, productFilter) {
    if (marketFilter.length == 0) return false;

    var iMarketCount = 0;
    for (var i = 0; i < marketFilter.length; i++) {
        var subMarket = marketFilter[i].SubMarketSegments;
        if (subMarket.length == 0) continue;

        for (var k = 0; k < subMarket.length; k++) {
            if (subMarket[k].Id > 0) {
                iMarketCount = iMarketCount + 1;
            }
        }

    }
    if (iMarketCount == 0) {
        return false;
    }

    var iProductCount = 0;
    if (productFilter == null) return false;

    for (var j = 0; j < productFilter.length; j++) {
        var products = productFilter[j].Products;
        if (products == null) break;
        for (var l = 0; l < products.length; l++) {
            if (products[l].Id > 0) {
                iProductCount = iProductCount + 1;
            }
        }
    }
    if (iProductCount == 0) {
        return false;
    }

    return true;
}


function checkForFilter(marketFilter, productFilter) {

    if (marketFilter.length == 0) return false;

    if (productFilter == null) return false;

    return true;
}

function getNullLandRegions() {
    $("#drpLands").kendoDropDownList({
        autoBind: false,
        text: vmCommon.joinString(kLg.btnChoose, kLg.lblLands)//kLg.filterLabelLand
    });
    $("#drpRegions").kendoDropDownList({
        autoBind: false,
        text: vmCommon.joinString(kLg.btnChoose, kLg.lblRegions)//kLg.filterLabelRegion
    });
}

function checkNullDescription(object) {
    if (!object)
        return null;
    var description = object.Description;
    if (!description || description.length == 0)
        return null;

    if (description.trim().length == 0) return null;

    return description;
}

function setIconForCellMarket(x, y, objectCell) {
    cleanMatrixCellMarket(objectCell);
    switch (true) {
        case (x == 0 && y == 0):
            break;
        case (x > -1 && y > -1):
            objectCell.find('span.icon-right-block').addClass("icon-submark1");
            showIcon();
            break;
        case (x > -1 && y < 0):
            objectCell.find('span.icon-right-block').addClass("icon-submark2");
            showIcon();
            break;
        case (x < 0 && y < 0):
            objectCell.find('span.icon-right-block').addClass("icon-submark3");
            showIcon();
            break;
        case (x < 0 && y > -1):
            objectCell.find('span.icon-right-block').addClass("icon-submark4");
            showIcon();
            break;
        default:
            objectCell.find('span.icon-right-block').addClass("icon-submark1");
            showIcon();
            break;
    }
    function showIcon() {
        objectCell.find('span.icon-right-block').show();
    };
}

function cleanMatrixCellMarket(objectCell) {
    objectCell.find('span.icon-right-block').removeClass("icon-submark1 icon-submark2 icon-submark3 icon-submark4");
    objectCell.find('span.icon-right-block').hide();
}

function findFinanceByYear(proFinances, year) {
    if (typeof proFinances == 'undefined') return { Income: 0, Cost: 0 };
    for (var i = 0; i < proFinances.length; i++) {
        if (proFinances[i].YearName === year.toString()) {
            return proFinances[i];
        }
    }
    return { Income: 0, Cost: 0 };
}

(function ($) {
    $.fn.removeClassRegEx = function (regex) {
        var classes = $(this).attr('class');

        if (!classes || !regex) return false;

        classes = classes.split(' ');

        var classArray = vmCommon.pushApply([], classes, null, function (item) { return !item.match(regex); });

        $(this).attr('class', classArray.join(' '));
        return false;
    };
})(jQuery);

function adjustEvalMinusCell(ewidth) {
    switch (true) {
        case eval > 9:
            ewidth = ewidth - 4;
            break;
        case eval < -9:
            ewidth = ewidth - 8;
            break;
    }
    return ewidth;

}

function adjustEvalPlusCell(ewidth) {
    switch (true) {
        case eval > 9:
            ewidth = ewidth + 4;
            break;
        case eval < -9:
            ewidth = ewidth + 8;
            break;
    }
    return ewidth;

}


vmCommon.redirectToSubmarket = function () {
    window.location = '/Pages/MsSubMarketProduct.aspx?lang=' + kLg.language + '&projid=' + projectId + "&strid=" + strategyId;
}

function callUpdateFilterAndCheck(jsonObject, funcName, fassign) {
    var url = '/Handlers/MarketFilterHandler.ashx?funcName=' + funcName + "&projid=" + projectId + "&strid=" + strategyId;
    callAjax('loadingRegionMatrix', url, JSON.stringify(jsonObject), function (data) {
        var isExits = data.value;
        if (isExits == -2) {
            pAlert(kLg.ItemDelete);
            return;
        }
        var par = "";
        if (fassign) {
            par = "&fa=1";
        }

        window.location = '/Pages/MsSubMarketProduct.aspx?lang=' + kLg.language + '&projid=' + projectId + "&strid=" + strategyId
            + "&subid=" + jsonObject.SubMarketId + "&prodid=" + jsonObject.ProductId + par;

    }, AjaxConst.PostRequest);
}

function callUpdateFilterAndCheckOpenTab(jsonObject, funcName, tabId) {
    var url = '/Handlers/MarketFilterHandler.ashx?funcName=' + funcName + "&projid=" + projectId + "&strid=" + strategyId;
    callAjax('loadingRegionMatrix', url, JSON.stringify(jsonObject), function (data) {
        var isExits = data.value;
        if (isExits == -2) {
            pAlert(kLg.ItemDelete);
            return;
        }
        window.location = '/Pages/MsSubMarketProduct.aspx?lang=' + kLg.language + '&projid=' + projectId + "&strid=" + strategyId
            + "&subid=" + jsonObject.SubMarketId + "&prodid=" + jsonObject.ProductId + "&tabid=" + tabId;

    }, AjaxConst.PostRequest);
}

function triggerOpenOneItem(item, id) {
    $(item).filter(function () {
        if ($(this).attr('id') == id) {
            $(this).find('ul li:first-child').trigger("click");
            return;
        }
    });

}
function removeURLParameter(parameter) {
    var url = window.location.href;
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var multiparas = parameter.split(',');

        var pars = urlparts[1].split(/[&;]/g);

        for (var j = 0; j < multiparas.length; j++) {
            var prefix = encodeURIComponent(multiparas[j]) + '=';
            for (var i = pars.length; i-- > 0;) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
        }
        url = urlparts[0] + '?' + pars.join('&');
        return url;
    } else {
        return url;
    }
}

function changeHourOfDate(todate) {
    if (todate) {
        var dateTimeNow = new Date();
        todate = kendo.parseDate(todate);
        //if (todate.getHours() < dateTimeNow.getHours()) {
        todate.setHours(dateTimeNow.getHours());
        todate.setMinutes(dateTimeNow.getMinutes());
        todate.setSeconds(dateTimeNow.getSeconds());
        //}
    }
    return todate;
}


function getCurrentHourOfDate(todate) {

    if (Object.prototype.toString.call(todate) === "[object Date]") {
        if (!isNaN(todate.getTime())) {
            var dateTimeNow = new Date();
            todate.setHours(dateTimeNow.getHours());
            todate.setMinutes(dateTimeNow.getMinutes());
            todate.setSeconds(dateTimeNow.getSeconds());
        }
    }
    return todate;
}

function disableButtonPopup() {
    $('.modal-market-footer .ms-button').attr("disabled", "disabled");
    //$('.modal-market-footer .ms-button').css('color', 'red');
    //sleepy(5000);

}

function enableButtonPopup() {
    //sleepy(5000);
    $('.modal-market-footer .ms-button').removeAttr('disabled');
    //$('.modal-market-footer .ms-button').css('color', 'rgb(254, 252, 252)');
}



//begin: encode special character to html

function attrEncode(attr, str) {
    return attr + '=\"' + htmlEscape(str) + '\"';
}

function htmlEscape(str) {
    return str ? String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') : "";
}
//end: encode special character to html

function limitedTabKey() {
    $('div[data-role=window]:focus').keydown(function (e) {
        if (e.keyCode == 9) {

            var cont = $(this).prop("id");
            if ($('#' + cont + ' *[tabindex]:last').is(':focus')) {
                $('#' + cont + ' *[tabindex=1]').focus();
                e.preventDefault();
            }
            return;
        }
    });
}

vmCommon.newGuid = function () {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }

    return _p8() + _p8(true) + _p8(true) + _p8();
};

function getFileExtention(fname) {
    return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
}


vmCommon.getOneActive = (function (acts) {
    return vmCommon.findByFunc(acts, function (item) { return item.IsActive; });
});

vmCommon.findById = function (objid, lst) {
    var obj = undefined;
    for (var i = 0; i < lst.length; i++) {
        // ReSharper disable once CoercedEqualsUsing
        if (lst[i].Id == objid) {
            obj = lst[i];
            break;
        }
    }

    return obj;
}

vmCommon.updateListCrm = (function (listpers) {
    if (listpers == null) listpers = [];
    for (var i = 0; i < listpers.length; i++) {
        if (listpers[i].IsActive) {
            listpers[i].CssActive = vmCommon.cssActive;
        } else {
            listpers[i].CssActive = vmCommon.cssInActive;
        }

        if (listpers[i].DueDate != null) {
            var dueDate = listpers[i].DueDate.jsonToDate();
            listpers[i].IsOverDue = vmCommon.compareDate(dueDate, new Date()) < 0 ? true : false;
        }

        if ((listpers[i].Plz == null || listpers[i].Plz === "") && (listpers[i].Ort == null || listpers[i].Ort === "")) {
            listpers[i].InvisibleSplash1 = false;
        } else {
            if (listpers[i].CrmLandName == null && listpers[i].BranchName == null) {
                listpers[i].InvisibleSplash1 = false;
            } else {
                listpers[i].InvisibleSplash1 = true;
            }

        }
        //}

        if (listpers[i].InvisibleSplash1 === false && listpers[i].CrmLandName == null) {
            listpers[i].InvisibleSplash2 = false;
        } else {
            if (listpers[i].BranchName == null || listpers[i].CrmLandName == null) {
                listpers[i].InvisibleSplash2 = false;
            } else {
                listpers[i].InvisibleSplash2 = true;
            }
        }


    }
    return listpers;

});

function generatePriorityClass(prio) {
    var nclass = '';
    switch (Number(prio)) {
        case 1:
            nclass = "icon-16 icon-priority-height";
            break;
        case 2:
            nclass = "icon-16 icon-priority-regular";
            break;
        case 3:
            nclass = "icon-16 icon-priority-low";
            break;
        default:
            nclass = "col-div-16px";
            break;
    }
    return nclass;
}

vmCommon.formatActivity = function (activities) {
    for (var i = 0; i < activities.length; i++) {
        activities[i].isOverDue = true;
        if (activities[i].Finish) {
            activities[i].finishClass = "opacity-half";
        } else {
            if (activities[i].DueDate != null) {
                var dueDate = activities[i].DueDate.jsonToDate();
                activities[i].isOverDue = vmCommon.compareDate(dueDate, new Date()) != -1 ? true : false;
            }
        }

        activities[i].StartDate = activities[i].StartDate != null ? kendo.toString(activities[i].StartDate.jsonToDate(), 'd') : activities[i].StartDate;
        activities[i].DueDate = activities[i].DueDate != null ? kendo.toString(activities[i].DueDate.jsonToDate(), 'd') : activities[i].DueDate;
        //activities[i].Extension = typeof activities[i].Extension === 'undefined' ? '' : activities[i].Extension;
        activities[i].prioClass = generatePriorityClass(activities[i].Extension);
    }
    return activities;
};

vmCommon.formatCrowdProject = function (cprojects) {
    var obj = new queryString(true);
    var curlang = obj.get("lang") == undefined ? 'de' : obj.get("lang");

    var linkTemp = jQuery.validator.format("../Pages/CrmCrowdProjectView.aspx?lang={0}&projid={1}&strid={2}&cpid={3}");
    for (var i = 0; i < cprojects.length; i++) {
        if (cprojects[i].EndDate != null) {
            var endDate = cprojects[i].EndDate.jsonToDate();
            cprojects[i].overDueClass = vmCommon.compareDate(endDate, new Date()) == -1 ? "opacity-half" : null;
        }

        cprojects[i].FirstTimeLoginDate = cprojects[i].FirstTimeLoginDate != null ? kendo.toString(cprojects[i].FirstTimeLoginDate.jsonToDate(), 'd') : cprojects[i].FirstTimeLoginDate;
        cprojects[i].StartDate = cprojects[i].StartDate != null ? kendo.toString(cprojects[i].StartDate.jsonToDate(), 'd') : cprojects[i].StartDate;
        cprojects[i].EndDate = cprojects[i].EndDate != null ? kendo.toString(cprojects[i].EndDate.jsonToDate(), 'd') : cprojects[i].EndDate;
        cprojects[i].linkToPage = linkTemp(curlang, projectId, strategyId, cprojects[i].Id);
    }
    return cprojects;
};

vmCommon.checkNullItem = function (item) {
    if (item != null && item.length > 0) {
        return true;
    }
    return false;

};

vmCommon.invisibleItemContent = function (item) {
    if (item == null || item == '') return false;
    return true;
};

vmCommon.FileType = {
    Folder: 0,
    NonType: 3,
    Pdf: 4,
    Word: 5,
    Excel: 6,
    Image: 7,
    Url: 8,
    Ppt: 9,
    Visio: 10,
    Path: 11
};

function setFileIcon(type) {
    switch (type) {
        case 0:
            return "folder-blue";
        case 4:
            return "pdf";
        case 5:
            return "word";
        case 6:
            return "exel";
        case 7:
            return "img";
        case 8:
            return "url";
        case 9:
            return "ppt";
        case 10:
            return "visio";
        default:
            return "otherfile";
    }
};

vmCommon.bindChangeIcon = function () {
    var theSelector = '.parent-body';
    $(theSelector).on('show.bs.collapse', function (e) {

        var $span = $($(e.target).prev().find('span')[0]);
        $span.removeClass('arrow-collapse');
        $span.addClass('arrow-right-big');
    }).on('hide.bs.collapse', function (e) {
        var $span = $($(e.target).prev().find('span')[0]);
        $span.removeClass('arrow-right-big');
        $span.addClass('arrow-collapse');
    });
};

vmCommon.getFileAssign = function (fileAssign) {

    if (fileAssign) {
        return vmCommon.IconAssignFile;
    } else {
        return vmCommon.IconNotAssignFile;
    }
};

vmCommon.isObjNullorUndefined = function (obj) {
    if (obj != null && obj != 'undefined') {
        return false;
    } else {
        return true;
    }
};

vmCommon.CheckEmailSetting = function (strEmail) {
    if (strEmail == null) return false;

    var temp = strEmail.trim();

    var emailfilter = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{1,}|\d+)$/i;
    return (temp && emailfilter.test(temp));
};

vmCommon.CheckEmail3 = function (strEmail) {
    if (strEmail == null) return false;

    var temp = strEmail.trim();

    var emailfilter = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,}|\d+)$/i;
    return (temp && emailfilter.test(temp));
};

vmCommon.CheckEmail2 = function (emailIdToCheck, title, tPos) {
    var emailId = $(emailIdToCheck);
    var valEmail = emailId.val();
    var emailfilter = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i;
    if ((valEmail == null) || (valEmail === "") || !emailfilter.test(valEmail)) {
        ShowToolTip2(emailId, title, tPos);
        return false;
    }
    emailId.tooltip('destroy');
    return true;
};

function ShowToolTip2(currTarget, title, tPos) {
    currTarget.tooltip("destroy");
    currTarget.attr("title", title);
    currTarget.tooltip({ trigger: "manual", placement: tPos }).tooltip('show');
}

vmCommon.CheckEmail = function (emailIdToCheck, title, tPos) {
    var emailId = $(emailIdToCheck);
    var valEmail = emailId.val().trim();
    var emailfilter = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,9}|\d+)$/i;
    if ((valEmail == null) || (valEmail == "") || !emailfilter.test(valEmail)) {
        ShowToolTip(emailId, title, tPos);
        return false;
    }
    emailId.tooltip('destroy');
    return true;
};

function ShowToolTip(currTarget, title, tPos) {
    currTarget.tooltip("destroy");

    currTarget.attr("title", title);
    tPos = tPos || 'top';
    currTarget.tooltip({ trigger: "manual", placement: tPos }).tooltip('show');
    currTarget.focus();
}

function DestroyToolTip(currTarget) {
    currTarget.tooltip("destroy");
}

vmCommon.ajaxDisplayBefore = function (divId) {
    if (divId == undefined) {
        return;
    }
    var divLoading = $('#' + divId);
    var isHidden = divLoading.is(':hidden');
    if (isHidden)
        divLoading.show();
    divLoading.html('<div id="loading-center-helper"></div><div id="loading-center" style="display: block"></div>');
    divLoading.css("z-index", 99999999);
}

vmCommon.ajaxDisplayAfter = function (divId) {
    if (divId == undefined) {
        return;
    }
    var divLoading = $('#' + divId);
    var isHidden = divLoading.is(':hidden');
    if (!isHidden)
        divLoading.hide();
    divLoading.empty();
}

vmCommon.GetFileFromUrl = function (url, clientname) {
    if (!url || !clientname)
        return;
    var a = document.createElement("a");
    a.href = url;
    a.download = clientname;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    delete a;
};

vmCommon.enumPage = {
    Market: "msmarketsegment",
    SubMarket: "MsSubMarketProduct",
    ActionPlan: "msgoalaction",
    Calendar: "msmarketingmix",
    Dashboard: "dashboard",
    Report: "report",
    CrmOrganisation: "crmorganisation",
    CrmPerson: "crmperson",
    CrmActivities: "crmactivities",
    CrmCrowdProject: "crmcrowdproject",
    CrmFragenset: "crmfragenset",
    CrmQuestionAnswer: "crmquestionanswer",
    TeamBoard: "MsTeamboard",
    RoadMap: "MsRoadmap"
};

vmCommon.checkCurrentPage = function (pageType) {
    var temp = pageType || "";
    return getCurrentPageName().toLowerCase() === temp.toLowerCase();
};

function getCurrentPageName() {
    var pathName = window.location.pathname;
    return pathName.substring(pathName.lastIndexOf("/") + 1, pathName.lastIndexOf("."));
};

//SONPT. 08/09/2015. 
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i].toString() === obj.toString() || Number(this[i]) === Number(obj)) {
            return true;
        }
    }
    return false;
};

var positionBefore = 0, enableScroll = true;
vmCommon.crmAutoScroll = function (st) {
    var isScrollUp = st < positionBefore;
    var pmenu = $("#pmenu").offset();
    var newtop = 0;
    if (isScrollUp && $("#fmenu").offset().top > 135) {

        if ((pmenu.top - 135 < 0)) {
            newtop = (st - $("#divCrmFilter").height() - 33) > 0 ? (st - $("#divCrmFilter").height() - 33) : 0;
            $("#fmenu").css({ top: newtop });
        } else {
            $("#fmenu").css({ top: newtop });
        }
    }

    positionBefore = st;
};


vmCommon.crmAutoScroll2 = function () {
    var newtop = (positionBefore - $("#divCrmFilter").height() - 33) > 0 ? (positionBefore - $("#divCrmFilter").height() - 33) : 0;
    $("#fmenu").css({ top: newtop });
};

vmCommon.newId5 = function (orginId) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text + "-" + orginId;
};

vmCommon.getCurrentBrowser = function () {
    var nAgt = navigator.userAgent;

    if ((nAgt.indexOf("OPR")) !== -1) {
        return vmCommon.Browser.Opera;
    } else if ((nAgt.indexOf("Edge")) !== -1) {
        return vmCommon.Browser.Edge;
    } else if ((nAgt.indexOf("Chrome")) !== -1) {
        return vmCommon.Browser.Chrome;
    } else if ((nAgt.indexOf("Safari")) !== -1) {
        return vmCommon.Browser.Safari;
    } else if ((nAgt.indexOf("Firefox")) !== -1) {
        return vmCommon.Browser.FireFox;
    } else {
        return vmCommon.Browser.Ie;
    }

};

vmCommon.settingLabelDefault = function (dicValues, keyCaption) {
    if (dicValues) {
        if (dicValues[keyCaption]) {
            kLg[keyCaption] = dicValues[keyCaption];
        }
    }

};
vmCommon.arrListCustomLangParam = ['titleMarketSegment', 'lblMarktsegemente', 'marketInfo', 'tabMarketSegment', 'addRegion'
    , 'tabSubMarketProduct', 'Produktstrategie', 'lblMarktsegementeSubMarket', 'lblProductGroup', 'addProduct', 'filterLabelMarket', 'filterLabelLandRegion', 'filterLabelLand', 'filterLabelRegion', 'btnAddMarketSegment'
    , 'AddLand', 'Auswertung', 'btnEvaluation', 'btnEvaluationSub', 'btnStrategy', 'btnMoney', 'menuEvaluation', 'menuMatrix', 'menuStr', 'menuMoney', 'menuEvaluation', 'menuMatrix', 'menuStr', 'menuMoney'
    , 'filterLabelProductGroupProduct', 'filterLabelProductGroup', 'lblSubmarket', 'createNewProduct', 'createSubmarket', 'addNewStakeholderGroup', 'AddProductGroup', 'lblProductGroupLabelL1', 'addProduct'
    , 'filterLabelMarketSub', 'filterLabelSubMarket', 'lblLands', 'lblRegions', 'AddLable', 'ExpandLabel', 'lblNameAdvertisingMaterials', 'lblNameAdvertiser', 'lblNameSubjetThema', "strategyTab", "tabActionPlan", "tabMarketingmix", "lblSubProductGroup", "subClient",
    'tabTeamboard', 'tabRoadmap', 'vtextRegion', 'labelMainGoalName', 'labelSubGoalName', 'labelActionName'
];

vmCommon.loadcustomizeMarketLanguage = function (dicValues) { //SONPT. Last edited: 04-01-2015  
    for (var i = 0; i < vmCommon.arrListCustomLangParam.length; i++) {
        vmCommon.settingLabelDefault(dicValues, vmCommon.arrListCustomLangParam[i]);
    }
};

vmCommon.arrListCustomCatLang = ['lblNameCatGoal', 'lblNameAction', 'labelEvaluation', 'Currency', 'titleActionFibu', 'lblVolumeStrategy', 'lblKpiIndex'
    , 'menuInstrument', 'filterLblProductGroup', 'titleStackholderGroups', 'vtextCustomerJourney', 'lblNameAdvertisingMaterials', 'lblNameSubjetThema',
    'lblFilterSupplier', 'gaLblField', 'SharepointLinkControl', 'lblColorPalette', 'gaLblStatusProtocol', 'titleProjectLanguageSetting',
    'filterLblProduct', 'filterLblSubProduct', 'contactPerson', 'contactSubPerson', 'titleJourney', 'titleSubJourney', 'menuKpiIndex', 'lblKpiUnit',
    'lblKpiTimePeriod', 'lblKpiFormat', 'lblNameAdvertiser'];

vmCommon.loadcustomizeMarketCatLanguage = function (dicValues) {
    for (var i = 0; i < vmCommon.arrListCustomCatLang.length; i++) {
        vmCommon.settingLabelDefault(dicValues, vmCommon.arrListCustomCatLang[i]);
    }
};

vmCommon.Browser = {
    Chrome: "Chrome", FireFox: "FireFox", Safari: "Safari", Ie: "IE", Opera: "Opera", Edge: "Edge"
};

vmCommon.updateEmailTo = function (data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].CatInfoType == 4) {
            data[i].MailTo = "MailTo:" + data[i].Value;
        } else if (data[i].CatInfoType == 2) {
            data[i].CallTo = 'tel:' + data[i].Value;
        }
    }
    return data;
};

vmCommon.updateWebsite = function (data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].CatInfoType == 5) {
            var substr1 = data[i].Value.substr(0, 7);
            var substr2 = data[i].Value.substr(0, 8);
            data[i].Website = (substr1 == 'http://' || substr2 == 'https://') ? data[i].Value : 'http://' + data[i].Value;
        }
    }
    return data;
};

vmCommon.setupMenuIcon = function (elm, pop) {//elm: '#trend span[data-toggle=dropdown]'
    return new Promise((resolve) => {
        $(elm).click(function () {
            resolve();
            var menuItemPos = $(this).offset();
            var $ul = $(this).next();
            var ulHeight = $ul.outerHeight(),
                ulWidth = $ul.outerWidth();
            var elmCss = { top: 'initial', left: 'initial', right: 'initial', bottom: 'initial' };
            var mainHeight = (pop)
                ? ((($(pop).height() + $(pop).offset().top) > ($(window).height() - 80))
                    ? $(window).height() - 80 : $(pop).height() + $(pop).offset().top - 18)
                : $(window).height() - 80;
            var mainWidth = (pop)
                ? $(pop).width()
                : $(window).width();
            if (menuItemPos.top + ulHeight + 30 > mainHeight) //Go top
            {
                elmCss.bottom = 23 + 'px';
            } else //Go bottom
            {
                elmCss.top = 18 + 'px';
            }

            if (menuItemPos.left + ulWidth > mainWidth) {
                elmCss.right = 2;
            }
            $ul.css(elmCss);
        });
    });
};

vmCommon.onscroll = function (elm) {
    $(window).scrollTop(function () {
        var $ul = $(elm).next();
        $ul.css({ position: 'absolute' });
    });
};


vmCommon.ShowToolTipDesIcon = function (elm, des, temp, placement) { //elm =#btnEvaluationSub temp =#tempShowDescription    
    $(elm).bind('mouseenter', function () {
        var e = $(this);
        e.unbind('mouseenter');
        var description = des;
        var template = kendo.template($(temp).html());
        var tooltip = {
            html: true,
            content: template(description),
            title: htmlEncode(name),
            trigger: "hover"
        };
        if (placement) tooltip.placement = placement;
        e.popover(tooltip).popover('show'); 
    });
    
};
vmCommon.ShowToolTipDesIconBtnAddActionCost = function (elm, des, temp, placement) { //elm =#btnEvaluationSub temp =#tempShowDescription    
    $(elm).off('mouseenter').on('mouseenter', function () {
        var e = $(this);        
        var description = des;
        var template = kendo.template($(temp).html());
        placement = placement || 'top';

        var tooltip = {
            placement: placement,
            html: true,
            content: template(description),
            title: htmlEncode(name),
            trigger: "hover"
           
        }; 
        e.popover(tooltip).popover('show');
       
    });

};

vmCommon.sleepy = function (milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
};
vmCommon.enumTypeConnection = {
    Action_Submarket: 1,
    Action_Product: 2,
    Goal_Submarket: 3,
    Goal_Product: 4
};

// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length !== array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        } else if (array.contains(this[i])) continue;
        return false;
    }
    return true;
};

// ReSharper disable once NativeTypePrototypeExtending
Date.prototype.days = function (to) {
    if (to instanceof Date) {
        var thisDate = new Date(vmCommon.deepCopy(this));
        thisDate.setHours(0, 0, 0, 0);

        var toDate = new Date(vmCommon.deepCopy(to));
        toDate.setHours(0, 0, 0, 0);
        return Math.floor(toDate.getTime() / (3600 * 24 * 1000)) - Math.floor(thisDate.getTime() / (3600 * 24 * 1000));
    }

    return null;
};

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
};

function dateDiffInDays(a, b) {
    var timeDay = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / timeDay);
}

vmCommon.enumMenuAction = {
    Submarket: 1,
    Product: 2,
    Maingoal: 3,
    Subgoal: 4,
    Action: 5,
    Independence: 6,
    SubIndependence: 7
};

vmCommon.enumReportLink = {
    ExportExcel: "ExportExcel",
    ExportActivityExcel: "ExportActivityExcel",
    ActionPlanExportExcel: "ActionPlanExportExcel"
};

//join 2 string depend on language 
vmCommon.joinString = function (selectWord, otherWord) {
    switch (kLg.language) {
        case "en":
            return selectWord + ' ' + otherWord;
        case "de":
        case "pm":
            return otherWord + ' ' + selectWord;
        default:
            return "";
    }
};


vmCommon.languageKpi = function (selectWord) {
    switch (kLg.language) {
        case "en":
            return 'Creat link to ' + ' ' + selectWord;
        case "de":
        case "pm":
            return 'Link zu ' + selectWord + ' erstellen';
        default:
            return "";
    }
};

vmCommon.deepCopy = function (arr) {
    if (arr == null || arr == undefined) {
        return null;
    }

    return JSON.parse(JSON.stringify(arr));
};

vmCommon.formatCost = function (cost) {
    if (cost) {
        return kendo.toString(cost, "##,#");
    }
    return "";
};

vmCommon.formatOriginCost = function (cost) {
    return kendo.toString(Math.round(cost), "##,#");
};

/// <summary >show tooltip and auto disappear</summary>
/// <param name='milisecond'>0: don't auto disappear</param>
vmCommon.showTooltip = function (elementJquery, strtooltip, milisecond, isHtml) {
    elementJquery.attr("title", strtooltip);
    elementJquery.tooltip({ trigger: "manual", html: (isHtml || true) }).tooltip('show');
    if (milisecond > 0)
        setTimeout(function () {
            elementJquery.tooltip('destroy');
        }, milisecond);
};

vmCommon.showTooltip2 = function (elementJquery, strtooltip, pos, milisecond, isHtml) {
    elementJquery.attr("title", strtooltip);
    elementJquery.tooltip({ trigger: "manual", html: (isHtml || true), placement: pos }).tooltip('show');
    if (milisecond > 0)
        setTimeout(function () {
            elementJquery.tooltip('destroy');
        }, milisecond);
};

Array.prototype.swap = function (index1, index2) {
    var b = this[index1];
    this[index1] = this[index2];
    this[index2] = b;
    return this;
};

vmCommon.buildString = function (numberBeforePoint, numberAfterPoint) {
    var str = '~';
    numberBeforePoint = numberBeforePoint || 1000;
    numberAfterPoint = numberAfterPoint || 30;
    for (var i = 1; i < numberBeforePoint; i++) {
        str = '0' + str;
    }
    if (numberAfterPoint > 0)
        str += '.';
    for (var i = 0; i < numberAfterPoint; i++) {
        str += '0';
    }
    return str;
};

//Todo: check type
vmCommon.isFloat = function (n) {
    return n === +n && n !== (n | 0);
};

vmCommon.isInteger = function (n) {
    return n === +n && n === (n | 0);
};

//add 2016_04_04
//Todo: test this function
vmCommon.isDate = function (date) {
    if (date.length < 8) return false;
    return ((new Date(date)).toString() !== "Invalid Date") ? true : false;
}

//format date & time 24h no AM, PM
//Example: 2016_04_04 13:01:02
//strTimeFormat : "HH:mm:ss" or "HH:mm" or other
//C# DateTime format convert to JSON
String.prototype.customKendoFormatDate = function (strTimeFormat) {
    //TODO: check format
    //return date != null //or !vmCommon.isDate(date)
    //    ? kendo.toString(this.jsonToDate(), 'd') + "  " + kendo.toString(this.jsonToDate(), strTimeFormat)
    //    : '';
    return kendo.toString(this.jsonToDate(), 'd') + "  " + kendo.toString(this.jsonToDate(), strTimeFormat);
};

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

//use build function char.repeat cause error on ie10
vmCommon.repeateString = function (str, numberToRepeat) {
    var temp = '';
    if (i < 0)
        return temp;
    for (var i = 0; i < numberToRepeat; i++) {
        temp += str;
    }
    return temp;
};

vmCommon.enumAttachType = { CrowdProject: 1 };

vmCommon.SaveState =
{
    UnSaved: -1,
    Saved: 0
};

vmCommon.LocationOrigin = window.location.origin ? window.location.origin : (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""));

String.prototype.containsAnyElement = function (arr_String) {
    for (var i = 0; i < arr_String.length; i++) {
        if (this.contains(arr_String[i])) {
            return true;
        }
    }
};

$.fn.extend({
    preventPressAlphabetChar: function (lst) {
       
        var allows = [8, 9, 27, 13, 190];
        if (lst && $.isArray(lst)) {
            allows = allows.concat(lst);
        }


        this.bind("keypress", function (e) {
           
            var charCode = (e.which) ? e.which : e.keyCode;

            if (e.shiftKey) {
                e.preventDefault();
            }

            var isExtentKey = false;
            // Allow: backspace, delete, tab, escape, enter, ctrl+A
            if ($.inArray(charCode, allows) !== -1 ||
                // Allow: Ctrl+A
                (charCode === 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (charCode >= 35 && charCode < 39)) {
                // let it happen, don't do anything
                isExtentKey = true;
            }

            if (isExtentKey) {
                return;
            }

            var charValue = String.fromCharCode(e.which)
                , valid = /^[0-9]+$/.test(charValue);

            if (!valid) {
                e.preventDefault();
            }

        });
        this.bind("paste", function (e) {
            var clipboardValue;
            //var nAgt = navigator.userAgent;
            var curBrowser = vmCommon.getCurrentBrowser();

            switch (curBrowser) {
                case vmCommon.Browser.Opera:
                case vmCommon.Browser.Chrome:
                case vmCommon.Browser.Safari:
                case vmCommon.Browser.FireFox:
                    clipboardValue = e.originalEvent.clipboardData.getData('Text');
                    break;
                default:
                    clipboardValue = window.clipboardData.getData('Text');
                    break;
            }

            if (!/^\d{1,6}$/.test(clipboardValue)) {
                e.preventDefault();
            }
        });
    }
});

vmCommon.LocationOrigin = window.location.origin ? window.location.origin : (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""));

vmCommon.DownloadHandler = "../Handlers/DownloadHandler.ashx";

vmCommon.GetFile = function (url, clientname) {
    if (!url || !clientname)
        return;

    var path = vmCommon.DownloadHandler + "?path=" + url + "&name=" + clientname;
    var a = document.createElement("a");
    a.href = path;
    a.download = clientname;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    delete a;
};

String.prototype.is1stCharZero = function () {
    return this.length > 0 && this.charAt(0) === '0'; 
};

String.prototype.isOnlyContainsNumber = function () {
    return /^\d+$/.test(this); 
};

String.prototype.format = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i]);
    }
    return s;
};

vmCommon.toDateUtc = function (date) {
    if (date == null) {
        return date;
    }

    var currentTime = new Date();
    var currentTimezone = (currentTime.getTimezoneOffset() / 60) * -1;

    var newDate = null;

    try {
        if (typeof date === "string") {
            newDate = date.jsonToDate();
        } else if (date instanceof Date) {
            newDate = date;
        }
    } catch (e) {
        newDate = null;
        console.log("Error: " + e + ".");
    }

    if (newDate == null) {
        return newDate;
    }

    if (newDate.getHours() === 0 && newDate.getMinutes() === 0 && newDate.getSeconds() === 0) {
        return newDate;
    }

    return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds());;
};

vmCommon.autoFormatDate = function (dateString, language) {
    var spaceString = language === "de" | "pm" ? "." : "/";

    if (dateString.contains("/") || dateString.contains(".")) {
        return dateString;
    } else {
        if (dateString.length === 6) {
            var date6 = dateString.slice(0, 2) + spaceString + dateString.slice(2, 4) + spaceString + "20" + dateString.slice(4, 6);
            return date6;
        }
        else if (dateString.length === 8) {
            var year = dateString.slice(4, 8);
            var yearInt = parseInt(year);
            if (yearInt >= 1900 && yearInt <= 2099) {
                var date8 = dateString.slice(0, 2) + spaceString + dateString.slice(2, 4) + spaceString + dateString.slice(4, 8);
                return date8;
            } else {
                return dateString;
            }
        } else {
            return dateString;
        }
    }
};

vmCommon.autoFormatDateByLang = function (dateString, language) {
    var spaceString = language === "de" | "pm" ? "." : "/";

    if (dateString.contains("/") || dateString.contains(".") || (dateString.length !== 6) && dateString.length !== 8) return dateString;

    var day = dateString.slice(0, 2);
    var month = dateString.slice(2, 4);
    var year = dateString.length === 6 ? ("20" + dateString.slice(4, 6)) : dateString.slice(4, 8);
    if (parseInt(year) < 1900 || parseInt(year) > 2099) return dateString;
    return day + spaceString + month + spaceString + year;
};

vmCommon.formatStringToDate = function (dateString, language) {
    if (dateString === null || typeof dateString !== "string" || dateString.length === 0) {
        return null;
    }

    var spaceString = language === "de" || language === "pm" ? "." : "/"; 

    var temp = null;
    if (dateString.contains("/") || dateString.contains(".")) {
        temp = dateString;
    }
    else {
        if (dateString.length === 6) {
            var date6 = dateString.slice(0, 2) + spaceString + dateString.slice(2, 4) + spaceString + "20" + dateString.slice(4, 6);
            temp = date6;
        }
        else if (dateString.length === 8) {
            var year = dateString.slice(4, 8);
            var yearInt = parseInt(year);
            if (yearInt >= 1900 && yearInt <= 2099) {
                var date8 = dateString.slice(0, 2) + spaceString + dateString.slice(2, 4) + spaceString + dateString.slice(4, 8);
                temp = date8;
            }
        }
    }

    if (temp == null) {
        return null;
    }

    var newDate = vmCommon.convertDateFormatX(temp, language);
    if (newDate == null || isNaN(newDate.getDate())) {
        return null;
    }

    var fullYear = newDate.getFullYear();
    if (fullYear < 1900 || fullYear > 2099) {
        return null;
    }

    return newDate;
};

//manhlv
vmCommon.convertDateFormatX = function (dateValue, language) {
    var dateformat = undefined;
    if (language === "de" || language === "pm") {
        var dateDe = dateValue.split(".");
        dateformat = dateDe[1] + "/" + dateDe[0] + "/" + dateDe[2];
    } else if (language === "en") {
        dateformat = dateValue;
    }
    if (moment(dateformat, "MM/DD/YYYY", false).isValid()) {
        return new Date(dateformat);
    } else {
        return null;
    }
};

vmCommon.convertDateFormat = function (dateValue, language) {
    var dateformat;
    if (language === "de" || language === "pm") {
        var dateDe = dateValue.split(".");
        dateformat = dateDe[1] + "/" + dateDe[0] + "/" + dateDe[2];
    } else if (language === "en") {
        dateformat = dateValue;
    }

    if (dateformat != null) {
        var dateF = dateformat.split("/");
        var arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        var dateS = "";
        if ($.inArray(dateF[0], arr) > -1) {
            dateS += "0" + dateF[0] + "/";
        } else {
            dateS += dateF[0] + "/";
        }

        if ($.inArray(dateF[1], arr) > -1) {
            dateS += "0" + dateF[1] + "/";
        } else {
            dateS += dateF[1] + "/";
        }

        dateS = dateS + dateF[2];

        if (moment(dateS, "MM/DD/YYYY", true).isValid()) {
            return new Date(dateS);
        } else {
            return null;
        }
    }
};

vmCommon.DbPositionType = { DashBoard: 1, MarketingMix: 2 };

vmCommon.sortBy = function (lst, pro) {
    var rs = [];
    var temp = Object.keys(lst).sort(function (a, b) { return lst[a][pro] - lst[b][pro] });

    for (var i = 0; i < temp.length; i++) {
        rs.push(lst[Number(temp[i])]);
    }

    return rs;
};

// ReSharper disable once NativeTypePrototypeExtending
Date.prototype.getWeek = function () {
    // Copy date so don't modify original
    var d = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number

    return weekNo;
};
Date.prototype.toStringMMDDYYYY = function () {
    var date = this;
    return `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}`
}
Date.prototype.toStringYYYYMMDD = function () {
    var date = this;
    var m = date.getMonth() + 1;
    if (m < 10) m = `0${m}`;
    var d = date.getDate();
    if (d < 10) d = `0${d}`;
    return `${date.getFullYear()}-${m}-${d}`;
}
function compareYYYYMMDD(txD1, txD2) {
    if(typeof txD1 != 'string' || typeof txD2 != 'string') return -2;
    const lst1 = txD1.split('-');
    const lst2 = txD2.split('-');
    if (lst1.length != lst2.length || lst1.length < 3 || lst2.length < 3) return -2;
    if (parseInt(lst1[0]) > parseInt(lst2[0])) return -1;   // year2 - year1 < 0
    if (parseInt(lst1[0]) < parseInt(lst2[0])) return 1;    // year2 - year1 > 0
    if (parseInt(lst1[1]) > parseInt(lst2[1])) return -1;   // year2 = year1, month2 - month1 < 0
    if (parseInt(lst1[1]) < parseInt(lst2[1])) return 1;    // year2 = year1, month2 - month1 > 0
    if (parseInt(lst1[2]) > parseInt(lst2[2])) return -1;   // year2 = year1, month2 = month1, day2 - day1 < 0
    if (parseInt(lst1[2]) < parseInt(lst2[2])) return 1;    // year2 = year1, month2 = month1, day2 - day1 > 0
    if (parseInt(lst1[2]) == parseInt(lst2[2])) return 0;    // year2 = year1, month2 = month1, day2 == day1
    return -2;
}
vmCommon.showNotification = function (selector, msg, timeout, topPos, width) {
    if ($("#hoandNtf8290").length || $("#hoand-k-notification-8290").length) return;
    return new Promise(function (show) {
        var $holder = "<span id='hoandNtf8290'></span>";
        $(selector).append($holder);
        var p = $(selector).offset();
        var ntf = $("#hoandNtf8290").kendoNotification({
            position: {
                pinned: false,
                top: topPos != undefined ? p.top + topPos : p.top,
                right: p.left
            },
            button: false,
            autoHideAfter: timeout,
            width: width ? width : 360,
            show: function (e) {
                var kContainer = $("#hoand-k-notification-8290").parent().parent().parent();
                kContainer.css("z-index", "999999");
                kContainer.css("left", p.left + parseInt($(selector).width() / 5));
                show(e.element);
            }
        }).data("kendoNotification");
        ntf.show("<div id='hoand-k-notification-8290'>" + msg + "<div>");
        setTimeout(function () {
            $("#hoandNtf8290").remove();
        }, timeout);
    });
};

vmCommon.CountCharInString = function (s, c) {
    if (s == null) return 0;
    var count = 0;
    for (var i = 0; i < s.length; i++) {
        if (s[i] === c) count++;
    }

    return count;
};

vmCommon.getAutoFormatDate = function (dStr) {
    if (dStr === null) return "NA";

    return "NA";
};

vmCommon.toEnDateString = function (dStr) {
    var dayStr, monthStr, yearStr;
    if (dStr.length === 10 && vmCommon.CountCharInString(dStr, ".") === 2) {
        dayStr = dStr.slice(0, 2);
        monthStr = dStr.slice(3, 5);
        yearStr = dStr.slice(6, 10);
        if (isNaN(dayStr) || isNaN(monthStr) || isNaN(yearStr))
            return "NaN";
        if (parseInt(dayStr) > (new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate()))
            return "NaN";
        if (parseInt(yearStr) < 1900 || parseInt(yearStr) > 2099)
            return "NaN";
        return monthStr + "/" + dayStr + "/" + yearStr;

    }
    else if (dStr.length === 10 && vmCommon.CountCharInString(dStr, "/") === 2) {
        dayStr = dStr.slice(3, 5);
        monthStr = dStr.slice(0, 2);
        yearStr = dStr.slice(6, 10);
        if (isNaN(dayStr) || isNaN(monthStr) || isNaN(yearStr))
            return "NaN";
        if (parseInt(dayStr) > (new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate()))
            return "NaN";
        if (parseInt(yearStr) < 1900 || parseInt(yearStr) > 2099)
            return "NaN";
        return dStr;
    }
    else {
        return dStr;
    }
}

vmCommon.toKendoDatePickerString = function (dateString) {
    if (!dateString || dateString.length !== 10) return dateString;
    var dayStr, monthStr, yearStr;
    if (vmCommon.CountCharInString(dateString, ".") === 2) {
        dayStr = dateString.slice(0, 2);
        monthStr = dateString.slice(3, 5);
        yearStr = dateString.slice(6, 10);
        return parseInt(dayStr) + "." + parseInt(monthStr) + "." + parseInt(yearStr);
    } else if (vmCommon.CountCharInString(dateString, "/") === 2) {
        dayStr = dateString.slice(3, 5);
        monthStr = dateString.slice(0, 2);
        yearStr = dateString.slice(6, 10);
        return parseInt(monthStr) + "/" + parseInt(dayStr) + "/" + parseInt(yearStr);
    } else return dateString;
};

vmCommon.formatDateWithLanguage = function (dateValue, language) {
    if (language === "de" | "pm" || language === "pm") {
        return dateValue.getDate() + "." + (dateValue.getMonth() + 1) + "." + dateValue.getFullYear();
    } else if (language === "en") {
        return (dateValue.getMonth() + 1) + "/" + dateValue.getDate() + "/" + dateValue.getFullYear();
    }
};


// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.distinct = function () {

    var rs = [], that = this;
    for (var i = that.length - 1; i >= 0; i--) {
        if (rs.indexOf(that[i]) === -1) {
            rs.push(that[i]);
        } else {
            this.splice(i, 1);
        }
    }
    return this;
};

// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.pushx = function (item) {
    if (this.indexOf(item) === -1) {
        this.push(item);
    }
};
Array.prototype.pushUnique = function (item) {
    if (this.indexOf(item) === -1) {
        this.push(item);
    }
};

// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.last = function () {
    return this[this.length - 1];
};

// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.first = function () {
    return this[0];
};

// ReSharper disable once NativeTypePrototypeExtending
String.prototype.toDate = function () {
    if (this.length == 0) {
        return null;
    }

    if (this.indexOf("/Date") != -1) {
        return this.jsonToDate();
    } else {
        return new Date(this);
    }
};

vmCommon.CustomShowToolTip = function (currTarget, title, tPos, milisecond, isHtml) {
    if (typeof (currTarget) === "undefined") return;
    if (typeof (title) === "undefined") title = "";
    if (typeof (tPos) === "undefined" || (tPos !== "top" && tPos !== "left" && tPos !== "bottom" && tPos !== "right")) tPos = "top";

    currTarget.attr("title", title);
    currTarget.tooltip({ trigger: "manual", placement: tPos, html: (isHtml || true) }).tooltip('show');
    if (milisecond > 0)
        setTimeout(function () {
            currTarget.tooltip('destroy');
        }, milisecond);
};

vmCommon.getSortClassById = function (sid) {
    switch (sid) {
        case 0:
            return "icon-16 icon-sort-desc cursor-pointer sort-icon";
        case 1:
            return "icon-16 icon-sort-asc cursor-pointer sort-icon";
        default:
            return "";
    }
};

vmCommon.formatSort = function (sObj) {
    sObj.sClass = vmCommon.getSortClassById(sObj.sTypeId);
    return sObj;
}

vmCommon.getSelectName = function (id) {
    switch (id) {
        case 0:
            return kLg.Activity;
        case 1:
            return kLg.exBegin;
        case 2:
            return kLg.textDue;
        case 3:
            return kLg.filterNameOfOrganisation;
        case 5:
            return kLg.createdDate;
        default:
            return kLg.Activity;
    }
};

vmCommon.getCrowdSelectName = function (id) {
    switch (id) {
        case 0:
            return kLg.titleCPOStartDate;
        case 1:
            return kLg.titleCPOEndDate;
        case 2:
            return kLg.lblName;
        default:
            return kLg.titleCPOStartDate;
    }
};


vmCommon.gotoOrg = function (id) {
    var url = "/Pages/CrmOrganisation.aspx?lang=" + kLg.language + "&projid=" + projectId + "&strid=" + strategyId + "&oid=" + id;
    window.open(url, "_self");
}

vmCommon.gotoAcitivity = function (id) {
    var url = "/Pages/CrmActivities.aspx?lang=" + kLg.language + "&projid=" + projectId + "&strid=" + strategyId + "&aid=" + id;
    window.open(url, "_self");
}
vmCommon.gotoPerson = function (id) {
    var url = "/Pages/CrmPerson.aspx?lang=" + kLg.language + "&projid=" + projectId + "&strid=" + strategyId + "&pid=" + id;
    window.open(url, "_self");
}

vmCommon.EnumTypeReminder = {
    Goal: 1,
    Action: 2,
    Activity: 3,
    Person: 4,
    ActionTodo: 5
};

vmCommon.resetTabIndex = function (divId, idxNumb) {
    var tabindex = 0;
    $('#' + divId + ' input:visible,.k-dropdown:visible, textarea:visible, button:visible').each(function () {
        var $input = $(this);
        if ($input.prop('disabled')) {
            $input.attr('tabindex', '-1');
        } else {
            $input.attr("tabindex", idxNumb || tabindex);
        }
    });
}

vmCommon.resetTabIndexCrowd = function (divId) {
    var tabindex = 0;
    $('#' + divId + ' input,.k-dropdown, textarea:visible, button:visible').each(function () {
        var $input = $(this);
        if ($input.prop('disabled')) {
            $input.attr('tabindex', '-1');
        } else {
            $input.attr("tabindex", tabindex);
        }
    });
}

vmCommon.convertSpecialCharacter = function (mystring) {
    return mystring.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); 
}

vmCommon.updateListResponsibilty = function (res) {
    if (typeof res !== 'undefined' && res.length > 0) {
        for (var i = 0; i < res.length; i++) {
            res[i].VisibleComma = true;
        }
        res[res.length - 1].VisibleComma = false;
        return res;
    }
    return res;
};

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

vmCommon.toArrayByField = function (arrayObj, fieldName) {
    if (arrayObj) {
        var toarray = [];
        for (var i = 0; i < arrayObj.length; i++)
            toarray.push(arrayObj[i][fieldName]);
        return toarray;
    }
    return null;
};

vmCommon.setStyleWorkingRange = function () {
    $('#workingrange-place .k-dropdown-wrap.k-state-default').addClass('wr-background');
};

// ReSharper disable once NativeTypePrototypeExtending
Array.prototype.commons = function (array) {
    return $.grep(this, function (element) {
        return $.inArray(element, array) !== -1;
    });
};

vmCommon.randomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};

vmCommon.FormatType = {
    FORMAT: 1,
    COST: 2,
    DESCRIPTION: 3,
    CRMLINK: 4,
    DOCUMENT: 5
};

vmCommon.defaultUnit = function () {
    var unit = new KpiUnit();
    unit.TypeId = 1; // number
    unit.PositionId = 1; // left
    unit.OrderId = 2; // behind

    return unit;
};

//ENTITY
function KpiUnit() {
    this.Id = 0;
    this.Name = "";
    this.ProjectId = 0;
    this.TypeId = 0;
    this.Symbol = "";
    this.Description = "";
    this.PositionId = 0;
    this.OrderId = 0;
    this.MIndex = 0;
    this.IsContact = false;
    this.IsRevenue = false;
    this.IsTurnover = false;
    this.Mdf = 0;

    return this;
};

function MenuItem() {
    this.Id = "";
    this.Ids = "";
    this.Name = "";
    this.Description = "";
    this.Index = 0;
    this.ParentId = null;
    this.TypeId = 0;
    this.Level = 0;

    this.HasSelect = true;
    this.IsSelect = false;
    this.Selectable = true;
    this.Path = "";
    this.IsPath = false;
    this.RoleId = 0;
    this.IsLatest = false;

    this.Items = [];
    this.TheObject = null;

    return this;
};

// ReSharper disable NativeTypePrototypeExtending
String.prototype.toNumber = function () {
    if (this.length === 0) return null;

    var abc = this.replace(",", ".");
    return Number(abc);
};
// ReSharper restore NativeTypePrototypeExtending

vmCommon.KpiPercentType = {
    TO20: 0,
    FROM21TO40: 1,
    FROM41TO60: 2,
    FROM61TO80: 3,
    FROM81: 4
};

vmCommon.coppyToClipboard = function (text) {
    if (!text || text.length == 0) return;

    var $cpElement = $("<input>");
    $("body").append($cpElement);
    $cpElement.val(text).select();
    document.execCommand("copy");
    $cpElement.remove();
};

vmCommon.cutQuotaSymbol = function (text) {
    var x = '"';
    var d = text.length;
    if (text[0] == x && x == text[d - 1] && text.length == 2) return '';
    if (text.length > 2) {
        if (text[0] == x) {
            text = text.substring(1);
            d = d - 1;
        }
        if (text[d - 1] == x)
            text = text.slice(0, -1);
    }

    return text;
};

vmCommon.mnuDropdownPadLock = null;
vmCommon.mnuDropdownTimeoutOpen = function (obj, to) {
    if (!to) to = 1000;
    if (!obj.hasClass('open'))
        obj.toggleClass('open');
    clearTimeout(vmCommon.mnuDropdownPadLock);
    vmCommon.mnuDropdownPadLock = setTimeout(function () {
        obj.removeClass('open');
    }, to);
};


vmCommon.popSubmarketProductSe = undefined;
vmCommon.popSubmarketProductSeDatas = { Type: 0, Id: 0, TypeId: 0 };
vmCommon.popChildSubmarketProductSe = undefined;
vmCommon.popChildSubmarketProductSeData = undefined;

vmCommon.createElementForPopup = function (eId) {
    if (!eId || eId.length <= 0) return;
    if (eId[0] === '#') return;
    $('#' + eId).remove();
    var popId = document.createElement("div");
    $(popId).html('<div id="' + eId + '"></div>');
    $('body').append(popId);
};

vmCommon.showToolTipById = function (n, t, pos) {
    var p = "top";
    if (pos)
        p = pos;

    $('#' + n + '').tooltip('destroy');
    $('#' + n + '').attr("title", t);
    $('#' + n + '').tooltip({ trigger: "manual", placement: pos }).tooltip('show', 5);
    $('#' + n + '').focus();
};

vmCommon.showToolTipByClass = function (n, t, pos) {
    var p = "top";
    if (pos)
        p = pos;

    $('.' + n + '').tooltip('destroy');
    $('.' + n + '').attr("title", t);
    $('.' + n + '').tooltip({ trigger: "manual", placement: p }).tooltip('show', 5);
    $('.' + n + '').focus();
};

vmCommon.insertBefore = function (arr, it, tpos) {
    if (!tpos || tpos < 0) tpos = 0;
    if (tpos > arr.length) return arr.concat(it);
    var temp = [];
    for (var i = 0; i < arr.length; i++) {
        if (i == tpos) {
            temp.push(it);
            temp.push(arr[i]);
        } else {
            temp.push(arr[i]);
        }
    }
    return temp;
};

vmCommon.swapPosition = function (arr, spos, tpos) {
    var temp = arr[tpos];
    arr[tpos] = arr[spos];
    arr[spos] = temp;
    return arr;
};

vmCommon.updatePosition = function (arr, startIndex) {
    if (!startIndex || isNaN(startIndex)) startIndex = 1000;
    for (var i = 0; i < arr.length; i++) {
        arr[i].MIndex = (i + 1) * startIndex;
    }
    return arr;
};

vmCommon.dragdropPosition = function (sources, idDrag, idDrop, startIndex) {
    if (!idDrag || !idDrop || sources.length < 2) return sources;
    if (!startIndex) startIndex = 100;
    var spos, tpos, cpos = 0;
    for (var i = 0; i < sources.length; i++) {
        if (sources[i].Id == idDrag) spos = cpos;
        if (sources[i].Id == idDrop) tpos = cpos;
        cpos = cpos + 1;
    }

    var temp = sources[spos];
    switch (true) {
        case spos == 0 && tpos == 1:
        case spos == sources.length - 2 && tpos == sources.length - 1:
            sources = vmCommon.swapPosition(sources, spos, tpos);
            break;
        case tpos == 0:
            sources.splice(spos, 1);
            sources = vmCommon.insertBefore(sources, temp, 0);
            break;
        case tpos == sources.length - 1:
            sources.splice(spos, 1);
            sources = vmCommon.insertBefore(sources, temp, tpos - 1);
            break;
        case spos < tpos:
            sources.splice(spos, 1);
            sources = vmCommon.insertBefore(sources, temp, tpos - 1);
            break;
        case spos > tpos:
            sources.splice(spos, 1);
            sources = vmCommon.insertBefore(sources, temp, tpos);
            break;
        default:
            break;
    }

    vmCommon.updatePosition(sources, startIndex);

    return sources;
};

vmCommon.popSelectSubmarketProductSe = undefined;
vmCommon.enumSubProSeTypes = { Submarket: 1, Product: 2 };
vmCommon.popSelectSubProOptions = { Type: '', CallbackFunc: undefined };

vmCommon.isShowSubProSeButtom = function () {
    return vmCommon.currentControl == vmCommon.enumType.Market
        || vmCommon.currentControl == vmCommon.enumType.Submarket
        || vmCommon.currentControl == vmCommon.enumType.ProductGroup
        || vmCommon.currentControl == vmCommon.enumType.Product;

};

vmCommon.ActionCustomViewType = {
    INDIVIDUAL: 0,
    MASTERBUGET: 1,
    PRODUCT: 2,
    MARKET: 3,
    DESCRIPTION: 4,
    EXPECTEDEFFECT: 5,
    ACTUALEFFECT: 6,
    RESPONSIBILITY: 7,
    INVOLVEDPEOPLE: 8,
    CATEGORY: 9,
    FIELD: 10,
    ADVERTISING: 11,
    ADVERTISER: 12,
    SUBJECTTHEMA: 13,
    REGION: 14,
    COST: 15,
    UPSTREAM: 16,
    RESOURCEPLANNING: 17,
    VISIBILITY: 18,
    CUSTOMERJOURNEY: 19,
    ACTIVITY: 20,
    TODO: 21
};

vmCommon.binding = function (divId, data, tempId) {
    var templateContent = $("#" + tempId).html();
    data = data || [];

    var template = kendo.template(templateContent);
    $("#" + divId).html(template(data));
};

vmCommon.bindingContent = function (tempId, data) {
    var templateContent = $("#" + tempId).html();
    data = data || {};

    var template = kendo.template(templateContent);
    return template(data);
};

vmCommon.defaultDocument = {
    Id: 0,
    TypeId: 0,
    FolderFileId: 0,
    LinkId: 0,
    LinkType: 0,
    FolderFileName: ''
};

vmCommon.TeamBoardColumnSortType = {
    DueDate: 1,
    Kpi: 2,
    Evaluation: 3,
}

vmCommon.showUploadDocument = function (callbackFunc, role) {
    function uploadCallback(savedFiles) {
        if (typeof callbackFunc === 'function')
            callbackFunc(savedFiles);
    }

    function upFile(files) {
        if (files.length === 0) return false;

        var cpdata = new FormData();
        for (var i = 0; i < files.length; i++) {
            cpdata.append(files[i].name, files[i]);
        }

        var url = "../Handlers/DFolderHandler.ashx?funcName=uploaddocumentsefile&projid=" + projectId + "&strid=" + strategyId;
        vmCommon.sendFile(url, cpdata, function (res) {
            var savedFiles = res.value;
            uploadCallback(savedFiles);
        }, "");

        return true;
    }

    function upUrl(dFolder) {
        dFolder.Type = vmCommon.FileType.Url;
        var url = "../Handlers/DFolderHandler.ashx?funcName=uploaddocumentseurl&projid=" + projectId + "&strid=" + strategyId;
        callAjax("", url, JSON.stringify({ FileEntry: dFolder }), function (res) {
            var savedFiles = res.value;
            uploadCallback(savedFiles);
        }, AjaxConst.PostRequest);

        return true;
    };

    function upPath(dFolder) {
        dFolder.Type = vmCommon.FileType.Path;
        var url = "../Handlers/DFolderHandler.ashx?funcName=uploaddocumentsepath&projid=" + projectId + "&strid=" + strategyId;
        callAjax("", url, JSON.stringify({ FileEntry: dFolder }), function (res) {
            var savedFiles = res.value;
            uploadCallback(savedFiles);

        }, AjaxConst.PostRequest);

        return true;
    };

    vmFile.CurrentRole = role;
    vmFile.uploadOptions = {};
    vmFile.uploadOptions.Func = new UploadFunc(upFile, upUrl, upPath);
    showUploadFile();
};

vmCommon.showToolTipById = function (n, t, pos) {
    var p = "top";
    if (pos)
        p = pos;

    $('#' + n + '').tooltip('destroy');
    $('#' + n + '').attr("title", t);
    $('#' + n + '').tooltip({ trigger: "manual", placement: pos }).tooltip('show', 5);
    $('#' + n + '').focus();
};

function SortByLastName(a, b) {

    var aName = a.LastName.toLowerCase();
    var bName = b.LastName.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
};

vmCommon.getNewId = function (arrayData) {
    if (!arrayData || arrayData.length == 0) return -1;
    var arrAdd = [];
    vmCommon.findAllByFunc(arrAdd, arrayData, function (item) { return item.Id < 0; });
    var gid = 0;
    for (var i = 0; i < arrAdd.length; i++) {
        if (arrAdd[i].Id < gid)
            gid = arrAdd[i].Id;
    }
    return gid - 1;
};

vmCommon.autoFormatInputDateString = function ($selector, lang) {

    if (!$selector) return;
    var valueDate = $selector.val();
    if (valueDate.length !== 6 && valueDate.length !== 8) return;
    var dateString = vmCommon.autoFormatDateByLang(valueDate, lang);
    var kendoDateString = vmCommon.toKendoDatePickerString(dateString);
    $selector.val(kendoDateString);
};

vmCommon.getPopupHeight = function (modalBodyHeight, modalFooterHeight) {
    var maxPopupHeight = $(window).height() - 50;
    var modalBodyFooter = modalBodyHeight + modalFooterHeight;
    return modalBodyFooter < maxPopupHeight ? modalBodyFooter : maxPopupHeight;
}

vmCommon.setAutoSizeForTextArea = function (e) {
    //e is textarea control
    var textarea = $(e.target);
    var textValue = textarea.context.value.trim();
    var rows = textValue.split("\n").length;
    //console.log(rows);
    if (rows > 0 && rows < 10) {
        var hx = rows * 14 + 24;
        if (hx > 70) {
            textarea.context.style.height = hx + "px";
            return true;
        }
    }
    return false;
};

String.prototype.CleanInvalidXmlChars = function () {
    return this ? this.replace("", "").trim() : this;
};

vmCommon.dateRangeIsValid = function (date) {
    var temp = date;
    try {
        if (typeof temp === "string") temp = temp.jsonToDate();
        if (temp == null) return false;
        var year = temp.getFullYear();
        return year >= 1900 && year <= 2099;
    } catch (e) {
        return false;
    }
};

vmCommon.getCustomPath = function (pathStr) {
    if (!pathStr || pathStr == null || pathStr.length == 0) return pathStr;
    var newPath = "";
    var arrowRight = " <span class='icon-32 arrow-thingray-right pull-left' style='height: 25px;width: 28px;margin-left: -5px;'/> ";
    var data = pathStr.split('/');
    for (var i = 0; i < data.length; i++) {
        var itemCss = "style='font-size: 14px;margin-top: 2px;color: #808080;font-weight: normal;'";
        if (i == data.length - 1) itemCss = "style='font-size: 14px;margin-top: 2px;color: #666666;'";
        newPath += (newPath.length > 0) ? (arrowRight + "<span class='pull-left' " + itemCss + ">" + data[i] + "</span>") : ("<span class='pull-left' " + itemCss + ">" + data[i] + "</span>");
    }
    return newPath;
};

vmCommon.cleanInvalidXmlChars = function (str) {
    return str ? str.replace(//g, "").trim() : str;
};

vmCommon.getHeightTextArea = function (str) {
    return vmCommon.getHeightTextAreaFlex(str, 70);
};

vmCommon.getHeightTextAreaFlex = function (str, maxCharPerLine) {
    if (!str) return '28px';
    var breaks = str.trim().split("\n");
    var rows = breaks.length;
    for (var i = 0; i < breaks.length; i++) {
        var newLines = breaks[i].split(' ');
        var widthItem = 0;
        newLines.forEach(function (item) {
            widthItem += item.length * 8;  // sample: one char has width = 8px;
            if (widthItem > maxCharPerLine * 8) {
                rows++;
                widthItem = 0;
            }
        });
    }
    if (rows > 6) rows++;
    var height = 14;
    var fixHeight = height * rows + height;
    return fixHeight + 'px';
}

vmCommon.bindPersonTodoColumn = function (persons) {
    var strRes = '';
    for (var i = 0; i < persons.length; i++) {
        var name = persons[i].PersonName || "";

        strRes += strRes.trim().length > 0 ? (', ' + name) : name;
    }

    return htmlDecode(strRes);
};

vmCommon.bindStringDefault = function (str) {
    if (!str || str == null) {
        str = '';
    }
    return str;
};

vmCommon.getSubmarketIndependencySelector = function (smpId, indId) {
    if (!smpId && !indId) return "";
    var selector = "";
    if (smpId != null)
        selector = "div[mstype~='smpArea'][smpid='" + smpId + "']";
    else if (indId != null)
        selector = "div[mstype~='childArea'][childid='" + smpId + "']";
    return selector;
};

vmCommon.ClickToDownAndCopy = function (path, name, typeId, elementId) {
    if (typeId === 8 || typeId === 11) {
        vmCommon.CopyTitleToClipboard(name, elementId);
    } else {
        vmCommon.GetFileFromUrl("../FileUpload/" + path, name);
    }
};

vmCommon.CopyTitleToClipboard = function (name, elementId) {
    vmCommon.coppyToClipboard(name);
    setTimeout(function () {
        var tltp = $(elementId).kendoTooltip({
            filter: "span",
            content: kLg.msgCopied,
            position: "top",
            animation: {
                open: { effects: "zoom", duration: 69 }
            }
        }).data("kendoTooltip");
        tltp.show($(elementId));
        $(elementId).mouseleave(function () {
            tltp.hide();
        });

    }, 234);
}

vmCommon.clickElement = function (selectorStr, waittimer, funcReClick) {
    if (!selectorStr) return;
    if (isNaN(waittimer)) waittimer = 999;
    var el = $(selectorStr), _timeout = 0, timer = waittimer || 999;
    //console.log("Init auto clicker..");
    function _elPrivateClick() {
        if (_timeout > 5) return;
        _timeout += 1; //console.log("click: " + _timeout + ", selector: " + selectorStr);
        if (el.length > 0) {
            el.click();
            if (funcReClick && typeof funcReClick === 'function' && funcReClick(el))
                setTimeout(function () {
                    _elPrivateClick();
                }, timer);
        }
        else
            _elPrivateClick();
    }

    setTimeout(function () {
        _elPrivateClick();
    }, timer);
};

vmCommon.funcHelper = function (funcCheck, funcDo) {
    if (!funcCheck || !funcDo) return;
    if (typeof funcCheck !== 'function' || typeof funcDo !== 'function') return;
    var _count = 0;
    function _doTask() {
        if (_count > 100) return;
        if (funcCheck())
            funcDo();
        else
            setTimeout(function () {
                _count++;
                _doTask();
            }, 999);
    }

    _doTask();
};

vmCommon.enumOverWriteType = {
    OverWrite: 1, AddAllData: 2
};

vmCommon.convertSpecialToAlphaBet = function (charUpperCase) {
    charUpperCase = charUpperCase || '';
    switch (charUpperCase) {
        case 'Ä':
        case 'À':
        case 'Â':
            return 'A';
            break;
        case 'Ç':
            return 'C';
            break;
        case 'É':
        case 'È':
        case 'Ë':
            return 'E';
            break;
        case 'Ö':
        case 'Ò':
        case 'Ö':
        case 'Ô':
            return 'O';
            break;
        case 'Ü':
        case 'Ù':
            return 'U';
            break;
        case 'ẞ':
            return 'S';
            break;
        default:
            break;
    }
    return charUpperCase;
}
vmCommon.validateAlphabet = function (charUpperCase, charOutner) {
    var letters = /^[A-Z]+$/;
    var char = vmCommon.convertSpecialToAlphaBet(charUpperCase);
    if (char.match(letters))
        return char;
    else
        return charOutner;
};

vmCommon.MarketsegmentTitleType = { Marketsegment: 1, Land: 2, HeaderMarketsegment: 3 };

vmCommon.clickAlphaBet = function (e) {
    $('#sort-alphabet > ul li > a').removeClass('mst-active');
    $(e.target).closest('li').children('a').addClass('mst-active');
}
vmCommon.sortAFirst = function (arr, charLast) {
    var alpha = arr.sort(function (a, b) {
        if (a.AlphaName < b.AlphaName) return -1;
        if (a.AlphaName > b.AlphaName) return 1;
        return 0;
    });
    var al = alpha[0];
    if (al.AlphaName == charLast) {
        alpha.shift();
        alpha.push(al);
    }
    return alpha;
}

vmCommon.min = function (lst, defaultValue) {
    var newId = Math.min(...lst);
    if ((newId == Infinity || newId == -Infinity) && defaultValue != undefined) newId = defaultValue;

    return newId;
};

vmCommon.max = function (lst, defaultValue) {
    var newId = Math.max(...lst);
    if ((newId == Infinity || newId == -Infinity) && defaultValue != undefined) newId = defaultValue;

    return newId;
};

vmCommon.clearTimeInDate = function (date) {
    if (!(date instanceof Date)) return null;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
};


vmCommon.MK_AdjustX = (function () {
    var count = 0;

    return {
        render: function (btnAddNew, isSubmarket) {
            var offset = $('#scroll-horizontal').width() - $('#scroll-horizontal').parent().width();
            function getSpace() {
                var scrX = parseInt($('#view-right').css('padding-left'));
                $('#scroll-horizontal > tbody > tr:eq(0) > td.sm-visible').each(function () {
                    scrX += $(this).outerWidth();
                });

                return $(window).width() - scrX;
            };
            count++;
            if (offset < 0) {
                $('#btn-scroll-right').hide();
                if (isSubmarket && $('#view-right tbody').outerWidth() < 1) {
                    $(btnAddNew).css('left', '632px');
                    return true;
                }

                switch (count) {
                    case 1: // first load
                        if (getSpace() > 250) {
                            setBtnByWidth();
                            return;
                        };
                        break;
                    default: // second load
                        if (getSpace() > 130) {
                            setBtnByWidth();
                            count = 2;
                            return;
                        }
                        break;
                };

                setDefaultBtn();
                if (getSpace() > 5) $('#btn-scroll-right').show();

            } else {
                setDefaultBtn();
                $('#btn-scroll-right').show();
            }

            function setBtnByWidth() {
                $('#scroll-horizontal').parent().append($(btnAddNew));
                $('#scroll-horizontal').css({ 'float': 'left' });
                $(btnAddNew).css({
                    'left': '',
                    'right': 'auto',
                    'position': 'static',
                    'top': 'auto !important',
                    'margin-left': '5px', 'margin-right': '0'
                });
                $('.mk-table').css({ 'padding-right': '0' });
                $('#btn-scroll-right').hide();
                $('#btn-scroll-left').hide();
            };
            function setDefaultBtn() {
                $('#scroll-horizontal').css({ 'float': '' });
                $(btnAddNew).insertAfter("#btn-scroll-right");
                $(btnAddNew).css({
                    'left': '',
                    'right': '0',
                    'position': 'absolute',
                    'top': '',
                    'margin-left': '', 'margin-right': ''
                });
                $('.mk-table').css({ 'padding-right': '58px' });
            };
            return false;
        }
    }
})();

vmCommon.MKOnScroll = function () {
    function getNextCellWidth(isLeft) {
        var offset = $('div#rms-horizontal').scrollLeft(),
            exIndex = $('#scroll-horizontal tbody tr:eq(0) td.sm-visible').length,
            width = 0;

        if (exIndex > 1) {
            var scrollLeft = 0, index = 0;
            if (isLeft) {
                scrollLeft = $('#scroll-horizontal').width();
                offset = Math.round(offset);
                for (index = exIndex - 1; index >= 0; index--) {
                    width = $('#scroll-horizontal tr:eq(0) .sm-visible:eq(' + index + ')').outerWidth();
                    if (offset < scrollLeft) {
                        scrollLeft -= width;
                    } else if (offset > scrollLeft) {
                        var delta = offset - scrollLeft;
                        return delta > width ? delta : width;
                    } else {
                        return width;
                    }
                }
                return $('#scroll-horizontal tr:eq(0) .sm-visible:eq(0)').outerWidth();
            } else {
                for (index = 0; index < exIndex; index++) {
                    width = $('#scroll-horizontal tr:eq(0) .sm-visible:eq(' + index + ')').outerWidth();
                    if (offset > scrollLeft) {
                        scrollLeft += width;
                    } else if (offset < scrollLeft) {
                        var delta = scrollLeft - offset;
                        return delta > width ? delta : width;
                    } else {
                        return width;
                    }
                }
                return $('#scroll-horizontal tr:eq(0) .sm-visible:eq(' + (exIndex - 1) + ')').outerWidth();
            }
        } else {
            return width;
        }
    }
    function getMaxWidth() {
        var _totalWidth = 0;

        $('#scroll-horizontal > tbody > tr:eq(0) > td.sm-visible').each(function () {
            _totalWidth += $(this).outerWidth();
        });
        return _totalWidth;
    };
    function scrollAnimate(scrX) {
        var offset0 = $('div#rms-horizontal').scrollLeft();
        offset0 = Math.round(offset0);
        $('div#rms-horizontal').animate({ scrollLeft: scrX }, 50, function () {

            var maxOffset = getMaxWidth() - $('#view-right > div').outerWidth(),
                offset = $('div#rms-horizontal').scrollLeft();

            if (offset <= 1) {
                $('#btn-scroll-left').hide();

                if (maxOffset > 0) {
                    $('#btn-scroll-right').show();
                } else {
                    $('#btn-scroll-right').hide();
                }
            } else if (offset < maxOffset - 1) {
                $('#btn-scroll-right').show();
                $('#btn-scroll-left').show();
                if (offset == offset0) {
                    $('#btn-scroll-right').hide();
                }
            } else {
                $('#btn-scroll-right').hide();
                $('#btn-scroll-left').show();
            }
        });
    };

    return {
        scroll: function (isLeft) {
            var scrX,
                offset = getNextCellWidth(isLeft);

            if (isLeft) {
                scrX = '-=' + offset;
            } else {
                scrX = '+=' + offset;
            }

            scrollAnimate(scrX);

        },
        scrollToEnd: function () {
            var _totalWidth = getMaxWidth();

            _totalWidth = '+=' + (_totalWidth + 220);
            if ($('#view-right tbody').outerWidth() >= ($('#view-right').outerWidth() - 600)) {
                $('div#rms-horizontal').animate({ scrollLeft: _totalWidth }, 777, function () {
                    $('#btn-scroll-right').hide();
                    $('#btn-scroll-left').show();
                });
            }
        },
        scrollBack: function () {
            this.scroll(true);
        },
        Update: {
            offset: 0,
            scrollToOffset: function () {
                var _scrX = '+=' + this.offset;
                scrollAnimate(_scrX);
            },
            setCurrentOffset: function () {
                this.offset = $('div#rms-horizontal').scrollLeft(); // - (getMaxWidth() - $('#view-right > div').outerWidth());                
            }
        }
    }
}();
vmCommon.MKMarketEvent = function () {

    function setColCSS(el, cssObj) {
        var _index = $(el).closest('tr').children().filter(":visible").index($(el).parent());
        var productHead = $('#scroll-horizontal tr:eq(0) .sm-visible:eq(' + _index + ')');
        //console.log($(el), _index, $(productHead).children('.itemDraggable.divDragProduct').children('span'));

        $(productHead).children('.itemDraggable.divDragProduct').children('span').css(cssObj)
    }

    function setRowCss(el, cssObj) {
        var _index = $(el).closest('tbody').children().index($(el).closest('tr'));
        var row = $('#view-left thead td.divDropSubMarket:eq(' + (_index - 1) + ')');
        //console.log(_index, row.children('span.cssNameSubmaket'));

        row.children('.divDragSubMarket').children('span.cssNameSubmaket').css(cssObj);
        row.children('.divDragSubMarket').find('span.redirect-subname').css(cssObj);
    }

    return {
        mouseEnter: function (el) {
            //var _text = $(el).find('span.cssStrategyName').get(0).innerText;
            setColCSS(el, {
                'color': '#38baf8'
            });
            setRowCss(el, {
                'color': '#2a5d78'
            });
        },
        mouseLeave: function (el) {
            setColCSS(el, {
                'color': ''
            });
            setRowCss(el, {
                'color': ''
            });
        }
    }
};
vmCommon.MK_Sortable = function (parentSelector, itemSelector, sourceId, position, callBackFunc) {
    $(parentSelector).sortable({
        items: itemSelector,
        tolerance: "pointer",
        start: function (event, ui) {
            sourceId = parseInt($(ui.item).attr('id'));
            $sourceIndex = ui.item.index();
            $(this).find('.item-hover').css('margin-top', '-50px');
            $(ui.item.get(0)).css('margin-top', '0');
        },
        stop: function (event, ui) {
            var index = ui.item.index();
            $(this).find('.item-hover').css('margin-top', '');
            if (index === $sourceIndex) return false;
            position = $sourceIndex > index ? 0 : 1;
            callBackFunc(index, sourceId, position);
        }
    });
};

vmCommon.MK_SwitchSpanToInput = function (updateData, cssSelector, parentId, maxWidth, isNotChange) {
    var currentText = '';
    var switchToInput = function () {
        if (typeof (vmSProduct) !== "undefined") vmSProduct.clearTimeout();

        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        var _width = $(this).width();
        var _parentE = $(this).closest('div.item-hover');

        $input.attr('maxlength', 50);
        currentText = $(this).text();
        $input.addClass(cssSelector);
        $(this).replaceWith($input);

        _width = _width ? (_width > 488 ? (maxWidth ? maxWidth + 'px' : '80%') : (_width < 50 ? '50px' : _width + 5 + 'px')) : (maxWidth ? maxWidth + 'px' : '80%');
        $input.width(_width);

        $input.next().hide();
        $input.addClass('span-to-input');
        $input.on("mouseleave", switchToSpan);
        $input.select();
        if (_parentE) _parentE.attr('style', 'position: relative;');
        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };
    function addClassBindDblClick(_this, $span) {
        $span.addClass(cssSelector);
        $(_this).replaceWith($span);
        $span.on("dblclick", switchToInput);
    };
    var switchToSpan = function () {
        var $span = $("<span>", {
            text: (isNotChange) ? currentText : $(this).val(),
            style: "white-space:pre;"
        });
        var id = $(this).closest(parentId).attr('id');
        if (id === undefined) {
            id = parentId;
        }

        if ($(this).val().trim().length > 0) {
            addClassBindDblClick(this, $span);
            updateData(id, $(this).val(), currentText, $span);
        } else {
            $span.text(currentText);
            addClassBindDblClick(this, $span);
        }
        $span.next().show();
        //$(this).replaceWith($span);
        //$span.on("dblclick", switchToInput);
    };
    $("." + cssSelector).on("dblclick", switchToInput);
};

vmCommon.removeUrlParams = function (params) {
    var url = removeURLParameter(params);
    window.history.replaceState(null, document.title, url);
    window.history.pushState(null, document.title, url);
    if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan) && typeof vmGoalAction == 'object') {
        vmGoalAction.dataservice.getUpdateUrlCloseActpopup();
    }
};

vmCommon.handleClickTooltip = function (_spanSelector) {
    var selector = _spanSelector || '.mst-copy-to-clipboard',
        timeoutClick = undefined;
    $(selector).click(function () {
        var that = $(this),
            text = that.text();
        if (text) {
            timeoutClick = setTimeout(function () {
                if (timeoutClick === undefined) return;
                vmCommon.coppyToClipboard(text);
                var tltp = that.kendoTooltip({
                    filter: "span",
                    content: kLg.msgCopied,
                    position: 'top',
                    animation: { open: { effects: "zoom", duration: 69 } }
                }).data("kendoTooltip");
                tltp.show(that);
                setTimeout(function () { tltp.hide(); }, 999);
                that.mouseleave(function () {
                    tltp.hide();
                    tltp.destroy();
                });
            }, 550);
        }
    });

    $('.mst-dbl-to-call').click(function () {
        return false;
    }).dblclick(function () {
        window.location = this.href;
        return false;
    }).keydown(function (event) {
        switch (event.which) {
            case 13: // Enter case 32: // Space
                window.location = this.href;
                return false;
        }
    });
  
};

// Create random, new Guid()
vmCommon.newGuid = function () {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

vmCommon.popup = {
    callBack: undefined,
    close: function (context, templateApply) {
        if (context && this.callBack) this.callBack(context, templateApply);
        this.callBack = undefined;
    }
};

vmCommon.MKSetWidthWhenTextOver = function (thefirstFinance, theSecondFinance, callBackFnc) {
    var _totalFinance = (thefirstFinance.toString().match(/'|,/g) || []).length;     // use regex for count ' or , character
    _totalFinance += (theSecondFinance.toString().match(/'|,/g) || []).length;       // ' for Deutch and , for English/Italy/French

    if (_totalFinance < 2) {
        callBackFnc(220);
    } else if (_totalFinance <= 3) {
        callBackFnc(270);
    } else if (_totalFinance <= 4) {
        callBackFnc(300);
    } else if (_totalFinance <= 5) {
        callBackFnc(330);
    } else {
        callBackFnc(370);
    }
};
vmCommon.MKCssWidth = function (objectCell, width, isReset, callBackAdjustX) {
    var _index = objectCell.closest('td').index();
    var _width = width || 220;
    var _s = $('#rms-horizontal #view-right tbody tr td:eq(' + _index + ')');

    if (isReset) {
        _s.css({
            'width': '',
            'min-width': ''
        })
    }
    else if (_s.outerWidth() < _width && _width <= 500) {
        setCSS();
    }

    if (callBackAdjustX) callBackAdjustX();

    function setCSS() {
        if (_index >= 0)
            _s.css({
                'width': _width + 'px',
                'min-width': _width + 'px'
                //,'max-width': _width + 'px'
            });
    }
};

vmCommon.onMobile = function (maxWidth, callBackFunc) {
    window.mobileAndTabletcheck = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    if (maxWidth) {
        if ($(window).outerWidth() < maxWidth && typeof callBackFunc === "function") {
            callBackFunc();
        }
    }

    return {
        do: function (callbackfunc) {
            if (window.mobileAndTabletcheck()) {
                callbackfunc();
            }
        }
    }
};

function bindSwitchSpanToInputLabel(updateMarketData, cssSelector) {
    var switchToInput = function () {

        var id = $(this).closest('td').attr('id');
        if (checkInputLabelNull(id)) return;
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        $input.addClass(cssSelector);
        $(this).replaceWith($input);
        $input.width('90%');
        $input.height('90%');
        vmCommon.onMobile().do(function () {
            $input.width('80%');
        });
        $input.addClass('span-to-input-label');
        removeAllHover();
        $input.on("blur", switchToSpan);
        $input.select();

        $input.keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {

                $input.blur();
            }
        });

    };
    var switchToSpan = function () {
        var $span = $("<span>", {
            text: $(this).val()
        });
        var id = $(this).closest('td').attr('id');
        updateMarketData(id, $(this).val());
        addAllHover();
        $span.addClass(cssSelector);
        $(this).replaceWith($span);
        $span.on("click", switchToInput);
    };
    $("." + cssSelector).on("click", switchToInput);
};

Array.prototype.flatten = function () {
    if (this == null || this.length == 0)
        return [];
    return this.reduce((a, b) => a.concat(b), []);
};

vmCommon.getCultureLang = function () {
    return kLg.language === 'pm' ? 'de' : kLg.language;
};

vmCommon.exportPer = function (res, exportType) {
    var pers = res.value.Data;
    var exportOpt = res.value.Setting;
    //HEADER	
    var headerCells = [];
    headerCells.push({ value: kLg.titleNameOfOrganisation, background: "#FFFF00" });
    for (var i = 1; i < 3; i++) {
        var orgColor = i === 1 ? "#FFFF00" : "#FFE699";
        headerCells.push({ value: kLg.titleAddressCrm + " " + i, background: orgColor });
        headerCells.push({ value: kLg.textStreet, background: orgColor });
        headerCells.push({ value: kLg.textNumber, background: orgColor });
        headerCells.push({ value: kLg.textZipcode, background: orgColor });
        headerCells.push({ value: kLg.textPlace, background: orgColor });
        headerCells.push({ value: kLg.newLand, background: orgColor });
    }
    if (exportOpt.MaxPhone === 1) {
        headerCells.push({ value: kLg.titleTelephoneCrm, background: "#FFE699" });
    } else {
        for (var u = 1; u < 3; u++) {
            headerCells.push({ value: kLg.titleTelephoneCrm + " " + u, background: "#FFE699" });
        }
    }
    if (exportOpt.MaxEmail === 1) {
        headerCells.push({ value: kLg.textMail, background: "#FFE699" });
    } else {
        for (var v = 1; v < 3; v++) {
            headerCells.push({ value: kLg.textMail + " " + v, background: "#FFE699" });
        }
    }
    headerCells.push({ value: kLg.Salutation, background: "#BDD7EE" });
    headerCells.push({ value: kLg.Title, background: "#BDD7EE" });
    headerCells.push({ value: kLg.firstName, background: "#BDD7EE" });
    headerCells.push({ value: kLg.lastName, background: "#BDD7EE" });
    //headerCells.push({ value: kLg.textPosition, background: "#BDD7EE" });	
    for (var j = 1; j < 3; j++) {
        var perColor = j === 1 ? "#BDD7EE" : "#E2EFDA";
        headerCells.push({ value: kLg.titleAddressCrm + " " + j, background: perColor });
        headerCells.push({ value: kLg.Department, background: perColor });
        headerCells.push({ value: kLg.newLand, background: perColor });
        headerCells.push({ value: kLg.textStreet, background: perColor });
        headerCells.push({ value: kLg.textNumber, background: perColor });
        headerCells.push({ value: kLg.textZipcode, background: perColor });
        headerCells.push({ value: kLg.textPlace, background: perColor });
    }
    for (var m = 1; m < 3; m++) {
        headerCells.push({ value: kLg.titleTelephoneCrm + " " + m, background: "#E2EFDA" });
    }
    for (var n = 1; n < 3; n++) {
        headerCells.push({ value: kLg.textMail + " " + n, background: "#E2EFDA" });
    }
    //Question Link	
    if (exportType == vmCommon.PersonExportType.QUESTIONLINK)
        headerCells.push({ value: kLg.titleExportQuesionLink, background: "#E2EFDA" });
    var header = {
        cells: headerCells
    };
    var rows = [];
    rows.push(header);
    //ROWS	
    for (var k = 0; k < pers.length; k++) {
        var row = pers[k];
        var cells = [];
        //Organisation	
        cells.push({ value: vmCommon.cleanInvalidXmlChars(row.OrgName) });
        //Organisation address	
        for (var l = 0; l < row.OrgAdds.length; l++) {
            var oAdd = row.OrgAdds[l];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oAdd.CatAddressName) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oAdd.Street) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oAdd.Nr) });
            cells.push({ value: oAdd.Plz });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oAdd.Ort) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oAdd.CrmLandName) });
        }
        //Organisation phone	
        for (var o = 0; o < row.OrgPhones.length; o++) {
            var oPhone = row.OrgPhones[o];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oPhone.Name) });
        }
        //Organisation email	
        for (var p = 0; p < row.OrgEmails.length; p++) {
            var oEmail = row.OrgEmails[p];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(oEmail.Name) });
        }
        //Person	
        cells.push({ value: vmCommon.cleanInvalidXmlChars(row.Salutation) });
        cells.push({ value: vmCommon.cleanInvalidXmlChars(row.Title) });
        cells.push({ value: vmCommon.cleanInvalidXmlChars(row.FirstName) });
        cells.push({ value: vmCommon.cleanInvalidXmlChars(row.LastName) });
        //cells.push({ value: row.Position });	
        //Person address	
        for (var q = 0; q < row.PerAdds.length; q++) {
            var pAdd = row.PerAdds[q];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.CatAddressName) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.Department) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.Street) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.Nr) });
            cells.push({ value: pAdd.Plz });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.Ort) });
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pAdd.CrmLandName) });
        }
        //Person phone	
        for (var r = 0; r < row.PerPhones.length; r++) {
            var pPhone = row.PerPhones[r];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pPhone.Name) });
        }
        //Person email	
        for (var s = 0; s < row.PerEmails.length; s++) {
            var pEmail = row.PerEmails[s];
            cells.push({ value: vmCommon.cleanInvalidXmlChars(pEmail.Name) });
        }
        //Question link	
        if (exportType == vmCommon.PersonExportType.QUESTIONLINK)
            cells.push({ value: vmCommon.cleanInvalidXmlChars(row.QuestionLink) });
        rows.push({ cells: cells });
    }
    //COLUMN	
    var columns = [];
    var colNumber = 35 + exportOpt.MaxPhone + exportOpt.MaxEmail;
    if (exportType == vmCommon.PersonExportType.QUESTIONLINK)
        colNumber += 1;
    for (var t = 0; t < colNumber; t++) {
        columns.push({ autoWidth: true, width: 12 });
    }
    var workbook = new kendo.ooxml.Workbook({
        creator: "Stratsigner",
        sheets: [
            {
                freezePane: {
                    rowSplit: 1
                },
                title: kLg.textOrganisation,
                creator: "Stratsigner",
                date: new Date(),
                columns: columns,
                rows: rows
            }
        ]
    });
    // Create uri	
    var wUri = workbook.toDataURL();
    // Save file from uri	
    kendo.saveAs({
        dataURI: wUri,
        fileName: kLg.titlePersonExport + ".xlsx",
        proxyURL: "../api/imagebrowser/savefile"
    });
};

vmCommon.checkVisible = function (elm) {
    if (elm) {
        var rect = elm.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }
    else {
        return false;
    }
}

jQuery.fn.scrollCenter = function (elem, speed) {
    var active = jQuery(this).find(elem); // find the active element
    var activeWidth = active.width() / 2; // get active width center

    var pos = active.position().left + activeWidth; //get left position of active li + center position
    var elpos = jQuery(this).scrollLeft(); // get current scroll position
    var elW = jQuery(this).width(); //get div width
    pos = pos + elpos - elW / 2; // for center position if you want adjust then change this

    jQuery(this).animate({
        scrollLeft: pos
    }, speed == undefined ? 1000 : speed);
    return pos;
};

// http://podzic.com/wp-content/plugins/podzic/include/js/podzic.js
jQuery.fn.scrollCenterORI = function (elem, speed) {
    jQuery(this).animate({
        scrollLeft: jQuery(this).scrollLeft() - jQuery(this).offset().left + jQuery(elem).offset().left
    }, speed == undefined ? 1000 : speed);
    return this;
};

vmCommon.AddressBar = (function () {
    var _urlBase = '', _url = '', _fullUrl = '', _clientQuery = undefined, _params = {};

    function setBaseUrl() {
        _fullUrl = window.location.href;
        if (_fullUrl.indexOf('&fromdash') > -1) {

            setBaseFrom('&fromdash', _urlBase);

        } else if (_fullUrl.indexOf('&fromsm') > -1) {

            setBaseFrom('&fromsm', _urlBase);

        };
        if (_fullUrl.indexOf('&actpopup') > -1) {

            setBaseFrom('&actpopup', !!_urlBase && (_fullUrl.indexOf('&fromdash') < 0 && _fullUrl.indexOf('&fromsm') < 0));

        } else {
            if (_urlBase === '') _urlBase = _fullUrl;
            _url = '';
        };

        function setBaseFrom(strSplit, urlBase) {
            var len = _fullUrl.length,
                idx = _fullUrl.indexOf(strSplit);

            if (!urlBase) _urlBase = _fullUrl.substring(0, idx);
            _url = _fullUrl.substring(idx, len);
        }
    };
    function clientQueryGet(key) {
        if (_clientQuery !== undefined && _clientQuery !== null) {

            return _clientQuery.get(key, null);
        } else return null;
    };

    function resetParams() {
        if (_clientQuery) {
            _clientQuery.actpopupEncoded = undefined;
            _clientQuery.actpopupDecoded = undefined;
            _clientQuery.fullUrlEncoded = undefined;
            _clientQuery.urlParams = _urlBase;
            _clientQuery.params.actpopup = undefined;
        };
        _url = '';
        _fullUrl = _urlBase;
        _params = {};
    };

    return {
        Self: function () {
            this.ClientQuery.query();
            if (_urlBase === '') setBaseUrl();
            return this;
        },
        ClientQuery: {
            query: function () {
                if (_clientQuery === undefined) {
                    _clientQuery = new queryString(false, window.location.href);
                };
                return this;
            },
            getCount: function () {
                if (_clientQuery !== undefined) {
                    return _clientQuery.count ? _clientQuery.count : 0;
                } else return 0;
            },
            get: clientQueryGet,
            getFullUrlEncoded: function () {

                if (_clientQuery.fullUrlEncoded) return _clientQuery.fullUrlEncoded;
                else return _fullUrl;
            },
            getActpopup: function () {

                var actpp = clientQueryGet('actpopup');
                return actpp == null ? '' : actpp;
            },
            setActpopupEncoded: function (actpopupStr) {
                if (_clientQuery !== undefined && !this.isActpopup()) {

                    _clientQuery.actpopupEncoded = actpopupStr;
                }
            },
            updateAddressBar: function () {
                if (_clientQuery !== undefined && _clientQuery.actpopupEncoded) {

                    var url = '&actpopup=' + _clientQuery.actpopupEncoded;
                    if (_urlBase === '') setBaseUrl();
                    _clientQuery.fullUrlEncoded = _urlBase + url;
                    window.history.pushState('from vmcommon', document.title, _urlBase + url);
                }
            },
            resetAddressBar: function () {
                resetParams();

                window.history.replaceState('from vmcommon', document.title, _urlBase);
                window.history.pushState('from vmcommon', document.title, _urlBase);
                if (typeof vmGoalAction == 'object') {
                    vmGoalAction.dataservice.getUpdateUrlCloseActpopup();
                }
            },
            Decode: {
                setActpopup: function (actpopupStr) {
                    if (_clientQuery !== undefined && actpopupStr && actpopupStr !== '' && _url !== '') {
                        _clientQuery.actpopupDecoded = actpopupStr;
                        var qs = _clientQuery.actpopupDecoded;
                        var args = qs.split('&'); // parse out name/value pairs separated via &

                        // split out each name=value pair                    
                        for (var i = 0, count = args.length; i < count; i++) {
                            var pair = args[i].split('=');
                            if (pair.length > 1) {
                                var name = pair[0];
                                _params[name] = pair[1];
                            }
                        }
                    }
                },
                get: function (key) {
                    return _params[key];
                }
            },
            isActpopup: function () {
                return _fullUrl.indexOf('&actpopup') > -1;
            },
            getInt: function (key, defaultValue) {
                if (_clientQuery !== undefined) {
                    return _clientQuery.getInt(key, defaultValue);
                } else return -1;
            },
            log: function () { console.log(_urlBase, _url, _fullUrl, JSON.parse(JSON.stringify(_clientQuery)), JSON.parse(JSON.stringify(_params))) }
        }
    }
})();
vmCommon.getGaIcon = function (type, isMasterLink) {
    switch (type) {
        case vmCommon.GoalActionContentType.MainGoal:
            return isMasterLink ? "icon-target-red" : "icon-target";
        case vmCommon.GoalActionContentType.SubGoal:
            return isMasterLink ? "icon-milestone-red" : "icon-milestone";
        case vmCommon.GoalActionContentType.Action:
            return isMasterLink ? "icon-action-red" : "icon-action";
        default:
            return "";
    }
};

vmCommon.getMaxMIndex = function (lst) {
    return lst.length > 0 ? lst.map(t => t.MIndex).reduce(function (a, b) { return Math.max(a, b); }) : 0;
};

//<!-- filter property
var mFilter = mFilter || {};
mFilter.enumOperator = Object.freeze({ AND: 1, OR: 2 });
mFilter.enumFilter = Object.freeze({
    land: 1,
    region: 2,
    productGroup: 3,
    product: 4,
    market: 5,
    submarket: 6,
    person: 7,
    type: 8,
    goalCategory: 9,
    date: 10,
    actionCategory: 11,
    protocolStatus: 12,
    visibility: 13,
    field: 14,
    independency: 15,
    theme: 16,
    instrument: 17,
    advertisingMaterial: 18,
    advertiser: 19,
    timeRange: 20,
    masterGoal: 21,
    fibuKostenstellen: 22,
    landregion: 23,
    workingRange: 24,
    redirectGoal: 25,
    textsearch: 26,
    subjetThema: 27,
    supplier: 28,
    masterGoalKpi: 29,
    marketScope: 30,
    lastStatus: 31,
    customerJourney: 32,
    ShowFinishedElements: 33
});

mFilter.criteriaRole = Object.freeze({ SHOW: 26, HIDE: 27 });

mFilter.enumFilterType = Object.freeze({ OnlyGoal: 1, OnlyAction: 2, Both: 3 });
mFilter.enumFilterVisibility = Object.freeze({ ShowAll: 1, Hide: 2, Show: 3 });
mFilter.enumDate = Object.freeze({ Overdue: 1, DueToday: 2, NextTenDays: 3, OverTenDays: 4, StillOpen: 5, AlreadyFnished: 6 });
//-->

vmCommon.Mediator = (function () {

    // Storage for topics that can be broadcast or listened to
    var topics = {};

    // Subscribe to a topic, supply a callback to be executed
    // when that topic is broadcast to
    var subscribe = function (topic, fn) {

        if (!topics[topic]) {
            topics[topic] = [];
        }

        topics[topic].push({ context: this, callback: fn });

        return this;
    };

    // Publish/broadcast an event to the rest of the application
    var publish = function (topic) {

        var args;

        if (!topics[topic]) {
            return false;
        }

        var promissArr = [];

        args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0, l = topics[topic].length; i < l; i++) {

            var subscription = topics[topic][i];
            promissArr.push(Promise.resolve(subscription.callback.apply(subscription.context, args)));
        }

        return Promise.all(promissArr);
    };

    return {
        publish: publish,
        subscribe: subscribe,
        installTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };

}());

vmCommon.GetHashKey = function () {
    return new Date().getTime();
};


Array.prototype.innerJoinSimple = function (arr) {

    var rootArr = this;
    var rs = [];

    var dictCompair = {};

    for (let i = 0, l = rootArr.length; i < l; i++) {
        dictCompair[rootArr[i]] = rootArr[i];
    }

    for (let i = 0, l = arr.length; i < l; i++) {
        dictCompair[arr[i]] != null && rs.push(arr[i]);
    }

    return rs;
}

Array.prototype.sortInt = function () {
    var rootArr = this;

    if (rootArr.length > 0)
        return rootArr.sort((a, b) => a - b);
    else {
        return [];
    }
}

vmCommon.languageService = function () {
    var isLoaded = false;

    var exportToExcel = function () {
        var callback = function () {
            var rows = [];
            for (var key in kLg) {
                rows.push({ cells: [{ value: key }, { value: kLg[key] }] });
            }

            var workbook = new kendo.ooxml.Workbook({
                creator: "Stratsigner Dev",
                date: new Date(),
                sheets: [
                    {
                        name: "Language",
                        rows: rows
                    }
                ]
            });
            kendo.saveAs({
                dataURI: workbook.toDataURL(),
                fileName: "Language.xlsx"
            });
        };

        if (isLoaded) {
            callback();
        } else {
            $.getScript('/Scripts/newkendo/jszip.min.js', function () {
                callback();
            });
        }
    };

    return { exportToExcel };
}();

vmCommon.getParentComponent = function (comp, parentName) {
    let component = null;
    let parent = comp.$parent;

    while (parent && !component) {
        if (parent.$options._componentTag === parentName) {
            component = parent;
        }
        parent = parent.$parent;
    };

    return component;
};

vmCommon.getChildComponent = function (comp, childName) {
    let childs = comp.$children;

    let rs = [];
    childs.forEach(c => {
        if (c.$options._componentTag === childName) {
            rs.push(c);
        } else {
            rs = rs.concat(vmCommon.getChildComponent(c, childName));
        }
    });

    return rs;
};

vmCommon.TexEditor = (function () {
    var EditorValue = '';
    var SelectorEditor;
    var SelectorFromEdit;
    var EditorType = {
        Status: "LastStatus",
        NoPlaceholder: "NoPlaceholder"
    };
    var PlhForFormatPopup = '';

    var AutoSaveTimmer = 30 * 1000; // 10K miliseconds == 10 seconds
    var TimeoutId;
    var IsUpdateFromTextEditor = false;

    String.prototype.isWhiteSpace = function () {
        var value = this.toString();
        return /^\s*$/.test(value);
    };

    function isEditorType(value, strType) {
        value = value.trim();
        if (strType != undefined) {
            return value == strType;
        };
        switch (value) {
            case EditorType.Status:
            case EditorType.NoPlaceholder:
                return true;
            default:
                return false;
        }
    };
    function isContainPlaceholder(str, placeholder) {
        if (placeholder === undefined || placeholder.isWhiteSpace()) return false;
        if (str === placeholder) {
            return true;
        };
        var regex = new RegExp(placeholder, 'g');
        var isContainPlaceHld = regex.test(str);

        return isContainPlaceHld;
    };
    function hasHtmlTag(text) {
        if (!text) return false;
        const regex = /(\<\w*)((\s\/\>)|(.*\<\/\w*\>))/g;
        text += '';
        return text.match(regex) !== null;
    };
    function stripHtml(html) {
        if (typeof html != 'string') return '';
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };
    function setUiEmptyText(kendoEditor) {
        if (!kendoEditor) return;

        setStyleEmpty(kendoEditor.body);
        scaleHeightBy(kendoEditor, 72);
    };
    function setStyleEmpty(htmlElement) {
        htmlElement.style.color = 'rgb(114,114,114)';
        htmlElement.style.height = '72px';
        htmlElement.className = "data-placeholder";
    };
    function scaleHeightBy(kendoEditor, height) {
        if (!height) height = '';
        if (!kendoEditor) return;
        var $wrapperTable = kendoEditor.wrapper;
        var $iframe = kendoEditor.textarea.closest('.k-editable-area').find('.k-content').first();

        height = height + 'px';
        $wrapperTable.css({ 'height': height });
        $iframe.css({ 'height': height });
    };
    function removeColorAndClassName(kendoEditor) {
        if (!kendoEditor) return;

        kendoEditor.body.style.color = '';
        kendoEditor.body.className = '';
    };

    function getHeightForEditorInEdit(body, minHeight, maxHeight) {
        let tmp = document.createElement("DIV");
        let clss = 'dainbTempFromKendoEditor2021-02-23-DateNow';
        var id = clss + Date.now();
        tmp.setAttribute("id", id);
        tmp.className = clss;
        tmp.innerHTML = body.innerHTML;
        $('body').append(tmp);
        var height = tmp.offsetHeight;
        tmp.style.display = "none";

        minHeight = minHeight ? minHeight : 72;
        maxHeight = maxHeight ? maxHeight : 236;
        height = height < minHeight ? minHeight : (height > maxHeight ? maxHeight : height);
        $('.' + clss).remove();
        return height;
    };
    function getValueLimit(val, max) {
        return val > max ? max : val;
    };
    function getIntCondition(html, valMin, valMax, valHasImg, valHasTable, valHasFontSize) {
        valHasImg = valHasImg || 600;
        valHasTable = valHasTable || 800;
        valHasFontSize = valHasFontSize || 700;
        var regexImg = /<img.*?src="(.*?)"[^\>]+>/g;    //check image tag (<img...)
        var hasImg = regexImg.test(html);
        var val = valMin || 50;

        if (hasImg) {
            val = valMin > valHasImg ? getValueLimit(valMin, valMax) : getValueLimit(valHasImg, valMax);

            var regexImgFloatRight = /<img.*?style="(.*?float(.*?right))/g;
            if (regexImgFloatRight.test(html)) {
                val = getValueLimit(valHasFontSize, valMax);
            }
        }

        var regexTable = /<\/?(table|td|th|tr|tfoot|thead|tbody)+>?/g;  // check table tag (<table...)
        var hasTable = regexTable.test(html);
        if (hasTable) {
            val = valMin > valHasTable ? getValueLimit(valMin, valMax) : getValueLimit(valHasTable, valMax);
        } else if (!hasImg) {
            // check font size >= 5pt (font-size: large; font-size: x-large; font-size: xx-large;)
            var regexFontSize = /(font-size[\s]*:[\s]*)([xxx-]*large)/g;
            var regexFontSizePx = /(font-size[\s]*:[\s]*)([3-9]\d+px)/g;       // font-size >= 30px
            if (regexFontSize.test(html) || regexFontSizePx.test(html)) {
                val = valMin > valHasFontSize ? getValueLimit(valMin, valMax) : getValueLimit(valHasFontSize, valMax);
            };
        }
        return val;
    };
    function setDataBackToFormAddEdit(bodySender, $selectorFromEdit) {
        var newValue = bodySender.body.innerHTML; // bodySender.value() trả về sai text nếu là tiếng đức
        if (newValue.indexOf('<img') > -1 || newValue.indexOf('<table') > -1 || hasHtmlTag(newValue)) {     // use when insert img from tool
            removeColorAndClassName($selectorFromEdit);
            scaleHeightBy($selectorFromEdit, 50);
        } else {
            if (bodySender.body.innerText.isWhiteSpace()) {
                newValue = PlhForFormatPopup;
                if (PlhForFormatPopup) {
                    setUiEmptyText($selectorFromEdit);
                } else {
                    scaleHeightBy($selectorFromEdit, 50);
                }
            } else {
                removeColorAndClassName($selectorFromEdit);
            };
        };

        if (EditorValue != newValue) {
            if (SelectorFromEdit[0] == '#') {
                vmEdit(true);
            }
        };

        $selectorFromEdit.value(newValue);
        $selectorFromEdit.update();

        return newValue;
    };
    function vmEdit(isModelChange) {
        var isEdit = false, roleEdit = true;
        var folderFromCreatedDate = 'dainb';
        var cDate;
        var id = vmCommon.emptyGuid,
            type = 'dainb';

        if (typeof vmEditGoal !== 'undefined' && vmEditGoal instanceof Object && vmGoalAction.popEditMainGoal) {
            if (isModelChange === true) {
                vmEditGoal.modelChanged = isModelChange;
            };

            if (vmGoalAction.goalOptions && vmGoalAction.goalOptions.IsEdit) {
                isEdit = vmGoalAction.goalOptions.IsEdit;
            }
            
            cDate = vmEditGoal.viewModel.goal.CreatedDate;
            if (cDate == undefined) {
                cDate = new Date();           // form add new Goal
                vmEditGoal.viewModel.goal.CreatedDate = cDate;
            };

            if (isEdit) {
                id = vmEditGoal.viewModel.goal.Id;
                type = vmEditGoal.viewModel.goal.ParentId == null ? vmCommon.enumType.Goal : vmCommon.enumType.SubGoal;
            };
            roleEdit = vmEditGoal.viewModel.roleEdit;
        };
        if (typeof vmEditAction !== 'undefined' && vmEditAction instanceof Object && vmGoalAction.popEditAction) {
            if (isModelChange === true) {
                vmEditAction.modelChanged = isModelChange;
            };

            if (vmGoalAction.actionOptions && vmGoalAction.actionOptions.isEdit) {
                isEdit = vmGoalAction.actionOptions.isEdit
            }
            
            cDate = vmEditAction.viewModel.action.CreatedDate;
            if (cDate == undefined) {
                cDate = new Date();           // form add new Action
                vmEditAction.viewModel.action.CreatedDate = cDate;
            }

            if (isEdit) {
                id = vmEditAction.viewModel.action.Id;
                type = vmCommon.enumType.Action;
            };
            roleEdit = vmEditAction.viewModel.roleEdit;
        }

        if (typeof cDate == "string") {
            cDate = new Date(+cDate.replace('/Date(', '').replace(')/', ''));       // +cDate... (convert to integer)
        }

        if (cDate != undefined && Object.prototype.toString.call(cDate) === "[object Date]") {
            folderFromCreatedDate = `${cDate.getUTCFullYear()}_${cDate.getUTCMonth() + 1}_${cDate.getUTCDate()}_${cDate.getUTCHours()}_${cDate.getUTCMinutes()}_${cDate.getUTCSeconds()}`;
        }

        return {
            Id: id,
            Type: type,
            IsEdit: isEdit,
            Folder: folderFromCreatedDate,
            RoleEdit: !roleEdit
        }
    };
    function vmEditCrm(createdDate) {
        var isEdit = true, roleEdit = true;
        var folderFromCreatedDate = 'dainb';
        var cDate = Object.prototype.toString.call(createdDate) === "[object Date]" ? createdDate : new Date();
        folderFromCreatedDate = `${cDate.getUTCFullYear()}_${cDate.getUTCMonth() + 1}_${cDate.getUTCDate()}_${cDate.getUTCHours()}_${cDate.getUTCMinutes()}_${cDate.getUTCSeconds()}`;
        var id = vmCommon.emptyGuid,
            type = 'dainb';
        if (typeof SelectorFromEdit == 'string' && SelectorFromEdit.includes(`-crm-id="-`)) {
            isEdit = false;
        }
        return {
            Id: id,
            Type: type,
            IsEdit: isEdit,
            Folder: folderFromCreatedDate,
            RoleEdit: roleEdit
        }
    }
    function saveDataInFormEdit(fncSaveInCrm) {
        var value = setDataBackToFormAddEdit(
            $('#' + SelectorEditor).data('kendoEditor'),
            $(SelectorFromEdit).data('kendoEditor')
        );

        //SAVE DATA in Goal/Action form
        if (SelectorFromEdit[0] == '#') {
            if (typeof vmEditGoal !== 'undefined' && vmEditGoal instanceof Object) {
                vmEditGoal.viewModel.saveFromFormatForm(SelectorFromEdit.substring(1), value);
                IsUpdateFromTextEditor = true;
            };
            if (typeof vmEditAction !== 'undefined' && vmEditAction instanceof Object) {
                vmEditAction.viewModel.saveFromFormatForm(SelectorFromEdit.substring(1), value);
                IsUpdateFromTextEditor = true;
            };
        } else if (fncSaveInCrm) {  //SAVE DATA in crm Organisation form
            fncSaveInCrm(value);
        }
        
    };
    
    function clearAutoSave() {
        if (TimeoutId) {
            clearInterval(TimeoutId);
            TimeoutId = undefined;
        }
    };
    function setAutoSave(fncSaveInCrm) {
        if (TimeoutId == undefined) {
            TimeoutId = setInterval(function () {

                saveDataInFormEdit(fncSaveInCrm);

            }, AutoSaveTimmer);
        }
    };
    function focusAndMoveCursorToEndChar(selector) {
        var editor = $(selector).data("kendoEditor");
        editor.focus();
        var range = editor.createRange();
        range.selectNodeContents(editor.body);
        range.collapse(false);
        editor.selectRange(range);
    };

    return {
        Type: EditorType,
        setEditorObserver: function (idSelectorArr) {
            idSelectorArr.forEach(selectorStr => {
                var $selector = $(selectorStr);
                var bodySender = $selector.data("kendoEditor");
                var body = bodySender.body;
                var height = getHeightForEditorInEdit(body, 72);

                scaleHeightBy(bodySender, height);
            });

            if ($('.dnbStatusKendoEditor').length > 0) {
                $('.dnbStatusKendoEditor').each(function () {
                    var $selector = $(this);
                    var bodySender = $selector.data("kendoEditor");
                    var body = bodySender.body;
                    var height = getHeightForEditorInEdit(body, 60);

                    scaleHeightBy(bodySender, height);
                });
            };
        },
        Placeholder: {
            setAttr: function ($selector, textPlaceholder) {
                var bodySender = $selector.length > 0 ? $selector.data("kendoEditor") : undefined;
                var data, body;
                if (bodySender != undefined) {
                    data = bodySender.body.innerText; // bodySender.value() trả về sai text nếu là tiếng đức
                    body = bodySender.body;
                    bodySender.toolbar.element.parent().height(0);
                    if (body && textPlaceholder) {
                        if (!isEditorType(textPlaceholder)) {
                            body.setAttribute("data-placeholder", textPlaceholder);
                            if (!data || isEditorType(textPlaceholder, data)) {
                                setStyleEmpty(body);
                            }
                        };
                        body.style.backgroundColor = '#F7F7F7';
                        body.style.fontSize = '13px';
                    }
                    if (isEditorType(textPlaceholder, EditorType.Status)) {                    // LastStatuses
                        var $wrapperTable = bodySender.wrapper;
                        var $header = $wrapperTable.find('tr[role="presentation"]');
                        if ($header.length < 1) {
                            $header = $wrapperTable.find('.k-editor-toolbar-wrap');
                        }
                        $header.css({ 'display': 'none' });
                        bodySender.textarea.closest('.k-editable-area').css({ 'padding': '0' });
                        scaleHeightBy(bodySender, 50);
                    };
                }


                return {
                    setInnerHTML: function () {
                        if (body) {
                            if (!data) {
                                if (!isEditorType(textPlaceholder)) {
                                    body.innerHTML = textPlaceholder;
                                    setUiEmptyText($selector.data("kendoEditor"));
                                };
                                if (!isEditorType(textPlaceholder, EditorType.Status)) {
                                    scaleHeightBy($selector.data("kendoEditor"), 72);
                                }
                            } else {
                                var height = 72;
                                if (!isEditorType(textPlaceholder) || isEditorType(textPlaceholder, EditorType.NoPlaceholder)) {
                                    height = getHeightForEditorInEdit(body, 72);
                                };
                                if (isEditorType(textPlaceholder, EditorType.Status)) {
                                    height = getHeightForEditorInEdit(body, 60);
                                };

                                scaleHeightBy($selector.data("kendoEditor"), height)
                            }
                        };
                        return function (isnotRoleEdit) {
                            if (isnotRoleEdit) {
                                $('.dnbTextAreaEditor').addClass('dnbTextEditorViewRole');
                                body.setAttribute('contenteditable', false);
                            }
                        }
                    }
                };
            },
            getHtmlFrom: function (bodySender) {
                bodySender = bodySender || {};
                var body = bodySender.body || { getAttribute: function () { } };
                var plhd = body.getAttribute("data-placeholder") || '';
                var value = body.innerText || '';

                return {
                    checkData: function () {
                        var hasData = body.className != "data-placeholder";

                        if (body && !hasData) {

                            if (isContainPlaceholder(value, plhd)) {

                                setUiEmptyText(bodySender);

                                bodySender.value(plhd);
                                bodySender.update();
                            } else {

                                removeColorAndClassName(bodySender);
                            }
                        }
                    },
                    checkValue: function () {                   // onKeyUpChangeValKendoEditor

                        scaleHeightBy(bodySender, getHeightForEditorInEdit(bodySender.body, 72));

                        if (value.isWhiteSpace() && plhd) {
                            setUiEmptyText(bodySender);

                            bodySender.value(plhd);
                            bodySender.update();
                            return '';
                        } else {
                            return value;
                        };
                    },
                    preCheckValue: function () {            // onKeyDownChangeValKendoEditor
                        if (!value.isWhiteSpace()) {
                            if (isContainPlaceholder(value, plhd)) {
                                bodySender.value('');
                                bodySender.update();
                            };

                            removeColorAndClassName(bodySender);
                        }
                    }
                }
            }
        },
        wasDataChanged: function () { return IsUpdateFromTextEditor; },

        getCssFrom: function ($selector) {              // use for tooltip
            var html = $selector.html();
            var width = $selector.width();
            if ($selector.find('table').length > 0) {
                $selector.find('table').each(function () {
                    if ($(this).width() > width) {
                        width = $(this).width();
                    }
                });
            };
            var windowWidth = $(window).width();
            var minWidth = getIntCondition(html, width, windowWidth, 600, 800, 700);

            if (width > windowWidth) {
                width = windowWidth - 10;
                if (minWidth > width) {
                    minWidth = width;
                }
            } else {
                var hasManyText = $selector.text().length > 300;
                if (hasManyText) {
                    minWidth = getValueLimit(800, windowWidth);
                }
            }

            return {
                'width': width + 'px',
                'min-width': minWidth + 'px'
            }
        },

        getValueFromEditor: function ($selector) {
            var bodySender = $selector.data('kendoEditor') || {};
            var body = bodySender.body || { getAttribute: function () { } };
            var plhd = body.getAttribute("data-placeholder") || '';
            var value = body.innerText || '';
            var innerHtml = body.innerHTML;

            if (innerHtml.indexOf('<img') > -1 || innerHtml.indexOf('<table') > -1 || hasHtmlTag(innerHtml)) {
                value = innerHtml;
            } else if (isContainPlaceholder(value, plhd) || value.isWhiteSpace()) {
                value = '';
            }
            return value;
        },

        stripHtml: function (data) {
            if (data == null || data == undefined) {
                return '';
            };

            var str = stripHtml(data);
            return str.trim();
        },
        hasImg: function (html) {
            var regexImg = /<img.*?src="(.*?)"[^\>]+>/g;    //check image tag (<img...)
            var hasImg = regexImg.test(html);
            return hasImg;
        },
        isHtmlFomat: hasHtmlTag,
        getSelectorEditor: function () { return SelectorEditor; },
        //getSelectorFromEdit: function () { return SelectorFromEdit; },
        setSelectorFromEdit: function (selector) {
            if (selector && typeof selector == "string") {
                SelectorFromEdit = selector;
            }
        },
        addWindowEditor: function (e, fncSaveInCrm, fncCloseInCrm, createdDate) {

            if (typeof e == 'string') {     // crm 
                SelectorFromEdit = `.dnbTextAreaEditor${e} textarea[data-role="editor"]`;
            } else {        // goal/action
                var $button = $(e), $textEditor;
                SelectorFromEdit = $button.attr('data-id');
                SelectorFromEdit = '#' + SelectorFromEdit;
            } 

            $textEditor = $(SelectorFromEdit);
            var bodySender = $textEditor.data('kendoEditor');
            if (!bodySender) {
                return;
            }
            var body = bodySender.body;

            PlhForFormatPopup = body.getAttribute("data-placeholder") || '';

            var width = parseInt($(window).width() * 0.60);
            if (width < 1360) { width = 1360; };

            var height = ($(window).height() - 98);
            SelectorEditor = 'dnb-textarea-editor-' + Date.now();

            EditorValue = bodySender.body.innerHTML; // hàm bodySender.value() trả về sai text nếu là tiếng đức
            if (isContainPlaceholder(bodySender.body.innerText, PlhForFormatPopup)) {
                EditorValue = '';
            };

            var vm_Edit = {};
            if (SelectorFromEdit[0] == '#') {
                vm_Edit = vmEdit();
                fncSaveInCrm = vm_Edit.IsEdit;
            } else {
                vm_Edit = vmEditCrm(createdDate);
            }

            var style_CssView = !vm_Edit.RoleEdit ? `div#dnb-w-${SelectorEditor}:after {content: ''; position: absolute; width: 100%; display: block; height: 100%; opacity: 0; top: 0; left: 0;}` : '';
            var textAreaEditor = `<div id="dnb-w-${SelectorEditor}">               
               <style> 
                #dnb-w-${SelectorEditor} .k-colorpicker .k-select {opacity: 0;display: block;}
                .k-colorpicker .k-tool-icon .k-selected-color, .k-colorpicker .k-tool-icon .k-selected-color {height:3px !important}
                .k-window-titlebar .k-window-action[aria-label="Save"] {background-color: #33A6DC !important;}
                .k-window-titlebar .k-window-action[aria-label="Save"][disabled] {border-color: #c3c3c3 !important;color: #c3c3c3 !important;pointer-events: none;}
                #dnb-w-${SelectorEditor} ul.k-editor-toolbar[aria-controls="${SelectorEditor}"] {padding-right:99px;text-align:start;}
                .k-editor-dialog.k-popup-edit-form.k-window-content.k-content {padding: 1em 0 !important;}
                .k-editor-dialog.k-popup-edit-form.k-window-content.k-content.k-filebrowser-dialog .k-icon.k-i-plus {vertical-align: text-bottom;}
                ${style_CssView}
               </style>
                        <div style="text-align: center;">
                          <textarea id="${SelectorEditor}" 
                            rows="10" cols="30" 
                            aria-label="editor" 
                            style="width:100%; height:${height-2}px">  
                          </textarea>
                          </div>
                        </div>`;
            $(document.body).append(textAreaEditor);
            void function getEditorLanguage() {
                $(`#editorscript${SelectorEditor}`).remove();
                var langUrl = `/Scripts/editors/kendo.messages.${kLg.languageCode}.min.js`;
                $("head").append($(`<script id="editorscript${SelectorEditor}"><\/script>`).attr("src", langUrl));
            }();


            function kendoWindow(selector) {
                var act = !!fncSaveInCrm && vm_Edit.RoleEdit ? ["Save", "Close"] : ["Close"];
                $(selector).kendoWindow({
                    actions: act,
                    modal: true,
                    draggable: true,
                    resizable: true,
                    minWidth: 600, minHeight: 456,
                    width: width + 'px', height: height + 'px',
                    title: kLg.FormatEditor, // + (vm_Edit.RoleEdit ? '' : ` (${kLg.roleView})`),
                    resize: function () {
                        var windowHeight = this.wrapper.height();
                        $('#' + SelectorEditor).data("kendoEditor").wrapper.height(windowHeight);
                    },
                    open: function () {
                        
                        if (vmCommon.getCurrentBrowser() == vmCommon.Browser.FireFox) {
                            this.wrapper.css({
                                'top': '32.5px'
                            });
                            this.element.css({
                                'height': 'auto', 'scrollbar-width': 'none'
                            });
                        }
                        
                    }
                });

                return $(selector).data("kendoWindow");
            };

            var $_kWd = kendoWindow(`#dnb-w-${SelectorEditor}`);
            $_kWd.center().open().center();

            void function setCSSAndBtnSave() {
                var $btnSave = $(`#dnb-w-${SelectorEditor}_wnd_title`).closest('.k-window-titlebar.k-header').find('.k-window-actions').children('a[aria-label="Save"]').first();
                $btnSave.css({
                    'width': 'auto', 'height': '30px',
                    'display': 'inline-flex',
                    'align-items': 'center',
                    'margin-right': '5px',
                    'padding-right': '8px', 'padding-left': '5px',
                    'z-index': '999', 'position': 'absolute',
                    'top': '40px', 'right': '-3px'
                });
                $btnSave.append(`<span style="margin-left: 5px;font-size: 14px;">${kLg.Save}</span>`);
                $btnSave.attr('disabled', true);
                
            }();

            var accountId = vm_Edit.IsEdit ? vmUser.currentAccount.Id : 0;      // 0 is add form
            var assignTxt = `accid=${accountId}&aid=${vm_Edit.Id}&astype=${vm_Edit.Type}`;

            $('#' + SelectorEditor).kendoEditor({
                isEnter: false,
                tools: [
                    "bold",
                    "italic",
                    "underline",
                    "strikethrough",
                    "justifyLeft",
                    "justifyCenter",
                    "justifyRight",
                    "justifyFull",
                    "insertUnorderedList",
                    "insertOrderedList",
                    "indent",
                    "outdent",
                    "createLink",
                    "unlink",
                    "insertImage",
                    "createTable",
                    "addRowAbove",
                    "addRowBelow",
                    "addColumnLeft",
                    "addColumnRight",
                    "deleteRow",
                    "deleteColumn",
                    "viewHtml",
                    "formatting",
                    "cleanFormatting",
                    {
                        name: "fontName",
                        items: [
                            { text: "Andale Mono", value: "Andale Mono" },
                            { text: "Arial", value: "Arial" },
                            { text: "Arial Black", value: "Arial Black" },
                            { text: "Book Antiqua", value: "Book Antiqua" },
                            { text: "Comic Sans MS", value: "Comic Sans MS" },
                            { text: "Courier New", value: "Courier New" },
                            { text: "Georgia", value: "Georgia" },
                            { text: "Helvetica", value: "Helvetica" },
                            { text: "Impact", value: "Impact" },
                            { text: "Symbol", value: "Symbol" },
                            { text: "Tahoma", value: "Tahoma" },
                            { text: "Terminal", value: "Terminal" },
                            { text: "Times New Roman", value: "Times New Roman" },
                            { text: "Trebuchet MS", value: "Trebuchet MS" },
                            { text: "Verdana", value: "Verdana" },
                        ]
                    },
                    {
                        name: "fontSize",
                        items: [
                            { text: "7", value: "9px" },
                            { text: "8", value: "11px" },
                            { text: "9", value: "12px" },
                            { text: "10", value: "13px" },
                            { text: "11", value: "15px" },
                            { text: "12", value: "16px" },
                            { text: "13", value: "17px" },
                            { text: "14", value: "19px" },
                            { text: "15", value: "21px" },
                            { text: "18", value: "24px" },
                            { text: "20", value: "26px" },
                            { text: "24", value: "32px" },
                            { text: "30", value: "40px" }
                        ]
                    },
                    "foreColor",
                    "backColor",
                    {
                        name: "zoomIn",     // name and icon
                        tooltip: kLg.ZoomIn,
                        exec: function zoomIn(e) {
                            var body_Sender = $(this).data('kendoEditor');  // $('#' + SelectorEditor).data('kendoEditor');
                            var zoomValue = getZoomValue(body_Sender);
                            zoomValue += 0.25;
                            zoom(body_Sender, zoomValue);
                        }
                    },
                    {
                        name: "zoomOut",     // name and icon
                        tooltip: kLg.ZoomOut,
                        exec: function zoomOut(e) {
                            var body_Sender = $(this).data('kendoEditor'); // $('#' + SelectorEditor).data('kendoEditor');
                            var zoomValue = getZoomValue(body_Sender);
                            if (zoomValue > 0.25) {
                                zoomValue -= 0.25;
                            }
                            zoom(body_Sender, zoomValue);
                        }
                    },
                    {
                        name: "zoom",     // name and icon
                        tooltip: kLg.ZoomReset,
                        exec: zoomReset
                    }
                ],
                keyup: function (e) {
                    if (vm_Edit.RoleEdit) {
                        if (e.keyCode == 13) {		// enterKey
                            e.sender.options.isEnter = true;
                        } else {
                            e.sender.options.isEnter = false;
                        }

                        enableAutoSaveAndBtn(e);
                    }
                },
                paste: function (e) { 
                    if (vm_Edit.RoleEdit) {
                        if (!e.sender.options.isEnter &&
                            (e.html.indexOf('<h6 class=\"\"><') == 0 || e.html.indexOf('<h5 class=\"\"><') == 0 || e.html.indexOf('<h4 class=\"\"><') == 0 ||
                            e.html.indexOf('<h3 class=\"\"><') == 0 || e.html.indexOf('<h2 class=\"\"><') == 0 || e.html.indexOf('<h1 class=\"\"><') == 0)
                        ) {
                            e.html = $(e.html).text();
                        }

                        enableAutoSaveAndBtn(e);
                    }
                },
                imageBrowser: {
                    messages: {
                        dropFilesHere: "Drop files here",
                        overwriteFile: null
                    },
                    schema: {
                        model: {
                            fields: {
                                name: { field: "Name" },
                                type: { field: "Type" },
                                size: { field: "Size" }
                            }
                        }
                    },
                    transport: {
                        read: {
                            url: "../api/imagebrowser/getdata?pid=" + projectId + "&crfol=" + (vm_Edit.Folder || '')
                        },
                        destroy: function (res) {
                            $.ajax({
                                type: "GET",
                                url: "../api/imagebrowser/destroy?crfol=" + (vm_Edit.Folder || '') + "&name=" + res.data.Name,
                                success: function (res) {
                                    $('.k-loading-mask').hide();
                                }
                            });
                            $("#k-editor-image-url").val("");
                        },
                        thumbnailUrl: function (path, name) {
                            return document.location.origin + "/ImgBrowser/Thumbnail/" + (vm_Edit.Folder ? vm_Edit.Folder + "/" : '') + name;
                        },
                        uploadUrl: `../api/imagebrowser/upload?pid=${projectId}&crfol=${vm_Edit.Folder || ''}&${assignTxt}`,
                        imageUrl: function (name) {
                            return document.location.origin + "/ImgBrowser/" + (vm_Edit.Folder ? vm_Edit.Folder + '/' : '') + name;
                        }
                    }
                },
                execute: function onExecute(e) {

                    switch (e.name) {
                        case "zoomin":
                        case "zoomout":
                        case "zoom":

                            break;
                        case "tablewizardinsert":
                            setTimeout(function () {
                                $('.k-editor-table-wizard-dialog').find('.k-button.k-primary.k-dialog-ok').on('click', function () {
                                    enableAutoSaveAndBtn();
                                });
                            }, 2);
                            break;
                        case "createlink":
                            setTimeout(function () {
                                $('.k-dialog-insert.k-button.k-primary').on('click', function () {
                                    enableAutoSaveAndBtn();
                                });
                            }, 2);
                            break;
                        case "viewhtml":
                            setTimeout(function () {
                                $('.k-viewhtml-dialog').find('.k-dialog-update.k-button.k-primary').on('click', function () {
                                    enableAutoSaveAndBtn();
                                });
                            }, 2);
                            break;
                        case "insertimage":
                            setTimeout(function () {
                                var $element = e.command._imageBrowser.element;
                                var $imgBrsw = $element.closest('.k-edit-form-container');
                                $imgBrsw.children('.k-edit-buttons').find('.k-dialog-insert').on('click', function () {
                                    if ($('#k-editor-image-url').length < 1) {
                                        enableAutoSaveAndBtn();
                                    }
                                });

                                if (vm_Edit.IsEdit) {
                                    var $inputFile = $('.k-editor-dialog.k-popup-edit-form.k-window-content.k-content.k-filebrowser-dialog .k-dropzone .k-upload-button input[data-role=upload]');
                                    var upload = $inputFile.getKendoUpload();
                                    //console.log($inputFile, upload);
                                    upload.setOptions({
                                        //complete: function onComplete(e) { },
                                        success: function (e) {
                                            void function setUIForEditForm() {
                                                var $icEmpty = $('#iconEmpty');
                                                if ($icEmpty.length > 0) {
                                                    $icEmpty.removeClass('icon-folder-white');
                                                    $icEmpty.addClass('icon-folder-full-white');
                                                }
                                            }();
                                        }
                                    });
                                } else {
                                    $('.k-editor-dialog.k-popup-edit-form.k-window-content.k-content.k-filebrowser-dialog .k-toolbar-wrap').hide();
                                }

                            }, 2);
                            break;
                        default:
                            enableAutoSaveAndBtn();
                            break;
                    }

                }
            });

            $('#' + SelectorEditor).data("kendoEditor").value(EditorValue); // use setvalue to prevent < or > characters (open/close html tag) in EditorValue

            if (vm_Edit.RoleEdit && vm_Edit.IsEdit) {
                $_kWd.wrapper.find('a.k-button.k-bare.k-button-icon.k-window-action[aria-label="Save"]').click(function (e) {   //[Save] button: Write after text editor init
                    $(this).attr('disabled', true);

                    saveDataInFormEdit(fncSaveInCrm);
                        
                    clearAutoSave();

                    e.preventDefault();
                });
            };

            $_kWd.wrapper.find('a.k-button.k-bare.k-button-icon.k-window-action[aria-label="Close"]').click(function (e) {  //close [X] button: Write after text editor init
                var bodySender = $('#' + SelectorEditor).data('kendoEditor');

                if (!!bodySender) {
                    var $selectorFromEdit = $(SelectorFromEdit).data('kendoEditor');
                    
                    setDataBackToFormAddEdit(bodySender, $selectorFromEdit);
                    var heght = getHeightForEditorInEdit($selectorFromEdit.body, 72);
                    if ($(SelectorFromEdit).hasClass('dnbStatusKendoEditor')) {
                        heght = getHeightForEditorInEdit($selectorFromEdit.body, 60);
                    };
                    scaleHeightBy($selectorFromEdit, heght);

                    if (fncCloseInCrm) {
                        var newValue = bodySender.body.innerHTML; // bodySender.value() trả về sai text nếu là tiếng đức
                        fncCloseInCrm(newValue);
                    }

                    focusAndMoveCursorToEndChar(SelectorFromEdit);
                    bodySender.destroy();
                };

                clearAutoSave();
                $(`#dnb-w-${SelectorEditor}`).data("kendoWindow").destroy();
                $(`#dnb-w-${SelectorEditor}`).remove();
                $(`#editorscript${SelectorEditor}`).remove();
                SelectorEditor = undefined;
                SelectorFromEdit = undefined;
                EditorValue = ''; PlhForFormatPopup = '';

                e.preventDefault();
            });

            if (vm_Edit.RoleEdit) {
                focusAndMoveCursorToEndChar('#' + SelectorEditor);
                if (vmCommon.getCurrentBrowser() == vmCommon.Browser.Chrome) {      // bug 19635
                    $(`#dnb-w-${SelectorEditor}`).css({ 'overflow': 'hidden' });
                }
            } else {
                setTimeout(function () {
                    $('#' + SelectorEditor).data("kendoEditor").body.setAttribute('contenteditable', false);
                }, 111);
            }

            function enableAutoSaveAndBtn(e) {
                //console.log("keyup : keyCode = ", e.keyCode);
                var $dnbEditorBtnSave = $(`#dnb-w-${SelectorEditor}`).data("kendoWindow").wrapper.find(".k-i-save").parent();
                if ($dnbEditorBtnSave.length > 0) {
                    $dnbEditorBtnSave.attr('disabled', false);
                };
                setAutoSave(fncSaveInCrm);
            };
            function zoom(bodySender, zoomValue) {      // zoomValue: 0.25 -> 5
                zoomValue = zoomValue || 1;
                if (zoomValue == 1) {
                    zoomReset();
                } else {
                    bodySender.body.style.left = '0';
                    bodySender.body.style.transformOrigin = 'top left';
                    var minZoom = 0.25,
                        maxZoom = 5;
                    if (zoomValue <= minZoom) {
                        zoomValue = minZoom;
                    } else if (zoomValue >= maxZoom) {
                        zoomValue = maxZoom;
                    };
                    var width = 100 / zoomValue;
                    bodySender.body.style.transform = `scale(${zoomValue})`;
                    bodySender.body.style.width = width + '%';
                }
            };
            function getZoomValue(bodySender) {
                var width = bodySender.body.style.width;
                if (width == '' || width == undefined) {
                    width = 100;
                } else {
                    if (typeof width == "string") {
                        width = parseFloat(width);
                        width = width.toFixed(2);
                    }
                }

                var zoomValue = (100 / parseFloat(width));
                return zoomValue;
            };
            function zoomReset(e) {
                var body_Sender = $('#' + SelectorEditor).data('kendoEditor');
                body_Sender.body.style.left = '';
                body_Sender.body.style.transformOrigin = '';
                body_Sender.body.style.transform = '';
                body_Sender.body.style.width = '';
            }

        }
    }
})();

vmCommon.groupBy = function (list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
};

vmCommon.monthDiff = function (start, end) {
    if (start == null || end == null) return;

    var startYear = start.getFullYear();
    var endYear = end.getFullYear();

    var months = [];

    for (var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 11 : end.getMonth();
        var startMon = i === startYear ? start.getMonth() : 0;
        for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
            var month = j + 1;
            //var displayMonth = month < 10 ? '0' + month : month;
            months.push({ Year: i, Month: month});
        }
    }

    return months;
};

Date.prototype.dayOfWeek = function (start, end) {
    var max = 7;
    var count = 1;

    var temp = new Date(this.getFullYear(), this.getMonth(), this.getDate());

    var week = this.getWeek();
    for (var i = 1; i <= max; i++) {
        var futureDate = new Date(this.getFullYear(), this.getMonth(), this.getDate()); futureDate.addDays(i);
        var pastDate = new Date(this.getFullYear(), this.getMonth(), this.getDate()); pastDate.addDays(-i);

        if (vmCommon.compareDate2(futureDate, start) >= 0 && (end == null || vmCommon.compareDate2(futureDate, end) <= 0)) {
            var tempF = futureDate.getWeek();
            if (week == tempF) count++;
        }

        if (vmCommon.compareDate2(pastDate, start) >= 0 && (end == null || vmCommon.compareDate2(pastDate, end) <= 0)) {
            var tempP = pastDate.getWeek();
            if (week == tempP) count++;
        }
    }

    return count;
};

Date.prototype.dayOfMonth = function (start, end) {
    var count = 0;
    var year = this.getFullYear();
    var month = this.getMonth();
    var days = new Date(year, month + 1, 0).getDate();

    if (start == null && end == null) return days;

    for (var i = 1; i <= days; i++) {
        var date = new Date(year, month, i);
        if (vmCommon.compareDate2(date, start) >= 0 && (end == null || vmCommon.compareDate2(date, end) <= 0))
            count++;
    }

    return count;
};

vmCommon.getSizeFromHTMLText = function (htmlText) {
    let tmp = document.createElement("DIV");
    let clss = 'dainbTempToGetSize2021-06-23-DateNow';
    var id = clss + Date.now();
    tmp.setAttribute("id", id);
    tmp.style.display = 'inline-block';
    tmp.className = clss;
    tmp.innerHTML = htmlText;
    $('body').append(tmp);
    var height = tmp.offsetHeight;
    var width = tmp.offsetWidth;
    $('.' + clss).remove();
    return {
        width: width, height: height
    }
};

Number.prototype.round = function (count = 2) {
    if (this == null || this == 0) return this;

    return Number(this.toFixed(count));
};
vmCommon.toString = function (num) {

    if (typeof num != 'number') return '';
    var txt = num.toString();
    var i = txt.indexOf('.');
    var n = 0
    if (i > -1) {
        txt = txt.slice(i + 1);
        if (txt.length > 3) n = 3;
        else n = txt.length;
    }
    return num.toFixed(n).toString();
}
vmCommon.LinkSharepointType = {
    ROADMAP: 1,
    MIX: 2
};

Date.prototype.getQuarter = function () {
    switch (this.getMonth() + 1) {
        case 1:
        case 2:
        case 3:
            return 1;
        case 4:
        case 5:
        case 6:
            return 2;
        case 7:
        case 8:
        case 9:
            return 3;
        case 10:
        case 11:
        case 12:
            return 4;
    }

    return 0;
};

vmCommon.getLinkSharepoint = function () {
    function isEqualProps(o1, o2) {  // compare value cung key
        if (typeof o1 != 'object' || typeof o2 != 'object')
            return;

        var value1;
        var value2;
        for (const key1 in o1) {
            value1 = o1[key1];

            for (const key2 in o2) {

                if (key1 == key2) {
                    value2 = o2[key2];

                    if (value1 != value2) {

                        return false;
                    }
                    break;
                }
            }
        };
        return true;
    }

    function isEqualsFilterItems(arr1, arr2) {
        if (!arr1 || !arr2 || arr1.length < 1 || arr2.length < 1)
            return false;

        var item1, item2;
        var len = arr1.length < arr2.length ? arr1.length : arr2.length;
        for (let i = 0; i < len; i++) {
            item1 = arr1[i];
            item2 = arr2[i];

            if (!isEqualProps(item1, item2)) {
                return false;
            }
        }
        return true;
    }

    function isEqualObjArr() {
        return {
            Items: isEqualsFilterItems,
            Properties: isEqualProps
        }
    }
    function editService() {
        var _rootUrl_ = "../Handlers/SettingHandler.ashx?projid=" + projectId + "&parentType=1&type=24";

        return {
            add: function (item, callback) {
                var url = _rootUrl_ + "&funcName=addlinksharepoint";

                callAjax('loading', url, JSON.stringify(item), callback, AjaxConst.PostRequest);
            },
            updateExportTime: function (item, callback) {
                var url = _rootUrl_ + "&funcName=editlinksharepoint";

                var modifiedDate = new Date();
                var entry = {
                    Id: item.Id,
                    ModifiedDate: modifiedDate,
                    TypeId: item.TypeId
                }

                callAjax('loading', url, JSON.stringify(entry), callback, AjaxConst.PostRequest);
            }
        }
    }


    return {
        getItems: function (LinkSharepoints, hasColumn) {
            var copyLs = vmCommon.deepCopy(LinkSharepoints);
            if (!copyLs) return [];
            return copyLs.map(l => {

                var filter = getFilterFrom(l);

                var colOpt = typeof l.OptionColumn == 'string' ? JSON.parse(l.OptionColumn) : l.OptionColumn;

                var sD = !l.StartDate ? l.StartDate : l.StartDate.jsonToDate().toStringYYYYMMDD();
                var eD = !l.EndDate ? l.EndDate : l.EndDate.jsonToDate().toStringYYYYMMDD();

                var item = {
                    Id: l.Id,
                    DateRange: { Start: sD, End: eD },
                    Filter: filter,
                    Link: l.Link,
                    ViewTypeId: l.ViewTypeId
                };

                if (hasColumn) {
                    item.OptionColumn = colOpt;
                }

                return item
            });

            function toDateStringYMD(str) {
                if (!str) return str;

                var d = new Date(str);
                return d.toStringYYYYMMDD();
            }
            function getFilterFrom(l) {
                if (!l.FilterValue) return { };

                var items = JSON.parse(l.FilterValue);

                var filter = {
                    Id: l.FilterId,
                    Items: items.map(i => {
                        if (i.TypeValue == mFilter.enumFilter.workingRange) {
                            var str = i.ChildValue;
                            i.ChildValue = toDateStringYMD(str);
                            str = i.ChildValue1;
                            i.ChildValue1 = toDateStringYMD(str);
                            i.ParentValue = "-1";
                        }

                        return {
                            Operator: i.Operator, TypeValue: i.TypeValue,
                            ParentValue: i.ParentValue, ChildValue: i.ChildValue, ChildValue1: i.ChildValue1,
                            FilterTypeId: i.FilterTypeId
                        }
                    })
                };
                return filter;
            }
        },
        checkDuplicate: function (LinkSharepointItems, DateRange, viewTypeId) {
            var copyLs = vmCommon.deepCopy(LinkSharepointItems);
            var currentFItems = msFilter.controlService.getCurrentFilterItems();

            var drStart = DateRange.Start;
            drStart = !drStart ? drStart : new Date(drStart).toStringYYYYMMDD();
            var drEnd = DateRange.End;
            drEnd = !drEnd ? drEnd : new Date(drEnd).toStringYYYYMMDD();

            var isEqualViewTypeId = false;
            var isEqualFilter = false, isEqualDate = false, ItemDuplicate;
            
            for (let i = 0, len = copyLs.length, item, dRange, filter; i < len; i++) {
                item = copyLs[i];
                dRange = item.DateRange;
                filter = item.Filter;

                isEqualViewTypeId = item.ViewTypeId == viewTypeId;
                isEqualDate = isEqualDateRange(dRange);
                isEqualFilter = isEqualObjArr().Items(currentFItems, filter.Items)

                if (isEqualFilter === true && isEqualDate == true && isEqualViewTypeId == true) {
                    ItemDuplicate = item;
                    break;
                }
            };
           
            return {
                IsDuplicate: isEqualFilter && isEqualDate && isEqualViewTypeId,
                Item: ItemDuplicate
            }

            function isEqualDateRange(dRange) {
                var isEqSd = drStart == dRange.Start;
                var isEqEd = drEnd == dRange.End;
                return isEqSd && isEqEd;
            }
        },
        checkDuplicateWithOptions: function (LinkSharepointItems, DateRange, Options, viewTypeId) {
            var copyLs = vmCommon.deepCopy(LinkSharepointItems);
            var currentFItems = msFilter.controlService.getCurrentFilterItems();

            var drStart = DateRange.Start;
            drStart = !drStart ? drStart : drStart.toStringYYYYMMDD();
            var drEnd = DateRange.End;
            drEnd = !drEnd ? drEnd : drEnd.toStringYYYYMMDD();

            var isEqualViewTypeId = false;
            var isEqualFilter = false, isEqualDate = false, ItemDuplicate, isEqualOptions = false;
            
            for (let i = 0, len = copyLs.length, item, dRange, filter, colOptions; i < len; i++) {
                item = copyLs[i];
                dRange = item.DateRange;
                filter = item.Filter;
                colOptions = typeof item.OptionColumn == 'string' ? JSON.parse(item.OptionColumn) : item.OptionColumn;

                isEqualViewTypeId = item.ViewTypeId == viewTypeId;
                isEqualDate = isEqualDateRange(dRange);
                isEqualFilter = isEqualObjArr().Items(currentFItems, filter.Items);
                isEqualOptions = isEqualObjArr().Properties(Options, colOptions);

                if (isEqualFilter === true && isEqualDate == true && isEqualOptions == true && isEqualViewTypeId == true) {
                    ItemDuplicate = item;
                    break;
                }
            };
           
            return {
                IsDuplicate: isEqualFilter && isEqualDate && isEqualOptions && isEqualViewTypeId,
                Item: ItemDuplicate
            }

            function isEqualDateRange(dRange) {
                var isEqSd = drStart == dRange.Start;
                var isEqEd = drEnd == dRange.End;
                return isEqSd && isEqEd;
            }
        },
        editService: editService
    }
}

vmCommon.isDeLang = function () {
    return kLg.language == 'de' || kLg.language == 'pm';
}
vmCommon.getClearAttrNotNeed = function (str) {
    var regexFix = /data-bind=(\\)?(".+?(\\)?")/gm;
    var regexFixPosFixed = /position:\s*fixed/gm;
    //var regexFix2 = /data-bind=(\\)?"(((\w+)|(-\w+))+:\s\w+)((;|,)(\s|\w)(\w+):\s({(\s|\w)\w+):(\s|\w)\w+)*(}|\w)(\\)?"/gm;
    if (typeof str != 'string') return '';
    var str1 = str.replaceAll(regexFixPosFixed, 'display:none');
    return /*htmlEncode*/(str1.replaceAll(regexFix, ''));
}

Date.prototype.clone = function () {
    return new Date(this.getTime());
};

Map.prototype.toArray = function () {
    return Array.from(this.values());
};

function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {
        toString: function () { return `hsl(${h}, ${s}%, ${l}%)` },
        H: h, S: s, L : l
    }
}

vmCommon.isIpFormat = function (txt) {
    if (typeof txt != 'string') return false;
    const re = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/gim;
    var isIpFormat = re.test(txt);
    isIpFormat = isIpFormat && txt != '0.0.0.0';         // is a nonroutable IPv4 address
    isIpFormat = isIpFormat && txt != '255.255.255.255'; // address mask
    //isIpFormat = isIpFormat && txt != '127.0.0.1';       // localhost
    return isIpFormat;
}
vmCommon.IsSendingToServer = false;
vmCommon.sendingToServer = function (isSending) {
    if (typeof isSending != 'boolean') return;
    vmCommon.IsSendingToServer = isSending;
}
function getDate00000(date) {       // move 0:00:00 in date
    if (!(date instanceof Date)) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
}
function isWeekend(date00000) {
    const day = date00000.getDay();
    return day < 1 || day > 5;
}
function getCmToPx(cm) {
    if (typeof cm != 'number') return 0;
    return cm * 72 / 2.54
}
function disableMouseWheel(event) {
    event.preventDefault();
    event.stopPropagation();
}

vmCommon.goto = function (elem) {
    var scrollTop = $(".body-content").scrollTop();
    var headHeight = $(".ms-header").height() + $(".submenu").height();
    $(".body-content").animate({ scrollTop: $(elem).offset().top - headHeight + scrollTop });
};

Array.prototype.compare = function (lst, func) {
    if (this.length != lst.length)
        return false;

    return this.every(t1 => lst.some(t2 => func(t1, t2)));
};

vmCommon.actionPlanMenuType = {
    Land: 1,
    Region: 2,
    MarketSegment: 3,
    ProductGroup: 4,
    SubMarket: 5,
    Product: 6,
    SubMarketProduct: 7,
    Superior: 8,
    Thema: 9,
    MainGoal: 10,
    SubGoal: 11,
    Action: 12
};
vmCommon.showTooltipKpiData = function (serData, $target) {
    var kpiDatas = serData.value.TheObject.KpiData;
    var kpiUnits = serData.value.Settings.KpiUnits;
    var rownumber = 0, unit, orderFormat, isSeven = false, maxColD = 0;
    kpiDatas.forEach(kpiData => {
        if (maxColD < kpiData.KpiOutcomeTimes.length) maxColD = kpiData.KpiOutcomeTimes.length;
        if (!isSeven && kpiData.KpiOutcomeTimes.length > 7) isSeven = true;
        
        kpiData.KpiOutcomeTimes.forEach(time => {
            if (time.Name && typeof (time.Name) == "string") time.Name = time.Name.toDate();
            
        });
        rownumber += 2;     // Advertiser name và table header
        kpiData.KpiIndexes.forEach(index => {
            rownumber++;    // các row index của table
            unit = vmCommon.findById(index.KpiUnitId, kpiUnits) || vmCommon.defaultUnit();
            index.KpiUnitText = unit.Name;
            //css
            index.posClass = unit.PositionId == 1 ? "unit-left" : unit.PositionId == 3 ? "unit-center" : unit.PositionId == 2 ? "unit-right" : "";
            //numeric
            orderFormat = unit.OrderId === 2 ? "{0} ##,#.00" : "##,#.00 {0}";
            orderFormat = orderFormat.format(unit.Symbol.encodeDola().encodeSymbol());

            index.ExpectedValueText = formatNumber(index.ExpectedValue, orderFormat);
            index.LstValueText = formatNumber(index.LstValue, orderFormat);

            index.KpiIndexTimes.forEach(indextime => {
                indextime.KpiValueText = formatNumber(indextime.KpiValue, orderFormat);
            });

            if (index.SubIndexes.length) rownumber++;

            index.SubIndexes.forEach(subindex => {
                subindex.posClass = index.posClass;
                subindex.KpiIndexTimes.forEach(subindextime => {
                    subindextime.KpiValueText = formatNumber(subindextime.KpiValue, orderFormat);
                });
            });
        });
    });
    function formatNumber(number, orFormat) {
        return (number != null) ? kendo.toString(number, orFormat) : "";
    };

    var template = kendo.template($("#kpiActionviewTemplate").html());
    var tooltip = $target.kendoTooltip({
        autoHide: false,
        content: template(kpiDatas),
        width: 878 + maxColD * 131,
        height: (kpiDatas.length * 18) + (rownumber < 4 ? 4 : rownumber) * 36,
        showOn: "click",
        hide: function () {
            document.body.removeEventListener('click', hideTooltipKpiActionviewTemplate);
            delete vmCommon.$tooltipTarget;
            var elem = this.element;
            $(elem).data("kendoTooltip") && $(elem).data("kendoTooltip").destroy();
        },
        show: function () {
            vmCommon.$tooltipTarget = $target;  // set ref
        }
    }).data("kendoTooltip");
    tooltip.show();
    document.body.addEventListener('click', hideTooltipKpiActionviewTemplate);
    var content = tooltip.content;
    if (isSeven) $(content).children("div.kpidivview").css({ "overflow-x": "auto" });
}
function hideTooltipKpiActionviewTemplate(e) {
    var isInsideTlp = false;
    if (e.path.length > 4)
        for (var i = 0, l = e.path.length - 4; i < l; i++) {
            var elm = e.path[i];
            if (elm.classList.contains('k-animation-container')) {
                isInsideTlp = true;
                break;
            }
        }
    if (!isInsideTlp) {
        vmCommon.$tooltipTarget.data('kendoTooltip').hide();
    }
}
function jsonToTime(strDate) {
    if (!strDate) return 0;
    const t = strDate.substring(strDate.indexOf('(') + 1, strDate.indexOf(')'));
    return +t;
}
function getDateJson(timeOrStr) {
    if (!timeOrStr) return null;
    var t = new Date(timeOrStr);
    var dlT = t.toString();
    dlT = dlT.substring(dlT.indexOf('GMT+') + 4, dlT.indexOf(' (') - 2);
    return `/Date(${t.getTime() + parseInt(dlT) * 3600000})/`;
};
$(document).ready(function(){
    $('#iconUser').click(function(){
       var id = $(this).attr('href');
       if($(this).hasClass('icon-active')){
            $(id).hide();
            $(this).removeClass('icon-active');
       }else{
        $(id).show();
        $(this).addClass('icon-active');
       }
    });
    $(document).mouseup(function(e){
        var container = $('#iconUser');
        var container1 = $('#iconSet');
        var id1 = $('#iconSet').attr('href');
        var id =$('#iconUser').attr('href');
        if(!container.is(e.target)){
            $(id).hide();
            container.removeClass('icon-active');
        };
        if(!container1.is(e.target)){
            $(id1).hide();
            $("#msSetting").removeClass('active-set');
        };
    });
    $('#ms-icon-close').click(function(){
        $('#msModal').hide();
        $('#iconUser').removeClass('icon-active');
    });

    $('#iconSet').click(function () {
        if (projectId != 0) {
            var id = $("#msSetting").attr('href');
            if ($("#msSetting").hasClass('active-set')) {
                $(id).hide();
                $("#msSetting").removeClass('active-set');
            } else {
                $(id).show();
                $("#msSetting").addClass('active-set');
            }
        }
        return;
    });

    $('#iconFileManagement').bind('click', function () {
        if (projectId != 0) {
            vmFile.openPopUpFileManagement(this.id);
        }
    });

    $('.dropdown').on("click", function(){
        var object= $(this);
        var border = object.css(["border-radius"]);
        $.each(border,function(key,value){
            //console.log(value);
            if(value =="3px"){
                object.css({borderRadius:"3px 3px 0px 0px" });
            }
            if(value == "3px 3px 0px 0px"){
                object.css({borderRadius:"3px"});
            }
        });
    });
   $('.horizontal-menu li').click(function(){
        $('.horizontal-menu li').removeClass('active-li-top');
        $(this).addClass('active-li-top');
    });
    $(".li-dropmenu").click(function(e){
        e.preventDefault();
        var text1 = $(this).text();
        var href = $(this).attr("href");
        $("#a-dropdown").attr("href",href).html(text1+"<b class=\"caret caret1 header-caret\"></b>");

    });
    $(".li-dropmenu1").click(function(e){
        e.preventDefault();
        var text1 = $(this).text();
        var href = $(this).attr("href");
        $("#a-dropdown1").attr("href",href).html(text1+"<b class=\"caret caret1 header-caret\"></b>");

    });
    
});;
/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
* @license MIT */

; (function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.NProgress = factory();
    }

})(this, function () {
    var NProgress = {};

    NProgress.version = '0.2.0';

    var Settings = NProgress.settings = {
        minimum: 0.1,
        easing: 'linear',
        positionUsing: '',
        speed: 200,
        trickle: true,
        trickleSpeed: 200,
        showSpinner: false,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: 'body',
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };

    /**
     * Updates configuration.
     *
     *     NProgress.configure({
     *       minimum: 0.1
     *     });
     */
    NProgress.configure = function (options) {
        var key, value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
    };

    /**
     * Last number.
     */

    NProgress.status = null;

    /**
     * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
     *
     *     NProgress.set(0.4);
     *     NProgress.set(1.0);
     */

    NProgress.set = function (n) {
        var started = NProgress.isStarted();

        n = clamp(n, Settings.minimum, 1);
        NProgress.status = (n === 1 ? null : n);

        var progress = NProgress.render(!started),
            bar = progress.querySelector(Settings.barSelector),
            speed = Settings.speed,
            ease = Settings.easing;

        progress.offsetWidth; /* Repaint */

        queue(function (next) {
            // Set positionUsing if it hasn't already been set
            if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

            // Add transition
            css(bar, barPositionCSS(n, speed, ease));

            if (n === 1) {
                // Fade out
                css(progress, {
                    transition: 'none',
                    opacity: 1
                });
                progress.offsetWidth; /* Repaint */

                setTimeout(function () {
                    css(progress, {
                        transition: 'all ' + speed + 'ms linear',
                        opacity: 0
                    });
                    setTimeout(function () {
                        NProgress.remove();
                        next();
                    }, speed);
                }, speed);
            } else {
                setTimeout(next, speed);
            }
        });

        return this;
    };

    NProgress.isStarted = function () {
        return typeof NProgress.status === 'number';
    };

    /**
     * Shows the progress bar.
     * This is the same as setting the status to 0%, except that it doesn't go backwards.
     *
     *     NProgress.start();
     *
     */
    NProgress.start = function () {
        if (!NProgress.status) NProgress.set(0);

        var work = function () {
            setTimeout(function () {
                if (!NProgress.status) return;
                NProgress.trickle();
                work();
            }, Settings.trickleSpeed);
        };

        if (Settings.trickle) work();

        return this;
    };

    /**
     * Hides the progress bar.
     * This is the *sort of* the same as setting the status to 100%, with the
     * difference being `done()` makes some placebo effect of some realistic motion.
     *
     *     NProgress.done();
     *
     * If `true` is passed, it will show the progress bar even if its hidden.
     *
     *     NProgress.done(true);
     */

    NProgress.done = function (force) {
        if (!force && !NProgress.status) return this;

        return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
    };

    /**
     * Increments by a random amount.
     */

    NProgress.inc = function (amount) {
        var n = NProgress.status;

        if (!n) {
            return NProgress.start();
        } else if (n > 1) {
            return;
        } else {
            if (typeof amount !== 'number') {
                if (n >= 0 && n < 0.2) { amount = 0.1; }
                else if (n >= 0.2 && n < 0.5) { amount = 0.04; }
                else if (n >= 0.5 && n < 0.8) { amount = 0.02; }
                else if (n >= 0.8 && n < 0.99) { amount = 0.005; }
                else { amount = 0; }
            }

            n = clamp(n + amount, 0, 0.994);
            return NProgress.set(n);
        }
    };

    NProgress.trickle = function () {
        return NProgress.inc();
    };

    /**
     * Waits for all supplied jQuery promises and
     * increases the progress as the promises resolve.
     *
     * @param $promise jQUery Promise
     */
    (function () {
        var initial = 0, current = 0;

        NProgress.promise = function ($promise) {
            if (!$promise || $promise.state() === "resolved") {
                return this;
            }

            if (current === 0) {
                NProgress.start();
            }

            initial++;
            current++;

            $promise.always(function () {
                current--;
                if (current === 0) {
                    initial = 0;
                    NProgress.done();
                } else {
                    NProgress.set((initial - current) / initial);
                }
            });

            return this;
        };

    })();

    /**
     * (Internal) renders the progress bar markup based on the `template`
     * setting.
     */

    NProgress.render = function (fromStart) {
        if (NProgress.isRendered()) return document.getElementById('nprogress');

        addClass(document.documentElement, 'nprogress-busy');

        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = Settings.template;



        var bar = progress.querySelector(Settings.barSelector),
            perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
            parent = isDOM(Settings.parent)
                ? Settings.parent
                : document.querySelector(Settings.parent),
            spinner

        css(bar, {
            transition: 'all 0 linear',
            transform: 'translate3d(' + perc + '%,0,0)'
        });

        if (!Settings.showSpinner) {
            spinner = progress.querySelector(Settings.spinnerSelector);
            spinner && removeElement(spinner);
        }

        if (parent != document.body) {
            addClass(parent, 'nprogress-custom-parent');
        }

        parent.appendChild(progress);
        
        var nprogressActionPlanDisableAll = document.getElementById('nprogressActionPlanDisableAll');
        nprogressActionPlanDisableAll && (nprogressActionPlanDisableAll.style.display = 'block');

        return progress;
    };

    /**
     * Removes the element. Opposite of render().
     */

    NProgress.remove = function () {
        removeClass(document.documentElement, 'nprogress-busy');
        var parent = isDOM(Settings.parent)
            ? Settings.parent
            : document.querySelector(Settings.parent)
        removeClass(parent, 'nprogress-custom-parent')
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);

        var nprogressActionPlanDisableAll = document.getElementById('nprogressActionPlanDisableAll');
        nprogressActionPlanDisableAll && (nprogressActionPlanDisableAll.style.display = 'none');
    };

    /**
     * Checks if the progress bar is rendered.
     */

    NProgress.isRendered = function () {
        return !!document.getElementById('nprogress');
    };

    /**
     * Determine which positioning CSS rule to use.
     */

    NProgress.getPositioningCSS = function () {
        // Sniff on document.body.style
        var bodyStyle = document.body.style;

        // Sniff prefixes
        var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
            ('MozTransform' in bodyStyle) ? 'Moz' :
                ('msTransform' in bodyStyle) ? 'ms' :
                    ('OTransform' in bodyStyle) ? 'O' : '';

        if (vendorPrefix + 'Perspective' in bodyStyle) {
            // Modern browsers with 3D support, e.g. Webkit, IE10
            return 'translate3d';
        } else if (vendorPrefix + 'Transform' in bodyStyle) {
            // Browsers without 3D support, e.g. IE9
            return 'translate';
        } else {
            // Browsers without translate() support, e.g. IE7-8
            return 'margin';
        }
    };

    /**
     * Helpers
     */

    function isDOM(obj) {
        if (typeof HTMLElement === 'object') {
            return obj instanceof HTMLElement
        }
        return (
            obj &&
            typeof obj === 'object' &&
            obj.nodeType === 1 &&
            typeof obj.nodeName === 'string'
        )
    }

    function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    /**
     * (Internal) converts a percentage (`0..1`) to a bar translateX
     * percentage (`-100%..0%`).
     */

    function toBarPerc(n) {
        return (-1 + n) * 100;
    }


    /**
     * (Internal) returns the correct CSS for changing the bar's
     * position given an n percentage, and speed and ease from Settings
     */

    function barPositionCSS(n, speed, ease) {
        var barCSS;

        if (Settings.positionUsing === 'translate3d') {
            barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
        } else if (Settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
        } else {
            barCSS = { 'margin-left': toBarPerc(n) + '%' };
        }

        barCSS.transition = 'all ' + speed + 'ms ' + ease;

        return barCSS;
    }

    /**
     * (Internal) Queues a function to be executed.
     */

    var queue = (function () {
        var pending = [];

        function next() {
            var fn = pending.shift();
            if (fn) {
                fn(next);
            }
        }

        return function (fn) {
            pending.push(fn);
            if (pending.length == 1) next();
        };
    })();

    /**
     * (Internal) Applies css properties to an element, similar to the jQuery
     * css method.
     *
     * While this helper does assist with vendor prefixed property names, it
     * does not perform any manipulation of values prior to setting styles.
     */

    var css = (function () {
        var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'],
            cssProps = {};

        function camelCase(string) {
            return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
                return letter.toUpperCase();
            });
        }

        function getVendorProp(name) {
            var style = document.body.style;
            if (name in style) return name;

            var i = cssPrefixes.length,
                capName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;
            while (i--) {
                vendorName = cssPrefixes[i] + capName;
                if (vendorName in style) return vendorName;
            }

            return name;
        }

        function getStyleProp(name) {
            name = camelCase(name);
            return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }

        function applyCss(element, prop, value) {
            prop = getStyleProp(prop);
            element.style[prop] = value;
        }

        return function (element, properties) {
            var args = arguments,
                prop,
                value;

            if (args.length == 2) {
                for (prop in properties) {
                    value = properties[prop];
                    if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
                }
            } else {
                applyCss(element, args[1], args[2]);
            }
        }
    })();

    /**
     * (Internal) Determines if an element or space separated list of class names contains a class name.
     */

    function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
    }

    /**
     * (Internal) Adds a class to an element.
     */

    function addClass(element, name) {
        var oldList = classList(element),
            newList = oldList + name;

        if (hasClass(oldList, name)) return;

        // Trim the opening space.
        element.className = newList.substring(1);
    }

    /**
     * (Internal) Removes a class from an element.
     */

    function removeClass(element, name) {
        var oldList = classList(element),
            newList;

        if (!hasClass(element, name)) return;

        // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

        // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
    }

    /**
     * (Internal) Gets a space separated list of the class names on the element.
     * The list is wrapped with a single space on each end to facilitate finding
     * matches within the list.
     */

    function classList(element) {
        return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
    }

    /**
     * (Internal) Removes an element from the DOM.
     */

    function removeElement(element) {
        element && element.parentNode && element.parentNode.removeChild(element);
    }

    return NProgress;
});;
