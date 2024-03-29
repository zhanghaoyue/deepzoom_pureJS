//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
test = true

var slide_url  = image_data['patient'][0]['images']
var mask_url = image_data['mask'][0]['path'] //use ['mask'] in next step

// bootstrap-tour tutorial
var tour = new Tour({
	smartPlacement: true,
	steps: [
		{
			element: "#patient_button",
			title: "Patient Menu",
			content: "Expand to select Patient of interest"
		},
  		{
    		element: ".upper-canvas",
    		title: "Display of Wholeslide Images",
    		content: "This section is the Wholeslide Viewer. The Images are displayed in the middle. At top left corner, there are tools to control the viewer. Toogle to the buttons to see the functions. At top right corner, there is a navigator to help you locate your current position when zooming in. If there are multiple slides associate with current patient, there will be a horizontal scrolling image Reference Strip at the bottom for you to choose different slides. You can also use the 'previous page' and 'next page' button at the end of the tools section to browse the slides sequentially."
  		},
  		{
  			element: "#drawing-mode",
  			title: "Drawing mode",
  			content: "There is a simple drawing tool for you to annotate. Further function is developing"
  		},
  		{
  			element: "#clear-canvas",
  			title: "Clear drawing",
  			placement:"left",
  			content: "Delete current drawing"
  		},
  		{
  			element: "#toggle-overlay",
  			title: "Display Prediction Mask",
  			placement:"left",
  			content: "If there is a prediction overlay associate with current slide, if you click this button, the overlay should apply to current slide. Otherwise it will display a 'no prediction mask' sign"
  		}
	]
});

App = {
	init:function(){

		// openSeadragon object;
		viewer = new OpenSeadragon({
		    id:  "view",
		    tileSources: [slide_url],
		    prefixUrl: "../static/images/",
		    sequenceMode: true,
			showReferenceStrip: true,
		    showNavigator: true,
		    showRotationControl: true,
			animationTime: 0.5,
			blendTime: 0.1,
			constrainDuringPan: true,
			maxZoomPixelRatio: 2,
			minZoomLevel: 1,
			visibilityRatio: 1,
			zoomPerScroll: 2,
		    //debugMode: true,
		    timeout: 120000,
		});


		// To improve load times, ignore the lowest-resolution Deep Zoom
		// levels.  This is a hack: we can't configure the minLevel via
		// OpenSeadragon configuration options when the viewer is created
		// from DZI XML.
		// viewer.addHandler("open", function() {
		// 	 viewer.source.minLevel = 8;
		// });


		viewer.scalebar({
			xOffset: 10,
			yOffset: 10,
			barThickness: 3,
			color: '#555555',
			fontColor: '#333333',
			backgroundColor: 'rgba(255, 255, 255, 0.5)',
		});


		// screenshot function;
	    // viewer will be your OpenSeaDragon viewer object;
		viewer.screenshot({
			showOptions: true, // Default is false
			keyboardShortcut: 'p', // Default is null
			showScreenshotControl: true // Default is true	
		});


		var options = {
			scale: 1000
	    }


	    //initialize selection
	    var selection = viewer.selection(options);

		//bounding box with fabric.js

		var drawRect = function(e,i) {
			if (e.label==1 || e.label==2){
				if(e.label==1){
				color_value="red";
				}
				else if(e.label==2){
					color_value="yellow";
				}
				var boundBoxRect = viewer.viewport.imageToViewportRectangle(e.x,e.y,e.delta_x,e.delta_y);
				var elt = document.createElement('div');
				elt.id="bounding-box-" + i;
				elt.className='runtime-overlay'
            	elt.style.cssText= "border: 2px solid  " + color_value
				viewer.addOverlay({
					element:elt,
					location: boundBoxRect
				});
			}

    	};



		$('#toggle-overlay').click(function(){
			var current_slide;
			var slide_string = viewer.tileCache._tilesLoaded[0].tile.url.split("/")[2];
			current_slide = slide_string.substring(0,slide_string.indexOf("svs")-1);
			mask_url = "image_data/prediction_mask/prediction_dzi/" + current_slide + "_pred.dzi";


			if ($('#toggle-overlay').html()=="Display Prediction Mask") {
				if(test==true){
					$('#toggle-overlay').html('Close Prediction Mask');
					$('#toggle-overlay').removeClass('uk-button-danger');
					$('#toggle-overlay').addClass('uk-button-primary');
					for(var i=0;i<res_73.length;i++){
    					drawRect(res_73[i],i);
    				}
    				//boundingBoxes.fabricCanvas().renderAll.bind(boundingBoxes.fabricCanvas());
    				/*
					viewer.addTiledImage({
						tileSource: mask_url,
						x: 0,
						y: 0,
						opacity: 0.5,
						index: 1
					})
					*/
				}
				else{
					$('#toggle-overlay').html('There is no Prediction Mask');
					$('#toggle-overlay').removeClass('uk-button-danger');
					$('#toggle-overlay').addClass('uk-button-secondary');
				}							
			}else{
				//viewer.world.removeItem(viewer.world.getItemAt(1));;
				$('#toggle-overlay').html('Display Prediction Mask');
				$('#toggle-overlay').removeClass('uk-button-primary');
				$('#toggle-overlay').removeClass('uk-button-secondary');
				$('#toggle-overlay').addClass('uk-button-danger');
			}


		})

		// change patient tile sources when selecting in patient menu
		function update_tileSources(){
			viewer.close();
			viewer.open(slide_url);
		}

		function createCallback( i ){
	  		return function(){
	    		$('.patient_menu li.uk-active').removeClass('uk-active');
		    	$('#patient_'+i).addClass('uk-active');
		    	slide_url = image_data['patient'][(i-1)]['images']
		    	update_tileSources();
	  		}
		}

		for(var i=1;i<=33;i++){
		    $('#patient_'+i).click(createCallback(i));
		}

	}

}



$(document).ready(function() {
	tour.init();
    App.init();
    $('#tutorial_button').click(function(){
		tour.restart();
	})

});