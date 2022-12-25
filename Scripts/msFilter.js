var msFilter = msFilter || {};
var vmSMarket = vmSMarket || {};
vmSMarket.filterCriteria = '';
msFilter.enumPage = Object.freeze({ ActionGoal: 2, Calendar: 3, Dashboard: 5 });

msFilter.dataService = function () {
    var projectId = sHandler.ProjectId;
    var strategyId = sHandler.StrategyId;
    var language = sHandler.Lang;
    var callAjaxFilter = function (funcName, entryData, requestType, successCallBack) {
        var url = "../Handlers/FilterHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + "&lang=" + language;
        var loading = "";
        if (window.location.href.toLowerCase().indexOf("goalaction.aspx") == -1) loading = "filter-loading";
        return callAjax(loading, url, entryData, successCallBack, requestType);
    };

    var callAjaxGoalAction = function (funcName, entryData, requestType, successCallBack) {
        var url = "../Handlers/MsGoalAction.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + "&lang=" + language;
        var loading = "";
        if (window.location.href.toLowerCase().indexOf("goalaction.aspx") == -1) loading = "actionplan-loading";
        return callAjax(loading, url, JSON.stringify(entryData), successCallBack, requestType);
    };

    var callAjaxCalendar = function (funcName, entryData, requestType, successCallBack) {
        var url = "../Handlers/CalendarHandler.ashx?funcName=" + funcName + "&projid=" + projectId + "&strid=" + strategyId + "&lang=" + language;
        return callAjax("mix-loading", url, JSON.stringify(entryData), successCallBack, requestType);
    };

    var callAjaxByPost = function (funcName, entryData, successFunc) {
        return callAjaxFilter(funcName, JSON.stringify(entryData), AjaxConst.PostRequest, successFunc);
    };


    var getAllFilterData = function (entryData, successFunc) {
        callAjaxByPost("getallfilterdata", entryData, successFunc);
    };
   
    var filterData = function (entryData, successFunc) {
        callAjaxByPost("filterdata", entryData, successFunc);
    };

    var onActionPlanFilter = function (entryData, requestType, successFunc) {
        callAjaxGoalAction("getSubmarketProductViewWithFilter", entryData, requestType, successFunc);
    };

    var onMixFilter = function (entryData, requestType, successFunc) {
        callAjaxCalendar("getactionwithfilter", entryData, requestType, successFunc);
    };

    var saveFilter = function (entryData, successFunc) {
        return callAjaxByPost("savefilter", entryData, successFunc);
    };

    var createFilter = function (entryData, successFunc) {
        callAjaxByPost("createfilter", entryData, successFunc);
    };

    var setUsingFilter = function (entryData, successFunc) {
        callAjaxByPost("setusingfilter", entryData, successFunc);
    };

    var deleteFilter = function (entryData, successFunc) {
        callAjaxByPost("deletefilter", entryData, successFunc);
    };

    var showNavigation = function (entryData, successFunc) {
        callAjaxByPost("shownavigation", entryData, successFunc);
    };

    return {
        getAllFilterData: getAllFilterData, filterData: filterData, onActionPlanFilter: onActionPlanFilter, onMixFilter: onMixFilter, saveFilter: saveFilter, createFilter: createFilter,
        setUsingFilter: setUsingFilter,
        deleteFilter: deleteFilter,
        showNavigation: showNavigation
    };
}();

var projectId = 0, strategyId = 0, language = "de";
//ready
$(function () {
    var objQuery = new queryString(true);
    projectId = parseInt(objQuery.get("projid")) || 0;
    strategyId = parseInt(objQuery.get("strid")) || 0;
    language = objQuery.get("lang") || "de";
});

