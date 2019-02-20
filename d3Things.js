var margin = {t:30, r:20, b:20, l:40 },
w = 600 - margin.l - margin.r,
h = 500 - margin.t - margin.b,
x = d3.scale.linear().range([0, w]),
y = d3.scale.linear().range([h - 60, 0]),
//colors that will reflect geographical regions
color = d3.scale.category10(),
timeP = 'Y1014',
yParam = "religion",
xParam = "happiness";
var st= "20",
numberOfP = 0;
function changeX(chosen){
    d3.select("#circlechart").selectAll("svg").remove()     
    d3.select("#hoveringC")
        .text("Hover over a country")
    d3.selectAll(".questions")
        .text("")
    xParam = chosen;    
    d3.select("#xlabel")
        .text(function() {if (chosen == "happiness") {return  "Feeling of Happiness"} else{ return "GDP per capita (1000$)"}});
    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(20)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(20)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("left");

    if (chosen == "happiness"){
        x.domain([0, 100]);
        d3.selectAll("g.xaxis")
            .call(xAxis);
        d3.json("happiness.json", function(data) {
            var happinessPeriod = data[timeP];
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP];
                circleplot(happinessPeriod,religion)
            })
        })
    }
    else {
        x.domain([0, 80]);
        d3.selectAll("g.xaxis")
            .call(xAxis);

        gapminder() 
    }
}

function gapminder() {
    var listCountries = [];
    var incomeAvr = {};         
    d3.json(yParam+".json", function(data) {
        var religion = data[timeP];
        d3.json(xParam+".json", function(data) {
            //console.log(data)
            data.forEach(element => {
                if (timeP == "Y1014"|| timeP == "Y0509")  { st= "20"; }
                else { st = "19";  }

                var startYear = parseInt(st+timeP.slice(1, 3));
                var endYear = parseInt(st+timeP.slice(3, 5));

                if (timeP =="Y9904") {startYear = "1999"; endYear = "2004"}
                
                var year = parseInt(element.Year)
                if (year <= endYear && year >= startYear ){
                    listCountries = [];
                    religion.forEach(function (value) {
                        var land = value.Country
                        if (element[land]){  
                            if (incomeAvr[land]){
                                incomeAvr[land] = [parseInt(incomeAvr[land][0]) + parseInt(element[land]), parseInt(incomeAvr[land][1])+1]
                            }else{
                                incomeAvr[land] = [parseInt(element[land]),1]
                            }
                            if (year == endYear) {
                                incomeAvr[land] = parseInt(incomeAvr[land][0])/parseInt(incomeAvr[land][1])
                                listCountries.push(value)
                            }
                        }                            
                    })
                }
            });
            var circles = d3.select("#chart").select("svg").select("g").selectAll("circle").data(listCountries)

            circles.exit().remove();
            circles.enter().append("circle").style("fill", "#f00");
               
            circles.attr("class", "circles")
                .attr({id: function(d) { return d.Country.replace(/\s/g, '_'); }})   
                .attr({
                    cx: function(d) {
                        return x(+incomeAvr[d.Country]/1000); 
                    },
                    cy: function(d) { 
                        var religionImportance = 0;
                        var religNumbers = [parseFloat(d.VeryImportant), parseFloat(d.RatherImportant), parseFloat(d.NotVeryImportant), parseFloat(d.NotAtAllImportant)]
                        religNumbers.forEach(function (value, i) {
                            if (isNaN(value)) {
                                religionImportance = religionImportance + 0;
                            }
                            else if (i==0) {
                                religionImportance = religionImportance + (value*1);
                            }
                            else if (i==1) {
                                religionImportance = religionImportance + (value*0.66);
                            }
                            else if (i==2) {
                                religionImportance = religionImportance + (value*0.33);
                            }
                            else if (i==3) {
                                religionImportance = religionImportance + (value*0);
                            }
                        });
                        return y(+religionImportance); },
                    r: function(d) {if (d.Country == "World Average"){return 14} else{return 8}},
                    })
                    .style("fill", function(d) { return color(d.Country); })

            d3.select("#chart").select("svg").select("g").selectAll("circle")
            .on("mouseover", mouseOn).on("mouseout", mouseOff);

            d3.select("#countries")
            .html(function() {
                var count = 0, string =""; 
                listCountries.forEach(function (value, i) {
                    string +=  '<br/> <input type="checkbox" checked="checked" id="checked'+value.Country.replace(/\s/g, '_') +'" onclick="checkboxes(\''+value.Country.replace(/\s/g, '_') +'\', \''+timeP+'\')">   ' + value.Country;
                    count = i;
                });
                string = String(count) + " countries displayed " + string;             
            return string           
            })
        })
    })  
}

