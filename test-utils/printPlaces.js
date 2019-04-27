// printing all elements from database.db
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("users.db");

db.serialize(function() {
	db.each("SELECT rowid AS id,username,place,comment,time,cost,rating FROM places_table", function(err, row) {
		console.log(row.id + ": Username: " + row.username +
		 "   place: " + row.place + "   comment: " + row.comment + 
		 "   cost: " + row.cost + "   rating: " + row.rating + 
		 "   time: " + row.time);
	});
});

db.close();
