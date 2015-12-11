// printing all elements from database.db
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("users.db");

db.serialize(function() {
	// prints each element in the databse to the console
	db.each("SELECT rowid AS id, place FROM place_info_table", function(err, row) {
		console.log(row.id + ": Place: " + row.place);
	});
});
db.close();
