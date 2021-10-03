function postcodesBounds(postcodes){
	let maxX = -180
	let maxY = -90
	let minX = 180
	let minY = 90
	postcodes.forEach(function(p){
		p[1] = parseFloat(p[1]);
		p[2] = parseFloat(p[2]);
		if(p[1]>maxY){
			maxY = p[1]
		}
		if(p[2]>maxX){
			maxX = p[2]
		}
		if(p[1]<minY){
			minY = p[1]
		}
		if(p[2]<minX){
			minX = p[2]
		}
	});
	return [minX-0.001,maxY+0.001,maxX+0.001,minY-0.001];
}

function createMap(bounds,groupDataWards,groupDataLA){
	console.log(bounds);
	let bands = getBands(groupDataWards);
	let bandsla = getBands(groupDataLA);

	let centreX = (bounds[0] + bounds[2])/2;
	let centreY = (bounds[1] + bounds[3])/2;
	let scaleZoom = 20000/Math.max(bounds[2]-bounds[0],bounds[1]-bounds[3]);


	var width = $('#mapsvg').width(),
	height = $('#mapsvg').height();


	d3.json("../geometry/wards_simplified2.geojson", function(error, wards) {

		let projection = d3.geo.mercator()
		  .scale(scaleZoom)
		  .center([centreX,centreY]);


		let path = d3.geo.path()
		    .projection(projection)

		var zoom = d3.behavior.zoom()
		    .translate(projection.translate())
		    .scale(projection.scale())
		    .scaleExtent([0.001, 1000000])
		    .on("zoom", zoomed);

		function zoomed(){

			projection.translate(d3.event.translate).scale(d3.event.scale);
			svg.selectAll("path").attr("d", path);

			zoomRedraw()
		}

		function zoomRedraw(){
			let scale = projection.scale();
			let labels = Math.round(1000000/scale);

			svg.selectAll(".place-label")
			.attr("x", function(d) { return path.centroid(d)[0]; })
		    .attr("y", function(d) { return path.centroid(d)[1]; })
		    .text(function(d,i) {
		    	if(i%labels==0 && scale>100000){
		    		return d.properties.WD21NM; 
		    	} else {
		    		return '';
		    	}
		    });
		}

		var svg = d3.select("#mapsvg").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .call(zoom);
		console.log(width);
	    $('#canvas').attr('width',width);
	    $('#canvas').attr('height',height);

	  svg.selectAll("path")
	      .data(wards.features)
	    .enter()
	    	.append("path")
	    	.attr("class", function(d,i) { return "wards"; })
	    	.attr("d", path)
	    	.attr('stroke','black')
	    	.attr('stroke-width','0.5px')
	    	.attr('fill',function(d){
	    		if(d.properties.WD21CD in groupDataWards){
	    			let value = groupDataWards[d.properties.WD21CD]['value']
	    			let band = getBand(value,bands)
	    			let colour = colours['a'][4-band];
	    			return colour
	    		} else {
	    			return '#eee'
	    		}
	    		
	    	});

	    let projectionScale = projection.scale()
	    let labelsInitial = Math.round(2000000/projectionScale);

		svg.selectAll(".place-label")
		    .data(wards.features)
		  .enter().append("text")
		    .attr("class", "place-label")
		    .attr("text-anchor", "middle")
		    .attr("x", function(d) { return path.centroid(d)[0]; })
		    .attr("y", function(d) { return path.centroid(d)[1]; })
		    .attr("dy", ".35em")
		    .text(function(d,i) {
		    	if(i%labelsInitial==0 && projectionScale>100000){
		    		return d.properties.WD21NM; 
		    	} else {
		    		return '';
		    	}
		    })
		    .style("font-size","10px");

		d3.select("#zoom_in").on("click", function() {
		  zoom.scale(projection.scale()*2);
		  projection.scale(projection.scale()*2);
		  svg.selectAll("path").attr("d", path);
		  zoomRedraw();
		});

		d3.select("#zoom_out").on("click", function() {
		  zoom.scale(projection.scale()*0.5);
		  projection.scale(projection.scale()*0.5);
		  svg.selectAll("path").attr("d", path);
		  zoomRedraw();
		});

	    drawLegend('wards',bands);
	});

	d3.json("../geometry/la_simplified5.geojson", function(error, las) {

		let projection = d3.geo.mercator()
		  .scale(scaleZoom)
		  .center([centreX,centreY]);


		let path = d3.geo.path()
		    .projection(projection)

		var zoomla = d3.behavior.zoom()
		    .translate(projection.translate())
		    .scale(projection.scale())
		    .scaleExtent([1, 1000000])
		    .on("zoom", zoomedla);

		function zoomedla(){
			projection.translate(d3.event.translate).scale(d3.event.scale);
			svg.selectAll("path").attr("d", path);
			zoomlaRedraw();
		}

		function zoomlaRedraw(){
			let scale = projection.scale();
			let labels = Math.round(50000/scale)+1;
			labels =1 
			svg.selectAll(".place-label")
			.attr("x", function(d) { return path.centroid(d)[0]; })
		    .attr("y", function(d) { return path.centroid(d)[1]; })
		    .text(function(d,i) {
		    	if(i%labels==0 && scale>15000){
		    		return d.properties.lad19nm; 
		    	} else {
		    		return '';
		    	}
		    });
		}

		var svg = d3.select("#maplasvg").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .call(zoomla);

	    $('#canvas').attr('width',width);
	    $('#canvas').attr('height',height);
	  console.log(groupDataLA);
	  svg.selectAll("path")
	      .data(las.features)
	    .enter().append("path")
	    	.attr("class", function(d,i) { return "las"; })
	    	.attr("d", path)
	    	.attr('stroke','black')
	    	.attr('stroke-width','0.5px')
	    	.attr('fill',function(d){
	    		if(d.properties.lad19cd in groupDataLA){
	    			let value = groupDataLA[d.properties.lad19cd]['value']
	    			let band = getBand(value,bandsla)
	    			let colour = colours['a'][4-band];
	    			return colour
	    		} else {
	    			return '#eee'
	    		}
	    		
	    	});

	    let projectionScale = projection.scale()
	    let labelsInitial = Math.round(50000/projectionScale)+1;

	    svg.selectAll(".place-label")
		    .data(las.features)
		  .enter().append("text")
		    .attr("class", "place-label")
		    .attr("text-anchor", "middle")
		    .attr("x", function(d) { return path.centroid(d)[0]; })
		    .attr("y", function(d) { return path.centroid(d)[1]; })
		    .attr("dy", ".35em")
		    .text(function(d,i) {
		    	if(i%labelsInitial==0 && projectionScale>15000){
		    		return d.properties.lad19nm; 
		    	} else {
		    		return '';
		    	}
		    })
		    .style("font-size","10px");

		d3.select("#la_zoom_in").on("click", function() {
		  console.log('here');
		  zoomla.scale(projection.scale()*2);
		  projection.scale(projection.scale()*2);
		  svg.selectAll("path").attr("d", path);
		  zoomlaRedraw();
		});
		d3.select("#la_zoom_out").on("click", function() {
		  zoomla.scale(projection.scale()*0.5);
		  projection.scale(projection.scale()*0.5);
		  svg.selectAll("path").attr("d", path);
		  zoomlaRedraw();
		});

	    drawLegend('las',bandsla);
	});

}

