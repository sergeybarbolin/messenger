const formSendMessage = document.querySelector('#send-message');
const inputMessage = formSendMessage.querySelector('#m');
const messagesList = document.getElementById('messages');
const usersList = document.getElementById('users');
const formLogIn = document.querySelector('#log-in');

const currentUserTamplate = document.querySelector('.user--current');
const currentUserNameTamplate = currentUserTamplate.querySelector('.user__name');
const countUsersTamplate = document.querySelector('.users__count');
const usersTitle = document.querySelector('.users__title');

let socket = null;
let currentUser = null;

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

	    messageItem.innerText = `${message.user.nickname}: ${message.value}`;
	    messagesList.append(messageItem);

	})

	socket.on('login', (user, users, messages) => {
		if (user.key === socket.id) {
			currentUser = user;
			currentUserNameTamplate.innerText = currentUser.name;
			countUsersTamplate.innerText = users.length
			usersTitle.classList.remove('hidden');
		}

		const usersFragment = document.createDocumentFragment();

		users.forEach(user => {
			const userItem = document.createElement('li');

			userItem.setAttribute('data-key', user.key);
			userItem.innerText = user.name;
			usersFragment.append(userItem);
		})

		usersList.innerHTML = '';
		usersList.append(usersFragment);

		if (messages) {
			const messagesFragment = document.createDocumentFragment();

			messages.forEach(message => {
			    const messageItem = document.createElement('li');

			    messageItem.innerText = `${message.user.name}: ${message.value}`;
			    messagesFragment.append(messageItem);
			})

			messagesList.innerHTML = '';
		    messagesList.append(messagesFragment);
		}
	})

	socket.on('disconnect', (key, messages, users) => {
		const disconnectedUser = usersList.querySelector(`li[data-key="${key}"]`);
		console.log(users);

		if (disconnectedUser) {
			disconnectedUser.remove();
		}

		users.forEach(user => {
			const usersFragment = document.createDocumentFragment();
			const userItem = document.createElement('li');

			userItem.setAttribute('data-key', user.key);
			userItem.innerText = user.name;
			usersFragment.append(userItem);
		})

		if (messages) {
			const messagesFragment = document.createDocumentFragment();

			messages.forEach(message => {
			    const messageItem = document.createElement('li');

			    messageItem.innerText = `${message.user.name}: ${message.value}`;
			    messagesFragment.append(messageItem);
			})

			messagesList.innerHTML = '';
		    messagesList.append(messagesFragment);
		}
	})
}

formSendMessage.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat message', { value: inputMessage.value, user: currentUser } );
    inputMessage.value = '';
    return false;
});

formLogIn.addEventListener('submit', e => {
    e.preventDefault();

    const formData = formHandler('#log-in');

    socket = io.connect('http://localhost:3000');
    socketLogin(socket, formData);

    return false;
});



