
// an integer value representing the pixel space between lines drawn
var gridSpacing = 20;
// set by drawGrid
var numAcross; 
var numDown;

var clearSVG = function(){
	var svgElement = d3.selectAll("svg");
};

var sizeGrid = function(){
	numAcross = $("#svg_canvas").width()/gridSpacing +1;
	numDown = $("#svg_canvas").height()/gridSpacing +1;
};

var drawGrid = function(){
	console.log("Drawing grid...");
	sizeGrid();
	var svgElement = d3.selectAll("svg");
	
	for(var i = 0; i < numAcross ; i++){
		svgElement.append("line")
			.attr("x1", i*gridSpacing)
			.attr("y1", 0)
			.attr("x2", i*gridSpacing)
			.attr("y2", $("#svg_canvas").height())
			.attr("stroke-width", 2)
			.attr("stroke", "#E8E8E8");
	}
	
	for(var j = 0; j < numDown ; j++){
		svgElement.append("line")
			.attr("x1", 0)
			.attr("y1", j*gridSpacing)
			.attr("x2", $("#svg_canvas").width())
			.attr("y2", j*gridSpacing)
			.attr("stroke-width", 2)
			.attr("stroke", "#E8E8E8");
	}
	
	// Grid points
	for(var i = 0; i < numAcross ; i++){
		for(var j = 0; j < numDown ; j++){
			svgElement.append("circle")
				.attr("cx", i*gridSpacing)
				.attr("cy", j*gridSpacing)
				.attr("r", 3)
				.style("fill", "grey")
				.on("mouseover", function() {
					d3.select(this).attr("r", 5);
				})
				.on("mouseout", function() {
					d3.select(this).attr("r", 3);
				})
				.on("click", nodeClick);
		}	
	}
	
	console.log("Grid drawn.");
};

var nodeClick = function(){
	//console.log("I clicked on a node! or did I? What is this?");
	//console.log(this);
	d3.select(this).style("fill", "red");
};

var drawDensityColorMap = function(design){
	var svgElement = d3.selectAll("svg");
	
	// init map
	var map = new Array(Math.floor(numAcross));
	for(var i = 0; i < numAcross; i++){
		map[i] = new Array(Math.floor(numDown));
	}
	
	for(var i = 0; i < design.points.length; i++){
		map[design.points[i].position.x][design.points[i].position.y] = design.points[i].lines.length;
	}
	
	for(var i = 0; i < numAcross; i++){
		for(var j = 0; j < numDown; j++){
			if (isNaN(map[i][j])) map[i][j] = 0;
			
			svgElement.append("rect")
				.attr("x", (i * gridSpacing) - (gridSpacing/2))
				.attr("y", (j * gridSpacing) - (gridSpacing/2))
				.attr("width", gridSpacing)
				.attr("height", gridSpacing)
				.style("fill", "hsla(" + (map[i][j] * 40) + ", 50%, 50%, 0.5)");
		}
	}
	
	
};

var drawMST = function(design){
	var svgElement = d3.selectAll("svg");
	var edges = design.findMST();
	console.log("MST found: "); console.log(edges);
	for(var i = 0; i < edges.length; i++){
		svgElement.append("line")
			.attr("x1", edges[i].point1.position.x * gridSpacing)
			.attr("y1", edges[i].point1.position.y * gridSpacing)
			.attr("x2", edges[i].point2.position.x * gridSpacing)
			.attr("y2", edges[i].point2.position.y * gridSpacing)
			.attr("stroke-width", 1)
			.attr("stroke", "yellow")
			.attr("stroke-linecap", "round");
	}
};

