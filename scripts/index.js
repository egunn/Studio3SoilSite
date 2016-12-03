//setup resize event listener on window
window.addEventListener('resize', resizeView, false);

var canvas = document.getElementById('fpbkgrd');
var svg = document.getElementById('fpsvgbkgrd');

var width = canvas.clientWidth;
var height = canvas.clientHeight;

canvas.width = width;
canvas.height=height;

var context = canvas.getContext('2d');

var balanceData;
var tradeData;
var timelineMax;

var trade;
var selectedYear = "2013";
var clickedYear = "2013";
var selectedCountry = "US";
var selectedDirection = "Exports";
var balanceSelected = false;
var playSelected = false;

var arcColor = "#c1b69c";
var mapColor = '#593c31';
var mapHighlightColor = '#c49b13';
var mapOutlineColor = '#6d6764';
var dotColor = '#efd004';
var timelineColor = '#eaead7';
var axisTextColor = '#a09f9d';

var map = d3.select("#fpsvgbkgrd");
var svgTime = d3.select('#svgTimeline');

//set up dispatcher for the dropdown
countryDispatch = d3.dispatch('changeCountry');

var worldMap = map.append("g")
    .attr("id", "world-map")
    .selectAll("path");

var timeline = svgTime.append('g')
    .attr('class', 'timeline-group')
    .attr('transform', 'translate(80,10)');

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var map_data = d3.map();
var balance_data = d3.map();
var mouseSim;




//size scales
var destScale = d3.scaleSqrt();
var numParticles = d3.scaleLinear().domain([0, 20000]).range([1,20]);
var countryColor = d3.scaleLinear().domain([0, 45000000 / 2, 45000000]).range(['#593c31', '#a08d75', '#9b9081']);//'#b5684c','#c16e4f']);//'#ad7966'

//color scales
var balanceColorScale = d3.scaleLinear()
    .domain([-525000000,-5250000, 0, 5250000,525000000])
    .range(['#3998ad','#0e9bba', 'white','#d1298b','#e50989']); //teal gray mauve   oranges:'#f28d29','#ed7b09'

//area generator
var area = d3.area();

//map projection
var proj = d3.geoEquirectangular();

//path generator for map
var path = d3.geoPath()
    .projection(proj);

//axis scaling
var x = d3.scaleLinear();
var xBar = d3.scaleBand();
var y = d3.scaleLinear();

//runs on window resize, calls scale update and draw functions
function resizeView(){

    width = window.innerWidth;
    height = window.innerHeight;

    console.log(width, height);

    canvas.clientWidth = width;
    canvas.clientHeight = height;

    d3.select('#fpsvgbkgrd').attr('width',width).attr('height',height);
    d3.select('#fpbkgrd').attr('width',width).attr('height',height);
    //svg.clientWidth = width;
    //svg.clientHeight = height;

    resetScales();

}

function resetScales(){

     proj
        .scale(width/7)//175)
        .translate([width / 2 + 40, height / 2 + 20]);

    //set up scale factors
    x.rangeRound([0, width - 200]);
    xBar.rangeRound([0, width - 200]);
    y.rangeRound([90, 0]);

    console.log((width/1100));
    destScale.domain([0, 45000000]).range([1, 10*(width/1100)]);

    area
        .x(function (d) {
            return x(+d.year);
        })
        .y0(90)
        .y1(function (d) {
            return y(+d.totalTons);
        });

    d3.selectAll('.country')
        .attr("d", path);

    d3.selectAll('.dot')
        .attr('cx', function (d) {
            return proj([d.longitude, d.latitude])[0]
        })
        .attr('cy', function (d) {
            return proj([d.longitude, d.latitude])[1]
        });


    if(mouseSim){

       mouseSim.nodes().forEach(function (d) {
           d.fx = proj([d.longitude, d.latitude])[0];
           d.fy = proj([d.longitude, d.latitude])[1];

           d.x = proj([d.longitude, d.latitude])[0];
           d.y = proj([d.longitude, d.latitude])[1];
        });
    }

    d3.selectAll('.bar')
        .attr('x', function (d) {
            return xBar(d.year);
        })
            .attr('y', y(timelineMax))
            .attr('width', xBar.bandwidth())
            .attr('height', function (d) {
                return 90
            })
    d3.selectAll('.axis--x').call(d3.axisBottom(x));
    d3.selectAll('.axis--y').call(d3.axisLeft(y));

    update(selectedCountry, 'Exports', selectedYear);

}




