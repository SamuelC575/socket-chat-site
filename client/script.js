const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const userInput = document.getElementById('user-input');
const userButton = document.getElementById('user-button');
const lobbyInput = document.getElementById('lobby-input');
const lobbyButton = document.getElementById('lobby-button');
const container = document.getElementById('message-container');

let username = 'Guest';
let lobby = '1';

const socket = io();

// 🔹 On connect → join default lobby
socket.on('connect', () => {
    displayMessage(`Connected as ${socket.id}`, 'special');
    socket.emit('join-lobby', lobby);
});

// =======================
// SEND MESSAGE
// =======================
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Emit to server
    socket.emit('chat-message', message, username);

    // Show locally
    displayMessage(`You: ${message}`);

    messageInput.value = "";
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") sendMessage();
});

// =======================
// CHANGE USERNAME
// =======================
function handleChangeName(event) {
    if (event.type === "keydown" && event.key !== "Enter") return;

    const newName = userInput.value.trim();
    if (!newName) return;

    const oldName = username;
    username = newName;

    // Show locally
    displayMessage(`You changed your username to '${username}'`, 'system');

    // Notify server
    socket.emit('change-username', newName);

    userInput.value = "";
}

userButton.addEventListener('click', handleChangeName);
userInput.addEventListener('keydown', handleChangeName);

// =======================
// CHANGE LOBBY
// =======================
function handleLobbyChange(event) {
    if (event.type === "keydown" && event.key !== "Enter") return;

    const num = Number(lobbyInput.value);

    if (num > 0 && num < 11 && Number.isInteger(num)) {
        lobby = String(num);
        socket.emit('join-lobby', lobby);

        // Clear chat on lobby switch
        container.innerHTML = "";
        displayMessage(`Joined lobby ${lobby}`, 'system');
    } else {
        displayMessage("Invalid lobby (1–10 only)", 'system');
    }

    lobbyInput.value = "";
}

lobbyButton.addEventListener('click', handleLobbyChange);
lobbyInput.addEventListener('keydown', handleLobbyChange);

// receive
socket.on('chat-message', (message) => {
    if(message.startsWith("Server")) {
        displayMessage(message, 'system')
    } else {
        displayMessage(message,'chat')
    }
});

// display
function displayMessage(message, type="chat") {
    const div = document.createElement('div');
    div.textContent = message;

    if (type === "system") {
        div.style.backgroundColor = 'tan'; 
        div.style.color = 'black';           
        div.style.fontStyle = 'italic';
    } else if(type === "special") {
        div.style.backgroundColor = 'purple'; 
        div.style.color = 'white';           
        div.style.fontStyle = 'italic';
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}