var drawDesignOnGrid = function(design, options){
	console.log("Drawing design...");
	var svgElement = d3.selectAll("svg");
	for(var i = 0; i < design.lines.length; i++){
		//console.log("drawing line... " + (design.lines[i].point1.position.x * gridSpacing) + ", " + design.lines[i].point1.position.y * gridSpacing + " /// " +
		//							   + (design.lines[i].point2.position.x * gridSpacing) + ", " + design.lines[i].point2.position.y * gridSpacing);
		if(options && options.class){
			svgElement.append("line")
				.attr("x1", design.lines[i].point1.position.x * gridSpacing)
				.attr("y1", design.lines[i].point1.position.y * gridSpacing)
				.attr("x2", design.lines[i].point2.position.x * gridSpacing)
				.attr("y2", design.lines[i].point2.position.y * gridSpacing)
				.attr("stroke-width", 3)
				.attr("stroke", "#000000")
				.attr("stroke-linecap", "round")
				.attr("class", options.class);
				
		} else {
			svgElement.append("line")
				.attr("x1", design.lines[i].point1.position.x * gridSpacing)
				.attr("y1", design.lines[i].point1.position.y * gridSpacing)
				.attr("x2", design.lines[i].point2.position.x * gridSpacing)
				.attr("y2", design.lines[i].point2.position.y * gridSpacing)
				.attr("stroke-width", 3)
				.attr("stroke", "#000000")
				.attr("stroke-linecap", "round");
		}
	}
	console.log("Design drawn " + design.lines.length + " lines.");
};

var drawDesignOnGridAsEdge = function(design, options){
	var testCount = 0;
	// Determine how many designs we can fit on here
	design.updateDimensions();
	var numDesigns = Math.ceil(numAcross/design.width) +2;
	console.log("Can fit " + numDesigns + " on X axis... " + numAcross + "/" + design.width);
	
	// Translate to the beginning
	while(design.greatestX > 0 && testCount < 100){
		console.log("GREATESTX?! " + design.greatestX);
		design.translateTheseLines(-design.width, 0);
		design.updateDimensions();
		testCount ++;
	}
	console.log("Move design " + testCount + " times");
	//design.updateDimensions();
	
	// NOTE: Figure out how to not duplicate lines later
	// Stamp them across the X axis
	for(var i = 0; i < numDesigns; i++){
		drawDesignOnGrid(design, options);
		design.translateTheseLines(design.width, 0);
	}
	
};

var drawDesignOnGridAsFill = function(design, options){
	var testCount = 0;
	// Determine how many designs we can fit on here
	design.updateDimensions();
	var numDesigns = Math.ceil(numDown/design.height) +2;
	console.log("Can fit " + numDesigns + " on Y axis... " + numDown + "/" + design.height);
	
	//Translate to the top
	while(design.greatestY > 0 && testCount < 100){
		console.log("GREATESTY?! " + design.greatestY);
		design.translateTheseLines(0, -design.height);
		design.updateDimensions();
		testCount ++;
	}
	console.log("Move design " + testCount + " times");
	
	//design.translateTheseLines(0, -design.height * Math.floor(numDesigns/2));
	
	// Stamp them across the Y axis
	console.log("num designs?! " + numDesigns);
	for(var i = 0; i < numDesigns; i++){
		console.log("drawing row " + i);
		//console.log(design);
		drawDesignOnGridAsEdge(design, options);
		//drawDesignOnGrid(design, options);
		//console.log(design);
		design.translateTheseLines(0, design.height);
	}
};

var drawOneMoreLine = function(design){
	if(design.lastAddedLine !== null){
		var svgElement = d3.selectAll("svg");
		
		svgElement.append("line")
			.attr("x1", design.lastAddedLine.point1.position.x * gridSpacing)
			.attr("y1", design.lastAddedLine.point1.position.y * gridSpacing)
			.attr("x2", design.lastAddedLine.point2.position.x * gridSpacing)
			.attr("y2", design.lastAddedLine.point2.position.y * gridSpacing)
			.attr("stroke-width", 3)
			.attr("stroke", "#000000")
			.attr("stroke-linecap", "round");
	}
}

var removeObjectsWithClassName = function(name){
	var svgElements = d3.selectAll("." + name);
	console.log("SVG ELEMENTS!?!?!?!?!?!!! ");
	console.log(svgElements);
	svgElements.remove();
}
