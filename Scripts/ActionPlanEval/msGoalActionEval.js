
var vmApEval = vmApEval || {};
vmApEval.EvalObjectSaving = vmApEval.EvalObjectSaving || {};

var vmApSwotanalyse = vmApSwotanalyse || {};
vmApSwotanalyse.SwotanalyseData = vmApSwotanalyse.SwotanalyseData || {};
vmApSwotanalyse.SwotanalyseData.Criterias = vmApSwotanalyse.SwotanalyseData.Criterias || [];
vmApSwotanalyse.SwotanalyseData.Trends = vmApSwotanalyse.SwotanalyseData.Trends || [];

var vmApProduct = vmApProduct || {};
vmApProduct.ListTarget = [];
vmApProduct.SMTargetData = vmApProduct.SMTargetData || {};
vmApProduct.SMTargetData.DemandCharts = vmApProduct.SMTargetData.DemandCharts || [];
vmApProduct.SMTargetData.TargetDemands = vmApProduct.SMTargetData.TargetDemands || [];
vmApProduct.SMTargetData.DemandChartEvaluations = vmApProduct.SMTargetData.DemandChartEvaluations || [];

vmApEval.goalActionId = emptyGuid;
vmApEval.isClickOpenTab = false;
vmApEval.modelChanged = false;
vmApEval.lstDivChart = [];
vmApEval.openingTab = 'idTabProductEvaluation';
vmApEval.isChangeTemp = false;
vmApEval.editingPositionTempId = '';
vmApEval.actionResult = { Duplicated: -4, Deleted: -3, Conflict: -2, Success: -1 };
vmApEval.font = { font: '13px Segoe UI, Arial, sans-serif' };
vmApEval.countLoadForm = {
    Tab1: 1,
    Tab2: 0,
    Tab3: 0
};

vmApEval.curRole = vmApEval.curRole || 1;
var positionUnit = [
    { text: kLg.Number, value: 0 },
    { text: kLg.Currency, value: 1 },
    { text: kLg.Percent, value: 2 }
];
var emptyGuid = "00000000-0000-0000-0000-000000000000";
var popCreateProdDesignTemp,
    popCreatePositionTemp,
    popCreateSubmarketProTemp,
    loadingDivElem = '#loadingProdEvaluation';

var vmApImport = vmApImport || {};
//#endregion

vmApEval.dataservice = (function () {
    function callAjaxMsAPEvalHandler(divId, funcName, entryData, requestType, successCallBack, url = null) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + `&lang=${kLg.language}`;
        if (url) {
            _url = url;
        }

        return callAjax(divId, _url, entryData, successCallBack, requestType);
    }

    var callAjaxByPost = function (funcName, entryData, successFunc) {
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, JSON.stringify(entryData), AjaxConst.PostRequest, successFunc);
    };

    var callAjaxByGet = function (funcName, urlPara, successFunc) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + urlPara;
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, null, AjaxConst.GetRequest, successFunc, _url);
    };

    var saveEval = function (entryData, successFunc) {
        return callAjaxByPost("saveEval", entryData, successFunc);
    };

    var saveTemplate = function (entryData, successFunc) {
        return callAjaxByPost("saveTemplateTab1", entryData, successFunc);
    };

    var loadEval = function (goalActionId, successFunc) {
        var urlPara = '&goalActionId=' + goalActionId;
        return callAjaxByGet("getListEval", urlPara, successFunc);
    };

    var getEvalTemplateByUser = function (templateType, successFunc) {
        var urlPara = '&templateType=' + templateType;
        return callAjaxByGet("getTemplateByCreatedUser", urlPara, successFunc);
    };

    var getListEvalByTemplateId = function (templateId, successFunc) {
        var urlPara = '&templateId=' + templateId;
        return callAjaxByGet("getDataTab1ByTemplateId", urlPara, successFunc);
    };

    var krole;

    var setRole = function (role) {
        if (krole == undefined && typeof role == "number") krole = role;
    };

    var hasRole = function () {
        return krole == undefined ? false : krole > vmCommon.MemberRole.View;
    };

    return {
        setRole: setRole,
        hasRole: hasRole,
        loadEval: loadEval,
        saveEval: saveEval,
        saveTemplate: saveTemplate,
        getListEvalByTemplateId: getListEvalByTemplateId,
        getEvalTemplateByUser: getEvalTemplateByUser
    };
})();


$(".percentage").on("keypress", function (evt) {
    var keycode = evt.charCode || evt.keyCode;
    if (keycode == 46) {
        return false;
    }
});

/*
   binding language
 */
vmApEval.setupLabelLanguage = function () {
    var that = this;

    $('#lblProductEvaluationTitle').text(that.goalActionName);
    $('#ddlEvalTemp').html('<option>' + kLg.btnSelectTemp + '</option>');
    $('#ddlCompeTemp').html('<option>' + kLg.btnSelectTemp + '</option>');

    $('#submaketGroup').text(that.goalActionName);
    $('#nameInEvaluation').text(that.goalActionName);

    $('#msgInvalidPercent').text(kLg.msgInvalidPercent);

    $('#lblCriteria').text(kLg.criteria);
    $('#lblPriority').text(kLg.priority);
    $('#lblEvaluationEval').text(kLg.evaluation);
    $('.btnAddTemp').text(kLg.btnAddTemp);
    $('.btnUpdateTemp').text(kLg.btnUpdateTemp);
    $('.btnDelTemp').text(kLg.btnDelTemp);
    $('.btnImportTemp').text(kLg.btnImportTemp);
    $('span.scancel').text(kLg.cancel);

    $('.lblEvalTempName').text(kLg.lblTemplateName);

    $('.lblComment').text(kLg.labelComment);
    $('#idTabProductEvaluation').text(kLg.tabEvaluationStrategy);
    $('#idTabSwotAnalyse').text(kLg.tabSWOTAnalyse);
    $('#idTabUmsatzStrategie').text(kLg.tabVolumeStrategy);
    $('#idTabProductStructure').text(kLg.tabProductStructuring);
    $('#lblMarketGrowth').text(kLg.lblMarketGrowth);
    $('#spanDeleteAllContent').text(kLg.btnDeleteAllContent);
    $('#spanSaveAsTemplate').text(kLg.btnSaveAsTemplate);
    $('#spanDeleteTemplate').text(kLg.DeleteTemplate);
    $('#lblBewertung').text(kLg.evaluation);

    $("#lblAPEvalClose").text(kLg.lblClose);
};

var lstCompeSlider = [],
    lstMarketShareNumberic = [],
    lstEvalDropdown = [],
    ddlPositionUnit = [],
    lstColorPicker = [],
    lstEvalSlider = [],
    ddlStrategy,
    sliderMarketGrowth = null,
    sliderRelativeMarket = null;

vmApEval.loadData = function () {

    var that = this;
    vmApEval.dataservice.loadEval(vmApEval.goalActionId, cb);

    function cb(data) {
        var dataEval = data.value.Data;

        //Setup view-model data
        if (vmApEval.goalActionId) {
            that.ProductEvaluations = dataEval.ProductEvaluations;
        }
        that.ApEvaluationTemplates = dataEval.ApEvaluationTemplates;

        if (that.goalActionTemplateId != null) {
            vmApEval.dataservice.getListEvalByTemplateId(that.goalActionTemplateId, (resData) => {

                that.setModelChanged();

                that.ProductEvaluations.map(item => {
                    item.DeletedBy = 1;
                });

                resData.value.map(t => t.Id = vmCommon.newGuid());

                that.ProductEvaluations = that.ProductEvaluations.concat(resData.value);

                that.initForm();
            });
        }
        else {
            that.initForm();
        }
    }

    //show tab from dashboard
    var qs = new queryString(true);
    if (qs.get('tabid') != null) {
        var tabId = qs.get('tabid').toString();

        if (typeof findSubMarketProductsBySubAndProduct() != "undefined") {
            $('#tabs #' + tabId).trigger("click");
            history.replaceState(null, document.title, removeURLParameter("tabid"));
        }
        else {
            that.loadData();
        }
    } else {
        if (that.openingTab != 'idTabProductEvaluation') {
            $('#tabs #' + that.openingTab).trigger("click");
        }
    }

    //if (that.goalActionTemplateId != null) {
    //    // bindDataObject tab 2
    //    vmApSwotanalyse.bindDataToObject();
    //    // bindDataObject tab 3
    //    vmApProduct.bindDataToObject();
    //}
};

vmApEval.initForm = function () {
    var that = this;

    that.isExistEvaluation = true;

    that.reloadGridData();

    that.initddlApEvalTemps(that.ApEvaluationTemplateId);

    //Comment
    $('#txtEvaluationComment').val(that.ApEvaluationComment);

    if (that.curRole < vmCommon.MemberRole.Edit) {
        that.disableAllControl();
    }
};

function popSaveTemplatePreventEnter() {
    $("#txtTempName").keydown(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    });
    $("#txtPositionTempName").keydown(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    });
}
//#endregion

//#region Event
var preEvalTempVal = -1;

vmApEval.initddlApEvalTemps = function (chooseId) {
    var that = this;

    var listTemp = [];
    if (that.ApEvaluationTemplates) {
        listTemp = that.ApEvaluationTemplates.filter(t => t.DeletedBy != 1);
    }

    var _templatEvals = vmCommon.deepCopy(listTemp);

    _templatEvals.unshift({ Id: -1, Name: kLg.btnSelectTemp });
    $('#ddlEvalTemp').kendoDropDownList({
        dataTextField: "Name",
        dataValueField: "Id",
        dataSource: _templatEvals,
        change: ddlEvalTemp_Onchange,
        open: function (e) {
            preEvalTempVal = ddlEvalTemp.value();
        }
    });

    ddlEvalTemp = $("#ddlEvalTemp").data("kendoDropDownList");
    if (ddlEvalTemp != null) {
        if (chooseId) {
            const _temp_ = listTemp.find(t => t.Id == chooseId);
            if (_temp_) {
                ddlEvalTemp.value(chooseId);
                vmCommon.VmChartEvaluationXYZ.changeTemplate(_temp_);
            }
        } else
            ddlEvalTemp.value('-1');
    }
};

