d3.csv('./soilData_allyrs1019.csv', dataLoaded); //soilDataMapNames_mergingkeys_2_cut.csv', dataLoaded);

function dataLoaded(soilData) {
    console.log(soilData);

    importedData = soilData;
    updateData();
}

function updateData() {

    //.reduce()
    //.groupAll()
    /*var byContinent = cf.dimension(function (d) {
     return d.continent;
     });*/

    /*
     var byYear = cf.dimension(function(d){
     return +d.year;
     });
     var data2013 = byYear.filterExact("2013").top(Infinity);
     */

    console.log(tracker.year, tracker.country);

    //set up initial crossfilter
    var cf = crossfilter(importedData);

    //add a dimension using the year value
    var byYear = cf.dimension(function (d) {
        return +d.year;
    });

    //add another dimension that groups by country
    var byCountry = cf.dimension(function (d) {
        //console.log(d);
        return d.country;
    });


    //console.log(byCountry.top(Infinity));  //returns the entire original array of objects
    //console.log(byCountry.group().top(Infinity));  //returns an array of 197 countries, with counts for each (no objects)
    //console.log(byCountry.filter(function(d){return d}).group().top(Infinity));  //same as above
    //console.log(byCountry.filterExact("Argentina").top(Infinity));  //returns all years for Argentina, as objects

    var countryPop = byCountry.filterExact(tracker.country).top(Infinity);

    //get data for Argentina in 2010
    //console.log(byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == '2010';}));
    var countryYear = byCountry.filterExact(tracker.country).top(Infinity).filter(function(d){return d.year == tracker.year;});

    var data2010 = byYear.filterExact("2010").top(Infinity);  //return an array with all countries with objects from 2015
    var databyCountry = byCountry.filter(function(d) {
        return d;
    });

    countryArray = databyCountry.top(Infinity);

    var testSort = countryArray.sort(function(b,a){
        return +a.totalPop - +b.totalPop;
    });

    //console.log(testSort.slice(0,4));

    /*var byPop2013 = byYear.filter(function(d){ //filter the same dimension again, with a population condition
     //console.log(d);
     return +d.totalPop;
     });*/
    //console.log(byPop2013.top(Infinity));

    //var test = byYear.filterExact("totalPop").top(Infinity);

    //console.log(test);

    //var groupByContinent = byContinent.group();
    //console.log(groupByContinent.top(2));

    //sort the entire array by the totalPop column (need to convert to number; otherwise, reads as string)
    /*var byPopulation = cf.dimension(function (d) {
     return +d.totalPop;
     });
     */

    //console.log(testSort.slice(0));  //this gives an array of 200 objects!

    drawSquares(countryYear[0]);
    drawLandBars(countryPop);
    drawBars(countryPop,'totalPop');
}

