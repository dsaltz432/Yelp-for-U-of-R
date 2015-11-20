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

	// creates a table in the database if it doesn't already exist
	db.run("CREATE TABLE if not exists users_table "+
		"(username TEXT NOT NULL,password TEXT NOT NULL,PRIMARY KEY (username))");

	db.run("CREATE TABLE if not exists places_table "+
		"(username TEXT NOT NULL,place TEXT NOT NULL, CONSTRAINT place_primary PRIMARY KEY (username,place))");

	// Reading user login attempts
	app.get('/users/*', function (req, res) {
		var myUsername = req.query.username.trim();
		var myPassword = req.query.password.trim();
		var resultString = "";

		if (!myUsername && !myPassword){
			res.send("Enter the required fieldsN");
		} else if (!myUsername){
			res.send("Enter your usernameN");
		} else if (!myPassword){
			res.send("Enter your passwordN");
		} else {
			//assumes that there cannot be duplicate usernames
			db.all("SELECT * FROM users_table WHERE username = ?" +
			" AND password = ?", [myUsername,myPassword] ,function(err,row){
				if (row.length < 1){ // checks for empty list
					res.send("Either you typed incorrect information, "+
					 "or you have not yet created an account. To create a "+ 
					 "new account, enter your desired username and password, "+
					 "and click Create New Account.N");	
				} else {
					res.send("Logging you in!Y");
				}
			});
		}
	});

	// Creating new account
	app.post('/users', function (req, res) {
		var postBody = req.body;
		var myUsername = postBody.username.trim();
		var myPassword = postBody.password.trim();
		var resultString = "";

		if (!myUsername && !myPassword){
			res.send("Enter the required fieldsN");
		} else if (!myUsername){
			res.send("Enter your usernameN");
		} else if (!myPassword){
			res.send("Enter your passwordN");
		} else {
			// making sure username and passwords are valid
			if (myPassword.length < 7){
				res.send("Your password must be longer than 7 characters");
			} else {
				
				db.run("INSERT INTO users_table VALUES (?,?)",[myUsername,myPassword], function(err, row) {
					if (err != null){
						res.send("Failed to create new accountN");
					} else {
						res.send("Your created a new account!Y");
					}
				});	
			}
		}
	});
});

	// Reading user login attempts
	app.post('/places/', function (req, res) {
		var postBody = req.body;
		var place = postBody.place.trim();
		var username =  postBody.username.trim();

		if (!place){
			res.send("Enter a place");
		}
		else {
			console.log("place");
			db.run("INSERT INTO places_table VALUES (?,?)",[username, place], function(err, row) {
				if (err != null){
					res.send("Failed to add place");
				} else {
					res.send("Place added!");
				}
			});	
		}
	});

// starting web server
var server = app.listen(3000, function () {
  	var port = server.address().port;
  	console.log('Server started at http://localhost:%s/', port);
});
