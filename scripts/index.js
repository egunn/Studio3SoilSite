var canvas = document.getElementById('fpbkgrd');
var svg = document.getElementById('fpsvgbkgrd');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var width = canvas.width;
var height = canvas.height;


var context = canvas.getContext('2d');

var countryLatLong = [
    {country:"United States", lat:37.0902,long:-95.7129},
    {country:"Spain", lat:40.4637,long:-3.7492}
];



var particleArray = [];
var countryLookup;
var usExports;


var map = d3.select("#fpsvgbkgrd");

var worldMap = map.append("g")
    .attr("id", "world-map")
    .selectAll("path");

var map_data = d3.map();

var proj = d3.geoEquirectangular()
//.origin([24.7, -29.2])
//.parallels([-22.1, -34.1])
    .scale(175)
    .translate([width/2+40, height/2+20]);

//proj.fitExtent([[10, 10], [width2/2, height2]], mapBlocks);

var path = d3.geoPath()
    .projection(proj);

var destScale = d3.scaleSqrt().domain([0,45000000]).range([1,10]);
var numParticles = d3.scaleThreshold().domain([0,100000,500000,1000000,1500000,2000000,2500000,3000000, 3500000,4000000,4500000,5000000]).range([1,2,3,4,5,6,7,8,9,10,20]);
var countryColor = d3.scaleLinear().domain([0,45000000/2,45000000]).range(['#593c31','#a08d75','#9b9081']);//'#b5684c','#c16e4f']);//'#ad7966'

d3.csv('./data/exportsbyYear.csv',function(data){
    timelineData = data;
    drawTimeline(timelineData);
});


//set up scale factors
var x = d3.scaleLinear().rangeRound([0,width-100]);
var y = d3.scaleLinear().rangeRound([0, 90]);

var svgTime = d3.select('#svgTimeline');

var timeline = svgTime.append('g')
    .attr('class','timeline-group')
    .attr('transform','translate(50,10)');

//add axes and titles
var xAxis = timeline.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + 90 + ")")
    .call(d3.axisBottom(x)
        .tickSizeOuter([0])
        .tickFormat(d3.format("d")));

xAxis
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr('dx','-.8em')
    .attr("dy", "1.5em")
    .attr('font-size','12px')
    //.attr("transform", "translate(0,"+ -heightSB1 + ")rotate(-90)")
    .attr('fill','gray')
    .style("text-anchor", "center");

var yAxis = timeline.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + 0 + ",0)")
    .call(d3.axisLeft(y)
        .ticks(5).tickSizeOuter([0]));

yAxis.selectAll('text')
    .attr('fill',"gray");

//area generator
var area = d3.area()
    .x(function(d) { return x(d.year); })
    .y0(90)
    .y1(function(d) { return y(d.totalTons); });

function drawTimeline(timelineData) {

    var timelinePoints = timelineData.filter(function(d){return d.countryCode == "US"});

    timelinePoints.sort(function(a,b){return a.year - b.year});

    console.log(d3.max(timelinePoints, function (d) {return +d.totalTons;}));

    x.domain([+timelinePoints[0].year,+timelinePoints[timelinePoints.length-1].year]); //timelinePoints.map(function(d){console.log(+d.year); return +d.year;})]
    y.domain([0,d3.max(timelinePoints, function (d) {return +d.totalTons;})]);

    timeline.append('path')
        .datum(timelinePoints)
        .attr('d', area)
        .attr('fill', '#eaead7')
        .style('fill-opacity', .1);

}

// the data came from some rolling up of info I got from iec.org.za site.
// It lists the winning party, number or registered voters and votes
// cast per local municipality.
d3.csv("data/soilDataMapNames_mergingkeys_2_cut.csv", function (data) {
    data.forEach(function (d) {
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
    })
});


d3.csv('data/country_names_lookup_cut.csv', function(data){
    countryLookup = data;
    console.log(countryLookup);

    //parse country list for dropdown
    data.forEach(function(n){
        d3.select(".countryDropdown") //class in the html file
            .append("option") //it has to be called this name
            .html(n.FULLNAME) //what is going to be written in the text
                .attr("value", n.NAME); //what is going to be written in value
    });
});

countryDispatch = d3.dispatch('changeCountry');





d3.csv('data/foodExports_TR.csv', function(data){

    data.forEach(function(d){
        var dest = proj([d.destLong,d.destLat]);
        var source = proj([d.sourceLong,d.sourceLat]);
        var destTotal = d.totalTons;
        d.nP = numParticles(destTotal);

        d.bezPoints = {
            p0:{x: source[0], y:source[1]},
            p1:{x: source[0]+0, y:source[1]-(150)},//control 1 y
            p2:{x: dest[0]-0, y:dest[1]-(100)}, //control 2 y
            p3:{x: dest[0], y:dest[1]}
        };

        var particleArray = [];
        var particleRandom = Math.random()*1/d.nP;

        for (var i=0; i< d.nP; i++){
            particleArray.push(i/d.nP+particleRandom);
        }

        d.particles = particleArray;
    });

    usExports = data;
    console.log(usExports);
});

