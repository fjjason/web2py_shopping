

    //Define Margin
    var margin = {left: 100, right: 80, top: 50, bottom: 70 }, 
        width = 960 - margin.left -margin.right,
        height = 500 - margin.top - margin.bottom;


    //Define Scales   
    var xScale = d3.scaleLinear() //Need to redefine this after loading the data
        .range([0, width]);

    var yScale = d3.scaleLinear() //Need to redfine this after loading the data
        .range([height, 0]);

        //Define Color
    //var colors = d3.scale.category20();
    var colors = d3.scaleOrdinal(d3.schemeCategory20);
    d3.csv("WineDataSet.csv", function(error, data) {
        if (error) throw error;
        data.forEach(function(d) {
            d.title = d.title;
            d.points = +d.points;
            d.price = +d.price;
        })
        // Scale Range of Data
        xScale.domain([d3.min(data, function(d) { return d.price;})+70, d3.max(data, function(d) { return d.price;})-110]);
        yScale.domain([0, d3.max(data, function(d) { return d.points+60;})]);   
    //from https://bl.ocks.org/mbostock/db6b4335bf1662b413e7968910104f0f
        var zoom = d3.zoom()
            .on("zoom", zoomed);
        //Define SVG
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       //Define Axis
        var xAxis = d3.axisBottom(xScale).tickPadding(2);
        var yAxis = d3.axisLeft(yScale).tickPadding(2);
    
        svg.call(zoom);

           //x label
    svg.append("text")             
        .attr("transform",
             "translate(" + (width/2) + " ," + 
                        (height + margin.top - 20) + ")")
       .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Quality of Wine");
           //y label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 300 - (height ))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("Price in USD");
           
           //Y-axis
    var gY = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

           
    //Scale Changes as we Zoom
    var view = svg.append("rect")
        .attr("class", "zoom")
        .attr("x", 0.5)
        .attr("y", 0.5)
        .attr("width", width - 1)
        .attr("height", height - 1)
        .call(zoom)
    
        //Get Data
    // Define domain for xScale and yScale 
    //Draw Scatterplot
    var circles = svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return 5; })
        .attr("cx", function(d) {return xScale(d.points);})
        .attr("cy", function(d) {return yScale(d.price);})
        .style("fill", function (d) { return colors(d.title); })
    //Add .on("mouseover", .....
    //Add Tooltip.html with transition and style
        .on("mouseover", function(d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", 1);
            tooltip.html(d.title + 
                "<br/>" + "points: $" + d.points + " trillion" + 
                "<br/> " + "EPC: " + d.price + " million BTUs" + "" 
            )
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY -20) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        });        
    //Define Tooltip here
    var tooltip = d3.select("body").append("div")
        .attr("class",  "tooltip") 
        .style("opacity", 0); 
    //Then Add .on("mouseout", ....
        //x-axis
    var gX = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
        
    // Call the function d3.behavior.zoom to Add zoom
    function zoomed() {
        //svg.attr("transform", d3.event.transform);
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        circles.attr("transform", d3.event.transform);
        label.attr("transform", d3.event.transform);
    }
    //Draw title Names
    /*
    var label = svg.selectAll(".text")
        .data(data)
        .enter().append("text")
        .attr("class","text")
        .style("text-anchor", "start")
        .attr("x", function(d) {return xScale(d.points);})
        .attr("y", function(d) {return yScale(d.price);})
        .style("fill", "black")
        .text(function (d) {return d.title; });
   */
    });
//}