msFilter.controlService = function () {
    var targetFilter, models = {}, sources = {}, RegionAccountRoles = [], binded = [], criterias = [], defaultRegion, isShowNavigationMenu = false, isReady = false;
    //exist a single type at a time
    var uniqueTypies = [29, 22, 21];

    //filters has search control
    var hasSearchFilter = [2, 3, 8, 9, 10, 11, 12, 14];

    //The types depend on the selected regions
    var dependOnRegionTypies = [30, 15, 21, 22, 29];

    var getCriteriaName = function (criteriaId) {
        switch (criteriaId) {
            case 23: return kLg.newLand + '/' + kLg.vtextRegion;
            case 3: return kLg.filterLblProductGroup + "/" + kLg.filterLblProduct;
            case 5: return kLg.titleStackholderGroups + "/" + kLg.contactPerson;
            case 32: return kLg.vtextCustomerJourney;
            case 30: return kLg.lblMarktsegemente + "/" + kLg.lblSubmarket;
            case 7: return kLg.filterLabelPerson;
            case 10: return kLg.filterLabelDate2;
            case 12: return kLg.gaLblStatus;
            case 9: return kLg.lblNameCatGoal;
            case 11: return kLg.lblNameAction;
            case 17: return kLg.menuInstrument;
            case 18: return kLg.lblNameAdvertisingMaterials + "/" + kLg.lblNameAdvertiser;
            case 15: return kLg.filterLabelIndependencyGoal;
            case 29: return kLg.lblMasterGoal;
            case 21: return kLg.lblMasterBudget;
            case 22: return kLg.titleActionFibu;
            case 14: return kLg.gaLblField;
            case 27: return kLg.lblNameSubjetThema;
            case 28: return kLg.lblFilterSupplier;
            case 13: return kLg.filterLabelVisibility;

            default: return "";
        };
        
    };

    var getTypeSource = function (type, criteriaType) {
        var typeIds = [];
        switch (type) {
            case vmCommon.FilterType.DashBoard:
                typeIds = [23, 3, 30];
                break;
            default:
                typeIds = [23, 3, 5, 32, 30, 7, 10, 12, 9, 11, 17, 18, 15, 29, 21, 22, 14, 27, 28, 13];
                break;
        }

       
        var lst = criterias.filter(t => typeIds.indexOf(t.TypeId) >= 0 &&
            t.RoleId == mFilter.criteriaRole.SHOW ||
            (isRedirect() &&
                ((criteriaType == 30 && t.TypeId == 30) || (criteriaType == 15 && t.TypeId == 15) || (criteriaType == 13 && t.TypeId == 13))
            )).map(t => {
                    var isDisable = (t.RoleId == mFilter.criteriaRole.HIDE) && isRedirect() && ((criteriaType == 30 && t.TypeId == 30) || (criteriaType == 15 && t.TypeId == 15) || (criteriaType == 13 && t.TypeId == 13));
                        return {
                            Id: t.TypeId,
                            Name: getCriteriaName(t.TypeId),
                            IsDisable: isDisable
                    };
                });
        //var lst = visibleCriterias.filter(t => typeIds.indexOf(t) >= 0).map(t => {
        //    return {
        //        Id: t,
        //        Name: getCriteriaName(t)
        //    };
        //});
        lst.unshift({ Id: 23, Name: kLg.lblLands + '/' + kLg.lblRegions });
        return lst;
    };

    var getDefaultFilter = function () {
        return [{ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: -2, ChildValue: -2, ChildValue1: -2 }];
    };

    var getResetDataFilter = function () {
        return [{ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: defaultRegion ? defaultRegion.LandId : -2, ChildValue: defaultRegion ? defaultRegion.Id : -2, ChildValue1: -2 }];
    };

    var resetToDefaultValue = function (item) {
        switch (item.TypeValue) {
            case mFilter.enumFilter.landregion:
                item.ParentValue = defaultRegion ? defaultRegion.LandId : -2;
                item.ChildValue = defaultRegion ? defaultRegion.Id : -2;
                item.ChildValue = 0;
                break;
            default:
                item.ParentValue = 0;
                item.ChildValue = 0;
                item.ChildValue1 = 0;
                break;
        }
    };

    var buildingSources = function (data) {
        sources.SubMarketTitles = data.SubMarketTitles;
        sources.SubmarketTitle = data.SubmarketTitle || kLg.titleStackholderGroups;
        RegionAccountRoles = data.RegionAccountRoles;

        sources.landregion = data.LandRegionInfo.LandTypes;

        sources.productGroup = data.Filter.ProductGroups;
        sources.product = data.Filter.Products;
        sources.market = data.Filter.Markets;
        sources.submarket = data.Filter.SubMarkets;
        sources.person = data.Filter.Persons;
        sources.goalCategory = data.Filter.GoalCategories;
        sources.actionCategory = data.Filter.ActionCategories;
        sources.customerJourneyGroup = data.Filter.CustomerJourneyGroups;

        sources.typeStatus = [{ Id: 1, Name: kLg.titleAllStatus }, { Id: 2, Name: kLg.titleLastStatus }];

        sources.protocolStatus = data.Filter.ProtocolStatus;
        sources.goalActionFields = data.Filter.GoalActionFields;
        sources.independencies = data.Filter.Independencies;
        sources.instruments = data.Filter.Instruments;
        sources.subProducts = data.Filter.SubProducts;
        sources.subClients = data.Filter.SubClients;
        sources.masterMainGoals = data.Filter.MasterMainGoals;
        sources.advertisingMaterials = data.Filter.AdvertisingMaterials;
        sources.advertisers = data.Filter.Advertisers;
        sources.subjetThemas = data.Filter.SubjetThemas;
        sources.suppliers = data.Filter.Suppliers;
        sources.mastergoals = data.Filter.MasterGoals;
        sources.mastergoalsKpi = data.Filter.MasterGoalsKpi;
        sources.fibuItems = data.Filter.FibusItems;
        sources.WRData = data.WRData;

        sources.hasSettingFibu = data.Filter.IsFibuFilterDisplay;
        sources.hasSettingMasterGoal = data.Filter.HasMasterGoal;
        sources.hasSettingMasterGoalKpi = data.Filter.MasterGoalsKpi.length > 0;

        sources.marketscope = data.Filter.MarketScope;

        sources.marketsegment = data.TitleMarketsegment;
        sources.subtitle = data.StakeholderTitle;
        sources.visibility = [
            { Id: mFilter.enumFilterVisibility.ShowAll, Name: kLg.filterShow },
            { Id: mFilter.enumFilterVisibility.Hide, Name: kLg.filterHide }
        ];

        sources.date = [{ Id: mFilter.enumDate.Overdue, Name: kLg.filterOverdue },
        { Id: mFilter.enumDate.DueToday, Name: kLg.filterDueToday },
        { Id: mFilter.enumDate.NextTenDays, Name: kLg.filterNext10Days },
        { Id: mFilter.enumDate.OverTenDays, Name: kLg.filterOver10Days },
        { Id: mFilter.enumDate.StillOpen, Name: kLg.filterStillOpen },
        { Id: mFilter.enumDate.AlreadyFnished, Name: kLg.filterAlreadyFinished }];

        sources.type = [{ Id: mFilter.enumFilterType.OnlyGoal, Name: kLg.filterOnlyGoal },
        { Id: mFilter.enumFilterType.OnlyAction, Name: kLg.filterOnlyAction },
        { Id: mFilter.enumFilterType.Both, Name: kLg.filterBoth }];
    };

    var getSource = function (criteriaType) {
        var src;

        switch (criteriaType) {
            case mFilter.enumFilter.goalCategory:
                src = sources.goalCategory;
                break;

            case mFilter.enumFilter.field:
                src = sources.goalActionFields;
                break;

            case mFilter.enumFilter.person:
                src = sources.person;
                break;

            //case mFilter.enumFilter.lastStatus:
            case mFilter.enumFilter.protocolStatus:
                src = sources.protocolStatus;
                break;

            case mFilter.enumFilter.type:
                src = sources.type;
                break;

            case mFilter.enumFilter.visibility:
                src = sources.visibility;
                break;
        }

        return src;
    };

    var getSelectedLands = function (items, position) {
        var lands = [];
        if (position && isNaN(Number(position))) return lands;

        for (var i = 0; i < items.length; i++) {
            if (i > position) break;

            var item = items[i];
            if (item.TypeValue != mFilter.enumFilter.landregion) continue;

            if (item.ParentValue == -2) {
                lands = sources.landregion.map(t => t.Id);
                break;
            }

            lands.push(item.ParentValue);
        }

        return lands.unique();
    };

    var getSelectedRegions = function (items, position) {
        var regions = [];
        if (position && isNaN(Number(position))) return regions;

        for (var i = 0; i < items.length; i++) {
            if (i > position) break;

            var item = items[i];
            if (item.TypeValue != mFilter.enumFilter.landregion) continue;

            if (item.ParentValue == -2) {
                regions = sources.landregion.map(function (it) { return it.Regions; }).flatten().map(function (it) { return it.Id; });
                break;
            }

            var land = vmCommon.findByFunc(sources.landregion, function (it) { return it.Id == item.ParentValue; });
            if (land == null) continue;

            if (item.ChildValue == -2) {
                regions = regions.concat(land.Regions.map(function (it) { return it.Id; }));
            } else {
                region = vmCommon.findByFunc(land.Regions, function (it) { return it.Id == item.ChildValue; });
                if (region != null) regions.push(region.Id);
            }
        }

        return regions.unique();
    };

    var getSelectedLands = function (items, position) {
        var lands = [];
        if (position && isNaN(Number(position))) return lands;

        for (var i = 0; i < items.length; i++) {
            if (i > position) break;

            var item = items[i];
            if (item.TypeValue != mFilter.enumFilter.landregion) continue;

            if (item.ParentValue == -2) {
                lands = sources.landregion.map(t => t.Id);
                break;
            }

            var land = sources.landregion.find(t => t.Id == item.ParentValue);
            if (land == null) continue;

            lands.push(land.Id);
        }

        return lands.unique();
    };

    var hasType = function (items, type) {
        return items.some(it => it.TypeValue == type);
    };

    var bindData = function () {
        var local = {}, itemFilter, itemPosition, tempItems = [];

        var bindState = function () {
            if (isNaN(Number(itemFilter.TypeValue))) return;
            var type = Number(itemFilter.TypeValue);

            var itemHasChild = [23, 30, 3, 5, 15, 22, 29, 21, 12, 18, 32], itemHasChild1 = [5, 22, 32];
            if (targetFilter != vmCommon.FilterType.DashBoard) itemHasChild1.push(3);

            itemFilter.HasParent = type > 0;
            itemFilter.HasChild = itemHasChild.indexOf(type) >= 0;
            itemFilter.HasChild1 = itemHasChild1.indexOf(type) >= 0;

            if (itemFilter.TypeValue == mFilter.enumFilter.landregion && itemPosition == 0) {
                itemFilter.OperatorSelectable = false;
                itemFilter.removeVisible = false;
                itemFilter.Operator = mFilter.enumOperator.AND;
            } else {
                itemFilter.OperatorSelectable = true;
                itemFilter.removeVisible = true;
            }
        };

        var bindType = function (criteriaType) {
            var tempSrc = getTypeSource(targetFilter, criteriaType);
            var hasMasterGoal = hasType(tempItems, mFilter.enumFilter.masterGoalKpi);
            var hasMasterBudget = hasType(tempItems, mFilter.enumFilter.masterGoal);
            var hasFibu = hasType(tempItems, mFilter.enumFilter.fibuKostenstellen);

            if (hasMasterGoal)
                tempSrc = tempSrc.filter(t => t.Id != 21 && t.Id != 22);
            else if (hasMasterBudget)
                tempSrc = tempSrc.filter(t => t.Id != 29 && t.Id != 22);
            else if (hasFibu)
                tempSrc = tempSrc.filter(t => t.Id != 29 && t.Id != 21);

            if (itemFilter.Operator == mFilter.enumOperator.OR)
                tempSrc = tempSrc.filter(t => t.Id != mFilter.enumFilter.visibility);

            tempSrc.unshift({ Id: 0, Name: kLg.filterLabelSelect });
            itemFilter.TypeSrc = tempSrc;
        };

        var bindForLandRegion = function () {
            var landSrc = [], regionSrc = [];

            landSrc = vmCommon.deepCopy(sources.landregion);

            //valid data
            var land = landSrc.find(t => t.Id == itemFilter.ParentValue);
            if (land == undefined) { itemFilter.ParentValue = -2; itemFilter.ChildValue = -2; }

            if (land)
                regionSrc = vmCommon.deepCopy(land.Regions);

            //valid data
            var region = regionSrc.find(t => t.Id == itemFilter.ChildValue);
            if (region == undefined) { itemFilter.ChildValue = -2; }

            landSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
            regionSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });

            itemFilter.ParentSrc = landSrc;
            itemFilter.ChildSrc = regionSrc;

        };

        var bindForMarketScope = function () {
            var mkSrc = [], subSrc = [];
            var selectedRegions = getSelectedRegions(tempItems, itemPosition);
            var selectedLands = getSelectedLands(tempItems, itemPosition)

            var tempMkSrc = vmCommon.deepCopy(sources.marketscope.filter(it => selectedLands.indexOf(it.LandId) >= 0));
            var tempSubSrc = vmCommon.deepCopy(tempMkSrc.filter(it => itemFilter.ParentValue == -2 || it.Id == itemFilter.ParentValue).map(it => it.ItemFilters).flatten()).filter(t => selectedRegions.indexOf(t.RegionId) >= 0);

            var xMkSrc = [];
            for (var i = 0; i < tempMkSrc.length; i++) {
                var xmk = tempMkSrc[i];
                if (!xMkSrc.some(t => t.Id == xmk.Id && t.LandId == xmk.LandId)) xMkSrc.push(xmk);
            }

            mkSrc = xMkSrc.map(t => {
                var isExist = xMkSrc.some(x => t.Name == x.Name && t.LandId != x.LandId);
                var landItem = sources.landregion.find(x => x.Id == t.LandId);

                return { Id: t.Id, Name: t.Name + (isExist && landItem != null ? " (" + landItem.Name + ")" : "") };
            });

            //valid data
            var mk = mkSrc.find(t => t.Id == itemFilter.ParentValue);
            if (mk == undefined && itemFilter.ParentValue > 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; }

            subSrc = Array.from(new Set(tempSubSrc.map(it => it.Id).unique())).map(id => { return { Id: id, Name: tempSubSrc.find(s => s.Id == id).Name } });

            //valid data
            var sub = subSrc.find(t => t.Id == itemFilter.ChildValue);
            if (sub == undefined && itemFilter.ChildValue > 0) itemFilter.ChildValue = 0;

            if (mkSrc.length)
                mkSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
            else {
                itemFilter.ParentValue = 0; itemFilter.ChildValue = 0;
            }

            //group submarket by name
            subSrc = subSrc.sort((a, b) => {
                const avalue = a.Name.toUpperCase();
                const bvalue = b.Name.toUpperCase();

                return avalue == bvalue ? 0 : avalue > bvalue ? 1 : -1;
            });

            subSrc = Array.from(new Set(subSrc.map(it => it.Name))).map(name => { return { Id: subSrc.find(s => s.Name == name).Id, Name: name } });

            mkSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.lblMarktsegemente) });

            if (subSrc.length)
                subSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
            else
                itemFilter.ChildValue = 0;

            subSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.lblSubmarket) });

            itemFilter.ParentSrc = mkSrc;
            itemFilter.ChildSrc = subSrc;
        };

        var bindForProductGroup = function () {
            var groupSrc = [], productSrc = [], subproductSrc = [];
            groupSrc = vmCommon.deepCopy(sources.productGroup);

            //valid data
            var group = groupSrc.find(t => t.Id == itemFilter.ParentValue);
            if (group == undefined && itemFilter.ParentValue > 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            productSrc = vmCommon.deepCopy(groupSrc.filter(t => (itemFilter.ParentValue == -2 || itemFilter.ParentValue == -3) || t.Id == itemFilter.ParentValue).map(t => t.ItemFilters).flatten());

            //valid data
            var product = productSrc.find(t => t.Id == itemFilter.ChildValue);
            if (product == undefined && itemFilter.ChildValue > 0) { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            var selectedProductIds = productSrc.filter(t => (itemFilter.ChildValue == -2 || itemFilter.ChildValue == -3) || (product && t.Name == product.Name)).map(t => t.Id);

            subproductSrc = vmCommon.deepCopy(sources.subProducts.filter(t => selectedProductIds.indexOf(t.ParentId) >= 0));

            //valid data
            var subproduct = subproductSrc.find(t => t.Id == itemFilter.ChildValue1);
            if (subproduct == undefined && itemFilter.ChildValue1 > 0) { itemFilter.ChildValue1 = 0; }

            if (groupSrc.length) {
                groupSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) groupSrc.unshift({ Id: -3, Name: '+ ' + kLg.filterLblProductGroup });
            }
            else { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            groupSrc.unshift({ Id: 0, Name: kLg.filterLblProductGroup });

            //group product by name
            productSrc = productSrc.sort((a, b) => {
                const avalue = a.Name.toUpperCase();
                const bvalue = b.Name.toUpperCase();

                return avalue == bvalue ? 0 : avalue > bvalue ? 1 : -1;
            });
            productSrc = Array.from(new Set(productSrc.map(it => it.Name))).map(name => { return { Id: productSrc.find(s => s.Name == name).Id, Name: name } });

            //group subproduct by name
            subproductSrc = subproductSrc.sort((a, b) => {
                const avalue = a.Name.toUpperCase();
                const bvalue = b.Name.toUpperCase();

                return avalue == bvalue ? 0 : avalue > bvalue ? 1 : -1;
            });
            subproductSrc = Array.from(new Set(subproductSrc.map(it => it.Name))).map(name => { return { Id: subproductSrc.find(s => s.Name == name).Id, Name: name } });

            if (productSrc.length) {
                productSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) productSrc.unshift({ Id: -3, Name: '+ ' + kLg.createNewProduct });
            }
            else { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            productSrc.unshift({ Id: 0, Name: kLg.filterLblProduct });

            if (subproductSrc.length) {
                subproductSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) subproductSrc.unshift({ Id: -3, Name: '+ ' + kLg.filterLblSubProduct });
            }
            else { itemFilter.ChildValue1 = 0; }
            subproductSrc.unshift({ Id: 0, Name: kLg.filterLblSubProduct });

            itemFilter.ParentSrc = groupSrc;
            itemFilter.ChildSrc = productSrc;
            itemFilter.Child1Src = subproductSrc;
        };

        var bindForMarket = function () {
            var mkSrc = [], subSrc = [], subClientSrc = [];

            var mkSrc = vmCommon.deepCopy(sources.market);

            //valid data
            var mk = mkSrc.find(t => t.Id == itemFilter.ParentValue);
            if (mk == undefined && itemFilter.ParentValue > 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            subSrc = vmCommon.deepCopy(mkSrc.filter(t => (itemFilter.ParentValue == -2 || itemFilter.ParentValue == -3) || t.Id == itemFilter.ParentValue).map(t => t.ItemFilters).flatten());

            //valid data
            var sub = subSrc.find(t => t.Id == itemFilter.ChildValue);
            if (sub == undefined && itemFilter.ChildValue > 0) { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            var selectedSubIds = subSrc.filter(t => (itemFilter.ChildValue == -2 || itemFilter.ChildValue == -3) || (sub && t.Name == sub.Name)).map(t => t.Id);

            subClientSrc = vmCommon.deepCopy(sources.subClients.filter(t => selectedSubIds.indexOf(t.ParentId) >= 0));

            //valid data
            var subclient = subClientSrc.find(t => t.Id == itemFilter.ChildValue1);
            if (subclient == undefined && itemFilter.ChildValue1 > 0) { itemFilter.ChildValue1 = 0; }

            //group submarket by name
            subSrc = subSrc.sort((a, b) => {
                const avalue = a.Name.toUpperCase();
                const bvalue = b.Name.toUpperCase();

                return avalue == bvalue ? 0 : avalue > bvalue ? 1 : -1;
            });
            subSrc = Array.from(new Set(subSrc.map(it => it.Name))).map(name => { return { Id: subSrc.find(s => s.Name == name).Id, Name: name } });

            //group subclient by name
            subClientSrc = subClientSrc.sort((a, b) => {
                const avalue = a.Name.toUpperCase();
                const bvalue = b.Name.toUpperCase();

                return avalue == bvalue ? 0 : avalue > bvalue ? 1 : -1;
            });
            subClientSrc = Array.from(new Set(subClientSrc.map(it => it.Name))).map(name => { return { Id: subClientSrc.find(s => s.Name == name).Id, Name: name } });

            if (mkSrc.length) {
                mkSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) mkSrc.unshift({ Id: -3, Name: '+ ' + kLg.titleStackholderGroups });
            }
            else { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            mkSrc.unshift({ Id: 0, Name: kLg.titleStackholderGroups });

            if (subSrc.length) {
                subSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) subSrc.unshift({ Id: -3, Name: '+ ' + kLg.contactPerson });
            }
            else { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            subSrc.unshift({ Id: 0, Name: kLg.contactPerson });

            if (subClientSrc.length) {
                subClientSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) subClientSrc.unshift({ Id: -3, Name: '+ ' + kLg.contactSubPerson });
            }
            else { itemFilter.ChildValue1 = 0; }
            subClientSrc.unshift({ Id: 0, Name: kLg.contactSubPerson });

            itemFilter.ParentSrc = mkSrc;
            itemFilter.ChildSrc = subSrc;
            itemFilter.Child1Src = subClientSrc;
        };

        var bindForCustomerJourney = function () {
            var parentSrc = [], childSrc = [], child1Src = [];

            var parentSrc = vmCommon.deepCopy(sources.customerJourneyGroup);
            //valid data
            var parent = parentSrc.find(t => t.Id == itemFilter.ParentValue);
            if (parent == undefined && itemFilter.ParentValue > 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            childSrc = vmCommon.deepCopy(parentSrc.filter(t => (itemFilter.ParentValue == -2 || itemFilter.ParentValue == -3) || t.Id == itemFilter.ParentValue).map(t => t.ItemFilters).flatten());
            //valid data
            var child = childSrc.find(t => t.Id == itemFilter.ChildValue);
            if (child == undefined && itemFilter.ChildValue > 0) { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }

            var selectedChildIds = childSrc.filter(t => (itemFilter.ChildValue == -2 || itemFilter.ChildValue == -3 || t.Id == itemFilter.ChildValue)).map(t => t.Id);

            child1Src = vmCommon.deepCopy(childSrc.filter(t => selectedChildIds.indexOf(t.Id) >= 0).map(t => t.ItemFilters).flatten());

            //valid data
            var child1 = child1Src.find(t => t.Id == itemFilter.ChildValue1);
            if (child1 == undefined && itemFilter.ChildValue1 > 0) { itemFilter.ChildValue1 = 0; }

            //
            if (parentSrc.length) {
                parentSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) parentSrc.unshift({ Id: -3, Name: "+ " + kLg.vtextCustomerJourney });
            }
            else { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            parentSrc.unshift({ Id: 0, Name: kLg.vtextCustomerJourney });

            if (childSrc.length) {
                childSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) childSrc.unshift({ Id: -3, Name: "+ " + kLg.titleJourney });
            }
            else { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0; }
            childSrc.unshift({ Id: 0, Name: kLg.titleJourney });

            if (child1Src.length) {
                child1Src.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
                if (targetFilter != vmCommon.FilterType.DashBoard) child1Src.unshift({ Id: -3, Name: "+ " + kLg.titleSubJourney });
            }
            else { itemFilter.ChildValue1 = 0; }
            child1Src.unshift({ Id: 0, Name: kLg.titleSubJourney });

            itemFilter.ParentSrc = parentSrc;
            itemFilter.ChildSrc = childSrc;
            itemFilter.Child1Src = child1Src;
        };

        var bindForIndependency = function () {
            var parentSrc = [], childSrc = [];

            var selectedRegions = getSelectedRegions(tempItems, itemPosition);

            var tempParentSrc = vmCommon.deepCopy(sources.independencies.filter(it => selectedRegions.indexOf(it.RegionId) >= 0));
            var tempChildSrc = vmCommon.deepCopy(tempParentSrc.filter(it => itemFilter.ParentValue == -2 || it.Id == itemFilter.ParentValue).map(it => it.ItemFilters.filter(t => selectedRegions.indexOf(t.RegionId) >= 0)).flatten());

            parentSrc = Array.from(new Set(tempParentSrc.map(it => it.Id))).map(id => { return { Id: id, Name: tempParentSrc.find(s => s.Id == id).Name } });

            //valid data
            var parent = parentSrc.find(t => t.Id == itemFilter.ParentValue);
            if (parent == undefined && itemFilter.ParentValue > 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; }

            childSrc = Array.from(new Set(tempChildSrc.map(it => it.Id))).map(id => { return { Id: id, Name: tempChildSrc.find(s => s.Id == id).Name } });

            //valid data
            var child = childSrc.find(t => t.Id == itemFilter.ChildValue);
            if (child == undefined && itemFilter.ChildValue > 0) itemFilter.ChildValue = 0;


            if (parentSrc.length) { }
            else { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; }

            parentSrc.unshift({ Id: 0, Name: kLg.filterLabelIndependencyAction });

            if (childSrc.length) { }
            else { itemFilter.ChildValue = 0; }

            childSrc.unshift({ Id: 0, Name: kLg.filterLabelThema });

            itemFilter.ParentSrc = parentSrc;
            itemFilter.ChildSrc = childSrc;
        };

        var bindForMasterBudget = function () {
            var mainSrc = [], subSrc = [];

            var selectedRegions = getSelectedRegions(tempItems, itemPosition);

            var tempMainSrc = vmCommon.deepCopy(sources.masterMainGoals.filter(it => selectedRegions.indexOf(it.RegionId) >= 0));
            mainSrc = Array.from(new Set(tempMainSrc.map(it => it.Id))).map(id => { return { Id: id, Name: tempMainSrc.find(s => s.Id == id).Name } });

            //valid data
            var main = mainSrc.find(t => t.Id == itemFilter.ParentValue);
            if (main == undefined) itemFilter.ParentValue = 0;

            var tempSubSrc = vmCommon.deepCopy(sources.mastergoals.filter(it => itemFilter.ParentValue == 0 || it.ParentId == itemFilter.ParentValue));
            subSrc = Array.from(new Set(tempSubSrc.map(it => it.Id))).map(id => { return { Id: id, Name: tempSubSrc.find(s => s.Id == id).ShortName } });

            //valid data
            var sub = subSrc.find(t => t.Id == itemFilter.ChildValue);
            if (sub == undefined) itemFilter.ChildValue = 0;

            if (mainSrc.length) { }
            else { itemFilter.ParentValue = 0; }

            mainSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.titleMasterMainGoal) });

            if (subSrc.length) { }
            else { itemFilter.ChildValue = 0; }

            subSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.titleMasterGoal) });

            itemFilter.ParentSrc = mainSrc;
            itemFilter.ChildSrc = subSrc;
        };

        var bindForMasterKpi = function () {
            var mainSrc = [], subSrc = [];

            var selectedRegions = getSelectedRegions(tempItems, itemPosition);

            var tempMainSrc = vmCommon.deepCopy(sources.mastergoalsKpi.filter(t => selectedRegions.indexOf(t.RegionId) >= 0));
            var tempSubSrc = vmCommon.deepCopy(tempMainSrc.map(t => t.ItemFilters).flatten());

            mainSrc = Array.from(new Set(tempMainSrc.map(t => t.Id))).map(id => { return { Id: id, Name: tempMainSrc.find(s => s.Id == id).Name } });

            //valid data
            var main = mainSrc.find(t => t.Id == itemFilter.ParentValue);
            if (main == undefined) itemFilter.ParentValue = 0;

            tempSubSrc = tempSubSrc.filter(t => itemFilter.ParentValue == 0 || t.ParentId == itemFilter.ParentValue);
            subSrc = Array.from(new Set(tempSubSrc.map(t => t.Id))).map(id => { return { Id: id, Name: tempSubSrc.find(s => s.Id == id).Name } });

            //valid data
            var sub = subSrc.find(t => t.Id == itemFilter.ChildValue);
            if (sub == undefined) itemFilter.ChildValue = 0;

            if (mainSrc.length) { }
            else { itemFilter.ParentValue = 0; }

            mainSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.titleMasterMainGoal) });

            if (subSrc.length) { }
            else { itemFilter.ChildValue = 0; }

            subSrc.unshift({ Id: 0, Name: vmCommon.joinString(kLg.btnChoose, kLg.titleMasterGoal) });

            itemFilter.ParentSrc = mainSrc;
            itemFilter.ChildSrc = subSrc;
        };

        var bindForFibu = function () {
            var lrSrc = [], accountSrc = [], costSrc = [];

            var selectedLands = getSelectedLands(tempItems, itemPosition);
            var tempLrSrc = sources.fibuItems.filter(t => selectedLands.indexOf(t.LandId) >= 0);
            lrSrc = Array.from(new Set(tempLrSrc.map(t => t.Id))).map(id => { return { Id: id, Name: tempLrSrc.find(s => s.Id == id).Name } });

            //valid data
            var lr = lrSrc.find(t => t.Id == itemFilter.ParentValue);
            if (lr == undefined) { itemFilter.ParentValue = 0; itemFilter.ChildValue = -2; itemFilter.ChildValue1 = -2; }

            var tempAccountSrc = tempLrSrc.filter(t => t.Id == itemFilter.ParentValue).map(t => t.FibuKontens).flatten();
            accountSrc = Array.from(new Set(tempAccountSrc.map(t => t.Id))).map(id => { return { Id: id, Name: tempAccountSrc.find(s => s.Id == id).Name } });

            //valid data
            var account = accountSrc.find(t => t.Id == itemFilter.ChildValue);
            if (account == undefined) { itemFilter.ChildValue = -2; itemFilter.ChildValue1 = -2; }

            var tempCostSrc = tempAccountSrc.filter(t => t.Id == itemFilter.ChildValue).map(t => t.FibuKostenstellens).flatten();
            costSrc = Array.from(new Set(tempCostSrc.map(t => t.Id))).map(id => { return { Id: id, Name: tempCostSrc.find(s => s.Id == id).Name } });

            //valid data
            var cost = costSrc.find(t => t.Id == itemFilter.ChildValue1);
            if (cost == undefined) { itemFilter.ChildValue1 = -2; }

            lrSrc.unshift({ Id: 0, Name: kLg.selectLandRegion });
            accountSrc.unshift({ Id: -2, Name: kLg.filterLabelFibuAllSelect });
            costSrc.unshift({ Id: -2, Name: kLg.filterLabelFibuAllSelect });

            itemFilter.ParentSrc = lrSrc;
            itemFilter.ChildSrc = accountSrc;
            itemFilter.Child1Src = costSrc;
        };

        var bindForStatus = function () {
            var typeSrc = [], src = [];
            typeSrc = vmCommon.deepCopy(sources.typeStatus);
            src = vmCommon.deepCopy(sources.protocolStatus);

            //valid data
            var typeObject = typeSrc.find(t => t.Id == itemFilter.ParentValue);
            if (typeObject == undefined) {
                itemFilter.ParentValue = typeSrc[0].Id;
                itemFilter.ChildValue = 0;
            }

            //valid data
            var statusObject = src.find(t => t.Id == itemFilter.ChildValue);
            if (statusObject == undefined) { itemFilter.ChildValue = 0; }

            src.unshift({ Id: 0, Name: kLg.filterLabelSelect });

            itemFilter.ParentSrc = typeSrc;
            itemFilter.ChildSrc = src;
        };

        var bindForAdvertising = function () {
            var parentSrc = [], childSrc = [];
            parentSrc = vmCommon.deepCopy(sources.advertisingMaterials);
            childSrc = vmCommon.deepCopy(sources.advertisers.filter(t => itemFilter.ParentValue == -2 || t.ParentId == itemFilter.ParentValue));
            //valid data
            var parent = parentSrc.find(t => t.Id == itemFilter.ParentValue);
            if (parent == undefined && itemFilter.ParentValue >= 0) { itemFilter.ParentValue = 0; itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0 }

            var child = childSrc.find(t => t.Id == itemFilter.ChildValue);
            if (child == undefined && itemFilter.ChildValue > 0) { itemFilter.ChildValue = 0; itemFilter.ChildValue1 = 0 }
           
            if (parentSrc.length > 0) {
                parentSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
            }
            parentSrc.unshift({ Id: 0, Name: kLg.lblNameAdvertisingMaterials });

            if (childSrc.length > 0) {
                childSrc.unshift({ Id: -2, Name: kLg.titleSelectAllFilter });
            }
           
            childSrc.unshift({ Id: 0, Name: kLg.lblNameAdvertiser });
           
            itemFilter.ParentSrc = parentSrc;
            itemFilter.ChildSrc = childSrc;
        };

        var bindForOther = function () {
            var src = [], defaultItem = { Id: null, Name: "" };

            switch (itemFilter.TypeValue) {
                case mFilter.enumFilter.person:
                    src = vmCommon.deepCopy(sources.person);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.field:
                    src = vmCommon.deepCopy(sources.goalActionFields);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.protocolStatus:
                    src = vmCommon.deepCopy(sources.protocolStatus);
                    defaultItem = { Id: 0, Name: kLg.gaLblStatus };

                    break;
                case mFilter.enumFilter.date:
                    src = vmCommon.deepCopy(sources.date);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.instrument:
                    src = vmCommon.deepCopy(sources.instruments);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.goalCategory:
                    src = vmCommon.deepCopy(sources.goalCategory);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.actionCategory:
                    src = vmCommon.deepCopy(sources.actionCategory);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.visibility:
                    src = vmCommon.deepCopy(sources.visibility);
                    defaultItem = { Id: 0, Name: kLg.filterLabelSelect };

                    break;
                case mFilter.enumFilter.subjetThema:
                    src = vmCommon.deepCopy(sources.subjetThemas);
                    defaultItem = { Id: 0, Name: ( kLg.filterLabelSelect) };

                    break;

                case mFilter.enumFilter.supplier:
                    src = vmCommon.deepCopy(sources.suppliers);
                    defaultItem = { Id: 0, Name: (kLg.filterLabelSelect) };

                    break;
            }

            //add show all
            var showAllTypies = [mFilter.enumFilter.subjetThema, mFilter.enumFilter.advertisingMaterial, mFilter.enumFilter.advertiser, mFilter.enumFilter.supplier]; //mFilter.enumFilter.lastStatus
            if (showAllTypies.indexOf(itemFilter.TypeValue) >= 0) {
                src.unshift({ Id: -2, Name: kLg.filterShow });
            }

            src.unshift(defaultItem);

            //valid data
            var x = src.find(t => t.Id == itemFilter.ParentValue);
            if (x == undefined) { itemFilter.ParentValue = 0 };

            itemFilter.ParentSrc = src;
        };

        var getBlockIndex = function (xitems, xposition) {
            var lastRegionIndex = 0;
            var regionIndexes = [0];
            for (var i = 1; i < xitems.length; i++) {
                var item = xitems[i];
                if (item.TypeValue == mFilter.enumFilter.landregion && i > (lastRegionIndex + 1)) {
                    lastRegionIndex = i;
                    regionIndexes.push(i);
                }
            }

            var blockIndex = 1;
            for (var i = 0; i < regionIndexes.length; i++) {
                var a = regionIndexes[i];
                var b = i < regionIndexes.length - 1 ? regionIndexes[i + 1] : null;

                if (xposition >= a && (b == null || xposition < b)) break;

                blockIndex++;
            }

            return blockIndex;
        };

        var checkOperator = function (xitems, xposition) {
            if (targetFilter != vmCommon.FilterType.Mix && targetFilter != vmCommon.FilterType.RoadMap) return 0;

            if (xposition <= 0) return 0;
            if (xposition > xitems.length - 1) return 0;
            var item = xitems[xposition];

            //for mastergoal, masterbudget, fibu
            //0: normal, 1: and, 2: or
            var typies = [mFilter.enumFilter.masterGoalKpi, mFilter.enumFilter.masterGoal, mFilter.enumFilter.fibuKostenstellen];
            if (typies.indexOf(item.TypeValue) == -1) return 0;

            var firstTypeItem = xitems.find(t => t.TypeValue == item.TypeValue);
            if (firstTypeItem == null) return 0;
            var firstTypeIndex = xitems.indexOf(firstTypeItem);

            if (firstTypeIndex == xposition) return 1;

            var rs = 2;
            for (var i = firstTypeIndex + 1; i < xposition; i++) {
                var tempItem = xitems[i];
                if (tempItem.TypeValue != item.TypeValue) {
                    rs = 0;
                    break;
                }
            }
            return rs;
        };

        var bindOperator = function () {
            //fix for old filter
            if (itemFilter.Operator == undefined) itemFilter.Operator = mFilter.enumOperator.AND;

            var x = checkOperator(tempItems, itemPosition);
            if (x == 1) { // AND
                itemFilter.OperatorSrc = [{ Id: mFilter.enumOperator.AND, Name: kLg.labelAnd }];
                itemFilter.Operator = mFilter.enumOperator.AND;
            } else if (x == 2) { //OR
                itemFilter.OperatorSrc = [{ Id: mFilter.enumOperator.OR, Name: kLg.labelOr }];
                itemFilter.Operator = mFilter.enumOperator.OR;
            } else { // NORMAL
                itemFilter.OperatorSrc = [{ Id: mFilter.enumOperator.AND, Name: itemPosition == 0 ? kLg.filterBy : kLg.labelAnd }, { Id: mFilter.enumOperator.OR, Name: kLg.labelOr }];
            }
        };

        var bind = function (items, item, position) {
            tempItems = items;
            itemFilter = item;
            itemPosition = position;

            bindOperator();
            bindType(itemFilter.TypeValue);
            switch (itemFilter.TypeValue) {
                case mFilter.enumFilter.landregion:
                    bindForLandRegion();
                    break;
                case mFilter.enumFilter.marketScope:
                    bindForMarketScope();
                    break;
                case mFilter.enumFilter.productGroup:
                    bindForProductGroup();
                    break;
                case mFilter.enumFilter.market:
                    bindForMarket();
                    break;
                case mFilter.enumFilter.independency:
                    bindForIndependency();
                    break;
                case mFilter.enumFilter.masterGoal:
                    bindForMasterBudget();
                    break;
                case mFilter.enumFilter.masterGoalKpi:
                    bindForMasterKpi();
                    break;
                case mFilter.enumFilter.fibuKostenstellen:
                    bindForFibu();
                    break;
                case mFilter.enumFilter.protocolStatus:
                    bindForStatus();
                    break;
                case mFilter.enumFilter.advertisingMaterial:
                    bindForAdvertising();
                    break;

                case mFilter.enumFilter.person:
                case mFilter.enumFilter.field:
                case mFilter.enumFilter.date:
                case mFilter.enumFilter.instrument:
                //case mFilter.enumFilter.advertisingMaterial:
                //case mFilter.enumFilter.advertiser:
                case mFilter.enumFilter.goalCategory:
                case mFilter.enumFilter.actionCategory:
                case mFilter.enumFilter.type:
                case mFilter.enumFilter.visibility:
                case mFilter.enumFilter.subjetThema:
                case mFilter.enumFilter.supplier:
                    //case mFilter.enumFilter.lastStatus:
                    bindForOther();
                    break;
                case mFilter.enumFilter.customerJourney:
                    bindForCustomerJourney();
                    break;
            }

            bindState();
        };

        return { bind: bind, checkOperator: checkOperator };
    }();

    var bindingSourceForObjectFilter = function (filtermodel) {
        var items = filtermodel.Items;
        //prepare datafilter
        if (items.length == 0) items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: defaultRegion ? defaultRegion.LandId : -2, ChildValue: defaultRegion ? defaultRegion.Id : -2 });
        else if (items[0].TypeValue != mFilter.enumFilter.landregion) items.unshift({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: defaultRegion ? defaultRegion.LandId : -2, ChildValue: defaultRegion ? defaultRegion.Id : -2 });

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            //bind source for item filter
            bindData.bind(items, item, i);

            if (i == 0) {
                item.OperatorSelectable = false;
                item.TypeSelectable = false;
                item.removeVisible = false;
            }
        }
    };

    var bindingSourceForSearchFilter = function (filtermodel) {
        //var now = new Date();
        var searchFilter = filtermodel.SearchFilter;
        searchFilter.TypeSrc = vmCommon.deepCopy(sources.WRData.DataYears);
        searchFilter.TypeSrc.unshift({ Id: -1, Name: kLg.labelIndividual });
        searchFilter.TypeSrc.unshift({ Id: 0, Name: kLg.labelShowall });
    };

    var hasDirectFrom = function () {
        var objQuery = new queryString(true);
        var fromSm = objQuery.get('fromsm') || false;
        var fromDash = objQuery.get('fromdash') || false;
        var fromCRM = objQuery.get('fromcrm') || false;
        var isGotoMix = objQuery.get('gotomix') || false;
        var fromActionplanConnection = objQuery.get('fromactionplanconnect') || false;
        var fromDashboardInfo = objQuery.get('fromdashinfo') || false;

        return !!fromSm || !!fromDash || !!fromCRM || !!fromActionplanConnection || !!isGotoMix || !!fromDashboardInfo;
    }

    var isRedirect = function () {
        var objQuery = new queryString(true);
        var fromSm = objQuery.get('fromsm') || null;
        var fromDash = objQuery.get('fromdash') || null;

        return fromSm || fromDash;// || vmCommon.AddressBar.ClientQuery.isActpopup();
    };

    var getFilterFromUrl = function () {
        var dFilter = null;
        var items = [];

        var objQuery = new queryString(true);
        var fromSm = objQuery.get('fromsm') || null;
        var fromDash = objQuery.get('fromdash') || null;

        if (fromSm || fromDash || vmCommon.AddressBar.ClientQuery.isActpopup()) {

            var landId = vmCommon.AddressBar.ClientQuery.Decode.get('landid') || (objQuery.get('landid')) || null;                      // landid - level 1
            var regionId = vmCommon.AddressBar.ClientQuery.Decode.get('regid') || (objQuery.get('regid')) || null;
            var areaId = vmCommon.AddressBar.ClientQuery.Decode.get('areaid') || (objQuery.get('areaid')) || null;

            var groupId = parseInt(objQuery.get('grid')) || null;                       // grid
            var productId = parseInt(objQuery.get('proid')) || null;                    // proid
            var marketId = vmCommon.AddressBar.ClientQuery.Decode.get('maid') || (objQuery.get('maid')) || null;                      // maid   - level 2
            var submarketId = vmCommon.AddressBar.ClientQuery.Decode.get('smid') || (objQuery.get('subid')) || null;                  // subid  - level 2
            var islink = parseInt(objQuery.get('islink')) || null;                      // islink
            var maingoalid = objQuery.get('mgid') || null;                              // mgid

            var childId = vmCommon.AddressBar.ClientQuery.Decode.get('independid') || (objQuery.get('childid')) || null;
            var parentId = vmCommon.AddressBar.ClientQuery.Decode.get('parentid') || (objQuery.get('parentid')) || null;
            var goalactionId = objQuery.get('goalactionid') || null;                    // goalactionid
            var landactionType = parseInt(objQuery.get('landactiontype')) || null;      // landactiontype

            if (landId) landId = parseInt(landId);
            if (regionId) regionId = parseInt(regionId);
            if (marketId) marketId = parseInt(marketId);
            if (submarketId) submarketId = parseInt(submarketId);
            if (parentId) parentId = parseInt(parentId);
            if (childId) childId = parseInt(childId);

            items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: landId || -2, ChildValue: landId && regionId ? regionId : -2, ChildValue1: 0 });

            if (marketId && submarketId)
                items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.marketScope, ParentValue: marketId || -2, ChildValue: marketId && submarketId ? submarketId : -2, ChildValue1: 0 });

            if (parentId && childId)
                items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.independency, ParentValue: parentId || -2, ChildValue: childId || -2, ChildValue1: 0 });

            //var newItem = { Operator: mFilter.enumOperator.AND, TypeValue: 0, ParentValue: 0, ChildValue: 0, ChildValue1: 0 };
            if (targetFilter != vmCommon.FilterType.DashBoard)
                items.push({
                    Operator: mFilter.enumOperator.AND,
                    TypeValue: mFilter.enumFilter.visibility,
                    ParentValue: 1,
                    ChildValue: 0, ChildValue1: 0
                });
        }

        if (items.length > 0) {
            dFilter = new DFilterX();
            dFilter.Items = items;
            dFilter.AreaId = areaId;
        }

        return dFilter;
    };

    var bindingSourceForFilterModel = function (fm) {
        bindingSourceForObjectFilter(fm);
        bindingSourceForSearchFilter(fm);
    };

    var convertToFilterModel = function (dFilter) {
        let fm = new FilterModel();

        fm.Id = dFilter.Id;
        fm.Name = dFilter.Name;
        fm.TypeId = dFilter.TypeId;
        fm.IsShow = dFilter.IsShow;
        fm.AreaId = dFilter.AreaId;

        let showDoneUndoneE = dFilter.Items.find(e => { return e.TypeValue == mFilter.enumFilter.ShowFinishedElements; });

        if (showDoneUndoneE != undefined) {
            fm.IsShowDoneUndoneElement = `${showDoneUndoneE.ParentValue}`.toLowerCase() == "true";
        }

        fm.Items = dFilter.Items.filter(t => t.TypeValue != mFilter.enumFilter.textsearch && t.TypeValue != mFilter.enumFilter.workingRange && t.TypeValue != mFilter.enumFilter.ShowFinishedElements && t.TypeValue != mFilter.enumFilter.redirectGoal);
        var searchFilter = fm.SearchFilter;

        //redirect filter
        var redirectItem = dFilter.Items.find(t => t.TypeValue == mFilter.enumFilter.redirectGoal) || { Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.redirectGoal, ParentValue: null };
        searchFilter.RedirectId = redirectItem.ParentValue;

        //text search and timerange
        if (hasSearchFilter.indexOf(fm.TypeId) >= 0) {
            var searchItem = dFilter.Items.find(t => t.TypeValue == mFilter.enumFilter.textsearch) || { Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.textsearch, ParentValue: "" };
            searchFilter.Text = searchItem.ParentValue;

            var timeRangeFilter = dFilter.Items.find(t => t.TypeValue == mFilter.enumFilter.workingRange) || { Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.workingRange, ParentValue: 0, ChildValue: null, ChildValue1: null };
            searchFilter.Type = timeRangeFilter.ParentValue;
            searchFilter.Start = timeRangeFilter.ChildValue;
            searchFilter.End = timeRangeFilter.ChildValue1;
        }

        fm.IsHasRedirect = dFilter.Items.some(t => t.TypeValue == mFilter.enumFilter.redirectGoal);
        bindingSourceForFilterModel(fm);

        return fm;
    };

    var buildingObjectFilter = function (filters) {
        let temps = filters;
        let currentFilter;
        let urlFilter = getFilterFromUrl();

        if (urlFilter) {
            let defaultFilter = temps.find(t => !t.Name);

            temps.forEach(t => t.IsUsing = false);
            defaultFilter.Items = urlFilter.Items;
            defaultFilter.IsUsing = true;
            defaultFilter.AreaId = urlFilter.AreaId;

            currentFilter = defaultFilter;
            msFilter.dataService.saveFilter(defaultFilter);
        } else {
            let usingFilter = temps.find(t => t.IsUsing);
            if (usingFilter == undefined) {
                usingFilter = temps.find(f => f.Name == null);
                !!usingFilter && (usingFilter.IsUsing = true);
            }
            currentFilter = usingFilter;
        }

        return convertToFilterModel(currentFilter);
    };

    var onFilterData = function (queryFilter, callback, isBtnReset) {
        return new Promise((reslv) => {

            var cb = function () {
                switch (queryFilter.TypeId) {
                    case vmCommon.FilterType.ActionPlan:
                        msFilter.dataService.onActionPlanFilter(queryFilter, AjaxConst.PostRequest, function (res) {
                            if (callback && typeof callback == 'function')
                                callback();

                            if (typeof MsaApp == 'object' && (callback !== 'onFilterWithoutClick' || callback !== 'resetFilterExcept')) {
                                MsaApp.componentService(MsaApp.IsShowNavigationMenu).clear();
                                
                                MsaApp.getDataFromBtnFilter(res);
                            }

                            reslv(res);
                        });
                        break;
                    case vmCommon.FilterType.Mix:
                        msFilter.dataService.onMixFilter(queryFilter, AjaxConst.PostRequest, function (res) {
                            vmCalendar.bindGoalActionWithFilter(res);
                            reslv(res);
                        });
                        break;
                    case vmCommon.FilterType.DashBoard:
                        if (vmDashboard) vmDashboard.tab6OnFilter();
                        break;
                    case vmCommon.FilterType.RoadMap:
                        if(!isBtnReset)
                            msRoadmap.dataService.getDataWithFilter(queryFilter).then(function (res) {
                                msRoadmapApp.updateDataFrom(res.value, true);
                                msRoadmapApp.resetExpandPathBlocks();
                                if (typeof callback == 'function') {
                                    callback(vmCommon.FilterType.RoadMap);
                                }
                                reslv(res);
                            });
                        else reslv();
                        break;
                    default:
                        if (vmDashboard) vmDashboard.Tab.bindChartsWithFilter(queryFilter);
                        break;
                }
            };

            if (!queryFilter.Name)
                msFilter.dataService.saveFilter(queryFilter).then(cb);
            else
                cb();
 
        });
    };

    var onFilterDataMix = function (queryFilter) {
        if (!queryFilter.Name)
            msFilter.dataService.saveFilter(queryFilter);

        msFilter.dataService.onMixFilter(queryFilter, AjaxConst.PostRequest, function (res) {
            vmCalendar.bindGoalActionWithFilterOnly(res);
        });
    };

    var setLanguageFilter = function (type) {
        $("#msfilterpanel" + type + " span[btitle='filter']").text(kLg.lblFilter);
        $("#msfilterpanel" + type + " span[btitle='reset']").text(kLg.btnRefresh);
        $("#msfilterpanel" + type + " span[btitle='add']").text(kLg.btnAddFilter);
        $("#msfilterpanel" + type + " span[btitle='save']").text(kLg.saveFilter);
        $("#msfilterpanel" + type + " span[btitle='search']").text(kLg.btnSearchText);
        $("#msfilterpanel" + type + " span[btitle='filters']").text(kLg.lblFilter);
    };

    var setLanguageTime = function (type) {
        var timeId = "timefor" + type;
        $("#" + timeId + " span[titlename='start']").text(kLg.textStart);
        $("#" + timeId + " span[titlename='end']").text(kLg.textEnd);

        $("#" + timeId + " input[data-role=datepicker]").preventPressAlphabetChar(kLg.language === "de" | "pm" ? [46] : [47]);
    };

    var bindingTimeRangeFilter = function (type) {
        if (hasSearchFilter.indexOf(type) < 0) {
            $(".timefor").addClass("hidden");
            return;
        }

        if (models[type] == undefined) return;

        var timeId = "timefor" + type;
        var timeRangeDiv;

        if ($("#" + timeId).length == 0) {
            timeRangeDiv = $("<div id='" + timeId + "' class='timefor' ftype='" + type + "'></div>");

            $(timeRangeDiv).html($("#timerangetemp").html());
            $("#timerange").append(timeRangeDiv);

            kendo.bind($(timeRangeDiv), models[type]);
            $("#timerange input[data-role='datepicker'].fstart").kendoDatePicker({
                weekNumber: true,
                change: function (e) {
                    models[type].onChangeStart(e)
                }
            });
            $("#timerange input[data-role='datepicker'].fend").kendoDatePicker({
                weekNumber: true,
                change: function (e) {
                    models[type].onChangeEnd(e)
                }
            });

            setLanguageTime(type);
        } else {
            timeRangeDiv = $("#" + timeId);
        }

        $(timeRangeDiv).removeClass("hidden");
        $(".timefor").not(timeRangeDiv).addClass("hidden");
    };

    var bindFilter = function (type, filters) {
        var temps = filters;
        var fm = buildingObjectFilter(temps);
        $("#msfilterpanel" + type).html($("#msfiltertemp").html());

        models[type] = kendo.observable({
            isShowNavigationMenu: isShowNavigationMenu,
            IsClickToCheckChange: false,
            hasSearch: hasSearchFilter.indexOf(type) >= 0,
            filters: temps,
            hasFilter: temps.some(t => t.Name),
            filter: fm,
            currentFilter: vmCommon.deepCopy(fm),
            onTrigger: function () {
                vmCommon.removeUrlParams("fromsm,fromdash,firstCreate,grid,proid,maid,subid,childid,parentid,goalactionid,landactiontype,enddate,landid,regid,navid,isxy,islink,mgid,sgid,landtype,actpopup,areaid");

                switch (type) {
                    case vmCommon.FilterType.ActionPlan:
                        vmGoalAction.expandService.clear(vmSetting.ProjectInfo.IsShowMarketLabel);
                        break;
                    default:
                        if (!this.filter.Name)
                            this.filter.SearchFilter.set("RedirectId", null);
                        break;
                }
            },
            onReloadData: function (callback) {
                onFilterData(this.buildingQueryFilter(), callback);
            },
            onReloadDataMix: function () {
                onFilterDataMix(this.buildingQueryFilter());
            },
            onFilterWithoutClick: function () {
                this.applyFilter();
                this.set('IsShowFilterBar', true);
                return onFilterData(this.buildingQueryFilter(), 'onFilterWithoutClick');        // promise
            },
            onFilter: function (callback) {
                this.onTrigger();
                if (!this.filter.Name) this.resetSubFilter();

                this.applyFilter();
                if (!this.isValidTimeRange) {
                    return;
                }

                return onFilterData(this.buildingQueryFilter(), callback);
            },
            onSearch: function () {

                this.onTrigger();

                if (!this.filter.Name) this.resetSubFilter();

                this.applyFilter();
                onFilterData(this.buildingQueryFilter());
                this.NewSouceDropdownlist();
            },
            resetDataFilter: function (isToAll) {
                var filter = this.filter;

                if (isToAll) {
                    var defaultItem = { Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: defaultRegion ? defaultRegion.LandId : - 2, ChildValue: defaultRegion ? defaultRegion.Id : -2, ChildValue1: -2 };
                    var temps = [defaultItem];
                    bindData.bind(temps, defaultItem, 0);

                    filter.set("Items", temps);
                }
                else {
                    var tempItems = [filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.landregion)[0]];
                    filter.set("Items", tempItems);
                }

                filter.SearchFilter.set("RedirectId", null);
                filter.SearchFilter.set("Start", null);
                filter.SearchFilter.set("End", null);
                filter.SearchFilter.set("Text", "");
                filter.SearchFilter.set("Type", -1);

                this.onClickHideTooltip();
                this.set('filter.SearchFilter.Start', undefined);
                this.set('filter.SearchFilter.End', undefined);

                this.resetSubFilter();

                this.switchToDefaultFilter();
            },
            resetSubFilter: function () {
                if (vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar) && vmCalendar.subFilterModel) { // && !this.filter.Name
                    var sm = vmCalendar.subFilterModel;
                    sm.set("cbMainGoal", true);
                    sm.set("cbSubGoal", true);
                    sm.set("cbAction", true);
                    sm.set("cbActivity", true);
                }

                if (vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap) && msRoadmapApp) {
                    msRoadmapApp.subFilter.IsMain = true;
                    msRoadmapApp.subFilter.IsSub = true;
                    msRoadmapApp.subFilter.IsAction = true;
                    msRoadmapApp.subFilter.IsActivity = true;

                    msRoadmapApp.resetLabeling();
                    var cF = models[targetFilter].filters.find(f => !f.Name);
                    if (cF) {
                        cF.SubFilter.IsMainPath = false;
                        cF.SubFilter.IsSubPath = false;
                        cF.SubFilter.IsActionPath = false;
                    }
                }
            },
            onReset: function () {
                this.onTrigger();

                this.resetDataFilter();
                this.applyFilter();
                onFilterData(this.buildingQueryFilter(), null, true).then(() => {
                    msRoadmapApp.getData();
                });
            },
            onResetWithoutClick: function (isToAll) {
                var that = this;
                return new Promise((reslv) => {
                    that.resetDataFilter(isToAll);
                    that.applyFilter();

                    onFilterData(that.buildingQueryFilter()).then(function (res) {
                        reslv(res);
                    });
                });                
            },
            onAddItem: function () {
                this.onTrigger();
                var items = this.filter.Items;
                var newItem = { Operator: mFilter.enumOperator.AND, TypeValue: 0, ParentValue: 0, ChildValue: 0, ChildValue1: 0 };

                bindData.bind(items, newItem, items.length);
                items.push(newItem);

                this.switchToDefaultFilter();
                this.NewSouceDropdownlist();
            },
            onRemoveItem: function (e) {
                this.filter.SearchFilter.set("RedirectId", null);
                var tempItems = this.filter.Items;
                var itemIndex = tempItems.indexOf(e.data);

                var items = this.filter.Items;
                items.splice(itemIndex, 1);

                var deletedItem = vmCommon.deepCopy(e.data);
                //if (uniqueTypies.indexOf(deletedItem.TypeValue) >= 0)
                this.rebindUniqueType();

                if (deletedItem.TypeValue == mFilter.enumFilter.landregion) this.rebindDependOnRegionType(itemIndex);

                this.switchToDefaultFilter();
                this.NewSouceDropdownlist();
            },
            onChangeOperator: function (e) {
                this.filter.SearchFilter.set("RedirectId", null);

                var items = this.filter.Items;
                var index = items.indexOf(e.data);
                var tempItem = vmCommon.deepCopy(e.data);

                if (e.data.TypeValue == mFilter.enumFilter.visibility && e.data.Operator == mFilter.enumOperator.OR) {
                    tempItem.TypeValue = 0;
                    tempItem.ParentValue = 0;
                    tempItem.ChildValue = 0;
                    tempItem.ChildValue1 = 0;
                }

                bindData.bind(items, tempItem, index);
                for (var key in tempItem) e.data.set(key, tempItem[key]);

                this.switchToDefaultFilter();
            },
            itemChange: null,
            onSelectType: function (e) {
                itemChange = vmCommon.deepCopy(e.data);
            },
            onChangeType: function (e) {
                this.filter.SearchFilter.set("RedirectId", null);
                var items = this.filter.Items;

                var item = e.data;
                var itemIndex = items.indexOf(item);

                var tempItem = vmCommon.deepCopy(item);
                resetToDefaultValue(tempItem);
                
                bindData.bind(items, tempItem, itemIndex);
                for (var key in tempItem) {
                    item.set(key, tempItem[key]);
                }
                this.rebindUniqueType();
                if (itemChange && (itemChange.TypeValue == mFilter.enumFilter.landregion || tempItem.TypeValue == mFilter.enumFilter.landregion)) this.rebindDependOnRegionType(itemIndex);
                this.set("itemChange", null);
                this.switchToDefaultFilter();
                this.NewSouceDropdownlist();                
            },
            rebindUniqueType: function () {
                var items = this.filter.Items;

                var hasMasterGoal = hasType(items, mFilter.enumFilter.masterGoalKpi); //sources.hasSettingMasterGoalKpi && 
                var hasMasterBudget = hasType(items, mFilter.enumFilter.masterGoal); //sources.hasSettingMasterGoal && 
                var hasFibu = hasType(items, mFilter.enumFilter.fibuKostenstellen); //sources.hasSettingFibu && 

                items.forEach(item => {
                    var temps = getTypeSource(type);
                    var index = items.indexOf(item);

                    if (hasMasterGoal) {
                        temps = temps.filter(t => t.Id != 21 && t.Id != 22);
                        //temps.push({ Id: 29, Name: kLg.lblMasterGoal });
                    } else if (hasMasterBudget) {
                        //temps.push({ Id: 21, Name: kLg.lblMasterBudget });
                        temps = temps.filter(t => t.Id != 29 && t.Id != 22);
                    } else if (hasFibu) {
                        //temps.push({ Id: 22, Name: kLg.lblKostenstellens });
                        temps = temps.filter(t => t.Id != 29 && t.Id != 21);
                    }

                    if (item.Operator == mFilter.enumOperator.OR)
                        temps = temps.filter(t => t.Id != mFilter.enumFilter.visibility);

                    temps.unshift({ Id: 0, Name: kLg.filterLabelSelect });
                    item.set("TypeSrc", temps);

                    var x = bindData.checkOperator(items, index);
                    if (x == 1) { // AND
                        item.set("OperatorSrc", [{ Id: mFilter.enumOperator.AND, Name: kLg.labelAnd }]);
                        item.set("Operator", mFilter.enumOperator.AND);
                    } else if (x == 2) { //OR
                        item.set("OperatorSrc", [{ Id: mFilter.enumOperator.OR, Name: kLg.labelOr }]);
                        item.set("Operator", mFilter.enumOperator.OR);
                    }
                });
            },
            rebindDependOnRegionType: function (position) {
                if (position < 0) return;
                var items = this.filter.Items;

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];

                    if (i < position) continue;
                    if (dependOnRegionTypies.indexOf(item.TypeValue) < 0) continue;

                    var tempItem = vmCommon.deepCopy(item);
                    bindData.bind(items, tempItem, i);

                    for (var key in tempItem) {
                        item.set(key, tempItem[key]);
                    }
                }
            },

            //hàm bind lại souce dropdownlist
            NewSouceDropdownlist() {
                //laay landid tuf list filter
                var items = this.filter.Items.filter(t => t.TypeValue == 23);
                var landid, regionid;
                var landIds = items.map(t => Number(t.ParentValue)).unique();
                if (landIds.length == 1)
                    landid = landIds.first();

                var regionIds = items.map(t => Number(t.ChildValue)).unique();
                if (regionIds.length == 1)
                    regionid = regionIds.first();

                //select landid
                var olditem = this.filter.Items;
                var market = sources.marketsegment.find(t => t.LandId == landid && t.TypeId ==1);
                var subtitle = sources.subtitle.find(t => t.RegionId == regionid && t.TypeId == 2);

                for (var i = 0; i < olditem.length; i++) {
                    var item = olditem[i];
                    var selectall = item.TypeSrc.find(t => t.Id == 30);
                    if (selectall == undefined)
                        continue;

                    var marketTitle = market ? market.TitleName : kLg.lblMarktsegemente;
                    var submartketTitle = subtitle ? subtitle.TitleName : kLg.lblSubmarket;

                    selectall.set("Name", marketTitle + "/" + submartketTitle);
                    if (item.TypeValue != 30) continue;

                    //parent
                    if (item.ParentSrc != undefined) {
                        var bindmarket = item.ParentSrc.find(t => t.Id == 0);
                        if (bindmarket != undefined) {
                            bindmarket.set("Name", vmCommon.joinString(kLg.btnChoose, marketTitle));
                            
                        }
                    }
                    //child
                    if (item.ChildSrc != undefined) {
                        var bindmarket = item.ChildSrc.find(t => t.Id == 0);
                        if (bindmarket != undefined) {
                            
                            bindmarket.set("Name", vmCommon.joinString(kLg.btnChoose, submartketTitle));
                        }
                    }
                }
            },

            onChangeParent: function (e) {
                this.filter.SearchFilter.set("RedirectId", null);
                var items = this.filter.Items;

                var tempItem = vmCommon.deepCopy(e.data);
                var item = e.data;
                var itemIndex = items.indexOf(item);
                bindData.bind(items, tempItem, itemIndex);                                   
                for (var key in tempItem) {
                    item.set(key, tempItem[key]);
                }

                if (item.TypeValue == mFilter.enumFilter.landregion) this.rebindDependOnRegionType(itemIndex);

               

                this.switchToDefaultFilter();
                this.NewSouceDropdownlist();
                
            },
            onChangeChild: function (e) {
                this.filter.SearchFilter.set("RedirectId", null);
                var items = this.filter.Items;

                var tempItem = vmCommon.deepCopy(e.data);
                var item = e.data;
                var itemIndex = items.indexOf(item);

                bindData.bind(items, tempItem, itemIndex);
                for (var key in tempItem) {
                    item.set(key, tempItem[key]);
                }

                if (item.TypeValue == mFilter.enumFilter.landregion) this.rebindDependOnRegionType(itemIndex);
                this.NewSouceDropdownlist();
                this.switchToDefaultFilter();
            },
            saveFilter: function () {
                msFilter.dataService.saveFilter(this.buildingQueryFilter());
            },
            buildingQueryFilter: function (isNew) {
                var query = new DFilterX();

                var cf = this.filter;// isNew ? this.filter : this.currentFilter;

                query.Id = cf.Id;
                query.Name = cf.Name;

                var tempItems = vmCommon.deepCopy(cf.Items);
                var tempSeachItem = vmCommon.deepCopy(cf.SearchFilter);

                //redirect
                if (tempSeachItem.RedirectId) {
                    tempItems.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.redirectGoal, ParentValue: tempSeachItem.RedirectId });
                }

                //subfilter
                if (vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar) && vmCalendar.subFilterModel) {
                    var sm = vmCalendar.subFilterModel;
                    query.SubFilter.IsMain = sm.cbMainGoal;
                    query.SubFilter.IsSub = sm.cbSubGoal;
                    query.SubFilter.IsAction = sm.cbAction;
                    query.SubFilter.IsActivity = sm.cbActivity;
                }

                if (vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap) && msRoadmapApp) {
                    query.SubFilter = msRoadmapApp.subFilter;

                    query.SubFilter.IsMainPath = msRoadmapApp.MenuLabeling.IsMain;
                    query.SubFilter.IsSubPath = msRoadmapApp.MenuLabeling.IsSub;
                    query.SubFilter.IsActionPath = msRoadmapApp.MenuLabeling.IsAction;

                    const cF = this.filters.find(f => !f.Name);
                    if (cF) {
                        cF.SubFilter = query.SubFilter;  // update subfilter
                    }
                }

                //text search
                tempItems.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.textsearch, ParentValue: tempSeachItem.Text });

                //time range
                tempItems.push({
                    Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.workingRange, ParentValue: tempSeachItem.Type,
                    ChildValue: changeHourOfDate(tempSeachItem.Start), ChildValue1: changeHourOfDate(tempSeachItem.End)
                });

                // showfinishedelement
                if (type == vmCommon.FilterType.ActionPlan || type == vmCommon.FilterType.RoadMap) {
                    tempItems.push({
                        Operator: mFilter.enumOperator.AND,
                        TypeValue: mFilter.enumFilter.ShowFinishedElements,
                        ParentValue: cf.IsShowDoneUndoneElement
                    });
                }

                query.IsHasRedirect = tempItems.some(t => t.TypeValue == mFilter.enumFilter.redirectGoal);
                query.Items = tempItems;
                query.TypeId = type;

                return query;
            },
            isValidTimeRange: true,
            validTimeRange: function (e) {

                if (!this.filter.SearchFilter.RedirectId) this.switchToDefaultFilter();

                var flag = false;
                var searchFilter = this.filter.SearchFilter;

                var sdate = searchFilter.Start && typeof searchFilter.Start == "string" ? new Date(searchFilter.Start) : searchFilter.Start;
                var edate = searchFilter.End && typeof searchFilter.End == "string" ? new Date(searchFilter.End) : searchFilter.End;

                var $sitem = $("#timefor" + type + " input.fstart");
                var $eitem = $("#timefor" + type + " input.fend");

                this.isValidTimeRange = true;
                if (sdate && edate) {
                    if (vmCommon.compareDate2(sdate, edate) > 0) {
                        ShowToolTip2($sitem, kLg.msgValidateStartEndDate, "top");
                        this.isValidTimeRange = false;
                    } else {
                        flag = true;
                    }
                } else {
                    if (typeof e != 'undefined' && msFilter.validStart(e.sender.element) == 'validateDone') {
                        if (msFilter.validStart($sitem) == 'validateDone' && msFilter.validEnd($eitem) == 'validateDone') {
                            flag = true;
                        }
                    }

                    if (typeof e == 'undefined' && (edate || sdate)) {
                        flag = true;
                    }
                    if (msFilter.validStart($sitem) == 'validateFail' || msFilter.validEnd($eitem) == 'validateFail') {
                        this.isValidTimeRange = false;
                    }
                }

                if (flag) {
                    DestroyToolTip($sitem);
                    if (sdate || edate) searchFilter.set("Type", -1);
                    else searchFilter.set("Type", 0);
                }

                return flag;
            },
            onChangeStart: function (e) {
                if (this.validTimeRange(e) || typeof e == 'undefined') {
                    if (this.filter.SearchFilter.RedirectId) {
                        if (!this.filter.Name) {
                            this.saveFilter();
                            this.applyFilter();
                        }

                        switch (this.filter.TypeId) {
                            case vmCommon.FilterType.RoadMap:
                                msRoadmapApp.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                                break;
                            case vmCommon.FilterType.Mix:
                                if (this.filter.SearchFilter.Start != null || this.filter.SearchFilter.End != null) {
                                    vmCalendar.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                                } else {
                                    vmCalendar.mmFocusFirstRow();
                                }
                                break;
                            default:
                                this.onFilter();
                                break;
                        }
                    }
                    else this.onFilter();
                }
            },
            onChangeEnd: function (e) {
                if (this.validTimeRange(e) || typeof e == 'undefined') {
                    if (this.filter.SearchFilter.RedirectId) {
                        if (!this.filter.Name) {
                            this.saveFilter();
                            this.applyFilter();
                        }

                        switch (this.filter.TypeId) {
                            case vmCommon.FilterType.RoadMap:
                                msRoadmapApp.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                                break;
                            case vmCommon.FilterType.Mix:
                                if (this.filter.SearchFilter.Start != null || this.filter.SearchFilter.End != null) {
                                    vmCalendar.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                                } else {
                                    vmCalendar.mmFocusFirstRow();
                                }
                                break;
                            default:
                                this.onFilter();
                                break;
                        }
                    }
                    else this.onFilter();
                }
            },
            onClickHideTooltip: function (e) {
                $('.tooltip.fade.top.in').hide();
            },
            onChangeTextSearch: function () {

                this.switchToDefaultFilter();
            },
            onSelectTimeRangeType: function (e) {
                if (!this.filter.SearchFilter.RedirectId)
                    this.switchToDefaultFilter();

                var searchFilter = this.filter.SearchFilter;

                if (e.dataItem.Id == searchFilter.Type || e.dataItem.Id == -1) return;
                this.set("selectedType", e.dataItem);
            },
            selectedType: null,
            onChangeTimeRangeType: function (e) {
                var temp = this.selectedType;
                if (temp == null) return;

                var $start = $("#timefor" + type + " input.fstart");
                var $end = $("#timefor" + type + " input.fend");

                DestroyToolTip($start);
                DestroyToolTip($end);

                var searchFilter = this.filter.SearchFilter;
                if (temp.Id == 0) {
                    searchFilter.set("Start", null);
                    searchFilter.set("End", null);

                    $start.val("");
                    $end.val("");
                }
                else if (temp.Id > 0) {
                    searchFilter.set("Start", new Date(temp.Id, 0, 1));
                    searchFilter.set("End", new Date(temp.Id, 11, 31));
                }

                this.set("selectedType", null);

                if (this.filter.SearchFilter.RedirectId) {
                    if (!this.filter.Name)
                        this.saveFilter();

                    switch (this.filter.TypeId) {
                        case vmCommon.FilterType.RoadMap:
                            msRoadmapApp.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                            break;
                        case vmCommon.FilterType.Mix:
                            if (this.filter.SearchFilter.Start != null || this.filter.SearchFilter.End != null) {
                                vmCalendar.setTimeRange(this.filter.SearchFilter.Start, this.filter.SearchFilter.End);
                            } else {
                                vmCalendar.mmFocusFirstRow();
                            }
                            break;
                        default:
                            this.switchToDefaultFilter();
                            this.onFilter();
                            break;
                    }
                }
                else {
                    this.switchToDefaultFilter();
                    this.onFilter();
                }
            },
            applyFilter: function () {
                this.set("currentFilter", vmCommon.deepCopy(this.filter));
                this.set('IsClickToCheckChange', true);
            },
            onSaveFilter: function () {
                var that = this;
                popName(kLg.saveFilter).then(
                    function () {
                        var newFilter = that.buildingQueryFilter(true);
                        newFilter.Items = newFilter.Items.filter(t => t.TypeValue != mFilter.enumFilter.textsearch && t.TypeValue != mFilter.enumFilter.workingRange);

                        newFilter.Name = popName.Data;
                        newFilter.IsShow = true;

                        msFilter.dataService.createFilter(newFilter, function (rs) {
                            newFilter.Id = rs.value;
                            that.filters.push(newFilter);

                            that.set("hasFilter", true);
                        });

                        return;
                    },
                    function () {
                        return;
                    }
                );
            },
            onSelectFilter: function (e) {
                var item = e.data;
                if (item.IsUsing) return;

                this.filters.forEach(t => {
                    t.set("IsUsing", false);
                });

                item.set("IsUsing", true);
                item.set("TypeId", type);
                msFilter.dataService.setUsingFilter(item);

                //bind subfilter
                if (vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar) && vmCalendar.subFilterModel) {
                    var subFilter = item.SubFilter;

                    vmCalendar.subFilterModel.set("cbMainGoal", subFilter.IsMain);
                    vmCalendar.subFilterModel.set("cbSubGoal", subFilter.IsSub);
                    vmCalendar.subFilterModel.set("cbAction", subFilter.IsAction);
                    vmCalendar.subFilterModel.set("cbActivity", subFilter.IsActivity);
                }

                if (vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap) && msRoadmapApp) {
                    var subFilter = item.SubFilter;

                    msRoadmapApp.subFilter.IsMain = subFilter.IsMain;
                    msRoadmapApp.subFilter.IsSub = subFilter.IsSub;
                    msRoadmapApp.subFilter.IsAction = subFilter.IsAction;
                    msRoadmapApp.subFilter.IsActivity = subFilter.IsActivity;

                    const mainLbling = subFilter.IsMainPath || false;
                    const subLbling = subFilter.IsSubPath || false;
                    const actionLbling = subFilter.IsActionPath || false;
                    msRoadmapApp.setLabeling(mainLbling, subLbling, actionLbling);
                    msRoadmapApp.resetExpandPathBlocks();
                }

                var selectedFilter = convertToFilterModel(item);

                this.set("filter", vmCommon.deepCopy(selectedFilter));
                this.set("currentFilter", vmCommon.deepCopy(selectedFilter));

                this.applyFilter();
                onFilterData(this.buildingQueryFilter());
                this.onClickHideTooltip(e);
                this.NewSouceDropdownlist();
            },
            onDeleteFilter: function (e) {
                var that = this;
                pConfirm(kLg.confirmDeleteFilter).then(
                    function () {
                        var fid = $(e.target).attr("fid");
                        if (fid == undefined || isNaN(Number(fid))) return;

                        var filter = that.filters.find(t => t.Id == fid);
                        if (filter == undefined) return;

                        var defaultFilter = that.filters.find(t => !t.Name);
                        if (defaultFilter == undefined) return;

                        var findex = that.filters.indexOf(filter);
                        if (findex < 0) return;

                        that.filters.splice(findex, 1);
                        that.set("hasFilter", that.filters.some(t => t.Name));

                        that.filters.forEach(t => {
                            t.set("IsUsing", false);
                        });

                        defaultFilter.IsUsing = true;

                        defaultFilter.Items = filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.landregion);

                        var fm = convertToFilterModel(defaultFilter);
                        that.set("filter", vmCommon.deepCopy(fm));
                        that.set("currentFilter", vmCommon.deepCopy(fm));

                        //var that = this;
                        msFilter.dataService.deleteFilter({ Id: filter.Id }, function (res) {
                            that.onFilter();
                        });
                    }
                );
                this.onClickHideTooltip(e);
            },
            isDisableFinishCbx: false,
            isShowOnActionPlan: vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan) || vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap),
            isHasNavigationMenu: vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan),
            IsNotShowOnDashboard: !vmCommon.checkCurrentPage(vmCommon.enumPage.Dashboard),
            onChangeShowDoneUndoneElement(e) {
                var that = this;
                that.set("isDisableFinishCbx", true);
                that.onReloadData(function () {
                    that.set("isDisableFinishCbx", false);
                });
            },
            onChangeShowNavigationMenu(e) {
                const isShowNm = this.get('isShowNavigationMenu');
                msFilter.dataService.showNavigation({ IsShowNavigationMenu: isShowNm },
                    function (res) {
                        if (MsaApp) MsaApp.IsShowNavigationMenu = isShowNm;
                    });
            },
            ShowDoneUndoneElementName: kLg.ShowFinishedElements,
            ShowNavigationMenu: kLg.NavigationMenu,
            onToggleFilterBar: function (e) {
                let isShowFb = this.get('IsShowFilterBar');
                this.set('IsShowFilterBar', !isShowFb);
            },
            cssBorderToggleFilter: function () {
                if (this.get('IsShowFilterBar')) {
                    this.set('ShowFilterbarText', kLg.HideFilterbar);
                    return '1px';
                } else {
                    this.set('ShowFilterbarText', kLg.ShowFilterbar);
                    return '0';
                }
            },
            cssPaddingTopNotInDashboard: function () {
                if (vmCommon.checkCurrentPage(vmCommon.enumPage.Dashboard)) {
                    return '0'
                };
                return '30px';
            },
            cssBtnToggleFilter: function () {
                return '0';
            },
            stlWidthByLang: function () {
                if (kLg.language == 'de' || kLg.language == 'pm') return '106px';
                return '72px';
            },
            iconHideFilterBar: function () {
                return !this.get('IsShowFilterBar');
            },
            IsShowFilterBar: hasDirectFrom() || (vmCommon.checkCurrentPage(vmCommon.enumPage.Dashboard)),
            ShowFilterbarText: hasDirectFrom() ? kLg.ShowFilterbar : kLg.HideFilterbar,
            switchToDefaultFilter: function () {
                var filter = this.filter;
                var items = filter.Items;

                if (!filter.Name) return new Promise(res => {res();});

                var defaultFilter = this.filters.find(t => !t.Name);
                if (defaultFilter == undefined) return new Promise(res => {res();});

                this.filters.forEach(t => { t.set("IsUsing", false); });

                defaultFilter.IsUsing = true;
                defaultFilter.Items = items;

                defaultFilter.Items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.workingRange, ParentValue: filter.SearchFilter.Type, ChildValue: filter.SearchFilter.Start, ChildValue1: filter.SearchFilter.End });
                defaultFilter.Items.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.textsearch, ParentValue: filter.SearchFilter.Text });

                var fm = convertToFilterModel(defaultFilter);

                this.set("filter", vmCommon.deepCopy(fm));
                this.set("currentFilter", vmCommon.deepCopy(fm));

                if (vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar) && vmCalendar.subFilterModel) {
                    this.set('IsShowFilterBar', true);
                }

                if (vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap) && msRoadmapApp) {
                    this.set('IsShowFilterBar', true);
                }
                return new Promise(res => {res();})
            }
        });

        kendo.bind($("#msfilterpanel" + type), models[type]);

        models[type].NewSouceDropdownlist();
        setLanguageFilter(type);
        binded.pushx(type);
        bindingTimeRangeFilter(type);

        // 18098, 19421 - Move the Date function
        let $msMoveTimeRange = $('th.ms-move-tr');
        let $timerange = $('#timerange');
        $msMoveTimeRange.append($timerange);

        vmCommon.removeUrlParams("fromcrm,fromactionplanconnect,gotomix,fromdashinfo");
    };

    var hasCriteria = function (criteriaType, type) {
        if (criteriaType == mFilter.enumFilter.visibility) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        var exceptTypies = [mFilter.enumFilter.masterGoal, mFilter.enumFilter.masterGoalKpi];

        var tempCriteria = criteriaType;
        if (criteriaType == mFilter.enumFilter.lastStatus) tempCriteria = mFilter.enumFilter.protocolStatus;
        if (criteriaType == mFilter.enumFilter.advertiser) tempCriteria = mFilter.enumFilter.advertisingMaterial;

        return model.filter.Items.some(t => t.TypeValue == tempCriteria && (exceptTypies.indexOf(t.TypeValue) >= 0 || (t.TypeValue == tempCriteria && t.ParentValue != 0)));
    };

    var hasParent = function (parentId, criteriaType, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == null) return;

        return model.filter.Items.some(t => t.TypeValue == criteriaType && t.ParentValue == parentId && !t.ChildValue);
    };

    var getQueryFilter = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        return model ? model.buildingQueryFilter() : undefined;
    };

    var reLoadDataFilter = function (type, func) {
        var filterType = type || targetFilter;
        sources = {};
        msFilter.dataService.getAllFilterData({ TypeId: filterType }, function (res) {
            if (!res.value) return;

            var rs = res.value;
            buildingSources(rs);

            for (var i = 0; i < binded.length; i++) {
                var bindedType = binded[i];

                var model = models[bindedType];

                var fm = model.filter;
                var temps = vmCommon.deepCopy(fm.Items);

                for (var i = 0; i < temps.length; i++) {
                    var item = temps[i];
                    bindData.bind(temps, item, i);
                }
                fm.set("Items", temps);
            }

            if (func instanceof Function) func();
        });
    };

    var init = function (type, callback) {
        //0: select, -2: select all
        if (type == undefined || isNaN(Number(type)) || type == 0) { return; }
        if (targetFilter == type) return;

        targetFilter = type;
        if (models[type]) {
            //rebind timerange for each type
            bindingTimeRangeFilter(type);
            return;
        }
        msFilter.dataService.getAllFilterData({ TypeId: type }, function (res) {
            if (!res.value) return;

            var rs = res.value;
            if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                isShowNavigationMenu = rs.IsShowNavigationMenu;
                if (MsaApp) MsaApp.IsShowNavigationMenu = isShowNavigationMenu;
            }
            criterias = rs.Criterias;
            defaultRegion = rs.DefaultRegion;
            buildingSources(rs);
            if (!vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) bindFilter(type, rs.Filters);
            isReady = true;
            if (typeof callback == 'function') {
                callback(rs);
            }
            if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) bindFilter(type, rs.Filters);
        });
    };

    var getRegionAccountRoles = function () {
        return RegionAccountRoles;
    };

    var getWorkingRange = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        var wr = model ? model.filter.SearchFilter : new SearchFilter();
        if (wr.Start) {
            if (typeof wr.Start === "string") wr.Start = wr.Start.toDate();
        }
        if (wr.End) {
            if (typeof wr.End === "string") wr.End = wr.End.toDate();
        }

        return wr;
    };

    var resetFilter = function (isSearch) {
        var model = models[targetFilter];

        if (model == undefined) return;

        if (isSearch) {
            model.onResetWithoutClick();
        } else {
            model.resetDataFilter();
        }
    };

    var resetFilterWithRegion = function (regionIds, func) {
        if (regionIds == undefined || regionIds.length == 0) return;

        var model = models[targetFilter];
        if (model == undefined) return;

        var fm = vmCommon.deepCopy(model.filter);
        var newItems = [];
        var landSrc = vmCommon.deepCopy(sources.landregion);
        var regionSrc = landSrc.map(t => t.Regions).flatten();

        regionIds.forEach(regionId => {
            var newItem = { Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.landregion, ParentValue: -2, ChildValue: -2 };

            //valid data
            var region = regionSrc.find(t => t.Id == regionId);
            if (region == null) return;

            //valid data
            var land = landSrc.find(t => t.Id == region.LandId);
            if (land == null) return;

            newItem.ParentValue = land.Id;
            newItem.ChildValue = region.Id;

            newItems.unshift(newItem);
        });

        if (newItems.length == 0) newItems = getResetDataFilter();
        fm.Items = newItems;
        bindingSourceForObjectFilter(fm);

        model.set("filter", fm);
        model.switchToDefaultFilter();

        if (func instanceof Function) func();
    };

    var resetFilterExcept = function (criteriaTypes, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;
        model.filter.set("Items", model.filter.Items.filter(t => criteriaTypes.indexOf(t.TypeValue) >= 0));
        return model.onFilter('resetFilterExcept');        // promise
    };

    var search = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;

        model.onSearch();
    };

    var reLoadData = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;

        return model.onFilterWithoutClick();        // promise
    };

    var getAccountRole = function (regionId) {
        var lst = vmCommon.deepCopy(RegionAccountRoles);
        return lst.filter(t => regionId == undefined || t.Id == regionId);
    };

    var buildingItemFilter = function (criterialType, operator, parentValue, childValue, childValue1) {
        return { Operator: operator || mFilter.enumOperator.AND, TypeValue: criterialType, ParentValue: parentValue, ChildValue: childValue, ChildValue: childValue1 };
    };

    var getRegionFilter = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;

        var regions = [];
        var landregionSrc = sources.landregion || [];

        var items = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.landregion);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.ParentValue == -2) {
                regions = landregionSrc.map(function (it) { return it.Regions; }).flatten().map(function (it) { return Number(it.Id); });
                break;
            }

            var land = vmCommon.findByFunc(landregionSrc, function (it) { return it.Id == item.ParentValue; });
            if (land == null) continue;

            if (item.ChildValue == -2) {
                regions = regions.concat(land.Regions.map(function (it) { return Number(it.Id); }));
            } else {
                region = vmCommon.findByFunc(land.Regions, function (it) { return it.Id == item.ChildValue; });
                if (region != null) regions.push(Number(region.Id));
            }
        }

        return regions.unique();
    };

    var hasLabel = function (criteriaType) {
        var flag = false;

        switch (criteriaType) {
            case mFilter.enumFilter.fibuKostenstellen:
                flag = sources.hasSettingFibu;
                break;
            case mFilter.enumFilter.masterGoal:
                flag = sources.hasSettingMasterGoal;
                break;
            case mFilter.enumFilter.masterGoalKpi:
                flag = sources.hasSettingMasterGoalKpi;
                break;
            default:
                flag = true;
                break;
        }

        return flag;
    };

    var getVisibilityState = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var visItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.visibility);

        if (visItems.length && visItems.some(t => t.ParentValue == mFilter.enumFilterVisibility.ShowAll))
            return vmFilter.enumFilterVisibility.ShowAll;
        else
            if (visItems.length && visItems.some(t => t.ParentValue == mFilter.enumFilterVisibility.Hide))
                return vmFilter.enumFilterVisibility.Hide;
            else
                return mFilter.enumFilterVisibility.Show;
    };

    var checkFitFilterMasterKpi = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.masterGoalKpi);
        if (filterItems.length == 0) return true;

        if (values == null || values.length == 0) return false;

        var masterIds = filterItems.map(t => t.ChildValue || t.ChildSrc.filter(x => x.Id != 0).map(x => x.Id)).flatten().filter(t => t != 0);

        return values.some(t => masterIds.indexOf(t) >= 0);
    };

    var checkFitFilterMasterGoal = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.masterGoal);
        if (filterItems.length == 0) return true;

        if (values == null || values.length == 0) return false;

        var visibilityState = getVisibilityState(filterType) != 2;
        var tempMasterIds = filterItems.map(t => t.ChildValue || t.ChildSrc.filter(x => x.Id != 0).map(x => x.Id)).flatten().filter(t => t != 0);
        var masterIds = sources.mastergoals.filter(t => t.Visibility == visibilityState && tempMasterIds.indexOf(t.Id) >= 0).map(t => t.Id);

        return values.some(t => masterIds.indexOf(t) >= 0);
    };

    var checkFitFilterFibu = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.fibuKostenstellen);
        if (filterItems.length == 0) return true;

        if (values == null || values.length == 0) return false;

        var flag = false;
        for (var i = 0; i < filterItems.length; i++) {
            var filterItem = filterItems[i];

            for (var j = 0; j < values.length; j++) {
                if (filterItem.ParentValue === values[j].FibuLandRegionId
                    && (filterItem.ChildValue == -2 || filterItem.ChildValue === values[j].FibuKontenId)
                    && (filterItem.ChildValue1 == -2 || filterItem.ChildValue1 === values[j].KostenstellenId)) {
                    flag = true;
                    break;
                }
            }

            if (flag) break;
        }
        return flag;
    };

    var checkFitFilterAllStatus = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.protocolStatus);
        if (filterItems.length == 0) return true;

        var allIds = filterItems.filter(t => Number(t.ParentValue) == 1 && Number(t.ChildValue) > 0).map(t => Number(t.ChildValue));

        if (allIds.length == 0) return true;
        var flag = allIds.length > 0 && values.some(t => allIds.indexOf(t) >= 0);

        return flag;
    };

    var checkFitFilterLastStatus = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.protocolStatus);
        if (filterItems.length == 0) return true;

        var lastIds = filterItems.filter(t => Number(t.ParentValue) == 2 && Number(t.ChildValue) > 0).map(t => Number(t.ChildValue));

        if (lastIds.length == 0) return true;
        var flag = lastIds.length > 0 && values.some(t => lastIds.indexOf(t) >= 0);

        return flag;
    };

    var checkFitFilterAdvertiser = function (values, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.advertisingMaterial && Number(t.ParentValue) != 0);
        if (filterItems.length == 0) return true;

        var advertiserIds = [];
        for (var i = 0; i < filterItems.length; i++) {
            var fitem = filterItems[i];
            advertiserIds = advertiserIds.concat(sources.advertisers.filter(t => (fitem.ParentValue == -2 || t.ParentId == fitem.ParentValue) && (fitem.ChildValue == -2 || t.Id == fitem.ChildValue)).map(t => t.Id).unique());
        }
        if (advertiserIds.length == 0) return true;

        return values.some(t => advertiserIds.indexOf(t) >= 0);
    };

    var checkFitFilterAdvertising = function (values, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.advertisingMaterial && Number(t.ParentValue) != 0);
        if (filterItems.length == 0) return true;

        if (!Array.isArray(values) || values.length == 0) return true;

        var advertisingIds = [];
        for (var i = 0; i < filterItems.length; i++) {
            var fitem = filterItems[i];
            advertisingIds = advertisingIds.concat(sources.advertisingMaterials.filter(t => fitem.ParentValue == -2 || t.Id == fitem.ParentValue).map(t => t.Id).unique());
        }
        if (advertisingIds.length == 0) return true;

        return values.some(t => advertisingIds.indexOf(t) >= 0);
    };

    var checkFitFilterGroup = function (values, criteriaType, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == criteriaType && Number(t.ParentValue) != 0);
        if (filterItems.length == 0) return true;

        if (values.length == 0) return false;

        var selectedGroups = values.filter(t => t.TypeId == 1).map(t => t.ObjectId);
        var selectedProducts = values.filter(t => t.TypeId == 2).map(t => t.ObjectId);
        var selectedSubs = values.filter(t => t.TypeId == 3).map(t => t.ObjectId);

        var flag = false;
        for (var i = 0; i < filterItems.length; i++) {
            var item = filterItems[i];

            //get selected
            var filterGroups = (item.ParentValue == -2 || item.ParentValue == -3) ? item.ParentSrc.filter(t => t.Id > 0).map(t => t.Id) : (item.ParentValue > 0) ? [item.ParentValue] : [],
                filterProducts = (item.ChildValue == -2 || item.ChildValue == -3) ? item.ChildSrc.filter(t => t.Id > 0).map(t => t.Id) : (item.ChildValue > 0) ? [item.ChildValue] : [],
                filterSubs = (item.ChildValue1 == -2 || item.ChildValue1 == -3) ? item.Child1Src.filter(t => t.Id > 0).map(t => t.Id) : (item.ChildValue1 > 0) ? [item.ChildValue1] : [];

            if (item.ChildValue1 != 0) {
                flag = selectedSubs.some(t => filterSubs.indexOf(t) > -1);

                if (item.ChildValue1 == -3) {
                    flag = flag || selectedProducts.some(t => filterProducts.indexOf(t) > -1);
                }
            } else if (item.ChildValue != 0) {
                flag = selectedProducts.some(t => filterProducts.indexOf(t) > -1);

                if (item.ChildValue == -3) {
                    flag = flag || selectedGroups.some(t => filterGroups.indexOf(t) > -1);
                }
            } else if (item.ParentValue != 0) {
                flag = selectedGroups.some(t => filterGroups.indexOf(t) > -1);
            }

            if (flag) break;
        }

        return flag;
    };

    var checkFitFilterVisibility = function (values, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var filterItems = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.visibility);
        if (filterItems.some(t => t.ParentValue == 1)) return true;

        if (filterItems.length == 0) filterItems.push({ Operator: mFilter.enumOperator.AND, TypeValue: mFilter.enumFilter.visibility, ParentValue: mFilter.enumFilterVisibility.Show, ChildValue: 0, ChildValue1: 0 });
        var visibilityIds = filterItems.map(t => Number(t.ParentValue));

        return values.some(t => visibilityIds.indexOf(t) >= 0);
    };

    var checkFitFilter = function (values, criteriaType, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var flag = isFitFilter(values, criteriaType, type);

        if (!flag) { // && criteriaType != mFilter.enumFilter.protocolStatus && criteriaType != mFilter.enumFilter.lastStatus
            model.switchToDefaultFilter();
            if (criteriaType == mFilter.enumFilter.protocolStatus) {
                model.filter.set("Items", model.filter.Items.filter(t => t.TypeValue != mFilter.enumFilter.protocolStatus || t.ParentValue != 1));
            }
            else if (criteriaType == mFilter.enumFilter.lastStatus) {
                model.filter.set("Items", model.filter.Items.filter(t => t.TypeValue != mFilter.enumFilter.protocolStatus || t.ParentValue != 2));
            }
            else {
                var tempCriteria = criteriaType;
                //get main criteria
                if (criteriaType == mFilter.enumFilter.advertiser) tempCriteria = mFilter.enumFilter.advertisingMaterial;

                model.filter.set("Items", model.filter.Items.filter(t => t.TypeValue != tempCriteria));
            }
        }

        return flag;
    };

    var isFitFilter = function (values, criteriaType, type) {
        if (!Array.isArray(values)) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;
        if (!hasCriteria(criteriaType)) return true;

        var flag = true, customTypes = [mFilter.enumFilter.masterGoal,
        mFilter.enumFilter.masterGoalKpi,
        mFilter.enumFilter.protocolStatus,
        mFilter.enumFilter.lastStatus,
        mFilter.enumFilter.advertiser,
        mFilter.enumFilter.advertisingMaterial,
        mFilter.enumFilter.fibuKostenstellen,
        mFilter.enumFilter.productGroup,
        mFilter.enumFilter.market,
        mFilter.enumFilter.visibility,
        mFilter.enumFilter.customerJourney
        ];
        if (criteriaType == mFilter.enumFilter.masterGoal) {
            flag = checkFitFilterMasterGoal(values, type);
        }
        if (criteriaType == mFilter.enumFilter.fibuKostenstellen) {
            flag = checkFitFilterFibu(values, type);
        }
        if (criteriaType == mFilter.enumFilter.masterGoalKpi) {
            flag = checkFitFilterMasterKpi(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.protocolStatus) {
            flag = checkFitFilterAllStatus(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.lastStatus) {
            flag = checkFitFilterLastStatus(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.advertiser) {
            flag = checkFitFilterAdvertiser(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.advertisingMaterial) {
            flag = checkFitFilterAdvertising(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.visibility) {
            flag = checkFitFilterVisibility(values, type);
        }
        else if (criteriaType == mFilter.enumFilter.productGroup || criteriaType == mFilter.enumFilter.market || criteriaType == mFilter.enumFilter.customerJourney) {
            flag = checkFitFilterGroup(values, criteriaType, type);
        }
        else if (customTypes.indexOf(criteriaType) < 0) {
            var filterValues = model.filter.Items.filter(t => t.TypeValue == criteriaType && t.ParentValue != 0).map(t => `${t.ParentValue}`);
            if (filterValues.length == 0) return true;

            var tempValues = values.filter(t => t != null && t != 0).map(t => `${t}`);
            if (tempValues.length == 0) return false;

            if (criteriaType == mFilter.enumFilter.visibility && filterValues.includes("1")) return true;
            flag = filterValues.includes("-2") || tempValues.some(t => filterValues.includes(t));
        }

        return flag;
    };

    var checkFitTimeRange = function (start, end, type) {
        if (start == null && end == null) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var search = model.filter.SearchFilter;
        if (search.Start == null && search.End == null) return true;

        var tempStart = start != null ? typeof start == "string" ? start.toDate() : start : null;
        var tempEnd = end != null ? typeof end == "string" ? end.toDate() : end : null;

        var flag = true;

        if (search.Start != null && search.End != null) {
            if (tempStart == null) {
                flag = vmCommon.compareDate2(search.Start, tempEnd) <= 0;
            } else if (tempEnd == null) {
                flag = vmCommon.compareDate2(search.End, tempStart) >= 0;
            } else {
                flag = vmCommon.compareDate2(search.Start, tempStart) <= 0 && vmCommon.compareDate2(search.End, tempStart) >= 0
                    || vmCommon.compareDate2(search.Start, tempEnd) <= 0 && vmCommon.compareDate2(search.End, tempEnd) >= 0
                    || vmCommon.compareDate2(search.Start, tempStart) >= 0 && vmCommon.compareDate2(search.Start, tempEnd) <= 0
                    || vmCommon.compareDate2(search.End, tempStart) >= 0 && vmCommon.compareDate2(search.End, tempEnd) <= 0;
            }
        } else if (search.Start != null) {
            flag = tempEnd == null || vmCommon.compareDate2(search.Start, tempEnd) <= 0;
        } else {
            flag = tempStart == null || vmCommon.compareDate2(search.End, tempStart) >= 0;
        }

        return flag;
    };

    var checkFitTextSearch = function (values, type) {
        if (!Array.isArray(values) || values.length == 0) return true;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return true;

        var search = model.filter.SearchFilter;
        if (search.Text.length == 0) return true;

        var textSearch = search.Text.trim().toLowerCase();
        var flag = values.some(t => t && t.toLowerCase().indexOf(textSearch) >= 0);

        if (!flag) {
            search.set("Text", "");
        }

        return flag;
    };

    var changeEnd = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;

        model.onChangeEnd();
    };

    var getSource = function () {
        return vmCommon.deepCopy(sources);
    };

    var getItemFilters = function (criteriaType, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return [];

        var rs = model.filter.Items.filter(t => t.TypeValue == criteriaType);
        return vmCommon.deepCopy(rs);
    };
    var getCurrentFilterItems = function () {
        var model = models[targetFilter];

        if (model == undefined) return [];

        var currentFilter = model.currentFilter;

        currentFilter.Items.forEach(its => {
            its.FilterTypeId = 0;
        });

        checkPushSearchAndTimeRange();

        return currentFilter.Items.map(i => {
            return {
                Operator: i.Operator, TypeValue: i.TypeValue,
                ParentValue: i.ParentValue, ChildValue: i.ChildValue, ChildValue1: i.ChildValue1,
                FilterTypeId: i.FilterTypeId
            }
        });

        function checkPushSearchAndTimeRange() {
            var SearchFilter = currentFilter.SearchFilter;
            var textSearch = SearchFilter.Text;
            var trStart = SearchFilter.Start;
            var trEnd = SearchFilter.End;
            if (trStart) {
                trStart = new Date(trStart).toStringYYYYMMDD();
            }
            if (trEnd) {
                trEnd = new Date(trEnd).toStringYYYYMMDD();
            }
            var itms = currentFilter.Items.find(function (e) { return e.TypeValue == mFilter.enumFilter.textsearch });
            if (!itms) {
                var itemSearch = {
                    Operator: 1, TypeValue: mFilter.enumFilter.textsearch,
                    ParentValue: textSearch, ChildValue: null, ChildValue1: null,
                    FilterTypeId: 0
                }
                currentFilter.Items.push(itemSearch);
            }
            itms = currentFilter.Items.find(function (e) { return e.TypeValue == mFilter.enumFilter.workingRange });
            if (!itms) {
                var itemTimeRange = {
                    Operator: 1, TypeValue: mFilter.enumFilter.workingRange,
                    ParentValue: "-1", ChildValue: trStart, ChildValue1: trEnd,
                    FilterTypeId: 0
                }
                currentFilter.Items.push(itemTimeRange);
            }
        }
    };

    var removeItemFilter = function (criteriaType, type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;
        model.filter.set("Items", model.filter.Items.filter(t => t.TypeValue != criteriaType));
    };

    var getRegionOverview = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];
        if (model == undefined) return null;

        var itemFilters = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.landregion);
        if (itemFilters.some(t => t.ParentValue <= 0 || t.ChildValue <= 0)) return null;

        var ids = itemFilters.map(t => Number(t.ChildValue)).unique();
        return ids.length == 1 ? ids[0] : null;
    };

    var removeItemFilterByParent = function (criteriaType, parentValues, type) {
        if (parentValues == null || parentValues.length == 0) return;

        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == undefined) return;
        model.filter.set("Items", model.filter.Items.filter(t => t.TypeValue != criteriaType || !parentValues.includes(t.ParentValue)));
    };

    var getVisibilityState = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];
        if (model == undefined) return null;

        var itemFilters = model.filter.Items.filter(t => t.TypeValue == mFilter.enumFilter.visibility);
        if (itemFilters.length == 0) return mFilter.enumFilterVisibility.Show;

        if (itemFilters.some(function (it) { return it.ParentValue === mFilter.enumFilterVisibility.ShowAll; }))
            return mFilter.enumFilterVisibility.ShowAll;

        if (itemFilters.some(function (it) { return it.ParentValue === mFilter.enumFilterVisibility.Hide; }))
            return mFilter.enumFilterVisibility.Hide;

        return mFilter.enumFilterVisibility.Show;
    };

    var resetFilterToDefault = function () {
        return new Promise((reslv) => {
            var model = models[targetFilter];
            if (model == undefined) return;
            
            model.onResetWithoutClick(true).then(function (res) {
                reslv(res);
            });
        });
    };

    var onReloadData = function () {
        var model = models[targetFilter];
        if (model == undefined) return;

        model.onReloadData();
    };

    var onReloadDataMix = function () {
        var model = models[targetFilter];
        if (model == undefined) return;

        model.onReloadDataMix();
    };

    var switchToDefaultFilter = function () {
        var model = models[targetFilter];
        if (model == undefined) return;

        return model.switchToDefaultFilter();
    };

    var saveFilter = function (query, func) {
        msFilter.dataService.saveFilter(query, func);
        if (vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar) && vmCalendar.subFilterModel) {
            var model = models[targetFilter];
            if (model != undefined) {
                model.set('IsShowFilterBar', true);
            }
        }
    };

    var getCurrentModel = function () {
        var model = models[targetFilter];
        if (model == undefined) return {};
        return {
            hasChange: function () {
                return model.get('IsClickToCheckChange');
            },
            resetCheckChange: function () {
                model.set('IsClickToCheckChange', false);
            },
            setChage: function (typeId) {       // Mix (2) or Roadmap (1)
                if (typeId == vmCommon.LinkSharepointType.MIX && vmCommon.checkCurrentPage(vmCommon.enumPage.Calendar)) {
                    model.set('IsClickToCheckChange', true);
                }
                if (typeId == vmCommon.LinkSharepointType.ROADMAP && vmCommon.checkCurrentPage(vmCommon.enumPage.RoadMap)) {
                    model.set('IsClickToCheckChange', true);
                }
            }
        }
    }

    var isHasRedirect = function () {
        var model = models[targetFilter];
        if (model == undefined) return false;

        return model.filter.SearchFilter.RedirectId ? true : false;
    };

    function getLabeling() {
        var cF = models[targetFilter].filters.find(f => !f.Name);
        if (cF) {
            cF.SubFilter.IsMainPath = msRoadmapApp.MenuLabeling.IsMain;
            cF.SubFilter.IsSubPath = msRoadmapApp.MenuLabeling.IsSub;
            cF.SubFilter.IsActionPath = msRoadmapApp.MenuLabeling.IsAction;
        }
        return {
            saveHandler: function () {
                var cqF = getQueryFilter(); // buildingQueryFilter
                cqF.Id = cF.Id;
                cqF.Name = null;
                msFilter.dataService.saveFilter(cqF);
            }
        }
    };

    var hasCriteriaFilter = function (type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == null) return;

        var searchFilter = msFilter.controlService.getWorkingRange(vmCommon.FilterType.ActionPlan);
        return (searchFilter.Text != null && searchFilter.Text.length > 0) || searchFilter.Start != null || searchFilter.End != null || model.filter.Items.some(t => t.TypeValue != 0 && t.TypeValue != mFilter.enumFilter.landregion);
    };

    function hasHiddenElements (parentId) {
        var model = models[targetFilter];
        if (model == null) return;
        var criteriaType = mFilter.enumFilter.visibility
        return model.filter.Items.some(t => t.TypeValue == criteriaType && t.ParentValue == parentId);
    };

    function isShowFinishedElements(type) {
        var filterType = type || targetFilter;
        var model = models[filterType];

        if (model == null) return false;
        return model.filter.IsShowDoneUndoneElement;
    }

    return {
        init: init,
        getRegionFilter: getRegionFilter,
        hasType: hasType,
        getQueryFilter: getQueryFilter,
        reLoadDataFilter: reLoadDataFilter,
        hasCriteria: hasCriteria,
        hasParent: hasParent,
        getRegionAccountRoles: getRegionAccountRoles,
        getWorkingRange: getWorkingRange,
        resetFilter: resetFilter,
        resetFilterWithRegion: resetFilterWithRegion,
        resetFilterExcept: resetFilterExcept,
        resetFilterToDefault: resetFilterToDefault,
        search: search,
        models: models,
        getAccountRole: getAccountRole,
        buildingItemFilter: buildingItemFilter,
        hasLabel: hasLabel,
        changeEnd: changeEnd,
        reLoadData: reLoadData,
        checkFitFilter: checkFitFilter,
        checkFitTimeRange: checkFitTimeRange,
        checkFitTextSearch: checkFitTextSearch,
        getSource: getSource,
        getItemFilters: getItemFilters,
        removeItemFilter: removeItemFilter,
        removeItemFilterByParent: removeItemFilterByParent,
        isFitFilter: isFitFilter,
        getRegionOverview: getRegionOverview,
        getVisibilityState: getVisibilityState,
        onReloadData: onReloadData,
        onReloadDataMix: onReloadDataMix,
        switchToDefaultFilter: switchToDefaultFilter,
        saveFilter: saveFilter,
        getCurrentFilterItems: getCurrentFilterItems,
        getCurrentModel: getCurrentModel,
        isHasRedirect: isHasRedirect,
        getLabeling: getLabeling,
        hasCriteriaFilter: hasCriteriaFilter,
        hasHiddenElements: hasHiddenElements,
        isReady: () => isReady,
        isShowFinishedElements: isShowFinishedElements
    };
}();

