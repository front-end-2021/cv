var MsaComponent = {};   // Ms Actionplan Component
var actionPlanComponents = {};
var msGoalAction = msGoalAction || {};

Vue.filter("round", function (value) {
    if (value == null) return "";
    return Math.round(Number(value));
});
Vue.filter("formatcost", function (value) {
    if (value == null) return "";
    return kendo.toString(value, "##,#");
});
Vue.filter("striphtml", function (value) {
    if (value == null) return "";
    return vmCommon.TexEditor.stripHtml(value);
});

MsaComponent = (function () {
    const __rootFolder__ = 'Actionplan';
    const _marketProductFolder_ = 'MarketAndProduct';
    const _MainSubFolder_ = 'MainSub';
    const _GoalOverview_ = `${_MainSubFolder_}/ItemOverview`;
    const _ActionFolder_ = 'Action';

    Vue.component('ViewIndependence', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewIndependence.html`, template => {
            resolve({
                template: template,
                props: ['item', 'itemtype'],
                inject: ['getIsExpand', 'isDraggable', 'pushExpand',
                    'removeIndependency', 'getIsHiddenGoalContent', "getCurrentRole"],
                data() {
                    MsaApp.componentService(false).set(this.item.Id, this);
                    var isExpand = this.getIsExpand(this.item.Id, this.itemtype);

                    return {
                        IsExpand: isExpand,
                        IsDataSending: false,
                        
                    };
                },
                provide() {
                    return {
                        IsConnection: this.item.IsConnection,
                        IsSubConnection: this.item.IsSubConnection,
                        IsEditInd: this.item.IsEdit,
                        removeTheme: this.removeTheme,
                        onMenuDeleteIndependency: this.onMenuDeleteIndependency,
                        getViewType: () => false
                    }
                },
                computed: {
                    kLg() {
                        return kLg;
                    },
                    IcToggleClass() {
                        var cls = 'market-icon arrow-panel-online msa-ic-font';
                        if (this.IsExpand) cls += ' font-arrow-down';
                        else
                            cls += ' font-arrow-right';
                        return cls;
                    },
                    MasterStatus() {
                        if (this.item.MasterGoalStatus == 1) return kLg.textMasterbudget;
                        if (this.item.MasterGoalStatus == 2) return kLg.textMastergoal;
                        if (this.item.MasterGoalStatus == 3) return kLg.textMastergoalAndBudget;
                    },
                    IsHideWhenNoGoalAction() {
                        const isHideGoalContent = this.getIsHiddenGoalContent();
                        if (isHideGoalContent) {
                            // Kiem tra List Theme/ListMain/Sub/Action
                            // An di khi theme khong co Goal/Action
                        }
                        return isHideGoalContent;
                    },
                    DragdropOptions() {
                        var isDrg = this.isDraggable();
                        if (Array.isArray(this.item.ListSubIndependency) && this.item.ListSubIndependency.length < 2) {
                            isDrg = false;
                        }

                        return {
                            animation: 100, sort: true,
                            disabled: !isDrg,
                            ghostClass: "ghost",        // theme
                            chosenClass: "chosenClass",
                            direction: 'vertical'
                        }
                    },
                    GroupMIndexTheme() {
                        const id = this.item.Id;
                        return `MIndexTheme_${id}`;
                    },
                },
                mounted() {
                    MsaApp.componentService(false).set(this.item.Id, this);                    
                },
                updated() {
                    MsaApp.componentService(false).set(this.item.Id, this);
                },
                methods: {
                    removeTheme (theme) {
                        MsaApp.removeExpand(theme.Id, 'Theme');
                        const index = this.item.ListSubIndependency.indexOf(theme);
                        if (index > -1) this.item.ListSubIndependency.splice(index, 1);
                        if (this.item.ListSubIndependency.length < 1) {         // neu khong co theme 
                            this.removeIndependency(this.item);     //removeTheme
                            MsaApp.removeExpand(this.item.Id, 'Independence');
                        }
                    },
                    onClickToggleShow(e) {
                        if (this.IsDataSending) return;
                        this.IsExpand = !this.IsExpand;
                        this.IsDataSending = true;
                        const thisRef = this;
                        // call handler
                        const strId = `${this.item.Id}`;
                        if (this.IsExpand) {
                            MsaApp.pushExpand(strId, this.itemtype).then(function () {
                                thisRef.IsDataSending = false;
                            });
                        } else {
                            MsaApp.removeExpand(strId, this.itemtype).then(function () {
                                thisRef.IsDataSending = false;
                            });
                        }
                    },
                    showPopupEditIndependence(e) {
                        // đổi tên showEditOverallThread
                        const id = this.item.Id;
                        const mdf = this.item.Mdf;
                        vmPopName.Name = this.item.Name;
                        vmPopName.options = { id: id, mdf: mdf, isEdit: this.getCurrentRole() > 0 };
                        vmGoalAction.showEditNamePopUp(kLg.gaTitleEditOverallThread);
                    },
                    showPopupAddTheme(e) {           // đổi tên showAddIndependenceMenuright
                        const id = this.item.Id;        // supper theme (independence)
                        var mdf = this.item.Mdf;

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

                        if (id > 0) {       // supper theme
                            MsaApp.setMapDelegate(`showPopupAddTheme_FromSupperTheme`, {
                                NameType: 'AddTheme', IsEditTheme: false,
                                IndepencencyId: id, IndepencencyName: this.item.Name
                            });

                            vmGoalAction.parentId = id;
                            vmGoalAction.IsEditIndependency = false;
                            vmGoalAction.showAddIndependencePopup(kLg.gaLblThread, 323);
                        }
                    },
                    onMenuDeleteIndependency(e) {         // thay tên DeleteIndependency
                        const id = this.item.Id;        //supperThemeId
                        var mdf = this.item.Mdf;

                        const item = this.item;
                        var cMain = this.countAllMain();
                        
                        pConfirm(kLg.confirmDeleteIndependence).then(function () {
                            var entryData = { id: id, mdf: mdf };
                            vmGoalAction.dataservice.deleteIndependency(entryData, function (serData) {
                                if (cMain < 1) {        // khong co main nao trong vung independence nay thi remove trong list luon
                                    MsaApp.removeIndependency(item);       //onMenuDeleteIndependency
                                    MsaApp.removeExpand(id, 'Independence');
                                } else {
                                    msFilter.controlService.reLoadDataFilter();

                                    if (!vmGoalAction.checkRole(serData)) return;

                                    if (vmCommon.checkConflict(serData.value)) {
                                        MsaApp.removeExpand(id, 'Independence');
                                        MsaApp.reloadAllDataOfPage('ViewIndependence_onMenuDeleteIndependency');
                                    }
                                }
                                    
                            });
                        });
                    },
                    countAllMain() {
                        var cMain = 0;
                        const refT = this.$refs['RefViewTheme'];
                        if (Array.isArray(refT)) {
                            cMain = refT.filter(t => t.ListMain.length).length;
                        }
                        return cMain;
                    },
                    onDragStartTheme(evt) {
                        MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                        MsaApp.DragDropIndependence.LastEvent = 'onDragStartTheme';
                        MsaApp.DragDropIndependence.LstTheme = this.item.ListSubIndependency.map(ind => {
                            return {
                                Id: ind.Id, Mdf: ind.Mdf, MIndex: ind.MIndex
                            }
                        });
                    },
                    onDragChangeTheme(evt) {
                        MsaApp.DragDropIndependence.LastEvent = 'onDragChangeTheme';
                        const m = evt.moved;
                        if (m) {
                            MsaApp.DragDropIndependence.iFrom = m.oldIndex;
                            MsaApp.DragDropIndependence.iTo = m.newIndex;
                        }
                    },
                    onDragEndTheme(evt) {
                        if (MsaApp.DragDropIndependence.LastEvent == 'onDragChangeTheme') {
                            
                            const lstThe = vmCommon.deepCopy(MsaApp.DragDropIndependence.LstTheme);
                            const parentId = this.item.Id;
                            MsaApp.DragDropIndependence.IndId = parentId;

                            const srcIndex = MsaApp.DragDropIndependence.iFrom;
                            const desIndex = MsaApp.DragDropIndependence.iTo;
                            const srcObj = lstThe[srcIndex];
                            const desObj = lstThe[desIndex];
                            if (!srcObj && !desObj) return;
                            if (srcObj.Id === desObj.Id) {
                                return;
                            }
                            var pos = desIndex > srcIndex ? 1 : 0;

                            MsaApp.updateMIndexTheme(srcObj.Id, srcObj.Mdf, desObj.Id, desObj.Mdf, pos, parentId, lstThe);
                        }

                        MsaApp.DragDropIndependence.LastEvent = 'onDragEndIndependence';
                    }, 

                },
                //watch: { },
            });
        });
    });

    /* Dùng chung cho Components 
     * ViewTheme,
     * NavMenuViewTheme, NavMenuViewProductM
     */
    const mixinTheme = {
        inject: ['isViewer', 'handlerLoadding', 'canReaction'],
        methods: {
            showEditTheme(e) {
                if (this.isViewer()) return;

                const id = this.item.Id;
                var mdf = this.item.Mdf;

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
                this.handlerLoadding();

                var entryData = { id: id };
                vmGoalAction.dataservice.getIndependencyById(entryData, function (serData) {
                    if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                        var dataServer = serData.value.TheObject;
                        vmGoalAction.parentId = dataServer.ParentId;
                        vmGoalAction.IsEditIndependency = true;

                        vmGoalAction.IndepencencyOptions = {
                            Name: dataServer.Name,
                            Id: id,
                            Mdf: mdf,
                            Regions: dataServer.Regions || [],
                            SelectAllRegion: dataServer.SelectAllRegion,
                            IsMasterGoal: dataServer.IsMasterGoal,
                            IsMasterGoalKpi: dataServer.IsMasterGoalKpi,
                            CurrencyId: dataServer.CurrencyId,
                            CreatedBy: dataServer.CreatedBy,
                            IsEdit: dataServer.IsEdit,
                            IsCreater: dataServer.IsCreater,
                            Accounts: dataServer.Accounts,
                            ParentId: dataServer.ParentId
                        };

                        vmGoalAction.listRegions = vmGoalAction.IndepencencyOptions.IsCreater && vmGoalAction.IndepencencyOptions.IsEdit ? vmGoalAction.GetRegionRole(dataServer.CreatedBy, dataServer.Regions) : vmGoalAction.GetSelectedRegionRole(vmUser.currentAccount.Id, dataServer.Regions);
                        vmGoalAction.showAddIndependencePopup(kLg.gaTitleEditOverallThread, 323);//SONPT. Need edit

                        MsaApp.canReaction();
                    }
                });
            },
            gaExportService(e) {
                if (this.isViewer()) return;

                vmGoalAction.gaExportService.exportGa(undefined, this.item.Id);
            },
            gaImportService(e) {
                if (this.isViewer()) return;

                vmGoalAction.gaExportService.importGa(undefined, this.item.Id);
            },
            onMenuDeleteTheme(e) {         // thay tên DeleteIndependency
                if (this.isViewer()) return;

                const id = this.item.Id;
                var mdf = this.item.Mdf;
                const thisRef = this;

                pConfirm(kLg.confirmDeleteIndependence).then(function () {
                    var entryData = { id: id, mdf: mdf };
                    vmGoalAction.dataservice.deleteIndependency(entryData, function (serData) {
                        msFilter.controlService.reLoadDataFilter();

                        if (!vmGoalAction.checkRole(serData)) return;

                        if (vmCommon.checkConflict(serData.value)) {
                            thisRef.removeTheme(thisRef.item);
                            MsaApp.reloadAllDataOfPage('ViewTheme_onMenuDeleteTheme');
                        }
                    });
                });
            },
        }       // end methods
    }
    const mixinThemeDefault = {
        props: ['item', 'itemtype'],        // chay truoc ham beforeCreate()
        inject: ['onDragMoveGoal', 'isDraggable', 'onHoverShowTooltipAddGoalAction',
            'onDragStartMaingoal', 'onDragChangeMaingoal', 'onDragEndMaingoal', 'getGroupMain', "getViewType"],
        provide() {
            return {
                getIsMaster: () => {
                    const isMsterGoal = this.item.IsMasterGoal;
                    const isMsterKpi = this.item.IsMasterGoalKpi;
                    return {
                        MasterGoal: isMsterGoal, MasterGoalKpi: isMsterKpi
                    }
                },
                countMain: () => { return this.ListMain.length },
                getListMain: (id) => { return this.ListMain.filter(m => m.Id == id); },
                setCollapExpandAllMain: this.setCollapExpandAllMain,
                getIndependencyId: () => { return this.item.Id; },
                getRegionId: () => { return -1; },    // handler error
                getSubMarketProductId: () => { return null; },    // handler error
                getProductId: () => { return null; },    // handler error
                getSubMarketId: () => { return null; },    // handler error
                getRole: () => this.item.RoleId,
                checkRegionView: () => { return false; },
            }
        },
        //beforeCreate() { },
        data() {            // chay sau ham beforeCreate()
            return {
                IsExpand: true,
                IsDataSending: false,
                ListMain: [],
                HasRefsExpand: false,       // dung cho tinh toan khi DOM cua Main da duoc render
            };
        },
        computed: {     // chay sau ham data()
            kLg() { return kLg; },
            IcToggleClass() {
                var cls = 'market-icon arrow-panel-online msa-ic-font';
                if (this.IsExpand) cls += ' font-arrow-down';
                else
                    cls += ' font-arrow-right';
                return cls;
            },
            IcCloseAllMaingoal() {
                if (this.HasRefsExpand) return 'font-arrow-down';

                return 'font-arrow-right';
            },
            DragdropOptions() {
                const isDrg = this.isDraggable();

                return {
                    animation: 100, sort: true,
                    disabled: !isDrg,
                    ghostClass: "ghost-maingoal",        // theme
                    chosenClass: "chosenClass"
                }
            },
            ViewByNavigationMenu() {        //ViewTheme
                if (MsaApp.IsShowNavigationMenu) return false;
                return true;
            },
            ListMainDragDrop() {
                if (!this.ListMain) return [];
                const a = [...this.ListMain];
                a.push({
                    Id: vmCommon.emptyGuid, Mdf: -1, IndependencyId: this.item.Id
                });
                return a;
            },
        },
        created() {
            MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
        },
        mounted() {     // DOM ready
            if (this.IsExpand)
                this.setCollapExpandAllMain();
        },
        updated() {
            MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
            // Tinh toan get element DOM view o day
            if (this.IsExpand)
                this.setCollapExpandAllMain();

            MsaApp.getWidthUpdated();
        },
        methods: {
            setCollapExpandAllMain() {
                const refMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(refMg)) {
                    this.HasRefsExpand = refMg.filter(m => m.IsExpand).length > 0;
                }
            },
            setDataMainUpdatedMIndexAction(mGoal) {     //ViewTheme
                const refMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(refMg)) {
                    const mg = refMg.filter(m => m.IsExpand).find(m => m.goal.Id == mGoal.Id);
                    if (mg) {       // component
                        mg.goal.ListSubGoal = mGoal.ListSubGoal;
                    }
                }
            },
            getGoalActionResult: function (id) {
                var rs = [], flag = false;
                for (var i = 0; i < this.ListMain.length; i++) {
                    if (flag) break;
                    rs = [];

                    var main = this.ListMain[i];
                    if (main.IsShow > 0 && main.IsColor)
                        rs.push(main.Id);

                    if (main.Id == id) flag = true;

                    var subs = main.ListSubGoal;
                    for (var j = 0; j < subs.length; j++) {
                        var sub = subs[j];
                        if (sub.IsShow > 0 && sub.IsColor)
                            rs.push(sub.Id);

                        if (sub.Id == id) flag = true;

                        var actions = sub.ListAction;

                        for (var k = 0; k < actions.length; k++) {
                            var action = actions[k];
                            if (action.IsShow > 0 && action.IsColor)
                                rs.push(action.Id);

                            if (action.Id == id) flag = true;
                        }
                    }
                }

                return rs;
            },
            addMaingoalByNavTheme() {
                var info = {
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: null,
                    independencyId: this.item.Id,
                    isEdit: false,
                    goalType: vmCommon.GoalActionContentType.MainGoal, //vmCommon.GoalType.MainGoal,
                    parentStart: new Date()
                };
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addMaingoalByNav';
                vmGoalAction.openPopUpGoal2(info);
            },
            showAddSubGoalWithoutMainTheme(e) {
                var info = {
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: null,
                    independencyId: this.item.Id,
                    isEdit: false,
                    goalType: vmCommon.GoalActionContentType.SubGoal, //vmCommon.GoalType.SubGoalWithoutMainGoal,
                    parentId: null,
                    parentStart: new Date(),
                    parentEnd: new Date(),
                };
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addSubgoalByNav';
                vmGoalAction.openPopUpGoal2(info);
            },
            showAddActionTheme(e) {
                var info = {
                    actionId: vmCommon.emptyGuid,
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: null,
                    parentSubMarketProductId: null,
                    independencyId: this.item.Id,
                    parentStart: new Date(),
                    parentEnd: new Date(),
                    endDate: new Date(),
                    title: kLg.titlepAddAction,//kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,
                    isEdit: false
                };
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addActionByNav';
                vmGoalAction.openPopUpAction2(info);
            },
            ToggelExpandAllMailGoalTheme(e) {
                if (!this.IsExpand) return;

                const lstIds = this.ListMain.map(s => s.Id);

                const lstMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(lstMg)) {
                    MsaApp.pushLoadTimeActions('ProductCollapseExpandAllMain');

                    if (this.IcCloseAllMaingoal == 'font-arrow-right') {
                        // expand all
                        MsaApp.pushExpandListMaingoal(lstIds, true);
                        lstMg.filter(s => !s.IsExpand).filter(mg => {
                            mg.setAllExpand_Or_Collapse(true);
                            return true;
                        });

                        return;
                    }
                    // collapse all
                    MsaApp.removeExpandListMaingoal(lstIds, true);
                    lstMg.filter(s => s.IsExpand).filter(mg => {
                        mg.setAllExpand_Or_Collapse(false);
                        return true;
                    });
                }

            },
        },      // methods
    }
    Vue.component('ViewTheme', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewTheme.html`, template => {
            resolve({
                template: template,
                mixins: [mixinTheme, mixinThemeDefault],
                inject: ['getIsExpand', 'removeTheme', 'pushExpand', 'IsConnection', 'IsSubConnection', 'IsEditInd'],
                provide() {
                    return {
                        loadAllGoalActionInOpenArea: this.loadDataGoalAction,
                    }
                },
                data() {            // chay sau ham beforeCreate()
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    //actionPlanComponents[this.item.Id] = this;

                    var isExpand = this.getIsExpand(this.item.Id, this.itemtype);

                    return {
                        IsExpand: isExpand,
                    };
                },
                computed: {
                    MasterStatus() {
                        if (this.item.MasterGoalStatus == 1) return kLg.textMasterbudget;
                        if (this.item.MasterGoalStatus == 2) return kLg.textMastergoal;
                        if (this.item.MasterGoalStatus == 3) return kLg.textMastergoalAndBudget;
                    },
                },
                created() {         // duoc goi sau cac ham: data, computed properties, methods, watchers
                    this.loadDataGoalAction();
                },
                mounted() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                },
                methods: {
                    onClickToggleShow(e) {              //ViewTheme
                        if (this.isViewer()) return;
                        this.handlerLoadding();

                        const _isEx = !this.IsExpand;
                        this.IsExpand = _isEx;

                        // call handler
                        const strId = `${this.item.Id}`;
                        if (_isEx) {
                            MsaApp.pushExpand(strId, this.itemtype).then(function () {
                                MsaApp.canReaction();
                            });

                            this.loadDataGoalAction();       // reload lai data
                        } else {

                            MsaApp.removeExpand(strId, this.itemtype).then(function () {
                                MsaApp.canReaction();
                            });
                        }
                    },
                    loadDataGoalAction() {
                        return new Promise(resv => {
                            const independencyId = this.item.Id;
                            const isConnection = this.item.IsConnection;
                            const isSubConnection = this.item.IsSubConnection;
                            const entry = {
                                independencyId: independencyId,
                                isConnection: isConnection,
                                isSubConnection: isSubConnection,
                                filterObject: msFilter.controlService.getQueryFilter(vmCommon.FilterType.ActionPlan)
                            };

                            const lst_Main = this.ListMain;         // REF
                            const updateListEvalXYZ = this.$root.updateListEvalXYZ; // ref function
                            vmGoalAction.dataservice.getGoalViewByIndependencyWithoutFilter(entry, function (theData) {
                                if(!theData) return;
                                const sData = theData.value
                                if (typeof updateListEvalXYZ == 'function') updateListEvalXYZ(sData.ListEval);
                                var lstMain = sData.ListMain;       // ref
                                if(!lstMain.length) return;
                                lst_Main.splice(0);
                                lstMain.forEach(m => {
                                    lst_Main.push(m);
                                });
                                if (!MsaApp.MapListMain.has(`${independencyId}`)) {
                                    MsaApp.MapListMain.set(`${independencyId}`, lstMain);
                                } else {
                                    const mL = MsaApp.MapListMain.get(`${independencyId}`);
                                    mL.splice(0);       // remove all item
                                    lstMain.forEach(m => {
                                        mL.push(m);
                                    });
                                }
                                resv(lstMain);
                            });
                        });

                    },
                },      // end method
            });
        });
    });
    Vue.component('NavMenuViewTheme', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewTheme.html`, template => {
            resolve({
                template: template,
                mixins: [mixinTheme, mixinThemeDefault],
                provide() {
                    return {
                        loadAllGoalActionInOpenArea: () => { },
                    }
                },
                computed: {
                    MasterStatus() {
                        if (this.item.IsMasterGoalKpi && this.item.IsMasterGoal)
                            return kLg.textMastergoalAndBudget;
                        if (this.item.IsMasterGoal) return kLg.textMasterbudget;
                        if (this.item.IsMasterGoalKpi) return kLg.textMastergoal;
                    },
                    ViewByNavigationMenu() {        //NavMenuViewTheme
                        if (MsaApp.IsShowNavigationMenu) return true;
                        return false;
                    },
                },
                beforeMount() {
                    this.updateListMain();
                },
                beforeUpdate() {
                    this.updateListMain();
                },
                methods: {
                    removeTheme() { },
                    pushExpand() { },
                    onClickToggleShow(e) { },
                    updateListMain() {
                        const tId = this.item.Id;
                        const lst_Main = this.ListMain;
                        const th = MsaApp.NavigationMenuView.find(i => i.Id == tId);
                        if (th) {
                            lst_Main.splice(0);
                            th.ListMainGoal.filter(g => { lst_Main.push(g); });
                        }
                    },
                    getDataContentRightView() {
                        var itemPI = this.item;
                        const entryData = {
                            IndependencyId: parseInt(itemPI.Id)
                        };

                        return new Promise((resl) => {
                            vmGoalAction.dataservice.getGoalActionContentByArea(entryData, function (res) {
                                if (res.value) {
                                    itemPI = res.value.Data;
                                    itemPI.IsShow = true;
                                    itemPI.ViewRightType = 'SubgoalTheme';
                                    itemPI.RoleId = res.value.RoleId;
                                    MsaApp.pushNavigationMenuView(itemPI, 'ViewProductTheme');
                                    resl();
                                }
                            });
                        });
                    },
                },      // end method
            });
        });
    });


    Vue.component('ViewAction', (resolve) => {
        $.get(`${__rootFolder__}/${_ActionFolder_}/ViewAction.html`, template => {
            resolve({
                template: template,
                props: ['item', 'hasSearchTypeCritias'],
                inject: ['showPopupAddAction', 'HoverTooltipStatusProtocol', 'countAction',
                    'getView_TitleSubAction', 'getDataContentRightView', 'getChildrenGa',
                    'getIsOverdue', 'getIsCheckActionDate', 'getParentStartDate', 'getParentEndDate', 'countSub',
                    'getEndDateSubgoal', 'is_ReduceSize', 'hasAddNewBtn', 
                    'getRegionId', 'getProductId', 'getSubMarketId', 'getIsMaster', "getRole", "getViewType"],
                data() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    return {
                        delay: 700,
                        clicks: 0,
                        timer: null,
                        isExpandReduce: MsaApp.actionReduceExpandService().isExpand(this.item.Id),
                        isShowMenu: false,
                    };
                },
                created() {
                    
                },
                computed: {
                    kLg() {
                        return kLg;
                    },
                    LastActiveClass() {
                        var isLastFocus = MsaApp.getLastActiveElementId() == this.item.Id;
                        if (isLastFocus) return 'last-active-element';
                        
                        return '';
                    },
                    ContainFilterResult() {
                        return this.item.IsShow > 0 && this.item.IsColor ? "finish-element-style" : "";
                    },
                    TodoPercentAction() {
                        var TodoPercentAction;
                        if (this.item.TodoPercent != null) {
                            TodoPercentAction = this.item.TodoPercent + '%';
                        }
                        return TodoPercentAction;
                    },
                    ColorApEvaluation() {
                        var x = this.item.ApEvaluation;
                        return ChoseColorPercent(x);
                    },
                    ColorKpi() {
                        var ColorKpi = "";
                        if (this.item.KpiOverViewPercent < 49.5) {
                            ColorKpi = "msa-kpi-bg60";
                        } else if (this.item.KpiOverViewPercent <= 69.49) {
                            ColorKpi = "msa-kpi-bg60-80";
                        } else {
                            ColorKpi = "msa-kpi-bg80";
                        }
                        return ColorKpi;
                    },
                    Kpi() {
                        var arrow = "";
                        if (this.item.KpiOverView == 1) {
                            arrow = 'kpi-overview-up';
                        } else if (this.item.KpiOverView == 2) {
                            arrow = 'kpi-overview-equal';
                        } else if (this.item.KpiOverView == 3) {
                            arrow = 'kpi-overview-down';
                        } else {
                            arrow = '';
                        }

                        var bg = "";
                        if (this.item.KpiOverViewPercent < 70.51) {
                            bg = 'kpi-overview-bgdown';
                        } else if (this.item.KpiOverViewPercent < 99.5) {
                            bg = 'kpi-overview-bgequal';
                        } else {
                            bg = 'kpi-overview-bgup';
                        }
                        var color = "";
                        if (this.item.KpiOverViewPercent < 49.5) {
                            color = "msa-kpi-bg60";
                        } else if (this.item.KpiOverViewPercent <= 69.49) {
                            color = "msa-kpi-bg60-80";
                        } else {
                            color = "msa-kpi-bg80";
                        }

                        return {
                            Arrow: arrow,
                            Bg: bg,
                            Color: color
                        }
                    },
                    ColorTodoPercent() {
                        var ColorTodoPercent = "";
                        if (this.item.TodoPercent < 49.5) {
                            ColorTodoPercent = "msa-kpi-bg60";
                        } else if (this.item.TodoPercent <= 69.49) {
                            ColorTodoPercent = "msa-kpi-bg60-80";
                        } else {
                            ColorTodoPercent = "msa-kpi-bg80";
                        }
                        return ColorTodoPercent;
                    },
                    StartDate() {
                        if (!this.item.Start) return '';
                        const s = this.item.Start.jsonToDate();
                        return kendo.toString(s, "d");
                    },
                    EndDate() {
                        if (!this.item.End) return '';
                        const e = this.item.End.jsonToDate();
                        return `  ${kendo.toString(e, "d")}`;
                    },
                    DescriptionTexEditor() {
                        return vmCommon.TexEditor.stripHtml(this.item.Description);
                    },
                    IsActionOverdue() {         // ctrl+f IsGoalOverDue
                        const action = this.item;
                        if (!this.getIsOverdue()) return false;
                        if (!action.End || action.Finish) return false;
                        if (action.IsOverdue) return true;
                        if (vmCommon.compareDate(new Date(), action.End.jsonToDate()) != 1)
                            return false;
                        return true;
                    },
                    cssActionFinished() {
                        return this.item.Finish ? "action-finished-color" : "";
                    },
                    isWrongDate() {
                        if (!this.getIsCheckActionDate()) return '';
                        if (!this.getParentStartDate()) return '';
                        const startDate = this.item.Start,
                            endDate = this.item.End;
                        if (!startDate && !endDate) return '';
                        const parentSDate = this.getParentStartDate().jsonToDate();
              
                        var isStart = !startDate ? true : vmCommon.compareDate2(startDate.jsonToDate(), parentSDate) >= 0,
                            isEnd = true;
                        let isGoalEndDate = true;
                        if (!this.getParentEndDate()) isGoalEndDate = false;

                        if (isStart && endDate && isGoalEndDate) {
                            const parentEDate = this.getParentEndDate().jsonToDate();
                            isEnd = vmCommon.compareDate2(parentEDate, endDate.jsonToDate()) >= 0;
                        }
                        return !(isStart && isEnd);
                    },
                    cssDate: function () {
                        return this.isWrongDate ? "wrongdate" : this.item.Finish ? "action-finished-color" : "";
                    },
                    cssWrongDate() {
                        return this.isWrongDate ? "wrongdate" : "";
                    },
                    IdDirect() {
                        if (MsaApp.IsShowNavigationMenu)
                            return `nav_${this.item.Id}`;
                        return this.item.Id;
                    },
                    HasFileAssigned() {
                        var isShowFile = (!this.item.Finish && this.item.IsColor) || (this.item.Finish || !this.item.IsColor);
                        return isShowFile && this.item.AssignFile > 0;
                    },
                    DirectionId() {
                        return this.item.Id;
                    },
                    bindiconassignfile() {
                        var iconAssignfile = "";
                        if (this.HasFileAssigned) {
                            iconAssignfile = "icon-assignfile-finish";
                        }
                        return iconAssignfile;
                    },
                    
                    setcoloricon() {
                        return this.item.HasMasterLink ? "icon-url-red" : "icon-url";
                    },
                    StyleIconAddAction() {
                        var CheckColumn = this.item.ActionPlanColumnId > 0;
                        return {
                            left: CheckColumn ? '155px' : '287px',
                            bottom: CheckColumn ? '-42px' : '205px'
                        }
                    },
                    IsReminder() {
                        return this.item.CheckReminder > 0 && ((!this.item.Finish && this.item.IsColor) || (this.item.Finish || !this.item.IsColor));
                    }
                },
                mounted() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    this.reloadConnection();

                    this.checkLastActiveAndScrollXY();
                },
                updated() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    this.reloadConnection();
                   // Tinh toan get elemnt DOM view o day

                    if (MsaApp.isLastLoadTimeAction('vmEditActionDataserviceUpdateAction')) {
                        const lstId = MsaApp.getLastActiveElementId();
                        if (lstId == this.item.Id) {
                            const slt = !MsaApp.IsShowNavigationMenu ? `[direction-id=${lstId}]` : `[direction-id=nav_${lstId}]`;
                            if ($(slt).length) {
                                MsaApp.scrollXY2Action(lstId, function () {
                                    MsaApp.pushLoadTimeActions('checkDone_ScrollTo_Action');
                                });
                            }
                        }
                    }

                },
                methods: {
                    checkLastActiveAndScrollXY() {
                        switch (true) {
                            case MsaApp.isLastLoadTimeAction('vmGoalAction.dataservice.loadDataFirstTime'):     // tai trang lan dau tien
                            case MsaApp.isLastLoadTimeAction('vmEditActionDataserviceCreateAction'):        // tao moi action
                            case MsaApp.isLastLoadTimeAction('vmEditActionDataserviceCloneAction'):        // duplicate action
                                const lstId = MsaApp.getLastActiveElementId();
                                if (lstId == this.item.Id) {
                                    MsaApp.scrollXY2Action(lstId, function scrollDone() {
                                        MsaApp.pushLoadTimeActions('checkDone_ScrollTo_Action');
                                    });
                                }
                                break;
                        }
                    },
                    reloadConnection: function () {
                        var linkControl = vmCommon.deepCopy(MsaApp.apLinkService().getInfo());
                        if (linkControl.goalActionId) {
                            var id = this.item.Id;
                            var typeid = vmCommon.GoalActionContentType.Action;
                            var areaid = this.item.IndependencyId || this.item.SubMarketProductId;

                            if (linkControl.areaId == areaid && linkControl.goalActionTypeId == typeid && linkControl.goalActionId == id) {
                                if (!linkControl.isCollapse)
                                    MsaApp.apLinkService().open(areaid, typeid, id);
                            }
                        }
                    },
                    toggleExpandReduce: function () {
                        if (this.isExpandReduce)
                            MsaApp.actionReduceExpandService().close(this.item.Id);
                        else
                            MsaApp.actionReduceExpandService().open(this.item.Id);

                        this.isExpandReduce = !this.isExpandReduce;
                    },
                    showPopupAddActionInAction(e) {                 // Co cac truong hop Khong column/co column/tick checkbox redusize/khong tick checkbox
                        this.showPopupAddAction(e, this.item.ActionPlanColumnId);
                    },
                    onMouseOverShowOverdue(target) {
                        $(target).tooltip({ trigger: "hover" }).tooltip("show");
                    },
                    onMouseOverCheckShowWrongdate(target) {
                        var $target = $(target);
                        if (!$target.hasClass('dnbOnOverCheckShowWrongdate')) {
                            $target = $target.closest('.dnbOnOverCheckShowWrongdate');
                        }
                        $target.tooltip("destroy");
                        if (this.isWrongDate) {
                            $target.attr("title", kLg.msgNotCorrespondingDate);
                            $target.tooltip({ trigger: "hover" }).tooltip('show');
                        } else {
                            $target.attr("title", "");
                        }
                    },
                    onMouseLeaveMenuAction(e) {
                        MsaApp.hideAllMenuDropdown();
                    }, 
                    getCustomConnect(element, connections) {
                        var e = Object.assign({
                            productid: 0, parentid: 0
                        }, element);
                        
                        var temp;
                        if (!this.item.IndependencyId) {
                            temp = $.grep(connections, function (item) {
                                return (item.Type === 1 && item.SubProductId !== Number(e.parentid)) || (item.Type === 2 && item.SubProductId !== Number(e.productid));
                            });
                        } else {
                            temp = connections;
                        }

                        var newId = 1;
                        temp.forEach(item => {
                            item.Id = newId++;
                        });
                        return temp;

                    },
                    clickEditAction(e) {
                        var info = {
                            actionId: this.item.Id,
                            subMarketProductId: this.item.SubMarketProductId,
                            independencyId: this.item.IndependencyId,
                            parentId: this.item.GoalId,
                            isEdit: true
                        };
                        if (this.item.ActionPlanColumnId > 0) {       // co column
                            info.title = kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2;
                        } else {
                            info.title = kLg.titlepEditMainGoalNew1 + htmlEscape(this.getView_TitleSubAction()) + kLg.titlepEditMainGoalNew2;
                        }
                        vmGoalAction.openPopUpAction2(info);
                    },
                    onMenuDuplicateAction(e) {
                        const lstAct = this.getChildrenGa();    // ref array
                        const newA = vmCommon.deepCopy(this.item);
                        const newId = vmCommon.newGuid();
                        newA.Id = newId; newA.GetId = newId;
                        lstAct.push(newA);
                        this.isShowMenu = false;
                        return;
                        var actionId = this.item.Id;
                        var mdf = this.item.Mdf;
                        if (actionId == null || actionId == vmCommon.emptyGuid || !(mdf >= 0)) return;
                        var url = "../Handlers/MsGoalAction.ashx?funcName=cloneaction&projid=" + projectId + "&strid=" + strategyId;
                        var dataEntry = { actionId: actionId, mdf: mdf };
                        callAjax("loading-goalaction", url, dataEntry, function (data) {
                            var newActionId = data.value;
                            if (newActionId != vmCommon.emptyGuid) {      // success
                                MsaApp.setLastActiveElement(newActionId);
                                MsaApp.pushLoadTimeActions('vmEditActionDataserviceCloneAction');
                                MsaApp.updateDataProductOrTheme_Expand_InView_Observer();
                            } else {        // conflict
                                pAlert(kLg.msgConflickData).then(function () {
                                    MsaApp.updateDataProductOrTheme_Expand_InView_Observer();   
                                });
                            }
                        }, AjaxConst.PostRequest);                        
                    },
                    DeleteAction(e) {
                        var actionId = this.item.Id;
                        //var mdf = this.item.Mdf;                        
                        var titleAction = "";
                        const lstAct = this.getChildrenGa();    // ref array
                        pConfirm(kLg.confirmDeleteAc1 + titleAction + kLg.confirmDeleteAc2).then(function () {
                            const lstAcId = lstAct.map(a => a.Id);
                            const i = lstAcId.indexOf(actionId);
                            if(i > -1) {
                                lstAct.splice(i, 1);
                            }
                            // var entryData = { actionId: actionId, mdf: mdf };
                            // vmGoalAction.dataservice.deleteAction(entryData, function () {
                            //     MsaApp.reloadAllDataOfPage();       //[ViewAction].DeleteAction

                            //     msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, () => { });
                            //     if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                            //         MsaApp.deleteEvalXYZ(entryData.actionId)
                            //     }
                            // });
                        });
                        
                    },
                    GetFileDOCXAction(e) {
                        return;
                        var id = this.item.Id;
                        var type = vmCommon.GoalActionContentType.Action;
                        var entry = { Id: id, TypeId: type };
                        vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                            var state = res.value.ResultStatus;
                            var fileInfo = res.value.TheObject;
                            if (state == vmCommon.ResultState.SUCCESS) {
                                vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                            }
                        });
                    },
                    dblclickEditAction(e) {
                        MsaApp.hideAllTooltipDes();     //dblclickEditAction

                        if ($(e.parentElement).hasClass('kpi-percent')) return;
                        if ($(e.parentElement).hasClass('kpi-overview')) return;

                        this.clickEditAction(e);
                    },
                    openPopUpFileAssignAction() {
                        vmFile.openFileAsignCrm(this.item.Id, "action");
                    },                    
                    showSubActionDescription(e) {
                        var item = this.item || {};
                        var currency = this.item.CurrencyName || '';
                        var actionCosts = item.ActionCosts && item.ActionCosts.length > 0 ? item.ActionCosts : [{ ExpectedCost: 333, ActualCost: 123 }];
                        var actionTodos = item.ActionTodos && item.ActionTodos.length > 0 ? item.ActionTodos : undefined;
                        var dataObj = {
                            ActionCosts: actionCosts,
                            ActionTodos: actionTodos
                        }
                        var tooltipContent = buildSubActionDescription(dataObj, currency);
                        if (tooltipContent) {
                            $(e.target).kendoTooltip({
                                autoHide: true,
                                hide: function (e) { e.sender.destroy(); },
                                position: "top",
                                content: tooltipContent
                            });

                            $(e.target).trigger('mouseenter');
                        }
                    },
                    UpdateActionFinish(e) {
                        if (this.getRole() < vmCommon.MemberRole.Edit) return;
                        var actionId = this.item.Id;
                        var isFinish = !this.item.Finish;
                        var mdf = this.item.Mdf;
                        const indId = this.item.IndependencyId;
                        const smpId = this.item.SubMarketProductId;
                        const that = this;
                        var entryData = { id: actionId, finish: isFinish, mdf: mdf };
                        vmGoalAction.dataservice.updateActionFinish(entryData, function (serData) {
                            if (!vmGoalAction.checkRole(serData)) return;
                            if (vmCommon.checkConflict(serData.value)) {
                                MsaApp.setLastActiveElement(actionId);

                                that.getDataContentRightView(smpId, indId);
                            }
                        });
                        
                    },
                    gotoConnectionLink() {
                        return;
                        var id = this.item.Id;
                        var typeid = vmCommon.GoalActionContentType.Action;
                        var areaid = this.item.IndependencyId || this.item.SubMarketProductId;
                        MsaApp.apLinkService().open(areaid, typeid, id);
                    },
                    onclickDetailkpiAction(e) {
                        return;
                    },
                    onTooltipkpiTodo(e) {                        
                        let tooltipContent = buildSubActionDescription({ ActionTodos: this.item.ActionTodos, IsShowFinish: true });
                        if (tooltipContent) {
                            $(e.target).kendoTooltip({
                                autoHide: true,
                                hide: function (e) { e.sender.destroy(); },
                                position: "top",
                                content: tooltipContent
                            });
                            $(e.target).trigger('mouseenter');
                        }
                    },
                    dblclickApEvarluation(e) {          //ViewAction
                        var actionId = this.item.Id;
                        var IndependencyId = this.item.IndependencyId;
                        var productId = this.getProductId();
                        var SubMarketProductId = this.item.SubMarketProductId;
                        var info = {
                            CurrencyName: this.item.CurrencyName,
                            IndependencyId: IndependencyId,
                            IsMasterGoal: this.getIsMaster().MasterGoal,
                            productId: productId,
                            RegionId: this.getRegionId(),
                            SubMarketId: this.getSubMarketId(),
                            SubMarketProductId: SubMarketProductId
                        };
                        vmCommon.DblClickApEvalRegionRole = this.getRole();
                        const that = this;
                        var entryData = { actionId: actionId, independencyId: IndependencyId, subMarketProductId: info.SubMarketProductId };
                        var objectType = vmCommon.GoalActionContentType.Action;
                        
                        vmGoalAction.dataservice.getAction(entryData, function (serData) {
                            if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                vmGoalAction.showPopupGoalActionEval_Edit(serData.value, objectType);
                                vmGoalAction.goalActionEvalOptions.cb = function () {
                                    that.getDataContentRightView(info.SubMarketProductId, info.IndependencyId);
                                };
                            }
                        });
                    },
                    clickApEvarluation(target) {
                        const tlp = this.$root.initAndShowEvarluationXYZ;
                        if (typeof tlp == 'function' && !vmCommon.IsShowTooltipChartEvalXYZ) {
                            const item = this.item;
                            tlp($(target), item.Id, item.Color);
                        }
                    },
                    ExpandReduce(e) {
                        var that = this;
                        that.isExpandReduce = !that.isExpandReduce;
                        if (this.isExpandReduce) {
                            $(e.target).css({ 'transform': ' scale(-1)', "margin- top": "-1px" });
                        } else {
                            $(e.target).css({ 'transform': ' scale(1)', "margin- top": "2px" });
                        }
                    },
                    mouseoverReduce(e) {
                        var $k = $(e.target).find('.iconmenu-reduce');
                        $k.addClass('font-arrow-down');
                        
                    },
                    mouseleaveReduce(e) {
                        var $k = $(e.target).find('.iconmenu-reduce');
                        $k.removeClass('font-arrow-down');
                    },
                    toggleMenu() {
                        this.isShowMenu = !this.isShowMenu;
                    },
                    mouseleaveMenuReduce(e) {
                        if (this.isShowMenu) {
                            this.isShowMenu = !this.isShowMenu;
                        }
                    },
                    onHoverShowTooltipAddAction(e) {
                        var actTlt = this.item.ActionPlanColumnId > 0 ? kLg.labelActionName : this.getView_TitleSubAction();
                        var des = kLg.strAddFormat.format(actTlt);
                        const target = e.target;
                        $(target).popover('destroy');
                        MsaApp.onHoverShowTooltipAddGoalAction(target, des, 'top');
                    },
                    onHoverShowTooltipNameDes(e) {
                        var $elm = $(e.target);
                        const $tt = $elm.closest('.TooltipFullAction');
                        const tt = $tt.data("kendoTooltip");
                        const item = this.item;
                        const isLongName = item.Name.length > 50 && this.is_ReduceSize();

                        var isEmptyB = !isLongName && !item.Description && !item.ExpectedEffect && !item.ActualEffect && !item.OccuredEffect && !item.ActionActualEffect;
                        
                        if ($elm.hasClass('dnbIgnoreShowTooltipNameDes') || $elm.closest('.dnbIgnoreShowTooltipNameDes').length || isEmptyB) {
                            if (tt) tt.destroy();
                            return;
                        }

                        if (tt || isEmptyB)
                            return;

                        const tooltipObj = {
                            Name: isLongName ? item.Name : null,
                            Description: item.Description,
                            ExpectedEffect: item.ExpectedEffect,
                            ActualEffect: item.ActualEffect,
                            OccuredEffect: item.OccuredEffect,
                            ActionActualEffect: item.ActionActualEffect
                        };

                        MsaApp.initAndShowKendoTooltip(tooltipObj, $tt);        //ViewAction

                    },
                }
            });
        });
    });
    Vue.component('GoalOverview', (resolve) => {
        $.get(`${__rootFolder__}/${_GoalOverview_}/GoalOverview.html`, template => {
            resolve({
                template: template,
                props: ['item'],        // main/sub goal
                inject: ['HoverTooltipStatusProtocol', 'MainOverViewAddSubGoal', 'pEditMenuGoal',
                    'onMenuSortAction', 'duplicateMainSub', 'pExportDocxMainSub', 'getProductId',
                    'pGotoMixfromMainSub', 'pGotoRoadmapfromMainSub', 'AddnewColumn', 'getIsMaster',
                    'deleteGoal', 'expandApLinkOverviewUrl', 'isEditMain', 'checkRegionView',
                    'getView_TitleSubAction', 'showPopupAddAction', 'getColumnId', 'getRole',
                    'onMouseOverCheckShowExceededCost', 'getCssExceedCost', 'showTooltipMainSub', 
                    'getIsOverdue', 'getIsCheckActionDate', 'getParentMainStartDate', 'getMainEndDate',
                    'onClickOpenMenu', 'setSubgoalReduceSize', 'isRegionOverView',
                    'getMaingoalValueCosto', 'getMaingoalId'],
                data() {
                    return {
                        IsMenuShow: false
                    };
                },
               // created() { },
                computed: {
                    isShow() {
                        return this.item.Name && this.item.IsShow > 0;
                    },
                    kLg() { return kLg; },
                    IsMain() { return !!this.item.ListSubGoal; },
                    TypeId() {
                        if (this.IsMain) return vmCommon.GoalActionContentType.MainGoal;
                        return vmCommon.GoalActionContentType.SubGoal;
                    },
                    TextDescription() {
                        const txt = this.item.Description;
                        return vmCommon.TexEditor.stripHtml(txt);
                    },
                    ViewCurrencyName() {
                       // if (this.item.MasterCurrency) return this.item.MasterCurrency;
                        return this.item.CurrencyName;
                    },
                    ViewBudget() {
                        if (!this.item.Budget) return '';
                        return vmCommon.formatCost(this.item.Budget);
                    },
                    ViewMarkBudget() {
                        if (!this.item.MarkBudget) return '';
                        return vmCommon.formatCost(this.item.MarkBudget);
                    },
                    ValueCosto() {
                        if (this.IsMain) {
                            return vmCommon.formatCost(this.getMaingoalValueCosto(this.item));
                        }
                        return vmCommon.formatCost(this.item.Budget - this.item.ExpectedCost);
                    },
                    ViewExpectedCost() {
                        if (!this.item.ExpectedCost) return '';
                        return vmCommon.formatCost(this.item.ExpectedCost);
                    },
                    ViewActualCost() {
                        if (!this.item.ActualCost) return '';
                        return vmCommon.formatCost(this.item.ActualCost);
                    },
                    ViewEndDate() {
                        if (!this.item.Date) return '';
                        const e = this.item.Date.jsonToDate();
                        return ` — ${kendo.toString(e, "d")}`;
                    },
                    ViewStartDate() {
                        if (!this.item.StartDate) return '';
                        const s = this.item.StartDate.jsonToDate();
                        return kendo.toString(s, "d");
                    },
                    MenuTxtAddSubgoal() {               // kLg.titlepAddSubGoal
                        if (!this.IsMain) return '';        // Subgoal => return;
                        
                        var title = this.getView_TitleSubAction();
                        return kLg.strAddFormat.format(title);
                    },
                    MenuTxtAddAction() {               // kLg.titlepAddAction
                        if (this.IsMain) return '';     // Maingoal => return
                        
                        var title = this.getColumnId() > 0 ? kLg.labelActionName : this.getView_TitleSubAction();
                        return kLg.strAddFormat.format(title);
                    },
                    classLinkMasterLink() {
                        if (this.item.HasMasterLink) {
                            return "icon-url-red";
                        } else {
                            return "icon-url";
                        }
                    },
                    classFinished() {
                        if (this.item.Finish) return 'dnb_goalaction-finished';
                        return ''
                    },
                    IsGoalOverDue() {
                        const goal = this.item;
                        if (!this.getIsOverdue()) return false;
                        if (!goal.Date) return false;
                        if (goal.Finish) return false;

                        const startD = goal.Date;
                        if (vmCommon.compareDate(new Date(), startD.jsonToDate()) != 1) return false;

                        return true;
                    },
                    CssWrongDate() {
                        if (this.IsMain) return '';
                        if (!this.getIsCheckActionDate()) return '';
                        if (!this.getParentMainStartDate()) return '';
                        const startDate = this.item.StartDate,
                            endDate = this.item.Date;
                        if (!startDate && !endDate) return '';
                        const parentSDate = this.getParentMainStartDate().jsonToDate();
                 
                        var isStart = !startDate ? true : vmCommon.compareDate2(startDate.jsonToDate(), parentSDate) >= 0,
                            isEnd = true;
                        let isGoalEndDate = true;
                        if (!this.getMainEndDate()) isGoalEndDate = false;

                        if (isStart && endDate && isGoalEndDate) {
                            const parentEDate = this.getMainEndDate().jsonToDate();
                            isEnd = vmCommon.compareDate2(parentEDate, endDate.jsonToDate()) >= 0;
                        }
                        return (isStart && isEnd) ? '' : 'wrongdate';
                    },
                    CssMarkBudget() {
                        if (this.item.MarkBudget && this.item.MarkBudget < 0) {
                            return "negative-cost";
                        }
                        return '';
                    },
                    StyleFinish() {
                        if (this.item.Finish) {
                            return { color: '#c1c1c1'}
                        }
                    },
                    StyleSafari() {
                        const isS = vmCommon.getCurrentBrowser() == vmCommon.Browser.Safari;
                        if (isS) {
                            const isM = this.IsMain;
                            return {
                                H5: { position: 'relative', width: '188px' },
                                FixFloat: {
                                    height: '24px', width: isM ? '50px' : '33px',
                                    marginBottom: '-22px', position: 'absolute', right: '-2px',
                                    backgroundColor: isM ? '#e4f5da' : 'white'
                                }
                            }
                        }
                        return {
                            FixFloat: {
                                width: '30px', height: '30px',
                                float: 'right', marginRight: '20px'
                            }
                        }
                    },
                },
                mounted() { 
                    this.checkLastActiveAndScrollY2Goal();
                },
                beforeUpdate() {
                   // set data o day
                },
                updated() {                     
                    if (MsaApp.isLastLoadTimeAction('vmEditGoalDataserviceUpdateGoal')) {
                        const lstId = MsaApp.getLastActiveElementId();
                        if (lstId == this.item.Id) {
                            const slt = !MsaApp.IsShowNavigationMenu ? `[direction-id=${lstId}]` : `[direction-id=nav_${lstId}]`;
                            if ($(slt).length) {
                                if (MsaApp.isElementHtmlOutofViewY(slt)) {
                                    MsaApp.scrollY(slt, /* GoalOverview.updated */
                                        function scrollDone() {
                                            MsaApp.pushLoadTimeActions('MsaApp_Done_scrollXY2Element');
                                        });
                                } else {
                                    MsaApp.pushLoadTimeActions('isElementHtmlIntofViewY');
                                }
                            }
                        }
                    }
                },
                methods: {
                    checkLastActiveAndScrollY2Goal() {
                        switch (true) {
                            case MsaApp.isLastLoadTimeAction('vmGoalAction.dataservice.loadDataFirstTime'): // tai trang lan dau tien
                            case MsaApp.isLastLoadTimeAction('vmEditGoalDataserviceCreateGoal'):            // Tao moi goal
                            case MsaApp.isLastLoadTimeAction('vmGoalActionDataserviceDuplicateGoal'):       // duplicate goal
                            case MsaApp.isLastLoadTimeAction('changeGoalLevel_Main_Sub'):             // drag drop sub => main
                                const lstId = MsaApp.getLastActiveElementId();
                                if (lstId == this.item.Id) {
                                    const slt = !MsaApp.IsShowNavigationMenu ? `[direction-id=${lstId}]` : `[direction-id=nav_${lstId}]`;
                                    if (!$(slt).length) return;
                                    if (MsaApp.isElementHtmlOutofViewY(slt)) {
                                        MsaApp.scrollY(slt, /* GoalOverview.mounted */
                                            function scrollDone() {
                                                MsaApp.pushLoadTimeActions('MsaApp_Done_scrollXY2Element');
                                            });
                                    } else {
                                        MsaApp.pushLoadTimeActions('isElementHtmlIntofViewY');
                                    }
                                }
                                break;
                        }
                    },
                    onMouseleaveHideMenu(e) {
                        MsaApp.hideAllMenuDropdown();
                        if (!this.IsMain) {     // subgoal
                            const $target = $(e.target).closest('.dnbWrapperGoal');
                            $target.css({ 'z-index': '' });
                        }
                    },
                    onMouseOverShowOverdue(target) {
                        $(target).tooltip({ trigger: "hover" }).tooltip("show");
                    },
                    onMouseOverCheckShowWrongdate(target) {
                        var $target = $(target);
                        if (!$target.hasClass('dnbOnOverCheckShowWrongdate')) {
                            $target = $target.closest('.dnbOnOverCheckShowWrongdate');
                        }
                        $target.tooltip("destroy");

                        if (this.CssWrongDate) {
                            $target.attr("title", kLg.msgNotCorrespondingDate);
                            $target.tooltip({ trigger: "hover" }).tooltip('show');
                        } else {
                            $target.attr("title", "");
                        }
                    },
                    addNewColumn(e) {
                        if (typeof this.AddnewColumn == 'function') {
                            this.AddnewColumn(e);
                        }
                    },
                    onToggleReduceSize(e) {         //GoalOverview (Toggle view small)
                        if (this.IsMain) return;
                        var that = this;
                        const isReduce = !that.item.IsReduceSize
                        this.setSubgoalReduceSize(this.item, isReduce);
                    },
                    onMenuEditMainSub() {
                        if (!this.item.IsShow) return;
                        const mgId = this.getMaingoalId();
                        var title = (this.IsMain) ? MsaApp.getMaingoalTitle(mgId) : MsaApp.getSubgoalTitle(mgId);
                        const _item = vmCommon.deepCopy(this.item);
                        if (!this.IsMain) {        // subgoal
                            _item.ParentId = mgId;
                        }
                        this.pEditMenuGoal(_item, title);
                    },
                    onMenuShowPopupAddAction(e) {               // add action tu menu (lay columnId dau tien)
                        const columnId = this.getColumnId();        //ActionPlanColumnId
                        this.showPopupAddAction(e, columnId);

                    },
                    onMouseOverShowTooltip(e) {                     //GoalOverview            //onMouseOverHideTooltip
                        if (MsaApp.DragDropGoal.LastEvent != '') return;
                        const $target = $(e.target);

                        const item = this.item;
                        const $elm = $target.closest('.TooltipFullMaingoal');

                        this.showTooltipMainSub(item, $elm);

                    },
                    onMouseOverHideTooltip(e) {     //GoalOverview
                        const $target = $(e.target);
                        const $elm = $target.closest('.TooltipFullMaingoal');
                        var tt = $elm.data("kendoTooltip");
                        if (tt) tt.destroy();     //dnbIgnoreShowTooltipNameDes
                    },
                }
            });
        });
    });
    Vue.component('ColumnItem', (resolve) => {
        $.get(`${__rootFolder__}/${_MainSubFolder_}/ColumnItem.html`, template => {
            resolve({
                template: template,
                props: ['item', 'Date', 'hasSearchTypeCritias'],
                inject: ['getMaingoalId', 'getSubgoalId', 'getLenColumn',
                    'is_ReduceSize', 'getSubMarketProductId', 'getIndependencyId', 'getRegionId',
                    'onDragStartAction', 'onDragMoveAction', 'onDragChangeAction', 'onDragEndAction', 'getDragdropActionOptions',
                    'showPopupAddAction', 'getView_TitleSubAction', 'loadAllGoalActionInOpenArea','getRole' ],
                data() {
                    return {                        
                        IsEditColumnTitle: false,
                        View_ColumnName: this.item.Name,
                        
                    };
                },
                computed: {
                    kLg() {
                        return kLg;
                    },
                    VListAction() {
                        if (!this.item.ListAction || !Array.isArray(this.item.ListAction)) return [];
                        const lstA = this.item.ListAction.filter(a => a.IsShow);
                        return lstA;
                    },
                    Columns_OneAction() {
                        if (!this.item.ListAction.length) return [];
                        if (this.item.ListAction.length <= this.item.MCount)
                            return [];
                        if (this.item.MCount < 2) return [];
                        // tu cot thu 2 tro di
                        const lstAv = this.item.ListAction.filter(a => a.IsShow);

                        const vList = [[]], mCnt = this.item.MCount
                        var _i = 0;
                        lstAv.filter((a, i) => {
                            _i = i % mCnt;
                            if (_i > vList.length - 1)
                                vList.push([a])
                            else {
                                vList[_i].push(a);
                            }
                            return true; // for loop
                        });
                        return vList;
                    },
                    CanDelete() {
                        const _lstA = Array.isArray(this.item.ListAction) ? this.item.ListAction : [];          // ngan loi dragdrop
                        const lAction = _lstA.filter(a => { return a.Name != undefined || a.Name != null });
                        return lAction.length < 1;
                    },
                    StyleAddActionWithNavMenu() {
                        if (this.is_ReduceSize() && MsaApp.IsShowNavigationMenu) {
                            return '143px';
                        }
                        return '222px';
                    },
                    HasBtnAddNewAction() {
                        return true;
                    },
                    stylereducesmall() {
                        if (this.is_ReduceSize()) {     // ColumnItem.stylereducesmall
                            switch (this.item.MCount) {
                                case 1:
                                case 2:
                                    return 'style-reduce-small';
                                case 3:
                                    return 'style-reduce-small3';
                                case 4:
                                    return 'style-reduce-small4';
                                case 5:
                                    return 'style-reduce-small4';
                                case 6:
                                    return 'style-reduce-small6';
                                case 7:
                                    return 'style-reduce-small7';
                                case 8:
                                    return 'style-reduce-small8';
                                case 9:
                                    return 'style-reduce-small9';
                                case 10:
                                    return 'style-reduce-small9';
                            }
                        }
                        return;
                    },
                    IsShowDelete() {
                        const lenCol = this.getLenColumn();
                        if (lenCol === 1) return true;
                        const _lstA = Array.isArray(this.item.ListAction) ? this.item.ListAction : [];       // ngan loi dragdrop
                        if (_lstA.length < 1) return true;
                        return false;
                    },
                    
                },
                watch: {
                    'item.Name'(nVal) {
                        this.View_ColumnName = nVal;
                    },
                },
                mounted() {
                    const __key = `vmGoalAction_openPopEditColumn_addColumn_${this.item.Id}`;
                    if (MsaApp.hasKeyMapDelegate(__key)) {
                        setTimeout(function () {
                            MsaApp.runFuncMapDelegate(__key);
                        }, 999);
                    }

                },
                provide() {
                    return {
                        getColumnId: () => { return this.item.Id; },
                        hasAddNewBtn: (actionId) => {
                            return this.VListAction[this.VListAction.length - 1].Id === actionId;
                        },
                    }
                },
                methods: {
                    
                    deleteColumn(e) {
                        var goalId = this.item.GoalId;//this.getSubgoalId();
                        var columnId = this.item.Id;
                        
                        pConfirm(kLg.confirmDeleteAc1 + kLg.confirmDeleteAc2).then(function () {
                            var entryData = { ActionPlanColunmId: columnId, GoalId: goalId };
                            vmGoalAction.dataservice.deleteColumn(entryData, function (serData) {
                                MsaApp.updateDataProductOrTheme_Expand_InView_Observer();       //[ColumnItem].deleteColumn
                            });
                        });
                    },
                    hideInputEditColumnTitle() {
                        this.IsEditColumnTitle = false;
                        const n = this.View_ColumnName.trim();
                        if (n == '') {
                            this.View_ColumnName = this.item.Name;
                            enableDragdrop();
                            return;
                        }
                        if (n != this.item.Name) {
                            var entry = { Id: this.item.Id, Name: n };
                            const thisRef = this;
                            vmGoalAction.dataservice.updateColumnName(entry, function (data) {
                                thisRef.loadAllGoalActionInOpenArea();
                                enableDragdrop();
                            });
                        } else {
                            enableDragdrop();
                        }
                        function enableDragdrop() {
                            MsaApp.CanDragDrop = true;
                        }
                    },
                    onCountEditColumn(target) {
                        if (MsaApp.isViewer()) return;
                        if (this.getRole() < vmCommon.MemberRole.Edit) return;
                        MsaApp.ClcCountEditColumn += 1;
                        const that = this;
                        if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                            MsaApp.ClcTimerEditColumn = setTimeout(function () {
                                if (MsaApp.ClcCountEditColumn > 1) {        // dblclick
                                    
                                    const columnId = that.item.Id;
                                    var maingoalid = that.getMaingoalId();
                                    var subgoalId = that.getSubgoalId();
                                    var entry = {
                                        MaingoalId: maingoalid,
                                        SubgoalId: subgoalId
                                    };
                                    MsaApp.handlerLoadding();
                                    vmGoalAction.openPopEditColumn(columnId, entry.SubgoalId, entry.MainGoalId, that.IsExpand);
                                } else {                                    // click
                                    that.IsEditColumnTitle = true;
                                    MsaApp.CanDragDrop = false;
                                    that.$nextTick(() => {                  // DOM re-render
                                        $(target).data('kendoTooltip').hide();
                                        $(that.$el).find('.cssInputColumnName').focus();
                                    });
                                }
                                
                                MsaApp.ClcCountEditColumn = 0;          // xóa click count
                                clearTimeout(MsaApp.ClcTimerEditColumn);// xóa timmer 
                                MsaApp.ClcTimerEditColumn = undefined;  // set timmer về updefinded để chạy lệnh if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                            }, 333);
                    },
                    showTooltipColumnName(e) {
                        const target = e.target;
                        var des = this.View_ColumnName;
                        MsaApp.onHoverShow_kendoTooltip(target, des, 'bottom');
                    },
                    showPopupAddActionInColumn(e) {         // Column khong co action
                        const columnId = this.item.Id;
                        this.showPopupAddAction(e, columnId);
                    },
                    showTooltipAddActionOnRight(e) {
                        const target = e.target;
                        var actTlt = kLg.labelActionName;
                        var des = kLg.strAddFormat.format(actTlt);
                        MsaApp.onHoverShowTooltipAddGoalAction(target, des, 'right');
                    },
                    hideTooltipAddActionOnRight(e) {
                        // Destroy de cap nhat lai title subgoal sau khi update inline
                        $(e.target).popover('destroy');
                    },
                }
            });
        });
    });
    
    Vue.component("KpiRegion", (resolve) => {
        $.get(`${__rootFolder__}/${_MainSubFolder_}/KpiRegion.html`, template => {
            resolve({
                template: template,
                props: ["kpiRegion"],
                inject: ['getIndependencyId','getSubMarketProductId'],
                computed: {
                    kLg() {
                        return kLg;
                    },
                    percent() {
                        return this.kpiRegion.Percent == null ? 0 : this.kpiRegion.Percent <= 0 ? 0 : this.kpiRegion.Percent >= 100 ? 100 : this.kpiRegion.Percent;
                    },
                    krPercent() {
                        return this.kpiRegion.Percent == null ? 0 : this.kpiRegion.Percent > 9999 ? 9999 : this.kpiRegion.Percent < -9999 ? -9999 : this.kpiRegion.Percent;
                    },
                    width() {
                        var per = this.krPercent;
                        var w = 100 - (per > 0 ? per : 0);
                        return w < 0 ? 0 : w > 100 ? 100: w;
                    },
                    left() {
                        return this.krPercent > 99 ? -28 : -8;
                    }
                },
                updated() {
                    this.reloadData();
                },
                mounted() {
                    this.reloadData();
                },
                methods: {
                    reloadData() {
                        var krControl = vmCommon.deepCopy(MsaApp.kpiRegionService().getInfo());
                        if (krControl.data) {
                            var typeid = krControl.typeId;

                            var masterid = this.kpiRegion.MasterSubGoalId;
                            if (masterid == undefined || masterid != krControl.masterId)
                                return;

                            //check exist
                            var kpiRegions = this.$parent.item.KpiRegions || [];
                            if (kpiRegions.map(t => t.Id).indexOf(krControl.regionId) == -1) {
                                MsaApp.kpiRegionService().clearAndClose();
                                return;
                            }

                            var regionid = this.kpiRegion.Id;
                            if (regionid == undefined || regionid != krControl.regionId)
                                return;

                            var areaid = this.getIndependencyId() || this.getSubMarketProductId();
                            if (areaid == undefined || areaid != krControl.areaId)
                                return;

                            var data = krControl.typeId == -1 ? this.kpiRegion : this.kpiRegion.PercentItems.find(t => t.TypeId == krControl.typeId);
                            if ((krControl.typeId == -1 && data.Blocks.length == 0) || (krControl.typeId != -1 && data.Count == 0)) {
                                MsaApp.kpiRegionService().clearAndClose();
                                return;
                            }

                            if (krControl.isCollapse)
                                MsaApp.kpiRegionService().update(data);
                            else
                                MsaApp.kpiRegionService().open(data, areaid, typeid, regionid, masterid);
                        }
                    },
                    percentItemStyle: function (pitem) {
                        return {
                            bg: pitem.Count == 0 ? "kpi-overview-empty" : pitem.TypeId == 0 ? "kpi-overview-bgdown" : pitem.TypeId == 1 ? "kpi-overview-bgdown" : pitem.TypeId == 2 ? "kpi-overview-bgdown" : pitem.TypeId == 3 ? "kpi-overview-bgequal" : "kpi-overview-bgup",
                            range: pitem.TypeId == 0 ? "0" : pitem.TypeId == 1 ? "20" : pitem.TypeId == 2 ? "40" : pitem.TypeId == 3 ? "60" : "80"
                        };
                    },
                    onOpenLink: function (typeid) {
                        if (typeid == null) return;

                        var that = this;
                        var masterid = that.kpiRegion.MasterSubGoalId;
                        if (masterid == undefined)
                            return;

                        var regionid = that.kpiRegion.Id;
                        if (regionid == undefined)
                            return;

                        var areaid = this.getIndependencyId() || this.getSubMarketProductId();
                        if (areaid == undefined)
                            return;

                        var data = typeid == -1 ? this.kpiRegion : this.kpiRegion.PercentItems.find(t => t.TypeId == typeid);

                        vmGoalAction.kpRegionOptions = { isShowHidden: false, isShowAll: true };
                        MsaApp.kpiRegionService().open(data, areaid, typeid, regionid, masterid);
                    }
                }
            });
        });
    });

    /* Dung chung cho cac components
     * ViewSubGoalOverView,
     * NavMenuViewSubgoal,
     * NavMenuViewProductM (Product/Theme) // component này là hiểu sai ý khách hàng, để lại chưa xóa đi
     */
    const mixinSubGoalOverView = {
        props: ['item', 'hasSearchTypeCritias'],
        inject: ['getMaingoalStartDate', 'pEditMenuGoal', 'isDraggable',
            'getIsExpand', 'isShowMainOverview', 'updateListSubExpand', 'setSubgoalReduceSize',
            'onMouseOverCheckShowExceededCost', 'isKeyBoardCode', 'countSub', 'getIsVisible',
            'getDragdropSubOptions', 'onDragStartSubgoal', 'onDragChangeSubgoal', 'onDragEndSubgoal', 'onDragMoveGoal',
            'updateTitleAction', 'getViewRightWidth', "getViewType"],
        provide() {
            return {
                getSubgoalId: this.getSubgoalId,
                showPopupAddAction: this.showPopupAddAction,
                getCssExceedCost: () => { return this.CssExceedCost; }, //GoalOverview
                getEndDateSubgoal: () => {          //ViewAction
                    if (!this.item.Date) return null;
                    return this.item.Date.jsonToDate();
                },
                AddnewColumn: this.AddnewColumn,            //GoalOverview
                getParentStartDate: () => { return this.item.StartDate; },      //ViewAction
                getParentEndDate: () => { return this.item.Date; },      //ViewAction
                getLenColumn: this.getLenColumn,                //ColumnItem
                getView_TitleSubAction: () => { return this.View_TitleAction; }, //ViewAction
                is_ReduceSize: () => { return this.item.IsReduceSize; }, //ViewAction, ColumnItem
                getColumnId: () => {
                    if (!this.item.ListColunm)
                        return -1;
                    if (this.item.ListColunm.length < 1)
                        return -1;
                    return this.item.ListColunm[0].Id;      // column dau tien
                },
                getDragdropActionOptions: () => { return this.DragdropOptions.Action; }, //ColumnItem
                onDragStartAction: this.onDragStartAction,
                onDragChangeAction: this.onDragChangeAction,
                onDragMoveAction: this.onDragMoveAction,
                onDragEndAction: this.onDragEndAction,
                hasAddNewBtn: (actionId) => {
                    return this.VListAction[this.VListAction.length - 1].Id === actionId;
                },
                getDataContentRightView: (smpId, indId) => {
                    if (indId) {
                        MsaApp.loadOpenIndependencies(indId);
                    }
                    if (smpId) {
                        MsaApp.loadOpenProducts(smpId);
                    }
                    if (MsaApp.NavigationMenuView.length) {
                        MsaApp.reloadDataContentRightView();
                    }
                },
                countAction: () => { return this.item.ListAction.length; },
                getChildrenGa: () => {return this.item.ListAction},
            }
        },
        data() {
            MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
            //actionPlanComponents[this.item.Id] = this;

            var isExp = this.getIsExpand(this.item.Id, 'subgoal');
            if (this.countSub() == 1) {
                isExp = true;
            }

            return {
                IsExpand: isExp,
                VirtualItems1Line: 4,
                VirtualNumLines: 2,
                Typeid: 2,
                IsCallingHandler: false,
                ColumnView: {
                    WidthAllColumn: 0,
                    WidthAllAction: 0,
                    WidthViewColAndAction: 0
                },
                Date: this.item.Date,
                MaxAction1Line: 1,
                View_TitleAction: MsaApp.getActionTitle(this.item.Id),
                IsEditActionTitle: false,
            };
        },
        computed: {
            kLg() { return kLg; },
            ViewCurrencyName() { return this.item.CurrencyName;},
            WidthAction() {
                if (this.item.IsReduceSize) {
                    return 359;
                }
                return 272;
            },
            HeightAction() {
                if (this.item.IsReduceSize) {
                    return 120;
                }
                return 414;
            },
            LastColumnHasAction() {
                if (!this.item.ListColunm || !this.item.ListColunm.length) return {
                    Index: -1, MAction: -1
                };
                const col = vmCommon.deepCopy(this.item.ListColunm);
                var _index = -1;
                for (let i = 0, len = col.length; i < len; i++) {
                    if (Array.isArray(col[i].ListAction) && col[i].ListAction.length) {
                        _index = i;
                    }
                }
                const lastC = col[_index];
                if (!lastC) return {
                    Index: -1, MAction: -1
                };

                const zAction = Array.isArray(lastC.ListAction) ? lastC.ListAction.length : -1;

                if (zAction < 0) return {
                    Index: -1, MAction: -1
                };

                var mAction = zAction - lastC.MCount > 0 ? lastC.MCount : zAction;

                return {
                    Index: _index, MAction: mAction
                }
            },
            HasBtnAddNewAction() {
                const hasColumn = this.item.ListColunm.length > 0;
                var l = this.item.ListAction.filter(a => a.IsShow) || [];
                const hasAction = l.length > 0;
                return !hasColumn && !hasAction;
            },
            VirtualItem() {
                const count = this.VirtualItems1Line * this.VirtualNumLines;
                return {
                    Count: count,
                    Width: this.WidthAction,
                    Height: this.HeightAction   //384 + 30
                }
            },
            VListAction() {
                if (!this.item.ListAction) return [];
                if (!Array.isArray(this.item.ListAction)) return [];
                const lstA = this.item.ListAction.filter(a => a.IsShow);
                return lstA;
            },
            VColumns_OneAction() {          //Columns_OneAction
                if (!this.item.IsReduceSize) return [];     // khong phai view theo teamboard
                const mCnt = this.MaxAction1Line;
                if (!mCnt) return [];       // check undefined
                if (mCnt < 2) return [];        // chi co 1 action 1 dong
                if (this.item.ListAction.length <= mCnt) return []; // cac action tren cung 1 dong

                const lstA = this.item.ListAction.filter(a => a.IsShow);

                const vList = [[], []];
                var _i = 0;
                lstA.filter((a, i) => {
                    _i = i % mCnt;
                    if (_i > vList.length - 1)
                        vList.push([a])
                    else {
                        vList[_i].push(a);
                    }
                    return true; // for loop
                });
                return vList;
            },
            StyleKpiRegionViewAction() {        // override mixin
                var region = {
                    display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start',
                    height: '100%', minWidth: '291px'
                }
                if (this.item.ListColunm && Array.isArray(this.item.ListColunm) && this.item.ListColunm.length) {
                    region.borderRight = '1px solid #dedede';
                }
                if (this.item.KpiRegions && Array.isArray(this.item.KpiRegions) && this.item.KpiRegions.length > 0) {
                    if (this.item.KpiRegions.length > 1) {
                        if (this.getViewRightWidth() < 1920) {
                            region = {
                                width: '282px', minWidth: '282px'
                            };
                        } else {
                            region = {
                                width: '559px', minWidth: '559px'
                            };
                        }
                    }
                    return {
                        Section: {
                            display: 'flex'
                        },
                        Regions: region
                    }
                }

                return {
                    Regions: region
                }
            },
            StartDate() {
                if (!this.item.StartDate) return '';
                const s = this.item.StartDate.jsonToDate();
                return kendo.toString(s, "d");
            },
            EndDate() {
                if (!this.item.Date) return '';
                const e = this.item.Date.jsonToDate();
                return ` — ${kendo.toString(e, "d")}`;
            },
            ViewRightType() { return 'SubgoalDefault' },
            SgId() { return this.item.Id },
            ViewVisible() {     // Sub goal
                var isShowAll = msFilter.controlService.hasHiddenElements(mFilter.enumFilterVisibility.ShowAll);
                var isHide = msFilter.controlService.hasHiddenElements(mFilter.enumFilterVisibility.Hide);
                var maingoal = this.getIsVisible() ? (this.isShowMainOverview() ? 1 : 0) : 0,
                    subgoal = 0, action = 0, hasHiddenItem = false;//, isShowOverView = false;

                const goal = this.item;
                if (isShowAll) {
                    if (goal.Name) {
                        subgoal = 1;
                    };
                    action = Array.isArray(goal.ListAction) ? goal.ListAction.filter(a => a.IsShow).length : 0;
                } else {
                    if (isHide) {
                        subgoal = !goal.Visibility && !!goal.Name ? 1 : 0;
                        action = Array.isArray(goal.ListAction) ? goal.ListAction.filter(function (act) { return !act.Visibility; }).length : 0;
                    } else {
                        subgoal = goal.Visibility && !!goal.Name ? 1 : 0;
                        if (!goal.Visibility && !hasHiddenItem) {
                            hasHiddenItem = true;
                        }
                        action = Array.isArray(goal.ListAction) ? goal.ListAction.filter(function (act) {
                            return act.Visibility;
                        }).length : 0;
                    }
                }
                //isShowOverView = subgoal == 1;
                if (Array.isArray(goal.ListAction) && action < goal.ListAction.length) hasHiddenItem = true;
                //if (!isShowAll && !isHide && goal.Visibility) isShowOverView = true;

                if (isShowAll) {
                    isShowOverView = true;
                    hasHiddenItem = false;
                }

                if (!hasHiddenItem) return {
                    ViewCount: `${maingoal} | ${subgoal} | ${action}`,
                    IsInVisible: false, ShowOverview: this.item.IsShow > 0,
                    IsShowSubgoalName: true,
                }

                //var isShowSubName = action < 1 ? false : true;
                //if (goal.Visibility) isShowSubName = true;

                return {
                    ViewCount: `${maingoal} | ${subgoal} | ${action}`,
                    ClassVisible: 'font-auge', IsInVisible: !isHide,
                    ShowOverview: this.item.IsShow > 0 || this.item.ListAction.some(t => t.IsShow > 0), IsShowSubgoalName: this.item.IsShow > 0 || this.item.ListAction.some(t => t.IsShow > 0)
                }
            },
            ApEvaluation() {
                if (this.item.KpiOverViewPercentStr != null) {
                    var ApEvaluation = this.item.KpiOverViewPercentStr;
                }
                return ApEvaluation + "%";
            },
            ActualCost() {
                if (!this.item.ActualCost) return '';
                return vmCommon.formatCost(this.item.ActualCost);
            },
            ExpectedCost() {
                if (!this.item.ExpectedCost) return '';
                return vmCommon.formatCost(this.item.ExpectedCost);
            },
            MaingoalId() { return this.item.ParentId; },
            ValueCostEx() {
                var isOverdueCostEx = this.item.Budget != null && this.item.Budget > 0;
                if (isOverdueCostEx)
                    return vmCommon.formatCost(this.item.Budget);
                return;
            },
            ValueCost() {
                var isOverdueCost = this.item.Budget !== null && this.item.Budget > 0;
                if (isOverdueCost)
                    return vmCommon.formatOriginCost(this.item.Budget - this.item.ExpectedCost);
                return;
            },
            KpiOverview() {
                return MsaApp.getKpiOverview(this.item);
            },
            DragdropOptions() {                             //ViewSubGoalOverView
                const isDrg = this.isDraggable();

                const opts = {
                    animation: 100, sort: true,
                    disabled: !isDrg,
                    chosenClass: "chosenClass",
                    scrollSensitivity: 500,
                }
                const lenCol = this.getLenColumn();

                const optCol = vmCommon.deepCopy(opts);
                optCol.direction = 'horizontal';
                optCol.ghostClass = 'ghost-col';// sub overview
                if (-1 < lenCol && lenCol < 2) {        // view column
                    optCol.disabled = true;
                }

                const optAct = vmCommon.deepCopy(opts);
                optAct.ghostClass = 'ghost-action';// sub overview
                if (lenCol == -1 && this.item.ListAction.length < 2) {     // view Action
                    optAct.disabled = true;
                }

                return {
                    Column: optCol, Action: optAct
                }
            },
            ColorKpi() {
                var ColorKpi = "";
                if (this.item.KpiOverViewPercent < 49.5) {
                    ColorKpi = "msa-kpi-bg60";
                } else if (this.item.KpiOverViewPercent <= 69.49) {
                    ColorKpi = "msa-kpi-bg60-80";
                } else {
                    ColorKpi = "msa-kpi-bg80";
                }
                return ColorKpi;
            },

            ScrollColumnX() {
                const _dt = this.ColumnView.WidthAllColumn - this.getWidthViewColAndAction();
                var isShow = this.item.ListColunm.length ? _dt > 0 : false;
                var maxX = isShow ? _dt : -1;
                var can = isShow ? this.ColumnView.WidthAllAction > this.getWidthViewColAndAction() : false;
                var clsScrollX = isShow ? `dnbScrollXjqry` : '';
                if (can) {      // mouse wheel
                    clsScrollX += ' dnbActionOverX';
                }
                return {
                    IsShow: isShow, MaxX: maxX, CanMousWheel: can,
                    ClassScrollX: clsScrollX
                }
            },
            ClassSubId() { return `Subgoal_${this.item.Id}` },
            CssExceedCost() {       // SubgoalOverview
                if (this.item.Finish) return { B: '', o: '', Obig: '' };

                const budget = this.item.Budget;
                const expectedCost = this.item.ExpectedCost;
                const actualCost = this.item.ActualCost;
                return {
                    B: actualCost > budget ? 'exceeded-cost' : '',
                    o: expectedCost > budget ? 'exceeded-cost' : '',
                    Obig: ''
                }
            },
            
            ContainFilterResult() {
                return this.item.IsContainFilterResult ? "ms-contain-rs" : "";
            },
            ColorApEvaluation() {
                var x = this.item.ApEvaluation;
                return ChoseColorPercent(x);
            },
            ClassWidthNavMenu() {
                if (this.getViewRightWidth() < 1920) {
                    return 'msa-mg-sub-with_navmenu';
                }
                return '';
            },
            StyleTopAddActionWhenEmpty() { return '168px' },
        },
        methods: {
            getLenColumn() {
                if (this.item.ListColunm) return this.item.ListColunm.length;
                return -1;
            },

            onDragStartColumn(evt) {
                MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                MsaApp.DragDropColumn.LastEvent = 'onDragStartColumn';
            },
            onDragChangeColumn(evt) {
                if (evt.moved) {
                    MsaApp.DragDropColumn.iFrom = evt.moved.oldIndex;
                    MsaApp.DragDropColumn.iTo = evt.moved.newIndex;
                    MsaApp.DragDropColumn.LastEvent = 'onDragChangeColumn_moved';
                }
            },
            onDragEndColumn(evt) {
                if (MsaApp.DragDropColumn.LastEvent == 'onDragChangeColumn_moved') {
                    if (MsaApp.DragDropColumn.iFrom == MsaApp.DragDropColumn.iTo) {
                        MsaApp.clearDragDropColumn();
                        return;
                    }

                    MsaApp.changPositionColumn();
                } else {
                    MsaApp.clearDragDropColumn();
                }
            },
            onDragMoveColumn(evt, originalEvent) {
                const dragged = evt.dragged;//div.msa-column-group
                const related = evt.related;//div.msa-column-group
                const id1 = dragged.getAttribute('drgdrp-id');
                const id2 = related.getAttribute('drgdrp-id');
                if (id1 == id2) return;         // Ngan khong cho cap nhat vi khi keo sang cho moi va giu nguyen thi id1 == id2

                const parentId = dragged.getAttribute('drgdrp-pid'); //const parentId2 = related.getAttribute('drgdrp-pid');
                var indId = dragged.getAttribute('drgdrp-indid');
                indId = indId ? parseInt(indId) : null;
                const smpId = dragged.getAttribute('drgdrp-smpid');

                MsaApp.DragDropColumn.Obj = {
                    SrcId: id1, DesId: id2, ParentId: parentId,
                    IndId: indId, SmpId: smpId
                }

            },
            onDragStartAction: function (evt) {
                MsaApp.hideAllTooltipDes(); //onDragStartAction
                MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                MsaApp.DragDropAction.LastEvent = 'onDragStartAction';
                MsaApp.clearTimmerGetListMain_GAMIndex();
            },
            onDragChangeAction(evt) {
                if (evt.moved) {                // drag-drop cùng sub hoac cung column
                    MsaApp.DragDropAction.iFrom = evt.moved.oldIndex;
                    MsaApp.DragDropAction.iTo = evt.moved.newIndex;
                    MsaApp.DragDropAction.LastEvent = 'onDragChangeAction_moved';
                } else {                        // drag-drop khác column hoac khac sub
                    if (evt.added) {
                        MsaApp.DragDropAction.iTo = evt.added.newIndex;
                    }
                    if (evt.removed) {
                        MsaApp.DragDropAction.LastEvent = 'onDragChangeAction_removed';
                        MsaApp.DragDropAction.iFrom = evt.removed.oldIndex;
                    }
                }
            },
            onDragEndAction: function (evt) {

                if (MsaApp.DragDropAction.LastEvent == 'onDragChangeAction_moved') {
                    if (MsaApp.DragDropAction.iFrom == MsaApp.DragDropAction.iTo) {
                        MsaApp.clearDragDropAction();
                        return;
                    }
                }
                if (MsaApp.DragDropAction.LastEvent == 'onDragChangeAction_moved' ||
                    MsaApp.DragDropAction.LastEvent == 'onDragChangeAction_removed') {

                    const grpFrom = evt.from.closest('.msa-vue-subgoal-overview');
                    const grpTo = evt.to.closest('.msa-vue-subgoal-overview');
                    const smpId1 = grpFrom.getAttribute('drgdrp-smpid');
                    const smpId2 = grpTo.getAttribute('drgdrp-smpid');
                    const indId1 = grpFrom.getAttribute('drgdrp-indid');
                    const indId2 = grpTo.getAttribute('drgdrp-indid');

                    // them goalId vao list
                    if (smpId1 && !MsaApp.Expand.ListSubmarketPrdId.includes(smpId1)) {
                        MsaApp.Expand.ListSubmarketPrdId.push(smpId1);
                    }
                    if (smpId2 && !MsaApp.Expand.ListSubmarketPrdId.includes(smpId2)) {
                        MsaApp.Expand.ListSubmarketPrdId.push(smpId2);
                    }
                    if (indId1 && !MsaApp.Expand.ListThemeId.includes(indId1)) {
                        MsaApp.Expand.ListThemeId.push(indId1);
                    }
                    if (indId2 && !MsaApp.Expand.ListThemeId.includes(indId2)) {
                        MsaApp.Expand.ListThemeId.push(indId2);
                    }

                    MsaApp.setTimmerGetListMain_GAMIndex();     //onDragEndAction (ViewSubGoalOverView)

                    MsaApp.changePositionAction();
                } else {
                    MsaApp.clearDragDropAction();
                }
            },
            onDragMoveAction(evt, originalEvent) {
                const dragged = evt.dragged;//div.msa-column-group
                const related = evt.related;//div.msa-column-group
                const id1 = dragged.getAttribute('drgdrp-id');
                const id2 = related.getAttribute('drgdrp-id');
                if (id1 == id2) return;         // Ngan khong cho cap nhat vi khi keo sang cho moi va giu nguyen thi id1 == id2

                const mdf1 = dragged.getAttribute('drgdrp-mdf');
                const mdf2 = related.getAttribute('drgdrp-mdf');

                const sgId1 = dragged.getAttribute('drgdrp-sgid');
                const sgId2 = related.getAttribute('drgdrp-sgid');

                const smpId1 = dragged.getAttribute('drgdrp-smpid');
                const smpId2 = related.getAttribute('drgdrp-smpid');
                var indId1 = dragged.getAttribute('drgdrp-indid');
                indId1 = indId1 ? parseInt(indId1) : null;
                var indId2 = related.getAttribute('drgdrp-indid');
                indId2 = indId2 ? parseInt(indId2) : null;

                const regionId1 = dragged.getAttribute('drgdrp-regionid');
                const regionId2 = related.getAttribute('drgdrp-regionid');

                const columnId1 = dragged.getAttribute('drgdrp-columnid');
                const columnId2 = related.getAttribute('drgdrp-columnid');

                if (columnId1 && columnId2) {
                    if (columnId1 == columnId2)
                        MsaApp.DragDropAction.ChangeEvent = 'DragDropCungColumn';
                    else
                        MsaApp.DragDropAction.ChangeEvent = 'DragDropKhacColumn';
                } else if (sgId1 && sgId2) {
                    if (sgId1 == sgId2) {
                        MsaApp.DragDropAction.ChangeEvent = 'DragDropCungSubgoal';
                    } else {
                        MsaApp.DragDropAction.ChangeEvent = 'DragDropKhacSubgoal';
                    }
                } else {
                    MsaApp.DragDropAction.ChangeEvent = 'DragDrop_Col->Sub_hoac_Sub->Col';
                }

                const typeId1 = related.getAttribute('dragdroptype');

                MsaApp.DragDropAction.Src = {
                    Id: id1, Mdf: parseInt(mdf1), ParentId: sgId1,
                    ActionPlanColumnId: parseInt(columnId1),
                    SmpId: smpId1, IndId: indId1, RegionId: parseInt(regionId1),
                    Type: parseInt(typeId1)
                }
                MsaApp.DragDropAction.Des = {
                    Id: id2, Mdf: parseInt(mdf2), ParentId: sgId2,
                    ActionPlanColumnId: parseInt(columnId2),
                    SmpId: smpId2, IndId: indId2, RegionId: parseInt(regionId2)
                }

                var pos = 0;    // 0: drag ve truoc, 1: drag ve dang sau

                const offset1 = $(dragged).offset() || { top: 0, left: 0 };
                const offset2 = $(related).offset() || { top: 0, left: 0 };

                pos = offset2.top > offset1.top ? 1 : 0;
                if (!pos) {     // pos == 0
                    pos = offset2.left > offset1.left ? 1 : 0;
                }
                //}

                MsaApp.DragDropAction.Pos = pos;

            },
            getWidthViewColAndAction() {
                return this.ColumnView.WidthViewColAndAction;
            },
            onMouseoverTooltipNameSub(e) {
                if (MsaApp.DragDropGoal.LastEvent != '') return;

                const item = this.item;
                const $target = $(e.target);
                var isEmptyB = !item.Name && !item.Description;

                if (e.target.classList.contains('dnbTooltipParentName') && item.ParentName && isEmptyB)
                    isEmptyB = false; // ViewRightType == 'SubgoalNavMenu'

                var tt = $target.data("kendoTooltip");
                if (isEmptyB) {
                    if (tt) tt.destroy();
                    return;
                }
                if (tt) {
                    return;
                }
                const tooltipObj = {
                    Name: item.Name, Description: item.Description
                };

                // ViewRightType == 'SubgoalNavMenu'
                if (e.target.classList.contains('dnbTooltipParentName') && item.ParentName) {
                    tooltipObj.Name = item.ParentName;
                    delete tooltipObj.Description;
                }

                MsaApp.initAndShowKendoTooltip(tooltipObj, $target);
            },
            onResizeView(event) {
                var grpCol = document.querySelector('.group-Column');
                if (grpCol && typeof this.$el.querySelector === 'function') {
                    const viewSC = this.$el.querySelector('.msaVueSubgoalColWrap');
                    if (viewSC) {
                        var _offW = viewSC.offsetWidth;

                        if (_offW != this.getWidthViewColAndAction())
                            this.ColumnView.WidthViewColAndAction = _offW;
                    }

                }
                if (this.IsExpand) {
                    const a = this.getDOM2Scroll();
                    this.ColumnView.WidthAllColumn = a.WidthAllColumn;
                    this.ColumnView.WidthAllAction = a.WidthAllAction;
                    this.ColumnView.WidthViewColAndAction = a.WidthViewColAndAction;
                    this.MaxAction1Line = a.MaxAction1Line;
                }
            },
            updateVirtualItem(elm) {        // drop item (width, height) = ViewAction(242x384)
                if (!elm) return;
                var widthViewActions = elm.clientWidth;
                var sizeVirtualItems = widthViewActions / this.VirtualItem.Width;

                this.VirtualItems1Line = Math.floor(sizeVirtualItems);
                const _lstA = Array.isArray(this.item.ListAction) ? this.item.ListAction : [];
                if (_lstA.length < this.VirtualItems1Line) {
                    this.VirtualNumLines = 1;
                } else {
                    var heightViewActions = elm.clientHeight;
                    var numLines = heightViewActions / this.VirtualItem.Height;
                    this.VirtualNumLines = Math.round(numLines);
                }
            },
            ActionItem(index) {
                const _lstA = Array.isArray(this.ListAction) ? this.ListAction : [];
                var _action = _lstA.find(a => {
                    return index == a.VIndex;
                });
                return _action;
            },
            onToggleExpand(e) {
                const thisR = this;

                MsaApp.ClcCountEditColumn += 1;
                if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                    MsaApp.ClcTimerEditColumn = setTimeout(function () {
                        if (MsaApp.ClcCountEditColumn > 1) {        // dblclick
                            // xử lý sự kiệm dbclick
                            if (!thisR.IsExpand && thisR.item.IsShow)
                                thisR.dblClickEditSubgoal(e);

                        } else {                                    // click
                            // xử lý sự kiện single click
                            if (thisR.IsCallingHandler) return;
                            const isExpand = !thisR.IsExpand;

                            thisR.toggleExpand(isExpand);
                        }

                        MsaApp.ClcCountEditColumn = 0;          // xóa click count
                        clearTimeout(MsaApp.ClcTimerEditColumn);// xóa timmer 
                        MsaApp.ClcTimerEditColumn = undefined;  // set timmer về updefinded để chạy lệnh if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                    }, 333);
            },
            toggleExpand: function (isExpand) {
                if (this.IsExpand == isExpand)
                    return;

                this.IsExpand = isExpand;
                this.IsCallingHandler = true;
                const thisRef = this;
                const subgoalId = this.getSubgoalId();
                if (isExpand) {
                    MsaApp.pushExpand(subgoalId, 'subgoal').then(function () {
                        thisRef.IsCallingHandler = false;
                    });
                } else {
                    MsaApp.removeExpand(subgoalId, 'subgoal').then(function () {
                        thisRef.IsCallingHandler = false;
                    });
                }

            },
            getSubgoalId() {
                return this.item.Id;
            },
            toggleSubDetail() {
                const iconSub = this.IsExpand;
                this.IsExpand = !iconSub;
            },
            dblClickEditSubgoal(e) {
                const mgId = this.MaingoalId;
                var title = MsaApp.getSubgoalTitle(mgId);
                const _item = vmCommon.deepCopy(this.item);
                _item.ParentId = mgId;        // subgoal
                this.pEditMenuGoal(_item, title);
            },
            ExportDocxMenu() {
                var typeId = 2;
                var entry = {
                    Id: this.item.Id,
                    TypeId: typeId
                };
                vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                    var state = res.value.ResultStatus;
                    var fileInfo = res.value.TheObject;
                    if (state == vmCommon.ResultState.SUCCESS) {
                        vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                    }
                });
            },
            GotoMixfromMenu() {
                var goalId = this.item.Id;
                vmGoalAction.gotoMixService.gotoMix(goalId)
            },
            GotoRoadmapfromMenu() {
                var goalId = this.item.Id;
                vmGoalAction.gotoRMService.gotoRoadMap(goalId)
            },
            AddnewColumn(e) {
                var maingoalid = this.MaingoalId;
                var subgoalId = this.getSubgoalId();
                var entry = {
                    MaingoalId: maingoalid,
                    SubgoalId: subgoalId
                };
                vmGoalAction.openPopEditColumn(0, entry.SubgoalId, entry.MainGoalId, this.IsExpand);
            },
            getDOM2Scroll() {
                if (typeof this.$el.querySelector !== 'function') return {
                    WidthAllColumn: 0, WidthAllAction: 0, MaxAction1Line: 1,
                };

                var viewChildren = this.$el.querySelector('.msaVueSubgoalColWrap');     // check column
                if (!viewChildren) {
                    viewChildren = this.$el.querySelector('.dnbViewWidthAction');
                    var w = viewChildren ? viewChildren.offsetWidth : 1;
                    viewChildren = viewChildren.querySelector('.msaKPIView');
                    w -= viewChildren ? viewChildren.offsetWidth : 0;
                    w = (w > this.WidthAction) ? w / (this.WidthAction) : 1;

                    return {
                        WidthAllColumn: 0, WidthAllAction: 0, MaxAction1Line: Math.floor(w),
                    };
                }
                viewChildren = this.$el.querySelector('.dnbViewWidthAction');
                if (!viewChildren) return {
                    WidthAllColumn: 0, WidthAllAction: 0, MaxAction1Line: 1,
                };
                var grpCol = viewChildren.querySelector('.group-Column');
                if (!grpCol) {
                    return {
                        WidthAllColumn: 0, WidthAllAction: 0, MaxAction1Line: 1,
                    };
                }
                var viewWidth = viewChildren.offsetWidth;
                var kpiV = viewChildren.querySelector('.msaKPIView');
                if (kpiV) {
                    viewWidth -= kpiV.offsetWidth;
                }
                var contentWidth = grpCol.scrollWidth;
                const _actW = this.WidthAction;
                const maxI = this.LastColumnHasAction.Index;
                const cols = grpCol.querySelectorAll('.msa-column-group');
                const mAction = this.LastColumnHasAction.MAction;
                var rActionW = 0;
                if (cols)
                    cols.forEach(function (_col, _i) {
                        if (_i < maxI) {
                            rActionW += _col.scrollWidth;
                        }
                        if (_i == maxI) {
                            rActionW += (mAction * _actW);
                        }
                    });
                return {
                    WidthAllColumn: contentWidth,
                    WidthAllAction: rActionW,
                    WidthViewColAndAction: viewWidth
                }
            },
            onMouseleaveCheckScrollWheel(t) {
                if (!this.item.ListColunm) return;
                if (this.item.ListColunm.length < 1) return;
                MsaApp.onMouseWheelBodyContent();
                MsaApp.ScrollMouseAction = 'onMouseleaveCheckScrollWheel';
            },
            onMouseoverCheckScrollWheel(t) {
                if (!this.item.ListColunm) return;
                if (this.item.ListColunm.length < 1) return;
                if (this.isKeyBoardCode('Escape')) return;  // neu tu ngoai hover vao ma an Escape

                if (!this.ScrollColumnX.CanMousWheel) {  //MsaApp.onMouseWheelBodyContent();
                    return;
                }
                MsaApp.offMouseWheelBodyContent();

                const maxX = this.ScrollColumnX.MaxX;
                var scrollView = this.$el.querySelector('.dnbScrollXjqry');
                $(scrollView).off('mousewheel').on('mousewheel', function (event, delta) {
                    if (MsaApp.isKeyBoardCode('Escape')) return;        // dang srcoll ma an Escape

                    this.scrollLeft -= (delta * 268);
                    const sLeft = this.scrollLeft;

                    var $this = $(this).closest('.msaVueSubgoalColWrap');
                    const $btnLeft = $this.find('.msa-btn-scroll-left');
                    const $btnRight = $this.find('.msa-btn-scroll-right');
                    if (sLeft < 1) {
                        $btnLeft.css('visibility', 'hidden');
                        $btnRight.css('visibility', 'visible');
                    } else if (sLeft >= maxX) {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'hidden');
                    } else {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'visible');
                    }
                });
            },
            onScrollColumnView(isLeft) {
                var scrollView = this.$el.querySelector('.dnbScrollXjqry');
                if (!scrollView) return;

                const stepNum = Math.floor(this.getWidthViewColAndAction() * 0.75);
                var step = stepNum;
                if (isLeft) {
                    step = `-=${stepNum}`;
                } else {
                    step = `+=${stepNum}`;
                };

                const maxX = this.ScrollColumnX.MaxX;
                $(scrollView).animate({ scrollLeft: step }, 50, function scrollDone() {
                    const sLeft = this.scrollLeft;

                    var $this = $(this).closest('.msaVueSubgoalColWrap');
                    const $btnLeft = $this.find('.msa-btn-scroll-left');
                    const $btnRight = $this.find('.msa-btn-scroll-right');
                    if (sLeft < 1) {
                        $btnLeft.css('visibility', 'hidden');
                        $btnRight.css('visibility', 'visible');
                    } else if (sLeft >= maxX) {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'hidden');
                    } else {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'visible');
                    }
                });
            },
            showPopupAddAction(e, columnId) {
                var endDate = this.getEndDateToAddAction();
                var info = {
                    actionId: vmCommon.emptyGuid,
                    goalId: this.item.Id,
                    parentId: this.item.Id,
                    subMarketProductId: this.item.SubMarketProductId,
                    parentSubMarketProductId: this.item.SubMarketProductId,
                    independencyId: this.item.IndependencyId,
                    mainGoalId: this.MaingoalId,
                    parentStart: endDate,
                    parentEnd: endDate,
                    endDate: endDate,
                    isEdit: false,
                    parentMasterId: this.getSubgoalMasterId(),
                    isMasterGoal: this.getIsMaster().MasterGoal
                };
                if (columnId > 0) {
                    info.columnId = columnId;
                    info.title = kLg.titlepAddMainGoalNew1 + htmlEscape(kLg.labelActionName) + kLg.titlepAddMainGoalNew2;
                } else {
                    info.title = kLg.titlepAddMainGoalNew1 + htmlEscape(this.View_TitleAction) + kLg.titlepAddMainGoalNew2;
                }
                vmGoalAction.openPopUpAction2(info);

            },
            getEndDateToAddAction() {
                var start = this.item.StartDate;
                if (start) return vmCommon.tryJsonToLocalDate(start);
                start = this.getMaingoalStartDate();
                if (start) return start;
                return new Date();
            },
            getSubgoalMasterId() { return this.item.MasterId; },
            showInputEditActionTitle(e) {
                this.IsEditActionTitle = true;
                MsaApp.CanDragDrop = false;
                this.View_TitleAction = MsaApp.getActionTitle(this.item.Id);
            },
            hideInputEditActionTitle(e) {
                MsaApp.CanDragDrop = true;
                this.IsEditActionTitle = false;
                const newTitle = this.View_TitleAction.trim();
                if (newTitle == '') {
                    this.View_TitleAction = MsaApp.getActionTitle(this.item.Id);
                    return;
                };
                const goalId = this.item.Id;
                this.updateTitleAction(goalId, newTitle);
            },
            UrlRegioncontroolling(e) {
                if ($(e).hasClass('msa-kpiregionurl-0')) return;
                var id = this.item.Id;
                var typeid = this.Typeid;
                var areaid = this.item.SubMarketProductId;
                vmGoalAction.apLinkOverviewService.expand(areaid, id, typeid);
            },
            AboutKpi(item) {
                switch (item.TypeId) {
                    case 0:
                        return 0 + '%';
                    case 1:
                        return 20 + '%';
                    case 2:
                        return 40 + '%';
                    case 3:
                        return 60 + '%';
                    case 4:
                        return 80 + '%';
                }
            },
            NumberCount(item) {
                var NumberCount = item.Count;
                return NumberCount
            },
            onToggleReduceSize(e) {
                const isReduce = !this.item.IsReduceSize;
                this.setSubgoalReduceSize(this.item, isReduce);
            },
            disableIconUrl(item) {
                var disableIconUrl
                if (item.Count == 0) {
                    disableIconUrl = 'icon-url-disabled msa-kpiregionurl-0 ';
                } else {
                    disableIconUrl = 'icon-url'
                }
                return disableIconUrl;
            },
            bgptype(item) {
                if (item.Count == 0) {
                    return " kpi-overview-empty";
                } else if (item.TypeId == 0) {
                    return "kpi-overview-bgdown";
                } else if (item.TypeId == 1) {
                    return "kpi-overview-bgdown";
                } else if (item.TypeId == 2) {
                    return "kpi-overview-bgdown";
                } else if (item.TypeId == 3) {
                    return "kpi-overview-bgequal";
                } else {
                    return "kpi-overview-bgup";
                }
            },
            onMouseoverShowTooltipAddAction(e) {
                const target = e.target;
                var actTlt = MsaApp.getActionTitle(this.item.Id);
                var des = kLg.strAddFormat.format(actTlt);
                MsaApp.onHoverShowTooltipAddGoalAction(target, des, 'top');
            },
            mouseleaveAddActionbysub(e) {
                // Destroy de cap nhat lai title subgoal sau khi update inline
                $(e.target).popover('destroy');
            },
        },
        watch: {
            IsExpand(newVal) {

                this.updateListSubExpand(this.item.Id, newVal);     // dung cho ham collap/expan all subgoal
            },
            'item.IsReduceSize'(newV) {
                this.toggleExpand(true);

                var entryData = {
                    Status: newV,
                    GoalId: this.item.Id
                }
                vmGoalAction.dataservice.saveActionReduceSize(entryData);

                if (this.IsExpand) this.$nextTick(function () {     // callback after DOM ready (re-render)
                    var scrollView = this.$el.querySelector('.dnbScrollXjqry');
                    if (!scrollView) return;

                    const sLeft = $(scrollView).scrollLeft;
                    const maxX = this.ScrollColumnX.MaxX;

                    var $this = $(scrollView).closest('.msaVueSubgoalColWrap');
                    const $btnLeft = $this.find('.msa-btn-scroll-left');
                    const $btnRight = $this.find('.msa-btn-scroll-right');
                    if (sLeft < 3) {
                        $btnLeft.css('visibility', 'hidden');
                        $btnRight.css('visibility', 'visible');
                    } else if (sLeft >= maxX) {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'hidden');
                    } else {
                        $btnLeft.css('visibility', 'visible');
                        $btnRight.css('visibility', 'visible');
                    }
                });
            }
        },
        beforeUpdate() {
            var isExpFromLst = this.getIsExpand(this.item.Id, 'subgoal');
            if (!this.IsExpand && isExpFromLst) {       // Neu no chua expand nhwng co trong list MsaApp.Expand.ExpandSubgoalValue
                this.IsExpand = isExpFromLst;       // set data
            }

        },
        updated() {
            MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
            
            if (this.IsExpand) {        // tinh toan (get value) tu DOM
                const a = this.getDOM2Scroll();
                this.ColumnView.WidthAllColumn = a.WidthAllColumn;
                this.ColumnView.WidthAllAction = a.WidthAllAction;
                this.ColumnView.WidthViewColAndAction = a.WidthViewColAndAction;
                this.MaxAction1Line = a.MaxAction1Line;
            }

            MsaApp.getWidthUpdated();
            MsaApp.updateVisibleBrnScrollX();
        },
        mounted() {
            MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
            
            window.addEventListener('resize', this.onResizeView);

            this.onResizeView();

            MsaApp.getWidthUpdated();
            MsaApp.updateVisibleBrnScrollX();
        },
        unmounted() {
            window.removeEventListener('resize', this.onResizeView);
        },
        beforeDestroy() {
            // Unregister the event listener before destroying this Vue instance
            this.updateListSubExpand(this.item.Id, false);     // dung cho ham collap/expan all subgoal
            MsaApp.removeExpand(this.item.Id, 'subgoal');
        }
    }
    Vue.component('ViewSubGoalOverView', (resolve) => {
        $.get(`${__rootFolder__}/${_MainSubFolder_}/ViewSubgoal.html`, template => {
            resolve({
                template: template,
                mixins: [mixinSubGoalOverView],       // dung mixin de ke thua cho navigation menu 
                props: ['StartDatemain', 'Datemain'],
                inject: ['getMaingoalId', 'getRegionId', 'getProductId', 'getIsMaster', "getRole"],
                provide() {
                    return {
                        getSubMarketProductId: () => this.item.SubMarketProductId,
                        getIndependencyId: () => this.item.IndependencyId,
                    }
                },
                data() {
                    return {
                        StyleWithNavMenu: {
                            SubCollapseW: `268px`,
                            NameKpi: `303px`,
                            NameSub: '',
                            WDateCurrency: `1101px`,
                            IsShowCate: true
                        },
                    };
                },
                created() {
                    this.View_TitleAction = MsaApp.getActionTitle(this.item.Id);
                    this.updateListSubExpand(this.item.Id, this.IsExpand);    // goi ham nay vi watch chua hoat dong neu IsExpand = true (duoc lay tu tu .getIsExpand(...))
                    window.addEventListener("resize", this.handlerSize);
                },
                mounted() { this.handlerSize(); },
                updated() { this.handlerSize(); },
                methods: {
                    handlerSize(e) {
                        const rWrap = typeof this.$el.querySelector == 'function' ? this.$el.querySelector('.handleResize') : null;
                        if (rWrap && rWrap.offsetWidth < 1277) {
                            this.StyleWithNavMenu.SubCollapseW = '291px';
                            this.StyleWithNavMenu.NameSub = '174px';
                            this.StyleWithNavMenu.WDateCurrency = '1146px';
                            this.StyleWithNavMenu.NameKpi = '315px';
                            this.StyleWithNavMenu.IsShowCate = false;
                            rWrap.querySelector('.handleResizeCount').style.width = '128px';
                        } else {
                            this.StyleWithNavMenu.SubCollapseW = '268px';
                            this.StyleWithNavMenu.NameSub = '';
                            this.StyleWithNavMenu.WDateCurrency = '1101px';
                            this.StyleWithNavMenu.NameKpi = '303px';
                            this.StyleWithNavMenu.IsShowCate = true;
                            if (rWrap) rWrap.querySelector('.handleResizeCount').style.width = '';
                        }
                    },
                },      // methods
                destroyed() {
                    window.removeEventListener("resize", this.handlerSize);
                },
            });
        });
    });
    Vue.component('ItemMainSub', (resolve) => {
        $.get(`${__rootFolder__}/${_MainSubFolder_}/ItemMainSub.html`, template => {
            resolve({
                template: template,
                props: ['item', 'StartDatemain', 'Datemain'],
                inject: ['HoverTooltipStatusProtocol', 'getMaingoalId', 'getRole', 'getChildrenGaSg', 'getChildrenGaPrd',
                    'loadAllGoalActionInOpenArea', 'pEditMenuGoal', 'checkRegionView', 'MainOverViewAddSubGoal',
                    'deleteMainGoal', 'isEditMain', 'getIndependencyId', 'getIsMaster', 
                    'getProductId', 'getRegionId', 'getSubMarketId', 'getSubMarketProductId', 'countSub',
                    'setApLinkOverviewUrl', 'isShowMainOverview'],
                data() {
                    return {
                        IsMenuShow: false,
                        Description: '',
                        Purpose: '',
                        Effect: '',
                        Arrived: '',
                        ExpectedEffect: '',
                        ActualEffect: '',                        
                        delay: 700,
                        clicks: 0,
                        timer: null,
                    };
                },
                computed: {
                    kLg() {
                        return kLg;
                    },
                    IsMain() {
                        return !!this.item.ListSubGoal;
                    },
                    StartDate() {
                        if (!this.item.StartDate) return '';
                        const s = this.item.StartDate.jsonToDate();
                        return kendo.toString(s, "d");
                    },
                    EndDate() {
                        if (!this.item.Date) return '';
                        const e = this.item.Date.jsonToDate();
                        return ` — ${kendo.toString(e, "d")}`;
                    },
                    ExpectedCost() {
                        if (!this.item.ExpectedCost) return '';
                        return vmCommon.formatCost(this.item.ExpectedCost);
                    },
                    ActualCost() {
                        if (!this.item.ActualCost) return '';
                        return vmCommon.formatCost(this.item.ActualCost);
                    },
                    ValueCost() {
                        var isOverdueCost = this.item.Budget !== null && this.item.Budget > 0;
                        if (isOverdueCost)
                            return vmCommon.formatOriginCost(this.item.Budget - this.item.ExpectedCost);
                        return;
                    },
                    ValueCostEx() {
                        var isOverdueCostEx = this.item.Budget != null && this.item.Budget > 0;
                        if (isOverdueCostEx)
                            return vmCommon.formatCost(this.item.Budget);
                        return;
                    },
                    Style() {
                        var s = { BgColor: 'white', Color: 'rgb(77, 77, 77)' };
                        if (this.IsMain) {
                            s.BgColor = '#E4F5DA';
                        }

                        return s;
                    },
                    IdDirect() {
                        if (MsaApp.IsShowNavigationMenu)
                            return `nav_${this.item.Id}`;
                        return this.item.Id;
                    },
                    ColorKpi() {
                        var ColorKpi = "";
                        if (this.item.KpiOverViewPercent < 49.5) {
                            ColorKpi = "msa-kpi-bg60";
                        } else if (this.item.KpiOverViewPercent <= 69.49) {
                            ColorKpi = "msa-kpi-bg60-80";
                        } else {
                            ColorKpi = "msa-kpi-bg80";
                        }
                        return ColorKpi;
                    },
                    KpiOverview() {
                        const goal = this.item;
                        return MsaApp.getKpiOverview(goal);   // { ClsArrow, ClsBg, KpiBg }
                    },
                    
                    HasFileAssigned() {
                        var isShowFile = (!this.item.Finish && this.item.IsColor) || (this.item.Finish || !this.item.IsColor);
                        return isShowFile && this.item.AssignFile > 0;
                    },
                    bindiconassignfile() {
                        var iconAssignfile = "";
                        if (this.HasFileAssigned) {
                            iconAssignfile = "icon-assignfile-finish";
                        }
                        return iconAssignfile;
                    },
                    HasReminder() {
                        const goal = this.item;
                        return goal.CheckReminder > 0 && ((!goal.Finish && goal.IsColor) || (goal.Finish || !goal.IsColor));
                    },
                    IconAddsubgoal() {
                        var IconAddsubgoal = 'msa-ic-font font-plus';

                        return IconAddsubgoal;
                    },
                    hasSearchTypeCritias() { return this.item.HasSearchTypeCritirias; },
                    ColorApEvaluation() {
                        var x = this.item.ApEvaluation;
                        return ChoseColorPercent(x);
                    },
                    LastActiveClass() {
                        var isLastFocus = MsaApp.getLastActiveElementId() == this.item.Id;
                        if (isLastFocus) return 'last-active-element';
                        return '';
                    },
                    ContainFilterResult() {
                        return this.item.IsShow > 0 && this.item.IsColor ? "finish-element-style" : "";
                    },
                    mstype() {
                        if (this.IsMain) return 'mainGoal';
                        return 'subGoal';
                    },
                    evaltype() {
                        if (this.IsMain)
                            return vmCommon.enumType.Goal;// 'maingoal';
                        return vmCommon.enumType.SubGoal; //'subgoal';
                    },
                    Typeid() {
                        if (this.IsMain) return vmCommon.GoalActionContentType.MainGoal;
                        return vmCommon.GoalActionContentType.SubGoal;
                    },
                },
                provide() {
                    return {
                        onMenuSortAction: this.onMenuSortAction,
                        duplicateMainSub: this.duplicateMainSub,
                        pExportDocxMainSub: this.ExportDocxMainSub,
                        pGotoMixfromMainSub: this.GotoMixfromMainSub,
                        pGotoRoadmapfromMainSub: this.GotoRoadmapfromMainSub,
                        getFileDOCX: this.getFileDOCX,
                        deleteGoal: this.deleteGoal,
                        onClickOpenMenu: this.onClickOpenMenu,
                        expandApLinkOverviewUrl: this.expandApLinkOverviewUrl,
                        // export computed value to children
                        TypeId: this.Typeid,                        
                    }
                },
                updated() {
                    this.reloadConnection();
                },
                mounted() { 
                    this.reloadConnection();
                },
                methods: {
                    onMouseOverHideTooltip(e) {     //onMouseOverShowTooltip
                        const $target = $(e.target);
                        const $elm = $target.parent().find('.TooltipFullMaingoal')
                        var tt = $elm.data("kendoTooltip");
                        if (tt) tt.destroy();     //dnbIgnoreShowTooltipNameDes
                    },
                    reloadConnection: function () {
                        var linkControl = vmCommon.deepCopy(MsaApp.apLinkService().getInfo());
                        if (linkControl.goalActionId) {
                            var id = this.item.Id;
                            var typeid = this.Typeid;
                            var areaid = this.item.IndependencyId || this.item.SubMarketProductId;

                            if (linkControl.areaId == areaid && linkControl.goalActionTypeId == typeid && linkControl.goalActionId == id) {
                                if (!linkControl.isCollapse)
                                    MsaApp.apLinkService().open(areaid, typeid, id);
                            }
                        }
                    },
                    onClickOpenMenu(elm) {              //ItemMainSub
                        var _ulMenu = this.$el.querySelector('ul.msa-goal-menu-inside');

                        if (!this.IsMain) {     // subgoal
                            const $target = $(elm).closest('.dnbWrapperGoal');//onMouseleaveHideMenu
                            $target.css({'z-index' : '6'});
                        }

                        if (this.isMenuShowTop(elm)) {
                            _ulMenu.classList.add('dnb-set-top');
                        } else {
                            _ulMenu.classList.remove('dnb-set-top');
                        }
                        this.IsMenuShow = true;
                    },
                    isMenuShowTop(elm) {
                        var _menuHeight = 180;
                        var rect = elm.getBoundingClientRect();
                        var _limBottom = rect.y + _menuHeight + 51;
                        return _limBottom > window.outerHeight;
                    },
                    getFileDOCX() {
                        return;
                        var entry = { Id: this.item.Id, TypeId: this.Typeid };
                        vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                            var state = res.value.ResultStatus;
                            var fileInfo = res.value.TheObject;
                            if (state == vmCommon.ResultState.SUCCESS) {
                                vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                            }
                        });
                    },
                    gotoMix() {
                        return;
                        vmGoalAction.gotoMixService.gotoMix(this.item.Id)
                    },
                    gotoRoadmap() {
                        return;
                        vmGoalAction.gotoRMService.gotoRoadMap(this.item.Id)
                    },
                    deleteGoal(e) {                 // Delete
                        MsaApp.hideAllMenuDropdown();
                        if (this.Typeid == vmCommon.GoalActionContentType.MainGoal) {
                            this.deleteMainGoal();
                        } else
                            this.deleteSubGoal();
                    },
                    expandApLinkOverviewUrl() {
                        var id = this.item.Id;
                        var typeid = this.Typeid;
                        var areaid = this.item.IndependencyId || this.item.SubMarketProductId;

                        MsaApp.apLinkService().open(areaid, typeid, id);
                    },
                    openPopUpFileAssignFromDisplay() {
                        var goalId = this.item.Id;
                        var type = this.evaltype;
                        openPopUpFileAssignFromDisplay();
                        function openPopUpFileAssignFromDisplay() {
                            vmFile.setAssignedU(goalId, type, 1);       // edit = 1, add new = 0

                            vmFile.objectId = goalId;
                            var url = "../Handlers/DFolderHandler.ashx?funcName=getoldassignedfile&projid=" + projectId + "&strid=" + strategyId;
                            callAjax("file-loading", url, JSON.stringify({ assignidu: goalId, type: type }), function (res) {
                                vmFile.oldAssignedFile = res.Data;
                                vmFile.CurrentRole = res.Role;

                                vmFile.idFileAssigned.fileids = [];
                                vmFile.idFileAssigned.contents = [];
                                vmFile.contentFileAssigned = [];
                                vmGoalAction.checkOpenPopup = true;

                                if (vmFile.oldAssignedFile) {
                                    vmCommon.pushApply(vmFile.idFileAssigned.fileids, vmFile.oldAssignedFile, function (item) { return "cbx" + item.Id; });
                                    vmCommon.pushApply(vmFile.idFileAssigned.contents, vmFile.oldAssignedFile);
                                    vmCommon.pushApply(vmFile.contentFileAssigned, vmFile.oldAssignedFile);

                                    vmFile.elementid = goalId;
                                    vmFile.idFileAssigned.assigntype = type;        // vmCommon.enumType.Goal, vmCommon.enumType.SubGoal
                                    vmFile.idFileAssigned.assignidu = goalId;

                                    if (vmFile.oldAssignedFile.length > 0 || vmFile.CurrentRole === vmCommon.MemberRole.View) {
                                        vmFile.openPopUpFileAssign();
                                    } else {
                                        vmFile.openPopUpToAssign('openassign');
                                    }
                                }
                            }, AjaxConst.PostRequest);
                        }
                    },
                    onclickDetailkpi(e) { },
                    onMenuSortAction(e) { },
                    duplicateMainSub() {
                        const isMastergoal = this.getIsMaster().MasterGoal;
                        const isMain = this.IsMain;
                        const indId = this.item.IndependencyId;
                        const smpId = this.item.SubMarketProductId;
                        const info = {
                            CurrencyName: this.item.CurrencyName,
                            IndependencyId: indId,
                            IsMasterGoal: isMastergoal,
                            ProductId: this.getProductId(),
                            RegionId: this.getRegionId(),
                            SubMarketId: this.getSubMarketId(),
                            SubMarketProductId: smpId
                        }
                        const entryData = {
                            enddate: this.item.Date,
                            goalId: this.item.Id,
                            isMainGoal: isMain,
                            mdf: this.item.Mdf,
                            startdate: this.item.StartDate
                        }                        
                        var message = kLg.msgConfirmDuplicateMG;
                        var mainGoalName = isMain ? this.item.Name : '';
                        const lstSM = isMain ? this.getChildrenGaPrd() : this.getChildrenGaSg();     // ref array
                        const refMS = vmCommon.deepCopy(this.item);
                        return ynConfirmDuplicate(message, entryData.startdate, entryData.enddate).then(function () {                            
                            var sdate = $('#txtCopyStartDate').data("kendoDatePicker").value();
                            var edate = $('#txtCopyEndDate').data("kendoDatePicker").value();
                            if ($("#txtCopyStartDate").data("kendoDatePicker").enable() !== false) {
                                entryData.startdate = vmCommon.tryToServerDate(sdate);
                            }
                            if ($("#txtCopyEndDate").data("kendoDatePicker").enable() !== false) {
                                entryData.enddate = vmCommon.tryToServerDate(edate);
                            }
                            console.log(entryData.startdate, entryData.enddate)
                            if(!!entryData.startdate) refMS.StartDate = `/Date(${new Date(entryData.startdate).getTime()})/`;
                            if(!!entryData.enddate) refMS.Date = `/Date(${new Date(entryData.enddate).getTime()})/`;
                            else refMS.Date = null;
                            lstSM.push(refMS);
                            return;
                            vmGoalAction.dataservice.duplicateGoal(entryData, function (serData) {
                                if (!serData.value.MainGoalId) {
                                    pAlert(kLg.msgConflickData).then(function () {
                                        MsaApp.updateDataProductOrTheme_Expand_InView_Observer();       //[ItemMainSub].duplicateMainSub
                                    });
                                    return;
                                } else {
                                    var maingoalId = serData.value.MainGoalId;
                                    var goalIdArr = serData.value.GoalId;

                                    if (isMain) {
                                        MsaApp.pushExpand(maingoalId, 'maingoal');
                                        MsaApp.setLastActiveElement(maingoalId);
                                        MsaApp.pushLoadTimeActions('vmGoalActionDataserviceDuplicateGoal');
                                    } else {
                                        if (goalIdArr.length) {
                                            MsaApp.pushExpand(maingoalId, 'maingoal', 'nochange');
                                            goalIdArr.forEach((sgId, _i) => {
                                                if (_i + 1 == goalIdArr.length) {   // phan tu cuoi cung
                                                    MsaApp.pushExpand(sgId, 'subgoal');
                                                } else {
                                                    MsaApp.pushExpand(sgId, 'subgoal', 'nochange');
                                                }
                                            });
                                        } else
                                            MsaApp.pushExpand(maingoalId, 'maingoal');
                                        
                                        if (goalIdArr.length > 0) {
                                            MsaApp.setLastActiveElement(goalIdArr[0]);
                                            MsaApp.pushLoadTimeActions('vmGoalActionDataserviceDuplicateGoal');
                                        }
                                    }
                                    if (mainGoalName !== "") {
                                        vmGoalAction.goalFilterService.updateItemFilter(info.SubMarketProductId ? info.SubMarketProductId : info.IndependencyId, { Id: serData.value.GoalId, Name: mainGoalName });
                                    }
                                    if (info.IsMasterGoal)
                                        msFilter.controlService.reLoadDataFilter();

                                    MsaApp.reloadAllDataOfPage();
                                }
                            });
                        });
                    },
                    ExportDocxMainSub() {
                        return;
                        var typeId = this.Typeid;
                        var entry = { Id: this.item.Id, TypeId: typeId };
                        vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                            var state = res.value.ResultStatus;
                            var fileInfo = res.value.TheObject;
                            if (state == vmCommon.ResultState.SUCCESS) {
                                vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                            }
                        });
                    },
                    GotoMixfromMainSub() {
                        return;
                        vmGoalAction.gotoMixService.gotoMix(this.item.Id)
                    },
                    GotoRoadmapfromMainSub() {
                        return;
                        vmGoalAction.gotoRMService.gotoRoadMap(this.item.Id)
                    },
                    deleteSubGoal() {
                        var smkId = this.item.SubMarketProductId;
                        var inpId = this.item.IndependencyId;
                        var productId = this.getProductId();
                        var goalId = this.item.Id;
                        const isMastergoal = this.getIsMaster().MasterGoal;
                        var info = {
                            CurrencyName: this.item.CurrencyName,
                            goalType: vmCommon.GoalActionContentType.SubGoal,
                            IndependencyId: inpId,
                            IsMasterGoal: isMastergoal,
                            productId: productId,
                            RegionId: this.getRegionId(),
                            SubMarketId: this.getSubMarketId(),
                            SubMarketProductId: smkId
                        };
                        var entryData = {
                            goalId: goalId,
                            mdf: this.item.Mdf,
                        };
                        var smkId = info.SubMarketProductId;
                        var inpId = info.IndependencyId;
                        var maingoalId = this.getMaingoalId(); 
                        var titleSubGoal = MsaApp.getSubgoalTitle(maingoalId);

                        MsaApp.hideAllMenuDropdown();
                        const lstSg = typeof this.getChildrenGaSg == 'function' ? this.getChildrenGaSg() : [];  // ref array
                        console.log(lstSg, goalId)
                        pConfirm(kLg.confirmDeleteSG1 + titleSubGoal + kLg.confirmDeleteSG2).then(function () {
                            const lstSgId = lstSg.map(s => s.Id);
                            const i = lstSgId.indexOf(goalId);
                            if(i > -1) {
                                lstSg.splice(i, 1);
                                MsaApp.deleteEvalXYZ(entryData.goalId)
                            }
                        });
                    },
                    dblclickApEvarluation(e) {      //ItemMainSub
                        var goalId = this.item.Id;
                        var IndependencyId = this.item.IndependencyId;
                        var productId = this.getProductId();
                        var SubMarketProductId = this.item.SubMarketProductId;
                        vmCommon.DblClickApEvalRegionRole = this.getRole();
                        var info = {
                            CurrencyName: this.item.CurrencyName,
                            IndependencyId: IndependencyId,
                            IsMasterGoal: this.item.IsMasterGoal,
                            productId: productId,
                            RegionId: this.getRegionId(),
                            SubMarketId: this.getSubMarketId(),
                            SubMarketProductId: SubMarketProductId
                        };
                        var objectType = !this.item.ParentId ? vmCommon.GoalActionContentType.MainGoal : vmCommon.GoalActionContentType.SubGoal;
                        var entryData = { goalType: objectType,goalId: goalId, independencyId: IndependencyId, regionId: info.RegionId, productId: info.productId, subMarketId: info.SubMarketId, subMarketProductId: info.SubMarketProductId };
                        vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                            if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                vmGoalAction.showPopupGoalActionEval_Edit(serData.value, objectType);

                                vmGoalAction.goalActionEvalOptions.cb = function () {
                                    MsaApp.loadOpenProducts(info.SubMarketProductId);
                                    MsaApp.loadOpenIndependencies(info.IndependencyId);
                                    if (MsaApp.NavigationMenuView.length) {
                                        MsaApp.reloadDataContentRightView();
                                    }
                                };
                            }
                        });
                    },
                    clickApEvarluation(target) {
                        const tlp = this.$root.initAndShowEvarluationXYZ;
                        if (typeof tlp == 'function' && !vmCommon.IsShowTooltipChartEvalXYZ) {
                            const item = this.item;
                            tlp($(target), item.Id, item.Color);
                        }
                    },
                    onHoverShowTooltipAddSub(target) {
                        var maingoalId = this.getMaingoalId(); 
                        var title = MsaApp.getSubgoalTitle(maingoalId);
                        var des = kLg.strAddFormat.format(title);
                        MsaApp.onHoverShowTooltipAddGoalAction(target, des, 'top');
                    },
                    onDestroyTooltipAddSub(target) {
                        // Destroy de cap nhat lai title subgoal sau khi update inline
                        $(target).popover('destroy');
                    }
                }
            });
        });
    });

    /* Dung chung cho 2 components
     * MsaMainGoalOverView,
     * NavMenuViewMaingoal
     */
    const mixinMainGoalOverView = {        // dung mixin de ke thua cho navigation menu
        props: ['goal', 'bg', 'itemtype'],
        inject: ['getIsExpand', 'onDragMoveGoal', 'isDraggable', 'getChildrenGaPrd',
            'onDragStartMaingoal', 'onDragChangeMaingoal', 'onDragEndMaingoal', 'onDragMoveGoal',
            'getGroupSub', 'getGroupMainExpand'],
        provide() {
            return {
                getMaingoalId: () => { return this.goal.Id; },
                getParentMainStartDate: () => { return this.goal.StartDate; },
                getMainEndDate: () => { return this.goal.Date; },
                getMaingoalStartDate: () => MsaApp.getMaingoalStartDate(this.goal),
                getMaingoalValueCosto: this.getValueCosto,
                countSub: () => { return this.goal.ListSubGoal.length; },
                isShowMainOverview: () => { return !!this.goal.Name; },
                deleteMainGoal: this.deleteMainGoal,
                showTooltipMainSub: this.showTooltipMainSub,
                setSubgoalReduceSize: (subgoal, isReduce) => {
                    var lstM = MsaApp.MapListMain.get(subgoal.SubMarketProductId);
                    if (!lstM) lstM = MsaApp.MapListMain.get(subgoal.IndependencyId);
                    if (lstM) {
                        const goal = lstM.find(g => g.Id == subgoal.ParentId);
                        if (goal) {
                            const subG = goal.ListSubGoal.find(sg => sg.Id == subgoal.Id);
                            if (subG) {
                                subG.IsReduceSize = isReduce;
                            }
                        }
                    }
                    // View Ben phai khi co navigation menu
                    var _goal;
                    lstM = MsaApp.NavigationMenuView.find(it => it.Id == subgoal.SubMarketProductId);
                    if (!lstM) lstM = MsaApp.NavigationMenuView.find(it => it.Id == subgoal.IndependencyId);
                    if (lstM && lstM.ListMainGoal) {
                        // Neu la view Product/Theme
                        _goal = lstM.ListMainGoal.find(g => g.Id == subgoal.ParentId);
                    } else {
                        _goal = MsaApp.NavigationMenuView.find(g => g.Id == subgoal.ParentId);
                    }

                    if (_goal) {
                        const subG = _goal.ListSubGoal.find(sg => sg.Id == subgoal.Id);
                        if (subG) {
                            subG.IsReduceSize = isReduce;
                        }
                    }
                },
                AddnewColumn: 'fakeFunc', getColumnId: () => { return -1; }, showPopupAddAction: () => { },
                pEditMenuGoal: this.pEditMenuGoal,
                getIsVisible: () => { return this.ViewVisible.ShowOverview; },
                getView_TitleSubAction: () => { return this.View_TitleSubgoal; },
                MainOverViewAddSubGoal: this.overViewAddSubGoal,                
                onMouseOverCheckShowExceededCost: (target) => {
                    var $target = $(target);
                    if (!$target.hasClass('dnbOnOverCheckShowExceedCost')) {
                        $target = $target.closest('.dnbOnOverCheckShowExceedCost');
                    }
                    if ($target.hasClass('exceeded-cost')) {
                        $target.tooltip("destroy");
                        $target.attr("title", kLg.msgExceededCost);
                        $target.tooltip({ trigger: "hover" }).tooltip('show');
                    }
                },
                updateListSubExpand: (sgId, isExpand) => {
                    if (isExpand) {
                        if (!this.ListSubExpand.includes(sgId))
                            this.ListSubExpand.push(sgId);
                    } else {
                        const i = this.ListSubExpand.indexOf(sgId);
                        if (i > -1) this.ListSubExpand.splice(i, 1);
                    }
                },
                onDragStartSubgoal: this.onDragStartSubgoal,
                onDragChangeSubgoal: this.onDragChangeSubgoal,
                onDragEndSubgoal: this.onDragEndSubgoal,
                getDragdropSubOptions: () => { return this.DragdropOptions; },
                isRegionOverView: this.isRegionOverView,
                getChildrenGaSg: () => {return this.goal.ListSubGoal; },
            }
        },
        data() {
            var isExp =  this.getIsExpand(this.goal.Id, this.itemtype);
            return {
                IsExpand: isExp,
                IsMenuShow: false,
                ActionTitle: '',
                isNav: true,
                hasSearchTypeCritias: this.goal.HasSearchTypeCritirias,
                ListSubExpand: [],
            };

        },
        beforeMount() {
            if (!this.IsExpand) {
                if (this.countMain() == 1) {
                    this.IsExpand = true;       // Expand neu main chi co 1 Sub
                }
            }
        },
        computed: {
            ClassExpandCollapseSub() {
                const lenSub = Array.isArray(this.goal.ListSubGoal) ? this.goal.ListSubGoal.length : 0;
                if (!lenSub) return 'font-arrow-right';
                const lenExpSub = this.ListSubExpand.length;
                if (lenExpSub) return 'font-arrow-down';
                return 'font-arrow-right';
            },
            kLg() { return kLg; },
            UiStyle() {
                return {
                    bg: `#${this.bg} !important`
                }
            },
            MgId() { return this.goal.Id; },
            DragdropOptions() {                     //MsaMainGoalOverView
                const isDrg = this.isDraggable();

                return {
                    animation: 100, sort: true,
                    disabled: !isDrg,
                    ghostClass: "ghost-subgoal",            // maingoal overview
                    chosenClass: "chosenClass"
                }
            },
            ViewVisible() {     // Main goal
                var isShowAll = msFilter.controlService.hasHiddenElements(mFilter.enumFilterVisibility.ShowAll);
                var isHide = msFilter.controlService.hasHiddenElements(mFilter.enumFilterVisibility.Hide);

                var mainCount = this.goal.IsShow > 0 && this.goal.Name != null && this.goal.Name.length > 0 ? 1 : 0, subCount = 0, actionCount = 0;
                var hasHiddenElement = false;
                if (this.goal.IsShow == 0) hasHiddenElement = true;


                var subs = this.goal.ListSubGoal ? this.goal.ListSubGoal : [];      // check undefined trong truong hop tao moi Goal 
                for (var i = 0; i < subs.length; i++) {
                    if (subs[i].IsShow > 0 && subs[i].Name != null && subs[i].Name.length > 0) subCount += 1;
                    if (subs[i].IsShow == 0) hasHiddenElement = true;

                    var actions = subs[i].ListAction ? subs[i].ListAction : [];      // check undefined trong truong hop keo tha main => sub, ...
                    for (var j = 0; j < actions.length; j++) {
                        if (actions[j].IsShow) actionCount += 1;
                        if (actions[j].IsShow == 0) hasHiddenElement = true;
                    }
                }

                return {
                    ViewCount: `${mainCount} | ${subCount} | ${actionCount}`,
                    ClassVisible: 'font-auge', IsInVisible: !isHide && !isShowAll && hasHiddenElement,
                    ShowOverview: this.goal.IsShow > 0, IsShowSubgoalName: (subCount < 1 && actionCount < 1) ? false : true
                };

            },
            ViewRightType() { return 'MaingoalDefault' },
            SumAction() {
                if (!Array.isArray(this.goal.ListSubGoal)) return -1;
                const lS = this.goal.ListSubGoal.filter(s => Array.isArray(s.ListAction) && s.ListAction.length > 0);
                return lS.map(s => s.ListAction.length).reduce(function (a, b) { return a + b }, 0);
            },
        },
        methods: {
            isRegionOverView() { return this.goal.IsRegionView; },
            CollapseExpandsubAll(e) {
                const lstSg = this.$refs['RefViewSubGoal'];
                if (Array.isArray(lstSg)) {
                    MsaApp.pushLoadTimeActions('MaingoalOverviewCollapseExpandsubAll');
                    const lstIds = lstSg.map(s => s.item.Id);
                    if (this.ClassExpandCollapseSub == 'font-arrow-right') {
                        // expand all
                        lstSg.filter(s => !s.IsExpand).filter(sg => {
                            sg.IsExpand = true;
                            return true;
                        });
                        MsaApp.pushExpandListSubgoal(lstIds, true);
                        return;
                    }
                    // collapse all
                    lstSg.filter(s => s.IsExpand).filter(sg => {
                        sg.IsExpand = false;
                        return true;
                    });
                    MsaApp.removeExpandListSubgoal(lstIds, true);
                }
            },
            setAllExpand_Or_Collapse(isExpand) {        // goi tu Product || Theme
                this.IsExpand = isExpand;
            },
            dataservice() {
                var rootUrl = "/Handlers/MsGoalAction.ashx?funcName={funcName}&projid=" + projectId + "&lang=" + kLg.language + "&strid=" + strategyId;
                const urlBuilder = function (funcName) {
                    return rootUrl.replace('{funcName}', funcName);
                };
                const base = (funcName, entryData) => {
                    this.loading = true;
                    return callAjaxPromise(urlBuilder(funcName), entryData).then(data => Promise.resolve(data)).catch(error => {
                        this.errored = true;
                    }).finally(() => this.loading = false);
                };
                var changeTitleMainGoal = function (entryData) {
                    return base("changeTitleMainGoal", entryData).then(data => {
                        MsaApp.ListTitle = data.value;
                    });
                };
                var changeTitleSubGoal = function (entryData) {
                    return base("changeTitleSubGoal", entryData).then(data => {
                        MsaApp.ListTitle = data.value
                    });
                };
                return {
                    base: base,
                    changeTitleMainGoal: changeTitleMainGoal,
                    changeTitleSubGoal: changeTitleSubGoal
                };

            },
            getValueCosto(goal) {
                var isOverdueCost = goal.Budget !== null && goal.Budget > 0;
                if (isOverdueCost)
                    return vmCommon.formatOriginCost(goal.Budget - goal.ExpectedCost);
                return;
            },
            toggleMainDetail(e) {           // click
                if (this.ViewRightType == 'MaingoalNavMenu') return;        // view theo Navigation Menu thi khong click expand

                const thisR = this;
                const goalId = this.goal.Id;
                MsaApp.ClcCountEditColumn += 1;
                if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                    MsaApp.ClcTimerEditColumn = setTimeout(function () {
                        if (MsaApp.ClcCountEditColumn > 1) {        // dblclick
                            // xử lý sự kiệm dbclick
                        } else {                                    // click
                            // xử lý sự kiện single click
                            const isE = thisR.IsExpand;
                            thisR.IsExpand = !isE;
                            if (thisR.IsExpand) {                                
                                MsaApp.pushExpand(goalId, 'maingoal');
                            } else {                                
                                MsaApp.removeExpand(goalId, 'maingoal');
                            }
                        }
                        MsaApp.ClcCountEditColumn = 0;          // xóa click count
                        clearTimeout(MsaApp.ClcTimerEditColumn);// xóa timmer 
                        MsaApp.ClcTimerEditColumn = undefined;  // set timmer về updefinded để chạy lệnh if (typeof MsaApp.ClcTimerEditColumn == 'undefined')
                    }, 333);
            },
            onMouseLeaveMenu(el) {
                if (this.IsMenuShow) {
                    el.classList.remove('open');
                    this.IsMenuShow = false;
                }
            },
            onClickOpenMenu(elm) {
                var _ulMenu = this.$el.querySelector('ul.msa-goal-menu');

                if (this.isMenuShowTop(elm)) {
                    _ulMenu.classList.add('dnb-set-top');
                } else {
                    _ulMenu.classList.remove('dnb-set-top');
                }
                this.IsMenuShow = true;
            },
            isMenuShowTop(elm) {
                var _menuHeight = 180;
                var rect = elm.getBoundingClientRect();
                var _limBottom = rect.y + _menuHeight + 51;
                return _limBottom > window.outerHeight;
            },
            pEditMenuGoal(item, title) {
                var parentid = item.ParentId;
                const act = !parentid ? 'vmGoalAction.openPopupMainGoal' : 'vmGoalAction.openPopupSubGoal';

                var goalId = item.Id;
                const isMastergoal = this.getIsMaster().MasterGoal;

                var info = {
                    CurrencyName: this.goal.CurrencyName,
                    IndependencyId: item.IndependencyId,
                    IsMasterGoal: isMastergoal,
                    ProductId: this.getProductId(),
                    RegionId: this.getRegionId(),
                    SubMarketId: this.getSubMarketId(),
                    SubMarketProductId: item.SubMarketProductId
                };
                var entryData = {
                    goalId: goalId,
                    independencyId: info.IndependencyId,
                    regionId: info.RegionId,
                    productId: info.ProductId,
                    subMarketId: info.SubMarketId,
                    subMarketProductId: info.SubMarketProductId,
                    parentId: parentid,
                    goalType: !parentid ? vmCommon.GoalActionContentType.MainGoal : vmCommon.GoalActionContentType.SubGoal
                };
                MsaApp.editGoal(entryData, info,
                    kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2, act);

            },
            onMouseoverTooltipMaingoal(e) {
                if (MsaApp.DragDropGoal.LastEvent != '') return;
                const $elm = $(e.target);

                const item = this.goal;
                this.showTooltipMainSub(item, $elm);
            },
            showTooltipMainSub(item, $elm) {
                var tt = $elm.data("kendoTooltip");

                const isEmptyB = !item.Description && !item.Arrived && !item.Effect && !item.Purpose;

                if (isEmptyB) {
                    if (tt) tt.destroy();
                    return;
                }

                if (tt) {
                    return;
                }

                const tooltipObj = {
                    Description: item.Description,
                    Arrived: item.Arrived,
                    Effect: item.Effect,
                    Purpose: item.Purpose
                }

                MsaApp.initAndShowKendoTooltip(tooltipObj, $elm);
            },
            getFileDOCX() {
                return;
                var entry = { Id: this.goal.Id, TypeId: vmCommon.GoalActionContentType.MainGoal };
                vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                    var state = res.value.ResultStatus;
                    var fileInfo = res.value.TheObject;
                    if (state == vmCommon.ResultState.SUCCESS) {
                        vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                    }
                });
            },
            gotoMix() {
                return;
                var goalId = this.goal.Id;
                vmGoalAction.gotoMixService.gotoMix(goalId)
            },
            gotoRoadmap() {
                return;
                var goalId = this.goal.Id;
                vmGoalAction.gotoRMService.gotoRoadMap(goalId)
            },
            overViewAddSubGoal(e) {
                const isMastergoal = this.getIsMaster().MasterGoal;
                var productId = this.getProductId();
                const independencyId = this.goal.IndependencyId;
                const titlesub = this.View_TitleSubgoal;
                var info = {
                    CurrencyName: this.goal.CurrencyName,
                    IndependencyId: independencyId,
                    IsMasterGoal: isMastergoal,
                    ProductId: productId,
                    RegionId: this.getRegionId(),
                    SubMarketId: this.getSubMarketId(),
                    SubMarketProductId: this.goal.SubMarketProductId
                };
                var entryData = {
                    goalId: vmCommon.emptyGuid,
                    independencyId: independencyId,
                    regionId: info.RegionId,
                    productId: productId,
                    parentId: this.goal.Id,
                    subMarketId: info.SubMarketId,
                    subMarketProductId: info.SubMarketProductId,
                    goalType: vmCommon.GoalActionContentType.SubGoal
                };
                vmCommon.RefLstGa = this.goal.ListSubGoal;  // ref Array
                MsaApp.editGoal(entryData, info,
                    kLg.titlepAddMainGoalNew1 + htmlEscape(titlesub) + kLg.titlepAddMainGoalNew2,
                    'vmGoalAction.showAddSubgoalFromMainOverview', vmCommon.deepCopy(this.goal));                    
            },
            deleteMainGoal(e) {
                var goalId = this.goal.Id;
                var titleMainGoal = this.View_TitleMaingoal;
                const lstMg = this.getChildrenGaPrd();  // ref Array
                pConfirm(kLg.confirmDeleteMG1 + titleMainGoal + kLg.confirmDeleteMG2).then(function () {
                    const lstMgId = lstMg.map(m => m.Id);
                    let i = lstMgId.indexOf(goalId);
                    if(i > -1) lstMg.splice(i, 1); // remove
                });
            },
            onDragStartSubgoal(evt) {    //onDragStartTheme
                MsaApp.hideAllTooltipDes();     //onDragStartSubgoal
                MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                MsaApp.DragDropGoal.LastEvent = 'onDragStartSubgoal';

                const sumAction = evt.item.getAttribute('sum-action');
                if (sumAction > 0) {
                    MsaApp.DragDropGoal.GroupMain = 'MIndexMaingoal';
                }
            },
            onDragChangeSubgoal(evt) {
                if (evt.moved) {
                    MsaApp.DragDropGoal.iFrom = evt.moved.oldIndex;
                    MsaApp.DragDropGoal.iTo = evt.moved.newIndex;
                    MsaApp.DragDropGoal.LastEvent = 'onDragChangeSubgoal_moved';
                } else {
                    if (evt.added) {
                        MsaApp.DragDropGoal.iTo = evt.added.newIndex;
                    }
                    if (evt.removed) {
                        MsaApp.DragDropGoal.LastEvent = 'onDragChangeSubgoal_removed';
                        MsaApp.DragDropGoal.iFrom = evt.removed.oldIndex;
                    }
                }
            },
            onDragEndSubgoal(evt) {
                const sumAction = evt.item.getAttribute('sum-action');
                if (sumAction > 0) {
                    MsaApp.DragDropGoal.GroupMain = 'MIndexMainSubgoal';
                }
                
                if (MsaApp.DragDropGoal.ChangeGoalEvent == 'ChangeGoalLevel') {

                    if (sumAction < 1)
                        MsaApp.changeGoalLevel();
                    else {
                        const smpid1 = typeof MsaApp.DragDropGoal.Src == 'object' ? MsaApp.DragDropGoal.Src.SmpId : null;
                        const smpid2 = typeof MsaApp.DragDropGoal.Des == 'object' ? MsaApp.DragDropGoal.Des.SmpId : null;

                        if (smpid1 == smpid2) {
                            if (smpid1) MsaApp.loadOpenProducts(smpid1);
                        } else {
                            if (smpid1) MsaApp.loadOpenProducts(smpid1);
                            if (smpid2) MsaApp.loadOpenProducts(smpid2);
                        }
                        const indid1 = typeof MsaApp.DragDropGoal.Src == 'object' ? MsaApp.DragDropGoal.Src.IndId : null;
                        const indid2 = typeof MsaApp.DragDropGoal.Des == 'object' ? MsaApp.DragDropGoal.Des.IndId : null;

                        if (indid1 == indid2) {
                            if (indid1) MsaApp.loadOpenIndependencies(indid1);
                        } else {
                            if (indid1) MsaApp.loadOpenIndependencies(indid1);
                            if (indid2) MsaApp.loadOpenIndependencies(indid2);
                        }
                        MsaApp.clearDragDropGoal();
                    }
                    return;
                }

                if (MsaApp.DragDropGoal.LastEvent == 'onDragChangeSubgoal_moved' && MsaApp.DragDropGoal.iFrom == MsaApp.DragDropGoal.iTo) {
                    MsaApp.clearDragDropGoal();
                    return;
                }

                if (MsaApp.DragDropGoal.LastEvent == 'onDragChangeSubgoal_moved') {
                    // dragdrop cung product
                    MsaApp.changePositionSubGoal();
                } else if (MsaApp.DragDropGoal.LastEvent == 'onDragChangeSubgoal_removed') {
                    if (!MsaApp.DragDropGoal.ChangeGoalEvent) {
                        MsaApp.clearDragDropGoalAndReloadData();
                    } else {
                        // dragdrop khac product (cung region hoac sang vung independence)
                        MsaApp.changePositionSubGoal();
                    }
                } else {
                    MsaApp.clearDragDropGoal();
                }
            },
        },
    }
    Vue.component('MsaMainGoalOverView', (resolve) => {
        $.get(`${__rootFolder__}/${_MainSubFolder_}/ViewMaingoal.html`, template => {
            resolve({
                template: template,
                mixins: [mixinMainGoalOverView],       // dung mixin de ke thua cho navigation menu 
                inject: ['setCollapExpandAllMain', 'countMain', 'getViewRightWidth', 'getListMain',
                    'getRegionId', 'getIsMaster', 'getProductId', 'getSubMarketId', "getViewType", 'getRole'],
                provide() {
                    return {
                        getCssExceedCost: () => { return this.CssExceedCost; },
                        getSubMarketProductId: () => { return this.goal.SubMarketProductId; },
                        getIndependencyId: () => { return this.goal.IndependencyId; },
                        isEditMain: () => { return this.goal.IsEdit; },
                    }
                },
                data() {
                    MsaApp.componentService(this.getViewType()).set(this.goal.Id, this);
                    //actionPlanComponents[this.goal.Id] = this;

                    return {
                        IsEditTitleMain: false,
                        View_TitleMaingoal: kLg.labelMainGoalName,
                        IsEditTitleSub: false,
                        View_TitleSubgoal: kLg.labelSubGoalName,
                    };
                },
                computed: {
                    ViewCurrencyName() {
                        return this.goal.CurrencyName;
                    },
                    ColorApEvaluation() {
                        var x = this.goal.ApEvaluation;
                        return ChoseColorPercent(x);
                    },
                    KpiOverview() {
                        return MsaApp.getKpiOverview(this.goal);
                    },
                    ColorKpi() {
                        var ColorKpi = "";
                        if (this.goal.KpiOverViewPercent < 49.5) {
                            ColorKpi = "msa-kpi-bg60";
                        } else if (this.goal.KpiOverViewPercent <= 69.49) {
                            ColorKpi = "msa-kpi-bg60-80";
                        } else {
                            ColorKpi = "msa-kpi-bg80";
                        }
                        return ColorKpi;
                    },
                    StartDate() {
                        if (!this.goal.StartDate) return '';
                        const s = this.goal.StartDate.jsonToDate();
                        return kendo.toString(s, "d");
                    },
                    EndDate() {
                        if (!this.goal.Date) return '';
                        const e = this.goal.Date.jsonToDate();
                        return ` — ${kendo.toString(e, "d")}`;
                    },
                    ExpectedCost() {
                        if (!this.goal.ExpectedCost) return '';
                        return vmCommon.formatCost(this.goal.ExpectedCost);
                    },
                    ActualCost() {
                        if (!this.goal.ActualCost) return '';
                        return vmCommon.formatCost(this.goal.ActualCost);
                    },
                    ValueCost() {
                        return this.getValueCosto(this.goal);
                    },
                    ValueCostEx() {
                        var isOverdueCostEx = this.goal.Budget != null && this.goal.Budget > 0;
                        if (isOverdueCostEx)
                            return vmCommon.formatCost(this.goal.Budget);
                        return;
                    },
                    CssExceedCost() {
                        const goal = this.goal;
                        if (goal.Finish) return { B: '', o: '', Obig: '' };

                        const budget = goal.Budget;
                        const expt = goal.ExpectedCost;
                        var bAllSubgoal = 0;            // budgetSubgoalAll
                        bAllSubgoal = Array.isArray(goal.ListSubGoal) ? goal.ListSubGoal.filter(s => s.Budget != null).map(sg => sg.Budget).reduce(function (a, b) {
                            return a + b
                        }, 0) : -1; // get sum of Budget in array 

                        return {
                            B: bAllSubgoal > budget ? 'exceeded-cost' : '',
                            o: expt > budget ? 'exceeded-cost' : '',
                            Obig: goal.MarkBudget && goal.MarkBudget < 0 ? 'exceeded-cost' : ''
                        }
                    },
                    StyleWithNavMenu() {
                        var sV = 564, sVp = 1052;
                        const vRW = this.getViewRightWidth();
                        if (vRW < 1920) {
                            sV -= 202;  // //246
                        }
                        
                        return {
                            MainCollapseW: `${sV}px`,
                            MainCollWProd: `${sVp}px`
                        }

                    },
                    StyleNameWithNavMenu() {
                        const vRW = this.getViewRightWidth();
                        if (vRW < 1920) {
                            return {
                                maxWidth: '358px', overflow: 'hidden', paddingTop: '5px',
                                display: 'inline-block', textOverflow: 'ellipsis',
                            }
                        }
                    },
                },
                created() {
                    this.View_TitleMaingoal = MsaApp.getMaingoalTitle(this.goal.Id);
                    this.View_TitleSubgoal = MsaApp.getSubgoalTitle(this.goal.Id);

                },
                mounted() {
                    MsaApp.componentService(this.getViewType()).set(this.goal.Id, this);
                    //actionPlanComponents[this.goal.Id] = this;
                },
                updated() {
                    MsaApp.componentService(this.getViewType()).set(this.goal.Id, this);                    
                    // tinh toan get element tu DOM

                    this.setCollapExpandAllMain();
                },
                methods: {
                    mouseLeaveEditTitleMain() {
                        MsaApp.CanDragDrop = true;
                        this.IsEditTitleMain = false;
                        var tlt = this.View_TitleMaingoal.trim();
                        if (tlt == '') {
                            this.View_TitleMaingoal = MsaApp.getMaingoalTitle(this.goal.Id);
                        } else {
                            this.View_TitleMaingoal = tlt;
                            const goalId = this.goal.Id;
                            var entryData = {
                                Id: goalId,
                                Text: tlt,
                                isNav: true
                            }
                            this.dataservice().changeTitleMainGoal(entryData);
                        }
                    },
                    onClickEditTitleMain(e) {
                        if (this.getRole() < 1) return; // no role edit

                        MsaApp.CanDragDrop = false;
                        this.IsEditTitleMain = !this.IsEditTitleMain;// && getRole() > 0
                    },
                    onClickEditTitleSub(e) {
                        if (this.getRole() < 1) return; // no role edit

                        MsaApp.CanDragDrop = false;
                        this.IsEditTitleSub = !this.IsEditTitleSub;
                    },
                    mouseLeaveEditTitleSub() {           //View_TitleAction
                        MsaApp.CanDragDrop = true;
                        this.IsEditTitleSub = false;
                        var txt = this.View_TitleSubgoal.trim();
                        if (txt == '') {
                            this.View_TitleSubgoal = MsaApp.getSubgoalTitle(this.goal.Id);
                        } else {
                            this.View_TitleSubgoal = txt;
                            var goalId = this.goal.Id;
                            var entryData = {
                                Id: goalId,
                                Text: txt,
                                isNav: true
                            }
                            this.dataservice().changeTitleSubGoal(entryData);
                        }
                    },
                    
                    
                },      // end method
            }); 
        });
    });

    // #region Market and ProductGroup
    Vue.component('MsaViewMarket', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewMarket.html`, template => {
            resolve({
                template: template,
                props: ['item', 'landid', 'children', 'itemtype', 'products', 'isregionview'],
                inject: ['getIsExpand', 'countChildren', 'getBgColorByAvgEvaluation', 'getIsShowMarketLabel', 'pushExpand'],
                provide() {
                    if (this.itemtype == 'ProductGroup') {
                        return {
                            getRegionId: () => {
                                return this.item.RegionId;
                            },
                            getSubMarketId: () => { return this.item.Id },
                            getViewType: () => false
                        }
                    } else {        // Market
                        return {
                            countChildren: () => { return this.children.length },   //Market.countChildren
                            getSubMarketId: () => { return this.item.Id; },
                            checkRegionView: () => { return this.isregionview == true; },
                            isExpandBy1Child: () => { return this.IsExpandBy1Child; },
                            getViewType: () => false
                        }
                    }
                },
                data() {
                    var isExpd = false;
                    if (this.itemtype == 'Market') {
                        // kiem tra tu list expand
                        if (this.item.MarketSegmentRegionId != null) {
                            isExpd = this.getIsExpand(this.item.MarketSegmentRegionId, this.itemtype)
                        }
                        if (!isExpd) {
                            isExpd = this.getIsExpand(this.item.Id, this.itemtype);
                        }
                        
                        return {
                            IsExpand: isExpd,
                            IsDataSending: false,
                            IsExpandBy1Child: false,
                        };
                    }

                    if (this.itemtype == 'ProductGroup') {
                        isExpd = this.getIsExpand(this.item.Id, this.itemtype);

                        return {
                            IsExpand: isExpd,
                            IsDataSending: false
                        };
                    }

                },
                beforeMount() { },
                mounted() { },
                //watch: { },
                //updated() { },
                computed: {
                    kLg() { return kLg; },
                    IcToggleClass() {
                        var cls = 'market-icon arrow-panel-online msa-ic-font';
                        if (this.IsExpand) cls += ' font-arrow-down';
                        else
                            cls += ' font-arrow-right';
                        return cls;
                    },
                    UiStyle() {
                        var clsBg = 'marketing-bgcolor-main';
                        if (this.itemtype == 'ProductGroup') {
                            clsBg = this.getBgColorByAvgEvaluation(this.item.Id, this.itemtype);
                        }
                        if (!clsBg) clsBg = 'evaluation-heading-default';
                        return {
                            ClassBg: clsBg
                        }
                    },
                    CheckShowMarketLabel() {
                        var isShowMarketLabel = true;
                        const style = {};

                        if (this.itemtype == 'Market') {
                            isShowMarketLabel = this.getIsShowMarketLabel();
                            if (!isShowMarketLabel) {
                                if (!this.IsExpand) this.IsExpand = true;
                                style.padding = '0';
                                style.borderWidth = '0';
                            }
                        }
                        return {
                            IsShowMarketLabel: isShowMarketLabel, Style: style
                        }
                    },
                },
                methods: {
                    onClickToggleShow() {               //MsaViewMarket
                        if (this.IsDataSending) return;
                        const isExpand = !this.IsExpand;
                        this.IsExpand = isExpand;
                        this.IsDataSending = true;
                        const thisRef = this;
                        // call handler
                        if (isExpand) {
                            MsaApp.pushExpand(`${this.item.Id}`, thisRef.itemtype).then(function () {
                                thisRef.IsDataSending = false;
                            });
                        } else {
                            MsaApp.removeExpand(`${this.item.Id}`, thisRef.itemtype).then(function () {
                                thisRef.IsDataSending = false;
                            });
                        }
                    },
                    
                }
            });
        });
    });
    // #endregion

    /* Dùng cho các components
     * MsaViewProduct,
     * NavMenuViewProduct, NavMenuViewProductM
     */
    const mixinProduct = {
        inject: ['isViewer', 'handlerLoadding'],
        methods: {
            clickMenuGotoSubmarketProduct(e) {
                return;
                const landId = this.item.LandId;
                const regionId = this.item.RegionId;
                const subMarketId = this.item.SubMarketId;
                const productId = this.item.ProductId;
                var filtersearch = [{ TypeId: vmCommon.EnumFilterType.Market, ChildId: 0 }];
                var jsonObject = { LandId: landId, RegionId: regionId, FilterValue: JSON.stringify(filtersearch) };

                var url = '/Handlers/MarketFilterHandler.ashx?funcName=updatefilterfromgoalaction' + "&projid=" + projectId + '&regid=' + regionId + "&submarketid=" + subMarketId;
                callAjax('loadingRegionMatrix', url, JSON.stringify(jsonObject), function () {
                    const url = `/Pages/MsSubMarketProduct.aspx?lang=${kLg.language}&projid=${projectId}&regid=${regionId}&strid=${strategyId}&subid=${subMarketId}&prodid=${productId}`;
                    window.location = url;  //window.open(url, "_blank");
                }, AjaxConst.PostRequest);
            },
        },      // end methods
    }
    const mixinProductDefault = {
        props: ['item', 'itemtype'],
        inject: ['getBgColorByAvgEvaluation', 'getViewRightWidth', 'onDragStartMaingoal', 'onDragChangeMaingoal',
            'onDragEndMaingoal', 'onDragMoveGoal', 'isDraggable', 'getGroupMain', 'onHoverShowTooltipAddGoalAction', 'getViewType'],
        data() {
            return {
                IsExpand: true,
                IsMenuOpen: false,
                ListMain: [],
                TotalMainCollapse: 0,
                HasRefsExpand: false,
            };
        },
        computed: {         // duoc goi sau cac ham: data
            kLg() {
                return kLg;
            },
            IcToggleClass() {
                var cls = 'market-icon arrow-panel-online msa-ic-font';
                if (this.IsExpand) cls += ' font-arrow-down';
                else
                    cls += ' font-arrow-right';
                return cls;
            },
            SubMarketProductId() { return this.item.SubMarketProductId; },
            UiStyle() {
                var clsBg = 'marketing-bgcolor-main';
                clsBg = this.getBgColorByAvgEvaluation(this.SubMarketProductId, this.itemtype);
                if (!clsBg) clsBg = 'evaluation-heading-default';
                return {
                    ClassBg: clsBg
                }
            },
            IcCloseAllMaingoal() {
                if (this.HasRefsExpand) return 'font-arrow-down';

                return 'font-arrow-right';
            },
            ClassExpand() {
                if (this.HasRefsExpand) return 'msa-mg-expand';
                return '';
            },
            DragdropOptions() {
                const isDrg = this.isDraggable();
                return {
                    animation: 100, sort: true,
                    disabled: !isDrg,
                    ghostClass: "ghost-maingoal",                // maingoal
                    chosenClass: "chosenClass"
                }
            },
            ViewByNavigationMenu() {        //MsaViewProduct
                if (MsaApp.IsShowNavigationMenu) return false;
                return true;
            },
            ListMainDragDrop() {
                if (!this.ListMain) return [];
                const a = [...this.ListMain];
                a.push({
                    Id: vmCommon.emptyGuid, Mdf: -1, SubMarketProductId: this.item.SubMarketProductId
                });
                return a;
            },
        },
        provide() {
            return {                
                getProductId: () => { return this.item.Id },
                getIsMaster: () => {
                    const isMsterGoal = !!this.item.IsMasterGoal;
                    const isMsterKpi = this.item.IsMasterGoalKpi;
                    return {
                        MasterGoal: isMsterGoal, MasterGoalKpi: isMsterKpi
                    }
                },
                getIndependencyId: () => { return null },
                countMain: () => { return this.ListMain.length },
                getListMain: (id) => { return this.ListMain.filter(m => m.Id == id); },
                getChildrenGaPrd: () => {return this.ListMain},
                setCollapExpandAllMain: this.setCollapExpandAllMain,
                getRole: () => this.item.RoleId,        // NavMenuViewProduct, MsaViewProduct

            }
        },
        methods: {
            setCollapExpandAllMain() {
                const refMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(refMg)) {
                    this.HasRefsExpand = refMg.filter(m => m.IsExpand).length > 0;
                }
            },
            getGoalActionResult(id) {
                var rs = [], flag = false;
                for (var i = 0; i < this.ListMain.length; i++) {
                    if (flag) break;
                    rs = [];

                    var main = this.ListMain[i];
                    if (main.IsShow > 0 && main.IsColor)
                        rs.push(main.Id);

                    if (main.Id == id) flag = true;

                    var subs = main.ListSubGoal;
                    for (var j = 0; j < subs.length; j++) {
                        var sub = subs[j];
                        if (sub.IsShow > 0 && sub.IsColor)
                            rs.push(sub.Id);

                        if (sub.Id == id) flag = true;

                        var actions = sub.ListAction;

                        for (var k = 0; k < actions.length; k++) {
                            var action = actions[k];
                            if (action.IsShow > 0 && action.IsColor)
                                rs.push(action.Id);

                            if (action.Id == id) flag = true;
                        }
                    }
                }

                return rs;
            },
            setDataMainUpdatedMIndexAction(mGoal) {         //MsaViewProduct
                const refMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(refMg)) {
                    const mg = refMg.filter(m => m.IsExpand).find(m => m.goal.Id == mGoal.Id);
                    if (mg) {       // component
                        mg.goal.ListSubGoal = mGoal.ListSubGoal;
                    }
                }
            },
            onChangeMasterGoalKpi(e) { //Tham khao: $("#goalactionbound").on("change", "input.cbxMasterSub", function (e)
                if (MsaApp.isViewer()) return;

                var that = this;
                var state = this.item.IsMasterGoalKpi;
                const smpId = this.SubMarketProductId;

                MsaApp.handlerLoadding();

                vmGoalAction.dataservice.changeMasterSub({ id: smpId, isMasterGoalKpi: state }, function (res) {
                    if (that.item.ChildCount) {
                        MsaApp.reloadAllDataOfPage('onChange_MasterGoalKpi');
                    }

                    if (!state) {
                        msFilter.controlService.reLoadDataFilter();
                    }

                    MsaApp.canReaction();
                });
            },
            clickMenuImport(e) {
                return;
                vmGoalAction.gaExportService.importGa(this.SubMarketProductId, undefined);
            },
            clickMenuExport(e) {
                return;
                vmGoalAction.gaExportService.exportGa(this.SubMarketProductId, undefined);
            },
            addMaingoalByNav() {
                var info = {
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: this.SubMarketProductId,
                    independencyId: null,
                    isEdit: false,
                    goalType: vmCommon.GoalActionContentType.MainGoal,
                    parentStart: new Date()
                };                
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addMaingoalByNav';
                vmGoalAction.openPopUpGoal2(info);
            },
            addSubgoalByNav(e) {        //onHoverShowTooltipAddGoalAction
                var info = {
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: this.SubMarketProductId,
                    independencyId: null,
                    isEdit: false,
                    goalType: vmCommon.GoalActionContentType.SubGoal,
                    parentId: null,
                    parentStart: new Date(),
                    parentEnd: new Date(),
                };                
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addSubgoalByNav';
                vmGoalAction.openPopUpGoal2(info);
            },
            addActionByNav(e) {
                var info = {
                    actionId: vmCommon.emptyGuid,
                    goalId: vmCommon.emptyGuid,
                    subMarketProductId: this.SubMarketProductId,
                    parentSubMarketProductId: this.SubMarketProductId,
                    independencyId: null,
                    parentStart: new Date(),
                    parentEnd: new Date(),
                    endDate: new Date(),
                    title: kLg.titlepAddMainGoalNew1 + kLg.labelActionName + kLg.titlepAddMainGoalNew2,
                    isEdit: false
                };
                vmCommon.RefLstGa = this.ListMain;  // ref Array
                vmCommon.RefAddTypeStr = 'addActionByNav';
                vmGoalAction.openPopUpAction2(info);
            },
            ToggelExpandAllMailGoal(e) {
                if (!this.IsExpand) return;

                const lstMg = this.$refs['RefViewMainGoal'];
                if (Array.isArray(lstMg)) {
                    MsaApp.pushLoadTimeActions('ProductCollapseExpandAllMain');
                    const lstIds = lstMg.map(s => s.goal.Id);
                    if (this.IcCloseAllMaingoal == 'font-arrow-right') {
                        // expand all
                        MsaApp.pushExpandListMaingoal(lstIds, true);
                        lstMg.filter(s => !s.IsExpand).filter(mg => {
                            mg.setAllExpand_Or_Collapse(true);
                            return true;
                        });
                        return;
                    }
                    // collapse all
                    MsaApp.removeExpandListMaingoal(lstIds, true);
                    lstMg.filter(s => s.IsExpand).filter(mg => {
                        mg.setAllExpand_Or_Collapse(false);
                        return true;
                    });
                }

            },
            
        }
    }
    Vue.component('MsaViewProduct', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewProduct.html`, template => {
            resolve({
                template: template,
                mixins: [mixinProduct, mixinProductDefault],
                inject: ['getRegionId', 'getSubMarketId', 'getIsExpand', 'pushExpand', 'isExpandBy1Child', 'checkRegionView', "getViewType"],
                data() {
                    // goi sau props
                    MsaApp.componentService(this.getViewType()).set(this.item.SubMarketProductId, this);
                    var isExpd = this.getIsExpand(this.item.Id, this.itemtype, this.item.SubMarketProductId);
                    return {
                        IsExpand: isExpd,
                    }
                },
                provide() {
                    return {
                        loadAllGoalActionInOpenArea: this.ReloadOpenProduct,
                        getSubMarketProductId: () => { return this.item.SubMarketProductId; },
                    }
                },
                computed: {
                    StyleWithNavMenu() {
                        if (this.getViewRightWidth() < 1920) {
                          return '100%';
                        }
                    },
                },
                created() {         // duoc goi sau cac ham: data, computed properties, methods, watchers
                    this.ReloadOpenProduct();
                },
                mounted() {
                    // sau ham beforeMount da tao DOM
                    MsaApp.componentService(this.getViewType()).set(this.item.SubMarketProductId, this);                    
                },
                updated() {
                    MsaApp.componentService(this.getViewType()).set(this.item.SubMarketProductId, this);
                    
                    if (this.IsExpand)
                        this.setCollapExpandAllMain();
                },
                methods: {
                    onClickToggleShow() {               //MsaViewProduct
                        if (MsaApp.isViewer()) return;
                        const isExpand = !this.IsExpand;
                        this.IsExpand = isExpand;
                        MsaApp.handlerLoadding();
                        
                        // call handler
                        if (isExpand) {
                            MsaApp.pushExpand(this.item.SubMarketProductId, this.itemtype).then(function () {
                                MsaApp.canReaction();
                            });
                            this.ReloadOpenProduct();
                        } else {
                            MsaApp.removeExpand(this.item.SubMarketProductId, this.itemtype).then(function () {
                                MsaApp.canReaction();
                            });
                        }

                    },
                    ReloadOpenProduct() {
                        const subMarketProductId = this.SubMarketProductId;
                        const entry = {
                            submarketProductId: subMarketProductId,
                            filterObject: msFilter.controlService.getQueryFilter(vmCommon.FilterType.ActionPlan),
                            isConnection: this.item.IsConnection,
                            isSubConnection: this.item.IsSubConnection
                        };
                        const lst_Main = this.ListMain;
                        const updateListEvalXYZ = this.$root.updateListEvalXYZ; // ref function
                        return new Promise((resv) => {
                            vmGoalAction.dataservice.getGoalViewWithoutFilter(entry, function (theData) {
                                if(!theData) return;
                                const serData = theData.value;
                                if (typeof updateListEvalXYZ == 'function') updateListEvalXYZ(serData.ListEval);
                                var lstMain = serData.ListMain;       // ref
                                if(!lstMain.length) return;
                                lst_Main.splice(0);
                                lstMain.forEach(m => {
                                    lst_Main.push(m);
                                });
                                if (!MsaApp.MapListMain.has(subMarketProductId)) {
                                    MsaApp.MapListMain.set(subMarketProductId, lstMain);                                    
                                } else {
                                    const mL = MsaApp.MapListMain.get(subMarketProductId);
                                    mL.splice(0);       // remove all item
                                    lstMain.forEach(m => {
                                        mL.push(m);
                                    });
                                }
                                MsaApp.canReaction();
                                resv(lstMain);

                            });
                        });
                    },
                },       // end methods
            });
        });
    });

    Vue.component('NavMenuViewProduct', (resolve) => {
        $.get(`${__rootFolder__}/${_marketProductFolder_}/ViewProduct.html`, tmp => {
            resolve({
                template: tmp,
                mixins: [mixinProduct, mixinProductDefault],
                data() {
                    return {
                        StyleWithNavMenu: '1560px'
                    }
                },
                provide() {
                    return {
                        loadAllGoalActionInOpenArea: () => { },
                        getSubMarketProductId: () => { return this.item.Id; },
                        getRegionId: this.getRegionId,
                        getSubMarketId: this.getSubMarketId,
                        checkRegionView: this.checkRegionView,
                    }
                },
                computed: {
                    ViewByNavigationMenu() {        //NavMenuViewProduct
                        if (MsaApp.IsShowNavigationMenu) return true;
                        return false;
                    },
                    SubMarketProductId() { return this.item.Id; },
                },
                created() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    window.addEventListener("resize", this.handlerSize);
                },
                beforeMount() {
                    this.updateListMain();
                },
                mounted() {
                    MsaApp.componentService(this.getViewType()).set(this.item.Id, this);
                    this.handlerSize();
                },
                beforeUpdate() {
                    this.updateListMain();
                },
                methods: {
                    getRegionId() { return this.item.RegionId; },
                    getSubMarketId() { return this.item.SubMarketId; },
                    pushExpand() { },
                    onClickToggleShow() {},
                    checkRegionView() { return this.item.IsRegionOverView; },
                    addMaingoalByNav() {
                        var info = {
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.SubMarketProductId,
                            independencyId: null,
                            isEdit: false,
                            goalType: vmCommon.GoalActionContentType.MainGoal,
                            parentStart: new Date()
                        };
                        vmGoalAction.openPopUpGoal2(info);
                    },
                    addSubgoalByNav(e) {
                        var info = {
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.SubMarketProductId,
                            independencyId: null,
                            isEdit: false,
                            goalType: vmCommon.GoalActionContentType.SubGoal,
                            parentId: null,
                            parentStart: new Date(),
                            parentEnd: new Date(),
                        };
                        vmGoalAction.openPopUpGoal2(info);
                    },
                    addActionByNav(e) {
                        var info = {
                            actionId: vmCommon.emptyGuid,
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.SubMarketProductId,
                            parentSubMarketProductId: this.SubMarketProductId,
                            independencyId: null,
                            parentStart: new Date(),
                            parentEnd: new Date(),
                            endDate: new Date(),
                            title: kLg.titlepAddMainGoalNew1 + kLg.labelActionName + kLg.titlepAddMainGoalNew2,
                            isEdit: false
                        };
                        vmGoalAction.openPopUpAction2(info);
                    },
                    onChangeMasterGoalKpi(e) {
                        return;
                        var lstMLen = this.item.ListMainGoal.length;
                        if (this.isViewer()) return;
                        var state = this.item.IsMasterGoalKpi;
                        const smpId = this.item.Id;
                        this.handlerLoadding();
                        vmGoalAction.dataservice.changeMasterSub({ id: smpId, isMasterGoalKpi: state }, function (res) {
                            if (lstMLen) {
                                MsaApp.reloadAllDataOfPage('onChange_MasterGoalKpi');
                            }
                            if (!state) {
                                msFilter.controlService.reLoadDataFilter();
                            }
                            MsaApp.canReaction();
                        });
                    },
                    getDataContentRightView() {
                        var itemPI = this.item;
                        const entryData = { SubMarketProductId: itemPI.Id };
                        return new Promise((resl) => {
                            vmGoalAction.dataservice.getGoalActionContentByArea(entryData, function (res) {
                                if (res.value) {
                                    itemPI = res.value.Data;
                                    itemPI.RoleId = res.value.RoleId;
                                    itemPI.IsShow = true;
                                    itemPI.ViewRightType = 'SubgoalProduct';
                                    MsaApp.pushNavigationMenuView(itemPI, 'ViewProductTheme');
                                    resl();
                                }
                            });
                        });
                    },
                    updateListMain() {
                        const smpId = this.item.Id;
                        const lst_Main = this.ListMain;
                        const p = MsaApp.NavigationMenuView.find(i => i.Id == smpId);
                        if (p) {
                            lst_Main.splice(0);
                            p.ListMainGoal.filter(g => { lst_Main.push(g); });
                        }
                    },
                    handlerSize() {
                        const wParent = this.$el.scrollWidth;
                        this.StyleWithNavMenu = `${wParent}px`;
                    },
                },      // end method
                destroyed() {
                    window.removeEventListener("resize", this.handlerSize);
                },
            })
        });
    });

    return {
        rootFolder: __rootFolder__,
        mainSubFolder: `${__rootFolder__}/${_MainSubFolder_}`,
        MarketProductFolder: `${__rootFolder__}/${_marketProductFolder_}`,
        MixinMainGoal: mixinMainGoalOverView,        // dung trong file NavigationMenu.js
        MixinSubGoal: mixinSubGoalOverView,        // dung trong file NavigationMenu.js
        MixinTheme: mixinTheme,        // dung trong file NavigationMenu.js
        MixinProduct: mixinProduct,        // dung trong file NavigationMenu.js
    }
})();
