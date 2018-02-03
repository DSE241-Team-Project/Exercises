var margin = { top: 50, right: 0, bottom: 100, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 530 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 45),
    legendElementWidth = gridSize*2,
    buckets = 9,
    //colors =["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
    colors =["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], 
        //["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "084594"], //Blue shading colors
        //["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    years = ["1924", "1928", "1932", "1936", "1948", "1952", "1956", "1960", "1964", "1968", "1972", "1976", "1980",
        "1984", "1988", "1992", "1994", "1998", "2002", "2006"],
    countries = ["Austria", "Belgium", "Canada", "Finland", "France", "UK", "Norway",'Switzerland', 'Sweden',
        'United States', 'Germany', 'Czechoslovakia', 'Hungary', 'Italy',
        'West Germany', 'Netherlands', 'Unified Team of Germany', 'Japan',
        'Poland', 'Soviet Union', 'Korea, North', 'East Germany', 'Romania',
        'Spain', 'Liechtenstein', 'Bulgaria', 'Yugoslavia', 'China',
        'Unified Team', 'Korea, South', 'Luxembourg', 'New Zealand',
        'Australia', 'Belarus', 'Kazakhstan', 'Russia', 'Slovenia',
        'Ukraine', 'Uzbekistan', 'Czech Republic', 'Denmark', 'Croatia',
        'Estonia', 'Latvia', 'Slovakia'];

datasets = ["data/dataTotal.csv","data/dataFemale.csv","data/dataMale.csv"];

height_org = 530;


var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearLabels = svg.selectAll(".yearLabel")
    .data(years)
    .enter().append("text")
    .text(function (d) { return d; })
    //.attr("x", 0)
    //.attr("y", function (d, i) { return (i * gridSize); })
    .attr("x", function (d, i) { return (i * gridSize); })
    .attr("y", 0)
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize /1.5 + ")")
    .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "yearLabel mono axis axis-workweek" : "yearLabel mono axis"); });

var countryLabels = svg.selectAll(".countryLabel")
    .data(countries)
    .enter().append("text")
    .text(function(d) { return d; })
    //.attr("x", function(d, i) { return i * gridSize; })
    //.attr("y", 0)
    .attr("x", 0
    .attr("y", function(d, i) { return i * gridSize; })
    .style("text-anchor", "middle")
    .attr("transform","translate(" + gridSize / 2 + ", -6)")
    //.attr("transform", "translate(300,150) rotate("+nAngle+")");
    //.attr("transform", "translate(" + gridSize / 2 + ", -6) rotate("+45+")")
    //.attr("transform", rotate("+45+"))
    .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "countryLabel mono axis axis-worktime" : "countryLabel mono axis"); });

    // countryLabels.select("text") 
    // 	.attr("transform", "translate(" + gridSize / 2 + ", -6) rotate(-90)");

   svg.append("text")
  .attr("x", (width / 2))
  .attr("y", 0 - (margin.top/2))
  .attr("text-anchor", "middle")
  .style("font-size", "20px")
  .style("text-decoration", "underline")
  .text("Number of Metal Heatmap Overview");

var heatmapChart = function(csvFile) {
    d3.csv(csvFile,
        function(d) {
            return {
                year: +d.YearID,
                hour: +d.CountryID,
                value: +d.value
            };
        },
        function(error, data) {
            var colorScale = d3.scaleQuantile()
                .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
                .range(colors);

            var cards = svg.selectAll(".hour")
                .data(data, function(d) {return d.year+':'+d.hour;});

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.hour - 1) * gridSize + 17; })
                .attr("y", function(d) { return (d.year - 1) * gridSize + 20; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

            cards.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });

            cards.select("title").text(function(d) { return d.value; });

            cards.exit().remove();

            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + 50)
                .attr("width", legendElementWidth)
                .attr("height", gridSize/2+5)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .attr("class", "mono")
                .text(function(d) { return "≥ " + Math.round(d); })
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + gridSize + 45);

            legend.exit().remove();

        });
};

heatmapChart(datasets);

buttonNames = ["Total metals heatmap", "Female metals heatmap", "Male metals heatmap"];

svg.append("text")
.attr("x", 20)
.attr("y", height + 95)
.attr("text-anchor", "left")
.style("font-size", "15px")
//.style("text-decoration", "underline")
.text("Please double click to view all genders, female or male heatmap");

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
    .data(datasets);

datasetpicker.enter()
    .append("input")
    .attr("value", function(d,i){ return "Dataset " + d })
    .attr("type", "button")
    .attr("class", "dataset-button")
    .on("click", function(d) {
        heatmapChart(d);
    });


// var eventselector = document.getElementById("#chart")
// eventselector.addEventListener('change', heatmapChart[0]);

//heatmapChart(datasets[0]);