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
    //console.log("sth")
    //console.log(document.getElementById("myRange").disabled)
    //console.log(document.getElementById("myRange").max)
    //console.log(document.getElementById("myRange").value)
    //console.log(document.getElementById("myRange").disabled)

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
function meanShift(data, searchRange, ptdis, iteration, dimension, callbackAfterInitialize, callbackperCycle, callbackSuccess, callbackFail) {
    var referencedataset = data
    var searchRange = searchRange
    var step = ptdis
    var iteration = iteration
    var dimension = dimension
    try {
        //initialization
        //numcenter is now the number of center in 1D, if 1D 10 center, 2D =10^2, 3D=10^3 etc
        //search for the dimension and the range of datapoints initialize a grid of centers evenly on the space
        //find max and min in each dimension
        var maxminArray = []//first layer = per dimension, second layer = max min
        midpoint = []
        range = []
        for (var i = 0; i < dimension; i++) {
            maxminArray.push([referencedataset[0].point[i], referencedataset[0].point[i]])//push the first point to maxmin array
            for (var j = 0; j < referencedataset.length; j++) {//find max min in each dimension
                if (referencedataset[j].point[i] > maxminArray[i][0]) {
                    maxminArray[i][0] = referencedataset[j].point[i]
                }
                if (referencedataset[j].point[i] < maxminArray[i][1]) {
                    maxminArray[i][1] = referencedataset[j].point[i]
                }
            }
            range[i] = maxminArray[i][0] - maxminArray[i][1]
            //console.log("Range:" + range[i])
            midpoint[i] = (maxminArray[i][0] + maxminArray[i][1]) / 2
        }
        //console.log(maxminArray)
        //define the center grid
        //no need padding, search area itself is the padding
        var largestRange = Math.max(...range)
        var startPoint = []//the one with smallest coordinate
        var currentPoint = []
        //var step = largestRange / numcenter
        numcenter = largestRange / step
        var center = []
        var resetAndAddNext = []//the number require for calculate when to reset the previous and add next
        for (var i = 0; i < dimension; i++) {
            startPoint[i] = midpoint[i] - (largestRange / 2) + step / 2
            currentPoint[i] = midpoint[i] - (largestRange / 2) + step / 2
            resetAndAddNext.push(parseInt(Math.pow(numcenter, i)))

        }
        //console.log("showing reset array")
        //console.log(resetAndAddNext)
        for (var i = 0; i < parseInt(Math.pow(numcenter, dimension)); i++) {
            //console.log(currentPoint)

            var resetIndex = 0
            resetAndAddNext.map((val, index) => {
                var check = i % val
                if (check == 0 && val != 1 && i != 0) {
                    resetIndex = index
                }
            })
            //console.log("number:" + i + " resetindex:" + resetIndex)
            for (var j = 0; j <= resetIndex - 1; j++) {
                try {
                    currentPoint[j] = startPoint[j]
                    //console.log("resetting " + j)
                } catch (err) {

                }
            }
            //console.log("adding" + resetIndex)
            if (i != 0) {
                currentPoint[resetIndex] += step
            }

            var distinctCenter = { coordinates: JSON.parse(JSON.stringify(currentPoint)), points: [] }
            //currentPoint[resetIndex] += step


            center.push(distinctCenter)
        }
        console.log(center)
        //allocate each point individually to each center
        //var ptcenterDistanceArr = []//first layer=each point, second layer = each center
        for (var i = 0; i < referencedataset.length; i++) {
            var specificptdis = []
            for (var j = 0; j < center.length; j++) {
                specificptdis.push(Math.sqrt(referencedataset[i].point.map((item, index) => {
                    return item - center[j].coordinates[index]
                }
                ).map(
                    (item) => {
                        return item * item
                    }
                ).reduce((accum, item) => { return accum += item }, 0)
                )
                )
            }
            center[specificptdis.indexOf(Math.min(...specificptdis))].points.push(JSON.parse(JSON.stringify(referencedataset[i].point)))
        }
        //initailization end

        var aftercenter = center.filter((item) => { return item.points.length != 0 })
        callbackAfterInitialize({ data: center }, { data: aftercenter })
        center = aftercenter

        //iteration
        //iteration
        //step is the radius of searching
        for (var i = 0; i < iteration; i++) {
            for (var j = 0; j < center.length; j++) {
                var inRangePt = []
                for (var k = 0; k < referencedataset.length; k++) {
                    var ptdis = Math.sqrt(referencedataset[k].point.map((item, index) => {
                        return Math.pow(item - center[j].coordinates[index], 2)
                    }
                    ).reduce((accum, item) => { return accum += item }, 0)
                    )
                    //console.log(ptdis)
                    if (ptdis < searchRange) {
                        inRangePt.push(JSON.parse(JSON.stringify(referencedataset[k].point)))
                    }
                }
                var tempnewCoordinate = inRangePt.reduce((accum, item, index) => {
                    if (index === 0) {
                        for (var l = 0; l < accum.length; l++) {
                            accum[l] = []
                            accum[l].push(item[l])
                        }
                        //console.log(accum)
                        return accum
                    } else {
                        for (var l = 0; l < accum.length; l++) {
                            accum[l].push(item[l])
                        }
                        return accum
                    }
                }, new Array(dimension))
                //console.log(tempnewCoordinate)
                var newCoordinate = tempnewCoordinate.map((item, index, readonly) => {
                    return item.reduce((accum, item1) => {
                        return accum += item1
                    }, 0) / readonly[index].length
                })
                center[j].coordinates = JSON.parse(JSON.stringify(newCoordinate))
            }

            callbackperCycle({ data: center })

        }
        callbackSuccess({ data: center })
        return { data: center }
    } catch (err) {
        callbackFail(err)
    }
}
function handleClick() {
    //split data
    try {
        const data = $("#data").val()
        const searchRange = parseFloat($("#searchRange").val())
        const step = parseInt($("#ptdis").val())
        const iteration = parseInt($("#numinteration").val())
        const dimension = parseInt($("#dimension").val())
        var numcenter = parseInt($("#numcenter").val())
        if (data == undefined || iteration == undefined || dimension == undefined || numcenter == undefined || data == "" || iteration == "" || dimension == "" || numcenter == "" || data == null || iteration == null || dimension == null || numcenter == null) {
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

            accum.push({ point: splitted })
            return accum
        }, [])

        meanShift(referencedataset, searchRange, step, iteration, dimension,
            (obj1, obj2) => {//initialization
                stack = new DataStack()
                stack.clearStack()
                stack.pushIteration(obj1)
                stack.pushIteration(obj2)
            },
            (obj) => {//per cycle
                stack.pushIteration(obj)
            },
            (obj) => {//success
                document.getElementById("myRange").disabled = false;
                document.getElementById("myRange").max = stack.getHeight()
                document.getElementById("myRange").value = document.getElementById("myRange").max
                $("#myRangeValue").html(document.getElementById("myRange").value)
                stack.outputfinal()
            },
            (obj) => {//fail
                console.error(obj)
            }
        )
        }catch(err){
            console.error(err)
        }
}