queue()
    .defer(d3.json, "./data/worldcountries_fromWorking_noAntartc.topojson")
    .defer(d3.csv, "./data/soilDataMapNames_mergingkeys_2_cut.csv")
    .defer(d3.csv, './data/country_names_lookup_cut.csv')
    .defer(d3.csv, './data/foodExports_byYear/foodExports_US.csv')
    .defer(d3.csv, './data/exportsbyYear.csv')
    .defer(d3.csv, './data/balanceSheetData.csv')
    //wait for a variable to be returned for each file loaded: blocks from blk_group file, neighborhoods from bos_neighborhoods, and income from the parsed acs.csv.
    .await(function (err, mapData, mapKeys, countryTable, foodExports, timeline, balance) {

        timelineData = timeline;

        mapKeys.forEach(function (d) {
            map_data.set(d.NAME,
                [
                    d.continent,
                    d.country,
                    d.landArea, //0
                    d.arableLand, //1
                    d.agriculturalLand, //2
                    d.forestArea, //3
                    d.urbanLand, //4
                    d.urbanLand2050, //5
                    d.degradingArea, //6
                    d.totalPop, //7
                    d.totalPop2050,  //8
                    d.urbanPop, //9
                    d.otherLand, //10
                    d.peoplePerKm, //11
                    d.peoplePerKmUrban, //12
                    d.peoplePerKm2050  //13
                ]);
        });

        console.log(countryTable);

        //parse country list for dropdown
        countryTable.forEach(function (n) {
            d3.select(".countryDropdown") //class in the html file
                .append("option") //it has to be called this name
                .html(n.FULLNAME) //what is going to be written in the text
                .attr("value", n.NAME); //what is going to be written in value
        });

        foodExports.forEach(function (d) {
            var dest = proj([d.destLong, d.destLat]);
            var source = proj([d.sourceLong, d.sourceLat]);
            var destTotal = d.totalTons;
            d.nP = numParticles(destTotal);

            d.bezPoints = {
                p0: {x: source[0], y: source[1]},
                p1: {x: source[0] + 0, y: source[1] - (150)},//control 1 y
                p2: {x: dest[0] - 0, y: dest[1] - (100)}, //control 2 y
                p3: {x: dest[0], y: dest[1]}
            };

            var particleArray = [];
            var particleRandom = Math.random() * 1 / d.nP;

            for (var i = 0; i < d.nP; i++) {
                particleArray.push(i / d.nP + particleRandom);
            }

            d.particles = particleArray;
        });

        //remove data for all but the default year
        trade = foodExports.filter(function (d) {
            return d.year == selectedYear;
        });

        console.log(trade);

        console.log(balance);

        balanceData = balance;

        var maxIn = d3.max(balance, function (d) {
            return d.importQuantity
        });
        var maxOut = d3.max(balance, function (d) {
            return d.exportQuantity
        });

        var scaleMax = Math.max(maxIn, maxOut);

        //balanceColorScale.domain([-scaleMax, 0, scaleMax]);

        //balanceColorScale.domain([]);
        balance.forEach(function (d) {

            balance_data.set(d.countryCode,
                [
                    d.countryName,
                    d.exportQuantity,
                    d.importQuantity, //0
                    d.production, //1
                    d.year
                ]);

        });

        resetScales();
        drawTimeline(timelineData);
        svgLoaded(mapData, countryTable)

    });


