const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);	
const io = require('socket.io')(server);

const users = {}
let onlineUsers = [];
const messages = [];

global.users = users;
global.onlineUsers = onlineUsers;
global.messages = messages;

server.listen(3000, () => {
	console.log('port 3000');
});

app.get('/', function (req, res) {
 	res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static(path.join(__dirname, 'static')));

io.on('connection', socket => {
	
	socket.on('login', (user, users = global.users, messages) => {
		if (!Object.keys(users).length || !users[user.nickname] || users[user.nickname].nickname === user.nickname && users[user.nickname].name === user.name) {
			users[user.nickname] = user;
			console.log(`${user.nickname} conected`);
			user.key = socket.id;
			user.online = true;

			onlineUsers = Object.values(users).filter(item => item.online);

			const filterMessages = global.messages.filter(msg => users[msg.user.nickname].online);
			io.emit('login', user, onlineUsers, filterMessages);
		} else {
			console.log('Имя не совпадает с ником');
		}
	})

	socket.on('chat message', message => {
		global.messages.push(message);

		io.emit('chat message', message);
	})

	socket.on('disconnect', (key, messages) => {
		if (users[socket.id]) {
			users[socket.id].online = false;
			console.log(`disconnected ${users[socket.id].nickname}`);
		}
		onlineUsers = Object.values(users).filter(item => item.online);

		const filterMessages = global.messages.filter(msg => users[msg.user.nickname].online);
		
		io.emit('disconnect', filterMessages);
		
	})
})
