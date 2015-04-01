
$(document).ready(function(){$('.carousel').carousel({interval:false});

/* affix the navbar after scroll below header */
$('#nav').affix({
      offset: {
        top: $('header').height()-$('#nav').height()
      }
});	

/* highlight the top nav as scrolling occurs */
$('body').scrollspy({ target: '#nav' })

/* smooth scrolling for scroll to top */
$('.scroll-top').click(function(){
  $('body,html').animate({scrollTop:0},1000);
})

/* smooth scrolling for nav sections */
$('#nav .navbar-nav li>a').click(function(){
  var link = $(this).attr('href');
  var posi = $(link).offset().top;
  $('body,html').animate({scrollTop:posi},700);
});


/* copy loaded thumbnails into carousel */
$('.panel .img-responsive').on('load', function() {
  
}).each(function(i) {
  if(this.complete) {
  	var item = $('<div class="item"></div>');
    var itemDiv = $(this).parent('a');
    var title = $(this).parent('a').attr("title");
    
    item.attr("title",title);
  	$(itemDiv.html()).appendTo(item);
  	item.appendTo('#modalCarousel .carousel-inner'); 
    if (i==0){ // set first item active
     item.addClass('active');
    }
  }
});

/* activate the carousel */
$('#modalCarousel').carousel({interval:false});

/* change modal title when slide changes */
$('#modalCarousel').on('slid.bs.carousel', function () {
  $('.modal-title').html($(this).find('.active').attr("title"));
})

/* when clicking a thumbnail */
$('.panel-thumbnail>a').click(function(e){
  
    e.preventDefault();
    var idx = $(this).parents('.panel').parent().index();
  	var id = parseInt(idx);
  	
  	$('#myModal').modal('show'); // show the modal
    $('#modalCarousel').carousel(id); // slide carousel to selected
  	return false;
});


});

window.onload = function(){
	var options = {
		"nameResolver": {
			zoomFov: 1,
			duration: 2000
		},
		"positionTracker": {
			position: "top"
		}
	};
	var mizar = new MizarWidget("#mizarWidget-div", options);
	mizar.setCompassGui(true);
	var hstLayer = mizar.getLayer("HST");
	var color = hstLayer.style.strokeColor;
	var previousFeatureData;
	var previousZIndex;
	console.log(color);
	// Need to set min order to 6 since we want to display only the features
	// which are not far of final camera destination fov
	hstLayer.minOrder = 6;
	hstLayer.style.strokeColor = [0,0.5,0,1.0];
	
	var table = $('#featureResults').DataTable({
		"dom": '<"toolbar">frtip',
		"scrollY": "600px",
		"scrollCollapse": true,
		paging: false,
            "oLanguage": {      
                "sLoadingRecords": "Please wait - loading...", 
                "sEmptyTable": "Please wait - loading...",
                "sZeroRecords": "Please wait - loading..."
            }
	});
	$("div.toolbar").html('Observations');

	// Highlight feature on hover
	$('#featureResults tbody')
	.on( 'click', 'tr', function () {
			var featureData = $(this).data("featureData");
			if ( featureData ) {			
			    if ( previousFeatureData) {
			    	options= {};
				options.color="#008000";
				previousFeatureData.layer.style.zIndex=previousZIndex;
			    	mizar.highlightObservation(previousFeatureData, options);
			    }			    
			    var $tr = $(this).closest("tr");
			    //remove any selected siblings 
			    $tr.siblings().removeClass('selected');
			    //toggle current row
			    $tr.toggleClass('selected');  
			    options= {};
			    options.color="#0000FF";
			    previousZIndex = featureData.layer.style.zIndex;
			    featureData.layer.style.zIndex=1;
			    mizar.highlightObservation(featureData, options);
			    previousFeatureData = featureData;
			     
			}
	} );


	// Update data table when features has been added on hstLayer
	hstLayer.subscribe("features:added", function(featureData){
		// HST layer loading ended
		// Show received features
		var $tbody = $('#featureResults').find("tbody");
		
		for ( var i=0; i<featureData.features.length; i++ )
		{
			var feature = featureData.features[i];
			var row = table.row.add( [ feature.properties.identifier, feature.properties.Ra, feature.properties.Dec, '<a href='+feature.services.download.url+'>download</a>' ] );
			$(row.node()).data("featureData",{feature: feature, layer: featureData.layer});
		}
		table.draw();
	});

	// Move to point of interest handler
	$('#poiTable tr').click(function(event){
		// Clear observation results and hide hstLayer before move to animation
		hstLayer.visible(false);
		table.clear().draw();
		// Retrive POI name and go for it
		var poiName = $(event.target).text();

		// Make hstLayer visible once go-to animation finished to launch the search
		mizar.goTo(poiName, function() {
			hstLayer.visible(true);
		});
	});
};