function changeParam(chosen) {
    d3.select("#circlechart").selectAll("svg").remove()     
    d3.select("#hoveringC")
        .text("Hover over a country")
    d3.selectAll(".questions")
        .text("")
    yParam = chosen;
    d3.select("#ylabel")
    .text(function() {if (chosen == "leisureTime") {return  "Importance of leisure time"} else{ return "Importance of " + chosen}});
    d3.json(xParam+".json", function(data) {
        if (xParam == "happiness"){
            var happinessPeriod = data[timeP];
            d3.json(chosen+".json", function(data) {
                //console.log(data)
                var religion = data[timeP];
                circleplot(happinessPeriod,religion)
            })
        }
        else if (xParam == "income"){
            gapminder()
        }
        
    })
}

document.addEventListener("DOMContentLoaded", function(event) { 
    var svg = d3.select("#chart").append("svg")
        .attr("id", "svg")
        .attr("width", w + margin.l + margin.r)
        .attr("height", h + margin.t + margin.b);

    // set axes, as well as details on their ticks
    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(20)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(20)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("left");

    x.domain([0, 100]);
    y.domain([0, 100])
    // group that will contain all of the plots
    var groups = svg.append("g").attr("id","plotting").attr("transform", "translate(" + margin.l + "," + margin.t + ")");
    // array of the regions, used for the legend
    var regions = ["Asia", "Europe", "Middle East", "N. America", "S. America", "Sub-Saharan Africa"]

    svg.append("g")
    .attr("class", "xaxis axis")
    .attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
    .call(xAxis);

    svg.append("g")
        .attr("class", "yaxis axis")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")")
        .call(yAxis);

    svg.append("text")
        .attr("id", "xlabel")            
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", w + 50)
        .attr("y", h - margin.t - 5)
        .text("Feeling of happiness");

    svg.append("text")
        .attr("id", "ylabel")            
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -20)
        .attr("y", 45)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Importance of religion");

    d3.json(xParam+".json", function(data) { 
        if (xParam == "happiness"){
            var happinessPeriod = data[timeP];
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP];
                var circles = d3.select("#chart").select("svg").select("g").selectAll("circle")

                circleplot(happinessPeriod,religion)
                circles.on("mouseover", mouseOn);
                circles.on("mouseout", mouseOff);
            });
        }
        else if (xParam =="income") {
            gapminder()
        }
    });
    
});

