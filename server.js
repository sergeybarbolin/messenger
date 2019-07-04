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
		const searchUser = Object.values(users).find(item => item.nickname === user.nickname && item.name === user.name);
		
		if (searchUser) {
			users[socket.id] = searchUser;
			user = users[socket.id];
			delete users[searchUser.key];
		} else {
			users[socket.id] = user;
		}
		user.key = socket.id;
		user.online = true;

		const onlineUsers = Object.values(users).filter(item => item.online);

		io.emit('login', user, onlineUsers);

		console.log(`${user.nickname} conected`);
	})

	socket.on('chat message', message => {
		io.emit('chat message', { value: message, user: global.users[socket.id] });
	})

	socket.on('disconnect', key => {
		if (users[socket.id]) {
			users[socket.id].online = false;
			console.log(`disconnected ${users[socket.id].nickname}`);
		}
		io.emit('disconnect', socket.id);
		
	})
})
