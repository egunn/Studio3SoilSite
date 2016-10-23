
//runs when user presses the button
function update() {

}

function reset(){

    d3.select("#slider").value = 0;

}

//Play button modified from https://jsfiddle.net/bfbun6cc/4/
//Run the update function when the slider is changed
d3.select('#slider').on('input', function() {

    tracker.year = this.value;
    //console.log(this.value);
    updateData();

});


var myTimer;
d3.select("#play").on("click", function() {
    clearInterval (myTimer);
    myTimer = setInterval (function() {
        var b= d3.select("#slider");
        var t = (+b.property("value") + 1) % (+b.property("max") + 1);
        if (t == 0) { t = +b.property("min"); }
        b.property("value", t);
        if (t<20){
            update (t);
        }
        else {
            reset()
        }
    }, 100);
});

d3.select("#stop").on("click", function() {
    clearInterval (myTimer);
});