function checkboxes(checkID, timePeriod){
    d3.select("#circlechart").selectAll("svg").remove()         
    d3.selectAll(".questions")
        .text("")
    timeP = timePeriod
    var isChecked = document.getElementById("checked"+checkID.replace(/\s/g, '_')).checked;
    var checkedCountry = d3.select("#"+checkID)//.replace(/\s/g, '_'))

    if (isChecked){
        var circles = d3.select("#chart").select("svg").select("g").selectAll("circle")
        if (xParam == "happiness"){
            d3.json(xParam+".json", function(data) {
                var happinessPeriod = data[timeP];
                d3.json(yParam+".json", function(data) {
                    var religion = data[timeP];
                    var elementData = [0 ,0]
                    
                    religion.forEach(dataObj => {   
                        if (dataObj.Country == checkID.replace('_', ' ')) {  elementData[0] = [dataObj]  }         
                    })
                    happinessPeriod.forEach(happinessP => {     
                        if (happinessP.Country == checkID.replace('_', ' ')) { elementData[1] = [happinessP] }
                    })

                    var circles = d3.select("#chart").select("svg").select("g")

                    circles.append("circle")
                        .attr("class", "circles")
                        .attr({
                            id: function() { var d = elementData[0][0]; return d.Country.replace(/\s/g, '_'); } ,
                            cx: function() { 
                                var d = elementData[1][0]
                                var happyNumbers = [parseFloat(d.VeryHappy), parseFloat(d.RatherHappy), parseFloat(d.NotVeryHappy), parseFloat(d.NotAtAllHappy)]
                                var happiness = 0;
                                happyNumbers.forEach(function (value, i) {
                                    if (isNaN(value)) { happiness = happiness + 0; }
                                    else if (i==0) { happiness = happiness + (value*1); }
                                    else if (i==1) {  happiness = happiness + (value*0.66);  }
                                    else if (i==2) {  happiness = happiness + (value*0.33); }
                                    else if (i==3) { happiness = happiness + (value*0); }
                                });
                                return x(+happiness); 
                            },
                            cy: function() {           
                                var d = elementData[0][0];
                                var religionImportance = 0;
                                religion.forEach(dataObj => {     
                                    if (dataObj.Country == d.Country) {
                                        var religNumbers = [parseFloat(dataObj.VeryImportant), parseFloat(dataObj.RatherImportant), parseFloat(dataObj.NotVeryImportant), parseFloat(dataObj.NotAtAllImportant)]
                                        religNumbers.forEach(function (value, i) {
                                            if (isNaN(value)) { religionImportance = religionImportance + 0; }
                                            else if (i==0) { religionImportance = religionImportance + (value*1);  }
                                            else if (i==1) { religionImportance = religionImportance + (value*0.66);  }
                                            else if (i==2) {  religionImportance = religionImportance + (value*0.33);   }
                                            else if (i==3) {  religionImportance = religionImportance + (value*0); }
                                        });
                                    }
                                })
                                return y(+religionImportance); },
                            r: function() {
                                var d = elementData[0][0];
                                if (d.Country == "World Average"){return 14} else{return 8}},
                            })
                        .style("fill", function() {var d = elementData[0][0]; return color(d.Country); })
                        .on("mouseover", mouseOn)
                        .on("mouseout", mouseOff); 
                })
            })
        }
        else{

            var elementData = [0 ,0]            
            var incomeAvr = {};         
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP];
                d3.json(xParam+".json", function(data) {

                    religion.forEach(dataObj => {   
                        if (dataObj.Country == checkID.replace('_', ' ')) {  elementData[0] = dataObj  }         
                    })

                    if (timeP == "Y1014"|| timeP == "Y0509")  { st= "20"; }
                    else { st = "19";  }
                    var startYear = parseInt(st+timeP.slice(1, 3));
                    var endYear = parseInt(st+timeP.slice(3, 5));

                    data.forEach(element => {
                        var year = parseInt(element.Year)
                        if (year <= endYear && year >= startYear ){
                            religion.forEach(function (value) {
                                var land = value.Country
                                if (land == elementData[0].Country){  
                                    if (incomeAvr[land]){
                                        incomeAvr[land] = [parseInt(incomeAvr[land][0]) + parseInt(element[land]), parseInt(incomeAvr[land][1])+1]
                                    }else{
                                        incomeAvr[land] = [parseInt(element[land]),1]
                                    }
                                    if (year == endYear) {
                                        elementData[1] = parseInt(incomeAvr[land][0])/parseInt(incomeAvr[land][1])
                                    }
                                }                            
                            })
                        }
                    });
                    var circles = d3.select("#chart").select("svg").select("g")
                    
                    circles.append("circle")
                        .attr("class", "circles")
                        .attr({id: function() { var d = elementData[0]; return d.Country.replace(/\s/g, '_'); }})   
                        .attr({
                            cx: function(d) {
                                return x(+elementData[1]/1000); 
                            },
                            cy: function() { 
                                var d = elementData[0];                                
                                var religionImportance = 0;
                                var religNumbers = [parseFloat(d.VeryImportant), parseFloat(d.RatherImportant), parseFloat(d.NotVeryImportant), parseFloat(d.NotAtAllImportant)]
                                religNumbers.forEach(function (value, i) {
                                    if (isNaN(value)) { religionImportance = religionImportance + 0; }
                                    else if (i==0) { religionImportance = religionImportance + (value*1);  }
                                    else if (i==1) { religionImportance = religionImportance + (value*0.66);  }
                                    else if (i==2) {  religionImportance = religionImportance + (value*0.33);   }
                                    else if (i==3) {  religionImportance = religionImportance + (value*0); }
                                });
                                return y(+religionImportance); },
                            r:  8 })
                            .style("fill", function() { return color(elementData[0].Country); })
                            .on("mouseover", mouseOn)
                            .on("mouseout", mouseOff); 
                })
            })
        }
    }
    else{
        checkedCountry.remove();
    }
}

