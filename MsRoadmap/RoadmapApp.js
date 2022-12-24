var msRoadmapApp;
$.get("/MsRoadmap/MsRoadmap.html").done(template => {
    msRoadmapApp = new Vue({
        el: '#RoadmapApp',
        template: template,
        data: {
            DateLine: new Date(),
            ViewHeight: 850, ViewWidth: 1518,
            MasterBlocks: [], ActionStreams: [], CountRevert: 0,
            MaxRowElements: undefined,
            TimeRangeFrom: undefined,
            TimeRangeTo: undefined,
            ViewTypeId: undefined,
            IsOpenPopPreview: false,
            IsHidePath: false,
            isShowDepth: false,     // luc dau an di, khi co data moi hien len
            subFilter: new SubFilter(),
            MenuLabeling: {
                IsMain: false,
                IsSub: false,
                IsAction: false,
            },
            LstLabelingIdCollapse: [],
            ListExpands: [],
            ScrollLeft: 0,
            IsAllItemNull: true,
            ClientIp: '',
            Role: -3, ActionCostConnections: [], RegionThemaRoles: null,
            IsUpdatingOnServer: false, IsScrollX: false,
            SrollObserver: null,
            LstVisibleInView: [],
        },
        created() {

            if (this.IsSharepoint) {
                $('body').css({ 'padding-top': '10px' });
                //$('#ms-view-month-quarter').css({'margin-bottom': '25px'});
            }
            $(window).resize(function (e) {
                msRoadmapApp.setStyleBody();
            });

        },
        mounted() {
            this.getData();

            const bodyContent = document.querySelector('.body-content');
            if (bodyContent) {
                $(bodyContent).off('scroll').on('scroll', function () {
                    
                    timeScrollBefore = $(this).scrollLeft();  // dung css
                    msRoadmapApp.stickTabView(timeScrollBefore);  // dung css                

                    if (!msRoadmapApp.IsHidePath) {
                        msRoadmapApp.freezedDepthAndLabeling(timeScrollBefore);
                        msRoadmapApp.freezedPathOnScroll($(this));
                    }

                    const fbx = this.querySelector('.fakeElmBox');
                    fbx && fbx.remove();
                });
                
            }
            // style for mobile/response
            vmCommon.onMobile().do(function () {
                $('body').css({ 'display': 'inline-block' });

            });

            this.setStyleBody();
            this.initObserv();
        },
        computed: {
            kLg() { return kLg; },  
            IsSharepoint() {
                return window.location.pathname.includes('MsRoadmapSharepoint.aspx');                
            },
            StyleSharepoint() {
                if (this.IsSharepoint) return {
                    display: 'none',
                    marginBottom: '25px'
                }
                return {}
            },
            Elements() {
                var elemtns = this.getElements(this.MasterBlocks);
                
                if (!this.IsSharepoint)
                    this.setHeightForView(elemtns.RowsElement, elemtns.RowsRegion, elemtns.RowsBlock);

                return {
                    MaxIndex: elemtns.MaxIndex,
                    MasterBlocks: elemtns.MasterBlocks,
                    IsAllItemEndNull: elemtns.IsAllItemEndNull,
                    
                    HasBlock: elemtns.HasBlock, MinStart: elemtns.MinStart,
                    MaxEnd: elemtns.MaxEnd, MaxStartEndDateNull: elemtns.MaxStartEndDateNull
                }
            },
            MinMaxDate() {
                var minStart = this.Elements.MinStart;
                var maxEnd = this.Elements.MaxEnd;
                var maxStartWhenEndDateNull = this.Elements.MaxStartEndDateNull;

                if (!minStart) {        // check data empty array
                    minStart = new Date();
                    minStart = `1/1/${minStart.getFullYear()}`;
                    minStart = new Date(minStart);
                }
                if (!maxEnd) {        // check data empty array
                    if (!maxStartWhenEndDateNull) {
                        maxEnd = minStart;
                    }
                    else {
                        maxEnd = minStart.getTime() < maxStartWhenEndDateNull.getTime() ? maxStartWhenEndDateNull : minStart;
                    }
                }

                if (maxStartWhenEndDateNull && maxEnd && maxStartWhenEndDateNull.getTime() < maxEnd.getTime()) {
                    maxStartWhenEndDateNull = maxEnd;
                }

                maxStartWhenEndDateNull = !maxStartWhenEndDateNull ? undefined : maxStartWhenEndDateNull.toStringMMDDYYYY();

                return {
                    Start: minStart.toStringMMDDYYYY(),
                    End: maxEnd.toStringMMDDYYYY(),
                    MaxStartEndDateNull: maxStartWhenEndDateNull
                };
            },
            ViewMonth() {                
                var seVM = this.getViewMonth(this.Elements, this.MinMaxDate, this.CurrentDate, this.TimeRangeFrom, this.TimeRangeTo);
                return this.moveFirstLastDayInWeek(seVM.Start, seVM.End);
            },
            CurrentDate() {
                var startDate = new Date();
                var endDate;
                var month = startDate.getMonth() + 1;
                var year = startDate.getFullYear();
                if (month < 7) {
                    startDate = new Date(year, 0, 1);   // ngay dau tien cua nam
                    endDate = new Date(year, 6, 0);     // ngay cuoi cung thang 6
                } else {
                    startDate = new Date(year, 6, 1);         // ngay dau tien thang 7
                    endDate = new Date(year, 12, 0);        // ngay cuoi cung thang 12
                }

                return {
                    MonthStart: startDate.toStringMMDDYYYY(),
                    MonthEnd: endDate.toStringMMDDYYYY(),
                    QuarterStart: new Date(year, 0, 1).toStringMMDDYYYY(),
                    QuarterEnd: new Date(year, 12, 0).toStringMMDDYYYY()
                }
            },
            ViewQuarter() {
                var seVQ = this.getViewQuarter(this.Elements, this.MinMaxDate, this.CurrentDate, this.TimeRangeFrom, this.TimeRangeTo);
                return this.moveFirstLastDayInMonth(seVQ.Start, seVQ.End);
            },
            WidthDataBoundShadow() {
                var start, end;
                if (this.ViewTypeId == 0) {
                    start = this.ViewQuarter.Start;
                    start = new Date(start);
                    end = this.ViewQuarter.End;
                    end = new Date(end);
                    var dateR = getDateDiff(start, end);
                    return dateR * msRoadmap.qUnit;
                }

                if (this.ViewTypeId == 1) {
                    start = this.ViewMonth.Start;
                    start = new Date(start);
                    end = this.ViewMonth.End;
                    end = new Date(end);
                    var dateR = getDateDiff(start, end);
                    return dateR * msRoadmap.mUnit;
                }

            },
            HasData() {
                if (this.MasterBlocks.length < 1) return false;
                var a = this.MasterBlocks.filter(m => { return m.ParentRegionRMs.length > 0; });
                return a.length > 0;
            },
            
            StyleHeightViewQuarter() {
                var heightData = this.ViewHeight;                
                if (this.IsSharepoint) {
                    heightData -= 210;
                }
                return (heightData + 58) + 'px';
            },
            StyleHeightViewMonth() {
                var height = this.ViewHeight;                
                if (this.IsSharepoint) {
                    height -= 210;
                }
                return (height + 59) + 'px';
            },
            StyleWithTimeRangeTo() {
                let timeEnd = this.TimeRangeTo;
                if (!timeEnd && !this.IsSharepoint) return {}

                return {
                    overflow: 'hidden'
                }
            },
            StyleWithTimeRangeFromTo() {
                if (!this.TimeRangeFrom && !this.TimeRangeTo) return {};
                return {
                    overflow: 'hidden'
                }
            },
            LblClientIp() {
                if (this.ViewTypeId != -2) return '';
                if (this.IsSharepoint && this.ClientIp != '') {
                    return `${this.kLg.LblIpAddress}: ${this.ClientIp}`
                }
                return ''
            },
            ViewFrom() {
                var from = this.ViewQuarter.Start;
                if (this.ViewTypeId == 1) {     // view Month
                    from = this.ViewMonth.Start;
                }
                from = new Date(from);
                var m = from.getMonth() + 1;
                if (m < 10) m = `0${m}`;
                var d = from.getDate();
                if (d < 10) d = `0${d}`;
                return `${from.getFullYear()}-${m}-${d}`;
            },
            ViewTo() {
                var to = this.ViewQuarter.End;
                if (this.ViewTypeId == 1) {     // view Month
                    to = this.ViewMonth.End;
                }
                to = new Date(to);
                var m = to.getMonth() + 1;
                if (m < 10) m = `0${m}`;
                var d = to.getDate();
                if (d < 10) d = `0${d}`;
                return `${to.getFullYear()}-${m}-${d}`;
            },
            IsLabeling() { return this.MenuLabeling.IsMain || this.MenuLabeling.IsSub || this.MenuLabeling.IsAction; },
            KeyLabeling() {
                const mL = this.MenuLabeling;
                const LenExp = 1; // this.ListExpands.filter(x0 => x0.IsExpand).length;
                const t = this.ViewTypeId == 0 ? 'quarter' : 'month';
                return `view_${t}-isMainLabel_${mL.IsMain ? 1 : 0}-isSubLabel_${mL.IsSub ? 1 : 0}-isActionLabel_${mL.IsAction ? 1 : 0}-len_${LenExp}`;
            },
        },
        watch: {
            CountRevert(newVal) {
                const lst = vmCommon.deepCopy(this.MasterBlocks);
                this.MasterBlocks.splice(0);        // delete
                this.MasterBlocks = lst;
            },
        },
        provide() {
            return {
                mountedOnView: this.mountedOnView,
                HoverTooltip: this.onHoverTooltip,
                onHoverBlockPath: this.onHoverTitle,
                getDateLine: () => { return this.DateLine; }
            }
        },
        updated() {
            
            this.setHeightView();
            this.updateViewWidth();

            const eV = document.querySelector('.dnb_25880_freezed_col');
            if (eV && eV.offsetWidth > window.outerWidth) this.IsScrollX = true;
            else this.IsScrollX = false;
            this.updateStyleDisplayHLineDOM();

            
        },
        methods: {
            initObserv() {
                let options = {
                    root: document.querySelector('.body-content'),
                    rootMargin: '0px',
                    threshold: [0, 0.25, 0.5, 0.75, 1]
                }
                let callback = (entries, observer) => {
                    
                    const lstIntersec = entries.filter(e => e.isIntersecting);
                    const lstVisible = [];
                    lstIntersec.forEach(entry => {
                        const nodeE = entry.target;
                        var iblock = nodeE.getAttribute('iblock');
                        iblock = parseInt(iblock);
                        var iparent = nodeE.getAttribute('iparent');
                        iparent = parseInt(iparent);
                        var ichild = nodeE.getAttribute('ichild');
                        ichild = parseInt(ichild);

                        if (!nodeE.childElementCount)
                            lstVisible.push(`${iblock}_${iparent}_${ichild}`);

                    });
                    if (lstVisible.length) {
                        let hasChange = false;
                        msRoadmapApp.LstVisibleInView.filter(itm => {
                            const iii = `${itm.iBlock}_${itm.iParent}_${itm.iChildhoder}`;
                            const _itm = lstVisible.includes(iii);
                            if (_itm && !itm.IsVisibleInView) {
                                itm.IsVisibleInView = true;
                                hasChange = true;
                            }
                            return true;
                        });
                        if (hasChange) {
                            msRoadmapApp.$el.querySelectorAll('.DnbClsObserver').forEach(nodeE => {
                                var iblock = nodeE.getAttribute('iblock');
                                iblock = parseInt(iblock);
                                var iparent = nodeE.getAttribute('iparent');
                                iparent = parseInt(iparent);
                                var ichild = nodeE.getAttribute('ichild');
                                ichild = parseInt(ichild);

                                const $temp = $(nodeE);
                                const top = $temp.offset().top,
                                    height = $temp.height();
                                if (top + height < -window.outerHeight || top > window.outerHeight * 2) {
                                    const ind = msRoadmapApp.LstVisibleInView.find(a => a.iBlock == iblock && a.iParent == iparent && a.iChildhoder == ichild);
                                    if (ind && ind.IsVisibleInView) {
                                        ind.IsVisibleInView = false;
                                    }
                                }
                            });
                        }

                    }
                };
                this.SrollObserver = new IntersectionObserver(callback, options);
                
            },
            // #region Roadmap: Change start and end date with mouse
            onOverAdjustSE(e) {
                if (e.target.classList.contains('rm-main-goal-action') ||
                    e.target.classList.contains('dnb_view_path') ||
                    e.target.classList.contains('fake-elm-style')) {
                    if (!vmCommon.IsMouseoverAdjustDate) this.removeFakeElmBox();
                }
            },
            removeFakeElmBox() {
                const fbx = document.querySelector('.fakeElmBox');
                fbx && fbx.remove();
                if (vmCommon.$target) {
                    vmCommon.$target.removeClass('dnbDraggingSE');
                    delete vmCommon.$target;
                }
                $(`.dnb_25880_freezed_col.dnb_25880_freezed_col_clone`).removeClass('dnb_fakeElmBox');
                $('.dnbViewonHideWhenExport.rm-view-quarter').removeClass('dnb_fakeElmBox');
                $('.body-content').removeClass('dnbAdjustSE');

                this.removeFakeFrzAdjustSETimeRngFrom();
                //if (vmCommon.timeToShowDrgDrpDate) {
                //    clearTimeout(vmCommon.timeToShowDrgDrpDate);
                //    delete vmCommon.timeToShowDrgDrpDate;
                //}
                this.deleteGlobal();
                const bodyContent = document.querySelector('.body-content');
                if (bodyContent) {
                    bodyContent.removeEventListener('mouseover', this.onOverAdjustSE);
                }
            },
            startDragStartDate(e) {
                if (isNaN(vmCommon.countAdjustStartEnd)) vmCommon.countAdjustStartEnd = 1;
                else vmCommon.countAdjustStartEnd += 1;
                // Chống click đúp (vmCommon.countAdjustStartEnd == 1)
                if (!vmCommon.readyAdjustStartEnd) {
                    vmCommon.readyAdjustStartEnd = setTimeout(function () {
                        if (vmCommon.countAdjustStartEnd == 1) {
                            vmCommon.IsMouseoverAdjustDate = true;
                            vmCommon.elmnt = document.querySelector('.fakeElmContentAdjust');
                            e = e || window.event;
                            vmCommon.pos3 = e.clientX;  // gốc tọa độ
                            msRoadmapApp.setLimitMinMaxX(e);
                            document.documentElement.addEventListener("mousemove", msRoadmapApp.draggingStartDate, false);
                            document.documentElement.addEventListener("mouseup", msRoadmapApp.stopDragStartDate, false);
                            document.querySelector('.body-content').addEventListener('wheel', disableMouseWheel);
                            var t = vmCommon.elmnt.getAttribute('data-start');
                            if (t) {
                                t = new Date(new Date(+t).toDateString()); // 0h00
                                vmCommon.sDate = t.getTime();
                            }
                            t = vmCommon.elmnt.getAttribute('data-end');
                            if (t) {
                                t = +t - 24000 * 3600;      // -1 ngày
                                t = new Date(new Date(t).toDateString()); // 0h00
                                vmCommon.deltDate = t.getTime() - vmCommon.sDate;
                            }
                            vmCommon.$fkElmBx = $('.fakeElmBox');
                            if (vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Action) {  // neu Action co Acitvity
                                const actv = document.querySelectorAll(`div[lbling-parent-id="${vmCommon.elm.Id}"]`);
                                if (actv.length) vmCommon.isElementActionHasActivity = true;
                            }
                        }
                    }, 99);
                }
                if (!isNaN(vmCommon.countAdjustStartEnd) && vmCommon.countAdjustStartEnd > 1) {
                    if (vmCommon.readyAdjustStartEnd) {
                        clearTimeout(vmCommon.readyAdjustStartEnd);
                        delete vmCommon.readyAdjustStartEnd;
                    }
                }
            },
            draggingStartDate(e) {
                if (!vmCommon.elmnt) { return; }        // fakeElmContentAdjust
                e = e || window.event;
                vmCommon.pos1 = vmCommon.pos3 - e.clientX;

                const dT = vmCommon.elmnt.offsetLeft - vmCommon.pos1;
                if (vmCommon.ViewMinX - 6 > dT) return;     // Vượt quá sang view của Block (sai số 6px)

                const winX = vmCommon.$fkElmBx.offset().left + dT;   // Vị trí x trong app gốc 0 là bên trái view
                const limXWithScreen = window.devicePixelRatio < 1 ? window.outerWidth / window.devicePixelRatio : window.outerWidth;
                if (winX > limXWithScreen) return;               // kéo element vượt quá view của màn hình 
                if (winX < 330) return;                 // check kéo Start date về bên trái tràn vào PathBlock bên trái
                vmCommon.pos3 = e.clientX;      // e.clientX x của mouse tính mốc 0 từ mép trái màn

                const dTView = Math.floor(dT / (msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit : msRoadmap.mUnit));
                var _date = vmCommon.sDate + dTView * 24 * 3600 * 1000;
                _date = new Date(new Date(_date).toDateString()); // 0h00
                const date = _date.getTime();
                
                switch (true) {
                    case date < vmCommon.ViewMinTimeX:  // Nếu Start kéo quá ViewFrom thì dừng lại
                    case date > vmCommon.ViewMaxX:      // Nếu End Vượt quá ViewTo thì dừng lại
                    case vmCommon.LimitDownStream && date < vmCommon.LimitDownStream:      // Kéo Activity (Cha Action là DownStream)
                        // Dùng switch cho đỡ phải viết nhiều if 
                        return;
                    default: break;
                }
                
                vmCommon.elmnt.style.left = dT + "px";
                // #region cố định End date khi kéo sang phải vượt qua ViewTo
                if (vmCommon.widthEndNull) {
                    vmCommon.$fkElmBx.find('.dnb-elm-endnull.fake-elm-style').css({ 'width': `${vmCommon.widthEndNull - dT}px`});
                }

                const $fakeElmCA = vmCommon.$fkElmBx.find('.fakeElmContentAdjust');
                const deltaW = vmCommon.widthE2ViewTo - dT;
                if (0 > deltaW) {           // kéo về phải vượt quá ViewTo 
                    const _a = vmCommon.widthElmConst + deltaW;
                    $fakeElmCA.css({
                        width: `${_a}px`, minWidth: `${_a}px`, maxWidth: `${_a}px`
                    });
                    $fakeElmCA.children().first().css({ borderTopRightRadius: '0', borderBottomRightRadius: '0' });
                } else {                    // Kéo trong vùng ViewFrom-ViewTo giữ nguyên width
                    $fakeElmCA.css({
                        width: `${vmCommon.widthElmConst}px`,
                        minWidth: `${vmCommon.widthElmConst}px`,
                        maxWidth: `${vmCommon.widthElmConst}px`
                    });
                    $fakeElmCA.children().first().css({ borderTopRightRadius: '', borderBottomRightRadius: '' });
                }
                if (isNaN(vmCommon.deltDate)) {     // Element EndDate null
                    const cW = $fakeElmCA.width() - dT;
                    $fakeElmCA.css({
                        width: `${cW}px`, minWidth: `${cW}px`, maxWidth: `${cW}px`
                    });
                }
                // #endregion cố định End date
                
                // #region update tooltip
                var ds = vmCommon.elmnt.querySelector('.fakeTlpStart');
                var de = vmCommon.elmnt.querySelector('.fakeTlpEnd');
                if ((0 > deltaW && vmCommon.widthElmConst + deltaW < 120) || vmCommon.widthElmConst < 100) {
                    ds && (ds.style.display = 'none');
                    de && (de.style.minWidth = '174px');    // hiển thị Start-End trong tooltip end-date
                } else {
                    ds && (ds.style.display = '');
                    de && (de.style.minWidth = '');
                }
                const txS = kendo.toString(new Date(date), "d", kLg.languageCode);
                if (ds && ds.style.display != 'none') {
                    ds.innerText = txS;     // hiển thị tooltip Start
                }
                vmCommon.elmnt.setAttribute('data-start', date);
                // #endregion update tooltip
                vmCommon.startDate = date;
                if (!isNaN(vmCommon.deltDate)) {        // Element có End Date
                    const dateE = date + vmCommon.deltDate;
                    
                    if (de) {       // Kiểm tra để hiển thị 1/2 tooltip
                        const txE = kendo.toString(new Date(dateE), "d", kLg.languageCode);
                        if (ds && ds.style.display != 'none') {
                            de.innerText = txE;     // hiển thị tooltip end
                        } else {
                            de.innerText = `${txS} - ${txE}`;       // hiển thị trong cùng 1 tooltip 
                            if (winX < 438) {
                                (!de.classList.contains('pinFakeTlpEndDrggingS')) && de.classList.add('pinFakeTlpEndDrggingS');
                            } else {
                                (de.classList.contains('pinFakeTlpEndDrggingS')) && de.classList.remove('pinFakeTlpEndDrggingS');
                            }
                        }
                    }
                    vmCommon.elmnt.setAttribute('data-end', dateE);
                    vmCommon.endDate = dateE;
                }
            },
            stopDragStartDate() {
                // #region update data in msRoadmapApp.MasterBlocks
                var isReloadData = false;
                if (vmCommon.elm) {
                    // #region call Handler
                    this.IsUpdatingOnServer = true;
                    const entryD = {
                        Id: vmCommon.elm.Id, TypeId: vmCommon.elm.TypeId, NewDate: vmCommon.startDate ? new Date(vmCommon.startDate) : vmCommon.elm.Start.jsonToDate()
                    }
                    entryD.NewDate = entryD.NewDate.toServerDate();
                    isReloadData = vmCommon.isElementActionHasActivity || vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Activity || vmCommon.IsElementHasConnectionDown;
                    
                    // #region Kiểm tra startDate < TimeRangeFrom || TimeRangeTo < startDate thì load lại (Goal/Action/Activity)
                    const sD = new Date(new Date(vmCommon.startDate).toDateString()).getTime();         // 0:00 start
                    if (this.TimeRangeTo && vmCommon.startDate) {
                        const sT = new Date(new Date(this.TimeRangeTo).toDateString()).getTime();           // 0:00 TimeRangeTo
                        if (sD > sT) isReloadData = true;
                    }
                    if (this.TimeRangeFrom && vmCommon.startDate) {
                        const fT = new Date(new Date(this.TimeRangeFrom).toDateString()).getTime();          // 0:00 TimeRangeFrom
                        if (sD < fT) isReloadData = true;
                    }
                    // #endregion Kiểm tra endDate kéo vượt quá TimeRange

                    vmGoalAction.dataservice.changeStartDate(entryD, function (res) {
                        // if (isReloadData) {
                        //     msRoadmapApp.reloadData();
                        // }
                    });
                    // #endregion call Handler
                    if (vmCommon.elm.TypeId < vmCommon.RMGoalActionType.Activity) {
                        vmCommon.startDate && (vmCommon.elm.Start = getDateJson(vmCommon.startDate));
                        if (!isNaN(vmCommon.endDate)) {
                            vmCommon.elm.End = getDateJson(vmCommon.endDate)
                        }
                    }
                }
                // #endregion
                document.documentElement.removeEventListener("mousemove", this.draggingStartDate, false);
                document.documentElement.removeEventListener("mouseup", this.stopDragStartDate, false);
                document.querySelector('.body-content').removeEventListener('wheel', disableMouseWheel);
                
                if (!isReloadData) msRoadmapApp.IsUpdatingOnServer = false;
                msRoadmapApp.removeFakeElmBox();
            },
            deleteGlobal() {
                if (vmCommon.lstElm != undefined) delete vmCommon.lstElm;
                if (vmCommon.elm != undefined) delete vmCommon.elm;
                if (vmCommon.relativeItems) delete vmCommon.relativeItems;
                if (vmCommon.tmrAdjustSE) { clearTimeout(vmCommon.tmrAdjustSE); }
                delete vmCommon.tmrAdjustSE;
                if (vmCommon.readyAdjustStartEnd) { clearTimeout(vmCommon.readyAdjustStartEnd); }
                delete vmCommon.readyAdjustStartEnd;
                delete vmCommon.$fkElmBx;
                delete vmCommon.pos1;
                delete vmCommon.pos3;
                if (vmCommon.elmnt) delete vmCommon.elmnt;
                if (vmCommon.sDate) delete vmCommon.sDate;
                delete vmCommon.deltDate;        // dùng to tooltip
                if (vmCommon.startDate) delete vmCommon.startDate;
                if (vmCommon.endDate) delete vmCommon.endDate;
                delete vmCommon.startX;   // dùng kéo thả End date
                delete vmCommon.startWidth;        // kéo thả End Date
                if (vmCommon.eDate) delete vmCommon.eDate;                  // kéo thả End Date
                if (vmCommon.limitEndTime) delete vmCommon.limitEndTime;    // kéo thả End Date
                if (vmCommon.widthEndNull) delete vmCommon.widthEndNull;    // kéo thả Start date
                if (vmCommon.widthElmConst) delete vmCommon.widthElmConst;  // kéo thả Start date
                if (vmCommon.widthE2ViewTo) delete vmCommon.widthE2ViewTo;  // kéo thả Start date
                if (vmCommon.ViewMinX) delete vmCommon.ViewMinX;
                if (vmCommon.ViewMaxX) delete vmCommon.ViewMaxX;
                if (vmCommon.ViewMinTimeX) delete vmCommon.ViewMinTimeX;
                if (vmCommon.countAdjustStartEnd) delete vmCommon.countAdjustStartEnd;
                delete vmCommon.widthCutTimeRange;
                delete vmCommon.widthElmInit;
                delete vmCommon.IsMouseoverAdjustDate;
                delete vmCommon.LimitDownStream;
                delete vmCommon.dragStartFromTimeView;
                delete vmCommon.isElementActionHasActivity;
                delete vmCommon.IsElementHasConnectionDown;
            },
            setDateElement(target, element, iCategory, iChildhoder, iPrarent, iBlock, isStart) {
                if ($('.fakeElmBox').length) return;
          //      if (typeof iBlock !== 'number' || iBlock < 0 || iBlock > this.MasterBlocks.length) return;
          //      if (typeof iPrarent !== 'number' || typeof iChildhoder !== 'number') return;
                // #region Kiem tra
                vmCommon.$target = $(target);
                if (!vmCommon.$target.length) return;

                var elm = this.MasterBlocks[iBlock].ParentRegionRMs[iPrarent];
                if (!elm) return;
                elm = elm.ChildStakeHolders[iChildhoder];
                if (!elm) return;
                elm = elm.Categories[iCategory];
                if (!elm) return;
                // #endregion kiểm tra
                vmCommon.lstElm = elm.Elements;
                var index = -1;      // index trong list của this.MasterBlocks[iBlock].ParentRegionRMs[iPrarent].ChildStakeHolders[iChildhoder].Categories[iCategory].Elements
                vmCommon.elm = vmCommon.lstElm.find((ee, ii) => {
                    if (ee.Id == element.Id && ee.TypeId == element.TypeId) {
                        index = ii;
                        return true;
                    }
                });  // ref object

                // #region tìm các Element liên quan nếu kéo Action hoặc Activity
                var indexNP = index;
                vmCommon.relativeItems = [];
                switch (vmCommon.elm.TypeId) {
                    case vmCommon.RMGoalActionType.Action:      // Nếu Element kéo Date là Action
                        var elmNP;      // find children (Activity)
                        do {
                            elmNP = undefined;
                            indexNP += 1;
                            if (indexNP < vmCommon.lstElm.length) {
                                elmNP = vmCommon.lstElm[indexNP];
                            } else break;       // thoát khỏi do-while
                            if (elmNP && elmNP.TypeId == vmCommon.RMGoalActionType.Activity && elmNP.ParentId == vmCommon.elm.Id) {
                                vmCommon.relativeItems.push(elmNP);
                            } else break;       // thoát khỏi do-while
                        } while (elmNP && elmNP.TypeId == vmCommon.RMGoalActionType.Activity);
                        break;  // thoát khỏi switch-case
                    case vmCommon.RMGoalActionType.Activity:      // Nếu Element kéo Date là Activity
                        var elmP;
                        do {        // tìm cha (Action) và các Activity phía trên (trước) Activity hiện tại
                            elmP = undefined;
                            indexNP -= 1;
                            if (indexNP > -1) {
                                elmP = vmCommon.lstElm[indexNP];
                            } else break;       // thoát khỏi do-while
                            if (elmP) {
                                if (elmP.TypeId == vmCommon.RMGoalActionType.Action) {
                                    break;       // thoát khỏi do-while
                                } else if (elmP.TypeId == vmCommon.RMGoalActionType.Activity && elmP.ParentId == vmCommon.elm.ParentId) {
                                    vmCommon.relativeItems.push(elmP);
                                }
                            }
                        } while (elmP);

                        indexNP = index;
                        do {    // Tìm các Activity cùng cha ở phía dưới (sau) Activity hiện tại
                            elmP = undefined;
                            indexNP += 1;
                            if (indexNP < vmCommon.lstElm.length) {
                                elmP = vmCommon.lstElm[indexNP];
                            } else break;       // thoát khỏi do-while
                            if (elmP && elmP.TypeId == vmCommon.RMGoalActionType.Activity && elmP.ParentId == vmCommon.elm.ParentId) {
                                vmCommon.relativeItems.push(elmP);
                            } else break;       // thoát khỏi do-while
                        } while (elmP);
                        break;  // thoát khỏi switch-case
                }
                // #endregion Element liên quan nếu kéo Action hoặc Activity
                // #region clone element
                var upStream = vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Action && msRoadmapApp.getActionDownStream(vmCommon.elm.Id);
                var sTime = vmCommon.$target.attr('adjust-se-s');
                var eTime = vmCommon.$target.attr('adjust-se-e');
                const pos = vmCommon.$target.offset();
                const fakeElm = vmCommon.$target.clone();
                var left = pos.left;
                if (window.pageXOffset > 0) {
                    left -= window.pageXOffset;
                }
                var _width = vmCommon.$target.outerWidth();
                if (msRoadmapApp.ViewTypeId == 1) _width += 9;        // View Month
                const spanLR = `${!upStream ? `<span class="fakeElmAdjStart" style="position: absolute; top: 0; left:-9px; display: inline-block; width:18px; height: 28px;cursor: w-resize;"></span>` : ''}
                                ${eTime ? `<span class="fakeElmAdjEnd" style="position: absolute; top: 0; right:-9px; display: inline-block; width:18px; height: 28px;cursor: w-resize;"></span>` : ''}
                                <span class="fakeTlpStart" style=" left: -36px;">${kendo.toString(new Date(+sTime), "d", kLg.languageCode)}</span>`;
                const tlpE = eTime ? `<span class="fakeTlpEnd" style=" right: -36px;">${kendo.toString(new Date(+eTime - 3600 * 1000), "d", kLg.languageCode)}</span>` : null;
                const temp = `<div class="fakeElmBox" style="position: fixed;top: ${pos.top}px;left: ${left}px;z-index:9;width: ${_width}px;">
                  <div style="position:relative; width: 15px; height: 27px; margin-bottom:7px;">
                    <div class="dnb-inline-flex rm-element-wrap kgv-style-name-element-popup fakeElmContent fakeElmContentAdjust" data-start=${sTime} data-end=${eTime}
                        style="width: ${_width}px;max-width: ${_width}px;min-width: ${_width}px; position: absolute;left: 0;padding:0;">
                        ${fakeElm[0].outerHTML}
                  </div>
                    <div style="display: inline-block; position: fixed; top: 130px; left: 0; width: 18px; height: 100vh; background-color: white;
                        z-index: 9;"></div>
                </div>`;
                $('.body-content').append($(temp));
                $('.body-content').addClass('dnbAdjustSE');
                const $chldFElm = $('.fakeElmContent').children();
                $chldFElm.addClass('fake-elm-style');
                $chldFElm.append($(spanLR));
                const fakeElmCA = document.querySelector('.fakeElmContentAdjust');
                vmCommon.widthElmConst = parseInt(fakeElmCA.style.width);       // 2 biến này dùng để giới hạn End khi kéo Start làm element vượt quá view (bên phải)
                if (tlpE) {
                    $chldFElm.append($(tlpE));
                }
                if (isStart) {      // Kéo Start
                    const timeS00 = new Date(new Date(+sTime).toDateString()).getTime();     // 0:00
                    const timeViewTo00 = new Date(new Date(this.ViewTo).toDateString()).getTime();        // chuyển về 0h00 trong ngày
                    if (tlpE) {     // Có End Date
                        // #region set Variables để khi kéo Start làm cho End vượt quá ViewTo (Bên phải)
                        const timeE00 = new Date(new Date(+eTime).toDateString()).getTime();      // 0:00 end

                        vmCommon.widthE2ViewTo = (timeViewTo00 - timeE00) / 24000 / 3600;       // delta time => delta day
                        vmCommon.widthE2ViewTo *= (msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit : msRoadmap.mUnit); // delta day => pixel
                        vmCommon.widthE2ViewTo += 4;        // margins, paddings
                        if (msRoadmapApp.ViewTypeId == 1) vmCommon.widthE2ViewTo -= 2;        // View Month
                        
                        if (timeViewTo00 < timeE00) {       // Nếu Element hiện tại có End vượt quá ViewTo (bên phải)
                            fakeElmCA.classList.add('dnbEndDateOverViewTo');
                            fakeElmCA.firstElementChild.style.borderTopRightRadius = '0';
                            fakeElmCA.firstElementChild.style.borderBottomRightRadius = '0';
                            const dltTime = timeViewTo00 - timeS00;     // 0:00 - 0:00 
                            var newWdth = (dltTime / 24000 / 3600) * (msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit : msRoadmap.mUnit);
                            newWdth += 4;       // margins, paddings
                            if (msRoadmapApp.ViewTypeId == 1) newWdth += 6;        // View Month
                            fakeElmCA.style.width = `${newWdth}px`;
                            fakeElmCA.style.minWidth = `${newWdth}px`;
                            fakeElmCA.style.maxWidth = `${newWdth}px`;
                            vmCommon.widthElmInit = newWdth;
                        }
                        // #endregion set Variables để khi kéo Start làm cho End vượt quá ViewTo
                    } else {
                        $chldFElm.css(msRoadmapApp.getCssWidthEndDateNull(+sTime));
                        vmCommon.widthEndNull = $('.dnb-elm-endnull.fake-elm-style').width() + 8;
                    }

                    if (timeS00 == timeViewTo00 || (timeViewTo00 - timeS00) == 24000 * 3600) {
                        vmCommon.dragStartFromTimeView = timeS00;
                    }
                } else {        // kéo End 
                    if (this.TimeRangeFrom && tlpE) {       // có Time Range
                        const timeS00 = new Date(new Date(+sTime).toDateString()).getTime();      // 0:00 start
                        const timeViewFrom00 = new Date(new Date(this.ViewFrom).toDateString()).getTime();        // chuyển về 0h00 trong ngày
                        let limW = timeS00 - timeViewFrom00;
                        if (limW < 0) {
                            limW = limW / 24000 / 3600;       // delta time => delta day
                            limW *= (msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit : msRoadmap.mUnit); // delta day => pixel
                            vmCommon.widthCutTimeRange = limW;      // số âm
                        }
                        const timeE00 = new Date(new Date(+eTime).toDateString()).getTime();      // 0:00 end
                        if ((timeE00 - timeViewFrom00) / 24000 / 3600 < 3) {
                            vmCommon.widthElmInit = 3;
                        }
                    }
                }
                
                vmCommon.$target.addClass('dnbDraggingSE');         // Ẩn Element gốc đi
                // #endregion clone element
                const _fakeElmBox = document.querySelector('.fakeElmBox');    // setRef
                if (isStart) {
                    //initDragElement
                    const left = document.querySelector('.fakeElmAdjStart');
                    if (left) {
                        left.addEventListener("mouseleave", msRoadmapApp.clearAdjustStartEnd, false);
                        left.addEventListener("mouseup", msRoadmapApp.clearAdjustStartEnd, false);
                        vmCommon.pos1 = 0, vmCommon.pos3 = 0; vmCommon.elmnt = null;
                        if (!vmCommon.dragStartFromTimeView)
                            left.addEventListener("mousedown", msRoadmapApp.startDragStartDate, false);

                        if (element.TypeId == vmCommon.RMGoalActionType.Action) {
                            const ac = this.findActionDownStream(element.Id);
                            if (ac) vmCommon.IsElementHasConnectionDown = true;
                        }
                    }
                } else {
                    //initResizeElement
                    const right = document.querySelector('.fakeElmAdjEnd');
                    if (right) {
                        right.addEventListener("mouseleave", msRoadmapApp.clearAdjustStartEnd, false);
                        right.addEventListener("mouseup", msRoadmapApp.clearAdjustStartEnd, false);
                        right.addEventListener("mousedown", msRoadmapApp.startResizeEndDate, false);
                        if (element.TypeId == vmCommon.RMGoalActionType.Action) {
                            const ac = this.findActionDownStream(element.Id);
                            if (ac) vmCommon.IsElementHasConnectionDown = true;
                        }
                    }
                }

                if (vmCommon.dragStartFromTimeView) {
                    _fakeElmBox.addEventListener("mousedown", msRoadmapApp.startDragStartDate, false);
                }
                // #region Kiểm tra di chuột ra khỏi clone Element 
                if (typeof vmCommon.removeAdjustSE != 'function') {
                    vmCommon.removeAdjustSE = function (e) {
                        if (vmCommon.elmnt) return;     // nếu đang kéo element thì không được remove (trường hợp kéo quá End về trước Start => chuột sẽ di chuyển ra ngoài element)
                        vmCommon.tmrAdjustSE = setTimeout(function () {
                            if (vmCommon.elm) {
                                msRoadmapApp.removeFakeElmBox();
                            }
                        }, 246);
                    }
                }
                _fakeElmBox.addEventListener("mouseleave", vmCommon.removeAdjustSE);

                if (typeof vmCommon.removeAdjustSETimmer != 'function') {
                    vmCommon.removeAdjustSETimmer = function () {
                        if (vmCommon.tmrAdjustSE) {
                            clearTimeout(vmCommon.tmrAdjustSE);
                            delete vmCommon.tmrAdjustSE;
                        }
                    }
                }
                _fakeElmBox.addEventListener("mouseover", vmCommon.removeAdjustSETimmer);
                // #endregion Kiểm tra di chuột ra khỏi clone Element 
                // #region Tinh toan lai tooltip neu nho qua thi gop lai lam 1
                this.cssTooltip(vmCommon.widthElmConst, document, null, vmCommon.widthElmInit);
                // #endregion Tinh toan lai tooltip
                $(`.dnb_25880_freezed_col.dnb_25880_freezed_col_clone`).addClass('dnb_fakeElmBox');
                $('.dnbViewonHideWhenExport.rm-view-quarter').addClass('dnb_fakeElmBox');
                
                // #region Chỉnh tooltip Start - End date xuống dưới nếu sát với Calendar
                const $fakeTlpStart = $('.fakeTlpStart');
                if ($('#colume-name-id-filterdepth').length) {
                    const $fd = $('#colume-name-id-filterdepth');
                    if ($fd.offset().top + $fd.outerHeight() + 39 > $('.fakeElmBox').offset().top) {
                        $fakeTlpStart.addClass('fakeTlpBott');
                        $('.fakeTlpEnd').addClass('fakeTlpBott');
                    }
                }
                var ds = document.querySelector('.fakeTlpStart');
                if (ds) {
                    if ($(ds).offset().left < 301) {
                        ds.style.left = '0px';
                    }
                }
                if (!isNaN(vmCommon.widthCutTimeRange)) {     // số âm
                    $fakeTlpStart.addClass('tlpWidthCutTimeRange');
                    $fakeTlpStart.css({ 'left': `${-vmCommon.widthCutTimeRange}px` });
                    msRoadmapApp.clonePath(msRoadmapApp, true);     // clone has class 'dnbFakeFrzAdjustSETimeRangeFrom'
                    
                    if (vmCommon.widthElmConst + vmCommon.widthCutTimeRange < 132) {
                        var de = document.querySelector('.fakeTlpEnd');
                        ds.style.display = 'none';          // hiện lại tooltip start-date
                        de.style.minWidth = '174px';    // hiển thị Start-End trong tooltip end-date
                        if (!de.innerText.includes(' - '))
                            de.innerText = `${ds.innerText} - ${de.innerText}`;
                        var x = (vmCommon.widthElmConst + vmCommon.widthCutTimeRange) * 0.7 - 173.835;
                        if (de) {
                            de.style.right = `${x}px`
                        }
                    }
                } else msRoadmapApp.removeFakeFrzAdjustSETimeRngFrom();
                // #endregion Chỉnh tooltip Start - End
                const bodyContent = document.querySelector('.body-content');
                if (bodyContent) {
                    bodyContent.addEventListener('mouseover', this.onOverAdjustSE);
                }
            },
            getCssWidthEndDateNull(sTime) {
                var sD = new Date(sTime);
                sD = new Date(sD.toDateString());

                var eV = new Date(msRoadmapApp.ViewTo);
                eV = new Date(eV.toDateString());

                var dT = eV.getTime() - sD.getTime();
                dT = dT / (1000 * 24 * 3600) + 1;
                const w = dT * (!this.ViewTypeId ? msRoadmap.qUnit : msRoadmap.mUnit);

                return {
                    'width': `${w}px`, 'border-top-right-radius': '0', 'border-bottom-right-radius': '0'
                };
            },
            cssTooltip(width, elmnt, date, limitW) {        // date == time milisec
                var de = elmnt.querySelector('.fakeTlpEnd');
                var ds = elmnt.querySelector('.fakeTlpStart');
                var dStr = '';
                if (!ds || !de) return;
                if (!date) dStr = de.innerText;
                else dStr = kendo.toString(new Date(date), "d", kLg.languageCode);
                if (limitW) width = limitW;
                if (width < 113) {     // tong chieu rong 2 tooltip
                    show1Tooltip();
                } else {
                    show2Tooltip();
                    var $ds = $(ds);
                    if ($ds.offset().left < 300) {
                        show1Tooltip();
                    }                    
                }
                
                function show1Tooltip() {
                    de.innerText = `${ds.innerText} - ${dStr}`;
                    ds.style.display = 'none';      // ẩn tooltip start-date đi
                    de.style.minWidth = '174px';    // hiển thị Start-End trong tooltip end-date
                    var $de = $(de);
                    if ($de.offset().left < 300) {
                        de.style.right = '-132px';
                    }
                }
                function show2Tooltip() {
                    ds.style.display = '';          // hiện lại tooltip start-date
                    de.style.minWidth = '';
                    de.style.right = '-36px';
                    de.innerText = dStr;            // tách start-date
                }
            },
            stopResizeEndDate() {
                // #region update data in msRoadmapApp.MasterBlocks
                var isReloadData = false;
                if (vmCommon.elm) {
                    // #region call Handler
                    this.IsUpdatingOnServer = true;
                    const entryD = {
                        Id: vmCommon.elm.Id, TypeId: vmCommon.elm.TypeId,
                        NewDate: !isNaN(vmCommon.endDate) ? new Date(vmCommon.endDate) : vmCommon.elm.End.jsonToDate()
                    }
                    entryD.NewDate = entryD.NewDate.toServerDate();
                    isReloadData = vmCommon.isElementActionHasActivity || vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Activity || vmCommon.IsElementHasConnectionDown;
                   
                    // #region Kiểm tra endDate < TimeRangeFrom || TimeRangeTo < endDate thì load lại (Goal/Action/Activity)
                    const eD = new Date(new Date(vmCommon.endDate).toDateString()).getTime();         // 0:00 end
                    if (this.TimeRangeFrom && vmCommon.endDate) {
                        const fT = new Date(new Date(this.TimeRangeFrom).toDateString()).getTime();          // 0:00 TimeRangeFrom
                        if (eD < fT) isReloadData = true;
                    }
                    // #endregion Kiểm tra endDate kéo vượt quá TimeRange
                    vmGoalAction.dataservice.changeEndDate(entryD, function (res) {
                        // if (isReloadData) {
                        //     msRoadmapApp.reloadData();
                        // }
                    });
                    // #endregion call Handler

                    if (!isNaN(vmCommon.endDate))
                        vmCommon.elm.End = getDateJson(vmCommon.endDate);
                }
                // #endregion
                document.documentElement.removeEventListener("mousemove", this.draggingEndDate, false);
                document.documentElement.removeEventListener("mouseup", this.stopResizeEndDate, false);
                document.querySelector('.body-content').removeEventListener('wheel', disableMouseWheel);
                
                if (!isReloadData) msRoadmapApp.IsUpdatingOnServer = false;
                msRoadmapApp.removeFakeElmBox();
            },
            draggingEndDate(e) {
                const dX = e.clientX - vmCommon.startX;
                if (isNaN(dX)) {
                    msRoadmapApp.removeFakeElmBox();
                }
                if (vmCommon.ViewMinX > dX) return;     // Vượt quá sang view của Block

                var dT = Math.floor(dX / (msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit : msRoadmap.mUnit));
                dT = dT * 24 * 3600 * 1000;
                const Edate = vmCommon.eDate + dT;
                var endD00 = new Date(new Date(Edate).toDateString()); // 0h00
                endD00 = endD00.getTime();

                switch (true) {
                    case endD00 > vmCommon.ViewMaxX:    // Nếu End Vượt quá ViewTo thì dừng lại
                    case vmCommon.LimitDownStream && endD00 < vmCommon.LimitDownStream - 24000 * 3600:// Kéo Activity (Cha Action là DownStream)
                    case vmCommon.limitEndTime && endD00 < vmCommon.limitEndTime:       // kéo End vượt quá Start
                        // Dùng switch cho đỡ phải viết nhiều if 
                        return;
                    default: break;
                }
                const minW = msRoadmapApp.ViewTypeId == 0 ? msRoadmap.qUnit * 7 : msRoadmap.mUnit * 7;
                const dW = vmCommon.startWidth + dX;
                if (!isNaN(dW) && dW > minW)    // vẽ width khi End-Start > minW (px)
                {          
                    vmCommon.elmnt.style.width = dW + "px";
                    vmCommon.elmnt.style.minWidth = dW + "px";
                    vmCommon.elmnt.style.maxWidth = dW + "px";
                    if (msRoadmapApp.ViewTypeId == 1)   // view month
                        vmCommon.elmnt.firstElementChild.style.maxWidth = dW + "px";
                }

                if (dW > -1 && !isNaN(Edate)) {      // check trường hợp kéo End date < Start date
                    var isTllpl = false;
                    vmCommon.elmnt.setAttribute('data-end', Edate);// update tooltip
                    vmCommon.endDate = Edate;
                    if (!isNaN(vmCommon.widthCutTimeRange)) {       // có TimeRangeFrom và bị cắt 
                        var de = vmCommon.elmnt.querySelector('.fakeTlpEnd');
                        if (dW + vmCommon.widthCutTimeRange < 132) {
                            this.cssTooltip(dW, vmCommon.elmnt, Edate, dW + vmCommon.widthCutTimeRange - 32);
                            isTllpl = true;
                            de.classList.add('pinFakeTlpEnd');
                        } else {
                            de.classList.remove('pinFakeTlpEnd')
                        }
                    }
                    if (!isTllpl) this.cssTooltip(dW, vmCommon.elmnt, Edate)
                }
            },
            startResizeEndDate(e) {
                if (isNaN(vmCommon.countAdjustStartEnd)) vmCommon.countAdjustStartEnd = 1;
                else vmCommon.countAdjustStartEnd += 1;
                // Chống click đúp (vmCommon.countAdjustStartEnd == 1)
                if (!vmCommon.readyAdjustStartEnd) {
                    vmCommon.readyAdjustStartEnd = setTimeout(function () {
                        if (vmCommon.countAdjustStartEnd == 1) {
                            vmCommon.IsMouseoverAdjustDate = true;
                            vmCommon.elmnt = document.querySelector('.fakeElmContentAdjust');
                            vmCommon.startX = e.clientX;            // gốc tọa độ X
                            msRoadmapApp.setLimitMinMaxX(e);
                            vmCommon.startWidth = parseInt(document.defaultView.getComputedStyle(vmCommon.elmnt).width, 10);        // Width lúc bắt đầu kéo
                            document.documentElement.addEventListener("mousemove", msRoadmapApp.draggingEndDate, false);
                            document.documentElement.addEventListener("mouseup", msRoadmapApp.stopResizeEndDate, false);
                            document.querySelector('.body-content').addEventListener('wheel', disableMouseWheel);
                            var t = vmCommon.elmnt.getAttribute('data-end');
                            if (t)
                                vmCommon.eDate = +t;
                            //#region set limit end (để kiểm tra trường hợp Kéo End == Start)
                            var s = vmCommon.elmnt.getAttribute('data-start');      //
                            s = new Date(new Date(+s).toDateString()); // 0h00
                            const s00 = s.getTime();     // time
                            if (vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Action) {
                                const maxStartInChild = vmCommon.relativeItems.map(act => new Date(act.Start.jsonToDate().toDateString())).reduce((a, b) => Math.max(a, b), 0);   // time 0:00
                                if (maxStartInChild > s00) {
                                    vmCommon.limitEndTime = maxStartInChild;    // Action có nhiều activity => Ko cho phép kéo quá start date lớn nhất của activity thuộc nó 
                                } else
                                    vmCommon.limitEndTime = s00;
                            } else {
                                vmCommon.limitEndTime = s00;
                            }

                            var viewF = new Date(new Date(msRoadmapApp.ViewFrom).toDateString());    // 0h00
                            viewF = viewF.getTime();     // time
                            if (s00 < viewF && vmCommon.limitEndTime == s00) {
                                vmCommon.limitEndTime = viewF
                            }
                            //#endregion set limit end (để kiểm tra trường hợp Kéo End == Start)
                            if (vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Action) {  // neu Action co Acitvity
                                const actv = document.querySelectorAll(`div[lbling-parent-id="${vmCommon.elm.Id}"]`);
                                if (actv.length) vmCommon.isElementActionHasActivity = true;
                            }
                        }
                    }, 99);
                }
                if (!isNaN(vmCommon.countAdjustStartEnd) && vmCommon.countAdjustStartEnd > 1) {
                    if (vmCommon.readyAdjustStartEnd) {
                        clearTimeout(vmCommon.readyAdjustStartEnd);
                        delete vmCommon.readyAdjustStartEnd;
                    }
                }
            },
            compareDay(time1, time2) {
                // chỉ so sánh ngày không so sánh giờ, phút, giây 
                var d1 = new Date(time1);
                d1 = new Date(d1.toDateString());
                var d2 = new Date(time2);
                d2 = new Date(d2.toDateString());
                return d2.getTime() - d1.getTime();
            },
            clearAdjustStartEnd() {
                if (vmCommon.elmnt) return;
                msRoadmapApp.removeFakeElmBox();
                const left = document.querySelector('.fakeElmAdjStart');
                if (left) left.removeEventListener("mousedown", msRoadmapApp.startDragStartDate);
                const right = document.querySelector('.fakeElmAdjEnd');
                if (right) right.removeEventListener("mousedown", msRoadmapApp.startResizeEndDate);
            },
            removeFakeFrzAdjustSETimeRngFrom() {
                const leftBlck = document.querySelector('.dnbFakeFrzAdjustSETimeRangeFrom');
                if (leftBlck) leftBlck.remove();
            },
            setLimitMinMaxX(e) {
                const vqOm = document.querySelector('.dnb-msa-elements-overview');
                const vFlt = document.querySelector('#colume-name-id-filterdepth');
                if (vqOm && vFlt) {
                    vmCommon.ViewMinX = vqOm.offsetLeft + vFlt.offsetWidth - e.clientX;
                }

                var viewTo00 = new Date(new Date(this.ViewTo).toDateString()); // 0h00
                vmCommon.ViewMaxX = viewTo00.getTime();
                const viewFrom00 = new Date(new Date(this.ViewFrom).toDateString()); // 0h00
                vmCommon.ViewMinTimeX = viewFrom00.getTime();

                if (vmCommon.elm && vmCommon.elm.TypeId == vmCommon.RMGoalActionType.Activity) {       // Kéo Activity có UpStream
                    const ac = this.getActionDownStream(vmCommon.elm.ParentId);       // Action cha có UpStream 
                    const $elmA = $(`[adjust-se-id="${vmCommon.elm.ParentId}"]`);
                    if (ac && $elmA.length) {
                        vmCommon.ViewMinX = $elmA.offset().left - e.clientX;
                        if (ac.ActionStart) {
                            vmCommon.LimitDownStream = new Date(ac.ActionStart.jsonToDate().toDateString()); // 0h00
                            vmCommon.LimitDownStream = vmCommon.LimitDownStream.getTime();
                        }
                    }
                }
            },
            // #endregion Roadmap: Change start and end date with mouse
            // #region Update Index
            updateSortable(entry) {
                if (isNaN(entry.SrcGoalActionTypeId) || !entry.SrcGoalActionId ||
                    isNaN(entry.PositionId) ||
                    !entry.DesGoalActionId || isNaN(entry.DesGoalActionTypeId))
                    return Promise.all([0]);
                
                const entryO = this.findSortableEntry(entry);
                return msRoadmap.dataService.changeGoalActionIndex(entryO).then(function (res) {
                    return res.value;
                });
            },
            findSortableEntry(entry) {
                const desId = entry.DesGoalActionId;
                const srcType = entry.SrcGoalActionTypeId;
                const desType = entry.DesGoalActionTypeId;
                
                const des = {
                    SrcGoalActionTypeId: srcType,
                    SrcGoalActionId: entry.SrcGoalActionId,
                    PositionId: entry.PositionId,

                    DesGoalActionId: desId,
                    DesGoalActionTypeId: desType
                };
                
                // Kéo SubGoal tương tác với Action
                if (srcType == vmCommon.RMGoalActionType.SubGoal && desType == vmCommon.RMGoalActionType.Action) {
                    var d = this.findElement(desId, desType);
                    if (d) {
                        des.DesGoalActionId = d.ParentId;
                        des.DesGoalActionTypeId = vmCommon.RMGoalActionType.SubGoal;
                    }
                    return des;
                }
                // Kéo MainGoal tương tác với Action
                if (srcType == vmCommon.RMGoalActionType.MainGoal && desType == vmCommon.RMGoalActionType.Action) {
                    var d = this.findElement(desId, desType);
                    if (!d) {
                        // Trường hợp FilterDeep untick Action đi (trong data chỉ có Activity)
                        d = this.findElement(null, vmCommon.RMGoalActionType.Activity, desId);
                    }
                    if (d) {
                        des.DesGoalActionId = d.MaingoalId;
                        des.DesGoalActionTypeId = vmCommon.RMGoalActionType.MainGoal;
                    }
                    return des;
                }
                // kéo MainGoal tương tác với Sub
                if (srcType == vmCommon.RMGoalActionType.MainGoal && desType == vmCommon.RMGoalActionType.SubGoal) {
                    var d = this.findElement(desId, desType);
                    if (d) {
                        des.DesGoalActionId = d.ParentId;
                        des.DesGoalActionTypeId = vmCommon.RMGoalActionType.MainGoal;
                    }
                    return des;
                }
                
                return des;
            },
            findElement(id, typeId, parentId) {
                let element, iElm = -1;
                msRoadmapApp.MasterBlocks.find((block, b) => {
                    block.ParentRegionRMs.find((region, r) => {
                        region.ChildStakeHolders.find((stk, s) => {
                            stk.Categories.find((cate, c) => {
                                cate.Elements.find((elm, e) => {
                                    if (elm.Id == id && elm.TypeId == typeId) {
                                        element = elm;
                                        iElm = e;
                                    }
                                    if (typeId == vmCommon.RMGoalActionType.Activity && parentId && elm.ParentId == parentId) {
                                        // Filter deep khi untick Action
                                        element = elm;
                                        iElm = e;
                                    }
                                    if (iElm > -1) return true;     // break loop Elements
                                });
                                if (iElm > -1) return true;     // break loop Categories
                            });
                            if (iElm > -1) return true;     // break loop ChildStakeHolders
                        });
                        if (iElm > -1) return true;     // break loop ParentRegionRMs
                    });
                    if (iElm > -1) return true;     // break loop MasterBlocks
                });
                return element;
            },
            // #endregion Update Index
            
            resetExpandPathBlocks() {
                this.LstVisibleInView.filter(block => {
                    block.IsBlockExpand = true;
                    return true;
                });
            },
            setStyleBody() {                
                if (window.devicePixelRatio >= 1.25 || $(window).width() < 1600) {
                    var $nav = $('.ms-header[role="navigation"]');
                    var width = $nav.width();

                    $('.body-content').css({
                        'display': 'inline-block', 'max-width': width + 'px', 'min-width': width + 'px'
                    });
                } else {
                    $('.body-content').css({ 'display': '', 'max-width': '', 'min-width': '' });
                }

                if (this.IsSharepoint) {
                    var hei = $(window).height();
                    $('.body-content').css('height', hei);
                    if (window.devicePixelRatio >= 2) {
                        $('.body-content').css('width', $(window).width());
                    } else {
                        $('.body-content').css('width', '100%');                        
                    }
                    this.stickTabView(0); // da dung css
                }

                this.MaxRowElements = Math.ceil($(window).height() / 34);
            },
            stickTabView(timeScrollBefore) {  // dung css
                var mgLeft = $(window).width() / 2 - $('.navi-place').children().outerWidth() + 23;
                $(".navi-place").css({ "margin-left": mgLeft + timeScrollBefore });
            },
            setHeightForView(rowsElement, rowsRegion, rowsBlock) {
                var viewHeight = rowsElement * 34;       // 34px height each row
                viewHeight += rowsRegion * 12;
                if(rowsBlock > 0) viewHeight += (rowsBlock * 38 - 9); // first block not padding top
                viewHeight += 105;       // padding top 105px
                
                if (viewHeight < 570 || rowsElement < 1) {
                    viewHeight = 570;
                }
                
                this.ViewHeight = viewHeight;
                if (this.IsSharepoint) {
                    this.ViewHeight += 494;
                }
                this.setHeightView();       // use for checkbox labaling
            },
            getData() {
                msRoadmap.dataService.getData().then(function (res) {
                    msRoadmapApp.updateDataFrom(res.value);
                    msRoadmapApp.isShowDepth = !window.location.pathname.includes('MsRoadmapSharepoint.aspx');
                });
            },
            reloadData(callback) {
                var showFinishedElements = null;
                if (typeof msFilter != "undefined" && msFilter.controlService.isReady()) {
                    showFinishedElements = msFilter.controlService.isShowFinishedElements();
                }

                msRoadmap.dataService.getData({ ShowFinishedElements: showFinishedElements }).then(function (res) {
                    msRoadmapApp.LstVisibleInView.splice(0);
                    msRoadmapApp.MasterBlocks = res.value.Data; // res.value.Data
                    msRoadmapApp.setDefaultExpand(msRoadmapApp.MasterBlocks);
                    msRoadmapApp.ActionStreams = res.value.ActionStreams;
                    msRoadmapApp.ActionCostConnections = res.value.ActionCostConnections;
                    if (!isNaN(res.value.Role)) msRoadmapApp.Role = res.value.Role;
                    if (res.value.RegionThemaRoles)
                        msRoadmapApp.RegionThemaRoles = res.value.RegionThemaRoles;
                    msRoadmapApp.IsUpdatingOnServer = false;
                    if (typeof callback == 'function') callback();
                });
            },
            getActionDownStream(aId) {
                var a = this.ActionStreams.find(a => a.ActionId.toLowerCase() == aId.toLowerCase());
                return a;
            },
            findActionDownStream(aId) {
                return this.ActionStreams.find(a => a.UpActionId.toLowerCase() == aId.toLowerCase());
            },
            findActionCostConnection(act) {
                return this.ActionCostConnections.find(a => a.ActivityId == act.Id && a.ActionId == act.ParentId);
            },
            findThemaRegionRole(iChildhoder, iPrarent, iBlock) {
                if (this.RegionThemaRoles == null || typeof this.RegionThemaRoles != 'object') return;
                if (isNaN(iPrarent) || isNaN(iBlock) || isNaN(iChildhoder)) return;
                const elm = this.MasterBlocks[iBlock].ParentRegionRMs[iPrarent];
                if (!elm) return;
                
                const elm2 = elm.ChildStakeHolders[iChildhoder];
                if (elm2 && elm.RegionId == 0) {    // Vùng Independence
                    return this.RegionThemaRoles.ThemaRoles.find(t => t.Id == elm2.Id)
                } else {                        // Vùng Region 
                    return this.RegionThemaRoles.RegionRoles.find(r => r.Id == elm.RegionId);
                }
            },
            setTimeRange(s, e) {
                //if (!s && !e) return;

                if (s) {
                    if (typeof s === "string") {
                        if (s.indexOf("/Date") === -1) {
                            s = new Date(s);
                        } else {
                            s = s.jsonToDate();
                        }
                    }

                    let start = s;
                    start = new Date(start.toStringYYYYMMDD());
                    this.TimeRangeFrom = start.toStringYYYYMMDD();

                } else {
                    this.TimeRangeFrom = undefined;

                }

                if (e) {
                    if (typeof e === "string") {
                        if (e.indexOf("/Date") === -1) {
                            e = new Date(e);
                        } else {
                            e = e.jsonToDate();
                        }
                    }

                    let end = e;
                    end = new Date(end.toStringYYYYMMDD());
                    this.TimeRangeTo = end.toStringYYYYMMDD();

                } else {
                    this.TimeRangeTo = undefined;

                }
            },
            updateDataFrom(value, isOnFilter) {
                if (this.IsSharepoint) {
                    this.MenuLabeling.IsMain = value.SubFilter.IsMainPath;
                    this.MenuLabeling.IsSub = value.SubFilter.IsSubPath;
                    this.MenuLabeling.IsAction = value.SubFilter.IsActionPath;
                    this.ClientIp = value.ClientIp;
                }
                if (value.ActionStreams) this.ActionStreams = value.ActionStreams;
                if (value.ActionCostConnections) this.ActionCostConnections = value.ActionCostConnections;
                if (!isNaN(value.Role)) this.Role = value.Role;
                if (value.RegionThemaRoles)
                    this.RegionThemaRoles = value.RegionThemaRoles;
                var viewTypeId = value.ViewTypeId;
                if ((viewTypeId != null && viewTypeId != undefined) && this.ViewTypeId != viewTypeId) {        // prevent rebind view, use for reload data from edit form, ...
                    this.ViewTypeId = viewTypeId;
                } else if (this.ViewTypeId == undefined || this.ViewTypeId == null) {
                    this.ViewTypeId = 0;    // default view quarter
                }

                this.subFilter = value.SubFilter || new SubFilter();
                var dataServer = value.Data;
                var timeRange = value.TimeRange;    // neu khong co timerange thi TimeRange = null

                this.LstVisibleInView.splice(0);
                this.MasterBlocks = dataServer;
                this.setDefaultExpand(this.MasterBlocks);

                if (timeRange) {
                    if (timeRange.Start) {
                        let start = timeRange.Start.jsonToDate();
                        start = new Date(start.toStringYYYYMMDD());
                        this.TimeRangeFrom = start.toStringYYYYMMDD();
                        
                    } else {
                        this.TimeRangeFrom = undefined;
                        
                    }
                    if (timeRange.End) {
                        let end = timeRange.End.jsonToDate();
                        end = new Date(end.toStringYYYYMMDD());
                        this.TimeRangeTo = end.toStringYYYYMMDD();
                        
                    } else {
                        this.TimeRangeTo = undefined;
                        
                    }
                }
                this.IsHidePath = this.IsSharepoint ? value.IsHidePath : false;

                if (!isOnFilter) {
                    const mainLbling = this.subFilter.IsMainPath || false;
                    const subLbling = this.subFilter.IsSubPath || false;
                    const actionLbling = this.subFilter.IsActionPath || false;
                    this.setLabeling(mainLbling, subLbling, actionLbling);
                } else {
                    this.setLabeling();     // re-render
                }
            },
            onHoverTitle(text, e) {
                if (e.target.nodeName == "SPAN") return;
                var $target = $(e.target);
                
                if ($target.children().first().height() > 40) {
                    showTooltip();
                }

                function showTooltip() {
                    var tooltip = $target.kendoTooltip({
                        autoHide: true,
                        content: text,
                        color: "#00FFFF",
                        width: 270,
                        hide: function () {
                            var tt = $(this.element).data("kendoTooltip");
                            if (tt) tt.destroy();
                            $('html').css('overflow', '');
                        },
                        show: function (evnt) {
                            evnt.sender.content.css('word-break', 'break-word');
                            evnt.sender.popup.wrapper.css('opacity', '');    // bo opacity de hien thi lai (xy ly truong hop bi nhay' tooltip)
                        }
                    }).data("kendoTooltip");
                    tooltip.show();
                    tooltip.popup.wrapper.css('opacity', 0);    // cho opacity = 0 de tool tip khong bi nhay
                }
            },
            updateViewWidth() {
                var width = 0;
                const calendarView = this.$el.querySelector('.dnb_calendar_view');
                if (calendarView) {
                    width = calendarView.scrollWidth + 17;
                }
                const pathView = this.$el.querySelector('.dnb_view_path');
                if (pathView) {
                    width += pathView.offsetWidth;
                } else if (this.IsAllItemNull) {
                    width += 300;
                }

                if (width != this.ViewWidth) {
                    this.ViewWidth = width;
                }
            },
            
            setDefaultExpand(masterBlocks) {
                var exps = [];
                masterBlocks.filter(mb => {
                    mb.ParentRegionRMs.filter(pr => {
                        const ParentRegionId = pr.Id;
                        pr.ChildStakeHolders.filter(cs => {
                            const StakeHolderId = cs.Id
                            cs.Categories.filter(ct => {
                                const CategoryId = ct.Id;
                                const elms = ct.Elements;
                                ct.Elements.filter(e => {
                                    const id = e.Id;  // main || sub || action
                                    var Childs = elms.filter(eChl => eChl.ParentId == id).map(eChl => eChl.Id);
                                    var GrandChilds = elms.filter(eChl => eChl.MaingoalId == id).map(eChl => eChl.Id);
                                    var GrandPaChilds = elms.filter(eChl => eChl.SubGoalId == id).map(eChl => eChl.Id);

                                    // set default Expand
                                    if (Childs.length > 0 || GrandChilds.length > 0 || GrandPaChilds.length > 0) {
                                        const descendants = [].concat.apply([], [Childs, GrandChilds, GrandPaChilds]);
                                        exps.push({
                                            ParentRegionId: ParentRegionId, StakeHolderId: StakeHolderId, CategoryId: CategoryId,
                                            Id: id, TypeId: e.TypeId, IsExpand: true, Descendants: descendants
                                        });
                                    }
                                    return true;
                                });
                                return true;
                            });
                            return true;
                        });
                        return true;
                    });
                    return true;
                });
                this.ListExpands = exps;
            },
            getElements(masterBlocks, loadIndex, isAll) {
              //  vmCommon.DainbLogTimeStart = Date.now();
                const isLbling = this.MenuLabeling.IsMain || this.MenuLabeling.IsSub || this.MenuLabeling.IsAction;
                masterBlocks = vmCommon.deepCopy(masterBlocks);
                let minStart, maxEnd, maxStartWhenEndDateNull;
                var allItemEndNull = true;
                var rowElements = 0, rowBlocks = 0, rowRegions = 0,
                    hasBlock = false,
                    maxIndex = 0;
                var cssChild = 0;
                var isAllItemNull = true;
                const lstVsbInV = msRoadmapApp ? msRoadmapApp.LstVisibleInView : [];
                const isInit = lstVsbInV.length < 1;
                // loop: use filter return true because vuejs not support forEach)
                var prRet = loopMasterBlocks(masterBlocks);
                function loopMasterBlocks(arrMasterBlock) {
                    hasBlock = arrMasterBlock.length > 1 || (arrMasterBlock.length > 0 && arrMasterBlock[0].Path);
                    arrMasterBlock.filter((blook, iBlock) => {
                        loopParentRegions(blook.ParentRegionRMs, iBlock);
                        rowBlocks += 1;
                        return true;
                    });
                    return arrMasterBlock;
                }

                function loopParentRegions(arrParentRegion, iBlock) {
                    isAllItemNull = arrParentRegion.length < 1;
                    arrParentRegion.filter((pr, iParent) => {                        
                        loopChildStakeHolders(pr.ChildStakeHolders, iParent, iBlock);
                        
                        maxIndex += 1;

                        return true;
                    });
                }
                
                function loopChildStakeHolders(arrChildStakeHolder, iParent, iBlock) {
                    rowRegions += arrChildStakeHolder.length;

                    arrChildStakeHolder.filter((cs, iChildhoder) => {
                        cssChild += 1;
                        cs.ClassOdd = 'child-stakeholder-' + (cssChild % 2);

                        let totalRows = loopCategories(cs.Categories);
                        if (totalRows > 1) {
                            cs.ClassWordBreak = 'rm-child-stakeholder-head';
                        } else {
                            cs.ClassOneElement = 'rm-only-one-category';
                        }

                        rowElements += totalRows;

                        let isblkExpnd = cs.IsBlockExpand || true;
                        const _ooo = {
                            iBlock: iBlock, iParent: iParent, iChildhoder: iChildhoder, IsBlockExpand: isblkExpnd
                        }
                        if (!isAll) {
                            if(!isLbling) {
                                let tHeight1Blk = totalRows * 34;
                                tHeight1Blk += 5;
                                cs.TotalHeight1Block = tHeight1Blk < 91 ? 91 : tHeight1Blk;
                            } else {
                                delete cs.TotalHeight1Block;
                            }
                            let iissVV = cs.IsVisibleInView || true;       // biến isVisible trong 1 block
                            if (isInit) {
                                // Data lúc đầu
                                if (rowElements > 415) {        // Đếm 415 row đầu tiên
                                    if ((iChildhoder > 0 || iParent > 0 || iBlock > 0)) {
                                        // Nếu là block tiep theo
                                        iissVV = false;
                                    }
                                } else {
                                    isVsbInV = true;
                                    iissVV = true;
                                }
                                _ooo.IsVisibleInView = iissVV;

                                lstVsbInV.push(_ooo);
                                cs.IsVisibleInView = iissVV;
                            }

                            cs.IsBlockExpand = isblkExpnd;
                        } else {
                            
                            cs.IsVisibleInView = true;
                            cs.IsBlockExpand = isblkExpnd;
                        }

                        return true;
                    });
                }
                
                function loopCategories(arrCategory) {
                    let totalRows = 0;
                    arrCategory.filter(ct => {
                        loopElements(ct.Elements);  // convert start/end date from string to datetime

                        let elms = msRoadmapApp.getGoalActionLines(ct.Elements);     // array of array (row)
                        let rows = elms.length;

                        ct.Elements = elms;
                        totalRows += rows;
                        return true;
                    });

                    return totalRows;
                }

                function loopElements(arrElement) {
                    arrElement.filter(e => {
                        if (!e.Start) return false;
                        let srtD = e.Start.jsonToDate();
                        srtD = new Date(srtD.toStringMMDDYYYY());       // Chuyen ve 0 gio

                        checkMinStart(srtD);

                        e.Start = srtD;
                        if (e.End) {
                            allItemEndNull = false;
                            let ednD = e.End.jsonToDate();
                            ednD = ednD.getTime() + 24 * 3600 * 1000;       // chuyen ve ngay hom sau
                            ednD = new Date(ednD);
                            ednD = new Date(ednD.toStringMMDDYYYY());   // chuyen ve 0 gio

                            checkMaxEnd(srtD, ednD);

                            e.End = ednD;
                        } else {
                            setMaxSwEndNull(srtD);
                        }
                        return true;
                    });
                };
                function setMaxSwEndNull(start) {        // max Start date when End date null
                    if (!maxStartWhenEndDateNull) {
                        maxStartWhenEndDateNull = start;
                    } else {
                        if (maxStartWhenEndDateNull.getTime() < start.getTime()) {
                            maxStartWhenEndDateNull = start;
                        }
                    }
                }
                function checkMinStart(start) {
                    if (!minStart) {
                        minStart = start;
                    } else {                // get min Start Date
                        let mS = minStart;
                        if (mS.getTime() > start.getTime()) {
                            minStart = start;
                        }
                    }
                }

                function checkMaxEnd(start, end) {
                    // if end - start < 7 TODO end = start + 7
                    let miliSec8Days = 8 * 24 * 3600000;
                    if (end.getTime() - start.getTime() < miliSec8Days) {
                        end = start.getTime() + miliSec8Days;
                        end = new Date(end);
                    }

                    if (!maxEnd) {
                        maxEnd = end;
                    } else {            // get max End Date

                        let mE = maxEnd;
                        if (end.getTime() > mE.getTime()) {
                            maxEnd = end;
                        }
                    }
                }

                this.IsAllItemNull = isAllItemNull;

                return {
                    MaxIndex: maxIndex,
                    MasterBlocks: prRet, // mlst,
                  
                    IsAllItemEndNull: allItemEndNull,
                    HasBlock: hasBlock, MinStart: minStart,
                    RowsElement: rowElements, RowsRegion: rowRegions, RowsBlock: rowBlocks,
                    MaxEnd: maxEnd, MaxStartEndDateNull: maxStartWhenEndDateNull
                }
            },
            onHoverTooltip(element, e, isPath) {
                if (this.IsOpenPopPreview) return;
                if (e.target.nodeName != "SPAN") return;

                let endD,
                    tooltipObj = {
                        CategoryName: element.CategoryName,
                        Persons: element.Persons,
                        Start: kendo.toString(element.Start, "d", kLg.languageCode)
                    };
                
                if (element.End) {
                    endD = element.End.getTime() - 24 * 3600000;
                    endD = new Date(endD);
                    tooltipObj.End = kendo.toString(endD, "d", kLg.languageCode)
                }
                if (element.TypeId == vmCommon.RMGoalActionType.Activity) {
                    tooltipObj.Name = element.Description; // htmlEscape(element.Description);
                }
                else {
                    tooltipObj.Name = element.Name;// htmlEscape(element.Name);
                    (!isPath) && (tooltipObj.Arrived = element.Arrived);
                    (!isPath) && (tooltipObj.Effect = element.Effect);
                    (!isPath) && (tooltipObj.Purpose = element.Purpose);
                    (!isPath) && (tooltipObj.Description = element.Description);
                    
                    (!isPath) && (tooltipObj.ExpectedEffect = element.ExpectedEffect);
                    (!isPath) && (tooltipObj.ActualEffect = element.ActualEffect);

                    tooltipObj.OccuredEffect = element.OccuredEffect;
                }

                var $template = $("#tbHoverNameShowRmTooltip");
                var template = kendo.template($template.html());

                $elm = $(e.target);

                $('html').css('overflow', 'hidden');
                
                var viewH = $(window).height();
                var middleH = Math.ceil(viewH / 2);
                let offTop = $elm.offset().top;
                var popOpt = {
                    autoHide: true,
                    content: template(tooltipObj),
                    color: "#00FFFF",
                    hide: function () {
                        var tt = $(this.element).data("kendoTooltip");
                        if (tt) tt.destroy();
                        $('html').css('overflow', '');
                    },
                    show: function (evnt) {
                        let sender = evnt.sender;
                        let popH = sender.popup.wrapper.height();
                        
                        if ((middleH < offTop && offTop < viewH) && popH > (viewH * 2 / 3)) {
                            let arrowOffT = sender.arrow.offset().top;
                            let offsetTop = arrowOffT - popH - 6;

                            sender.popup.wrapper.css('top', offsetTop);
                            sender.arrow.css('top', popH);
                            sender.arrow.css('transform', 'scaleY(-1)');
                        }
                        sender.popup.wrapper.css('opacity', '');    // bo opacity de hien thi lai (xy ly truong hop bi nhay' tooltip)
                    }
                }; 
                if (isPath) {
                    popOpt.width = 410;
                }
                var tooltip = $elm.kendoTooltip(popOpt).data("kendoTooltip");
                tooltip.show();
                tooltip.popup.wrapper.css('opacity', 0);        // cho opacity = 0 de khong bi nhay' tooltip'
            },
            getViewQuarter(Elements, MinMaxDate, CurrentDate, TimeRangeFrom, TimeRangeTo) {
                var startDate = MinMaxDate.Start;
                var endDate = MinMaxDate.End;

                if (Elements.MasterBlocks.length < 1 && !TimeRangeFrom && !TimeRangeTo) {
                    startDate = CurrentDate.QuarterStart;
                    endDate = CurrentDate.QuarterEnd;
                }

                var mili12M = 335 * 24 * 60 * 60 * 1000;

                if (TimeRangeFrom) {
                    startDate = TimeRangeFrom;

                }

                if (TimeRangeTo) {
                    endDate = TimeRangeTo;

                    // lui lai start date 12 thang
                    if (!TimeRangeFrom && !this.IsSharepoint) {
                        var sD = new Date(startDate);
                        var eD = new Date(endDate);

                        if (Elements.MasterBlocks.length < 1 || eD.getTime() - sD.getTime() < mili12M) {
                            startDate = moveBack12Month(eD);
                        }

                    }
                }
                function moveBack12Month(eD) {
                    var m = eD.getMonth() + 1;
                    var sM = m == 12 ? 1 : (m + 1);
                    var sY = m == 12 ? eD.getFullYear() : eD.getFullYear() - 1;
                    var sD = new Date(sY, sM - 1, 1);
                    return new Date(sD).toStringMMDDYYYY();
                }

                if (!TimeRangeFrom && !TimeRangeTo && Elements.MasterBlocks.length > 0) {
                    var sD = new Date(startDate);
                    var eD = new Date(endDate);

                    if (MinMaxDate.MaxStartEndDateNull) {
                        endDate = MinMaxDate.MaxStartEndDateNull;
                        eD = new Date(endDate);
                        eD = eD.getTime() + mili12M - 28 * 24 * 3600 * 1000;
                    }
                   
                    endDate = new Date(eD).toStringMMDDYYYY();

                    // move start Date to start month in quarter
                    sD = new Date(startDate);
                    var sM = getStartMonthFrom(sD.getMonth() + 1);
                    startDate = new Date(sD.getFullYear(), sM - 1, 1).toStringMMDDYYYY();       // string mm/dd/yyyy

                    function getStartMonthFrom(m) {
                        if (m < 4) return 1;
                        if (m < 7) return 4;
                        if (m < 10) return 7
                        return 10;
                    };

                    eD = new Date(endDate);
                    var eM = getEndMonthFrom(eD.getMonth() + 1);
                    endDate = new Date(eD.getFullYear(), eM, 0).toStringMMDDYYYY();           // string

                    function getEndMonthFrom(m) {
                        if (m < 4) return 3;
                        if (m < 7) return 6;
                        if (m < 10) return 9
                        return 12;
                    }
                }

                if (!TimeRangeTo) {
                    var sD = new Date(startDate);
                    var eD = new Date(endDate);

                    if (Elements.MasterBlocks.length > 0) {
                        if (MinMaxDate.MaxStartEndDateNull) {
                            endDate = MinMaxDate.MaxStartEndDateNull;
                            eD = new Date(endDate);
                            endDate = expand12Month(eD);
                        }

                        if (eD.getTime() - sD.getTime() < mili12M) {
                            endDate = expand12Month(sD);
                        }
                    }
                    else {
                        endDate = expand12Month(sD);
                    }
                }

                function expand12Month(sD) {        // sD: date time

                    var m = sD.getMonth() + 1;
                    var eM = m == 1 ? 12 : (m - 1);
                    var eY = m == 1 ? sD.getFullYear() : sD.getFullYear() + 1;
                    var eD = new Date(eY, eM, 0);
                    return new Date(eD).toStringMMDDYYYY();
                }

                return {
                    Start: startDate,
                    End: endDate
                }
            },
            moveFirstLastDayInMonth(startDate, endDate) {
                // move to start date of month, end date of month
                var sD = new Date(startDate);
                startDate = new Date(sD.getFullYear(), sD.getMonth(), 1);
                startDate = startDate.toStringMMDDYYYY();

                var eD = new Date(endDate);
                endDate = new Date(eD.getFullYear(), eD.getMonth() + 1, 0);
                endDate = endDate.toStringMMDDYYYY();

                return {
                    Start: startDate,
                    End: endDate
                }
            },
            getViewMonth(Elements, MinMaxDate, CurrentDate, TimeRangeFrom, TimeRangeTo) {
                var startDate = MinMaxDate.Start;
                var endDate = MinMaxDate.End;

                if (Elements.MasterBlocks.length < 1 && !TimeRangeFrom && !TimeRangeTo) {
                    startDate = CurrentDate.MonthStart;
                    endDate = CurrentDate.MonthEnd;
                }

                var mil6M = 175 * 24 * 60 * 60 * 1000;      // 6 months - 1 week su dung cho ca -6 thang

                if (TimeRangeFrom) {
                    startDate = TimeRangeFrom;

                }

                if (TimeRangeTo) {
                    endDate = TimeRangeTo;

                    // limit startDate
                    var sD = new Date(startDate);
                    var eD = new Date(endDate);

                    // lui lai startDate 6 thang
                    if (!TimeRangeFrom && !this.IsSharepoint) {
                        if (Elements.MasterBlocks.length < 1) {
                            sD = eD;
                        }

                        if (eD.getTime() - sD.getTime() < mil6M) {
                            sD = eD.getTime() - mil6M;
                            startDate = new Date(sD).toStringMMDDYYYY();
                        }
                    }

                }

                if (!TimeRangeTo && Elements.MasterBlocks.length > 0) {
                    var sD = new Date(startDate);
                    var eD = new Date(endDate);

                    if (MinMaxDate.MaxStartEndDateNull) {      // has least one item endDate null
                        endDate = MinMaxDate.MaxStartEndDateNull;
                        eD = new Date(endDate);
                        endDate = add6Months(eD);
                    }

                    if (eD.getTime() - sD.getTime() < mil6M) {
                        endDate = add6Months(sD);
                    }
                }


                var weekS = this.getWeekObject(new Date(startDate));
                startDate = weekS.FromDate.toStringMMDDYYYY();
                var startWeek = weekS.Number;

                if (!TimeRangeTo && Elements.MasterBlocks.length < 1) {
                    if (startWeek > 51) {       // move to first week in current year
                        startWeek = 1;
                        startDate = weekS.ToDate.getTime() + 1 * 24 * 3600 * 1000;
                        startDate = new Date(startDate).toStringMMDDYYYY();
                    }
                    var eD = new Date(startDate);
                    endDate = add6Months(eD);
                }

                function add6Months(sD) {       // date time => return string mm/dd/yyyy
                    var eD = sD.getTime() + mil6M;
                    return new Date(eD).toStringMMDDYYYY();
                }

                return {
                    Start: startDate,
                    End: endDate,
                }
                
            },
            moveFirstLastDayInWeek(startDate, endDate) {
                // move first day of week - startDate
                weekS = this.getWeekObject(new Date(startDate));
                startDate = weekS.FromDate.toStringMMDDYYYY();      // date time
                var startWeek = weekS.Number;

                // move last day of week - endDate
                var week = this.getWeekObject(new Date(endDate));
                endDate = week.ToDate.toStringMMDDYYYY();
                var endWeek = week.Number;
                return {
                    Start: startDate,
                    End: endDate,
                    WeekS: startWeek, WeekE: endWeek
                }
            },
            saveViewStatus: function (typeId) {
                this.ViewTypeId = typeId;
                if (this.IsSharepoint) return;
                this.resetExpandPathBlocks();
                msRoadmap.dataService.saveViewStatus({ Value: typeId });
            },        
            mountedOnView() {
                $('.body-content').animate({
                    scrollLeft: 0
                }, 50);

                var ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf('safari') != -1) {
                    if (ua.indexOf('chrome') > -1) {
                        // Chrome
                    } else {
                        // Safari
                        $('.rm-text1line').addClass('rm-text1line-safari');
                    }
                }
            },
            getWeekObject(date) {     // Date time

                function moveBackMon(date) {
                    let day = date.getDay();        // day in week
                    if (kLg.language == 'de' || kLg.language == 'pm') {
                        day -= 1;
                        if(day < 0) day = 6
                    }
                    let deltaMiliS = day * 24 * 3600000;

                    let firstDinWeek = date.getTime() - deltaMiliS;
                    return new Date(firstDinWeek);
                }

                function getNumOfWeek(date) {
                    let year = date.getFullYear();
                    let firstDateY = new Date(year, 0, 1);
                    let deltaTime = date.getTime() - firstDateY.getTime();
                    deltaTime = deltaTime / 24 / 60 / 60 / 1000;
                    return Math.floor(deltaTime / 7);
                }

                let fromDate = moveBackMon(date);
                let toDate = new Date(fromDate.getTime() + 6 * 24 * 60 * 60 * 1000);        // add 6 days (1 week)
                let midDInW = new Date(fromDate.getTime() + 3 * 24 * 60 * 60 * 1000);       // add 3 days (mid week)

                return {
                    FromDate: fromDate,     // date time
                    ToDate: toDate,         // date time
                    Number: getNumOfWeek(midDInW) + 1
                };
            },
            setLabeling(isMain, isSub, isAction) {
                const isM = this.MenuLabeling.IsMain
                const isS = this.MenuLabeling.IsSub;
                const isA = this.MenuLabeling.IsAction;

                this.MenuLabeling.IsMain = false;       // set default to re-render key
                this.MenuLabeling.IsSub = false;        // set default to re-render key
                this.MenuLabeling.IsAction = false;     // set default to re-render key

                isMain = typeof isMain != 'undefined' ? isMain : isM;
                isSub = typeof isSub != 'undefined' ? isSub : isS;
                isAction = typeof isAction != 'undefined' ? isAction : isA;

                this.MenuLabeling.IsMain = isMain;
                this.MenuLabeling.IsSub = isSub;
                this.MenuLabeling.IsAction = isAction;
                
                this.setHeightViewNextTick();
            },
            resetLabeling() {
                this.setLabeling(false, false, false);
            },
            getIconToggle(element) {
                var icontoggle = 'none';
                const typeId = element.TypeId;
                if (!this.IsSharepoint) {
                    var eEx;
                    if (this.MenuLabeling.IsMain && typeId == vmCommon.RMGoalActionType.MainGoal) {
                        eEx = this.ListExpands.find(e => e.Id == element.Id && e.TypeId == typeId);
                    }
                    if (this.MenuLabeling.IsSub && typeId == vmCommon.RMGoalActionType.SubGoal) {
                        eEx = this.ListExpands.find(e => e.Id == element.Id && e.TypeId == typeId);
                    }
                    if (this.MenuLabeling.IsAction && typeId == vmCommon.RMGoalActionType.Action) {
                        eEx = this.ListExpands.find(e => e.Id == element.Id && e.TypeId == typeId);
                    }
                    if (eEx && eEx.Descendants.length > 0) {
                        if (eEx.IsExpand) icontoggle = 'font-arrow-down';
                        else icontoggle = 'font-arrow-right';
                    }                        
                }
                return icontoggle;
            },
            setHeightView() {                
                if (this.IsLabeling) {
                    $(this.$el).find('.rm-rms-h').each(function () {
                        $(this).css('max-height', '100%');
                    });

                    this.setHLineDOM($(this.$el), this.MenuLabeling);
                    
                } else {
                    $('.dnb--rm-mga-empty').remove();
                    $('.rm-path-labeling-showall').remove();
                    $(this.$el).find('.dnb-elm-name-maxh').css({ 'max-height': '' });
                    $('.dnb-elm-name-maxh').removeClass('dnb-elm-name-maxh');
                }

                $(this.$el).find('.rm-group-goalactions').each(function () {
                    var w = $(this).width();
                    $(this).find('.dnb-group-of-elements').css({ 'max-width': `${w}px` });
                });

                var _h = $('.dnb-msa-elements-overview .dnb-msa-view').height();
                if (this.IsSharepoint) {
                    _h += 303;
                }
                if (!_h) return;
                _h += 60;
                if (_h < 570) {
                    _h = 570;
                }
                this.ViewHeight = _h;
            },
            updateStyleDisplayHLineDOM() {
                if ($('.dnb--rm-mga-empty').length > 1)
                    $('.dnb--rm-mga-empty').each(function () {
                        const $next = $(this).next().find('.hline-islabeling');
                        if ($next.length && $next.offset().top - $(this).offset().top < 27) {
                            $next.hide();
                        }
                    });
            },
            setHLineDOM($this_, lbling, id) {
                if ($this_.find('.hline-islabeling.hline-elm').length > 0 && $this_.find('.dnb--rm-mga-empty').length < 1) {
                    if (lbling.IsMain && !lbling.IsSub) {
                        $this_.find('.hline-islabeling.hline-elm').each(function () {
                            const typeid = $(this).attr('typeid');
                            if (typeid == vmCommon.RMGoalActionType.Action || typeid == vmCommon.RMGoalActionType.Activity) {
                                const maingoalid = $(this).attr('maingoalid');
                                if ($this_.find(`div[dataid="${maingoalid}"]`).length > 0) {
                                    $(this).removeClass('hline-elm');
                                } else if ($this_.find(`div[maingoalid="${maingoalid}"]`).length > 1) {
                                    var _i = 0;
                                    $this_.find(`div[maingoalid="${maingoalid}"]`).each(function () {
                                        if (_i > 0) {
                                            $(this).removeClass('hline-elm');
                                        }
                                        _i++;
                                    });
                                }
                            }
                        });
                    }
                    if (lbling.IsSub) {
                        $this_.find('.hline-islabeling.hline-elm').each(function () {
                            const typeid = $(this).attr('typeid');
                            if (typeid == vmCommon.RMGoalActionType.Action) {
                                const parentid = $(this).attr('parentid');
                                if ($this_.find(`.rm-msa-labeling div[dataid="${parentid}"]`).length > 0) {
                                    $(this).removeClass('hline-elm');
                                }
                            }
                        });
                    }
                    
                    $this_.find('.hline-islabeling.hline-elm[typeid="4"]').each(function () {
                        const parentId = $(this).attr('parentid');
                        if ($this_.find(`.hline-islabeling.hline-elm[typeid="4"][parentid="${parentId}"]`).length > 1) {
                            var _i = 0;
                            $this_.find(`.hline-islabeling.hline-elm[typeid="4"][parentid="${parentId}"]`).each(function () {
                                if (_i > 0) {
                                    $(this).removeClass('hline-elm');
                                }
                                _i++;
                            });
                        };

                        const maingoalId = $(this).attr('maingoalid');
                        if ($this_.find(`.hline-islabeling[typeid="1"][dataid="${maingoalId}"]`).length > 0 && !lbling.IsSub) {
                            $(this).removeClass('hline-elm');
                        }

                        const $prev = $(this).closest('.rm-main-goal-action').prev();
                        if ($prev.length > 0) {
                            if ($prev.find('.hline-islabeling').attr('dataid') == parentId) {
                                $(this).removeClass('hline-elm');
                            }
                        }
                    });

                    $this_.find('.hline-islabeling.hline-elm').each(function () {
                        if ($(this).next().css('display') == 'none') {
                            $(this).remove();
                        } else {
                            const $msa = $(this).closest('.rm-main-goal-action');
                            var $next = $msa.next();
                            if ($next.find('.hline-islabeling.hline-elm').attr('parentid') == $(this).attr('parentid')) {
                                $next.find('.hline-islabeling.hline-elm').removeClass('hline-elm');
                            }
                        }
                    });
                    $this_.find('.hline-islabeling.hline-elm').each(function () {
                        if ($(this).attr('typeid') == vmCommon.RMGoalActionType.Action) {
                            const $msa = $(this).closest('.rm-main-goal-action');
                            const $next = $msa.next();
                            const $nextHL = $next.find('.hline-islabeling.hline-elm')
                            if ($nextHL.attr('typeid') == vmCommon.RMGoalActionType.Activity && $nextHL.attr('parentid') == $(this).attr('dataid')) {
                                $nextHL.removeClass('hline-elm');
                            }
                        }
                    });

                    var bParentId;
                    $this_.find('.hline-islabeling.hline-elm').each(function () {
                        var $this = $(this);
                        //const id = $this.attr('dataid');
                        const parentId = $this.attr('parentid');
                        const typeId = +($this.attr('typeid'));

                        const dataid = `[dataid="${parentId}"]`;

                        if (typeId > vmCommon.RMGoalActionType.Action) {        // activity = 4
                            const subgoalId = $this.attr('subgoalid');
                            const maingoalId = $this.attr('maingoalid');
                            var shouldAdd = true;
                            const hasM = $this_.find(`div[freezedid=${maingoalId}]`).length > 0;
                            const hasS = $this_.find(`div[freezedid=${subgoalId}]`).length > 0;
                            if ((hasM && hasS) || (!hasM && hasS)) {
                                shouldAdd = false;
                            }
                            if (!hasM && !hasS) {
                                shouldAdd = $this_.find(`div[typeid=2][dataid=${subgoalId}]`).length < 1;
                                shouldAdd = shouldAdd && $this_.find(`div[typeid=1][dataid=${maingoalId}]`).length < 1;
                            }
                            if (shouldAdd) {
                                addDivLblingEmpty($this, parentId, typeId - 1);
                            }
                        } else if (typeId > vmCommon.RMGoalActionType.SubGoal) {       // action = 3
                            const subgoalId = $this.attr('parentid');
                            const maingoalId = $this.attr('maingoalid');
                            var shouldAdd = true;
                            const hasM = $this_.find(`div[freezedid=${maingoalId}]`).length > 0;
                            const hasS = $this_.find(`div[freezedid=${subgoalId}]`).length > 0;
                            if ((hasM && hasS) || (!hasM && hasS)) {
                                shouldAdd = false;
                            }
                            if (!hasM && !hasS) {
                                shouldAdd = $this_.find(`div[typeid=2][dataid=${subgoalId}]`).length < 1;
                                shouldAdd = shouldAdd && $this_.find(`div[typeid=1][dataid=${maingoalId}]`).length < 1;
                            }
                            if (shouldAdd) {
                                addDivLblingEmpty($this, parentId, typeId - 1);
                            }
                        } else {        // main || sub
                            if ($this_.find(`div${dataid}`).length < 1 && bParentId != parentId) {
                               if (lbling.IsMain && typeId == vmCommon.RMGoalActionType.SubGoal) {
                                    const maingoalid = $this.attr('parentid');
                                    if ($this_.find(`div[maingoalid=${maingoalid}]`).length < 1) {
                                        addDivLblingEmpty($this, parentId, typeId - 1);
                                    }
                               } else {
                                    addDivLblingEmpty($this, parentId, typeId - 1);
                               }
                            } else if ((typeId == vmCommon.RMGoalActionType.Activity) && ($this_.find(`div[typeid=3]${dataid}`).length > 0)) {
                               addDivLblingEmpty($this, parentId, typeId - 1);
                            }
                        }

                    });
                    if (!id) {
                        $('.dnb-group-of-elements.msa-grp-elements-labaling .rm-main-goal-action.rm-msa-labeling.dnb--rm-mga-empty:first-child').remove();
                        $('.dnb-group-of-elements.msa-grp-elements-labaling .rm-main-goal-action.rm-msa-labeling.dnb--rm-mga-empty').each(function () {
                            var $this = $(this);
                            if ($this.next().hasClass('dnb--rm-mga-empty')) {
                                $this.next().remove();
                            } else if ($this.next().find('.hline-islabeling').css('width') == '300px') {
                                $this.remove();
                            }
                        });
                    } else {
                        $(`${id} .rm-main-goal-action.rm-msa-labeling.dnb--rm-mga-empty:first-child`).remove();
                        $(`${id} .rm-main-goal-action.rm-msa-labeling.dnb--rm-mga-empty`).each(function () {
                            var $this = $(this);
                            if ($this.next().hasClass('dnb--rm-mga-empty')) {
                                $this.next().remove();
                            } else if ($this.next().find('.hline-islabeling').css('width') == '300px') {
                                $this.remove();
                            }
                        });
                    }

                    setNameLabelingInPathShowAll($this_);

                    function addDivLblingEmpty($this, parentId, parentTypeId) {
                        var $msa = $this.closest('.rm-main-goal-action');
                        const parentid = $this.attr('parentid');
                        const maingoalid = $this.attr('maingoalid');
                        var attrs = '';
                        if (maingoalid) attrs += `maingoalid="${maingoalid}"`;
                        if (parentTypeId == vmCommon.RMGoalActionType.SubGoal) {    // action - 1
                            attrs += parentid ? `${attrs} subgoalid="${parentid}"` : '';
                        } else if (parentTypeId == vmCommon.RMGoalActionType.Action) {  // activity - 1
                            const subgoalid = $this.attr('subgoalid');
                            attrs += subgoalid ? `${attrs} subgoalid="${subgoalid}"` : '';
                        }
                        const tmp = `<div class="rm-main-goal-action rm-msa-labeling dnb--rm-mga-empty" typeid="${parentTypeId}" ${attrs}
                                                style="max-height: 1px;margin-top: -1px;">
                                                <div class="hline-islabeling"
                                                 style="width: 300px;margin-left: -308px;height: 1px;background-color: white;">
                                             </div></div>`;
                        var pxx = id ? '308px' : '300px';
                        if ($this.css('width') != pxx || ($this.css('display') == 'none')) {
                            $(tmp).insertBefore($msa);
                        }
                        (parentId) && (bParentId = parentId);
                    }
                    function setNameLabelingInPathShowAll($this) {
                        var $lstLbl = $this.find('.rm-main-goal-action.rm-msa-labeling');
                        if ($lstLbl.length > 0) {
                            if ($lstLbl.length > 1) {
                                var $prev;
                                $lstLbl.each(function () {
                                    if ($prev != undefined && $prev.length > 0) {
                                        var $_this = $(this).find('.hline-islabeling');
                                        if ($_this.length < 1) $_this = $(this);
                                        var $_prev = $prev.find('.dnb-inline-flex.rm-element-wrap');
                                        if ($_prev.length > 0) {
                                            var deltaH = $_this.offset().top - $_prev.offset().top;
                                            if (deltaH > 36 && $_prev.length > 0) {
                                                var $target = $_prev.find('.rm-msa-month-0');

                                                if ($target.length > 0) {
                                                    $prev.children('.dnb-overhidden').css({ 'overflow': 'initial' });
                                                    $target.css({ 'overflow': 'initial' });

                                                    $target.addClass('rm-path-labeling-showall');
                                                    deltaH = Math.round(deltaH) - 16;
                                                    var $rmTxt = $target.find('.rm-text1line');
                                                    if ($rmTxt.hasClass('dnb-ename-maingoal') || $rmTxt.hasClass('dnb-ename-subgoal')) {
                                                        deltaH -= 3;
                                                        deltaH = getHeight(deltaH);
                                                    } else if ($rmTxt.hasClass('dnb-ename-action')) {
                                                        deltaH -= 2;
                                                        if (id) deltaH += 8;
                                                    }
                                                    $rmTxt.addClass('dnb-elm-name-maxh').css({ 'max-height': `${deltaH}px` });
                                                    $rmTxt.find('.dnb-elm-name').addClass('dnb-elm-name-maxh').css({ 'max-height': `${deltaH}px` });
                                                    if (id || msRoadmap.isSharepoint()) {
                                                        $_prev.css('overflow', 'initial');
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    $prev = $(this);
                                });
                            }


                            $this.find('.rm-grp-parent .dnbScrollItem').each(function () {
                                const $lastLbl = $(this).find('.rm-main-goal-action.rm-msa-labeling').last();
                                if ($lastLbl.find('.rm-element-wrap').length > 0) {
                                    var $next = $lastLbl.next();
                                    if ($next.length > 0 && $next.hasClass('rm-main-goal-action')) {
                                        var h = $next.height();
                                        while ($next.next().hasClass('rm-main-goal-action')) {
                                            $next = $next.next();
                                            h += $next.height();
                                        }
                                        
                                        if (h > 32) {
                                            var $target = $lastLbl.find('.rm-msa-month-0');
                                            if ($target.length > 0) {
                                                $lastLbl.children('.dnb-overhidden').css({ 'overflow': 'initial' });
                                                $target.css({ 'overflow': 'initial' });

                                                $target.addClass('rm-path-labeling-showall');
                                                var $rmTxt = $target.find('.rm-text1line');
                                                if ($rmTxt.hasClass('dnb-ename-action')) {
                                                    h += 32;
                                                } else if ($rmTxt.hasClass('dnb-ename-maingoal') || $rmTxt.hasClass('dnb-ename-subgoal')) {
                                                    h += 23;
                                                    h = getHeight(h);
                                                    //} else if ($rmTxt.hasClass('dnb-ename-subgoal')) {
                                                    //    h += 28;
                                                }
                                                $rmTxt.addClass('dnb-elm-name-maxh').css({ 'max-height': `${h}px` });
                                                $rmTxt.find('.dnb-elm-name').addClass('dnb-elm-name-maxh').css({ 'max-height': `${h}px` });
                                                if (id || msRoadmap.isSharepoint()) {
                                                    $lastLbl.find('.rm-element-wrap').css('overflow', 'initial');
                                                }
                                            }
                                        }
                                    }

                                }
                            });
                        }
                        function getHeight(h) {
                            if (80 < h && h < 95) return 95;
                            if (115 < h && h < 127) return 127;
                            return h;
                        }
                    }
                    

                }
            },
            setHeightViewNextTick() {
                this.$nextTick(function () {
                    this.setHeightView();
                });
            },
            getClassName(element) {
                var _prefix = 'dnb-ename-';
                const typeId = element.TypeId;
                if (typeId < vmCommon.RMGoalActionType.SubGoal) _prefix = `${_prefix}maingoal`;
                else if (typeId < vmCommon.RMGoalActionType.Action) _prefix = `${_prefix}subgoal`;
                else if (typeId < vmCommon.RMGoalActionType.Activity) _prefix = `${_prefix}action`;
                else _prefix = `${_prefix}activity`;
                return _prefix;
            },
            getFontLabeling(element) {
                var s = { fontWeight: '700' };
                const typeId = element.TypeId;
                const lbling = this.MenuLabeling;
                if (typeId < vmCommon.RMGoalActionType.SubGoal && lbling.IsMain) {
                    s.fontSize = `13px`;
                    return s;
                }
                if (typeId < vmCommon.RMGoalActionType.Action && lbling.IsSub) {
                    s.fontSize = `13px`;
                    return s;
                }
                if (typeId < vmCommon.RMGoalActionType.Activity && lbling.IsAction) {
                    s.fontSize = `11px`;
                    return s;
                }
                return {};
            },
            onToggleLabelingOnFreezedPath($this) {
                if (this.IsSharepoint) return;  // khong ap dung cho sharepoint (neu ve sau ap dung thi bo dong code nay di)
                const elmid = $this.attr('elmid');
                const $lblingParent = $(this.$el).find(`div[freezedid="${elmid}"]`).first();

                const eEx = msRoadmapApp.ListExpands.find(e => e.Id == elmid);
                if (eEx) {
                    const isEx = !eEx.IsExpand
                    eEx.IsExpand = isEx;
                }
                
                const typeid = $lblingParent.hasClass('rm_labeling_maingoal') ? vmCommon.RMGoalActionType.MainGoal :
                    ($lblingParent.hasClass('rm-labeling-subgoal') ? vmCommon.RMGoalActionType.SubGoal :
                        ($lblingParent.hasClass('rm-labeling-action') ? vmCommon.RMGoalActionType.Action : -1));

                toggleLabelingOnPath($lblingParent.find('.dnb-elm-name'), typeid, this);
                
                this.reClonePath();
            },
            freezedPathOnScroll($this) {
                const scrollLeft = $this.scrollLeft();
                if (scrollLeft == this.ScrollLeft) return;

                if (scrollLeft > 23) {
                    var colClone = this.$el.querySelector('.dnb_25880_freezed_col_clone');
                    if (!colClone) {        // Dam bao code chi chay 1 lan
                        colClone = this.clonePath(this);
                        if (this.IsSharepoint) {
                            colClone.style.paddingBottom = '102px';
                        }
                    }
                    colClone.style.left = `${scrollLeft - 24}px`;
                } else {
                    const colClone = this.$el.querySelector('.dnb_25880_freezed_col_clone');
                    if (colClone) {
                        colClone.remove();
                        delete vmCommon.RmRootLstVsbInView;
                        delete vmCommon.RmRoot_onToggleLabelingOnFreezedPath;
                    }
                }
                this.ScrollLeft = scrollLeft;
            },
            clonePath(root, isAdjustEnd) {
                vmCommon.RmRootLstVsbInView = root.LstVisibleInView || [];
                vmCommon.RmRoot_onToggleLabelingOnFreezedPath = root.onToggleLabelingOnFreezedPath;     // function
                if (msRoadmapApp.IsOpenPopPreview) {
                    vmCommon.RmRootExptLstVsbInView = root.LstVisibleInView || [];
                    vmCommon.RmRootExpt_onToggleLabelingOnFreezedPath = root.onToggleLabelingOnFreezedPath;     // function
                }

                const this$el = root.$el;
                const masterBlock = this$el.querySelector('.dnb_25880_freezed_col');
                if (isAdjustEnd && document.querySelector('.dnb_25880_freezed_col_clone')) {
                    document.querySelector('.dnb_25880_freezed_col_clone').classList.add('dnbFakeFrzAdjustSETimeRangeFrom');
                    return;      // co roi thi thoi
                }
                const clone = masterBlock.cloneNode(true);
                clone.classList.add("dnb_25880_freezed_col_clone");
                if (document.querySelector('.fakeElmBox')) {
                    clone.classList.add("dnb_fakeElmBox");
                    $('.dnbViewonHideWhenExport.rm-view-quarter').addClass('dnb_fakeElmBox');
                }
                const parent = this$el.querySelector('.dnb_25880_freezed');
                parent.appendChild(clone);
                clone.style.backgroundColor = 'white';
                if (isAdjustEnd) {      // dùng cho kéo thay đổi End Date của Element 
                    const mW = parseInt(clone.offsetWidth);
                    const pad = 6;
                    clone.style.maxWidth = `${mW + pad}px`;
                    clone.style.paddingRight = `${pad}px`;
                    clone.classList.add('dnbFakeFrzAdjustSETimeRangeFrom');
                    return;
                }

                clone.querySelectorAll('.dnb_25880_freezed_item').forEach(function (node, i) {
                    node.querySelectorAll('.dnb_25880_freezed_dataParent').forEach(function (_dParent) {
                        var nodeData = _dParent.querySelector('.dnb_25880_freezed_data');
                        var dataH = 0;
                        if (nodeData) {
                            dataH = nodeData.offsetHeight;
                        }
                        if (dataH) _dParent.style.height = `${dataH}px`;
                        if (nodeData) removeDataNotLabeling(nodeData);
                    });
                });
                bindOnClick();
                return clone;

                function removeDataNotLabeling(nodeData) {
                    const nodeGrpLabeling = nodeData.querySelector('.msa-grp-elements-labaling');
                    if (!nodeGrpLabeling) {
                        nodeData.remove();
                        return;
                    }
                    nodeGrpLabeling.querySelectorAll('.rm-main-goal-action').forEach(function (element, i) {
                        if (!element.className.includes('rm-msa-labeling')) {
                            element.style.height = `${element.offsetHeight}px`;
                            while (element.firstChild) {
                                element.removeChild(element.lastChild);
                            }
                        }
                    });
                }
                function bindOnClick() {
                    $(this$el).find('.dnb_25880_freezed_col_clone .dnb_icon-toggle-collapse_expand').off('click').on('click', function () {
                        const iBlock = this.getAttribute('iblock'),
                            iParent = this.getAttribute('iparent'),
                            iChildhoder = this.getAttribute('ichild');
                        const lstVsbInV = msRoadmapApp.IsOpenPopPreview ? vmCommon.RmRootExptLstVsbInView : vmCommon.RmRootLstVsbInView;
                        if (lstVsbInV) {
                            const itm = lstVsbInV.find(e => e.iBlock == iBlock && e.iParent == iParent && e.iChildhoder == iChildhoder);
                            itm.IsBlockExpand = !itm.IsBlockExpand;
                        }
                    });
                    $(this$el).find('.dnb_25880_freezed_col_clone .dnb-icon_toggle').off('click').on('click', function () {
                        if (msRoadmapApp.IsOpenPopPreview) {
                            vmCommon.RmRootExpt_onToggleLabelingOnFreezedPath($(this));
                        } else {
                            vmCommon.RmRoot_onToggleLabelingOnFreezedPath($(this));
                            const id = $(this).attr('elmid');
                            const lstLblingCollapse = msRoadmapApp.LstLabelingIdCollapse;
                            const i = lstLblingCollapse.indexOf(id);
                            if (i < 0) {
                                lstLblingCollapse.push(id);
                            } else {
                                lstLblingCollapse.splice(i, 1);
                            }
                        }
                    });
                }
            },
            reClonePath() {
                if (!this.IsScrollX) return;        // khong co srollX
                var colClone = this.$el.querySelector('.dnb_25880_freezed_col_clone');
                if (colClone) {
                    colClone.remove();
                    const clone = this.clonePath(this);
                    if (this.IsSharepoint) {
                        clone.style.paddingBottom = '102px';
                    }
                    colClone = this.$el.querySelector('.dnb_25880_freezed_col_clone');
                    const scrollLeft = $('.body-content').scrollLeft();
                    if (this.ScrollLeft > 23 && scrollLeft > 24) {
                        const colClone = this.$el.querySelector('.dnb_25880_freezed_col_clone');
                        colClone.style.left = `${scrollLeft - 24}px`;
                    }
                }
            },
            freezedDepthAndLabeling(scrollLeft) {
                if (this.IsSharepoint) {
                    if (scrollLeft > 24) {
                        const cFdLbling = this.$el.querySelector('.dnb-ex_preview-f_depth_lbling');
                        if (cFdLbling) {
                            cFdLbling.classList.add('dnb-f_depth_lbling-freezed');
                            cFdLbling.style.left = `${scrollLeft - 24}px`;
                        }
                    } else if (-1 < scrollLeft && scrollLeft < 21) {
                        const cFdLbling = this.$el.querySelector('.dnb-ex_preview-f_depth_lbling');
                        if (cFdLbling) {
                            cFdLbling.classList.remove('dnb-f_depth_lbling-freezed');
                            cFdLbling.style.left = '';
                        }
                    }
                    return;
                }
                if (scrollLeft > 24) {
                    const cFdLbling = this.$el.querySelector('#colume-name-id-filterdepth');
                    if (cFdLbling) {
                        cFdLbling.classList.add('dnb-f_depth_lbling-freezed');
                        cFdLbling.style.left = `${scrollLeft - 17}px`;
                    }
                } else if (-1 < scrollLeft && scrollLeft < 21) {
                    const cFdLbling = this.$el.querySelector('#colume-name-id-filterdepth');
                    if (cFdLbling) {
                        cFdLbling.classList.remove('dnb-f_depth_lbling-freezed');
                        cFdLbling.style.left = '';
                    }
                }
            },
            getGoalActionLines(items) {
                function isAllActivityInNewLine(item) {
                    if (item.IsNewLine) return true;
                    let _pId = item.ParentId;
                    let _actvts = items.filter((e) => {
                        return (e.TypeId > vmCommon.RMGoalActionType.Action) && (e.ParentId == _pId);
                    });
                    // #region Kiem tra co phan tu trung nhau khong
                    var minS = Number.MAX_VALUE, maxE = 0, sumE_S = 0;
                    const lstActvTimeS_E = _actvts.filter(a => a.Start && a.End);
                    if (lstActvTimeS_E.length > 1 && !_actvts[_actvts.length-1].End) {
                        lstActvTimeS_E.map(a => {
                            var _s = a.Start.getTime();
                            _s = new Date(new Date(_s).toDateString()); // 0h00
                            _s = _s.getTime();
                            var _e = a.End.getTime();
                            _e = new Date(new Date(_e).toDateString()); // 0h00
                            _e = _e.getTime();
                            if (minS > _s) minS = _s;
                            if (maxE < _e) maxE = _e;
                            sumE_S += (_e - _s) + 24000 * 3600;
                            return { Start: _s, End: _e }
                        });
                        sumE_S -= (lstActvTimeS_E.length) * 24000 * 3600;     // -24h của Activity (có EndDate) cuối cùng
                        if (maxE - minS < sumE_S) {
                            return true;
                        }   
                    }
                    // #endregion
                    const lastActv = _actvts[_actvts.length - 1]; 
                    const isLastEndNull = !lastActv.End && _actvts.filter(e => !e.End).length == 1;
                    if (_actvts.length < 3 || isLastEndNull) return false;
                    for (let j = 0, l = _actvts.length; j < l; j++) {
                        let sJ = _actvts[j].Start;
                        let eJ = _actvts[j].End;
                        if (!eJ) return true;// end null
                        sJ = sJ.getTime();
                        eJ = eJ.getTime();
                        for (let jj = j + 1; jj < l; jj++) {
                            let sJJ = _actvts[jj].Start;
                            let eJJ = _actvts[jj].End;
                            if (jj > l - 2 && !eJJ) return true;
                            if (!eJJ) continue;
                            sJJ = sJJ.getTime();
                            eJJ = eJJ.getTime();
                            if (eJ - sJ < 8 * 24 * 3600 * 1000 ) {  // endDate-startDate < 7
                                eJ = sJ + 7 * 24 * 3600 * 1000;
                            }
                            if (eJJ - sJJ < 8 * 24 * 3600 * 1000) { // endDate-startDate < 7
                                eJJ = sJJ + 7 * 24 * 3600 * 1000;
                            }
                            if (eJ > sJJ || sJ > eJJ)
                                return true;
                        }
                    }
                    return false;
                }
                
                let newArr = [];
                let a2 = splitArr(items);
                
                do {
                    if (a2.length > 1) {
                        newArr.push(a2[0]);     // Array A
                        a2 = splitArr(a2[1]);   // Array B (dong tiep theo)
                    }
                    else if (a2.length > 0) {
                        newArr.push(a2[0]);     // Array A

                        break;
                    }
                }
                while (newArr.length < items.length);

                function splitArr(a) {  // chia array thanh 2 hoac 1, neu start-end trung nhau thi day xuong newB (dong tiep theo)
                    if (a.length < 1) return [];
                    if (a.length < 2) {
                        return [a];
                    }

                    var i = 0;
                    var newA = [a[i]], newB = [];

                    function pushToNewB(m) {
                        let msa = a[m];
                        if (newB.indexOf(msa) < 0) {
                            newB.push(msa);
                        }
                    }
                    function pushToNewA(m) {
                        let msa = a[m];
                        if (newA.indexOf(msa) < 0 && newB.indexOf(msa) < 0) {
                            newA.push(msa);
                        }
                    }
                    function pushAfterAll(i) {
                        pushToNewA(i);
                        for (var x = i + 1; x < a.length; x++) {
                            pushToNewB(x);
                        }
                        return a.length;
                    }
                    function isMainGoalfter(j) {    // current j != main, but after j is main
                        let k = j + 1;
                        if (k < a.length) {
                            let msaType = a[k].TypeId;
                            if (msaType < vmCommon.RMGoalActionType.SubGoal) {
                                return true;
                            }
                        }
                        return false;
                    }
                   
                    function isNextLine(j) {
                        if (a[j].TypeId < vmCommon.RMGoalActionType.Activity && a[j].IsNewLine) return true;
                        return false;
                    }
                    function isNotEqualParentId(i, j) {
                        let typeI = a[i].TypeId;
                        let typeJ = a[j].TypeId;
                        if (typeI == typeJ && typeJ > vmCommon.RMGoalActionType.MainGoal) {
                            if (a[i].ParentId != a[j].ParentId) return true;
                        }
                        return false;
                    }
                    function isNotEqMaingoalId(i, j) {
                        let typeI = a[i].TypeId;
                        let typeJ = a[j].TypeId;
                        if (typeI > vmCommon.RMGoalActionType.SubGoal && typeJ > vmCommon.RMGoalActionType.SubGoal) {
                            if (a[i].MaingoalId != a[j].MaingoalId) return true;;
                        }
                        return false;
                    }
                    function isNotEqualTypeAfter(j) {
                        let k = j + 1;
                        if (k < a.length) {
                            let typeJ = a[j].TypeId;
                            let typeK = a[k].TypeId;
                            if (typeJ > typeK) return true;
                            if( typeJ > vmCommon.RMGoalActionType.MainGoal && typeK > typeJ) return true;
                        }
                        return false;
                    }
                    
                    while (i < a.length - 1) {
                        var endDi = a[i].End;
                        var startDi = a[i].Start;
                        let msaTypeI = a[i].TypeId;  // main/sub/action = 1/2/3
                        
                        // endDate null, is main goal, isMainGoalfter, hoac action/activity khong cung main => day het element sau main/sub xuong newB => break while loop
                        if (!endDi || msaTypeI < vmCommon.RMGoalActionType.SubGoal || isMainGoalfter(i) || isNotEqualTypeAfter(i))
                        {
                            i = pushAfterAll(i);
                            break;    // break while-loop
                        }

                        if (msaTypeI == vmCommon.RMGoalActionType.SubGoal /*&& mainIdsHasSubAnyChild.includes(a[i].ParentId)*/) {    // comment lại vì bác yêu cầu trong item: 24320
                            i = pushAfterAll(i);
                            break;    // break while-loop
                        }
                        if (msaTypeI == vmCommon.RMGoalActionType.Action /*&& subIdsHasActionAnyChild.includes(a[i].ParentId)*/) {   // comment lại vì bác yêu cầu trong item: 24320
                            i = pushAfterAll(i);
                            break;    // break while-loop
                        }

                        // endDate[i] != null (endDate null da break while loop nen sẽ khong chay xuong day)
                        // loop các Element sau i
                        for (let j = i + 1, _len = a.length; j < _len; j++) {
                            let startDj = a[j].Start;
                            if (!startDj) continue;
                            let endDj = a[j].End;
                            startDj = startDj.getTime();
                            let endDiTime = endDi.getTime();

                            if (endDj == null || endDj == undefined) {
                                if (msaTypeI != a[j].TypeId) {      // Khac type day xuong dong moi
                                    pushToNewB(j);
                                }
                                else if (getDateDiff(startDi, a[j].Start) < 8) {
                                    pushToNewB(j);
                                }
                                else if (startDj < endDiTime) { // isOverlap
                                    pushToNewB(j);
                                }
                                else if (isNotEqualParentId(i, j) || isNotEqMaingoalId(i, j)) {
                                    pushToNewB(j);
                                }
                                else if (isAllActivityInNewLine(a[j])) {        // BI: 24619 Activity
                                    pushToNewB(j);
                                }
                                else {
                                    pushToNewA(j);
                                    i = j - 1;
                                    break;  // break for-j-loop
                                }
                            }
                            else {      // endDate != null
                                if (msaTypeI != a[j].TypeId) {      // Khac type day xuong dong moi
                                    pushToNewB(j);
                                }
                                else if (getDateDiff(startDi, endDi) < 8 && getDateDiff(startDi, a[j].Start) < 8)      // hien thi duoi 7 ngay
                                {        // end - start < 7 days
                                    pushToNewB(j);
                                }
                                else if (startDj < endDiTime) { // isOverlap end i vs start i + 1
                                    pushToNewB(j);
                                }
                                else if (isNotEqualParentId(i, j) || isNotEqMaingoalId(i, j)) {
                                    pushToNewB(j);
                                }
                                else if (isNextLine(j)) { // element Main/Sub/Action
                                    pushToNewB(j);
                                }
                                else if (isAllActivityInNewLine(a[j])) {        // BI: 24619 Activity
                                    pushToNewB(j);
                                }
                                else {
                                    pushToNewA(j);
                                    i = j - 1;
                                    break;  // break for-j-loop
                                }
                            }
                        }
                        i += 1;     // key for break loop

                    };              // while loop

                    if (newB.length > 0)
                        return [newA, newB];

                    return [newA];
                }

                return newArr;
            }
        }
    });
});

//ENTITY
function SubFilter() {
    this.IsMain = true;
    this.IsSub = true;
    this.IsAction = true;
    this.IsActivity = true;

    return this;
};