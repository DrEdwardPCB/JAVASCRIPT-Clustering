$(document).ready(function () {
    document.getElementById("myRange").disabled = true;
    $('#myRange').on("change", function () {
        $('#myRangeValue').html($(this).val());
        updateStackDisplay()
    });
})

function parseData() {
    const data = $("#data").val()
    var dataarray = data.split(' ')
    var parsedData = dataarray.map((text) => {
        return "[" + text.split('\t').reduce((accum, text1, index, readonly) => {
            if (index != readonly.length - 1) {
                return accum + text1 + ','
            } else {
                return accum + text1
            }
        }, '') + "];"
    }).filter((item) => { return item != "[,];" }).reduce((accum, text) => {
        accum += text
        return accum
    }, "")
    $("#data").val(parsedData.substring(0, parsedData.length - 1))
}

function rightClick() {


    if (document.getElementById("myRange").disabled || document.getElementById("myRange").value == document.getElementById("myRange").max) {
        //console.log("return")
        return
    } else {
        //console.log($("#myRange").val()+1)
        $("#myRange").val(parseInt($("#myRange").val()) + 1)
        $('#myRangeValue').html(document.getElementById("myRange").value);
        updateStackDisplay()
    }
}
function leftClick() {
    if (document.getElementById("myRange").disabled || document.getElementById("myRange").value == document.getElementById("myRange").min) {
        return
    } else {
        $("#myRange").val($("#myRange").val() - 1)
        $('#myRangeValue').html(document.getElementById("myRange").value);
        updateStackDisplay()
    }
}

