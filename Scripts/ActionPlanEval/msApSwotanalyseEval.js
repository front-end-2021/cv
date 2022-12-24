var vmApSwotanalyse = vmApSwotanalyse || {};
vmApSwotanalyse.ddlTemplate = null;

vmApSwotanalyse.SwotanalyseData = vmApSwotanalyse.SwotanalyseData || {};

vmApSwotanalyse.bindData = function (data) {
    var that = this;
    data.role = that.role;

    data.Trends = data.Trends.sort((i, j) => {
        return i.MIndex - j.MIndex;
    });

    data.Criterias = data.Criterias.sort((i, j) => {
        return i.MIndex - j.MIndex;
    });

    loadSwotTemplate("template-citeria", "div-criteria", data, "kendo-slider-criteria", "div-color-criteria", true);
    loadSwotTemplate("template-general-trends", "div-general-trends", data, "kendo-slider-trendall", "div-color-trend", false);

    function loadSwotTemplate(template, divId, _data, sliderString, divColorString, isCriteria) {
        var result = kendo.template($("#" + template).html())(_data);
        $("#" + divId).html(result);

        var tmpData;
        if (isCriteria) tmpData = _data.Criterias;
        else tmpData = _data.Trends;
        setupKendoSlider(tmpData, sliderString, divColorString);
    }

    setupLabelEditable();
    setupLangueSwotanalyse();
    setButtonVisible();
    that.dragDropSetting();

    if (that.role < vmCommon.MemberRole.Edit) {
        that.disableAllControl();
    }
};

vmApSwotanalyse.disableAllControl = function () {
    $('#frmApEval button').attr("disabled", true);

    $('#swotArea').addClass('disable-pointer'); //disable all tab elements

    $('#swotArea input,#swotArea textarea,#swotArea select').attr("disabled", "disabled");
};

function setText() {
    return kLg.doubleclick;     // bug 27557 (sprint 5.01)
}

function setupKendoSlider(data, sliderString, divColorString) {
    for (var i = 0; i < data.length; i++) {
        var parent = data[i];
        for (var j = 0; j < parent.Childs.length; j++) {
            var index = "" + i + j;
            var sliderName = sliderString + index;
            var slider = $("#" + sliderName).kendoSlider({
                change: function (e) {
                    setColorDiv(divColorString + this.element.attr("id").substring(21), this.element.val() * 10);
                    updateSubItemValue(this.element.attr("childId"), this.element.val(), this.element.attr("parent"));
                },
                min: -10,
                max: 10,
                smallStep: 1,
                tooltip: {
                    format: "{0:#}"
                },
                showButtons: false
            }).data("kendoSlider");

            var val = $("#" + sliderName).attr('value');
            slider.value(val);
            setColorDiv(divColorString + index, val * 10);
            if (vmApEval.curRole == 0) {
                slider.disable();
            }
        }
    }
}

function setColorDiv(divId, val) {
    $('#' + divId).removeClass();
    $('#' + divId).addClass(ChoseColorPercent(val));
    $('#' + divId).addClass("floatleft");
}

vmApSwotanalyse.loadData = function () {
    var that = this;

    that.bindDataToObject().then((data) => {
        that.initddlTemplate(that.ApSwotanalyseTemplateId);
        that.bindData(data);
    });
};

vmApSwotanalyse.reloadData = function () {
    var that = this;

    var tmpData = {
        Trends: [],
        Criterias: []
    };

    tmpData.role = that.SwotanalyseData.role;

    that.SwotanalyseData.Trends.map(item => {
        if (item.DeletedBy != 1) {
            var trend = vmCommon.deepCopy(item);
            trend.Childs = item.Childs.filter(t => t.DeletedBy != 1).sort((i, j) => {
                return i.MIndex - j.MIndex;
            });

            tmpData.Trends.push(trend);
        }
    });

    that.SwotanalyseData.Criterias.map(item => {
        if (item.DeletedBy != 1) {
            var criteria = vmCommon.deepCopy(item);
            criteria.Childs = item.Childs.filter(t => t.DeletedBy != 1).sort((i, j) => {
                return i.MIndex - j.MIndex;
            });

            tmpData.Criterias.push(criteria);
        }
    });

    that.bindData(tmpData);
};

vmApSwotanalyse.reloadForm = function () {
    var that = this;

    var tmpData = {
        Trends: [],
        Criterias: []
    };

    that.SwotanalyseData.Trends.map(item => {
        if (item.DeletedBy != 1) {
            var trend = vmCommon.deepCopy(item);
            trend.Childs = item.Childs.filter(t => t.DeletedBy != 1);
            tmpData.Trends.push(trend);
        }
    });

    that.SwotanalyseData.Criterias.map(item => {
        if (item.DeletedBy != 1) {
            var criteria = vmCommon.deepCopy(item);
            criteria.Childs = item.Childs.filter(t => t.DeletedBy != 1);
            tmpData.Criterias.push(criteria);
        }
    });

    that.bindData(tmpData);

    that.initddlTemplate(that.ApSwotanalyseTemplateId);
};

