$(document).ready(function() {
  var movies = null;
  var users = null;
  var votes = null;
  var fbUserInfo = null;
  var choices = new Array("","","");
  var chosenIDs = new Array("","","");
  var $selections = $( "#selections" );
  var saving = false;

  $.template('movie-div', '<div id="${slug}" data-id="${id}" class="movie"><div class="pedestal"><img src="/assets/${slug}.jpeg" /></div><p>${name}</p></div>');

  //get the list of movies and populate them
  $.ajax({
    url: '/movies',
    success: function( data ) {
      movies = data;
      $.each( movies, function(i, movie){
         $.tmpl("movie-div", movie).appendTo("#choices");
         //$('<div id="${slug}" data-id="${id}" class="movie"><div class="pedestal"><img src="/assets/${slug}.jpeg" /></div><p>${name}</p></div>').appendTo("#choices");
      });
    }
  });

  /*get a list of users
  $.ajax({
    url: '/users',
    success: function( data ) {
      users = data;
      console.log(users);
    }
  });*/

  //get an object of all the votes
  $.ajax({
    url: '/votes',
    success: function( data ) {
      votes = data;
    }
  });

  $("#fb-login").click(function(e) {
    e.preventDefault();
    setupSelector();
    $("#login").hide();
    $("#nav").show();
    $("#selections").show();
    /*FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', function(response) {
          fbUserInfo = response;
          $.ajax({
            type: "POST",
            url: '/users',
            data: { "user": { "name": fbUserInfo["name"], "email": "", "fbid": fbUserInfo["id"] }},
            always: function() {
              setupSelector();
              $("#login").hide();
              $("#nav").show();
              $("#selections").show();
            }
          });
        });
      } else {
        alert('Facebook login was unsuccessful. Please try again.');
      }
    });*/
  });

  function setupSelector() {
    $choices = $( "#choices" );

    //make movies draggable
    $( ".movie", $choices ).draggable({
      revert: "invalid",
      helper: "clone",
      cursor: "move"
    });

    //allow movies to be dropped into rankings
    $( "li", $selections ).droppable({
      accept: ".movie",
      activeClass: "state-highlight",
      hoverClass: "state-hover",
      drop: function( event, ui ) {
        addSelection( ui.draggable, $(this) );
      }
    });

    //allow movies to be dropped back into the list for removal
    $choices.droppable({
      accept: "#selections .movie",
      activeClass: "custom-state-active",
      drop: function( event, ui ) {
        removeSelection( ui.draggable );
      }
    });
  }

  function saveVotes() {
    var votes = { "selections": {"user": fbUserInfo['fbid'], "vote1": chosenIDs[0], "vote2": chosenIDs[1], "vote3": chosenIDs[2] }};
    $.ajax({
      type: "POST",
      url: '/votes',
      data: votes,
      success: function() {
        saving = false;
      }
    });
  }

  function removeSelection( $item ) {
    if (!saving) {
      saving = true;
      $item.fadeOut('fast',function() {
        $item
          .appendTo( $choices )
          .fadeIn('fast');
      });
      choices[$.inArray($item[0].id, choices)] = "";
      choices[$.inArray($item[0].attr("data-id"), chosenIDs)] = "";
      saveVotes();
    }
  }

  function addSelection( $item, $choice ) {
    if (!saving) {
      saving = true;

      var movieName = $item[0].id;
      var choiceNumber = $choice[0].id.replace("vote", "");
      var existingMovie = choices[(choiceNumber-1)];
      var droppedArrayPos = $.inArray(movieName, choices);
      var existingArrayPos = $.inArray(existingMovie, choices);
      if (existingMovie == "") {
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
        chosenIDs[(choiceNumber-1)] = $("#"+movieName).attr("data-id");
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
          chosenIDs[droppedArrayPos] = $("#"+existingMovie).attr("data-id");
          chosenIDs[existingArrayPos] = $("#"+movieName).attr("data-id");
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
          chosenIDs[(choiceNumber-1)] = $("#"+movieName).attr("data-id");
        }
      }
      saveVotes();
    }
  }
});