var ddlEvalTemp;
var lstDdlPositionTemp = [];
var positionTempData = [];

//Eval & Competition template
vmApEval.btnAddTemp_Onclick = function (actionType, e) {
    var that = this;

    $('#txtTempName').tooltip('destroy');
    //clearError('msgEditTemplate');
    var $tbody = $(e).parent().parent().find('tbody');
    var areaId = $tbody.attr('id');

    if (areaId == "ap-body-eval") {
        vmApEval.templateType = templateType.ApEvaluationTemplate;
        if (vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1).length < 1) { //validation, no evaluation
            pAlert(kLg.msgRequiredElement);
            return;
        }
    }

    that.evalTempAction = actionType;
    var tempName = '',
        title = kLg.btnAddTemp;
    if (actionType == templateAction.Update) {
        title = kLg.btnUpdateTemp;
        if (areaId == "ap-body-eval") {
            if (parseInt(ddlEvalTemp.value()) === -1) {
                pAlert(kLg.msgChooseTemplate);
                return;
            }

            tempName = ddlEvalTemp.text();
        }
    }

    bindTemplate('eval-compe-temp-pop', 'eval-compe-temp', tempName);
    $('.lblEvalTempName').text(kLg.lblTemplateName);
    $('#textCancelButton').text(kLg.btnCancel);
    $('#textUpdateButton').text(kLg.btnOk);
    that.popCreateEvalTemp = showTempNamePopup(that.popCreateEvalTemp, $("#eval-compe-temp-pop"), null, title, function () {
        
        that.popCreateEvalTemp.destroy();
        that.popCreateEvalTemp = null;

        let divEvalPop = `<div id="eval-compe-temp-pop"></div>`;
        $('#popGoalActionEval').length > 0 && $('#popGoalActionEval').append(divEvalPop);
        $('#popSubmarketEval').length > 0 && $('#popSubmarketEval').append(divEvalPop);// TODO: SONPT. change to body or get parent for easier to use
    });

    that.bindSaveTemplatePopup();
};

vmApEval.btnSaveAsTemplate_Onclick = function () {

    bindTemplate('submarketproduct-temp-pop', 'submarketproduct-temp', '');

    $('.lblSubmarketProductTempName').text(kLg.lblTemplateName);
    $('.sOK').text(kLg.btnOk);
    $('.scancel').text(kLg.btnCancel);
    popCreateSubmarketProTemp = showTempNamePopup(popCreateSubmarketProTemp, $("#submarketproduct-temp-pop"), null, kLg.btnAddTemp, function () {
        popCreateSubmarketProTemp.destroy();
        popCreateSubmarketProTemp = null;
        $('#popSubmarketEval').append('<div id="submarketproduct-temp-pop"></div>');
    });
    //bindSaveSubMarketProTemp();
    $("#txtSubmarketTempName").tooltip("destroy");

};

vmApEval.setModelChanged = function (val = true) {
    if (val && val == true) {
        vmApEval.modelChanged = true;
    }
    else {
        vmApEval.modelChanged = false;
    }
};

vmApEval.reloadGridData = function () {
    var dataRow = vmApEval.ProductEvaluations ? vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1) : [];

    dataRow = dataRow.sort((i, j) => {
        return i.MIndex - j.MIndex;
    });

    // bind list Evaluation
    if (dataRow !== null) {
        bindTemplate("ap-body-eval", "prodEval-temp", dataRow);
    }

    //Dropdownlist Eval
    lstEvalDropdown.length = 0;
    $(".prodEvalDropdown").each(function () {
        var evalDdl = $(this).kendoDropDownList({
            change: evalDdl_Onchange
        }).data("kendoDropDownList");
        lstEvalDropdown.push(evalDdl);
    });
    //Slider
    vmApEval.setupAllEvaluationSlider();

    //Setup total evaluation
    vmApEval.updateTotalEval();
    vmApEval.setupEditableLabel();
    vmApEval.setupSortableProductEvaluation();
    showHideRemoveButton();
};

vmApEval.btnSubmarketProductCancel_Onclick = function () {
    closeSubMarketProTempPopup();
};

vmApEval.btnSaveTempAllSubmarketPro_Onclick = function () {
    disableButtonPopup();
    $("#txtSubmarketTempName").tooltip("destroy");
    var tempName = $('#txtSubmarketTempName').val();
    if (!checkRequired(tempName)) {
        $('#txtSubmarketTempName').attr('title', kLg.msgRequiredTempName);
        $("#txtSubmarketTempName").tooltip({ placement: 'top', trigger: 'manual' }).tooltip('show');
        $('#txtSubmarketTempName').focus();
        enableButtonPopup();
        return;
    }
    $('#btnSaveTempAllSubmarketPro').unbind('click');

    var entryData = { Id: vmApEval.subMarketProduct.Id, Name: tempName };
    vmApEval.dataservice.insertSubmarketProTemplate(entryData, function (serData) {
        //Check role
        if (!checkRole(serData))
            return;
        closeSubMarketProTempPopup();
    });
};

vmApEval.btnImportTemp_Onclick = function (templateType) {
    var that = this;

    vmApImport.templateType = templateType;
    that.setModelChanged();

    that.dataservice.getEvalTemplateByUser(templateType, (data) => {
        if (vmApEval.curRole > 0) {
            vmApImport.lstAvaiTemplate = data;

            var path = "../Contents/MsPopGoalActionEval_PopImportTemplate.html";
            vmApImport.importTempWindown = showImportTempPopup(null, $("#apImportTempWindow"), path, function () {
                vmApImport.importTempWindown.destroy();
                vmApImport.importTempWindown == null;
                $('#popGoalActionEval').prepend('<div id="apImportTempWindow"></div>');
            });
            vmApImport.importTempWindown.element.focus();

            //vmApImport.importTempWindown = showPopup(vmApImport.importTempWindown,
            //    $("#apImportTempWindow"), path,
            //    {
            //        title: kLg.btnImportTemp,
            //        width: 600,
            //        height: 600,
            //        resizable: false,
            //        modal: true
            //    }
            //);
        }
    });
};

vmApEval.destroyPop = function () {
    if (vmGoalAction.popGoalActionEval) {
        vmGoalAction.popGoalActionEval.destroy();
        vmGoalAction.popGoalActionEval = null;
        $(".body-content").after("<div id='popGoalActionEval'></div>");
        this.resetForm();
        if (typeof deleteGlobal == 'function') deleteGlobal();
    }
};

function popGoalActionEvalClosed_Onclick(e) {
    $('.k-tooltip').hide();

    if (vmApEval.modelChanged) {
        if (confirm(kLg.saveConfirmQuestion)) {
            if (typeof evalApp != "undefined") {
                if (evalApp.update()) {
                    vmApEval.destroyPop();
                } else {
                    e.preventDefault();
                }
            } else {
                if (vmApEval.update()) {
                    vmApEval.destroyPop();
                } else {
                    e.preventDefault();
                }
            }
        } else {
            vmApEval.destroyPop();
        }
    } else {
        vmApEval.destroyPop();
    }

    e.sender.element.focus();
    vmFile.enableAssignedIcon = false;

    //vmSME.cellId
    if (typeof (vmApEval.goalActionModel.Id) === "undefined")
        return;
    if (vmApEval.popCreateEvalTemp) {
        vmApEval.popCreateEvalTemp.destroy();
        vmApEval.popCreateEvalTemp = null;
    }
}

//#region Position
vmApEval.btnDelTempPosition_Onclick = function (e) {
    pConfirm(kLg.confirmProductPosition).then(function () {
        var $parent = $(e).parents('div[class*=area-prodPosition]');
        var index = $parent.attr('index');
        var dataId = vmApEval.productPositions[index].ProductPosition.Id;

        //Call ajax to delete
        var entryData = { Id: dataId, Mdf: vmApEval.productPositions[index].ProductPosition.Mdf };
        //Call server
        vmApEval.dataservice.delPosition(entryData, function (serData) {
            //Check role
            if (!checkRole(serData))
                return;

            //Check conflict
            if (serData.value.ActionResult == vmApEval.actionResult.Conflict || serData.value.ActionResult == vmApEval.actionResult.Deleted) {
                pAlert(kLg.msgConflictData);
                return;
            }
            vmApEval.productPositions.splice(index, 1);
            $parent.prev().remove();
            $parent.remove();
            $('#area-positions').children('div').each(function (ix, elem) {
                if (ix >= index) {
                    var oldIndex = $(elem).attr('index');
                    $(elem).attr('index', parseInt(oldIndex) - 1);
                    var $chart = $(elem).find('div[id*=position-chart]'),
                        $xAxisWrapper = $(elem).find('div[id*=lblxAxisWrapper]'),
                        $lblxAxis = $(elem).find('div[id*=lblxAxisSpan]'),
                        $lblyAxis = $(elem).find('div[id*=lblyAxis]');
                    $chart.attr('id', 'position-chart' + (parseInt(oldIndex) - 1));
                    $xAxisWrapper.attr('id', 'lblxAxisWrapper' + (parseInt(oldIndex) - 1));
                    $lblxAxis.attr('id', 'lblxAxisSpan' + (parseInt(oldIndex) - 1));
                    $lblyAxis.attr('id', 'lblyAxis' + (parseInt(oldIndex) - 1));
                    //$(elem).find('h4').text(kLg.lblPositionierungName + ' ' + oldIndex);
                }
            });

            //if (vmSME.productPositions.length == 1) {
            //    $('#area-positions .area-prodPosition').off('mouseenter');
            //}

            if (vmApEval.productPositions.length == 0) {
                $('#area-positions').empty().html('<p class="clearx4"></p>' +
                    '<div class="ms-panel-new area-prodPosition">' +
                    '<p class="ms-panel-title lblPositionGroup">' + kLg.lblPositionierung + '</p>' +
                    '<a class="icon-28 icon-add-small pull-left add-panel" onclick="vmSME.lnkAddPosition_Onclick(this)"></a>' +
                    '<a class="icon-28 icon-bin-small pull-left remove-panel btnPositionRemove" style="display: none" onclick="delPosition(this)"></a>' +
                    '</div>');
                lstDdlPositionTemp.length = 0;
            }
        });

    });
};

