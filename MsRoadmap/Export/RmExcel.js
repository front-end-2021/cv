var rmExcel = {};
rmExcel.exportService = function () {
    var start, end, viewTypeId, data, numOfDays = 0, isHidePath = false; let format = (val, fm) => kendo.toString(val, fm);
    var menuLabeling = {};

    var getWeek = function (date) {

        function moveBackMon(date) {
            let day = date.getDay();
            if (kLg.language == "de" || kLg.language == "pm") {
                day -= 1;
                if (day < 0) day = 6;
            }
            let deltaMiliS = day * 24 * 3600000;

            let firstDinWeek = date.getTime() - deltaMiliS;
            return new Date(firstDinWeek);
        };

        function getNumOfWeek(date) {
            let year = date.getFullYear();
            let firstDateY = new Date(year, 0, 1);
            let deltaTime = date.getTime() - firstDateY.getTime();
            deltaTime = deltaTime / 24 / 60 / 60 / 1000;
            return Math.floor(deltaTime / 7);
        };

        let fromDate = moveBackMon(date);
        let midDInW = new Date(fromDate.getTime() + 3 * 24 * 60 * 60 * 1000);

        return getNumOfWeek(midDInW) + 1;
    };

    var groupQuarter = function (ms) {
        let rs = []; const qs = { 1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12] };

        for (var q in qs) {
            let temps = ms.filter(t => qs[q].indexOf(t.Month) >= 0);
            if (temps.length)
                rs.push({ Quarter: Number(q), Months: temps });
        }

        return rs;
    };

    var getQuarterHeader = function () {
        let sYear = start.getFullYear();
        let eYear = end.getFullYear();

        var years = [];
        for (var i = sYear; i <= eYear; i++) {
            let eMonth = i != eYear ? 11 : end.getMonth();
            let sMonth = i === sYear ? start.getMonth() : 0;

            let m = [];
            for (var j = sMonth; j <= eMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                let sDay = i == sYear && j == sMonth ? start.getDate() : 1;
                let eDay = (i == eYear && j == eMonth) ? end.getDate() : (j == 11 ? 31 : new Date(i, j + 1, 0).getDate());

                let days = [];
                for (var k = sDay; k <= eDay; k++) {
                    days.push(k);
                }

                m.push({ Month: j + 1, Days: days });
            }

            years.push({ Year: i, Quarters: groupQuarter(m) });
        }

        let yearCells = isHidePath ? [] : [{ rowSpan: 3, colSpan: 2 }], quarterCells = [], monthCells = [];
        const bgColor = "f1f1f1", border = { color: "#ffffff", size: 2 };

        for (var i = 0; i < years.length; i++) {
            let year = years[i], ySpan = 0;

            for (var j = 0; j < year.Quarters.length; j++) {
                let quarter = year.Quarters[j], qSpan = 0;

                for (var k = 0; k < quarter.Months.length; k++) {
                    let month = quarter.Months[k];
                    monthCells.push({ value: month.Month.toMonthString(), colSpan: month.Days.length, textAlign: "center", color: "#1F75A4", verticalAlign: "center", fontSize: 10, background: bgColor, borderLeft: border, borderBottom: border });

                    qSpan += month.Days.length;
                }

                quarterCells.push({ value: "Q " + quarter.Quarter, colSpan: qSpan, textAlign: "center", verticalAlign: "center", color: "#6d6d6d", fontSize: 12, background: bgColor, borderLeft: border, borderBottom: border });
                ySpan += qSpan;
            }

            yearCells.push({ value: year.Year, colSpan: ySpan, textAlign: "center", color: "#989898", fontSize: 16, verticalAlign: "center", background: bgColor, borderLeft: border, borderBottom: border });
        }

        return [
            { cells: yearCells },
            { cells: quarterCells },
            { cells: monthCells }
        ];
    };
    var getMonthHeader = function () {
        let sYear = start.getFullYear();
        let eYear = end.getFullYear();

        var years = [], weeks = [];

        var addWeek = function (weeks, d) {
            let w = getWeek(d);
            let day = d.getDate();

            var lastWeek = weeks.last();
            var week = lastWeek && lastWeek.Week == w ? lastWeek : null;
            if (week) {
                if (week.Days.indexOf(day) < 0) week.Days.push(day);
            }
            else {
                weeks.push({ Week: w, Days: [day] });
            }
        };

        for (var i = sYear; i <= eYear; i++) {
            let eMonth = i != eYear ? 11 : end.getMonth();
            let sMonth = i === sYear ? start.getMonth() : 0;

            var m = [];
            for (var j = sMonth; j <= eMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                let sDay = i == sYear && j == sMonth ? start.getDate() : 1;
                let eDay = (i == eYear && j == eMonth) ? end.getDate() : (j == 11 ? 31 : new Date(i, j + 1, 0).getDate());

                let days = [];
                for (var k = sDay; k <= eDay; k++) {
                    days.push(k);
                    addWeek(weeks, new Date(i, j, k));
                }

                m.push({ Month: j + 1, Days: days });
            }

            years.push({ Year: i, Months: m });
        }

        let yearCells = isHidePath ? [] : [{ rowSpan: 3, colSpan: 2 }], monthCells = [], weekCells = [];
        for (var i = 0; i < years.length; i++) {
            let year = years[i], ySpan = 0;

            for (var j = 0; j < year.Months.length; j++) {
                let month = year.Months[j];
                monthCells.push({ value: month.Month.toMonthString(), colSpan: month.Days.length, textAlign: "center", color: "#1F75A4", fontSize: 12, bold: true, verticalAlign: "center" });

                ySpan += month.Days.length;
            }

            yearCells.push({ value: year.Year, colSpan: ySpan, textAlign: "center", color: "#989898", fontSize: 16, verticalAlign: "center" });
        }

        for (var i = 0; i < weeks.length; i++) {
            let week = weeks[i];

            weekCells.push({ value: kLg.textWeekPrefix + " " + week.Week, colSpan: week.Days.length, textAlign: "center", color: "#989898", fontSize: 12, verticalAlign: "center" });
        }

        return [
            { cells: yearCells },
            { cells: monthCells },
            { cells: weekCells }
        ];
    };

    var getHeader = function () {
        switch (viewTypeId) {
            case 0:
                return getQuarterHeader();
            case 1:
                return getMonthHeader();
        }
    };

    var isBelongTimeRange = function (lst) {

        function isFit(s, e) {
            return e == null ? vmCommon.compareDate2(s, end) <= 0 : (vmCommon.compareDate2(start, s) <= 0 && vmCommon.compareDate2(end, s) >= 0)
                || (vmCommon.compareDate2(start, e) <= 0 && vmCommon.compareDate2(end, e) >= 0)
                || (vmCommon.compareDate2(start, s) >= 0 && vmCommon.compareDate2(start, e) <= 0)
                || (vmCommon.compareDate2(end, s) >= 0 && vmCommon.compareDate2(end, e) <= 0);
        };

        return lst.some(t => isLabeling(t.TypeId) || isFit(t.Start, t.End));
    };

    function isLabeling(typeId) {
        var lst = [];
        if (menuLabeling.IsMain)
            lst.push(1);
        if (menuLabeling.IsSub)
            lst.push(2);
        if (menuLabeling.IsAction)
            lst.push(3);

        return lst.indexOf(typeId) >= 0;
    };

    function isHasLabeling() {
        return menuLabeling.IsMain || menuLabeling.IsSub || menuLabeling.IsAction;
    };

    var getContent = function () {
        var rs = [], pathIndex = 1; const evenPathColor = "#f7f7f7", oddPathColor = "#efefef", firstType = Math.abs((viewTypeId == 0 ? start.getQuarter() : start.getMonth() + 1) % 2);

        //10, I, J, Q, K
        for (var ten = 0; ten < data.length; ten++) {
            var block = data[ten];

            //block's path
            if (!block.IsNormal) {
                var diffSpace = start.days(end) + 1;
                var pathCells = isHidePath ? [] : [
                    { value: block.Path, color: "#2d7092", verticalAlign: "top", wrap: true, fontSize: 12, bold: true, borderRight: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } },
                    { borderRight: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } }
                ];

                for (var x = 0; x < diffSpace; x++) {
                    var d = new Date(+start); d.setDate(start.getDate() + x);
                    pathCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                };

                rs.push({ cells: pathCells, height: 20 });
            }

            for (var i = 0; i < block.ParentRegionRMs.length; i++) {
                var parent = block.ParentRegionRMs[i];

                for (var j = 0; j < parent.ChildStakeHolders.length; j++) {
                    var child = parent.ChildStakeHolders[j];

                    for (var q = 0; q < child.Categories.length; q++) {
                        var cate = child.Categories[q];

                        for (var k = 0; k < cate.Elements.length; k++) {
                            //row
                            var items = cate.Elements[k];

                            //correcting item
                            for (var a = 0; a < items.length; a++) {
                                var item = items[a];

                                if (item.End) {
                                    item.End.setDate(item.End.getDate() - 1);
                                    var diff = item.Start.days(item.End) + 1;
                                    if (item.Start.days(item.End) < 7)
                                        item.End.setDate(item.End.getDate() + 7 - diff);
                                }
                            }

                            var lineCells = [];
                            var bg;
                            //root path
                            if (!isHidePath && q == 0 && k == 0) {
                                bg = Math.abs(pathIndex % 2) == 1 ? oddPathColor : evenPathColor;
                                var rowSpan = isHasLabeling() ? 2 : child.Categories.map(t => t.Elements).flat().length;
                                var borderBottom = { color: isHasLabeling() ? "#ffffff" : "#e8e8e8", size: 1 };

                                lineCells.push({
                                    value: `${child.Path ? child.Path + "\n" : ""}${child.Name}`,
                                    rowSpan: rowSpan,
                                    color: "#989898", verticalAlign: "top", wrap: true, fontSize: 12, background: bg, borderRight: { color: "#e8e8e8", size: 1 }, borderBottom: borderBottom
                                });
                                lineCells.push({
                                    rowSpan: rowSpan,
                                    borderRight: { color: "#e8e8e8", size: 1 }, borderBottom: borderBottom
                                });
                                pathIndex++;

                                if (isHasLabeling()) {
                                    var emptyCells = [];
                                    var diffSpace = start.days(end) + 1;

                                    for (var x = 0; x < diffSpace; x++) {
                                        var d = new Date(+start); d.setDate(start.getDate() + x);
                                        emptyCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                                    };

                                    lineCells = lineCells.concat(emptyCells);
                                    rs.push({ cells: lineCells, height: 20 });
                                    rs.push({ cells: emptyCells, height: 20 });
                                    lineCells = [];
                                }
                            }

                            if (!isBelongTimeRange(items)) {
                                var diffSpace = start.days(end) + 1;

                                if (isHasLabeling() && !isHidePath && items.every(t => !isLabeling(t.TypeId))) {
                                    lineCells.push({
                                        background: bg,
                                        borderRight: { color: "#e8e8e8", size: 1 },
                                        borderBottom: labelingBottom
                                    });
                                    lineCells.push({
                                        borderBottom: labelingBottom
                                    });
                                }

                                for (var x = 0; x < diffSpace; x++) {
                                    var d = new Date(+start); d.setDate(start.getDate() + x);
                                    lineCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                                };

                                rs.push({ cells: lineCells, height: 20 });
                                lineCells = [];
                                continue;
                            }

                            //all in a row
                            for (var a = 0; a < items.length; a++) {
                                var item = items[a];
                                let prefix = item.TypeId == 1 ? "●" : item.TypeId == 2 ? "◆" : item.TypeId == 3 ? " ■" : item.TypeId == 4 ? "▍" : vmCommon.empty;
                                var labelingBottom = (q == child.Categories.length - 1) && (k == cate.Elements.length - 1) ? { color: "#e8e8e8", size: 1 } : { color: "#ffffff", size: 1 };

                                //main/sub/action labling
                                if (isLabeling(item.TypeId)) {
                                    lineCells = [];

                                    if (!isHidePath) {
                                        lineCells.push({
                                            value: `${prefix} ${item.Name}`,
                                            color: "#989898",
                                            verticalAlign: "top", wrap: true,
                                            fontSize: 10,
                                            background: bg,
                                            borderRight: { color: "#e8e8e8", size: 1 },
                                            borderBottom: labelingBottom
                                        });

                                        lineCells.push({
                                            borderRight: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 },
                                            borderBottom: labelingBottom
                                        });
                                    }

                                    var emptyCells = [];
                                    var diffSpace = start.days(end) + 1;

                                    for (var x = 0; x < diffSpace; x++) {
                                        var d = new Date(+start); d.setDate(start.getDate() + x);
                                        emptyCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                                    };

                                    lineCells = lineCells.concat(emptyCells);
                                    continue;
                                }

                                //empty labeling
                                if (isHasLabeling() && a == 0 && !isHidePath) {
                                    lineCells.push({
                                        background: bg,
                                        borderRight: { color: "#e8e8e8", size: 1 },
                                        borderBottom: labelingBottom
                                    });
                                    lineCells.push({
                                        borderBottom: labelingBottom
                                    });
                                }

                                //valid item
                                if (vmCommon.compareDate2(item.Start, end) > 0 || (item.End && vmCommon.compareDate2(item.End, start) < 0)) continue;

                                var previousItem = a > 0 ? items[a - 1] : null;
                                //valid previous item
                                if (previousItem && (previousItem.End == null || vmCommon.compareDate2(previousItem.End, end) > 0)) continue;

                                var s = new Date(+start);
                                if (previousItem && vmCommon.compareDate(previousItem.End, start) > 0) {
                                    s = new Date(+previousItem.End); s.setDate(previousItem.End.getDate() + 1);
                                }

                                //bind front-space 
                                if (vmCommon.compareDate2(s, item.Start) < 0) {
                                    var diffSpace = s.days(item.Start);

                                    for (var x = 0; x < diffSpace; x++) {
                                        var d = new Date(+s); d.setDate(s.getDate() + x);
                                        lineCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                                    };
                                }

                                //bind data
                                var e = item.End && vmCommon.compareDate2(item.End, end) <= 0 ? item.End : end;
                                var itemDiff = vmCommon.compareDate2(item.Start, start) >= 0 ? item.Start.days(e) + 1 : start.days(e) + 1;

                                lineCells.push({ value: `${prefix} ${item.Name}`, color: "#ffffff", background: item.Color, colSpan: itemDiff, fontSize: 10, verticalAlign: "center", borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });

                                //next item
                                var nextItem = a < items.length - 1 ? items[a + 1] : null;

                                //bind back-space
                                if (item.End && vmCommon.compareDate2(item.End, end) < 0 && (nextItem == null || vmCommon.compareDate2(nextItem.Start, end) > 0)) {
                                    var tempEnd = new Date(+item.End); tempEnd.setDate(item.End.getDate() + 1);
                                    var diffSpace = tempEnd.days(end) + 1;

                                    for (var x = 0; x < diffSpace; x++) {
                                        var d = new Date(+tempEnd); d.setDate(tempEnd.getDate() + x);
                                        lineCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
                                    };
                                }
                            }

                            rs.push({ cells: lineCells, height: 20 });
                        }
                    }

                    //space line
                    //rs.push({ height: 20 });
                }
            }
        }
        //filling to enough 30 rows
        if (rs.length < 30) {
            var diffSpace = start.days(end) + 1;

            var remainCells = isHidePath ? [] : [{}, {}];
            for (var x = 0; x < diffSpace; x++) {
                var d = new Date(+start); d.setDate(d.getDate() + x);
                remainCells.push({ background: Math.abs((viewTypeId == 0 ? d.getQuarter() : d.getMonth() + 1) % 2) == firstType ? "#f2f2f2" : null, borderLeft: { color: "#e8e8e8", size: 1 }, borderRight: { color: "#e8e8e8", size: 1 }, borderTop: { color: "#e8e8e8", size: 1 }, borderBottom: { color: "#e8e8e8", size: 1 } });
            }

            var remain = 30 - rs.length;
            for (var i = 0; i < remain; i++) {
                rs.push({ cells: remainCells, height: 20 });
            }
        }

        return rs;
    };

    var exportFile = function (src) {
        //init
        start = src.Start;
        end = src.End;
        viewTypeId = src.ViewTypeId;
        data = src.Data;
        numOfDays = start.days(end) + 1;
        isHidePath = src.IsHidePath;
        menuLabeling = src.MenuLabeling;

        //valid
        if (!start || !end || vmCommon.compareDate2(start, end) > 0 || (viewTypeId != 0 && viewTypeId != 1)) return; //data.length == 0

        var columns = isHidePath ? [] : [{ width: 250 }, { width: 12 }], rows = [];
        for (var i = 0; i < numOfDays; i++) columns.push({ width: viewTypeId == 0 ? 12 : 20 });

        //header
        rows = rows.concat(getHeader());

        //goal/action/activity content
        rows = rows.concat(getContent());

        //draw
        var now = new Date();
        var workbook = new kendo.ooxml.Workbook({
            creator: "Stratsigner",
            sheets: [
                {
                    frozenRows: 3,
                    name: kLg.captiontabRoadmap,
                    date: now,
                    columns: columns,
                    rows: rows
                }
            ]
        });

        kendo.saveAs({
            dataURI: workbook.toDataURL(),
            fileName: `Mapexport ${format(now.getFullYear(), "0#")}-${format(now.getMonth() + 1, "0#")}-${format(now.getDate(), "0#")} ${format(now.getHours(), "0#")}-${format(now.getMinutes(), "0#")}-${format(now.getSeconds(), "0#")}.xlsx`
        });
    };

    return { exportFile: exportFile };
}();