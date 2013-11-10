//Ports
var gprs_port = 3000;
var socketio_port = 5000;

//MODULES
var events = require('events'),	
	Net = require('net'),
	IO = require('socket.io'),
	mongo = require('./mongo');

//Open the connection with mongoDB
mongo.open_mongoClient();

//SOCKET.IO SERVER
var io = IO.listen(socketio_port);
console.log("Socket.io running on port " + socketio_port.toString() + "\n");
io.sockets.on('connection', function (socket) {
	//Client connected
	console.log("New socket.io client connected");
});

//TCP SERVER FOR AVL CONNECTIONS
var net = Net.createServer(handler);
net.listen(gprs_port, function(){
	console.log("TCP server running on port: " + gprs_port.toString()+ "\n"); 
});

function handler (socket) {
	//Function that handles the connection between the AVL and the server.
	//Handle incoming messages from avl.
	socket.on('data', function (data) {	
		encode(socket, data);    	
  	});
	//Remove the client from the list when it leaves
	socket.on('end', function () {  
		eventEmitter.emit('disconnected', socket.imei);
		console.log("Connection has been closed.");	
	});
	//Emitted once the socket is fully closed
	socket.on('close', function(){
		eventEmitter.emit('disconnected', socket.imei);
		console.log('Connection has been closed.')
	});
}

//Function that does everithing when a message is received.
function encode(socket, data) {
	console.log(data.toString());
	var date = get_date();
	var log = {'date': date['date'], 'time': date['time'], 'data': data.toString()};
	//Store data in mongodb
	mongo.push_data(log);
	////Send the data to socket.io
	io.sockets.emit('new data', data);
}

function get_date(){
	var today = new Date();
	var Dia = today.getDate();
	var Mes = today.getMonth() + 1;
	var Anio = today.getFullYear().toString().substring(2);
	var Hora = today.getHours();
	var Minutos = today.getMinutes();
	var Segundos = today.getSeconds();
	
	if(Dia<=9) {
		Dia = "0" + Dia;
	}
	if(Mes<=9){
		Mes = "0" + Mes;
	}
	if (Hora<=9){
		Hora = "0" + Hora;
	}
	if (Minutos<=9) {
		Minutos = "0" + Minutos;
	}
	if (Segundos<=9) {
		Segundos = "0" + Segundos;
	}
	var date = Dia.toString() + "/" + Mes.toString() + "/" + Anio;
	var time = Hora.toString() + ":" + Minutos.toString() + ":" + Segundos.toString();
	return {'date': date, 'time': time}
}
	


