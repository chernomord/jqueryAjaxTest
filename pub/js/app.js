var devicesConf = {
	url: "devices.json", type: "GET", dataType : "json",
    success: function( json ) {
        // $( "<h1>" ).text( json[1].id ).appendTo( "body" );
        // $( "<div class=\"content\">").html( json[1].type ).appendTo( "body" );
        // $devices = json;
        // console.log( json.html );
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
        // console.log(devices);
    })
    .fail(d.reject); 
    return d.promise();
};



//  ui populating

function load(){
    console.log( "populating ..." );
    var loadingData = getDevices(devicesConf).done(function(devices){
    	$devices = devices;

		$('.table').droppable({
			// accept: function (event, ui) {
			// 	if ($(this))

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
		



		var types = getTypes($devices);

		renderElements($devices, types);

	});

    $.when(loadingData)
     .done(console.log( "populating : done"));
};





// getting item type names array
function getTypes(dataArray) {

	function uniq(a) {
	    var seen = {};
	    return a.filter(function(item) {
	        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	    });
	};
	var types = dataArray.map(function(n, idx) {
			return n.type;
		});

	return uniq(types);
};


// populating devices palette
function renderElements(dataArray, objectTypes) {

	for ( i = 0; i < objectTypes.length; i++ ) {

		var conf = function (item, idx) {
			 if ( item.type == objectTypes[i] ) { return true };
		};

		var filtered = dataArray.filter(conf);
	    $("div.elements__box")
	    .append(
	    	'<div class="element " id="' + objectTypes[i] + '">'
	    	+ objectTypes[i].replace('_', ' ') + 
	    	'<div class="element__counter">' + filtered.length + '</div>'
	    	+ '</div>'
	    );
	    $('.element#' + objectTypes[i])
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
