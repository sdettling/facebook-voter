$(document).ready(function() {
  var movies = null;
  var users = null;
  var votes = null;
  var fbUserInfo = null;
  var fbFriends = null;
  var touchMovies = new Array();
  var choices = new Array("","","");
  var chosenIDs = new Array("","","");
  var $selections = $( "#selections" );
  var touchDevice = Modernizr.touch;
  var saving = false;
  var custom = false;
  var invited = ["36400272","36402678","36400025","625495213","36403766","1044233749","36400277","36401292","36400405","198900007","36407513","36400105","36400432","18506865","36402585","36400222","508750472","16320868","36403066","617647469","36400913"];

  $.template('movie-div', '<div id="${slug}" data-id="${id}" class="movie"><div class="pedestal"><a href="#" class="more-info">i</a><img src="/assets/${slug}.jpg" width="120" height"178" /></div><p>${name}</p></div>');
  $.template('graph-item', '<div class="item"><div class="bar"><div class="value" style="height: ${barheight}px;"></div></div><div class="info"><div class="pedestal"><img src="/assets/${slug}.jpg" width="25" height="37" /></div><p class="title">${name}</p><p class="score">${points} points</p></div></div>');
  $.template('detail', '<div class="image"><img alt="${name}" src="/assets/${slug}.jpg" width="120" height"178"></div><h3>${name}</h3><p><strong>Director:</strong> ${director}</p><p><strong>Cast:</strong> ${cast}</p><p><a href="${url1}" target="_blank">Watch the Trailers</a> <a href="${url2}" target="_blank">View on IMDB</a></p><p class="synopsis"><strong>Synopsis:</strong> ${synopsis}</p>');
  $.template('friend', '<div class="friend"><ul><li><div class="user-image"><img src="${image}" /></div><p>${name}</p></li><li><div class="number">1:</div><div class="image"><img src="/assets/${movie1image}.jpg" width="34" height="50" /></div><p>${movie1name}</p></li><li><div class="number">2:</div><div class="image"><img src="/assets/${movie2image}.jpg" width="34" height="50" /></div><p>${movie2name}</p></li><li><div class="number">3:</div><div class="image"><img src="/assets/${movie3image}.jpg" width="34" height="50" /></div><p>${movie3name}</p></li></ul></div>');

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '248504555218072', // App ID
      channelUrl : '//cinemacelebration.com/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
    FB.getLoginStatus(function(response) {
      console.log(response)
      if (response.status === 'connected') {
        var uid = response.authResponse.userID;
        var accessToken = response.authResponse.accessToken;
        $("#login").hide();
        initializeUser();
      } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook,
        //but not connected to the app
        console.log('not connected')
      } else {
        // the user isn't even logged in to Facebook.
        console.log('not logged in')
      }
    });
  };


  //get the list of movies and populate them
  $.ajax({
    url: '/movies',
    success: function( data ) {
      movies = data;
      $.each( movies, function(i, movie){
         $.tmpl("movie-div", movie).insertBefore("#choices .clearer");
      });
      scoreMovies(custom);
      $(".movie .more-info").click(function(e) {
        e.preventDefault();
        openMovieDetail($(this).parents('.movie')[0].id);
      });
      //setupSelector();
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

  $("#friends-refresh").click(function(e) {
    e.preventDefault();
    $("#friend-nav ul").hide();
    showFriends();
  });

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
      console.log(response)
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
      if (fbUserInfo['id'] != null) {
        $.ajax({
          type: "POST",
          url: '/users',
          data: { "user": { "name": fbUserInfo["name"], "email": "", "fbid": fbUserInfo["id"] }},
          success: function(response) {
            $("#login").hide();
            $("#subtitle").show();
            $("#selections").show();
            loadUsersVotes();
            getUserImages();
            if( $.inArray(fbUserInfo["id"], invited) >= 0 ) {
              $('#nav li.custom').show();
            }
          },
          error: function(response) {
            if(response['responseText'] == '{"fbid":["has already been taken"]}')
            {
              $("#login").hide();
              $("#subtitle").show();
              $("#selections").show();
              loadUsersVotes();
              getUserImages();
              if( $.inArray(fbUserInfo["id"], invited) >= 0 ) {
                $('#nav li.custom').show();
              }
            }
          }
        });
      }
    });
  }

  function postToFeed() {
    var firstChoice = $("#"+choices[0]).find('p').html();
    var obj = {
      method: 'feed',
      link: 'http://cinemacelebration.com/',
      picture: 'http://cinemacelebration.com/assets/'+choices[0]+'.jpg',
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

  function getUserImages() {
    $.ajax({
      url: '/users',
      success: function( data ) {
        users = data;
        $.each( users, function(i, user){
          var userImage = null;
          FB.api('/'+user['fbid']+'/picture', function(response) {
            userImage = response.data.url;
            user['image'] = userImage;
          });
        });
      }
    });
  }

  function showFriends() {
    $("#friend-results").html("");
    var numFriends = 0;
    $.each( fbFriends, function(h, friend){
      $.each( users, function(i, user){
        if(user['fbid'] == friend['uid']) {
          numFriends += 1;
          var userInfo = {"image": user['image'], "name": user['name'], "movie1image": "blank", "movie1name": "", "movie2image": "blank", "movie2name": "", "movie3image": "blank", "movie3name": ""}
          $.each( votes, function(j, vote){
            if(vote['voter'] == user['fbid']) {
              $.each( movies, function(k, movie){
                if(vote['movie'] == movie['id'])
                {
                  if (vote['movie'] != null) {
                    if (vote['rank'] == 1){
                      userInfo['movie1image'] = movie['slug'];
                      userInfo['movie1name'] = movie['name'];
                    }
                    else if(vote['rank'] == 2){
                      userInfo['movie2image'] = movie['slug'];
                      userInfo['movie2name'] = movie['name'];
                    }
                    else if(vote['rank'] == 3){
                      userInfo['movie3image'] = movie['slug'];
                      userInfo['movie3name'] = movie['name'];
                    }
                  }
                }
              });
            }
          });
          $.tmpl("friend", userInfo).appendTo("#friend-results");
        }
      });
    });
    if (numFriends == 0){
      $("#friend-results").html("<p>None of your friends have voted yet!</p>");
    }
    $("#friend-results").show();
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
    if( choices[0] != "" ) {
      $('#nav li.post').show();
    }
    setupSelector();
    FB.api(
      {
        method: 'fql.query',
        query: 'select uid, name, is_app_user from user where uid in (select uid2 from friend where uid1=me()) and is_app_user=1'
      },
      function(response) {
        fbFriends = response;
        $("#friend-nav").show();
      }
    );
  }

  function setupSelector() {
    if(touchDevice){
      createTouchDraggables();
      $('#selections li').each(function(index) {
          var drop = $(this)[0].id;
          webkit_drop.add(drop, {hoverClass : 'state-hover', onDrop : function(d,e,f){ addSelection(d,f); } } );
      });
    }
    else{
      $choices = $( "#choices" );

      //make movies draggable
      $( ".movie" ).draggable({
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
  }

  function saveVotes() {
    if (fbUserInfo['id'] != null) {
      var votes = { "selections": {"user": fbUserInfo['id'], "vote1": chosenIDs[0], "vote2": chosenIDs[1], "vote3": chosenIDs[2] }};
      $("#save").html('Saving&hellip;').removeClass('success fail').show();
      $.ajax({
        type: "POST",
        url: '/votes',
        data: votes,
        success: function() {
          saving = false;
          //$(".saving").hide();
          scoreMovies(custom);
          $("#save").html('Saved!').addClass('success').fadeOut(2000);
        },
        error: function() {
          $("#save").html('Failed!').addClass('fail').fadeOut(2000);
        }
      });
    }
  }

  function removeSelection( $item ) {
    if (!saving) {
      saving = true;
      $item.fadeOut('fast',function() {
        $item
          .insertBefore( '#choices .clearer' )
          .fadeIn('fast');
      });
      
      choices[$.inArray($item[0].id, choices)] = "";
      chosenIDs[$.inArray(Number($item.attr("data-id")), chosenIDs)] = "";
      if(choices[0] == ""){
        $('#nav li.post').hide();
      }
      saveVotes();
    }
  }
  
  function createTouchDraggables() {
    if(touchDevice){
      $.each(movies, function(i, movie){
        touchMovies.push( new webkit_draggable(movie['slug'], {revert : true, scroll : true, onStart : function(){ $('#selections li').addClass('state-highlight'); }, onEnd : function(){ $('#selections li').removeClass('state-highlight'); } } ) );
      });
    }
  }

  function addSelection( $item, $choice ) {
    if (!saving) {
      saving = true;
      if(touchDevice){
        $.each(touchMovies, function(i, movie){
          movie.destroy();
        });
        
        var movieName = $item.id;
        var choiceNumber = $choice.id.replace("vote", "");
        $item = $("#"+movieName);
        $choice = $("#vote"+choiceNumber);
      }
      else {
        var movieName = $item[0].id;
        var choiceNumber = $choice[0].id.replace("vote", "");
      }
      var existingMovie = choices[(choiceNumber-1)];
      var droppedArrayPos = $.inArray(movieName, choices);
      var existingArrayPos = $.inArray(existingMovie, choices);
      
      if(choiceNumber == 1){
        $('#nav li.post').show();
      }
      if (existingMovie == "") {
        $item.fadeOut('fast',function() {
          $item
            .appendTo( $choice )
            .fadeIn('fast', function(){
              createTouchDraggables();
            });
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
              .fadeIn('fast', function(){
                createTouchDraggables();
              });
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
              .insertBefore( '#choices .clearer' )
              .fadeIn('fast');
          });
          if(touchDevice){
            $oldItem.css("position", "relative");
          }
          $item.fadeOut('fast',function() {
            $item
              .appendTo( $choice )
              .fadeIn('fast', function(){
                createTouchDraggables();
              });
          });
          choices[(choiceNumber-1)] = movieName;
          chosenIDs[(choiceNumber-1)] = $("#"+movieName).attr("data-id");
        }
      }
      if(touchDevice){
        $item.css({"top": "0px", "left": "0px", "position": "absolute"});
      }
      saveVotes();
    }
  }
});