var vmApProduct = vmApProduct || {};
vmApProduct.ListTarget = [];
vmApProduct.SMTargetData = vmApProduct.SMTargetData || {};

vmApProduct.dataCombo = [
    { text: "10", value: "10" },
    { text: "9", value: "9" },
    { text: "8", value: "8" },
    { text: "7", value: "7" },
    { text: "6", value: "6" },
    { text: "5", value: "5" },
    { text: "4", value: "4" },
    { text: "3", value: "3" },
    { text: "2", value: "2" },
    { text: "1", value: "1" },
    { text: "0", value: "0" }
];

vmApProduct.initddlProdDesignTemplate = function (chooseId) {
    var that = this;

    var dataSource = [];
    that.ApProductTemplates = that.ApProductTemplates || [];

    if (that.ApProductTemplates.length == 0) {
        chooseId = -1;
    } else {
        dataSource = vmCommon.deepCopy(that.ApProductTemplates.filter(t => t.DeletedBy != 1));
    }

    dataSource.unshift({ Name: kLg.btnSelectTemp, Id: -1 });
    $('#ddlProdDesignTemp').kendoDropDownList({
        dataTextField: "Name",
        dataValueField: "Id",
        dataSource: dataSource,
        change: ddlProdDesignTemp_Onchange,
        index: 0,
        autoBind: false,
        open: () => ddlProdStructureTemp.value()
    });

    ddlProdStructureTemp = $("#ddlProdDesignTemp").data("kendoDropDownList");
    ddlProdStructureTemp.value(-1);
    if (chooseId)
        ddlProdStructureTemp.value(chooseId);
};

var lstDemandSlider = [];
function loadKendoControl() {
    $('.demandChartSlider').each(function () {
        var slider = $(this).kendoSlider({
            change: changeChartSlider,
            showButtons: false,
            min: -10,
            max: 10,
            value: 0,
            smallStep: 1,
            scale: {
                labels: {
                    visible: false
                }
            }
        }).data("kendoSlider");

        if (slider != null)
            lstDemandSlider.push(slider);
    });

    $('.cssImportance').width(60).kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        change: changeImportance,
        dataSource: vmApProduct.dataCombo
    });
}

function drawLineChart() {
    var lstData = [];
    var lengthChart = 0;
    var demandCharts = vmApProduct.SMTargetData.DemandCharts.filter(chart => chart.DeletedBy != 1);
    for (var k = 0; k < demandCharts.length; k++) {
        var demanChart = demandCharts[k];
        var cellId = '.cssChart' + demanChart.Id;

        var listA = [];

        lengthChart = $(cellId).find("input").length;
        var icount = lengthChart;
        $(cellId).find("input").each(function () {

            if ($(this).attr("isShow") == null) {
                listA.push([parseInt($(this).val()), icount]);
            }
            icount -= 1;
        });
        lstData.push({
            //name: demanChart.Name,
            data: listA,
            color: demanChart.Color
        });
    }
    var heightChart = $('#tbTargetDemand').children('tbody').height() + 76;

    $('#divAutoHeight').height(30);

    if (vmApProduct.SMTargetData.TargetDemands.filter(t => t.DeletedBy != 1).length != lengthChart) {

        $("#divChartDemand").kendoChart({
            legend: {
                position: "bottom"
            },
            seriesDefaults: {
                type: "scatterLine"
            },

            series: lstData,

            yAxis: {
                majorUnit: 1,
                max: lengthChart + 1,
                labels: {
                    visible: false
                }
            },
            xAxis: {
                majorUnit: 1,
                min: -10,
                max: 10

            },
            chartArea: {
                width: 300,
                height: heightChart
            },

        });
    }

}

vmApProduct.callTargetGroupDemands = function (isNewLoad) {
    var that = this;

    that.bindDataToObject().then(() => {
        that.loadTargetGroupDemands(isNewLoad);

        if (that.SMTargetData.TargetDemands.filter(t => t.DeletedBy != 1).length == 0) {
            that.addTargetDemand();
        }

        if (that.SMTargetData.DemandCharts.filter(t => t.DeletedBy != 1).length == 0) {
            that.addDemandChart();
        }
    });
};

vmApProduct.loadTargetGroupDemands = function (isNewLoad) {
    var that = this;

    that.loadAllTable();
    that.initddlProdDesignTemplate(that.ApProductTemplateId);

    if (isNewLoad) {
        if (popCreateProdDesignTemp) {
            popCreateProdDesignTemp.destroy();
            popCreateProdDesignTemp = null;
        }
    }
};

vmApProduct.reloadForm = function () {
    var that = this;
    that.loadAllTable();
    that.initddlProdDesignTemplate(that.ApProductTemplateId);
};

vmApProduct.loadAllTable = function () {
    var that = this;

    if (that.SMTargetData.TargetDemands.filter(t => t.DeletedBy != 1).length == 0) {
        that.addTargetDemand();
    }

    if (that.SMTargetData.DemandCharts.filter(t => t.DeletedBy != 1).length == 0) {
        that.addDemandChart();
    }

    var targetCopy = vmCommon.deepCopy(that.SMTargetData);

    targetCopy.TargetDemands = targetCopy.TargetDemands.filter(target => target.DeletedBy != 1);

    targetCopy.TargetDemands.map(target => {
        target.DemandTypes.map(demandtype => {
            demandtype.Demands = demandtype.Demands.filter(demand => demand.DeletedBy != 1);
        });
    });

    targetCopy.DemandCharts = targetCopy.DemandCharts.filter(chart => chart.DeletedBy != 1);

    if (targetCopy.DemandCharts[0] != null) {
        targetCopy.DemandCharts[0].Name = that.goalActionName;
    }

    targetCopy.DemandChartEvaluations = targetCopy.DemandChartEvaluations.filter(evalue => evalue.DeletedBy != 1);

    loadTargetGrid(targetCopy);
    loadKendoControl();
    loadChartCircle(true);
    setButtonTargetVisibility();
    callEditableTarget();
    setupColorChartPicker($(".colorChartPickers"));
    loadValueSliderControl();
    rotationDemandText();
    loadDemandLanguage();
    setTargetTooltip();
    setDemandTooltip();
    drawLineChart();
    disableAllTargetControl();
    convertTextToTextarea();
    setHoverTargetTable();

    if (that.Role < vmCommon.MemberRole.Edit) {
        that.disableAllControl();
    }
};

