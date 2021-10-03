function getPostCodeData(postcode){
	let shortcode = postcode.substr(0,postcode.length-2);

	let file = '../processed_data/'+shortcode+'.json';
	console.log(file);
	$.ajax(
		{
			url: file,
			success: function(result){
				if(result[postcode]==undefined){
					errors.push(postcode);
				} else {
					let data = result[postcode];
					data.unshift(postcode);
		    		postcodeData.push(result[postcode]);
		    							
				}
				asyncCalls--;
	    		if(asyncCalls==0){
	    			processingCompletePostcodes();
	    		}
	    		updateProgress()
	  		},
	  		error: function(result){
	  			errors.push(postcode);
	  			asyncCalls--;
	  			if(asyncCalls==0){
	  				processingCompletePostcodes();
	    		}
	    		updateProgress()
	  		}
  		}
  	);
}

function updateProgress(){
	let progress = total - asyncCalls;
	$('#progress').html(progress+'/'+total);
}

function cleanPostcode(postcode){
	postcode = postcode.replace(/ /g, '');
	postcode = postcode.toUpperCase();
	return postcode
}

function processingCompletePostcodes(){
	//gtag('event', 'geocode_postcode', {'value':postcodeData.length});
	if(errors.length>0){
		$('#analysis-progress').hide();
		$('#analysis-finished').show();
		$('#error-count').html(errors.length);
		$('#errors').html('');
		errors.forEach(function(error){
			$('#errors').append('<p class="errorpostcode">'+error+'</p>')
		});
	} else {
		$('#step1').hide();
		$('#step2').show();
		getBooundsAndGroupPostcodes()
	}
}

function getBooundsAndGroupPostcodes(){
	let bounds = postcodesBounds(postcodeData);
	[groupDataWards,groupDataLAs] = getGroupData(postcodeData);
	processingComplete(groupDataWards,groupDataLAs,bounds);
}

function processingComplete(groupDataWards,groupDataLAs,bounds){
		
		updateDataTable(groupDataWards);
		createMap(bounds,groupDataWards,groupDataLAs);

		$('input[type=radio][name=maptype]').change(function() {
			console.log('change');
		    if (this.value == 'wards') {
		    	mapLevel = 'wards';
		    	updateDataTable(groupDataWards);
		    	$('#map').show();
		    	$('#mapla').hide();
		    }
		    else if (this.value == 'las') {
		    	mapLevel = 'las';
		    	updateDataTable(groupDataLAs);
		    	$('#map').hide();
		    	$('#mapla').show();
		    }
		});
}

function getGroupData(postcodeData){
	let wards = {};
	let las = {}
	postcodeData.forEach(function(d){
		console.log(d);
		let wardCode = d[5];
		if(wardCode in wards){
			wards[wardCode]['value']++;
		} else {
			wards[wardCode] = {}
			wards[wardCode]['value']=1;
			wards[wardCode]['name']=d[6];
			wards[wardCode]['laname']=d[4];
			wards[wardCode]['lacode']=d[3];
		}
		let laCode = d[3];
		if(laCode in las){
			las[laCode]['value']++;
		} else {
			las[laCode] = {}
			las[laCode]['value']=1;
			las[laCode]['name']=d[4];
		}
	});
	return [wards,las];
}

function getGroupDataFromTable(tableData){
	let tableType = 'LA';
	if(tableData[0].length==5){
		tableType = 'ward'
	}
	groupDataWards = {}
	groupDataLAs = {}
	tableData.forEach(function(d,i){
		if(i>0){
			if(tableType=='ward'){
				groupDataWards[d[2].trim()] = {'value':d[4],'name':d[0],'laname':d[1],'lacode':d[3].trim()}
				let laCode = d[3].trim();
				if(laCode in groupDataLAs){
					groupDataLAs[laCode]['value']+=parseInt(d[4]);
				} else {
					groupDataLAs[laCode] = {}
					groupDataLAs[laCode]['value']=parseInt(d[4]);
					groupDataLAs[laCode]['name']=d[0];
				}
			} else {
				let value = parseInt(d[2])
				groupDataLAs[d[1].trim()] = {'value':value,'name':d[0]}
			}
		}
		
	});
	console.log([groupDataWards,groupDataLAs]);
	return [groupDataWards,groupDataLAs]
}

function parseTableData(tableData){
	let data = Papa.parse(tableData);
	return data;
}

