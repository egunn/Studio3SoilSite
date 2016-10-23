function drawBars(data, variable) {

    data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));*/

    //map axes onto data
    x.domain(data.map(function (d) {
        return +d.year;
    }));
    y.domain([0, d3.max(data, function (d) {
        return +d[variable];
    })]);

    //add axes and titles
    var xAxis = barGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','8px')
        .attr("transform", "rotate(-90)")
        .attr('fill',typeCol)
        .style("text-anchor", "end");

    var yAxis = barGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d3.formatPrefix(",.0", 1e6)));

    yAxis.selectAll('text')
        .attr('fill',typeCol);

    //d3.selectAll('.axis').selectAll('ticks').attr('fill',typeCol);

    /*.append("text")
     .style('fill', 'gray')
     .style('font-size', '12px')
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Minutes");*/

    barGroup.append('text')
        .attr('x', 150)
        .attr('y', height/2)
        .style('font-size', 12)
        .attr('fill',typeCol)
        .style('text-anchor', 'middle')
        .text('Population Growth Over Time');

    barGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',typeCol)
        .style('font-size', 12);

    //draw bars
    barGroup.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d[variable]);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', '#ed9f23');//'#3b5c91');

}


function drawLandBars(data) {

    data.sort(function(b,a){return b.year-a.year;});

    /*console.log(d3.max(data, function (d) {
     return +d.totalPop;
     }));*/

    //map axes onto data
    x.domain(data.map(function (d) {
        return +d.year;
    }));
    y.domain([0, d3.max(data, function (d) {
        return +d.landArea;
    })]);

    //add axes and titles
    var xAxis = landBarGroup.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues([1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015])); //come back and rebuild this!

    xAxis
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr('dx','-2em')
        .attr("dy", ".35em")
        .attr('font-size','8px')
        .attr("transform", "rotate(-90)")
        .attr('fill',typeCol)
        .style("text-anchor", "end");

    var yAxis = landBarGroup.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d3.formatPrefix(",.0", 1e6)));

    yAxis.selectAll('text')
        .attr('fill',typeCol);

    //d3.selectAll('.axis').selectAll('ticks').attr('fill',typeCol);

    /*.append("text")
     .style('fill', 'gray')
     .style('font-size', '12px')
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Minutes");*/

    landBarGroup.append('text')
        .attr('x', 150)
        .attr('y', height/2)
        .style('font-size', 12)
        .attr('fill',typeCol)
        .style('text-anchor', 'middle')
        .text('Land Use Change Over Time');

    landBarGroup.append('text')
        .attr('class', 'bar-label')
        .attr('fill',typeCol)
        .style('font-size', 12);


    //draw bars
    landBarGroup.selectAll(".forest-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "forest-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.forestArea);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', forestCol);//'#3b5c91');

    //draw bars
    landBarGroup.selectAll(".agric-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "agric-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.agriculturalLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', agricCol);//'#3b5c91');


    //draw bars
    landBarGroup.selectAll(".arable-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "arable-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.arableLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', arableCol);//'#3b5c91');


    //draw bars
    landBarGroup.selectAll(".other-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "other-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.otherLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', otherCol);//'#3b5c91');

    //draw bars
    landBarGroup.selectAll(".urban-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "urban-bar")
        .attr("x", function (d) {
            return x(d.year);
        })
        .attr("y", function (d) {
            //console.log(d);
            return  y(d.urbanLand);
        })
        .attr("width", x.bandwidth())
        .attr("height", 1/*function (d) {
         return height -y(d[variable]);
         }*/)
        .attr('fill', urbanCol);//'#3b5c91');


}