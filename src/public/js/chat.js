const socket = io();

const messagesDiv = document.getElementById('messages');
const inputField = document.getElementById('userInput');

// Receive Message from Bot
socket.on('bot-message', (msg) => {
    appendMessage(msg, 'bot-msg');
});

function sendMessage() {
    const text = inputField.value;
    if (text.trim() === '') return;

    appendMessage(text, 'user-msg');
    socket.emit('user-message', text);
    inputField.value = '';
}

function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', className);
    msgDiv.innerHTML = text.replace(/\n/g, '<br>'); // Convert newlines to breaks
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto scroll
}

// Allow Enter key to send
inputField.addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});