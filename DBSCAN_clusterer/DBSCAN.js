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
    return Math.sqrt(
        a.map(
            (item, index) => {
                return Math.pow(item - b[index], 2)
            })
            .reduce((accum, item) => {
                return accum += item
            }, 0)
    )
}
function RangedQuery(DB, distfnc, Q, eps){
    var neighbour= []
    DB.forEach((pt)=>{
        if(distfnc(pt.point,Q.point)<=eps){
            neighbour=neighbour.concat(pt)
        }
    })
    return neighbour
}
function DBSCAN(data, epsilon, minpts, callbackAfterInitialize, callbackperDots, callbackSuccess, callbackFail) {
    var data = referencedataset
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
        if (data == undefined || minpts == undefined || dimension == undefined || epsilon == undefined || data == "" || minpts == "" || dimension == "" || epsilon == "" || data == null || minpts == null || epsilon == null) {
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
        clusterCounter=0;
        for(var i=0;i<referencedataset.length;i++){
            console.log(i)
            if(referencedataset[i].label!=undefined){
                continue;
            }
            var neighbour=RangedQuery(referencedataset,distfnc,referencedataset[i],epsilon)
            if(neighbour.length<minpts){
                referencedataset[i].label="noise"
                continue;
            }
            clusterCounter+=1
            var Seedset=new Set()
            for(var j=0;j<neighbour.length;j++){
                Seedset.add(neighbour[j])
            }
            Seedset.forEach((element)=>{
                if(element.label == "noise"){
                    element.label=clusterCounter
                    referencedataset=referencedataset.map((item)=>{
                        var eql=true
                        item.point.forEach((item1,index)=>{
                            //console.log(item1+""+element.point[index])
                            if(item1!==element.point[index]){
                                eql=false
                            }
                        })
                        if(eql){
                            //console.log("found")
                            item.label=element.label
                            return item
                        }else{
                            return item
                        }
                    })
                }
                //console.log(referencedataset)
                if(element.label!=undefined){
                    return
                }
                element.label=clusterCounter
                referencedataset=referencedataset.map((item)=>{
                    var eql=true
                    item.point.forEach((item1,index)=>{
                        //console.log(item1+""+element.point[index])
                        if(item1!==element.point[index]){
                            eql=false
                        }
                    })
                    if(eql){
                        //console.log("found")
                        item.label=element.label
                        return item
                    }else{
                        return item
                    }
                })
                //console.log(referencedataset)
                var newNeighbour=RangedQuery(referencedataset, distfnc,element ,epsilon)
                if(newNeighbour.length>=minpts){
                    for(var k=0;k<newNeighbour.length;k++){
                        Seedset.add(newNeighbour[k])
                    }
                }
                
                stack.pushIteration({data:referencedataset})
                //return;
                //throw "normal"
            })
            stack.pushIteration({data:referencedataset})
        }
        stack.pushIteration({data:referencedataset})
        console.log(referencedataset)
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
    displayToTable(data.data, "#progressTable")
    TESTER = document.getElementById('progressGraph');
    var groupbylabel = data.data.reduce((accum, item, index) => {
        if (index == 0) {
            var newarr = [item]
            accum.push(newarr)
            return accum
        } else {
            for (var i = 0; i < accum.length; i++) {
                if (item.label == accum[i][0].label) {
                    accum[i].push(item)
                    return accum
                }
            }
            var newarr = [item]
            accum.push(newarr)
            return accum
        }

    }, [])
    console.log(groupbylabel)
    //console.log(groupbycenter)
    var DATAForPloty = []
    for (var i = 0; i < groupbylabel.length; i++) {
        var trace = {}
        trace.mode = 'markers'
        trace.type = 'scatter'
        var x = groupbylabel[i].map((item) => {
            return item.point[0]
        })
        var y = groupbylabel[i].map((item) => {
            return item.point[1]
        })

        trace.x = x
        trace.y = y
        var colorr = Math.round(Math.random() * 255)
        var colorg = Math.round(Math.random() * 255)
        var colorb = Math.round(Math.random() * 255)
        trace.marker = { color: 'rgb(' + colorr + '' + colorg + '' + colorb + ')' }
        DATAForPloty.push(trace)
    }
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
        html += "<tr><td>" + element.point + "</td><td>" + element.label + "</td></tr>"
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