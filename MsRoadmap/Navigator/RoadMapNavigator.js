Vue.filter('date', function (value) {
    if (!value) return '';
    value = value.toString();
    return kendo.toString(value.jsonToDate(), "d");
});

Vue.component("roadmapnavigator", resolve => {
    const templateLink = '/Navigator/Navigator.html';

    $.get(templateLink, template => {
        resolve({
            props: ["data"],
            data() {
                return {
                    language: kLg
                };
            },
            template: template,
            computed: {
                Lang: () => kLg
            },
            mounted: function () {
                var that = this;

                $("#pop-goalactionnavigator").on("dblclick", ".ganame", function (e) {
                    var gaid = $(e.currentTarget).attr("gaid");
                    var typeid = $(e.currentTarget).attr("typeid");

                    if (gaid == undefined && typeid == undefined && isNaN(Number(typeid))) return;

                    typeid = Number(typeid);
                    var ga = that.findGa(gaid, typeid);

                    if (ga == null || gaid == vmCommon.emptyGuid || !ga.Visibility) return;

                    vmGoalAction.currency = {};
                    var info = {
                        CurrencyName: ga.Currency,
                        IndependencyId: ga.IndependencyId,
                        IsMasterGoal: false,
                        ProductId: ga.ProductId,
                        RegionId: ga.RegionId || 0,
                        SubmarketId: ga.SubMarketId,
                        SubMarketProductId: ga.SubMarketProductId
                    };
                    var entryData = {
                        independencyId: ga.IndependencyId,
                        parentId: ga.ParentId,
                        productId: ga.ProductId,
                        regionId: ga.RegionId || 0,
                        submarketId: ga.SubMarketId,
                        subMarketProductId: ga.SubMarketProductId
                    };

                    switch (typeid) {
                        case vmCommon.GoalActionContentType.MainGoal:
                            entryData.goalId = ga.Id;
                            entryData.goalType = typeid;

                            vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                    var parentId = ga.IndependencyId || ga.SubMarketProductId
                                    vmGoalAction.goalOptions = {
                                        IsEdit: true,
                                        Goal: serData.value.TheObject,
                                        Url: serData.value.Url,
                                        IndependencyId: ga.IndependencyId,
                                        ProductId: info.ProductId,
                                        SubmarketId: info.SubmarketId,
                                        PathParentId: parentId ? parentId.toString() : '',
                                        PathParentMdf: ga.ParentMdf,
                                        IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
                                    };
                                    info.ProductId = serData.value.TheObject.OwnerProductId;
                                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
                                    vmGoalAction.currency.Name = info.CurrencyName;

                                    vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection)
                                        : vmGoalAction.bindCustomConnection({ ProductId: info.ProductId, SubmarketId: info.SubmarketId }, serData.value.CustomConnection);

                                    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
                                    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                                    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                                    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
                                    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
                                    vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;
                                    vmGoalAction.goalOptions.RegionId = ga.RegionId;
                                    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                    vmGoalAction.goalOptions.ProductId = info.ProductId;
                                    vmGoalAction.goalOptions.IndependencyId = ga.IndependencyId;
                                    vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                    vmGoalAction.goalOptions.SubMarketProductId = ga.SubMarketProductId;
                                    vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                    vmGoalAction.goalOptions.isRedirect = true;
                                    $.extend(vmGoalAction.goalOptions, info);
                                    vmGoalAction.goalOptions.role = serData.value.RoleId;
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
                                    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                    vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, serData.value.RoleId);
                                    vmGoalAction.SelectorId.mainGoal = ga.Id;

                                    vmGoalAction.goalOptions.goalActionNavigationCallback = that.$parent.reLoadGoalActionContext;
                                    vmGoalAction.showAddGoalPopup(htmlEscape(`${kLg.titlepEditMainGoalNew1}${kLg.labelMainGoalName}${kLg.titlepEditMainGoalNew2}`)).then(function (title) {
                                    }).catch(function (error) {
                                        console.log('something went wrong from boardColumn - edit MainGoal' + error);
                                    });
                                }
                            });

                            break;

                        case vmCommon.GoalActionContentType.SubGoal:
                            entryData.goalId = ga.Id;
                            entryData.parentId = ga.ParentId;
                            entryData.goalType = typeid;

                            vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                    var parentId = ga.ParentId || '';
                                    vmGoalAction.goalOptions = {
                                        IsEdit: true,
                                        Goal: serData.value.TheObject,
                                        Url: serData.value.Url,
                                        ParentId: serData.value.TheObject.ParentId,
                                        IndependencyId: ga.IndependencyId,
                                        ProductId: info.ProductId,
                                        SubmarketId: info.SubmarketId,
                                        PathParentId: parentId.toString(),
                                        PathParentMdf: ga.ParentMdf,
                                        IsMasterGoalKpi: serData.value.AreaInfo.IsMasterGoalKpi
                                    };
                                    info.ProductId = serData.value.TheObject.OwnerProductId;
                                    vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);
                                    vmGoalAction.currency.Name = info.CurrencyName;

                                    vmGoalAction.goalOptions.customConnection = entryData.independencyId ? vmGoalAction.bindIndependencyConnection(serData.value.CustomConnection)
                                        : vmGoalAction.bindCustomConnection({ ProductId: info.ProductId, SubmarketId: info.SubmarketId }, serData.value.CustomConnection);

                                    vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
                                    vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                                    vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;
                                    vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
                                    vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
                                    vmGoalAction.goalOptions.IsMasterGoal = info.IsMasterGoal;
                                    vmGoalAction.goalOptions.RegionId = ga.RegionId;
                                    vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                    vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                    vmGoalAction.goalOptions.ProductId = info.ProductId;
                                    vmGoalAction.goalOptions.IndependencyId = ga.IndependencyId;
                                    vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                    vmGoalAction.goalOptions.SubMarketProductId = ga.SubMarketProductId;

                                    vmGoalAction.goalOptions.isRedirect = true;
                                    $.extend(vmGoalAction.goalOptions, info);
                                    vmGoalAction.goalOptions.role = serData.value.RoleId;
                                    vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
                                    vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                    vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                    vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                    vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.SubGoal, serData.value.RoleId);

                                    vmGoalAction.goalOptions.goalActionNavigationCallback = that.$parent.reLoadGoalActionContext;
                                    //vmGoalAction.showAddGoalPopup(htmlEscape(kLg.labelSubGoalName)).then(function (title) {
                                    vmGoalAction.showAddGoalPopup(htmlEscape(`${kLg.titlepEditMainGoalNew1}${kLg.labelSubGoalName}${kLg.titlepEditMainGoalNew2}`)).then(function (title) {
                                    }).catch(function (error) {
                                        console.log('something went wrong from boardColumn - edit SubGoal' + error);
                                    });
                                }
                            });

                            break;

                        case vmCommon.GoalActionContentType.Action:
                            var info = {
                                actionId: ga.Id,
                                goalId: ga.ParentId,
                                subMarketProductId: ga.SubMarketProductId,
                                parentSubMarketProductId: ga.SubMarketProductId,
                                independencyId: ga.IndependencyId,
                                parentId: ga.ParentId,
                                title: kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,
                                isEdit: true,
                                pathParentId: ga.ParentId || '',
                                pathParentMdf: ga.ParentMdf
                            };

                            vmGoalAction.openPopUpAction2(info);
                            
                            break;
                    }
                });
            },
            methods: {
                findGa: function (gaid, typeid) {
                    var mains = this.data.GoalActions;

                    for (var m = 0; m < mains.length; m++) {
                        var main = mains[m];

                        if (typeid == vmCommon.GoalActionContentType.MainGoal && main.Id == gaid) return main;

                        var subs = main.Childs;
                        for (var s = 0; s < subs.length; s++) {
                            var sub = subs[s];

                            if (typeid == vmCommon.GoalActionContentType.SubGoal && sub.Id == gaid) return sub;

                            var actions = sub.Childs;
                            for (var a = 0; a < actions.length; a++) {
                                var action = actions[a];

                                if (typeid == vmCommon.GoalActionContentType.Action && action.Id == gaid) return action;
                            }
                        }
                    }

                    return null;
                },
                onClose: function () {
                    this.$parent.closeNavigator();
                },
                showpercent: function (isShow, val, eval, todopercent) {
                    let rs;
                    if (eval != null) {
                        rs = eval.round(2);
                    } else if (isShow) {
                        rs = isShow ? val.round(2) + "%" : "";
                    } else if (todopercent != null) {
                        rs = todopercent.round(2) + "%";
                    }

                    return rs;
                },
                gotoActionPlan: function () {
                    var that = this;
                    var url = that.data.Url;
                    if (url) {
                        url = '/Pages/MsGoalAction.aspx?lang=' + kLg.language + '&projid=' + projectId + '&strid=' + strategyId + url + "&fromdash=true";
                        //if (that.data.SubMarketProductId && that.data.SubMarketProductId != vmCommon.emptyGuid) {
                        //    url = url + "&firstCreate=1";
                        //}

                        window.open(url, "_blank");
                    }
                }
            },
            created: function () {
            }
        });
    });
});