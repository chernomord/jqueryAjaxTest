var devicesConf = {
	url: "devices.json", type: "GET", dataType : "json",
    success: function( json ) {
    	// debug
        return json;
    },
    error: function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
    },
    complete: function( xhr, status ) {
        console.log( "conf: devices.json loaded");
    }
};

function getDevices(config){
    var d = $.Deferred();
    $.ajax( config )
    .done(function(devices) {
        d.resolve(devices);
    })
    .fail(d.reject); 
    return d.promise();
};


// Main module
// Retrieving data and Application loading

function load(){
    console.log( "populating ..." ); // debug
    var loadingData = getDevices(devicesConf).done(function(devices){
    	$devices = devices;

    	// 
    	// droppable area interaction and data binding setting
    	// 
		$('.table').droppable({
			// accept: function (event, ui) {
			// 	if ($(this))
			tolerance: 'fit',
			// },
	    	drop: function( event, ui ) {
				// Hold instance of element
				var newHelp = $(ui.helper)
					.clone(false)
				    .removeClass('ui-draggable-dragging');  
			    $(this).append(newHelp.draggable().selectable());
				// var parent = 

				// Element delete button
				$('.element__del').click( function() {
					$(this).parent().remove();
				});
				// $(.)
	    	}
	    });

		var types = SortIdsByTypes($devices);

		// rendering palette types and getting data

		renderElements($devices, types);

	});

    $.when(loadingData)
     .done(console.log( "populating : done")); // debug
};




// data mining module for unpredictable number of types of objects
// getting array = [type_Name,[type_Ids]]
function SortIdsByTypes(dataArray) {

	function uniq(a) {
	    var seen = {};
	    return a.filter(function(item) {
	        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	    });
	};
	var types = dataArray.map(function(n, idx) {
			return n.type;
		});

	var typesIds = dataArray.map(function(n, idx) {
			return [n.type, n.id ];
		});

	var uniqueTypes = uniq(types);

	var IdsCollection = [];

	for ( t=0; t < uniqueTypes.length; t++ ) {
		IdsCollection[t] = [];
		var a = uniqueTypes[t];
		IdsCollection[t][0] = uniqueTypes[t];
		IdsCollection[t][1] = [];
		for ( i=0; i < typesIds.length; i++) {
			if ( typesIds[i][0] == uniqueTypes[t] ) {
				IdsCollection[t][1].push(typesIds[i][1]);
			};
		};
	};

	return IdsCollection;
};

// 


// Populating devices palette
function renderElements(dataArray, IdsCollection) {

	// loop for number of objects types
	for ( i = 0; i < IdsCollection.length; i++ ) {

		var conf = function (item, idx) {
			 if ( item.type == IdsCollection[i][0] ) { return true };
		};

		var filtered = dataArray.filter(conf);
	    $("div.elements__box")
	    .append(
	    	'<div class="element " id="' + IdsCollection[i][0] + '">'
	    	+ IdsCollection[i][0].replace(/_/g, ' ') + 
	    	'<div class="element__counter">' + filtered.length + '</div>'
	    	+ '</div>'
	    );
	    $('.element#' + IdsCollection[i][0])
	    .data(filtered)
	    .draggable({ 
	    	helper : "clone",
	    	revert : "invalid",
	    	start : function(event,ui) { 
	    		console.log($devices); 
	    		return ui.helper.children('div')
	    			.css("display", "none")
	    			.parent()
	    			.addClass('element--inst')
	    			.append('<span class="element__del">x</span>')	;	
	    	}
	    });

	};
	console.log($('.element#media_player').data()[2] );

};




// app init
$(document).ready(function(){

	load();

})
// ajax loading indicator
.bind()
    .ajaxStart(function() {
        $( '#loading' ).show();
    })
    .ajaxStop(function() {
        $( '#loading' ).hide();
    });