vmApProduct.disableAllControl = function () {
    $('#tabProductStruct').addClass('disable-pointer'); //disable all tab elements
};

vmApProduct.btnOpenTemplate_Onclick = function (type, positionIndex) {
    var that = this;
    vmApEval.currentSelectedPositionIndex = positionIndex;
    vmApEval.templateType = type;
    if (vmApEval.curRole <= 0) {
        return;
    }

    var data = that.ApProductTemplates.filter(t => t.DeletedBy != 1);

    bindTemplate('deleteProTempWindow', 'delete-temp-pop-prod', data);

    $('#lblTemplateNameDeleteTemplate').text(kLg.lblTemplateName);
    $('.btnChoose').text(kLg.btnDelTemp);
    $('.btnCancel').text(kLg.btnCancel);

    //pop auto height -> should write function
    that.deleteTempWindow = showPopup2(null, $('#deleteProTempWindow'), null, kLg.DeleteTemplate, 640, $('#deleteProTempWindow').height(), function () {
        that.deleteTempWindow.destroy(); //also remove div deleteTempWindow. Try $('#deleteTempWindow').empty(); $('#deleteTempWindow').html(''); -> All attributes were created by Kendo still exist
        that.deleteTempWindow = null;
        $('#popSubmarketEval').append('<div id="deleteProTempWindow"> </div>');// re add for later use
    });
    if (that && that.deleteTempWindow) that.deleteTempWindow.element.focus();
    //}
};

vmApProduct.btnDeleteTemplate_Onclick = function () {
    var that = this;
    var lstId = [],
        $selectedTemp = $('.cbTemp:checked');
    $selectedTemp.each(function () {
        lstId.push($(this).parents('tr').attr('id'));
    });

    if (lstId.length > 0) {
        pConfirm(kLg.msgConfirmDelTemplate).then(function () {
            lstId.map(id => {
                var templateItem = that.ApProductTemplates.find(t => t.Id == id);
                var index = that.ApProductTemplates.indexOf(templateItem);
                that.ApProductTemplates.splice(index, 1);

                templateItem.DeletedBy = 1;
                templateItem.TargetData = null;

                that.dataservice.saveTemplate(templateItem, (rs) => {
                });

                if (that.ApProductTemplateId == id) {
                    that.ApProductTemplateId = null;
                }
            });

            that.initddlProdDesignTemplate(that.ApProductTemplateId);

            that.btnCloseDelTemplatePopup_Onclick();
        });
    } else {
        //pAlert(kLg.msgNonTemplateIsSelected);
        that.btnCloseDelTemplatePopup_Onclick();
    }
};

vmApProduct.btnCloseDelTemplatePopup_Onclick = function () {
    if (this.deleteTempWindow)
        this.deleteTempWindow.close();
};

