// Check breakpoint
function breakCalc(x) {
    x <= 480 ? y = 'xs' : y = 'md';
    return y;
}

var breakpoint = breakCalc($(window).width());

$(window).resize(function() {
    var breakpoint = breakCalc($(window).width());
})

// change the height of the chart depending on the breakpoint
function breakHeight(bp) {
    bp == 'xs' ? y = 250 : y = 500;
    return y;
}

// function to group by multiple properties in underscore.js
_.groupByMulti = function(obj, values, context) {
    if (!values.length)
        return obj;
    var byFirst = _.groupBy(obj, values[0], context),
        rest = values.slice(1);
    for (var prop in byFirst) {
        byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
    }
    return byFirst;
};

// function to decide whether to pluralize the word "award" in the tooltip
function awardPlural(x) {
    x == 1 ? y = 'award' : y = 'awards';
    return y;
}

// funciton to determine the century of the datapoint when displaying the tooltip
function century(x) {
    x < 100 ? y = '19' + x : y = '20' + (x.toString().substring(1));
    return y;
}

// function to ensure the tip doesn't hang off the side
function tipX(x) {
    var winWidth = $(window).width();
    var tipWidth = $('.tip').width();
    if (breakpoint == 'xs') {
        x > winWidth - tipWidth - 20 ? y = x - tipWidth : y = x;
    } else {
        x > winWidth - tipWidth - 30 ? y = x - 45 - tipWidth : y = x + 10;
    }
    return y;
}

