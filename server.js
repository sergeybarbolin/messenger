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
		Object.values(users).forEach(item => {
			if (item.nickname === user.nickname && item.name === user.name) {
				users[socket.id] = item;
				user = users[socket.id];

				// console.log(users[socket.id]);
				delete users[item.key];
				return;
			} else if(item.nickname === user.nickname && item.name !== user.name) {
				console.log('err');
			} else {
				users[socket.id] = user;
			}
		});

		console.log(user);

		user.key = socket.id;
		user.online = true;

		onlineUsers = Object.values(users).filter(item => item.online);

		const filterMessages = global.messages.filter(msg => !!onlineUsers.find(item => item.nickname === msg.user));

		io.emit('login', user, onlineUsers, filterMessages);

		console.log(`${user.nickname} conected`);
	})

	socket.on('chat message', (message, messages = global.messages) => {
		global.messages.push({ value: message, user: global.users[socket.id].nickname });

		io.emit('chat message', { value: message, user: global.users[socket.id] });
	})

	socket.on('disconnect', (key, messages) => {
		if (users[socket.id]) {
			users[socket.id].online = false;
			console.log(`disconnected ${users[socket.id].nickname}`);
		}
		onlineUsers = Object.values(users).filter(item => item.online);

		const filterMessages = global.messages.filter(msg => !!onlineUsers.find(item => item.nickname === msg.user));
		
		io.emit('disconnect', socket.id, filterMessages);
		
	})
})