//ENTITY
function DFilterX() {
    this.Id = 0;
    this.Items = [];
    this.TypeId = 0;
    this.ProjectId = 0;
    this.AccountId = 0;
    this.Language = "";
    this.Name = "";
    this.IsUsing = false;
    this.IsShow = false;

    this.FilterValue = "";

    this.SubFilter = new SubFilter();
    this.IsHasRedirect = false;
};

function FilterModel() {
    this.Id = 0;
    this.Name = "";
    this.TypeId = 0;
    this.IsShow = false;

    this.Items = [];
    this.SearchFilter = new SearchFilter();
    this.IsShowDoneUndoneElement = true;
    this.IsHasRedirect = false;
};

//Object.defineProperty(DFilterX.prototype, "Name", {
//    get: () => this._name,
//    set: function (newVal) { this._name = newVal; this.IsShow = newVal != undefined && newVal.length > 0; }
//});

function SubFilter() {
    this.IsMain = true;
    this.IsSub = true;
    this.IsAction = true;
    this.IsActivity = true;

    this.IsMainPath = false;
    this.IsSubPath = false;
    this.IsActionPath = false;

    return this;
};

function SearchFilter() {
    this.TypeFilter = 0;
    this.Text = "";
    this.Start = null;
    this.End = null;
    this.Type = -1;
    this.RedirectId = null;
};

