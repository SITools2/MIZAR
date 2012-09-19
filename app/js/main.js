var globe = null;
var astroNavigator = null;
var layerManager = null;

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function setSearchBehavior()
{
	var input = $('#searchInput');
	var animationDuration = 300;
	var defaultText = input.val();
	
	// Set style animations
	input.bind('focus', function() {
		if(input.val() === defaultText) {
			input.val('');
		}

		$(this).animate({color: '#000'}, animationDuration).parent().animate({backgroundColor: '#fff'}, animationDuration).addClass('focus');
	}).bind('blur', function(event) {
		
		$('#equatorialCoordinatesSearchResult').fadeOut(animationDuration);
		$(this).animate({color: '#b4bdc4'}, animationDuration, function() {
			if(input.val() === '') {
				input.val(defaultText)
			}
		}).parent().animate({backgroundColor: '#e8edf1'}, animationDuration).removeClass('focus');
	});
	
	// Submit event
	$('#searchForm').submit(function(event){
		event.preventDefault();
		var objectName = $("#searchInput").val();
		var url = "/datasets/headers/plugin/resolverName/" + objectName +"/EQUATORIAL";
		$('#equatorialCoordinatesSearchResult').fadeOut(animationDuration);
		$.ajax({
			type: "GET",
			url: url,
			success: function(response){
				console.log(response);
				if(response.dec && response.ra)
				{
					var equatorial = [];
					GlobWeb.CoordinateSystem.fromGeoToEquatorial([response.ra, response.dec], equatorial);
			
					var wordRA = equatorial[0].split(" ");
					var wordDecl = equatorial[1].split(" ");
					$("#equatorialCoordinatesSearchResult").html("<em>Ra:</em> " + wordRA[0] +"h "+ wordRA[1] +"mn "+ roundNumber(parseFloat(wordRA[2]), 4) +"s<br /><em>Dec:</em> " + wordDecl[0] +"&#186 "+ wordDecl[1] +"' "+ roundNumber(parseFloat(wordDecl[2]), 4) +"\"");

					$('#equatorialCoordinatesSearchResult').fadeIn(animationDuration);
					astroNavigator.zoomTo([response.ra, response.dec], 15, 5000 );
				} else {
					$('#equatorialCoordinatesSearchResult').html("Enter object name");
					$('#equatorialCoordinatesSearchResult').fadeIn(animationDuration);
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				$('#equatorialCoordinatesSearchResult').html("Not found");
				$('#equatorialCoordinatesSearchResult').fadeIn(animationDuration);
				console.error( xhr.responseText );
			}
		});

	});
	
	$('#searchClear').click(function(event){
		if(input.val() !== defaultText) {
			input.val(defaultText);
		}
		
		$('#searchInput').animate({color: '#b4bdc4'}, animationDuration).parent().animate({backgroundColor: '#e8edf1'}, animationDuration).removeClass('focus');
		
	});

}

$(function()
{	
	// Create accordeon
	$( "#accordion" ).accordion( { autoHeight: false, active: 0, collapsible: true } );
	
	setSearchBehavior(); 
	
	var canvas = document.getElementById('HEALPixCanvas');

	// Make fullscreen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	// jQuery
	$(window).resize(function() {
		if ( canvas.width !=  window.innerWidth ) 
			canvas.width = window.innerWidth;
		if ( canvas.height != window.innerHeight )
			canvas.height = window.innerHeight;
	});
	
	// Initialize webgl
	try
	{
		globe = new GlobWeb.Globe( { 
			canvas: canvas, 
			showWireframe: false, 
			continuousRendering: true
		} );
	}
	catch (err)
	{
		document.getElementById('HEALPixCanvas').style.display = "none";
		document.getElementById('webGLNotAvailable').style.display = "block";
	}
	
	// Add stats
	var stats = new GlobWeb.Stats( globe, {element: 'fps', verbose: true} );
	
	// Initialize navigator
	astroNavigator = new GlobWeb.AstroNavigation(globe);
	
	// Event to show HEALPix wireframe grid
	$("#grid").click(function(event){
		if ($("#grid:checked").length)
		{
			globe.setOption("showWireframe", true);
		}
		else
		{
			globe.setOption("showWireframe", false);
		}
	});
	
	// Click event to show equatorial coordinates
	$("#HEALPixCanvas").click(function(event){
		if(event.ctrlKey){
			var equatorial = [];
			geo = globe.getLonLatFromPixel(event.pageX, event.pageY);		
			GlobWeb.CoordinateSystem.fromGeoToEquatorial(geo, equatorial);
			
			var wordRA = equatorial[0].split(" ");
			var wordDecl = equatorial[1].split(" ");
			$("#equatorialCoordinates").html("<em>Right ascension:</em> <br/>&nbsp&nbsp&nbsp&nbsp" + wordRA[0] +"h "+ wordRA[1] +"mn "+ roundNumber(parseFloat(wordRA[2]), 4) +"s<br /><em>Declination :</em> <br/>&nbsp&nbsp&nbsp&nbsp" + wordDecl[0] +"&#186 "+ wordDecl[1] +"' "+ roundNumber(parseFloat(wordDecl[2]), 4) +"\"");
		}
	});
	
	// Create layers from configuration file
	initLayers(globe);
	
});