vmApSwotanalyse.addCriteria = function (e) {
    var that = this;

    var countEval = that.SwotanalyseData.Criterias.length;
    var mIndex = 0;

    if (countEval > 0) {
        mIndex = Math.max(...that.SwotanalyseData.Criterias.map(t => t.MIndex)) + 1;
    }

    var tempId = vmCommon.newGuid();

    var swotanalyse = {
        MIndex: mIndex,
        Id: tempId,
        TempId: tempId,
        Name: kLg.criteria,
        GroupType: 1,
        Childs: [],
        SwotTemplateId: 0,
        CreatedBy: 1
    };

    that.SwotanalyseData.Criterias.push(swotanalyse);

    that.ApSwotanalyseTemplateId = null;
    that.reloadData();

    vmApEval.setModelChanged();
};

vmApSwotanalyse.addSubCriteria = function (e) {
    var that = this;

    var swotanalyseId = $(e).attr('parent');
    var mIndex = 0;
    var parent = that.SwotanalyseData.Criterias.find(t => t.Id == swotanalyseId);

    if (parent == null) {
        return;
    }

    var countChild = parent.Childs.length;

    if (countChild > 0) {
        mIndex = Math.max(...parent.Childs.map(t => t.MIndex)) + 1;
    }

    var subSwotanalyse = {
        Id: vmCommon.newGuid(),//$(e).attr('child'),
        Name: kLg.subCriteria,
        SwotanalyseId: swotanalyseId,
        TempSwotanalyseId: swotanalyseId,
        Value: 0,
        MIndex: mIndex,
        Evaluation: 0,
        Description: kLg.descriptionSwotanalyse,
        CreatedBy: 1
    };

    parent.Childs.push(subSwotanalyse);

    that.ApSwotanalyseTemplateId = null;
    that.reloadData();

    vmApEval.setModelChanged();
};

vmApSwotanalyse.addTrend = function (e) {
    var that = this;

    var countEval = that.SwotanalyseData.Criterias.length;
    var mIndex = 0;

    if (countEval > 0) {
        mIndex = Math.max(...that.SwotanalyseData.Criterias.map(t => t.MIndex)) + 1;
    }

    var tempId = vmCommon.newGuid();

    var swotanalyse = {
        MIndex: mIndex,
        Id: tempId,//$(e).attr('parent'),
        TempId: tempId,
        Name: kLg.trend,
        GroupType: 2,
        Childs: [],
        //GoalActionId: vmGAE.SubMarketProductId,
        SwotTemplateId: 0,
        CreatedBy: 1
    };

    that.SwotanalyseData.Trends.push(swotanalyse);

    that.ApSwotanalyseTemplateId = null;
    that.reloadData();
    vmApEval.setModelChanged();
};

vmApSwotanalyse.addSubTrend = function (e) {
    var that = this;

    var swotanalyseId = $(e).attr('parent');
    var mIndex = 0;
    var parent = that.SwotanalyseData.Trends.find(t => t.Id == swotanalyseId);

    if (parent == null) {
        return;
    }

    var countChild = parent.Childs.length;

    if (countChild > 0) {
        mIndex = Math.max(...parent.Childs.map(t => t.MIndex)) + 1;
    }

    var subSwotanalyse = {
        Id: vmCommon.newGuid(),//$(e).attr('child'),
        Name: kLg.subTrend,
        SwotanalyseId: swotanalyseId,
        TempSwotanalyseId: swotanalyseId,
        Value: 0,
        MIndex: mIndex,
        Evaluation: 0,
        Description: kLg.descriptionSwotanalyse,
        CreatedBy: 1 // =1 when it s new
    };

    parent.Childs.push(subSwotanalyse);

    that.ApSwotanalyseTemplateId = null;
    that.reloadData();
    vmApEval.setModelChanged();
};

function updateSubItemValue(subId, value, parentid) {
    value = parseInt(value);
    if (vmApSwotanalyse.SwotanalyseData.Trends != null && vmApSwotanalyse.SwotanalyseData.Trends.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Trends.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == subId) {
                        child.Evaluation = value;
                        child.Value = value;
                        child.ModifiedBy = 1;
                        vmApEval.setModelChanged();
                    }
                    return child;
                });
            }
            return item;
        });
    }

    if (vmApSwotanalyse.SwotanalyseData.Trends != null && vmApSwotanalyse.SwotanalyseData.Criterias.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Criterias.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == subId) {
                        child.Evaluation = value;
                        child.Value = value;
                        child.ModifiedBy = 1;
                    }
                    return child;
                });
            }
            return item;
        });
    }

    vmApEval.setModelChanged();
    vmApSwotanalyse.ApSwotanalyseTemplateId = null;
    //reloadData();
}

function setupLabelEditable() {
    if (vmApEval.curRole > 0) {
        bindSwitchSpanToInputLib(updateItemName, "editAble", removeHover, setButtonVisible);
        bindSwitchSpanToInputLibWithParent(updateSubName, "editAbleChild", removeHover, setButtonVisible);
        //setEditbaleSwotanalyseCanBeNull("span.editAbleChildDes", updateSubDescription, setButtonVisible);
        convertTextToTextarea();
    }
}

function removeHover() {
    $("#swotArea a.icon-add-small").hide();
    $('a.icon-bin-small').hide();
    $('td').unbind('mouseenter mouseleave');
}

function setUpDbClick(e) {
    $(e).dblclick(function () {
        $('td').unbind('hover');
        $("#swotArea a.icon-bin-small").hide();
        $("#swotArea a.icon-add-small").hide();
    });
}

