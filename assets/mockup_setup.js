
$( document ).ready(function() {


	//  Find all the displayable <divs>
	var allDisplays = $('.mockup-display');


	var showIt = function( whichOne ) {

		allDisplays.each(function(indx, el){

			var $el = $(el);
			if ($el.hasClass(whichOne)) {
				$el.show();
			} else { 
				$el.hide();
			}
		})

	}



	// for each element that has a rbac-show="displayableDiv" attribute
	$('[mockup-show]').each(function(indx, el){

		// when it is clicked, then make sure only that div is shown
		var $el = $(el);
		$el.click(function(){
			showIt($el.attr('rbac-show'));
		})
	})



	// display any tooltips().
	$('[data-toggle="tooltip"]').tooltip();


	// enable the menu sidr:
	$('#op-masthead-menu a:first-of-type').sidr({name:'op-menu-widget',side:'left'});


});






//  //Setup Typeahead Search Bars
// $(document).ready(function () {
    
// 	$('.autocomplete-filter')
// 	.typeahead({
//         hint: true,
//         highlight: true,
//         minLength: 1
//     },
//     {
//         name: 'filter',
//         displayKey: 'value',
//         source: function(q,cb) {
//             cb([
//             	{ value: 'example 1'},
//             	{ value: 'examine'},
//             	{ value: 'exajerate'}
//             ]);
//         }
//     });

// });



 //For Testing Display with lots of entries in our Tables:  
 // copy the last row x20 
$(document).ready(function () {
    
    var allTables = $('table.table-hover');
    allTables.each(function(i, table){
    	var $table = $(table);
    	var lastRow = $table.find('tr:last');
    	var tBody = $table.find('tbody');
    	for (var i=1; i<=20; i++) {
    		tBody.append(lastRow.clone());
    	} 
    })
	


});


//Responsiveness of table scroll
$(document).ready(function () {
    $(window).resize(function () {
        $('table[data-toggle="table"]').add($('table[id]')).bootstrapTable('resetView');
    });	

});