function drawTimeline(timelineData) {

    var timelinePoints = timelineData.filter(function (d) {
        return d.countryCode == selectedCountry
    });

    timelinePoints.sort(function (a, b) {
        return +a.year - +b.year
    });

    timelineMax = d3.max(timelinePoints, function (d) {
        return +d.totalTons
    });

    x.domain([+timelinePoints[0].year, +timelinePoints[timelinePoints.length - 1].year]); //timelinePoints.map(function(d){console.log(+d.year); return +d.year;})]
    xBar.domain(timelinePoints.map(function (d) {
        return d.year;
    }));

    y.domain([0, timelineMax]);

    //add axes and titles
    var xAxis = timeline.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 90 + ")")
        .call(d3.axisBottom(x)
            .tickSizeOuter([0])
            .tickFormat(d3.format("d"))
        );

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx', '-.8em')
        .attr("dy", "1.5em")
        .attr('font-size', '12px')
        //.attr("transform", "translate(0,"+ -heightSB1 + ")rotate(-90)")
        .attr('fill', axisTextColor)
        .style("text-anchor", "center");


    var yAxis = timeline.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(d3.axisLeft(y)
            .ticks(5)
            //.tickValues([0, timelineMax/4, timelineMax/2, 3*timelineMax/4, timelineMax])
            .tickSizeOuter([0]));

    yAxis.selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', axisTextColor);


    timeline.append('path')
        .datum(timelinePoints)
        .attr('class', 'timeline-graph')
        .attr('d', area)
        .attr('fill', timelineColor)
        .style('fill-opacity', .1);

    timeline.selectAll('.bar')
        .data(timelinePoints)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('id', function (d) {
            return 'bar-' + d.year;
        })
        .attr('x', function (d) {
            return xBar(d.year);
        })
        .attr('y', function (d) {
            return y(d3.max(timelinePoints, function (d) {
                return +d.totalTons;
            }))
        })
        .attr('width', xBar.bandwidth())
        .attr('height', function (d) {
            return 90
        })
        .attr('fill', 'transparent')
        .on('mouseenter', function (d) {
            //d3.selectAll('.bar').attr('fill','transparent');
            selectedYear = d.year;
            d3.select(this).style('fill-opacity', .2).attr('fill', 'gray');//.style('fill-opacity',.2).attr('fill',mapHighlightColor);
            update(selectedCountry, selectedDirection, d.year);
            /*
             console.log('here');
             if(d.year != selectedYear){
             d3.select(this).style('fill-opacity',.4).attr('fill','gray');//mapHighlightColor);
             }*/
        })
        .on('mouseleave', function (d) {
            if (d.year != clickedYear) {
                d3.select(this).attr('fill', 'transparent');
                selectedYear = clickedYear;
                update(selectedCountry, selectedDirection, clickedYear);
            }
            else {
                timeline.selectAll('#bar-' + clickedYear).style('fill-opacity', .2).attr('fill', mapHighlightColor);
            }
        })
        .on('click', function (d) {
            d3.selectAll('.bar').attr('fill', 'transparent');
            clickedYear = d.year;
            d3.select(this).style('fill-opacity', .2).attr('fill', mapHighlightColor);
            update(selectedCountry, selectedDirection, d.year);
        });

    timeline.selectAll('#bar-' + clickedYear).style('fill-opacity', .2).attr('fill', mapHighlightColor);

}


var indexToUse = 6;
var columnString = 'people per km';

