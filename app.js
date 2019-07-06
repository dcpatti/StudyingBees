console.log("Setting Width x Height to 960x40");
var wd = 1000;
var ht = 700;

console.log("Setting Margins - top: 5, right: 60, bottom: 30, left:60");
var margin = { top: 50, right: 60, bottom: 30, left: 60};

console.log("Inserting a new SVG object in to the Body of the HTML with Width: " + wd + " and Height: " + ht);
var svg = d3.select("#chart").append("svg").attr("width", wd).attr("height", ht)

var xScale = d3.scaleLinear().range([margin.left, wd - margin.left - margin.right]);
var yScale = d3.scaleLinear().range([ht - margin.bottom, margin.top]);
var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format(",")).tickSize(-(ht - (margin.top+margin.bottom))).ticks(5);
var yAxis = d3.axisLeft().scale(yScale).tickSize(-(wd - (margin.left+margin.right))).ticks(5);

d3.csv("2016-2017-Bees.csv", prepare, function(data)
{
  dataset = data;

  var minX = d3.min(dataset, function(d) { return d.Colonies; });
  var maxX = d3.max(dataset, function(d) { return d.Colonies; });
  var maxY = d3.max(dataset, function(d) { return d.BeeLoss; });

  console.log("Min X: " + minX);
  console.log("Max X: " + maxX);
  console.log("Max Y: " + maxY);

  xScale.domain([0, maxX]);
  yScale.domain([0, maxY]);

  svg.append("g").attr("class", "axis x").attr("transform", "translate(0," + (ht - margin.bottom) + ")").call(xAxis);
  svg.append("g").attr("class", "axis y").attr("transform", "translate(" + margin.left + ",0)").call(yAxis);

  var g = svg.selectAll("g").data(data)
  var gEnter = g.enter()
                .append("g")
                .attr("class", "bee")
                .attr("transform", function(d){return "translate(" + xScale(d.Colonies) +"," + yScale(d.BeeLoss) + ")"});

  var toolTip = d3.tip()
                  .attr("class", "d3-tip")
                  .offset([80, 10])
                  .html(function(d)
                  {
                    return (d.State + "<br/>Bee Population " + d.Colonies + " Units. <br/>" + d.BeeLoss + " % Loss.");
                  });

  svg.call(toolTip);

  var circle = gEnter.append("circle")
                     .attr("r", 9)
                     .attr("stroke","blue")
                     .attr("fill", "purple")
                     .on("mouseover", toolTip.show)
					 .on("mouseout", toolTip.hide);

  gEnter.append("text")
        .attr("text-anchor", "middle")
		.style("font-size", "12")
        .style('fill', 'white')
        .text(function(d){return d.Abb});

  svg.append("g").append("text").attr("class", "x title shadow").attr("text-anchor", "end").attr("transform", "translate(" + (wd - margin.right - 25) + "," + (ht - margin.bottom - 17) + ")").text("Bee Colony Units (1 Unit = 100 Colonies)");
  svg.append("g").append("text").attr("class", "y title shadow").attr("text-anchor", "end").attr("transform", "translate(" + (margin.left-25) + "," + (margin.top+150) + ") rotate(-90)").text("Percent Population Decline");

  d3.select("#logCheckbox").on("click", function()
  {
    if(this.checked)
    {
	  xScale = d3.scaleLog().domain([minX,maxX]).range([margin.left, wd - margin.left - margin.right]);
    }
    else
    {
      xScale = d3.scaleLinear().domain([0, maxX]).range([margin.left, wd - margin.left - margin.right]);
    }

    xAxis.scale(xScale);

    d3.select("g.axis.x").transition().duration(500).call(xAxis);

    d3.selectAll("g.bee")
      .transition()
	  .delay(400)
      .duration(600)
      .attr("transform", function(d){return "translate(" + xScale(d.Colonies) +"," + yScale(d.BeeLoss) + ")"});
  })
})

function prepare(d)
{
	d.State	= d.State;
	d.Abb = d.Abb;
	d.Colonies = +d.Colonies;
	d.BeeLoss = +d.BeeLoss;
	return d;
}