vmApEval.update = function () {
    var that = this;
    if (vmApEval.modelChanged == false) {
        vmGoalAction.popGoalActionEval.close();
        return true;
    }

    // Get value tab #1
    that.EvalObjectSaving.APEvaluations = vmCommon.deepCopy(vmApEval.ProductEvaluations);
    that.EvalObjectSaving.ApEvaluationComment = vmApEval.ApEvaluationComment;
    that.EvalObjectSaving.Evaluation = vmApEval.Evaluation;

    that.EvalObjectSaving.APEvaluations.map(item => {
        if (isNaN(item.Id)) {
            item.Id = 0;
        }
    });

    var apSwotanalyseTemplates = null;

    if (typeof vmApSwotanalyse != 'undefined' && vmApSwotanalyse != null) {
        that.EvalObjectSaving.ApSwotanalyses = vmApSwotanalyse.getSaveData();
        apSwotanalyseTemplates = vmApSwotanalyse.getSaveTemplate();
        that.ApSwotanalyseTemplateId = vmApSwotanalyse.ApSwotanalyseTemplateId;
    }

    var productTemplateCopy = null;

    if (typeof vmApProduct != 'undefined' && vmApProduct != null && typeof (vmApProduct) == 'object' && vmApProduct.SMTargetData != null
        && JSON.stringify(vmApProduct.SMTargetData) != JSON.stringify({})) {

        that.EvalObjectSaving.TargetData = vmApProduct.getTargetToSave();

        productTemplateCopy = vmApProduct.getTemplateToSave();
        that.ApProductTemplateId = vmApProduct.ApProductTemplateId;
    }

    var evalTemplateCopy = vmCommon.deepCopy(that.ApEvaluationTemplates);
    if (evalTemplateCopy != null) {
        evalTemplateCopy.map(t => {
            if (t.ApEvaluations != undefined) {
                t.ApEvaluations.map(item => item.Id = 0);
            }
        });
    }

    if (vmApEval.goalActionModel.Id != undefined && vmApEval.goalActionModel.Id != null && vmApEval.goalActionModel.Id != vmCommon.emptyGuid) {
        var entryData = {
            GoalActionId: vmApEval.goalActionModel.Id,
            Mdf: that.goalActionModel.Mdf,
            TypeId: that.objectType,
            ApEvalSaving: {
                APEvaluations: that.EvalObjectSaving,
                ApEvaluation: that.Evaluation,
                ApEvaluationComment: that.ApEvaluationComment,
                ApProductTemplateId: that.ApProductTemplateId,
                ApEvaluationTemplateId: that.ApEvaluationTemplateId,
                ApSwotanalyseTemplateId: that.ApSwotanalyseTemplateId,
                ApEvaluationTemplates: evalTemplateCopy,
                ApProductTemplates: productTemplateCopy,
                ApSwotanalyseTemplates: apSwotanalyseTemplates
            },
            TemplateId: vmCommon.newGuid()
        };

        that.dataservice.saveEval(entryData, (serData) => {
            if (serData.value.ActionResult == vmApEval.actionResult.Conflict || serData.value.ActionResult == vmApEval.actionResult.Deleted) {
                pAlert(kLg.msgConflictData);
                return;
            }

            if (!that.isShowDirect) {
                that.goalActionModel.set('Mdf', ++entryData.Mdf);

                //that.goalActionModel.set('ActionPlanEvalData', that.EvalObjectSaving);
                that.goalActionModel.set('ApEvaluationComment', that.ApEvaluationComment);
                that.goalActionModel.set('ApEvaluation', that.Evaluation);
                that.goalActionModel.set('ApProductTemplateId', that.ApProductTemplateId);
                that.goalActionModel.set('ApProductTemplates', productTemplateCopy);
                that.goalActionModel.set('ApEvaluationTemplateId', that.ApEvaluationTemplateId);
                that.goalActionModel.set('ApEvaluationTemplates', evalTemplateCopy);
                that.goalActionModel.set('ApSwotanalyseTemplateId', that.ApSwotanalyseTemplateId);
                that.goalActionModel.set('ApSwotanalyseTemplates', apSwotanalyseTemplates);

                if (that.modelChanged && that.goalActionTemplateId) {
                    that.goalActionTemplate.set('Id', vmCommon.emptyGuid);
                }
            }
            else {
                that.resetForm();
            }

            vmGoalAction.goalActionEvalOptions.cb();

            that.setModelChanged(false);
            vmGoalAction.popGoalActionEval.close();

            if (vmCommon.checkCurrentPage(vmCommon.enumPage.TeamBoard))
                vmCommon.Mediator.publish('RELOAD_BOARDLINE_COLUMN');

            if (vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap)) {
                var quartCpn = vmCommon.getChildComponent(msRoadmapApp, "rm-view-quarter");
                var monthCpn = vmCommon.getChildComponent(msRoadmapApp, "rm-view-month");

                let cpn = quartCpn.length > 0 ? quartCpn[0] : monthCpn.length > 0 ? monthCpn[0] : null;
                if (cpn && cpn.isOpenNavigator && cpn.gaItem)
                    cpn.reLoadGoalActionContext();
            }

            return true;
        });
    }
    else {
        // case:create new goal action

        that.goalActionModel.set('ActionPlanEvalData', that.EvalObjectSaving);
        that.goalActionModel.set('ApEvaluationComment', that.EvaluationComment);
        that.goalActionModel.set('ApEvaluation', that.Evaluation);
        that.goalActionModel.set('ApProductTemplateId', that.ApProductTemplateId);
        that.goalActionModel.set('ApProductTemplates', productTemplateCopy);
        that.goalActionModel.set('ApEvaluationTemplateId', that.ApEvaluationTemplateId);
        that.goalActionModel.set('ApEvaluationTemplates', evalTemplateCopy);
        that.goalActionModel.set('ApSwotanalyseTemplateId', that.ApSwotanalyseTemplateId);
        that.goalActionModel.set('ApSwotanalyseTemplates', apSwotanalyseTemplates);

        if (that.modelChanged && that.goalActionTemplateId) {
            that.goalActionTemplate.set('Id', vmCommon.emptyGuid);
        }

        that.setModelChanged(false);
        vmGoalAction.popGoalActionEval.close();
        return true;
    }
};

vmApEval.saveState = function () {
    var that = this;

    // Get value tab #1
    that.EvalObjectSaving.APEvaluations = vmCommon.deepCopy(vmApEval.ProductEvaluations);
    that.EvalObjectSaving.ApEvaluationComment = vmApEval.ApEvaluationComment;
    that.EvalObjectSaving.Evaluation = vmApEval.Evaluation;

    that.EvalObjectSaving.APEvaluations.map(item => {
        if (isNaN(item.Id)) {
            item.Id = 0;
        }
    });

    var apSwotanalyseTemplates = null;

    if (typeof vmApSwotanalyse != 'undefined' && vmApSwotanalyse != null) {
        that.EvalObjectSaving.ApSwotanalyses = vmApSwotanalyse.getSaveData();
        apSwotanalyseTemplates = vmApSwotanalyse.getSaveTemplate();
        that.ApSwotanalyseTemplateId = vmApSwotanalyse.ApSwotanalyseTemplateId;
    }

    var productTemplateCopy = null;

    if (typeof vmApProduct != 'undefined' && vmApProduct != null && typeof (vmApProduct) == 'object' && vmApProduct.SMTargetData != null
        && JSON.stringify(vmApProduct.SMTargetData) != JSON.stringify({})) {

        that.EvalObjectSaving.TargetData = vmApProduct.getTargetToSave();

        productTemplateCopy = vmApProduct.getTemplateToSave();
        that.ApProductTemplateId = vmApProduct.ApProductTemplateId;
    }

    var evalTemplateCopy = vmCommon.deepCopy(that.ApEvaluationTemplates);
    if (evalTemplateCopy != null) {
        evalTemplateCopy.map(t => {
            if (t.ApEvaluations != undefined) {
                t.ApEvaluations.map(item => item.Id = 0);
            }
        });
    }

    that.goalActionModel.set('ActionPlanEvalData', that.EvalObjectSaving);
    that.goalActionModel.set('ApEvaluationComment', that.ApEvaluationComment);
    that.goalActionModel.set('ApEvaluation', that.Evaluation);
    that.goalActionModel.set('ApProductTemplateId', that.ApProductTemplateId);
    that.goalActionModel.set('ApSwotanalyseTemplateId', that.ApSwotanalyseTemplateId);
    that.goalActionModel.set('ApEvaluationTemplateId', that.ApEvaluationTemplateId);

    that.goalActionModel.set('ApProductTemplates', productTemplateCopy);
    that.goalActionModel.set('ApEvaluationTemplates', evalTemplateCopy);
    that.goalActionModel.set('ApSwotanalyseTemplates', apSwotanalyseTemplates);

    that.resetForm();
};

vmApEval.resetForm = function () {
    vmApEval.ApEvaluationTemplates = [];
    vmApEval.ApEvaluationTemplateId = null;

    vmApEval.ApProductTemplates = [];
    vmApEval.ApProductTemplateId = null;

    vmApEval.ApSwotanalyseTemplates = [];
    vmApEval.ApSwotanalyseTemplateId = null;

    vmApEval.ApEvaluationComment = '';
    vmApEval.Evaluation = null;

    if (typeof (vmApSwotanalyse) != 'undefined') {
        vmApSwotanalyse.SwotanalyseData = null;
    }

    if (typeof (vmApProduct) == 'object') {
        vmApProduct.SMTargetData = null;
    }
    vmApEval.EvalObjectSaving = {};

    vmApEval.setModelChanged(false);
};

vmApEval.updateTotalEval = function () {
    var total = 0;
    var evaluation = null;
    var evalArr = vmApEval.ProductEvaluations ? vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1) : [];

    if (evalArr.length > 0) {
        total = evalArr.map(t => t.Evaluation * t.Priority).reduce((sum, element) => sum + element);

        evaluation = Math.round(total / evalArr.length);
        $('#txtTotalEvaluation').text(kLg.lblTotalEvaluation + Math.round(total / evalArr.length));
    } else {
        $('#txtTotalEvaluation').text('');
    }

    vmApEval.Evaluation = evaluation;

    return total;
};
//#endregion

