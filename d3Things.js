var margin = {t:30, r:20, b:20, l:40 },
w = 600 - margin.l - margin.r,
h = 500 - margin.t - margin.b,
x = d3.scale.linear().range([0, w]),
y = d3.scale.linear().range([h - 60, 0]),
//colors that will reflect geographical regions
color = d3.scale.category10(),
timeP = 'Y1014';
yParam = "religion";


function changeParam(chosen) {
    yParam = chosen;
    d3.select("#ylabel")
    .text(function() {if (chosen == "leisureTime") {return  "Importance of leisure time"} else{ return "Importance of " + chosen}});
    d3.json("infoviz-proj2/happiness.json", function(data) {
        var happinessPeriod = data[timeP];
        d3.json("infoviz-proj2/"+chosen+".json", function(data) {
            console.log(data)
            var religion = data[timeP];
            circleplot(happinessPeriod,religion)
        })
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
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
    .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
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

    d3.json("infoviz-proj2/happiness.json", function(data) { 
        var happinessPeriod = data[timeP];
        d3.json("infoviz-proj2/"+yParam+".json", function(data) {
            var religion = data[timeP];
            var circles = d3.select("#chart").select("svg").select("g").selectAll("circle")

            circleplot(happinessPeriod,religion)
            circles.on("mouseover", mouseOn);
            circles.on("mouseout", mouseOff);

        });
    });
    
});

function checkboxes(checkID, timePeriod){
    timeP = timePeriod
    var isChecked = document.getElementById("checked"+checkID.replace(/\s/g, '_')).checked;
    var checkedCountry = d3.select("#"+checkID)//.replace(/\s/g, '_'))

    if (isChecked){
        var circles = d3.select("#chart").select("svg").select("g").selectAll("circle")

        d3.json("infoviz-proj2/happiness.json", function(data) {
            var happinessPeriod = data[timeP]
            d3.json("infoviz-proj2/"+yParam+".json", function(data) {
            var religion = data[timeP];
            var elementData = [0 ,0]
            
            religion.forEach(dataObj => {   
                if (dataObj.Country == checkID.replace('_', ' ')) {  elementData[0] = [dataObj]     }         
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
        checkedCountry.remove();
    }
}

var mouseOn = function() { 
    var dataRel, dataHap;
    d3.select("#circlechart").selectAll("svg").remove()

    var circle = d3.select(this), hovering = this.id.split('_').join(' ');
    d3.select("#hoveringC")
        .text(hovering)

    d3.json("infoviz-proj2/happiness.json", function(data) {
        var happinessPeriod = data[timeP]
        d3.json("infoviz-proj2/"+yParam+".json", function(data) {
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
                        { name: 'Very Important', percent: parseInt(VI)},
                        { name: 'Rather Important', percent: parseInt(RI)},
                        { name: 'Not Very Important', percent: parseInt(NVI) },
                        { name: 'Not At All Important', percent: parseInt(NAAI) },
                        { name: 'No Answer', percent: parseInt(NA) },
                        { name: 'Others', percent: parseInt(other)}
                    ];
                }         
            })

            happinessPeriod.forEach(dataObj => {  
            //console.log("HERE ",dataObj.Country , " AND ", hovering)      
                if (dataObj.Country == hovering) {
                    var VH =0, RH =0, NVH = 0, NAAH =0 , NA=0;
                    var other = 0;
                    
                    if (!isNaN(parseFloat(dataObj.HTRU))){other += parseFloat(dataObj.HTRU) }
                    if (!isNaN(parseFloat(dataObj.DontKnow))){ other += parseFloat(dataObj.DontKnow)  }
                    //if (!isNaN(parseFloat(dataObj.N))){ other += parseFloat(dataObj.N) }

                    if (!isNaN(parseFloat(dataObj.VeryHappy))){ VH = parseFloat(dataObj.VeryHappy) } 
                    if (!isNaN(parseFloat(dataObj.RatherHappy))){  RH += parseFloat(dataObj.RatherHappy) }
                    if (!isNaN(parseFloat(dataObj.NotVeryHappy))){  NVH += parseFloat(dataObj.NotVeryHappy)  }
                    if (!isNaN(parseFloat(dataObj.NotAtAllHappy))){  NAAH += parseFloat(dataObj.NotAtAllHappy) }
                    if (!isNaN(parseFloat(dataObj.NoAnswer))){ NA += parseFloat(dataObj.NoAnswer) }

                    dataHap = [
                        { name: 'Very Happy', percent: parseInt(VH)},
                        { name: 'Rather Happy', percent: parseInt(RH)},
                        { name: 'Not Very Happy', percent: parseInt(NVH) },
                        { name: 'Not At All Happy', percent: parseInt(NAAH) },
                        { name: 'No Answer', percent: parseInt(NA) },
                        { name: 'Others', percent: parseInt(other)}
                    ];
                }
            })
            if (2 > d3.select("#circlechart").selectAll("svg").length){  /// NOT WORKING YET
                drawDiagram(dataRel)
                drawDiagram(dataHap)
            }
        })
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
function drawDiagram(dataset){
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

    var svg=d3.select("#circlechart")
            .append("svg")
            .style("margin", '40px')
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
                return d.data.percent+"%";
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
                rx:20,
                ry:20
            })
            .style({
                fill:color,
                stroke:color
            });

        legend.append('text')
            .attr({
                x:30,
                y:15
            })
            .text(function(d){
                return d;
            }).style({
                fill:'#929DAF',
                'font-size':'14px'
            });
    };

    setTimeout(restOfTheData,1000);
} //// DRAW CIRCLE END

///////                                 TIMEPERIOD CHANGED
function newTimePeriod(timePeriod){
    timeP = timePeriod;
    d3.select("#circlechart").selectAll("svg").remove() 
    d3.json("infoviz-proj2/happiness.json", function(data) {
        var happinessPeriod = data[timeP];
        d3.json("infoviz-proj2/"+yParam+".json", function(data) {
            var religion = data[timeP];
            if (happinessPeriod == null || religion == null) {
                d3.select("#hoveringC")
                    .text("No data for this time period! select new time intervall")
            }
            else{
                var allClass = document.getElementsByClassName("page-item");
                for (var i=0; i < allClass.length; i++){
                    allClass[i].classList.remove("active");
                }
                document.getElementById(timePeriod).classList.add('active');;
                d3.select("#hoveringC")
                    .text("Hover over a country")

                circleplot(happinessPeriod,religion)   
            }
        })
    })
}

/*       ////       CIRCLE PLOT!      ////       */
function circleplot(happinessPeriod,religion){  
    console.log(religion)
    
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
