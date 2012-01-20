$(document).ready(function() {

	$.ajax({
	  url: '/movies',
	  success: function( data ) {
	    if (console && console.log){
	      console.log(data);
	    }
	  }
	});

	$("#login").click(function(e) {
		e.preventDefault();
		FB.login(function(response) {
			if (response.authResponse) {
				FB.api('/me', function(response) {
					fbUserInfo = response;
					console.log(fbUserInfo);
				});
			} else {
				console.log('User cancelled login or did not fully authorize.');
			}
		}, {scope: 'email'});
	});

	/*$.post('/users', { "user": { "name": "John", "email": "email", "fbid": "939393" }} );
	$.post('/votes', { "votes": [ {"vote": { "voter": "100", "movie": "001", "type": "1" }}, {"vote":{ "voter": "100", "movie": "002", "type": "3" }},{"vote":{ "voter": "100", "movie": "003", "type": "3" }] } );
*/

	$.post('/votes', { "selections": {"user": "1", "vote1": "111", "vote2": "222", "vote3": "333" }});

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