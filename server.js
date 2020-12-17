const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8000;
const connections = [];
// [{caller: 12345, room: 0, receiver: 6789},{caller: abcd, room: connections.length}]

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	socket.on('hello world', (peerId) => {
		console.log('a user is connected', peerId);
		//check if there is an object in the array if the array is empty, create an object with the current peer-id set as the caller and the room set to 0. if the arry isn't empty check if the last object has a caller and a receiver. If no receiver, set the current peer-id as the receiver. if the last object does have a caller and receiver, then create a new object with the current peer-id as the caller and set the room to the next room.

		if (!connections.length || connections[connections.length - 1].receiver) {
			const newConnection = {
				caller: peerId,
				room: 'room' + connections.length,
			};
			connections.push(newConnection);
			socket.join(newConnection.room);
			io.to(newConnection.room).emit('unpaired caller');
		} else {
			connections[connections.length - 1].receiver = peerId;
			socket.join(connections[connections.length - 1].room);
			io.to(connections[connections.length - 1].room).emit(
				'receiver joined',
				connections[connections.length - 1]
			);
		}
		console.log(connections);
	});
	socket.on('disconnect', () => {
		console.log('a user has disconnected');
	});
	socket.on('error', (err) => {
		console.log(err);
	});
});

http.listen(port, () => {
	console.log(`listening on port ${port}`);
});
