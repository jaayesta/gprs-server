var events = require('events');
var eventEmitter = new events.EventEmitter();

var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	Cursor = require('mongodb').Cursor;
	
//MONGO SETTINGS	
//mongo dharma.mongohq.com:10047/app19334171 -u <user> -p<password>	
var mongo_host = 'dharma.mongohq.com';
var mongo_port = 10047;
var mongo_user = 'pepe';
var mongo_user_password = 'pepeneitor';
var database_name = 'app19334171';

var io_server = require('./GPRSServer');

exports.open_mongoClient = function() {
	var mongoClient = new MongoClient(new Server(mongo_host, mongo_port, { auto_reconect: true}));
	mongoClient.open(function(err, mongoClient){
		if(!err){
			var db = mongoClient.db(database_name);
			db.authenticate(mongo_user, mongo_user_password, function(err, result) {
				//GPRS data
				eventEmitter.on('push_data', function(data){
					db.collection("gprs", function(err, collection){
						if (!err){
							collection.insert(data,{ w: 0 });
							console.log('Mongo: Guardado');
						}
						else{
							console.log('Error inserting data into mongo: ' + err.toString());
						}
					});
				});
				eventEmitter.on('close', function(){
					mongoClient.close();
				});
			});
		}
		else{
			console.log('No se pudo conectar a mongo: ' + err.toString());
		}
	});
}	

exports.push_data = function(data){
	eventEmitter.emit('push_data', data);
}