function updateItemName(id, value) {

    if (vmApSwotanalyse.SwotanalyseData.Trends.find(t => t.Id == id)) {
        vmApSwotanalyse.SwotanalyseData.Trends.map(item => {
            if (item.Id == id) {
                item.Name = value;
                item.ModifiedBy = 1;
            }
            return item;
        });
    }

    if (vmApSwotanalyse.SwotanalyseData.Criterias.find(t => t.Id == id)) {
        vmApSwotanalyse.SwotanalyseData.Criterias.map(item => {
            if (item.Id == id) {
                item.Name = value;
                item.ModifiedBy = 1;
            }
            return item;
        });
    }

    vmApSwotanalyse.ApSwotanalyseTemplateId = null;
    vmApEval.setModelChanged();
    //reloadData();
    return value;
}

function updateSubName(parentid, id, value) {

    if (vmApSwotanalyse.SwotanalyseData.Trends.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Trends.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == id) {
                        child.Name = value;
                        child.ModifiedBy = 1;
                    }
                    return child;
                });
            }
            return item;
        });
    }

    if (vmApSwotanalyse.SwotanalyseData.Criterias.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Criterias.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == id) {
                        child.Name = value;
                        child.ModifiedBy = 1;
                    }
                    return child;
                });
            }
            return item;
        });
    }

    //reloadData();
    vmApSwotanalyse.ApSwotanalyseTemplateId = null;
    vmApEval.setModelChanged();
    return value;
}

function updateSubDescription(value, e) {
    var parentid = e.attr('parent');
    var id = e.attr('childId');

    if (vmApSwotanalyse.SwotanalyseData.Trends != null && vmApSwotanalyse.SwotanalyseData.Trends.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Trends.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == id) {
                        child.Description = value;
                        child.ModifiedBy = 1;
                    }
                    return child;
                });
            }
            return item;
        });
    }

    if (vmApSwotanalyse.SwotanalyseData.Criterias != null && vmApSwotanalyse.SwotanalyseData.Criterias.find(t => t.Id == parentid)) {
        vmApSwotanalyse.SwotanalyseData.Criterias.map(item => {
            if (item.Id == parentid) {
                item.Childs.map(child => {
                    if (child.Id == id) {
                        child.Description = value;
                        child.ModifiedBy = 1;
                    }
                    return child;
                });
            }
            return item;
        });
    }

    //reloadData();

    vmApSwotanalyse.ApSwotanalyseTemplateId = null;
    vmApEval.setModelChanged();
    return value;
}

function setupLangueSwotanalyse() {
    $("#spanCriteria").text(kLg.criteria);
    $("#spanTrend").text(kLg.trend);
    $("#spanRiskChance").text(kLg.chance + '-' + kLg.risk);
    $("#spanWeakStrong").text(kLg.strong + '-' + kLg.weak);
    $(".spanDescriptionSwotanalyse").text(kLg.descriptionSwotanalyse);
}

vmApSwotanalyse.setupLabelLanguage = function () {
    var that = this;

    $('.btnAddTemp').text(kLg.btnAddTemp);
    $('.btnUpdateTemp').text(kLg.btnUpdateTemp);
    $('.btnDelTemp').text(kLg.btnDelTemp);
    $('.btnImportTemp').text(kLg.btnImportTemp);
};

vmApSwotanalyse.deleteCriteria = function (e) {
    pConfirm(kLg.confirmDeleteItem).then(function () {
        var id = $(e).attr("parent");

        var i;
        if ((i = vmApSwotanalyse.SwotanalyseData.Trends.findIndex(t => t.Id == id)) !== -1) {
            if (vmApSwotanalyse.SwotanalyseData.Trends[i].CreatedBy == 1) {
                vmApSwotanalyse.SwotanalyseData.Trends.splice(i, 1);
            }
            else {
                vmApSwotanalyse.SwotanalyseData.Trends[i].DeletedBy = 1;
            }

        }
        else {
            i = vmApSwotanalyse.SwotanalyseData.Criterias.findIndex(t => t.Id == id)

            if (vmApSwotanalyse.SwotanalyseData.Criterias[i].CreatedBy == 1) {
                vmApSwotanalyse.SwotanalyseData.Criterias.splice(i, 1);
            }
            else {
                vmApSwotanalyse.SwotanalyseData.Criterias[i].DeletedBy = 1;
            }
        }

        vmApEval.setModelChanged();
        vmApSwotanalyse.ApSwotanalyseTemplateId = null;
        vmApSwotanalyse.reloadData();
    });
};

vmApSwotanalyse.deleteSub = function (e) {
    pConfirm(kLg.confirmDeleteItem).then(function () {
        var childId = $(e).attr("child");
        var parentid = $(e).attr("parent");

        var i;

        if (vmApSwotanalyse.SwotanalyseData.Trends.find(t => t.Id == parentid)) {
            vmApSwotanalyse.SwotanalyseData.Trends.map(item => {
                if (item.Id == parentid) {
                    i = item.Childs.findIndex(t => t.Id == childId)

                    if (item.Childs[i].CreatedBy == 1) {
                        item.Childs.splice(i, 1);
                    }
                    else {
                        item.Childs[i].DeletedBy = 1;
                    }
                }
            });
        }

        if (vmApSwotanalyse.SwotanalyseData.Criterias.find(t => t.Id == parentid)) {
            vmApSwotanalyse.SwotanalyseData.Criterias.map(item => {
                if (item.Id == parentid) {
                    i = item.Childs.findIndex(t => t.Id == childId)

                    if (item.Childs[i].CreatedBy == 1) {
                        item.Childs.splice(i, 1);
                    }
                    else {
                        item.Childs[i].DeletedBy = 1;
                    }
                }
            });
        }

        vmApSwotanalyse.ApSwotanalyseTemplateId = null;
        vmApSwotanalyse.reloadData();
        vmApEval.setModelChanged();
    });
};

