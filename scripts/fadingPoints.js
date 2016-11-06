var canvas = document.getElementById('fpbkgrd');
var svg = document.getElementById('fpsvgbkgrd');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var width = canvas.width;
var height = canvas.height;


var context = canvas.getContext('2d');

context.fillStyle = 'red';
context.fillRect(10,10,200,200);

var countryLatLong = [
    {country:"United States", lat:37.0902,long:-95.7129},
    {country:"Spain", lat:40.4637,long:-3.7492}
];



var particleArray = [];


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

    //console.log(proj([countryLatLong[0].long,countryLatLong[0].lat])[0])
    map.append('circle')
        .attr('cx',proj([countryLatLong[0].long,countryLatLong[0].lat])[0])
        .attr('cy',proj([countryLatLong[0].long,countryLatLong[0].lat])[1])
        .attr('r',5)
        .attr('fill','gray');

    map.append('circle')
        .attr('cx',proj([countryLatLong[1].long,countryLatLong[1].lat])[0])
        .attr('cy',proj([countryLatLong[1].long,countryLatLong[1].lat])[1])
        .attr('r',5)
        .attr('fill','lightgray');


});

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
        })
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

function drawCanvas(){

    /*particleArray.forEach(function(d){
        //console.log(proj([d.long,d.lat])[0],proj([d.long,d.lat])[1]);
        context.fillStyle = "gray"//"#6eebef";
        context.beginPath();
        context.arc(d.x,d.y, d.radius, 0, 2 * Math.PI, false);
        context.fill();
    })*/

    /*
    //for(var i=0;i<10;i++){
        var random = 0;//Math.random()*50;
        context.strokeStyle = "gray"
        context.beginPath();
        context.moveTo(proj([countryLatLong[0].long,countryLatLong[0].lat])[0], proj([countryLatLong[0].long,countryLatLong[0].lat])[1]);
        context.bezierCurveTo(
            proj([countryLatLong[0].long,countryLatLong[0].lat])[0]+50,  //control 1 x
            proj([countryLatLong[0].long,countryLatLong[0].lat])[1]-(100+random),//control 1 y
            proj([countryLatLong[1].long,countryLatLong[1].lat])[0]-50, //control 2 x
            proj([countryLatLong[1].long,countryLatLong[1].lat])[1]-(100+random), //control 2 y
            proj([countryLatLong[1].long,countryLatLong[1].lat])[0],  //dest x
            proj([countryLatLong[1].long,countryLatLong[1].lat])[1]); //dest y
        context.lineWidth = 1;
        context.stroke();
    //}
    */


    for (var t = .1; t < .9; t+=.1){
        var bezPoints = {
            p0:{x: proj([countryLatLong[0].long,countryLatLong[0].lat])[0], y:proj([countryLatLong[0].long,countryLatLong[0].lat])[1]},
            p1:{x: proj([countryLatLong[0].long,countryLatLong[0].lat])[0]+50, y:proj([countryLatLong[0].long,countryLatLong[0].lat])[1]-100},//control 1 y
            p2:{x: proj([countryLatLong[1].long,countryLatLong[1].lat])[0]-50, y:proj([countryLatLong[1].long,countryLatLong[1].lat])[1]-100}, //control 2 y
            p3:{x: proj([countryLatLong[1].long,countryLatLong[1].lat])[0], y:proj([countryLatLong[1].long,countryLatLong[1].lat])[1]}
        };
        tempParticle = calcBezierPoint(t,bezPoints.p0,bezPoints.p1, bezPoints.p2,bezPoints.p3);

        context.fillStyle = 'rgb('+ 255*(.9-t)+ ','+  255*(.9-t)+ ',' + 255*(.9-t) + ')';//"#6eebef";
        context.beginPath();
        context.arc(tempParticle.x,tempParticle.y, 3, 0, 2 * Math.PI, false);
        context.fill();
    }


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

var fps = 1000;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

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
