//#region Evaluation
vmApEval.addEval_Onclick = function () {
    vmApEval.setModelChanged();

    var countEval = vmApEval.ProductEvaluations.length;
    var mIndex = 0;

    if (countEval > 0) {
        mIndex = Math.max(...vmApEval.ProductEvaluations.map(t => t.MIndex)) + 1;
    }

    var i = 0;

    var _name = kLg.criteria + ' (' + (i + 1) + ')';
    while (!vmApEval.validEvaluationName(_name)) {
        i++;
        _name = kLg.criteria + ' (' + (i + 1) + ')';
    }

    var newEval = {
        Id: vmCommon.newGuid(),
        Name: _name,
        Priority: 0,
        Evaluation: 0,
        MIndex: mIndex,
        Mdf: 0,
        CreatedBy: 1
    };

    //Check role
    //if (!vmGAE.dataservice.hasRole())
    //    return;

    vmApEval.ApEvaluationTemplateId = null;
    vmApEval.ProductEvaluations.push(newEval);

    vmApEval.reloadGridData();
};

vmApEval.delEval_Onclick = function (e) {
    pConfirm(kLg.confirmDeleteItem).then(function () {
        var $parent = $(e).parents('tr');
        var _evalId = $parent.attr('id');

        var index = vmApEval.ProductEvaluations.findIndex(t => t.Id == _evalId && t.DeletedBy != 1);
        var entryData = vmApEval.ProductEvaluations.find(t => t.Id == _evalId && t.DeletedBy != 1);
        if (!entryData) {
            return;
        }

        vmApEval.ApEvaluationTemplateId = null;

        if (isNaN(entryData.Id)) {
            vmApEval.ProductEvaluations.splice(index, 1);
        }
        else {
            entryData.DeletedBy = 1;
        }

        vmApEval.reloadGridData();

        vmApEval.setModelChanged();
    });
};

function evalDdl_Onchange(e) {
    var idPe = $(e.sender._inputWrapper[0]).parents('tr').attr('id');

    var proEval = vmApEval.ProductEvaluations.find(t => t.Id == idPe);

    proEval.ModifiedBy = 1;
    proEval.Priority = e.sender._old;

    vmApEval.ApEvaluationTemplateId = null;
    vmApEval.setModelChanged();
    vmApEval.updateTotalEval();
    vmCommon.VmChartEvaluationXYZ.calcElementEvalX(vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1));
}

function slider_Onchange(e) {
    if ($(loadingDivElem).css('display') == 'block') return;

    var idPe = $(e.sender.element).parents('tr').attr('id');

    var proEval = vmApEval.ProductEvaluations.find(t => t.Id == idPe);

    proEval.ModifiedBy = 1;
    proEval.Evaluation = e.value;

    vmApEval.ApEvaluationTemplateId = null;
    vmApEval.setModelChanged();
    vmApEval.updateTotalEval();
    vmCommon.VmChartEvaluationXYZ.calcElementEvalX(vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1));
}
//#endregion
function ddlEvalTemp_Onchange() {
    if (parseInt(ddlEvalTemp.value()) === -1 || ddlEvalTemp.value() == kLg.btnSelectTemp) {
        vmApEval.ApEvaluationTemplateId = null;
        vmCommon.VmChartEvaluationXYZ.clearTemplate();
    }
    else {
        pConfirm(kLg.msgConfirmApplyNewTemplate).then(function () {
            preEvalTempVal = ddlEvalTemp.value();
            vmApEval.ApEvaluationTemplateId = ddlEvalTemp.value();
            var evalTemplate = vmApEval.ApEvaluationTemplates.find(t => t.Id == preEvalTempVal);

            if (evalTemplate != null) {
                if (evalTemplate.ApEvaluations == undefined) {

                    vmApEval.dataservice.getListEvalByTemplateId(ddlEvalTemp.value(), (res) => {

                        var evalTemplateEvals = res.value;

                        evalTemplateEvals.map(t => {
                            t.Id = vmCommon.newGuid();
                            t.Evaluation = 0;
                        });

                        //deleted old evals
                        var oldEvals = vmApEval.ProductEvaluations.filter(t => !isNaN(t.Id)).map(t => {
                            t.DeletedBy = 1;
                            return t;
                        });
                        vmApEval.ProductEvaluations = oldEvals.concat(evalTemplateEvals);
                        vmApEval.reloadGridData();

                        evalTemplate.ApEvaluations = vmCommon.deepCopy(evalTemplateEvals);
                    });
                } else {
                    var evalTemplateEvals = evalTemplate.ApEvaluations.filter(t => t.DeletedBy != 1).map(t => {
                        t.Id = vmCommon.newGuid();
                        t.CreatedBy = 1;
                        t.ModifiedBy = 0;
                        t.DeletedBy = 0;
                        t.Evaluation = 0;
                        return t;
                    });

                    //deleted old evals
                    var oldEvals = vmApEval.ProductEvaluations.filter(t => !isNaN(t.Id)).map(t => {
                        t.DeletedBy = 1;
                        return t;
                    });

                    vmApEval.ProductEvaluations = oldEvals.concat(vmCommon.deepCopy(evalTemplateEvals));
                    vmApEval.reloadGridData();
                }
                vmApEval.setModelChanged();
                vmCommon.VmChartEvaluationXYZ.changeTemplate(evalTemplate);
            }
        }, function () {
            ddlEvalTemp.value(preEvalTempVal);
        });
    }
}

vmApEval.SaveEvalTemp = function () {
    var that = this;

    if (that.ProductEvaluations.length === 0) {
        $('#txtTempName').attr('title', kLg.msgRequiredElement);
        $("#txtTempName").tooltip({ placement: 'top', trigger: 'manual' }).tooltip('show');
        return;
    }

    var currentEvals = vmCommon.deepCopy(vmApEval.ProductEvaluations);
    var currentEvals1 = vmCommon.deepCopy(vmApEval.ProductEvaluations);

    //deleted old evals
    var oldEvals = currentEvals1.filter(t => !isNaN(t.Id)).map(t => {
        t.DeletedBy = 1;
        return t;
    });

    var newEvals = currentEvals.filter(t => t.DeletedBy != 1).map(t => {
        t.Id = vmCommon.newGuid();
        t.CreatedBy = 1;
        t.ModifiedBy = 0;
        t.DeletedBy = 0;
        return t;
    });

    this.ProductEvaluations = oldEvals.concat(vmCommon.deepCopy(newEvals));
    this.reloadGridData();

    // map data to save
    var saveItem = vmCommon.deepCopy(newEvals).map(item => {
        if (isNaN(item.Id)) {
            item.Id = 0;
        }
        return item;
    });
    
    var newTemplate = {
        Id: vmCommon.newGuid(),
        Name: $('#txtTempName').val(),
        Type: templateType.ApEvaluationTemplate,
        ApEvaluations: saveItem,
        CreatedBy: 0,
        ModifiedBy: 0, 
        ActionGoalId: vmApEval.goalActionId 
    };

    if (that.evalTempAction == templateAction.Add) {
        newTemplate.CreatedBy = 1;
    }
    else if (vmApEval.evalTempAction == templateAction.Update) {
        var tempId = ddlEvalTemp.value();

        var tempObject = that.ApEvaluationTemplates.find(t => t.Id == tempId);

        that.ApEvaluationTemplateId = tempId;
        tempObject.Name = newTemplate.Name;
        tempObject.ModifiedBy = 1;
        tempObject.ApEvaluations = newTemplate.ApEvaluations;

        newTemplate = tempObject;
    }

    that.dataservice.saveTemplate(newTemplate, (rs) => {
        if (that.evalTempAction == templateAction.Add) {
            newTemplate.CreatedBy = 0;
            newTemplate.Id = rs.value;

            that.ApEvaluationTemplateId = newTemplate.Id;
            that.ApEvaluationTemplates.push(newTemplate);
            //that.initddlApEvalTemps(newTemplate.Id);

            //that.closeLayout();
        }
        else if (vmApEval.evalTempAction == templateAction.Update) {
            //tempObject.ModifiedBy = 0;
            //this.initddlApEvalTemps(rs.value);

            //this.closeLayout();
        }
    });
};

function clPicker_Onchange(e) {
    var index = $(e.sender.element[0]).parents('tr').attr('index');
    if (getTotalMarketShare() > 100) {
        return;
    }
    vmApEval.productCompetitions[index].Color = e.value;

    saveCompe(vmApEval.productCompetitions[index], index);
};

//SONPT. unused. replace by vmSME.btnOpenTemplate_Onclick

vmApEval.bindEvent = function () {
    $("#txtEvaluationComment").on("keyup", function () {
        var tempText = $(this).val().trim();
        if (vmApEval.EvaluationComment === tempText) return;

        vmApEval.ApEvaluationComment = tempText;
        vmApEval.setModelChanged();
    });
};

//??? dblclick, blur
function editing(obj) {
    var $elem = $(obj);
    if ($elem.attr("index") == 0)
        return;
    $elem.hide();
    if ($elem[0].tagName === "INPUT") {
        var $span = $elem.prev(),
            value = $elem.val();
        $span.text(value).attr('title', value).show();
    } else {
        var $input = $elem.next('input');
        var textVal = $elem.text();
        $input.css('display', 'block');
        $input.show().focus();
        $input.select();
        $input.val(textVal);
    }
};
//#endregion

//#region Setup