function showTimeX(name) {
    var now = new Date();
    console.log((name || "") + "[" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds() + "] " + now.getTimezoneOffset());
};

msFilter.validStart = function (elem) {
    var ftype = $(elem).closest("div.timefor").attr("ftype");
    var str = $(elem).val() ? $(elem).val().trim() : '';
    var newDate = vmCommon.formatStringToDate(str, kLg.language);

    if (str.length > 0 && newDate == null) {
        ShowToolTip2($(elem), kLg.msgDateInValid, "top");
        return 'validateFail';
    }

    DestroyToolTip($(elem));

    if (newDate != null) $(elem).val(kendo.toString(newDate, "d"));
    return 'validateDone';
};

msFilter.validEnd = function (elem) {
    var ftype = $(elem).closest("div.timefor").attr("ftype");
    var str = $(elem).val();
    var newDate = vmCommon.formatStringToDate(str, kLg.language);

    if (str.length > 0 && newDate == null) {
        ShowToolTip2($(elem), kLg.msgDateInValid, "top");
        return 'validateFail';
    }

    DestroyToolTip($(elem));

    if (newDate != null) $(elem).val(kendo.toString(newDate, "d"));
    return 'validateDone';
};

msFilter.getLinkSharepoint = function () {

    function getFilterLabels(selector) {
        selector = selector || '#filterCtrl';
        var filterLabel = [];
        var timeRange1 = $(`${selector} .msfilterlist thead .k-input`).first().text();
        var timeRangeS = $(`${selector} .msfilterlist thead input.fstart.k-input`).val();
        var timeRangeE = $(`${selector} .msfilterlist thead input.fend.k-input`).val();

        filterLabel.push({
            Operator: timeRange1,
            SLable: kLg.textStart, ELabel: kLg.textEnd,
            Start: timeRangeS, End: timeRangeE
        });

        $(`${selector} .msfilterlist tbody tr`).each(function () {
            let $input = $(this).find('.k-input');
            let obj = {};
            $input.each(function (index) {
                let text = $(this).text();
                if (text != '')
                    switch (index) {
                        case 0:
                            obj.Operator = text;
                            break;
                        case 1:
                            obj.ParentValue = text;
                            break;
                        case 2:
                            obj.ChildValue = text;
                            break;
                        case 3:
                            obj.ChildValue1 = text;
                            break;
                        case 4:
                            obj.ChildValue2 = text;
                            break;
                    }
            });
            filterLabel.push(obj);
        });

        return filterLabel;
    }


    return {
        fromMix: function (viewTypeId) {
            var colOptions = {
                Name: $('#chkname').is(":checked"),
                Begin: $('#chkbegin').is(":checked"),
                End: $('#chkend').is(":checked"),
                Responsibility: $('#chkresponsible').is(":checked"),
                Involvedpeople: $('#chkinvolvedpeople').is(":checked"),
                Stackholder: $('#chkstackholder').is(":checked"),
                CustomerJourney: $('#chkcustomerjourney').is(":checked"),
                Instruments: $('#chkinstrument').is(":checked"),

                Advertising: $('#chkadvertising').is(":checked"),
                Advertiser: $('#chkadvertiser').is(":checked"),

                SubjetThema: $('#chksubjetthema').is(":checked"),
                Category: $('#chkcategory').is(":checked"),
                Status: $('#chkstatus').is(":checked"),
                Field: $('#chkfield').is(":checked"),
                ExpectedCost: $('#chkexCost').is(":checked"),
                TrueCost: $('#chkacCost').is(":checked"),
                Budget: $('#chkbudget').is(":checked"),
                Description: $('#chkdescription').is(":checked"),
                ExpectedSituation: $('#chkeffect').is(":checked"),
                ArrivedSituation: $('#chkarrived').is(":checked"),
                Evaluation: $('#chkevaluation').is(":checked"),
                Diagram: $('#chkdiagram').is(":checked")
            }

            var startDate = $("#divExportSetting #txtStartDateEx").data("kendoDatePicker").value();
            var endDate = $("#divExportSetting #txtEndDateEx").data("kendoDatePicker").value();

            return {
                OptionColumn: colOptions,
                StartDate: startDate,
                EndDate: endDate,
                ViewTypeId: viewTypeId,
                FilterSnapshot: JSON.stringify(getFilterLabels()),
                TypeId: vmCommon.LinkSharepointType.MIX,
                Language: kLg.language
            }

        },

        fromRoadmap: function (viewTypeId) {

            var startDate = $("#SettingExportRM #txtStartDateEx").data("kendoDatePicker").value();   // changeHourOfDate
            var endDate = $("#SettingExportRM #txtEndDateEx").data("kendoDatePicker").value();

            return {
                StartDate: startDate,
                EndDate: endDate,
                FilterSnapshot: JSON.stringify(getFilterLabels('#msfilterpanel14')),
                ViewTypeId: viewTypeId,
                TypeId: vmCommon.LinkSharepointType.ROADMAP,
                Language: kLg.language
            };

        }

    }
};
