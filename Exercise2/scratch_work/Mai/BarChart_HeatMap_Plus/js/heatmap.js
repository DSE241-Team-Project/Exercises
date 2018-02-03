var margin = { top: 50, right: 0, bottom: 0, left: 60 },
    width = 730 - margin.left - margin.right,
    height = 1700 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 20),
    legendElementWidth = gridSize*2,
    buckets = 5,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    countries = ["Austria", "Belgium", "Canada", "Finland", "France", "UK", "Norway",'Switzerland', 'Sweden',
        'United States', 'Germany', 'Czechoslovakia', 'Hungary', 'Italy',
        'West Germany', 'Netherlands', 'Unified Team of Germany', 'Japan',
        'Poland', 'Soviet Union', 'Korea, North', 'East Germany', 'Romania',
        'Spain', 'Liechtenstein', 'Bulgaria', 'Yugoslavia', 'China',
        'Unified Team', 'Korea, South', 'Luxembourg', 'New Zealand',
        'Australia', 'Belarus', 'Kazakhstan', 'Russia', 'Slovenia',
        'Ukraine', 'Uzbekistan', 'Czech Republic', 'Denmark', 'Croatia',
        'Estonia', 'Latvia', 'Slovakia'],
    years = ["1924", "1928", "1932", "1936", "1948", "1952", "1956", "1960", "1964", "1968", "1972", "1976", "1980",
        "1984", "1988", "1992", "1994", "1998", "2002", "2006"];

d3.csv("data/dataFemale.csv",
    function(d) {
        return {
            country: +d.CountryID,
            countryName: +d.Country,
            year: +d.YearID,
            W: +d.W
        };
    },
    function(error, data) {
        var colorScale = d3.scaleQuantile()
            .domain([0, buckets - 1, d3.max(data, function (d) { return d.W; })])
            .range(colors);

        var svg = d3.select("#chart").append("svg")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var countryLabels = svg.selectAll(".countryLabel")
    .data(countries)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-19," + gridSize / 15.5 + ")");
<!--.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });-->

var yearLabels = svg.selectAll(".yearLabel")
    .data(years)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 50 + ", -25)");
<!--.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });-->

var heatMap = svg.selectAll(".year")
    .data(data)
    .enter().append("rect")
    .attr("x", function(d) { return (d.year - 1) * gridSize; })
    .attr("y", function(d) { return (d.country - 1) * gridSize; })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("class", "hour bordered")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", colors[0]);

heatMap.transition().duration(1000)
    .style("fill", function(d) { return colorScale(d.W); });

heatMap.append("title").text(function(d) { return d.W; });

var legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), function(d) { return d; })
    .enter().append("g")
    .attr("class", "legend");

legend.append("rect")
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height)
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) { return colors[i]; });

legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return "≥ " + Math.round(d); })
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height + gridSize);
});