//Set Edit TargetName
function setNameTargetName(id, value) {
    var targetData = findTargetGroup(id);
    targetData.Name = value;
    targetData.ModifiedBy = 1;

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

//Set Edit TargetName
function setNameChartName(id, value) {
    var idvalue = id.split("_")[0];
    var demandChart = findDemandChartId(idvalue);
    demandChart.Name = value;

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

function callUpdateMIndexTarget(data, jsonObject) {
    if (checkConflict(data)) {
        vmApProduct.callTargetGroupDemands(false);
        return;
    }
    var objProductGroup = findTargetGroup(jsonObject.Id);
    objProductGroup.Mdf = jsonObject.Mdf + 1;
    objProductGroup.Name = jsonObject.Name;
}

function loadTargetGrid(data) {
    var template = kendo.template($("#targetTemplate").html());
    var result = template(data);
    $("#targetgroup-content").html(result);
}

function loadDemandLanguage() {
    $('.cssNameDemand1').text(kLg.PrerequisiteRequirements);
    $('.cssNameDemand2').text(kLg.BasicNeeds);
    $('.cssNameDemand3').text(kLg.EnthusiasticNeeds);
    $('td#tdNeeds span').html(kLg.Needs);
    $('td#tdErwartungen span').html(kLg.Expectations);
    $('.cssAddDemand').text(kLg.addNewDemand);
}

function setupLanguage() {
    $('.btnAddTemp').text(kLg.btnAddTemp);
    $('.btnUpdateTemp').text(kLg.btnUpdateTemp);
    $('.btnDelTemp').text(kLg.btnDelTemp);
    $('.btnImportTemp').text(kLg.btnImportTemp);

    $('.lblEvalTempName').text(kLg.lblTemplateName);
    $('#lblProStructCancel').text(kLg.cancel);
    $('#lblProStructOK').text(kLg.btnOk);
}

function rotationDemandText() {
    var divExpection = '#lblExpect';
    rotationCellText(divExpection, kLg.ExpectFromClients);
    var divImportant = '#lblImportant';
    rotationCellText(divImportant, kLg.Evaluation);
}

function rotationCellText(divId, textRotation) {
    var font = { font: ' 15px Segoe UI, Arial, sans-serif' };
    var fill = { fill: "rgb(0,0,0)" };
    var idDiv = $(divId).attr('id');
    var spandId = divId + "S";
    var cellId = divId + "C";
    var height = $(cellId).height() - 5;

    $(spandId).text(textRotation);
    var R = window.Raphael(idDiv, 40, height);
    R.text(20, height, textRotation)
        .attr(font)
        .attr(fill)
        .rotate(-90, true).attr({ 'text-anchor': 'start' });
    $(spandId).hide();
}

function loadDemandsByOrder(obj, i) {
    var dataTarget = vmApProduct.SMTargetData.TargetDemands.filter(t => t.DeletedBy != 1)[i];
    var $iconElem = $(obj).find('i');
    if ($iconElem.hasClass("icon-pd-hidden")) {
        $iconElem.removeClass("icon-pd-hidden").addClass("icon-pd-open");
        dataTarget.IsShow = true;
        vmApProduct.ListTarget.push(dataTarget.Id);
    } else {
        $iconElem.removeClass("icon-pd-open").addClass("icon-pd-hidden");
        dataTarget.IsShow = false;
        var index = vmApProduct.ListTarget.indexOf(dataTarget.Id);
        if (index > -1) {
            vmApProduct.ListTarget.splice(index, 1);
        }
    }
    vmApProduct.loadAllTable();
}

function convertTextToTextarea() {
    $('input.textDemandEditable').bind({ contextmenu: clickToTextArea });
    $('input.textDemandEditable').bind({ click: clickToTextArea });
}

function clickToTextArea(e) {
    var inputDemandEdit = $(this);
    var tex = inputDemandEdit.val();

    var textarea = $('<textarea rows="10" cols="30" style="position: absolute; left:-3px; top:-16px; z-index:60000;">' + tex + '</textarea>');
    var divTextArea = inputDemandEdit.next("div.divDemandTextAreaEdit").html(textarea);
    var divImageEdit = divTextArea.next("div.editCellAction");
    divImageEdit.hide();
    textarea.focus();
    inputDemandEdit.hide();
    textarea.blur(function () {
        textarea.hide();
        inputDemandEdit.val($(this).val());
        inputDemandEdit.show();
        divImageEdit.show();
        //inputDemandEdit.focus();

    });

    textarea.donetyping(function () {
        var id = inputDemandEdit.parents('tr').attr('id');
        var demand = findDemandId(id);
        if (inputDemandEdit.attr("name") == "expectationText") {
            demand.ExpectationText = $(this).val();
        } else {
            demand.DemandText = $(this).val();
        }

        demand.ModifiedBy = 1;

        vmApProduct.ApProductTemplateId = null;
        vmApEval.setModelChanged();
    });
}

function loadValueSliderControl() {
    var demandChartEvals = vmApProduct.SMTargetData.DemandChartEvaluations;
    if (demandChartEvals == null) return;
    for (var i = 0; i < demandChartEvals.length; i++) {
        var _eval = demandChartEvals[i];
        var idChart = "#_" + _eval.DemandChartId + "_" + _eval.DemandId;
        if ($(idChart).length) {
            $(idChart).data("kendoSlider").value(_eval.Value);
        }
    }
}

vmApProduct.addDemandChart = function () {
    var that = this;

    var tempId = vmCommon.newGuid();

    var chartArr = vmApProduct.SMTargetData.DemandCharts.filter(t => t.DeletedBy != 1).map(t => t.MIndex);
    var newMIndex = 0;
    var demandChart;

    if (chartArr.length > 0) {
        newMIndex = Math.max(...chartArr);

        demandChart = {
            Id: tempId,
            TempId: tempId,
            Name: kLg.competitorChart,
            ActionGoalId: that.goalActionId,
            ListTarget: that.ListTarget,
            Color: "#fb9f00",
            MIndex: newMIndex
        };
    }
    else {
        newMIndex = 0;

        demandChart = {
            Id: tempId,
            TempId: tempId,
            Name: that.goalActionName,
            ActionGoalId: that.goalActionId,
            ListTarget: that.ListTarget,
            Color: "#fb9f00",
            MIndex: newMIndex
        };
    }

    that.SMTargetData.DemandCharts.push(demandChart);
    that.loadAllTable();

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
};

vmApProduct.initDemandChart = function (name) {
    var tempId = vmCommon.newGuid();

    var chartArr = vmApProduct.SMTargetData.DemandCharts.map(t => t.MIndex);
    var newMIndex = chartArr.length > 0 ? Math.max(...chartArr) : 0;

    var demandChart = {
        Id: tempId,
        TempId: tempId,
        Name: name,
        ActionGoalId: that.goalActionId,
        ListTarget: vmApProduct.ListTarget,
        Color: "#fb9f00",
        MIndex: newMIndex
    };

    vmApProduct.SMTargetData.DemandCharts.push(demandChart);
    vmApProduct.loadAllTable();

    vmApEval.setModelChanged();
};

function deleteDemandChart(obj) {
    pConfirm(kLg.confirmDeleteChart).then(function () {
        var chartId = $(obj).parents('tr').attr('id');
        var demanChart = findDemandChartId(chartId);

        var demandChartIndex = vmApProduct.SMTargetData.DemandCharts.findIndex(t => t.Id == chartId);
        if (demandChartIndex != -1) {

            if (isNaN(chartId)) {
                vmApProduct.SMTargetData.DemandCharts.splice(demandChartIndex, 1);

                vmApProduct.SMTargetData.DemandChartEvaluations = vmApProduct.SMTargetData.DemandChartEvaluations.filter(t => t.DemandChartId != chartId);
            }
            else {
                vmApProduct.SMTargetData.DemandCharts[demandChartIndex].DeletedBy = 1;
                vmApProduct.SMTargetData.DemandChartEvaluations.filter(t => t.DemandChartId == chartId).map(t => t.DeletedBy = 1);
            }
        }

        vmApProduct.loadAllTable();

        vmApProduct.ApProductTemplateId = null;
        vmApEval.setModelChanged();
    });
}

function addDemand(obj, type) {

    var targetId = $(obj).parents('tr').attr('targetId');

    var demand = {
        Id: vmCommon.newGuid(),
        Type: parseInt(type),
        DemandText: '',
        Description: '',
        ExpectationText: '',
        Importance: 0,
        IsExpectation: false,
        MIndex: 1
    };

    var target = vmApProduct.SMTargetData.TargetDemands.filter(t => t.Id == targetId)[0];
    if (target) {
        var targetType = target.DemandTypes.filter(t => t.Type == type);
        targetType[0].Demands.push(demand);
    }

    vmApProduct.loadAllTable();

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

function callEditDemand(jsonObject, funcName) {
    callUpdateTargetDetail(jsonObject, funcName, function (data) {
        vmApProduct.loadTargetGroupDemands(true);
    });
}

function deleteDemand(obj) {
    pConfirm(kLg.confirmDeleteNeeds).then(function () {
        var targetId = $(obj).parents('tr').attr('targetId');
        var demandId = $(obj).parents('tr').attr('id');
        var demand = findDemandId(demandId);

        //var jsonObject = { Demands: { Id: demandId, Mdf: demand.Mdf, TargetGroupId: targetId }, SubMarketProductId: vmGAE.SubMarketProductId, ListTarget: vmSTarget.ListTarget };

        // spice forever in arr
        if (isNaN(demand.Id)) {
            var target = vmApProduct.SMTargetData.TargetDemands.filter(t => t.Id == targetId)[0];
            if (target) {
                var targetType = target.DemandTypes.filter(t => t.Type == demand.Type);
                var demandIndex = targetType[0].Demands.findIndex(t => t.Id == demand.Id);

                targetType[0].Demands.splice(demandIndex, 1);
            }

            vmApProduct.SMTargetData.DemandChartEvaluations = vmApProduct.SMTargetData.DemandChartEvaluations.filter(t => t.DemandId != demand.Id);
        }
        else {
            // mark it deleted
            demand.DeletedBy = 1;
        }

        vmApProduct.loadAllTable();

        vmApProduct.ApProductTemplateId = null;
        vmApEval.setModelChanged();
    });
}

function setButtonTargetVisibility() {
    $('a.icon-bin-hidden').hide();
    $('tr.targetName').hover(function () {
        $(this).find('a.icon-bin-hidden').show();
    }, function () {
        $(this).find('a.icon-bin-hidden').hide();
    });

    $('div.showButton').hover(function () {
        $(this).find('a.icon-bin-hidden').show();
    }, function () {
        $(this).find('a.icon-bin-hidden').hide();
    });
}

function findTargetGroup(id) {
    var targets = vmApProduct.SMTargetData.TargetDemands;
    for (var i = 0; i < targets.length; i++) {
        if (targets[i].Id == id)
            return targets[i];
    }
    return null;
}

function updateTargetGroup(targetData) {
    var targets = vmApProduct.SMTargetData.TargetDemands;
    for (var i = 0; i < targets.length; i++) {
        if (targets[i].Id == targetData.Id)
            targets[i] = targetData;
    }
    return null;
}

function findDemandId(id) {
    var targets = vmApProduct.SMTargetData.TargetDemands;
    for (var i = 0; i < targets.length; i++) {
        var demandTypes = targets[i].DemandTypes;
        for (var j = 0; j < demandTypes.length; j++) {
            var demands = demandTypes[j].Demands;
            for (var k = 0; k < demands.length; k++) {
                if (demands[k].Id == id)
                    return demands[k];
            }
        }
    }
    return null;
}

function findDemandChartId(id) {
    var demandCharts = vmApProduct.SMTargetData.DemandCharts;
    for (var k = 0; k < demandCharts.length; k++) {
        if (demandCharts[k].Id == id)
            return demandCharts[k];
    }
    return null;
}

var vmTargetDes = vmTargetDes || {};
function loadTargetDescription(index) {
    vmTargetDes.typeDescription = 0;
    vmTargetDes.targetDemand = vmApProduct.SMTargetData.TargetDemands[index];
    loadPopupDescription();

}

function loadDemandDescription(obj) {
    vmTargetDes.typeDescription = 1;
    var id = $(obj).parents('tr').attr('id');
    vmTargetDes.targetDemand = findDemandId(id);
    loadPopupDescription();

}

var targetWindow;
function loadPopupDescription() {
    $("div.blockUI").block({ message: null });
    //if (curRole > 0) {
    var path = "Contents/pDescription.html";

    targetWindow = showPopup2(targetWindow, $('#windowDescription'), path, kLg.Description, '500px', '200px');
}

function closeDescriptionPopup() {
    var classRemove = $("#blockDescription");

    $(classRemove).hide();
    $("div.blockUI").unblock();
}

function updateTargetDescription(demand, updateType) {
    demand.ModifiedBy = 1;
    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
    vmApProduct.loadAllTable();
}

vmApProduct.addTargetDemand = function () {

    var that = this;

    var _mIndex = 0;

    if (vmApProduct.SMTargetData.TargetDemands.length > 0) {
        _mIndex = Math.max(...vmApProduct.SMTargetData.TargetDemands.map(t => t.MIndex)) + 1;
    }

    var tempId = vmCommon.newGuid();

    var targetDemand = {
        Id: tempId,
        TempId: tempId,
        Name: kLg.Ansprechgruppen,
        ChartName: kLg.Chart,
        Description: "",
        IsShow: false,
        ActionGoalId: that.goalActionId,
        MIndex: _mIndex
    };

    var demandId1 = vmCommon.newGuid();
    var demandId2 = vmCommon.newGuid();
    var demandId3 = vmCommon.newGuid();

    targetDemand.DemandTypes = [
        {
            Type: 1,
            Demands: [{
                Id: demandId1,
                TempId: demandId1,
                Type: 1,
                DemandText: '',
                Description: '',
                ExpectationText: '',
                Importance: 0,
                IsExpectation: false,
                MIndex: 0
            }]
        },
        {
            Type: 2,
            Demands: [{
                Id: demandId2,
                TempId: demandId2,
                Type: 2,
                DemandText: '',
                Description: '',
                ExpectationText: '',
                Importance: 0,
                IsExpectation: false,
                MIndex: 1000
            }]
        },
        {
            Type: 3,
            Demands: [{
                Id: demandId3,
                TempId: demandId3,
                Type: 3,
                DemandText: '',
                Description: '',
                ExpectationText: '',
                Importance: 0,
                IsExpectation: false,
                MIndex: 2000
            }]
        }
    ];

    vmApProduct.SMTargetData.TargetDemands.push(targetDemand);

    vmApProduct.loadAllTable();
    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
};

function deleteTarget(id) {
    pConfirm(kLg.confirmDeleteAnsprechgruppen).then(function () {
        var targetIndex = vmApProduct.SMTargetData.TargetDemands.findIndex(t => t.Id == id);
        if (targetIndex != -1) {

            if (isNaN(id)) {
                vmApProduct.SMTargetData.TargetDemands.splice(targetIndex, 1);
            }
            else {

                vmApProduct.SMTargetData.TargetDemands[targetIndex].DeletedBy = 1;

            }
        }

        vmApProduct.loadAllTable();

        vmApProduct.ApProductTemplateId = null;
        vmApEval.setModelChanged();
    });
}

function setupColorChartPicker(selector) {
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
            change: changeChartColor
        }).data("kendoColorPicker");

        if (vmApProduct.Role < 1) {
            clPicker.enable(false);
        }

        lstColorPicker.push(clPicker);
    });
}

