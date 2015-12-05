// printing all elements from database.db
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("users.db");

db.serialize(function() {
	db.run("DELETE FROM users_table");
});

db.close();