// this loads test the topojson file and creates the map.
function svgLoaded(data, countryLookup) {

    //set up a force simulation to use for mouse detection
    //give it the countryLookup array as its set of nodes (things that it will compare mouse position to)
    mouseSim = d3.forceSimulation(countryLookup);

    //set fixed x and y coordinates for each node, based on the stored lat/long values
    mouseSim.nodes().forEach(function (d) {
        d.fx = proj([d.longitude, d.latitude])[0];
        d.fy = proj([d.longitude, d.latitude])[1];
    });

    //set up mouse listener on the canvas, and have it use the simulation to find nodes within a given radius of the mouse cursor
    d3.select('#fpbkgrd')
        .on("mousemove", function () {

            var closestNode = mouseSim.find(d3.mouse(this)[0], d3.mouse(this)[1], 5);

            if (closestNode) {
                //from https://bl.ocks.org/d3noob/036d13e5173de69f7758091ba9a2df2b
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(
                    closestNode.FULLNAME)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 24) + "px");
            }

            else {
                div.transition()
                    .duration(100)
                    .style("opacity", 0);
            }
        })
        .on('click', function () {
            var closestNode = mouseSim.find(d3.mouse(this)[0], d3.mouse(this)[1], 5);
            console.log(closestNode);

            if (closestNode) {

                console.log('fix dropdown!!');

                if (!balanceSelected) {
                    selectedCountry = closestNode.NAME;
                }


                //var dropdown = d3.select('#countryDropdown').property('value',closestNode.NAME).html(closestNode.FULLNAME).each(changeCountry);//node();

                //dropdown.value = selectedCountry;
                //dropdown.property('selected', selectedCountry);
                //console.log(d3.selectAll('#countryDropdown').node().value);

                //https://github.com/d3/d3/issues/100
                //d3.select("input[value=\"stacked\"]").property("checked", true).each(change);

                //http://stackoverflow.com/questions/26898814/setting-default-selection-of-a-dropdown-menu-with-d3


                //countryDispatch.call('changeCountry', closestNode.NAME, closestNode.FULLNAME);
                //dropdown.value = selectedCountry;
                //console.log('here');
                //countryDispatch.call("changeCountry", dropdown, selectedYear);
                //changeCountry(dropdown, selectedYear);

                update(selectedCountry, selectedDirection, selectedYear);
            }
        });

    console.log(data);

    topoData = topojson.feature(data, data.objects.worldcountries);

    var titleText;

    worldMap = worldMap.data(topoData.features)//topojson.feature(data.objects.worldcountries,data.objects.worldcountries.geometries)) //topojson.feature(uk, uk.objects.subunits)
        .enter()
        .append("path")
        .attr("class", function (d) {
            return 'country ' + map_data.get(d.id)[0].replace(' ', '-');
        })
        .attr("id", function (d) {
            //console.log(d);
            return d.id;
        })
        .attr("fill", function (e) {
            if (e.id == "US") {
                return mapHighlightColor;
            }
            else {
                return mapColor;//#baada9';//colour_map[vote_data.get(e.properties.landArea)[0]];
            }

        })
        .style('fill-opacity', '.5')
        .style('stroke', mapOutlineColor)//'#baada9')
        .style('stroke-width', 1)
        .attr("d", path);


    console.log(countryLookup);

    var countryDots = map.selectAll('.dot')
        .data(countryLookup)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('id', function (d) {
            return 'dot' + d.NAME;
        })
        .attr('cx', function (d) {
            return proj([d.longitude, d.latitude])[0]
        })
        .attr('cy', function (d) {
            return proj([d.longitude, d.latitude])[1]
        })
        .attr('fill', function (d) {
            var tempCountry = trade.filter(function (f) {
                return f.destCode == d.NAME;
            });
            if (tempCountry.length != 0) {
                return dotColor;
            }
            else {
                return 'gray';//'#d8d3b3';
            }
        })
        .attr('r', function (d) {
            var tempCountry = trade.filter(function (f) {
                return f.destCode == d.NAME;
            });
            if (tempCountry.length != 0) {
                return destScale(tempCountry[0].totalTons)
            }
            else {
                return 1;
            }

        });

};


function updateParticles() {
    drawCanvas();
}

var t = .01;

function drawCanvas() {

    //for(var i=0;i<10;i++){
    if (trade) {

        trade.forEach(function (d) {


            //max distance between countries is ~ 20000 mi.

            var destTotal = d.totalTons;

            context.globalAlpha = 0.15;
            //var random = 0;//Math.random()*50;
            context.strokeStyle = arcColor;
           // context.globalCompositeOperation  = 'darker';
            context.beginPath();
            context.moveTo(d.bezPoints.p0.x, d.bezPoints.p0.y);
            /*context.lineTo(d.bezPoints.p3.x,  //dest x
            d.bezPoints.p3.y); //dest y)*/
            context.bezierCurveTo(
                d.bezPoints.p1.x,//[countryLatLong[0].long,countryLatLong[0].lat])[0]+50,  //control 1 x
                d.bezPoints.p1.y,//control 1 y
                d.bezPoints.p2.x, //control 2 x
                d.bezPoints.p2.y, //control 2 y
                d.bezPoints.p3.x,  //dest x
                d.bezPoints.p3.y); //dest y
            context.lineWidth = 1;
            context.stroke();

            //for (var t = .1; t < .9; t+=.1){

            //for (var i = 0; i < nP; i++){
            d.particles.forEach(function (p, i) {

                tempParticle = calcBezierPoint(p, d.bezPoints.p0, d.bezPoints.p1, d.bezPoints.p2, d.bezPoints.p3);

                context.fillStyle = "#efd004";//'rgb('+ 255*(.9-t)+ ','+  255*(.9-t)+ ',' + 255*(.9-t) + ')';//"#6eebef";
                //context.globalCompositeOperation  = 'lighter';
                context.beginPath();
                context.arc(tempParticle.x, tempParticle.y, 1.5, 0, 2 * Math.PI, false);

                context.fill();

                if (p < 1) {
                    d.particles[i] = p + .01;
                }
                else {
                    d.particles[i] = 0;
                }
            });

            /*
             var country = d3.selectAll('#'+ d.destCode);
             if (country.length != 0){
             country.attr('fill', mapColor)//function(d){return countryColor(destTotal)})//'#593c31')
             .style('fill-opacity',.5);

             }*/

        });

    }


    //}


}