var indexToUse = 6;
var columnString = 'people per km';
//can be no zeros in the data! Need to change scale factor in cartogram.js (line 100) depending on magnitude of variable

// this loads test the topojson file and creates the map.
d3.json("data/worldcountries_fromWorking_noAntartc.topojson", function (data) {
    console.log(data);

    // Convert the topojson to geojson
   /* var topoData = topojson.feature(data,
        {
            type: "Feature Collection",
            geometry: data.objects
        });z

    var forBind = topojson.feature(data, data.objects.worldcountries);
*/
    //console.log(forBind.features);

    topoData = topojson.feature(data, data.objects.worldcountries);

    //proj.fitExtent([[10, 10], [width/2, height]], topoData);

    var titleText;

    worldMap = worldMap.data(topoData.features)//topojson.feature(data.objects.worldcountries,data.objects.worldcountries.geometries)) //topojson.feature(uk, uk.objects.subunits)
        .enter()
        .append("path")
        .attr("class", function(d){ return 'country ' + map_data.get(d.id)[0].replace(' ','-'); } )
        .attr("id", function (d) {
            //console.log(d);
            return d.id;
        })
        .attr("fill", function (e) {
            return 'none';//#baada9';//colour_map[vote_data.get(e.properties.landArea)[0]];
        })
        .style('stroke','#baada9')
        .style('stroke-width',1)
        .attr("d", path);

    countryDots = map.selectAll('.dots')
        .data(countryLookup)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('id',function(d){
            return 'dot'+ d.NAME;
        })
        .attr('cx',function(d) {return proj([d.longitude,d.latitude])[0]})
        .attr('cy',function(d) {return proj([d.longitude,d.latitude])[1]})
        .attr('fill',function(d){
            var tempCountry = usExports.filter(function(f){return f.destCode==d.NAME;});
            if(tempCountry.length != 0){
                return '#efd004'
            }
            else {
                return '#d8d3b3';
            }
        })
        .attr('r',function(d){
            var tempCountry = usExports.filter(function(f){return f.destCode==d.NAME;});
            if(tempCountry.length != 0){
                return destScale(tempCountry[0].totalTons)
            }
            else {
                return 1;
            }
            //destScale(destTotal)

        });

    /*map.append('circle')
        .attr('cx',proj([countryLatLong[1].long,countryLatLong[1].lat])[0])
        .attr('cy',proj([countryLatLong[1].long,countryLatLong[1].lat])[1])
        .attr('r',5)
        .attr('fill','lightgray');
*/

    d3.select(".countryDropdown").on("change", function () {
        countryDispatch.call("changeCountry", this, this.value);
    });

    //dispatch function
    countryDispatch.on("changeCountry", function(countrySelected,i) { //swimmer is the value of the option selected in the dropdown

    });

});

/*
//angle off of horizontal for country-country line
var countryAngle = (Math.atan2((countryLatLong[0].lat-countryLatLong[1].lat),(countryLatLong[0].long-countryLatLong[1].long)));
var gravityAngle = countryAngle - Math.PI/2;
var velocity = {x:4, y:-2.5};
var acceleration = .065;


makeParticles();

function makeParticles() {

    //for (var i=0; i< 100; i++){
        particleArray.push({
            origin:"United States",
            lat: countryLatLong[0].lat,
            long: countryLatLong[0].long,
            x: proj([countryLatLong[0].long,countryLatLong[0].lat])[0]+Math.random()*5,
            y: proj([countryLatLong[0].long,countryLatLong[0].lat])[1]+Math.random()*5,
            radius:1,
            velocity:{x:velocity.x, y:velocity.y+Math.random()*.5}
        });
    //}

    main(0);

}

function updateParticles(){
    if (particleArray.length < 100){
        particleArray.push({
            origin:"United States",
            lat: countryLatLong[0].lat,
            long: countryLatLong[0].long,
            x: proj([countryLatLong[0].long,countryLatLong[0].lat])[0]+Math.random()*5,
            y: proj([countryLatLong[0].long,countryLatLong[0].lat])[1]+Math.random()*5,
            radius:1,
            velocity:{x:velocity.x, y:velocity.y+Math.random()*.5}
        })
    }

    particleArray.forEach(function(d) {
        if(d.x < proj([countryLatLong[1].long,countryLatLong[1].lat])[0]){ //&& d.y > proj([countryLatLong[1].long,countryLatLong[1].lat])[1]) {
            d.x = d.x + d.velocity.x;
            d.y = d.y + d.velocity.y;
        }
        else{
            d.x = proj([countryLatLong[0].long,countryLatLong[0].lat])[0]+Math.random()*5;
            d.y = proj([countryLatLong[0].long,countryLatLong[0].lat])[1]+Math.random()*5;
            d.velocity.x = velocity.x;
            d.velocity.y = velocity.y+Math.random()*.5  ;
        }
        d.velocity.x = d.velocity.x + acceleration*Math.cos(gravityAngle);
        d.velocity.y = d.velocity.y+ acceleration*Math.sin(gravityAngle);
    });


    drawCanvas();
}
 */