function setButtonVisible() {
    $("#swotArea a.icon-bin-small").hide();
    $("#swotArea a.icon-add-small:not(.firstSwotButton)").hide();
    $("#swotArea a.icon-add-small.firstSwotButton").show();
    $("#swotArea td").hover(function () {
        $(this).find("a.icon-bin-small").show();
        $(this).find("a.icon-add-small").show();


    }, function () {
        $(this).find("a.icon-bin-small").hide();
        $(this).find("a.icon-add-small:not(.firstSwotButton)").hide();
    }
    );
}

function refreshCurrentPage() {
    location.reload();
}

var defaultwidth = 300;
function convertTextToTextarea() {
    $('span.editAbleChildDes').bind("dblclick", function () {
        var inputDemandEdit = $(this);
        var width = inputDemandEdit.closest('td').width() > defaultwidth ? inputDemandEdit.closest('td').width() : defaultwidth;
        var height = inputDemandEdit.closest('td').height();
        var tex = $(this).text();
        $('td').unbind('hover');
        $("#swotArea a.icon-bin-small").hide();
        $("#swotArea a.icon-add-small").hide();
        var textarea = $('<textarea rows="10" cols="30" style="position: absolute; left:-5px; top:-5px; z-index:60000;width: ' + width + 'px;height: ' + height + 'px;">' + tex + '</textarea>');
        $(this).prev("div.divDemandTextAreaEdit").html(textarea);
        textarea.focus();
        textarea.blur(function () {
            textarea.hide();
            var tV = $(this).val();
            if (tV.trim() == '')             // bug 27557 (sprint 5.01)
                tV = kLg.doubleclick;
            
            inputDemandEdit.text(tV);
            setButtonVisible();
        });

        textarea.on('keyup', function () {
            updateSubDescription($(this).val(), inputDemandEdit);

        });
    });
}

vmApSwotanalyse.initddlTemplate = function (chooseId) {
    var that = this;

    var listTemp = [];
    that.ApSwotanalyseTemplates = that.ApSwotanalyseTemplates || [];
    if (that.ApSwotanalyseTemplates) {
        listTemp = that.ApSwotanalyseTemplates.filter(t => t.DeletedBy != 1);
    }

    var templateData = vmCommon.deepCopy(listTemp);

    templateData.unshift({ Name: kLg.btnSelectTemp, Id: -1 });
    $('#ddlTemplate').kendoDropDownList({
        dataTextField: "Name",
        dataValueField: "Id",
        dataSource: templateData,
        change: ddlTemplate_Onchange,
        autoBind: false,
        open: function (e) {
            that.preTemplateId = that.ddlTemplate.value();
        }
    });

    that.ddlTemplate = $("#ddlTemplate").data("kendoDropDownList");
    that.ddlTemplate.value(-1);
    if (chooseId) {
        if (listTemp.find(t => t.Id == chooseId)) {
            that.ddlTemplate.value(chooseId);
        }
    }

    function ddlTemplate_Onchange() {
        if (parseInt(that.ddlTemplate.value()) === -1) {
            that.ApSwotanalyseTemplateId = null;
        }
        else {
            pConfirm(kLg.msgConfirmApplyNewTemplate).then(function () {
                that.preTemplateId = that.ddlTemplate.value();
                that.ApSwotanalyseTemplateId = that.ddlTemplate.value();
                var template = that.ApSwotanalyseTemplates.find(t => t.Id == that.preTemplateId);

                if (template != null) {
                    var oldData = {};
                    var newData = {};
                    var currentData = vmCommon.deepCopy(that.SwotanalyseData);

                    if (template.ApSwotanalyses == undefined) {
                        that.dataservice.getDataByTemplateId(that.preTemplateId, (resData) => {

                            var templateItemArr = [];

                            var newData = resData.value;

                            newData.Criterias.map(t => {
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
                                        child.Value = 0;
                                        child.CreatedBy = 1;
                                    });
                                }
                                templateItemArr.push(t);
                            });

                            newData.Trends.map(t => {
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
                                        child.Value = 0;
                                        child.CreatedBy = 1;
                                    });
                                }
                                templateItemArr.push(t);
                            });

                            var oldData = {};

                            oldData.Criterias = currentData.Criterias.filter(t => !isNaN(t.Id)).map(t => {
                                t.DeletedBy = 1;

                                if (t.Childs.length > 0) {
                                    t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                                        child.DeletedBy = 1;
                                        return child;
                                    });
                                }
                                return t;
                            });

                            oldData.Trends = currentData.Trends.filter(t => !isNaN(t.Id)).map(t => {
                                t.DeletedBy = 1;

                                if (t.Childs.length > 0) {
                                    t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                                        child.DeletedBy = 1;
                                        return child;
                                    });
                                }
                                return t;
                            });

                            vmApSwotanalyse.SwotanalyseData.Criterias = oldData.Criterias.concat(newData.Criterias);
                            vmApSwotanalyse.SwotanalyseData.Trends = oldData.Trends.concat(newData.Trends);

                            that.bindData(newData);

                            template.ApSwotanalyses = vmCommon.deepCopy(templateItemArr);
                        });
                    } else {
                        var templateItem = vmCommon.deepCopy(template.ApSwotanalyses);

                        oldData.Criterias = currentData.Criterias.filter(t => !isNaN(t.Id)).map(t => {
                            t.DeletedBy = 1;

                            if (t.Childs.length > 0) {
                                t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                                    child.DeletedBy = 1;
                                    return child;
                                });
                            }
                            return t;
                        });

                        oldData.Trends = currentData.Trends.filter(t => !isNaN(t.Id)).map(t => {
                            t.DeletedBy = 1;

                            if (t.Childs.length > 0) {
                                t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                                    child.DeletedBy = 1;
                                    return child;
                                });
                            }
                            return t;
                        });

                        newData.Criterias = templateItem.filter(t => t.GroupType == 1).map(t => {
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
                                    child.Value = 0;
                                    child.CreatedBy = 1;
                                    return child;
                                });
                            }

                            return t;
                        });

                        newData.Trends = templateItem.filter(t => t.GroupType == 2).map(t => {
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
                                    child.Value = 0;
                                    child.CreatedBy = 1;
                                    return child;
                                });
                            }

                            return t;
                        });

                        var newDataCopy = vmCommon.deepCopy(newData);

                        vmApSwotanalyse.SwotanalyseData.Criterias = oldData.Criterias.concat(newDataCopy.Criterias);
                        vmApSwotanalyse.SwotanalyseData.Trends = oldData.Trends.concat(newDataCopy.Trends);

                        that.bindData(newDataCopy);
                    }

                    vmApEval.setModelChanged();
                }
            }, function () {
                that.ddlTemplate.value(that.preTemplateId);
            });
        }
    }
};