//from http://stackoverflow.com/questions/9270214/html5-canvas-animating-an-object-following-a-path
function calcBezierPoint(t, p0, p1, p2, p3) {
    var data = [p0, p1, p2, p3];
    var at = 1 - t;
    for (var i = 1; i < data.length; i++) {
        for (var k = 0; k < data.length - i; k++) {
            data[k] = {
                x: data[k].x * at + data[k + 1].x * t,
                y: data[k].y * at + data[k + 1].y * t
            };
        }
    }
    return data[0];
};


//frame rate control from http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
//set up vars for controlling frame rate

var fps = 10;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

main(0);

//main loop
function main() {

    // Request animation frames - tells the browser to run this function before the browser refreshes.
    //Removing this returns a static window
    window.requestAnimationFrame(main);

    now = Date.now();
    delta = now - then;

    if (delta > interval) { //update time

        // Just `then = now` is not enough. Lets say we set fps at 10 which means
        // each frame must take 100ms. Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until delta > interval === true
        // Eventually this lowers down the FPS as 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms by subtracting delta (112) % interval (100).
        then = now - (delta % interval);

        context.clearRect(0, 0, width, height);

        if (!balanceSelected) {
            updateParticles();
        }
    }

}


function update(value, impExp, year) {

    if (!balanceSelected) {
        console.log('here');

        d3.csv('data/food' + impExp + '_byYear/food' + impExp + '_' + value + '.csv', function (data) {

            selectedCountry = value;

            //reset all country colors to brown
            map.selectAll('.country')
                .attr('fill', mapColor)
                .style('fill-opacity', '.5');

            data.forEach(function (d) {
                var dest = proj([d.destLong, d.destLat]);
                var source = proj([d.sourceLong, d.sourceLat]);
                var destTotal = d.distance;
                d.nP = numParticles(destTotal);

                d.bezPoints = {
                    p0: {x: source[0], y: source[1]},
                    p1: {x: source[0] + 0, y: source[1] - (200)},//control 1 y
                    p2: {x: dest[0] - 0, y: dest[1] - (100)}, //control 2 y
                    p3: {x: dest[0], y: dest[1]}
                };

                var particleArray = [];
                var particleRandom = Math.random() * 1 / d.nP;

                for (var i = 0; i < d.nP; i++) {
                    particleArray.push(i / d.nP + particleRandom);
                }

                d.particles = particleArray;
            });

            var tradeLong = data;

            trade = tradeLong.filter(function (d) {
                return d.year == selectedYear;
            });


            if (impExp == "Imports") {

                countryDots = map.selectAll('.dot')
                    .attr('fill', function (d) {
                        var tempCountry = trade.filter(function (f) {
                            return f.sourceCode == d.NAME;
                        });
                        if (tempCountry.length != 0) {
                            return dotColor;
                        }
                        else {
                            return 'gray'; //'#d8d3b3';
                        }
                    })
                    .attr('r', function (d) {
                        var tempCountry = trade.filter(function (f) {
                            return f.sourceCode == d.NAME;
                        });
                        if (tempCountry.length != 0) {
                            return destScale(tempCountry[0].totalTons)
                        }
                        else {
                            return 1;
                        }
                    });
            }
            else {

                countryDots = map.selectAll('.dot')
                    .attr('fill', function (d) {
                        var tempCountry = trade.filter(function (f) {
                            return f.destCode == d.NAME;
                        });
                        if (tempCountry.length != 0) {
                            return dotColor;
                        }
                        else {
                            return 'gray'; //'#d8d3b3';
                        }
                    })
                    .attr('r', function (d) {
                        var tempCountry = trade.filter(function (f) {
                            return f.destCode == d.NAME;
                        });
                        if (tempCountry.length != 0) {
                            return destScale(tempCountry[0].totalTons)
                        }
                        else {
                            return 1;
                        }
                    });

            }

            var timelinePoints = timelineData.filter(function (d) {
                return d.countryCode == value
            });

            y.domain([0, d3.max(timelinePoints, function (d) {
                return +d.totalTons;
            })]);

            var yAxis = timeline.selectAll('.axis--y')
                .call(d3.axisLeft(y).ticks(5));

            yAxis.selectAll('text')
                .attr('fill', axisTextColor);

            timeline.selectAll('.timeline-graph')
                .datum(timelinePoints)
                .attr('d', area);


            var getCountry = map.selectAll("#" + value);

            if (impExp == "Exports") {
                getCountry.attr('fill', mapHighlightColor);
            }
            if (impExp == "Imports") {
                getCountry.attr('fill', mapHighlightColor);
            }

            //timeline.selectAll('.bar').attr('fill','transparent');
            //timeline.selectAll('#bar-' + selectedYear).style('fill-opacity',.2).attr('fill',mapHighlightColor);
        });
    }
    else {
        tempCountries = d3.selectAll('.country');

        tempCountries.attr('fill', 'gray');

        d3.selectAll('.dot').attr('r', '1').attr('fill', 'gray');
        /*
         d.countryName, //0
         d.exportQuantity, //1
         d.importQuantity, //2
         d.production, //3
         d.year  //4
         */

        var balanceYear = balanceData.filter(function (d) {
            return +d.year == selectedYear
        });

        balanceYear.forEach(function (d) {

            if (balanceYear.length > 0) {
                d3.selectAll('#' + d.countryCode).attr('fill', balanceColorScale(d.exportQuantity - d.importQuantity));
            }
        });

        /*tempCountries.nodes().forEach(function(d){
         var tempBal =  balance_data.get(d.id);
         });*/
    }

}


