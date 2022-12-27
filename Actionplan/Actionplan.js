var MsaApp;     // Ms Actionplan App
$.get('Actionplan/Actionplan.html').done(template => {
    MsaApp = new Vue({
        el: '#goalactionApp',
        template: template,
        data: {
            LoadTimesActions: [],
            Role: -1,
            ListSubmarketProductGroup: [],
            SubMarketProductViewGroup: [], // Region Overview (IsRegionView)
            ListSubmarketProduct: [],
            ListSubmarketProductWithColor: [],
            ListIndependence: [],
            ListEvalXYZ: [],
            DataNavigationMenu: [], NavMenuExpandIds: [],
            IsShowNavigationMenu: false,
            NavigationMenuView: [],     // Data detail của view bên phải khi có Navigation Menu
            ViewRightWidth: window.outerWidth,
            MapListMain: new Map(),     // Ref map dùng cho bind MainSubAction của view Default
            MapMenuListMain: new Map,   // Ref map dùng cho bind List Main Sub của Navigation Menu

            DragDropObserver: {
                ListSmkIndProductExpand: [],
                Intersection: null,
                TimmerGetMains: undefined,
            },
            DragDropGoal: {             //arr.sort((a, b) => a.MIndex-b.MIndex);//sort tang dan
                LastEvent: '',            // dung keo tha cung main->main | sub->sub
                iFrom: -1, iTo: -1,
                ChangeGoalEvent: '',      // dung keo tha main->sub | sub->main
                Src: null, Des: null,
                Pos: 0,
                GroupMain: 'MIndexMainGoal', GroupMainExpand: 'MIndexMainGoal',GroupSub: 'MIndex_Subgoal', 
            },
            CanDragDrop: true, IsViewer: false,
            DragDropColumn: {
                LastEvent: '',
                Obj: null,
                iFrom: -1, iTo: -1,
            },
            DragDropAction: {
                LastEvent: '', ChangeEvent: '',
                Src: null, Des: null,
                iFrom: -1, iTo: -1,
                Pos: 0
            },
            Expand: {
                ExpandValue: [],            // Themes (Level 2), Products (Level 3)
                IndParents: [],             // ListIndependence (Level 1)
                SubParents: [],             // ListSubmarketProduct (Level 2)
                ExpandGrandValue: [],       // MarketSegmentGroups (Level 1)
                ExpandMaingoalNavValue: [],
                ExpandSubgoalValue: [],
                TypeId: -1,

                ListSubmarketPrdId: [],     // After dragdrop action
                ListThemeId: [],     // After dragdrop action
            },
            DragDropIndependence: {
                Options: {
                    animation: 100, sort: true,
                    disabled: false,
                    ghostClass: "ghost",
                    chosenClass: "chosenClass",
                    direction: 'vertical'
                },
                LastEvent: '',
                iFrom: -1, iTo: -1,
                LstInd: [],
                LstTheme: [], IndId: 0,
            },
            ListTitle: [],
            ApLinkOverview: {
                SubMarketProductId: null
            },
            ApLinkOverviewUrl: {
                GoalActionId: '', TypeId: 0,    // 1 | 2 | 3
                AreaId: 0   // SubMarketProductId | IndependencyId
            },
            IsShowKpigApopoverSticky: false,
            MapDelegate: new Map(),         // Dung cho viec goi ra ben ngoai nhu add/edit goal-action, keo tha Theme
            LastActiveElementId: '',
            Settings: {
                IsShowMarketLabel: true, IsHiddenGoalContent: true,
                vmGoalActionIsOverdue: false, IsCheckActionDate: false
            },
            KeyBoardCode: '', ScrollMouseAction: '',
            ClcCountEditColumn: 0, ClcTimerEditColumn: undefined,
            actionReduceExpands: {},
            kpiRegionControl: { isCollapse: false, hasData: false, data: null, areaId: null, typeId: null, regionId: null, masterId: null },
            apLinkControl: { isCollapse: false, areaId: null, goalActionTypeId: null, goalActionId: null },
            actionPlanComponents: {},
            focusDataComponents: {},
            navigationComponents: {}
        },
        provide() {
            return {
                // settings
                getIsShowMarketLabel: () => { return this.Settings.IsShowMarketLabel; },
                getIsHiddenGoalContent: () => { return this.Settings.IsHiddenGoalContent; },
                getIsOverdue: () => { return this.Settings.vmGoalActionIsOverdue; },
                getIsCheckActionDate: () => { return this.Settings.IsCheckActionDate; },

                // expand
                getIsExpand: (id, type, submarketProductId) => {
                    switch (type) {
                        case 'Market':
                            const ExpandGrandValue = this.Expand.ExpandGrandValue;
                            return ExpandGrandValue.includes(`${id}`);
                        case 'ProductGroup':
                            const SubParents = this.Expand.SubParents;
                            return SubParents.filter(m => m == id).length > 0;
                        case 'Product':
                            const lstSubmarketProducts = vmCommon.deepCopy(this.Expand.ExpandValue);
                            const hasSP = lstSubmarketProducts.filter(m => compareGuid(m, submarketProductId)).length > 0;
                            return hasSP;

                            return hasP;
                        case 'Independence':
                            const IndParents = this.Expand.IndParents;
                            return IndParents.filter(m => m == id).length > 0;
                        case 'Theme':
                            const ExpandValue = this.Expand.ExpandValue;
                            return ExpandValue.filter(m => m == id).length > 0;
                        case 'maingoal':
                            const ExpandMaingoalNavValue = this.Expand.ExpandMaingoalNavValue;
                            return ExpandMaingoalNavValue.filter(m => compareGuid(m, id)).length > 0;
                        case 'subgoal':
                            const ExpandSubgoalNavValue = this.Expand.ExpandSubgoalValue;
                            return ExpandSubgoalNavValue.filter(m => compareGuid(m, id)).length > 0;

                    }
                    return false;
                    function compareId(id1, id2) {
                        id1 = id1 ? '' + id1 : 'id1';
                        id2 = id2 ? '' + id2 : 'id2';
                        return id1 == id2;
                    }
                    function compareGuid(id1, id2) {
                        //id1 = id1 ? id1.toLowerCase() : 'id1'; id2 = id2 ? id2.toLowerCase() : 'id2';
                        id1 = id1 ? id1 : 'id1';
                        id2 = id2 ? id2 : 'id2';
                        return id1 == id2;
                    }
                },
                pushExpand: this.pushExpand,
                pushExpandListMaingoal: this.pushExpandListMaingoal,
                removeExpandListMaingoal: this.removeExpandListMaingoal,
                removeExpand: this.removeExpand,
                countChildren: (landid) => {
                    return 1;       // fake de Market component goi len
                },
                hasKeyMapDelegate: this.hasKeyMapDelegate,
                
                getBgColorByAvgEvaluation: (id, typeid) => {
                    if (typeid == 'ProductGroup') {
                        const item = this.ListSubmarketnProductColor.find(sp => sp.SubmarketId == id);
                        if (item) {
                            const eval = item.AvgEvaluation;
                            if (eval == 200) {
                                return 'evaluation-heading-parent-default'
                            } else
                                return ChoseColorPercent(eval);
                        }
                    }
                    if (typeid == 'Product') {
                        const item = this.ListSubmarketnProductColor.find(p => p.SubMarketProductId == id);
                        if (item) {
                            if (item.NumberOfProductEval == 0) {
                                return 'evaluation-heading-parent-default';
                            } else
                                return ChoseColorPercent(item.EvaluationResult);
                        }
                    }
                },

                // tooltip
                HoverTooltipStatusProtocol: this.onHoverTooltipStatusProtocol,
                onHoverShowTooltipAddGoalAction: (elm, typeId) => {
                    if (this.IsViewer) return;

                    if (typeId == vmCommon.GoalActionContentType.MainGoal) {
                        this.onHoverShowTooltipAddGoalAction(elm, kLg.titlepAddMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepAddMainGoalNew2, 'top');
                        return;
                    }
                    if (typeId == vmCommon.GoalActionContentType.SubGoal) {
                        this.onHoverShowTooltipAddGoalAction(elm, kLg.addDetachedSubgoal1 + kLg.labelSubGoalName + kLg.addDetachedSubgoal2, 'top');
                        return;
                    }
                    if (typeId == vmCommon.GoalActionContentType.Action) {
                        this.onHoverShowTooltipAddGoalAction(elm, kLg.addDetachedSubgoal1 + kLg.labelActionName + kLg.addDetachedSubgoal2, 'left');
                        return;
                    }
                },

                removeIndependency: this.removeIndependency,

                // dragdrop
                onDragMoveGoal: this.onDragMoveGoal,
                isDraggable: () => { 
                    if(window.mobileAndTabletcheck()){
                        return false;
                    }
                    return this.CanDragDrop; },
                onDragStartMaingoal: this.onDragStartMaingoal,
                onDragChangeMaingoal: this.onDragChangeMaingoal,
                onDragEndMaingoal: this.onDragEndMaingoal,
                getGroupMain: () => { return this.DragDropGoal.GroupMain },
                getGroupMainExpand: () => { return this.DragDropGoal.GroupMainExpand },
                getGroupSub: () => { return this.DragDropGoal.GroupSub },

                // Title (Main/Sub/Action)
                updateTitleAction: (subgoalId, actionTlt) => {
                    if (typeof actionTlt == 'string' && actionTlt != '') {
                        const entry = { Id: subgoalId, Text: actionTlt, IsNav: true };       // IsNav = true => ChangeGoalTitleLang
                        var url = `/Handlers/MsGoalAction.ashx?funcName=changeTitleAction&projid=${projectId}&lang=${kLg.language}&strid=${strategyId}`;
                        callAjax('loadingRegionMatrix', url, JSON.stringify(entry), function (data) {
                            MsaApp.ListTitle = data.value;
                        }, AjaxConst.PostRequest);
                    }
                },

                setApLinkOverviewUrl: (goalActionId, typeId, areaId) => {
                    this.ApLinkOverviewUrl.GoalActionId = goalActionId;
                    this.ApLinkOverviewUrl.TypeId = typeId;
                    this.ApLinkOverviewUrl.AreaId = areaId;

                    vmGoalAction.openPopConnectionOverview(goalActionId, typeId, areaId);
                },

                getThemeNavMenu: (id) => { return this.DataNavigationMenu.find(n => n.Id == id); },

                //loadding
                isViewer: this.isViewer,
                handlerLoadding: this.handlerLoadding,// () => { this.IsViewer = true; },
                canReaction: this.canReaction,

                isKeyBoardCode: this.isKeyBoardCode,
                getCurrentRole: () => { return this.Role },

                // Theme
                showPopupAddIndependence: this.showPopupAddIndependence,

                getViewRightWidth: () => {
                    this.getWidthUpdated();
                    return this.ViewRightWidth;
                },
            }
        },
        //beforeMount() { },
        mounted() {
            if (typeof vmPopSetting == 'object' && typeof vmPopSetting.ProjectInfo == 'object') {
                this.Settings.IsShowMarketLabel = vmPopSetting.ProjectInfo.IsShowMarketLabel;
            }
            window.addEventListener('resize', this.onResizeView);
            document.addEventListener('keyup', this.keyupScrollColumnX);
            document.addEventListener('keydown', this.keydownScrollColumnX);

            if (document.querySelector('.body-content'))
                document.querySelector('.body-content').addEventListener('scroll', this.onBodyContentScroll);

            this.getWidthUpdated();
            vmGoalAction.loadDataFirstTime().then(serData => {
                MsaApp.pushLoadTimeActions('vmGoalAction.dataservice.loadDataFirstTime');
                MsaApp.setData(serData.value); 
            });
            const prg = document.querySelector('#nprogressActionPlanDisableAll');if(prg) prg.style.display = 'none';
        },
        beforeUpdate(){const prg = document.querySelector('#nprogressActionPlanDisableAll');if(prg) prg.style.display = 'block';},
        updated() {
            this.getWidthUpdated();
            const prg = document.querySelector('#nprogressActionPlanDisableAll');if(prg) prg.style.display = 'none';
        },
        computed: {
            kLg() {
                return kLg;
            },
            ListSubmarketnProductColor() {
                const lstColor = [];
                this.ListSubmarketProductWithColor.filter(spC => {
                    lstColor.push({
                        SubmarketId: spC.Id, AvgEvaluation: spC.AvgEvaluation
                    });
                    spC.Products.filter(p => {
                        lstColor.push({
                            ProductId: p.Id, EvaluationResult: p.EvaluationResult,
                            SubMarketProductId: p.SubMarketProductId, NumberOfProductEval: p.NumberOfProductEval
                        });
                        return true;
                    });
                    return true;
                });
                return lstColor;
            },
            ShowApLinkOverviewUrl() {
                const lnkId = this.ApLinkOverviewUrl.GoalActionId;
                const lnkType = this.ApLinkOverviewUrl.TypeId;
                const lnkAreaId = this.ApLinkOverviewUrl.AreaId;
                const isShow = lnkType && lnkAreaId && lnkId;
                const title = isShow ? this.kLg.lblApConnection : '';
                return {
                    IsShow: isShow, Title: title,
                    LinkId: lnkId, LinkType: lnkType, SmkpId: lnkAreaId
                }
            },

            classLabel() {
                if (this.ListSubmarketProductGroup.find(t => t.IsRegionView == true) || this.ListSubmarketProductGroup.length > 1) {
                    return '';
                }
                return 'hidden';
            },
            LabelRegionOverview() {
                if (this.SubMarketProductViewGroup.find(t => t.IsRegionView == true) || this.SubMarketProductViewGroup.length > 1) {
                    return '';
                }
                return 'hidden';
            }
        },
        watch: {
            CanDragDrop(newVal) {
                this.DragDropIndependence.Options.disabled = !newVal;
            },
            LoadTimesActions(newLst) {

                if (newLst.length > 300) {
                    const Si = newLst.length - 300;
                    const cpLst = vmCommon.deepCopy(newLst);
                    let lstFromSi2End = cpLst.splice(Si);
                    this.LoadTimesActions = lstFromSi2End;
                }
            },
        },
        methods: {
            updateVisibleBrnScrollX() {
                const scrlX = document.querySelectorAll('.dnbScrollXjqry');
                if (scrlX) {
                    Array.prototype.forEach.call(scrlX, function (sx) {
                        if (sx.scrollLeft < 1) {
                            const i = sx.className.indexOf('Subgoal_');
                            const sgId = sx.className.substring(i, i + 44);
                            console.log(sx.className, sgId)
                            document.querySelector(`button.msa-btn-scroll-left.${sgId}`).style.visibility = 'hidden';
                        }
                    });
                }
            },
            getWidthUpdated() {
                if (this.IsShowNavigationMenu) {
                    this.$el.querySelector('.kpigapopover-sticky').style.left = '327px';
                } else {
                    this.$el.querySelector('.kpigapopover-sticky').style.left = '';
                }
                if (this.IsShowNavigationMenu) {
                    const mLeft = document.querySelector('.msa-navigation-menu');
                    const wLeft = mLeft ? mLeft.offsetWidth + parseInt(mLeft.style.marginRight) : 0;

                    this.ViewRightWidth = window.outerWidth - wLeft - 33;

                } else {
                    this.ViewRightWidth = window.outerWidth;
                }
            },
            updateDataProductOrTheme_Expand_InView_Observer(exceptSmpId, exceptIndId) {
                return;
                if (this.NavigationMenuView.length) {
                    this.reloadDataContentRightView();
                }

                this.clearObserver();
                const lstPrms = [];
                var obsv;
                if (this.$data.DragDropObserver.Intersection == null) {
                    let options = {
                        root: null, rootMargin: "0px", threshold: buildThresholdList()
                    };
                    obsv = new IntersectionObserver(handleIntersect, options);
                    this.$data.DragDropObserver.Intersection = obsv;

                    function handleIntersect(entries, observer) {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                const nodePrd = entry.target;            // section[type="Product"]

                                if (0.06 < entry.intersectionRatio) {        //    6% < r
                                    const isQ = nodePrd.getAttribute('data-queue-reload'); // get flag (data-queue-reload)

                                    if (isQ == 'true') {          // check exist flag (data-queue-reload == true)
                                        //   console.log(nodePrd.getAttribute('smk-product-id'), isQ, entry.intersectionRatio)                                        
                                        const smkpId = nodePrd.getAttribute('smk-product-id');
                                        const indId = nodePrd.getAttribute('theme-id');

                                        if (MsaApp.DragDropObserver.ListSmkIndProductExpand.includes(smkpId)) {
                                            lstPrms.push(MsaApp.loadOpenProducts(smkpId).then(() => {        // call handler [ReloadOpenProduct()]
                                                var eN = document.querySelector(`div[data-queue-reload="true"][smk-product-id="${smkpId}"]`);
                                                if (eN) {
                                                    eN.setAttribute('data-queue-reload', false);
                                                    // unobserver
                                                    if (MsaApp.$data.DragDropObserver.Intersection != null) {
                                                        MsaApp.$data.DragDropObserver.Intersection.unobserve(eN);
                                                    }
                                                }
                                                return smkpId;
                                            }));

                                            var i = MsaApp.DragDropObserver.ListSmkIndProductExpand.indexOf(smkpId);
                                            MsaApp.DragDropObserver.ListSmkIndProductExpand.splice(i, 1)
                                        }
                                        if (MsaApp.DragDropObserver.ListSmkIndProductExpand.includes(indId)) {
                                            lstPrms.push(MsaApp.loadOpenIndependencies(indId).then(() => {       // call handler [loadDataGoalAction()]
                                                var eN = document.querySelector(`div[data-queue-reload="true"][theme-id="${indId}"]`);
                                                if (eN) {
                                                    eN.setAttribute('data-queue-reload', false);
                                                    // unobserver
                                                    if (MsaApp.$data.DragDropObserver.Intersection != null) {
                                                        MsaApp.$data.DragDropObserver.Intersection.unobserve(eN);
                                                    }
                                                }
                                                return indId;
                                            }));

                                            var i = MsaApp.DragDropObserver.ListSmkIndProductExpand.indexOf(indId);
                                            MsaApp.DragDropObserver.ListSmkIndProductExpand.splice(i, 1)
                                        }
                                    }
                                }
                            }
                        });
                    }
                    function buildThresholdList() {     // ham mau https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
                        let thresholds = [];
                        let numSteps = 20;

                        for (let i = 1.0; i <= numSteps; i++) {
                            let ratio = i / numSteps;
                            thresholds.push(ratio);
                        }

                        thresholds.push(0);
                        return thresholds;
                    }
                } else {
                    obsv = this.$data.DragDropObserver.Intersection;
                }

                const lstPrd = document.querySelectorAll('[data-queue-reload="false"]');
                var smkpId, indId;
                Array.prototype.forEach.call(lstPrd, function (nodePrd) {
                    smkpId = nodePrd.getAttribute('smk-product-id');
                    indId = nodePrd.getAttribute('theme-id');

                    if (typeof exceptSmpId == 'string' && smkpId && smkpId == exceptSmpId) {
                        return;     // continue
                    }
                    if (exceptIndId && indId && indId == exceptIndId) {
                        return;     // continue
                    }

                    obsv.observe(nodePrd);

                    if (smkpId) MsaApp.DragDropObserver.ListSmkIndProductExpand.push(smkpId);
                    if (indId) MsaApp.DragDropObserver.ListSmkIndProductExpand.push(indId);

                    nodePrd.setAttribute('data-queue-reload', true);
                });
                return Promise.all(lstPrms);
            },
            clearObserver() {
                MsaApp.DragDropObserver.ListSmkIndProductExpand.splice(0);      // tha la bo di het ta lam lai tu dau
                if (this.$data.DragDropObserver.Intersection == null) return;

                const obsv = this.$data.DragDropObserver.Intersection;

                const lstPrd = document.querySelectorAll('[data-queue-reload="true"]');
                Array.prototype.forEach.call(lstPrd, function (nodePrd) {
                    obsv.unobserve(nodePrd);

                    nodePrd.setAttribute('data-queue-reload', false);
                });
            },
            setMapDelegate(key, value) {
                if (typeof key === 'undefined') return;
                if (typeof key == null) return;
                this.MapDelegate.set(key, value);
            },
            hasKeyMapDelegate(key) {
                return this.MapDelegate.has(key);
            },
            deleteMapDelegate(key) {
                if (this.hasKeyMapDelegate(key))
                    this.MapDelegate.delete(key);
            },
            runFuncMapDelegate(key, pFnc) {
                const v = this.MapDelegate.get(key);
                if (typeof v === 'function') v(pFnc);
            },
            scrollXY2Action(aid, calback) {
                const _a = !MsaApp.IsShowNavigationMenu ? `[direction-id=${aid}]` : `[direction-id=nav_${aid}]`;
                if (MsaApp.isElementHtmlOutofViewX(_a)) {
                    if (MsaApp.isElementHtmlOutofViewY(_a)) {
                        MsaApp.scrollX(_a, function done1() {
                            MsaApp.scrollY(_a, calback);
                        });
                    } else {
                        MsaApp.scrollX(_a, calback);
                    }
                } else if (MsaApp.isElementHtmlOutofViewY(_a)) {
                    MsaApp.scrollY(_a, calback);
                } else {
                    if (typeof calback === 'function') calback();
                }
            },
            isElementHtmlOutofViewX(elm) {
                const $ac = $(elm);
                if (!$ac.length) return false;
                const $vw = $ac.closest('.msaVueSubgoalColWrap');
                if (!$vw.length) return false;

                const $aOvX = $vw.find('.dnbActionOverX');
                if (!$aOvX.length) return false;

                var x0 = $aOvX.offset().left;
                var x1 = $ac.offset().left;

                if (x1 < x0) return true;   // compare left

                x0 += $aOvX.width();
                x1 += $ac.width();

                if (x1 > x0) return true;   // compare right

                return false;
            },
            isElementHtmlOutofViewY(elm) {
                const $ac = $(elm);
                if (!$ac.length) return false;
                var y0 = $(".ms-header").height() + $(".submenu").height();
                var y1 = $ac.offset() ? $ac.offset().top : y0;

                if (y1 < y0) return true;       // compare top

                y0 += $('.body-content').height();
                y1 += $ac.height();

                if (y1 > y0) return true;       // comare bottom

                return false;
            },
            isViewer() { return this.IsViewer == true },
            handlerLoadding() { this.IsViewer = true },
            canReaction() { this.IsViewer = false },
            onDragStartIndependence(evt) {
                MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                this.DragDropIndependence.LastEvent = 'onDragStartIndependence';
                this.DragDropIndependence.LstInd = this.ListIndependence.map(ind => {
                    return {
                        Id: ind.Id, Mdf: ind.Mdf, MIndex: ind.MIndex
                    }
                });
            },
            onDragChangeIndependence(evt) {
                this.DragDropIndependence.LastEvent = 'onDragChangeIndependence';
                const m = evt.moved;
                if (m) {
                    this.DragDropIndependence.iFrom = m.oldIndex;
                    this.DragDropIndependence.iTo = m.newIndex;
                }
            },
            onDragEndIndependence(evt) {
                if (this.DragDropIndependence.LastEvent == 'onDragChangeIndependence') {
                    const lstInd = vmCommon.deepCopy(this.DragDropIndependence.LstInd);

                    const srcIndex = this.DragDropIndependence.iFrom;
                    const desIndex = this.DragDropIndependence.iTo;
                    const srcObj = lstInd[srcIndex];
                    const desObj = lstInd[desIndex];
                    if (!srcObj && !desObj) return;
                    if (srcObj.Id === desObj.Id) {
                        return;
                    }
                    var pos = desIndex > srcIndex ? 1 : 0;

                    this.updateMIndexIndependency(srcObj.Id, desObj.Id, pos, desObj.Mdf, srcObj.Mdf, lstInd);
                }

                this.DragDropIndependence.LastEvent = 'onDragEndIndependence';
            },
            onBodyContentScroll(event) {
                this.hideMenuNavigationMenu();
            },
            getLastActiveElementId() { return this.LastActiveElementId; },
            closeApLinkOverviewUrl() {
                vmGoalAction.closePopConnectionOverview();
                this.ApLinkOverviewUrl.TypeId = 0;
                this.ApLinkOverviewUrl.AreaId = 0;
                this.ApLinkOverviewUrl.GoalActionId = '';
                this.IsShowKpigApopoverSticky = false;
            },
            pushLoadTimeActions(strAction) {
                if (!this.isLastLoadTimeAction(strAction))
                    this.LoadTimesActions.push(`${strAction}`);
            },
            getLastLoadTimeActions() {
                return this.LoadTimesActions[this.LoadTimesActions.length - 1];
            },
            isLastLoadTimeAction(str) {
                return this.getLastLoadTimeActions() == str;
            },
            collapseApLinkOverviewUrl() {
                this.IsShowKpigApopoverSticky = true;

            },
            SetCheckboxFromSettings(isShwMarketLabel, isHidnGContent, isChkActionDate) {
                if (typeof isShwMarketLabel == 'boolean') this.Settings.IsShowMarketLabel = isShwMarketLabel;
                if (typeof isHidnGContent == 'boolean') this.Settings.IsHiddenGoalContent = isHidnGContent;
                if (typeof isChkActionDate == 'boolean') this.Settings.IsCheckActionDate = isChkActionDate;
            },
            checkQueryParam() {
                const objQuery = new queryString(true);
                return objQuery;
            },            
            removeExpand(id, type) {
                return new Promise(resvl => {
                    if (typeof id === 'undefined') return;

                    var _index = -1, isChange = false;
                    switch (type) {
                        case 'Market':
                            _index = this.Expand.ExpandGrandValue.indexOf(id);
                            if (_index > -1) {
                                this.Expand.ExpandGrandValue.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'ProductGroup':
                            _index = this.Expand.SubParents.indexOf(id);
                            if (_index > -1) {
                                this.Expand.SubParents.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'Product':
                            _index = this.Expand.ExpandValue.indexOf(id);
                            if (_index > -1) {
                                this.Expand.ExpandValue.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'Independence':
                            _index = this.Expand.IndParents.indexOf(id);
                            if (_index > -1) {
                                this.Expand.IndParents.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'Theme':
                            _index = this.Expand.ExpandValue.indexOf(id);
                            if (_index > -1) {
                                this.Expand.ExpandValue.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'maingoal':
                            id = id.toLowerCase();
                            _index = this.Expand.ExpandMaingoalNavValue.indexOf(id);
                            if (_index > -1) {
                                this.Expand.ExpandMaingoalNavValue.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        case 'subgoal':
                            id = id.toLowerCase();
                            _index = this.Expand.ExpandSubgoalValue.indexOf(id);
                            if (_index > -1) {
                                this.Expand.ExpandSubgoalValue.splice(_index, 1);
                                if (!isChange) isChange = true;
                            }
                            break;
                        default:
                            isChange = false;
                            return;
                    }
                    if (isChange == true) vmGoalAction.dataservice.saveExpand(this.getExpandEntry(), resvl);
                    else resvl();
                });
            },
            pushExpand(id, type, isChange) {
                return new Promise(resvl => {
                    if (typeof id == 'undefined') return;
                    var isInclude = false;
                    switch (type) {
                        case 'Market':
                            isInclude = this.Expand.ExpandGrandValue.includes(id);
                            if (!isInclude) {
                                this.Expand.ExpandGrandValue.push(id);
                                change();
                            }
                            break;
                        case 'ProductGroup':
                            isInclude = this.Expand.SubParents.includes(id);
                            if (!isInclude) {
                                this.Expand.SubParents.push(id);
                                change();
                            }
                            break;
                        case 'Product':
                            isInclude = this.Expand.ExpandValue.includes(id);
                            if (!isInclude) {
                                this.Expand.ExpandValue.push(id);
                                change();
                            }
                            break;
                        case 'Independence':
                            isInclude = this.Expand.IndParents.includes(id);
                            if (!isInclude) {
                                this.Expand.IndParents.push(id);
                                change();
                            }
                            break;
                        case 'Theme':
                            isInclude = this.Expand.ExpandValue.includes(id);
                            if (!isInclude) {
                                this.Expand.ExpandValue.push(id);
                                change();
                            }
                            break;
                        case 'maingoal':
                            id = id.toLowerCase();
                            isInclude = this.Expand.ExpandMaingoalNavValue.includes(id);
                            if (!isInclude && id != vmCommon.emptyGuid) {
                                this.Expand.ExpandMaingoalNavValue.push(id);
                                change();
                            }
                            break;
                        case 'subgoal':
                            id = id.toLowerCase();
                            isInclude = this.Expand.ExpandSubgoalValue.includes(id);
                            if (!isInclude && id != vmCommon.emptyGuid) {
                                this.Expand.ExpandSubgoalValue.push(id);
                                change();
                            }
                            break;
                        default:
                            return;
                    }
                    if (isChange == true) vmGoalAction.dataservice.saveExpand(this.getExpandEntry(), resvl);
                    else resvl();

                    function change() {
                        if (typeof isChange == 'undefined' || isChange == false) {
                            isChange = true;
                        }
                    }
                });
            },
            pushExpandListMaingoal(lstMaingoal, isCallhandler) {
                const lstOldM = vmCommon.deepCopy(this.Expand.ExpandMaingoalNavValue);
                const allLst = lstOldM.concat(lstMaingoal);
                const lstTrunc = [];
                allLst.forEach((mgId, i) => {
                    if (allLst.indexOf(mgId) == i && mgId != vmCommon.emptyGuid) {
                        lstTrunc.push(mgId);
                    }
                });
                this.Expand.ExpandMaingoalNavValue = lstTrunc;
                if (isCallhandler == true)
                    vmGoalAction.dataservice.saveExpand(this.getExpandEntry());
            },
            removeExpandListMaingoal(lstMaingoal, isCallHandler) {
                const lstOldM = vmCommon.deepCopy(this.Expand.ExpandMaingoalNavValue);
                const lstRmv = [];
                lstOldM.forEach((mgId, i) => {
                    if (!lstMaingoal.includes(mgId)) {
                        lstRmv.push(mgId);
                    }
                });
                this.Expand.ExpandMaingoalNavValue = lstRmv;
                if (isCallHandler == true)
                    vmGoalAction.dataservice.saveExpand(this.getExpandEntry());
            },
            removeExpandListSubgoal(lstSubgoal, isCallHandler) {
                const lstOldM = vmCommon.deepCopy(this.Expand.ExpandSubgoalValue);
                const lstExpnd = [];
                lstOldM.forEach((mgId, i) => {
                    if (!lstSubgoal.includes(mgId)) {
                        lstExpnd.push(mgId);
                    }
                });
                this.Expand.ExpandSubgoalValue = lstExpnd;
                if (isCallHandler == true) {
                    vmGoalAction.dataservice.saveExpand(this.getExpandEntry());
                }
            },
            pushExpandListSubgoal(lstSubgoal, isCallHandler) {
                const lstOldM = vmCommon.deepCopy(this.Expand.ExpandSubgoalValue);
                const allLst = lstOldM.concat(lstSubgoal);
                const lstTrunc = [];
                allLst.forEach((mgId, i) => {
                    if (allLst.indexOf(mgId) == i && mgId != vmCommon.emptyGuid) {
                        lstTrunc.push(mgId);
                    }
                });
                this.Expand.ExpandSubgoalValue = lstTrunc;
                if (isCallHandler == true)
                    vmGoalAction.dataservice.saveExpand(this.getExpandEntry());
            },
            getExpandEntry() {
                const expand = this.Expand;
                const expandValue = expand.ExpandValue.join(",");
                const expandParentValue = expand.SubParents.map(function (s) { return s + "s"; }).join(",") + (expand.SubParents.length > 0 && expand.IndParents.length > 0 ? "," : "") + expand.IndParents.join(",");
                const expandGrandValue = expand.ExpandGrandValue.join(",");
                const expandMaingoalNavValue = expand.ExpandMaingoalNavValue.join(",");
                const ExpandSubgoalValue = expand.ExpandSubgoalValue.join(",");
                const typeId = expand.TypeId
                return {
                    expandValue: expandValue, expandParentValue: expandParentValue, expandGrandValue: expandGrandValue,
                    expandMaingoalNavValue: expandMaingoalNavValue, ExpandSubgoalValue: ExpandSubgoalValue, typeId: typeId
                }
            },
            setFocusData(item1) {
                if (item1.FocusData) {
                    const fNavMenuData = item1.FocusData.filter(d => d.Data != null).map(d2 => {
                        var data = d2.Data;
                        switch (d2.TypeId) {
                            case 1:
                                data.IsShow = true;
                             //   data.HeadTitle = data.Name;
                                data.ViewRightType = 'SubgoalProduct';
                                break;
                            case 2:
                                data.IsShow = true;
                              //  data.HeadTitle = data.Name;
                                data.ViewRightType = 'SubgoalTheme';
                                break;
                            case 3: // Maingoal
                                data.IsRegionOverView = d2.IsRegionOverView;
                                data.LandId = d2.LandId;
                                data.RegionId = d2.RegionId;
                                data.SubMarketId = d2.SubMarketId;
                                data.ProductId = d2.ProductId;
                                break;
                            case 4: // Subgoal
                                data.ParentName = d2.ParentName;
                                data.IsRegionOverView = d2.IsRegionOverView;
                                data.LandId = d2.LandId;
                                data.RegionId = d2.RegionId;
                                data.SubMarketId = d2.SubMarketId;
                                data.ProductId = d2.ProductId;
                                break;
                        }
                        data.RoleId = d2.RoleId;

                        return data;
                    });

                    MsaApp.NavigationMenuView.splice(0);
                    fNavMenuData.forEach(_item => {
                        MsaApp.NavigationMenuView.push(_item);
                    });
                }
            },
            setData(res) {          //MsaApp.setData
                // check undefined vi co the dung o nhung cho khac ma khong can update tat ca cac bien
                if (typeof res.Role !== 'undefined') this.Role = res.Role;
                if (typeof res.IsOverdue !== 'undefined') this.Settings.vmGoalActionIsOverdue = res.IsOverdue;
                if (typeof res.IsCheckActionDate !== 'undefined') this.Settings.IsCheckActionDate = res.IsCheckActionDate;
                if (typeof res.Expand !== 'undefined') this.setExpandValues(res.Expand);
                if (typeof res.IsShowMarketLabel !== 'undefined') this.Settings.IsShowMarketLabel = res.IsShowMarketLabel;
                if (typeof res.IsHiddenGoalContent !== 'undefined') this.Settings.IsHiddenGoalContent = res.IsHiddenGoalContent;

                const item1 = res.Data.Item1;
                if (typeof item1.ListTitle !== 'undefined') this.ListTitle = item1.ListTitle;

                if (Array.isArray(item1.ListSubmarketProductGroup)) {
                    this.ListSubmarketProductGroup.splice(0);
                    item1.ListSubmarketProductGroup.forEach(i => {
                        MsaApp.ListSubmarketProductGroup.push(i);
                    });
                }
                if (Array.isArray(item1.SubMarketProductViewGroup)) {
                    this.SubMarketProductViewGroup.splice(0);
                    item1.SubMarketProductViewGroup.forEach(i => {
                        MsaApp.SubMarketProductViewGroup.push(i);
                    });
                }
                if (Array.isArray(item1.ListSubmarketProduct)) {
                    this.ListSubmarketProduct.splice(0);
                    item1.ListSubmarketProduct.forEach(i => {
                        MsaApp.ListSubmarketProduct.push(i);
                    });
                }
                if (Array.isArray(item1.ListSubmarketProductWithColor)) {
                    this.ListSubmarketProductWithColor.splice(0);
                    item1.ListSubmarketProductWithColor.forEach(i => {
                        MsaApp.ListSubmarketProductWithColor.push(i);
                    });
                }

                if (Array.isArray(item1.ListIndependence)) {
                    this.ListIndependence.splice(0);
                    item1.ListIndependence.forEach(i => {
                        MsaApp.ListIndependence.push(i);
                    });
                }
                if (res.LastFocusElement && res.LastFocusElement != vmCommon.emptyGuid) {
                    this.LastActiveElementId = res.LastFocusElement;
                }

                if (item1.ActionPlanMenu) this.setDataNavigationMenu(item1.ActionPlanMenu);
                this.setFocusData(item1);
            },
            setDataNavigationMenu(data) {
                MsaApp.DataNavigationMenu.splice(0);
                data.forEach(lsM => {
                    MsaApp.DataNavigationMenu.push(lsM);
                });
                //Array.prototype.push.apply(MsaApp.DataNavigationMenu, data);
            },
            
            // Hàm này dùng khi click vào item navigation menu hoặc dùng khi reload lại trang hàm (getAllDataContentRightView)
            pushNavigationMenuView(item, type) {
                if (!item) return;
                this.removeInNavigationMenuView(item, type);
                this.NavigationMenuView.push(item);
                this.orderRightViewsByNavigationMenu();

                //goto:     // da goi ham scrollY nen khong can dung nua
                //setTimeout(function () {
                //    vmCommon.goto($(`div[drgdrp-id=${item.Id}]`));
                //}, 100);
                
            },
            setFocusNavItemRef(item, is_Focus) {
                const smpIndId = item.IndependencyId ? item.IndependencyId : item.SubMarketProductId;
                if (!MsaApp.MapMenuListMain.has(smpIndId)) return;
                
                const lstMains = MsaApp.MapMenuListMain.get(smpIndId);
                if (item.TypeId == 3) {     // Main
                    const main = lstMains.find(m => m.Id == item.Id);
                    if (main) main.IsFocus = !!is_Focus;
                } else {        // 4 Sub
                    const main = lstMains.find(m => m.Id == item.ParentId);
                    if (main) {
                        const sub = main.Childs.find(s => s.Id == item.Id);
                        if (sub) {
                            if (!!is_Focus) main.IsFocus = false;       // neu focus con => bo focus cha
                            sub.IsFocus = !!is_Focus;
                        }
                    }
                }
            },
            removeInNavigationMenuView(item, type) {
                if (!item) return;
                var index = -1;
                switch (type) {
                    case 'Maingoal':
                    case 'Subgoal':
                    case 'ViewProductTheme':
                        var mg = MsaApp.NavigationMenuView.find((m, i) => {
                            if (m.Id == item.Id) {
                                index = i;
                                return true;
                            }
                            return false;
                        });
                        if (mg) MsaApp.NavigationMenuView.splice(index, 1);
                        break;
                }
            },
            orderRightViewsByNavigationMenu() {
                const focusIds = document.querySelectorAll('div[focus-id]');
                const nav = this.NavigationMenuView;
                var id, newLst = [];
                for (const _div of focusIds) {
                    id = _div.getAttribute('focus-id');
                    const item = nav.find(item => item.Id == id);
                    if (item) {
                        newLst.push(item);
                    }
                }
                nav.splice(0);      // remove item in list (ref)
                Array.prototype.push.apply(nav, newLst);        // push
            },
            onMouseWheelBodyContent() {
                document.querySelector('.body-content').removeEventListener('wheel', disableMouseWheel);
            },
            offMouseWheelBodyContent() {
                document.querySelector('.body-content').addEventListener('wheel', disableMouseWheel);
                MsaApp.ScrollMouseAction = '';
            },
            setExpandValues(data) {
                
                this.Expand.ExpandValue = data.ExpandValue ? data.ExpandValue.split(",") : [];
                var temps = data.ExpandParentValue ? data.ExpandParentValue.split(",") : [];
                for (var i = 0, len = temps.length; i < len; i++) {
                    if (temps[i].lastIndexOf("s") === -1) {
                        this.Expand.IndParents.pushUnique(temps[i]);
                        //indItems.pushUnique(temps[i]);
                    } else {
                        const subPrtId = parseInt(temps[i]);
                        this.Expand.SubParents.pushUnique(subPrtId.toString());
                        //subItems.pushUnique(parseInt(temps[i]).toString());
                    }
                }

                this.Expand.ExpandGrandValue = data.ExpandGrandValue ? data.ExpandGrandValue.split(",") : [];
                this.Expand.ExpandMaingoalNavValue = data.ExpandMaingoalNavValue ? data.ExpandMaingoalNavValue.split(",") : [];

                var sgnavItems = typeof data.ExpandSubgoalValue == 'string' ? data.ExpandSubgoalValue.split(',').filter(x => { return x != ''; }) : [];
                //if (sgnavItems.length > 0 && sgnavItems.length != 2) { sgnavItems = [sgnavItems[sgnavItems.length - 1]]; }
                this.Expand.ExpandSubgoalValue = sgnavItems;
                this.Expand.TypeId = data.TypeId;
            },
            getDataFromBtnFilter(serData) {             // click button Filter
                switch (false) {
                    case this.isLastLoadTimeAction('vmEditGoalDataserviceCreateGoal'):
                    //case this.isLastLoadTimeAction('vmGoalActionDataserviceDuplicateGoal'):
                        this.pushLoadTimeActions('User_onClickButtonFilter');
                        break;
                }

                const data = serData.value;
                const item1 = data.Data.Item1;
                this.Role = data.Role;
                
                this.ListSubmarketProductGroup = vmCommon.deepCopy(item1.ListSubmarketProductGroup);
                this.SubMarketProductViewGroup = vmCommon.deepCopy(item1.SubMarketProductViewGroup);
                this.ListSubmarketProduct = vmCommon.deepCopy(item1.ListSubmarketProduct);
                this.ListSubmarketProductWithColor = vmCommon.deepCopy(item1.ListSubmarketProductWithColor);
                this.ListIndependence = vmCommon.deepCopy(item1.ListIndependence);
                
                this.loadOpenProducts();
                this.loadOpenIndependencies();

                if (item1.ActionPlanMenu) {
                    this.MapMenuListMain.clear();       // clear Map đi để cập nhật lại data cho Navigation Menu (Main/Sub)
                    this.setDataNavigationMenu(item1.ActionPlanMenu);
                }
                this.setFocusData(item1);

            },
            getPath2(lst) {
                if (!lst || lst.length == 0) return {};

                var lastP = lst.last();
                var paths = lst.map(t => {
                    return { Txt: t, Color: '#808080' };
                });
                paths.pop();

                return {
                    Lst1stPath: paths,
                    RegionName: lastP
                };
            },
            getPath(pathName) {
                if (typeof pathName != 'string') return pathName;
                const a = pathName.split('/');  // array
                var lastP = '';
                if (a.length > 1) {
                    lastP = a[a.length - 1];
                    a.length = a.length - 1;    // cat phan cu cuoi cung cua array
                }
                var lstP = [];
                a.forEach(pth => {
                    lstP.push({ Txt: pth, Color: '#808080' });
                });

                return {
                    Lst1stPath: lstP, RegionName: lastP
                }
            },
            updateNavigationMenu(goal) {            // set lai ten cho Menu ben trai va view ben phai
                var itemR = this.NavigationMenuView.find(it => it.Id == goal.Id);
                if (itemR) {
                    itemR.Name = goal.Name;
                } else {
                    this.NavigationMenuView.find(mg => {
                        if (mg.ListSubGoal && Array.isArray(mg.ListSubGoal)) {
                            itemR = mg.ListSubGoal.find(sg => sg.Id == goal.Id);
                        }
                        return itemR;
                    });
                    if (itemR) {
                        itemR.Name = goal.Name;
                    } else {

                    }
                }

                // Update lai ten cho menu ben trai khi update item o ben phai
                var itemL;
                this.MapMenuListMain.forEach((lstMenuM) => {
                    itemL = lstMenuM.find(m => m.Id == goal.Id);
                    if (itemL) {        // neu la Main
                        itemL.Name = goal.Name;
                    } else {
                        lstMenuM.find(m => {
                            itemL = m.Childs.find(s => s.Id == goal.Id);
                            return itemL;
                        });
                        if (itemL) {        // Neu la Sub
                            itemL.Name = goal.Name;
                        } else {

                        }
                    }
                });
            },
            showPopupAddIndependence() {                // Add superior theme
                if (vmGoalAction.Role < vmCommon.MemberRole.Edit) {
                    return;
                }
                vmGoalAction.IndepencencyOptions = {};
                vmGoalAction.listRegions = [];
                var lands = vmGoalAction.setting.ListLandType.LandTypes;
                for (var j = 0; j < lands.length; j++) {
                    var land = lands[j];
                    for (var k = 0; k < land.Regions.length; k++) {
                        if (land.Regions[k].Id)
                            vmGoalAction.listRegions.push({ Name: land.Regions[k].Name, Id: land.Regions[k].Id, RoleId: 1 });
                    }
                }

                if (vmGoalAction.listRegions.length) {
                    MsaApp.setMapDelegate(`showPopupAddIndependence_Btn`, {
                        NameType: 'AddSupperTheme'
                    });

                    vmGoalAction.parentId = 0;
                    vmGoalAction.IsEditIndependency = false;
                    vmGoalAction.showAddIndependencePopup(kLg.gaTitleAddOverallThread, 365);
                } else {
                    pAlert(kLg.gaMesgRequireRegion);
                }
            },
            hideAllMenuDropdown() {
                const $this = $('.body-content');
                $this.find('.ms-dropdow.msa-mg-hover-arrow-drp.open').removeClass('open');
                $this.find('.msa-menu-override-uleft.open').removeClass('open');
                $this.find('.drp-menu-main-goal.open').removeClass('open');
                $this.find('.dnbMenuToggleRight.open').removeClass('open');
                $this.find('.ms-dropdow.open').removeClass('open');

            },
            hideAllTooltipDes() {
                $('.TooltipFullMaingoal, .TooltipNameSub, .TooltipFullAction').each(function () {
                    var tt = $(this).data("kendoTooltip");
                    if (tt) tt.destroy();
                });
            },
            getKpiOverview(goal) {
                var kovArrow = '';
                if (goal.KpiOverView == 1) {
                    kovArrow = 'kpi-overview-up';
                }
                if (goal.KpiOverView == 2) {
                    kovArrow = 'kpi-overview-equal';
                }
                if (goal.KpiOverView == 3) {
                    kovArrow = 'kpi-overview-down';
                }
                var kovBg = '';
                if (goal.KpiOverViewPercent < 70.51) {
                    kovBg = 'kpi-overview-bgdown';
                } else if (goal.KpiOverViewPercent < 99.5) {
                    kovBg = 'kpi-overview-bgequal';
                } else {
                    kovBg = 'kpi-overview-bgup';
                }
                var classMsaKpiBg = '';
                if (goal.KpiOverViewIsShowPercent) {
                    classMsaKpiBg = 'msa-kpi-bg';
                    if (goal.KpiOverViewPercent < 49.5) { classMsaKpiBg += '60' }
                    else if (goal.KpiOverViewPercent <= 69.49) { classMsaKpiBg += '50-70' }
                    else { classMsaKpiBg += '80' }
                }

                return {
                    ClsArrow: kovArrow, ClsBg: kovBg, KpiBg: classMsaKpiBg
                }
            },
            initAndShowKendoTooltip(tooltipObj, $elm) {
                var $template = $("#tbHoverNameShowDetailTooltip");
                var template = kendo.template($template.html());
                var popOpt = {
                    autoHide: true, maxWidth: 920,
                    content: template(tooltipObj),
                    color: "#00FFFF", //show: function () { console.log("tooltip is shown"); },
                    hide: function () {
                        var tt = $(this.element).data("kendoTooltip");
                        if (tt) tt.destroy();
                    }
                };
                $elm.kendoTooltip(popOpt).data("kendoTooltip").show();
            },
            onHoverTooltipStatusProtocol(item, e) {
                if (!item.LastStatusDate && !item.LastStatusDescription) return;

                const s = item.LastStatusDate ? typeof item.LastStatusDate === "string" ? item.LastStatusDate.toDate() : item.LastStatusDate : '';
                var lastStatusDate = s ? kendo.toString(s, "d") : '';
                const tooltipObj = {
                    LastStatusDescription: item.LastStatusDescription,
                    LastStatus: item.LastStatus
                }
                if (lastStatusDate) tooltipObj.LastStatusDate = lastStatusDate

                var template = kendo.template($("#tbHoverStatusProtocol").html());
                const $elm = $(e.target);

                var tooltip = $elm.kendoTooltip({
                    autoHide: true,
                    content: template(tooltipObj),
                    color: "#00FFFF",
                    hide: function () {
                        var tt = $(this.element).data("kendoTooltip");
                        if (tt) tt.destroy();
                    }
                }).data("kendoTooltip");
                tooltip.show();
            },
            // #region Evaluation XYZ
            deleteEvalTemplate(templateId) {
                this.ListEvalXYZ.filter(etmp => {
                    if (etmp.TemplateId == templateId) {
                        etmp.TemplateName = null;
                        etmp.TemplateId = null;
                        return true;
                    }
                });
            },
            overrideTitleTemplate(evl) {    // {TemplateId, TitleX, TitleY}
                this.ListEvalXYZ.filter(etmp => {
                    if (etmp.TemplateId == evl.TemplateId) {
                        if (evl.TitleX) etmp.TitleX = evl.TitleX;
                        if (evl.TitleY) etmp.TitleY = evl.TitleY;
                        if (evl.TitleNegativeX) etmp.TitleNegativeX = evl.TitleNegativeX;
                        if (evl.TitleNeutralX) etmp.TitleNeutralX = evl.TitleNeutralX;
                        if (evl.TitlePositiveX) etmp.TitlePositiveX = evl.TitlePositiveX;
                        if (evl.TitleNegativeY) etmp.TitleNegativeY = evl.TitleNegativeY;
                        if (evl.TitleNeutralY) etmp.TitleNeutralY = evl.TitleNeutralY;
                        if (evl.TitlePositiveY) etmp.TitlePositiveY = evl.TitlePositiveY;
                        etmp.EvalX = evl.EvalX;
                        etmp.EvalY = evl.EvalY;
                        etmp.EvalZ = evl.EvalZ;
                        etmp.TemplateName = evl.TemplateName;
                        return true;
                    }
                });
            },
            deleteEvalXYZ(id) {
                let i = this.ListEvalXYZ.indexOf(x => x.Id == id);
                if (i > -1) {
                    this.ListEvalXYZ.splice(i, 1);      // remove from array
                }
            },
            updateListEvalXYZ(listEval) {       // [{Id, EvalX, EvalY, EvalZ}]
                if (!listEval.length) return;
                const lstEvl = this.ListEvalXYZ;
                listEval.forEach(evl => {
                    let evlItem = lstEvl.find(x => x.Id == evl.Id);
                    if (!evlItem) lstEvl.push(evl);
                    else {
                        evlItem.EvalX = evl.EvalX;
                        evlItem.EvalY = evl.EvalY;
                        evlItem.EvalZ = evl.EvalZ;
                        if (evl.TitleX) evlItem.TitleX = evl.TitleX;
                        if (evl.TitleY) evlItem.TitleY = evl.TitleY;
                        if (evl.TitleNegativeX) evlItem.TitleNegativeX = evl.TitleNegativeX;
                        if (evl.TitleNeutralX) evlItem.TitleNeutralX = evl.TitleNeutralX;
                        if (evl.TitlePositiveX) evlItem.TitlePositiveX = evl.TitlePositiveX;
                        if (evl.TitleNegativeY) evlItem.TitleNegativeY = evl.TitleNegativeY;
                        if (evl.TitleNeutralY) evlItem.TitleNeutralY = evl.TitleNeutralY;
                        if (evl.TitlePositiveY) evlItem.TitlePositiveY = evl.TitlePositiveY;
                        if (evl.Color) evlItem.Color = evl.Color;
                        evlItem.TemplateName = evl.TemplateName;
                        evlItem.TemplateId = evl.TemplateId;
                    }
                });
            },
            getEvalXYZ(id) {
                let item = this.ListEvalXYZ.find(x => x.Id == id);
                if (item) {
                    item = vmCommon.deepCopy(item);

                    if (item.EvalX == null || item.EvalY == null) return undefined;
                    if (!item.EvalZ || (-3 < item.EvalZ && item.EvalZ < 3)) item.EvalZ = 3;
                    item.TitleX = item.TitleX || kLg.lblApAxisX;
                    item.TitleY = item.TitleY || kLg.lblApAxisY;
                    item.TitleNegativeX = item.TitleNegativeX || kLg.lblNegative;
                    item.TitleNeutralX = item.TitleNeutralX || kLg.lblNeutral;
                    item.TitlePositiveX = item.TitlePositiveX || kLg.lblPositive;
                    item.TitleNegativeY = item.TitleNegativeY || kLg.lblNegative;
                    item.TitleNeutralY = item.TitleNeutralY || kLg.lblNeutral;
                    item.TitlePositiveY = item.TitlePositiveY || kLg.lblPositive;
                }
                return item;
            },
            initAndShowEvarluationXYZ($elm, id, color) {
                const tlpObj = this.getEvalXYZ(id);
                if (!tlpObj) return;        // khong co X hoac Y => Khong hien tooltop

                const $template = $("#tbHoverShowChartEvaluation");
                const template = kendo.template($template.html());

                tlpObj.Color = color || '#b8c92e';
                tlpObj.ShowEvalZ = Math.abs(tlpObj.EvalZ);
                // #region kiểm tra và set góc/4 thứ nhất
                let axisMin = -120, maxSz = 66;
                if (tlpObj.EvalX > 0 && tlpObj.EvalY > 0) {
                    let _1R = Math.abs(tlpObj.EvalZ) * 40 / 200;
                    if (tlpObj.EvalX < 18 || tlpObj.EvalY < 18) _1R += 3;

                    let minXAxis = tlpObj.EvalX > _1R ? 0 : -20,
                        minYAxis = tlpObj.EvalY > _1R ? 0 : -20;
                    
                    axisMin = minXAxis < minYAxis ? minXAxis : minYAxis;
                    maxSz = axisMin < 0 ? 66 * 1.8 : 66 * 2;
                    maxSz = Math.ceil(maxSz);
                }
                // #endregion kiểm tra góc/4 thứ nhất
                const popOpt = {
                    content: template(tlpObj),
                    color: "#00FFFF", width: 498, height: 498,
                    hide: function () {
                        var tt = $(this.element).data("kendoTooltip");
                        if (tt) tt.destroy();
                        delete vmCommon.IsShowTooltipChartEvalXYZ;
                    }, autoHide: true,
                    show: function (e) {
                        $(`#DnbTlpChartEvalXYZ_${tlpObj.Id}`).kendoChart({
                            dataSource: [tlpObj, { EvalX: 0, EvalY: 0, ShowEvalZ: 100, Color: '#ffffff00' }],
                            series: [{
                                    type: 'bubble', xField: 'EvalX', yField: 'EvalY', colorField: 'Color',
                                    sizeField: 'ShowEvalZ', maxSize: maxSz, minSize: 3,
                                }],
                            xAxis: { majorUnit: 20, min: axisMin, max: 120, axisCrossingValue: [0] },
                            yAxis: { majorUnit: 20, min: axisMin, max: 120, axisCrossingValue: [0] },
                            chartArea: { height: 420, width: 420 }
                        });
                    }
                };
                $elm.kendoTooltip(popOpt).data("kendoTooltip").show();
                vmCommon.IsShowTooltipChartEvalXYZ = true;
            },
            // #endregion Evaluation XYZ
            getListMainFrom(smkpId) {
                const refM = this.$refs['RefViewMarket'];
                var lstPrsm = [];
                if (Array.isArray(refM)) {
                    refM.filter(m => {
                        const refPg = m.$refs['RefViewProductGroup'];
                        if (Array.isArray(refPg)) {
                            refPg.filter(pg => {
                                const refP = pg.$refs['RefViewProduct'];
                                if (Array.isArray(refP)) {
                                    if (smkpId) {
                                        const a = refP.find(_p => _p.SubMarketProductId == smkpId);
                                        if (a && a.IsExpand)
                                            lstPrsm = a.ListMain;
                                    }
                                }
                                return true;        // for loop
                            });
                        }
                        return true;        // for loop
                    });
                }
                return lstPrsm;
            },
            loadOpenProducts(smkpId) {      // smkpId = undefined => reload cac vung product dang mo                
                const refM = this.$refs['RefViewMarket'];
                const lstPrsm = [];
                if (Array.isArray(refM)) {
                    refM.filter(m => {
                        const refPg = m.$refs['RefViewProductGroup'];
                        if (Array.isArray(refPg)) {
                            refPg.filter(pg => {
                                const refP = pg.$refs['RefViewProduct'];
                                if (Array.isArray(refP)) {
                                    if (smkpId) {
                                        const a = refP.find(_p => _p.SubMarketProductId == smkpId);
                                        if (a && a.IsExpand && typeof a.ReloadOpenProduct == 'function')
                                            lstPrsm.push(a.ReloadOpenProduct());
                                    } else
                                        refP.filter(p => {
                                            if (p.IsExpand && typeof p.ReloadOpenProduct == 'function') {
                                                lstPrsm.push(p.ReloadOpenProduct());
                                            }
                                            return true;
                                        });
                                }
                                return true;
                            });
                        }
                        return true;
                    });
                }
                return Promise.all(lstPrsm);
            },
            getListMainFromInd(indId) {
                const refM = this.$refs['RefViewIndependence'];
                var lstPrsm = [];
                if (Array.isArray(refM)) {
                    refM.filter(ind => {
                        const viewThemes = ind.$refs['RefViewTheme'];
                        if (Array.isArray(viewThemes)) {
                            if (indId) {
                                const a = viewThemes.find(th => th.item.Id == indId);
                                if (a && a.IsExpand)
                                    lstPrsm = a.ListMain;
                            }
                        }
                        return true; // for loop
                    });
                }
                return lstPrsm;
            },
            loadOpenIndependencies(indId) {         // indId = undefined => reload cac vung Independence dang mo
                const refM = this.$refs['RefViewIndependence'];
                const lstPrsm = [];
                if (Array.isArray(refM)) {
                    refM.filter(ind => {
                        const viewThemes = ind.$refs['RefViewTheme'];
                        if (Array.isArray(viewThemes)) {
                            if (indId) {
                                //const a = viewThemes.find(th => th.IndependencyId == indId);
                                const a = viewThemes.find(th => th.item.Id == indId);
                                if (a && a.IsExpand && typeof a.loadDataGoalAction == 'function')
                                    lstPrsm.push(a.loadDataGoalAction());
                            } else {
                                viewThemes.filter(th => {
                                    if (th.IsExpand && typeof th.loadDataGoalAction == 'function')
                                        lstPrsm.push(th.loadDataGoalAction());
                                    return true;
                                });
                            }
                        }
                        return true;
                    });
                }
                return Promise.all(lstPrsm);
            },
            checkAndUpdateTheme(dataS) {    // dataS = dataFromServer
                var themeObj;
                const indObj = this.ListIndependence.find(_ind => {
                    themeObj = _ind.ListSubIndependency.find(_th => _th.Id == dataS.Id);
                    return typeof themeObj == 'object';     // break for find
                });
                
                if (indObj && themeObj) {       // co Supper Theme (Independence) va Theme
                    
                    MsaApp.pushLoadTimeActions('checkAndUpdateThemeThenGetData');
                    this.reloadAllDataOfPage('MsaApp_checkAndUpdateTheme').then(() => {
                       // console.log('action => checkAndUpdateThemeThenGetData')
                    });
                }
            },
            reloadDataIndependency(newTheme) {
                if (newTheme.ParentId > 0) this.pushExpand(`${newTheme.ParentId}`, 'Independence');
                if (newTheme.ChildId > 0) this.pushExpand(`${newTheme.ChildId}`, 'Theme');

                MsaApp.pushLoadTimeActions('AddThemeAndUpdateIndependencyThenGetData');

                vmGoalAction.dataservice.loadDataFirstTime(null, function (serData) {
                    
                    if (serData.Role < 0) {
                        return;
                    };
                    const res = serData.value;

                    // clear nhung da ta khong lien quan khong cho set vao $data
                    res.Role = undefined;
                    res.IsOverdue = undefined;
                    res.IsCheckActionDate = undefined;
                    res.Expand = undefined;
                    res.IsShowMarketLabel = undefined;
                    res.IsHiddenGoalContent = undefined;
                    res.LastFocusElement = undefined;

                    res.Data.Item1.ListSubmarketProductGroup = undefined;
                    res.Data.Item1.SubMarketProductViewGroup = undefined;
                    res.Data.Item1.ListSubmarketProduct = undefined;
                    res.Data.Item1.ListSubmarketProductWithColor = undefined;
                    res.Data.Item1.ListTitle = undefined;

                    MsaApp.setData(res);        //reloadDataIndependency(newTheme)
                    
                    setTimeout(function () {
                        const $bodyContent = $('.body-content');
                        var headHeight = $(".ms-header").height() + $(".submenu").height();
                        var bodyHeight = $bodyContent.height();
                        
                        if (MsaApp.hasKeyMapDelegate(`showPopupAddTheme_FromSupperTheme`) && newTheme.ChildId > 0) {
                            const $theme = $bodyContent.find(`section[theme-scrolly-id=${newTheme.ChildId}]`);
                            if ($theme.length) {
                                var scrollTop = $bodyContent.scrollTop();
                                var itemHeight = $theme.height();
                                $bodyContent.animate({        // scrollY
                                    scrollTop: $theme.offset().top - (bodyHeight - itemHeight) / 2 - headHeight + scrollTop
                                }, 696);
                            }
                        }
                        if (MsaApp.hasKeyMapDelegate(`showPopupAddIndependence_Btn`) && newTheme.ParentId > 0) {
                            const $ind = $bodyContent.find(`section[independence-scrolly-id=${newTheme.ParentId}]`);
                            if ($ind.length) {
                                var scrollTop = $bodyContent.scrollTop();
                                var itemHeight = $ind.height();
                                $bodyContent.animate({        // scrollY
                                    scrollTop: $ind.offset().top - (bodyHeight - itemHeight) / 2 - headHeight + scrollTop
                                }, 696);
                            }
                        }
                        MsaApp.deleteMapDelegate(`showPopupAddTheme_FromSupperTheme`);
                        MsaApp.deleteMapDelegate(`showPopupAddIndependence_Btn`);
                        
                    }, 699);
                });

            },
            reloadAllDataOfPage(_key_) {
                this.handlerLoadding();

                const lstPrsm = [];
                lstPrsm.push(new Promise(resv => {// lấy lại data server để lưu vào dataVUE => MsaApp và các component sẽ chạy lại hàm updated
                    var showFinishedElements = null;
                    if (typeof msFilter != "undefined" && msFilter.controlService.isReady()) {
                        showFinishedElements = msFilter.controlService.isShowFinishedElements();
                    }

                    vmGoalAction.dataservice.loadDataFirstTime({ ShowFinishedElements: showFinishedElements }, function (serData) {
                        if (serData.Role < 0) {
                            return;
                        };
                        const res = serData.value;
                        // clear khong cho set vao data
                        res.Role = undefined;
                        res.IsOverdue = undefined;
                        res.IsCheckActionDate = undefined;
                        res.Expand = undefined;
                        res.IsShowMarketLabel = undefined;
                        res.IsHiddenGoalContent = undefined;
                        res.LastFocusElement = undefined;

                        MsaApp.setData(res);        // reloadAllDataOfPage
                            
                        resv(res);
                    });
                }));
                lstPrsm.push(MsaApp.loadOpenProducts());
                lstPrsm.push(MsaApp.loadOpenIndependencies());

                lstPrsm.push(MsaApp.updateListGoalNavMenu());
                
                return Promise.all(lstPrsm).then((a) => {
                    MsaApp.canReaction();
                    return a;
                });
            },
            updateListGoalNavMenu() {
                const lstPrm = [];
                const updateListEvalXYZ = this.updateListEvalXYZ;       // ref function
                MsaApp.MapMenuListMain.forEach(function logMapElements(lstMain, smpIndId) {
                    if (smpIndId.includes('-')) {
                        // SubMarketProduct
                        lstPrm.push(MsaApp.getListGoalNavMenu(smpIndId, null).then(data => {
                            lstMain.splice(0);       // remove all item
                            data.ListMain.forEach(m => {
                                lstMain.push(m);
                            });
                            updateListEvalXYZ(data.ListEval);
                            return data;
                        }));
                    } else {
                        // Theme
                        lstPrm.push(MsaApp.getListGoalNavMenu(null, smpIndId).then(data => {
                            lstMain.splice(0);       // remove all item
                            data.ListMain.forEach(m => {
                                lstMain.push(m);
                            });
                            updateListEvalXYZ(data.ListEval);
                            return data;
                        }));
                    }
                });
                return Promise.all(lstPrm);
            },
            getListGoalNavMenu(smpId, indId) {
                const entry = {};
                if (smpId) entry.SubMarketProductId = smpId;
                if (indId) entry.IndependencyId = indId;

                return new Promise(resv => {
                    vmGoalAction.dataservice.getGoalActionMenuByArea(entry, function (res) {
                        if (res && res.value) resv(res.value);
                    });
                });
            },
            reloadDataContentRightView() {
                const refNv = this.$refs['RefNavigationDetail'];
                const lstPrsm = [];
                if (typeof refNv == 'object') {
                    lstPrsm.push(refNv.getAllDataContentRightView());
                }
                return Promise.all(lstPrsm);
            },
            hideMenuNavigationMenu() {
                const refNv = this.$refs['RefNavigationMenu'];
                if (typeof refNv == 'object') {
                    refNv.removeMenuFilter();
                }
            },
            getSubgoalTitle(maingoalId) {
                const item = this.ListTitle.find(elm => { return elm.GoalId == maingoalId });
                var title = kLg.labelSubGoalName;
                if (item) {
                    title = item.TitleSubGoal || title;
                }
                return title;
            },
            getActionTitle(subgoalId) {
                const item = this.ListTitle.find(elm => { return elm.GoalId == subgoalId });
                var title = kLg.labelActionName;
                if (item) {
                    title = item.TitleAction || title;
                }
                return title;
            },
            getMaingoalTitle(maingoalId) {
                const item = this.ListTitle.find(elm => { return elm.GoalId == maingoalId });
                var title = kLg.labelMainGoalName;
                if (item) {
                    title = item.TitleMainGoal || item.TitleName || title;
                }
                return title;
            },
            onHoverShowTooltipAddGoalAction(target, txt, position) {
                const $this = $(target);
                const template = kendo.template($('#tempShowDescription').html());
                $this.popover({
                    html: true,
                    placement: position,
                    content: template(txt),
                    trigger: "hover"
                }).popover('show');
            },
            onHoverShow_kendoTooltip(target, txt, pos, _width) {
                const $target = $(target);
                if ($target.data('kendoTooltip') == undefined) {
                    $target.kendoTooltip({
                        autoHide: true,
                        content: txt,
                        width: !_width ? 200 : _width,
                        position: pos,
                        hide: function () {
                            var tt = $(this.element).data("kendoTooltip");
                            if (tt) tt.destroy();
                        }
                    });
                    $target.data('kendoTooltip').show();
                }
            },
            getEndDateToAddAction(item, goal) {
                var start = item.StartDate;
                if (start) return vmCommon.tryJsonToLocalDate(start);

                if (!goal) start = undefined;
                else
                    start = this.getMaingoalStartDate(goal);

                if (start) return start;
                return new Date();
            },
            getMaingoalStartDate(goal) {
                const start = goal.StartDate;
                if (start) return vmCommon.tryJsonToLocalDate(start);
                return null;
            },
            removeIndependency(item) {
                const index = this.ListIndependence.indexOf(item);
                if (index > -1) this.ListIndependence.splice(index, 1);
            },
            updateIndependency(entry) {         // MsaApp.updateIndependency(entryData); // MsPopName.html
                const indObj = this.ListIndependence.find(_ind => _ind.Id == entry.Id);
                if (indObj) {
                    indObj.Name = entry.Name;
                    indObj.Mdf = entry.Mdf;
                }
            },
            onResizeView(event) {
                if (typeof event != 'undefined') {
                }
                //const $bodyContent = $(".body-content");
            },
            keyupScrollColumnX(event) {
                if (event.code == "Escape" && MsaApp.KeyBoardCode == 'Escape') {
                    if (MsaApp.ScrollMouseAction != 'onMouseleaveCheckScrollWheel')
                        MsaApp.offMouseWheelBodyContent();
                }
                MsaApp.KeyBoardCode = '';
            },
            keydownScrollColumnX(event) {
                MsaApp.KeyBoardCode = event.code;   //event.code == "Escape"

                if (event.code == "Escape") {
                    MsaApp.onMouseWheelBodyContent();
                }
                
            },
            isKeyBoardCode(keyName) {
                return this.KeyBoardCode == keyName;
            },
            editGoal(entryData, info, title, strActionName, mgoal) {                
                MsaApp.setMapDelegate(`OpenPopupEditgoal_FromItem_`, entryData.goalId);
                MsaApp.hideAllTooltipDes();
                this.handlerLoadding();

                const isNew = entryData.goalId == vmCommon.emptyGuid;
                vmGoalAction.goalOptions = {
                    IsMasterGoal: info.IsMasterGoal
                }
                vmGoalAction.currency = {
                    Name: info.CurrencyName
                }
                return new Promise(reslv => {
                    vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                        if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                            if (isNew) {
                                if (strActionName == 'vmGoalAction.showAddDetachedSubgoal') {
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoalWithoutMainGoal;   // 2
                                } else {
                                    if (entryData.goalType == vmCommon.GoalActionContentType.MainGoal)
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;     // 0
                                    else
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;      // 1
                                }
                            } else {        // isEdit
                                vmGoalAction.goalOptions.IsEdit = true;
                                vmGoalAction.goalOptions.Goal = serData.value.TheObject;
                                vmGoalAction.goalOptions.Url = serData.value.Url;
                                vmGoalAction.goalOptions.IsMasterGoalKpi = serData.value.AreaInfo.IsMasterGoalKpi;

                                if (entryData.goalType == vmCommon.GoalActionContentType.SubGoal) {
                                    vmGoalAction.goalOptions.ParentId = serData.value.TheObject.ParentId;
                                }

                                if (entryData.goalType == vmCommon.GoalActionContentType.MainGoal)     // Main Goal
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
                                else if (!entryData.parentId || entryData.parentId == vmCommon.emptyGuid) {
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoalWithoutMainGoal;
                                } else {
                                    vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
                                }
                            }
                            vmCommon.AddressBar.ClientQuery.setActpopupEncoded(serData.value.Actpopup);

                            const elm = { productid: info.ProductId }
                            if (entryData.goalType == vmCommon.GoalActionContentType.SubGoal)
                                elm.parentid = entryData.parentId
                            vmGoalAction.goalOptions.customConnection = entryData.independencyId ? MsaApp.bindIndependencyConnection(serData.value.CustomConnection) : MsaApp.getCustomConnect(elm, serData.value.CustomConnection);

                            vmGoalAction.goalOptions.RegionSelectable = serData.value.RegionSelectable;
                            vmGoalAction.goalOptions.ActionPlanRegions = serData.value.ActionPlanRegions;
                            vmGoalAction.goalOptions.KpiGoalSelectable = serData.value.KpiGoalSelectable;

                            vmGoalAction.goalOptions.IsHasKpi = serData.value.IsHasKpi;
                            vmGoalAction.goalOptions.MasterGoal = serData.value.MasterGoal;
                            vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                            vmGoalAction.goalOptions.TypeId = entryData.goalType;
                            vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                            vmGoalAction.goalOptions.isRedirect = true;

                            $.extend(vmGoalAction.goalOptions, info);
                            vmGoalAction.goalOptions.role = serData.value.RoleId;

                            if (strActionName == 'vmGoalAction.showAddDetachedSubgoal') {
                                vmGoalAction.goalOptions.parentStart = new Date();
                                vmGoalAction.goalOptions.parentEnd = new Date();
                                vmGoalAction.goalOptions.parentMasterId = null;
                            }
                            if (strActionName == 'vmGoalAction.showAddNewMaingoal') {
                                vmGoalAction.goalOptions.parentStart = new Date();
                                vmGoalAction.goalOptions.parentEnd = null;
                                vmGoalAction.goalOptions.parentMasterId = null;
                            }
                            if (strActionName == 'vmGoalAction.showAddSubgoalFromMainOverview') {
                                vmGoalAction.goalOptions.ParentId = entryData.parentId;
                                setLimitedDateGoal();
                                vmGoalAction.goalOptions.IsCalendar = serData.value.IsCalendar;
                            }

                            vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                            vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                            vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;

                            vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, serData.value.RoleId);
                            vmGoalAction.SelectorId.mainGoal = entryData.goalId;
                            vmGoalAction.SelectorId.action = strActionName;
                            
                            vmGoalAction.showAddGoalPopup(htmlEscape(title));
                            reslv(serData.value.TheObject);
                        }

                        MsaApp.canReaction();
                    });
                });

                function setLimitedDateGoal() {
                    var fixDate;
                    if (mgoal && mgoal.ListSubGoal) {
                        if (mgoal.ListSubGoal.length > 0) {
                            var fistSub = mgoal.ListSubGoal[mgoal.ListSubGoal.length - 1];      // last Subgoal

                            fixDate = fistSub.Date ? vmCommon.tryJsonToLocalDate(fistSub.Date)
                                : (fistSub.StartDate ? vmCommon.tryJsonToLocalDate(fistSub.StartDate)
                                    : (mgoal.StartDate ? vmCommon.tryJsonToLocalDate(mgoal.StartDate) : new Date()));

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
            },
            getCustomConnect(element, connections) {
                var e = Object.assign({
                    productid: 0, parentid: 0
                }, element);

                var temp = $.grep(connections, function (item) {
                    return (item.Type === 1 && item.SubProductId !== Number(e.parentid)) || (item.Type === 2 && item.SubProductId !== Number(e.productid));
                });

                var newId = 1;
                temp.forEach(item => {
                    item.Id = newId++;
                });
                return temp;
            },
            bindIndependencyConnection(connections) {
                var temp = connections;
                var newId = 1;
                temp.forEach(item => {
                    item.Id = newId++;
                });
                return temp;
            },

            ClassFinish() {
                var element = this.element || {};
                return element.Finish ? 'element-finish' : undefined;
            },
            setLastActiveElement(goalActionId) {
                this.onMouseWheelBodyContent();
                if (!goalActionId || goalActionId == vmCommon.emptyGuid) return;
                
                this.LastActiveElementId = goalActionId;

            },
            ExpandlinkSticky() {
                const goalActionId = this.ApLinkOverviewUrl.GoalActionId;
                const linkTypeId = this.ApLinkOverviewUrl.TypeId;
                const AreaId = this.ApLinkOverviewUrl.AreaId;
                vmGoalAction.openPopConnectionOverview(goalActionId, linkTypeId, AreaId);
            },
            getFocusIdInMap(smpIndId, typeMS) {
                const lstMains = MsaApp.MapMenuListMain.get(smpIndId);
                var lstOut = [];
                if (typeMS == 3) {      // Main
                    lstMains.filter(mi => {
                        if (mi.IsFocus) lstOut.push(mi);
                    });
                } else if (typeMS == 4) {      // Sub
                    lstMains.filter(mi => mi.Childs.filter(si => {
                        if (si.IsFocus) lstOut.push(si);
                    }));
                }
                return {
                    setFocus(isFocus) {
                        lstOut.filter(item => {
                            item.IsFocus = isFocus;
                            // xoa View ben phai neu Focus == false
                            if (!isFocus) {
                                var index = -1;
                                const rV = MsaApp.NavigationMenuView.find((im, i) => {
                                    if (im.Id == item.Id && isSmpIndId(im)) {
                                        index = i;
                                        return true;
                                    }
                                });
                                if (rV) {
                                    MsaApp.NavigationMenuView.splice(index, 1); // xoa di
                                }
                            }
                        });
                        function isSmpIndId(im) {
                            if (im.IndependencyId && im.IndependencyId == smpIndId) return true;
                            if (im.SubMarketProductId == smpIndId) return true;
                            return false;
                        }
                    },
                    log() { return lstOut; }
                }
            },
            updateMIndexIndependency(sourceId, desId, position, desMdf, sourceMdf, listsource) {      //changePositionIndependency
                var url = "../Handlers/MsGoalAction.ashx?funcName=changePosIndependency&projid=" + projectId + "&strid=" + strategyId;
                var obj = {
                    Moving: {
                        DesId: desId, SourceId: sourceId, Position: position,
                        ParentSourceId: projectId, SourceMdf: sourceMdf, DesMdf: desMdf
                    },
                    SortObjs: listsource
                };
                callAjax("loading-goalaction", url, JSON.stringify(obj), function(data) {
                    var rs = data.value;
                    if (rs.ResultStatus < 0) {
                        pAlert(kLg.msgConflictData).then(function () {
                            location.reload();
                        });
                    } else if (rs.ResultStatus > 0) {
                        if (rs.IsReset) {
                            var i = 0;
                            MsaApp.ListIndependence.filter(ind => {
                                i += 1000;
                                ind.MIndex = i;
                                return true;
                            });
                        } else {
                            const srcId = parseInt(rs.SrcId);
                            const srcObj = MsaApp.ListIndependence.find(ind => ind.Id == srcId);
                            if (srcObj) {
                                srcObj.MIndex = rs.NewIndex;
                            }
                        }
                        MsaApp.updateNavMenuIndMIndex();
                    }
                    MsaApp.DragDropIndependence.LastEvent = '';
                }, AjaxConst.PostRequest);
            },
            updateNavMenuIndMIndex() {
                const lstNavMenuTheme = MsaApp.DataNavigationMenu.filter(lv1 => lv1.Type == 8);
                if (lstNavMenuTheme.length) {
                    lstNavMenuTheme.filter(navInd => {
                        const indP = MsaApp.ListIndependence.find(ind => navInd.Id == ind.Id);  // get
                        if (indP) {
                            navInd.MIndex = indP.MIndex;

                            navInd.Childs.filter(navTh => {
                                const indT = indP.ListSubIndependency.find(ind => navTh.Id == ind.Id);   //get
                                if (indT) navTh.MIndex = indT.MIndex;
                            });
                            navInd.Childs.sort((a, b) => a.MIndex - b.MIndex);
                        }
                    });
                    const lstProd = MsaApp.DataNavigationMenu.filter(lv1 => lv1.Type != 8);
                    MsaApp.DataNavigationMenu.splice(0);
                    lstProd.filter(prd => MsaApp.DataNavigationMenu.push(prd));
                    lstNavMenuTheme.sort((a, b) => a.MIndex - b.MIndex).filter(indP => MsaApp.DataNavigationMenu.push(indP));
                }
            },
            updateMIndexTheme(sourceId, sourceMdf, desId, desMdf, position, parentId, listsource) {//changePositionIndependencyId
                vmGoalAction.PreventFFClickAfterDrag = true;
                var url = "../Handlers/MsGoalAction.ashx?funcName=changePosThema&projid=" + projectId + "&strid=" + strategyId;

                var obj = {
                    Moving: {
                        DesId: desId, SourceId: sourceId, Position: position,
                        ParentSourceId: parentId, SourceMdf: sourceMdf, DesMdf: desMdf
                    },
                    SortObjs: listsource
                };

                callAjax("loading-goalaction", url, JSON.stringify(obj), function(data) {
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

                        // #region update lai MIndex chứ không load lại data.
                        const indId = MsaApp.DragDropIndependence.IndId;
                        var indObj = MsaApp.ListIndependence.find(ind => ind.Id == indId);
                        if (indObj) {
                            const lstThe = indObj.ListSubIndependency;
                            if (rs.IsReset) {
                                var i = 0;
                                lstThe.filter(th => {
                                    i += 1000;
                                    th.MIndex = i;
                                    return true;
                                });
                            } else {
                                const themeId = parseInt(rs.SrcId);
                                const themeObj = lstThe.find(th => th.Id == themeId);
                                if (themeObj) {
                                    themeObj.MIndex = rs.NewIndex;
                                }
                            }
                        }
                        MsaApp.updateNavMenuIndMIndex();
                       // #endregion 
                    }
                    MsaApp.DragDropIndependence.LastEvent = '';
                    setTimeout(function () { vmGoalAction.PreventFFClickAfterDrag = false; }, 100);
                }, AjaxConst.PostRequest);
            },
            changePositionGoal(mgExpandId) {     //DragDropGoal
                var source = MsaApp.DragDropGoal.Src;
                if (!source) return;
                var des = MsaApp.DragDropGoal.Des;
                if (!des) return;
                if (des.Id == source.Id) return;
                var position = MsaApp.DragDropGoal.Pos;

                var moving = {
                    DesActionGoalId: des.Id,
                    DesMdf: des.Mdf,
                    DesSmpId: des.SmpId,
                    DesThemaId: des.IndId,
                    DesRegionId: des.RegionId,

                    SourceActionGoalId: source.Id,
                    SourceMdf: source.Mdf,
                    SourceSmpId: source.SmpId,
                    SourceThemaId: source.IndId,
                    SrcRegionId: source.RegionId,

                    Type: source.Type,
                    Position: position
                };

                if (!moving.DesActionGoalId) {     // fix crash
                    MsaApp.clearDragDropGoalAndReloadData();
                    return;
                }
                
                if (des.SmpId === source.SmpId && des.IndId === source.IndId) {     // cung vung product hoac cung vung theme
                    var url = "";
                    if (des.SmpId != null) {
                        url = "../Handlers/MsGoalAction.ashx?funcName=updateMIndexGoal&smpId=" + des.SmpId + "&regid=-1" + "&projid=" + projectId + "&strid=" + strategyId;
                        MsaApp.CanDragDrop = false;
                        callAjax('project-loading', url, JSON.stringify(moving), function (data) {
                            var state = data.value;
                            if (state === vmGoalActionDragDrop.ErrorsState.NoRole) {
                                pAlert(kLg.msgNoRole).then(function () {
                                    location.reload();
                                    MsaApp.CanDragDrop = true;
                                });
                            } else {
                                MsaApp.setLastActiveElement(moving.SourceActionGoalId);
                                MsaApp.clearDragDropGoalAndReloadData();
                            }
                            
                        }, AjaxConst.PostRequest);
                    } else if (des.IndId != null) {
                        url = "../Handlers/MsGoalAction.ashx?funcName=updateMIndexGoalIndependency&smpId=" + des.IndId + "&regid=-1" + "&projid=" + projectId + "&strid=" + strategyId;
                        MsaApp.CanDragDrop = false;
                        callAjax('project-loading', url, JSON.stringify(moving), function (data) {
                            var state = data.value;
                            if (state === vmGoalActionDragDrop.ErrorsState.NoRole) {
                                pAlert(kLg.msgNoRole).then(function () {
                                    location.reload();
                                });
                            } else {
                                MsaApp.setLastActiveElement(moving.SourceActionGoalId);
                                MsaApp.clearDragDropGoalAndReloadData();
                            }
                            
                        }, AjaxConst.PostRequest);
                    }
                } else {                                // khac vung product hoac khac theme hoac khac product va theme
                    
                    url = "../Handlers/MsGoalAction.ashx?funcName=updateMIndexGoalAction&regid=-1" + "&projid=" + projectId + "&strid=" + strategyId;
                    MsaApp.CanDragDrop = false;
                    callAjax('project-loading', url, JSON.stringify(moving), function (data) {
                        var state = data.value;
                        if (state === vmGoalActionDragDrop.ErrorsState.NoRole) {
                            pAlert(kLg.msgNoRole).then(function () {
                                location.reload();
                                MsaApp.CanDragDrop = true;
                            });
                        } else {
                            MsaApp.setLastActiveElement(moving.SourceActionGoalId);
                            MsaApp.clearDragDropGoalAndReloadData();

                            if (mgExpandId) {
                                MsaApp.pushExpand(mgExpandId, 'maingoal');
                            }
                        };
                        
                    }, AjaxConst.PostRequest);
                }
            },
            changePositionSubGoal() {     //changPositionSubGoal
                var source = MsaApp.DragDropGoal.Src;
                if (!source) return;
                var des = MsaApp.DragDropGoal.Des;
                if (!des) rerturn;
                if (des.Id == source.Id) return;
                var position = MsaApp.DragDropGoal.Pos;

                var url = '../Handlers/MsGoalAction.ashx?funcName=subgoalupdatemindex&regid=-1' + "&projid=" + projectId + "&strid=" + strategyId;
                var obj = {
                    SourceActionGoalId: source.Id,
                    SrcParentGoalActionId: source.ParentId,
                    SourceParentSubMarketId: source.ParentId,
                    SourceMdf: source.Mdf,
                    SourceSmpId: source.SmpId,
                    SourceThemaId: source.IndId,
                    SrcRegionId: source.RegionId,

                    DesActionGoalId: des.Id,
                    DesParentGoalActionId: des.ParentId,
                    DesParentSubMarketId: des.ParentId,
                    DesMdf: des.Mdf,
                    DesSmpId: des.SmpId,
                    DesThemaId: des.IndId,
                    DesRegionId: des.RegionId,

                    Position: position,
                    Type: source.Type
                };

                if (!obj.DesActionGoalId) {     // fix crash
                    MsaApp.clearDragDropGoalAndReloadData();
                    return;
                }

                MsaApp.CanDragDrop = false;
                callAjax('loadingSelectGroups', url, JSON.stringify(obj), function (data) {
                    var state = data.value;
                    if (state === vmGoalActionDragDrop.ErrorsState.NoRole) {
                        pAlert(kLg.msgNoRole).then(function () {
                            location.reload();
                        });
                        MsaApp.CanDragDrop = true;
                    } else {
                        MsaApp.setLastActiveElement(obj.SourceActionGoalId);
                        MsaApp.clearDragDropGoalAndReloadData();
                    }
                }, AjaxConst.PostRequest);
            },
            onDragMoveGoal(evt, originalEvent) {     //console.log('onDragMoveGoal', evt, originalEvent);
                const dragged = evt.dragged;//div.msa-maingoal-item (from)
                const related = evt.related;//div.msa-vue-subgoal-overview (to)
                const id1 = dragged.getAttribute('drgdrp-id');
                const id2 = related.getAttribute('drgdrp-id');
                if (id1 == id2) return;         // Ngan khong cho cap nhat vi khi keo sang cho moi va giu nguyen thi id1 == id2
                
                const type1 = dragged.getAttribute('dragdroptype');
                const type2 = related.getAttribute('dragdroptype');

                if (!type1 || !type2) return;

                if (type1 != type2 && dragged.getAttribute('sum-action') < 1) {
                    MsaApp.DragDropGoal.ChangeGoalEvent = 'ChangeGoalLevel';            // onDragMoveGoal type1 != type2 && sum-action < 1

                    var rId1 = dragged.getAttribute('drgdrp-regionid');
                    var rId2 = related.getAttribute('drgdrp-regionid');
                    var mdf1 = dragged.getAttribute('drgdrp-mdf');
                    var mdf2 = related.getAttribute('drgdrp-mdf');

                    var indid1 = dragged.getAttribute('drgdrp-indid');
                    indid1 = indid1 ? parseInt(indid1) : null;
                    var indid2 = related.getAttribute('drgdrp-indid');
                    indid2 = indid2 ? parseInt(indid2) : null;

                    var src = {
                        Id: id1,
                        SmpId: dragged.getAttribute('drgdrp-smpid'),
                        IndId: indid1,
                        RegionId: parseInt(rId1),
                        Type: parseInt(type1),
                        Mdf: parseInt(mdf1)
                    }, des = {
                        Id: id2,
                        SmpId: related.getAttribute('drgdrp-smpid'),
                        IndId: indid2,
                        RegionId: parseInt(rId2),
                        Type: parseInt(type2),
                        Mdf: parseInt(mdf2)
                    };

                    if (parseInt(type1) < parseInt(type2)) {        // main => sub
                        des.ParentId = related.getAttribute('drgdrp-pid');
                       
                    } else {                                        // sub => main
                        src.ParentId = dragged.getAttribute('drgdrp-pid');
                        //console.log('onDragMove Sub => Main', src, des);
                    }
                    MsaApp.DragDropGoal.Src = src;
                    MsaApp.DragDropGoal.Des = des;
                   // console.log('onDragMoveGoal Type !== Type', src, des);
                }

                if (type1 == type2){
                    MsaApp.DragDropGoal.ChangeGoalEvent = 'ChangeGoalSameTypeLevel'; //onDragMoveGoal type1 == type2
                    var rId1 = dragged.getAttribute('drgdrp-regionid');
                    var rId2 = related.getAttribute('drgdrp-regionid');
                    var mdf1 = dragged.getAttribute('drgdrp-mdf');
                    var mdf2 = related.getAttribute('drgdrp-mdf');
                    src = {
                        Id: id1,
                        SmpId: dragged.getAttribute('drgdrp-smpid'),
                        IndId: dragged.getAttribute('drgdrp-indid'),
                        RegionId: parseInt(rId1),
                        Type: parseInt(type1),
                        Mdf: parseInt(mdf1)
                    };
                    des = {
                        Id: id2,
                        SmpId: related.getAttribute('drgdrp-smpid'),
                        IndId: related.getAttribute('drgdrp-indid'),
                        RegionId: parseInt(rId2),
                        Type: parseInt(type2),
                        Mdf: parseInt(mdf2)
                    };
                    if (type1 == 2) {      // subgoal
                        src.ParentId = dragged.getAttribute('drgdrp-pid');
                        des.ParentId = related.getAttribute('drgdrp-pid');
                    }

                    var pos1 = $(dragged).offset() ? $(dragged).offset().top : 0;
                    var pos2 = $(related).offset() ? $(related).offset().top : 0;

                    if (pos1 == pos2) {
                        pos1 = $(dragged).offset() ? $(dragged).offset().left : 0;
                        pos2 = $(related).offset() ? $(related).offset().left : 0;
                    }
                    
                    MsaApp.DragDropGoal.Src = src;
                    MsaApp.DragDropGoal.Des = des;
                    MsaApp.DragDropGoal.Pos = pos2 - pos1 > 0 ? 1 : 0;
                 //   console.log('onDragMoveGoal Type == Type', src, des);
                }
               
            },
            onDragStartMaingoal(evt) {          //console.log('onDragStartMaingoal',evt)
                if (this.isViewer()) return;
                MsaApp.hideAllTooltipDes();     //onDragStartMaingoal
                MsaApp.pushLoadTimeActions('dnbOnDragDrop');
                MsaApp.DragDropGoal.LastEvent = 'onDragStartMaingoal';

                const sumAction = evt.item.getAttribute('sum-action');
                if (sumAction > 0) {
                    MsaApp.DragDropGoal.GroupSub = 'MIndexSubgoal';
                }
                if ($(evt.target).hasClass('MIndexMaingoal')) {
                    MsaApp.DragDropGoal.GroupMainExpand = 'MIndexMaingoalExpand';
                }
            },
            onDragChangeMaingoal(evt) {             //console.log('onDragChangeMaingoal', evt);
                if (this.isViewer()) return;
                if (evt.moved) {
                    MsaApp.DragDropGoal.iFrom = evt.moved.oldIndex;
                    MsaApp.DragDropGoal.iTo = evt.moved.newIndex;
                    MsaApp.DragDropGoal.LastEvent = 'onDragChangeMaingoal_moved';
                } else {
                    if (evt.added) {
                        MsaApp.DragDropGoal.iTo = evt.added.newIndex;
                        MsaApp.DragDropGoal.LastEvent = 'onDragChangeMaingoal_added';
                        vmCommon.DrgDrpMaingoal = evt.added.element;
                    }
                    if (evt.removed) {
                        MsaApp.DragDropGoal.iFrom = evt.removed.oldIndex;
                        MsaApp.DragDropGoal.LastEvent = 'onDragChangeMaingoal_removed';
                    }
                }
            },
            onDragEndMaingoal(evt) {            //console.log('onDragEndMaingoal', evt);
                if (this.isViewer()) return;
                if(!!vmCommon.DrgDrpMaingoal) {
                    const smpIdTo = evt.to.parentNode.getAttribute('smk-product-id');
                    const indIdTo = evt.to.parentNode.getAttribute('theme-id');
                    vmCommon.DrgDrpMaingoal.SubMarketProductId = smpIdTo;
                    vmCommon.DrgDrpMaingoal.IndependencyId = indIdTo;
                    vmCommon.DrgDrpMaingoal.ListSubGoal.filter(s => {
                        s.SubMarketProductId = smpIdTo;
                        s.IndependencyId = indIdTo;
                        s.ListAction.filter(a => {
                            a.SubMarketProductId = smpIdTo;
                            a.IndependencyId = indIdTo;
                        return true;
                        });
                        return true;
                    });
                }
                MsaApp.clearDragDropGoal();
            },
            clearDragDropGoal() {
                MsaApp.DragDropGoal.Src = null;
                MsaApp.DragDropGoal.Des = null;
                MsaApp.DragDropGoal.iFrom = -1;
                MsaApp.DragDropGoal.iTo = -1;
                MsaApp.DragDropGoal.LastEvent = '';
                MsaApp.DragDropGoal.ChangeGoalEvent = '';   //clearDragDropGoal
                MsaApp.CanDragDrop = true;
            },
            clearDragDropGoalAndReloadData() {
                MsaApp.clearDragDropGoal();
            },
            clearDragDropColumn() {
                this.DragDropColumn.Obj = null;
                this.DragDropColumn.iFrom = -1;
                this.DragDropColumn.iTo = -1;
                this.DragDropColumn.LastEvent = '';
            },
            changPositionColumn() {
                if (typeof this.DragDropColumn.Obj != 'object') return;
                const obj1 = this.DragDropColumn.Obj;
                if (typeof obj1 != 'object') return;

                var obj = {
                    SrcId: parseInt(obj1.SrcId),
                    DesId: parseInt(obj1.DesId),
                    DesParentId: obj1.ParentId,
                    SrcParentId: obj1.ParentId
                };
                MsaApp.CanDragDrop = false;
                vmGoalAction.dataservice.swapColumn(obj, function (data) {
                    var state = data.value;
                    if (state === vmGoalActionDragDrop.ErrorsState.NoRole) {
                        pAlert(kLg.msgNoRole).then(function () {
                            location.reload();
                        });
                    } else {
                        MsaApp.clearDragDropColumn();

                        MsaApp.updateDataProductOrTheme_Expand_InView_Observer();       //changPositionColumn
                        MsaApp.CanDragDrop = true;
                        
                    }
                });
            },
            clearDragDropAction() {
                this.DragDropAction.Src = null;
                this.DragDropAction.Des = null;
                this.DragDropAction.iFrom = -1;
                this.DragDropAction.iTo = -1;
                this.DragDropAction.ChangeEvent = '';
                this.DragDropAction.LastEvent = '';
            },
            changePositionAction() {     //changPositionAction
                const source = this.DragDropAction.Src;
                if (typeof source != 'object') return;
                const des = this.DragDropAction.Des;
                if (typeof des != 'object') return;
                const position = this.DragDropAction.Pos;

                var obj = {
                    SourceActionGoalId: source.Id,
                    SourceMdf: source.Mdf,
                    SourceParentSubMarketId: source.ParentId,
                    SrcParentGoalActionId: source.ParentId,
                    SrcActionPlanColumnId: source.ActionPlanColumnId,

                    SourceSmpId: source.SmpId,
                    SourceThemaId: source.IndId,
                    SrcRegionId: source.RegionId,

                    DesActionGoalId: des.Id,
                    DesMdf: des.Mdf,
                    DesParentSubMarketId: des.ParentId,
                    DesParentGoalActionId: des.ParentId,
                    DesActionPlanColumnId: des.ActionPlanColumnId,

                    DesSmpId: des.SmpId,
                    DesThemaId: des.IndId,
                    DesRegionId: des.RegionId,

                    Type: source.Type,
                    Position: position
                }; 

                if (!obj.DesActionGoalId) {     // fix crash
                    MsaApp.clearDragDropAction();
                    return;
                }

                MsaApp.CanDragDrop = false;
                const url = `../Handlers/MsGoalAction.ashx?funcName=actionupdatemindex&regid=-1&projid=${projectId}&strid=${strategyId}`;
                callAjax('loadingSelectGroups', url, JSON.stringify(obj), function (data) {
                    var res = data.value;
                    if (res.ResultStatus === vmGoalActionDragDrop.ErrorsState.NoRole) {
                        pAlert(kLg.msgNoRole).then(function () {
                            location.reload();
                        });
                    } else {
                        MsaApp.setLastActiveElement(obj.SourceActionGoalId);
                        MsaApp.clearDragDropAction();

                        // Reload lại view bên phải của Navigation Menu
                        if (MsaApp.NavigationMenuView.length) {
                            MsaApp.reloadDataContentRightView();
                        }

                        // #region View Default
                        if (typeof res.TheObject === 'object' && res.TheObject != null && res.TheObject.LstMain.length) {
                                const lstSmpId = [];
                            if (obj.SourceSmpId == obj.DesSmpId && obj.DesSmpId) {
                                lstSmpId.push(obj.DesSmpId);
                            } else {
                                if (obj.DesSmpId) lstSmpId.push(obj.DesSmpId);
                                if (obj.SourceSmpId) lstSmpId.push(obj.SourceSmpId);
                            }
                            const lstIndId = [];
                            if (obj.SourceThemaId == obj.DesThemaId && obj.DesThemaId) {
                                lstIndId.push(obj.DesThemaId);
                            } else {
                                if (obj.DesThemaId) lstIndId.push(obj.DesThemaId);
                                if (obj.SourceThemaId) lstIndId.push(obj.SourceThemaId);
                            }

                            res.TheObject.LstMain.forEach(mg => {
                                if (lstSmpId.length) {
                                    lstSmpId.forEach(_smpId => {
                                        MsaApp.updateGoalActionOpenProducts(_smpId, mg);//changePositionAction
                                    });
                                }
                                if (lstIndId.length) {
                                    lstIndId.forEach(_indId => {
                                        MsaApp.updateGoalActionOpenThemes(_indId, mg);//changePositionAction
                                    });
                                }
                            });
                        }
                        // #endregion 

                        MsaApp.CanDragDrop = true;
                    }

                }, AjaxConst.PostRequest);
            },
            setTimmerGetListMain_GAMIndex() {       // ham nay goi lien tuc khi keo tha nen phai clear timmer va tao lai timmer
                MsaApp.clearTimmerGetListMain_GAMIndex();

                MsaApp.DragDropObserver.TimmerGetMains = setTimeout(MsaApp.FncGetMains, 3969);
            },
            clearTimmerGetListMain_GAMIndex() {
                if (MsaApp.DragDropObserver.TimmerGetMains) {
                    clearTimeout(MsaApp.DragDropObserver.TimmerGetMains);
                    MsaApp.DragDropObserver.TimmerGetMains = undefined;
                }
            },
            FncGetMains() {
                if (MsaApp.Expand.ListSubmarketPrdId.length) { //console.log(vmCommon.deepCopy(MsaApp.Expand.ListSubmarketPrdId))
                    MsaApp.Expand.ListSubmarketPrdId.filter(id => {
                        MsaApp.loadOpenProducts(id).then(() => {
                            const __i = MsaApp.Expand.ListSubmarketPrdId.indexOf(id);
                            if (__i > -1) {
                                MsaApp.Expand.ListSubmarketPrdId.splice(__i, 1);
                            }
                        });
                        return true;
                    });
                }
                if (MsaApp.Expand.ListThemeId.length) { //console.log(vmCommon.deepCopy(MsaApp.Expand.ListThemeId))
                    MsaApp.Expand.ListThemeId.filter(id => {
                        MsaApp.loadOpenIndependencies(id).then(() => {
                            const __i = MsaApp.Expand.ListThemeId.indexOf(id);
                            if (__i > -1) {
                                MsaApp.Expand.ListThemeId.splice(__i, 1);
                            }
                        });
                        return true;
                    });
                }

                MsaApp.clearTimmerGetListMain_GAMIndex();
            },
            updateGoalActionOpenProducts(smkpId, mGoal) {
                if (!smkpId || !mGoal || mGoal.Id == vmCommon.emptyGuid) return;
                const refM = this.$refs['RefViewMarket'];
                if (Array.isArray(refM)) {
                    refM.filter(m => {
                        const refPg = m.$refs['RefViewProductGroup'];
                        if (Array.isArray(refPg)) {
                            refPg.filter(pg => {
                                const refP = pg.$refs['RefViewProduct'];
                                if (Array.isArray(refP)) {
                                    const a = refP.find(_p => _p.SubMarketProductId == smkpId);
                                    if (a && a.IsExpand && a.ListMain.length) {
                                        a.setDataMainUpdatedMIndexAction(mGoal);        // root.updateGoalActionOpenProducts
                                    }
                                }
                                return true;
                            });
                        }
                        return true;
                    });
                }
            },
            updateGoalActionOpenThemes(indId, mGoal) {
                if (!indId || !mGoal || mGoal.Id == vmCommon.emptyGuid) return;
                const refM = this.$refs['RefViewIndependence'];
                if (Array.isArray(refM)) {
                    refM.filter(ind => {
                        const viewThemes = ind.$refs['RefViewTheme'];
                        if (Array.isArray(viewThemes)) {
                            const a = viewThemes.find(th => th.item.Id == indId);
                            if (a && a.IsExpand && a.ListMain.length) {
                                a.setDataMainUpdatedMIndexAction(mGoal);        // root.updateGoalActionOpenThemes
                            }
                        }
                        return true;
                    });
                }
            },
            
            scrollX(strSelector, funcDone, strEvent) {
                const $vScrl = $(strSelector).closest('.dnbScrollXjqry');
                if (!$vScrl.length) return;

                const x0 = $vScrl.offset().left;
                const x1 = $(strSelector).offset().left;

                const dX = (x1 - (x0 + 16)) * window.devicePixelRatio;
                const scrlLeft = $vScrl.scrollLeft() * window.devicePixelRatio;

                $vScrl.stop().animate(
                    { scrollLeft: dX + scrlLeft }, 357,
                    function () {
                        var $this = $(this).closest('.msaVueSubgoalColWrap');
                        const b = $this.find('.msa-btn-scroll-left');
                        if (b.length) {
                            $this.find('.msa-btn-scroll-left').css('visibility', 'visible');
                            $this.find('.msa-btn-scroll-right').css('visibility', 'visible');
                        }

                        if (typeof funcDone == 'function')
                            funcDone();
                    }
                );
            },
            scrollY(strSelector, funcDone, strEvent) {
                if (!$(strSelector).length) {
                    if (typeof funcDone == 'function') funcDone(strEvent);
                    return;
                }
                const $bodyContent = $('.body-content');
                var scrollTop = $bodyContent.scrollTop() * window.devicePixelRatio;
                var headHeight = $(".ms-header").height() + $(".submenu").height();
                var _top = ($(strSelector).offset().top - headHeight - 21) * window.devicePixelRatio;       // padding 21

                $bodyContent.stop().animate({
                    scrollTop: _top + scrollTop
                }, 357, function () {
                    
                    if (typeof funcDone == 'function') {
                        funcDone(strEvent);
                    }
                });
            },
            componentService: function (isNav) {
                if (typeof isNav != "boolean") return null;

                var that = this;
                return function () {
                    getSrc = () => isNav ? that.focusDataComponents : that.actionPlanComponents;
                    clearSrc = () => {
                        if (isNav)
                            that.focusDataComponents = [];
                        else
                            that.actionPlanComponents = [];
                    };

                    return {
                        src: getSrc,
                        set: function (id, cpn) {
                            getSrc()[id] = cpn;
                        },
                        get: function (id) {
                            return getSrc()[id];
                        },
                        clear: function () {
                            clearSrc();
                        }
                    };
                }();
            },
            actionReduceExpandService: function () {
                var that = this;
                return function () {
                    return {
                        isExpand: function (actionid) {
                            return that.actionReduceExpands[actionid] != undefined;
                        },
                        open: function (actionid) {
                            that.actionReduceExpands[actionid] = actionid;
                        },
                        close: function (actionid) {
                            if (actionid)
                                delete that.actionReduceExpands[actionid];
                            else
                                Object.keys(that.actionReduceExpands).forEach(key => delete that.actionReduceExpands[key]);
                        }
                    };
                }();
            },
            kpiRegionService: function () {
                var krControl = this.kpiRegionControl;
                return function () {
                    return {
                        reLoadData: function () {
                        },
                        reOpen: function () {
                            if (krControl.data && krControl.areaId)
                                this.open(krControl.data, krControl.areaId, krControl.typeId, krControl.regionId, krControl.masterId);
                        },
                        update: function (data) {
                            krControl.data = data;
                        },
                        open: function (data, areaid, typeid, regionid, masterid) {
                            //close popup
                            if (vmGoalAction.popKpiGoalAction)
                                vmGoalAction.popKpiGoalAction.close();

                            krControl.data = data;
                            krControl.areaId = areaid;
                            krControl.typeId = typeid;
                            krControl.regionId = regionid;
                            krControl.masterId = masterid;
                            krControl.isCollapse = false;

                            //show popup
                            vmGoalAction.kpiGaOptions = {};
                            vmGoalAction.kpiGaOptions.AreaId = areaid;
                            vmGoalAction.kpiGaOptions.Data = data;

                            vmGoalAction.openKpiGoalAction();
                        },
                        collapse: function () {
                            var tempControl = vmCommon.deepCopy(krControl);

                            //close popup
                            if (vmGoalAction.popKpiGoalAction)
                                vmGoalAction.popKpiGoalAction.close();

                            krControl.data = tempControl.data;
                            krControl.areaId = tempControl.areaId;
                            krControl.typeId = tempControl.typeId;
                            krControl.regionId = tempControl.regionId;
                            krControl.masterId = tempControl.masterId;

                            krControl.isCollapse = true;
                        },
                        expand: function () {
                            krControl.isCollapse = false;
                        },
                        clear: function () {
                            krControl.data = null;
                            krControl.areaId = null;
                            krControl.typeId = null;
                            krControl.regionId = null;
                            krControl.masterId = null;

                            krControl.isCollapse = false;
                        },
                        getInfo: function () {
                            return krControl;
                        },
                        holdOn: function () {
                            this.collapse();
                            krControl.isCollapse = false;
                        },
                        clearAndClose: function () {
                            this.clear();

                            //close popup
                            if (vmGoalAction.popKpiGoalAction)
                                vmGoalAction.popKpiGoalAction.close();
                        }
                    };
                }();
            },
            apLinkService: function () {
                var linkControl = this.apLinkControl;
                return function () {
                    return {
                        reLoadData: function () {
                        },
                        reOpen: function () {
                            if (linkControl.areaId && linkControl.goalActionTypeId && linkControl.goalActionId)
                                this.open(linkControl.areaId, linkControl.goalActionTypeId, linkControl.goalActionId);
                        },
                        open: function (areaid, goalactiontypeid, goalactionid) {
                            //close popup
                            if (vmGoalAction.popConnectionOverview)
                                vmGoalAction.popConnectionOverview.close();

                            linkControl.areaId = areaid;
                            linkControl.goalActionTypeId = goalactiontypeid;
                            linkControl.goalActionId = goalactionid;
                            linkControl.isCollapse = false;

                            vmGoalAction.openPopConnectionOverview(goalactionid, goalactiontypeid, areaid);
                        },
                        collapse: function () {
                            var tempControl = vmCommon.deepCopy(linkControl);

                            //close popup
                            if (vmGoalAction.popConnectionOverview)
                                vmGoalAction.popConnectionOverview.close();

                            linkControl.areaId = tempControl.areaId;
                            linkControl.goalActionTypeId = tempControl.goalActionTypeId;
                            linkControl.goalActionId = tempControl.goalActionId;

                            linkControl.isCollapse = true;
                        },
                        expand: function () {
                            /*krControl.isCollapse = false;*/
                        },
                        clear: function () {
                            linkControl.areaId = null;
                            linkControl.goalActionTypeId = null;
                            linkControl.goalActionId = null;

                            linkControl.isCollapse = false;
                        },
                        getInfo: function () {
                            return linkControl;
                        },
                        holdOn: function () {
                            //this.collapse();
                            //krControl.isCollapse = false;
                        }
                    };
                }();
            },
            redirectTo: function (gainfo, areaid, isresetfilter) {
                if (gainfo == null || !Array.isArray(gainfo) || gainfo.length == 0) return;

                //common
                var that = this;
                var getParentComponents = function (cpn) {
                    var parentCpn = cpn.$parent;
                    if (!parentCpn) return [];

                    var lst = [];
                    lst.push(parentCpn);
                    lst = lst.concat(getParentComponents(parentCpn));

                    return lst;
                }
                function expandGoalAction() {
                    //expand goal/action
                    var gaId = gainfo.pop();
                    setTimeout(function () {
                        if (gainfo.length) {
                            var i = 0;
                            var time = setInterval(function () {
                                if (i <= gainfo.length - 1) {
                                    var x = MsaApp.componentService(MsaApp.IsShowNavigationMenu).get(gainfo[i]);
                                    if (x == undefined) {
                                        clearInterval(time);
                                        return;
                                    }

                                    i += 1;

                                    if (x.IsExpand == false) {
                                        if (x.toggleMainDetail) x.toggleMainDetail();
                                        if (x.onToggleExpand) x.onToggleExpand();
                                    }
                                } else {
                                    clearInterval(time);
                                }
                            }, 450);
                        }

                        var count = 0;
                        var timeExpand = setInterval(function () {
                            if (count > 10) {
                                clearInterval(timeExpand);
                                return;
                            }

                            count += 1;

                            //redirect
                            var gaComponent = MsaApp.componentService(MsaApp.IsShowNavigationMenu).get(gaId);
                            if (gaComponent != null) {
                                if (gaComponent.IsExpand != null && gaComponent.IsExpand == false) {
                                    if (gaComponent.toggleMainDetail) gaComponent.toggleMainDetail();
                                    if (gaComponent.onToggleExpand) gaComponent.onToggleExpand();
                                }

                                var scrollTop = $(".body-content").scrollTop();
                                var headHeight = $(".ms-header").height() + $(".submenu").height();
                                $(".body-content").animate({ scrollTop: $(gaComponent.$el).offset().top - headHeight + scrollTop });

                                clearInterval(timeExpand);
                            }

                        }, 1000);
                    }, 1000);
                }

                //has menu
                if (MsaApp.IsShowNavigationMenu) {
                    var navComponent = MsaApp.navigationComponents[areaid];
                    if (navComponent == undefined) {
                        if (isresetfilter) {
                            msFilter.controlService.resetFilterToDefault().then(function (res) {
                                setTimeout(function () {
                                    that.redirectTo(gainfo, areaid);
                                }, 1000);
                            });

                            return;
                        }
                        else return;
                    }

                    //expand parent
                    var menuCompenents = getParentComponents(navComponent);
                    for (var i = menuCompenents.length - 1; i >= 0; i--)
                        if (menuCompenents[i].IsExpand == false) menuCompenents[i].onClickSelect();

                    if (navComponent.item.IsFocus == false)
                        navComponent.onClickSelect();

                    expandGoalAction();

                } else {
                    //check for existence
                    var areaComponent = MsaApp.componentService(MsaApp.IsShowNavigationMenu).get(areaid);// actionPlanComponents[areaid];
                    if (areaComponent == undefined) {
                        if (isresetfilter) {
                            msFilter.controlService.resetFilterToDefault().then(function (res) {
                                setTimeout(function () {
                                    that.redirectTo(gainfo, areaid);
                                }, 1000);
                            });

                            return;
                        }
                        else return;
                    }

                    //expand area
                    var areaCompenents = getParentComponents(areaComponent);
                    for (var i = areaCompenents.length - 1; i >= 0; i--)
                        if (areaCompenents[i].IsExpand == false) areaCompenents[i].IsExpand = true;

                    if (areaComponent.IsExpand == false)
                        areaComponent.onClickToggleShow();

                    expandGoalAction();
                }
            }
        },
        beforeDestroy() {
            // Unregister the event listener before destroying this Vue instance
            window.removeEventListener('resize', this.onResizeView);
            document.removeEventListener('keyup', this.keyupScrollColumnX);
            document.removeEventListener('keydown', this.keydownScrollColumnX);
        },
    });
});

