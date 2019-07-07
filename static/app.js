const formSendMessage = document.querySelector('#send-message');
const inputMessage = formSendMessage.querySelector('#m');
const messagesList = document.getElementById('messages');
const usersList = document.getElementById('users');
const popupLogIn = document.querySelector('#popup-login');
const formLogIn = document.querySelector('#log-in');

const currentUserTamplate = document.querySelector('.user--current');
const currentUserNameTamplate = currentUserTamplate.querySelector('.user__name');
const countUsersTamplate = document.querySelector('.users__count');
const usersTitle = document.querySelector('.users__title');
const userImg = document.getElementById('user-img');

const popupFileLoad = document.querySelector('#popup-file-load');
const fileReader = new FileReader();
const dropZone = document.getElementById('drop_zone');

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

const formClear = formIdentifier => {
    const form = document.querySelector(formIdentifier);

    for (const el of form.children) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = '';
        } 
    }
}


// Смена изображения
const handleFileSelect = e => {
	e.stopPropagation();
	e.preventDefault();

	const [file] = e.dataTransfer.files;

	if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
		alert('Файл должен иметь расширение jpg/png');
	} else if (file.size > 1024 * 1024 * 2) {
		alert('Файл не должен быть больше 2мб');
	} else {
		fileReader.readAsDataURL(file);
	}

	
}

const handleDragOver = e => {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

const changeUserImg = (nickname, url) => {
	const images = document.querySelectorAll(`img[data-user="${nickname}"]`);

	for (let img of images) {
		img.setAttribute('src', url);
	}
}

fileReader.addEventListener('load', () => {
	dropZone.innerHTML = `
		<img src="${fileReader.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="${currentUser.nickname}"/>
	`;
	currentUser.img = fileReader.result;
})

dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false); 

// Работа с сообщениями
const createMessage = message => {
	const messageItem = document.createElement('li');
	const userImg = message.user.img ? message.user.img : 'static/img/nophoto.jpg';
	const userImgAlt = message.user.img ? message.user.nickname : 'No photo';

	messageItem.innerHTML = `
		<div class="user">
			<div class="user__img">
				<img data-user="${message.user.nickname}" src="${userImg}" alt="${userImgAlt}">
			</div>
			<div class="user-message">
				<span class="user-message__name">${message.user.name}</span>
				<span class="user-message__date">${message.date}</span>
				<p class="user-message__value">${message.value}</p>
			</div>
		</div>
	`;

	return messageItem;
}
 
const renderMessages = (messages, messagesList) => {
	const messagesFragment = document.createDocumentFragment();

	messages.forEach(message => {
		const messageItem = createMessage(message);
		messagesFragment.append(messageItem);
	})

	messagesList.innerHTML = '';
	messagesList.append(messagesFragment);

	return true;
}

formSendMessage.addEventListener('submit', e => {
    e.preventDefault();

	const date = new Date().toLocaleString();

    socket.emit('chat message', { value: inputMessage.value, user: currentUser, date } );
    inputMessage.value = '';
    return false;
});

// Работа с пользователями
const renderUsers = (users, usersList) => {
	const usersFragment = document.createDocumentFragment();

	users.forEach(user => {
		const userItem = document.createElement('li');

		userItem.setAttribute('data-key', user.key);
		userItem.innerText = user.name;
		usersFragment.append(userItem);
	})

	usersList.innerHTML = '';
	usersList.append(usersFragment);
}

formLogIn.addEventListener('submit', e => {
    e.preventDefault();

    const formData = formHandler('#log-in');

    socket = io.connect('http://localhost:3000');

	for (let item in formData) {
		if (!formData[item]) {
			alert('Поля не должны быть пусты!');
			return;
		}
	}
    socketLogin(socket, formData);

    return false;
});

// Работа с socet
const socketLogin = (socket, user) => {
	socket.emit('login', user);
	formClear('#log-in');

	userImg.addEventListener('click', e => {
		popupFileLoad.classList.add('popup--visible');
	})

	popupFileLoad.addEventListener('click', e => {
		const nameBtn = e.target.getAttribute('name');

		if (e.target.nodeName === 'BUTTON' && nameBtn === 'load') {
			changeUserImg(currentUser.nickname, currentUser.img);
			socket.emit('change img', currentUser.nickname, currentUser.img);
		}


		if (e.target.nodeName === 'BUTTON') {
			popupFileLoad.classList.remove('popup--visible');
			dropZone.innerHTML = 'Перетащите сюда фото';
		}
	})

	socket.on('change img', (user, img) => {
		changeUserImg(user.nickname, img);
	})

	socket.on('chat message', message => {
	    const messageItem = createMessage(message);

	    messagesList.append(messageItem);
	})

	socket.on('login', (user, users, messages) => {
		if (user.key === socket.id) {
			currentUser = user;

			if (currentUser.img) {
				userImg.setAttribute('src', currentUser.img);
				userImg.setAttribute('alt', currentUser.nickname);
			}

			currentUserNameTamplate.innerText = currentUser.name;
			userImg.setAttribute('data-user', currentUser.nickname);
			countUsersTamplate.innerText = users.length

			usersTitle.classList.remove('hidden');
			popupLogIn.classList.remove('popup--visible');
		}

		renderUsers(users, usersList);

		if (messages) {
			renderMessages(messages, messagesList);
		}
	})

	socket.on('disconnect', (key, messages, users) => {
		const disconnectedUser = usersList.querySelector(`li[data-key="${key}"]`);

		if (disconnectedUser) {
			disconnectedUser.remove();
		}

		if (messages) {
			renderMessages(messages, messagesList);
		}
	})
}