var mouseOn = function() { 
    d3.select("#moredata").selectAll(".questions").remove()
    d3.selectAll("#topquestion")
        .text("Questions asked to the participants of the surveys:")
    var dataRel, dataHap;
    d3.select("#circlechart").selectAll("svg").remove()

    var circle = d3.select(this), 
    hovering = this.id.split('_').join(' ');
    d3.select("#hoveringC")
        .text(hovering)

    d3.json(xParam+".json", function(data) {
        if (xParam == "happiness"){
            var happinessPeriod = data[timeP];
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP];
                
                var elementData = [0 ,0]
                religion.forEach(dataObj => {
                    if (dataObj.Country == hovering) { 
                        var VI =0, RI =0, NVI = 0, NAAI =0 , NA=0;
                        var other = 0;
                        if (!isNaN(parseFloat(dataObj.BHHTRU))){ other += parseFloat(dataObj.BHHTRU) }
                        if (!isNaN(parseFloat(dataObj.DontKnow))){  other += parseFloat(dataObj.DontKnow)  }
                        
                        if (!isNaN(parseFloat(dataObj.N))){ 
                            d3.select("#moredata").append("h4")
                                .attr("class", "questions")
                                .text(function() { 
                                    numberOfP = dataObj.N ;
                                    if (numberOfP.length == 4 && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "0"
                                    }else if (numberOfP.length == 3  && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "00"
                                    }else if (numberOfP.length == 2  && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "000"
                                    }
                                    else if (numberOfP.length == 1  ){
                                        numberOfP = String(dataObj.N) + "000"
                                    }

                                    return "Amount of participants in each survey: " + numberOfP
                                })
                        }else{
                            d3.select("#moredata").append("h4")
                                .attr("class", "questions")
                                .text("Amount of participants for "+ yParam + " survey not available")
                        }

                        if (!isNaN(parseFloat(dataObj.VeryImportant))){  VI = parseFloat(dataObj.VeryImportant) } 
                        if (!isNaN(parseFloat(dataObj.RatherImportant))){ RI += parseFloat(dataObj.RatherImportant) }
                        if (!isNaN(parseFloat(dataObj.NotVeryImportant))){  NVI += parseFloat(dataObj.NotVeryImportant)  }
                        if (!isNaN(parseFloat(dataObj.NotAtAllImportant))){  NAAI += parseFloat(dataObj.NotAtAllImportant) }
                        if (!isNaN(parseFloat(dataObj.NoAnswer))){  NA += parseFloat(dataObj.NoAnswer) }
                        
                        dataRel = [
                            { name: 'Very Important', percent: VI.toFixed(1)},
                            { name: 'Rather Important', percent: RI.toFixed(1)},
                            { name: 'Not Very Important', percent: NVI.toFixed(1) },
                            { name: 'Not At All Important', percent: NAAI.toFixed(1) },
                            { name: 'No Answer', percent: NA.toFixed(1) },
                            { name: 'Other', percent: other.toFixed(1)}
                        ];
                    }         
                })

                happinessPeriod.forEach(dataObj => {  
                //console.log("HERE ",dataObj.Country , " AND ", hovering)      
                    if (dataObj.Country == hovering) {
                        var VH =0, RH =0, NVH = 0, NAAH =0 , NA=0;
                        var other = 0;
                        
                        if (!isNaN(parseFloat(dataObj.HTRU))){other += (dataObj.HTRU) }
                        if (!isNaN(parseFloat(dataObj.DontKnow))){ other += (dataObj.DontKnow)  }

                        /*if (!isNaN(parseFloat(dataObj.N))){ 
                            d3.select("#moredata").append("h4")
                                .attr("class", "questions")                            
                                .text(function() { 
                                    console.log(dataObj.N)
                                    numberOfP = dataObj.N ;
                                    if (numberOfP.length == 3  && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "00"
                                    }else if (numberOfP.length == 4  && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "0"
                                    }else if (numberOfP.length == 2  && String(dataObj.N).includes(".")){
                                        numberOfP = String(dataObj.N) + "000"
                                    }
                                    else if (numberOfP.length == 1){
                                        numberOfP = String(dataObj.N) + "000"
                                    }
                                    return "Amount of participants in " + xParam + " survey: "+ numberOfP
                                })
                        }*/

                        if (!isNaN(parseFloat(dataObj.VeryHappy))){ VH = parseFloat(dataObj.VeryHappy) } 
                        if (!isNaN(parseFloat(dataObj.RatherHappy))){  RH += parseFloat(dataObj.RatherHappy) }
                        if (!isNaN(parseFloat(dataObj.NotVeryHappy))){  NVH += parseFloat(dataObj.NotVeryHappy)  }
                        if (!isNaN(parseFloat(dataObj.NotAtAllHappy))){  NAAH += parseFloat(dataObj.NotAtAllHappy) }
                        if (!isNaN(parseFloat(dataObj.NoAnswer))){ NA += parseFloat(dataObj.NoAnswer) }

                        dataHap = [
                            { name: 'Very Happy', percent: VH.toFixed(1)},
                            { name: 'Rather Happy', percent: RH.toFixed(1)},
                            { name: 'Not Very Happy', percent: NVH.toFixed(1) },
                            { name: 'Not At All Happy', percent: NAAH.toFixed(1) },
                            { name: 'No Answer', percent: NA.toFixed(1) },
                            { name: 'Other', percent: other}
                        ];
                    }
                })
                if (2 > d3.select("#circlechart").selectAll("svg").length){  /// NOT WORKING YET
                    drawDiagram(dataRel, yParam)
                    drawDiagram(dataHap, "happiness")
                }
            })
        }
        else{
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP];
                var elementData = [0 ,0]
                religion.forEach(dataObj => {
                    if (dataObj.Country == hovering) { 
                        var VI =0, RI =0, NVI = 0, NAAI =0 , NA=0;
                        var other = 0;
                        if (!isNaN(parseFloat(dataObj.BHHTRU))){ other += parseFloat(dataObj.BHHTRU) }
                        if (!isNaN(parseFloat(dataObj.DontKnow))){  other += parseFloat(dataObj.DontKnow)  }
                        //if (!isNaN(parseFloat(dataObj.N))){other += parseFloat(dataObj.N)}

                        if (!isNaN(parseFloat(dataObj.VeryImportant))){  VI = parseFloat(dataObj.VeryImportant) } 
                        if (!isNaN(parseFloat(dataObj.RatherImportant))){ RI += parseFloat(dataObj.RatherImportant) }
                        if (!isNaN(parseFloat(dataObj.NotVeryImportant))){  NVI += parseFloat(dataObj.NotVeryImportant)  }
                        if (!isNaN(parseFloat(dataObj.NotAtAllImportant))){  NAAI += parseFloat(dataObj.NotAtAllImportant) }
                        if (!isNaN(parseFloat(dataObj.NoAnswer))){  NA += parseFloat(dataObj.NoAnswer) }
                        
                        dataRel = [
                            { name: 'Very Important', percent: VI.toFixed(1)},
                            { name: 'Rather Important', percent: RI.toFixed(1)},
                            { name: 'Not Very Important', percent: NVI.toFixed(1) },
                            { name: 'Not At All Important', percent: NAAI.toFixed(1) },
                            { name: 'No Answer', percent: NA.toFixed(1) },
                            { name: 'Other', percent: other.toFixed(1)}
                        ];
                    }         
                })
                if (2 > d3.select("#circlechart").selectAll("svg").length){  /// NOT WORKING YET
                    drawDiagram(dataRel,yParam, hovering)
                }
            })
        }
    })

    circle.transition()
        .duration(800).style("opacity", 1)
        .attr("r", 16).ease("elastic");

    // append lines to bubbles that will be used to show the precise data points. translate their location based on margins
    d3.select("#chart").select("svg").append("g")
        .attr("class", "guide")
    .append("line")
        .attr("x1", circle.attr("cx"))
        .attr("x2", circle.attr("cx"))
        .attr("y1", +circle.attr("cy") + 26)
        .attr("y2", h - margin.t - margin.b)
        .attr("transform", "translate(40,20)")
        .style("stroke", circle.style("fill"))
        .transition().delay(200).duration(400).styleTween("opacity", 
                    function() { return d3.interpolate(0, .5); })

    d3.select("#chart").select("svg").append("g")
        .attr("class", "guide")
    .append("line")
        .attr("x1", +circle.attr("cx") - 16)
        .attr("x2", 0)
        .attr("y1", circle.attr("cy"))
        .attr("y2", circle.attr("cy"))
        .attr("transform", "translate(40,30)")
        .style("stroke", circle.style("fill"))
        .transition().delay(200).duration(400).styleTween("opacity", 
                    function() { return d3.interpolate(0, .5); });

