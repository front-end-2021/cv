var projectId = 42381;
var strategyId = 44743;
var language = 'en';
function getDateDiff(startDate, endDate) {
    if (!endDate || !startDate) return;
    var days = (endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24;
    return days + 1;
}

function getIconToggle_ (element, root) {
    var icontoggle = 'none';
    const typeId = element.TypeId;
    if (!root.IsSharepoint) {
        if (root.MenuLabeling.IsMain && typeId == vmCommon.RMGoalActionType.MainGoal) {
            icontoggle = 'font-arrow-down';
        }
        if (root.MenuLabeling.IsSub && typeId == vmCommon.RMGoalActionType.SubGoal) {
            icontoggle = 'font-arrow-down';
        }
        if (root.MenuLabeling.IsAction && typeId == vmCommon.RMGoalActionType.Action) {
            icontoggle = 'font-arrow-down';
        }
    }
    return icontoggle;
}
function StyleInPopupPreviewSharepointRegion(root) {
    var display;
    var marginLeft;
    if (root.IsSharepoint) {
        display = 'none';
        marginLeft = 0;
    }
    return {
        display: display,
        marginLeft: marginLeft
    }
}
function onToggleLabelingFromPath(target, element, root) {
    if (root.IsSharepoint) return;  // khong ap dung cho sharepoint (neu ve sau ap dung thi bo dong code nay di)

    const eEx = root.ListExpands.find(e => e.Id == element.Id && e.TypeId == element.TypeId);
    if (eEx) {
        const isEx = !eEx.IsExpand;
        eEx.IsExpand = isEx;
    }

    const $target = $(target);
    toggleLabelingOnPath($target, element.TypeId, root);
};
function toggleLabelingOnPath($target, typeid, root) {
    var hasToggleChild = false;
    const $lblingParent = $target.closest('.rm-main-goal-action.rm-msa-labeling');
    if (root.MenuLabeling.IsMain && typeid == vmCommon.RMGoalActionType.MainGoal) {
        hasToggleChild = toggleFamiliar($lblingParent, 'rm_labeling_maingoal');
    }
    if (root.MenuLabeling.IsSub && typeid == vmCommon.RMGoalActionType.SubGoal) {
        hasToggleChild = toggleFamiliar($lblingParent, 'rm-labeling-subgoal', 'rm_labeling_maingoal');
    }
    if (root.MenuLabeling.IsAction && typeid == vmCommon.RMGoalActionType.Action) {
        hasToggleChild = toggleFamiliar($lblingParent, 'rm-labeling-action', 'rm-labeling-subgoal', 'rm_labeling_maingoal');
    }
    // #region Update lai chieu cao cho Roadmap
    const msaView = root.$el.querySelector('.dnb-msa-view.dnb-relative');
    if (!!msaView) {
        var vHeight = msaView.scrollHeight + 60;
        if (vHeight < 570) vHeight = 570;
        root.ViewHeight = vHeight;
    }
    // #endregion

    // #region css lai cho labeling
    //chuyển thẻ a(icon mũi tên) ra ngoài class .dnb-elm_toggle-wrap nên không tìm được class phải đổi class là .kgv-style-name-element-popup để tìm ra các con bên trong
    if (hasToggleChild) {
        var $elementName = $target;
        //if ($target.hasClass('dnb-elm-name')) {
        //    $elementName.toggleClass('rmlabeling_toggle_text');
        //}
        //else {
            $elementName = $target.closest('.kgv-style-name-element-popup').find('.dnb-elm-name');
            $elementName.toggleClass('rmlabeling_toggle_text');
        //}
        toggleArrow($elementName.closest('.kgv-style-name-element-popup').find('.dnb-icon_toggle'), $elementName.hasClass('rmlabeling_toggle_text'));
    }
    // #endregion

    function toggleArrow($arrowRighDown, isCollapse) {
        if (isCollapse) {
            $arrowRighDown.addClass('font-arrow-right').removeClass('font-arrow-down');
        } else {
            $arrowRighDown.addClass('font-arrow-down').removeClass('font-arrow-right');
        }
    }
    function toggleFamiliar($lblingParent, clsLbling, clsLbling1, clsLbling2) {
        const isLblingCollapse = $lblingParent.hasClass('rmlabeling_toggle_root');
        //$lblingParent.toggleClass('rmlabeling_toggle_root');

        var typeId = vmCommon.RMGoalActionType.MainGoal;
        var hasChild = false;
        var $next = $lblingParent.next(); // phan tu tiep theo .rm-main-goal-action
        while ($next.length > 0) {
            var hasCls = $next.hasClass(clsLbling);
            if (clsLbling1) {
                hasCls = hasCls || $next.hasClass(clsLbling1);
                typeId = vmCommon.RMGoalActionType.SubGoal;
            }
            if (clsLbling2) {
                hasCls = hasCls || $next.hasClass(clsLbling2);
                typeId = vmCommon.RMGoalActionType.Action;
            }

            if (hasCls || checkBreak($next, typeId, $lblingParent.attr('freezedid')) || !isChild($next, typeId, $lblingParent.attr('freezedid'))) {
                break;
            } else {
                hasChild = true;
                if (isLblingCollapse) {                    // chuyển từ collapse => expand
                    if ($next.hasClass('rmlabeling_toggle_root') && $next.hasClass('rmlabeling_toggle_view')) {
                        $next.find('.dnb-icon_toggle.font-arrow-right').addClass('font-arrow-down').removeClass('font-arrow-right');
                    }
                    $next.removeClass('rmlabeling_toggle_view');
                }
                $next = $next.next();
            }
        }
        return hasChild;
    }
    function checkBreak($next, typeid, lblingId) {
        var hasClsEmpty = $next.hasClass('dnb--rm-mga-empty');
        if (hasClsEmpty) {
            if (typeid > vmCommon.RMGoalActionType.MainGoal) {
                if (typeid == vmCommon.RMGoalActionType.SubGoal) {
                    const subgoalid = $next.attr('subgoalid');
                    if (subgoalid && subgoalid != lblingId)
                        return hasClsEmpty;
                }
            } else {        // click maingoal labeling
                const maingoalid = $next.attr('maingoalid');
                if (maingoalid && maingoalid != lblingId) {
                    return hasClsEmpty;
                }
            }
        } else {
            const $hLineLbling = $next.find('.hline-islabeling');
            const nextTypeId = +($hLineLbling.attr('typeid'));
            const maingoalid = $hLineLbling.attr('maingoalid');
            var subgoalid;
            if (nextTypeId == vmCommon.RMGoalActionType.Activity)
                subgoalid = $hLineLbling.attr('subgoalid');
            else if (nextTypeId == vmCommon.RMGoalActionType.Action) {
                subgoalid = $hLineLbling.attr('parentid');
            }
            if (typeid < vmCommon.RMGoalActionType.SubGoal) {       // maingoal
                if (maingoalid && maingoalid != lblingId) {
                    return true;
                }
            } else if (typeid < vmCommon.RMGoalActionType.Action) {     // subgoal
                if (subgoalid && subgoalid != lblingId) {
                    return true;
                }
            }
        }
        var isEqTypeid = typeid == $next.attr('typeid');
        return hasClsEmpty && isEqTypeid;
    }
    function isChild($next, lblingTypeId, lblingId) {
        const $hlineNext = $next.find('.hline-islabeling').first();
        if (lblingTypeId == 1 && $hlineNext.attr('typeid') == '2') {                 // Subgoal
            if ($hlineNext.attr('parentid') != lblingId)
                return false;
        }
        return true;
    }
}

Number.prototype.toMonthString = function () {
    let m = this.valueOf();
    switch (m) {
        case 1: return kLg.January;
        case 2: return kLg.February;
        case 3: return kLg.March;
        case 4: return kLg.April;
        case 5: return kLg.May;
        case 6: return kLg.June;
        case 7: return kLg.July;
        case 8: return kLg.August;
        case 9: return kLg.September;
        case 10: return kLg.October;
        case 11: return kLg.November;
        case 12: return kLg.December;
        default: return '';
    };
}

var msRoadmap = msRoadmap || {};
msRoadmap.isSharepoint = function () {
    return window.location.pathname.includes('MsRoadmapSharepoint.aspx');
};

msRoadmap.popExportRoadmap = undefined;
msRoadmap.openPopExportRoadmap = function () {
    var widthcreen = screen.width - 50; // check để set width popup cho màn hình pc và laptop 
    if (widthcreen > 1800) {
        widthcreen = 1870;
    } else {
        widthcreen = 1600;
    }
    msRoadmap.popExportRoadmap = showPopup(msRoadmap.popExportRoadmap,
        $("#popExportRoadmap"), '../Contents/MsPopExportRoadmap.html', {
        title: kLg.ExportPreview,
        width: widthcreen,
        height: 800,
        resizable: false
    });
};

msRoadmap.dataService = function () {
    const isSharepoint = msRoadmap.isSharepoint();
    var projectId = sHandler.ProjectId;
    var strategyId = sHandler.StrategyId;
    var language = sHandler.Lang;
    const urlBuilder = function (funcName) {

        if (isSharepoint) {
            return `../Handlers/MixPreviewHandler.ashx?funcName=${funcName}&linksharepointid=${linkSharepointId}&lang=${lang}`;
        }

        var rootUrl = '/Handlers/RoadMapHandler.ashx?funcName={funcName}&projid=' + projectId + '&strid=' + strategyId + '&lang=' + language;
        return rootUrl.replace('{funcName}', funcName);
    };

    const base = (funcName, entryData) => {
        this.loading = true;
        return callAjaxPromise(urlBuilder(funcName), entryData).then(data => Promise.resolve(data)).catch(error => {
            this.errored = true;
        }).finally(() => this.loading = false);
    };

    var getRoadmapData = function () {
        var entryData = { LinkSharepointId: linkSharepointId }
        return base("getroadmapdata", entryData);
    };

    var getData = function (entryData) {
        if (isSharepoint) {
            return getRoadmapData();
        }
        return base("getdatawithoutfilter", entryData);
    };

    var saveViewStatus = function (entryData) {
        return base("setlasttabidrm", entryData);
    };

    var getDataWithFilter = function (entryData) {
        return base("getdatawithfilter", entryData);
    };
    var changeGoalActionIndex = function (entry) {
        return base('changegoalactionindex', entry);
    }
    return {
        getData: getData, saveViewStatus: saveViewStatus, getDataWithFilter: getDataWithFilter, changeGoalActionIndex: changeGoalActionIndex
    };
}();
msRoadmap.qUnit = 4;
msRoadmap.mUnit = 9;
msRoadmap.View = (function () {
    var __rootFolder__ = 'MsRoadmap';
    var Tabview = '/TabView';
    setupLang();

    Vue.component('depth-filter', (resolve) => {
        $.get(__rootFolder__ + "/Popup/DepthFilter.html", template => {
            resolve({
                template: template,
                props: ["subFilter"],
                data: () => {
                    return {
                        isShowMenu: false,
                        db: new SubFilter(),
                        Labeling: {
                            IsShow: false,
                            IsMain: false,
                            IsSub: false,
                            IsAction: false,
                            IsChange: false
                        }
                    };
                },
                computed: {
                    Lang: () => kLg
                },
                mounted() {
                    var that = this;
                    $(document).on("click", function (e) {
                        if ($(e.target).hasClass("icondownfilterdepth") || $(e.target).closest('.Roadmapviewquater-menufilterdepth').length)
                            return;
                        that.isShowMenu = false;
                        that.closeMenuLabeling();
                    });
                },
                methods: {
                    setMenuState: function (flag) {
                        this.isShowMenu = flag;
                    },
                    isChange: function () {
                        return this.subFilter.IsMain != this.db.IsMain ||
                               this.subFilter.IsSub != this.db.IsSub ||
                               this.subFilter.IsAction != this.db.IsAction ||
                               this.subFilter.IsActivity != this.db.IsActivity;
                    },
                    onClickFilterDepth() {
                        this.isShowMenu = !this.isShowMenu;

                        this.closeMenuLabeling();
                    },
                    onChange: function () {
                        const rootSubFlter = this.$root.subFilter;
                        vmCommon.newSubFlter = vmCommon.deepCopy(rootSubFlter);
                        const sFlter = this.db;
                        msFilter.controlService.switchToDefaultFilter().then(() => {
                            rootSubFlter.IsActivity = vmCommon.newSubFlter.IsActivity;
                            rootSubFlter.IsAction = vmCommon.newSubFlter.IsAction;
                            rootSubFlter.IsSub = vmCommon.newSubFlter.IsSub;
                            rootSubFlter.IsMain = vmCommon.newSubFlter.IsMain;
                            sFlter.IsActivity = vmCommon.newSubFlter.IsActivity;
                            sFlter.IsAction = vmCommon.newSubFlter.IsAction;
                            sFlter.IsSub = vmCommon.newSubFlter.IsSub;
                            sFlter.IsMain = vmCommon.newSubFlter.IsMain;

                            const subFlt = vmCommon.newSubFlter;
                            const queryFilter = {
                                SubFilter: {
                                    IsMain: subFlt.IsMain, IsSub: subFlt.IsSub, 
                                    IsAction: subFlt.IsAction, IsActivity: subFlt.IsActivity
                                }
                            }
                            msRoadmap.dataService.getData(queryFilter).then(function (res) {
                                msRoadmapApp.updateDataFrom(res.value, true);
                                msRoadmapApp.resetExpandPathBlocks();
                            });

                            delete vmCommon.newSubFlter;
                        });
                    },
                    hoverOut: function () {
                        this.isShowMenu = false;
                    },
                    onClickLabeling() {
                        this.Labeling.IsMain = this.$root.MenuLabeling.IsMain;
                        this.Labeling.IsSub = this.$root.MenuLabeling.IsSub;
                        this.Labeling.IsAction = this.$root.MenuLabeling.IsAction;
                        this.Labeling.IsShow = !this.Labeling.IsShow;
                        if (this.isShowMenu) {
                            this.isShowMenu = false;
                        }
                    },
                    closeMenuLabeling() {
                        if (this.Labeling.IsShow) {
                            this.Labeling.IsShow = false;
                            if (this.Labeling.IsChange) {
                                msFilter.controlService.getLabeling().saveHandler();
                                this.Labeling.IsChange = false;
                            }
                        }
                    },
                    onChangeLabeling(type) {      // checkbox 
                        switch (type) {
                            case vmCommon.RMGoalActionType.MainGoal:
                                if (!this.Labeling.IsMain) {
                                    (this.Labeling.IsSub) && (this.Labeling.IsSub = false);
                                    (this.Labeling.IsAction) && (this.Labeling.IsAction = false);
                                }
                                break;
                            case vmCommon.RMGoalActionType.SubGoal:
                                if (!this.Labeling.IsSub) {
                                    (this.Labeling.IsAction) && (this.Labeling.IsAction = false);
                                } else if (!this.Labeling.IsMain) {
                                    this.Labeling.IsMain = true;
                                }
                                break;
                            case vmCommon.RMGoalActionType.Action:
                                (!this.Labeling.IsMain) && (this.Labeling.IsMain = true);
                                (!this.Labeling.IsSub) && (this.Labeling.IsSub = true);
                                break;
                        }
                        this.$root.setLabeling(this.Labeling.IsMain, this.Labeling.IsSub, this.Labeling.IsAction);
                        
                        this.Labeling.IsChange = true;
                    }
                },
                // watch: { db (newVal) {} },
            });
        });
    });
    Vue.component('CalendarHead', (resolve) => {
        $.get(__rootFolder__ + `${Tabview}/ComponentCalendarHead.html`, template => {
            resolve({
                template: template,
                props: ['viewType', 'StartEndM', 'StartEndQ', 'subFilter', "isShowDepth", "IsHidePath"],
                computed: {
                    ClassView() {
                        const rmView = this.viewType == 0 ? 'rm-view-quarter' : 'rm-view-month';

                        return {
                            rmView: rmView
                        }
                    },
                    DisplayUI() {
                        if (this.viewType == 1) {   // view Month
                            var ymw = getYearMonthWeek(this.$root, this.StartEndM);
                            return {
                                SumWeek: ymw.SumWeek,
                                Years: ymw.Years,
                                Months: ymw.Months,
                                Weeks: ymw.Weeks,
                                Width: ymw.Width + 'px'
                            }
                        }
                        // view Quarter
                        var yqm = getYearQuarterMonth(this.StartEndQ);
                        return {
                            Years: yqm.Years
                        }
                    },
                    IsShow() {
                        if (this.isShowDepth) return false;
                        if (this.$root.ViewWidth < 309) return false;
                        if (this.IsHidePath) return false;
                        return true;
                    },
                    IsCalendarShow() {                        
                        const isAllItemNull = this.$root.IsAllItemNull;
                        if (isAllItemNull) return false;
                        return true;
                    },
                    PosLeft() {
                        if (!this.isShowDepth && !this.IsShow) return '0px';
                        if (this.IsHidePath) {
                            if (msRoadmap.isSharepoint() || this.viewType != 0) return '0';
                            return '-6px';
                        }
                        if (this.viewType == 0) return '317px';
                        return '316px';
                    },
                    PadRight() {
                        if (this.viewType != 0) return '1px';
                        return '0'
                    },
                    StyleEmptyView() {
                        var height = 130;
                        if (msRoadmap.isSharepoint()) {
                            height = 103;
                        }

                        return {
                            Height: `${height}px`
                        }
                    },
                }
            });
        });
    });

    /**Dùng mixin cho 2 components 
     * rm-view-month
     * rm-view-quarter */
    const rmViewMixin = {
        props: ['MasterBlocks', 'MinStart', 'MaxEnd', 'TimerangeStart', 'TimerangeEnd', "subFilter"],
        created() { },
        computed: {
            CanAdjustStartEnd() {
                if (msRoadmapApp.IsSharepoint) return false;
                if (msRoadmapApp.IsOpenPopPreview) return false;
                if (msRoadmapApp.IsUpdatingOnServer) return false;
                return true;
            },
            DragdropOptions() {
                let canDrg = true;
                if (msRoadmapApp.IsSharepoint) canDrg = false;
                if (msRoadmapApp.IsOpenPopPreview) canDrg = false;
                if (msRoadmapApp.IsUpdatingOnServer) canDrg = false;
                return {
                    animation: 100, sort: true,
                    disabled: !canDrg,
                    ghostClass: "ghost", 
                    chosenClass: "chosenClass",
                    direction: 'vertical',
                    scrollSensitivity: 200,
                    forceFallback: true
                }
            },
            StartDate() {
                var startDate = this.MinStart;     // string
                return new Date(startDate);
            },
            EndDate() {
                var endDate = this.MaxEnd;
                return new Date(endDate);
            },
        },
        methods: {
            isLabeling(element) {
                const mLbling = this.$root.MenuLabeling;
                if (mLbling.IsMain && element.TypeId == vmCommon.RMGoalActionType.MainGoal) {
                    return true;
                }
                if (mLbling.IsSub && element.TypeId < vmCommon.RMGoalActionType.Action) {
                    return true;
                }
                if (mLbling.IsAction && element.TypeId < vmCommon.RMGoalActionType.Activity) {
                    return true;
                }
                return false;
            },
            checkArangeStartEnd(elm, iCa, iCh, iP, iB, target, isStart) {
                const r = msRoadmapApp.findThemaRegionRole(iCh, iP, iB);
                if (r && r.RoleId < 1) return;                  // Kiem tra RegionRole/ThemaRole
                if (vmCommon.IsMouseoverAdjustDate) return;
                // #region kiểm tra Labeling
                if (this.isLabeling(elm)) return;
                // #endregion
                msRoadmapApp.setDateElement(target, elm, iCa, iCh, iP, iB, isStart);
                //if (!vmCommon.timeToShowDrgDrpDate) {
                //    vmCommon.timeToShowDrgDrpDate = setTimeout(function () {
                //        msRoadmapApp.setDateElement(target, elm, iCa, iCh, iP, iB, isStart);
                //    }, 246);
                //}
                this.removeTooltip(target);
            },
            removeTooltip(target) {
                const $dnbTolp = $(target).find('.dnb_tooltip');
                if (!$dnbTolp.length) return;
                if ($dnbTolp.data('kendoTooltip')) $dnbTolp.data('kendoTooltip').destroy();
                else if ($dnbTolp.find('.dnb-elm-name').length) {
                    if ($dnbTolp.find('.dnb-elm-name').data('kendoTooltip'))
                        $dnbTolp.find('.dnb-elm-name').data('kendoTooltip').destroy();
                }
            },
            getTime(date) {
                if (!date) return null;
                return date.getTime();
            },
            canDragStartDate(elm) {
                if (elm.TypeId == vmCommon.RMGoalActionType.Activity) {
                    const ac = msRoadmapApp.findActionCostConnection(elm);
                    if (ac) return !ac.IsConnectionUp;
                }
                if (elm.TypeId == vmCommon.RMGoalActionType.Action) {
                    const ac = msRoadmapApp.getActionDownStream(elm.Id);
                    return !ac;     // false
                }
                if (elm.Start) {
                    if (compareYYYYMMDD(msRoadmapApp.ViewFrom, elm.Start.toStringYYYYMMDD()) == -1) {       // start của element < ViewFrom của Calendar
                        return false;
                    }
                }
                return true;
            },
            getListElement(category) {
                if (this.$root.IsOpenPopPreview) return [];
                return category.Elements;
            },
            getGroupElement() {
                return 'dnbSortableGoalAction';
            },
            mousedownToSortMIndex(e) { 
                vmCommon.RoadmapSortMIndexDragging = true;      // dùng disable tooltip 
                this.removeTooltip(e.target);
            },
            mouseupToSortMIndex() {
                delete vmCommon.RoadmapSortMIndexDragging;
            },
            onDragStartElement(evt) {
                if (msRoadmapApp.IsUpdatingOnServer) return;
                if (vmCommon.IsMouseoverAdjustDate) return;
                vmCommon.RoadmapSortMIndexDragging = true;      // dùng disable tooltip 
                const DOMitem = evt.item;
                let type = DOMitem.getAttribute('sort-mindex-type');
                if (type) type = +type;
                let id = DOMitem.getAttribute('sort-mindex-id');
                
                vmCommon.rmSortMIndex = {
                    srcId: id, srcType: type
                }

                // #region Kiểm tra vị trí dưới cùng/trên cùng của block
                const prev = DOMitem.previousElementSibling;
                const next = DOMitem.nextElementSibling;
                if (prev && !next) {    //console.log(`onDragStartElement Đang ở dưới cùng của block cũ`);
                    vmCommon.rmSortMIndex.isLast = true;
                }
                if (!prev && next) {    //console.log(`onDragStartElement Đang ở trên cùng của block cũ`);
                    vmCommon.rmSortMIndex.isTop = true;
                }
                // #endregion Kiểm tra vị trí dưới cùng/trên cùng của block
            },
           // onDragChangeElement(evt) { },
            onDragEndElement(evt) {
                delete vmCommon.RoadmapSortMIndexDragging;      // dùng disable tooltip
                const _pos = vmCommon.rmSortMIndex.PositionId;
                const prevId = vmCommon.rmSortMIndex.prevId;
                const prevType = vmCommon.rmSortMIndex.prevType;
                const nextId = vmCommon.rmSortMIndex.nextId;
                const nextType = vmCommon.rmSortMIndex.nextType;
                const entry = {
                    SrcGoalActionId: vmCommon.rmSortMIndex.srcId,
                    SrcGoalActionTypeId: vmCommon.rmSortMIndex.srcType,
                    PositionId: _pos
                };
                if (_pos < 1 && !prevId) {  //console.log(`ở trên cùng block mới dưới`);
                    entry.DesGoalActionId = nextId;
                    entry.DesGoalActionTypeId = nextType;
                }
                else if (_pos > 0 && !nextId) {     // console.log(`ở dưới cùng block mới trên`);
                    entry.DesGoalActionId = prevId;
                    entry.DesGoalActionTypeId = prevType;
                } else {
                    entry.PositionId = 1;
                    entry.DesGoalActionId = prevId;
                    entry.DesGoalActionTypeId = prevType;
                }
                msRoadmapApp.IsUpdatingOnServer = true;
                this.$root.updateSortable(entry).then((value) => {
                    switch (value) {
                        case 1:
                            this.$root.reloadData();
                            break;
                        case 0:     // moving.SourceActionGoalId == moving.DesActionGoalId (Khogn thay doi)
                        case -1:
                        default:
                            msRoadmapApp.CountRevert += 1;
                            msRoadmapApp.IsUpdatingOnServer = false;
                            break;
                    }
                });

                delete vmCommon.rmSortMIndex;
            },
            onDragMoveElement(evt, originalEvent) {
                if (vmCommon.IsMouseoverAdjustDate) return;
                var _pos = evt.dragged.offsetTop - evt.related.offsetTop < 0 ? 1 : 0;
                // #region Tìm prev và next
                let next, prev;
                if (_pos > 0) {
                    next = evt.related.nextElementSibling;
                } else {
                    prev = evt.related.previousElementSibling;
                }
                // #endregion Tìm prev và next
                // kiểm tra isTop/isLast trước đó (Vị trí trên cùng của 1 block/vị trí dưới cùng của 1 block)
                const isTop = vmCommon.rmSortMIndex.isTop,
                    isLast = vmCommon.rmSortMIndex.isLast;                
                // #region lấy các thuộc tính prevId, prevType, nextId, nextType
                if (_pos > 0) {
                    if (!isLast) {
                        prev = evt.related;
                    }   
                } else {
                    if (!isTop) {
                        next = evt.related;
                    }   
                }
                let prevId, prevType, nextId, nextType;
                if (prev) {
                    prevId = prev.getAttribute('sort-mindex-id')
                    prevType = parseInt(prev.getAttribute('sort-mindex-type'));
                }
                if (next) {
                    nextId = next.getAttribute('sort-mindex-id');
                    nextType = parseInt(next.getAttribute('sort-mindex-type'));
                }
                // #endregion lấy các thuộc tính prev và next

                // kiểm tra kéo giữa Action và Activity con hoặc 2 Activity cùng cha
                if (prevType == 3 && prevType == nextType && prevId == nextId) {
                    _pos = 1;
                };

                // #region lưu vào biến toàn cục để dùng trong hàm endDragDrop
                if (prevId != undefined) { vmCommon.rmSortMIndex.prevId = prevId; }
                else { delete vmCommon.rmSortMIndex.prevId }
                if (prevType != undefined) { vmCommon.rmSortMIndex.prevType = prevType; }
                else { delete vmCommon.rmSortMIndex.prevType; }
                if (nextId != undefined) { vmCommon.rmSortMIndex.nextId = nextId; }
                else { delete vmCommon.rmSortMIndex.nextId; }
                if (nextType != undefined) { vmCommon.rmSortMIndex.nextType = nextType; }
                else { delete vmCommon.rmSortMIndex.nextType; }

                if (!next && !isLast) vmCommon.rmSortMIndex.isLast = true;
                if (!prev && !isTop) vmCommon.rmSortMIndex.isTop = true;
                if (isTop) delete vmCommon.rmSortMIndex.isTop;
                if (isLast) delete vmCommon.rmSortMIndex.isLast;
                // #endregion lưu vào biến toàn cục
                // #region kiểm tra kéo thả khác block
                if (!isTop && !isLast && prev && !next) {   //console.log(`Đang ở dưới cùng của block cũ`);
                    _pos = 1;
                }
                else if (!isTop && !isLast && !prev && next) {  //console.log(`Đang ở trên cùng của block cũ`);
                    _pos = 0;
                }
                else if (isTop && !isLast && prev && !next) {   //console.log(`Đang ở dưới cùng block mới trên`);
                    _pos = 1;
                }
                else if (!isTop && isLast && !prev && next) {   //console.log(`Đang ở trên cùng block mới dưới`);
                    _pos = 0;
                }
                else {  //console.log(`Đang kéo thả trong vùng của 1 block`); console.log(isTop, isLast, typeof prev, typeof next)
                    _pos = 1;
                }
                vmCommon.rmSortMIndex.PositionId = _pos;
                // #endregion kiểm tra kéo thả khác block
                //console.log('Pos', vmCommon.rmSortMIndex.PositionId);
                //if (prev) console.log('prevElm ==> ', prevType, prevId, prev.innerText);
                //console.log('dragged ==> ', vmCommon.rmSortMIndex.srcType, vmCommon.rmSortMIndex.srcId, evt.dragged.innerText);
                //if (next) console.log('nextElm ==> ', nextType, nextId, next.innerText);
                //console.log(`========================+================================`);
            },
            getSortMIndexTypeId(elements) {
                if (!elements.length) return;
                const elm = elements[0];
                if (elm.TypeId > vmCommon.RMGoalActionType.Action) return vmCommon.RMGoalActionType.Action;// Activity thì trả về type Action
                return elm.TypeId;
            },
            getSortMIndexId(elements) {
                if (!elements.length) return;
                const elm = elements[0];
                if (elm.TypeId > vmCommon.RMGoalActionType.Action) return elm.ParentId;// Activity thì trả về Action Id Cha
                return elm.Id;
            },
            getSortMIndexPos(elements) {
                if (!elements.length) return;
                const elm = elements[0];
                if (elm.TypeId > vmCommon.RMGoalActionType.Action) return 1;
                return;
            },
            getStyleFlex(elements) {
                if (elements.length < 2) return;
                return { display: 'flex' }
            },
            getStyleActivity(element) {
                if (element.TypeId == 4 && !element.Name) {
                    return {height: '8px', marginTop: '5px', backgroundColor: 'white'}
                }
            },
            getStyleActivityNameWrap(element) {
                if (element.TypeId == 4 && element.Name) {
                    return { whiteSpace: 'pre', display: 'contents'}
                }
            },
            opacityOutOfView(element) {
                if (!msRoadmapApp.IsOpenPopPreview) return;
                if (element.End && element.End.getTime() < this.StartDate.getTime())
                    return '0';
            },
            checkLabelingCollapse(element) {
                const id = element.Id;
                const lstLblingCollapse = this.$root.LstLabelingIdCollapse;
                const i = lstLblingCollapse.indexOf(id);
                if (i < 0) {
                    lstLblingCollapse.push(id);
                } else {
                    lstLblingCollapse.splice(i, 1);
                }
            },
            getLblingRootId(elements) {
                if (!elements.length) return;
                const elm = elements[0];
                if (elm.TypeId > vmCommon.RMGoalActionType.Action) return;
                const lstLblingCollapse = this.$root.LstLabelingIdCollapse;
                if (lstLblingCollapse.includes(elm.Id)) {
                    this.$nextTick(() => {
                        var listM = this.$el.querySelectorAll(`div[lbling-maingoal-id="${elm.Id}"]`);
                        for (const childLbling of listM) {
                            childLbling.parentElement.classList.add('rmlabeling_toggle_view');
                        }
                        const listS = this.$el.querySelectorAll(`div[lbling-subgoal-id="${elm.Id}"]`);   
                        for (const childLbling of listS) {
                            childLbling.parentElement.classList.add('rmlabeling_toggle_view');
                        }
                        const listP = this.$el.querySelectorAll(`div[lbling-parent-id="${elm.Id}"]`);
                        for (const childLbling of listP) {
                            childLbling.parentElement.classList.add('rmlabeling_toggle_view');
                        }
                    });
                    return elm.Id;
                }
            },
            getClassPointSortMIndex(element) {
                if (msRoadmapApp.IsOpenPopPreview) return;
                if (element.TypeId < 4) return 'pointSortMIndex';
            },
            toggleViewFromPath(iBlock, iParent, iChildhoder) {
                const $root = this.$root;
                const lstVsbInV = $root.LstVisibleInView;
                if (!lstVsbInV || !lstVsbInV.length) return;
                const itm = lstVsbInV.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                if (itm) {
                    itm.IsBlockExpand = !itm.IsBlockExpand;
                    msRoadmapApp.IsUpdatingOnServer = true;
                }
            },
            isExpandBlockPath(iBlock, iParent, iChildhoder) {
                const $root = this.$root;
                const lstVsbInV = $root.LstVisibleInView;
                if (!lstVsbInV || !lstVsbInV.length) return true;
                const itm = lstVsbInV.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                if (itm) {
                    return itm.IsBlockExpand;
                }
                return true;
            },
            getArrowInPath(iBlock, iParent, iChildhoder) {
                const $root = this.$root;
                const lstVsbInV = $root.LstVisibleInView;
                if (!lstVsbInV || !lstVsbInV.length) return 'font-arrow-down';
                const itm = lstVsbInV.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                if (itm && itm.IsBlockExpand) {
                    return 'font-arrow-down';
                }
                return 'font-arrow-right';
            },
            getVisibleAndShowFromPath(iBlock, iParent, iChildhoder) {
                const $root = this.$root;
                const lstVsbInV = $root.LstVisibleInView;
                let isVsbl = false;
                let isblkExpnd = true;
                if (lstVsbInV) {
                    const itm = lstVsbInV.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                    if (itm) {
                        isblkExpnd = itm.IsBlockExpand;
                        isVsbl = itm.IsVisibleInView;
                    }
                }
                if (!isblkExpnd) return false;
                return isVsbl;
            },
            getKeyObserver(iBlock, iParent, iChildhoder) {
                const lstVsbl = this.$root.LstVisibleInView;
                let isVsbl = true;
                if (lstVsbl) {
                    const itm = lstVsbl.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                    if (itm) isVsbl = itm.IsVisibleInView;
                }
                return `block_${iBlock}_parent_${iParent}_childholder_${iChildhoder}_${isVsbl}`;
            },
            getClassDnbClsObserver() {
                if (!msRoadmapApp.IsOpenPopPreview)
                    return 'DnbClsObserver';
            },
        },
        mounted() { },
        beforeUpdate() { },
        updated() {
            //vmCommon.DainbLogTimeEnd = Date.now() - vmCommon.DainbLogTimeStart;
            //console.log('DainbLogTime rmViewMixin beforeUpdate => start updated in Second: ', vmCommon.DainbLogTimeEnd / 1000);

            msRoadmapApp.IsUpdatingOnServer = false;
            const lstLblingCollapse = this.$root.LstLabelingIdCollapse;
            if (lstLblingCollapse.length) {
                const list = this.$el.querySelectorAll(`div[lbling-root-id]`);
                for (const rootLbling of list) {
                    rootLbling.classList.add('rmlabeling_toggle_root');
                }
            } else {
                const list = this.$el.querySelectorAll(`.rmlabeling_toggle_root`);
                for (const rootLbling of list) {
                    rootLbling.classList.remove('rmlabeling_toggle_root');
                }
            }
           // console.log('msRoadmap updated')
            const elms = this.$el.querySelectorAll(`.DnbClsObserver`);
            for (const nodeElm of elms) {
                msRoadmapApp.SrollObserver.observe(nodeElm);
                if (nodeElm.previousElementSibling)
                    nodeElm.previousElementSibling.style.maxHeight = `${nodeElm.offsetHeight + 30}px`;
            }

            //vmCommon.DainbLogTimeEnd = Date.now() - vmCommon.DainbLogTimeStart;
            //console.log('DainbLogTime rmViewMixin beforeUpdate => end Updated in Second: ', vmCommon.DainbLogTimeEnd / 1000);
            //console.trace();
        }
    }
    Vue.component('rm-view-month', (resolve) => {
        $.get(__rootFolder__ + `${Tabview}/ViewMonth/RoadmapViewMonth.html`, template => {
            resolve({
                template: template,
                mixins: [rmViewMixin],
                data() {
                    var that = this;
                    return {
                        isOpenNavigator: false,
                        navigatorData: null,
                        gaItem: null,
                        isShowMenu: false,
                        isMainGoal: false,
                        isSubGoal: false,
                        isAction: false,
                        isActivity: false,
                        isShowDepth: that.$root.isShowDepth,
                    };
                },
                inject: ['mountedOnView', 'HoverTooltip', 'onHoverBlockPath'],
                computed: {
                    kLg() {
                        return kLg;
                    },                    
                    ViewWidth() {
                        var w = this.$root.ViewWidth;
                        w += 8;
                        return w;
                    },
                    IsLabeling() {
                        const menuLabaling = this.$root.MenuLabeling;
                        return menuLabaling.IsMain || menuLabaling.IsSub || menuLabaling.IsAction;
                    },
                    StyleWithTimeRangeFromTo() {
                        var _ovflow = this.IsLabeling ? '' : 'hidden'; //this.$root.StyleWithTimeRangeFromTo.overflow;
                        return {
                            overflow: _ovflow
                        }
                    },
                    StyleInPopupPreview() {
                        var $root = this.$root;
                        var overflow;
                        if ($root.DateRange || $root.IsSharepoint) {
                            overflow = 'hidden';
                        }
                        return {
                            overflow: overflow
                        }
                    },
                    HasBlock() { return this.$root.Elements.HasBlock },
                    IsShowPath() { return !this.$root.IsHidePath },
                    StyleInPopupPreviewSharepointRegion() {
                        return StyleInPopupPreviewSharepointRegion(this.$root);
                    },
                },
                mounted() {
                    this.mountedOnView()
                    if (this.$root.IsSharepoint) {
                        this.$root.setHeightView();
                    }
                },
                updated() {
                    var vHeight = this.$el.scrollHeight + 60;
                    if (vHeight < 570) vHeight = 570;
                    this.$root.ViewHeight = vHeight;
                    if (typeof this.$root.reClonePath == 'function') {
                        this.$root.reClonePath();
                    }
                },
                methods: {
                    DestroyTooltip: function (e) {
                        var tt = $(e.target).data("kendoTooltip");
                        if (tt) tt.destroy();
                        //$('.k-animation-container').css('display', 'none');
                    },
                    showPopupEdit: function (item, e) {
                        if (this.$root.IsOpenPopPreview) return;
                        if (this.$root.IsSharepoint) return;
                        if (this.getStyleLabeling(item)) return;
                        if (e.target.classList.contains('pointSortMIndex') ||
                            e.target.classList.contains('pointArangeStart') ||
                            e.target.classList.contains('pointArangeEnd')) {
                            return;
                        }
                        var boardLineId = this.BoardLineId;             // inject
                        var typeId = item.TypeId;
                        var kLg = this.kLg;
                        var title = kLg.titlepEditMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepEditMainGoalNew2;
                        vmGoalAction.currency = {};
                        var info = {
                            CurrencyName: item.CurrencyName,
                            IndependencyId: undefined,
                            IsMasterGoal: false,
                            ProductId: item.OwnerProductId,
                            RegionId: item.RegionId,
                            SubmarketId: item.OwnerSubMarketId,
                            SubMarketProductId: item.SubMarketProductId
                        };
                        var entryData = {
                            independencyId: item.IndependencyId,
                            parentId: undefined,
                            productId: item.OwnerProductId,
                            regionId: item.RegionId || 0,
                            subMarketId: item.OwnerSubMarketId,
                            subMarketProductId: item.SubMarketProductId
                        };

                        switch (typeId) {
                            case vmCommon.RMGoalActionType.MainGoal:
                                entryData.goalId = item.Id;
                                entryData.goalType = typeId;

                                vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                    if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                        var parentId = item.IndependencyId || item.SubMarketProductId
                                        vmGoalAction.goalOptions = {
                                            IsEdit: true,
                                            Goal: serData.value.TheObject,
                                            Url: serData.value.Url,
                                            IndependencyId: item.IndependencyId, ProductId: info.ProductId,
                                            SubmarketId: info.SubmarketId,
                                            PathParentId: parentId ? parentId.toString() : '',
                                            PathParentMdf: item.ParentMdf,
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
                                        vmGoalAction.goalOptions.RegionId = item.RegionId;
                                        vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                        vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                        vmGoalAction.goalOptions.ProductId = info.ProductId;
                                        vmGoalAction.goalOptions.IndependencyId = item.IndependencyId;
                                        vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                        vmGoalAction.goalOptions.SubMarketProductId = item.SubMarketProductId;
                                        vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                        
                                        vmGoalAction.goalOptions.isRedirect = true;
                                        $.extend(vmGoalAction.goalOptions, info);
                                        vmGoalAction.goalOptions.role = serData.value.RoleId;
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
                                        vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                        vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                        vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                        vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, serData.value.RoleId);
                                        vmGoalAction.SelectorId.mainGoal = item.Id;
                                        vmGoalAction.showAddGoalPopup(htmlEscape(title)).then(function (title) {
                                            
                                        }).catch(function (error) {
                                            console.log('something went wrong from boardColumn - edit MainGoal' + error);
                                        });
                                    }
                                });

                                break;
                            case vmCommon.RMGoalActionType.SubGoal:
                                entryData.goalId = item.Id;
                                entryData.parentId = item.ParentId;
                                entryData.goalType = typeId;

                                title = kLg.titlepEditMainGoalNew1 + kLg.labelSubGoalName + kLg.titlepEditMainGoalNew2;

                                vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                    if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                        var parentId = item.ParentId || '';
                                        vmGoalAction.goalOptions = {
                                            IsEdit: true,
                                            Goal: serData.value.TheObject,
                                            Url: serData.value.Url,
                                            ParentId: serData.value.TheObject.ParentId,
                                            IndependencyId: item.IndependencyId, ProductId: info.ProductId,
                                            SubmarketId: info.SubmarketId,
                                            PathParentId: parentId.toString(),
                                            PathParentMdf: item.ParentMdf,
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
                                        vmGoalAction.goalOptions.RegionId = item.RegionId;
                                        vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                        vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                        vmGoalAction.goalOptions.ProductId = info.ProductId;
                                        vmGoalAction.goalOptions.IndependencyId = item.IndependencyId;
                                        vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                        vmGoalAction.goalOptions.SubMarketProductId = item.SubMarketProductId;
                                        vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                        vmGoalAction.goalOptions.isRedirect = true;
                                        $.extend(vmGoalAction.goalOptions, info);
                                        vmGoalAction.goalOptions.role = serData.value.RoleId;
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
                                        vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                        vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                        vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                        vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.SubGoal, serData.value.RoleId);
                                        vmGoalAction.showAddGoalPopup(htmlEscape(title)).then(function (title) {
                                            var parentId = item.ParentId || '';
                                            //var entryData = {
                                            //    Context: 'GetSubGoalFromColumnElementInTeamBoard',
                                            //    ParentId: parentId.toString(),
                                            //    ParentMdf: item.ParentMdf
                                            //};
                                            //msTeamBoard.service.getSycnData(entryData).then(function (res) {
                                            //    vmCommon.checkConflict(res.value.ResultStatus);
                                            //});
                                        }).catch(function (error) {
                                            console.log('something went wrong from boardColumn - edit SubGoal' + error);
                                        });
                                    }
                                });

                                break;
                            case vmCommon.RMGoalActionType.Action:
                                var xxinfo = {
                                    actionId: item.Id,
                                    goalId: item.GoalId,
                                    subMarketProductId: item.SubMarketProductId,
                                    //parentSubMarketProductId: item.getSubmarketProductId(),
                                    independencyId: item.IndependencyId,
                                    
                                    parentId: item.GoalId,
                                    //parentStart: new Date(),
                                    //parentEnd: new Date(),
                                    //endDate: new Date(),
                                    title: item.GoalId === vmCommon.emptyGuid ? kLg.EditActionDisordered1 + kLg.labelActionName + kLg.EditActionDisordered2 : kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,//kLg.titlepEditMainGoalNew1 + (item.GoalId == vmCommon.emptyGuid ? kLg.EditActionDisordered : kLg.titlepEditAction) + kLg.titlepEditMainGoalNew2,
                                    isEdit: true,
                                    pathParentId: item.GoalId || vmCommon.empty,
                                    pathParentMdf: item.ParentMdf,
                                    isDisordered: item.GoalId == vmCommon.emptyGuid
                                };

                                vmGoalAction.openPopUpAction2(xxinfo);
                                
                                break;

                            case vmCommon.RMGoalActionType.Activity:
                                var xxinfo = {
                                    actionId: item.ParentId,
                                    goalId: item.GoalId,
                                    subMarketProductId: item.SubMarketProductId,
                                    //parentSubMarketProductId: item.getSubmarketProductId(),
                                    independencyId: item.IndependencyId,
                                    
                                    parentId: item.GoalId,
                                    //parentStart: new Date(),
                                    //parentEnd: new Date(),
                                    //endDate: new Date(),
                                    title: item.GoalId === vmCommon.emptyGuid ? kLg.EditActionDisordered1 + kLg.labelActionName + kLg.EditActionDisordered2 : kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,//kLg.titlepEditMainGoalNew1 + (item.GoalId == vmCommon.emptyGuid ? kLg.EditActionDisordered : kLg.titlepEditAction) + kLg.titlepEditMainGoalNew2,
                                    isEdit: true,
                                    pathParentId: item.GoalId || vmCommon.empty,
                                    pathParentMdf: item.ParentMdf,
                                    isDisordered: item.GoalId == vmCommon.emptyGuid,
                                    boardLineId: boardLineId
                                };

                                vmGoalAction.openPopUpAction2(xxinfo);

                                break;
                            default:
                                break;
                        }
                    },
                    onHoverTooltip(element, e) {
                        if (vmCommon.IsMouseoverAdjustDate || vmCommon.RoadmapSortMIndexDragging) return;
                        var isPath = this.getStyleLabeling(element) ? true : undefined;
                        this.HoverTooltip(element, e, isPath);
                    },
                    TabMonat: function (e) {
                        if (e.TabMonat) {
                            IsViewQuarter == true;
                        }
                    },
                    
                    getStyle(elements, index, iColumn, iCategory, iChildhoder, iPrarent, iBlock) {
                        const elm = elements[index];
                        var startDate = elm.Start;
                        var endDate = elm.End;
                        const _mnLabeling = this.$root.MenuLabeling;
                        if (_mnLabeling.IsMain || _mnLabeling.IsSub || _mnLabeling.IsAction) {
                            const element = elements.length > 0 ? elements[0] : undefined;

                            const styleLabeling = this.getStyleLabeling(element);
                            if (styleLabeling != undefined) {
                                return styleLabeling;
                            }
                        }

                        if (this.StartDate.getTime() > this.EndDate.getTime()) {
                            return {
                                width: 0, marginLeft: 0, paddingLeft: 0, minWidth: 0
                            }
                        }

                        var marginLeft;
                        if (index == 0) {
                            marginLeft = getDateDiff(this.StartDate, (startDate)) - 1;
                        } else {
                            const element = elements[index - 1];
                            var eD = (element.End);

                            var w = getDateDiff(element.Start, eD);
                            if (w < 8) {        // 1 tuan tinh den cuoi ngay endDate
                                eD = element.Start.getTime() + 7 * 24 * 3600 * 1000;
                                eD = new Date(eD);
                            }
                            marginLeft = getDateDiff(eD, startDate) - 1;
                        }

                        marginLeft = marginLeft * msRoadmap.mUnit;

                        var width, minWidth;
                        if (!endDate) {
                            if (elm.TypeId == 4 && index > 0) {     // activity con thứ 2 trở đi
                                var s = this.getStyle(elements, index - 1, iColumn, iCategory, iChildhoder, iPrarent, iBlock);
                                var w = this.ViewWidth - (parseInt(s.width) + parseInt(s.marginLeft));
                                width = (w - 324 - marginLeft);
                            } else
                                width = (this.ViewWidth + 500);
                        } else {
                            width = getDateDiff(startDate, endDate) - 1;
                            width *= msRoadmap.mUnit;
                        }

                        if (parseFloat(width) < 7 * msRoadmap.mUnit) {
                            width = 7 * msRoadmap.mUnit;
                        }

                        var paddingLeft;
                        if (marginLeft < 0) {
                            paddingLeft = - marginLeft + 5;

                            if (this.TimerangeStart || this.TimerangeEnd) {
                                if (!endDate) {
                                    minWidth = this.ViewWidth - marginLeft;
                                } else {
                                    minWidth = width;
                                }
                            } else {
                                minWidth = width;
                            }
                        } else {
                            minWidth = width;
                            if (this.TimerangeStart) {
                                var paddLeft = getDateDiff(this.StartDate, startDate) - 1;
                                if (paddLeft < 0) {
                                    paddLeft *= msRoadmap.mUnit;
                                    paddingLeft = - paddLeft + 5;
                                }
                            }
                        }
                        if (marginLeft < -54 && paddingLeft > 59) {
                            marginLeft -= 2;
                        }
                        if (this.TimerangeStart && endDate) {
                            const trS00 = new Date(new Date(this.TimerangeStart).toDateString()); // 0h00
                            const e00 = new Date(endDate.toDateString()); // 0h00
                            
                            if ((e00.getTime() - trS00.getTime()) / 3600 / 24000 < 2) {
                                if (!isNaN(paddingLeft)) {
                                    paddingLeft -= 10;
                                }
                            }
                        }
                        //if (marginLeft < -2900 && this.$root.IsOpenPopPreview) {
                        //    width = 2 * Math.abs(marginLeft);
                        //}
                        var rtW;
                        if (!endDate && msRoadmapApp.IsOpenPopPreview) {
                            rtW = '100%';
                        } else {
                            rtW = isNaN(width) ? undefined : `${width}px`;
                        }
                        return {
                            width: rtW,
                            marginLeft: isNaN(marginLeft) ? undefined : marginLeft + 'px',
                            paddingLeft: isNaN(paddingLeft) ? undefined : `${paddingLeft}px`,
                            minWidth: isNaN(minWidth) ? undefined : `${minWidth}px`
                        }
                    },
                    reLoadGoalActionContext: function () {
                        var that = this;
                        if (that.gaItem)
                            that.openNavigator(that.gaItem);
                    },
                    getParentIdWhenLabeling(element) {
                        const lbling = this.$root.MenuLabeling;
                        if (element.TypeId == vmCommon.RMGoalActionType.SubGoal) {
                            if (!lbling.IsSub) {
                                return {
                                    Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                    Class: 'hline-elm'
                                };
                            }
                            return { Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId };
                        }
                        if (element.TypeId == vmCommon.RMGoalActionType.Action) {
                            var maingoalId = element.MaingoalId;
                            if (!lbling.IsAction) {
                                return {
                                    Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                    Class: 'hline-elm', MainGoalId: maingoalId
                                };
                            }
                            return { Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId, MainGoalId: maingoalId };
                        }
                        if (element.TypeId == vmCommon.RMGoalActionType.Activity) {
                            return {
                                Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                Class: 'hline-elm', MainGoalId: element.MaingoalId, SubgoalId: element.SubGoalId
                            };
                        }
                        return { Id: element.Id, TypeId: element.TypeId, ParentId: element.ParentId };
                    },
                    MenuFilterdepth: function (e) {
                        var menu = $(e.currentTarget).next("div.Roadmapviewquater-menufilterdepth");
                        $(menu).css({
                            "left": $(e.currentTarget).offset().left < 310 ? "10px" : "0px", "min-width": "198px"
                        });
                        this.isShowMenu = !this.isShowMenu;
                    },
                    openNavigator: function (item) {
                        if (this.$root.IsSharepoint) return;
                        if (this.$root.IsOpenPopPreview) return;
                        if (this.getStyleLabeling(item)) return;
                        var that = this;
                        that.gaItem = item;

                        //todo: get goalactioncontext
                        var entryData = {};
                        if (item.TypeId == 4) //action
                        {
                            entryData.GoalActionId = item.ParentId;
                            entryData.GoalActionTypeId = 3;
                        } else {
                            entryData.GoalActionId = item.Id;
                            entryData.GoalActionTypeId = item.TypeId;
                        }

                        vmGoalAction.dataservice.getGoalActionDataContext(entryData, function (res) {
                            if (res.value) {
                                that.isOpenNavigator = true;
                                that.navigatorData = res.value;
                            }
                        });
                    },
                    closeNavigator: function () {
                        this.isOpenNavigator = false;
                        this.gaItem = null;
                    },
                    getStyleLabeling(element) {
                        var style = undefined;
                        if (!element) return style;
                        if (!element.TypeId) return style;
                        const mL = this.$root.MenuLabeling;

                        if (mL.IsMain && element.TypeId < vmCommon.RMGoalActionType.SubGoal ||
                            mL.IsSub && element.TypeId < vmCommon.RMGoalActionType.Action ||
                            mL.IsAction && element.TypeId < vmCommon.RMGoalActionType.Activity) {

                            style = { marginLeft: '-307px', width: '300px', paddingLeft: '3px' };
                        }
                        return style;
                    },
                    getBgColor(element) {
                        const style = this.getStyleLabeling(element);
                        if (style == undefined) {
                            return element.Color;
                        }
                        return 'transparent';
                    },
                    getColor(element) {
                        const style = this.getStyleLabeling(element);
                        if (style == undefined) {
                            return '';
                        }
                        return '#989898';
                    },
                    getIcon(element) {
                        var icon = '';
                        const typeId = element.TypeId;
                        const _prefix = 'rm-icon-';
                        if (typeId < vmCommon.RMGoalActionType.SubGoal) icon = `${_prefix}maingoal`;
                        else if (typeId < vmCommon.RMGoalActionType.Action) icon = `${_prefix}subgoal`;
                        else if (typeId < vmCommon.RMGoalActionType.Activity) icon = `${_prefix}action`;
                        else icon = `${_prefix}activity`;
                        const style = this.getStyleLabeling(element);
                        if (style != undefined) {
                            icon += ' rm-icon-labeling';
                        }
                        return icon;
                    },
                    getIconToggle(element) {
                       // return getIconToggle_(element, this.$root);
                        return this.$root.getIconToggle(element);
                    },
                    getClassName(e) { return this.$root.getClassName(e) },
                    getFontLabeling(element) {
                        return this.$root.getFontLabeling(element);
                        
                    },
                    getStyleChildStakeholder(childStk) {
                        const menuLabaling = this.$root.MenuLabeling;
                        if (menuLabaling.IsMain || menuLabaling.IsSub || menuLabaling.IsAction) {
                            return {
                                maxHPath: '38px', maxHName: '19px', overflow: 'hidden'
                            }
                        }

                        return {
                           maxHPath: childStk.PathMaxHeight
                        }
                    },
                    getStyleHLine(element, i) {
                        var elm = this.getStyleLabeling(element);
                        if (elm == undefined) return {display: 'none'};
                        return {
                            width: '300px',
                            marginLeft: '-308px', height: '1px', backgroundColor: 'white'
                        };
                    },
                    getLabelingRef(element) {
                        var elm = this.getStyleLabeling(element);
                        if (elm) {
                            return 'elementLabelings'
                        }
                        return 'elements'
                    },
                    getAttrsLabeling(elements) {
                        var element = elements.length > 0 ? elements[0] : undefined;
                        const typeId = !element ? -1 : element.TypeId;
                        var freezedId = element.Id;
                        element = this.getStyleLabeling(element);
                        var cls = '';
                        if (this.IsLabeling) {
                            cls = 'rm-msa-labeling';
                            if (typeId == vmCommon.RMGoalActionType.MainGoal) cls += ' rm_labeling_maingoal';
                            else if (typeId == vmCommon.RMGoalActionType.SubGoal) cls += ' rm-labeling-subgoal';
                            else if (typeId == vmCommon.RMGoalActionType.Action) cls += ' rm-labeling-action';

                        } else freezedId = undefined;

                        var styl = { overflow: 'hidden' };
                        if (!element) {
                            cls = '';
                            styleActivities();
                            return { Class: cls, Style: styl }
                        }
                        styl = this.StyleWithTimeRangeFromTo;
                        styleActivities();
                        return {
                            Class: cls, Style: styl, FreezedId: freezedId
                        }
                        function styleActivities() {
                            if (typeId == vmCommon.RMGoalActionType.Activity && elements.length > 2) {
                                styl.display = 'flex';
                            }
                        }
                    },
                    onToggleLabelingFromPath(target, element) {
                        this.checkLabelingCollapse(element)
                        onToggleLabelingFromPath(target, element, this.$root);
                    },
                }
            });
        });
    });

    function getYearMonthWeek($root, startEnd) {
        var startWeek = startEnd.WeekS;
        var endWeek = startEnd.WeekE;

        var startDate = new Date(startEnd.Start);
        var endDate = new Date(startEnd.End);

        if (startDate.getTime() > endDate.getTime()) {
            return {
                SumWeek: 0,
                Years: [],
                Months: [],
                Weeks: [],
                Width: 0
            }
        }

        var startYear = startDate.getFullYear();
        var endYear = endDate.getFullYear();
        var preWeek = kLg.language == 'de' || kLg.language == 'pm' ? 'KW' : 'CW';
        var years = [];
        var months = [];
        var weeks = [];
        var startMonth = startDate.getMonth() + 1;
        var endMonth = endDate.getMonth() + 1;
        var sumWeek = (endDate.getTime() - startDate.getTime()) / (24 * 3600000);
        sumWeek = Math.ceil(sumWeek / 7);

        for (let y = startYear; y <= endYear; y++) {
            let yearObj = { FullYear: y };
            let daysInYear = 0;

            let sM = y == startYear ? startMonth : 1;
            let eM = y == endYear ? endMonth : 12;

            for (let m = sM; m <= eM; m++) {
                let daysInMonth = new Date(y, m, 0).getTime() - new Date(y, m - 1, 1).getTime();        // du thang

                if (y == startYear && m == startMonth) {
                    daysInMonth = new Date(y, m, 0).getTime() - new Date(y, m - 1, startDate.getDate()).getTime();   // thang dau
                }

                if (y == endYear && m == endMonth) {
                    daysInMonth = new Date(y, m - 1, endDate.getDate()).getTime() - new Date(y, m - 1, 1).getTime(); // thang cuoi
                }

                if (startMonth == endMonth) {
                    if (sumWeek == 0 || sumWeek == 1) daysInMonth = 6 * 24 * 3600000;
                    if (sumWeek == 2) daysInMonth = 12 * 24 * 3600000;
                    if (sumWeek == 3) daysInMonth = 18 * 24 * 3600000;
                }

                daysInMonth /= 24 * 3600000;
                daysInMonth += 1;

                daysInYear += daysInMonth;

                months.push({
                    Name: m.toMonthString(),
                    Width: daysInMonth * msRoadmap.mUnit + 'px'
                });
            };
            let sW = y == startYear ? startWeek : 1;
            let eW = y == endYear ? endWeek : getLastWeekOfYear(y);     // getLastWeekOfYear(y) is 52 or 53

            let weeksInYear = [];

            if (y == startYear && startWeek == 1 && startMonth == 12) {
                eW = sW - 1;  // neu tuan 1 cua nam y + 1 thi khong cho chay vong for
            }

            if (weeks.length < sumWeek) {
                if (sumWeek < 52 && sumWeek <= eW && sW == 1 && eW != sW) {
                    eW = endWeek;
                }

                for (let w = sW; w <= eW; w++) {
                    weeksInYear.push(`${preWeek} ${w}`);
                };

                weeks = weeks.concat(weeksInYear);
            }
            if (y == endYear && weeks.length >= sumWeek && sumWeek == 1 && daysInYear > 7) {
                daysInYear = 7;
            }
            // push to compute flex-grow
            yearObj.FlexGrow = daysInYear * msRoadmap.mUnit;

            years.push(yearObj);
        }

        // computed to bind style flex-grow
        if (weeks.length < 1) {
            for (let wI = 1; wI < 27; wI++) {
                weeks.push(`${preWeek} ${wI}`);
            }
        } else if (weeks.length == 1) {
            var fY, fM;
            if ($root.TimeRangeFrom) {
                fY = new Date($root.TimeRangeFrom).getFullYear();
                fM = new Date($root.TimeRangeFrom).getMonth() + 1;
            }
            if ($root.TimeRangeTo) {
                fY = new Date($root.TimeRangeTo).getFullYear();
                fM = new Date($root.TimeRangeTo).getMonth() + 1;
            }
            if (!fY) {
                fY = startYear;
            }
            years = years.filter(y => {
                return y.FullYear == fY;
            });

            months.filter(m => {
                if (fM)
                    return m.Name == fM.toMonthString();
                else
                    return true;
            });
        }
        months.forEach(m => {
            if (parseFloat(m.Width) < 55) {
                m.Name = m.Name.slice(0, 3);
            }
        });

        function getLastWeekOfYear(y) {
            var lastD = new Date(y, 12, 0);
            var w = $root.getWeekObject(lastD);
            if (w.Number == 1) {
                lastD = w.FromDate;
                lastD = lastD.getTime() - 48 * 3600 * 1000;     // move forward 2 days
                w = $root.getWeekObject(new Date(lastD));
            }
            return w.Number;
        }
        // compute ViewWidth
        var viewWidth = weeks.length * 63;

        if (sumWeek < 1 && weeks.length > 0) {
            weeks = [weeks[0]];
        }

        if (sumWeek < 0) {
            weeks = []; months = []; years = [];
        }

        return {
            SumWeek: sumWeek,
            Years: years,
            Months: months,
            Weeks: weeks,
            Width: viewWidth
        }
    }
    Vue.component('rm-month-calendar', (resolve) => {
        $.get(__rootFolder__ + `${Tabview}/ViewMonth/RoadmapCalendarMonth.html`, template => {
            resolve({
                template: template,
                props: ['StartEnd', 'TimerangeStart', 'TimerangeEnd'],
                inject: ['getDateLine'],
                computed: {
                    DisplayUI() {
                        var ymw = getYearMonthWeek(this.$root, this.StartEnd);

                        return {
                            SumWeek: ymw.SumWeek,
                            Years: ymw.Years,
                            Months: ymw.Months,
                            Weeks: ymw.Weeks,
                            ViewWidth: ymw.Width + 'px'
                        }
                    },
                    ViewHeight() {
                        return (this.$root.ViewHeight + 57) + 'px';
                    },
                    WeekHeight() {
                        return (this.$root.ViewHeight - 13) + 'px';
                    },
                    StylePosition() {
                        let isHidePath = this.$root.IsHidePath;

                        return {
                            Left: isHidePath ? '0' : '316px'
                        }
                    },
                    TodayLine() {
                        var today = this.getDateLine();
                        var start = new Date(this.StartEnd.Start);
                        var end = new Date(this.StartEnd.End);
                        var isShow = vmCommon.compareDate2(today, start) >= 0 && vmCommon.compareDate2(today, end) <= 0;
                        var style = { display: 'none' };
                        if (isShow) {
                            style.display = "block";
                            var days = today.getTime() - start.getTime();
                            days = days / (3600 * 24 * 1000);
                            style.marginLeft = (days * msRoadmap.mUnit - 4) + "px";
                        }
                        return style;

                        //var nextDay = today; // new Date(+this.$parent.DateLine);
                        //nextDay.setDate(nextDay.getDate() + 1);     // Tăng date 1 ngày
                        //var style = { display: 'none'};
                        //var start = new Date(this.$parent.ViewMonth.Start);
                        //var end = new Date(this.$parent.ViewMonth.End);
                        //var isShow = vmCommon.compareDate2(today, start) >= 0 && vmCommon.compareDate2(today, end) <= 0;
                        //if (isShow) {
                        //    var getWeek = function (date) {
                        //        function moveBackMon(date) {
                        //            let day = date.getDay();
                        //            if (kLg.language == "de" || kLg.language == "pm") {
                        //                day -= 1;
                        //                if (day < 0) day = 6;
                        //            }
                        //            let deltaMiliS = day * 24 * 3600000;
                        //            let firstDinWeek = date.getTime() - deltaMiliS;
                        //            return new Date(firstDinWeek);
                        //        };
                        //        function getNumOfWeek(date) {
                        //            let year = date.getFullYear();
                        //            let firstDateY = new Date(year, 0, 1);
                        //            let deltaTime = date.getTime() - firstDateY.getTime();
                        //            deltaTime = deltaTime / 24 / 60 / 60 / 1000;
                        //            return Math.floor(deltaTime / 7);
                        //        };
                        //        let fromDate = moveBackMon(date);
                        //        let midDInW = new Date(fromDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                        //        return getNumOfWeek(midDInW) + 1;
                        //    };
                        //    style.display = "block";
                        //    var isWeekend = getWeek(today) != getWeek(nextDay);
                        //    style.marginLeft = ((start.days(today) * msRoadmap.mUnit) + (isWeekend ? msRoadmap.mUnit - 2 : 0)) + "px";
                        //}
                        //return style;
                    }
                },
                updated() {
                    this.$root.updateViewWidth();
                },
                mounted() {
                    this.$root.updateViewWidth();
                },
            });
        });
    });

    Vue.component('rm-view-quarter', (resolve) => {
        $.get(__rootFolder__ + `${Tabview}/ViewQuarter/RoadmapViewQuarter.html`, template => {
            resolve({
                template: template,
                mixins: [rmViewMixin],
                data() {
                    var that = this;
                    return {
                        isOpenNavigator: false,
                        navigatorData: null,
                        gaItem: null,
                        isShowMenu: false,
                        isMainGoal: false,
                        isSubGoal: false,
                        isAction: false,
                        isActivity: false,
                        isShowDepth: that.$root.isShowDepth,
                    };
                },
                inject: ['mountedOnView', 'HoverTooltip', 'onHoverBlockPath'],
                computed: {
                    kLg() { return kLg; },
                    IsLabeling() {
                        const menuLabaling = this.$root.MenuLabeling;
                        return menuLabaling.IsMain || menuLabaling.IsSub || menuLabaling.IsAction;
                    },
                    StyleWithTimeRangeFromTo() {
                        var _ovflow = this.IsLabeling ? '' : 'hidden';
                        return { overflow: _ovflow }
                    },
                    StyleInPopupPreview() {
                        var $root = this.$root;
                        var overflow;
                        if ($root.DateRange || $root.IsSharepoint) {
                            overflow = 'hidden';
                        }
                        return {
                            overflow: overflow
                        }
                    },
                    ViewWidth() {
                        var w = this.$root.ViewWidth;
                        return w;
                    },
                    HasBlock() { return this.$root.Elements.HasBlock },
                    IsShowPath() { return !this.$root.IsHidePath },
                    StyleInPopupPreviewSharepointRegion() {
                        return StyleInPopupPreviewSharepointRegion(this.$root);
                    },
                },
                mounted() {
                    this.mountedOnView();
                    if (this.$root.IsSharepoint) {
                        this.$root.setHeightView();
                    }
                },
                updated() {
                    var vHeight = this.$el.scrollHeight + 60;
                    const fBlock = document.querySelector('.div-info-measuresplan');
                    var filterHeight = fBlock ? fBlock.offsetHeight + 36 : 36;
                    const bodyC = document.querySelector('.body-content');
                    var bodyHeight = bodyC ? bodyC.offsetHeight - 83 : 570 + 36;
                    if (vHeight < bodyHeight - filterHeight) vHeight = bodyHeight - filterHeight; - 90;
                    this.$root.ViewHeight = vHeight;
                    if (typeof this.$root.reClonePath == 'function') {
                        this.$root.reClonePath();
                    }
                },
                methods: {
                    DestroyTooltip: function (e) {
                        var tt = $(e.target).data("kendoTooltip");
                        if (tt) tt.destroy();

                        //$('.k-animation-container').css('display', 'none');
                    },
                    showPopupEdit: function (item, e) {
                        if (this.$root.IsOpenPopPreview) return;
                        if (this.$root.IsSharepoint) return;
                        if (this.getStyleLabeling(item)) return;
                        if (e.target.classList.contains('pointSortMIndex') ||
                            e.target.classList.contains('pointArangeStart') ||
                            e.target.classList.contains('pointArangeEnd')) {
                            return;
                        }
                        var typeId = item.TypeId;
                        var kLg = this.kLg;
                        var title = kLg.titlepEditMainGoalNew1 + kLg.labelMainGoalName + kLg.titlepEditMainGoalNew2;
                        vmGoalAction.currency = {};
                        var info = {
                            CurrencyName: item.CurrencyName,
                            IndependencyId: undefined,
                            IsMasterGoal: false,
                            ProductId: item.OwnerProductId,
                            RegionId: item.RegionId,
                            SubmarketId: item.OwnerSubMarketId,
                            SubMarketProductId: item.SubMarketProductId
                        };
                        var entryData = {
                            independencyId: item.IndependencyId,
                            parentId: undefined,
                            productId: item.OwnerProductId,
                            regionId: item.RegionId || 0,
                            subMarketId: item.OwnerSubMarketId,
                            subMarketProductId: item.SubMarketProductId
                        };

                        switch (typeId) {

                            case vmCommon.RMGoalActionType.MainGoal:
                                entryData.goalId = item.Id;
                                entryData.goalType = typeId;

                                vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                    if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                        var parentId = item.IndependencyId || item.SubMarketProductId
                                        vmGoalAction.goalOptions = {
                                            IsEdit: true,
                                            Goal: serData.value.TheObject,
                                            Url: serData.value.Url,
                                            IndependencyId: item.IndependencyId, ProductId: info.ProductId,
                                            SubmarketId: info.SubmarketId,
                                            PathParentId: parentId ? parentId.toString() : '',
                                            PathParentMdf: item.ParentMdf,
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
                                        vmGoalAction.goalOptions.RegionId = item.RegionId;
                                        vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                        vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                        vmGoalAction.goalOptions.ProductId = info.ProductId;
                                        vmGoalAction.goalOptions.IndependencyId = item.IndependencyId;
                                        vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                        vmGoalAction.goalOptions.SubMarketProductId = item.SubMarketProductId;
                                        vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                        vmGoalAction.goalOptions.isRedirect = true;
                                        $.extend(vmGoalAction.goalOptions, info);
                                        vmGoalAction.goalOptions.role = serData.value.RoleId;
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.MainGoal;
                                        vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                        vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                        vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                        vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.Goal, serData.value.RoleId);
                                        vmGoalAction.SelectorId.mainGoal = item.Id;
                                        vmGoalAction.showAddGoalPopup(htmlEscape(title)).then(function (title) {
                                            var parentId = item.IndependencyId || item.SubMarketProductId;
                                            //var entryData = {
                                            //    Context: 'GetMainGoalFromColumnElementInTeamBoard',
                                            //    ParentId: parentId ? parentId.toString() : '',
                                            //    ParentMdf: item.ParentMdf
                                            //};
                                            //msTeamBoard.service.getSycnData(entryData).then(function (res) {
                                            //    vmCommon.checkConflict(res.value.ResultStatus);
                                            //});
                                        }).catch(function (error) {
                                            console.log('something went wrong from boardColumn - edit MainGoal' + error);
                                        });
                                    }
                                });

                                break;
                            case vmCommon.RMGoalActionType.SubGoal:
                                entryData.goalId = item.Id;
                                entryData.parentId = item.ParentId;
                                entryData.goalType = typeId;

                                title = kLg.titlepEditMainGoalNew1 + kLg.labelSubGoalName + kLg.titlepEditMainGoalNew2;

                                vmGoalAction.dataservice.getGoal(entryData, function (serData) {
                                    if (vmCommon.checkConflict(serData.value.ResultStatus)) {
                                        var parentId = item.ParentId || '';
                                        vmGoalAction.goalOptions = {
                                            IsEdit: true,
                                            Goal: serData.value.TheObject,
                                            Url: serData.value.Url,
                                            ParentId: serData.value.TheObject.ParentId,
                                            IndependencyId: item.IndependencyId, ProductId: info.ProductId,
                                            SubmarketId: info.SubmarketId,
                                            PathParentId: parentId.toString(),
                                            PathParentMdf: item.ParentMdf,
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
                                        vmGoalAction.goalOptions.RegionId = item.RegionId;
                                        vmGoalAction.goalOptions.DefaultKpi = serData.value.DefaultKpi;
                                        vmGoalAction.goalOptions.HasMasterGoal = serData.value.HasMasterGoal;
                                        vmGoalAction.goalOptions.ProductId = info.ProductId;
                                        vmGoalAction.goalOptions.IndependencyId = item.IndependencyId;
                                        vmGoalAction.goalOptions.SubmarketId = info.SubmarketId;
                                        vmGoalAction.goalOptions.SubMarketProductId = item.SubMarketProductId;
                                        vmGoalAction.goalOptions.TypeId = entryData.goalType;
                                        vmGoalAction.goalOptions.isRedirect = true;
                                        $.extend(vmGoalAction.goalOptions, info);
                                        vmGoalAction.goalOptions.role = serData.value.RoleId;
                                        vmGoalAction.goalOptions.GoalType = vmCommon.GoalType.SubGoal;
                                        vmGoalAction.goalOptions.SubProductGroups = serData.value.SubProductGroups;
                                        vmGoalAction.goalOptions.SubClientGroups = serData.value.SubClientGroups;
                                        vmGoalAction.goalOptions.IsHasKpiReport = serData.value.IsHasKpiReport;
                                        vmFile.setAssignedU(entryData.goalId, vmCommon.enumType.SubGoal, serData.value.RoleId);
                                        vmGoalAction.showAddGoalPopup(htmlEscape(title)).then(function (title) {
                                          //  var parentId = item.ParentId || '';
                                            //var entryData = {
                                            //    Context: 'GetSubGoalFromColumnElementInTeamBoard',
                                            //    ParentId: parentId.toString(),
                                            //    ParentMdf: item.ParentMdf
                                            //};
                                            //msTeamBoard.service.getSycnData(entryData).then(function (res) {
                                            //    vmCommon.checkConflict(res.value.ResultStatus);
                                            //});
                                        }).catch(function (error) {
                                            console.log('something went wrong from boardColumn - edit SubGoal' + error);
                                        });
                                    }
                                });

                                break;
                            case vmCommon.RMGoalActionType.Action:
                                var xxinfo = {
                                    actionId: item.Id,
                                    //goalId: item.GoalId,
                                    subMarketProductId: item.SubMarketProductId,
                                    //parentSubMarketProductId: item.getSubmarketProductId(),
                                    independencyId: item.IndependencyId,
                                    
                                    parentId: item.GoalId,
                                    //parentStart: new Date(),
                                    //parentEnd: new Date(),
                                    //endDate: new Date(),
                                    title: item.GoalId === vmCommon.emptyGuid ? kLg.EditActionDisordered1 + kLg.labelActionName + kLg.EditActionDisordered2 : kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,//kLg.titlepEditMainGoalNew1 + (item.GoalId == vmCommon.emptyGuid ? kLg.EditActionDisordered : kLg.titlepEditAction) + kLg.titlepEditMainGoalNew2,
                                    isEdit: true,
                                    pathParentId: item.GoalId || vmCommon.empty,
                                    pathParentMdf: item.ParentMdf,
                                    isDisordered: item.GoalId == vmCommon.emptyGuid
                                };

                                vmGoalAction.openPopUpAction2(xxinfo);
                                
                                break;

                            case vmCommon.RMGoalActionType.Activity:
                                var xxinfo = {
                                    actionId: item.ParentId,
                                    //goalId: item.GoalId,
                                    subMarketProductId: item.SubMarketProductId,
                                    //parentSubMarketProductId: item.getSubmarketProductId(),
                                    independencyId: item.IndependencyId,
                                    
                                    parentId: item.GoalId,
                                    //parentStart: new Date(),
                                    //parentEnd: new Date(),
                                    //endDate: new Date(),
                                    title: item.GoalId === vmCommon.emptyGuid ? kLg.EditActionDisordered1 + kLg.labelActionName + kLg.EditActionDisordered2 : kLg.titlepEditMainGoalNew1 + kLg.labelActionName + kLg.titlepEditMainGoalNew2,//kLg.titlepEditMainGoalNew1 + (item.GoalId == vmCommon.emptyGuid ? kLg.EditActionDisordered : kLg.titlepEditAction) + kLg.titlepEditMainGoalNew2,
                                    isEdit: true,
                                    pathParentId: item.GoalId || vmCommon.empty,
                                    pathParentMdf: item.ParentMdf,
                                    isDisordered: item.GoalId == vmCommon.emptyGuid
                                };

                                vmGoalAction.openPopUpAction2(xxinfo);
                                
                                break;
                            default:
                                break;
                        }
                    },
                    onHoverTooltip(element, e) {
                        if (vmCommon.IsMouseoverAdjustDate || vmCommon.RoadmapSortMIndexDragging) return;
                        var isPath = this.getStyleLabeling(element) ? true : undefined;
                        this.HoverTooltip(element, e, isPath);
                    },
                    HoverWithTimeRFrom(e, element) {
                        var $elm = $(e.target);
                        
                        $elm = $elm.next();
                        if ($elm.width() < 1) {
                            this.HoverTooltip(element, e);
                        }                        
                    },
                    
                    getStyle(elements, index, iColumn, iCategory, iChildhoder, iPrarent, iBlock) {
                        const elm = elements[index];
                        var startDate = elm.Start;
                        var endDate = elm.End;
                        const _mnLabeling = this.$root.MenuLabeling;
                        if (_mnLabeling.IsMain || _mnLabeling.IsSub || _mnLabeling.IsAction) {
                            const element = elements.length > 0 ? elements[0] : undefined;

                            const styleLabeling = this.getStyleLabeling(element);
                            if (styleLabeling != undefined) {
                                return styleLabeling;
                            }
                        }

                        if (this.StartDate.getTime() > this.EndDate.getTime()) {
                            return { width: 0, marginLeft: '0', paddingLeft: 0, minWidth: 0 }
                        }

                        var marginLeft;
                        if (index == 0) {
                            marginLeft = getDateDiff(this.StartDate, startDate) - 1;
                        } else {
                            var element = elements[index - 1];

                            var eD = (element.End)
                            var w = getDateDiff(element.Start, eD);
                            if (w < 8) {
                                eD = element.Start.getTime() + 7 * 24 * 3600 * 1000;
                                eD = new Date(eD);
                            }

                            marginLeft = getDateDiff(eD, startDate) - 1;
                        }
                        marginLeft = marginLeft * msRoadmap.qUnit;
                        
                        var width, minWidth;
                        if (!endDate) {
                            if (elm.TypeId == 4 && index > 0) {     // activity con thứ 2 trở đi
                                var s = this.getStyle(elements, index - 1, iColumn, iCategory, iChildhoder, iPrarent, iBlock);
                                var w = this.ViewWidth - (parseInt(s.width) + parseInt(s.marginLeft));
                                width = (w - 317 - marginLeft);
                            } else
                                width = (this.ViewWidth + 300);
                        } else {
                            width = getDateDiff(startDate, endDate) - 1;
                            width *= msRoadmap.qUnit;
                        }

                        if (width < 7 * msRoadmap.qUnit) {
                            width = (7 * msRoadmap.qUnit);
                        }

                        var paddingLeft;
                        if (marginLeft < 0) {
                            paddingLeft = - marginLeft + 5;
                            if (this.TimerangeStart || this.TimerangeEnd) {
                                if (!endDate) {
                                    minWidth = this.ViewWidth - marginLeft;
                                } else {
                                    minWidth = width;
                                }
                            } else {
                                minWidth = width;
                            }
                        } else {
                            minWidth = width;
                            if (this.TimerangeStart) {
                                var paddLeft = getDateDiff(this.StartDate, startDate) - 1;
                                if (paddLeft < 0) {
                                    paddLeft *= msRoadmap.qUnit;
                                    paddingLeft = - paddLeft + 5;
                                }
                            }
                        }                        
                        if (this.TimerangeStart && endDate) {
                            const trS00 = new Date(new Date(this.TimerangeStart).toDateString()); // 0h00
                            const e00 = new Date(endDate.toDateString()); // 0h00
                            
                            if ((e00.getTime() - trS00.getTime()) / 3600 / 24000 < 2) {
                                if (!isNaN(paddingLeft)) {
                                    paddingLeft -= 10;
                                }
                            }
                        }
                        //if (marginLeft < -2000 && this.$root.IsOpenPopPreview) {
                        //    width = 2 * Math.abs(marginLeft);
                        //}
                        var rtW;
                        if (!endDate && msRoadmapApp.IsOpenPopPreview) {
                            rtW = '100%';
                        } else {
                            rtW = isNaN(width) ? undefined : `${width}px`;
                        }
                        return {
                            width: rtW,
                            marginLeft: isNaN(marginLeft) ? undefined : marginLeft + 'px',
                            paddingLeft: isNaN(paddingLeft) ? undefined : `${paddingLeft}px`,
                            minWidth: isNaN(minWidth) ? undefined : `${minWidth}px`
                        }
                    },
                    reLoadGoalActionContext: function () {
                        var that = this;
                        if (that.gaItem)
                            that.openNavigator(that.gaItem);
                    },
                    getParentIdWhenLabeling(element) {
                        const lbling = this.$root.MenuLabeling;
                        if (element.TypeId == vmCommon.RMGoalActionType.SubGoal) {
                            if (!lbling.IsSub) {
                                return {
                                    Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                    Class: 'hline-elm'
                                };
                            }
                            return { Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId };
                        }
                        if (element.TypeId == vmCommon.RMGoalActionType.Action) {
                            var maingoalId = element.MaingoalId;
                            if (!lbling.IsAction) {
                                return {
                                    Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                    Class: 'hline-elm', MainGoalId: maingoalId
                                };
                            }
                            return { Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId, MainGoalId: maingoalId };
                        }
                        if (element.TypeId == vmCommon.RMGoalActionType.Activity) {
                            return {
                                Id: element.Id, ParentId: element.ParentId, TypeId: element.TypeId,
                                Class: 'hline-elm', MainGoalId: element.MaingoalId, SubgoalId: element.SubGoalId
                            };
                        }
                        return { Id: element.Id, TypeId: element.TypeId, ParentId: element.ParentId };
                    },
                    MenuFilterdepth: function (e) {
                        var menu = $(e.currentTarget).next("div.Roadmapviewquater-menufilterdepth");
                        $(menu).css({
                            "left": $(e.currentTarget).offset().left < 310 ? "10px" : "0px", "min-width": "198px"
                        });
                        this.isShowMenu = !this.isShowMenu;
                    },
                    openNavigator: function (item) {
                        if (this.$root.IsOpenPopPreview) return;
                        if (this.$root.IsSharepoint) return;
                        if (this.getStyleLabeling(item)) return;
                        var that = this;
                        that.gaItem = item;

                        //todo: get goalactioncontext
                        var entryData = {};
                        if (item.TypeId == 4) //action
                        {
                            entryData.GoalActionId = item.ParentId;
                            entryData.GoalActionTypeId = 3;
                        } else {
                            entryData.GoalActionId = item.Id;
                            entryData.GoalActionTypeId = item.TypeId;
                        }

                        vmGoalAction.dataservice.getGoalActionDataContext(entryData, function (res) {
                            if (res.value) {
                                that.isOpenNavigator = true;
                                that.navigatorData = res.value;
                            }
                        });
                    },
                    closeNavigator: function () {
                        this.isOpenNavigator = false;
                        this.gaItem = null;
                    },
                    getStyleLabeling(element) {            // rm-view-quarter
                        var style = undefined;
                        if (!element) return style;
                        if (!element.TypeId) return style;
                        const mL = this.$root.MenuLabeling;

                        if (mL.IsMain && element.TypeId < vmCommon.RMGoalActionType.SubGoal ||
                            mL.IsSub && element.TypeId < vmCommon.RMGoalActionType.Action ||
                            mL.IsAction && element.TypeId < vmCommon.RMGoalActionType.Activity) {

                            style = { marginLeft: '-308px', width: '300px', paddingLeft: '3px' };
                        }
                        return style;
                    },
                    getAttrsLabeling(elements) {            // rm-view-quarter
                        var ele = elements.length > 0 ? elements[0] : undefined;
                        const typeId = !ele ? -1 : ele.TypeId;
                        var freezedId = ele.Id;
                        var element = this.getStyleLabeling(ele);
                        var cls = '';
                        if (this.IsLabeling) {
                            cls = 'rm-msa-labeling';
                            if (typeId == vmCommon.RMGoalActionType.MainGoal) cls += ' rm_labeling_maingoal';
                            else if (typeId == vmCommon.RMGoalActionType.SubGoal) cls += ' rm-labeling-subgoal';
                            else if (typeId == vmCommon.RMGoalActionType.Action) cls += ' rm-labeling-action';
                        } else freezedId = undefined;

                        var styl = { overflow: 'hidden' };
                        if (!element) {
                            cls = '';
                            styleActivities();
                            return { Class: cls, Style: styl }
                        }
                        styl = this.StyleWithTimeRangeFromTo;
                        styleActivities();
                        return {
                            Class: cls, Style: styl, FreezedId: freezedId
                        }
                        function styleActivities() {
                            if (typeId == vmCommon.RMGoalActionType.Activity && elements.length > 2) {
                                styl.display = 'flex';
                            }
                        }
                    },
                    getStyleHLine(element, i) {
                        var elm = this.getStyleLabeling(element);
                        if (elm == undefined) return { display: 'none' };
                        return {
                            width: '300px',
                            marginLeft: '-308px', height: '1px', backgroundColor: 'white'
                        };
                    },
                    getBgColor(element) {
                        const style = this.getStyleLabeling(element);
                        if (style == undefined) {
                            return element.Color;
                        }
                        return 'transparent';
                    },
                    getColor(element) {
                        const style = this.getStyleLabeling(element);
                        if (style == undefined) {
                            return '';
                        }
                        return '#989898';
                    },
                    getIcon(element) {                        
                        var icon = '';
                        const typeId = element.TypeId;
                        const _prefix = 'rm-icon-';
                        if (typeId < vmCommon.RMGoalActionType.SubGoal) icon = `${_prefix}maingoal`;
                        else if (typeId < vmCommon.RMGoalActionType.Action) icon = `${_prefix}subgoal`;
                        else if (typeId < vmCommon.RMGoalActionType.Activity) icon = `${_prefix}action`;
                        else icon = `${_prefix}activity`;
                        const style = this.getStyleLabeling(element);
                        if (style != undefined) {
                            icon += ' rm-icon-labeling';
                        }
                        return icon;
                    },
                    getIconToggle(element) {
                       // return getIconToggle_(element, this.$root);
                        return this.$root.getIconToggle(element);
                    },
                    getClassName(e) { return this.$root.getClassName(e) },
                    getFontLabeling(element) {
                        return this.$root.getFontLabeling(element);
                    },
                    getStyleChildStakeholder(childStk) {
                        const menuLabaling = this.$root.MenuLabeling;
                        if (menuLabaling.IsMain || menuLabaling.IsSub || menuLabaling.IsAction) {
                            return {
                                maxHPath: '38px', maxHName: '19px', overflow: 'hidden'
                            }
                        }
                        return {
                            maxHPath: childStk.PathMaxHeight
                        }
                    },
                    onToggleLabelingFromPath(target, element) {
                        this.checkLabelingCollapse(element)
                        onToggleLabelingFromPath(target, element, this.$root);
                    },
                }
            });
        });
    });

    function getYearQuarterMonth(StartEnd) {
        var years = [];
        var startDate = new Date(StartEnd.Start);
        var endDate = new Date(StartEnd.End);

        var startMonth = startDate.getMonth() + 1;
        var startYear = startDate.getFullYear();

        var endMonth = endDate.getMonth() + 1;
        var endYear = endDate.getFullYear();

        var sDay = startDate.getDate(); // lay ngay trong thang 1 -> 29/30/31
        var eDay = endDate.getDate();

        let startQuarter = getQuarter(startMonth);
        let endQuarter = getQuarter(endMonth);

        let odd = 0;
        let sumWidth = 0;
        let yearObj;
        for (let y = startYear; y <= endYear; y++) {
            yearObj = { Year: y };
            let sM = y == startYear ? startMonth : 1;
            let eM = y == endYear ? endMonth : 12;

            startQuarter = getQuarter(sM);
            endQuarter = getQuarter(eM);
            let quaters = [];

            for (q = startQuarter; q <= endQuarter; q++) {

                let quarterObj = {
                    Quarter: q
                };

                let monthRange = getMonthRange(q);       // 3 thang mot quy
                if (y == startYear && q == startQuarter) {      // start Year/Quarter/Month
                    sM = startMonth;
                    eM = monthRange.To;

                    if (y == endYear && q == endQuarter) {  // startYear/Month/Quarter == endYear/Month/Quarter
                        eM = endMonth;
                    }

                }
                else if (y == endYear && q == endQuarter) {     // end Year/Quarter/Month
                    sM = monthRange.From;
                    eM = endMonth;
                }
                else {                                          // Mid time
                    sM = monthRange.From;
                    eM = monthRange.To;
                }


                let monthsInQ = [], monthObj;
                for (let m = sM; m <= eM; m++) {

                    if (y == startYear && q == startQuarter && m == startMonth) {// start Year/Quarter/Month
                        sDay = startDate.getDate();
                        eDay = new Date(y, sM, 0).getDate();

                        if (y == endYear && q == endQuarter && m == endMonth) {
                            eDay = endDate.getDate();
                        }

                    }
                    else if (y == endYear && q == endQuarter && m == endMonth) {// end Year/Quarter/Month
                        sDay = 1;
                        eDay = endDate.getDate();
                    }
                    else {                                                      // Mid time
                        sDay = 1;
                        eDay = new Date(y, m, 0).getDate();
                    }

                    var wM = getWidthMonth(m, y, sDay, eDay);

                    monthObj = { Name: m.toMonthString(), Days: wM };

                    monthsInQ.push(monthObj);
                }


                quarterObj.Months = monthsInQ;

                monthsInQ.forEach(m => {
                    sumWidth += m.Days;
                })

                odd += 1;
                quarterObj.Odd = odd % 2;
                quaters.push(quarterObj);
            };
            yearObj.Quaters = quaters;

            years.push(yearObj);
        }

        if (startYear == endYear && startQuarter == endQuarter && startMonth == endMonth && years.length < 2 &&
            years[0].Quaters.length < 2 && years[0].Quaters[0].Months.length < 2 &&
            years[0].Quaters[0].Months[0].Days < 50) {
            years[0].Quaters[0].Months[0].Days = 50;
        }

        function getMonthRange(q) {
            if (q == 1)
                return { From: 1, To: 3 };

            if (q == 2)
                return { From: 4, To: 6 };

            if (q == 3)
                return { From: 7, To: 9 }

            return { From: 10, To: 12 }
        }
        function getWidthMonth(m, y, sD, eD) {
            var startD = new Date(y, m - 1, sD);
            var endD = new Date(y, m - 1, eD);
            var deltaD = endD.getTime() - startD.getTime();
            deltaD = deltaD / (1000 * 60 * 60 * 24);    // chuyen milisec sang ngay
            deltaD += 1;        // +1 ngay do la 24h cua endDate

            return deltaD * msRoadmap.qUnit;
        }
        function getQuarter(m) {
            if (m < 4) return 1;
            if (m < 7) return 2;
            if (m < 10) return 3;
            return 4;
        }

        if (startDate.getTime() > endDate.getTime()) {
            years = [];
        }

        return {
            Years: years,
            Width: sumWidth
        }
    }
    Vue.component('rm-quarter-calendar', (resolve) => {
        $.get(__rootFolder__ + `${Tabview}/ViewQuarter/RoadmapCalendarQuarter.html`, template => {
            resolve({
                template: template,
                props: ['StartEnd', 'TimerangeStart', 'TimerangeEnd'],
                inject: ['getDateLine'],
                computed: {
                    DisplayUI() {
                        var yqm = getYearQuarterMonth(this.StartEnd);

                        return {
                            Years: yqm.Years
                        }
                    },
                    kLg() {
                        return kLg;
                    },
                    StyleHeightCalenda() {
                        var heightData = this.$root.ViewHeight;
                        return (heightData) + 'px';
                    },
                    StylePosition() {
                        let isHidePath = this.$root.IsHidePath;

                        return {
                            Left: isHidePath ? '0' : '316px'
                        }
                    },
                    TodayLine() {
                        var today = this.getDateLine();
                        var style = { display : 'none'};
                        var start = new Date(this.StartEnd.Start);
                        var end = new Date(this.StartEnd.End);
                        var isShow = vmCommon.compareDate2(today, start) >= 0 && vmCommon.compareDate2(today, end) <= 0;
                        if (isShow) {
                            style.display = "block";
                            var days = today.getTime() - start.getTime();
                            days = days / (3600 * 24 * 1000);
                            style.marginLeft = (days * msRoadmap.qUnit - 1) + "px";
                        }
                        return style;
                    }
                },
                updated() {
                    this.$root.updateViewWidth();
                },
                mounted() {
                    this.$root.updateViewWidth();
                },
                methods: {
                    getQuarter(m) {
                        if (m < 4) return 1;
                        if (m < 7) return 2;
                        if (m < 10) return 3;
                        return 4;
                    }
                }
            });
        });
    });
    function setupLang() {
        if (msRoadmap.isSharepoint()) {
            document.title = "Road Map Preview";
        } else
            $("#lblRoadmapframe").text(kLg.titlePageRoadmap);
    }
})();