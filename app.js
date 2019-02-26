/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path');


//Global variables
var app = express();
var ids;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var DB_URL="mongodb://root:student@ds111476.mlab.com:11476/mongo_project";

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Grid Fs Global Variable
var mongo = require('mongodb');
var grid_display = require('gridfs');
var Server = mongo.Server,
db=mongo.Db,
ObjectID=mongo.ObjectID;

//development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/new', function(req,res){

	var id = req.query.id;
	ids=id;

	MongoClient.connect(DB_URL, function(err, db) {
		if(!err) {
			var collection = db.collection('Restaurants');
			console.log(id);
			collection.find({"_id": new ObjectId(id)}).limit(1).toArray(function (err, result) {
				var st = JSON.stringify(result);
				console.log(result);
				var array= Array.from(result);
				if (err) {
					res.send(err);
				} else if (result.length) {
					res.render('new',{

						RestaurantsDetails : array[0]
					});
				} else {
					res.render('nodocument');
				}
			});

		}
	});
});
app.get('/success',function(req,res){

	res.render('success');

});

//search and mongo
app.post('/try', function(req, res){

	var search_text = req.body.search_text;
	console.log('restaurant : ' +search_text );
	
// method to implement the search for the restaurant
	MongoClient.connect(DB_URL, function(err, db) {
		if(!err) {
			console.log("We are connected");

			var collection = db.collection('Restaurants');
			var str = "\\b" + search_text;
			collection.find({Name: {$regex: new RegExp(str, "i")}}).limit(20).toArray(function (err, result) {
				var st = JSON.stringify(result);
				db.close(); //close the connection
				console.log(result);
				if (err) {
					res.send(err);
				} else if (result.length) {
					res.render('thankyou',{

						"Restaurentslist" : result
					});
				} else {
					res.render('nodocument');
				}
			});

		}
	});	 	 	 		
});//close search mongo restaurants

//method to search restaurant using the Geo location

app.get('/geo', function(req, res){
	MongoClient.connect(DB_URL, function(err, db) {
		if(!err) {
			var collection = db.collection('Restaurants');
			console.log("working till here"); 	      
			collection.find({ loc: { $near: { $geometry: { type: "Point", coordinates: [ 8.74466, 50.40037 ]}, $maxDistance: 400000}}}).limit(10).toArray(function (err, result) {
				db.close();// close the connection

				if (err) {
					res.send(err);
				} 
				else if (result.length) {
					res.render('thankyou',{"Restaurentslist" : result});
				}
				else {
					res.render('nodocument');
				}
			});
		}
	});	 	 	 		
}); // close geo search query

//Query for update
app.post('/update', function(req, res){

	var comment = req.body.Update_Comment;

	MongoClient.connect(DB_URL, function(err, db) {
		if(!err) {

			var collection = db.collection('Restaurants');
			var status = collection.update({_id: new ObjectId(ids)},{ $push : {Recommended: comment}},function (err, result) {
				console.log("Updated"); 
				if (err) {
					res.send(err);
				}
				else {
					MongoClient.connect(DB_URL, function(err, db) {
						if(!err) {
							var collection = db.collection('Restaurants');
							collection.find({"_id": new ObjectId(ids)}).limit(1).toArray(function (err, result) {
								console.log(result);
								var array= Array.from(result);
								db.close();
								Rest= array[0];  
								if (err) {
									res.send(err);
								} 
								else if (result.length) {
									res.render('new',{RestaurantsDetails : array[0]});
								} 
								else {
									res.send('No documents found');
								}
							});
						}
					});
				}//else
			});
		}
	});	 	 	 		
}); // update and display comment

//search Image using GridFs
app.get('/file/:filename', function(req, res){

	MongoClient.connect(DB_URL, function(err, db) {

		var gridfs =  grid_display(db,mongo);
		gridfs.collection('fs'); 
		gridfs.files.find({filename: req.params.filename}).toArray(function(err, image_files){
			if(image_files.length === 0 || !image_files ){

				res.render('nodocument');//redirect to no document jade

			}
			var read_data = gridfs.createReadStream({
				filename: image_files[0].filename,
				root: "fs"
			});
			res.set('Content-Type', image_files[0].contentType)
			return read_data.pipe(res);
		});

	});
});//close gridfs fetching image

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});