function updateDataTable(groupData){
	console.log(groupData);
	$('#datatable').html('');
	if(mapLevel =='wards'){
		$('#datatable').append('Ward Name,LA Name, Ward Code, LA Code, Value&#13;&#10;');
		for(key in groupData){
			$('#datatable').append(groupData[key]['name']+', '+groupData[key]['laname']+', '+key+', '+groupData[key]['lacode']+', '+groupData[key]['value']+'&#13;&#10;');
		}		
	} else {
		$('#datatable').append('LA Name,  LA Code, Value&#13;&#10;');
		for(key in groupData){
			$('#datatable').append(groupData[key]['name']+', '+key+', '+groupData[key]['value']+'&#13;&#10;');
		}			
	}
	$('#downloaddata').off()
	$('#downloaddata').on('click',function(){
		console.log('Initiate Download');
		generateDownload(groupData);
	});
	
}

function generateDownload(groupData){
	if(mapLevel=='wards'){
		var downloadData = [["Ward Name","LA Name","Ward Code","LA Code","Value"]];
		for(key in groupData){
			
			downloadData.push(['"'+groupData[key]['name']+'"','"'+groupData[key]['laname']+'"',key,groupData[key]['lacode'],groupData[key]['value']]);
		}		
	} else {
		var downloadData = [["LA Name","LA Code","Value"]];
		for(key in groupData){
			downloadData.push(['"'+groupData[key]['name']+'"',key,groupData[key]['value']]);
		}			
	}


	let csvContent = "data:text/csv;charset=utf-8,";

	downloadData.forEach(function(rowArray) {
	    let row = rowArray.join(",");
	    csvContent += row + "\r\n";
	});

	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	let name = $('#filename').val();
	if(name==''){
		name = 'mapper';
	}
	link.setAttribute("download", name+".csv");
	document.body.appendChild(link);
	link.click();

}



function init(){
	$('.process-postcodes').on('click',function(){
		$('#process-postcodes').hide();
		$('#analysis-finished').hide();
		$('#analysis-progress').show();
		postcodeData = [];
		errors = [];
		let postcodesList = $('#postcode_entry_text').val();
		let postcodes = postcodesList.split(/\n/);
		total = postcodes.length;
		asyncCalls = postcodes.length;
		postcodes.forEach(function(postcode){
			postcode = cleanPostcode(postcode);
			getPostCodeData(postcode);
		});
	});

	$('.process-table').on('click',function(){
		let tableData = $('#table_entry_text').val();
		tableData = parseTableData(tableData);
		console.log(tableData);
		[wards,las] = getGroupDataFromTable(tableData.data);
		$('#step1').hide();
		$('#step2').show();
		processingComplete(wards,las,[-1, 52, 1, 51]);
	});

	$('#continue').on('click',function(){
		$('#step1').hide();
		$('#step2').show();
		getBooundsAndGroupPostcodes()
	});

	$('.btn-data').on('click',function(){
		setForData($(this).attr('data-id'));
	})

	$('#step2').hide();
	$('#step3').hide();

	$('#analysis-progress').hide();
	$('#analysis-finished').hide();

	$('#table-analysis-progress').hide();
	$('#table-analysis-finished').hide();
	$('#tableentry').hide();
	$('#mapla').hide();

	$('input[type=radio][name=datatype]').change(function() {
		console.log('change');
	    if (this.value == 'postcode') {
	        $('#tableentry').hide();
	        $('#postcodesentry').show();
	    }
	    else if (this.value == 'table') {
	        $('#tableentry').show();
	        $('#postcodesentry').hide();
	    }
	});
}

var postcodeData = [];
var errors = [];
var mapLevel = 'wards';
var asyncCalls;
var featureLayer;
var total;
let colours = {
	'a':['#E65100','#F57C00','#FF9800','#FFB74D','#FFE0B2'],
	'b':['#40004b','#762a83','#9970ab','#c2a5cf','#e7d4e8','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b'],
	'c':['#01579B','#0277BD','#0288D1','#039BE5','#03A9F4','#29B6F6','#4FC3F7','#81D4FA','#B3E5FC','#E1F5FE'],
	'Employment':['#311B92','#4527A0','#512DA8','#5E35B1','#673AB7','#7E57C2','#9575CD','#B39DDB','#D1C4E9','#EDE7F6'],
	'Education':['#004D40','#00695C','#00796B','#00897B','#009688','#26A69A','#4DB6AC','#80CBC4','#B2DFDB','#E0F2F1'],
	'Health':['#880E4F','#AD1457','#C2185B','#D81B60','#E91E63','#EC407A','#F06292','#F48FB1','#F8BBD0','#FCE4EC'],
	'Crime':['#F57F17','#F9A825','#FBC02D','#FDD835','#FFEB3B','#FFEE58','#FFF176','#FFF59D','#FFF9C4','#FFFDE7'],
	'Housing':['#3E2723','#4E342E','#5D4037','#6D4C41','#795548','#8D6E63','#A1887F','#BCAAA4','#D7CCC8','#EFEBE9'],
	'Environment':['#1B5E20','#2E7D32','#388E3C','#43A047','#4CAF50','#66BB6A','#81C784','#A5D6A7','#C8E6C9','#E8F5E9']
	};
init();