function updateStackDisplay(target) {
    const searchRange = parseFloat($("#searchRange").val())
    var rangeValue = $("#myRange").val() == stack.getHeight() ? -1 : parseInt($("#myRange").val()) + 1
    console.log(rangeValue)
    var predictedData = null
    if (rangeValue != -1) {
        predictedData = stack.getIteration(rangeValue.toString())
    }
    var data = stack.getIteration($("#myRange").val())
    var DATAForPloty = []
    var BackgroundDots = data.data.reduce((accum, item) => {
        item.points.forEach((item1) => { accum.push(item1) })
        return accum
    }, [])
    var Center = data.data.map((item) => {
        return item.coordinates
    })
    var traceBackground = {
        x: BackgroundDots.map((item) => { return item[0] }),
        y: BackgroundDots.map((item) => { return item[1] }),
        mode: 'markers',
        type: ' scatter',
        marker: {
            color: 'grey'
        }
    }
    var traceCenter = {
        x: Center.map((item) => { return item[0] }),
        y: Center.map((item) => { return item[1] }),
        mode: 'markers',
        type: ' scatter',
        marker: {
            color: 'black'
        }
    }

    if ($("#myRange").val() == 0 || $("#myRange").val() == 1) {
        predictedData = null
    }

    DATAForPloty.push(traceBackground, traceCenter)
    if ($("#myRange").val() == stack.getHeight()) {
        const step = parseInt($("#ptdis").val())
        var data = stack.getIteration($("#myRange").val())
        var ptArr = JSON.parse(JSON.stringify(data.data))
        var sortedByPt = []
        var clusterCenter = []
        while (ptArr.length != 0) {
            var currentPt = ptArr.pop()
            if (sortedByPt.length == 0) {
                sortedByPt.push([JSON.parse(JSON.stringify(currentPt))])
            } else {
                var createnew = true
                for (var i = 0; i < sortedByPt.length; i++) {
                    var clusterCoor = sortedByPt[i].map((item) => {
                        return item.coordinates
                    }).reduce((accum, item, index, array) => {
                        if (index == 0) {
                            accum = new Array(array[index].length)
                            for (var j = 0; j < accum.length; j++) {
                                accum[j] = JSON.parse(JSON.stringify([array[0][j]]))
                            }
                            return accum
                        } else {
                            for (var j = 0; j < accum.length; j++) {
                                accum[j].push(item[j])
                            }
                            return accum
                        }
                    }, []).map((item) => {
                        return item.reduce((accum, item1) => { return accum + item1 }, 0) / item.length
                    })
                    var distance = Math.sqrt(
                        clusterCoor.map((item, index) => {
                            return Math.pow(currentPt.coordinates[index] - item, 2)
                        }).reduce((a, b) => { return a + b }, 0)
                    )
                    if (distance <= searchRange) {
                        sortedByPt[i].push(JSON.parse(JSON.stringify(currentPt)))
                        createnew = false
                        break;
                    }
                }
                if (createnew) {
                    sortedByPt.push([JSON.parse(JSON.stringify(currentPt))])
                }
            }
        }
        for (var i = 0; i < sortedByPt.length; i++) {
            var clusterCoor = sortedByPt[i].map((item) => {
                return item.coordinates
            }).reduce((accum, item, index, array) => {
                if (index == 0) {
                    accum = new Array(array[index].length)
                    for (var j = 0; j < accum.length; j++) {
                        accum[j] = JSON.parse(JSON.stringify([array[0][j]]))
                    }
                    return accum
                } else {
                    for (var j = 0; j < accum.length; j++) {
                        accum[j].push(item[j])
                    }
                    return accum
                }
            }, []).map((item) => {
                return item.reduce((accum, item1) => { return accum + item1 }, 0) / item.length
            })
            clusterCenter.push(clusterCoor)
        }
        var CCC = {
            name: "center of cluster",
            x: clusterCenter.map((item) => { return item[0] }),
            y: clusterCenter.map((item) => { return item[1] }),
            mode: 'markers',
            type: ' scatter',
            marker: {
                color: 'rgba(128,0,255,1)'
            }
        }
        DATAForPloty.push(CCC)
        var sortedByPtMap = sortedByPt.map((item) => {
            return item.map((item1) => { return item1.points }).reduce((accum, item1) => { return accum.concat(item1) }, [])
        })
        for (var i = 0; i < sortedByPtMap.length; i++) {
            DATAForPloty.push({
                name: "cluster " + (i + 1) + " overlay",
                x: sortedByPtMap[i].map((item) => { return item[0] }),
                y: sortedByPtMap[i].map((item) => { return item[1] }),
                mode: 'markers',
                type: ' scatter',
                marker: {
                    color: Math.round(Math.random() * 255)
                }
            })
        }
        displayToTable(sortedByPtMap)
    }
    var search = []
    if (predictedData != null) {
        var next = predictedData.data.map((item) => { return item.coordinates })
        search = Center.map((item) => {
            return {
                visible: true,
                type: "circle",
                layer: "below",
                x0: item[0] - searchRange,
                x1: item[0] + searchRange,
                y0: item[1] - searchRange,
                y1: item[1] + searchRange,
                opacity: 1,
                fillcolor: "rgba(255,0,0,0.1)",
                line: {
                    width: 0
                }
            }
        })
        //console.log(search) 
        var traceNext = {
            x: next.map((item) => { return item[0] }),
            y: next.map((item) => { return item[1] }),
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: 'red'
            }
        }
        DATAForPloty.push(traceNext)
    }
    //console.log(DATAForPloty)
    const finalTarget = target ? target : 'progressGraph'
    Plotly.newPlot(finalTarget, DATAForPloty, {
        title: $("#myRange").val() + ' iteration',
        autosize: false,
        width: 500,
        height: 500,
        xaxis: {
            range: [midpoint[0] - Math.max(...range) / 2 - 10, midpoint[0] + Math.max(...range) / 2 + 10]
        },
        yaxis: {
            range: [midpoint[1] - Math.max(...range) / 2 - 10, midpoint[1] + Math.max(...range) / 2 + 10]
        },
        shapes: search
    });

}

function displayToTable(data, target) {
    const finalTarget = target ? target : '#resulttable'
    var html = "<table border='1' id='table1'><tr>"
    for (var i = 0; i < data[0][0].length; i++) {
        html += "<th>coordinate" + i + "</th>"
    }
    html += "<th>cluster</th></tr>"
    //console.log("display to table")
    data.forEach((element, index) => {
        //console.log(element)
        element.forEach((element1) => {
            html += "<tr>"
            element1.forEach((element2) => {
                html += "<td>" + element2 + "</td>"
            })
            html += "<td>" + (index + 1) + "</td></tr>"
        })

    })
    //console.log("display to table end")
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
        //console.log('before push')
        //console.log(this.dstack)
        //console.log('incoming')
        //console.log(obj)
        //console.log("pushing")
        const clone = $.extend(true, {}, obj)
        this.dstack.push(clone)
        //console.log("after push")
        //console.log(this.dstack)
    }
    clearStack() {
        this.dstack = []
    }
    outputfinal() {
        updateStackDisplay()
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