// function to move mouseover item to front of SVG stage, in case another bubble overlaps it
    d3.selection.prototype.moveToFront = function() { 
        return this.each(function() { 
        this.parentNode.appendChild(this); 
        }); 
    };
};

var mouseOff = function() {
    var circle = d3.select(this);

    circle.transition()
    .duration(800).style("opacity", .5)
    .attr("r", function() { if (this.id == "World_Average") {return 14} else return 8}).ease("elastic");

    d3.selectAll(".guide").transition().duration(100).styleTween("opacity", 
        function() { return d3.interpolate(.5, 0); })
        .remove()
};
  
        ////// CIRCLE DIAGRAM    ////
function drawDiagram(dataset, typeText, hovering){
    var pie=d3.layout.pie()
        .value(function(d){return d.percent})
        .sort(null)
        .padAngle(.03);

    var w=300,h=300;

    var outerRadius=w/2;
    var innerRadius=100;

    var color = d3.scale.category10();

    var arc=d3.svg.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);

    if( typeText != "happiness"){
        d3.select("#importance").text("How important are "+ typeText+"?")
        if (xParam == "income"){
            d3.json(yParam+".json", function(data) {
                var religion = data[timeP] ;   
                religion.forEach(element => {
                    if(element.Country == hovering){
                        if (!isNaN(parseFloat(element.N))){ 
                            d3.select("#moredata").append("h4")
                                .attr("class", "questions")
                                .text(function() { 
                                    console.log(element)
                                    numberOfP = element.N ;
                                    if (numberOfP.length == 4 && String(element.N).includes(".")){
                                        numberOfP = String(element.N) + "0"
                                    }else if (numberOfP.length == 3  && String(element.N).includes(".")){
                                        numberOfP = String(element.N) + "00"
                                    }else if (numberOfP.length == 2  && String(element.N).includes(".")){
                                        numberOfP = String(element.N) + "000"
                                    }
                                    else if (numberOfP.length == 1  ){
                                        numberOfP = String(element.N) + "000"
                                    }
                                    else if (numberOfP.length ==0){ 
                                        numberOfP = 0
                                        return "Amount of participants for "+ yParam + " survey not available"
                                    }
                                    return "Amount of participants in "+ yParam + " survey: " + numberOfP
                            })
                        }
                        else{
                            d3.select("#moredata").append("h4")
                                .attr("class", "questions")
                                .text("Amount of participants for "+ yParam + " survey not available")
                        }
                    }
                });
                
                /*d3.select("#moredata").append("h4")
                    .attr("class", "questions")                            
                    .text("Amount of participants in "+ yParam +" survey: " + numberOfP)*/
        })
    }
        
    }
    else {
        d3.select("#happy").text("How happy are you?")
    }
    /*d3.select("#circlechart")
        .append("text")
            .attr("x", function() { return 10 })
            .attr("y", function() { return 30})
            .text( function () { return "How important is "+ typeText; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");*/

    
    var svg=d3.select("#circlechart").append("svg")
        .style("margin", '5px')
        .attr({
            width:w,
            height:h,
            class:'shadow'
        }).append('g')
        .attr({
            transform:'translate('+w/2+','+h/2+')'
        });

    var path=svg.selectAll('path')
            .data(pie(dataset))
            .enter()
            .append('path')
            .attr({
                d:arc,
                fill:function(d,i){
                    return color(d.data.name);
                }
            });

    path.transition()
            .duration(800)
            .attrTween('d', function(d) {
                var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

    var restOfTheData=function(){
        var text=svg.selectAll('text')
            .data(pie(dataset))
            .enter()
            .append("text")
            .transition()
            .duration(200)
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".4em")
            .attr("text-anchor", "middle")
            .text(function(d){
                if(d.data.percent != 0){
                    return d.data.percent+"%";
                }
            })
            .style({
                fill:'#fff',
                'font-size':'10px'
            });

        var legendRectSize=20;
        var legendSpacing=7;
        var legendHeight=legendRectSize+legendSpacing;

        var legend=svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr({
                class:'legend',
                transform:function(d,i){
                    //Just a calculation for x & y position
                    return 'translate(-35,' + ((i*legendHeight)-65) + ')';
                }
            });

        legend.append('rect')
            .attr({
                width:legendRectSize,
                height:legendRectSize,
                rx:10,
                ry:20
            })
            .style({
                fill:color,
                stroke:color
            });

        legend.append('text')
            .attr({
                x:20,
                y:15
            })
            .text(function(d){
                return d;
            }).style({
                fill: "black",
                'font-size':'14px'
            });

            
    };

    setTimeout(restOfTheData,1000);
} //// DRAW CIRCLE END

