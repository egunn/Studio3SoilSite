
var map = d3.select("#map"),
    zoom = d3.behavior.zoom()
        .translate([-38, 32])
        .scale(.94)
        .scaleExtent([0.5, 10.0])
        .on("zoom", updateZoom),
    layer = map.append("g")
        .attr("id", "layer"),
    mapg = layer.append("g")
        .attr("id", "mapg")
        .selectAll("path");

colors = colorbrewer.RdYlBu[3]
    .reverse()
    .map(function(rgb) { return d3.hsl(rgb); });

// map.call(zoom);
updateZoom();

function updateZoom() {
    var scale = zoom.scale();
    layer.attr("transform",
        "translate(" + zoom.translate() + ") " +
        "scale(" + [scale, scale] + ")");
}


var proj = d3.geo.albers()
    .scale(125),
    topology,
    geometries,
    rawData,
    dataById = {},
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {
            console.log(d);
            return dataById[d.id];
        })
        .value(function(d) {
            console.log(d);
            return +d.properties[field];
        });



d3.json("./worldcountries_fromWorking.topojson", function(topo) {
    console.log(topo);
    topology = topo;
    geometries = topology.objects.worldcountries.geometries;
    d3.csv("./soilDataMapNames_paddedtoMap_andCut.csv", function(data) {
        rawData = data;
        dataById = d3.nest()
            .key(function(d) { return d.mapName; })
            .rollup(function(d) { return d[0]; })
            .map(data); //makes an object with country names as keys for the .csv row objects
        init();
    });
});

function init() {
    var features = carto.features(topology, geometries),
        path = d3.geo.path()
            .projection(proj);

    console.log(topology);
    console.log(geometries);
    console.log(features);

    mapg = mapg.data(features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("id", function(d) {
            if (d.properties != undefined){
                return d.properties.mapName;
            }

        })
        .attr("fill", "gray")
        .attr("d", path);

}


//runs when user presses the button
function buttonPress(){

    /*var key = field.key.replace("%d", year),
         fmt = (typeof field.format === "function")
            ? field.format
            : d3.format(field.format || ","),*/
     var value = function(d) {
         //console.log(d);
         if (typeof d.properties === "undefined"){
            //console.log(d);
         }
         else {
             return d.properties.mapName;
         }
     }

    var values = mapg.data()
            .map(value)
            .filter(function(n) {
                return !isNaN(n);
            })
            .sort(d3.ascending),
        lo = values[0],
        hi = values[values.length - 1];

    var color = d3.scale.linear()
        .range(colors)
        .domain(lo < 0
            ? [lo, 0, hi]
            : [lo, d3.mean(values), hi]);


    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);

    // tell the cartogram to use the scaled values
    carto.value(function(d) {
        return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = carto(topology, geometries).features;
    console.log(features);

    // update the data
    mapg.data(features)
        .select("title")
        .text(function(d) {
            console.log(fmt(value(d)));
            console.log(field.unit);
            //return [d.properties.FULLNAME, fmt(value(d))].join(": ") + field.unit;
            return d.properties.mapName;
        });

    mapg.transition()
        .duration(750)
        .ease("linear")
        .attr("fill", function(d) {
            return color(value(d));
        })
        .attr("d", carto.path);


}

