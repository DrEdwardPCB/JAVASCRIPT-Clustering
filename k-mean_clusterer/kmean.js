$(document).ready(function(){
    document.getElementById("myRange").disabled = true;
    $('#myRange').on("change", function() {
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
    }).filter((item)=>{return item!="[,];"}).reduce((accum, text) => {
        accum += text
        return accum
    }, "")
    $("#data").val(parsedData.substring(0, parsedData.length - 1))
}

function rightClick(){
    //console.log("sth")
    //console.log(document.getElementById("myRange").disabled)
    //console.log(document.getElementById("myRange").max)
    //console.log(document.getElementById("myRange").value)
    //console.log(document.getElementById("myRange").disabled)
    
    if(document.getElementById("myRange").disabled|| document.getElementById("myRange").value== document.getElementById("myRange").max){
        //console.log("return")
        return
    }else{
        //console.log($("#myRange").val()+1)
        $("#myRange").val(parseInt($("#myRange").val())+1)
        $('#myRangeValue').html(document.getElementById("myRange").value);
        updateStackDisplay()
    }
}
function leftClick(){
    if(document.getElementById("myRange").disabled|| document.getElementById("myRange").value== document.getElementById("myRange").min){
        return
    }else{
        $("#myRange").val($("#myRange").val()-1)
        $('#myRangeValue').html(document.getElementById("myRange").value);
        updateStackDisplay()
    }
}

stack=null

function handleClick() {
    //split data
    try {
        const data = $("#data").val()
        const iteration = parseInt($("#numinteration").val())
        const dimension = parseInt($("#dimension").val())
        const numcenter = parseInt($("#numcenter").val())
        if (data == undefined || iteration == undefined || dimension == undefined || numcenter == undefined||data == ""|| iteration == "" || dimension == "" || numcenter == ""||data == null || iteration == null || dimension == null || numcenter == null) {
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

            accum.push({ point: splitted, cluster: Math.round((Math.random() * (numcenter - 1)) ) })
            return accum
        }, [])
        //console.log(referencedataset)

        //make center base on num of k
        var center = []
        for (var i = 0; i < numcenter; i++) {
            var centerdata = []
            for (var j = 0; j < dimension; j++) {
                var numberrange = referencedataset.map((item) => {
                    return item.point[j]
                })
                //console.log(numberrange)
                var max = Math.max(...numberrange)
                var min = Math.min(...numberrange)
                //console.log(max + " " + min)
                centerdata.push((Math.random() * (max - min) + min))
            }
            //console.log(centerdata)
            center.push(centerdata)
        }
        //console.log("initial center")
        //console.log(JSON.stringify(center))
        stack=new DataStack()
        stack.clearStack()
        stack.pushIteration({data:referencedataset,center:center})

        //iteration////////////////////////////////////////////////////////////////////////////////////
        //iterate kmean
        for (var i = 0; i < iteration; i++) {
            //allocate data to center
            //find distance between each point to each center
            var pointDistanceArr = referencedataset.reduce((accum, item) => {
                //^for all points
                var distancetoAllcenter = center.map((c) => {
                    //^for all center
                    var sumOfRoot = c.map((coor, index) => {
                        //^for all coordinate in a center
                        return (item.point[index] - coor) * (item.point[index] - coor)
                        //^return the square number of the distance between corresponding coor
                    }).reduce((accum, dis) => {
                        //^sum up all root
                        accum += dis
                        return accum
                    }, 0)
                    return Math.sqrt(sumOfRoot)
                })
                accum.push(distancetoAllcenter)
                return accum
            }, [])
            console.log(pointDistanceArr)
            //allocate to minium distance
            var referencedataset = referencedataset.map((item, index) => {
                var minium = Math.min(...pointDistanceArr[index])
                item.cluster = pointDistanceArr[index].indexOf(minium)
                return item
            })
            //console.log(referencedataset)
            //compute the new center point
            //foreach cluster calculate the average value of each coordinate
            for (var j = 0; j < center.length; j++) {
                var averageValues = referencedataset.map((item) => {
                    if (item.cluster == j) {
                        return item.point
                    } else {
                        return undefined
                    }
                }).reduce((accum, item) => {
                    if (item != undefined) {

                        accum.push(item)
                    }
                    return accum
                }, [])
                //console.log("point in that cluster" + averageValues)
                //console.log(averageValues)
                var numpt = averageValues.length
                
                var sumofalldimension = []
                for (var l = 0; l < dimension; l++) {

                    var sumofthatdimension = averageValues.reduce((accum, item) => {
                        accum+=item[l]
                        return accum
                    }, 0)
                    sumofalldimension.push(sumofthatdimension)
                }
                var computedAverageValue = sumofalldimension.map((item)=>{
                    return item/numpt
                })
                //console.log(computedAverageValue)
                center[j]=computedAverageValue

            }
            //console.log(center)
            //update the dataset
            //stack.clearStack()
            stack.pushIteration({data:referencedataset,center:center})

        }
        //console.log("result")
        //console.log(referencedataset)
        //console.log(stack)
        displayToTable(referencedataset)
        document.getElementById("myRange").disabled = false;
        document.getElementById("myRange").max=stack.getHeight()
        document.getElementById("myRange").value=document.getElementById("myRange").max
        $("#myRangeValue").html(document.getElementById("myRange").value)
        updateStackDisplay()

    } catch (err) {
        return console.log(err)
    }
}
function updateStackDisplay(){
    var data=stack.getIteration($("#myRange").val())
    //console.log(data)
    var newArr=[]
    for(var i=0;i<data.center.length;i++){
        newArr.push([])
    }
    displayToTable(data.data,"#progressTable")
    TESTER = document.getElementById('progressGraph');
    var groupbycenter=data.data.reduce((accum,item)=>{
        //console.log(item)
        //console.log(accum)
        accum[item.cluster].push(item.point)
        return accum
    },newArr)
    //console.log(groupbycenter)
    var DATAForPloty=[]
    for(var i=0;i<groupbycenter.length;i++){
        var trace={}
        trace.mode = 'markers'
        trace.type = 'scatter' 
        var x=[]
        var y=[]
        if(groupbycenter[i][0].length==1){
            for(var j=0;j<groupbycenter[i].length;j++){
                x.push(groupbycenter[i][j][0])
                y.push(0)
            }
        }else{
            for(var j=0;j<groupbycenter[i].length;j++){
                x.push(groupbycenter[i][j][0])
                y.push(groupbycenter[i][j][1])
            }
        }
        trace.x=x
        trace.y=y
        var colorr=Math.round(Math.random()*255)
        var colorg=Math.round(Math.random()*255)
        var colorb=Math.round(Math.random()*255)
        trace.marker={color:'rgb('+colorr+''+colorg+''+colorb+')'}
        DATAForPloty.push(trace)
    }
    var centerTrace={}
    centerTrace.mode = 'markers'
    centerTrace.type= 'scatter'
    centerTrace.marker={size:40}
    var cx=[]
    var cy=[]
    for (var k=0;k<data.center.length;k++){
        if(data.center[0].length==1){
            cx.push(data.center[k][0])
            cy.push(0)
        }else{
            cx.push(data.center[k][0])
            cy.push(data.center[k][1])
        }
    }
    centerTrace.x=cx
    centerTrace.y=cy
    DATAForPloty.push(centerTrace)
    Plotly.newPlot('progressGraph', DATAForPloty, {
        title:$("#myRange").val()+' iteration',
        autosize: false,
        width: 500,
        height: 500,
    });
}

function displayToTable(data,target){
    const finalTarget=target?target:'#resulttable'
    var html="<table border='1'><tr><th>coordinate</th><th>cluster</th></tr>"
    data.forEach((element)=>{
        html+="<tr><td>"+element.point+"</td><td>"+(element.cluster+1)+"</td></tr>"
    })
    html+="</table>"
    $(finalTarget).html(html)
}

function clearInput(){
    $('#data').val("")
}

class DataStack{
    constructor(){
        this.dstack=[]
    }
    pushIteration(obj){
        //console.log('before push')
        //console.log(this.dstack)
        //console.log('incoming')
        //console.log(obj)
        //console.log("pushing")
        const clone=$.extend(true,{},obj)
        this.dstack.push(clone)
        //console.log("after push")
        //console.log(this.dstack)
    }
    clearStack(){
        this.dstack=[]
    }
    getHeight(){
        return this.dstack.length
    }
    getIteration(id){
        try{
            return this.dstack[id-1]
        }catch(err){
            return undefined
        }
    }
}