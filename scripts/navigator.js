//set some margins and record width and height of window
var margin = {t:25,r:40,b:25,l:40};

var width = document.getElementById('navigator').clientWidth - margin.r - margin.l,
    height = document.getElementById('navigator').clientHeight - margin.t - margin.b;


var map = d3.select("#navigator");

var worldMap = map.append("g")
    .attr("id", "world-map")
    .selectAll("path");

var map_data = d3.map();

var proj = d3.geo.equirectangular()
//.origin([24.7, -29.2])
//.parallels([-22.1, -34.1])
    .scale(50)
    .translate([width/2+40, height/2+20]);

var path = d3.geo.path()
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
d3.json("data/worldcountries_fromWorking.topojson", function (data) {
    //console.log(data);

    // Convert the topojson to geojson
    var topoData = topojson.feature(data, data.objects.worldcountries);

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
            return 'gray';//colour_map[vote_data.get(e.properties.landArea)[0]];
        })
        .style('stroke','light-gray')
        .style('stroke-width',1)
        .attr("d", path)
        .on("mouseover", function(d){

            var continent = map_data.get(d.id)[0].replace(' ','-');
            titleText = map_data.get(d.id)[0];

            //console.log(titleText);

            //var stringCat =  '\'.' + continent + '\'';  //'&quot;' + '.' + continent + '&quot;';
            //'.' + continent
            d3.selectAll( '.' + continent ).attr('fill','green');
            d3.select(this).attr('fill','orange');
            d3.select('.title').text(titleText);

        })
        .on('mouseout',function(d){
            d3.selectAll('.country').attr('fill','gray');
        });

    worldMap.append("title")
        .text(function (d) {
            return d.id;
        });

    map.append("text")
        .attr('x',0)
        .attr('y',50)
        .attr('class','title')
        .style('font-size',18)
        .text(titleText);

});
