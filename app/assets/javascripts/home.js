$(document).ready(function() {
  var movies = null;
  var users = null;
  var votes = null;
  var fbUserInfo = null;
  var choices = new Array("","","");
  var chosenIDs = new Array("","","");
  var $selections = $( "#selections" );
  var saving = false;
  var custom = false;
  var invited = [19600245,26904108,36400111,36400222,36402585,36405216,36406896,36409763,68302058,508750472,100000313172773,100000645482115,16320868,36400025,36400078,36400272,36400277,36400405,36400913,36401292,36402678,36403066,36403766,36407513,198900007,511794795,617647469,625495213,783068255,1044233749,36400432,553586954,1782894834,36400584,36400937,79201405,592801990,736950829,1157138915,1450489800,100000495870476];

  $.template('movie-div', '<div id="${slug}" data-id="${id}" class="movie"><div class="pedestal"><a href="#" class="more-info">i</a><img src="/assets/${slug}.jpeg" /></div><p>${name}</p></div>');
  $.template('graph-item', '<div class="item"><div class="bar"><div class="value" style="height: ${barheight}px;"></div></div><div class="info"><div class="pedestal"><img src="/assets/${slug}-s.jpeg" /></div><p class="title">${name}</p><p class="score">${points} points</p></div></div>');
  $.template('detail', '<div class="image"><img alt="${name}" src="/assets/${slug}.jpeg"></div><h3>${name}</h3><p><strong>Director:</strong> ${director}</p><p><strong>Cast:</strong> ${cast}</p><p><a href="${url1}" target="_blank">Watch the Trailers</a> <a href="${url2}" target="_blank">View on IMDB</a></p><p class="synopsis"><strong>Synopsis:</strong> ${synopsis}</p>');

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '248504555218072', // App ID
      channelUrl : '//celebratecinema.com/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        var uid = response.authResponse.userID;
        var accessToken = response.authResponse.accessToken;
        $("#login").hide();
        initializeUser();
      } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook,
        //but not connected to the app
      } else {
        // the user isn't even logged in to Facebook.
      }
    });
  };


  //get the list of movies and populate them
  $.ajax({
    url: '/movies',
    success: function( data ) {
      movies = data;
      $.each( movies, function(i, movie){
         $.tmpl("movie-div", movie).appendTo("#choices");
      });
      scoreMovies(custom);
      $(".movie .more-info").click(function(e) {
        e.preventDefault();
        openMovieDetail($(this).parents('.movie')[0].id);
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
  /*$.ajax({
    url: '/votes',
    success: function( data ) {
      votes = data;
      //console.log(votes);
    }
  });*/

  $("#post-story").click(function(e) {
    e.preventDefault();
    postToFeed();
  });

  $("#results-refresh").click(function(e) {
    e.preventDefault();
    scoreMovies(custom);
  });

  $("#detail-close").click(function(e){
    e.preventDefault();
    closeMovieDetail();
  });

  $("#custom-results-toggle").click(function(e) {
    e.preventDefault();
    custom = !custom;
    if (custom) {
      $(this).html("View All Results");
    }
    else {
      $(this).html("View Only Watch-A-Thon Results");
    }
    scoreMovies(custom);
  });

  $("#fb-login").click(function(e) {
    e.preventDefault();

    /*$("#login").hide();
    $("#subtitle").show();
    $("#selections").show();
    setupSelector();
    loadUsersVotes();*/

    FB.login(function(response) {
      if (response.authResponse) {
        initializeUser();
      } else {
        alert('Facebook login was unsuccessful. Please try again.');
      }
    });
  });

  function openMovieDetail(slug){
    $.each( movies, function(i, movie){
      if(movie['slug'] == slug) {
        $("#detail-template").html("");
        $.tmpl("detail", movie).appendTo("#detail-template");
      }
    });
    $('#moviedetailbg').show();
    $('#moviedetail').show();
  }
  function closeMovieDetail(){
    $('#moviedetailbg').hide();
    $('#moviedetail').hide();
  }

  function initializeUser() {
    FB.api('/me', function(response) {
      fbUserInfo = response;
      $.ajax({
        type: "POST",
        url: '/users',
        data: { "user": { "name": fbUserInfo["name"], "email": "", "fbid": fbUserInfo["id"] }},
        success: function(response) {
          setupSelector();
          $("#login").hide();
          $("#subtitle").show();
          $("#selections").show();
          setupSelector();
          loadUsersVotes();
          if( $.inArray(Number(fbUserInfo["id"]), invited) >= 0 ) {
            $('#nav li.custom').show();
          }
        },
        error: function(response) {
          if(response['responseText'] == '{"fbid":["has already been taken"]}')
            {
            setupSelector();
            $("#login").hide();
            $("#subtitle").show();
            $("#selections").show();
            setupSelector();
            loadUsersVotes();
            if( $.inArray(Number(fbUserInfo["id"]), invited) >= 0 ) {
              $('#nav li.custom').show();
            }
          }
        }
      });
    });
  }

  function postToFeed() {
    var firstChoice = $("#"+choices[0]).find('p').html();
    var obj = {
      method: 'feed',
      link: 'http://cinemacelebration.com/',
      picture: 'http://cinemacelebration.com/assets/'+choices[0]+'.jpeg',
      name: 'The Academy\'s Best Pictures of 2011',
      caption: firstChoice+' is my pick for best picture this year.',
      description: 'Who do you think will take home the Oscar this year? Cast your vote.'
    };
    FB.ui(obj);
  }

  function generateGraph(movieScores, totalPoints) {
    $('.graph .item').remove();
    $.each( movieScores, function(i, movie){
      var height = (movie['points']/totalPoints)*208;
      $.tmpl("graph-item", {"barheight": height, "slug": movie['slug'], "name": movie['name'], "points": movie['points'] }).appendTo(".graph");
    });
  }

  function scoreMovies(custom) {
    $.ajax({
      url: '/votes',
      success: function( data ) {
        votes = data;
        var totalPoints = 0;
        var movieScores = [];
        var customPoints = 0;
        var customScores = [];
        $.each( movies, function(i, movie){
          var movieCount = 0;
          var customCount = 0;
          $.each( votes, function(j, vote){
            if(vote['movie'] == movie['id']) {
              if(vote['rank'] == 3) { movieCount += 1; }
              else if(vote['rank'] == 2) { movieCount += 2; }
              else if(vote['rank'] == 1) { movieCount += 3; }
            }
            if(  (vote['movie'] == movie['id'])&&(($.inArray(vote['voter'], invited))>=0 )  ) {
              if(vote['rank'] == 3) { customCount += 1; }
              else if(vote['rank'] == 2) { customCount += 2; }
              else if(vote['rank'] == 1) { customCount += 3; }
            }
          });
          totalPoints += movieCount;
          customPoints += customCount;
          movieScores.push( {"slug": movie['slug'], "name": movie['name'], "points": movieCount} );
          customScores.push( {"slug": movie['slug'], "name": movie['name'], "points": customCount} );
        });
        movieScores.sort(function(a, b){
          return b.points-a.points
        });
        customScores.sort(function(a, b){
          return b.points-a.points
        });
        if (custom)
        {
          generateGraph(customScores, customPoints);
        }
        else {
          generateGraph(movieScores, totalPoints);
        }
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
        scoreMovies(custom);
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
      choices[$.inArray($item.id, choices)] = "";
      chosenIDs[$.inArray($item.attr("data-id"), chosenIDs)] = "";

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
        var $oldItem = $("#"+existingMovie);
        if ((existingMovie != movieName)&&( droppedArrayPos > -1 ))
        {
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
          $oldItem.fadeOut('fast',function() {
            $oldItem
              .appendTo( $choices )
              .fadeIn('fast');
          });
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