d3.select(".countryDropdown").on("change", function () {
    countryDispatch.call("changeCountry", this, this.value);
});

//dispatch function updates the selected country and calls the update function when dropdown item is selected
countryDispatch.on("changeCountry", function (countrySelected, i) { //country is the value of the option selected in the dropdown
    update(countrySelected, 'Exports', selectedYear);

});

function importClicked() {

    selectedDirection = "Imports";

    balanceSelected = false;

    //from http://jaketrent.com/post/d3-class-operations/
    var exportButton = d3.selectAll('#exportButton')
        .classed("selected", false); //toggle !exportButton.classed("selected")

    var importButton = d3.selectAll('#importButton')
        .classed('selected', true);

    var balanceButton = d3.selectAll('#balanceButton')
        .classed('selected', false);

    d3.csv('./data/importsbyYear.csv', function (data) {
        timelineData = data;
        update(selectedCountry, 'Imports', selectedYear);
    });

}

function exportClicked() {

    selectedDirection = "Exports";

    balanceSelected = false;

    //from http://jaketrent.com/post/d3-class-operations/
    var exportButton = d3.selectAll('#exportButton')
        .classed("selected", true); //toggle !exportButton.classed("selected")

    var importButton = d3.selectAll('#importButton')
        .classed('selected', false);

    var balanceButton = d3.selectAll('#balanceButton')
        .classed('selected', false);

    d3.csv('./data/exportsbyYear.csv', function (data) {
        timelineData = data;
        update(selectedCountry, 'Exports', selectedYear);
    });
}

function balanceClicked() {

    balanceSelected = true;

    //from http://jaketrent.com/post/d3-class-operations/
    var exportButton = d3.selectAll('#exportButton')
        .classed("selected", false); //toggle !exportButton.classed("selected")

    var importButton = d3.selectAll('#importButton')
        .classed('selected', false);

    var balanceButton = d3.selectAll('#balanceButton')
        .classed('selected', true);

    //clear canvas
    //filter data to year
    //re-draw SVG for all countries
    //replace timeline with data point browser

    update();
}


function playClicked() {
    var playButton = d3.selectAll('#playButton')
        .classed("selected", true); //toggle !exportButton.classed("selected")

    var pauseButton = d3.selectAll('#pauseButton')
        .classed('selected', false);

    console.log('play')
}


function pauseClicked() {

    var playButton = d3.selectAll('#playButton')
        .classed("selected", false); //toggle !exportButton.classed("selected")

    var pauseButton = d3.selectAll('#pauseButton')
        .classed('selected', true);

    console.log('pause')
}

