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
    	$dropped = false;
    	$devices = devices;
    	$IdsCollection = SortIdsByTypes($devices);
    	// 
    	// droppable area interaction and data binding setting
    	// 
		$('.table').droppable({
			activeClass: "ui-state-default",
			hoverClass: 'ui-state-hover',
			tolerance: 'fit',
	    	drop: function( event, ui ) {
	    		// ui.draggable.data('dropped', true);
				// Hold instance of element
				// check element origin - new or from workspace
				var thisGrName = ui.helper.attr('data-group');
				if ($(ui.helper).hasClass('element--group') ) {
					// var newId = $IdsCollection[thisGrName].pop();

					$dropped = true;

					var newHelp = $(ui.helper)
						.clone(false)
						// .attr('data-id', newId)
					    .removeClass('ui-draggable-dragging')
					    .removeClass('element--group')
					    .css("opacity" , "1");  
				    $(this).append(newHelp.draggable({ containment: "parent" }) );

				    var thisId = parseInt(ui.helper.attr('data-id'));
				    newHelp.children('.element__del').attr('data-id', thisId);
					// Element delete button - adding interactivity
					$('span.element__del[data-id="'+ thisId +'"]' ).click( function() {


						var helper = $(this).parent();
						var thisGrName = helper.attr('data-group');
						var thisId = parseInt(helper.attr('data-id'));
						console.log(thisId);
						console.log($IdsCollection[thisGrName]);

		    			$IdsCollection[thisGrName].push(thisId);
		    			console.log($IdsCollection[thisGrName]);
		
		    			var ancestorGroup = $('.element--group' && '[data-group="'+ thisGrName +'"]');
						ancestorGroup.children('.element__counter').text($IdsCollection[thisGrName].length);

						helper.animate({
						  opacity: 0,
						  left: 700     ,
						  top: 200
						}, 100, function() {
						    helper.remove();
						    });        

					});
					
				} else {return false};
				
	    	}
	    });

		

		// rendering palette types and getting data

		renderElements($devices, $IdsCollection);

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

	IdsCollection = {};

	for ( t=0; t < uniqueTypes.length; t++ ) {

		IdsCollection[uniqueTypes[t]] = [];

		for ( i=0; i < typesIds.length; i++) {
			if ( typesIds[i][0] == uniqueTypes[t] ) {
				IdsCollection[uniqueTypes[t]].push(typesIds[i][1]);
			};
		};
	}; 

	console.log(IdsCollection);

	return IdsCollection;
};

// 


// Populating devices palette
function renderElements(dataArray, IdsCollection) {

	// loop for number of objects types
	for (var grName in IdsCollection) {if (IdsCollection.hasOwnProperty(grName)) {

		var conf = function (item, idx) {
			 if ( item.type == grName ) { return true };
		};

		var filtered = dataArray.filter(conf);
	    $("div.elements__box")
	    .append(
	    	'<div class="element--group" data-group="' + grName 
	    	+ '"data-obj-count="' + IdsCollection[grName].length  + '">'
	    	+ grName.replace(/_/g, ' ') + 
	    	'<div class="element__counter">' + filtered.length + '</div>'
	    	+ '</div>'
	    );
	    $('[data-group="' + grName +'"]' )
	    .draggable({ 
	    	opacity : 0.7,
	    	helper : "clone",
	    	revert : "invalid",
	    	start : function(event,ui) { 
    			var thisGrName = ui.helper.attr('data-group');

	    		// check if any objects left in group
	    		// if any - pop last ID number from collection,
	    		// translate it to data-id at helper obj
	    		// and update obj tyles counter 
	    		if ( $IdsCollection[thisGrName].length > 0 ) {
	    			var newId = $IdsCollection[thisGrName].pop();
	    			var newCounter = $IdsCollection[thisGrName].length;
	    			$(this).children('.element__counter').text(newCounter);

	    		return ui.helper
	    			.attr('data-id', newId)
	    			.children('div')
	    			.css("display", "none")
	    			.parent()
	    			.addClass('element--inst')
	    			.append('<span class="element__del">x</span>');	
	    		} else { return false };
	    	},
    	    stop: function(event, ui) {
		    	var thisGrName = ui.helper.attr('data-group');

		    	// check if helper actually dropped at droppable area
		    	// if not - push ID number back at collection
		    	// and update obj tyles counter accordingly
		    	if ($dropped == false ) { 
		    		var Idback = ui.helper.attr('data-id');
		    		$IdsCollection[thisGrName].push(Idback);
		    		$(this).children('.element__counter').text($IdsCollection[thisGrName].length);
		    		return 
		    	   } 
		    	else { $dropped = false;  return }
		    }

	    });
	}};
	
	console.log( IdsCollection );
	// // finds list of Id's by group name
	// var getGrN = $('[data-group="media_player"]').attr('data-group');
	// var groupArr = $.inArray(getGrN, IdsCollection[0]);
	// console.log(IdsCollection[groupArr][1] );

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
