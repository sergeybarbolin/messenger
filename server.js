const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);	
const io = require('socket.io')(server);

const users = {}

global.users = users;

server.listen(3000, () => {
	console.log('port 3000');
});

app.get('/', function (req, res) {
 	res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static(path.join(__dirname, 'static')));

io.on('connection', socket => {
	
	socket.on('login', (user, users = global.users) => {
		user.key = socket.id;
		users[socket.id] = user;
		io.emit('login', user, users);

		console.log(`${user.nickname} conected`);
	})

	socket.on('chat message', message => {
		io.emit('chat message', { value: message, user: global.users[socket.id] });
	})

	socket.on('disconnect', key => {
		// delete global.users[socket.id];
		io.emit('disconnect', socket.id);

		console.log(`${global.users[socket.id].nickname} disconnected`);
	})
})