function updateParticles(){
    drawCanvas();
}

var t = .01;

function drawCanvas(){


    /*particleArray.forEach(function(d){
        //console.log(proj([d.long,d.lat])[0],proj([d.long,d.lat])[1]);
        context.fillStyle = "gray"//"#6eebef";
        context.beginPath();
        context.arc(d.x,d.y, d.radius, 0, 2 * Math.PI, false);
        context.fill();
    })*/


    //for(var i=0;i<10;i++){
    if(usExports){
        usExports.forEach(function(d){

            var destTotal = d.totalTons;

            context.globalAlpha = 0.2;
            //var random = 0;//Math.random()*50;
            context.strokeStyle = "#c1b69c";
            context.beginPath();
            context.moveTo(d.bezPoints.p0.x, d.bezPoints.p0.y);
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
            d.particles.forEach(function(p,i){
                tempParticle = calcBezierPoint(p,d.bezPoints.p0,d.bezPoints.p1, d.bezPoints.p2,d.bezPoints.p3);

                context.fillStyle = "#efd004";//'rgb('+ 255*(.9-t)+ ','+  255*(.9-t)+ ',' + 255*(.9-t) + ')';//"#6eebef";
                context.beginPath();
                context.arc(tempParticle.x,tempParticle.y, 1.5, 0, 2 * Math.PI, false);
                context.fill();

                if (p >= 1){
                    //console.log('here');
                    /*countryDot = d3.selectAll('#dot'+d.destCode);
                    if (countryDot){
                        countryDot.attr('fill','#efd004')
                            .attr('r',destScale(destTotal))
                            .style('fill-opacity',.9);
                    }*/
                }

                if (p < 1){
                    d.particles[i] = p + .01;
                }
                else{
                    d.particles[i] = 0;
                    /*countryDot = d3.selectAll('#dot'+d.destCode);
                    if(countryDot){
                        countryDot
                            .transition()
                            .duration(450)
                            .attr('r',2)
                            .attr('fill','gray')
                            .style('fill-opacity',1);
                    }*/
                }
            });

            //}

            //}

            //console.log(t);








            var country = d3.selectAll('#'+ d.destCode);
            if (country.length != 0){
                //if(t < .9){
                    country.attr('fill',function(d){return countryColor(destTotal)})//'#593c31')
                        .style('fill-opacity',.5);

                //}
                /*else{
                    country.attr('fill','#efd004')
                        .style('fill-opacity',.7);
                }*/
            }

        });
        /*
        if (t >= .95){
            //console.log('here');
            countryDot = d3.selectAll('.dot');
            if (countryDot){
                countryDot.attr('fill','#efd004')
                    .attr('r',5)
                    .style('fill-opacity',.7);
            }

        }
        */


    }


    //}


}




//from http://stackoverflow.com/questions/9270214/html5-canvas-animating-an-object-following-a-path
function  calcBezierPoint(t, p0, p1, p2, p3) {
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
var interval = 1000/fps;
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

        //clear the canvas for redrawing
        //drawingPad.clearRect(0, 0, width, height);
        //context.fillStyle = "hsla(0,0%,100%,0.1)";
        //context.fillRect(0, 0, width, height);

        context.clearRect(0, 0, width, height);

        updateParticles();


    }
}


function update(value){
    d3.csv('data/foodExports_'+ value + '.csv', function(data){

        data.forEach(function(d){
            var dest = proj([d.destLong,d.destLat]);
            var source = proj([d.sourceLong,d.sourceLat]);
            var destTotal = d.totalTons;
            d.nP = numParticles(destTotal);

            d.bezPoints = {
                p0:{x: source[0], y:source[1]},
                p1:{x: source[0]+0, y:source[1]-(150)},//control 1 y
                p2:{x: dest[0]-0, y:dest[1]-(100)}, //control 2 y
                p3:{x: dest[0], y:dest[1]}
            };

            var particleArray = [];
            var particleRandom = Math.random()*1/d.nP;

            for (var i=0; i< d.nP; i++){
                particleArray.push(i/d.nP+particleRandom);
            }

            d.particles = particleArray;
        });

        usExports = data;
        console.log(usExports);
    });

    countryDots = map.selectAll('.dot')
        .attr('fill',function(d){
            var tempCountry = usExports.filter(function(f){return f.destCode==d.NAME;});
            if(tempCountry.length != 0){
                return '#efd004'
            }
            else {
                return '#d8d3b3';
            }
        })
        .attr('r',function(d){
            var tempCountry = usExports.filter(function(f){return f.destCode==d.NAME;});
            if(tempCountry.length != 0){
                return destScale(tempCountry[0].totalTons)
            }
            else {
                return 1;
            }
        })

}












