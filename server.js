const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);	
const io = require('socket.io')(server);

const users = {}
const messages = [];

global.users = users;
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
		if (!Object.keys(users).length || !users[user.nickname]) {
			users[user.nickname] = user;
		} else if (users[user.nickname].nickname === user.nickname && users[user.nickname].name === user.name) {
			// users[user.nickname].nickname = user.nickname;
			// users[user.nickname].name = user.name;
		} else {
			console.log('Имя не совпадает с ником');
			return;
		}
		console.log(`${user.nickname} conected`);
		users[user.nickname].key = socket.id;
		users[user.nickname].online = true;

		const onlineUsers = Object.values(users).filter(item => item.online);
		const filterMessages = global.messages.filter(msg => users[msg.user.nickname].online);

		io.emit('login', users[user.nickname], onlineUsers, filterMessages);
	})

	socket.on('chat message', message => {
		global.messages.push(message);

		io.emit('chat message', message);	
	})

	socket.on('change img', (user, img) => {
		global.users[user].img = img;
		global.messages.forEach(msg => {
			if (msg.user.nickname === user) {
				msg.user.img = img;
			}
		});

		socket.broadcast.emit('change img', global.users[user], img);
	})

	socket.on('disconnect', (key, messages, users = global.users) => {
		const userDdisconnected = Object.values(users).find(item => item.key === socket.id);

		if (userDdisconnected) {
			global.users[userDdisconnected.nickname].online = false;
		}

		const onlineUsers = Object.values(users).filter(item => item.online);
		const filterMessages = global.messages.filter(msg => users[msg.user.nickname].online);

		io.emit('disconnect', socket.id, filterMessages, onlineUsers);
		
	})
})
