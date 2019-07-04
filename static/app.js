const formSendMessage = document.querySelector('#send-message');
const input = formSendMessage.querySelector('#m');
const messages = document.getElementById('messages');
const usersList = document.getElementById('users');

let socket = null;

const formLogIn = document.querySelector('#log-in');

const formHandler = formIdentifier => {
    const form = document.querySelector(formIdentifier);
    const data = {};

    for (const el of form.children) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            data[el.getAttribute('name')] = el.value
        } 
    }
    
    return data;
}

const socketLogin = (socket, user) => {
	socket.emit('login', user);

	socket.on('chat message', message => {
	    const messageItem = document.createElement('li');

	    console.log(message);
	    messageItem.innerText = `${message.user.nickname}: ${message.value}`;
	    messages.append(messageItem);
	})

	socket.on('login', (user, users) => {
		const usersFragment = document.createDocumentFragment();

		users.forEach(user => {
			const userItem = document.createElement('li');

			userItem.setAttribute('data-key', user.key);
			userItem.innerText = user.name;
			usersFragment.append(userItem);
		})

		usersList.innerHTML = '';
		usersList.append(usersFragment);
	})

	socket.on('disconnect', key => {
		const disconnectedUser = usersList.querySelector(`li[data-key="${key}"]`);

		if (disconnectedUser) {
			disconnectedUser.remove();
		}
	})
}

formSendMessage.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat message', input.value);
    input.value = '';
    return false;
});

formLogIn.addEventListener('submit', e => {
    e.preventDefault();

    const formData = formHandler('#log-in');

    socket = io.connect('http://localhost:3000');
    socketLogin(socket, formData);

    return false;
});