///////                                 TIMEPERIOD CHANGED
function newTimePeriod(timePeriod){
    d3.selectAll(".questions")
        .text("")
    timeP = timePeriod;
    d3.select("#circlechart").selectAll("svg").remove() 
    d3.json(xParam+".json", function(data) {
        var happinessPeriod = data;
        d3.json(yParam+".json", function(data) {
            var religion = data[timeP];
            if (xParam == "happiness"){
                happinessPeriod = happinessPeriod[timeP];
                if (happinessPeriod == null || religion == null) {
                    d3.selectAll("circle").remove()               
                    d3.select("#hoveringC")
                        .text("No data for this time period! select new time interval")
                    d3.select("#countries")
                        .text("No data for this time period! select new time interval")
                }
                else{
                    var allClass = document.getElementsByClassName("page-item");
                    for (var i=0; i < allClass.length; i++){
                        allClass[i].classList.remove("active");
                    }
                    document.getElementById(timePeriod).classList.add('active');;
                    d3.select("#hoveringC")
                        .text("Hover over a country!")

                    circleplot(happinessPeriod,religion)   
                }
            }
            else if (xParam =="income") {
                if (religion == null) {
                    d3.selectAll("circle").remove()               
                    d3.select("#hoveringC")
                        .text("No data for this time period! select new time interval")
                    d3.select("#countries")
                        .text("No data for this time period! select new time interval")
                }
                else{
                    var allClass = document.getElementsByClassName("page-item");
                    for (var i=0; i < allClass.length; i++){
                        allClass[i].classList.remove("active");
                    }
                    document.getElementById(timePeriod).classList.add('active');;
                    d3.select("#hoveringC")
                        .text("Hover over a country")
                    gapminder()
                }
            }
        })            
    })
}

