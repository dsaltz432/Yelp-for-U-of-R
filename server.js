var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('static_files'));

// importing sqlite and creating the database
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("users.db");

db.serialize(function() {

/***********************************************
		Creating tables in users.db database
************************************************/

	// creates a table in the database if it doesn't already exist
	db.run("CREATE TABLE if not exists users_table "+
		"(username TEXT NOT NULL,password TEXT NOT NULL,PRIMARY KEY (username))");

	db.run("CREATE TABLE if not exists places_table "+
		"(username TEXT NOT NULL,place TEXT NOT NULL,comment TEXT NOT NULL,rating TEXT NOT NULL,"+
			"cost TEXT NOT NULL,time TEXT NOT NULL, CONSTRAINT place_key PRIMARY KEY (username, time))");

	db.run("CREATE TABLE if not exists place_info_table " +
			"(place TEXT NOT NULL, address TEXT, link TEXT, PRIMARY KEY (place))"
		);

/***********************************************
	Handling requests from accounts.html
************************************************/

	// "Log In" clicks
	app.get('/users/*', function (req, res) {
		var myUsername = req.query.username;
		var myPassword = req.query.password;
		if (!myUsername && !myPassword){ res.send("Enter the required fields");}
		else if (!myUsername){res.send("Enter your username");}
		else if (!myPassword){res.send("Enter your password");}
		else {
			db.all("SELECT * FROM users_table WHERE username = ?" +
			" AND password = ?", [myUsername,myPassword], function(err,row){
				if (row.length < 1){ // checks for empty list
					res.send("Either you typed incorrect information, "+
					 "or you have not yet created an account. To create a "+ 
					 "new account, enter your desired username and password, "+
					 "and click Create New Account.");	
				} else {
					res.send("Logging you in!");
				}
			});
		}
	});

		// "Sign Up" clicks
	app.post('/users', function (req, res) {
		var postBody = req.body;
		var myUsername = postBody.username;
		var myPassword = postBody.password;

		if (!myUsername && !myPassword){ res.send("Enter the required fields");}
		else if (!myUsername){ res.send("Enter your username");}
		else if (!myPassword){ res.send("Enter your password");}
		else if (myUsername.indexOf("#") > -1) {res.send("Hashtags are not allowed in username");}
		else if (myUsername.indexOf(".") > -1) {res.send("Periods are not allowed in username");}
		else {
			// making sure username and passwords are valid
			if (myPassword.length < 7){
				res.send("Your password must be longer than 7 characters");
			} else {	
				db.run("INSERT INTO users_table VALUES (?,?)",[myUsername,myPassword], function(err, row) {
					if (err != null){ res.send("Failed to create new account");}
					else { res.send("You created a new account!");}
				});	
			}
		}
	});


/***********************************************
	Handling requests from restaurants.html
************************************************/

	app.get("/restaurants/", function (req, res) {
		db.all("SELECT place FROM place_info_table", function(err, row) {
			if (err!= null) { res.send("ERROR"); }
			else { res.send(row); }
		});
	});

	app.get("/restaurants/*", function (req, res){
		var rest= req.params[0];
		db.all("SELECT * FROM place_info_table where place = ?", [rest], function(err, row){
			if (err!= null) { res.send("ERROR"); }
			else { res.send(row); }
		});
	});

	app.get("/restaurantComments/*", function (req, res){
		var rest= req.params[0];
		db.all("SELECT * FROM places_table where place = ?", [rest], function(err, row){
			if (err!= null) { res.send("ERROR"); }
			else { res.send(row); }
		});
	});


/***********************************************
	Handling requests from the home page (index.html)
************************************************/

	// outputing top places on home page
	app.get('/home', function (req, res) {
		db.all("SELECT * FROM places_table" ,function(err,row){
			if (err == null){ res.send(row);}
			else { res.send("An error occurred."); }
		});
	});

/***********************************************
	Handling requests multiple html files
************************************************/
// any page --> search bar functionality
// from index.html --> when place link is clicked
// from profile.html --> when place link is clicked
	app.get('/places/*', function (req, res) {
		var myPlace = req.params[0];
		db.all("SELECT * FROM places_table WHERE place = ?", [myPlace] ,function(err,row){
			if (err != null){ res.send("An error occurred.") }
			else if (row.length < 1){ res.send("0");}
			else { res.send(row);}	
		});
	});


/***********************************************
	Handling requests profile.html
************************************************/

	// runs on any page load
	app.get('/profile/*', function (req, res) {
		var myUsername = req.params[0];
		db.all("SELECT * FROM places_table WHERE username = ?",
		 [myUsername] ,function(err,row){
			if (err != null){ res.send("An error occurred.") }
			else { res.send(row);}	
		});
	});

	// returns the row of the element to be updated
	app.get('/fillForm/', function (req, res) {
		var myTime = req.query.time;
		var myUsername = req.query.username;
		db.all("SELECT * FROM places_table WHERE time = ? AND username = ?",
		 [myTime,myUsername] ,function(err,row){
			if (err != null){ res.send("An error occurred."); }
			else { res.send(row);}	
		});
	});

	// "Update" button clicked inside of update form
	app.post('/update', function (req, res) {
		var postBody = req.body;
		var place = postBody.place;
		var username = postBody.username;
		var comment = postBody.comment;
		var rating = postBody.rating;
		var cost = postBody.cost;
		var oldTime = postBody.time;

		if (!comment || !rating || !cost){
			if (!comment){ res.send("Enter a commentN"); }
			else if (!rating){ res.send("Enter a ratingN"); }
			else if (!cost){ res.send("Enter a costN"); }
		} else {
			db.run("UPDATE places_table SET " + 
				"comment = ?, rating = ?, cost = ? " + 
				"WHERE (time = ? AND username = ?)", [comment,rating,cost,oldTime,username], function(err, row) {
				if (err != null){ res.send("Failed to update placeN");}
				else { 
					var bob=null;
					db.all("SELECT * FROM places_table WHERE (time = ? AND username = ?)", [oldTime, username], function(err, row) {
						if (err != null){ res.send("Failed to update placeN");}
						else { res.send(row);}
					});
				 }
			});	
		}
	});

// "Delete" button clicked inside of update form
	app.post('/delete', function (req, res) {
		var postBody = req.body;
		var myUsername = postBody.username;
		var myTime = postBody.time;

		db.run("DELETE FROM places_table WHERE " + 
			"time = ? AND username = ?", [myTime,myUsername], function(err, row) {
			if (err != null){ res.send("Failed to update placeN"); }
			else { res.send("Deleted!"); }
		});	
	});

/***********************************************
	Handling requests from newplace.html
************************************************/

	// "Add" button clicked
	app.post('/places', function (req, res) {
		var postBody = req.body;
		var place = postBody.place;
		var username = postBody.username;
		var comment = postBody.comment;
		var rating = postBody.rating;
		var cost = postBody.cost;
		var address=postBody.address;
		var time = getDay();

		if (!place || !comment || !rating || !cost){
			if (!place){ res.send("Enter a place"); } 
			else if (!comment){ res.send("Enter a comment"); }
			else if (!rating){ res.send("Enter a rating"); }
			else if (!cost){ res.send("Enter a cost"); }
		} else {
			db.all("SELECT * FROM place_info_table WHERE place = ?", [place], function(err, row) {
				if (row.length==0 && address=="") { res.send("none");}
				else {
					db.run("INSERT INTO places_table VALUES (?,?,?,?,?,?)",
					[username,place,comment,rating,cost,time], function(err, row) {
						if (err != null){ res.send("Failed to add place");}
						else { 
							db.run("INSERT INTO place_info_table VALUES(?,?,NULL)", [place,address], function(err,row){});
							res.send("Place added!"); }
					});
				}
			});
		}
	});


});


/***********************************************
     Helper JavaScript functions
************************************************/

function getCurrentStarURL(rating){
  var url = "http://www.wpclipart.com/signs_symbol/stars/5_star_rating_system/.cache/5_Star_Rating_System_";
  var number = rating.charAt(0);
  url += number;
  url += "_stars.png";
  return url;
}

function getCurrentCostURL(cost){
  var url = "https://i2.wp.com/i133.photobucket.com/albums/q59/MorphedGypsy/dollars_";
  var number = cost.charAt(0);
  url += number;
  url += ".jpg";
  return url;
}

function getDay(){
	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec  = today.getSeconds();

    if (dd < 10){
        dd = '0' + dd;
    } 
    if (mm < 10){
        mm = '0' + mm;
    } 
    var today = mm+'/'+dd+'/'+yyyy+" "+hour+":"+min+":"+sec;
    return today;
}

/* starting web server */
var server = app.listen(3000, function () {
  	var port = server.address().port;
  	console.log('Server started at http://localhost:%s/', port);
});
