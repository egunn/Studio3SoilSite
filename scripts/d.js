
function drawSquares(countryObject) {

    console.log(countryObject);

    //can't bind to an object - need to put it in an array first
    var testArray = [];
    testArray.push(countryObject);

    console.log(testArray);
    //console.log(width,height);
    d3.selectAll('.squares-group').remove();
    d3.selectAll('.stats-group').remove();


    var squaresGroup = mainPlot.selectAll('.squares-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'squares-group')
        .attr('transform', 'translate(' + width / 4 + ',' + height / 3 + ')');

    var statsGroup = mainPlot.selectAll('.stats-group')
        .data(testArray)
        .enter()
        .append('g')
        .attr('class', 'stats-group')
        .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 24)
        .attr('class','country-name')
        .attr('fill',typeCol)
        /*.text(function (d) {
            console.log('here');
            return d.FULLNAME + ', ' + d.year
        })*/;

    d3.selectAll('.country-name')
        .text(function(d){
            console.log(d)
            return d.FULLNAME});// + ', ' + d.year });

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 30)
        .style('font-size', 14)
        .attr('fill',typeCol)
        .text(function (d) {
            return "Population: " + Number(d.totalPop).toLocaleString()
        });

    statsGroup.append('text')
        .attr('x', 0)
        .attr('y', 50)
        .style('font-size', 14)
        .attr('fill',typeCol)
        .text(function (d) {
            return "Total Land Area: " + Number(d.landArea).toLocaleString()
        });
/*
    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return -1;
        })
        .attr('y', function (d) {
            return -.5;
        })
        .attr('width', function (d) {
            return landAreaScale(d.urbanLand2050)
        })
        .attr('height', function (d) {
            return landAreaScale(d.urbanLand2050)
        })
        .attr('fill', 'none')
        .attr('stroke', 'grey')
        .attr('stroke-dasharray', '4,4');

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return 0;
        })
        .attr('y', function (d) {
            return -landAreaScale(d.forestArea)
        })
        .attr('width', function (d) {
            return landAreaScale(d.forestArea)
        })
        .attr('height', function (d) {
            return landAreaScale(d.forestArea)
        })
        .attr('fill', forestCol);

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return -landAreaScale(d.agriculturalLand)
        })
        .attr('y', function (d) {
            return -landAreaScale(d.agriculturalLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.agriculturalLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.agriculturalLand)
        })
        .attr('fill', agricCol);

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return -landAreaScale(d.arableLand)
        })
        .attr('y', function (d) {
            return -landAreaScale(d.arableLand)
        })
        .attr('width', function (d) {
            return landAreaScale(d.arableLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.arableLand)
        })
        .attr('fill', arableCol);

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return -landAreaScale(d.otherLand)
        })
        .attr('y', function (d) {
            return 0;
        })
        .attr('width', function (d) {
            return landAreaScale(d.otherLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.otherLand)
        })
        .attr('fill', otherCol);

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return 0;
        })
        .attr('y', function (d) {
            return 0;
        })
        .attr('width', function (d) {
            return landAreaScale(d.urbanLand)
        })
        .attr('height', function (d) {
            return landAreaScale(d.urbanLand)
        })
        .attr('fill', urbanCol);

    squaresGroup
        .append('rect')
        .attr('x', function (d) {
            return landAreaScale(d.degradingArea/2) + 100;
        })
        .attr('y', function (d) {
            return landAreaScale(d.degradingArea/2);
        })
        .attr('width', function (d) {
            return 10;
            //return landAreaScale(d.degradingArea)
        })
        .attr('height', function (d) {
            return 10;//landAreaScale(d.degradingArea)
        })
        .attr('fill', degradCol);
    */

}

