var express = require('express');
var app = express();
var server = require('http').Server(app);	
var io = require('socket.io')(server);

server.listen(3000, () => {
	console.log('port 3000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('/static'));

io.on('connection', socket => {
	console.log('user conected');

	socket.on('user', user => {
		console.log(user, socket.id);
	})

	socket.on('chat message', msg => {
		io.emit('chat message', msg);
	})

	socket.on('disconnect', () => {
		console.log('user disconected');
	})
})