vmApSwotanalyse.btnAddTemp_Onclick = function (actionType, e) {
    var that = this;
    $('#txtTempName').tooltip('destroy');
    //clearError('msgEditTemplate');
    var $tbody = $(e).parent().parent().find('tbody');
    var areaId = $tbody.attr('id');

    that.templateType = templateType.ApSwotanalyseTemplate;
    if (that.SwotanalyseData.Trends.filter(t => t.DeletedBy != 1).length == 0
        && that.SwotanalyseData.Criterias.filter(t => t.DeletedBy != 1).length == 0) { //validation, no evaluation
        pAlert(kLg.msgRequiredElement);
        return;
    }

    that.evalTempAction = actionType;
    var tempName = '',
        title = kLg.btnAddTemp;
    if (actionType == templateAction.Update) {
        title = kLg.btnUpdateTemp;
        if (parseInt(that.ddlTemplate.value()) === -1) {
            pAlert(kLg.msgChooseTemplate);
            return;
        }

        tempName = that.ddlTemplate.text();
    }

    bindTemplate('popupSwotTemplate', 'ap-swotanalyse-template', tempName);
    $('.lblEvalTempName').text(kLg.lblTemplateName);
    $('#textCancelButton').text(kLg.btnCancel);
    $('#textUpdateButton').text(kLg.btnOk);
    that.popupTemplate = showTempNamePopup(that.popupTemplate, $("#popupSwotTemplate"), null, title, function () {

        that.popupTemplate.destroy();
        that.popupTemplate = null;
        let popupS = `<div id="popupSwotTemplate"></div>`;
        $('#popGoalActionEval').length > 0 && $('#popGoalActionEval').append(popupS);
        $('#popSubmarketEval').length > 0 && $('#popSubmarketEval').append(popupS);// TODO: SONPT. change to body or get parent for easier to use
    });

    that.bindSaveTemplatePopup();
};

vmApSwotanalyse.bindSaveTemplatePopup = function () {
    var that = this;

    $('#btnSaveTemplate').bind('click', function () {
        disableButtonPopup();
        //vmSME.evalTempAction
        $("#txtTempName").tooltip('destroy');
        var tempName = $('#txtTempName').val();
        if (!checkRequired(tempName)) {
            vmCommon.showTooltip($('#txtTempName'), kLg.msgRequiredTempName, 0, true);
            enableButtonPopup();
            return;
        }
        $('#btnSaveTemplate').unbind('click');
        if (that.templateType == templateType.ApSwotanalyseTemplate) {
            that.SaveTemplate();
        }
    });
};