function changeChartColor(e) {
    var chartId = $(e.sender.element[0]).parents('tr').attr('id');
    //var targetId = $(e.sender.element[0]).parents('tr').attr('targetId');
    var demanChart = findDemandChartId(chartId);
    demanChart.ModifiedBy = 1;
    demanChart.Color = e.value;
    drawLineChart();

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

function changeChartSlider(e) {
    if ($(loadingDivElem).css('display') == 'block') return;
    var arrId = $(e.sender.element).attr('id');
    var chartId = arrId.split("_")[1];
    var demandId = arrId.split("_")[2];
    var demandChartEval = findDemandChartEvaluations(chartId, demandId);
    var mdf = demandChartEval != null ? demandChartEval.Mdf : 0;

    var evaluation = {
        DemandId: demandId,
        TmpDemandId: demandId,
        DemandChartId: chartId,
        TmpDemandChartId: chartId,
        Mdf: mdf,
        Value: e.value
    };
    if (!demandChartEval) {
        evaluation.CreatedBy = 1;
        vmApProduct.SMTargetData.DemandChartEvaluations.push(evaluation);
    }
    else {
        demandChartEval.Value = e.value;
        demandChartEval.ModifiedBy = 1;
    }

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();

    loadChartCircle(false);
    drawLineChart();
}

// update Importance
function changeImportance(e) {
    var elemId = $(e.sender.element[0]).parents('tr').attr('id');
    var demand = findDemandId(elemId);

    //task: 7298
    //demand.Importance = e.sender._selectedValue;
    demand.ModifiedBy = 1;
    demand.Importance = e.sender._old;
    loadChartCircle(false);

    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

function loadChartCircle(isFirst) {
    var demandCharts = vmApProduct.SMTargetData.DemandCharts.filter(chart => chart.DeletedBy != 1);
    for (var k = 0; k < demandCharts.length; k++) {
        drawHeaderChart(demandCharts[k].Id, isFirst);
    }
}

function drawHeaderChart(chartid, isFirst) {
    var idDiv = 'chart' + chartid;
    var valCircle = calValueCircle(false);
    var rCircle = 0;
    if (valCircle > 0) rCircle = 40;
    var valDashCircle = calValueCircle(true);
    var rDashCircle = 0;
    if ((valCircle > 0) && (valDashCircle > 0)) {
        var percentDash = 100 + valDashCircle * 100 / valCircle;
        rDashCircle = rCircle * percentDash / 100;
        rDashCircle = (rDashCircle < 100) ? rDashCircle : 100;
    }
    var percentSquare = calValueSquare(chartid);
    if (isFirst) {
        drawFirstTime(rCircle, rDashCircle, percentSquare, idDiv);
    } else {
        reDrawChart(rCircle, rDashCircle, percentSquare, idDiv);
    }

}

function drawFirstTime(rcircle, rcicledash, percentSquare, idDiv) {
    var center = 105;
    var paper = Raphael(document.getElementById(idDiv), 210, 210);
    var maxCircle = Math.max(rcircle, rcicledash);
    if (percentSquare > 0) {
        var rSquare = Math.round(maxCircle * percentSquare);
        var lineSquare = center - rSquare;
        var square = paper.rect(lineSquare, lineSquare, rSquare * 2, rSquare * 2);
        square.attr({ "stroke": "#58ACFA" });
    } else {
        square = paper.rect(1, 1, 1, 1);
        square.attr({ "stroke": "#d9edf7" });
    }

    if (rcircle > 0) {
        var circle = paper.circle(center, center, rcircle);
        circle.attr({ "stroke": "#58ACFA" });
    } else {
        circle = paper.circle(center, center, 1);
        circle.attr({ "stroke": "#d9edf7" });
    }
    if (rcicledash > 0) {
        var circledash = paper.circle(center, center, rcicledash);
        circledash.attr({ "stroke-dasharray": "--" });
        circledash.attr({ "stroke": "#58ACFA" });
    } else {
        circledash = paper.circle(center, center, 1);
        circledash.attr({ "stroke": "#d9edf7" });
        circledash.attr({ "stroke-dasharray": "--" });
    }
}

function reDrawChart(rcircle, rcicledash, percentSquare, idDiv) {
    var center = 105;
    var list = document.getElementById(idDiv).childNodes[0].childNodes;
    var maxCircle = Math.max(rcircle, rcicledash);
    if (percentSquare > 0) {
        var rSquare = Math.round(maxCircle * percentSquare);
        var lineSquare = center - rSquare;
        list[2].setAttribute("x", lineSquare);
        list[2].setAttribute("y", lineSquare);
        list[2].setAttribute("width", rSquare * 2);
        list[2].setAttribute("height", rSquare * 2);
        list[2].setAttribute("stroke", "#58ACFA");
    } else {
        list[2].setAttribute("stroke", "#d9edf7");
    }

    if (rcircle > 0) {
        list[3].setAttribute("r", rcircle);
        list[3].setAttribute("stroke", "#58ACFA");
    } else {
        list[3].setAttribute("stroke", "#d9edf7");
    }

    if (rcicledash > 0) {
        list[4].setAttribute("r", rcicledash);
        list[4].setAttribute("stroke", "#58ACFA");
        //list[4].setAttribute("stroke-dasharray", "--");
    } else {
        list[4].setAttribute("stroke", "#d9edf7");
        //list[4].setAttribute("stroke-dasharray", "--");
    }
}

function calValueCircle(isDash) {
    var calValue = 0;
    for (var i = 0; i < vmApProduct.SMTargetData.TargetDemands.length; i++) {
        var target = vmApProduct.SMTargetData.TargetDemands[i];

        for (var j = 0; j < target.DemandTypes.length; j++) {
            var demandType = target.DemandTypes[j];
            var demands = demandType.Demands;

            if (isDash) {
                if (demandType.Type == 3) {
                    for (var k = 0; k < demands.length; k++) {
                        calValue += parseInt(demands[k].Importance);
                    }
                }

            } else {
                if (demandType.Type == 3) break;
                for (var l = 0; l < demands.length; l++) {
                    calValue += parseInt(demands[l].Importance);
                }
            }

        }
    }
    return calValue;
}

function calValueSquare(chartId) {
    var calValue = 0;
    var count = 0;
    for (var i = 0; i < vmApProduct.SMTargetData.TargetDemands.length; i++) {
        var target = vmApProduct.SMTargetData.TargetDemands[i];
        var demandTypes = target.DemandTypes;
        for (var j = 0; j < demandTypes.length; j++) {
            var demands = demandTypes[j].Demands;
            count += demands.length;
            for (var k = 0; k < demands.length; k++) {
                var demandId = demands[k].Id;
                calValue += getValDemandChartEvaluations(chartId, demandId);
            }
        }
    }
    return calValue / (count * 10);
}

function getValDemandChartEvaluations(chartId, demandId) {
    var _eval = findDemandChartEvaluations(chartId, demandId);
    if (_eval != null) {
        return _eval.Value;
    } else {
        return 0;
    }

}

function findDemandChartEvaluations(chartId, demandId) {
    var dataCharts = vmApProduct.SMTargetData.DemandChartEvaluations;
    if (dataCharts == null) return null;
    for (var i = 0; i < dataCharts.length; i++) {
        if ((dataCharts[i].DemandId == demandId) && (dataCharts[i].DemandChartId == chartId)) {
            return dataCharts[i];
        }
    }
    return null;
}

function changeIsExpectation(obj) {
    var id = $(obj).parents('tr').attr('id');
    var val = $(obj).is(':checked') ? true : false;
    var demand = findDemandId(id);
    demand.IsExpectation = val;
    demand.ModifiedBy = 1;
    vmApProduct.ApProductTemplateId = null;
    vmApEval.setModelChanged();
}

var ddlProdStructureTemp,
    popCreateProdDesignTemp;
function showProdDesignTempPop(actionType) {
    $('#txtProdDesignTempName').tooltip('destroy');
    //clearError('msgEditProdDesignTemplate');

    vmApProduct.TempAction = actionType;
    var tempName = '',
        title = kLg.btnAddTemp;
    if (actionType == templateAction.Update) {
        title = kLg.btnUpdateTemp;
        //if (ddlProdStructureTemp.text() === kLg.btnSelectTemp) {
        if (parseInt(ddlProdStructureTemp.value()) === -1) {
            alert(kLg.msgChooseTemplate);
            return;
        }
        tempName = ddlProdStructureTemp.text();
    }
    //$('#txtProdDesignTempName').val(tempName);

    bindTemplate('popUpproductDesign', 'popUpproductDesign-temp', tempName);
    $('#lblNamepopUpproductDesign').text(kLg.lblTemplateName);
    $('#lblProStructOK').text(kLg.btnOk);
    $('#lblProStructCancel').text(kLg.btnCancel);

    popCreateProdDesignTemp = showTempNamePopup(popCreateProdDesignTemp, $("#popUpproductDesign"), $('#txtProdDesignTempName'), title, function () {
        popCreateProdDesignTemp.destroy();
        popCreateProdDesignTemp = null;
        $('#popGoalActionEval').length > 0 && $('#popGoalActionEval').append('<div id="popUpproductDesign"></div>');
        $('#popSubmarketEval').length > 0 && $('#popSubmarketEval').append('<div id="popUpproductDesign"></div>');
    });
    vmApProduct.bindSaveProdDesignTemplate();
}

vmApProduct.bindSaveProdDesignTemplate = function () {
    var that = this;

    $('#btnSaveProdDesignTemp').bind('click', function () {
        disableButtonPopup();
        var entryData;
        var tempName = $('#txtProdDesignTempName').val();
        if (!checkRequired(tempName)) {
            //showError('msgEditProdDesignTemplate', kLg.msgRequiredTempName);
            $('#txtProdDesignTempName').attr('title', kLg.msgRequiredTempName);
            $("#txtProdDesignTempName").tooltip({ placement: 'top', trigger: 'manual' }).tooltip('show');
            $('#txtProdDesignTempName').focus();
            enableButtonPopup();
            return;
        }
        $('#btnSaveProdDesignTemp').unbind('click');

        var currentData = vmCommon.deepCopy(that.SMTargetData);
        var _oldData = {};
        var _newData = {};
        var _dictChart = {};
        var _dictDemand = {};

        // delete old data
        _oldData.DemandCharts = that.SMTargetData.DemandCharts.filter(t => !isNaN(t.Id)).map(t => {
            t.DeletedBy = 1;
            return t;
        });

        _oldData.DemandChartEvaluations = that.SMTargetData.DemandChartEvaluations.filter(t => !isNaN(t.DemandId) && !t.DemandChartId).map(t => {
            t.DeletedBy = 1;
            return t;
        });

        _oldData.TargetDemands = that.SMTargetData.TargetDemands.filter(t => !isNaN(t.Id)).map(t => {
            t.DeletedBy = 1;

            t.DemandTypes.map(type => {
                type.Demands = type.Demands.filter(demand => !isNaN(demand.Id)).map(demand => {
                    demand.DeletedBy = 1;
                    return demand;
                });
            });
            return t;
        });

        // refresh current data to new data
        _newData.DemandCharts = currentData.DemandCharts.filter(t => t.DeletedBy != 1).map(t => {
            var _tmpNewGuid = vmCommon.newGuid();

            _dictChart['chart_' + t.Id] = _tmpNewGuid;
            t.Id = _tmpNewGuid;
            t.TempId = _tmpNewGuid;
            return t;
        });

        _newData.TargetDemands = currentData.TargetDemands.filter(t => t.DeletedBy != 1).map(t => {
            var tempId = vmCommon.newGuid();

            t.Id = tempId;
            t.TempId = tempId;

            t.DemandTypes.map(type => {
                type.Demands = type.Demands.filter(t => t.DeletedBy != 1).map(demand => {
                    var _tmpNewGuid = vmCommon.newGuid();

                    _dictDemand['demand_' + demand.Id] = _tmpNewGuid;
                    demand.Id = _tmpNewGuid;
                    demand.TempId = _tmpNewGuid;
                    return demand;
                });
            });

            return t;
        });

        _newData.DemandChartEvaluations = currentData.DemandChartEvaluations.filter(t => t.DeletedBy != 1).map(t => {
            var demandId = _dictDemand['demand_' + t.DemandId];
            t.DemandId = demandId;
            t.TmpDemandId = demandId;

            var chartId = _dictChart['chart_' + t.DemandChartId];
            t.DemandChartId = chartId;
            t.TmpDemandChartId = chartId;
            return t;
        });

        that.SMTargetData.DemandCharts = _oldData.DemandCharts.concat(_newData.DemandCharts);
        that.SMTargetData.TargetDemands = _oldData.TargetDemands.concat(_newData.TargetDemands);
        that.SMTargetData.DemandChartEvaluations = _oldData.DemandChartEvaluations.concat(_newData.DemandChartEvaluations);

        // binding div grid
        that.loadAllTable();

        var saveItem = vmCommon.deepCopy(_newData);

        // map data to save
        if (!saveItem) {
            return;
        }

        // map data to saving
        saveItem.DemandCharts.map(t => {
            if (isNaN(t.Id)) {
                t.Id = 0;
            }
        });

        saveItem.DemandChartEvaluations.map(t => {
            t.DemandId = isNaN(t.DemandId) ? 0 : t.DemandId;
            t.DemandChartId = isNaN(t.DemandChartId) ? 0 : t.DemandChartId;
        });

        saveItem.TargetDemands.map(t => {
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

        // declart
        var newTemplate = {
            Id: vmCommon.newGuid(),
            Name: tempName,
            Type: templateType.ApProductTemplate,
            TargetData: saveItem,
            CreatedBy: 0,
            ModifiedBy: 0,
            DeletedBy: 0
        };

        if (that.TempAction == templateAction.Add) {
            newTemplate.CreatedBy = 1;
        }
        else if (that.TempAction == templateAction.Update) {
            var tempId = ddlProdStructureTemp.value();
            var temp = that.ApProductTemplates.find(t => t.Id == tempId);

            temp.ModifiedBy = 1;
            temp.Name = newTemplate.Name;
            temp.TargetData = newTemplate.TargetData;

            that.ApProductTemplateId = tempId;

            newTemplate = temp;
        }

        that.dataservice.saveTemplate(newTemplate, (rs) => {
            if (that.TempAction == templateAction.Add) {
                newTemplate.TargetData = _newData;

                newTemplate.CreatedBy = 0;
                newTemplate.Id = rs.value;

                that.ApProductTemplateId = newTemplate.Id;
                that.ApProductTemplates.push(newTemplate);

                that.initddlProdDesignTemplate(newTemplate.Id);

                vmApEval.modelChanged = true;
                closeProdDesignTempPopup();
            }
            else if (that.TempAction == templateAction.Update) {
                newTemplate.ModifiedBy = 0;
                that.initddlProdDesignTemplate(rs.value);
                closeProdDesignTempPopup();
            }
        });

    });
};

vmApProduct.preProStructure = -1;
function ddlProdDesignTemp_Onchange() {
    if (parseInt(ddlProdStructureTemp.value()) === -1) {
        vmApProduct.ApProductTemplateId = null;
    } else {
        pConfirm(kLg.msgConfirmApplyNewTemplate).then(function () {
            vmApProduct.ApProductTemplateId = ddlProdStructureTemp.value();

            vmApProduct.preProStructure = ddlProdStructureTemp.value();
            var template = vmApProduct.ApProductTemplates.find(t => t.Id == vmApProduct.preProStructure);
            if (!template) {
                return;
            }

            if (template.TargetData == undefined) {

                vmApProduct.dataservice.getDataByTemplateId(vmApProduct.preProStructure, (res) => {
                    //set value = 0
                    res.value.DemandChartEvaluations = [];

                    vmApProduct.replaceData(res.value);

                    vmApProduct.loadAllTable();

                    if (vmApProduct.SMTargetData.TargetDemands.filter(t => t.DeletedBy != 1).length == 0) {
                        vmApProduct.addTargetDemand();
                    }

                    if (vmApProduct.SMTargetData.DemandCharts.filter(t => t.DeletedBy != 1).length == 0) {
                        vmApProduct.addDemandChart();
                    }

                    template.TargetData = vmCommon.deepCopy(res.value);
                });
            } else {

                var _oldData = {};
                var _newData = template.TargetData;

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

                var newDataCopy = vmCommon.deepCopy(_newData);

                vmApProduct.SMTargetData.DemandCharts = _oldData.DemandCharts.concat(newDataCopy.DemandCharts);
                vmApProduct.SMTargetData.TargetDemands = _oldData.TargetDemands.concat(newDataCopy.TargetDemands);
                vmApProduct.SMTargetData.DemandChartEvaluations = _oldData.DemandChartEvaluations;

                vmApProduct.loadAllTable();
            }

            vmApEval.setModelChanged();
        }, function () {
            ddlProdStructureTemp.value(vmApProduct.preProStructure);
        });
    }
}

function closeProdDesignTempPopup(obj) {
    enableButtonPopup();
    popCreateProdDesignTemp.close();
}

function delProductDesignTemp() {
    if (parseInt(ddlProdStructureTemp.value()) === -1) {
        alert(kLg.msgChooseTemplate);
        return;
    }
    pConfirm(kLg.msgConfirmDelTemplate).then(function () {
        var tempId = ddlProdStructureTemp.value();
        var entryData = { Id: tempId };
        vmApEval.dataservice.delTemplate(entryData, function (serData) {
            ////Check role
            //if (!checkRole(serData))
            //return;
            vmApProduct.initddlProdDesignTemplate(null);
        });
    });
}

function checkRoleAndConflick(data) {
    if (data.value == null) {
        pAlert(kLg.msgConflickData);
        return true;
    }
    switch (data.Role) {
        case -1:
            pAlert(kLg.msgConflickData);
            return true;
        case 0:
            pAlert(kLg.msgPermissionDenied);
            return true;
    }
    return false;

}

function checkConflict(data) {
    if (data.value == null) {
        pAlert(kLg.msgConflickData);
        return true;
    }
    switch (data.Role) {
        case -1:
            pAlert(kLg.msgConflickData);
            return true;
        case 0:
            pAlert(kLg.msgPermissionDenied);
            return true;
    }

    if (data.value.Mdf == -1) {
        alert(kLg.msgConflickData);
        return true;
    }
    return false;
}

function checkConflictDemand(dataTarget) {
    if (dataTarget == null) {
        alert(kLg.msgConflickData);
        return true;
    }

    if (dataTarget.Mdf == -1) {
        alert(kLg.msgConflickData);
        return true;
    }
    return false;
}

function disableAllTargetControl() {
    if (vmApProduct.Role > 0) {

        if (ddlProdStructureTemp) {
            ddlProdStructureTemp.enable(true);
        }
        return;
    }

    $('.btnAddTemp').attr("onclick", "");
    $('.btnUpdateTemp').attr("onclick", "");
    $('.btnDelTemp').attr("onclick", "");
    $('.btnImportTemp').attr("onclick", "");

    if (ddlProdStructureTemp) {
        ddlProdStructureTemp.enable(false);
    }

    $('tr.targetName, td.td-hover, div.showButton').unbind('mouseenter');

    $('#tabProductStructure a.icon-add-small').hide();
    $('#tabProductStructure a.icon-bin-hidden').hide();

    $("#tabProductStructure input").attr("disabled", "disabled");
    $(".cssImportance").each(function () {
        $(this).kendoDropDownList({ enabled: false }).data("kendoDropDownList");
    });

    if (lstDemandSlider.length) {
        for (var i = 0; i < lstDemandSlider.length; i++) {
            lstDemandSlider[i].disable();
        }
    }
    $('#tabProductStructure table.table-target td').removeClass('td-hover');

    $(".icon-bin-small").hide(); // disabled all delete button of evaluation


    //$('td.editCell, td.edCell').find('a.icon-add').hide();
    //$('table.table-target').find('.icon-bin').hide();

}

function setTargetTooltip() {
    var desc = $('span.icon-description1');
    desc.each(function () {
        var id = $(this).attr("id");
        var targetId = id.split("tdes")[1];
        var description = findTargetGroup(targetId).Description;

        $(this).attr('title', description);

        if (description.length == 0) return;

        $(this).kendoTooltip({
            position: "top",
            width: 120
        }).data("kendoTooltip");
    });

}

function setDemandTooltip() {
    var desc = $('span.icon-description2');
    desc.each(function () {
        var id = $(this).attr("id");
        var demandId = id.split("tdes")[1];
        if (!findDemandId(demandId)) {
            return;
        }

        var description = findDemandId(demandId).Description;
        $(this).attr('title', description);

        if (description.length == 0) return;

        $(this).kendoTooltip({
            position: "top",
            width: 120
        }).data("kendoTooltip");
    });
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

function callEditableTarget() {

    if (vmApProduct.Role > 0) {
        //setTargetEditbale('span.TargetNameEditable', setNameTargetName, setButtonTargetVisibility);
        //setDemandEditbale('span.ChartNameEditable', setNameChartName, setButtonTargetVisibility);

        //bindSwitchSpanToInput(setNameTargetName, "TargetNameEditable");
        bindSwitchSpanToInputLib(setNameTargetName, "TargetNameEditable", removeTargetHover, setButtonTargetVisibility);
        bindSwitchSpanToInputLib(setNameChartName, "ChartNameEditable", removeTargetHover, setButtonTargetVisibility);
    }

    //$('span.TargetNameEditable').dblclick(function () {
    //    $('div.removeTarget').find('i').hide();
    //    $('div.removeTarget').unbind('mouseenter mouseleave');
    //});

    //$('span.ChartNameEditable').dblclick(function () {
    //    $('td.edCell, div.showButton').find('a.remove').hide();
    //    $('td.edCell, div.showButton').unbind('mouseenter mouseleave');
    //});
}

function removeTargetHover() {
    $('a.icon-bin-hidden').hide();
    $('tr.targetName, div.showButton').unbind('mouseenter mouseleave');
}

function checkMaxLengthTarget(obj) {
    if (obj.value.length > 100) {
        alert(kLg.maxlength);
        setTimeout(function () { obj.focus(); }, 50);
        return true;
    }
    return false;

}

function showTargetDescription(id) {
    if (vmApProduct.Role < 1) return;
    vmCommon.currentMarket = findTargetGroup(id);
    vmCommon.currentControl = vmCommon.enumType.Target;
    vmCommon.showAllDescription();
}

function showDemandDescription(id) {
    if (vmApProduct.Role < 1) return;
    vmCommon.currentMarket = findDemandId(id);
    vmCommon.currentControl = vmCommon.enumType.Demand;
    vmCommon.showAllDescription();
}

function setHoverTargetTable() {
    $('.icon-dropdow').click(function () {
        if ($('.ms-dropdow').hasClass('open')) {
            $('table.table-target td').removeClass('td-hovers');
            $('table.table-target td').addClass('td-hover');
        } else {
            $('table.table-target td').removeClass('td-hover');
            $(this).parents('td').addClass('td-hovers');
        }
        $(document).mouseup(function (e) {
            var container = $('.icon-dropdow');
            if (!container.is(e.target)) {
                $('table.table-target td').removeClass('td-hovers');
                $('table.table-target td').addClass('td-hover');
            };
        });
    });
}

//Pageload
$(document).ready(function () {
    $("#txtProdDesignTempName").keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    });

    if (vmApEval.goalActionModel.ActionPlanEvalData == null) { //if (vmApEval.isShowDirect && vmApEval.countLoadForm.Tab3 == 0) {
        vmApProduct.ApProductTemplateId = vmApEval.ApProductTemplateId;
        vmApProduct.callTargetGroupDemands(true, true);
    }
    else {
        if (vmApEval.goalActionModel.ActionPlanEvalData.TargetData != null) {
            if (vmApEval.countLoadForm.Tab3 == 0) {
                var target_data = vmCommon.deepCopy(vmApEval.goalActionModel.ActionPlanEvalData.TargetData);

                vmApProduct.ApProductTemplates = vmApEval.goalActionModel.ApProductTemplates;
                vmApProduct.ApProductTemplateId = vmApEval.ApProductTemplateId;

                // map data to saving
                target_data.DemandCharts.map(t => {
                    if (t.Id == 0) {
                        t.Id = t.TempId;
                    }
                });

                target_data.TargetDemands.map(t => {
                    if (t.Id == 0) {
                        t.Id = t.TempId;
                    }

                    t.DemandTypes.map(type => {
                        type.Demands.map(demand => {
                            demand.TempTargetGroupId = t.Id;
                            demand.TargetGroupId = t.Id;

                            if (demand.Id == 0) {
                                demand.Id = demand.TempId;
                            }
                        });
                    });
                });

                target_data.DemandChartEvaluations.map(t => {
                    t.DemandChartId = t.DemandChartId == 0 ? t.TmpDemandChartId : t.DemandChartId;
                    t.DemandId = t.DemandId == 0 ? t.TmpDemandId : t.DemandId;
                });

                vmApProduct.SMTargetData = target_data;
            }

            vmApProduct.reloadForm();
        }
        else {
            vmApProduct.ApProductTemplateId = vmApProduct.ApProductTemplateId || -1;
        }

        if (vmApEval.countLoadForm.Tab3 == 0 && vmApEval.isClickOpenTab) {
            vmApProduct.callTargetGroupDemands(true, true);
        }
        else {
            vmApProduct.reloadForm();
        }

    }

    ++vmApEval.countLoadForm.Tab3;
    if (vmGoalAction.actionOptions && vmGoalAction.actionOptions.isDisordered)
        $(".evaluation-template-control").hide();

    setupLanguage();
});