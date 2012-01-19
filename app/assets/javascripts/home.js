$(document).ready(function() {
	var choices = new Array("","","");
	var $selections = $( "#selections" ),
	$choices = $( "#choices" );

	$( ".movie", $choices ).draggable({
		revert: "invalid",
		helper: "clone",
		cursor: "move"
	});

	$( "li", $selections ).droppable({
		accept: ".movie",
		activeClass: "state-highlight",
		hoverClass: "state-hover",
		drop: function( event, ui ) {
			addSelection( ui.draggable, $(this) );
		}
	});

	$choices.droppable({
		accept: "#selections .movie",
		activeClass: "custom-state-active",
		drop: function( event, ui ) {
			removeSelection( ui.draggable );
		}
	});

	function removeSelection( $item ) {
		$item.fadeOut('fast',function() {
			$item
				.appendTo( $choices )
				.fadeIn('fast');
		});
		choices[$.inArray($item[0].id, choices)] = "";
	}

	function addSelection( $item, $choice ) {
		var movieName = $item[0].id;
		var choiceNumber = $choice[0].id.replace("vote", "");
		var existingMovie = choices[(choiceNumber-1)];
		var droppedArrayPos = $.inArray(movieName, choices);
		var existingArrayPos = $.inArray(existingMovie, choices);
		if (existingMovie == "")
		{
			$item.fadeOut('fast',function() {
				$item
					.appendTo( $choice )
					.fadeIn('fast');
			});
			$choice.find(".instructions").fadeOut('fast');
			if( droppedArrayPos > -1 ){
				choices[droppedArrayPos] = "";
			}
			choices[(choiceNumber-1)] = movieName;
		}
		else if (existingMovie != "")
		{
			if ((existingMovie != movieName)&&( droppedArrayPos > -1 ))
			{
				var $oldItem = $("#"+existingMovie);
				$oldItem.fadeOut('fast',function() {
					$oldItem
						.appendTo( $("#vote"+(droppedArrayPos+1)))
						.fadeIn('fast');
				});
				$item.fadeOut('fast',function() {
					$item
						.appendTo( $choice )
						.fadeIn('fast');
				});
				choices[droppedArrayPos] = existingMovie;
				choices[existingArrayPos] = movieName;
			}
			else
			{
				removeSelection( $("#"+existingMovie) );
				$item.fadeOut('fast',function() {
					$item
						.appendTo( $choice )
						.fadeIn('fast');
				});
				choices[(choiceNumber-1)] = movieName;
			}
		}
	}

});

//prevent new drop until move (ajax) has been completed