vmApSwotanalyse.SaveTemplate = function () {
    var that = this;

    if (JSON.stringify(that.SwotanalyseData) === JSON.stringify({})) {
        $('#txtTempName').attr('title', kLg.msgRequiredElement);
        $("#txtTempName").tooltip({ placement: 'top', trigger: 'manual' }).tooltip('show');
        return;
    }

    var currentData = vmCommon.deepCopy(that.SwotanalyseData);

    var oldData = {};
    var newData = {};
    var templateItem = [];
    //deleted old evals

    oldData.Criterias = that.SwotanalyseData.Criterias.filter(t => !isNaN(t.Id)).map(t => {
        t.DeletedBy = 1;

        if (t.Childs.length > 0) {
            t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                child.DeletedBy = 1;
                return child;
            });
        }

        return t;
    });

    oldData.Trends = that.SwotanalyseData.Trends.filter(t => !isNaN(t.Id)).map(t => {
        t.DeletedBy = 1;

        if (t.Childs.length > 0) {
            t.Childs = t.Childs.filter(t => !isNaN(t.Id)).map(child => {
                child.DeletedBy = 1;
                return child;
            });
        }

        return t;
    });

    newData.Criterias = currentData.Criterias.filter(t => t.DeletedBy != 1).map(t => {
        var tempId_parent = vmCommon.newGuid();

        t.TempId = tempId_parent;
        t.Id = tempId_parent;
        t.CreatedBy = 1;

        if (t.Childs.length > 0) {
            t.Childs = vmCommon.deepCopy(t.Childs).map(child => {
                var tempId_child = vmCommon.newGuid();

                child.Id = tempId_child;
                child.TempSwotanalyseId = tempId_parent;
                child.SwotanalyseId = tempId_parent;
                child.CreatedBy = 1;
                return child;
            });
        }

        templateItem.push(t);
        return t;
    });

    newData.Trends = currentData.Trends.filter(t => t.DeletedBy != 1).map(t => {
        var tempId_parent = vmCommon.newGuid();

        t.TempId = tempId_parent;
        t.Id = tempId_parent;
        t.CreatedBy = 1;

        if (t.Childs.length > 0) {
            t.Childs = vmCommon.deepCopy(t.Childs).map(child => {
                var tempId_child = vmCommon.newGuid();

                child.Id = tempId_child;
                child.TempSwotanalyseId = tempId_parent;
                child.SwotanalyseId = tempId_parent;
                child.CreatedBy = 1;
                return child;
            });
        }

        templateItem.push(t);
        return t;
    });

    that.SwotanalyseData.Criterias = oldData.Criterias.concat(newData.Criterias);
    that.SwotanalyseData.Trends = oldData.Trends.concat(newData.Trends);

    that.bindData(newData);

    var saveItem = vmCommon.deepCopy(templateItem).map(t => {
        t.TempId = t.Id;
        t.Id = isNaN(t.Id) ? 0 : t.Id;

        if (t.Childs.length > 0) {
            t.Childs.map(child => {
                child.Id = isNaN(child.Id) ? 0 : child.Id;
                child.TempSwotanalyseId = child.SwotanalyseId;
                child.SwotanalyseId = isNaN(child.SwotanalyseId) ? 0 : child.SwotanalyseId;
            });
        }
        return t;
    });

    var tempName = $('#txtTempName').val();
    var newTemplate = {
        Id: vmCommon.newGuid(),
        Name: tempName,
        Type: templateType.ApSwotanalyseTemplate,
        ApSwotanalyses: saveItem,
        CreatedBy: 0,
        ModifiedBy: 0
    };

    if (that.evalTempAction == templateAction.Add) {
        newTemplate.CreatedBy = 1;
    }
    else if (that.evalTempAction == templateAction.Update) {
        var tempId = that.ddlTemplate.value();

        var tempObject = that.ApSwotanalyseTemplates.find(t => t.Id == tempId);

        that.ApSwotanalyseTemplateId = tempId;

        tempObject.ModifiedBy = 1;
        tempObject.Name = newTemplate.Name;
        tempObject.ApSwotanalyses = newTemplate.ApSwotanalyses;

        newTemplate = tempObject;
    }

    that.dataservice.saveTemplate(newTemplate, (rs) => {
        var templateId = rs.value;

        if (that.evalTempAction == templateAction.Add) {
            newTemplate.CreatedBy = 0;
            newTemplate.Id = templateId;

            that.preTemplateId = templateId;
            that.ApSwotanalyseTemplateId = newTemplate.Id;
            that.ApSwotanalyseTemplates.push(newTemplate);
            that.initddlTemplate(newTemplate.Id);

            vmApEval.modelChanged = true;
            that.closeLayout();
        }
        else if (that.evalTempAction == templateAction.Update) {
            newTemplate.ModifiedBy = 0;
            that.initddlTemplate(templateId);

            that.closeLayout();
        }
    });
};

vmApSwotanalyse.btnOpenTemplate_Onclick = function (type, positionIndex) {
    var that = this;
    vmApEval.currentSelectedPositionIndex = positionIndex;
    vmApEval.templateType = type;

    if (vmApEval.curRole > 0) {
        var data = that.ApSwotanalyseTemplates.filter(t => t.DeletedBy != 1);

        bindTemplate('popupDeleteSwotTemplate', 'delete-temp-pop-swot', data);

        $('#lblTemplateNameDeleteTemplate').text(kLg.lblTemplateName);
        $('.btnChoose').text(kLg.btnDelTemp);
        $('.btnCancel').text(kLg.btnCancel);

        //pop auto height -> should write function
        that.deleteTempWindow = showPopup2(null, $('#popupDeleteSwotTemplate'), null, kLg.DeleteTemplate, 640, $('#popupDeleteSwotTemplate').height(), function () {
            that.deleteTempWindow.destroy(); //also remove div deleteTempWindow. Try $('#deleteTempWindow').empty(); $('#deleteTempWindow').html(''); -> All attributes were created by Kendo still exist
            that.deleteTempWindow = null;
            $('#popSubmarketEval').append('<div id="popupDeleteSwotTemplate"> </div>');// re add for later use
        });
        if (that && that.deleteTempWindow) that.deleteTempWindow.element.focus();
    }
};

