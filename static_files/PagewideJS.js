


$(document).ready(function() {

/***********************************************
      Manipulate DOM based off session storage
************************************************/

  if (sessionStorage["logged_in"]){
    $("#login").remove();
    $("#signup").remove();
    $("#hello").html("Hello, " + sessionStorage["logged_in"]) 

  } else {
    $("#hello").remove(); 
    $("#logout").remove();
    $("#profileButton").remove();
  }

    // "Log Out" clicked, clears session storage
  $("#logout").click(function() {
      sessionStorage.removeItem("logged_in");
    });

    // clear search bar
    $("#search").val("");

  // clear session storage for restaurant when "restaurant" is clicked
  $("#restaurantsButton").click(function(){
    sessionStorage.removeItem("restaurant");
    window.location = "/restaurants.html";
  });

/***********************************************
      Ajax requests to the server
************************************************/

  // generic Ajax error handler
   $(document).ajaxError(function() { 
      alert("Sorry, there was a problem!");
    });

/*  search bar functionality */
  $("#go").click(function() { 
    if ($("#search").val().length > 0){ // if the search bar isn't empty
      $.ajax({
        url: "/places/" + $("#search").val(), 
        type: "GET",
        dataType: "json", 
        success: function(data) {                           
          if (data == "0"){ // place not found, redirect so user can add it

            // set sessionStorage to know where the request came from
            sessionStorage["fromSearch"] = $("#search").val();
            window.location = "/newplace.html";

          } else {
            sessionStorage["restaurant"] = $("#search").val();
            window.location = "/restaurants.html";
          }
        },
      });
    }
  });

});

/***********************************************
     Helper JavaScript functions
************************************************/

/* 
	These are placed outside of the document.ready(), 
	so they can be referenced in other html files
*/

// returns the url of the star image to be used
function getCurrentStarURL(rating){
  var url = "http://www.wpclipart.com/signs_symbol/stars/5_star_rating_system/.cache/5_Star_Rating_System_"
  var number = rating.charAt(0);
  url += number;
  if (number == 1){
    url += "_star.png";
  } else {
    url += "_stars.png";
  }
  return url;
}

// returns the url of the dollar sign image to be used
function getCurrentCostURL(cost){
  var url = "https://i2.wp.com/i133.photobucket.com/albums/q59/MorphedGypsy/dollars_"
  var number = cost.charAt(0);
  url += number;
  url += ".jpg";
  return url;
}



