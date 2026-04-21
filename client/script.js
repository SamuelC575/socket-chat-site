// document.addEventListener("contextmenu", e => e.preventDefault());




const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const userInput = document.getElementById('user-input');
const userButton = document.getElementById('user-button');
const lobbyInput = document.getElementById('lobby-input');
const lobbyButton = document.getElementById('lobby-button');
const container = document.getElementById('message-container');
const lobbyVisual = document.getElementById('lobby-number');

let curse;
let quit;
let nameTaken;

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

socket.on('kick', () => {
    socket.emit('server',`User '${username}' has been kicked!`)
    socket.disconnect()
})

if (!loading) {
    displayMessage(`Loading, Refresh if Interface isn't working. Send '/guide' for a guide`, 'special');
    loading = 'filler';

}

// Change Theme
document.getElementById('beach-change').onclick = () => {
    setTheme('theme-beach');
}

document.getElementById('dark-change').onclick = () => {
    setTheme('theme-dark');
}

document.getElementById('sunset-change').onclick = () => {
    setTheme('theme-sunset');
}

document.getElementById('neon-change').onclick = () => {
    setTheme('theme-neon');
}

document.getElementById('classic-change').onclick = () => {
    setTheme('theme-classic');
}

const THEMES = ['theme-beach','theme-dark','theme-sunset','theme-neon','theme-classic']
function setTheme(newTheme) {
    document.body.classList.remove(...THEMES);

    document.body.classList.add(newTheme)
}

// Show Settings Panel

const settingsButton = document.getElementById('settings-open');
const settingsPanel = document.getElementById('settings-panel');

let showPanel = false;

settingsButton.addEventListener('click', () => {
    showPanel = !showPanel;

    if (showPanel) {
        settingsPanel.classList.add('show');
    } else {
        settingsPanel.classList.remove('show');
    }
});

// Show Player List
const listButton = document.getElementById('list-open');
const userList = document.getElementById('user-list');

let showList;
if (!showList) {
    showList = false
}
listButton.addEventListener('click', () => {
    showList = !showList
})

listButton.addEventListener('mouseenter', () => {
    userList.classList.add('show');
});

listButton.addEventListener('mouseleave', () => {
    if (!showList) {
        userList.classList.remove('show');
    }
});


// Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// =======================
// SEND MESSAGE
// =======================
async function sendMessage() {
    let message = messageInput.value.trim();
    if (!message) return;

    const FIRSTSIX = message.substring(0,6)
    const FIRSTFIVE = message.substring(0,5)
    const FIRSTFOUR = message.substring(0,4)


    // Easter egg
    if (message === "gullible") {
        displayMessage('Look Up! The roof says "gullible!"');
        messageInput.value = "im stupid!";

        socket.emit('chat-message', 'You know what? I think im gay..');

        userInput.value = "Einstein";
        return;
    }

    if (message.startsWith("!kick: ")) {
        let parts = message.substring(7).split(" ");
        let code = parts[0];
        let kickUser = parts[1];

        console.log(kickUser)
        console.log(code)
        console.log(socket.id)
        
        
        socket.emit('kick', kickUser, code, socket.id);
        return;
    }

    if (message === '/guide') {
        displayMessage('Click the Question Mark Button on the Left Side','special');
        return;
    } else if (FIRSTFOUR === 'stfu') {
        curse = true;
        socket.emit('log',`${username}: ${message}`)
        message = 'I love you!'
    } else if (FIRSTSIX.toLowerCase() === 'nigger') {
        curse = true;
        socket.emit('log',`${username}: ${message}`)
        message = "I'm extremely unfunny and deserve to die"
    } else if (FIRSTFIVE.toLowerCase() === 'nigga') {
        curse = true;
        socket.emit('log',`${username}: ${message}`)
        message = "I'm gay and forever will be lonely"
    } else if (FIRSTFOUR.toLowerCase() === 'fuck') {
        socket.emit('log',`${username}: ${message}`)
        message = "I like boys!"
        curse = true;
    }



    if (quit === true) {
        return;
    }

    if (curse === true) {
        socket.emit('chat-message', message);
        displayMessage("Please don't curse. Your precious life isn't worth wasting over malicious language. Please turn to God 🙏")
        await sleep(7000);
        window.location.href = "https://www.youtube.com/watch?v=9RKEuV7-uKA&pp=ygUTaG93IHRvIG1ha2UgZnJpZW5kcw%3D%3D";
        quit = true;
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

    let nameTaken = false;
    for (let i = 1; i <= 10; i++) {
        if (Object.values(lobbies[i]).includes(newName)) {
            nameTaken = true;
            break;
        }
    }

    if (nameTaken) {
        displayMessage(`Username '${newName}' is taken`);
        return;
    }

    if (newName.toLowerCase() === 'ben') {
        newName = 'idiot';
    } else if (newName.length > 16) {
        displayMessage(`Name must be 16 characters or less`, 'system');
        return;
    } else if (newName === "You") {
        displayMessage('Invalid Name', 'system');
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
    } else if (message.startsWith("User:")) {
        displayMessage(message, 'red')
    } else {
        displayMessage(message, 'chat');
    }
});



// =======================
// (OPTIONAL) LOBBY DATA FROM SERVER
// =======================
let lobbies;
socket.on('lobby-data', (data) => {
    const container = document.getElementById("user-list");

    container.innerHTML = Object.entries(data)
    .map(([lobby, players]) => {
        return `<div>Lobby ${lobby}: ${players.join(", ")}</div>`;
    })
    .join("");
    lobbies = data;
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
    } else if (type === "red") {
        div.style.backgroundColor = 'red';
        div.style.color = 'white';
        div.style.fontStyle = 'bold'
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

