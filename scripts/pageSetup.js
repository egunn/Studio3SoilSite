//set some margins and record width and height of window
margin = {t: 25, r: 40, b: 25, l: 40};

width = document.getElementById('mainframe').clientWidth - margin.r - margin.l;
height = document.getElementById('mainframe').clientHeight - margin.t - margin.b;

mainPlot = d3.select("#mainframe");

barGroup = mainPlot.append('g')
    .attr('class','bar-group')
    .attr('transform','translate('+ ((width/2)+70) +',0)');

landBarGroup = mainPlot.append('g')
    .attr('class','land-bar-group')
    .attr('transform','translate(75,0)');

//console.log(width, height);

//set colors
forestCol = '#42934e';//'rgba(0,100,0,.7)';
agricCol = '#e4e5d0';//'rgba(100,100,40,.2)';
arableCol = '#c6b48f';//'rgba(100,100,40,.5)';
urbanCol = '#79737a';//'rgba(50,50, 50,.7)';
otherCol = '#c2b3ce';//'rgba(175, 145, 183, 1)';//rgba(200,200, 200,1)';
degradCol = '#a3312f';//'rgba(100,0,0,.7)';
typeCol = '#ecd9c6';
mapCol = '#b2a394';
mapHighlightCol = '#e8e1da';/*'#e0cebc';*/

tracker = {country:'Nigeria', year:1975};
importedData = [];

/*
 var forestSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var agricSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var arableSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var urbanSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 var otherSize = d3.scaleLinear().range([1,10]).domain([1,10]);
 */

landAreaScale = d3.scaleSqrt().domain([0, 17000000]).range([0, width / 4]); //650

popScale = d3.scaleSqrt().domain([0, 1750000000]).range([0, 250]);
popLineScale = d3.scaleLinear().domain([0, 1750000000]).range([0, 1525]);


//set up scale factors
x = d3.scaleBand().rangeRound([0, ((width/2)-30)]).padding(0.1);
y = d3.scaleLinear().rangeRound([height, height/2]);