function getBand(value,bands){
	let band = 0
	bands.forEach(function(b,i){
		if(value>b){
			band = i
		}
	});
	return band
}

function getBands(wards){

	let max = 0
	for(ward in wards){
		if(wards[ward]['value']>max){
			max = wards[ward]['value'];
		}
	}
	let ranges = [];
	for(i=0;i<5;i++){
		ranges.push(max*i/5);
	}
	console.log('ranges');
	console.log(ranges);
	return ranges
}

function drawLegend(mapLevel,bands){
	if(mapLevel =='wards'){
		var id = '#mapsvg'
	} else {
		var id = '#maplasvg'
	}
	var width = $(id).width(),
	height = $(id).height();

	let legend = d3.select(id).select('svg').append('g');

	legend.append('rect')
		.attr('x', width-200)
  		.attr('y', height-200)
  		.attr('width', 190)
  		.attr('height', 190)
  		.attr('stroke', 'black')
  		.attr('fill', '#FFFFFF');

  	legend.selectAll('bands')
  		.data(bands)
  		.enter()
  		.append('rect')
  		.attr('x', width-180)
  		.attr('y', function(d,i){
  			return height-40-i*30
  		})
  		.attr('width', 20)
  		.attr('height', 20)
  		.attr('stroke', 'black')
  		.attr('fill', function(d,i){
			let colour = colours['a'][4-i];
	    	return colour;
  		});

  	legend.selectAll('text')
  		.data(bands)
  		.enter()
  		.append('text')
  		.attr('x', width-140)
  		.attr('y', function(d,i){
  			return height-25-i*30
  		})
  		.attr("font-family", "Helvetica Neue, Arial")
  		.text(function(d,i){
  			let value = ' - '+(bands[i+1]);
  			if(value==' - '+undefined){
  				value = '+'
  			}
  			if(d == 0){
  				return '0.1'+value;
  			}
  			return d+value;
  		});

  	legend
  		.append('text')
  		.attr('x', width-180)
  		.attr('y', function(d,i){
  			return height-175
  		})
  		.attr("font-family", "Helvetica Neue, Arial")
  		.text('Legend');
}


function downloadMap(mapLevel){
	if(mapLevel=='wards'){
		var svgString = new XMLSerializer()
	                .serializeToString(document.querySelector('#mapsvg svg'));
	} else {
		var svgString = new XMLSerializer()
	                .serializeToString(document.querySelector('#maplasvg svg'));
	}
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var DOMURL = self.URL || self.webkitURL || self;
	var img = new Image();
	var svg = new Blob([svgString], {
	  type: "image/svg+xml;charset=utf-8"
	});
	var url = DOMURL.createObjectURL(svg);
	img.onload = function() {
	  ctx.drawImage(img, 0, 0);
	  var imgURL = canvas.toDataURL("image/png");
	   DOMURL.revokeObjectURL(imgURL);
	  var dlLink = document.createElement('a');
	  let name = $('#filename').val();
	  if(name==''){
		name = 'mapper';
	  }
	  dlLink.download = name;
	  dlLink.href = imgURL;
	  dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href]
	                              .join(':');
	  document.body.appendChild(dlLink);
	  dlLink.click();
	  document.body.removeChild(dlLink);
	}
	img.src = url;
}


$('#downloadmap').on('click',function(){
	console.log('Download Map');
	downloadMap(mapLevel);
});