vmApEval.setupSortableProductEvaluation = function () {
    var that = this;

    //private function
    function prvChangePositionProductEvaluation(desId, sourceId, position) {
        var groupDes = vmApEval.ProductEvaluations.find(t => t.Id == desId);
        var groupSource = vmApEval.ProductEvaluations.find(t => t.Id == sourceId);

        var groupSourceCopy = vmCommon.deepCopy(groupSource);
        var groupDesCopy = vmCommon.deepCopy(groupDes);

        groupDes.MIndex = groupSourceCopy.MIndex;
        groupSource.MIndex = groupDesCopy.MIndex;

        groupDes.ModifiedBy = 1;
        groupSource.ModifiedBy = 1;

        that.ApEvaluationTemplateId = null;
        that.setModelChanged();
    }

    var selector = "#ap-body-eval";
    //check role later
    var preListProductEvaluation = [];
    var preIndex = 0;
    //var source = null;        
    $(selector).sortable({
        revert: false,
        handle: '.dragProductEvaluationhandler',
        cursor: 'default',
        cursorAt: { top: 0, left: 0 },
        start: function (event, ui) {
            preListProductEvaluation = [];// reset each time user drag. Cause error if user drag the same element many times
            $(selector).find('tr[type=PE]').each(function () {
                preListProductEvaluation.push($(this).attr('val'));
            });
            preIndex = preListProductEvaluation.indexOf(ui.item.attr('val'));
        },
        stop: function (event, ui) {
            var lastListRegionEvaluation = [];
            //var sourceId = source.attr('val');
            var sourceId = ui.item.attr('val');
            $(selector).find('tr[type=PE]').each(function () {
                lastListRegionEvaluation.push($(this).attr('val'));
            });
            var desId = preListProductEvaluation[lastListRegionEvaluation.indexOf(sourceId)];
            if (sourceId == desId) return;
            var position = lastListRegionEvaluation.indexOf(desId) - preListProductEvaluation.indexOf(desId) > 0 ? 0 : 1;
            prvChangePositionProductEvaluation(desId, sourceId, position);
        }
    });
};

function setupProductSpanBackgroundColor() {
    $('.product-span').css('background-color', '#76838a');
    $('.product-span').css('color', '#ffffff');
    $('.prodPosition').each(function () {
        $('tr:first td:first span', this).css('background-color', '#76838a');
        $('tr:first td:first span', this).css('color', '#ffffff');
    });
}

function setupMarketShareNumberic() {
    lstMarketShareNumberic.length = 0;
    $('input.percentage').each(function (index, elem) {
        var numberic = setupOneMarketShareNumberic($(this));

        if (numberic != null)
            lstMarketShareNumberic.push(numberic);
    });
};

function setupOneMarketShareNumberic($elem) {
    var numberic = $elem.kendoNumericTextBox({
        format: "# \\%",
        min: 0,
        max: 100,
        step: 1,
        spinners: false,
        change: setSlider,
        decimals: 0
    }).data("kendoNumericTextBox");
    return numberic;
};

vmApEval.setupAllEvaluationSlider = function () {
    lstEvalSlider.length = 0;
    $('.evalSlider').each(function () {
        var slider = setupEvalSlider($(this));
        if (slider != null)
            lstEvalSlider.push(slider);
    });
};

function setupEvalSlider($elem) {
    var slider = $elem.kendoSlider({
        change: slider_Onchange,
        showButtons: false,
        min: -10,
        max: 10,
        smallStep: 1,
        //slide: function (e) {
        //    console.log('evalSlider slide', e);
        //}
    }).data("kendoSlider");

    //const sdrs = document.querySelectorAll('a.k-draghandle');
    //if (sdrs) {
    //    for (var i = 0, len = sdrs.length; i < len; i++) {
    //        sdrs[i].addEventListener('mousedown', function (e) {
    //            vmCommon.dnbTooltipShown = e;
    //            vmCommon.dnbTooltipShownT = setTimeout(function () {
    //                $('.k-widget.k-tooltip.k-slider-tooltip').remove();
    //                delete vmCommon.dnbTooltipShown;
    //                delete vmCommon.dnbTooltipShownT;
    //            }, 6000);
    //        }, false);
    //        sdrs[i].addEventListener('mouseup', function (e) {
    //            if (vmCommon.dnbTooltipShown && $(vmCommon.dnbTooltipShown.target).offset().top != $(e.target).offset().top) {
    //                console.log($('.k-widget.k-tooltip.k-slider-tooltip').length);
    //                $('.k-widget.k-tooltip.k-slider-tooltip').remove();
    //                clearTimeout(vmCommon.dnbTooltipShownT);
    //                delete vmCommon.dnbTooltipShown;
    //                delete vmCommon.dnbTooltipShownT;
    //            } else {
    //                if (vmCommon.dnbTooltipShown) delete vmCommon.dnbTooltipShown;
    //                if (vmCommon.dnbTooltipShownT) {
    //                    clearTimeout(vmCommon.dnbTooltipShownT);
    //                    delete vmCommon.dnbTooltipShownT;
    //                }
    //            }
    //        }, false);
    //    }
    //}
    return slider;
};

vmApEval.setupEditableLabel = function () {
    bindSwitchSpanToInputProductEvaluation(updateEvalName, "editAble", removeHover, () => { });
};
//#endregion

//#region Ultilities
function bindSwitchSpanToInputProductEvaluation(updateFunction, cssSelector, removeHover, addHover) {
    var oldText = '';
    var switchToInput = function () {
        var $input = $("<input>", {
            val: $(this).text(),
            type: "text"
        });
        oldText = $(this).text();
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

        $input.keyup(function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                $input.mouseleave();
            }
        });
    };

    var switchToSpan = function () {
        var $span = $("<span>", {
            text: ''
        });

        var e = $(this);
        if (!updateFunction(e)) { //valid false
            $span.text(oldText);
            $span.attr('title', oldText);
        } else {
            $span.text(e.val());
            $span.attr('title', e.val());
        }

        addHover();
        $span.addClass(cssSelector);
        $span.addClass("label-input nameField w-100perw-100per-word-break");
        $span.addClass("w-100per-word-break nameField boxSizing compeName");

        $(this).replaceWith($span);
        $span.on("click", switchToInput);

    };
    $("." + cssSelector).on("click", switchToInput);
}

function updateEvalName(e) {
    //var index = $(e).parents('tr').attr('index');
    var proEvalId = $(e).parents('tr').attr('id');

    var productEval = vmApEval.ProductEvaluations.find(t => t.Id == proEvalId);

    //Validate
    if (!vmApEval.validEvaluationName($(e).val().trim())) {

        $(e).val(productEval.Name);
        //$(e).attr("title", kLg.tooltipValidProductEvaluation);
        //$(e).tooltip({ trigger: "manual" }).tooltip('show');        
        //setTimeout(function () {

        //    $(e).tooltip('destroy');  // e is hided
        //}, 3000);//why won't work

        return false;
    }

    if (productEval) {
        productEval.ModifiedBy = 1;
        productEval.Name = $(e).val().trim();

        vmApEval.ApEvaluationTemplateId = null;
        vmApEval.setModelChanged();
    }

    return true;
}

function setSlider(e) {
    var $parent = $(e.sender._text[0]).parents('tr');
    var index = $parent.attr('index');
    var currentSlider = lstMarketShareNumberic[index].value();
    if (!currentSlider) {
        currentSlider = 0;
        lstMarketShareNumberic[index].value(currentSlider);
    }

    vmApEval.productCompetitions[index].MarketShare = currentSlider;

    lstCompeSlider[index].value(currentSlider);

    var $currentUnsave = $parent.find('.compeUnsaved');
    if (getTotalMarketShare() > 100) {
        $currentUnsave.show();
        return;
    }

    var $lstUnsaved = $('#body-compe').find('div.compeUnsaved:visible');
    var lstCompe = [];
    if ($currentUnsave.is(':hidden'))
        lstCompe.push({ Index: index, ProductCompetition: vmApEval.productCompetitions[index] });
    $lstUnsaved.each(function () {
        var ix = $(this).parents('tr').attr('index');
        lstCompe.push({ Index: ix, ProductCompetition: vmApEval.productCompetitions[ix] });
    });

    updateMultipleCompe(lstCompe);
}

function removeHover() {
    $("#swotArea a.icon-add-small").hide();
    $('a.icon-bin-small').hide();
    $('td').unbind('mouseenter mouseleave');
}

function showHideRemoveButton() {
    registerEnterTextboxEvent();
}

function registerEnterTextboxEvent() {
    $('.hiddenTextbox').off('keypress').on('keypress', function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $(this).blur();
        }
    });
}

vmApEval.disableAllControl = function () {
    //$('.btnAddTemp').attr("onclick", "");
    //$('.btnUpdateTemp').attr("onclick", "");
    //$('.btnDelTemp').attr("onclick", "");
    //$('.btnDelTempPosition').attr("onclick", "");
    //$('.btnUpdateTempPosition').attr("onclick", "");
    //$('.btnAddTempPosition').attr("onclick", "");
    //$('.btnImportTemp').attr("onclick", "");

    $('.ctrSubHeader').hide();

    $('#frmApEval button').attr("disabled", true);

    $('#txtEvaluationComment').attr("disabled", "disabled");
    $('#pProductEvaluation').find(".remove").hide();
    $('#pProductEvaluation').find('a.icon-add-small').hide();
    $('table.ptable td.field_value, table.table-submarkert td.field_value').off('mouseenter');
    $('#area-positions .area-prodPosition').off('mouseenter');
    $('#pProductEvaluation').find("input").attr("disabled", "disabled");
    $('#pProductEvaluation').find("textarea").attr("disabled", "disabled");
    $('#pProductEvaluation').find("select").attr("disabled", "disabled");
    $('#pProductEvaluation').find("span").attr("ondblclick", "");
    $('.dragProductEvaluationhandler').addClass('disable-pointer');
    $('.icon-bin-small').hide();// hide all delete button of evaluation
    $('#pProductEvaluation').addClass('disable-pointer'); //disable all tab elements

    for (var i = 0; i < lstDdlPositionTemp.length; i++) {
        lstDdlPositionTemp[i].enable(false);
    }
    for (var j = 0; j < lstCompeSlider.length; j++) {
        lstCompeSlider[j].enable(false);
    }
    if (lstEvalSlider.length) {
        for (var i = 0; i < lstEvalSlider.length; i++) {
            lstEvalSlider[i].enable(false);
        }
    }
    if (lstEvalDropdown.length) {
        for (var l = 0; l < lstEvalDropdown.length; l++) {
            lstEvalDropdown[l].enable(false);
        }
    }
    if (ddlPositionUnit.length) {
        for (var n = 0; n < ddlPositionUnit.length; n++) {
            ddlPositionUnit[n].enable(false);
        }
    }
    if (lstColorPicker.length) {
        for (var k = 0; k < lstColorPicker.length; k++) {
            lstColorPicker[k].enable(false);
        }
    }
    ddlEvalTemp.enable(false);
};

