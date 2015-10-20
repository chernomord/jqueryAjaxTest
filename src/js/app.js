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
}


// find object id in $devices array by propery ID value
function findDeviceID (idValue) {
	for (i=0; i < $devices.length; i++) {
		if ($devices[i].id == idValue) { return i; }
	}
}

// get 'properties' object from $devices by given its array ID
function getDeviceProps (arrayId) {
	return $devices[arrayId].properties;
}

// replace $devices object 'properties' by its ID with new object 
function replaceDeviceProps (newPropsObj, idValue) {
	var arrayID = findDeviceID(idValue);
	$devices[arrayID].properties = newPropsObj;
}

// Serialize form data into object format
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Render editor form 
// based on 'id' data property value
function renderEditorForm (idValue) {

	// form body template
	var $formBody = $('<form name="properties" data-id="'+ idValue +'" method="post" action=""></form>');
	// inputs template
	function formInput(property) {
		for(var key in property) {
		return $('<div class="input"><span class="label">'+ key +'</span><input type="text" name="'+ key +'" value="'+ property[key] +'"></div>')
		}
	}
	var properties = getDeviceProps(findDeviceID(idValue));

	$('form[name="properties"]').remove();

	for (var property in properties) {
	    if (properties.hasOwnProperty(property)) {
	    	var newProp = {};
	    	newProp[property] = properties[property];
	        $formBody
	        .append(
	        	formInput( newProp).keyup(function(){
		        	var newProperties = $('form[name="properties"]').serializeObject();
		        	var arrayID = findDeviceID(idValue); 
		        	$devices[arrayID].properties = newProperties;
		        })
	        );
	    }
	};
	// actually render form
	$('.editor').append($formBody);
};
 

// data mining module for unpredictable number of types of objects
// getting array = [type_Name,[type_Ids]]
// 
// Results are foundation of two way data binding
// 
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
	    	zIndex: function(event,ui){ 
	    		var newzindex = $(this).zIndex() +10; 
	    		return newzindex  
	    	},
	    	helper : "clone",
	    	stack: "div.ui-draggable",
	    	revert : "invalid",
	    	start : function(event,ui) { 
    			var thisGrName = ui.helper.attr('data-group');

	    		// check if any objects left in group
	    		// if any - pop last ID number from collection,
	    		// translate it to data-id at helper obj
	    		// and update obj tyles counter 
	    		if ( $IdsCollection[thisGrName].length > 0 ) {
	    			if ( $IdsCollection[thisGrName].length == 1 ) {
	    				$(this).addClass('disabled');
	    			};
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
		    		$(this).removeClass('disabled');
		    		var Idback = ui.helper.attr('data-id');
		    		$IdsCollection[thisGrName].push(Idback);
		    		$(this).children('.element__counter').text($IdsCollection[thisGrName].length);
		    		return 
		    	   } 
		    	else { $dropped = false;  return }
		    }

	    });
	}};
};

// Main module
// Retrieving data and Application loading

function load(){
    console.log( "populating ..." ); // debug

    getDevices(devicesConf).done(function(devices){
    	// Declaring and calculating global variables for data binding
    	$dropped = false;
    	$devices = devices;
    	$IdsCollection = SortIdsByTypes($devices);
    	var $lastActive; /*last selected object*/

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

					$dropped = true;

					var newHelp = $(ui.helper)
						.clone(false)
					    .removeClass('ui-draggable-dragging')
					    .removeClass('element--group')
					    .css("opacity" , "1")
					    .addClass('noclick')
					    .draggable({ 
					    	containment: "parent", 
					    	stack: "div",
					    	revert: "invalid" })
					    // Object element - defining it's interactivity
					    // render editor form on click
					    .click(function(){

				    	    if ($lastActive) {
					    	    $lastActive.removeClass('selected');}
				    	    $(this).addClass('selected');
				    	    $lastActive = $(this);
				    	    renderEditorForm(thisId);

				    	});  
				    $(this).append(newHelp );

				    var thisId = parseInt(ui.helper.attr('data-id'));
				    newHelp.children('.element__del').attr('data-id', thisId);


					// Element delete button - adding interactivity #
					$('span.element__del[data-id="'+ thisId +'"]' ).click( function(e) {


						$(this).parent().attr('onclick','').unbind('click');
						var helper = $(this).parent(),
							thisGrName = helper.attr('data-group'),
							thisId = parseInt(helper.attr('data-id')),
		    				ancestorGroup = $('.element--group[data-group="'+ thisGrName +'"]'),
		    				ancCounter = ancestorGroup.children('.element__counter');
						// delete editor form if this object is active
						if ($('form[name="properties"]').attr('data-id') == thisId) {
							$('form[name="properties"]').remove();}
						// push element back to croup id's collection
		    			$IdsCollection[thisGrName].push(thisId);
						
						ancCounter.addClass('counter--active');
						ancCounter.text($IdsCollection[thisGrName].length);
						ancestorGroup.removeClass('disabled');

						var offsetX = ancestorGroup.offset().left,
							offsetY = ancestorGroup.offset().top;
							helper.zIndex(50);
						helper.animate({
						  opacity: .5,
						  left: offsetX,
						  top: offsetY
						}, 200, function() {
							ancCounter.removeClass('counter--active');
						    helper.remove();
						    });        

					});
					
				} else {return false};
				
	    	}
	    });

		

		// rendering palette of types and getting data

		renderElements($devices, $IdsCollection);

	});

    $.when()
     .done(console.log( "populating : done")); // debug
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
 