// function to create the chart
function chart(column, filterBy, groupBy) {

    function parse(data) {
        // this filters and groups the data
        // based on the filters provided in the .chart div (see the html file)
        var filter;
        var searchObj = {};
        searchObj[column] = filterBy;
		
		
		// remove population
		filter = _.filter(data, function(datum) {
			return datum.Sector != 'Population';
		});

        if (filterBy == "All") {
            filter = filter;
        } else {
            filter = _.where(filter, searchObj);
        }

        var categories = _.chain(filter)
            .countBy(groupBy)
            .pairs()
            .sortBy(1).reverse()
            .pluck(0)
            .value();

        var sort = _.sortBy(filter, categories);

        // group by
        var group = _.groupByMulti(sort, ['year', groupBy])

        var newData = [];

        // it is necessary to add an extra year to the data (as well as duplicate the data for the final year)
        // so that the chart does not get cut off on the right side
        for (var i = 1924; i <= 2006; i++) {

            var currYear = group[i];

            // no data for a year
            if (currYear == undefined) {
                currYear = {};
            }

            categories.forEach(function(area) {

                var obj = {};
                if (currYear[area] == undefined) {
                    // if the year does not have any in a particular category
                    obj.key = area;
                    obj.value = 0;
                    obj.date = moment(i.toString())._d;

                } else {
                    obj.key = currYear[area][0][groupBy];
                    obj.value = currYear[area].reduce(function(previousValue, currentValue, index) {
                        return previousValue + (+currentValue.Value);
                    }, 0);
                    obj.date = moment(currYear[area][0].year)._d;
                }

                if (isNaN(obj.value)) {
                    obj.value = 0;
                }

                newData.push(obj);
            });

        }
        data = newData; // you could just return newData, but this way seems cleaner to me
        return data;
    }

    // basic chart dimensions
    var margin = {
        top: 20,
        right: 1,
        bottom: 30,
        left: 0
    };
    var width = $('.chart-wrapper').width() - margin.left - margin.right;
    var height = breakHeight(breakpoint) - margin.top - margin.bottom;

    // chart top used for placing the tooltip    
    var chartTop = breakHeight(breakpoint) - margin.top - margin.bottom + 4; // $('.chart.' + groupBy + '.' + filterBy).offset().top;

    // tooltip
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", 40 + chartTop + "px");

    // scales:
    // x is a time scale, for the horizontal axis
    // y is a linear (quantitative) scale, for the vertical axis
    // z is in ordinal scale, to determine the colors (see var colorrange, below)

    var x = d3.time.scale()
    	//.domain([1924, 2006])
        .range([0, width]);
        //.nice();

    //var x = d3.scale.ordinal().domain([1924, 2006]).range([0, width]);

    // var x = d3.scale.linear()
    //     .range([0, width]);

    var y = d3.scale.linear()
        .range([height - 10, 0]);

    // color range provided by colorbrewer, added extra grays at end
    var colorrange = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411", '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3', '#b3b3b3'];


    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(11)
        //.tickValues(d3.range(1924, 2005, 4));

    // // the x-axis. note that the ticks are years, and we'll show every 5 years
    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient("bottom")
    //     //.ticks(10)
    //     //.ticks(5)
    //     //.tickValues(d3.range(1924, 2010));
    //     //.tickValues(d3.range(1924, 2006));
    //     .tickFormat(function (d) {
    //           var mapper = {
    //             "1924": "1924",
    //             "1928": "1928",
    //             "1932": "1932",
    //             "1936": "1936",
    //             "1948": "1948",
    //             "1952": "1952",
    //             "1956": "1956",
    //             "1960": "1960",
    //             "1964": "1964",
    //             "1968": "1968",
    //             "1972": "1972",
    //             "1976": "1976",
    //             "1980": "1980",
    //             "1984": "1984",
    //             "1988": "1988",
    //             "1992": "1992",
    //             "1994": "1994",
    //             "1998": "1998",
    //             "2002": "2002",
    //             "2006": "2006"
    //           }
    //           return mapper[d]
    //         })

    // stacked layout. the order is reversed to get the largest value on top
    // if you change the order to inside-out, the streams get all mixed up and look cool
    // but the graph is harder to read. reversed order ensures that the streams are in the
    // same order as the legend, which improves readability in lieu of directly labelling
    // the streams (which is another programming challenge entirely)
    var stack = d3.layout.stack()
        //.offset("silhouette")
        .order("reverse")
        .values(function(d) {
            return d.values;
        })
        .x(function(d) {
            return d.date;
        })
        .y(function(d) {
            return d.value;
        });

    var nest = d3.nest()
        .key(function(d) {
            return d.key;
        });

    // there are some ways other than "basis" to interpolate the area between data points
    // for example, you can use "cardinal", which makes the streams a little more wiggly.
    // the drawback with that approach is that if you have years where there is no data,
    // you won't see a flat line across the center of the chart. instead, it will look all bumpy.
    // ultimately, "cardinal" interpolation is more likely to give an inaccurate represenation of the data,
    // which is anyway a danger with any type of interpolation, including "basis"
    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) {
            return x(d.date);
        })
        .y0(function(d) {
            return y(d.y0) - .2;
        }) // -.2 to create a little space between the layers
        .y1(function(d) {
            return y(d.y0 + d.y) + .2;
        }); // +.2, likewise

    var svg = d3.select(".chart." + groupBy + '.' + filterBy).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("offset", 0)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // generate a legend
    function legend(layers) {

        // generate the legend title
        function titler(filter, group) {
            return "Gender";
        }

        $('.chart.' + groupBy + '.' + filterBy).prepend('<div class="legend"><div class="title">' + titler(filterBy, groupBy) + '</div></div>');
        $('.legend').hide();
        var legend = []
        layers.forEach(function(d, i) {
            var obj = {};
            if (i < 7) {
                obj.key = d.key;
                obj.color = colorrange[i];
                legend.push(obj);
            }
        });

        // others
        if (layers.length > 7) {
            legend.push({
                key: "Other",
                color: "#b3b3b3"
            });
        }

        legend.forEach(function(d, i) {
            $('.chart.' + groupBy + '.' + filterBy + ' .legend').append('<div class="item"><div class="swatch" style="background: ' + d.color + '"></div>' + d.key + '</div>');
        });

        $('.legend').fadeIn();

    } // end legend function

    // parse the data

    // now we call the data, as the rest of the code is dependent upon data
    d3.csv("/data/medals_MF_by_country.csv", function(data) {

        // parse the data (see parsing function, above)
        data = parse(data);

        // generate our layers
        var layers = stack(nest.entries(data));

        // our legend is based on our layers
        legend(layers);

        // set the domains
        x.domain(d3.extent(data, function(d) {
            return d.date;
        }));
        y.domain([0, d3.max(data, function(d) {
            return d.y0 + d.y;
        })]);

        // and now we're on to the data joins and appending
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) {
                return area(d.values);
            })
            .style("fill", function(d, i) {
                return z(i);
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // abbreviate axis tick text on small screens
        if (breakpoint == 'xs') {

            $('.x.axis text').each(function() {
                var curTxt = $(this).text();
                var newTxt = "'" + curTxt.substr(2);
                $(this).text(newTxt);
            });

        }

        // user interaction with the layers
        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                svg.selectAll(".layer").transition()
                    .duration(100)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            .on("mousemove", function(d, i) {

                var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch

                mouse = d3.mouse(this);
                mousex = mouse[0];
                var invertedx = x.invert(mousex);
                var xDate = century(invertedx.getYear());
                d.values.forEach(function(f) {
                    var year = (f.date.toString()).split(' ')[3];
                    if (xDate == year) {
                        tooltip
                            .style("left", tipX(mousex) + "px")
                            .html("<div class='year'>" + year + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + "</div>")
                            .style("visibility", "visible");
                    }
                });
            })
            .on("mouseout", function(d, i) {
                svg.selectAll(".layer").transition()
                    .duration(100)
                    .attr("opacity", '1');
                tooltip.style("visibility", "hidden");
            });

        // vertical line to help orient the user while exploring the streams
        var vertical = d3.select(".chart." + groupBy + '.' + filterBy)
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
            .style("height", "460px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fcfcfc");

        d3.select(".chart." + groupBy + '.' + filterBy)
            .on("mousemove", function() {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            })
            .on("mouseover", function() {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            });

		
        // Add 'curtain' rectangle to hide entire graph

        var curtain = svg.append('rect')
            .attr('x', -1 * width)
            .attr('y', -1 * height)
            .attr('height', height)
            .attr('width', width)
            .attr('class', 'curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', '#fcfcfc')

        // Create a shared transition for anything we're animating
        var t = svg.transition()
            .delay(100)
            .duration(1500)
            .ease('exp')
            .each('end', function() {
                d3.select('line.guide')
                    .transition()
                    .style('opacity', 0)
                    .remove()
            });
			
		

        t.select('rect.curtain')
            .attr('width', 0);
        t.select('line.guide')
            .attr('transform', 'translate(' + width + ', 0)');

    });

}


function drawChart(){
	$('.chart')[0].innerHTML = "";
	var column = $('.chart').attr("column");
	var groupBy = $('.chart').attr("groupBy");
	var e = document.getElementById ("filter");
	var filterBy = e.options [e.selectedIndex].value;
	$('.chart').addClass(groupBy).addClass(filterBy);
	chart(column, filterBy, groupBy);
}

var eventselector = document.getElementById('filter')
eventselector.addEventListener('change', drawChart);

drawChart();