function setupCommonControls() {
    setupProductSpanBackgroundColor();

    showHideRemoveButton();
}

function setupColorPicker(selector) {
    //input.compeColorIn
    selector.each(function (ind, elem) {
        var clPicker = $(elem).kendoColorPicker({
            value: vmCommon.defaultColor,
            buttons: false,
            columns: 9,
            tileSize: {
                width: 25,
                height: 22
            },
            palette: colorPalette,
            change: clPicker_Onchange
        }).data("kendoColorPicker");
        lstColorPicker.push(clPicker);
    });
}
//#endregion

//#region Validation
function checkRequired(value) {
    if ($.trim(value).length == 0) {
        return false;
    }
    return true;
}

vmApEval.validEvaluationName = function (value) {
    if ($.trim(value).length == 0) {
        return false;
    }
    if (vmApEval.ProductEvaluations.filter(t => t.DeletedBy != 1).map(function (x) { return x.Name; }).indexOf(value) > -1)
        return false;
    return true;
};

function checkMaxLength(value, maxLength) {
    if ($.trim(value).length > maxLength)
        return false;
    return true;
}
//#endregion

//#region Delete Template Popup
vmApEval.btnOpenTemplate_Onclick = function (type, positionIndex) {
    var that = this;
    vmApEval.currentSelectedPositionIndex = positionIndex;
    vmApEval.templateType = type;
    if (vmApEval.curRole > 0) {
        var data = that.ApEvaluationTemplates.filter(t => t.DeletedBy != 1);

        bindTemplate('deleteTempWindow', 'delete-temp-pop-eval', data);

        $('#lblTemplateNameDeleteTemplate').text(kLg.lblTemplateName);
        $('.btnChoose').text(kLg.btnDelTemp);
        $('.btnCancel').text(kLg.btnCancel);

        //pop auto height -> should write function
        that.deleteTempWindow = showPopup2(null, $('#deleteTempWindow'), null, kLg.DeleteTemplate, 640, $('#deleteTempWindow').height(), function () {
            that.deleteTempWindow.destroy(); //also remove div deleteTempWindow. Try $('#deleteTempWindow').empty(); $('#deleteTempWindow').html(''); -> All attributes were created by Kendo still exist
            that.deleteTempWindow = null;
            $('#productEvaluationArea').append('<div id="deleteTempWindow"> </div>');// re add for later use
        });
        if (that && that.deleteTempWindow) that.deleteTempWindow.element.focus();

    }
};

vmApEval.btnDeleteTemplate_Onclick = function () {
    var that = this;

    var lstId = [],
        $selectedTemp = $('.cbTemp:checked');
    $selectedTemp.each(function () {
        lstId.push($(this).parents('tr').attr('id'));
    });
    if (lstId.length > 0) {
        const tmplId = evalApp.ap.ApEvaluationTemplateId;
        pConfirm(kLg.msgConfirmDelTemplate).then(function () {

            if (lstId.indexOf(evalApp.ap.ApEvaluationTemplateId) >= 0) {
                evalApp.ap.ApEvaluationTemplateId = null;
                evalApp.ap.isChangeTemplate = false;
            }

            lstId.forEach(id => {
                var index = evalApp.ap.ApEvaluationTemplates.findIndex(t => t.Id == id);
                if (index >= 0) {
                    var templateItem = evalApp.ap.ApEvaluationTemplates.splice(index, 1)[0];

                    templateItem.DeletedBy = 1;
                    that.dataservice.saveTemplate(templateItem, (rs) => {
                        if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                            MsaApp.deleteEvalTemplate(tmplId);
                        }
                    });
                }
            });
            vmApEval.btnCloseDelTemplatePopup_Onclick();
        });
    } else {
        vmApEval.btnCloseDelTemplatePopup_Onclick();
    }
};

vmApEval.btnCloseDelTemplatePopup_Onclick = function () {
    if (vmApEval.deleteTempWindow)
        vmApEval.deleteTempWindow.close();
};

vmApEval.closeLayout = function (obj) {
    $('#btnSaveTemplateSubMarket').unbind('click'); // avoid repeat on_click when open pop many times
    enableButtonPopup();
    this.popCreateEvalTemp.close();
};

vmApEval.bindSaveTemplatePopup = function () {
    $('#btnSaveTemplateSubMarket').bind('click', function () {
        disableButtonPopup();
        //vmSME.evalTempAction
        $("#txtTempName").tooltip('destroy');
        var tempName = $('#txtTempName').val();
        if (!checkRequired(tempName)) {
            //showError('msgEditTemplate', kLg.msgRequiredTempName);
            //$('#txtTempName').attr('title', kLg.msgRequiredTempName);
            //$("#txtTempName").tooltip({ placement: 'top', trigger: 'manual' }).tooltip('show');
            //$('#txtTempName').focus();
            vmCommon.showTooltip($('#txtTempName'), kLg.msgRequiredTempName, 0, true);
            enableButtonPopup();
            return;
        }
        $('#btnSaveTemplateSubMarket').unbind('click');
        if (vmApEval.templateType == templateType.ApEvaluationTemplate) {
            vmApEval.SaveEvalTemp();
        }
    });
};
//#endregion

// #region InitTab
vmApEval.TabSwotAnalyse_Onclick = function () {
    this.isClickOpenTab = true;
    vmApEval.openingTab = 'idTabSwotAnalyse';
    $('#tabSwotAnalyse').load('/Contents/MsPopGoalActionEval_TabSwotAnalyse.html');
    $('.k-tooltip').hide();
};

vmApEval.TabProductStructure_Onclick = function () {
    this.isClickOpenTab = true;
    vmApEval.openingTab = 'idTabProductStructure';
    $('#tabProductStructure').load('/Contents/MsPopGoalActionEval_MsTabProductStructure.html');
    $('.k-tooltip').hide();
};

vmApEval.TabProductEvaluation_Onclick = function () {
    this.isClickOpenTab = true;
    vmApEval.openingTab = 'idTabProductEvaluation';
    $('.k-tooltip').hide();
};
// #Endregion InitTab

// #region Tab2

vmApSwotanalyse.bindDataToObject = function () {
    var that = this;

    return that.dataservice.getData(vmApEval.goalActionId).then((data) => {
        if (vmApEval.goalActionId) {
            that.SwotanalyseData.Criterias = data.value.ApSwotanalyse.Criterias;
            that.SwotanalyseData.Trends = data.value.ApSwotanalyse.Trends;
        }

        that.ApSwotanalyseTemplates = data.value.ApSwotanalyseTemplates;

        if (that.goalActionTemplateId) {
            return that.dataservice.getDataByTemplateId(that.goalActionTemplateId).then(resData => {

                var _newData = resData.value;

                _newData.Criterias.map(t => {
                    var tempId_parent = vmCommon.newGuid();

                    t.TempId = tempId_parent;
                    t.Id = tempId_parent;
                    t.CreatedBy = 1;

                    if (t.Childs.length > 0) {
                        t.Childs.map(child => {
                            var tempId_child = vmCommon.newGuid();

                            child.Id = tempId_child;
                            child.TempSwotanalyseId = tempId_parent;
                            child.SwotanalyseId = tempId_parent;
                            child.CreatedBy = 1;
                        });
                    }
                });

                _newData.Trends.map(t => {
                    var tempId_parent = vmCommon.newGuid();

                    t.TempId = tempId_parent;
                    t.Id = tempId_parent;
                    t.CreatedBy = 1;

                    if (t.Childs.length > 0) {
                        t.Childs.map(child => {
                            var tempId_child = vmCommon.newGuid();

                            child.Id = tempId_child;
                            child.TempSwotanalyseId = tempId_parent;
                            child.SwotanalyseId = tempId_parent;
                            child.CreatedBy = 1;
                        });
                    }
                });

                that.SwotanalyseData.Criterias.map(t => {
                    t.DeletedBy = 1;

                    if (t.Childs.length > 0) {
                        t.Childs.map(child => {
                            child.DeletedBy = 1;
                        });
                    }
                });

                that.SwotanalyseData.Trends.map(t => {
                    t.DeletedBy = 1;

                    if (t.Childs.length > 0) {
                        t.Childs.map(child => {
                            child.DeletedBy = 1;
                        });
                    }
                });

                that.SwotanalyseData.Criterias = vmApSwotanalyse.SwotanalyseData.Criterias.concat(_newData.Criterias);
                that.SwotanalyseData.Trends = vmApSwotanalyse.SwotanalyseData.Trends.concat(_newData.Trends);

                return Promise.resolve(_newData);
            });
        }
        else {
            return Promise.resolve(that.SwotanalyseData);
        }
    });
};

vmApSwotanalyse.getSaveData = function () {
    var that = this;
    var resultArr = [];

    if (that.SwotanalyseData == undefined || that.SwotanalyseData == null) {
        return null;
    }

    var temp = vmCommon.deepCopy(that.SwotanalyseData);

    temp.Criterias.map(t => {
        t.TempId = t.Id;
        t.Id = isNaN(t.Id) ? 0 : t.Id;

        if (t.Childs.length > 0) {
            t.Childs.map(child => {
                child.Id = isNaN(child.Id) ? 0 : child.Id;
                child.TempSwotanalyseId = child.SwotanalyseId;
                child.SwotanalyseId = isNaN(child.SwotanalyseId) ? 0 : child.SwotanalyseId;
            });
        }
    });

    resultArr = temp.Criterias;

    temp.Trends.map(t => {
        t.TempId = t.Id;
        t.Id = isNaN(t.Id) ? 0 : t.Id;

        if (t.Childs.length > 0) {
            t.Childs.map(child => {
                child.Id = isNaN(child.Id) ? 0 : child.Id;
                child.TempSwotanalyseId = child.SwotanalyseId;
                child.SwotanalyseId = isNaN(child.SwotanalyseId) ? 0 : child.SwotanalyseId;
            });
        }
        resultArr.push(t);
    });

    return resultArr;
};