stack = null
function distfnc(a, b) {//a and b is array 
    return Math.sqrt(a.map((item, index) => { return Math.pow(a - b[index], 2) }).reduce((accum, item) => { return accum += item }, 0))
}
function DBSCAN(data,epsilon,minpts,callbackAfterInitialize, callbackperDots, callbackSuccess, callbackFail){
    var data=referencedataset
    var clusterCounter = 0;
        for (var i = 0; i < referencedataset.length; i++) {
            if (referencedataset[i].label != undefined) {
                continue;
            }
            var neighbour = []
            for (var j = 0; j < referencedataset.length; j++) {
                if (distfnc(referencedataset[i].point, referencedataset[j].point) <= epsilon) {
                    neighbour.push(JSON.parse(JSON.stringify(referencedataset[j])))
                }
            }
            if (neighbour.length < minpts) {
                referencedataset[i].label = "noise"
                continue;
            }
            clusterCounter += 1
            referencedataset[i].label = clusterCounter.toString()
            var seedset = JSON.parse(JSON.stringify(neighbour))
            var finalSeedSet = []
            while (seedset.length != 0) {
                var currentPt = seedset.pop()
                if (currentPt.label == "noise") {
                    currentPt.label = clusterCounter.toString()
                }
                if (currentPt.label != undefined) {
                    continue;
                }
                currentPt.label = clusterCounter.toString()
                finalSeedSet.push(JSON.parse(JSON.stringify(currentPt)))
                var thisneighbour = []
                for (var j = 0; j < referencedataset.length; j++) {
                    if (distfnc(referencedataset[i].point, referencedataset[j].point) <= epsilon) {
                        thisneighbour.push(JSON.parse(JSON.stringify(referencedataset[j])))
                    }
                }
                if (thisneighbour.length >= minpts) {
                    seedset.concat(thisneighbour)
                }
            }
        }
}
function handleClick() {
    //split data
    try {
        const data = $("#data").val()
        const minpts = parseInt($("#minpts").val())
        const dimension = parseInt($("#dimension").val())
        const epsilon = parseInt($("#epsilon").val())
        if (data == undefined || minpts == undefined || dimension == undefined || numcenter == undefined || data == "" || minpts == "" || dimension == "" || epsilon == "" || data == null || iteration == null || minpts == null || epsilon == null) {
            return alert("one or more of your parameter is undefined")
        }
        //console.log(data + " " + iteration + " " + dimension + " " + numcenter)
        //[x,y];[x,y];[x,y];
        const dataset = data.split(';')

        //initialization/////////////////////////////////////////////////////////////
        //console.log(dataset)
        var referencedataset = dataset.reduce((accum, item, index) => {
            const pitem = item.substring(1, item.length - 1);
            const itemarr = pitem.split(',')
            const splitted = itemarr.reduce((accum1, val) => {
                //console.log(val)
                accum1.push(parseFloat(val))
                return accum1
            }, [])

            accum.push({ point: splitted, label: undefined })
            return accum
        }, [])

        stack = new DataStack()
        stack.clearStack()
        stack.pushIteration({ data: referencedataset })

        //iteration////////////////////////////////////////////////////////////////////////////////////
        //iterate kmean
        var clusterCounter = 0;
        for (var i = 0; i < referencedataset.length; i++) {
            if (referencedataset[i].label != undefined) {
                continue;
            }
            var neighbour = []
            for (var j = 0; j < referencedataset.length; j++) {
                if (distfnc(referencedataset[i].point, referencedataset[j].point) <= epsilon) {
                    neighbour.push(JSON.parse(JSON.stringify(referencedataset[j])))
                }
            }
            if (neighbour.length < minpts) {
                referencedataset[i].label = "noise"
                continue;
            }
            clusterCounter += 1
            referencedataset[i].label = clusterCounter.toString()
            var seedset = JSON.parse(JSON.stringify(neighbour))
            var finalSeedSet = []
            while (seedset.length != 0) {
                var currentPt = seedset.pop()
                if (currentPt.label == "noise") {
                    currentPt.label = clusterCounter.toString()
                }
                if (currentPt.label != undefined) {
                    continue;
                }
                currentPt.label = clusterCounter.toString()
                finalSeedSet.push(JSON.parse(JSON.stringify(currentPt)))
                var thisneighbour = []
                for (var j = 0; j < referencedataset.length; j++) {
                    if (distfnc(referencedataset[i].point, referencedataset[j].point) <= epsilon) {
                        thisneighbour.push(JSON.parse(JSON.stringify(referencedataset[j])))
                    }
                }
                if (thisneighbour.length >= minpts) {
                    seedset.concat(thisneighbour)
                }
            }
            /**
             * https://en.wikipedia.org/wiki/DBSCAN
             * for each point Q in S {                            /* Process every seed point 
            if label(Q) = Noise then label(Q) = C          /* Change Noise to border point 
            if label(Q) ≠ undefined then continue          /* Previously processed 
            label(Q) = C                                   /* Label neighbor 
            Neighbors N = RangeQuery(DB, distFunc, Q, eps) /* Find neighbors 
            if |N| ≥ minPts then {                         /* Density check 
                S = S ∪ N                                  /* Add new neighbors to seed set 
            }
        }
             */

        }
        document.getElementById("myRange").disabled = false;
        document.getElementById("myRange").max = stack.getHeight()
        document.getElementById("myRange").value = document.getElementById("myRange").max
        $("#myRangeValue").html(document.getElementById("myRange").value)
        updateStackDisplay()

    } catch (err) {
        return console.log(err)
    }
}
function updateStackDisplay() {
    var data = stack.getIteration($("#myRange").val())
    //console.log(data)
    var newArr = []
    for (var i = 0; i < data.center.length; i++) {
        newArr.push([])
    }
    displayToTable(data.data, "#progressTable")
    TESTER = document.getElementById('progressGraph');
    var groupbycenter = data.data.reduce((accum, item) => {
        //console.log(item)
        //console.log(accum)
        accum[item.cluster].push(item.point)
        return accum
    }, newArr)
    //console.log(groupbycenter)
    var DATAForPloty = []
    for (var i = 0; i < groupbycenter.length; i++) {
        var trace = {}
        trace.mode = 'markers'
        trace.type = 'scatter'
        var x = []
        var y = []
        if (groupbycenter[i][0].length == 1) {
            for (var j = 0; j < groupbycenter[i].length; j++) {
                x.push(groupbycenter[i][j][0])
                y.push(0)
            }
        } else {
            for (var j = 0; j < groupbycenter[i].length; j++) {
                x.push(groupbycenter[i][j][0])
                y.push(groupbycenter[i][j][1])
            }
        }
        trace.x = x
        trace.y = y
        var colorr = Math.round(Math.random() * 255)
        var colorg = Math.round(Math.random() * 255)
        var colorb = Math.round(Math.random() * 255)
        trace.marker = { color: 'rgb(' + colorr + '' + colorg + '' + colorb + ')' }
        DATAForPloty.push(trace)
    }
    var centerTrace = {}
    centerTrace.mode = 'markers'
    centerTrace.type = 'scatter'
    centerTrace.marker = { size: 40 }
    var cx = []
    var cy = []
    for (var k = 0; k < data.center.length; k++) {
        if (data.center[0].length == 1) {
            cx.push(data.center[k][0])
            cy.push(0)
        } else {
            cx.push(data.center[k][0])
            cy.push(data.center[k][1])
        }
    }
    centerTrace.x = cx
    centerTrace.y = cy
    DATAForPloty.push(centerTrace)
    Plotly.newPlot('progressGraph', DATAForPloty, {
        title: $("#myRange").val() + ' iteration',
        autosize: false,
        width: 500,
        height: 500,
    });
}

function displayToTable(data, target) {
    const finalTarget = target ? target : '#resulttable'
    var html = "<table border='1'><tr><th>coordinate</th><th>cluster</th></tr>"
    data.forEach((element) => {
        html += "<tr><td>" + element.point + "</td><td>" + (element.cluster + 1) + "</td></tr>"
    })
    html += "</table>"
    $(finalTarget).html(html)
}

function clearInput() {
    $('#data').val("")
}

class DataStack {
    constructor() {
        this.dstack = []
    }
    pushIteration(obj) {

        const clone = $.extend(true, {}, obj)
        this.dstack.push(clone)

    }
    clearStack() {
        this.dstack = []
    }
    getHeight() {
        return this.dstack.length
    }
    getIteration(id) {
        try {
            return this.dstack[id - 1]
        } catch (err) {
            return undefined
        }
    }
}