/*       ////       CIRCLE PLOT!      ////       */
function circleplot(happinessPeriod,religion){  
    listCountries = [];
    religion.forEach(dataObj => {    
        happinessPeriod.forEach(hp => {     
            if (hp.Country == dataObj.Country){
                listCountries.push(hp)
            }
        })
    })
    var circles = d3.select("#chart").select("svg").select("g").selectAll("circle").data(listCountries)

    circles.exit().remove();
    circles.enter().append("circle").style("fill", "#f00");
        
    circles.attr("class", "circles")
        .attr({id: function(d) { return d.Country.replace(/\s/g, '_'); }})   
        /*.transition()
        .duration(1000)*/
        .attr({
            cx: function(d) { 
                var happyNumbers = [parseFloat(d.VeryHappy), parseFloat(d.RatherHappy), parseFloat(d.NotVeryHappy), parseFloat(d.NotAtAllHappy)]
                var happiness = 0;
                happyNumbers.forEach(function (value, i) {
                    if (isNaN(value)) {
                        happiness = happiness + 0;
                    }
                    else if (i==0) {
                        happiness = happiness + (value*1);
                    }
                    else if (i==1) {
                        happiness = happiness + (value*0.66);
                    }
                    else if (i==2) {
                        happiness = happiness + (value*0.33);
                    }
                    else if (i==3) {
                        happiness = happiness + (value*0);
                    }
                });
                return x(+happiness); 
            },
            cy: function(d) { 
                var religionImportance = 0;
                religion.forEach(dataObj => {     
                    if (dataObj.Country == d.Country) {
                        var religNumbers = [parseFloat(dataObj.VeryImportant), parseFloat(dataObj.RatherImportant), parseFloat(dataObj.NotVeryImportant), parseFloat(dataObj.NotAtAllImportant)]
                        religNumbers.forEach(function (value, i) {
                            if (isNaN(value)) {
                                religionImportance = religionImportance + 0;
                            }
                            else if (i==0) {
                                religionImportance = religionImportance + (value*1);
                            }
                            else if (i==1) {
                                religionImportance = religionImportance + (value*0.66);
                            }
                            else if (i==2) {
                                religionImportance = religionImportance + (value*0.33);
                            }
                            else if (i==3) {
                                religionImportance = religionImportance + (value*0);
                            }
                        });
                    }
                })
                return y(+religionImportance); },
            r: function(d) {if (d.Country == "World Average"){return 14} else{return 8}},
            })
            .style("fill", function(d) { return color(d.Country); })

    d3.select("#chart").select("svg").select("g").selectAll("circle")
    .on("mouseover", mouseOn).on("mouseout", mouseOff);

    d3.select("#countries")
    .html(function() {
        var i = 0, string ="";
        religion.forEach(dataObj => {    
            happinessPeriod.forEach(hp => {     
                if (hp.Country == dataObj.Country){
                    string +=  '<br/> <input type="checkbox" checked="checked" id="checked'+hp.Country.replace(/\s/g, '_') +'" onclick="checkboxes(\''+hp.Country.replace(/\s/g, '_') +'\', \''+timeP+'\')">   ' + hp.Country
                    i++;
                }
            })
        })
        string = String(i) + " countries displayed " + string;             
    return string           
    })
}
/**   END OF CIRCLE PLOT  */