vmApSwotanalyse.btnDeleteTemplate_Onclick = function () {
    var that = this;

    var lstId = [],
        $selectedTemp = $('.cbTemp:checked');
    $selectedTemp.each(function () {
        lstId.push($(this).parents('tr').attr('id'));
    });

    if (lstId.length > 0) {
        pConfirm(kLg.msgConfirmDelTemplate).then(function () {
            lstId.map(id => {
                var templateItem = that.ApSwotanalyseTemplates.find(t => t.Id == id);

                var index = that.ApSwotanalyseTemplates.indexOf(templateItem);
                that.ApSwotanalyseTemplates.splice(index, 1);

                templateItem.DeletedBy = 1;
                templateItem.ApSwotanalyses = null;

                that.dataservice.saveTemplate(templateItem, () => {
                });

                if (that.ApSwotanalyseTemplateId == id) {
                    that.ApSwotanalyseTemplateId = null;
                }
            });

            that.initddlTemplate(that.ApSwotanalyseTemplateId);

            that.btnCloseDelTemplatePopup_Onclick();
        });
    } else {
        //pAlert(kLg.msgNonTemplateIsSelected);
        that.btnCloseDelTemplatePopup_Onclick();
    }
};

vmApSwotanalyse.btnCloseDelTemplatePopup_Onclick = function () {
    if (this.deleteTempWindow)
        this.deleteTempWindow.close();
};

vmApSwotanalyse.closeLayout = function (obj) {
    $('#btnSaveTemplate').unbind('click'); // avoid repeat on_click when open pop many times
    enableButtonPopup();
    this.popupTemplate.close();
};

vmApSwotanalyse.changePotitionForParent = function (desId, sourceId) {
    var that = this;

    var desObj = that.SwotanalyseData.Trends.find(t => t.Id == desId)
        || that.SwotanalyseData.Criterias.find(t => t.Id == desId);
    var srcObj = that.SwotanalyseData.Trends.find(t => t.Id == sourceId)
        || that.SwotanalyseData.Criterias.find(t => t.Id == sourceId);

    if (desObj == undefined || desObj == null
        || srcObj == undefined || srcObj == null
        || desObj.GroupType != srcObj.GroupType
    ) {
        return;
    }

    var groupSourceCopy = vmCommon.deepCopy(srcObj);
    var groupDesCopy = vmCommon.deepCopy(desObj);

    desObj.MIndex = groupSourceCopy.MIndex;
    srcObj.MIndex = groupDesCopy.MIndex;

    desObj.ModifiedBy = 1;
    srcObj.ModifiedBy = 1;

    that.reloadData();
};

vmApSwotanalyse.changePotitionForChild = function (desId, sourceId, parentDesId, parentSrcId) {
    var that = this;

    var desObj = undefined, srcObj = undefined;
    var desGroupType = 1, srcGroupType = 1;

    var parentDes = that.SwotanalyseData.Trends.find(t => t.Id == parentDesId)
        || that.SwotanalyseData.Criterias.find(t => t.Id == parentDesId);

    if (parentDes) {
        desGroupType = parentDes.GroupType;

        desObj = parentDes.Childs.find(t => t.Id == desId);
    }

    var parentSrc = that.SwotanalyseData.Trends.find(t => t.Id == parentSrcId)
        || that.SwotanalyseData.Criterias.find(t => t.Id == parentSrcId);

    if (parentSrc) {
        srcGroupType = parentSrc.GroupType;

        srcObj = parentSrc.Childs.find(t => t.Id == sourceId);
    }

    if (desGroupType != srcGroupType) {
        return;
    }

    if (desObj == undefined && srcObj == undefined) {
        return;
    }

    var scrCopy = vmCommon.deepCopy(srcObj);
    var desCopy = vmCommon.deepCopy(desObj);

    if (desId == -1 || sourceId == -1) {
        if (desId == -1) {
            if (isNaN(sourceId)) {
                var index = parentSrc.Childs.findIndex(t => t.Id == sourceId);
                parentSrc.Childs.splice(index, 1);
            }
            else {
                srcObj.DeletedBy = 1;
            }

            scrCopy.Id = vmCommon.newGuid();
            scrCopy.MIndex = 0;
            scrCopy.SwotanalyseId = parentSrc.Id;
            scrCopy.TempSwotanalyseId = parentSrc.Id;

            parentDes.Childs.push(scrCopy);
        }
        else {
            if (isNaN(desId)) {
                index = parentDes.Childs.findIndex(t => t.Id == desId);
                parentDes.Childs.splice(index, 1);
            }
            else {
                desObj.DeletedBy = 1;
            }

            desCopy.Id = vmCommon.newGuid();
            desCopy.MIndex = 0;
            desCopy.SwotanalyseId = parentSrc.Id;
            desCopy.TempSwotanalyseId = parentSrc.Id;

            parentSrc.Childs.push(desCopy);
        }
    }
    else {

        desObj.Name = scrCopy.Name;
        desObj.Value = scrCopy.Value;
        desObj.Description = scrCopy.Description;
        desObj.Evaluation = scrCopy.Value;

        srcObj.Name = desCopy.Name;
        srcObj.Value = desCopy.Value;
        srcObj.Description = desCopy.Description;
        srcObj.Evaluation = desCopy.Value;

        desObj.ModifiedBy = 1;
        srcObj.ModifiedBy = 1;
    }

    that.reloadData();
    vmApEval.setModelChanged();
    vmApSwotanalyse.ApSwotanalyseTemplateId = null;
};

