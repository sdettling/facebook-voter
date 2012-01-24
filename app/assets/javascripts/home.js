$(document).ready(function() {
  var movies = null;
  var users = null;
  var votes = null;
  var fbUserInfo = {"id": "12345", "name": "Steve"};
  var choices = new Array("","","");
  var chosenIDs = new Array("","","");
  var $selections = $( "#selections" );
  var saving = false;
  var movieScores = new Array();

  $.template('movie-div', '<div id="${slug}" data-id="${id}" class="movie"><div class="pedestal"><img src="/assets/${slug}.jpeg" /></div><p>${name}</p></div>');
  $.template('graph-item', '<div class="item"><div class="bar"><div class="value" style="height: ${barheight}px;"></div></div><div class="info"><div class="pedestal"><img src="/assets/${slug}-s.jpeg" /></div><p class="title">${name}</p><p class="score">${points} points</p></div></div>');

  //get the list of movies and populate them
  $.ajax({
    url: '/movies',
    success: function( data ) {
      movies = data;
      $.each( movies, function(i, movie){
         $.tmpl("movie-div", movie).appendTo("#choices");
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
      console.log(votes);
    }
  });

  $("#fb-login").click(function(e) {
    e.preventDefault();
    
    $("#login").hide();
    $("#nav").show();
    $("#selections").show();
    
    loadUsersVotes();
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

  function scoreMovies() {
    $.ajax({
      url: '/votes',
      success: function( data ) {
        votes = data;
        var totalPoints = 0;
        $.each( movies, function(i, movie){
          var movieCount = 0;
          $.each( votes, function(j, vote){
            if(vote['movie'] == movie['id']) {
              if(vote['rank'] == 3) { movieCount += 1; }
              else if(vote['rank'] == 2) { movieCount += 2; }
              else if(vote['rank'] == 1) { movieCount += 3; }
            }
          });
          totalPoints += movieCount;
          movieScores.push( {"slug": movie['slug'], "name": movie['name'], "points": movieCount} );
        });
        movieScores.sort(function(a, b){
          return b.points-a.points
        });
        $('.graph .item').remove();
        $.each( movieScores, function(i, movie){
          var height = (movie['points']/totalPoints)*208;
          $.tmpl("graph-item", {"barheight": height, "slug": movie['slug'], "name": movie['name'], "points": movie['points'] }).appendTo(".graph");
        });
      }
    });
  }

  function loadUsersVotes() {
    $.each( votes, function(i, vote){
      if(vote['voter'] == fbUserInfo['id'])
      {
        chosenIDs[((vote['rank'])-1)] = vote['movie'];
        $.each( movies, function(j, movie){
          if(vote['movie'] == movie['id'])
          {
            choices[((vote['rank'])-1)] = movie['slug'];
          }
        });
      }
    });
    
    $.each( choices, function(i, choice){
      if(choice != ""){
        $item = $("#"+choice);
        $choice = $("#vote"+(i+1));
        $item.fadeOut(0,function() {
          $item
            .appendTo( $choice )
            .fadeIn(0);
        });
        $choice.find(".instructions").fadeOut('fast');
      }
    });
    setupSelector();
  }

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
    var votes = { "selections": {"user": fbUserInfo['id'], "vote1": chosenIDs[0], "vote2": chosenIDs[1], "vote3": chosenIDs[2] }};
    $.ajax({
      type: "POST",
      url: '/votes',
      data: votes,
      success: function() {
        saving = false;
        $(".saving").hide();
      }
    });
  }

  function removeSelection( $item ) {
    if (!saving) {
      saving = true;
      $(".saving").show();
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
      $(".saving").show();
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

scoreMovies();

});