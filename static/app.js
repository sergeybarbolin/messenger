const form = document.querySelector('form');
const input = form.querySelector('#m');
const messages = document.querySelector('#messages');
const user = 'sergey';

form.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat message', input.value);
    input.value = '';
    return false;
});

socket.emit('user', user);

socket.on('chat message', msg => {
    const message = document.createElement('li');

    message.innerText = msg;
    messages.append(message);
})