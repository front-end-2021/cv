// Viết hàm đóng này để các khai báo biến thông thường không lưu lại global cho chương trình bị nặng bộ nhớ
(function () {
    const __folder__ = `${MsaComponent.rootFolder}/NavigationMenu`;
    
    Vue.component('NavigationMenu', (resolve) => {
        $.get(`${__folder__}/NavigationMenu.html`, template => {
            resolve({
                template: template,
                props: ['navigationMenu'],
                inject: ['showPopupAddIndependence', 'getCurrentRole'],
                data() {

                    return {
                        MenuFilter: { IsHideFMenu: true},
                        PosMenuFilter: 0,
                    };
                },
                computed: {
                    kLg() { return kLg; },
                    NavMenuLand() {
                        return this.navigationMenu.filter(n => n.Type == 1);
                    },
                    NavMenuIndependency() {
                        return this.navigationMenu.filter(n => n.Type == 8);
                    },
                },
                created() {
                    window.addEventListener("resize", this.handlerSize);
                },
                mounted() {
                    if (typeof this.$el.querySelector != 'function') return;
                    const hndlScrl = this.$el.querySelector('.navMenuHandleScroll');
                    if (hndlScrl) hndlScrl.addEventListener('scroll', this.handleScroll);;

                    this.handlerSize();
                },
                updated() {     // DOM ready
                    // css-top lại cho menu filter nếu ở dưới cùng window (để không bị che) 
                    if (!this.MenuFilter.IsHideFMenu) {
                        const menuF = this.$el.querySelector('.msa-menu-filter-wrap');
                        if (menuF) {
                            var isOverH = false;
                            var overH = 0;
                            if (menuF.offsetHeight < 1) {
                                const menuMS = menuF.querySelector('ul.navMenuGoal');
                                if (menuMS) {
                                    isOverH = $(menuMS).offset().top + menuMS.offsetHeight > window.innerHeight;
                                    overH = menuMS.offsetHeight - 34;
                                }
                            } else {
                                isOverH = $(menuF).offset().top + menuF.offsetHeight > window.innerHeight;
                                overH = 82;
                            }

                            if (isOverH) {
                                menuF.style.top = `calc(${menuF.style.top} - ${overH}px)`;
                            }
                        }
                    }
                },
                methods: {
                    onShowMenuFilter(item, menuType, target) { //console.log('onShowMenuFilter', menuType, target.offsetTop);
                        this.removeMenuFilter();
                        switch (menuType) {
                            case 'Independence':
                            case 'Theme':
                            case 'Product':
                            case 'Maingoal':
                            case 'Subgoal':
                                this.MenuFilter = item;
                                break;
                        }
                        this.PosMenuFilter = `${$(target).offset().top - 10}px`;
                    },
                    onMouseLeaveHideMenu(e, item) {
                        MsaApp.hideAllMenuDropdown();

                        var mouseY = e.clientY;
                        var mouseX = e.clientX;
                        var target = e.target;
                        
                        if (item) {
                            if (mouseX < 18 ||      // dua chuot ve ben trai
                                mouseY - $(target).offset().top > 19 || // dua chuot xuong duoi
                                mouseY - $(target).offset().top < 0)    // dua chuot len tren
                            {
                                this.removeMenuFilter();
                            }
                        } else if (mouseX > 541) {        // mouse dang trong menu
                            this.removeMenuFilter();
                        } else {
                            this.removeMenuFilter();
                        }
                    },
                    removeMenuFilter() {
                        this.MenuFilter = { IsHideFMenu: true };
                        this.PosMenuFilter = 0;
                    },
                    onAddNewMaingoal() {
                        const item = this.MenuFilter;

                        switch (item.Type) {
                            case 5: // Product (SubmarketProductId)
                            case 6: // IsXy
                                var smpId = item.SubMarketProductId;
                                var info = {
                                    goalId: vmCommon.emptyGuid,
                                    subMarketProductId: smpId,
                                    independencyId: null,
                                    isEdit: false,
                                    goalType: vmCommon.GoalActionContentType.MainGoal,
                                    parentStart: new Date()
                                };
                                vmGoalAction.openPopUpGoal2(info);
                                break;
                            case 9: // Theme (Independency)
                                var indId = parseInt(item.Id);
                                var info = {
                                    goalId: vmCommon.emptyGuid,
                                    subMarketProductId: null,
                                    independencyId: indId,
                                    isEdit: false,
                                    goalType: vmCommon.GoalActionContentType.MainGoal,
                                    parentStart: new Date()
                                };
                                vmGoalAction.openPopUpGoal2(info);
                                break;
                        }

                    },
                    onAddNewTheme() {
                        const item = this.MenuFilter;

                        const id = parseInt(item.Id);        // supper theme (independence)
                        
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
                            vmGoalAction.parentId = id;
                            vmGoalAction.IsEditIndependency = false;
                            vmGoalAction.showAddIndependencePopup(kLg.gaLblThread, 323);
                        }

                    },
                    onClickShowHideMain() {
                        if (MsaApp.isViewer()) return;
                        var isMgHidden = !this.MenuFilter.IsMainGoalHidden;
                        
                        // #region set Show/Hide Maingoal Item o client
                        var smTmId = this.MenuFilter.SubMarketProductId;
                        if (smTmId && MsaApp.MapMenuListMain.has(smTmId)) {
                            MsaApp.MapMenuListMain.get(smTmId).filter(m => {
                                m.IsMainGoalHidden = isMgHidden;
                                return true;
                            });
                        } else {
                            smTmId = this.MenuFilter.Id;
                            if (MsaApp.MapMenuListMain.has(`${smTmId}`)) {
                                MsaApp.MapMenuListMain.get(`${smTmId}`).filter(m => {
                                    m.IsMainGoalHidden = isMgHidden;
                                    return true;
                                });
                            }
                        }
                        // #endregion

                        // #region call Handler
                        const smpIndId = (this.MenuFilter.TypeId === 1) ? this.MenuFilter.SubMarketProductId : this.MenuFilter.Id;
                        var entryData = {
                            ProSubThemaId: smpIndId,
                            TypeId: this.MenuFilter.TypeId,
                            IsMainGoalHidden: isMgHidden,
                            IsSubGoalHidden: this.MenuFilter.IsSubGoalHidden
                        };
                        MsaApp.handlerLoadding();
                        
                        const removeFocusMainSub = this.removeFocusMainSub;     // REF function
                        vmGoalAction.dataservice.savemenuhidden(entryData, function () {
                            if (!isMgHidden) removeFocusMainSub(smpIndId, 3);    // 3 = Main
                          //  if (!isMgHidden) removeFocusMainSub(smpIndId, 4);    // 4 = Sub
                            MsaApp.canReaction();
                        });
                        // #endregion

                    },
                    onClickShowHideSub() {
                        if (MsaApp.isViewer()) return;
                        // #region Khi tick sub thi Auto tick main
                        if (!this.MenuFilter.IsSubGoalHidden && !this.MenuFilter.IsMainGoalHidden) {
                            this.onClickShowHideMain();
                            this.MenuFilter.IsMainGoalHidden = !this.MenuFilter.IsMainGoalHidden;
                        }
                        // #endregion

                        // #region set Show/Hide Subgoal Item o client
                        var isSgHidden = !this.MenuFilter.IsSubGoalHidden;
                        var smTmId = this.MenuFilter.SubMarketProductId;
                        if (smTmId && MsaApp.MapMenuListMain.has(smTmId)) {
                            MsaApp.MapMenuListMain.get(smTmId).filter(m => {
                                m.IsSubGoalHidden = isSgHidden;
                                return true;
                            });
                        } else {
                            smTmId = this.MenuFilter.Id;
                            if (MsaApp.MapMenuListMain.has(`${smTmId}`)) {
                                MsaApp.MapMenuListMain.get(`${smTmId}`).filter(m => {
                                    m.IsSubGoalHidden = isSgHidden;
                                    return true;
                                });
                            }
                        }
                        // #endregion

                        // #region call Handler
                        const smpIndId = (this.MenuFilter.TypeId === 1) ? this.MenuFilter.SubMarketProductId : this.MenuFilter.Id;
                        var entryData = {
                            ProSubThemaId: smpIndId,
                            TypeId: this.MenuFilter.TypeId,
                            IsMainGoalHidden: this.MenuFilter.IsMainGoalHidden,
                            IsSubGoalHidden: isSgHidden
                        };
                        MsaApp.handlerLoadding();
                        
                        const removeFocusMainSub = this.removeFocusMainSub;     // REF function
                        vmGoalAction.dataservice.savemenuhidden(entryData, function () {
                            if (!isSgHidden) removeFocusMainSub(smpIndId, 4);    // 4 = Sub
                            MsaApp.canReaction();
                        });
                        // #endregion
                    },
                    removeFocusMainSub(smpIndId, typeMS) {      // 3 Main, 4 Sub
                        if (!MsaApp.MapMenuListMain.has(smpIndId)) return;

                        MsaApp.getFocusIdInMap(smpIndId, typeMS).setFocus(false);
                        const lstMS = getFocusIdMainSub();
                        // remove focus xong thi order lai View (Right)
                        if (lstMS.length > 0) {
                            MsaApp.orderRightViewsByNavigationMenu();
                            const lstMains = MsaApp.MapMenuListMain.get(smpIndId);
                            lstMS.filter(i => {
                                removeFocusNavItemRef(i); return true;
                            }); 
                            function removeFocusNavItemRef(item) {
                                if (item.TypeId == 3) {  // remove Main
                                    const main = lstMains.find(m => m.Id == item.Id);
                                    if (main) main.IsFocus = false;
                                } else {        // remove Sub
                                    const main = lstMains.find(m => m.Id == item.ParentId);
                                    if (main) {
                                        const sub = main.Childs.find(s => s.Id == item.Id);
                                        if (sub) {
                                            sub.IsFocus = false;
                                        }
                                    }
                                }
                            }
                        }
                        
                        function getFocusIdMainSub() {
                            const focusIds = document.querySelectorAll('div[focus-id]');
                            var id, tId, newLst = [];
                            for (const _div of focusIds) {
                                id = _div.getAttribute('focus-id');
                                tId = _div.getAttribute('focus-typeid');
                                const pId = _div.getAttribute('focus-parentid');
                                const item = MsaApp.NavigationMenuView.find(im => im.Id == id && isSmpIndId(im));
                                if (item && tId == typeMS) {
                                    const __i = { Id: item.Id, TypeId: parseInt(tId) };
                                    if (pId) __i.ParentId = pId;
                                    newLst.push(__i);
                                    _div.removeAttribute('focus-id');
                                    _div.removeAttribute('focus-typeid');
                                    if (pId) _div.removeAttribute('focus-parentid');
                                }
                            }
                            return newLst;
                            function isSmpIndId(im) {
                                if (im.IndependencyId && im.IndependencyId == smpIndId) return true;
                                if (im.SubMarketProductId == smpIndId) return true;
                                return false;
                            }
                        }
                    },
                    handlerSize(e) {
                        var docHeight = $(window).height();
                        this.$el.querySelector('.dnb-navmenu-scroll').style.maxHeight = `${docHeight - 174}px`;    // set chieu cao cho menu left de scroll doc lap
                    },
                    handleScroll(event) {
                        this.removeMenuFilter();

                    },
                    onMenuMaingoal() {
                        const goal = this.MenuFilter;

                        return {
                            getRole() { return goal.RoleId; },
                            MenuTxtAddSubgoal: kLg.strAddFormat.format(MsaApp.getSubgoalTitle(goal.Id)),
                            View_TitleMaingoal: MsaApp.getMaingoalTitle(goal.Id),
                            onClickMenuEditMain(e) {
                                var info = {
                                    goalId: goal.Id,
                                    subMarketProductId: goal.SubMarketProductId,
                                    independencyId: goal.IndependencyId,
                                    isEdit: true,
                                    goalType: vmCommon.GoalActionContentType.MainGoal
                                };
                                vmGoalAction.openPopUpGoal2(info);
                            },
                            onClickMenuAddSubGoal(e) {
                                var info = {
                                    goalId: vmCommon.emptyGuid,
                                    subMarketProductId: goal.SubMarketProductId,
                                    independencyId: goal.IndependencyId,
                                    isEdit: false,
                                    goalType: vmCommon.GoalActionContentType.SubGoal,
                                    parentId: goal.Id,
                                    parentStart: !goal.StartDate ? new Date() : goal.StartDate.jsonToDate(),
                                    parentEnd: !goal.Date ? new Date() : goal.Date.jsonToDate(),
                                    Title: this.MenuTxtAddSubgoal
                                };
                                vmGoalAction.openPopUpGoal2(info);
                            },
                            onClickMenuDuplicateMain(e) {
                                const info = {
                                    CurrencyName: goal.CurrencyName,
                                    IndependencyId: goal.IndependencyId,
                                    IsMasterGoal: goal.IsMasterGoal,
                                    ProductId: goal.ProductId,
                                    RegionId: goal.RegionId,
                                    SubMarketId: goal.SubMarketId,
                                    SubMarketProductId: goal.SubMarketProductId
                                }
                                const entryData = {
                                    enddate: goal.Date,
                                    goalId: goal.Id,
                                    isMainGoal: true,
                                    mdf: goal.Mdf,
                                    startdate: goal.StartDate
                                }
                                var message = kLg.msgConfirmDuplicateMG;
                                var mainGoalName = goal.Name;

                                return ynConfirmDuplicate(message, entryData.startdate, entryData.enddate).then(function () {
                                    var sdate = $('#txtCopyStartDate').data("kendoDatePicker").value();
                                    var edate = $('#txtCopyEndDate').data("kendoDatePicker").value();
                                    if ($("#txtCopyStartDate").data("kendoDatePicker").enable() !== false) {
                                        entryData.startdate = vmCommon.tryToServerDate(sdate);
                                    }
                                    if ($("#txtCopyEndDate").data("kendoDatePicker").enable() !== false) {
                                        entryData.enddate = vmCommon.tryToServerDate(edate);
                                    }

                                    vmGoalAction.dataservice.duplicateGoal(entryData, function (serData) {
                                        if (!serData.value.MainGoalId) {
                                            pAlert(kLg.msgConflickData).then(function () {
                                                MsaApp.reloadAllDataOfPage('ynConfirmDuplicate_NavMenuViewMaingoal');
                                            });
                                            return;
                                        }
                                        else {
                                            var maingoalId = serData.value.MainGoalId;

                                            MsaApp.pushExpand(maingoalId, 'maingoal');
                                            MsaApp.setLastActiveElement(maingoalId);
                                            MsaApp.pushLoadTimeActions('vmGoalActionDataserviceDuplicateGoal');

                                            if (mainGoalName !== "") {
                                                vmGoalAction.goalFilterService.updateItemFilter(info.SubMarketProductId ? info.SubMarketProductId : info.IndependencyId, { Id: serData.value.GoalId, Name: mainGoalName });
                                            }
                                            if (info.IsMasterGoal)
                                                msFilter.controlService.reLoadDataFilter();

                                            MsaApp.reloadAllDataOfPage('ynConfirmDuplicate_NavMenuViewMaingoal');
                                        }
                                    });
                                });
                            },
                            getFileDOCX(e) {
                                var entry = {
                                    Id: goal.Id, TypeId: vmCommon.GoalActionContentType.MainGoal
                                };
                                vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                                    var state = res.value.ResultStatus;
                                    var fileInfo = res.value.TheObject;
                                    if (state == vmCommon.ResultState.SUCCESS) {
                                        vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                                    }
                                });
                            },
                            isRegionOverview() { return goal.IsRegionOverView; },
                            isCalendar() { return goal.IsCalendar; },
                            gotoMix(e) { vmGoalAction.gotoMixService.gotoMix(goal.Id) },
                            gotoRoadmap(e) { vmGoalAction.gotoRMService.gotoRoadMap(goal.Id) },
                            deleteMainGoal(e) {
                                var goalId = goal.Id;
                                const isMastergoal = goal.IsMasterGoal;
                                var info = {
                                    CurrencyName: goal.CurrencyName,
                                    goalType: vmCommon.GoalActionContentType.MainGoal,
                                    IndependencyId: goal.IndependencyId,
                                    IsMasterGoal: isMastergoal,
                                    productId: goal.ProductId,
                                    RegionId: goal.RegionId,
                                    SubMarketId: goal.SubMarketId,
                                    SubMarketProductId: goal.SubMarketProductId
                                };
                                var entryData = { goalId: goal.Id, mdf: goal.Mdf };

                                var smkId = info.SubMarketProductId;
                                var inpId = info.IndependencyId;
                                var titleMainGoal = this.View_TitleMaingoal;
                                const lstSubgoalId = Array.isArray(goal.Childs) ? goal.Childs.map(sg => sg.Id) : [];        // dùng để remove expand

                                pConfirm(kLg.confirmDeleteMG1 + titleMainGoal + kLg.confirmDeleteMG2).then(function () {
                                    //delete before update 2 db
                                    vmFile.checkEnableDeleteFileMarketing(entryData.goalId, 'maingoal').then(t => {
                                        vmGoalAction.dataservice.deleteGoal(entryData, function (serData) {

                                            var pid = smkId || inpId;
                                            vmGoalAction.goalFilterService.removeItemFilter(pid, { Id: goalId });

                                            vmFile.deleteMultiFileMarketing(t).then(x => {
                                                msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, function () {
                                                    if (!vmGoalAction.checkRole(serData)) return;

                                                    if (lstSubgoalId.length) {
                                                        MsaApp.removeExpandListSubgoal(vmCommon.deepCopy(lstSubgoalId)); // Chưa gọi handler save expand (se goi trong ham beforeDestroy)
                                                        MsaApp.removeExpand(goalId, 'maingoal');
                                                    }
                                                    MsaApp.reloadAllDataOfPage();
                                                });
                                            });

                                            if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                                                MsaApp.deleteEvalXYZ(entryData.goalId)
                                            }
                                        });
                                    });
                                });
                            },
                        }
                    },
                    onMenuSubgoal() {
                        const item = this.MenuFilter;

                        return {
                            getRole() { return item.RoleId; },
                            MenuTxtAddAction: kLg.strAddFormat.format(MsaApp.getActionTitle(item.Id)),
                            View_TitleAction: MsaApp.getActionTitle(item.Id),
                            clickEditSub(e) {
                                var info = {
                                    goalId: item.Id,
                                    subMarketProductId: item.SubMarketProductId,
                                    independencyId: item.IndependencyId,
                                    isEdit: true,
                                    goalType: vmCommon.GoalActionContentType.SubGoal
                                };
                                vmGoalAction.openPopUpGoal2(info);
                            },
                            clickAddAction(e) {
                                const columnId = item.ActionPlanColumnId;
                                var endDate = MsaApp.getEndDateToAddAction(item);
                                var info = {
                                    actionId: vmCommon.emptyGuid,
                                    goalId: item.Id,
                                    parentId: item.Id,
                                    subMarketProductId: item.SubMarketProductId,
                                    parentSubMarketProductId: item.SubMarketProductId,
                                    independencyId: item.IndependencyId,
                                    mainGoalId: item.ParentId,
                                    parentStart: endDate,
                                    parentEnd: endDate,
                                    endDate: endDate,
                                    isEdit: false,
                                    parentMasterId: item.MasterId,
                                    isMasterGoal: !!item.IsMasterGoal
                                };

                                if (columnId > 0) {
                                    info.columnId = columnId;
                                    info.title = kLg.titlepAddMainGoalNew1 + htmlEscape(kLg.labelActionName) + kLg.titlepAddMainGoalNew2;
                                } else {
                                    info.title = kLg.titlepAddMainGoalNew1 + htmlEscape(this.View_TitleAction) + kLg.titlepAddMainGoalNew2;
                                }
                                vmGoalAction.openPopUpAction2(info);
                            },
                            clickSortAction(e) {
                                var subId = item.Id;
                                vmGoalAction.dataservice.sortAction({ subgoalid: subId }, function (res) {
                                    if (res.value > 0) {
                                        MsaApp.reloadDataContentRightView();
                                    }
                                });
                            },
                            isRegionOverview() { return item.IsRegionOverView; },
                            isCalendar() { return item.IsCalendar; },
                            clickDuplicateSub(e) {//onClickMenuDuplicateSub
                                const info = {
                                    CurrencyName: item.CurrencyName,
                                    IndependencyId: item.IndependencyId,
                                    IsMasterGoal: !!item.IsMasterGoal,
                                    ProductId: item.ProductId,
                                    RegionId: item.RegionId,
                                    SubMarketId: item.SubMarketId,
                                    SubMarketProductId: item.SubMarketProductId
                                }
                                const entryData = {
                                    enddate: item.EndDate,
                                    goalId: item.Id,
                                    isMainGoal: false,
                                    mdf: item.Mdf,
                                    startdate: item.StartDate
                                }

                                return ynConfirmDuplicate(kLg.msgConfirmDuplicateMG, entryData.startdate, entryData.enddate).then(function () {
                                    var sdate = $('#txtCopyStartDate').data("kendoDatePicker").value();
                                    var edate = $('#txtCopyEndDate').data("kendoDatePicker").value();
                                    if ($("#txtCopyStartDate").data("kendoDatePicker").enable() !== false) {
                                        entryData.startdate = vmCommon.tryToServerDate(sdate);
                                    }
                                    if ($("#txtCopyEndDate").data("kendoDatePicker").enable() !== false) {
                                        entryData.enddate = vmCommon.tryToServerDate(edate);
                                    }

                                    vmGoalAction.dataservice.duplicateGoal(entryData, function (serData) {
                                        if (!serData.value.MainGoalId) {
                                            pAlert(kLg.msgConflickData).then(function () {
                                                MsaApp.reloadAllDataOfPage('ynConfirmDuplicate_NavMenuViewMaingoal');
                                            });
                                            return;
                                        } else {
                                            var maingoalId = serData.value.MainGoalId;
                                            var goalIdArr = serData.value.GoalId;

                                            MsaApp.pushExpand(maingoalId, 'maingoal');
                                            goalIdArr.forEach(sgId => {
                                                MsaApp.pushExpand(sgId, 'subgoal');
                                            });
                                            if (goalIdArr.length > 0) {
                                                MsaApp.setLastActiveElement(goalIdArr[0]);
                                                MsaApp.pushLoadTimeActions('vmGoalActionDataserviceDuplicateGoal');
                                            }

                                            if (info.IsMasterGoal)
                                                msFilter.controlService.reLoadDataFilter();

                                            MsaApp.reloadAllDataOfPage('ynConfirmDuplicate_NavMenuViewMaingoal');
                                        }
                                    });
                                });
                            },
                            clickExportDocxMenu(e) {
                                var entry = {
                                    Id: item.Id,
                                    TypeId: vmCommon.GoalActionContentType.SubGoal
                                };
                                vmGoalAction.dataservice.getFileDOCX(entry, function (res) {
                                    var state = res.value.ResultStatus;
                                    var fileInfo = res.value.TheObject;
                                    if (state == vmCommon.ResultState.SUCCESS) {
                                        vmCommon.GetFileFromUrl("../TempExport/" + fileInfo.Path, fileInfo.Name);
                                    }
                                });
                            },
                            GotoMixfromMenu(e) {
                                vmGoalAction.gotoMixService.gotoMix(item.Id);
                            },
                            GotoRoadmapfromMenu(e) {
                                vmGoalAction.gotoRMService.gotoRoadMap(item.Id)
                            },
                            deleteSubGoal(e) {
                                var goalId = item.Id;
                                var entryData = { goalId: goalId, mdf: item.Mdf };
                                var titleSubGoal = kLg.labelSubGoalName;

                                MsaApp.hideAllMenuDropdown();
                                pConfirm(kLg.confirmDeleteSG1 + titleSubGoal + kLg.confirmDeleteSG2).then(function () {
                                    vmFile.checkEnableDeleteFileMarketing(entryData.goalId, 'subgoal').then(t => {
                                        vmGoalAction.dataservice.deleteGoal(entryData, function (serData) {
                                            vmFile.deleteMultiFileMarketing(t).then(x => {
                                                msFilter.controlService.reLoadDataFilter(vmCommon.FilterType.ActionPlan, function () {
                                                    if (!vmGoalAction.checkRole(serData)) return;
                                                    MsaApp.reloadAllDataOfPage();
                                                });
                                            });

                                            if (vmCommon.checkCurrentPage(vmCommon.enumPage.ActionPlan)) {
                                                MsaApp.deleteEvalXYZ(entryData.goalId)
                                            }
                                        });
                                    });
                                });
                            },
                            AddnewColumn(target) {
                                var maingoalid = item.ParentId;
                                var subgoalId = item.Id;
                                var entry = {
                                    MaingoalId: maingoalid, SubgoalId: subgoalId
                                };
                                vmGoalAction.openPopEditColumn(0, entry.SubgoalId, entry.MainGoalId, true);
                            },
                            onToggleReduceSize(e) {         //NavigationMenu.onMenuSubgoal().onToggleReduceSize()
                                item.IsReduceSize = !item.IsReduceSize;
                                var entryData = {
                                    Status: item.IsReduceSize, GoalId: item.Id
                                };
                                vmGoalAction.dataservice.saveActionReduceSize(entryData, function () {
                                    MsaApp.reloadAllDataOfPage();
                                    MsaApp.reloadDataContentRightView();
                                });
                            },
                        }
                    },
                },      // methods
                provide() {
                    return {
                        onShowMenuFilter: this.onShowMenuFilter,
                        onMouseleaveHideMenu: this.onMouseLeaveHideMenu,
                        bindLandExpand: (lId, isExpand) => {
                            const land = this.$el.querySelector(`[navmenu-land-id="${lId}"]`);
                            if (land) {
                                land.setAttribute('land-expand', isExpand);
                            }
                        },
                        bindIndExpand: (iId, isExpand) => {
                            const ind = this.$el.querySelector(`[navmenu-ind-id="${iId}"]`);
                            if (ind) {
                                ind.setAttribute('ind-expand', isExpand);
                            }
                        },
                    }
                },
                beforeDestroy() {
                    const hndlScrl = this.$el.querySelector('.navMenuHandleScroll');
                    if (hndlScrl) hndlScrl.removeEventListener('scroll', this.handleScroll);
                },
                destroyed() {
                    window.removeEventListener("resize", this.handlerSize);
                },
            });
        });
    });

    /* Dùng chung cho các components NavigationItem...
     * NavigationItemLand,
     * NavigationItemIndependence,
     * NavigationItemTheme,
     * NavigationItemProduct,
     * NavigationItemMaingoal,
     * NavigationItemSubgoal
     */
    const mixinNavigationItem = {
        props: ['item', 'menuType'],
        inject: ['onShowMenuFilter', 'onMouseleaveHideMenu', 'getThemeNavMenu'],
        data() {
            const isExp = this.item.IsExpand == true;
            if (isExp) {
                this.updateNavMenuExpandIds().push();
            }

            return {
                ListGoalItem: [], IsExpandHideMain: false,   // set o day de khong bị lối khi bind trong file NavigationItem.html
                ClassHover: '',     // dung de bind class khi name qua' dai`
                IsExpand: isExp,
            }
        },
        watch: {
            IsExpand(val) {
                if (val) {
                    this.updateNavMenuExpandIds().push();
                } else {
                    this.updateNavMenuExpandIds().remove();
                }
            }
        },
        computed: {
            kLg() { return kLg; },
            ClassExpand() {
                if (this.IsExpand == true) return 'font-arrow-down';
                return 'font-arrow-right';
            },
            ClassSelect() {
                if (this.item.IsFocus) return 'menu-item-selected';
                return '';
            },
            StyleShow() {
                return 'flex';      // khi Product untick Main/Sub => item Main/Sub 's hidden
            },
            IsShowArrowExpand() {   //Land, Independence, Region, StakeholderGroup
                return true;        // dung cho item Main khi Product untick Sub
            },
            StyleBgFocus() {                 // dung cho item Product/Main/Sub
                if (this.item.IsFocus) {
                    if (this.menuType == 'Theme' || this.menuType == 'Product' || this.menuType == 'Maingoal' ||this.menuType == 'Subgoal')
                        return {
                            bg: '#daf4ff'
                        };
                }
                return {bg: ''}
            },
            FocusAttr() {
                if (this.item.IsFocus) {
                    switch (this.menuType) {
                        case 'Product':
                            return {
                                Id: this.item.SubMarketProductId
                            }
                        case 'Theme':
                            return { Id: this.item.Id }
                        case 'Maingoal':
                            return { Id: this.item.Id, TypeId: this.item.TypeId }
                        default:
                            return { Id: this.item.Id, TypeId: this.item.TypeId, ParentId: this.item.ParentId }
                    }
                }
                return {};
            }
        },
        beforeMount() {
            if (this.menuType != 'Product' && this.menuType != 'Theme' && this.menuType != 'Maingoal') {
                delete this.$data.ListGoalItem; // xoa di khi khong phai la NavigationItemProduct va NavigationItemTheme
            }
            if (this.menuType != 'Maingoal') {
                delete this.$data.IsExpandHideMain; // xoa di khi khong phai la NavigationItemMaingoal
            }

            this.IsExpand = this.isExpandInList();
                
        },
        mounted() {         // DOM ready
            if (this.menuType == 'Product' || this.menuType == 'Theme')
                MsaApp.navigationComponents[`${(this.menuType == 'Product' ? this.item.SubMarketProductId : this.item.Id)}`] = this;
            this.checkLongName();
        },
        beforeUpdate() {
            if (!this.IsExpand) {
                this.IsExpand = this.isExpandInList();
            }
        },
        updated() {         // DOM re-rendered
            if (this.menuType == 'Product' || this.menuType == 'Theme')
                MsaApp.navigationComponents[`${(this.menuType == 'Product' ? this.item.SubMarketProductId : this.item.Id)}`] = this;
            this.checkLongName();
        },
        methods: {
            checkLongName() {
                const n = this.$el.querySelector('.msaNavMenuName');
                const type = this.menuType;
                if (n) {
                    switch (true) {
                        case (type == 'Land') && n.offsetWidth > 235:
                        case (type == 'Independence') && n.offsetWidth > 210:
                        case (type == 'Region' || type == 'Stakeholdergroup') && n.offsetWidth > 236:
                        case (type == 'Product' || type == 'Theme') && n.offsetWidth > 212:
                        case (type == 'Maingoal') && n.offsetWidth > 179:
                        case (type == 'Subgoal') && n.offsetWidth > 163:
                            if (this.ClassHover != 'msaMenuItemWrap') this.ClassHover = 'msaMenuItemWrap'
                            break
                        default:
                            if (this.ClassHover != '') this.ClassHover = '';
                            break;
                    }
                } else {
                    if (this.ClassHover != '') this.ClassHover = '';
                }
            },
            getChilds(id) {     // dung cho NavigationItem.html Theme
                var item = this.getThemeNavMenu(id);
                if (item) {
                    return item.Childs;
                }
                return [];
            },
            /* NavigationItemLand, NavigationItemIndependence, NavigationItemTheme,
             * NavigationItemProduct, NavigationItemMaingoal, NavigationItemSubgoal */
            expandCloseIcon(e) {
                this.IsExpand = !this.IsExpand;
                this.item.IsExpand = this.IsExpand;     // set ref item

                // #region call handler expand
                //switch (this.menuType) {
                //    case 'Land':
                //        // call handler
                //        break;
                //    case 'Independence':
                //        // call handler
                //        break;
                //    case 'Region':
                //        // call handler
                //        break;
                //    case 'Stakeholdergroup':
                //        // call handler
                //        break;
                //    case 'Maingoal':
                //        // call handler
                //        break;
                //}
                // #endregion
            },
            onClickSelect(e) {
                this.item.IsFocus = !this.item.IsFocus;
                this.expandCloseIcon(e);            // Land.onClickSelect, Independence.onClickSelect, Region.onClickSelect, Stakeholdergroup.onClickSelect
            },
            mouseOverShowTooltip(e) {
                if (this.ClassHover == 'msaMenuItemWrap') {
                    var target = e.target;
                    if (target.classList.contains('msaNavMenuNameIgnoreTooltip'))
                        return;

                    if (target.classList.contains('msaNavMenuName')) {
                        target = target.closest('.msaNavMenuNameTooltip');
                    }
                    MsaApp.onHoverShow_kendoTooltip(target, this.item.Name, 'bottom', 288 - 11);
                }
            },
            onMouseoverShowMenu(e) {
                const target = e.target;
                this.onShowMenuFilter(this.item, this.menuType, target);

            },
            onHideMenu(e) { this.onMouseleaveHideMenu(e, this.item) },
            updateNavMenuExpandIds() {
                var id = this.getIdStr();
                return {
                    push: function () {
                        if (!MsaApp.NavMenuExpandIds.includes(id))
                            MsaApp.NavMenuExpandIds.push(id);
                    },
                    remove: function () {
                        MsaApp.NavMenuExpandIds.splice(MsaApp.NavMenuExpandIds.indexOf(id), 1);
                    }
                }
            },
            isExpandInList() {
                var key = this.getIdStr();
                var isExp = MsaApp.NavMenuExpandIds.includes(key);
                return isExp;
            },
            getIdStr() {
                switch (this.menuType) {
                    case 'Product':
                        return this.item.SubMarketProductId;
                    case 'Land':
                    case 'Region':
                    case 'Stakeholdergroup':
                    case 'Independence':
                    case 'Theme':
                    case 'Maingoal':
                    case 'Subgoal':
                        return `${this.item.Id}`;
                }
                return ``;
            },
        },       // end menthods
        
    }
    Vue.component('NavigationItemLand', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem],       // dung mixin de ke thua code chung
                inject: ['bindLandExpand'],
                watch: {
                    IsExpand(val) {
                        this.bindLandExpand(this.item.Id, val);     // dung cho css box-shadow
                        if (val) {
                            this.updateNavMenuExpandIds().push();
                        } else {
                            this.updateNavMenuExpandIds().remove();
                        }
                    }
                },
                methods: {
                    isExpandRegion(rId) {
                        var r = this.item.Childs.find(r => r.Id == rId);
                        if (r) return r.IsExpand;
                        return false;
                    },
                },
                provide() {
                    return {
                        bindRegionExpand: (rid, isExpand) => {
                            const region = this.$el.querySelector(`[navmenu-region-id="${rid}"]`);
                            if (region) {
                                region.setAttribute('region-expand', isExpand);
                            }
                        },
                    }
                },
            });
        });
    });
    Vue.component('NavigationItemIndependence', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem],       // dung mixin de ke thua code chung
                inject: ['bindIndExpand'],
                watch: {
                    IsExpand(val) {
                        this.bindIndExpand(this.item.Id, val);
                        if (val) {
                            this.updateNavMenuExpandIds().push();
                        } else {
                            this.updateNavMenuExpandIds().remove();
                        }
                    }
                },
            });
        });
    });
    Vue.component('NavigationItemRegion', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem],       // dung mixin de ke thua code chung
                inject: ['bindRegionExpand'],
                provide() {
                    return {
                        getRegionId: () => { return parseInt(this.item.Id); },
                    }
                },
                watch: {
                    IsExpand(val) {
                        this.bindRegionExpand(this.item.Id, val);       // Dung cho css box-shadow
                        if (val) {
                            this.updateNavMenuExpandIds().push();
                        } else {
                            this.updateNavMenuExpandIds().remove();
                        }
                    }
                },
            });
        });
    });
    Vue.component('NavigationItemStakeholdergroup', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem],       // dung mixin de ke code chung
                provide() {
                    return {
                        getSubMarketId: () => { return parseInt(this.item.Id) },
                    }
                },
            });
        });
    });

    /* Dung chung cho 2 components
     * NavigationItemTheme,
     * NavigationItemProduct
     */
    const mixinProductTheme = {
        provide() {
            return {
                isFocusProduct: () => { return this.item.IsFocus; },
                setSelectChild: (isFocus, id) => {     // Main/Sub => Product
                    var index = this.ListFocusChild.indexOf(id);
                    if (isFocus && index < 0) {
                        this.ListFocusChild.push(id);
                    }
                    if (!isFocus && index > -1) {
                        this.ListFocusChild.splice(index, 1);
                    }

                    if (this.ListFocusChild.length)
                        this.item.IsFocus = false;       // neu main/sub focus thi bo focus
                },
                getSubMarketProductId: () => {
                    if (this.menuType == 'Product') return this.item.SubMarketProductId;
                    return null;
                },
                getThemeId: () => {
                    if (this.menuType == 'Theme') return parseInt(this.item.Id);
                    return null;
                },
                getProductId: () => {
                    if (this.menuType == 'Product') return parseInt(this.item.Id);
                    return null;    // handler error
                },
                getListSubgoal: (mgId, smpId, thId) => {
                    var mL;
                    if (this.menuType == 'Product') {
                        mL = MsaApp.MapMenuListMain.get(smpId);
                    } else if (this.menuType == 'Theme') {
                        mL = MsaApp.MapMenuListMain.get(`${thId}`);
                    }
                    if (Array.isArray(mL)) {
                        var mg = mL.find(g => g.Id == mgId);
                        if (mg) return mg.Childs;
                    }
                    return [];
                }
            }
        },
        data() {
            return {
                ListFocusChild: [],     // dung de bind ClassSelect
            }
        },
        computed: {
            ClassSelect() {     // Product, Theme
                if (this.item.IsFocus || this.ListFocusChild.length)
                    return 'menu-item-selected';
                return '';
            },
            IsShowArrowExpand() {       // NavigationItemProduct, NavigationItemTheme
                const key = this.menuType == 'Product' ? this.item.SubMarketProductId : `${this.item.Id}`;
                var t = MsaApp.MapMenuListMain.get(key);
                if (t) {
                    t = t.find(g => (g.SubMarketProductId && g.SubMarketProductId == key) || (g.IndependencyId && g.IndependencyId == key));
                }

                if (!t) {
                    if (this.item.IsMainGoalHidden || this.item.IsSubGoalHidden)
                        return true;
                    return false;
                }

                if (t.IsMainGoalHidden || t.IsSubGoalHidden)
                    return true;       // Khi tick 1 trong 2 main/sub thi hien arrow

                return false;
            },
            ClassExpand() {
                if (this.item.IsMainGoalHidden || this.item.IsSubGoalHidden) {
                    if (this.IsExpand == true) return 'font-arrow-down';
                    return 'font-arrow-right';
                }
                return '';
            },
        },
        watch: {
            'item.IsFocus'(newV) {
                if (newV)
                {
                    this.ListFocusChild.splice(0);        // xoa het (remove)
                    const refM = this.$refs['RefNavMenuMaingoal'];
                    if (refM) {
                        refM.filter(mgItem => {
                            if (mgItem.item.IsFocus) mgItem.item.IsFocus = false;
                            return true; // for loop
                        });
                    }
                }
            },
            //không watch được 'item.IsMainGoalHidden', 'item.IsSubGoalHidden' //(Do lồng cấp Childs nhiều quá 3 tầng)
        },
        beforeMount() {
            if (this.IsExpand) {            // biến này đã khai báo trong mixinNavigationItem 
                this.getListGoalAction();       // beforeMount mixinProductTheme

            }
            //console.log('beforeMount mixinProductTheme', this.item.Name);
        },
        beforeUpdate() {
            var key = this.getIdStr();
            if (MsaApp.MapMenuListMain.has(key)) {
                this.ListGoalItem = MsaApp.MapMenuListMain.get(key);
            }
            else if (this.IsExpand)
                this.getListGoalAction();       // beforeUpdate mixinProductTheme

            //console.log('beforeUpdate mixinProductTheme', this.item.Name);
        },
        methods: {
            onClickSelect(e) {              // Product || Theme
                const is_Focus = !this.item.IsFocus;
                this.item.IsFocus = is_Focus;

                if (is_Focus) {
                    this.getDataContentOnRightView();       // NavigationItemTheme.onClickSelect, NavigationItemProduct.onClickSelect
                } else {
                    const _item = vmCommon.deepCopy(this.item);
                    _item.Id = this.menuType == 'Product' ? this.item.SubMarketProductId : this.item.Id;
                    MsaApp.removeInNavigationMenuView(_item, 'ViewProductTheme');
                    MsaApp.orderRightViewsByNavigationMenu();
                }

                // #region call Handler
                var idFocus = 0;
                switch (this.menuType) {
                case 'Theme':
                    idFocus = this.item.Id;
                    break;
                case 'Product':
                    idFocus = this.item.SubMarketProductId;
                    break;
                }
                var entryData = {
                    TypeId: this.item.TypeId,
                    FocusValue: idFocus, 
                    IsFocus: is_Focus
                };
                vmGoalAction.dataservice.savemenufocus(entryData);
                // #endregion
            },
            /* NavigationItemTheme
             * NavigationItemProduct */
            getDataContentOnRightView() {
                const _id = this.menuType == 'Product' ? this.item.SubMarketProductId : this.item.Id;
                const entryData = {};
                if (this.menuType == 'Product') entryData.SubMarketProductId = _id;
                if (this.menuType == 'Theme') entryData.IndependencyId = parseInt(_id);
                vmGoalAction.dataservice.getGoalActionContentByArea(entryData, function (res) {
                    const itemPI = res.value.Data;
                    itemPI.IsShow = true;
                 //   itemPI.HeadTitle = name;
                    itemPI.ViewRightType = itemPI.TypeId == 2 ? 'SubgoalTheme' : 'SubgoalProduct';
                    itemPI.RoleId = res.value.RoleId;
                    itemPI.Id = _id;

                    MsaApp.pushNavigationMenuView(itemPI, 'ViewProductTheme');
                    setTimeout(function () {
                        MsaApp.scrollY(`[navmenu-directid=${_id}]`);        //navmenu-direct_
                    }, 1234);
                });
            },
            expandCloseIcon(e) {                // @override (Product, Theme)
                this.IsExpand = !this.IsExpand;
                this.item.IsExpand = this.IsExpand;

                if (!this.IsExpand) return;     // Neu không expand thi khong goi handler

                this.getListGoalAction();          // (click) mixinProductTheme.expandCloseIcon
            },
            getListGoalAction() {
                const isMainHidden = this.item.IsMainGoalHidden;
                const isSgHidden = this.item.IsSubGoalHidden;
                const that = this;
                const updateListEvalXYZ = this.$root.updateListEvalXYZ;       // ref function
                switch (this.menuType) {
                    case 'Theme':
                        const indId = this.item.Id;
                        
                        MsaApp.getListGoalNavMenu(null, indId).then(data => {
                            const lstMain = data.ListMain;

                            if (!MsaApp.MapMenuListMain.has(`${indId}`)) {
                                lstMain.forEach(m => {
                                    m.IsMainGoalHidden = isMainHidden;
                                    m.IsSubGoalHidden = isSgHidden;
                                });
                                MsaApp.MapMenuListMain.set(`${indId}`, lstMain);
                            }
                            else {
                                const mL = MsaApp.MapMenuListMain.get(`${indId}`);
                                mL.splice(0);       // remove all item
                                lstMain.forEach(m => { mL.push(m); });
                            }
                            that.ListGoalItem = MsaApp.MapMenuListMain.get(`${indId}`);
                            if (typeof updateListEvalXYZ == 'function') {
                                updateListEvalXYZ(data.ListEval);
                            }
                        });
                        break;
                    case 'Product':
                        const smpId = this.item.SubMarketProductId;
                        
                        MsaApp.getListGoalNavMenu(smpId, null).then(data => {
                            const lstMain = data.ListMain;

                            if (!MsaApp.MapMenuListMain.has(smpId)) {
                                lstMain.forEach(m => {
                                    m.IsMainGoalHidden = isMainHidden;
                                    m.IsSubGoalHidden = isSgHidden;
                                });
                                MsaApp.MapMenuListMain.set(smpId, lstMain);
                            }
                            else {
                                const mL = MsaApp.MapMenuListMain.get(smpId);
                                mL.splice(0);       // remove all item
                                lstMain.forEach(m => { mL.push(m); });
                            }
                            that.ListGoalItem = MsaApp.MapMenuListMain.get(smpId);
                            if (typeof updateListEvalXYZ == 'function') {
                                updateListEvalXYZ(data.ListEval);
                            }
                        });
                        break;
                }
            },
        },      // end method
    };
    Vue.component('NavigationItemTheme', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem, mixinProductTheme],       // dung mixin de ke code chung
                provide() {
                    return {
                        getRegionId: () => { return -1; },
                        getSubMarketId: () => { return null; },    // handler error
                    }
                },
            });
        });
    });
    Vue.component('NavigationItemProduct', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem, mixinProductTheme],       // dung mixin de ke code chung
            });
        });
    });

    /* Dung chung cho 2 components
     * NavigationItemMaingoal,
     * NavigationItemSubgoal
     */  
    const mixinNavigationItemMainSub = {
        inject: ['isFocusProduct', 'getSubMarketProductId', 'getThemeId', 'getProductId', 'getRegionId', 'getSubMarketId'],
       // watch: { },
        methods: {
            onClickSelect(e) {
                const target = e.target;
                if (target.classList.contains('dnbDblclickMenuItemName') || target.classList.contains('msaNavMenuName')) {
                    MsaApp.ClcCountEditColumn += 1;
                    if (typeof MsaApp.ClcTimerEditColumn == 'undefined') {
                        MsaApp.ClcTimerEditColumn = setTimeout(this.onTimeoutClickDblclick, 333);   // dblclick
                    }
                } else {        // click
                    this.onClickFocus();  // onClickSelect NavigationItemMaingoal va NavigationItemSubgoal
                }
            },
            onTimeoutClickDblclick() {
                if (MsaApp.ClcCountEditColumn > 1) {        // dblclick
                    const item = this.goal ? this.goal : this.item;
                    var goalId = item.Id;
                    const smpId = this.getSubMarketProductId();
                    const indId = this.getThemeId();
                    const prdId = this.getProductId();
                    const rId = this.getRegionId();
                    const smId = this.getSubMarketId();
                    const currencyName = item.CurrencyName || 'CHF';
                    const isMastergoal = item.MasterGoal || item.MasterGoalKpi;

                    var info = {
                        CurrencyName: currencyName,
                        IndependencyId: indId,
                        IsMasterGoal: isMastergoal,
                        ProductId: prdId,
                        RegionId: rId,
                        SubMarketId: smId,
                        SubMarketProductId: smpId
                    };
                    var entryData = {
                        goalId: goalId,
                        independencyId: info.IndependencyId,
                        regionId: info.RegionId,
                        productId: info.ProductId,
                        subMarketId: info.SubMarketId,
                        subMarketProductId: info.SubMarketProductId,
                        parentId: null,
                        goalType: vmCommon.GoalActionContentType.MainGoal
                    };

                    this.openFormEditMainSubgoal(info, entryData);  // NavigationItemMaingoal va NavigationItemSubgoal

                } else {        // click
                    this.onClickFocus();  // NavigationItemMaingoal va NavigationItemSubgoal
                }

                MsaApp.ClcCountEditColumn = 0;          // xóa click count
                clearTimeout(MsaApp.ClcTimerEditColumn);// xóa timmer 
                MsaApp.ClcTimerEditColumn = undefined;  // set timmer về updefinded (mac dinh)
            },
            onClickFocus() {        // Hàm này viết cho NavigationItemMaingoal
                //  và override trong component NavigationItemSubgoal
                const is_Focus = !this.item.IsFocus;
                MsaApp.setFocusNavItemRef(this.item, is_Focus);
                this.item.IsFocus = is_Focus;

                if (is_Focus) {
                    this.getDataContentOnRightView();       // NavigationItemMaingoal.onClickFocus 
                } else {
                    MsaApp.removeInNavigationMenuView(this.item, 'Maingoal');
                    MsaApp.orderRightViewsByNavigationMenu();
                }

                var entryData = {
                    TypeId: this.item.TypeId,
                    FocusValue: this.item.Id,
                    IsFocus: is_Focus
                };
                vmGoalAction.dataservice.savemenufocus(entryData);
            },
            getDataContentOnRightView() {        // Hàm này viết cho NavigationItemMaingoal
                const id = this.item.Id;
                vmGoalAction.dataservice.getGoalActionContentByMaingoal({ MainGoalId: id }, function (res) {
                    if (res.value && typeof res.value.Data == 'object') {
                        const item = res.value.Data;
                        item.IsRegionOverView = res.value.IsRegionOverView;
                        item.LandId = res.value.LandId;
                        item.RegionId = res.value.RegionId;
                        item.SubMarketId = res.value.SubMarketId;
                        item.ProductId = res.value.ProductId;
                        item.RoleId = res.value.RoleId;

                        MsaApp.pushNavigationMenuView(item, 'Maingoal');
                        setTimeout(function () {
                            MsaApp.scrollY(`[navmenu-directid=navmenu-direct_${id}]`);
                        }, 1234);
                    }
                });
            },
            openFormEditMainSubgoal(info, entryData) {        // Hàm này viết cho NavigationItemMaingoal
                //  và override trong component NavigationItemSubgoal
                const title = kLg.labelMainGoalName;
                MsaApp.editGoal(entryData, info,
                    kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2,
                    'vmGoalAction.openPopupMainGoal');
            },
        },      // end methods
    }
    Vue.component('NavigationItemMaingoal', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem, mixinNavigationItemMainSub],       // dung mixin de ke thua code chung
                inject: ['setSelectChild', 'getListSubgoal'],
                data() {
                    return {
                        ListFocusChild: [],    // dung de bind ClassSelect
                        IsExpandHideMain: this.item.IsMainGoalHidden,
                    }
                },
                provide() {
                    return {
                        setSelectChildSub: (isFocusSub, id) => {        // Subgoal => Main
                            const index = this.ListFocusChild.indexOf(id);
                            if (isFocusSub && index < 0) {
                                this.ListFocusChild.push(id);
                            }
                            if (!isFocusSub && index > -1) {
                                this.ListFocusChild.splice(index, 1);
                            }

                            if (this.ListFocusChild.length && this.item.IsFocus) {
                                this.item.IsFocus = false;       // co sub focus thi bo focus
                            }
                            if (!this.ListFocusChild.length && !this.item.IsFocus) {
                                this.setSelectChild(false, this.item.Id);      // Maingoal => Product
                            }
                        },
                        isFocusMain: () => { return this.item.IsFocus; },
                        getMaingoalId: () => { return this.item.Id; },
                        isShowSub: this.isShowSub,
                        isExpandMain: () => { return this.IsExpand },
                    }
                },
                computed: {
                    StyleShow() {
                        if (this.IsExpandHideMain) return 'flex';
                        return 'none';
                    },
                    IsShowArrowExpand() {   // NavigationItemMaingoal
                        if (this.isShowSub()) return true;
                        return false;
                    },
                    ClassSelect() {     // NavigationItemMaingoal
                        const hasFocusChild = this.ListFocusChild.length > 0;
                        return this.item.IsFitSearchOrCategory ? "menu-item-fit-filter" : this.item.IsFocus || hasFocusChild ? "menu-item-selected" : "";
                    },
                },
                watch: {
                    'item.IsMainGoalHidden'(v) {
                        this.IsExpandHideMain = v;      // dung cho su kien click vao menu cua Product/Theme
                    }
                },
                beforeMount() {
                    if (this.item.IsFocus) {
                        this.setSelectChild(true, this.item.Id);      // Maingoal => Product
                        this.ListFocusChild.splice(0);      // xoa het (remove)
                    }
                    this.ListGoalItem = this.getListSubgoal(this.item.Id, this.item.SubMarketProductId, this.item.IndependencyId);
                },
                beforeUpdate() {
                    this.ListGoalItem = this.getListSubgoal(this.item.Id, this.item.SubMarketProductId, this.item.IndependencyId);

                    if (this.item.IsFocus || this.ListFocusChild.length) {
                        if (this.item.IsFocus) {
                            this.ListFocusChild.splice(0);      // xoa het (remove)
                        }
                        this.setSelectChild(true, this.item.Id);        // push len Product/Theme
                    } else if (!this.ListFocusChild.length) {
                        this.setSelectChild(false, this.item.Id);        // push len Product/Theme
                    }
                    
                },
                destroyed() {
                    this.setSelectChild(false, this.item.Id);      // Maingoal => Product
                },
                methods: {
                    isShowSub() { return this.item.IsSubGoalHidden; },
                },      // end methods
            });
        });
    });
    Vue.component('NavigationItemSubgoal', (resolve) => {
        $.get(`${__folder__}/NavigationItem.html`, template => {
            resolve({
                template: template,
                mixins: [mixinNavigationItem, mixinNavigationItemMainSub],       // dung mixin de ke code chung
                inject: ['isFocusMain', 'setSelectChildSub', 'getMaingoalId', 'isShowSub', 'isExpandMain'],
                computed: {
                    ClassExpand() {
                        if (this.isExpandMain()) { return 'sub--expand'; }
                        return '';
                    },
                    StyleShow() {
                        if (this.isShowSub()) return 'flex';
                        return 'none';
                    },
                    ClassSelect() {     // NavigationItemSubgoal
                        if (this.isFocusProduct() || this.isFocusMain()) {
                            this.item.IsFocus = false;
                        }

                        return this.item.IsFitSearchOrCategory ? "menu-item-fit-filter" : this.item.IsFocus ? "menu-item-selected" : "";
                    },
                },
                watch: {
                    'item.IsFocus'(newV) {
                        this.setSelectChildSub(newV, this.item.Id);       // Sub => Main
                    },
                },
                beforeMount() {
                    if (this.item.IsFocus) {
                        this.setSelectChildSub(true, this.item.Id);       // Sub => Main
                    }
                    delete this.$data.IsExpand;
                },
                destroyed() {
                    this.setSelectChildSub(false, this.item.Id);       // Sub => Main 
                },
                methods: {
                    onClickFocus() {        // Hàm này viết cho NavigationItemSubgoal
                        const is_Focus = !this.item.IsFocus;
                        MsaApp.setFocusNavItemRef(this.item, is_Focus);
                        this.item.IsFocus = is_Focus;

                        if (is_Focus) {            // nếu không có ở default view thì gọi handler 
                            this.getDataContentOnRightView();       // NavigationItemSubgoal.onClickFocus
                        } else {
                            MsaApp.removeInNavigationMenuView(this.item, 'Subgoal');
                            MsaApp.orderRightViewsByNavigationMenu();
                        }

                        var entryData = {
                            TypeId: this.item.TypeId,
                            FocusValue: this.item.Id, 
                            IsFocus: is_Focus
                        };
                        vmGoalAction.dataservice.savemenufocus(entryData);

                    },
                    getDataContentOnRightView() {        // Hàm này viết cho NavigationItemSubgoal
                        const id = this.item.Id;
                        vmGoalAction.dataservice.getGoalActionContentBySubgoal({ SubGoalId: id }, function (res) {
                            if (res.value && typeof res.value.Data == 'object') {
                                var subG = res.value.Data;
                                subG.ParentName = res.value.ParentName;
                                subG.IsRegionOverView = res.value.IsRegionOverView;
                                subG.RoleId = res.value.RoleId;
                                subG.RegionId = res.value.RegionId;
                                subG.SubMarketId = res.value.SubMarketId;
                                subG.ProductId = res.value.ProductId;

                                MsaApp.pushNavigationMenuView(subG, 'Subgoal');
                                setTimeout(function () {
                                    MsaApp.scrollY(`[navmenu-directid=navmenu-direct_${id}]`);
                                }, 1234);
                            }
                        });
                    },
                    openFormEditMainSubgoal(info, entryData) {        // Hàm này viết cho NavigationItemSubgoal
                        const title = kLg.labelSubGoalName;
                        entryData.parentId = this.getMaingoalId();
                        entryData.goalType = vmCommon.GoalActionContentType.SubGoal;

                        MsaApp.editGoal(entryData, info,
                            kLg.titlepEditMainGoalNew1 + htmlEscape(title) + kLg.titlepEditMainGoalNew2,
                            'vmGoalAction.openPopupSubGoal');
                    },
                },        // end method
            });
        });
    });

    Vue.component('NavigationDetail', (resolve) => {
        $.get(`${__folder__}/NavigationDetail.html`, template => {
            resolve({
                template: template,
                props: ['items'],
                provide() {
                    return {
                        getRole: () => { return 1; },
                        loadAllGoalActionInOpenArea: () => { },
                        
                        // view sub
                        getMaingoalStartDate: () => { },
                        pEditMenuGoal: () => { },
                        isShowMainOverview: () => { return true; },
                        updateListSubExpand: () => { return; },
                        onMouseOverCheckShowExceededCost: () => { return; },
                        countSub: () => { return 0; },
                        getIsVisible: () => { return true; },
                        getDragdropSubOptions: () => { return; },
                        onDragStartSubgoal: () => { return; },
                        onDragChangeSubgoal: () => { return; },
                        onDragEndSubgoal: () => { return; },
                        getViewType: () => true
                    }
                },
                
                created() {
                    //console.log(this.$data)
                },
                methods: {
                    getAllDataContentRightView() {
                        const lstPrsm = [];
                        const refMV = this.$refs['RefNavMenuView'];
                        if (Array.isArray(refMV)) {
                            refMV.filter(mV => {
                                lstPrsm.push(mV.getDataContentRightView());
                                return true;
                            });
                        }
                        return Promise.all(lstPrsm);
                    }
                }
            });
        });
    });

    const mixinViewContentNavMenu = {
        provide() {
            const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
            return {
                getIndependencyId: () => { return item.IndependencyId; },
                getSubMarketProductId: () => { return item.SubMarketProductId; },
                getProductId: this.getProductId,
                getRegionId: this.getRegionId,
                getSubMarketId: this.getSubMarketId,
                getIsMaster: this.getIsMaster,
            }
        },
        methods: {
            getRegionId() {
                const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
                return item.RegionId;
            },
            getIsMaster() {
                const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
                return {
                    MasterGoal: item.IsMasterGoal,
                    MasterGoalKpi: item.IsMasterGoalKpi
                }
            },
            getProductId() {
                const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
                return item.ProductId > 0 ? item.ProductId : null;
            },
            getRegionId() {
                const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
                return item.RegionId
            },
            getSubMarketId() {
                const item = this.ViewRightType == 'MaingoalNavMenu' ? this.goal : this.item;
                return item.SubMarketId > 0 ? item.SubMarketId : null;
            },
        }
    }
    Vue.component('NavMenuViewMaingoal', (resolve) => {
        $.get(`${MsaComponent.mainSubFolder}/ViewMaingoal.html`, template => {
            resolve({
                template: template,
                mixins: [MsaComponent.MixinMainGoal, mixinViewContentNavMenu],
                inject: ['onHoverShowTooltipAddGoalAction'],
                provide() {
                    return {
                        getRole: this.getRole,
                        checkRegionView: () => { return this.goal.IsRegionOverView },
                        isEditMain: () => { return this.getRole(); },
                    }
                },
                data() {
                    return {
                        IsExpand: true,        // override
                        MenuTxtAddSubgoal: kLg.strAddFormat.format(MsaApp.getSubgoalTitle(this.goal.Id)),
                        
                    }
                },
                computed: {
                    ViewRightType() { return 'MaingoalNavMenu' },
                    MgId() { return `navmenu-direct_${this.goal.Id}`; },
                },
                beforeUpdate() {
                    this.MenuTxtAddSubgoal = kLg.strAddFormat.format(MsaApp.getSubgoalTitle(this.goal.Id));
                },
                methods: {
                    getRole() {
                        return this.goal.RoleId;
                    },
                    addMaingoalByNav() {
                        var info = {
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.goal.SubMarketProductId,
                            independencyId: this.goal.IndependencyId,
                            isEdit: false,
                            goalType: vmCommon.GoalActionContentType.MainGoal,
                            parentStart: new Date()
                        };
                        vmGoalAction.openPopUpGoal2(info);
                    },
                    addSubGoalWithoutMain() {
                        var info = {
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.goal.SubMarketProductId,
                            independencyId: this.goal.IndependencyId,
                            isEdit: false,
                            goalType: vmCommon.GoalActionContentType.SubGoal,
                            parentId: null,
                            parentStart: new Date(),
                            parentEnd: new Date(),
                        };
                        vmGoalAction.openPopUpGoal2(info);
                    },
                    addActionWithoutSub(e) {
                        var info = {
                            actionId: vmCommon.emptyGuid,
                            goalId: vmCommon.emptyGuid,//
                            subMarketProductId: this.goal.SubMarketProductId,
                            parentSubMarketProductId: this.goal.SubMarketProductId,//
                            independencyId: this.goal.IndependencyId,
                            mainGoalId: vmCommon.emptyGuid,//
                            parentId: vmCommon.emptyGuid,
                            parentStart: new Date(),//
                            parentEnd: new Date(),//
                            endDate: new Date(),
                            title: kLg.titlepAddMainGoalNew1 + kLg.labelActionName + kLg.titlepAddMainGoalNew2,
                            isEdit: false
                        };
                        vmGoalAction.openPopUpAction2(info);
                    },
                    getDataContentRightView() {
                        const id = this.goal.Id;
                        return new Promise((resl) => {
                            vmGoalAction.dataservice.getGoalActionContentByMaingoal({ MainGoalId: id }, function (res) {
                                if (res.value && typeof res.value.Data == 'object') {
                                    const item = res.value.Data;
                                    item.IsRegionOverView = res.value.IsRegionOverView;
                                    item.LandId = res.value.LandId;
                                    item.RegionId = res.value.RegionId;
                                    item.SubMarketId = res.value.SubMarketId;
                                    item.ProductId = res.value.ProductId;
                                    item.RoleId = res.value.RoleId;

                                    MsaApp.pushNavigationMenuView(item, 'Maingoal');
                                    resl();
                                }
                            });
                        });
                    },
                },          // end method
            });
        });
    });
    Vue.component('NavMenuViewSubgoal', (resolve) => {
        $.get(`${MsaComponent.mainSubFolder}/ViewSubgoal.html`, template => {
            resolve({
                template: template,
                mixins: [MsaComponent.MixinSubGoal, mixinViewContentNavMenu],
                inject: ['onHoverShowTooltipAddGoalAction'],
                provide() {
                    return {
                        getMaingoalId: () => { return this.item.ParentId; },
                        getDataContentRightView: this.getDataContentRightView,
                        getRole: () => {
                            return this.getRole();
                        },
                    }
                },
                data() {
                    return {
                        IsExpand: true,        // override
                        MenuTxtAddAction: kLg.strAddFormat.format(MsaApp.getActionTitle(this.item.Id)),
                    }
                },
                computed: {
                    ViewRightType() { return 'SubgoalNavMenu' },
                    MaingoalId() { return this.item.ParentId; },
                    SgId() { return `navmenu-direct_${this.item.Id}` },
                    StyleTopAddActionWhenEmpty() {
                        if (!this.item.ListAction.length) {
                            return '100px';
                        }
                        return '168px';
                    },
                },
                beforeUpdate() {
                    this.MenuTxtAddAction = kLg.strAddFormat.format(this.View_TitleAction);
                },
                methods: {
                    getRole() {
                        return this.item.RoleId;
                    },
                    addSubGoalWithoutMain() {
                        var info = {
                            goalId: vmCommon.emptyGuid,
                            subMarketProductId: this.item.SubMarketProductId,
                            independencyId: this.item.IndependencyId,
                            isEdit: false,
                            goalType: vmCommon.GoalActionContentType.SubGoal,//vmCommon.GoalType.SubGoalWithoutMainGoal,
                            parentId: null,
                            parentStart: new Date(),
                            parentEnd: new Date(),
                        };
                        vmGoalAction.openPopUpGoal2(info);
                    },
                    addActionWithoutSub(e) {
                        var info = {
                            actionId: vmCommon.emptyGuid,
                            goalId: vmCommon.emptyGuid,//
                            mainGoalId: vmCommon.emptyGuid,//
                            parentId: vmCommon.emptyGuid,
                            subMarketProductId: this.item.SubMarketProductId,
                            parentSubMarketProductId: this.item.SubMarketProductId,
                            independencyId: this.item.IndependencyId,
                            title: kLg.titlepAddMainGoalNew1 + kLg.labelActionName + kLg.titlepAddMainGoalNew2,
                            endDate: new Date(),
                            parentStart: new Date(),//
                            parentEnd: new Date(),//
                            isEdit: false
                        };
                        vmGoalAction.openPopUpAction2(info);
                    },
                    getDataContentRightView() {
                        const id = this.item.Id;
                        return new Promise((resl) => {
                            vmGoalAction.dataservice.getGoalActionContentBySubgoal({ SubGoalId: id }, function (res) {
                                if (res.value && typeof res.value.Data == 'object') {
                                    var subG = res.value.Data;
                                    subG.ParentName = res.value.ParentName;
                                    subG.IsRegionOverView = res.value.IsRegionOverView;
                                    subG.RoleId = res.value.RoleId;
                                    subG.RegionId = res.value.RegionId;
                                    subG.SubMarketId = res.value.SubMarketId;
                                    subG.ProductId = res.value.ProductId;

                                    MsaApp.pushNavigationMenuView(subG, 'Subgoal');
                                    resl();
                                }
                            });
                        });
                    },
                }
            });
        });
    });

})();