vmApSwotanalyse.getSaveTemplate = function () {
    var that = this;

    var temp = vmCommon.deepCopy(that.ApSwotanalyseTemplates);

    if (!that.ApSwotanalyseTemplates) {
        return null;
    }

    temp.map(swot => {
        var items = swot.ApSwotanalyses;

        if (items != undefined && items != null) {
            items.map(t => {
                t.TempId = t.Id;
                t.Id = isNaN(t.Id) ? 0 : t.Id;

                if (t.Childs.length > 0) {
                    t.Childs.map(child => {
                        child.Id = isNaN(child.Id) ? 0 : child.Id;
                        child.TempSwotanalyseId = child.SwotanalyseId;
                        child.SwotanalyseId = isNaN(child.SwotanalyseId) ? 0 : child.SwotanalyseId;
                    });
                }
            });
        }
    });

    return temp;
};

vmApSwotanalyse.dataservice = (function () {
    function callAjaxMsAPEvalHandler(divId, funcName, entryData, requestType, successCallBack, url = null) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId;
        if (url) {
            _url = url;
        }

        return callAjax(divId, _url, entryData, successCallBack, requestType);
    }

    var callAjaxByPost = function (funcName, entryData, successFunc) {
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, JSON.stringify(entryData), AjaxConst.PostRequest, successFunc);
    };

    var callAjaxByGet = function (funcName, urlPara, successFunc) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + urlPara;
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, null, AjaxConst.GetRequest, successFunc, _url);
    };

    var getData = function (goalActionId, cb) {
        var urlPara = '&goalActionId=' + goalActionId;
        return callAjaxByGet("getswotanalyse", urlPara, cb);
    };

    var saveTemplate = function (entryData, successFunc) {
        return callAjaxByPost("saveTemplateTab2", entryData, successFunc);
    };

    var getDataByTemplateId = function (templateType, cb) {
        var urlPara = '&templateId=' + templateType;
        return callAjaxByGet("getDataTab2ByTemplateId", urlPara, cb);
    };

    return {
        getData: getData,
        saveTemplate: saveTemplate,
        getDataByTemplateId: getDataByTemplateId
    };
})();

// #end region Tab 2

//#region tab 3

vmApProduct.bindDataToObject = function () {
    var that = this;

    var entryData = { TargetName: kLg.Ansprechgruppen, ChartName: that.goalActionName, GoalActionId: that.goalActionId };
    return that.dataservice.getData(entryData).then(data => {
        that.ListTarget = [];

        if (that.goalActionId) {
            that.SMTargetData = data.value;
        }

        that.ApProductTemplates = data.value.ApProductTemplates;

        if (that.goalActionTemplateId != null) {
            return that.dataservice.getDataByTemplateId(that.goalActionTemplateId).then(resData => {

                that.replaceData(resData.value);

                return Promise.resolve();
            });
        }
        else {
            return Promise.resolve();
        }
    });
};

vmApProduct.replaceData = function (_newData) {
    var _dictChart = {};
    var _dictDemand = {};

    // refresh current data to new data
    _newData.DemandCharts.map(t => {
        var _tmpNewGuid = vmCommon.newGuid();

        _dictChart['chart_' + t.Id] = _tmpNewGuid;
        t.Id = _tmpNewGuid;
        t.TempId = _tmpNewGuid;
        t.CreatedBy = 1;

        return t;
    });

    _newData.TargetDemands.map(t => {
        var tempId = vmCommon.newGuid();

        t.Id = tempId;
        t.TempId = tempId;
        t.CreatedBy = 1;

        t.DemandTypes.map(type => {
            type.Demands = type.Demands.filter(t => t.DeletedBy != 1).map(demand => {
                var _tmpNewGuid = vmCommon.newGuid();

                _dictDemand['demand_' + demand.Id] = _tmpNewGuid;
                demand.Id = _tmpNewGuid;
                demand.TempId = _tmpNewGuid;
                demand.CreatedBy = 1;
                return demand;
            });
        });

        return t;
    });

    _newData.DemandChartEvaluations.map(t => {
        var demandId = _dictDemand['demand_' + t.DemandId];
        t.DemandId = demandId;
        t.TmpDemandId = demandId;

        var chartId = _dictChart['chart_' + t.DemandChartId];
        t.DemandChartId = chartId;
        t.TmpDemandChartId = chartId;

        t.CreatedBy = 1;
        return t;
    });

    var _oldData = {};

    // save old data
    _oldData.DemandCharts = vmApProduct.SMTargetData.DemandCharts.filter(t => !isNaN(t.Id)).map(t => {
        t.DeletedBy = 1;
        return t;
    });

    _oldData.DemandChartEvaluations = vmApProduct.SMTargetData.DemandChartEvaluations.filter(t => !isNaN(t.DemandId) && !t.DemandChartId).map(t => {
        t.DeletedBy = 1;
        return t;
    });

    _oldData.TargetDemands = vmApProduct.SMTargetData.TargetDemands.filter(t => !isNaN(t.Id)).map(t => {
        t.DeletedBy = 1;

        t.DemandTypes.map(type => {
            type.Demands = type.Demands.filter(demand => !isNaN(demand.Id)).map(demand => {
                demand.DeletedBy = 1;
                return demand;
            });
        });
        return t;
    });

    vmApProduct.SMTargetData.DemandCharts = _oldData.DemandCharts.concat(_newData.DemandCharts);
    vmApProduct.SMTargetData.TargetDemands = _oldData.TargetDemands.concat(_newData.TargetDemands);
    vmApProduct.SMTargetData.DemandChartEvaluations = _oldData.DemandChartEvaluations.concat(_newData.DemandChartEvaluations);
};

vmApProduct.getTemplateToSave = function () {

    if (!vmApProduct.ApProductTemplates) {
        return null;
    }

    var templates = vmCommon.deepCopy(vmApProduct.ApProductTemplates);

    templates.map(tempItem => {
        var tempTargetData = tempItem.TargetData;

        if (!tempTargetData) {
            return tempItem;
        }

        // map data to saving
        tempTargetData.DemandCharts.map(t => {
            if (isNaN(t.Id)) {
                t.Id = 0;
            }
        });

        tempTargetData.DemandChartEvaluations.map(t => {
            t.DemandId = isNaN(t.DemandId) ? 0 : t.DemandId;
            t.DemandChartId = isNaN(t.DemandChartId) ? 0 : t.DemandChartId;
        });

        tempTargetData.TargetDemands.map(t => {
            if (isNaN(t.Id)) {
                t.Id = 0;
            }

            t.DemandTypes.map(type => {
                type.Demands.map(demand => {
                    if (isNaN(demand.Id)) {
                        demand.Id = 0;
                    }
                });
            });
        });
    });

    return templates;
};

vmApProduct.getTargetToSave = function () {
    var tempTargetData = vmCommon.deepCopy(vmApProduct.SMTargetData);

    // map data to saving
    tempTargetData.DemandCharts.map(t => {
        t.TempId = t.Id;
        if (isNaN(t.Id)) {
            t.Id = 0;
        }
    });

    tempTargetData.DemandChartEvaluations.map(t => {
        t.TmpDemandChartId = t.DemandChartId;
        t.TmpDemandId = t.DemandId;

        t.DemandId = isNaN(t.DemandId) ? 0 : t.DemandId;
        t.DemandChartId = isNaN(t.DemandChartId) ? 0 : t.DemandChartId;
    });

    tempTargetData.TargetDemands.map(t => {
        t.TempId = t.Id;
        if (isNaN(t.Id)) {
            t.Id = 0;
        }

        t.DemandTypes.map(type => {
            type.Demands.map(demand => {
                demand.TempId = demand.Id;
                if (isNaN(demand.Id)) {
                    demand.Id = 0;
                }

                demand.TempTargetGroupId = t.TempId;
                demand.TargetGroupId = t.Id;
            });
        });
    });

    return tempTargetData;
};

vmApProduct.dataservice = (function () {
    function callAjaxMsAPEvalHandler(divId, funcName, entryData, requestType, successCallBack, url = null) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId;
        if (url) {
            _url = url;
        }
        return callAjax(divId, _url, entryData, successCallBack, requestType);
    }

    var callAjaxByPost = function (funcName, entryData, successFunc) {
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, JSON.stringify(entryData), AjaxConst.PostRequest, successFunc);
    };

    var callAjaxByGet = function (funcName, urlPara, successFunc) {
        var _url = "../Handlers/MsActionPlanEvalHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + urlPara;
        return callAjaxMsAPEvalHandler('loadingProdEvaluation', funcName, null, AjaxConst.GetRequest, successFunc, _url);
    };

    var loadData = function (entryData, successFunc) {
        return callAjaxByPost("getmarketmatrix", entryData, successFunc);
    };

    var saveTemplate = function (entryData, successFunc) {
        return callAjaxByPost("saveTemplateTab3", entryData, successFunc);
    };

    var getDataByTemplateId = function (templateId, successFunc) {
        var urlPara = '&templateId=' + templateId;
        return callAjaxByGet("getDataTab3ByTemplateId", urlPara, successFunc);
    };

    return {
        getData: loadData,
        saveTemplate: saveTemplate,
        getDataByTemplateId: getDataByTemplateId
    };
})();