vmApSwotanalyse.dragDropSetting = function () {
    var that = this;

    var sourceId, desId, tcell, parentSourceId, hDrag, wDrag, position, xDrag, yDrag;

    $('.itemDraggable').draggable({
        revert: true,
        cursor: 'default',
        cursorAt: { top: 0, left: 0 },
        handler: 'icon-arow-towway-vertical',
        axis: 'y',
        scroll: true,
        start: function () {
            $(this).addClass('onDragging');
            var dragOff = $(this).offset();
            xDrag = dragOff.left;
            yDrag = dragOff.top;
            tcell = $(this).closest('td');
            sourceId = tcell.attr('val');
            parentSourceId = tcell.closest('tr').attr('val');
            hDrag = tcell.height();
            wDrag = tcell.width();
        },
        stop: function () {
            $(this).removeClass('onDragging');
        }
    });

    $('.divDropSwotParent').droppable({
        hoverClass: 'ui-state-hover',
        accept: '.divDropSwotParent',
        tolerance: 'pointer',
        drop: function (event, ui) {
            desId = $(this).attr('val');
            if (sourceId == desId) { return; }
            position = vmCommon.getPositionByY(this, ui, yDrag);
            that.changePotitionForParent(desId, sourceId);
        }
    });

    $('.divDropSwotChild').droppable({
        hoverClass: 'ui-state-hover',
        accept: '.divDropSwotChild',
        tolerance: 'pointer',
        drop: function (event, ui) {
            desId = $(this).attr('val');
            var parentDesId = $(this).closest('tr').attr('val');
            if (sourceId == desId) { return; }
            position = vmCommon.getPositionByY(this, ui, yDrag);
            that.changePotitionForChild(desId, sourceId, parentDesId, parentSourceId);
        }
    });
};

$(document).ready(function () {
    if (vmApEval.goalActionModel.ActionPlanEvalData == null) { //if (vmApEval.isShowDirect && vmApEval.countLoadForm.Tab2 == 0) {
        vmApSwotanalyse.ApSwotanalyseTemplateId = vmApEval.ApSwotanalyseTemplateId;
        vmApSwotanalyse.loadData();
    }
    else {
        if (vmApEval.goalActionModel.ActionPlanEvalData.ApSwotanalyses != null) {
            if (vmApEval.countLoadForm.Tab2 == 0) {
                vmApSwotanalyse.ApSwotanalyseTemplates = vmApEval.goalActionModel.ApSwotanalyseTemplates;
                vmApSwotanalyse.ApSwotanalyseTemplateId = vmApEval.ApSwotanalyseTemplateId;
                var swot_data = vmCommon.deepCopy(vmApEval.goalActionModel.ActionPlanEvalData.ApSwotanalyses);

                var tmpData = {
                    Trends: [],
                    Criterias: []
                };

                tmpData.Criterias = swot_data.filter(t => t.GroupType == 1);
                tmpData.Trends = swot_data.filter(t => t.GroupType == 2);

                if (tmpData.Criterias != null && tmpData.Criterias.length > 0) {
                    tmpData.Criterias.map(t => {
                        t.Id = t.Id == 0 ? vmCommon.newGuid() : t.Id;
                        t.TempId = t.Id;

                        t.Childs.length > 0 && t.Childs.map(child => {
                            child.Id = child.Id == 0 ? vmCommon.newGuid() : child.Id;
                            child.TempSwotanalyseId = t.Id;
                            child.SwotanalyseId = t.Id;
                            child.Value = child.Evaluation;
                        });
                    });
                }

                if (tmpData.Trends != null && tmpData.Trends.length > 0) {
                    tmpData.Trends.map(t => {
                        t.Id = t.Id == 0 ? vmCommon.newGuid() : t.Id;
                        t.TempId = t.Id;

                        t.Childs.length > 0 && t.Childs.map(child => {
                            child.Id = child.Id == 0 ? vmCommon.newGuid() : child.Id;
                            child.TempSwotanalyseId = t.Id;
                            child.SwotanalyseId = t.Id;
                            child.Value = child.Evaluation;
                        });
                    });
                }

                vmApSwotanalyse.SwotanalyseData.Criterias = tmpData.Criterias;
                vmApSwotanalyse.SwotanalyseData.Trends = tmpData.Trends;
            }

            vmApSwotanalyse.reloadForm();
        }
        else {
            vmApSwotanalyse.ApSwotanalyseTemplateId = vmApSwotanalyse.ApSwotanalyseTemplateId || -1;
        }

        if (vmApEval.isClickOpenTab && vmApEval.countLoadForm.Tab2 == 0) {
            vmApSwotanalyse.loadData();
        }
        else {
            vmApSwotanalyse.reloadForm();
        }
    }

    ++vmApEval.countLoadForm.Tab2;
    if (vmGoalAction.actionOptions && vmGoalAction.actionOptions.isDisordered)
        $(".evaluation-template-control").hide();

    vmApSwotanalyse.setupLabelLanguage();
});