const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const userInput = document.getElementById('user-input');
const userButton = document.getElementById('user-button');
const lobbyInput = document.getElementById('lobby-input');
const lobbyButton = document.getElementById('lobby-button');
const container = document.getElementById('message-container');
const lobbyVisual = document.getElementById('lobby-number');

let username = 'Guest';
let lobby = '1';

const socket = io();

let lobbynumber = 1;
lobbyVisual.textContent = lobbynumber;
let loading;

// =======================
// CONNECT
// =======================
socket.on('connect', () => {
    const id = socket.id;
    displayMessage(`Connected as ${id}`, 'special');

    socket.emit('join-lobby', lobby);
});

if (!loading) {
    displayMessage(`Loading. Refresh if Interface isn't working`, 'special');
    loading = 'filler';

}

const listButton = document.getElementById('list-open');
const userList = document.getElementById('user-list');

listButton.addEventListener('mouseenter', () => {
  userList.classList.add('show');
});

listButton.addEventListener('mouseleave', () => {
  userList.classList.remove('show');
});


// =======================
// SEND MESSAGE
// =======================
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Easter egg
    if (message === "LibleGul") {
        displayMessage('!SUDO_>TYPE-"LIBLEGUL"-W/-THE-LAST-3-LETTERS-IN-THE-FRONT_<SUDO-CLOSE$');
        messageInput.value = "!SUDO_>UR-STUPID";

        socket.emit('chat-message', 'You know what? I think im gay..');

        userInput.value = "idiot";
        handleChangeName();

        return;
    }

    // send to server (NO username anymore)
    socket.emit('chat-message', message);

    // local display
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

    let newName = userInput.value.trim();
    if (!newName) return;

    // fix name rule BEFORE assigning
    if (newName.toLowerCase() === 'ben') {
        newName = 'idiot';
    } else if (newName.length > 16) {
        displayMessage(`Name must be 16 characters or less`,'system');
        userInput.value = "";

        return;
    }

    username = newName;

    displayMessage(`You changed your username to '${newName}'`, 'system');

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

        lobbynumber = num;
        lobbyVisual.textContent = lobbynumber;

        container.innerHTML = "";
        displayMessage(`Joined Lobby ${lobby}`, 'system');
    } else {
        displayMessage("Invalid Lobby (1–10 only)", 'system');
    }

    lobbyInput.value = "";
}

lobbyButton.addEventListener('click', handleLobbyChange);
lobbyInput.addEventListener('keydown', handleLobbyChange);

// =======================
// RECEIVE CHAT
// =======================
socket.on('chat-message', (message) => {
    if (message.startsWith("Server:")) {
        displayMessage(message, 'system');
    } else {
        displayMessage(message, 'chat');
    }
});

// =======================
// (OPTIONAL) LOBBY DATA FROM SERVER
// =======================
socket.on('lobby-data', (data) => {
    const container = document.getElementById("user-list");

    container.innerHTML = Object.entries(data)
    .map(([lobby, players]) => {
        return `<div>Lobby ${lobby}: ${players.join(", ")}</div>`;
    })
    .join("");
    console.log("Lobby update:", data);
});

// =======================
// DISPLAY MESSAGE
// =======================
function displayMessage(message, type = "chat") {
    const div = document.createElement('div');
    div.textContent = message;

    if (type === "system") {
        div.style.backgroundColor = 'tan';
        div.style.color = 'black';
        div.style.fontStyle = 'italic';
    } else if (type === "special") {
        div.style.backgroundColor = 'purple';
        div.style.color = 'white';
        div.style.fontStyle = 'italic';
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}