//#end region tab 3
//#region Chart Evaluation XYZ
vmCommon.createChartEvaluationXYZ = function () {
    vmCommon.VmChartEvaluationXYZ = kendo.observable({
        GoalActionId: '',
        IsShowChartEvalXYZ: true,
        IsAssesment: false, IsEnableAssesment: true,
        CheckboxAssesmentTitle: 'Show all',
        TemplateTitle: 'Template Eval XYZ',
        YEvaluationTitle: 'y-Achse Beschriftung',
        XYNegativeTitle: 'negative',
        XYNeutralTitle: 'neutral',
        XYPositiveTitle: 'positive',
        XEvaluationTitle: 'x-Achse Beschriftung',
        LstEvaluationXYZ: [], LstDataEvalXYZ: [],
        onSeriesHover: function (e) {
            console.log(kendo.format("event :: seriesHover ({0} : {1})", e.category, e.value.size));
        },
        onClickBubble: function (e) {
            const item = e.dataItem;

            console.log('onClickBubble', e.category, e.value, e);

        },
        onMouseleaveXEvalTitle: function (e) {
            const text = e.target.value.trim();        // input
            this.set('IsEditingXEvalTitle', false);
            if (!text.length) {
                const oldTxt = vmCommon.TempChartEvalXEvalOldTitle;
                setTimeout(function () {
                    vmCommon.VmChartEvaluationXYZ.set('XEvaluationTitle', oldTxt);
                }, 135);
                delete vmCommon.TempChartEvalXEvalOldTitle;
            } else {
                this.setEvalXTitle(text);
            }
        },
        setEvalXTitle: function (text) {
            const oldTxt = vmCommon.TempChartEvalXEvalOldTitle
            if (!text.length && oldTxt) {
                this.set('XEvaluationTitle', oldTxt);
            }
            if (text.length && oldTxt && text != oldTxt) {
                console.log('Call Handler setEvalXTitle', text);
            }
            delete vmCommon.TempChartEvalXEvalOldTitle;
        },
        onKeyUpXEvalTitle: function (e) {
            const _text = e.target.value.trim();        // input
            if (e.keyCode == 13) {      // Enter
                this.setEvalXTitle(_text.trim());

                this.set('IsEditingXEvalTitle', false);
            } else {
                e.target.style.minWidth = `${_text.length * 6}px`;
            }
        },
        IsEditingXEvalTitle: false,
        onDblClickXEvalTitle: function (e) {
            this.set('IsEditingXEvalTitle', true);
            const text = e.target.innerText;
            vmCommon.TempChartEvalXEvalOldTitle = text;
            setTimeout(function () {
                const _inp = e.target.previousElementSibling;
                if (_inp) {
                    _inp.style.minWidth = `${text.length * 6}px`;
                    _inp.focus();
                }
            }, 246);
        },
        //onClickXEvalTitle: function (e) {
        //    const trg = e.target;
        //                    // #region highlight
        //                    var range = document.createRange();
        //                    range.setStart(trg.childNodes[0], 0);
        //                    range.setEnd(trg.childNodes[0], trg.childNodes[0].length);
        //                    var sel = window.getSelection();
        //                    sel.removeAllRanges();
        //                    sel.addRange(range);
        //                    // #endregion highlight
        //},
        onChangeAssesment: function (e) {
            const currentChecked = e.data.get('IsAssesment');
            this.updateList(currentChecked);
            console.log('onChangeAssesment', currentChecked)

        },
        updateList: function (isAssesment) {
            if (isAssesment) {
                const lstEvl = vmCommon.deepCopy(this.LstDataEvalXYZ);
                this.set('LstEvaluationXYZ', lstEvl);
            } else {
                const id = this.GoalActionId;
                const lst = this.LstDataEvalXYZ.filter(x => x.Id == id);
                this.set('LstEvaluationXYZ', vmCommon.deepCopy(lst));
            }
        },
        setListEvalFromTemplate: function (lst) {
            if (Array.isArray(lst)) {
                lst.forEach(x => {
                    if (x.EvalZ == 0) x.ShowEvalZ = 3;
                    else x.ShowEvalZ = Math.abs(x.EvalZ);
                    x.CatName = `${x.Name}: ${x.EvalZ}`;
                });
                this.set('LstDataEvalXYZ', lst);
            }
        },
        calcElementEvalX: function (lstEvalX) {
            const lst = lstEvalX.map(itm => itm.Evaluation * parseInt(itm.Priority));
            const evalX = Math.round(lst.reduce((bf, crr) => bf + crr, 0) / lst.length);
            const lstEvl = vmCommon.deepCopy(this.LstDataEvalXYZ);
            const id = this.GoalActionId;
            const evl = lstEvl.find(x => x.Id == id);
            if (evl) {
                evl.EvalX = evalX;

                this.set('LstDataEvalXYZ', lstEvl);
                this.updateList(this.get('IsAssesment'));
            }
        },
        changeTemplate: function (EvalTemplate) {
            if (!EvalTemplate) {
                this.clearTemplate();
                return;
            }
            console.log(EvalTemplate)
            this.set('TemplateTitle', EvalTemplate.Name);
            this.set('IsEnableAssesment', true);
            this.updateList(this.get('IsAssesment'));
        },
        clearTemplate: function () {
            this.set('TemplateTitle', null);
            this.set('IsEnableAssesment', false);
            this.updateList(false);
        },
    });

    kendo.bind($("#dnbChartEvaluationXYZ"), vmCommon.VmChartEvaluationXYZ);
}

// fake data
function getData() {
    return [{ Id: '123', Name: 'Arizona', EvalX: 58, EvalY: 100, EvalZ: 100, Color: '#96E5D1' },
        { Id: '456', Name: 'Alabama', EvalX: 7, EvalY: 87, EvalZ: 46, Color: '#A62349' },
        { Id: '789', Name: 'Alaska', EvalX: 69, EvalY: 36, EvalZ: 0, Color: '#f48f48' },
        { Id: '345', Name: 'KloonVN', EvalX: 69, EvalY: 36, EvalZ: -50, Color: '#f48f48' },
        { Id: '012', Name: 'Arkansas', EvalX: 29, EvalY: 57, EvalZ: 28, Color: '#2A3990' }
    ];
}
function getData2() {
    return [{ Id: '456', Name: 'Alabama2', EvalX: 17, EvalY: 66, EvalZ: 66, Color: '#A62349' },
        { Id: '789', Name: 'Alaska3', EvalX: 69, EvalY: 3, EvalZ: 68, Color: '#f48f48' },
        { Id: '123', Name: 'Arizona4', EvalX: 58, EvalY: -92, EvalZ: 36, Color: '#96E5D1' },
        { Id: '012', Name: 'Arkansas5', EvalX: 10, EvalY: 5, EvalZ: 28, Color: '#2A3990' }
    ];
}
//#endregion Chart
//$(document).ready(function () {
//    $('.k-tooltip').hide();

//    //vmApEval.isMain = vmGoalAction.goalActionEvalOptions.isMain;
//    vmApEval.goalActionTemplateId = vmGoalAction.goalActionEvalOptions.goalActionTemplateId;
//    vmApEval.goalActionTemplate = vmGoalAction.goalActionEvalOptions.goalActionTemplate;
//    vmApEval.isShowDirect = vmGoalAction.goalActionEvalOptions.isShowDirect;

//    var ga_model = vmGoalAction.goalActionEvalOptions.goalActionModel;

//    vmApEval.ApProductTemplateId = ga_model.ApProductTemplateId;
//    vmApEval.ApEvaluationTemplateId = ga_model.ApEvaluationTemplateId;
//    vmApEval.ApSwotanalyseTemplateId = ga_model.ApSwotanalyseTemplateId;
//    vmApEval.ApEvaluationComment = ga_model.ApEvaluationComment;

//    vmApEval.objectType = vmGoalAction.goalActionEvalOptions.objectType;
//    vmApEval.goalActionModel = ga_model;
//    vmApEval.goalActionId = undefined;
//    if (ga_model.Id && ga_model.Id != vmCommon.emptyGuid)
//        vmApEval.goalActionId = ga_model.Id;

//    vmApEval.goalActionName = ga_model.Name;

//    vmApEval.curRole = vmGoalAction.goalActionEvalOptions.role;

//    // bind props tab 2
//    vmApSwotanalyse.role = vmApEval.curRole;
//    vmApSwotanalyse.goalActionTemplateId = vmApEval.goalActionTemplateId;
//    vmApSwotanalyse.isShowDirect = vmApEval.isShowDirect;

//    // bind props tab 3
//    vmApProduct.goalActionTemplateId = vmApEval.goalActionTemplateId;
//    vmApProduct.goalActionName = vmApEval.goalActionModel.Name;
//    vmApProduct.goalActionId = vmApEval.goalActionModel.Id;
//    vmApProduct.Role = vmApEval.curRole;
//    vmApProduct.goalActionModel = vmApEval.goalActionModel;
//    vmApProduct.isShowDirect = vmApEval.isShowDirect;

//    if (vmApEval.isShowDirect) {
//        vmApEval.loadData();
//    }
//    else if (!vmApEval.isClickOpenTab) {
//        if (vmApEval.goalActionModel.ActionPlanEvalData != undefined && vmApEval.goalActionModel.ActionPlanEvalData != null
//            && vmApEval.goalActionModel.ActionPlanEvalData.APEvaluations != null) {
//            var evals = vmCommon.deepCopy(vmApEval.goalActionModel.ActionPlanEvalData.APEvaluations);

//            vmApEval.ProductEvaluations = evals;

//            vmApEval.ProductEvaluations.map(item => {
//                if (item.Id == 0) {
//                    item.Id = vmCommon.newGuid();
//                }
//            });
//        }
//        else {
//            vmApEval.ProductEvaluations = [];
//        }

//        vmApEval.loadData();
//    }

//    //vmGAE.setupEditableLabel();
//    vmApEval.openingTab = 'idTabProductEvaluation';

//    vmApEval.setupLabelLanguage();
//    //popSaveTemplatePreventEnter();

//    vmApEval.bindEvent();
//    if (vmGoalAction.actionOptions && vmGoalAction.actionOptions.isDisordered)
//        $(".evaluation-template-control").hide();

//    vmGoalAction.popGoalActionEval.bind("close", popGoalActionEvalClosed_Onclick);

//    //#region Chart Evaluation XYZ
//    vmCommon.createChartEvaluationXYZ();
//    $("#dnbChartEvaluationXYZ").bind("kendo:skinChange", vmCommon.createChartEvaluationXYZ);
//    vmCommon.VmChartEvaluationXYZ.set('GoalActionId', '123' /*ga_model.Id*/);
//    vmCommon.VmChartEvaluationXYZ.setListEvalFromTemplate(getData());
//    //#endregion Chart Evaluation XYZ
//});